use axum::{
    extract::{MatchedPath, Request, State},
    http::{header, HeaderValue, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::get,
    Json, Router,
};
use serde::Serialize;
use sqlx::PgPool;
use std::time::Duration;
use tokio::time::timeout;
use tower_http::trace::TraceLayer;

pub mod config;

#[derive(Clone)]
pub struct AppState {
    pub database: Option<PgPool>,
}

#[derive(Serialize)]
struct Health {
    ok: bool,
    service: &'static str,
}

#[derive(Serialize)]
struct Readiness {
    ok: bool,
    database: &'static str,
}

async fn health() -> Json<Health> {
    Json(Health {
        ok: true,
        service: "vspportfolio-solid-axum-pilot",
    })
}

async fn ready(State(state): State<AppState>) -> (StatusCode, Json<Readiness>) {
    let Some(pool) = state.database.as_ref() else {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(Readiness {
                ok: false,
                database: "not_configured",
            }),
        );
    };

    // The database is the source of truth; Redis is intentionally not a readiness dependency.
    let result = timeout(
        Duration::from_secs(2),
        sqlx::query_scalar::<_, i32>("SELECT 1").fetch_one(pool),
    )
    .await;

    if matches!(result, Ok(Ok(1))) {
        (
            StatusCode::OK,
            Json(Readiness {
                ok: true,
                database: "ready",
            }),
        )
    } else {
        (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(Readiness {
                ok: false,
                database: "unavailable",
            }),
        )
    }
}

pub fn build_app(state: AppState) -> Router {
    Router::new()
        .route("/api/migration/health", get(health))
        .route("/api/migration/ready", get(ready))
        .with_state(state)
        .layer(middleware::from_fn(no_store))
        .layer(
            TraceLayer::new_for_http().make_span_with(|request: &Request| {
                // Trace the matched static route only: raw URLs/queries may contain credentials.
                let route = request
                    .extensions()
                    .get::<MatchedPath>()
                    .map(MatchedPath::as_str)
                    .unwrap_or("unmatched");
                tracing::info_span!("http_request", method = %request.method(), route)
            }),
        )
}

async fn no_store(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    response
        .headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    response
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use serde_json::Value;
    use sqlx::postgres::PgPoolOptions;
    use tokio::net::TcpListener;
    use tower::ServiceExt;

    #[tokio::test]
    async fn health_is_public_and_has_minimal_metadata() {
        let response = build_app(AppState { database: None })
            .oneshot(
                Request::builder()
                    .uri("/api/migration/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(response.headers()[header::CACHE_CONTROL], "no-store");
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["ok"], true);
        assert_eq!(body["service"], "vspportfolio-solid-axum-pilot");
        assert!(body.get("database").is_none());
    }

    #[tokio::test]
    async fn readiness_fails_closed_without_database_configuration() {
        let response = build_app(AppState { database: None })
            .oneshot(
                Request::builder()
                    .uri("/api/migration/ready")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(response.headers()[header::CACHE_CONTROL], "no-store");
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["ok"], false);
        assert_eq!(body["database"], "not_configured");
    }

    #[tokio::test]
    async fn unknown_routes_return_not_found() {
        let response = build_app(AppState { database: None })
            .oneshot(
                Request::builder()
                    .uri("/api/migration/unknown")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn mutation_methods_are_not_allowed() {
        for path in ["/api/migration/health", "/api/migration/ready"] {
            let response = build_app(AppState { database: None })
                .oneshot(
                    Request::builder()
                        .method("POST")
                        .uri(path)
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();
            assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
        }
    }

    fn test_pool(address: std::net::SocketAddr) -> PgPool {
        let options =
            config::database_options(&format!("postgres://pilot:secret-marker@{address}/pilot"))
                .unwrap();
        PgPoolOptions::new()
            .max_connections(2)
            .acquire_timeout(Duration::from_secs(2))
            .connect_lazy_with(options)
    }

    async fn assert_unavailable(pool: PgPool) {
        let app = build_app(AppState {
            database: Some(pool.clone()),
        });
        let response = timeout(
            Duration::from_secs(4),
            app.clone().oneshot(
                Request::builder()
                    .uri("/api/migration/ready")
                    .body(Body::empty())
                    .unwrap(),
            ),
        )
        .await
        .expect("readiness must have a bounded acquisition/query budget")
        .unwrap();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        assert_eq!(
            serde_json::from_slice::<Value>(&bytes).unwrap(),
            serde_json::json!({
                "ok": false, "database": "unavailable"
            })
        );
        // Database failure must never change the separate liveness contract.
        let health = app
            .oneshot(
                Request::builder()
                    .uri("/api/migration/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(health.status(), StatusCode::OK);
        pool.close().await;
    }

    #[tokio::test]
    async fn refused_database_connection_is_unavailable_without_details() {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        drop(listener);
        assert_unavailable(test_pool(address)).await;
    }

    #[tokio::test]
    async fn stalled_database_handshake_has_bounded_timeout() {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let pool = test_pool(listener.local_addr().unwrap());
        let server = tokio::spawn(async move {
            let mut connections = Vec::new();
            loop {
                let (connection, _) = listener.accept().await.unwrap();
                connections.push(connection);
                // Keep TCP open without speaking PostgreSQL: handshake cannot complete.
            }
        });
        let started = std::time::Instant::now();
        assert_unavailable(pool).await;
        let elapsed = started.elapsed();
        server.abort();
        let _ = server.await;
        assert!(
            elapsed >= Duration::from_millis(1500),
            "probe must exercise the stalled handshake"
        );
        assert!(
            elapsed < Duration::from_millis(2500),
            "probe must finish before the frontend budget"
        );
    }
}

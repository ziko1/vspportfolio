use axum::{
    extract::State,
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::Serialize;
use sqlx::PgPool;
use std::time::Duration;
use tokio::time::timeout;
use tower_http::trace::TraceLayer;

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
        .layer(TraceLayer::new_for_http())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use serde_json::Value;
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
}


use sqlx::postgres::PgPoolOptions;
use std::{env, net::SocketAddr, time::Duration};
use tracing_subscriber::EnvFilter;
use vspportfolio_solid_axum_pilot::{build_app, AppState};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let database = match env::var("DATABASE_URL") {
        Ok(value) if !value.trim().is_empty() => {
            // Never open a connection or change a schema during startup.
            Some(
                PgPoolOptions::new()
                    .max_connections(2)
                    .acquire_timeout(Duration::from_secs(2))
                    .connect_lazy(&value)?,
            )
        }
        _ => None,
    };

    let bind: SocketAddr = env::var("PILOT_BIND")
        .unwrap_or_else(|_| "127.0.0.1:9180".to_owned())
        .parse()?;
    let listener = tokio::net::TcpListener::bind(bind).await?;

    tracing::info!(%bind, "isolated migration pilot listening; no legacy routes replaced");
    axum::serve(listener, build_app(AppState { database }))
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await?;
    Ok(())
}


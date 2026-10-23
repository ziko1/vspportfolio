use sqlx::postgres::PgPoolOptions;
use std::{env, net::SocketAddr, time::Duration};
use tracing_subscriber::EnvFilter;
use vspportfolio_solid_axum_pilot::{build_app, AppState};

fn parse_pilot_bind(value: Option<String>) -> Result<SocketAddr, Box<dyn std::error::Error>> {
    let bind: SocketAddr = value
        .unwrap_or_else(|| "127.0.0.1:9180".to_owned())
        .parse()?;
    if !bind.ip().is_loopback() {
        return Err("PILOT_LOOPBACK_ONLY".into());
    }
    Ok(bind)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
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

    let bind = parse_pilot_bind(env::var("PILOT_BIND").ok())?;
    let listener = tokio::net::TcpListener::bind(bind).await?;

    tracing::info!(%bind, "isolated migration pilot listening; no legacy routes replaced");
    axum::serve(listener, build_app(AppState { database }))
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::parse_pilot_bind;

    #[test]
    fn only_loopback_bind_is_accepted() {
        assert_eq!(parse_pilot_bind(None).unwrap().to_string(), "127.0.0.1:9180");
        assert!(parse_pilot_bind(Some("127.0.0.1:9190".into())).is_ok());
        assert!(parse_pilot_bind(Some("[::1]:9190".into())).is_ok());
        assert!(parse_pilot_bind(Some("0.0.0.0:9190".into())).is_err());
        assert!(parse_pilot_bind(Some("[::]:9190".into())).is_err());
        assert!(parse_pilot_bind(Some("not-an-address".into())).is_err());
    }
}

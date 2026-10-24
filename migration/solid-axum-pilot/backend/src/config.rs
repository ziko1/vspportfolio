use sqlx::{postgres::PgConnectOptions, postgres::PgSslMode, ConnectOptions};
use std::{env, net::IpAddr};
use url::Url;

const INVALID_DATABASE_URL: &str = "INVALID_DATABASE_URL";
const IMPLICIT_PG_CONFIG: &[&str] = &[
    "PGHOST",
    "PGHOSTADDR",
    "PGPORT",
    "PGUSER",
    "PGPASSWORD",
    "PGDATABASE",
    "PGSSLMODE",
    "PGSSLROOTCERT",
    "PGSSLCERT",
    "PGSSLKEY",
    "PGOPTIONS",
    "PGAPPNAME",
    "PGPASSFILE",
];

/// The pilot accepts one explicit URL, never ambient PostgreSQL credentials or overrides.
/// Errors are static identifiers: SQLx/URL parse errors can contain configuration values.
pub fn database_options(value: &str) -> Result<PgConnectOptions, &'static str> {
    if IMPLICIT_PG_CONFIG
        .iter()
        .any(|key| env::var_os(key).is_some())
    {
        return Err("IMPLICIT_PG_CONFIGURATION_NOT_ALLOWED");
    }
    parse_database_url(value)
}

fn parse_database_url(value: &str) -> Result<PgConnectOptions, &'static str> {
    let url = Url::parse(value).map_err(|_| INVALID_DATABASE_URL)?;
    let host = url.host_str().ok_or(INVALID_DATABASE_URL)?;
    if !matches!(url.scheme(), "postgres" | "postgresql")
        || host.is_empty()
        || host.contains('%')
        || url.username().is_empty()
        || url.password().is_none_or(str::is_empty)
        || url.path().trim_start_matches('/').is_empty()
        || url.fragment().is_some()
    {
        return Err(INVALID_DATABASE_URL);
    }

    // Validate before SQLx parses: its unknown-parameter warning prints values.
    // Host/user/options overrides would also undermine the checks above.
    let mut mode = None;
    let mut root_certificate = false;
    for (key, value) in url.query_pairs() {
        match key.as_ref() {
            "sslmode" if mode.is_none() => mode = Some(value.into_owned()),
            "sslrootcert" if !root_certificate && !value.is_empty() => root_certificate = true,
            _ => return Err(INVALID_DATABASE_URL),
        }
    }

    let numeric_host = host.trim_start_matches('[').trim_end_matches(']');
    let loopback = host.eq_ignore_ascii_case("localhost")
        || numeric_host
            .parse::<IpAddr>()
            .is_ok_and(|ip| ip.is_loopback());
    let ssl_mode = match (loopback, mode.as_deref()) {
        (true, None | Some("disable")) => PgSslMode::Disable,
        (_, Some("verify-full")) => PgSslMode::VerifyFull,
        _ => return Err("DATABASE_TLS_VERIFY_FULL_REQUIRED"),
    };
    if root_certificate && !matches!(ssl_mode, PgSslMode::VerifyFull) {
        return Err(INVALID_DATABASE_URL);
    }

    // Explicit username/password/db prevent pgpass/default-identity fallback.
    // No URL query can override connection targets or add server options.
    let mut options = value
        .parse::<PgConnectOptions>()
        .map_err(|_| INVALID_DATABASE_URL)?
        .port(url.port().unwrap_or(5432))
        .ssl_mode(ssl_mode)
        .application_name("vspportfolio-solid-axum-pilot")
        .options([
            ("default_transaction_read_only", "on"),
            ("statement_timeout", "2000"),
        ])
        .disable_statement_logging();
    if loopback && matches!(ssl_mode, PgSslMode::Disable) {
        // Never resolve a hostname for a plaintext connection, including localhost.
        options = options.host(if host.eq_ignore_ascii_case("localhost") {
            "127.0.0.1"
        } else {
            numeric_host
        });
    }
    Ok(options)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn plaintext_is_limited_to_numeric_loopback() {
        for host in ["127.0.0.1", "[::1]", "localhost"] {
            let options = parse_database_url(&format!("postgres://pilot:secret@{host}/pilot"))
                .expect("explicit loopback test configuration");
            assert!(matches!(options.get_ssl_mode(), PgSslMode::Disable));
            assert!(options.get_host().parse::<IpAddr>().unwrap().is_loopback());
        }
    }

    #[test]
    fn remote_connections_require_certificate_and_hostname_verification() {
        for suffix in [
            "",
            "?sslmode=disable",
            "?sslmode=prefer",
            "?sslmode=require",
            "?sslmode=verify-ca",
        ] {
            assert!(parse_database_url(&format!(
                "postgres://pilot:secret@db.example/pilot{suffix}"
            ))
            .is_err());
        }
        let options =
            parse_database_url("postgres://pilot:secret@db.example/pilot?sslmode=verify-full")
                .unwrap();
        assert!(matches!(options.get_ssl_mode(), PgSslMode::VerifyFull));
        assert_eq!(options.get_host(), "db.example");
    }

    #[test]
    fn ambiguous_or_implicit_configuration_is_rejected_without_values_in_errors() {
        for value in [
            "postgres://",
            "postgres://pilot@127.0.0.1/pilot",
            "postgres://pilot:secret@127.0.0.1/",
            "postgres://pilot:secret@127.0.0.1/pilot?host=remote.example",
            "postgres://pilot:secret@127.0.0.1/pilot?hostaddr=10.0.0.1",
            "postgres://pilot:secret@127.0.0.1/pilot?password=leak-marker",
            "postgres://pilot:secret@127.0.0.1/pilot?unknown=leak-marker",
            "postgres://pilot:secret@127.0.0.1/pilot?options=leak-marker",
            "postgres://pilot:secret@127.0.0.1/pilot?sslmode=disable&sslmode=verify-full",
            "postgres://pilot:secret@127.0.0.1/pilot#leak-marker",
            "http://pilot:secret@127.0.0.1/pilot",
            "postgres://pilot:secret@%2Ftmp/pilot",
        ] {
            let error = parse_database_url(value).unwrap_err();
            assert_eq!(error, INVALID_DATABASE_URL);
            assert!(!error.contains("secret") && !error.contains("leak-marker"));
        }
    }

    #[test]
    fn custom_root_certificate_requires_verify_full() {
        assert!(parse_database_url(
            "postgres://pilot:secret@127.0.0.1/pilot?sslrootcert=/tmp/ca.pem"
        )
        .is_err());
        assert!(parse_database_url(
            "postgres://pilot:secret@db.example/pilot?sslmode=verify-full&sslrootcert=/tmp/ca.pem"
        )
        .is_ok());
    }
}

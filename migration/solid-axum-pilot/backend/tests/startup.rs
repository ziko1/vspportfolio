use std::{
    process::{Command, Stdio},
    thread,
    time::{Duration, Instant},
};

fn rejected_startup(url: &str, extra_environment: Option<(&str, &str)>, expected: &str) {
    let mut command = Command::new(env!("CARGO_BIN_EXE_vspportfolio-solid-axum-pilot"));
    command
        .env_clear()
        .env("DATABASE_URL", url)
        .env("RUST_LOG", "trace,sqlx::connection=trace")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    if let Some((key, value)) = extra_environment {
        command.env(key, value);
    }
    let mut child = command.spawn().unwrap();
    let deadline = Instant::now() + Duration::from_secs(5);
    while child.try_wait().unwrap().is_none() {
        if Instant::now() >= deadline {
            child.kill().unwrap();
            let _ = child.wait();
            panic!("invalid configuration must be rejected before serving");
        }
        thread::sleep(Duration::from_millis(10));
    }
    let output = child.wait_with_output().unwrap();
    assert!(!output.status.success());
    let diagnostic = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(diagnostic.contains(expected));
    assert!(!diagnostic.contains("secret-marker"));
    assert!(!diagnostic.contains("postgres://"));
}

#[test]
fn invalid_url_parameters_do_not_leak_to_debug_logs() {
    rejected_startup(
        "postgres://pilot:secret-marker@127.0.0.1/pilot?unknown=secret-marker",
        None,
        "INVALID_DATABASE_URL",
    );
}

#[test]
fn ambient_postgres_configuration_is_rejected_without_values() {
    rejected_startup(
        "postgres://pilot:secret-marker@127.0.0.1/pilot",
        Some(("PGPASSWORD", "ambient-secret-marker")),
        "IMPLICIT_PG_CONFIGURATION_NOT_ALLOWED",
    );
}

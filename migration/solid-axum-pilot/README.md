# SolidJS + Rust/Axum isolated pilot

STACK-MIGRATION-20261023-001. This directory is an additive lab for the existing Gatsby 4 / React 17 / Decap CMS vspportfolio repository. **Nothing in the legacy site, Netlify CMS, Netlify builds, or production routing has been changed.** This lab is NOT an application replacement and has NO customer credentials, business data, or payment integrations.

## Technology

Frontend: SolidJS, TypeScript, Vite, Tailwind CSS v4. Read-only UI talks to loopback Rust API using fixed same-origin paths; 2.5-second timeout, no credentials sent. Backend: Axum + Tokio + SQLx with a small PostgreSQL pool and a 2-second readiness timeout, no schema writes. Redis deliberately omitted until real evidence justifies it.

## Isolated local execution

1. Ensure Rust stable 1.99+ and a recent Node.js are installed in an isolated development environment (not automatically on a production VPS).
2. In frontend/: run npm ci, npm run check, npm test, npm run build, npm run dev. Use a supported Node.js 20/22/24+ release (current verification: 24.19.0; initial pilot: 22.16.0).
3. In backend/: run `cargo fmt --all -- --check`, `cargo check --locked`, `cargo test --locked`, `cargo build --locked`; then `cargo run --locked`. Use the committed Cargo.lock. Backend listens on 127.0.0.1:9180 by default; the Vite dev proxy listens on 127.0.0.1:5178.
4. DATABASE_URL is optional for health but REQUIRED for a 200 readiness response. Only use a dedicated least-privileged disposable PostgreSQL test database. No migration schema or customer DB is required for these probes.
5. Run manual browser QA on a real browser with 320 / 375 / 768 / 1280 viewport, keyboard navigation, dark contrast, network offline/timeout and screen reader; record browser and device metadata.

`DATABASE_URL` must explicitly include scheme (`postgres` or `postgresql`), username, password, host and database. Percent-encode reserved characters. Ambient `PG*` connection overrides are rejected. Plaintext is allowed only for numeric loopback (localhost is pinned to 127.0.0.1). Any other host requires `?sslmode=verify-full`; add `&sslrootcert=/path/to/test-ca.pem` for a private CA. `require`/`prefer` are deliberately rejected. Unknown/duplicate URL parameters are rejected before SQLx can log them. Use a dedicated test role with no administrative/DDL rights; the connection also requests read-only transactions and a 2s statement timeout. These settings do not replace database permissions.

The read-only probe API has no application authentication or tenant data. Keep it loopback-only. Readiness, health, 404 and 405 responses are not cacheable. Logs omit SQLx diagnostics and raw request URLs. Redis remains absent.

For the automated browser smoke, supply Playwright through the QA runner, build frontend/backend, then run `node verification/browser-smoke.cjs`. `PILOT_BROWSER_EXECUTABLE` can select an installed browser and `PILOT_QA_OUTPUT` an output directory. The script starts only its own loopback API/preview, refuses occupied ports, removes DATABASE_URL from the child, and stops its children. It tests the production frontend build against the actual Axum API without a database; PostgreSQL integration is recorded separately.

## Verification reality

See [2026-10-24 evidence](verification/EVIDENCE_2026-10-24_UK.md): Rust fmt/check and 13 tests, frontend typecheck/14 tests/build, disposable PostgreSQL ready/failure/recovery, Chromium smoke and independent review have been executed. This verifies the named technical scenarios, not the full migration. Real remote TLS handshakes, full accessibility/screen-reader checks, Gatsby/CMS/SEO parity, performance baseline and release/rollback gates remain open. Do NOT deploy, merge, use production DB or enable public forwarding without the separate gate.

The failed Netlify preview builds the **unchanged root Gatsby site**, not this directory. Its Node14/node-gyp/Sharp failure and stale CMS lockfile are documented in [Netlify diagnosis](verification/NETLIFY_2026-10-24_UK.md). A preview-only environment candidate is documented but not applied; root production configuration and dependencies are unchanged. The PR title uses `[skip netlify]` while these legacy build blockers remain; removing it and pushing a commit will request another preview. No green Netlify result is claimed.

## Next functional migration

Inventory Gatsby routes/Decap CMS and Netlify forms, implement a golden parity test for the first real existing page, recreate it using SolidJS with SSR/SSG as required, and prove behavior against the original. Then plan API/data ownership per actual product rather than copying demo services. See PLAN_UK.md.


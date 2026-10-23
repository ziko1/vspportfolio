# SolidJS + Rust/Axum isolated pilot

STACK-MIGRATION-20261023-001. This directory is an additive lab for the existing Gatsby 4 / React 17 / Decap CMS vspportfolio repository. **Nothing in the legacy site, Netlify CMS, Netlify builds, or production routing has been changed.** This lab is NOT an application replacement and has NO customer credentials, business data, or payment integrations.

## Technology

Frontend: SolidJS, TypeScript, Vite, Tailwind CSS v4. Read-only UI talks to loopback Rust API using fixed same-origin paths; 2.5-second timeout, no credentials sent. Backend: Axum + Tokio + SQLx with a small PostgreSQL pool and a 2-second readiness timeout, no schema writes. Redis deliberately omitted until real evidence justifies it.

## Isolated local execution

1. Ensure Rust stable 1.82+ and a recent Node.js are installed in an isolated development environment (not automatically on a production VPS).
2. In frontend/: run npm install, npm run check, npm test, npm run build, npm run dev.
3. In backend/: run cargo fmt --all -- --check, cargo check --locked (after generating and reviewing Cargo.lock), cargo test; then cargo run. Backend listens on 127.0.0.1:9180 by default; the Vite dev proxy listens on 127.0.0.1:5178.
4. DATABASE_URL is optional for health but REQUIRED for a 200 readiness response. Only use a dedicated least-privileged disposable PostgreSQL test database. No migration schema or customer DB is required for these probes.
5. Run manual browser QA on a real browser with 320 / 375 / 768 / 1280 viewport, keyboard navigation, dark contrast, network offline/timeout and screen reader; record browser and device metadata.

## Verification reality

The code is a *proposed* pilot until Rust and Node dependencies are installed and tests executed on an exact commit, followed by independent code review. CI/build results alone are not live/device proof. There is no lockfile at this initial candidate stage; generate and commit reviewed lockfiles before any integration/merge. Do NOT deploy, merge, use production DB, enable public forwarding, or modify the existing app without the separate gate. No automatic paid provider calls.

## Next functional migration

Inventory Gatsby routes/Decap CMS and Netlify forms, implement a golden parity test for the first real existing page, recreate it using SolidJS with SSR/SSG as required, and prove behavior against the original. Then plan API/data ownership per actual product rather than copying demo services. See PLAN_UK.md.


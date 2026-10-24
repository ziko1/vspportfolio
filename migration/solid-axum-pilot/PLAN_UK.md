# STACK-MIGRATION-20261023-001 — план цього пілоту

> Для агентів: рухатися перевірюваними ітераціями; жодних merge/deploy без окремого підтвердження.

**Goal:** довести безпечний технічний фундамент SolidJS + Rust/Axum без порушення Gatsby/Decap сайту й визначити умови переходу існуючих сторінок.

**Architecture:** паралельний, повністю ізольований підкаталог, loopback bind, read-only PostgreSQL probe, frontend dev proxy. Чинні вихідні файли, CMS, routing, public domain, Netlify deployment та business data незмінні.

**Tech Stack:** SolidJS, TypeScript, Vite, Tailwind 4, Vitest, Rust stable, Axum 0.8, Tokio, SQLx/PostgreSQL. Redis — only on measured bottleneck.

## Global Constraints
- Зберігати 100% поведінки та CMS/форм/SEO/локалізацій після повного переносу, але **не вважати пілот повним переносом**.
- Не активувати новий Rust сервер на публічному домені; не змінювати netlify.toml.
- Не переносити користувацькі дані або secrets; database access тільки окрема тестова БД.
- Без force push, без видалення історії, без production deploy, без реальних оплат.
- Для кожного acceptance зберігати точний SHA, середовище, команду, stdout/stderr/exit code, незалежний review.

---

### Task 1: Ізольована health/readiness API
**Files:** backend/Cargo.toml, backend/src/lib.rs, backend/src/main.rs, backend/.env.example.
**Interfaces:** GET /api/migration/health => 200 {ok:true,service}; GET /api/migration/ready => 200 {ok:true,database:"ready"} only if SELECT 1 succeeds within 2s; otherwise 503 {ok:false,database:"not_configured"|"unavailable"}.
- [x] Написати Rust unit integration tests для 200/503/404; 13 Rust tests та окремий disposable PG runtime, 2026-10-24.
- [ ] Red: до реалізації тест 404/compilation failure; Green: cargo test succeeds.
- [x] cargo fmt --all -- --check; cargo check --locked; cargo test; mock/negative PG and disposable real PG, 2-second timeout (evidence 2026-10-24).
- [x] Строго перевірити loopback binding; startup/log redaction та TRACE query marker tests пройдено. Remote TLS handshake окремо NOT RUN.
- [x] Незалежний review; backend code `6358dc1a2cdb493b84b3b04341e3aaf59654ddb8`, незмінний у наступному dependency commit.

### Task 2: Власний SolidJS UI та HTTP contract
**Files:** frontend/package.json, frontend/tsconfig.json, frontend/vite.config.ts, frontend/index.html, frontend/src/index.tsx, frontend/src/App.tsx, frontend/src/api.ts, frontend/src/api.test.ts, frontend/src/styles.css.
**Interfaces:** same-origin GET із фіксованого списку; no credentials; AbortSignal.timeout(2500), 200/503 зі структурою JSON, 500/malformed/network => visible unavailable.
- [x] Test: 200 health success, 503 not configured, malformed 503 claiming ok, 500 error; строгий per-route контракт, 14/14 на 2026-10-24.
- [ ] Red: тест на відсутній getProbe; Green: npm test.
- [x] npm run check; npm run test; npm run build; package-lock.json; Vitest4.1.12 і audit0 на 2026-10-24.
- [ ] Browser + a11y keyboard/screen reader + 320px, 375px, 768px, 1280px; offline and high latency; lang toggle, focus/reduced motion.
- [x] Independent review й точні artifact hashes — evidence 2026-10-24.

### Task 3: Встановити функціональні паритетні контракти старого сайту
**Observed files:** src/pages/index.md, src/templates/index-page.js, src/components/Navbar.js, src/pages/404.js, netlify.toml, static/admin, netlify/functions.
**Proposed files:** migration/solid-axum-pilot/parity/routes.json; migration/solid-axum-pilot/parity/acceptance.test.ts.
**Interfaces:** original URL => original HTML content/metadata/media links/CMS editing semantics/Netlify form submission preserved.
- [ ] Виявити кожен Gatsby route, Decap workflow, Netlify function, форму та SEO contract.
- [ ] Зняти trusted baseline на staging/baseline SHA і negative scenarios; не вигадувати PASS.
- [ ] Додати паритетний контракт для першої реальної сторінки до переносу її UI.
- [ ] Реалізувати SSR/SSG/redirect/SEO за потреби; лише після рівності випускати candidate, за feature flag.
- [ ] Повторити parity+performance; незалежний review.

### Task 4: Підготовка до контрольованого release
- [ ] Репетиція rollback на isolated preview; перевірити CMS, форми, SEO, redirects і media.
- [ ] Порівняти baseline й candidate по Web Vitals, JS bytes, memory/p95 для репрезентативних сценаріїв.
- [ ] Повний QA на точному SHA/artifact, зворотна трасованість acceptance.
- [ ] Лише після явного дозволу власника: PR merge, preview/canary/production поетапно; автоматичний rollback при regression.

## Open externally observable decisions
- Чи є Gatsby/Decap demo реальним продуктом, який необхідно публікувати, чи лише навчальним репозиторієм?
- Які нинішні форми та CMS публічно активні (потрібний перевірений hosting inventory)?
- Чи узгоджено використання SolidStart/SSR для конкретного контентного сайту після SEO parity analysis?

**Status as of 2026-10-23:** M0 inspected partially; frontend Node 22 checks PASS 4/4, Rust 1.99.1 rustfmt and 3/3 tests PASS on code SHA da8242e38799add6c8a354576bd6d097437e67d3. Lockfiles committed. Actual PostgreSQL integration, browser, CMS parity and independent review NOT VERIFIED. Overall acceptance NOT PASSED. Project-wide program: ziko1/ai-team-orchestrator#60.

## Checkpoint 2026-10-24 — продовження PR #4

**Чинний code SHA:** `6e1743f9b2757a726f0247022392973f65936395`.
**Докази/пам'ять цього етапу:** [EVIDENCE_2026-10-24_UK.md](verification/EVIDENCE_2026-10-24_UK.md).
Початкові Red-before-implementation пункти не заявляються виконаними заднім числом. Для виправлень є окремі реальні відтворення та регресійні тести.

| Task / owner у поточному runtime | Результат / черга |
| --- | --- |
| NET-01, `/root/netlify_diagnosis` | Діагностика DONE: root Node14/Python/node-gyp/Sharp failure, stale root CMS lock. Виправлення Netlify NOT APPLIED; candidate і blockers записано. |
| BE-01, `/root/backend_hardening` | Scoped tests PASS13/13, безпечна URL/TLS policy, read-only, no-store, redaction. |
| FE-01, `/root` | PASS14/14, actual Chromium outage/recovery/offline/timeout/keyboard; зависання resource UI виправлено. |
| PG-01, `/root/postgres_integration` | Real PostgreSQL16.15 ready200 / badpassword503 / stop503 / restart200; temporary processes/data очищено. |
| QA-01, `/root/independent_review` | Scoped source/dependencies/evidence review прийнято; P2 QA-port ownership виправлено й незалежно перевірено. |
| SEC-01, `/root` + reviewer | Vitest3 advisory remediation → pinned4.1.12; npm audit0, runtime/build dependencies незмінні. |
| M3-A11Y, наступна черга | Screen reader/contrast/zoom/reduced-motion і актуальні браузери: NOT RUN. Browser smoke не закриває весь a11y gate. |
| LEGACY-BASELINE, наступна незалежна черга | Відтворювана Gatsby/CMS збірка на окремому checkout; погоджений сумісний CMS dependency graph, npm ci/build і CMS/media smoke. Root production defaults збережені. |
| PARITY-01, залежить від LEGACY-BASELINE | Route/SEO/forms inventory та golden parity першої реальної сторінки; потім Solid SSR/SSG vertical slice. |

M3 core runtime докази отримано, **M3 повністю не закрито**. M4/M5 не починати як production rollout; Gatsby/CMS/SEO parity, performance baseline, rollback rehearsal, UAT та згода на release відкриті. Програма всіх вебпроєктів #60 не оголошується виконаною.

**Бюджет цього етапу:** no_new_paid_spend; лише наявні runtime/connector/VPS. Баланс, вартість agent tokens і квоти провайдерів UNKNOWN; нових paid calls/services не створено. PR title `[skip netlify]` запобігає повторному preview до усунення legacy build blockers; кореневі build settings не змінено.

**Відновлення роботи:** звірити актуальний PR head і власний diff; прочитати останній evidence; не повторювати вже прийняті Rust/PG/browser тести без зміни коду/ризику. Новий deployment, merge або міграція даних потребують окремої чинної авторизації. Production rollback не проводився — production не змінювався.


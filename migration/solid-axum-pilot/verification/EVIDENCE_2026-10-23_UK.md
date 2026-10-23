# STACK-MIGRATION-20261023-001 — пілот: журнал перевірок

Дата: 2026-10-23. Власник програми: [ai-team-orchestrator#60](https://github.com/ziko1/ai-team-orchestrator/issues/60).

## Scope

Адитивний підкаталог `migration/solid-axum-pilot/` у `ziko1/vspportfolio`. Чинні Gatsby/Decap/Netlify файли та публічні маршрути не змінено. Жодного production deployment, DB migration, користувацьких даних, платних послуг.

## Перевірені команди й точний вихідний стан

- Branch: `migration/solid-axum-pilot-20261023`, Node/UI test source commit `de93d3dee8ac21c7c16cfe4d7d453c19d11b4c56`. Наступні doc/.gitignore-коміти не є підтвердженням нового тестового артефакту.
- Host: `vsp`, x86_64 Linux. Безпечно ізольований `/tmp` checkout. Після тесту тимчасову копію прибрано. Тест не використовував server-side production DB.
- Node: `v22.16.0`, виконано `SHASUMS256.txt` / `sha256sum -c` для official Node archive: PASS.
- `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=1`: exit 0, 122 packages. Це **не** означає проведений security audit.
- `npm run check`: exit 0, TypeScript.
- `npm test`: exit 0, **4/4 PASS**, `vitest run --environment node`. Випадки: health 200, ready 503, HTTP/JSON inconsistency, HTTP 500.
- `npm run build`: exit 0, Vite 6.4.5, 8 modules; generated `dist/index.html` 0.67KB, CSS 14.37KB (gzip 3.77KB), JS 17.01KB (gzip 7.13KB).
- `sha256sum package-lock.json`: `f51cc6d727788449939db6f2f160a432c1f52672c6538eecafceb827a42d89f5`.
- `sha256sum dist/index.html`: `e1645915fe470e5d0f3843212c6a182bc72a5e5b8412502cf7547d7d2f00afb4`.
- `sha256sum dist/assets/index-BJJRosY0.js`: `f0887530363f7ea30a93889fddcd6d5e9fc470753c2a37e4178952ed97a99935`.
- `sha256sum dist/assets/index-J2IIRBEz.css`: `f64217e4d2a4ec5c30a558f4df6cbe97fe01b9fc983b2a89a53156a22c5e1dd2`.

## Відтворені та усунені проблеми першого QA циклу

- Дефолтний Node 18.19.1 на VPS не задовольнив вимоги Tailwind 4 native binary; перший `npm test` не стартував. Глобальний Node залишився без змін; тимчасово використано перевірений Node 22.
- Звичайний `vitest run` шукав jsdom та не запускав тести: 0 tests / error. Після обмеження оточення до Node (`vitest run --environment node`) чотири контракти пройшли, виправлення збережено у package.json.
- Перша збірка залишала `dist/` untracked у тимчасовій копії; додано вузький .gitignore, що не торкається оригінального Gatsby.

## Чесні статуси acceptance

| ID | Що перевіряємо | Статус |
| --- | --- | --- |
| FE-01 | Чисте відтворюване встановлення залежностей | PASS, SHA de93d3 |
| FE-02 | TypeScript і 4 API contract unit tests | PASS, SHA de93d3 |
| FE-03 | Vite production build і manifest hashes | PASS, SHA de93d3 |
| BE-01 | rustfmt/cargo check/cargo test | PENDING, окремий Rust test run |
| BE-02 | PostgreSQL ready 200 і timeout 503 на disposable DB | UNKNOWN |
| UI-01 | Browser E2E, accessibility, screen readers, device/offline | UNKNOWN |
| SEC-01 | threat model, rate limits, security audit, backend review | UNKNOWN |
| PARITY-01 | Gatsby/Decap CMS/Netlify forms/full SEO parity | NOT STARTED |
| PERF-01 | Baseline/after p95, Web Vitals, ресурси | NOT MEASURED |
| RELEASE-01 | Independent review, rollback drill, production approval | BLOCKED |

**Висновок:** frontend pilot перевірено в зазначеному scope; стан `100% READY` не заявляти. Ізольований pilot не означає перенесення функціоналу наявних сайтів.

# PR #4 — перевірка ізольованого SolidJS/Axum пілоту, 24.10.2026

Статус: **технічні сценарії нижче перевірено; повна міграція / release NOT READY**.
Програма: [ai-team-orchestrator#60](https://github.com/ziko1/ai-team-orchestrator/issues/60).
Продовжено [існуючий Draft PR #4](https://github.com/ziko1/vspportfolio/pull/4); дубліката проєкту/PR немає.

## Ідентичність і межі

- Branch: `migration/solid-axum-pilot-20261023`.
- Вхідний HEAD: `1b8cd0884796862c64163177a58981e51aa5449e`; base main: `0b102651c68fd6fda064d30e032717cdcd74e9ce`.
- Backend/UI/script commit: `6358dc1a2cdb493b84b3b04341e3aaf59654ddb8`, tree `17ee8b4b9cf463a2595238a6c51bbbff676dd6d3`.
- Фінальний code/dependencies commit: `6e1743f9b2757a726f0247022392973f65936395`, tree `713c6c2444674e439a0889f08d1b0a007d4fe737`.
- Тести виконано на working-tree candidate, потім зіставлено staged Git tree з immutable commit tree. Другий code commit змінює тільки `frontend/package.json`/`package-lock.json`; Rust та UI source незмінні. Після оновлення Vitest повторено frontend ci/check/tests/build/audit; HTML/JS/CSS збігаються побайтово з браузерним кандидатом. Фінальний evidence commit — документація/JSON, не нова версія виконуваного коду.
- Змінено лише `migration/solid-axum-pilot/`. Diff щодо base поза цим каталогом порожній: Gatsby, Decap CMS, SEO, маршрути, кореневі залежності та `netlify.toml` збережені.
- Не виконано merge, production deploy, міграцію реальних даних, встановлення системних пакетів на VPS чи активацію платних сервісів. Redis не додано.

## Підтверджені дефекти та виправлення

1. SQLx приймав remote URL з типовим `sslmode=prefer`. Тепер plaintext дозволено лише loopback; remote потребує `verify-full`. URL має явні user/password/host/database; невідомі/дубльовані параметри й неявні `PG*` overrides відхиляються до SQLx parsing. Помилки — статичні коди без URL/secret. `localhost` для plaintext закріплено за `127.0.0.1`.
2. Raw URI tracing та SQLx diagnostics могли включати приватні значення. Залишено matched route без query і відфільтровано SQLx events, зокрема при `RUST_LOG=trace`. Усі відповіді — `Cache-Control: no-store`. Pool limit 2; загальний readiness budget 2s; сесія має read-only та statement timeout 2s.
3. Frontend приймав неповний `{ok:true}` як готовність БД. Тепер кожний маршрут перевіряє узгоджений HTTP/JSON контракт, ім'я сервісу та строковий стан БД. Runtime whitelist не пропускає довільний URL.
4. **Браузером відтворено:** без API Solid resource access кидав `UNEXPECTED_HTTP_STATUS`, обидві картки лишалися «Перевіряємо…». Guards перевіряють error/loading до читання ресурсу, retry обробляє відхилені promises. Перевірено outage → unavailable → restart/retry → available без page errors. Додано коректний document lang, локалізовані aria labels та live status.
5. npm audit виявив dev-tool advisories у Vitest3/Mocker/Tinypool. Vitest зафіксовано на `4.1.12`, tinypool з дерева вилучено; Node engines узгоджено з підтримуваними 20/22/24+. Production залежності й Vite/TypeScript/Tailwind/Solid plugin lock entries незмінні. Audit після зміни — 0; це не гарантія відсутності всіх вразливостей.
6. Незалежне review знайшло P2 у QA script: фіксований порт міг належати сторонньому сервісу. Додано перевірку вільних портів, startup receipt власного child, exit/error handling, fetch timeout і гарантований cleanup. Негативний fixture на зайнятому 9180: script exit 1, **0 HTTP-запитів** до стороннього сервісу; reviewer повторив його незалежно.

## Фактичні перевірки

Локальний Linux x86_64; Node `24.19.0`, npm `11.9.0`. Rust `1.99.1 (58cf8f9c3 2026-10-13)` встановлено лише у тимчасові CARGO_HOME/RUSTUP_HOME; SHA256 офіційного rustup-init перевірено. Chromium Headless `134.0.6998.35`; актуальний browser artifact не завантажився, тому використано доступний офіційний Playwright 1.51.1 mirror. Це не перевірка всіх актуальних браузерів.

| Команда / сценарій | Фактичний результат |
| --- | --- |
| `cargo fmt --all -- --check` | exit 0 |
| `cargo check --locked` | exit 0 |
| `cargo test --locked` | exit 0: 10 lib + 1 main + 2 startup = **13/13**, 0 ignored; незалежний reviewer повторив |
| Cargo.lock review | Усі 195 версій/checksums незмінні; direct `url` вже був transitive; лише v3→v4 serialization і direct dependency entry |
| `npm ci --ignore-scripts --no-audit --no-fund` після оновлення | exit 0, 115 встановлених packages |
| `npm run check` | exit 0 |
| `npm test` | exit 0, Vitest4.1.12, **14/14** |
| `npm run build` | exit 0, Vite6.4.5, 8 modules |
| `npm audit --json` | до: exit 1, 3 affected dependency entries; після: exit 0, 0 findings |
| `node verification/browser-smoke.cjs` | exit 0; 7 сценаріїв, `pageErrors=[]` |
| Зайнятий QA-порт | очікуваний exit 1, 0 звернень до наявного сервісу |
| `git diff --check` | exit 0 |
| Legacy preservation diff | порожній поза каталогом пілоту |

Rust negatives: відсутня БД, refused connection, завислий TCP handshake, загальний timeout (1.5–2.5s test tolerance), POST405, unknown404, неправильні TLS режими/параметри, startup redaction та ambient PG rejection. Browser: actual Axum health200/noDB503, 320/375/768/1280 без overflow, клавіатурний language toggle, API stop/restart, offline/online, контрольована затримка HTTP з 2.5s frontend timeout. Затримка в browser transport — fixture, не PostgreSQL latency.

## Реальна тимчасова PostgreSQL

`vsp`, непривілейований `sentinelx`, PostgreSQL `16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)`, 2026-10-24 03:32 UTC. Офіційні distro packages лише завантажено/розпаковано у власний temporary directory; без sudo, Docker, системної інсталяції або доступу до існуючої БД. Роль без superuser/createdb/createrole/replication/CREATE у public; `SELECT 1` успішний, CREATE TABLE фактично відхилено.

| Сценарій | HTTP | Окремий вимір, ms |
| --- | --- | --- |
| Ready з реальною БД | 200 | 48.5 |
| Неправильний пароль | 503 | 53.4 |
| БД зупинено | 503 | 2003.0 |
| Health під час зупинки БД | 200 | 0.7 |
| БД запущено повторно | 200 | 50.3 |

Це **одиничні функціональні виміри**, не baseline/p95 і не твердження про прискорення. 2003ms включає scheduler/HTTP overhead понад двосекундний Tokio budget. Перевірено no-store, 404/405 і відсутність password/query marker у TRACE logs. Обидва API та PG зупинено; власні temporary data/credentials/packages/binaries прибрано. Прямий in-place upload був відхилений; його не повторювали й target не змінювали. Офіційний default staging upload прийнято, binary hash перевірено до запуску.

Докази: [PG results](POSTGRES_2026-10-24.json), [environment](POSTGRES_ENVIRONMENT_2026-10-24.json), [cleanup](POSTGRES_CLEANUP_2026-10-24.json), [browser](BROWSER_2026-10-24.json), [npm before](NPM_AUDIT_BEFORE_2026-10-24.json), [npm after](NPM_AUDIT_AFTER_2026-10-24.json).

## Хеші перевірених артефактів

| Артефакт | SHA256 |
| --- | --- |
| Rust debug executable для browser | `5b000955d489ca766c618e49463d17d6902e19a439605d9a930ebbf9fb9520bb` |
| Копія executable з прибраними debug symbols для PG | `7d7f4fd8a55ddda4616a11e43a09765271b303915fbe2de0adf744804a970923` |
| frontend dist/index.html | `88262d04dd13ef717fa1fa6813092b8f24bec34f0a8f0f7e392db1f07ac6d0d2` |
| dist/assets/index-CRD5_FP-.js | `8a40addbf48abc2e06de41e042ed6d32725665f3eec017848b74d2b918f80088` |
| dist/assets/index-BBK1EddU.css | `12ec6b00687e57aba937968cc343b71beba4c85c418e152d438e021ec5bd7e64` |
| verification/browser-smoke.cjs | `0645f43fed38710530900017fdd01061eddecba999d6dd7f1a6780c1a9930446` |

## Netlify: встановлена причина, не зелений Preview

[Окремий розбір](NETLIFY_2026-10-24_UK.md), [реальні рядки журналу](NETLIFY_2026-10-24_EXCERPT.log).
Deploy `6adb97ea69752d910ac2bfe4` збирає root Gatsby: Node14.15/npm6, Python3.14.3, UI Gatsby plugin3.8.4 → sharp0.32.6 → global libvips → node-gyp5.1 → `invalid mode: 'rU'`. Падіння до Gatsby build.
Окремо сучасний `npm ci` довів stale root lock: дві використовувані CMS media libraries відсутні, спершу ERESOLVE, з legacy-peer-deps — EUSAGE. Зміна Node сама по собі не закриває цей gate. Root файли не змінено; branch-only environment candidate **NOT APPLIED**, actual Gatsby build / повторний Netlify Preview **NOT RUN**. PR має `[skip netlify]`, щоб оновлення доказів не запускало завідомо заблокований preview; глобальні build settings не змінювалися.

## Приймання доручення та Issue #60

| ID | Критерій | Статус / доказ |
| --- | --- | --- |
| REUSE-01 | Продовжити той самий repo/branch/PR | PASS; PR4, вхідний HEAD і tree вище |
| NET-01 | Фактична причина збою | PASS; exact deploy log та незалежний root install reproduction |
| BE-01 | Rust/lock/routes/errors/timeouts/PG safety | PASS у локальному та disposable-PG scope; реальний remote TLS handshake NOT RUN |
| FE-01 | Виправити підтверджені probe/UI defects | PASS; 14 tests + actual browser failure/recovery |
| SEC-01 | Виявлені npm dev advisories | PASS для виправлення конкретних advisories; повний Rust SCA/SBOM NOT RUN |
| PRESERVE-01 | Gatsby/Decap/SEO/routes/production config | PASS на рівні незмінності source diff; функціональний parity NOT RUN |
| QA-01 | Незалежний review | PASS у визначеному code/test scope; reviewer не автор |
| M3 | Технічний пілот | Значно просунуто: core Rust/PG/browser smoke PASS; повний a11y/screen-reader/device matrix відкритий |
| M0/M1 | Legacy baseline, маршрути/CMS/forms/SEO contracts | Часткова інвентаризація; Gatsby baseline build заблокований root dependency drift |
| M4/M5 | Міграція бізнес-функцій, performance, release/rollback | NOT STARTED / NOT RUN; merge/deploy не дозволено |

Наступний перевірюваний етап: завершити a11y gate пілоту та **окремо** відновити відтворювану Gatsby reference-збірку на ізольованому checkout: узгодити сумісні версії двох чинних CMS media libraries з Decap, оновити root lock лише після review, перевірити npm ci + Gatsby build + CMS/media smoke. Лише після цього зафіксувати route/SEO/form baseline і golden parity першої реальної сторінки перед її Solid SSR/SSG перенесенням. Не перемикати production routing.

Rollback поточної зміни: revert двох code commits у цій feature branch; немає застосованої schema/data міграції або production runtime для відкочування. Це план, не проведена rehearsal release rollback.

## Атрибуція / бюджет / невідоме

- Runtime agents: `/root` — інтеграція, frontend та browser; `/root/backend_hardening` — Rust; `/root/netlify_diagnosis` — deploy log і Gatsby reproduction; `/root/postgres_integration` — disposable PG; `/root/independent_review` — незалежний review, власні Rust/FE/occupied-port checks. Модельні назви/спожиті tokens не розкриті, не оцінюються.
- Нові платні API, services, GitHub Actions і deployment jobs не запускались. Фактична вартість підписки/runtime UNKNOWN; нульову загальну вартість не заявляємо. Використано наявні авторизовані локальний runtime та VPS.
- Remote TLS certificate/hostname/CA handshake, повний screen reader/a11y, реальний мобільний пристрій, Rust advisory audit, Gatsby/CMS/forms/SEO parity, Web Vitals/p95, rollback rehearsal, UAT та користувацька користь залишаються NOT RUN. Технічний proof-of-concept не доводить ринкову користь або повну готовність сайту.
- Канонічний план/черга: `PLAN_UK.md`; цей журнал продовжує evidence 2026-10-23, не замінюючи його історію. Перевірено PRODUCT_QUALITY_STANDARD_UK v1.3 і каталог QUALITY_GATE_CRITERIA 2026-10-15.2; PQ-B UAT/outcome — NOT_RUN/INSUFFICIENT_DATA, release не приймається.

Первинні джерела залежностей: [SQLx0.8.6 options](https://docs.rs/sqlx/0.8.6/sqlx/postgres/struct.PgConnectOptions.html), [Vitest mock registration advisory](https://github.com/advisories/GHSA-qxg6-89mg-rqv8), [Tinypool advisory](https://github.com/advisories/GHSA-85c8-ppgw-ccpr), [Netlify skip deploy](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/).

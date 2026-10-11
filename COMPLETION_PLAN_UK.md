# Gatsby / Decap — план завершення

1. Виконано: відтворити ERESOLVE, pin сумісної трійки Decap app/media, оновити lockfile; вибрати Node 22 замість застарілого Netlify Node 14. На Node 24 відтворено помилку LMDB, на Node 22 production build створює 20 сторінок.
2. Наступне: оновити Gatsby/Decap та їх залежності до підтримуваних версій зі збереженням контенту й CMS schema; перевірити всі маршрути, зображення, 404 і mobile.
3. Визначити роль цього репозиторію: шаблон чи основне портфоліо. ziko1/vspportfolio і ziko1/gatsby-starter-decap-cms мали однаковий початковий commit. Нічого не видалено й домени не перепризначено.
4. Для бізнес-сайту потрібні справжні роботи, біографія, контакти й домен; не вигадувати від імені власника. Для шаблону — documented clean setup, CMS preview/edit/save/auth і розгортання в тестове середовище.
5. Форми, CMS provider/login, живий deployment і доступність потребують окремого приймання. Наявний npm test — upstream placeholder, а не успішний набір тестів.

Статус: BUILD RECOVERED; продукт NOT READY. Evidence: evidence/verification.json.

## CI balance — 2026-10-11

Configuration source `e1f57b681743128afadb48989185070d39adfe93` у [PR #3](https://github.com/ziko1/vspportfolio/pull/3) зберігає наявний suite на GitHub Linux і усуває дубль feature-push/PR. Додано bounded job/cancellation/npm download cache. Source/configuration validation **PASS**; actual run 38160744859 **BLOCKED_ENVIRONMENT** до runner, tests/build **NOT_RUN**. Це не змінює product readiness вище. [CI інструкція](docs/CI_BALANCE_UK.md), [evidence](evidence/ci-balance-20261011.json), [пам'ять](PROJECT_MEMORY.md). Наступний крок — actual hosted verification після відновлення виконання, потім окреме рішення про merge.

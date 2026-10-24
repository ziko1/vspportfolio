# Netlify Preview: діагностика 2026-10-24

Статус: **причину початкової відмови підтверджено; виправлення Preview НЕ прийняте**.
Автор read-only діагностики та ізольованого відтворення: Codex runtime agent
`/root/netlify_diagnosis`. Жодних змін конфігурації Netlify, root dependencies,
production, merge або запуску deploy цей агент не виконував.

## Точний об'єкт перевірки

- PR: <https://github.com/ziko1/vspportfolio/pull/4>, Draft.
- Branch: `migration/solid-axum-pilot-20261023`.
- Перевірений вихідний SHA: `1b8cd0884796862c64163177a58981e51aa5449e`.
- Base SHA: `0b102651c68fd6fda064d30e032717cdcd74e9ce`.
- Netlify site ID: `6c3f1012-7592-4f59-a65a-3e1e8e868725`.
- Deploy ID: `6adb97ea69752d910ac2bfe4`.
- Build ID: `6adb97ea69752d910ac2bfe2`.
- Журнал: <https://app.netlify.com/projects/cozy-flan-14d1be/deploys/6adb97ea69752d910ac2bfe4>.
- Deploy створений `2026-10-23T17:22:50.545Z`, помилка зафіксована
  `2026-10-23T17:23:54.376Z`. Час UI журналу нижче — Europe/Berlin (UTC+02:00).

Netlify connector підтвердив `state=error`, branch та commit, але не повернув
детальний error message. Детальні рядки прочитані в публічно доступному UI
цього самого deploy через браузер, без входу чи зміни налаштувань.
Окремий [санітизований витяг](NETLIFY_2026-10-24_EXCERPT.log) повторно звірено
з DOM журналу. Це вибрані рядки, а не повний експорт.

## Причина відмови

1. Netlify збирає **чинний Gatsby сайт із кореня**, а не Solid/Axum pilot:
   `/opt/build/repo`, `/opt/build/repo/netlify.toml`, `npm run build`, publish
   `/opt/build/repo/public` (L265, L268, L359, L371).
2. Кореневий `netlify.toml` задає Node `14.15.0`; журнал підтверджує npm `6.14.8`
   і Python `3.14.3` (L12, L27). Це успадкована конфігурація.
3. UI-плагін `@netlify/plugin-gatsby@3.8.4` встановлює `sharp@0.32.6`
   (L274, L284; plugin origin `ui` у L376).
4. Sharp знаходить глобальний libvips `8.15.1` та запускає компіляцію через
   `node-gyp 5.1.0` (L287–288, L332).
5. Старий gyp викликає `open(build_file_path, 'rU')` (L320); Python відхиляє
   цей режим: `ValueError: invalid mode: 'rU' while trying to load binding.gyp`
   (L322). Встановлення плагіна завершується помилкою, Netlify — exit 2.

Це помилка встановлення залежності build plugin **до виконання Gatsby build**.
Вона не є доказом дефекту SolidJS чи Rust-коду. Додаткові engine warnings
показують, що поточний Node також нижчий за вимоги частини встановлених
залежностей; лише усунення `rU` не доводить працездатності всього сайту.

Команда `git diff BASE..HEAD -- netlify.toml package.json package-lock.json
gatsby-config.js gatsby-node.js` дала порожній результат. Перераховані root
файли PR-пілот не змінював.

## Другий підтверджений блокер: legacy lockfile

Журнал L30 попереджає: npm6 підтримує lockfile v1, а root lockfile має v3.
Фактичний install відрізнявся від зафіксованих версій:

| Пакет | У root lockfile на перевіреному SHA | У журналі Netlify |
| --- | --- | --- |
| Gatsby | 4.25.7 | 4.25.9 |
| Decap CMS app | 3.0.12 | 3.17.1 |

Додатково root `package.json` містить `decap-cms-media-library-cloudinary`
`^3.0.1` та `decap-cms-media-library-uploadcare` `^3.0.0`, але вони відсутні
і в root dependency map, і в `packages` root `package-lock.json`.
Обидва імпортуються та реєструються в `src/cms/cms.js`; видаляти їх заради
зеленої збірки означало б втратити чинну функціональність CMS.

## Локальне відтворення

Ізольований detached worktree: `vspportfolio-netlify-repro`, exact SHA вище.
Node `24.19.0`, npm `11.9.0`, Linux. Root source/manifest/lockfile не змінено;
`git status --porcelain=v1` після перевірок порожній.

| Команда / сценарій | Фактичний результат |
| --- | --- |
| `SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm ci --ignore-scripts --no-audit --no-fund` | Exit 1, `ERESOLVE`: floating Cloudinary 3.1.5 потребує peer `decap-cms-lib-util` 3.9.1, тоді як lock має 3.0.1 |
| Та сама команда з `--legacy-peer-deps` | Exit 1, `EUSAGE`: manifest/lock не синхронізовані; бракує обох media libraries і transitive entries |
| Gatsby build | **NOT RUN** — dependency installation gate не пройдено |
| Окремий scratch package: `npm install --no-save --ignore-scripts --no-audit --no-fund sharp@0.32.6` | Встановлено 56 пакетів; scripts спочатку не виконувалися |
| Після огляду install script: `SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm rebuild sharp --foreground-scripts` | Exit 0; завантажено vendor libvips 8.14.5, integrity check пройдено |
| Sharp створює PNG 2×2 із синтетичного білого зображення | Exit 0; `sharp=0.32.6`, `vips=8.14.5`, 92 bytes |

Перевірка Sharp підтверджує тільки окремий native-install/runtime сценарій у
цьому локальному середовищі. Вона **не** підтверджує весь plugin, Gatsby,
Netlify build image, CMS або наступний Deploy Preview.

Raw scratch logs (не містять secrets; тимчасові, не є постійним місцем зберігання):

- `netlify-npm-ci.log`, SHA-256 `df6e26c53f32a9c12d4a7d0d058c2b11d9bd42f66154c6fc04c65bc81458829f`.
- `netlify-npm-ci-legacy.log`, SHA-256 `4c63b5e7d05abcd5536311b1acb480105852b7d8ef9cce71deb658dc9ef3d1b1`.
- `netlify-sharp-rebuild.log`, SHA-256 `0d0e5a6d502a5b91a329aa0a3c597c93fbef43abe72cfac39d81a43c66e25158`.

## Кандидат вузької зміни — NOT APPLIED

Наведений фрагмент **не додано** до root `netlify.toml`. Він описує лише
кандидата для окремої перевірки legacy build після виправлення lockfile.
`24.19.0` тут — реально виконана локальна версія, не заява про доведену
сумісність усіх Gatsby залежностей.

```toml
[context."migration/solid-axum-pilot-20261023".environment]
  NODE_VERSION = "24.19.0"
  SHARP_IGNORE_GLOBAL_LIBVIPS = "1"
```

Такий branch override залишає production defaults, command, publish і CMS
незмінними, але сам по собі не закриває вже підтверджений root install gate.
`--legacy-peer-deps` не є виправленням: у відтворенні він також завершується
помилкою та приховав би частину peer-контракту.

Офіційні джерела для механізмів кандидата:

- <https://docs.netlify.com/build/configure-builds/file-based-configuration/> —
  branch context має пріоритет над загальним context; імена зі slash беруться
  в лапки.
- <https://sharp.pixelplumbing.com/install/> —
  `SHARP_IGNORE_GLOBAL_LIBVIPS` вимикає автоматичне використання глобального
  libvips. Для конкретної версії 0.32.6 поведінку додатково перевірено локально.

## Наступний обмежений етап

Окремо від Solid/Axum M3 перевірки: узгодити **мінімальний** набір версій
Cloudinary/Uploadcare з чинним Decap та React, синхронізувати root lockfile
без масового оновлення залежностей, виконати чистий install і Gatsby build
з обмеженням CPU/heap. Перевірити `/admin/`, media integrations, маршрути,
SEO та існуючі форми. Лише після цього оцінити branch-only Node/Sharp override
та повторний Preview на точному SHA. Production-конфігурацію не змінювати.

Netlify Preview залишається **FAIL (відомий deploy) / наступний build NOT RUN**.
Цей результат не блокує незалежну локальну перевірку Rust/PostgreSQL pilot,
але не дозволяє назвати міграцію або сайт готовими до production.

# Gatsby / Decap — план завершення

1. Виконано: відтворити ERESOLVE, pin сумісної трійки Decap app/media, оновити lockfile; вибрати Node 22 замість застарілого Netlify Node 14. На Node 24 відтворено помилку LMDB, на Node 22 production build створює 20 сторінок.
2. Наступне: оновити Gatsby/Decap та їх залежності до підтримуваних версій зі збереженням контенту й CMS schema; перевірити всі маршрути, зображення, 404 і mobile.
3. Визначити роль цього репозиторію: шаблон чи основне портфоліо. ziko1/vspportfolio і ziko1/gatsby-starter-decap-cms мали однаковий початковий commit. Нічого не видалено й домени не перепризначено.
4. Для бізнес-сайту потрібні справжні роботи, біографія, контакти й домен; не вигадувати від імені власника. Для шаблону — documented clean setup, CMS preview/edit/save/auth і розгортання в тестове середовище.
5. Форми, CMS provider/login, живий deployment і доступність потребують окремого приймання. Наявний npm test — upstream placeholder, а не успішний набір тестів.

Статус: BUILD RECOVERED; продукт NOT READY. Evidence: evidence/verification.json.

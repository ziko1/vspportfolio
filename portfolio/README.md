# 🚀 Інструкція з запуску та деплою портфоліо

## 📋 Вимоги
- Node.js 18+ 
- npm або yarn

## 🔧 Локальний запуск

### 1. Встановлення залежностей
```bash
cd portfolio
npm install
```

### 2. Запуск dev сервера
```bash
npm run dev
```

Сайт буде доступний за адресою: `http://localhost:5173`

### 3. Створення production build
```bash
npm run build
```

Build файли будуть у папці `dist/`

### 4. Перегляд production версії локально
```bash
npm run preview
```

## 🌐 Деплой на GitHub Pages

### Крок 1: Створення GitHub репозиторію
1. Створіть новий репозиторій на GitHub (наприклад, `portfolio`)
2. Не ініціалізуйте його з README

### Крок 2: Ініціалізація Git та пуш коду
```bash
cd portfolio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

### Крок 3: Налаштування GitHub Actions для деплою

Створіть файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Крок 4: Налаштування GitHub Pages
1. Перейдіть в Settings вашого репозиторію
2. Оберіть "Pages" в лівому меню
3. В розділі "Build and deployment":
   - Source: GitHub Actions
4. GitHub автоматично налаштує URL

### Крок 5: Оновлення конфігурації
У файлі `vite.config.js` змініть `base` на ваш репозиторій:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/portfolio/', // Замініть на назву вашого репозиторію
  // ...
})
```

Також оновіть URL в:
- `index.html` (meta tags)
- `public/sitemap.xml`
- `public/robots.txt`

### Крок 6: Деплой
Після пушу змін, GitHub Actions автоматично збере та задеплоїть сайт.

Ваш сайт буде доступний за адресою:
`https://YOUR_USERNAME.github.io/portfolio/`

## 🎨 Персоналізація

### Що потрібно змінити:
1. **Контактна інформація** - `src/components/Contact.jsx`
2. **Соціальні посилання** - всюди де `yourusername`
3. **Проекти в портфоліо** - `src/components/Portfolio.jsx`
4. **Навички** - `src/components/Skills.jsx`
5. **Текст про себе** - `src/components/About.jsx`
6. **SEO мета-теги** - `index.html`

### Додаткові файли:
- Додайте своє фото в `public/` та оновіть Hero секцію
- Створіть `public/og-image.jpg` для social sharing

## ⚡ Оптимізація продуктивності

Проект вже оптимізований:
- ✅ Code splitting
- ✅ Minification CSS/JS
- ✅ Lazy loading компонентів
- ✅ SVG favicon
- ✅ SEO meta tags
- ✅ Structured data (JSON-LD)
- ✅ Responsive design
- ✅ Dark/Light theme

## 📱 Тестування

Перевірте сайт на:
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS Safari, Chrome Android)
- [ ] Tablet
- [ ] Lighthouse score (має бути 90+)

## 🛠️ Додаткові команди

```bash
# Линтинг коду
npm run lint

# Очищення кешу npm
npm cache clean --force

# Оновлення залежностей
npm update
```

## 📞 Підтримка

Якщо виникли питання - створіть issue в репозиторії.

---

**Зроблено з ❤️ для GitHub Pages**

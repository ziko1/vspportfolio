// Мова за замовчуванням та поточна мова
export const defaultLocale = 'uk'
export const currentLocale = {
  value: defaultLocale,
}

// Функція для встановлення мови
export const setLocale = (locale) => {
  if (['uk', 'en'].includes(locale)) {
    currentLocale.value = locale
    localStorage.setItem('locale', locale)
    document.documentElement.setAttribute('lang', locale)
  }
}

// Отримання мови зі сховища або використання мови браузера
export const getInitialLocale = () => {
  const saved = localStorage.getItem('locale')
  if (saved && ['uk', 'en'].includes(saved)) {
    return saved
  }
  
  // Спроба визначити мову браузера
  const browserLang = navigator.language?.split('-')[0]
  if (['uk', 'en'].includes(browserLang)) {
    return browserLang
  }
  
  return defaultLocale
}

import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Portfolio from './components/Portfolio'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { getInitialLocale, setLocale } from './locales/locale'

function App() {
  const [theme, setTheme] = useState('light')
  const [locale, setLocaleState] = useState('uk')

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    
    // Initialize locale
    const initialLocale = getInitialLocale()
    setLocaleState(initialLocale)
    setLocale(initialLocale)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const changeLocale = (newLocale) => {
    setLocaleState(newLocale)
    setLocale(newLocale)
  }

  return (
    <>
      <Navbar theme={theme} onToggleTheme={toggleTheme} locale={locale} onChangeLocale={changeLocale} />
      <main>
        <Hero locale={locale} />
        <About locale={locale} />
        <Services locale={locale} />
        <Portfolio locale={locale} />
        <Skills locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  )
}

export default App

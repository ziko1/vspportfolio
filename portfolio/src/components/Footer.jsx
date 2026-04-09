import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#" className="logo">
              <span className="logo-text">&lt;OK /&gt;</span>
            </a>
            <p>Створення сучасних веб-рішень для вашого бізнесу</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Навігація</h4>
              <ul>
                <li><a href="#home">Головна</a></li>
                <li><a href="#about">Про мене</a></li>
                <li><a href="#services">Послуги</a></li>
                <li><a href="#portfolio">Портфоліо</a></li>
                <li><a href="#contact">Контакти</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Послуги</h4>
              <ul>
                <li><a href="#services">Веб-розробка</a></li>
                <li><a href="#services">Backend розробка</a></li>
                <li><a href="#services">AI Інтеграції</a></li>
                <li><a href="#services">UI/UX Дизайн</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Соціальні мережі</h4>
              <ul>
                <li><a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="https://t.me/yourusername" target="_blank" rel="noopener noreferrer">Telegram</a></li>
                <li><a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Олександр Коваленко. Всі права захищено.</p>
          <p>Зроблено з ❤️ та ☕ в Україні</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

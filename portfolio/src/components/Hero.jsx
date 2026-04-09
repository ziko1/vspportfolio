import './Hero.css'
import { useTranslation } from '../locales/translations'

const Hero = ({ locale }) => {
  const { t } = useTranslation(locale)
  
  const handleScrollToContact = (e) => {
    e.preventDefault()
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in-up">
            <span>{t('hero.welcome')}</span>
          </div>
          
          <h1 className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t('hero.name')}
          </h1>
          
          <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.title')}
          </p>
          
          <p className="hero-description animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {t('hero.description')}
          </p>
          
          <div className="hero-buttons animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button className="btn btn-primary" onClick={handleScrollToContact}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {t('hero.contactButton')}
            </button>
            
            <a href="#portfolio" className="btn btn-secondary" onClick={(e) => {
              e.preventDefault()
              document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              {t('hero.portfolioButton')}
            </a>
          </div>
          
          <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">{t('hero.yearsExperience')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">{t('hero.projects')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">30+</span>
              <span className="stat-label">{t('hero.clients')}</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual animate-float">
          <div className="hero-image-container">
            <div className="hero-image-placeholder">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-primary)" />
                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                  </linearGradient>
                </defs>
                <text x="100" y="115" textAnchor="middle" fontSize="60" fill="white" fontWeight="bold">OK</text>
              </svg>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="floating-card card-1 glass">
            <span>&lt;/&gt;</span>
            <span>{t('hero.code')}</span>
          </div>
          <div className="floating-card card-2 glass">
            <span>⚡</span>
            <span>{t('hero.fast')}</span>
          </div>
          <div className="floating-card card-3 glass">
            <span>🎨</span>
            <span>{t('hero.design')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

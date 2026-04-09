import './About.css'
import { useTranslation } from '../locales/translations'

const About = ({ locale }) => {
  const { t } = useTranslation(locale)
  
  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="section-header">
          <h2>{t('about.title')}</h2>
          <p>{t('about.subtitle')}</p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <h3>{t('about.greeting')}</h3>
            <p>{t('about.description1')}</p>
            <p>{t('about.description2')}</p>
            <p>{t('about.description3')}</p>

            <div className="about-details">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span>{t('about.location')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">💼</span>
                <span>{t('about.available')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <span>{t('about.email')}</span>
              </div>
            </div>

            <a href="#contact" className="btn btn-primary">
              {t('about.contactButton')}
            </a>
          </div>

          <div className="about-cards">
            <div className="about-card glass">
              <div className="card-icon">🚀</div>
              <h4>{t('about.speed')}</h4>
              <p>{t('about.speedDesc')}</p>
            </div>

            <div className="about-card glass">
              <div className="card-icon">🎯</div>
              <h4>{t('about.quality')}</h4>
              <p>{t('about.qualityDesc')}</p>
            </div>

            <div className="about-card glass">
              <div className="card-icon">💡</div>
              <h4>{t('about.innovation')}</h4>
              <p>{t('about.innovationDesc')}</p>
            </div>

            <div className="about-card glass">
              <div className="card-icon">🤝</div>
              <h4>{t('about.collaboration')}</h4>
              <p>{t('about.collaborationDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

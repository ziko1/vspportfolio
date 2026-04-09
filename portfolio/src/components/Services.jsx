import './Services.css'
import { useTranslation } from '../locales/translations'

const Services = ({ locale }) => {
  const { t } = useTranslation(locale)
  
  const services = [
    {
      icon: '🌐',
      title: t('services.webDev.title'),
      description: t('services.webDev.description'),
      features: t('services.webDev.features')
    },
    {
      icon: '⚙️',
      title: t('services.backend.title'),
      description: t('services.backend.description'),
      features: t('services.backend.features')
    },
    {
      icon: '🤖',
      title: t('services.ai.title'),
      description: t('services.ai.description'),
      features: t('services.ai.features')
    },
    {
      icon: '🎨',
      title: t('services.uiux.title'),
      description: t('services.uiux.description'),
      features: t('services.uiux.features')
    },
    {
      icon: '📱',
      title: t('services.mobile.title'),
      description: t('services.mobile.description'),
      features: t('services.mobile.features')
    },
    {
      icon: '🚀',
      title: t('services.consulting.title'),
      description: t('services.consulting.description'),
      features: t('services.consulting.features')
    }
  ]

  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="section-header">
          <h2>{t('services.title')}</h2>
          <p>{t('services.subtitle')}</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card glass">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services

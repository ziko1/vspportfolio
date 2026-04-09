import './Services.css'

const Services = () => {
  const services = [
    {
      icon: '🌐',
      title: 'Веб-розробка',
      description: 'Створення сучасних, адаптивних веб-сайтів та додатків з використанням React, Vue та інших сучасних фреймворків.',
      features: ['SPA додатки', 'Адаптивний дизайн', 'SEO оптимізація']
    },
    {
      icon: '⚙️',
      title: 'Backend розробка',
      description: 'Розробка надійних серверних рішень, REST API та мікросервісів для масштабованих додатків.',
      features: ['Node.js/Express', 'Python/Django', 'Бази даних']
    },
    {
      icon: '🤖',
      title: 'AI Інтеграції',
      description: 'Інтеграція штучного інтелекту та машинного навчання у ваші продукти для автоматизації та аналізу.',
      features: ['ChatGPT API', 'ML моделі', 'Автоматизація']
    },
    {
      icon: '🎨',
      title: 'UI/UX Дизайн',
      description: 'Створення інтуїтивних інтерфейсів та користувацького досвіду, що конвертує відвідувачів у клієнтів.',
      features: ['Figma', 'Прототипування', 'Дизайн-системи']
    },
    {
      icon: '📱',
      title: 'Мобільні додатки',
      description: 'Розробка кросплатформних мобільних додатків за допомогою React Native та інших технологій.',
      features: ['React Native', 'iOS & Android', 'PWA']
    },
    {
      icon: '🚀',
      title: 'Консультації',
      description: 'Технічні консультації, код-ревю, допомога у виборі технологій та архітектурних рішень.',
      features: ['Code Review', 'Архітектура', 'Менторство']
    }
  ]

  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="section-header">
          <h2>Мої послуги</h2>
          <p>Комплексні рішення для вашого бізнесу</p>
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

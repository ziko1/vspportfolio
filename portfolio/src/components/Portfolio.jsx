import './Portfolio.css'
import { useTranslation } from '../locales/translations'

const Portfolio = ({ locale }) => {
  const { t } = useTranslation(locale)
  
  const projects = t('portfolio.projects', [])

  return (
    <section className="section portfolio" id="portfolio">
      <div className="container">
        <div className="section-header">
          <h2>{t('portfolio.title')}</h2>
          <p>{t('portfolio.subtitle')}</p>
        </div>

        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <article key={index} className="portfolio-card glass">
              <div className="portfolio-image">
                <span className="project-emoji">{['🛒', '✅', '🤖', '🏠', '💪', '📊'][index]}</span>
              </div>
              
              <div className="portfolio-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                
                <div className="tech-stack">
                  {[['React', 'Node.js', 'MongoDB', 'Stripe'], ['Vue 3', 'Firebase', 'Tailwind CSS'], ['React', 'Python', 'OpenAI API', 'FastAPI'], ['Next.js', 'PostgreSQL', 'Mapbox', 'AWS'], ['React Native', 'GraphQL', 'Node.js'], ['React', 'D3.js', 'Python', 'PostgreSQL']][index].map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
                
                <div className="portfolio-links">
                  <a 
                    href="#" 
                    className="btn-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('portfolio.demo')} ${project.title}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {t('portfolio.demo')}
                  </a>
                  <a 
                    href="#" 
                    className="btn-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('portfolio.code')} ${project.title}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    {t('portfolio.code')}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Portfolio

import './Portfolio.css'

const Portfolio = () => {
  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'Повнофункціональна платформа електронної комерції з адмін-панеллю, інтеграцією платежів та аналітикою.',
      image: '🛒',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      link: '#',
      github: '#'
    },
    {
      title: 'Task Management App',
      description: 'Додаток для управління завданнями з реальним часом, спільною роботою та інтеграцією календаря.',
      image: '✅',
      technologies: ['Vue 3', 'Firebase', 'Tailwind CSS'],
      link: '#',
      github: '#'
    },
    {
      title: 'AI Content Generator',
      description: 'Веб-додаток для генерації контенту за допомогою AI з підтримкою різних мов та форматів.',
      image: '🤖',
      technologies: ['React', 'Python', 'OpenAI API', 'FastAPI'],
      link: '#',
      github: '#'
    },
    {
      title: 'Real Estate Platform',
      description: 'Платформа нерухомості з інтерактивними картами, віртуальними турами та системою бронювання.',
      image: '🏠',
      technologies: ['Next.js', 'PostgreSQL', 'Mapbox', 'AWS'],
      link: '#',
      github: '#'
    },
    {
      title: 'Health & Fitness App',
      description: 'Мобільний додаток для відстеження тренувань, харчування та прогресу з персональними рекомендаціями.',
      image: '💪',
      technologies: ['React Native', 'GraphQL', 'Node.js'],
      link: '#',
      github: '#'
    },
    {
      title: 'Financial Dashboard',
      description: 'Аналітична панель для фінансового моніторингу з візуалізацією даних та прогнозуванням.',
      image: '📊',
      technologies: ['React', 'D3.js', 'Python', 'PostgreSQL'],
      link: '#',
      github: '#'
    }
  ]

  return (
    <section className="section portfolio" id="portfolio">
      <div className="container">
        <div className="section-header">
          <h2>Портфоліо</h2>
          <p>Останні проекти та досягнення</p>
        </div>

        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <article key={index} className="portfolio-card glass">
              <div className="portfolio-image">
                <span className="project-emoji">{project.image}</span>
              </div>
              
              <div className="portfolio-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                
                <div className="tech-stack">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
                
                <div className="portfolio-links">
                  <a 
                    href={project.link} 
                    className="btn-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Переглянути проект ${project.title}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Demo
                  </a>
                  <a 
                    href={project.github} 
                    className="btn-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub репозиторій ${project.title}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    Code
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

import './About.css'

const About = () => {
  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="section-header">
          <h2>Про мене</h2>
          <p>Дізнайтесь більше про мій досвід та підхід до розробки</p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <h3>Привіт! Я Олександр 👋</h3>
            <p>
              Full-Stack розробник з понад 5 роками досвіду створення сучасних веб-додатків. 
              Я захоплююсь перетворенням складних проблем на прості, елегантні рішення.
            </p>
            <p>
              Мій шлях у розробці почався зі створення невеликих проектів, і з тих пір я працював 
              над різними продуктами - від стартапів до корпоративних рішень. Я вірю в постійне 
              навчання та слідкування за останніми тенденціями в технологіях.
            </p>
            <p>
              Коли я не пишу код, ви можете знайти мене за вивченням нових технологій, участю 
              в open-source проектах або менторством початківців у спільноті.
            </p>

            <div className="about-details">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span>Київ, Україна</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">💼</span>
                <span>Відкритий до фрілансу</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <span>alex@example.com</span>
              </div>
            </div>

            <a href="#contact" className="btn btn-primary">
              Зв'язатися зі мною
            </a>
          </div>

          <div className="about-cards">
            <div className="about-card glass">
              <div className="card-icon">🚀</div>
              <h4>Швидкість</h4>
              <p>Оптимізую продуктивність для найкращого користувацького досвіду</p>
            </div>

            <div className="about-card glass">
              <div className="card-icon">🎯</div>
              <h4>Якість</h4>
              <p>Пишу чистий, підтримуваний код з дотриманням best practices</p>
            </div>

            <div className="about-card glass">
              <div className="card-icon">💡</div>
              <h4>Інновації</h4>
              <p>Використовую сучасні технології для створення унікальних рішень</p>
            </div>

            <div className="about-card glass">
              <div className="card-icon">🤝</div>
              <h4>Співпраця</h4>
              <p>Ефективно працюю в команді та з клієнтами</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

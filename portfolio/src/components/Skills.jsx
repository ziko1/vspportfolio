import './Skills.css'

const Skills = () => {
  const skillCategories = [
    {
      title: 'Frontend',
      skills: [
        { name: 'React/Next.js', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'Vue 3', level: 85 },
        { name: 'Tailwind CSS', level: 92 }
      ]
    },
    {
      title: 'Backend',
      skills: [
        { name: 'Node.js', level: 90 },
        { name: 'Python', level: 85 },
        { name: 'PostgreSQL', level: 88 },
        { name: 'MongoDB', level: 87 }
      ]
    },
    {
      title: 'Tools & Others',
      skills: [
        { name: 'Git/GitHub', level: 93 },
        { name: 'Docker', level: 82 },
        { name: 'AWS', level: 78 },
        { name: 'Figma', level: 80 }
      ]
    }
  ]

  return (
    <section className="section skills" id="skills">
      <div className="container">
        <div className="section-header">
          <h2>Навички</h2>
          <p>Технології та інструменти, якими я володію</p>
        </div>

        <div className="skills-container">
          {skillCategories.map((category, catIndex) => (
            <div key={catIndex} className="skills-category glass">
              <h3>{category.title}</h3>
              <div className="skills-list">
                {category.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-progress" 
                        style={{ width: `${skill.level}%` }}
                        role="progressbar"
                        aria-valuenow={skill.level}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`${skill.name} ${skill.level}%`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional skills tags */}
        <div className="additional-skills">
          <h4>Та багато іншого:</h4>
          <div className="skills-tags">
            {['GraphQL', 'REST API', 'Jest', 'CI/CD', 'Webpack', 'Vite', 'Linux', 'Agile', 'Scrum', 'OpenAI API', 'TensorFlow', 'Redis'].map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills

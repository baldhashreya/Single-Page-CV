import './App.css'
import { cv } from './data/cv'
import { ThemeToggle } from './theme/ThemeToggle'

function App() {
  return (
    <div className="portfolio-wrapper">
      <ThemeToggle />
      {/* Hero Section */}
      <section className="glass-card section-hero">
        <div className="hero-content">
          <span className="role-badge">{cv.hero.role}</span>
          <h1>
            {cv.hero.name.first}
            <br />
            {cv.hero.name.last}
          </h1>
          <div className="contact-links">
            {cv.hero.contacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.external ? '_blank' : undefined}
                rel={contact.external ? 'noopener noreferrer' : undefined}
              >
                {contact.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Bento */}
      <section className="glass-card section-skills">
        <h2 className="section-title">{cv.skills.title}</h2>
        <div className="skills-container">
          {cv.skills.items.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section className="glass-card section-experience">
        <h2 className="section-title">{cv.experience.title}</h2>
        <div className="timeline">
          {cv.experience.items.map((exp) => (
            <div key={`${exp.title}-${exp.company}`} className="timeline-item">
              <div className="exp-header">
                <span className="exp-title">{exp.title}</span>
                <span className="exp-date">{exp.date}</span>
              </div>
              <span className="exp-company">{exp.company}</span>
              <ul>
                {exp.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="glass-card section-projects">
        <h2 className="section-title">{cv.projects.title}</h2>

        {cv.projects.items.map((project) => (
          <div key={project.title} className="project-card">
            <div className="project-title">{project.title}</div>
            <p className="project-desc">{project.description}</p>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="glass-card section-edu">
        <h2 className="section-title">{cv.education.title}</h2>
        {cv.education.items.map((edu) => (
          <div key={`${edu.degree}-${edu.school}`} className="timeline-item">
            <span className="exp-title">{edu.degree}</span>
            <span className="exp-company">{edu.school}</span>
            <span className="exp-date">{edu.date}</span>
          </div>
        ))}
      </section>

      {/* Leadership */}
      <section className="glass-card section-other">
        <h2 className="section-title">{cv.leadership.title}</h2>
        <p className="project-desc" style={{ fontSize: '0.95rem' }}>
          {cv.leadership.text}
        </p>
      </section>
    </div>
  )
}

export default App

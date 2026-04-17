import { useMemo, useState } from 'react'
import type { CvContact, CvData } from '../../data/cv'
import { safeParseCvData } from '../../utils/jsonValidation'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function CvEditor({
  value,
  onChange,
}: {
  value: CvData
  onChange: (next: CvData) => void
}) {
  const [rawJson, setRawJson] = useState(() => JSON.stringify(value, null, 2))
  const rawParse = useMemo(() => safeParseCvData(rawJson), [rawJson])

  const set = (updater: (draft: CvData) => void) => {
    const next = clone(value)
    updater(next)
    onChange(next)
    setRawJson(JSON.stringify(next, null, 2))
  }

  const addContact = () =>
    set((d) => d.hero.contacts.push({ label: 'Link', href: 'https://', external: true }))
  const removeContact = (idx: number) => set((d) => d.hero.contacts.splice(idx, 1))

  const addSkill = () => set((d) => d.skills.items.push('New Skill'))
  const removeSkill = (idx: number) => set((d) => d.skills.items.splice(idx, 1))

  const addExperience = () =>
    set((d) =>
      d.experience.items.push({
        title: 'Role',
        company: 'Company',
        date: 'Year - Year',
        bullets: ['Impact / responsibility'],
      }),
    )
  const removeExperience = (idx: number) => set((d) => d.experience.items.splice(idx, 1))
  const addExperienceBullet = (idx: number) =>
    set((d) => d.experience.items[idx]?.bullets.push('New bullet'))
  const removeExperienceBullet = (idx: number, bulletIdx: number) =>
    set((d) => d.experience.items[idx]?.bullets.splice(bulletIdx, 1))

  const addProject = () => set((d) => d.projects.items.push({ title: 'Project', description: 'Description' }))
  const removeProject = (idx: number) => set((d) => d.projects.items.splice(idx, 1))

  const addEducation = () => set((d) => d.education.items.push({ degree: 'Degree', school: 'School', date: 'Year' }))
  const removeEducation = (idx: number) => set((d) => d.education.items.splice(idx, 1))

  const setContact = (idx: number, patch: Partial<CvContact>) =>
    set((d) => {
      d.hero.contacts[idx] = { ...d.hero.contacts[idx], ...patch }
    })

  return (
    <div className="pdf-modal__body">
      <div className="section">
        <div className="section__header">
          <h3>Hero</h3>
        </div>
        <div className="field-grid">
          <div className="field">
            <label>Role</label>
            <input value={value.hero.role} onChange={(e) => set((d) => (d.hero.role = e.target.value))} />
          </div>
          <div className="field">
            <label>First Name</label>
            <input
              value={value.hero.name.first}
              onChange={(e) => set((d) => (d.hero.name.first = e.target.value))}
            />
          </div>
          <div className="field">
            <label>Last Name</label>
            <input value={value.hero.name.last} onChange={(e) => set((d) => (d.hero.name.last = e.target.value))} />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h3>Contacts</h3>
          <button type="button" className="btn" onClick={addContact}>
            + Add
          </button>
        </div>
        <div className="list">
          {value.hero.contacts.map((c, idx) => (
            <div key={`${c.label}-${idx}`} className="list-item">
              <div className="field-grid">
                <div className="field">
                  <label>Label</label>
                  <input value={c.label} onChange={(e) => setContact(idx, { label: e.target.value })} />
                </div>
                <div className="field">
                  <label>Href</label>
                  <input value={c.href} onChange={(e) => setContact(idx, { href: e.target.value })} />
                </div>
                <div className="field">
                  <label>External</label>
                  <input
                    type="checkbox"
                    checked={Boolean(c.external)}
                    onChange={(e) => setContact(idx, { external: e.target.checked })}
                  />
                </div>
              </div>
              <div className="list-item__row">
                <button type="button" className="btn btn--danger" onClick={() => removeContact(idx)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h3>Skills</h3>
          <button type="button" className="btn" onClick={addSkill}>
            + Add
          </button>
        </div>
        <div className="field-grid">
          <div className="field">
            <label>Title</label>
            <input value={value.skills.title} onChange={(e) => set((d) => (d.skills.title = e.target.value))} />
          </div>
        </div>
        <div className="list">
          {value.skills.items.map((skill, idx) => (
            <div key={`${skill}-${idx}`} className="list-item">
              <div className="field">
                <label>Skill</label>
                <input
                  value={skill}
                  onChange={(e) => set((d) => (d.skills.items[idx] = e.target.value))}
                />
              </div>
              <div className="list-item__row">
                <button type="button" className="btn btn--danger" onClick={() => removeSkill(idx)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h3>Experience</h3>
          <button type="button" className="btn" onClick={addExperience}>
            + Add
          </button>
        </div>
        <div className="field-grid">
          <div className="field">
            <label>Title</label>
            <input
              value={value.experience.title}
              onChange={(e) => set((d) => (d.experience.title = e.target.value))}
            />
          </div>
        </div>
        <div className="list">
          {value.experience.items.map((exp, idx) => (
            <div key={`${exp.title}-${idx}`} className="list-item">
              <div className="field-grid">
                <div className="field">
                  <label>Role</label>
                  <input
                    value={exp.title}
                    onChange={(e) => set((d) => (d.experience.items[idx].title = e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Company</label>
                  <input
                    value={exp.company}
                    onChange={(e) => set((d) => (d.experience.items[idx].company = e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Date</label>
                  <input
                    value={exp.date}
                    onChange={(e) => set((d) => (d.experience.items[idx].date = e.target.value))}
                  />
                </div>
              </div>

              <div className="list" style={{ marginTop: '0.6rem' }}>
                {exp.bullets.map((b, bIdx) => (
                  <div key={`${b}-${bIdx}`} className="list-item">
                    <div className="field">
                      <label>Bullet</label>
                      <input
                        value={b}
                        onChange={(e) => set((d) => (d.experience.items[idx].bullets[bIdx] = e.target.value))}
                      />
                    </div>
                    <div className="list-item__row">
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => removeExperienceBullet(idx, bIdx)}
                      >
                        Remove Bullet
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="list-item__row">
                <button type="button" className="btn" onClick={() => addExperienceBullet(idx)}>
                  + Add Bullet
                </button>
                <button type="button" className="btn btn--danger" onClick={() => removeExperience(idx)}>
                  Remove Experience
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h3>Projects</h3>
          <button type="button" className="btn" onClick={addProject}>
            + Add
          </button>
        </div>
        <div className="field-grid">
          <div className="field">
            <label>Title</label>
            <input value={value.projects.title} onChange={(e) => set((d) => (d.projects.title = e.target.value))} />
          </div>
        </div>
        <div className="list">
          {value.projects.items.map((p, idx) => (
            <div key={`${p.title}-${idx}`} className="list-item">
              <div className="field-grid">
                <div className="field">
                  <label>Project Title</label>
                  <input
                    value={p.title}
                    onChange={(e) => set((d) => (d.projects.items[idx].title = e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea
                    value={p.description}
                    onChange={(e) => set((d) => (d.projects.items[idx].description = e.target.value))}
                  />
                </div>
              </div>
              <div className="list-item__row">
                <button type="button" className="btn btn--danger" onClick={() => removeProject(idx)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h3>Education</h3>
          <button type="button" className="btn" onClick={addEducation}>
            + Add
          </button>
        </div>
        <div className="field-grid">
          <div className="field">
            <label>Title</label>
            <input
              value={value.education.title}
              onChange={(e) => set((d) => (d.education.title = e.target.value))}
            />
          </div>
        </div>
        <div className="list">
          {value.education.items.map((edu, idx) => (
            <div key={`${edu.degree}-${idx}`} className="list-item">
              <div className="field-grid">
                <div className="field">
                  <label>Degree</label>
                  <input
                    value={edu.degree}
                    onChange={(e) => set((d) => (d.education.items[idx].degree = e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>School</label>
                  <input
                    value={edu.school}
                    onChange={(e) => set((d) => (d.education.items[idx].school = e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Date</label>
                  <input
                    value={edu.date}
                    onChange={(e) => set((d) => (d.education.items[idx].date = e.target.value))}
                  />
                </div>
              </div>
              <div className="list-item__row">
                <button type="button" className="btn btn--danger" onClick={() => removeEducation(idx)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h3>Leadership</h3>
        </div>
        <div className="field-grid">
          <div className="field">
            <label>Title</label>
            <input
              value={value.leadership.title}
              onChange={(e) => set((d) => (d.leadership.title = e.target.value))}
            />
          </div>
          <div className="field">
            <label>Text</label>
            <textarea
              value={value.leadership.text}
              onChange={(e) => set((d) => (d.leadership.text = e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h3>Raw JSON (optional)</h3>
        </div>
        <div className="field">
          <label>Advanced editing</label>
          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          />
        </div>
        {!rawParse.ok ? <div className="pdf-error">{rawParse.error}</div> : null}
        <div className="list-item__row">
          <button
            type="button"
            className="btn"
            onClick={() => {
              const parsed = safeParseCvData(rawJson)
              if (!parsed.ok) return
              onChange(parsed.value)
            }}
            disabled={!rawParse.ok}
          >
            Apply JSON
          </button>
        </div>
      </div>
    </div>
  )
}

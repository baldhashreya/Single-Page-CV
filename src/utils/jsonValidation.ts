import type { CvContact, CvData } from '../data/cv'
import type { ResumeJson } from './jsonFormatter'

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pathOf(path: Array<string | number>) {
  return path.length ? path.map((p) => (typeof p === 'number' ? `[${p}]` : p)).join('.') : '(root)'
}

function err(path: Array<string | number>, message: string): never {
  throw new Error(`${pathOf(path)}: ${message}`)
}

function asString(value: unknown, path: Array<string | number>) {
  if (typeof value !== 'string') err(path, 'Expected string')
  return value
}

function asBooleanOptional(value: unknown, path: Array<string | number>) {
  if (value === undefined) return undefined
  if (typeof value !== 'boolean') err(path, 'Expected boolean')
  return value
}

function asStringArray(value: unknown, path: Array<string | number>) {
  if (!Array.isArray(value)) err(path, 'Expected array')
  return value.map((v, idx) => asString(v, [...path, idx]))
}

function asRecord(value: unknown, path: Array<string | number>) {
  if (!isRecord(value)) err(path, 'Expected object')
  return value
}

export function parseResumeJson(value: unknown): ResumeJson {
  const root = asRecord(value, [])

  const name = asString(root.name, ['name'])
  const email = typeof root.email === 'string' ? root.email : ''
  const phone = typeof root.phone === 'string' ? root.phone : ''
  const skills = root.skills === undefined ? [] : asStringArray(root.skills, ['skills'])
  const education = root.education === undefined ? [] : asStringArray(root.education, ['education'])
  const experience = root.experience === undefined ? [] : asStringArray(root.experience, ['experience'])
  const projects = root.projects === undefined ? [] : asStringArray(root.projects, ['projects'])

  return { name, email, phone, skills, education, experience, projects }
}

function parseCvContact(value: unknown, path: Array<string | number>): CvContact {
  const r = asRecord(value, path)
  const label = asString(r.label, [...path, 'label'])
  const href = asString(r.href, [...path, 'href'])
  const external = asBooleanOptional(r.external, [...path, 'external'])
  return external === undefined ? { label, href } : { label, href, external }
}

export function parseCvData(value: unknown): CvData {
  const root = asRecord(value, [])

  const hero = asRecord(root.hero, ['hero'])
  const heroRole = asString(hero.role, ['hero', 'role'])
  const heroName = asRecord(hero.name, ['hero', 'name'])
  const first = asString(heroName.first, ['hero', 'name', 'first'])
  const last = asString(heroName.last, ['hero', 'name', 'last'])
  const contactsRaw = hero.contacts
  if (!Array.isArray(contactsRaw)) err(['hero', 'contacts'], 'Expected array')
  const contacts = contactsRaw.map((c, idx) => parseCvContact(c, ['hero', 'contacts', idx]))

  const skills = asRecord(root.skills, ['skills'])
  const skillsTitle = asString(skills.title, ['skills', 'title'])
  const skillsItems = asStringArray(skills.items, ['skills', 'items'])

  const experience = asRecord(root.experience, ['experience'])
  const experienceTitle = asString(experience.title, ['experience', 'title'])
  if (!Array.isArray(experience.items)) err(['experience', 'items'], 'Expected array')
  const experienceItems = experience.items.map((it, idx) => {
    const r = asRecord(it, ['experience', 'items', idx])
    const title = asString(r.title, ['experience', 'items', idx, 'title'])
    const date = asString(r.date, ['experience', 'items', idx, 'date'])
    const company = asString(r.company, ['experience', 'items', idx, 'company'])
    const bullets = asStringArray(r.bullets, ['experience', 'items', idx, 'bullets'])
    return { title, date, company, bullets }
  })

  const projects = asRecord(root.projects, ['projects'])
  const projectsTitle = asString(projects.title, ['projects', 'title'])
  if (!Array.isArray(projects.items)) err(['projects', 'items'], 'Expected array')
  const projectItems = projects.items.map((it, idx) => {
    const r = asRecord(it, ['projects', 'items', idx])
    const title = asString(r.title, ['projects', 'items', idx, 'title'])
    const description = asString(r.description, ['projects', 'items', idx, 'description'])
    return { title, description }
  })

  const education = asRecord(root.education, ['education'])
  const educationTitle = asString(education.title, ['education', 'title'])
  if (!Array.isArray(education.items)) err(['education', 'items'], 'Expected array')
  const educationItems = education.items.map((it, idx) => {
    const r = asRecord(it, ['education', 'items', idx])
    const degree = asString(r.degree, ['education', 'items', idx, 'degree'])
    const school = asString(r.school, ['education', 'items', idx, 'school'])
    const date = asString(r.date, ['education', 'items', idx, 'date'])
    return { degree, school, date }
  })

  const leadership = asRecord(root.leadership, ['leadership'])
  const leadershipTitle = asString(leadership.title, ['leadership', 'title'])
  const leadershipText = asString(leadership.text, ['leadership', 'text'])

  return {
    hero: { role: heroRole, name: { first, last }, contacts },
    skills: { title: skillsTitle, items: skillsItems },
    experience: { title: experienceTitle, items: experienceItems },
    projects: { title: projectsTitle, items: projectItems },
    education: { title: educationTitle, items: educationItems },
    leadership: { title: leadershipTitle, text: leadershipText },
  }
}

export function safeParseCvData(raw: string): ParseResult<CvData> {
  try {
    const parsed = JSON.parse(raw) as unknown
    return { ok: true, value: parseCvData(parsed) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

export function safeParseResumeJson(raw: string): ParseResult<ResumeJson> {
  try {
    const parsed = JSON.parse(raw) as unknown
    return { ok: true, value: parseResumeJson(parsed) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}


import type { CvData } from '../data/cv'

export type ResumeJson = {
  name: string
  email: string
  phone: string
  skills: string[]
  education: string[]
  experience: string[]
  projects: string[]
}

function normalize(text: string) {
  // Fix common PDF copy/paste mojibake so parsing works more reliably.
  return text
    .replace(/\r/g, '\n')
    .replace(/â€”|â€“/g, '-')
    .replace(/â€¢/g, '*')
    .replace(/â†’/g, '->')
    .replace(/Â/g, '')
}

function lines(text: string) {
  return normalize(text)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function findEmail(text: string) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return m ? m[0] : ''
}

function findPhone(text: string) {
  const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/)
  return m ? m[1].trim() : ''
}

function findName(textLines: string[]) {
  const first = textLines[0] ?? ''
  // Heuristic: first non-empty line that looks like a name.
  return first.length <= 60 ? first : ''
}

type SectionKey = 'skills' | 'education' | 'experience' | 'projects' | 'contact' | 'summary' | 'profile'

const SECTION_PATTERNS: Record<SectionKey, RegExp[]> = {
  contact: [/^contacts?\b/i, /^contact\s+info\b/i],
  education: [/^education\b/i, /^education\s*&\s*certifications?\b/i, /^certifications?\b/i],
  experience: [/^experience\b/i, /^work\s+experience\b/i, /^professional\s+experience\b/i, /^employment\b/i],
  profile: [/^profile\b/i],
  projects: [/^projects?\b/i, /^personal\s+projects?\b/i],
  skills: [/^skills?\b/i, /^technical\s+skills?\b/i, /^technologies\b/i, /^tools\b/i],
  summary: [/^summary\b/i],
}

function canonicalizeLine(line: string) {
  return line
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[:\u2014\u2013-]+\s*$/g, '') // strip trailing separators (":", "-", em/en dash)
}

function detectHeader(line: string): SectionKey | null {
  const c = canonicalizeLine(line)
  for (const key of Object.keys(SECTION_PATTERNS) as SectionKey[]) {
    if (SECTION_PATTERNS[key].some((re) => re.test(c))) return key
  }
  return null
}

function sliceSection(allLines: string[], header: SectionKey): string[] {
  const idx = allLines.findIndex((l) => detectHeader(l) === header)
  if (idx === -1) return []

  const out: string[] = []
  for (let i = idx + 1; i < allLines.length; i++) {
    if (detectHeader(allLines[i])) break
    out.push(allLines[i])
  }
  return out
}

function parseSkillTokens(text: string) {
  return text
    .split(/[,|*\u2022]/g)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function textToResumeJson(text: string): ResumeJson {
  const allLines = lines(text)
  const full = allLines.join('\n')

  const email = findEmail(full)
  const phone = findPhone(full)
  const name = findName(allLines)

  // Skills can appear as a header section or inline like "Skills: React, Node".
  const skillsFromHeader = sliceSection(allLines, 'skills').join(' ')
  const inlineSkillsLine = allLines.find((l) => /^\s*(technical\s+)?skills?\s*[:-]/i.test(l))
  const skillsInline = inlineSkillsLine ? inlineSkillsLine.replace(/^\s*(technical\s+)?skills?\s*[:-]\s*/i, '') : ''
  const skillsText = skillsFromHeader || skillsInline
  const skills = skillsText ? Array.from(new Set(parseSkillTokens(skillsText))) : []

  const education = sliceSection(allLines, 'education')
  const experience = sliceSection(allLines, 'experience')
  const projects = sliceSection(allLines, 'projects')

  return {
    name,
    email,
    phone,
    skills,
    education,
    experience,
    projects,
  }
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return { first: parts[0], last: parts.slice(1).join(' ') }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: 'Your', last: 'Name' }
}

export function resumeJsonToCvData(resume: ResumeJson): CvData {
  const name = splitName(resume.name || 'Your Name')
  const contacts = []

  if (resume.email) contacts.push({ label: 'Email', href: `mailto:${resume.email}` })
  if (resume.phone) contacts.push({ label: 'Phone', href: `tel:${resume.phone.replace(/\s+/g, '')}` })

  if (contacts.length === 0) {
    contacts.push({ label: 'Email', href: 'mailto:you@example.com' })
  }

  const splitBullets = (items: string[]) =>
    items
      .map((l) => l.replace(/^\s*([*\u2022-]|->)\s+/, '').trim())
      .filter(Boolean)

  const isLikelyJobHeader = (line: string) => {
    const l = line.trim()
    if (!l) return false
    if (/\b(19|20)\d{2}\b/.test(l) && /-|to|present/i.test(l)) return true
    if (/\b(present|current)\b/i.test(l)) return true
    if (l.length <= 70 && / at | @ | \| /.test(l)) return true
    if (l.length <= 55 && l === l.toUpperCase() && /[A-Z]/.test(l)) return true
    return false
  }

  const parseJobHeader = (line: string) => {
    // Common patterns:
    // "Software Engineer | Company | 2022 - Present"
    // "Software Engineer at Company (2022 - Present)"
    const clean = line.replace(/\s+/g, ' ').trim()
    const parts = clean.split('|').map((p) => p.trim()).filter(Boolean)
    if (parts.length >= 2) {
      const title = parts[0]
      const date = parts.find((p) => /\b(19|20)\d{2}\b/.test(p)) ?? ''
      const company = parts.find((p, idx) => idx !== 0 && p !== date) ?? ''
      return { title, company, date }
    }
    const atMatch = clean.match(/^(.*?)\s+(?:at|@)\s+(.+?)(?:\((.*?)\))?$/i)
    if (atMatch) {
      return { title: atMatch[1].trim(), company: atMatch[2].trim(), date: (atMatch[3] ?? '').trim() }
    }
    const dateMatch = clean.match(/\b(19|20)\d{2}\b.*?(present|\b(19|20)\d{2}\b)?/i)
    return { title: clean, company: '', date: dateMatch ? dateMatch[0] : '' }
  }

  const buildExperienceItems = (lines: string[]) => {
    const cleaned = splitBullets(lines)
    if (!cleaned.length) return []

    const items: Array<{ title: string; company: string; date: string; bullets: string[] }> = []
    let current: { title: string; company: string; date: string; bullets: string[] } | null = null

    for (const line of cleaned) {
      if (!current || isLikelyJobHeader(line)) {
        if (current) items.push(current)
        const header = parseJobHeader(line)
        current = { ...header, bullets: [] }
        continue
      }
      current.bullets.push(line)
    }

    if (current) items.push(current)

    // If everything became headers with no bullets, collapse into 1 item of bullets.
    const hasBullets = items.some((i) => i.bullets.length > 0)
    if (!hasBullets) {
      return [
        {
          title: 'Experience',
          company: '',
          date: '',
          bullets: cleaned.slice(0, 10),
        },
      ]
    }

    return items.slice(0, 6).map((i) => ({
      ...i,
      bullets: i.bullets.length ? i.bullets.slice(0, 10) : ['Describe your impact and responsibilities.'],
    }))
  }

  const buildProjectItems = (lines: string[]) => {
    const cleaned = splitBullets(lines)
    if (!cleaned.length) return []

    const items: Array<{ title: string; description: string }> = []
    let currentTitle = ''
    let currentDesc: string[] = []

    const flush = () => {
      const title = (currentTitle || 'Project').trim()
      const desc = currentDesc.join(' ').trim() || title
      if (title || desc) items.push({ title: title.slice(0, 80) || 'Project', description: desc })
      currentTitle = ''
      currentDesc = []
    }

    for (const line of cleaned) {
      // Short lines are often project titles; long lines are descriptions.
      const looksLikeTitle = line.length <= 55 && !/\b(19|20)\d{2}\b/.test(line)
      if (looksLikeTitle && currentTitle) {
        flush()
        currentTitle = line
      } else if (looksLikeTitle && !currentTitle) {
        currentTitle = line
      } else {
        currentDesc.push(line)
      }
    }
    flush()

    return items.slice(0, 8)
  }

  return {
    hero: {
      role: 'Software Engineer',
      name,
      contacts,
    },
    skills: {
      title: 'Technical Stack',
      items: resume.skills,
    },
    education: {
      title: 'Education',
      items: resume.education.length
        ? resume.education.slice(0, 6).map((line) => ({ degree: line, school: '', date: '' }))
        : [{ degree: 'Degree', school: 'University', date: 'Year' }],
    },
    experience: {
      title: 'Experience',
      items: resume.experience.length
        ? buildExperienceItems(resume.experience)
        : [
            {
              title: 'Job Title',
              company: 'Company',
              date: 'Year - Year',
              bullets: ['Describe your impact and responsibilities.'],
            },
          ],
    },
    projects: {
      title: 'Projects',
      items: resume.projects.length ? buildProjectItems(resume.projects) : [{ title: 'Project', description: 'Description' }],
    },
    leadership: {
      title: 'Leadership',
      text: '',
    },
  }
}

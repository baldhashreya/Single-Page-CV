export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'cv-theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(raw) ? raw : null
  } catch {
    return null
  }
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore storage failures (private mode, disabled storage, etc.)
  }
}

export function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  // Helps built-in form controls match the theme.
  root.style.colorScheme = theme
}


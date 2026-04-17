import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'
import { applyThemeToDocument, getStoredTheme, persistTheme, type Theme } from './theme'

function startThemeTransitionAnimation() {
  const root = document.documentElement
  root.classList.add('theme-switching')
}

function endThemeTransitionAnimation() {
  const root = document.documentElement
  root.classList.remove('theme-switching')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() ?? 'light')
  const animationTimerId = useRef<number | null>(null)

  const setTheme = useCallback((nextTheme: Theme) => {
    startThemeTransitionAnimation()

    if (animationTimerId.current !== null) {
      window.clearTimeout(animationTimerId.current)
    }

    setThemeState(nextTheme)
    persistTheme(nextTheme)

    animationTimerId.current = window.setTimeout(() => {
      endThemeTransitionAnimation()
      animationTimerId.current = null
    }, 350)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  useEffect(() => {
    return () => {
      if (animationTimerId.current !== null) {
        window.clearTimeout(animationTimerId.current)
      }
    }
  }, [])

  const value: ThemeContextValue = { theme, setTheme, toggleTheme }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

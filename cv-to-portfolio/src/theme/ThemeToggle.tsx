import { useEffect, useRef, useState } from 'react'
import { useTheme } from './ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [animating, setAnimating] = useState(false)
  const timerId = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerId.current !== null) {
        window.clearTimeout(timerId.current)
      }
    }
  }, [])

  const onToggle = () => {
    setAnimating(true)
    toggleTheme()

    if (timerId.current !== null) {
      window.clearTimeout(timerId.current)
    }
    timerId.current = window.setTimeout(() => {
      setAnimating(false)
      timerId.current = null
    }, 350)
  }

  return (
    <button
      type="button"
      className={`theme-toggle${animating ? ' theme-toggle--animating' : ''}`}
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

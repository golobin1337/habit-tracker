import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('habit-theme') || 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('habit-theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle, isDark: theme === 'dark' }
}

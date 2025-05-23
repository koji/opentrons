import { useState, useEffect, useCallback } from 'react'

export type ThemeName = 'light' | 'dark'
const THEME_STORAGE_KEY = 'pd-theme'

export function useThemeSwitcher(): [ThemeName, () => void] {
  const [themeName, setThemeName] = useState<ThemeName>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeName(savedTheme)
    } else {
      // Default to light and save it if nothing is stored or value is invalid
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
      setThemeName('light')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeName(prevThemeName => {
      const newThemeName = prevThemeName === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_STORAGE_KEY, newThemeName)
      return newThemeName
    })
  }, [])

  return [themeName, toggleTheme]
}

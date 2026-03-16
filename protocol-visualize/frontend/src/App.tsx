import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppHeader } from './components/AppHeader'
import { HomePage } from './pages/HomePage'
import { ProtocolPage } from './pages/ProtocolPage'

export function App(): JSX.Element {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = window.localStorage.getItem('protocol-visualize-theme')
    return storedTheme === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('protocol-visualize-theme', theme)
  }, [theme])

  return (
    <>
      <AppHeader
        theme={theme}
        onToggleTheme={() => {
          setTheme(current => (current === 'light' ? 'dark' : 'light'))
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/protocols/:protocolId" element={<ProtocolPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

interface AppHeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function AppHeader({
  theme,
  onToggleTheme,
}: AppHeaderProps): JSX.Element {
  const isDarkMode = theme === 'dark'

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Protocol Visualizer</p>
        <h1 className="app-header__title">Analyze and inspect protocols</h1>
      </div>
      <div className="app-header__actions">
        <a
          className="theme-toggle"
          href="http://opentrons.ai/"
          rel="noreferrer"
          target="_blank"
        >
          Fix with OpentronsAI
        </a>
        <button
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          aria-checked={isDarkMode}
          className="theme-switch"
          onClick={onToggleTheme}
          role="switch"
          type="button"
        >
          <span
            aria-hidden="true"
            className="theme-switch__icon"
          >
            {isDarkMode ? '☾' : '☀'}
          </span>
          <span className="theme-switch__label">
            {isDarkMode ? 'Dark mode' : 'Light mode'}
          </span>
          <span
            aria-hidden="true"
            className={`theme-switch__track ${
              isDarkMode ? 'theme-switch__track--dark' : ''
            }`}
          >
            <span className="theme-switch__thumb" />
          </span>
        </button>
      </div>
    </header>
  )
}

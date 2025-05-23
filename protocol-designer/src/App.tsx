import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './components/atoms/GlobalStyle'
import { ProtocolEditor } from './ProtocolEditor'
// TODO(BC, 2024-07-29): Determine correct relative path for components module
// Assuming 'components/src/helix-design-system/colors.ts' is eventually aliased or path-resolved
// For now, using a plausible relative path. This might need adjustment if monorepo structure
// places these modules differently at runtime/buildtime.
// Based on current structure:
// App.tsx is in protocol-designer/src/
// colors.ts is in components/src/helix-design-system/
// Path should be roughly: ../../components/src/helix-design-system/colors
import { lightTheme, darkTheme, OpentronsTheme } from '../../components/src/helix-design-system/colors'
import { useThemeSwitcher } from './resources/hooks/useThemeSwitcher'

export function App(): JSX.Element {
  const [themeName] = useThemeSwitcher()
  const currentTheme: OpentronsTheme = themeName === 'light' ? lightTheme : darkTheme

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <ProtocolEditor />
    </ThemeProvider>
  )
}

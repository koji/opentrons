import { createGlobalStyle } from 'styled-components'

import '@fontsource/public-sans'
import '@fontsource/public-sans/600.css'
import '@fontsource/public-sans/700.css'

// Corrected path:
// GlobalStyle is in protocol-designer/src/components/atoms/GlobalStyle/
// colors.ts is in components/src/helix-design-system/
// ../ (atoms -> components/src/components)
// ../ (components -> components/src)
// ../ (src -> protocol-designer root)
// ../ (protocol-designer -> monorepo root, assuming 'components' is a sibling)
// components/src/helix-design-system/colors.ts
// Corrected path: 5 levels up from protocol-designer/src/components/atoms/GlobalStyle/ to root, then down.
// So, ../../../../../components/src/helix-design-system/colors
import { OpentronsTheme } from '../../../../../components/src/helix-design-system/colors'

export const GlobalStyle = createGlobalStyle<{theme: OpentronsTheme}>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Public Sans', sans-serif;
  }

  body {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    // TODO(BC, 2024-07-29): Add more global styles for h1, p, links etc. if needed
  }

  // Example: Basic styling for links
  a {
    color: ${props => props.theme.colors.textLink};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

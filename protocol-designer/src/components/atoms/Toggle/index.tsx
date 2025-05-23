import { css, ThemeContext } from 'styled-components'
import * as React from 'react' // Import React for useContext

import {
  ALIGN_CENTER,
  Btn,
  // COLORS, // Removed direct import of COLORS
  Flex,
  Icon,
  SPACING,
  StyledText,
} from '@opentrons/components'
import type { OpentronsTheme } from '../../../../../components/src/helix-design-system/colors'

interface ToggleProps {
  isSelected: boolean
  onClick: () => void
  label: string
  disabled?: boolean
}
export function Toggle(props: ToggleProps): JSX.Element {
  const { isSelected, onClick, label, disabled = false } = props
  const theme = React.useContext(ThemeContext) as OpentronsTheme

  // It's possible StyledText from @opentrons/components is not yet theme-aware via context.
  // If StyledText directly takes a color string, this will work.
  // If StyledText needs to be used as styled(StyledText)`...` for theme access,
  // this approach might not make it re-render on theme change unless it's already listening.
  // Assuming it accepts a color string for now.
  const labelColor = theme.colors.textSecondary

  // The css prop should have access to the theme automatically if Btn is a styled-component
  // or if the babel plugin is correctly set up.
  // If not, Btn might need to be wrapped or styled.
  // We pass the theme explicitly to the css function for clarity and robustness.
  const toggleStyles = isSelected
    ? toggleEnabledStyles(theme)
    : toggleDisabledStyles(theme)

  return (
    <Flex gridGap={SPACING.spacing8} alignItems={ALIGN_CENTER}>
      <StyledText desktopStyle="bodyDefaultRegular" color={labelColor}>
        {label}
      </StyledText>
      <Btn
        role="switch"
        size="2rem"
        css={toggleStyles}
        onClick={disabled ? undefined : onClick}
        disabled={disabled} // Ensure disabled prop is passed to Btn for &:disabled styles
      >
        <Icon
          name={isSelected ? 'ot-toggle-input-on' : 'ot-toggle-input-off'}
          size="1rem"
        />
      </Btn>
    </Flex>
  )
}

// Updated to be functions that take theme
const toggleDisabledStyles = (theme: OpentronsTheme) => css`
  color: ${theme.colors.icon}; // Was COLORS.grey50

  &:hover {
    color: ${theme.colors.iconHover}; // Was COLORS.grey55
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px ${theme.colors.yellow50}; // Was COLORS.yellow50, using direct mapping
  }

  &:disabled {
    color: ${theme.colors.iconDisabled}; // Was COLORS.grey30
  }
`

const toggleEnabledStyles = (theme: OpentronsTheme) => css`
  color: ${theme.colors.primary}; // Was COLORS.blue50

  &:hover {
    color: ${theme.colors.interactivePrimaryHover}; // Was COLORS.blue55
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px ${theme.colors.yellow50}; // Was COLORS.yellow50, using direct mapping
  }

  &:disabled {
    color: ${theme.colors.iconDisabled}; // Was COLORS.grey30
  }
`

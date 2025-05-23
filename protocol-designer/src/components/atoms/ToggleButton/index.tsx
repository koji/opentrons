import { css, ThemeContext } from 'styled-components'
import * as React from 'react' // Import React for useContext

import {
  Btn,
  // COLORS, // Removed direct import of COLORS
  Flex,
  Icon,
} from '@opentrons/components'
import type { OpentronsTheme } from '../../../../../components/src/helix-design-system/colors'

import type { MouseEvent } from 'react'
import type { StyleProps } from '@opentrons/components'

// Updated to be functions that take theme
const toggleDisabledStyles = (theme: OpentronsTheme) => css`
  color: ${theme.colors.icon}; // Was COLORS.grey50

  &:hover {
    color: ${theme.colors.iconHover}; // Was COLORS.grey55
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px ${theme.colors.yellow50}; // Was COLORS.yellow50
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
    box-shadow: 0 0 0 3px ${theme.colors.yellow50}; // Was COLORS.yellow50
  }

  &:disabled {
    color: ${theme.colors.iconDisabled}; // Was COLORS.grey30
  }
`

interface ToggleButtonProps extends StyleProps {
  toggledOn: boolean
  label?: string | null
  disabled?: boolean | null
  id?: string
  onClick?: (e: MouseEvent) => void
}

export function ToggleButton(props: ToggleButtonProps): JSX.Element {
  const { label, toggledOn, disabled, size, ...buttonProps } = props
  const iconName = toggledOn ? 'ot-toggle-input-on' : 'ot-toggle-input-off'
  const theme = React.useContext(ThemeContext) as OpentronsTheme

  const toggleStyles = toggledOn
    ? toggleEnabledStyles(theme)
    : toggleDisabledStyles(theme)

  return (
    <Btn
      disabled={disabled ?? false}
      role="switch"
      aria-label={label}
      aria-checked={toggledOn}
      size={size ?? '2rem'}
      css={toggleStyles}
      {...buttonProps}
      data-testid={`ToggleButton_${label ?? 'label'}`}
    >
      <Flex>
        <Icon name={iconName} size="2rem" />
      </Flex>
    </Btn>
  )
}

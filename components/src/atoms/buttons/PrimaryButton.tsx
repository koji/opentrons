import styled from 'styled-components'

// Import OpentronsTheme for typing, BORDERS might need to be themed if it contains colors
import { BORDERS, OpentronsTheme } from '../../helix-design-system'
import { NewPrimaryBtn, styleProps } from '../../primitives'
import { SPACING, TYPOGRAPHY } from '../../ui-style-constants'

export const PrimaryButton = styled(NewPrimaryBtn)<{ theme: OpentronsTheme }>`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textOnPrimary};
  border-radius: ${BORDERS.borderRadius8}; // Assuming BORDERS.borderRadius8 is not a color
  box-shadow: none;
  padding-left: ${SPACING.spacing16};
  padding-right: ${SPACING.spacing16};
  line-height: ${TYPOGRAPHY.lineHeight20};
  text-transform: ${TYPOGRAPHY.textTransformNone};
  font-size: ${TYPOGRAPHY.fontSizeH3};
  font-weight: ${TYPOGRAPHY.fontWeightSemiBold};
  line-height: ${TYPOGRAPHY.lineHeight20};

  ${styleProps}

  &:hover,
  &:focus {
    // Assuming interactivePrimaryHover is defined in the theme, otherwise use a slightly different shade of primary
    background-color: ${props => props.theme.colors.interactivePrimaryHover ?? props.theme.colors.primary}; 
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.borderFocus}; // Use borderFocus for outline
    outline-offset: 0.25rem;
  }

  &:active {
    // Define an active state color, could be a darker shade of primary or a specific token
    background-color: ${props => props.theme.colors.primary}; // Placeholder, ideally a darker shade
  }

  &:disabled {
    background-color: ${props => props.theme.colors.buttonDisabledBackground};
    color: ${props => props.theme.colors.buttonDisabledText};
  }
`

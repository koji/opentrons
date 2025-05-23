import styled from 'styled-components'

import { isntStyleProp, styleProps } from './style-props'

import type { PrimitiveComponent } from './types'

/**
 * Text primitive
 *
 * @component
 */
// Import OpentronsTheme to type the theme prop
import { OpentronsTheme } from '../helix-design-system/colors'

export const Text: PrimitiveComponent<'p'> = styled.p.withConfig({
  shouldForwardProp: isntStyleProp,
})<{ theme?: OpentronsTheme }>`
  margin-top: 0;
  margin-bottom: 0;
  color: ${({ theme }) => theme?.colors?.text ?? 'inherit'}; // Default to theme's text color
  ${styleProps}
`

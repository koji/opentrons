import { getModuleType } from '@opentrons/shared-data'

import { StyledText } from '../../atoms'
import { COLORS } from '../../helix-design-system'
import { ModuleIcon } from '../../icons'
import { Flex } from '../../primitives'
import { ALIGN_CENTER, FLEX_MAX_CONTENT } from '../../styles'
import { SPACING } from '../../ui-style-constants'

import type { CSSProperties } from 'react'
import type { ModuleModel } from '@opentrons/shared-data'

export interface DeckLabelProps {
  /** Visible label text. */
  text: string
  /** Applies selected-state styling. */
  isSelected: boolean
  /** Renders compact styling and icon sizing for zoomed deck view. */
  isZoomed: boolean
  /** Optional module model used to render a module icon in zoomed view. */
  moduleModel?: ModuleModel
  /** Optional maximum width constraint for the label container. */
  maxWidth?: string
  /** Optional border-radius value applied to label edges. */
  labelBorderRadius?: string
  /** Whether this label is the last item in a grouped sequence. */
  isLast?: boolean
}

export function DeckLabel({
  text,
  isSelected,
  isZoomed,
  moduleModel,
  maxWidth = FLEX_MAX_CONTENT,
  labelBorderRadius,
  isLast = false,
}: DeckLabelProps): JSX.Element {
  const labelStyles = isSelected
    ? getSelectedDeckLabelStyle(maxWidth, labelBorderRadius)
    : getUnselectedDeckLabelStyle(maxWidth, labelBorderRadius, isLast)

  return (
    <Flex
      fontSize={isZoomed ? '6px' : '18px'}
      data-testid={`DeckLabel_${isSelected ? 'Selected' : 'UnSelected'}`}
      style={labelStyles}
    >
      <Flex gridGap={SPACING.spacing2} alignItems={ALIGN_CENTER}>
        {moduleModel != null && isZoomed ? (
          <ModuleIcon size="0.5rem" moduleType={getModuleType(moduleModel)} />
        ) : null}
        <StyledText color={isSelected ? COLORS.white : COLORS.blue50}>
          {text}
        </StyledText>
      </Flex>
    </Flex>
  )
}

const getBaseDeckLabelStyle = (
  maxWidth: string,
  labelBorderRadius?: string
): CSSProperties => ({
  width: FLEX_MAX_CONTENT,
  maxWidth,
  padding: SPACING.spacing2,
  borderRadius: labelBorderRadius ?? '0',
})

const getSelectedDeckLabelStyle = (
  maxWidth: string,
  labelBorderRadius?: string
): CSSProperties => ({
  ...getBaseDeckLabelStyle(maxWidth, labelBorderRadius),
  color: COLORS.white,
  border: `1.5px solid ${COLORS.blue50}`,
  backgroundColor: COLORS.blue50,
})

const getUnselectedDeckLabelStyle = (
  maxWidth: string,
  labelBorderRadius?: string,
  isLast?: boolean
): CSSProperties => ({
  ...getBaseDeckLabelStyle(maxWidth, labelBorderRadius),
  color: COLORS.blue50,
  borderRight: `1.5px solid ${COLORS.blue50}`,
  borderBottom: `1.5px solid ${COLORS.blue50}`,
  borderLeft: `1.5px solid ${COLORS.blue50}`,
  backgroundColor: COLORS.white,
  borderRadius: isLast ? labelBorderRadius : '0',
})

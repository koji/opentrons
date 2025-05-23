import { useTranslation } from 'react-i18next'
import * as React from 'react' // Import React for useContext
import { ThemeContext } from 'styled-components'

import {
  // COLORS, // Removed direct import of COLORS
  DIRECTION_COLUMN,
  Flex,
  RadioButton,
  SPACING,
  StyledText,
} from '@opentrons/components'
import type { OpentronsTheme } from '../../../../../components/src/helix-design-system/colors'

interface BasicButtonsProps {
  header: string
  selected: boolean | null
  onChange: (value: boolean) => void
  type: 'gripper' | 'wasteChute' | 'thermocycler'
  subHeader?: string
}

export function BasicsButtons(props: BasicButtonsProps): JSX.Element {
  const { header, onChange, selected, type, subHeader } = props
  const { t } = useTranslation('shared')
  const theme = React.useContext(ThemeContext) as OpentronsTheme

  const subHeaderColor = theme.colors.textSecondary // Was COLORS.grey60

  return (
    <Flex flexDirection={DIRECTION_COLUMN}>
      <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing12}>
        <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
          <StyledText desktopStyle="headingSmallBold">{header}</StyledText>
          {subHeader != null ? (
            <StyledText desktopStyle="bodyLargeRegular" color={subHeaderColor}>
              {subHeader}
            </StyledText>
          ) : null}
        </Flex>
        <Flex gridGap={SPACING.spacing4}>
          <RadioButton
            id={`${type}_yes`}
            testid={`BasicsButtons_${type}_yes`}
            buttonLabel={t('yes')}
            buttonValue="yes"
            isSelected={selected === true}
            onChange={() => {
              onChange(true)
            }}
          />
          <RadioButton
            id={`${type}_no`}
            testid={`BasicsButtons_${type}_no`}
            buttonLabel={t('no')}
            buttonValue="no"
            isSelected={selected === false}
            onChange={() => {
              onChange(false)
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

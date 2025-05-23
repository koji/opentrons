import * as React from 'react' // Import React for useContext and ReactNode
import { ThemeContext } from 'styled-components'
import {
  ALIGN_CENTER,
  Btn,
  Check,
  // COLORS, // Removed direct import of COLORS
  DIRECTION_COLUMN,
  Flex,
  JUSTIFY_SPACE_BETWEEN,
  ListButton,
  SPACING,
  StyledText,
  Tooltip,
  useHoverTooltip,
} from '@opentrons/components'
import type { OpentronsTheme } from '../../../../../components/src/helix-design-system/colors'

// import type { ReactNode } from 'react' // ReactNode is available from React import
import type { FieldProps } from '../../../pages/Designer/ProtocolSteps/types'

interface CheckboxExpandStepFormFieldProps {
  title: string
  fieldProps: FieldProps
  tooltipOverride?: string
  children?: React.ReactNode
  testId?: string
}
export function CheckboxExpandStepFormField(
  props: CheckboxExpandStepFormFieldProps
): JSX.Element {
  const { children, title, tooltipOverride, testId, fieldProps } = props
  const theme = React.useContext(ThemeContext) as OpentronsTheme

  const {
    value,
    updateValue,
    tooltipContent = tooltipOverride,
    disabled = false,
  } = fieldProps

  const [targetProps, tooltipProps] = useHoverTooltip()

  const listButtonColor = disabled ? theme.colors.textDisabled : theme.colors.text // Was COLORS.grey40 : COLORS.black90
  const checkColor = theme.colors.primary // Was COLORS.blue50

  return (
    <>
      <ListButton
        type="noActive"
        padding={SPACING.spacing12}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            updateValue(!value)
          }
        }}
        color={listButtonColor}
      >
        <Flex
          width="100%"
          flexDirection={DIRECTION_COLUMN}
          gridGap={SPACING.spacing8}
        >
          <Flex
            justifyContent={JUSTIFY_SPACE_BETWEEN}
            alignItems={ALIGN_CENTER}
          >
            <>
              <StyledText desktopStyle="bodyDefaultRegular" {...targetProps}>
                {title}
              </StyledText>
              <Btn
                data-testid={testId}
                onClick={() => {
                  updateValue(!value)
                }}
                disabled={disabled}
              >
                <Check
                  color={checkColor}
                  isChecked={value === true}
                  disabled={disabled}
                />
              </Btn>
            </>
          </Flex>
          {children}
        </Flex>
      </ListButton>
      {tooltipContent != null ? (
        <Tooltip tooltipProps={tooltipProps}>{tooltipContent}</Tooltip>
      ) : null}
    </>
  )
}

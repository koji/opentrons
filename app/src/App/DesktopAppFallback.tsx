import * as React from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

import {
  ALIGN_CENTER,
  DIRECTION_COLUMN,
  Flex,
  JUSTIFY_CENTER,
  SPACING,
  AlertPrimaryButton
} from '@opentrons/components'

import { StyledText } from '../atoms/text'

import { LegacyModal } from '../molecules/LegacyModal'
import { appRestart, sendLog } from '../redux/shell'
import { useTrackEvent, ANALYTICS_ODD_APP_ERROR } from '../redux/analytics'


import type { FallbackProps } from 'react-error-boundary'
import type { Dispatch } from '../redux/types'

export function DesktopAppFallback({
  error,
}: FallbackProps): JSX.Element {
  const { t } = useTranslation('app_settings')
  const trackEvent = useTrackEvent()
  const dispatch = useDispatch<Dispatch>()
  const handleRestartClick = (): void => {
    trackEvent({
      name: ANALYTICS_ODD_APP_ERROR,
      properties: { errorMessage: error.message },
    })
    dispatch(appRestart(error.message))
  }

  // immediately report to robot logs that something fatal happened
  React.useEffect(() => {
    dispatch(sendLog(`ODD app encountered a fatal error: ${error.message}`))
  }, [])

  return (
    <LegacyModal type='error' title={t('error_boundary_title')}>
      <Flex
        flexDirection={DIRECTION_COLUMN}
        gridGap={SPACING.spacing32}
        alignItems={ALIGN_CENTER}
        justifyContent={JUSTIFY_CENTER}
      >
        <StyledText as="p">{t('error_boundary_description')}</StyledText>
        <AlertPrimaryButton onClick={handleRestartClick}>
          {t('restart_app')}
        </AlertPrimaryButton>
      </Flex>
    </LegacyModal>
  )
}

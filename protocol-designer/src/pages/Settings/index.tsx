import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useContext } from 'react' // Import useContext
import { ThemeContext } from 'styled-components' // Import ThemeContext
import {
  BORDERS,
  // COLORS, // Remove direct COLORS import
  Btn, // Ensure Btn is imported if not already
  DIRECTION_COLUMN,
  Flex,
  JUSTIFY_CENTER,
  SPACING,
  StyledText,
} from '@opentrons/components'

import { selectors as analyticsSelectors } from '../../analytics'
import { AnnouncementModal } from '../../components/organisms'
import {
  AppInfo,
  FeatureFlag,
  Privacy,
  UserSettings,
} from '../../components/organisms/Settings'
import { getFeatureFlagData } from '../../feature-flags/selectors'
import { selectors as tutorialSelectors } from '../../tutorial'
import { useThemeSwitcher } from '../../../resources/hooks/useThemeSwitcher' // Import the hook
import type { OpentronsTheme } from '../../../../components/src/helix-design-system/colors' // For typing theme context

const SETTINGS_MAX_WIDTH = '56rem'

export function Settings(): JSX.Element {
  const { t } = useTranslation('shared')
  const themeContext = useContext(ThemeContext) as OpentronsTheme // Get theme from context
  const [themeName, toggleTheme] = useThemeSwitcher() // Use the theme switcher hook
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(
    false
  )
  const flags = useSelector(getFeatureFlagData)
  const canClearHintDismissals = useSelector(
    tutorialSelectors.getCanClearHintDismissals
  )
  const { hasOptedIn } = useSelector(analyticsSelectors.getHasOptedIn)
  const prereleaseModeEnabled = flags.PRERELEASE_MODE === true

  return (
    <>
      {showAnnouncementModal ? (
        <AnnouncementModal
          isViewReleaseNotes={showAnnouncementModal}
          onClose={() => {
            setShowAnnouncementModal(false)
          }}
        />
      ) : null}
      <Flex
        width="100%"
        justifyContent={JUSTIFY_CENTER}
        backgroundColor={themeContext.colors.background} // Use theme background
        padding={`${SPACING.spacing60} ${SPACING.spacing80} ${SPACING.spacing80}`}
      >
        <Flex width="100%" maxWidth={SETTINGS_MAX_WIDTH} height="100%">
          <Flex
            backgroundColor={themeContext.colors.surface} // Use theme surface
            padding={SPACING.spacing40}
            flexDirection={DIRECTION_COLUMN}
            gridGap={SPACING.spacing40}
            borderRadius={BORDERS.borderRadius8}
            width="100%"
            height="100%"
          >
            <Flex width="100%" height="100%">
              <StyledText desktopStyle="headingLargeBold">
                {t('settings')}
              </StyledText>
            </Flex>

            <Flex
              height="100%"
              flexDirection={DIRECTION_COLUMN}
              gridGap={SPACING.spacing24}
            >
              <AppInfo setShowAnnouncementModal={setShowAnnouncementModal} />
              <UserSettings
                canClearHintDismissals={canClearHintDismissals}
                flags={flags}
              />
              <Privacy hasOptedIn={hasOptedIn} />
              {prereleaseModeEnabled ? <FeatureFlag flags={flags} /> : null}

              {/* Theme Toggle Section */}
              <Flex
                flexDirection={DIRECTION_COLUMN}
                gridGap={SPACING.spacing8}
                borderTop={`${BORDERS.lineBorder1} ${themeContext.colors.border}`} // Use theme border
                paddingTop={SPACING.spacing24}
              >
                <StyledText desktopStyle="headingSmallBold">
                  {t('appearance', { ns: 'shared' })} {/* Assuming 'appearance' key exists or add it */}
                </StyledText>
                <Btn onClick={toggleTheme}>
                  {themeName === 'light'
                    ? t('switch_to_dark_mode', { ns: 'shared' }) // Assuming key exists or add it
                    : t('switch_to_light_mode', { ns: 'shared' })} {/* Assuming key exists or add it */}
                </Btn>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

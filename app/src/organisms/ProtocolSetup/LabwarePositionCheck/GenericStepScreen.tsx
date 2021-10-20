import * as React from 'react'
import {
  ALIGN_CENTER,
  Box,
  DIRECTION_COLUMN,
  C_BLUE,
  Flex,
  JUSTIFY_CENTER,
  JUSTIFY_SPACE_BETWEEN,
  PrimaryBtn,
  SPACING_3,
  SPACING_5,
  SPACING_4,
} from '@opentrons/components'
import { LabwarePositionCheckStepDetail } from './LabwarePositionCheckStepDetail'
import { SectionList } from './SectionList'
import { useIntroInfo, useLabwareIdsBySection } from './hooks'
import { DeckMap } from './DeckMap'
import type { LabwarePositionCheckStep } from './types'

interface GenericStepScreenProps {
  selectedStep: LabwarePositionCheckStep
  setCurrentLabwareCheckStep: (stepNumber: number) => void
  ctaText: string
  proceed: () => void
}
export const GenericStepScreen = (
  props: GenericStepScreenProps
): JSX.Element | null => {
  const introInfo = useIntroInfo()
  const labwareIdsBySection = useLabwareIdsBySection()
  const [sectionIndex] = React.useState<number>(0)
  if (introInfo == null) return null
  const { sections, primaryPipetteMount, secondaryPipetteMount } = introInfo
  const labwareIdsToHighlight = labwareIdsBySection[sections[sectionIndex]]

  return (
    <Box margin={SPACING_3}>
      <Flex justifyContent={JUSTIFY_SPACE_BETWEEN} alignItems={ALIGN_CENTER}>
        <Flex flexDirection={DIRECTION_COLUMN}>
          <Flex marginRight={SPACING_5}>
            <SectionList
              primaryPipetteMount={primaryPipetteMount}
              secondaryPipetteMount={secondaryPipetteMount}
              sections={sections}
              currentSection={sections[sectionIndex]}
              completedSections={[sections[sectionIndex - 1]]}
            />
          </Flex>
          <Flex justifyContent={JUSTIFY_CENTER}>
            <DeckMap
              labwareIdsToHighlight={labwareIdsToHighlight}
              completedLabwareIdSections={
                labwareIdsBySection[sections[sectionIndex - 1]]
              }
            />
          </Flex>
        </Flex>
        <Box width="60%" padding={SPACING_3}>
          <LabwarePositionCheckStepDetail selectedStep={props.selectedStep} />
        </Box>
      </Flex>
      <Flex justifyContent={JUSTIFY_CENTER} marginBottom={SPACING_4}>
        <PrimaryBtn backgroundColor={C_BLUE} onClick={props.proceed}>
          {props.ctaText}
        </PrimaryBtn>
      </Flex>
    </Box>
  )
}

import { createSelector } from 'reselect'
import { getWellNamePerMultiTip } from '@opentrons/shared-data'
import { getWellSetForMultichannel } from '../utils'
import { CreateCommand } from '@opentrons/shared-data/protocol/types/schemaV7'
import mapValues from 'lodash/mapValues'
import * as StepGeneration from '@opentrons/step-generation'
import { selectors as stepFormSelectors } from '../step-forms'
import { selectors as fileDataSelectors } from '../file-data'
import { getHoveredStepId, getHoveredSubstep } from '../ui/steps'
import { WellGroup } from '@opentrons/components'
import { PipetteEntity, LabwareEntity } from '@opentrons/step-generation'
import { Selector } from '../types'
import { SubstepItemData } from '../steplist/types'

function _wellsForPipette(
  pipetteEntity: PipetteEntity,
  labwareEntity: LabwareEntity,
  wells: string[]
): string[] {
  // `wells` is all the wells that pipette's channel 1 interacts with.
  if (pipetteEntity.spec.channels === 8) {
    return wells.reduce((acc: string[], well: string) => {
      const setOfWellsForMulti = getWellNamePerMultiTip(labwareEntity.def, well)
      return setOfWellsForMulti ? [...acc, ...setOfWellsForMulti] : acc // setOfWellsForMulti is null
    }, [])
  }

  // single-channel
  return wells
}

function _getSelectedWellsForStep(
  stepArgs: StepGeneration.CommandCreatorArgs,
  labwareId: string,
  frame: StepGeneration.CommandsAndRobotState,
  invariantContext: StepGeneration.InvariantContext
): string[] {
  if (StepGeneration.getHasNoWellsFromCCArgs(stepArgs)) {
    return []
  }

  const pipetteId = StepGeneration.getPipetteIdFromCCArgs(stepArgs)
  const pipetteEntity = pipetteId
    ? invariantContext.pipetteEntities[pipetteId]
    : null
  const labwareEntity = invariantContext.labwareEntities[labwareId]

  if (!pipetteEntity || !labwareEntity) {
    return []
  }

  const getWells = (wells: string[]): string[] =>
    _wellsForPipette(pipetteEntity, labwareEntity, wells)

  const wells = []

  // If we're moving liquids within a single labware,
  // both the source and dest wells together need to be selected.
  if (stepArgs.commandCreatorFnName === 'mix') {
    if (stepArgs.labware === labwareId) {
      wells.push(...getWells(stepArgs.wells))
    }
  } else if (stepArgs.commandCreatorFnName === 'transfer') {
    if (stepArgs.sourceLabware === labwareId) {
      wells.push(...getWells(stepArgs.sourceWells))
    }

    if (stepArgs.destLabware === labwareId) {
      wells.push(...getWells(stepArgs.destWells))
    }
  } else if (stepArgs.commandCreatorFnName === 'consolidate') {
    if (stepArgs.sourceLabware === labwareId) {
      wells.push(...getWells(stepArgs.sourceWells))
    }

    if (stepArgs.destLabware === labwareId) {
      wells.push(...getWells([stepArgs.destWell]))
    }
  } else if (stepArgs.commandCreatorFnName === 'distribute') {
    if (stepArgs.sourceLabware === labwareId) {
      wells.push(...getWells([stepArgs.sourceWell]))
    }

    if (stepArgs.destLabware === labwareId) {
      wells.push(...getWells(stepArgs.destWells))
    }
  }

  frame.commands.forEach((c: CreateCommand) => {
    if (c.commandType === 'pickUpTip' && c.params.labwareId === labwareId) {
      const commandWellName = c.params.wellName
      const pipetteId = c.params.pipetteId
      const pipetteSpec =
        invariantContext.pipetteEntities[pipetteId]?.spec || {}

      if (pipetteSpec.channels === 1) {
        wells.push(commandWellName)
      } else if (pipetteSpec.channels === 8) {
        const wellSet =
          getWellSetForMultichannel(
            invariantContext.labwareEntities[labwareId].def,
            commandWellName
          ) || []
        wells.push(...wellSet)
      } else {
        console.error(
          `Unexpected number of channels: ${
            pipetteSpec.channels || '?'
          }. Could not get tip highlight state`
        )
      }
    }
  })
  return wells
}

/** Scan through given substep rows to get a list of source/dest wells for the given labware */
function _getSelectedWellsForSubstep(
  stepArgs: StepGeneration.CommandCreatorArgs,
  labwareId: string,
  substeps: SubstepItemData | null | undefined,
  substepIndex: number,
  invariantContext: StepGeneration.InvariantContext
): string[] {
  if (substeps === null) {
    return []
  }

  // TODO: Ian 2018-10-01 proper type for wellField enum
  function getWells(wellField: 'source' | 'dest'): string[] {
    // ignore substeps with no well fields
    // TODO: Ian 2019-01-29 be more explicit about commandCreatorFnName,
    // don't rely so heavily on the fact that their well fields are the same now
    // @ts-expect-error(sa, 2021-6-22): type narrow
    if (!substeps || substeps.commandCreatorFnName === 'delay') return []
    // @ts-expect-error(sa, 2021-6-22): type narrow
    if (substeps.rows && substeps.rows[substepIndex]) {
      // single-channel
      // @ts-expect-error(sa, 2021-6-22): type narrow
      const wellData = substeps.rows[substepIndex][wellField]
      return wellData && wellData.well ? [wellData.well] : []
    }
    // @ts-expect-error(sa, 2021-6-22): type narrow
    if (substeps.multiRows && substeps.multiRows[substepIndex]) {
      // multi-channel
      // @ts-expect-error(sa, 2021-6-22): type narrow
      return substeps.multiRows[substepIndex].reduce((acc, multiRow) => {
        const wellData = multiRow[wellField]
        return wellData && wellData.well ? [...acc, wellData.well] : acc
      }, [])
    }

    return []
  }

  const wells: string[] = []

  // single-labware steps
  if (
    stepArgs.commandCreatorFnName === 'mix' &&
    stepArgs.labware &&
    stepArgs.labware === labwareId
  ) {
    return getWells('source')
  }

  // source + dest steps

  // @ts-expect-error(sa, 2021-6-22): `sourceLabware` is missing in `MixArgs`
  if (stepArgs.sourceLabware && stepArgs.sourceLabware === labwareId) {
    wells.push(...getWells('source'))
  }

  // @ts-expect-error(sa, 2021-6-22): property `destLabware` is missing in `MixArgs`
  if (stepArgs.destLabware && stepArgs.destLabware === labwareId) {
    wells.push(...getWells('dest'))
  }

  if (substeps && substeps.substepType === 'sourceDest') {
    let tipWellSet: string[] = []

    if (substeps.multichannel) {
      const { activeTips } = substeps.multiRows[substepIndex][0]

      // just use first multi row
      if (activeTips && activeTips.labwareId === labwareId) {
        const multiTipWellSet = getWellSetForMultichannel(
          invariantContext.labwareEntities[labwareId].def,
          activeTips.wellName
        )
        if (multiTipWellSet) tipWellSet = multiTipWellSet
      }
    } else {
      // single-channel
      const { activeTips } = substeps.rows[substepIndex]
      if (
        activeTips &&
        activeTips.labwareId === labwareId &&
        activeTips.wellName
      )
        tipWellSet = [activeTips.wellName]
    }

    wells.push(...tipWellSet)
  }

  return wells
}

export const wellHighlightsByLabwareId: Selector<
  Record<string, WellGroup>
> = createSelector(
  fileDataSelectors.getRobotStateTimeline,
  stepFormSelectors.getInvariantContext,
  stepFormSelectors.getArgsAndErrorsByStepId,
  getHoveredStepId,
  getHoveredSubstep,
  fileDataSelectors.getSubsteps,
  stepFormSelectors.getOrderedStepIds,
  (
    robotStateTimeline,
    invariantContext,
    allStepArgsAndErrors,
    hoveredStepId,
    hoveredSubstep,
    substepsById,
    orderedStepIds
  ) => {
    const timeline = robotStateTimeline.timeline
    const stepId = hoveredStepId
    const timelineIndex = orderedStepIds.findIndex(i => i === stepId)
    const frame = timeline[timelineIndex]
    const robotState = frame && frame.robotState
    const stepArgs =
      stepId != null &&
      allStepArgsAndErrors[stepId] &&
      allStepArgsAndErrors[stepId].stepArgs

    if (!robotState || stepId == null || !stepArgs) {
      // nothing hovered, or no stepArgs for step
      return {}
    }

    // replace value of each labware with highlighted wells info
    return mapValues(
      robotState.liquidState.labware,
      (
        labwareLiquids: StepGeneration.SingleLabwareLiquidState,
        labwareId: string
      ) => {
        let selectedWells: string[] = []

        if (hoveredSubstep != null) {
          // wells for hovered substep
          selectedWells = _getSelectedWellsForSubstep(
            stepArgs,
            labwareId,
            substepsById[stepId],
            hoveredSubstep.substepIndex,
            invariantContext
          )
        } else {
          // wells for step overall
          selectedWells = _getSelectedWellsForStep(
            stepArgs,
            labwareId,
            frame,
            invariantContext
          )
        }

        // return selected wells eg {A1: null, B4: null}
        return selectedWells.reduce(
          (acc, well) => ({ ...acc, [well]: null }),
          {}
        )
      }
    )
  }
)

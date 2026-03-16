import { useDispatch } from 'react-redux'
import {
  ANALYTICS_LAUNCH_PROTOCOL_VISUALIZATION_SPOTLIGHT_WINDOW,
  ANALYTICS_NOTIFICATION_PROTOCOL_VISUALIZATION_VIEWPORT_SIZES,
  useTrackEvent,
} from '/app/redux/analytics'
import {
  stepDetailViewerCloseAction,
  stepDetailViewerOpenAction,
  stepDetailViewerUpdateAction,
} from '/app/redux/shell'
import { useMostRecentCompletedAnalysis } from '/app/resources/runs'

import { SharedVisualizer } from '../SharedVisualizer'

import type { ProtocolAnalysisOutput } from '@opentrons/shared-data'
import type { GroupedCommands } from '/app/redux/protocol-storage'

interface VisualizerContainerProps {
  analysisOutput: ProtocolAnalysisOutput
  runId: string | null
  groupedCommands: GroupedCommands | null
  protocolKey: string
  srcFileNames: string[]
}

export function VisualizerContainer(
  props: VisualizerContainerProps
): JSX.Element {
  const dispatch = useDispatch()
  const { runId, analysisOutput, groupedCommands, protocolKey, srcFileNames } =
    props
  const completedProtocolAnalysis = useMostRecentCompletedAnalysis(runId)
  const trackEvent = useTrackEvent()
  return (
    <SharedVisualizer
      analysisOutput={analysisOutput}
      analysisOverride={completedProtocolAnalysis}
      groupedCommands={groupedCommands}
      protocolKey={protocolKey}
      srcFileNames={srcFileNames}
      onLaunchSpotlightWindow={() => {
        trackEvent({
          name: ANALYTICS_LAUNCH_PROTOCOL_VISUALIZATION_SPOTLIGHT_WINDOW,
          properties: {},
        })
      }}
      onStepDetailClose={payload => {
        dispatch(stepDetailViewerCloseAction(payload))
      }}
      onStepDetailOpen={payload => {
        dispatch(stepDetailViewerOpenAction(payload))
      }}
      onStepDetailUpdate={payload => {
        dispatch(stepDetailViewerUpdateAction(payload))
      }}
      onViewportMetrics={payload => {
        trackEvent({
          name: ANALYTICS_NOTIFICATION_PROTOCOL_VISUALIZATION_VIEWPORT_SIZES,
          properties: {
            'Window Width': payload.windowWidth,
            'Window Height': payload.windowHeight,
            'Left Column Width': payload.leftColumnWidth,
            'Right Column Width': payload.rightColumnWidth,
          },
        })
      }}
    />
  )
}

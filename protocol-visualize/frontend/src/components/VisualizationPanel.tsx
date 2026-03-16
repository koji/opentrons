import { getGroupedCommands } from '/app/redux/protocol-storage/utils'
import { ProtocolVisualizer } from './ProtocolVisualizer'

import type { ProtocolAnalysisOutput } from '@opentrons/shared-data'
import type { ProtocolRecord } from '../api/types'

export function VisualizationPanel({
  record,
}: {
  record: ProtocolRecord
}): JSX.Element {
  const rawAnalysis = record.analysis as ProtocolAnalysisOutput
  const analysis: ProtocolAnalysisOutput = {
    ...rawAnalysis,
    config:
      rawAnalysis.config ??
      ({
        protocolType: 'python',
        apiVersion: [2, 20],
      } as ProtocolAnalysisOutput['config']),
  }
  const groupedCommands =
    analysis.commandAnnotations != null &&
    analysis.commandAnnotations.length > 0
      ? getGroupedCommands(analysis)
      : []

  return (
    <div className="visualization-shell">
      <ProtocolVisualizer
        analysisOutput={analysis}
        groupedCommands={groupedCommands}
        protocolKey={record.id}
        srcFileNames={[record.filename]}
      />
    </div>
  )
}

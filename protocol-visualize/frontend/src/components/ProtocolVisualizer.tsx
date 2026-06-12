import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  FLEX_ROBOT_TYPE,
  THERMOCYCLER_MODULE_TYPE,
} from '@opentrons/shared-data'
import {
  constructInvariantContextFromAnalysis,
  getResultingTimelineFrameFromRunCommands,
} from '@opentrons/step-generation'

import { CommandSteps } from '/app/organisms/Desktop/ProtocolVisualization/CommandSteps'
import { Controls } from '/app/organisms/Desktop/ProtocolVisualization/Controls'
import { DeckView } from '/app/organisms/Desktop/ProtocolVisualization/DeckView'
import { StepDetailContainer } from '/app/organisms/Desktop/ProtocolVisualization/StepDetailContainer'
import { getProtocolDisplayName } from '/app/transformations/protocols'
import styles from '/app/organisms/Desktop/ProtocolVisualization/VisualizerContainer/visualizercontainer.module.css'

import { ProtocolCodeView } from './ProtocolCodeView'
import codeStyles from './ProtocolCodeView.module.css'

import type { MouseEvent } from 'react'
import type { CommandSourceMap } from '../api/types'
import type {
  CompletedProtocolAnalysis,
  Liquid,
  ProtocolAnalysisOutput,
  RunTimeCommand,
} from '@opentrons/shared-data'
import type { GroupedCommands } from '/app/redux/protocol-storage'
import type { InvariantContext, RobotState } from '@opentrons/step-generation'

const INITIAL_MILLISECONDS_PER_FRAME = 2000
const INITIAL_WIDTH_PX = 230
const MIN_CENTER_WIDTH_PX = 148
const MIN_LEFT_COLUMN_WIDTH_PX = 148
const MIN_RIGHT_COLUMN_WIDTH_PX = 172
const MAX_COLUMN_WIDTH_PX = 600
const GUTTER_WIDTH_PX = 16

type ResizableColumn = 'left' | 'right'

export interface ProtocolVisualizationSpotlightPayload {
  protocolKey: string
  slot: string | null
  command: RunTimeCommand
  robotState: RobotState
  invariantContext: InvariantContext
  analysis: ProtocolAnalysisOutput | CompletedProtocolAnalysis
  liquids: Liquid[]
}

interface ProtocolVisualizerProps {
  analysisOutput: ProtocolAnalysisOutput
  analysisOverride?: CompletedProtocolAnalysis | null
  groupedCommands: GroupedCommands | null
  protocolKey: string
  srcFileNames: string[]
  protocolSource?: string | null
  commandSourceMap?: CommandSourceMap | null
  onLaunchSpotlightWindow?: () => void
  onStepDetailClose?: (payload: { protocolKey: string }) => void
  onStepDetailOpen?: (
    payload: ProtocolVisualizationSpotlightPayload
  ) => void
  onStepDetailUpdate?: (
    payload: ProtocolVisualizationSpotlightPayload
  ) => void
  onViewportMetrics?: (payload: {
    windowWidth: number
    windowHeight: number
    leftColumnWidth: number
    rightColumnWidth: number
  }) => void
}

export function ProtocolVisualizer({
  analysisOutput,
  analysisOverride = null,
  groupedCommands,
  protocolKey,
  srcFileNames,
  protocolSource = null,
  commandSourceMap = null,
  onLaunchSpotlightWindow,
  onStepDetailClose,
  onStepDetailOpen,
  onStepDetailUpdate,
  onViewportMetrics,
}: ProtocolVisualizerProps): JSX.Element {
  const createdDate = new Date(analysisOutput.createdAt)
  const analysis = analysisOverride ?? analysisOutput
  const { commands, robotType, liquids } = analysis
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [milliSecondsPerFrame, setMilliSecondsPerFrame] = useState<number>(
    INITIAL_MILLISECONDS_PER_FRAME
  )
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedCommandId, setSelectedCommand] = useState<string | null>(null)
  const [rightPanelTab, setRightPanelTab] = useState<'details' | 'code'>(
    'details'
  )
  const [leftWidth, setLeftWidth] = useState<number>(INITIAL_WIDTH_PX)
  const [rightWidth, setRightWidth] = useState<number>(INITIAL_WIDTH_PX)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef<ResizableColumn | null>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const leftWidthRef = useRef<number>(leftWidth)
  const rightWidthRef = useRef<number>(rightWidth)

  useEffect(() => {
    leftWidthRef.current = leftWidth
  }, [leftWidth])

  useEffect(() => {
    rightWidthRef.current = rightWidth
  }, [rightWidth])

  const filteredCommands = useMemo(
    () =>
      commands.filter(
        command =>
          !command.commandType.includes('load') &&
          command.commandType !== 'home'
      ),
    [commands]
  )

  const selectedCommandIndex = commands.findIndex(
    command => command.id === selectedCommandId
  )
  const filteredSelectedCommandIndex = filteredCommands.findIndex(
    command => command.id === selectedCommandId
  )

  const currentCommandsSlice = commands.slice(0, selectedCommandIndex + 1)
  const invariantContextFromAnalysis = constructInvariantContextFromAnalysis(
    analysis,
    analysisOutput.config,
    createdDate
  )
  const { frame, invariantContext } = getResultingTimelineFrameFromRunCommands(
    currentCommandsSlice,
    invariantContextFromAnalysis
  )

  const { robotState } = frame
  const selectedRunTimeCommand = commands.find(
    command => command.id === selectedCommandId
  )

  const selectedSourceLocation =
    selectedCommandId != null
      ? commandSourceMap?.[selectedCommandId] ?? null
      : null

  // Lines shown in the code tab need to know which steps they generated:
  // badge counts on each statement's first line, and a reverse lookup so
  // clicking a line selects the first step it produced.
  const { lineCommandCounts, lineToFirstCommandId } = useMemo(() => {
    const counts = new Map<number, number>()
    const firstCommandId = new Map<number, string>()
    if (commandSourceMap != null) {
      for (const command of filteredCommands) {
        const location = commandSourceMap[command.id]
        if (location == null) continue
        counts.set(
          location.startLine,
          (counts.get(location.startLine) ?? 0) + 1
        )
        for (
          let lineNumber = location.startLine;
          lineNumber <= location.endLine;
          lineNumber++
        ) {
          if (!firstCommandId.has(lineNumber)) {
            firstCommandId.set(lineNumber, command.id)
          }
        }
      }
    }
    return { lineCommandCounts: counts, lineToFirstCommandId: firstCommandId }
  }, [commandSourceMap, filteredCommands])

  const handleCodeLineClick = useCallback(
    (lineNumber: number): void => {
      const commandId = lineToFirstCommandId.get(lineNumber)
      if (commandId != null) {
        setIsPlaying(false)
        setSelectedCommand(commandId)
      }
    },
    [lineToFirstCommandId]
  )

  useEffect(() => {
    if (selectedCommandId != null) return
    const initialId = filteredCommands[0]?.id ?? commands[0]?.id ?? null
    setSelectedCommand(initialId)
  }, [selectedCommandId, filteredCommands, commands])

  useEffect(() => {
    if (!isPlaying || filteredCommands.length === 0) return

    const intervalId = setInterval(() => {
      setSelectedCommand(prevId => {
        const currentIndex = filteredCommands.findIndex(
          cmd => cmd.id === prevId
        )
        const nextIndex =
          currentIndex >= 0 && currentIndex < filteredCommands.length - 1
            ? currentIndex + 1
            : 0

        return filteredCommands[nextIndex]?.id ?? null
      })
    }, milliSecondsPerFrame)

    return () => {
      clearInterval(intervalId)
    }
  }, [isPlaying, filteredCommands, milliSecondsPerFrame])

  useEffect(() => {
    if (
      selectedCommandId == null ||
      selectedSlot == null ||
      selectedRunTimeCommand == null
    ) {
      return
    }

    onStepDetailUpdate?.({
      protocolKey,
      slot: selectedSlot,
      command: selectedRunTimeCommand,
      robotState,
      invariantContext,
      analysis,
      liquids,
    })
  }, [
    analysis,
    commands,
    invariantContext,
    liquids,
    onStepDetailUpdate,
    protocolKey,
    robotState,
    selectedCommandId,
    selectedRunTimeCommand,
    selectedSlot,
  ])

  const isThermocyclerAttached = Object.keys(robotState.modules).some(
    id => invariantContext.moduleEntities[id].type === THERMOCYCLER_MODULE_TYPE
  )

  const protocolDisplayName = getProtocolDisplayName(
    protocolKey,
    srcFileNames,
    analysisOutput
  )
  const clamp = (n: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, n))

  let percentComplete = 0
  if (filteredSelectedCommandIndex == null) {
    percentComplete = 0
  } else if (filteredCommands.length <= 1) {
    percentComplete = 100
  } else {
    percentComplete = clamp(
      (filteredSelectedCommandIndex / (filteredCommands.length - 1)) * 100,
      0,
      100
    )
  }

  const thermocyclerSlots = ['A1', '8', '10', '11']

  useEffect(() => {
    if (
      isThermocyclerAttached &&
      selectedSlot != null &&
      thermocyclerSlots.includes(selectedSlot)
    ) {
      setSelectedSlot(robotType === FLEX_ROBOT_TYPE ? 'B1' : '7')
    }
  }, [isThermocyclerAttached, robotType, selectedSlot])

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (resizingRef.current === null) return

    const containerWidth = containerRef.current?.clientWidth ?? 0
    if (containerWidth === 0) return

    const deltaX = e.clientX - startXRef.current

    if (resizingRef.current === 'left') {
      const newWidth = startWidthRef.current + deltaX
      const centerWidth =
        containerWidth - newWidth - rightWidthRef.current - 2 * GUTTER_WIDTH_PX

      if (
        newWidth >= MIN_LEFT_COLUMN_WIDTH_PX &&
        newWidth <= MAX_COLUMN_WIDTH_PX &&
        centerWidth >= MIN_CENTER_WIDTH_PX
      ) {
        setLeftWidth(newWidth)
      }
    } else {
      const newWidth = startWidthRef.current - deltaX
      const centerWidth =
        containerWidth - leftWidthRef.current - newWidth - 2 * GUTTER_WIDTH_PX

      if (
        newWidth >= MIN_RIGHT_COLUMN_WIDTH_PX &&
        newWidth <= MAX_COLUMN_WIDTH_PX &&
        centerWidth >= MIN_CENTER_WIDTH_PX
      ) {
        setRightWidth(newWidth)
      }
    }
  }, [])

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false)
    resizingRef.current = null
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  const handleMouseMoveRef = useRef(handleMouseMove)
  const handleMouseUpRef = useRef(handleMouseUp)

  useEffect(() => {
    handleMouseMoveRef.current = handleMouseMove
    handleMouseUpRef.current = handleMouseUp
  }, [handleMouseMove, handleMouseUp])

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveRef.current)
      window.removeEventListener('mouseup', handleMouseUpRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      onStepDetailClose?.({ protocolKey })
    }
  }, [onStepDetailClose, protocolKey])

  useEffect(() => {
    return () => {
      onViewportMetrics?.({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        leftColumnWidth: leftWidthRef.current,
        rightColumnWidth: rightWidthRef.current,
      })
    }
  }, [onViewportMetrics])

  const handleMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    column: ResizableColumn
  ): void => {
    e.preventDefault()
    setIsDragging(true)
    resizingRef.current = column
    startXRef.current = e.clientX
    startWidthRef.current = column === 'left' ? leftWidth : rightWidth

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div ref={containerRef} className={styles.layout_container}>
      <div className={styles.left_column} style={{ width: `${leftWidth}px` }}>
        <CommandSteps
          analysis={analysis}
          currentCommandIndex={filteredSelectedCommandIndex}
          groupedCommands={groupedCommands}
          setSelectedCommand={setSelectedCommand}
          percentComplete={percentComplete}
          handlePause={() => {
            setIsPlaying(false)
          }}
        />
      </div>
      <div
        className={`${styles.gutter} ${isDragging ? styles.grabbing : ''}`}
        onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
          handleMouseDown(e, 'left')
        }}
      />
      <div className={styles.center_column}>
        <Controls
          protocolName={protocolDisplayName}
          numErrors={analysis.errors.length}
          numCommandLength={filteredCommands.length}
          currentCommandIndex={filteredSelectedCommandIndex}
          setSelectedCommand={setSelectedCommand}
          handlePlayPause={() => {
            setIsPlaying(prev => !prev)
          }}
          isPlaying={isPlaying}
          commands={filteredCommands}
          groupedCommands={groupedCommands}
          milliSecondsPerFrame={milliSecondsPerFrame}
          setMilliSecondsPerFrame={setMilliSecondsPerFrame}
        />
        <DeckView
          filteredCommands={filteredCommands}
          commands={analysis.commands}
          liquids={liquids}
          invariantContext={invariantContext}
          robotState={robotState}
          robotType={robotType ?? FLEX_ROBOT_TYPE}
          setSelectedSlot={slot => {
            setSelectedSlot(slot)
            if (selectedRunTimeCommand != null && typeof slot === 'string') {
              onLaunchSpotlightWindow?.()
              onStepDetailOpen?.({
                protocolKey,
                slot,
                command: selectedRunTimeCommand,
                robotState,
                invariantContext,
                analysis,
                liquids,
              })
            }
          }}
          selectedRunTimeCommand={selectedRunTimeCommand}
        />
      </div>
      <div
        className={`${styles.gutter} ${isDragging ? styles.grabbing : ''}`}
        onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
          handleMouseDown(e, 'right')
        }}
      />
      <div className={styles.right_column} style={{ width: `${rightWidth}px` }}>
        {protocolSource != null ? (
          <div className={codeStyles.code_panel}>
            <div className={codeStyles.tab_bar} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={rightPanelTab === 'details'}
                className={`${codeStyles.tab} ${
                  rightPanelTab === 'details' ? codeStyles.tab_active : ''
                }`}
                onClick={() => {
                  setRightPanelTab('details')
                }}
              >
                Step detail
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={rightPanelTab === 'code'}
                className={`${codeStyles.tab} ${
                  rightPanelTab === 'code' ? codeStyles.tab_active : ''
                }`}
                onClick={() => {
                  setRightPanelTab('code')
                }}
              >
                Code
              </button>
            </div>
            {rightPanelTab === 'code' ? (
              <>
                {commandSourceMap == null ||
                Object.keys(commandSourceMap).length === 0 ? (
                  <div className={codeStyles.code_banner}>
                    Source mapping isn&apos;t available for this analysis.
                    Re-upload the protocol to enable step highlighting.
                  </div>
                ) : selectedCommandId != null &&
                  selectedSourceLocation == null ? (
                  <div className={codeStyles.code_banner}>
                    The selected step has no matching source line.
                  </div>
                ) : null}
                <ProtocolCodeView
                  source={protocolSource}
                  selectedLocation={selectedSourceLocation}
                  lineCommandCounts={lineCommandCounts}
                  onLineClick={handleCodeLineClick}
                />
              </>
            ) : selectedRunTimeCommand != null ? (
              <StepDetailContainer
                protocolKey={protocolKey}
                commands={commands}
                robotState={robotState}
                invariantContext={invariantContext}
                currentCommand={selectedRunTimeCommand}
                liquids={liquids}
              />
            ) : null}
          </div>
        ) : selectedRunTimeCommand != null ? (
          <StepDetailContainer
            protocolKey={protocolKey}
            commands={commands}
            robotState={robotState}
            invariantContext={invariantContext}
            currentCommand={selectedRunTimeCommand}
            liquids={liquids}
          />
        ) : null}
      </div>
    </div>
  )
}

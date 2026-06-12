import { useEffect, useState } from 'react'

import { getProtocolSource } from '../api/client'
import { ProtocolCodeView } from './ProtocolCodeView'
import styles from './ProtocolCodeView.module.css'

import type { ProtocolRecord } from '../api/types'

function getErrorLines(record: ProtocolRecord): string[] {
  return record.errorSummary?.errors ?? []
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Recursively collect every string stored under a "traceback" key. */
function collectTracebacks(value: unknown, tracebacks: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectTracebacks(item, tracebacks)
  } else if (value != null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'traceback' && typeof child === 'string') {
        tracebacks.push(child)
      } else {
        collectTracebacks(child, tracebacks)
      }
    }
  }
}

interface ErrorLocation {
  startLine: number
  endLine: number
}

function findErrorLocation(record: ProtocolRecord): ErrorLocation | null {
  const analysis = record.analysis as Record<string, unknown>

  // Preferred: the failed command's recorded source statement.
  const commands = Array.isArray(analysis.commands) ? analysis.commands : []
  for (const command of commands) {
    if (
      command != null &&
      typeof command === 'object' &&
      (command as { status?: string }).status === 'failed'
    ) {
      const location =
        record.commandSourceMap?.[(command as { id: string }).id]
      if (location != null) return location
    }
  }

  // Fallback: parse Python tracebacks reported by the analyzer for the
  // deepest frame inside the protocol file (covers errors raised between
  // commands, e.g. a plain Python exception).
  const tracebacks: string[] = []
  collectTracebacks(analysis.errors, tracebacks)
  const linePattern = new RegExp(
    `File "[^"]*${escapeRegExp(record.filename)}", line (\\d+)`,
    'g'
  )
  let lastLine: number | null = null
  for (const traceback of tracebacks) {
    for (const match of traceback.matchAll(linePattern)) {
      lastLine = Number(match[1])
    }
  }
  return lastLine != null ? { startLine: lastLine, endLine: lastLine } : null
}

export function AnalysisErrorView({
  record,
}: {
  record: ProtocolRecord
}): JSX.Element {
  const [protocolSource, setProtocolSource] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getProtocolSource(record.id)
      .then(source => {
        if (!cancelled) setProtocolSource(source)
      })
      .catch(() => {
        if (!cancelled) setProtocolSource(null)
      })
    return () => {
      cancelled = true
    }
  }, [record.id])

  const errorLocation =
    protocolSource != null ? findErrorLocation(record) : null

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Analysis failed</p>
          <h2>{record.filename}</h2>
        </div>
        <p className="muted">
          The protocol source was saved, but the analyzer returned an error
          payload instead of a visualization-ready analysis.
        </p>
      </div>
      <div className="error-block">
        <p className="error-text">
          {record.errorSummary?.message ?? 'Protocol analysis failed.'}
        </p>
        {record.errorSummary?.status_code != null ? (
          <p className="muted">Status code: {record.errorSummary.status_code}</p>
        ) : null}
        {getErrorLines(record).length > 0 ? (
          <ul className="error-list">
            {getErrorLines(record).map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {protocolSource != null ? (
        <div className={styles.error_code_wrapper}>
          {errorLocation == null ? (
            <div className={styles.code_banner}>
              The failure couldn&apos;t be traced to a specific source line.
            </div>
          ) : null}
          <ProtocolCodeView
            source={protocolSource}
            errorLocation={errorLocation}
          />
        </div>
      ) : null}
    </section>
  )
}

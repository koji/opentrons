import type { ProtocolRecord } from '../api/types'

function getErrorLines(record: ProtocolRecord): string[] {
  return record.errorSummary?.errors ?? []
}

export function AnalysisErrorView({
  record,
}: {
  record: ProtocolRecord
}): JSX.Element {
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
    </section>
  )
}

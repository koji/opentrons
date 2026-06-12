import { useNavigate } from 'react-router-dom'

import type { ProtocolRecord } from '../api/types'

interface ProtocolListProps {
  records: ProtocolRecord[]
  deletingId?: string | null
  onDelete: (record: ProtocolRecord) => void
}

function getDisplayName(record: ProtocolRecord): string {
  if (
    record.analysisStatus === 'completed' &&
    'metadata' in record.analysis &&
    record.analysis.metadata != null &&
    typeof record.analysis.metadata === 'object' &&
    'protocolName' in record.analysis.metadata &&
    typeof record.analysis.metadata.protocolName === 'string'
  ) {
    return record.analysis.metadata.protocolName
  }
  return record.filename
}

function shouldShowFilename(record: ProtocolRecord): boolean {
  return getDisplayName(record) !== record.filename
}

function getAuthor(record: ProtocolRecord): string {
  return record.author ?? 'Unknown'
}

function getApiVersion(record: ProtocolRecord): string {
  return record.apiLevel ?? 'Unknown'
}

function formatRobotType(robotType: ProtocolRecord['robotType']): string {
  if (robotType === 'flex') return 'Flex'
  if (robotType === 'ot2') return 'OT-2'
  return 'Unknown'
}

export function ProtocolList({
  records,
  deletingId = null,
  onDelete,
}: ProtocolListProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Saved protocols</p>
          <h2>Recent uploads</h2>
        </div>
        <p className="muted">
          Saved protocol source and analysis are kept locally in the backend
          storage directory.
        </p>
      </div>
      {records.length === 0 ? (
        <div className="empty-state">
          <h3>No protocols yet</h3>
          <p>Upload your first protocol to populate the list.</p>
        </div>
      ) : (
        <div className="protocol-list">
          {records.map(record => (
            <article
              className="protocol-card"
              key={record.id}
              onClick={() => {
                navigate(`/protocols/${record.id}`)
              }}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigate(`/protocols/${record.id}`)
                }
              }}
              role="link"
              tabIndex={0}
            >
              <div className="protocol-card__top">
                <div>
                  <p className="protocol-card__title">{getDisplayName(record)}</p>
                  {shouldShowFilename(record) ? (
                    <p className="muted protocol-card__filename">{record.filename}</p>
                  ) : null}
                </div>
                <div className="protocol-card__actions">
                  <span
                    className={`status-pill ${
                      record.analysisStatus === 'completed'
                        ? 'status-pill--ok'
                        : 'status-pill--failed'
                    }`}
                  >
                    {record.analysisStatus}
                  </span>
                  <button
                    className="button button--secondary button--danger"
                    disabled={deletingId === record.id}
                    onClick={event => {
                      event.stopPropagation()
                      onDelete(record)
                    }}
                    type="button"
                  >
                    {deletingId === record.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              <dl className="protocol-meta">
                <div>
                  <dt>Uploaded</dt>
                  <dd>{new Date(record.uploadedAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Robot</dt>
                  <dd>{formatRobotType(record.robotType)}</dd>
                </div>
                <div>
                  <dt>Author</dt>
                  <dd>{getAuthor(record)}</dd>
                </div>
                <div>
                  <dt>API version</dt>
                  <dd>{getApiVersion(record)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

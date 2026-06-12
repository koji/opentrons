import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getProtocol } from '../api/client'
import { AnalysisErrorView } from '../components/AnalysisErrorView'
import { LoadingView } from '../components/LoadingView'
import { VisualizationPanel } from '../components/VisualizationPanel'

import type { ProtocolRecord } from '../api/types'

export function ProtocolPage(): JSX.Element {
  const { protocolId } = useParams<{ protocolId: string }>()
  const [record, setRecord] = useState<ProtocolRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (protocolId == null) return
    setIsLoading(true)
    void getProtocol(protocolId)
      .then(setRecord)
      .catch((e: Error) => {
        setError(e.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [protocolId])

  return (
    <main className="app-shell app-shell--wide detail-page">
      <div className="detail-header">
        <Link className="back-link" to="/">
          Back to uploads
        </Link>
      </div>
      {error != null ? <p className="error-banner">{error}</p> : null}
      {isLoading ? (
        <LoadingView label="Loading protocol analysis..." />
      ) : record == null ? (
        <div className="panel">
          <p>Protocol not found.</p>
        </div>
      ) : record.analysisStatus === 'failed' ? (
        <AnalysisErrorView record={record} />
      ) : (
        <VisualizationPanel record={record} />
      )}
    </main>
  )
}

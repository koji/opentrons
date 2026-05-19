import { useEffect, useState } from 'react'

import { deleteProtocol, listProtocols, uploadProtocol } from '../api/client'
import { LoadingView } from '../components/LoadingView'
import { ProtocolList } from '../components/ProtocolList'
import { UploadProtocolForm } from '../components/UploadProtocolForm'

import type { ProtocolRecord } from '../api/types'

export function HomePage(): JSX.Element {
  const [records, setRecords] = useState<ProtocolRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listProtocols()
      .then(setRecords)
      .catch((e: Error) => {
        setError(e.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleUpload = async (file: File): Promise<void> => {
    setIsUploading(true)
    setError(null)
    try {
      const record = await uploadProtocol(file)
      setRecords(current => [
        record,
        ...current.filter(item => item.id !== record.id),
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (record: ProtocolRecord): Promise<void> => {
    const confirmed = window.confirm(
      `Delete "${record.filename}" and its saved analysis?`
    )
    if (!confirmed) return

    setDeletingId(record.id)
    setError(null)
    try {
      await deleteProtocol(record.id)
      setRecords(current => current.filter(item => item.id !== record.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        {/*<h1>Upload, analyze, and inspect protocols in one place.</h1>*/}
        <p className="hero__copy">
          This standalone app stores uploaded Python protocols locally, requests
          analysis from the bundled Opentrons analyzer service, and reuses the
          existing Protocol Visualization UI for deck playback.
        </p>
      </header>

      <UploadProtocolForm isUploading={isUploading} onUpload={handleUpload} />
      {error != null ? <p className="error-banner">{error}</p> : null}
      {isLoading ? (
        <LoadingView label="Loading saved protocols..." />
      ) : (
        <ProtocolList
          records={records}
          deletingId={deletingId}
          onDelete={record => {
            void handleDelete(record)
          }}
        />
      )}
    </main>
  )
}

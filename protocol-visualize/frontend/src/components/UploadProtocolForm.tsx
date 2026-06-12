import { useRef, useState } from 'react'

import type { DragEvent } from 'react'

interface UploadProtocolFormProps {
  isUploading: boolean
  onUpload: (file: File) => Promise<void>
}

export function UploadProtocolForm({
  isUploading,
  onUpload,
}: UploadProtocolFormProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const validateFile = (file: File | null): File | null => {
    if (file == null) {
      setError('Choose a .py protocol file before uploading.')
      return null
    }
    if (!file.name.endsWith('.py')) {
      setError('Only .py protocol files are supported.')
      return null
    }
    setError(null)
    return file
  }

  const uploadFile = async (file: File | null): Promise<void> => {
    const validFile = validateFile(file)
    if (validFile == null) return
    await onUpload(validFile)
    if (inputRef.current != null) {
      inputRef.current.value = ''
    }
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    if (isUploading) return
    const file = event.dataTransfer.files?.[0] ?? null
    void uploadFile(file)
  }

  const handleFileSelection = (): void => {
    if (isUploading) return
    void uploadFile(inputRef.current?.files?.[0] ?? null)
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Upload</p>
          <h2>Analyze a protocol</h2>
        </div>
        <p className="muted">
          Upload a Python protocol to run analysis immediately. Open the saved
          visualization from the protocol card below.
        </p>
      </div>
      <div className="upload-panel">
        <label
          className={`drop-zone ${isDragActive ? 'drop-zone--active' : ''} ${
            isUploading ? 'drop-zone--disabled' : ''
          }`}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            className="drop-zone__input"
            type="file"
            accept=".py,text/x-python"
            onChange={handleFileSelection}
          />
          <span className="drop-zone__title">
            Drag and drop a protocol here
          </span>
          <span className="drop-zone__copy">
            Or click to choose a Python protocol file and start analysis immediately.
          </span>
        </label>
      </div>
      {error != null ? <p className="error-text">{error}</p> : null}
    </section>
  )
}

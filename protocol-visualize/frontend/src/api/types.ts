import type { ProtocolAnalysisOutput } from '@opentrons/shared-data'

export interface ErrorSummary {
  message: string
  status_code?: number | null
  errors: string[]
}

export interface FailedAnalysisPayload {
  detail?: string
  message?: string
  errors?: Array<{ detail?: string } | string>
  [key: string]: unknown
}

export interface ProtocolRecord {
  id: string
  filename: string
  uploadedAt: string
  updatedAt: string
  analysisStatus: 'completed' | 'failed'
  robotType: 'ot2' | 'flex' | null
  author: string | null
  apiLevel: string | null
  analysis: ProtocolAnalysisOutput | FailedAnalysisPayload
  errorSummary: ErrorSummary | null
}

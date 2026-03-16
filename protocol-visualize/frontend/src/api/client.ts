import type { ProtocolRecord } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  /\/$/,
  ''
) ?? 'http://127.0.0.1:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)
  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ detail: `Request failed with status ${response.status}` }))
    throw new Error(payload.detail ?? 'Request failed.')
  }
  return (await response.json()) as T
}

export function listProtocols(): Promise<ProtocolRecord[]> {
  return request<ProtocolRecord[]>('/protocols')
}

export function getProtocol(protocolId: string): Promise<ProtocolRecord> {
  return request<ProtocolRecord>(`/protocols/${protocolId}`)
}

export function uploadProtocol(file: File): Promise<ProtocolRecord> {
  const formData = new FormData()
  formData.append('file', file)
  return request<ProtocolRecord>('/protocols', {
    method: 'POST',
    body: formData,
  })
}

export async function deleteProtocol(protocolId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/protocols/${protocolId}`, {
    method: 'DELETE',
  }).then(async response => {
    if (!response.ok) {
      const payload = await response
        .json()
        .catch(() => ({ detail: `Request failed with status ${response.status}` }))
      throw new Error(payload.detail ?? 'Delete failed.')
    }
  })
}

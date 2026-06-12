import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import { ProtocolPage } from './ProtocolPage'

vi.mock('../api/client', () => ({
  getProtocol: vi.fn(),
  // Reject so views fall back to rendering without the code editor.
  getProtocolSource: vi.fn(() => Promise.reject(new Error('source unavailable'))),
}))

vi.mock('../components/VisualizationPanel', () => ({
  VisualizationPanel: () => <div>visualization panel</div>,
}))

import { getProtocol } from '../api/client'

describe('ProtocolPage', () => {
  it('renders failed analysis state', async () => {
    vi.mocked(getProtocol).mockResolvedValue({
      id: 'protocol-1',
      filename: 'broken.py',
      uploadedAt: '2026-03-15T12:00:00Z',
      updatedAt: '2026-03-15T12:00:00Z',
      analysisStatus: 'failed',
      robotType: 'ot2',
      analysis: { detail: 'Syntax error' },
      errorSummary: {
        message: 'Syntax error',
        status_code: 422,
        errors: ['Unexpected indent'],
      },
    } as any)

    render(
      <MemoryRouter initialEntries={['/protocols/protocol-1']}>
        <Routes>
          <Route path="/protocols/:protocolId" element={<ProtocolPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Analysis failed')).toBeInTheDocument()
    })
    expect(screen.getByText('Unexpected indent')).toBeInTheDocument()
  })

  it('renders visualization for completed analysis', async () => {
    vi.mocked(getProtocol).mockResolvedValue({
      id: 'protocol-2',
      filename: 'ok.py',
      uploadedAt: '2026-03-15T12:00:00Z',
      updatedAt: '2026-03-15T12:00:00Z',
      analysisStatus: 'completed',
      robotType: 'flex',
      analysis: {
        commands: [],
        errors: [],
        metadata: { protocolName: 'Good Protocol' },
        robotType: 'Flex',
        createdAt: '2026-03-15T12:00:00Z',
        config: { protocolType: 'python', apiVersion: [2, 20] },
        liquids: [],
        commandAnnotations: [],
      },
      errorSummary: null,
    } as any)

    render(
      <MemoryRouter initialEntries={['/protocols/protocol-2']}>
        <Routes>
          <Route path="/protocols/:protocolId" element={<ProtocolPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('visualization panel')).toBeInTheDocument()
    })
  })
})

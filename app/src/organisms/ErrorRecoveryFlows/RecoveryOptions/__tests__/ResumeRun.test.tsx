import * as React from 'react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'

import { renderWithProviders } from '../../../../__testing-utils__'
import { i18n } from '../../../../i18n'
import { ResumeRun } from '../ResumeRun'
import { RECOVERY_MAP, ERROR_KINDS } from '../../constants'

import type { Mock } from 'vitest'

const render = (props: React.ComponentProps<typeof ResumeRun>) => {
  return renderWithProviders(<ResumeRun {...props} />, {
    i18nInstance: i18n,
  })[0]
}

describe('RecoveryFooterButtons', () => {
  const { RESUME, ROBOT_RETRYING_COMMAND } = RECOVERY_MAP
  let props: React.ComponentProps<typeof ResumeRun>
  let mockGoBackPrevStep: Mock

  beforeEach(() => {
    mockGoBackPrevStep = vi.fn()
    const mockRouteUpdateActions = { goBackPrevStep: mockGoBackPrevStep } as any

    props = {
      isOnDevice: true,
      recoveryCommands: {} as any,
      failedCommand: {} as any,
      errorKind: ERROR_KINDS.GENERAL_ERROR,
      routeUpdateActions: mockRouteUpdateActions,
      recoveryMap: {
        route: RESUME.ROUTE,
        step: RESUME.STEPS.CONFIRM_RESUME,
      },
    }
  })

  it('renders appropriate copy and click behavior', async () => {
    render(props)

    screen.getByText('Are you sure you want to resume?')
    screen.queryByText(
      'The run will resume from the point at which the error occurred.'
    )

    const secondaryBtn = screen.getByRole('button', { name: 'Go back' })

    fireEvent.click(secondaryBtn)

    expect(mockGoBackPrevStep).toHaveBeenCalled()
  })

  it('should call commands in the correct order for the primaryOnClick callback', async () => {
    const setRobotInMotionMock = vi.fn(() => Promise.resolve())
    const retryFailedCommandMock = vi.fn(() => Promise.resolve())
    const resumeRunMock = vi.fn()

    const mockRecoveryCommands = {
      retryFailedCommand: retryFailedCommandMock,
      resumeRun: resumeRunMock,
    } as any

    const mockRouteUpdateActions = {
      setRobotInMotion: setRobotInMotionMock,
    } as any

    render({
      ...props,
      recoveryCommands: mockRecoveryCommands,
      routeUpdateActions: mockRouteUpdateActions,
    })

    const primaryBtn = screen.getByRole('button', { name: 'Confirm' })
    fireEvent.click(primaryBtn)

    await waitFor(() => {
      expect(setRobotInMotionMock).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(setRobotInMotionMock).toHaveBeenCalledWith(
        true,
        ROBOT_RETRYING_COMMAND.ROUTE
      )
    })
    await waitFor(() => {
      expect(retryFailedCommandMock).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(resumeRunMock).toHaveBeenCalledTimes(1)
    })

    expect(setRobotInMotionMock.mock.invocationCallOrder[0]).toBeLessThan(
      retryFailedCommandMock.mock.invocationCallOrder[0]
    )

    await waitFor(() => {
      expect(retryFailedCommandMock.mock.invocationCallOrder[0]).toBeLessThan(
        resumeRunMock.mock.invocationCallOrder[0]
      )
    })
  })
})

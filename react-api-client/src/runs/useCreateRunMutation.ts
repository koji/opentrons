import {
  HostConfig,
  Run,
  createRun,
  CreateRunData,
} from '@opentrons/api-client'
import { UseMutationResult, useMutation, UseMutateFunction } from 'react-query'
import { useHost } from '../api'

export type UseCreateRunMutationResult = UseMutationResult<
  Run,
  Error,
  void
> & {
  createRun: UseMutateFunction<Run, unknown, void>
}

export function useCreateRunMutation(
  createSessionData: CreateRunData
): UseCreateRunMutationResult {
  const host = useHost()
  const mutation = useMutation<Run, Error>(['run', host], () =>
    createRun(host as HostConfig, createSessionData)
      .then(response => response.data)
      .catch((e: Error) => {
        throw e
      })
  )
  return {
    ...mutation,
    createRun: mutation.mutate,
  }
}

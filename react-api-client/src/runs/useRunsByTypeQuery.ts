import { getRuns, HostConfig, RunData, RunType } from '@opentrons/api-client'
import { UseQueryResult, useQuery } from 'react-query'
import { useHost } from '../api'

export function useRunsByTypeQuery(args: {
  runType: RunType
}): UseQueryResult<RunData[], Error> {
  const { runType } = args
  const host = useHost()
  const query = useQuery<RunData[], Error>(
    ['session', runType, host],
    () =>
      getRuns(host as HostConfig)
        .then(response => {
          return response.data.data.filter(run => run.sessionType === runType)
        })
        .catch((e: Error) => {
          throw e
        }),
    { enabled: host !== null, refetchInterval: 5000 }
  )

  return query
}

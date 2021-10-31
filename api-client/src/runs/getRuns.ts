import { GET, request } from '../request'

import type { ResponsePromise } from '../request'
import type { HostConfig } from '../types'
import type { Runs, RunType } from './types'

export function getRuns(
  config: HostConfig,
  params?: { run_type: RunType }
): ResponsePromise<Runs> {
  return request<Runs>(GET, `/runs`, null, config, params)
}

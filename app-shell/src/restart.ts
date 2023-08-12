import { app } from 'electron'
import { APP_RESTART } from '@opentrons/app/src/redux/shell/actions'

import { createLogger } from './log'

import type { Action, Logger } from './types'
let _log: Logger | undefined
const log = (): Logger => _log ?? (_log = createLogger('config'))

export function registerAppRestart(): (action: Action) => unknown {
  return function handleAction(action: Action) {
    switch (action.type) {
      case APP_RESTART:
        app.relaunch()
        app.quit()
        break
    }
  }
}

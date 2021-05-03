import { removePairs } from './removePairs'
import type { AspDispAirgapParams } from '@opentrons/shared-data/protocol/types/schemaV3'
import type { Command } from '@opentrons/shared-data/protocol/types/schemaV6'

const _isEqualMix = (
  a: AspDispAirgapParams,
  b: AspDispAirgapParams
): boolean => {
  const compareParams = ['pipette', 'volume', 'labware', 'well']
      // @ts-expect-error(SA, 2021-05-03): can's index AspDispAirgapParams with string
  return compareParams.every(param => a[param] === b[param])
}

export const _stripNoOpMixCommands = (
  commands: Command[]
): Command[] =>
  removePairs<Command>(
    commands,
    (a, b) =>
      a.command === 'aspirate' &&
      b.command === 'dispense' &&
      _isEqualMix(a.params, b.params)
  )
// This is an optimization to avoid unneeded computation during timeline generation.
// Remove groups of commands from the array if together they will have no effect on the state
// (NOTE: the only one here right now is strip mix commands, but we may add
// additional transformations besides mix commands to stripNoOpCommands later on)
export const stripNoOpCommands = (commands: Command[]): Command[] =>
  _stripNoOpMixCommands(commands)
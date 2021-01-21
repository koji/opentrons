// @flow

import type { LabwareLocation, LabwareDefinition } from './labware-types'

// generic models

export type PendingCommand<CommandT: string, ReqT> = {|
  command_type: CommandT,
  command_id: string,
  created_at: string,
  request: ReqT,
|}

export type RunningCommand<CommandT: string, ReqT> = {|
  command_type: CommandT,
  command_id: string,
  created_at: string,
  started_at: string,
  request: ReqT,
|}

export type CompletedCommand<CommandT: string, ReqT, ResT> = {|
  command_type: CommandT,
  command_id: string,
  created_at: string,
  started_at: string,
  completed_at: string,
  request: ReqT,
  result: ResT,
|}

export type FailedCommand<CommandT: string, ReqT> = {|
  command_type: CommandT,
  command_id: string,
  created_at: string,
  started_at: string,
  failed_at: string,
  request: ReqT,
  error: mixed,
|}

export type GenericCommand<CommandT: string, ReqT, ResT> =
  | PendingCommand<CommandT, ReqT>
  | RunningCommand<CommandT, ReqT>
  | CompletedCommand<CommandT, ReqT, ResT>
  | FailedCommand<CommandT, ReqT>

// load labware

export type LoadLabwareCommandType = 'loadLabware'

export type LoadLabwareRequest = {|
  location: LabwareLocation,
  loadName: string,
  namespace: string,
  version: number,
|}

export type LoadLabwareResult = {|
  labwareId: string,
  definition: LabwareDefinition,
  calibration: [number, number, number],
|}

export type LoadLabwareCommand = GenericCommand<
  LoadLabwareCommandType,
  LoadLabwareRequest,
  LoadLabwareResult
>

// move to well

export type MoveToWellCommandType = 'moveToWell'

export type MoveToWellRequest = {|
  pipetteId: string,
  labwareId: string,
  wellName: string,
|}

export type MoveToWellResult = {||}

export type MoveToWellCommand = GenericCommand<
  MoveToWellCommandType,
  MoveToWellRequest,
  MoveToWellResult
>

// all commands union
// export type Command = LoadLabwareCommand | MoveToWellCommand

export type Command = {
  commandId: string,
  request: MoveToWellRequest | LoadLabwareRequest,
  result: MoveToWellResult | LoadLabwareResult,
  ...
}

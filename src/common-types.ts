export type TExecuteTurn = (column: TColumn) => void
export type THandler = (playerId: number, state: IGameState, executeTurn: TExecuteTurn, roomId: string) => void

export enum ECoin {
  NONE = 0,
  RED = 1,
  YELLOW = 2,
}

export enum EPlayerRole {
  NONE = 0,
  RED = 1,
  YELLOW = 2,
  OBSERVER = 3,
}

export type IPlayer<P extends {} = {}> = {
  role: EPlayerRole
  isBot?: boolean
  handler: THandler
} & P

export interface IRoom<P extends {} = {}> {
  id: string
  state: IGameState
  players: IPlayer<P>[]
  broadcast(message: string | any[], excludedPlayer?: IPlayer): void
}

export interface IJoinOptions {
  roomId?: string
  filter?: 'waiting' | 'full' | 'all'
  waitTimeout?: number
}
export interface IServer {
  hostGame(roomId: string): IRoom
  joinGame(handler: THandler, options?: IJoinOptions): Promise<IPlayer | undefined>
  leaveGame(handler: THandler, roomId: string): Promise<void>
  getRoomIds(filter?: IJoinOptions['filter']): Promise<string[]>
  stop(): void
}

export type TBoard = ECoin[]

export interface IGameState {
  board: TBoard
  turn?: EPlayerRole
  hasEnded?: boolean
  status?: 'raceConflict' | 'invalidColumn' | 'win' | 'loose'
  lastPlayerId?: number
  lastPlayerAction?: TColumn
}

export type TRow = 0 | 1 | 2 | 3 | 4 | 5
export type TColumn = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface IInterceptOptions {
  singleGame?: boolean
  silent?: boolean
}

export const LOG_SCOPE_LOCAL_SERVER = 'server'

export const ROW_MIN = 0
export const ROW_MAX = 5
export const COLUMN_MIN = 0
export const COLUMN_MAX = 6

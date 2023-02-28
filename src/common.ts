import debug from 'debug'
import 'colors'

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
  broadcast(message: string, excludedPlayer?: IPlayer): void
}

export interface IJoinOptions {
  roomId?: string
  filter?: 'waiting' | 'full' | 'all'
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

interface IInterceptOptions {
  singleGame?: boolean
  silent?: boolean
}

export const LOG_SCOPE_LOCAL_SERVER = 'server'

const ROW_MIN = 0
const ROW_MAX = 5
const COLUMN_MIN = 0
const COLUMN_MAX = 6

const boardLogger = debug('board')

const circle = String.fromCodePoint(0x2b24)
const colors = [' ', circle.red, circle.yellow]

const createFilledArray = <T extends any>(length: number, fill: T) => Array.from({ length }, () => fill)

export const clone = <T extends {}>(obj: T) => JSON.parse(JSON.stringify(obj))

export const createNewGameState = () => ({ board: createFilledArray<ECoin>((COLUMN_MAX + 1) * (ROW_MAX + 1), ECoin.NONE) })

export const rowColumnToIndex = (row: TRow, column: TColumn) => {
  return (COLUMN_MAX + 1) * (ROW_MAX - row) + column
}

export const getBoardRow = (board: TBoard, row: TRow) => {
  const boardStart = (COLUMN_MAX + 1) * (ROW_MAX - row)
  const boardEnd = boardStart + (COLUMN_MAX + 1)
  return board.slice(boardStart, boardEnd)
}

export const getBoardColumn = (board: TBoard, column: TColumn) => {
  const line: ECoin[] = []
  for (let row = ROW_MIN; row <= ROW_MAX; row++) {
    line.push(board[rowColumnToIndex(row as TRow, column)])
  }
  return line
}

export const getBoardTopLeftDiagonal = (board: TBoard, diagonal: TRow) => {
  let row = Math.min(diagonal + 3, ROW_MAX) as TRow
  let column = Math.max(diagonal - 2, COLUMN_MIN) as TColumn
  const result: ECoin[] = []
  while (row >= ROW_MIN && column <= COLUMN_MAX) {
    result.push(board[rowColumnToIndex(row, column)])
    row--
    column++
  }
  return result
}

export const getBoardBottomLeftDiagonal = (board: TBoard, diagonal: TRow) => {
  let row = Math.max(2 - diagonal, ROW_MIN) as TRow
  let column = Math.max(diagonal - 2, COLUMN_MIN) as TColumn
  const result: ECoin[] = []
  while (row <= ROW_MAX && column <= COLUMN_MAX) {
    result.push(board[rowColumnToIndex(row, column)])
    row++
    column++
  }
  return result
}

export const checkLineCombo = (line: ECoin[], coin: ECoin) => {
  let maxCombo = 0
  let combo = 0
  const setMaxCombo = () => {
    maxCombo = Math.max(maxCombo, combo)
  }
  const checkFn = (el: ECoin) => {
    if (el === coin) {
      combo++
    } else {
      setMaxCombo()
      combo = 0
    }
  }
  line.forEach(checkFn)
  setMaxCombo()
  return maxCombo
}

export const getFreeBoardRowForColumn = (board: TBoard, column: TColumn) => {
  return getBoardColumn(board, column).indexOf(ECoin.NONE) as TRow | -1
}

export const insertCoinInColumn = (board: TBoard, column: TColumn, coin: ECoin) => {
  const row = getFreeBoardRowForColumn(board, column)
  if (row === -1) {
    return false
  }
  board[rowColumnToIndex(row, column)] = coin
  return true
}

export const checkBoardForWinner = (board: TBoard, coin: ECoin) => {
  for (let row = ROW_MIN; row <= ROW_MAX; row++) {
    let combo = checkLineCombo(getBoardRow(board, row as TRow), coin)
    if (combo >= 4) {
      return true
    }
  }
  for (let column = COLUMN_MIN; column <= COLUMN_MAX; column++) {
    let combo = checkLineCombo(getBoardColumn(board, column as TRow), coin)
    if (combo >= 4) {
      return true
    }
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    let combo = checkLineCombo(getBoardTopLeftDiagonal(board, diagonal as TRow), coin)
    if (combo >= 4) {
      return true
    }
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    let combo = checkLineCombo(getBoardBottomLeftDiagonal(board, diagonal as TRow), coin)
    if (combo >= 4) {
      return true
    }
  }
  return false
}

export const checkBoardForTie = (board: TBoard) => {
  return board.every((el) => el !== ECoin.NONE)
}

export const checkboardForScore = (board: TBoard, coin: number) => {
  if (checkBoardForWinner(board, 3 - coin)) {
    return 0
  }
  let combo = 0
  for (let row = ROW_MIN; row <= ROW_MAX; row++) {
    combo = Math.max(checkLineCombo(getBoardRow(board, row as TRow), coin), combo)
  }
  for (let column = COLUMN_MIN; column <= COLUMN_MAX; column++) {
    combo = Math.max(checkLineCombo(getBoardColumn(board, column as TRow), coin), combo)
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    combo = Math.max(checkLineCombo(getBoardTopLeftDiagonal(board, diagonal as TRow), coin), combo)
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    combo = Math.max(checkLineCombo(getBoardBottomLeftDiagonal(board, diagonal as TRow), coin), combo)
  }
  return combo
}

export const printCoin = (coin: ECoin) => (process.stderr.isTTY ? colors[coin] : coin)

export const printBoard = (board: TBoard, logger: (...args: any[]) => void = console.log) => {
  for (let i = ROW_MAX; i >= ROW_MIN; i--) {
    logger(
      `|${getBoardRow(board, i as TRow)
        .map((el) => printCoin(el))
        .join('|')}|`
    )
  }
  logger('')
}

export const getPlayerName = (playerRole: number) => {
  if ([EPlayerRole.RED, EPlayerRole.YELLOW].includes(playerRole)) {
    return process.stderr.isTTY ? `${printCoin(playerRole)}  player` : `player ${playerRole}`
  } else {
    return 'observer'
  }
}

// utilities
export const isPlayerRedOrYellow = (player: IPlayer) => [EPlayerRole.RED, EPlayerRole.YELLOW].includes(player.role)
export const getRedAndOrYellowPlayer = (players: IPlayer[]) => players.filter(isPlayerRedOrYellow)

// server wrappers
export const hostGame = <T extends {}>(server: IServer, id: string): IRoom<T> => server.hostGame(id) as IRoom<T>
export const joinGame = async <T extends {}>(server: IServer, handler: THandler, options?: IJoinOptions): Promise<IPlayer<T> | undefined> =>
  server.joinGame(handler, options) as Promise<IPlayer<T> | undefined>
export const leaveGame = async (server: IServer, handler: THandler, roomId: string) => server.leaveGame(handler, roomId)

export const intercept = (server: IServer, handler: THandler, options: IInterceptOptions = {}): THandler => {
  const { singleGame, silent } = options
  const interceptedHandler: THandler = async (playerRole, state, executeTurn, roomId) => {
    const { board, hasEnded } = state
    if (!silent) {
      printBoard(board, boardLogger)
    }
    if (hasEnded && singleGame) {
      await leaveGame(server, interceptedHandler, roomId)
      server.stop()
    }
    handler(
      playerRole,
      state,
      (column) => {
        if (hasEnded) {
          return
        }
        if (!silent) {
          insertCoinInColumn(board, column, playerRole)
          printBoard(board, boardLogger)
        }
        executeTurn(column)
      },
      roomId
    )
  }
  return interceptedHandler
}

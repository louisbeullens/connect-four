import debug from 'debug'
import {
  COLUMN_MAX,
  COLUMN_MIN,
  ECoin,
  EPlayerRole,
  IInterceptOptions,
  IJoinOptions,
  IPlayer,
  IRoom,
  IServer,
  ROW_MAX,
  ROW_MIN,
  TBoard,
  TColumn,
  THandler,
  TRow,
} from './common-types'
import 'colors'

const boardLogger = debug('board')

const circle = String.fromCodePoint(0x2b24)
const colors = [' ', circle.red, circle.yellow]

const createFilledArray = <T extends any>(length: number, fill: T) => Array.from({ length }, () => fill)

export const clone = <T extends {}>(obj: T) => JSON.parse(JSON.stringify(obj))

export const createNewGameState = () => ({ board: createFilledArray<ECoin>((COLUMN_MAX + 1) * (ROW_MAX + 1), ECoin.NONE) })

const isTTY = () => (process?.stderr?.isTTY ? true : false)

/**
 * Converts row and column to board index.
 *
 * @param {TRow} row
 * @param {TColumn} column
 * @returns {number} Index in board.
 */
export const rowColumnToIndex = (row: TRow, column: TColumn) => {
  return (COLUMN_MAX + 1) * (ROW_MAX - row) + column
}

/**
 * Get row from board.
 *
 * @param {TBoard} board
 * @param {TRow} row - 0 = bottom 5 = top.
 * @returns {ECoin[]} Part of board, direction from left to right.
 */
export const getBoardRow = (board: TBoard, row: TRow) => {
  const boardStart = (COLUMN_MAX + 1) * (ROW_MAX - row)
  const boardEnd = boardStart + (COLUMN_MAX + 1)
  return board.slice(boardStart, boardEnd)
}

/**
 * Get column from board.
 *
 * @param {TBoard} board
 * @param {TRow} row - 0 = left 6 = right.
 * @returns {ECoin[]} part of board, direction from bottom to top.
 */
export const getBoardColumn = (board: TBoard, column: TColumn) => {
  const line: ECoin[] = []
  for (let row = ROW_MIN; row <= ROW_MAX; row++) {
    line.push(board[rowColumnToIndex(row as TRow, column)])
  }
  return line
}

/**
 * Get top-left diagonal.
 * ```
 * 2 3 4 5
 * 1 2 3 4 5
 * 0 1 2 3 4 5
 *   0 1 2 3 4 5
 *     0 1 2 3 4
 *       0 1 2 3
 * ```
 *
 * @param {TBoard} board
 * @param {TRow} diagonal - See description, (number represents diagonal index).
 * @returns {ECoin[]} Part of board, direction from left to right.
 */
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

/**
 * Get bottom-left diagonal.
 * ```
 *       0 1 2 3
 *     0 1 2 3 4
 *   0 1 2 3 4 5
 * 0 1 2 3 4 5
 * 1 2 3 4 5
 * 2 3 4 5
 * ```
 *
 * @param {TBoard} board
 * @param {TRow} diagonal - See description, (number represents diagonal index).
 * @returns {ECoin[]} Part of board, direction from left to right
 */
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

/**
 * Get maximum connected length found for color in line.
 *
 * @param {ECoin[]} line
 * @param {ECoin} color - color to search for.
 * @returns {number}
 */
export const getLineCombo = (line: ECoin[], color: ECoin) => {
  let combo = 0
  let tmpCombo = 0
  const updateCombo = () => {
    if (tmpCombo > combo) {
      combo = tmpCombo
    }
    tmpCombo = 0
  }
  line.forEach((el) => {
    if (el === color) {
      tmpCombo++
      return
    } else {
      updateCombo()
    }
  })
  updateCombo()
  return combo
}

/**
 * Get first free row index or -1
 *
 * @param {TBoard} board
 * @param {TColumn} column
 * @returns {(TRow | -1)}
 */
export const getFreeBoardRowForColumn = (board: TBoard, column: TColumn) => {
  return getBoardColumn(board, column).indexOf(ECoin.NONE) as TRow | -1
}

/**
 * Inserts color in first free slot of column.
 *
 * @param {TBoard} board
 * @param {TColumn} column
 * @param {ECoin} color
 * @returns {boolean}
 */
export const insertCoinInColumn = (board: TBoard, column: TColumn, color: ECoin) => {
  const row = getFreeBoardRowForColumn(board, column)
  if (row === -1) {
    return false
  }
  board[rowColumnToIndex(row, column)] = color
  return true
}

/**
 * Returns true when color won the game, false otherwise,
 *
 * @param {TBoard} board
 * @param {ECoin} color
 * @returns {boolean}
 */
export const checkBoardForWinner = (board: TBoard, color: ECoin) => {
  for (let row = ROW_MIN; row <= ROW_MAX; row++) {
    const combo = getLineCombo(getBoardRow(board, row as TRow), color)
    if (combo >= 4) {
      return true
    }
  }
  for (let column = COLUMN_MIN; column <= COLUMN_MAX; column++) {
    const combo = getLineCombo(getBoardColumn(board, column as TRow), color)
    if (combo >= 4) {
      return true
    }
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    const combo = getLineCombo(getBoardTopLeftDiagonal(board, diagonal as TRow), color)
    if (combo >= 4) {
      return true
    }
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    const combo = getLineCombo(getBoardBottomLeftDiagonal(board, diagonal as TRow), color)
    if (combo >= 4) {
      return true
    }
  }
  return false
}

/**
 * Returns true when board is completely full, false otherwise.
 *
 * @param {TBoard} board
 * @returns {boolean}
 */
export const checkBoardForTie = (board: TBoard) => {
  return board.every((el) => el !== ECoin.NONE)
}

/**
 * Get maximum connected length found for color in board.
 * Returns 0 when other player won the game.
 *
 * @param {TBoard} board
 * @param {number} color
 * @returns {number}
 */
export const getBoardScore = (board: TBoard, color: number) => {
  const otherColor = 3 - color
  if (checkBoardForWinner(board, otherColor)) {
    return 0
  }
  let combo = 0
  for (let row = ROW_MIN; row <= ROW_MAX; row++) {
    combo = Math.max(getLineCombo(getBoardRow(board, row as TRow), color), combo)
  }
  for (let column = COLUMN_MIN; column <= COLUMN_MAX; column++) {
    combo = Math.max(getLineCombo(getBoardColumn(board, column as TRow), color), combo)
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    combo = Math.max(getLineCombo(getBoardTopLeftDiagonal(board, diagonal as TRow), color), combo)
  }
  for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
    combo = Math.max(getLineCombo(getBoardBottomLeftDiagonal(board, diagonal as TRow), color), combo)
  }
  return combo
}

/**
 * Returns coin as colored unicode circle or number.
 *
 * @param {ECoin} coin
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export const printCoin = (coin: ECoin, useColors: boolean = isTTY()) => (useColors ? colors[coin] : `${coin}`)

/**
 * Returns line as string.
 *
 * @param {ECoin[]} line
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export const printLine = (line: ECoin[], useColors = isTTY()) => `|${line.map((el) => printCoin(el, useColors)).join('|')}|`

/**
 * Prints entire board.
 *
 * @param {ECoin[]} board
 * @callback {console~log} [logger=console.log]
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export const printBoard = (board: TBoard, logger: (...args: any[]) => void = console.log, useColors = isTTY()) => {
  for (let row = ROW_MAX; row >= ROW_MIN; row--) {
    logger(printLine(getBoardRow(board, row as TRow), useColors))
  }
  logger('')
}

/**
 * Generates playerName based on role,
 *
 * @param {EPlayerRole} playerRole
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export const getPlayerName = (playerRole: EPlayerRole, useColors = isTTY()) => {
  if ([EPlayerRole.RED, EPlayerRole.YELLOW].includes(playerRole)) {
    return useColors ? `${printCoin(playerRole as unknown as ECoin)}  player` : `player ${playerRole}`
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

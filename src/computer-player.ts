import { getFreeBoardRowForColumn, insertCoinInColumn, printBoard, TColumn, THandler } from './common'

export const computerPlayer: THandler = (playerRole, { board }, executeTurn) => {
  console.clear()
  printBoard(board)
  const allowedColumns = ([0, 1, 2, 3, 4, 5, 6] as TColumn[]).filter((column) => getFreeBoardRowForColumn(board, column) !== -1)
  const column = allowedColumns[Math.floor(Math.random() * allowedColumns.length)]
  console.clear()
  insertCoinInColumn(board, column, playerRole)
  printBoard(board)
  executeTurn(column)
}

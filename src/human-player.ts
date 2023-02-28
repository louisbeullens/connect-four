import { EPlayerRole, getFreeBoardRowForColumn, insertCoinInColumn, printBoard, printCoin, TColumn, THandler, TRow } from './common'

const KEY_ENTER = new Uint8Array([13])
const KEY_ARROW_LEFT = new Uint8Array([27, 91, 68])
const KEY_ARROW_RIGHT = new Uint8Array([27, 91, 67])
const KEY_CONTROLC = new Uint8Array([3])

let abortController = new AbortController()
const selectNumber = <T extends number>(numbers: T[], onChange?: (i: T) => void): Promise<T | -1> => {
  return new Promise((resolve) => {
    abortController.abort()
    abortController = new AbortController()
    const signal = abortController.signal
    let i = Math.floor(numbers.length / 2) as T
    const { stdin } = process
    stdin.setRawMode(true)
    stdin.resume()
    onChange(numbers[i])
    const listener = (data: Buffer) => {
      if (signal.aborted) {
        stdin.removeListener('data', listener)
        return
      }
      if (Buffer.compare(data.subarray(0, KEY_CONTROLC.byteLength), KEY_CONTROLC) === 0) {
        process.exit(0)
      } else if (Buffer.compare(data.subarray(0, KEY_ENTER.byteLength), KEY_ENTER) === 0) {
        stdin.pause()
        stdin.removeListener('data', listener)
        stdin.setRawMode(false)
        resolve(numbers[i])
        return
      } else if (Buffer.compare(data.subarray(0, KEY_ARROW_LEFT.byteLength), KEY_ARROW_LEFT) === 0) {
        if (i === 0) {
          return
        }
        i--
        onChange?.(numbers[i])
      } else if (Buffer.compare(data.subarray(0, KEY_ARROW_RIGHT.byteLength), KEY_ARROW_RIGHT) === 0) {
        if (i === numbers.length - 1) {
          return
        }
        i++
        onChange?.(numbers[i])
      }
    }
    process.stdin.addListener('data', listener)
    signal.onabort = () => {
      resolve(-1)
    }
  })
}

export const humanPlayer: THandler = async (...[playerRole, { board, hasEnded }, executeTurn]) => {
  const allowedColumns = ([0, 1, 2, 3, 4, 5, 6] as TColumn[]).filter((column) => getFreeBoardRowForColumn(board, column) !== -1)
  if (playerRole > EPlayerRole.YELLOW || !allowedColumns.length || hasEnded) {
    console.clear()
    printBoard(board)
    return
  }
  const column = await selectNumber<TColumn>(allowedColumns, (i) => {
    console.clear()
    console.log(`${' '.repeat(1 + 2 * i)}${printCoin(playerRole)}`)
    printBoard(board)
  })
  if (column === -1) {
    return
  }
  insertCoinInColumn(board, column, playerRole)
  console.clear()
  printBoard(board)
  executeTurn(column)
}

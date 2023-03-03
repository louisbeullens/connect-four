# Installation

```sh
git clone https://github.com/louisbeullens/connect-four.git
cd connect-four
```

# Start Server

```sh
npm run server
```
or
```sh
yarn server
```

# Start Client

```sh
npm start -- -H -w 1
```
or
```sh
yarn start -H -w 1
```

# See available options

```sh
npm start -- --help
```
or
```sh
yarn start --help
```

# Start developing

```sh
npm run watch
```
or
```sh
yarn watch
```

# Get started
## example 'src/custom.ts'

```js
import { joinGame, getFreeBoardRowForColumn, insertCoinInColumn, printBoard, TColumn, THandler } from './client'
import { humanPlayer } from './human-player'

export const customComputerPlayer: THandler = (playerRole, { board }, executeTurn) => {
  console.clear()
  printBoard(board)
  const allowedColumns = ([0, 1, 2, 3, 4, 5, 6] as TColumn[]).filter((column) => getFreeBoardRowForColumn(board, column) !== -1)
  const column = allowedColumns[Math.floor(Math.random() * allowedColumns.length)]
  console.clear()
  insertCoinInColumn(board, column, playerRole)
  printBoard(board)
  executeTurn(column)
}

// add player that ask arrow keys for input
joinGame(LocalServer, humanPlayer)
// start playing with a server bot immediately.
joinGame(LocalServer, customComputerPlayer)
```

# see [src/index.ts](./src/index.ts) for more advanced setup

# More info [Documentation](https://louisbeullens.github.io/connect-four/)



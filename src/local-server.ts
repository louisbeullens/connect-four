import debug from 'debug'
import { v4 as uuid } from 'uuid'
import { computerPlayer } from './bot-player'
import {
  checkBoardForTie,
  checkBoardForWinner,
  clone,
  createNewGameState,
  getFreeBoardRowForColumn,
  getRedAndOrYellowPlayer,
  insertCoinInColumn,
  intercept,
  isPlayerRedOrYellow,
  printBoard,
} from './common'
import { ECoin, EPlayerRole, IGameState, IJoinOptions, IPlayer, IRoom, IServer, LOG_SCOPE_LOCAL_SERVER, TColumn, THandler } from './common-types'
import { IPlayerExtension } from './websocket-common'

const boardLogger = debug('board')
const serverLogger = debug(LOG_SCOPE_LOCAL_SERVER)

const rooms: { [roomId: string]: IRoom<IPlayerExtension> } = {}

export const printServerMessage = (message: string | any[]) => {
  if (Array.isArray(message)) {
    serverLogger(message[0], ...message.slice(1))
  } else {
    serverLogger(message)
  }
}

const getEndGameWinLooseStatusFromRoles = (playerRole: EPlayerRole, winnerRole: EPlayerRole) => {
  return playerRole === EPlayerRole.OBSERVER ? 'end' : playerRole === winnerRole ? 'win' : 'loose'
}

const getEndGameTieStatusFromRoles = (playerRole: EPlayerRole) => {
  return playerRole === EPlayerRole.OBSERVER ? 'end' : 'loose'
}

export const LocalServer: IServer = {
  hostGame(roomId: string) {
    if (roomId in rooms) {
      return rooms[roomId]
    }
    const room: IRoom = {
      id: roomId,
      state: createNewGameState(),
      players: [],
      broadcast: printServerMessage,
    }
    rooms[roomId] = room
    return room
  },
  async joinGame(this: IServer, handler: THandler, options: IJoinOptions = {}) {
    let { roomId, filter, waitTimeout } = options
    roomId = roomId ?? (await this.getRoomIds(filter))[0] ?? uuid()
    const room = (rooms[roomId] = rooms[roomId] ?? this.hostGame(roomId))

    const playerRole = room.players.find((el) => el.role === EPlayerRole.RED)
      ? room.players.find((el) => el.role === EPlayerRole.YELLOW)
        ? EPlayerRole.OBSERVER
        : EPlayerRole.YELLOW
      : EPlayerRole.RED

    const player = {
      role: playerRole,
      handler,
    }
    room.players.push(player)
    const respond = (player: IPlayer<IPlayerExtension>, state: IGameState, firstResponse = false) => {
      const executeTurn = (column: TColumn) => {
        if (player.role > EPlayerRole.YELLOW) {
          return
        }
        if (room.state.turn && room.state.turn !== player.role) {
          room.broadcast([`%P plays outside turn!`, player.role], player)
          return
        }
        const freeRowOrNegativeOne = getFreeBoardRowForColumn(room.state.board, column)
        if (freeRowOrNegativeOne === -1) {
          respond(player, { ...clone(room.state), status: 'invalidColumn' })
          room.broadcast([`%P plays an unavailable column!`, player.role], player)
          return
        }
        if (!room.state.turn) {
          room.broadcast([`%P started game!`, player.role])
        }
        insertCoinInColumn(room.state.board, column, player.role as unknown as ECoin)
        room.state.lastPlayerId = player.role
        room.state.lastPlayerAction = column
        printBoard(room.state.board, boardLogger)
        const win = checkBoardForWinner(room.state.board, player.role as unknown as ECoin)
        if (win) {
          delete room.state.turn
          room.players.forEach((el) => respond(el, { ...clone(room.state), hasEnded: true, status: getEndGameWinLooseStatusFromRoles(el.role, player.role) }))
          room.state = createNewGameState()
          setTimeout(() => room.broadcast([`%P won!`, player.role]), 10)
          setTimeout(() => {
            if (!(roomId in rooms)) {
              return
            }
            printBoard(room.state.board, boardLogger)
            room.players.forEach((el) => respond(el, clone(room.state)))
          }, 10000)
          return
        }
        const tie = checkBoardForTie(room.state.board)
        if (tie) {
          delete room.state.turn
          room.players.forEach((el) => respond(el, { ...clone(room.state), hasEnded: true, status: getEndGameTieStatusFromRoles(el.role) }))
          setTimeout(() => room.broadcast(`Nobody won!`), 10)
          room.state = createNewGameState()
          setTimeout(() => {
            if (!(roomId in rooms)) {
              return
            }
            printBoard(room.state.board, boardLogger)
            room.players.forEach((el) => respond(el, clone(room.state)))
          }, 10000)
          return
        }
        room.state.turn = 3 - player.role
        room.players.filter((el) => el.role !== player.role).forEach((el) => respond(el, clone(room.state)))
      }
      setTimeout(() => {
        if (firstResponse) {
          room.broadcast([`%P joined room ${roomId}.`, player.role])
          if (waitTimeout > 0) {
            setTimeout(async () => {
              if (getRedAndOrYellowPlayer(room.players).length === 1) {
                const bot = await this.joinGame(intercept(this, computerPlayer, { silent: true }), { roomId })
                bot.isBot = true
              }
            }, waitTimeout)
          }
        }
        player.handler(player.role, state, executeTurn, roomId)
      }, 1)
    }
    respond(player, clone(room.state), true)
    return player
  },
  async leaveGame(handler: THandler, roomId: string) {
    const room = rooms[roomId]
    if (!room) {
      return
    }
    const playerIndex = room.players.findIndex((el) => el.handler === handler)
    if (playerIndex === -1) {
      return
    }
    const player = room.players[playerIndex]
    room.players.splice(playerIndex, 1)
    const playersLength = room.players.length
    room.broadcast([`%P left room ${roomId}.`, player.role], player)
    if (isPlayerRedOrYellow(player) && !player.isBot) {
      const bot = room.players.find((el) => el.isBot)
      if (bot) {
        this.leaveGame(bot.handler, roomId)
      }
    }
    if (playersLength) {
      return
    }
    delete rooms[roomId]
    serverLogger(`Closing room ${roomId}.`)
  },
  async getRoomIds(filter = 'all') {
    switch (filter) {
      case 'all':
        return Object.keys(rooms)
      case 'waiting':
        return Object.values(rooms)
          .filter((el) => getRedAndOrYellowPlayer(el.players).length === 1)
          .map((el) => el.id)
      case 'full':
        return Object.values(rooms)
          .filter((el) => getRedAndOrYellowPlayer(el.players).length === 2)
          .map((el) => el.id)
    }
  },
  stop() {},
}

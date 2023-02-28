import debug from 'debug'
import { EventEmitter } from 'events'
import { v4 as uuid } from 'uuid'
import * as WEBSOCKET from 'websocket'
import { EPlayerRole, getPlayerName, hostGame, IJoinOptions, IPlayer, IRoom, IServer, LOG_SCOPE_LOCAL_SERVER, TColumn, THandler } from './common'
import { LocalServer } from './local-server'
import { IPlayerExtension, parseMessage, sendMessage } from './websocket-common'

interface IWebsocketClient extends IServer {
  start(port: number, host?: string): Promise<WEBSOCKET.w3cwebsocket>
}

type IRemoteClientPlayerExtension = IPlayerExtension & { originalHandler: THandler }

const clientLogger = debug('client:remote')
const serverLogger = debug(LOG_SCOPE_LOCAL_SERVER)

const eventEmitter = new EventEmitter()

let connection: WEBSOCKET.w3cwebsocket | undefined

const rooms: { [id: string]: IRoom<IRemoteClientPlayerExtension> } = {}

export const RemoteClient: IWebsocketClient = {
  start(port, host = 'localhost') {
    return new Promise<WEBSOCKET.w3cwebsocket>((resolve) => {
      connection = new WEBSOCKET.w3cwebsocket(`ws://${host}:${port}`)
      connection.onopen = () => {
        resolve(connection)
      }
      connection.onmessage = (e) => {
        if (typeof e.data !== 'string') {
          return
        }
        const message = parseMessage(e.data)
        switch (message.type) {
          case 'actionRequest': {
            const { roomId, playerUid, playerRole, state } = message.payload
            const room = rooms[roomId]
            if (!room) {
              return
            }
            const player = room.players.find((el) => el.role === playerRole || el.uid === playerUid)
            if (!player) {
              return
            }
            const { turn, hasEnded } = state
            const executeTurn = (column: TColumn) => {
              if (hasEnded) {
                clientLogger(`${getPlayerName(player.role)}: game has ended!`)
                return
              }
              if (turn && turn !== player.role) {
                clientLogger(`${getPlayerName(player.role)}: not my turn!`)
                return
              }
              sendMessage(connection, 'actionResponse', { roomId, playerRole, column })
            }
            player.handler(
              playerRole,
              {
                ...state,
                board: state.board.split('').map((el) => Number(el)),
              },
              executeTurn,
              roomId
            )
            break
          }
          case 'roomIdsResponse': {
            const { roomIds, filter } = message.payload
            eventEmitter.emit(`roomIdsResponse-${filter}`, roomIds)
            break
          }
          case 'serverBroadcast': {
            serverLogger(message.payload)
            break
          }
        }
      }
    })
  },
  stop() {
    connection?.close()
  },
  hostGame(roomId: string) {
    rooms[roomId] = rooms[roomId] ?? hostGame<IRemoteClientPlayerExtension>(LocalServer, roomId)
    return rooms[roomId]
  },
  async joinGame(this: IServer, handler: THandler, options: IJoinOptions = {}) {
    let { roomId, filter, waitTimeout } = options
    roomId = roomId ?? (await this.getRoomIds(filter))[0] ?? uuid()
    const room = (rooms[roomId] = rooms[roomId] ?? hostGame<IRemoteClientPlayerExtension>(LocalServer, roomId))
    const wrappedHandler = function (this: IPlayer<IPlayerExtension>, ...[playerRole, ...rest]: Parameters<THandler>) {
      this.role = playerRole
      handler(playerRole, ...rest)
    }
    const uid = uuid()
    const player = { role: EPlayerRole.NONE, uid, handler: wrappedHandler, originalHandler: handler }
    room.players.push(player)
    sendMessage(connection, 'joinGame', { roomId, playerUid: uid, waitTimeout })
    return player
  },
  async leaveGame(handler: THandler, roomId: string) {
    const room = rooms[roomId]
    if (!room) {
      return
    }
    const playerIndex = room.players.findIndex((el) => el.originalHandler === handler)
    if (playerIndex === -1) {
      return
    }
    const player = room.players[playerIndex]
    sendMessage(connection, 'leaveGame', { roomId, playerUid: player.uid })
    room.players.splice(playerIndex, 1)
    if (room.players.length) {
      return
    }
    delete rooms[roomId]
  },
  getRoomIds(filter = 'all') {
    sendMessage(connection, 'roomIdsRequest', { filter })
    return new Promise<string[]>((resolve) => {
      eventEmitter.once(`roomIdsResponse-${filter}`, (roomIds) => {
        const result = [...Object.keys(rooms), ...roomIds]
        resolve(result)
      })
    })
  },
}

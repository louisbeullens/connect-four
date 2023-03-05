import debug from 'debug'
import { EventEmitter } from 'events'
import { v4 as uuid } from 'uuid'
import { w3cwebsocket } from 'websocket'
import { getPlayerName, hostGame } from './common'
import { EPlayerRole, IJoinOptions, IPlayer, IRoom, IServer, LOG_SCOPE_LOCAL_SERVER, TColumn, THandler } from './common-types'
import { LocalServer, printServerMessage } from './local-server'
import { IPlayerExtension, parseMessage, sendMessage } from './websocket-common'
import 'websocket-polyfill'

interface IWebsocketClient extends IServer {
  start(port: number, host?: string): Promise<WebSocket>
  connected: boolean
}

type IRemoteClientPlayerExtension = IPlayerExtension & { originalHandler: THandler }

const clientLogger = debug('client:remote')

const eventEmitter = new EventEmitter()

const rooms: { [id: string]: IRoom<IRemoteClientPlayerExtension> } = {}

let connection: WebSocket | undefined

export const RemoteClient: IWebsocketClient = {
  start(this: IWebsocketClient, port = 3000, host = 'localhost') {
    return new Promise<WebSocket>((resolve) => {
      if (connection && connection.readyState === WebSocket.CONNECTING) {
        eventEmitter.once('connect', () => resolve(connection))
        return
      }
      connection = new WebSocket(`ws://${host}:${port}`)
      connection.onopen = () => {
        this.connected = true
        eventEmitter.emit('connect')
        resolve(connection)
      }
      connection.onclose = connection.onerror = () => {
        this.connected = false
        eventEmitter.emit('disconnect')
        Object.values(rooms).forEach(({ id, players }) => players.forEach((player) => this.leaveGame(player.originalHandler, id)))
        connection = undefined
      }
      connection.onmessage = (e: { data: string }) => {
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
            printServerMessage(message.payload)
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
  async joinGame(this: IWebsocketClient, handler: THandler, options: IJoinOptions = {}) {
    if (connection?.readyState !== w3cwebsocket.OPEN) {
      return new Promise((resolve) => {
        eventEmitter.once('connect', () => this.joinGame(handler, options).then(resolve))
      })
    }
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
  connected: false,
}

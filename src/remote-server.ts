import debug from 'debug'
import * as HTTP from 'http'
import * as OS from 'os'
import * as WEBSOCKET from 'websocket'
import { hostGame, IPlayer, IRoom, joinGame, leaveGame, LOG_SCOPE_LOCAL_SERVER, THandler } from './common'
import { LocalServer } from './local-server'
import { IPlayerExtension, parseMessage, sendMessage } from './websocket-common'

interface IWebsocketServer {
  start(port: number): Promise<void>
  stop(): void
  cleanGame(room: IRoom): void
}

let httpServer: HTTP.Server | undefined

let wsServer: WEBSOCKET.server | undefined

const serverLogger = debug(LOG_SCOPE_LOCAL_SERVER)

const rooms: { [id: string]: IRoom<IPlayerExtension> } = {}

const getNetworkAddress = () => {
  for (const interfaceDetails of Object.values(OS.networkInterfaces())) {
    if (!interfaceDetails) {
      continue
    }

    for (const details of interfaceDetails) {
      const { address, family, internal } = details

      if (family === 'IPv4' && !internal) {
        return address
      }
    }
  }
}

export const RemoteServer: IWebsocketServer = {
  start(port) {
    return new Promise((resolve) => {
      if (httpServer) {
        resolve()
        return
      }
      httpServer = HTTP.createServer()
      httpServer.listen(port, () => {
        console.log(`server listening on ${getNetworkAddress()}:${port}`)
        wsServer = new WEBSOCKET.server({
          httpServer,
          autoAcceptConnections: true,
        })
        wsServer.on('connect', (connection) => {
          connection.on('message', async (raw) => {
            if (raw.type === 'utf8') {
              const message = parseMessage(raw.utf8Data)
              switch (message.type) {
                case 'joinGame': {
                  const { roomId } = message.payload
                  let { playerUid } = message.payload
                  const handler: THandler = async function (this: IPlayer<IPlayerExtension>, playerRole, state, executeTurn) {
                    this.role = playerRole
                    this.executeTurn = executeTurn
                    sendMessage(connection, 'actionRequest', {
                      roomId,
                      playerUid,
                      playerRole,
                      state: {
                        ...state,
                        board: state.board.join(''),
                      },
                    })
                    playerUid = undefined
                  }
                  let room = rooms[roomId]
                  if (!room) {
                    room = rooms[roomId] = hostGame<IPlayerExtension>(LocalServer, roomId)
                    room.broadcast = function (this: IRoom<IPlayerExtension>, message, excludedPlayer) {
                      serverLogger(message)
                      this.players
                        .filter((el) => el.connection && el !== excludedPlayer)
                        .map((el) => el.connection)
                        .filter((el, i, arr) => arr.indexOf(el) === i)
                        .forEach((el) => sendMessage(el, 'serverBroadcast', message))
                    }
                  }
                  const player = await joinGame<IPlayerExtension>(LocalServer, handler, { roomId })!
                  player.uid = message.payload.playerUid
                  player.connection = connection
                  connection.once('close', async () => {
                    await leaveGame(LocalServer, handler, roomId)
                    RemoteServer.cleanGame(room)
                  })
                  break
                }
                case 'leaveGame': {
                  const { roomId, playerUid } = message.payload
                  const room = rooms[roomId]
                  if (!room) {
                    return
                  }
                  const playerIndex = room.players.findIndex((el) => el.uid === playerUid)
                  if (playerIndex === -1) {
                    return
                  }
                  const player = room.players[playerIndex]
                  await leaveGame(LocalServer, player.handler, roomId)
                  RemoteServer.cleanGame(room)
                  break
                }
                case 'actionResponse': {
                  const { roomId, playerRole, column } = message.payload
                  const player = rooms[roomId].players.find((el) => el.role === playerRole)
                  if (!player) {
                    break
                  }
                  player.executeTurn?.(column)
                  break
                }
                case 'roomIdsRequest': {
                  const { filter } = message.payload
                  const roomIds = await LocalServer.getRoomIds(filter)
                  sendMessage(connection, 'roomIdsResponse', { roomIds, filter })
                  break
                }
              }
            }
          })
        })
        resolve()
      })
    })
  },
  cleanGame(room) {
    if (room.players.length) {
      return
    }
    delete rooms[room.id]
    // if (Object.keys(rooms).length) {
    //   return
    // }
    // this.stop()
  },
  stop() {
    const shutDownMessage = 'Shutting down.'
    serverLogger(shutDownMessage)
    const logScopes = process.env.DEBUG.split(',')
    const serverScope = logScopes.find((el) => el === LOG_SCOPE_LOCAL_SERVER)
    if (serverScope) {
      debug.enable(logScopes.filter((el) => el !== serverScope).join(''))
    }
    Object.values(rooms).forEach((room) => room.broadcast(shutDownMessage))
    if (serverScope) {
      debug.enable(logScopes.join(''))
    }
    httpServer?.close()
  },
}

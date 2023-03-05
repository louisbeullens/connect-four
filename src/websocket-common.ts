import debug from 'debug'
import * as WEBSOCKET from 'websocket'
import { EPlayerRole, IGameState, IJoinOptions, TColumn, TExecuteTurn } from './common-types'

export interface IPlayerExtension {
  connection?: WEBSOCKET.connection
  executeTurn?: TExecuteTurn
  uid?: string
}

type TGameState = Omit<IGameState, 'board'> & { board: string }

type IMessage =
  | {
      type: 'joinGame'
      payload: { roomId: string; playerUid: string; waitTimeout?: number }
    }
  | {
      type: 'leaveGame'
      payload: { roomId: string; playerUid: string }
    }
  | {
      type: 'actionRequest'
      payload: { roomId: string; playerUid?: string; playerRole: EPlayerRole; state: TGameState }
    }
  | {
      type: 'actionResponse'
      payload: { roomId: string; playerRole: EPlayerRole; column: TColumn }
    }
  | {
      type: 'roomIdsRequest'
      payload: { filter: Required<IJoinOptions['filter']> }
    }
  | {
      type: 'roomIdsResponse'
      payload: { roomIds: string[]; filter: Required<IJoinOptions['filter']> }
    }
  | {
      type: 'serverBroadcast'
      payload: string | any[]
    }

const socketLogger = debug('network:websocket')

export const parseMessage = (raw: string) => {
  const message = JSON.parse(raw) as IMessage
  socketLogger('receive', raw)
  return message
}

export const stringifyMessage = (type: IMessage['type'], payload: IMessage['payload']) => {
  const message = { type, payload }
  return JSON.stringify(message)
}

export const sendMessage = (connection: WEBSOCKET.connection | WebSocket | undefined, type: IMessage['type'], payload: IMessage['payload']) => {
  if (!connection) {
    return
  }
  const message = stringifyMessage(type, payload)
  setTimeout(() => {
    if (connection instanceof WebSocket) {
      if (connection.readyState !== WebSocket.OPEN) {
        return
      }
    } else if (connection instanceof WEBSOCKET.connection) {
      if (!connection.connected) {
        return
      }
    }
    socketLogger('send', message)
    connection.send(message)
  }, 1)
}

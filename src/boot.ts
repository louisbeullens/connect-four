import { Argument, Command, Option } from 'commander'
import debug from 'debug'
import { getPlayerName } from './client'
import { EPlayerRole, LOG_SCOPE_LOCAL_SERVER } from './common-types'

debug.formatArgs = function (this: { namespace: string; useColors: boolean; color: number }, args: any[]) {
  const { namespace: name, useColors } = this

  if (useColors) {
    if (name === 'board') {
      args[0] = '  ' + args[0]
      return
    }
    const c = this.color
    const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c)
    const prefix = `  ${colorCode};1m${name} \u001B[0m`

    args[0] = prefix + args[0].split('\n').join('\n' + prefix)
  } else {
    args[0] = new Date().toISOString() + ' ' + name + ': ' + args[0]
  }
} as any

debug.formatters.P = (playerRole: EPlayerRole) => getPlayerName(playerRole)

export interface ICommandLineOptions {
  port?: number
  host?: string
  roomId?: string
  waitTimeout?: number
  singleGame?: boolean
  computer?: boolean
  human?: boolean
  observer?: boolean
  logScopes: string[]
}

const myParseInt = (value: string) => Number(value)

export const portOption = new Option('-p, --port [port]', 'Specify custom port.').argParser(myParseInt).default(3000)
export const hostOption = new Option('-h, --host [host]', 'Specify custom host.').default('localhost')
export const roomIdOption = new Option('-r, --room-id [roomId]', 'Specify unique name for your game.').argParser((value) => (value ? value : undefined))
export const waitTimeoutOption = new Option('-w, --wait-timeout [waitTimeout]', 'Time oponent gets to join, in ms.').argParser(myParseInt)
export const singleGameOption = new Option('-s, --single-game', 'Play a single game.').default(false)

export const computerOption = new Option('-C, --computer', 'Let computer play.').default(true)
export const humanOption = new Option('-H, --human', 'Play as human.').default(false)
export const observerOption = new Option('-O, --observer', 'Observe others play.').default(false)

const allowedLogScopes = ['board', 'client:*', 'client:remote', 'network:*', 'network:websocket', LOG_SCOPE_LOCAL_SERVER] as const
type TLogScope = (typeof allowedLogScopes)[number]
const logScopesArgument = new Argument('[logScopes...]').argOptional().choices(allowedLogScopes)

export const boot = (callback: (options: ICommandLineOptions) => void, ...options: (Option | TLogScope)[]) => {
  const program = new Command()
  const defaultLogScopes: string[] = []
  options.forEach((option) => {
    if (typeof option === 'string') {
      defaultLogScopes.push(option)
    } else if (option instanceof Option) {
      program.addOption(option)
    }
  })
  program.addArgument(logScopesArgument.default(defaultLogScopes))
  program.action((logScopes) => {
    const options = program.opts()
    debug.enable(logScopes.join(','))
    callback(options as ICommandLineOptions)
  })
  program.parse()
}

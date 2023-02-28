import { boot, computerOption, hostOption, humanOption, observerOption, portOption, roomIdOption, singleGameOption } from './boot'
import { joinGame } from './client'
import { intercept, LOG_SCOPE_LOCAL_SERVER } from './common'
import { computerPlayer } from './computer-player'
import { humanPlayer } from './human-player'
import { RemoteClient } from './remote-client'

boot(
  async (bootOptions) => {
    const { host, port, singleGame, human, observer, roomId } = bootOptions
    const player = human ? humanPlayer : computerPlayer
    await RemoteClient.start(port, host)
    await joinGame(RemoteClient, intercept(RemoteClient, player, { singleGame, silent: true }), { roomId, filter: observer ? 'full' : 'waiting' })
  },
  hostOption,
  portOption,
  roomIdOption,
  singleGameOption,
  computerOption,
  humanOption,
  observerOption,
  LOG_SCOPE_LOCAL_SERVER,
  'board'
)
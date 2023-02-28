#!/usr/bin/env node

import { boot, portOption } from '../boot'
import { LOG_SCOPE_LOCAL_SERVER } from '../common'
import { RemoteServer } from '../remote-server'

boot(
    ({ port }) => {
        RemoteServer.start(port)
        process.on('SIGINT', () => {
            RemoteServer.stop()
            setTimeout(() => process.exit(0), 1000)
        })
    },
    portOption,
    'board',
    LOG_SCOPE_LOCAL_SERVER
)

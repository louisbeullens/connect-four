#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boot_1 = require("../boot");
const common_1 = require("../common");
const remote_server_1 = require("../remote-server");
(0, boot_1.boot)(({ port }) => {
    remote_server_1.RemoteServer.start(port);
    process.on('SIGINT', () => {
        remote_server_1.RemoteServer.stop();
        setTimeout(() => process.exit(0), 1000);
    });
}, boot_1.portOption, 'board', common_1.LOG_SCOPE_LOCAL_SERVER);
//# sourceMappingURL=connect4-server.js.map
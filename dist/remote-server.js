"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteServer = void 0;
const debug_1 = require("debug");
const HTTP = require("http");
const OS = require("os");
const WEBSOCKET = require("websocket");
const common_1 = require("./common");
const local_server_1 = require("./local-server");
const websocket_common_1 = require("./websocket-common");
let httpServer;
let wsServer;
const serverLogger = (0, debug_1.default)(common_1.LOG_SCOPE_LOCAL_SERVER);
const rooms = {};
const getNetworkAddress = () => {
    for (const interfaceDetails of Object.values(OS.networkInterfaces())) {
        if (!interfaceDetails) {
            continue;
        }
        for (const details of interfaceDetails) {
            const { address, family, internal } = details;
            if (family === 'IPv4' && !internal) {
                return address;
            }
        }
    }
};
exports.RemoteServer = {
    start(port) {
        return new Promise((resolve) => {
            if (httpServer) {
                resolve();
                return;
            }
            httpServer = HTTP.createServer();
            httpServer.listen(port, () => {
                console.log(`server listening on ${getNetworkAddress()}:${port}`);
                wsServer = new WEBSOCKET.server({
                    httpServer,
                    autoAcceptConnections: true,
                });
                wsServer.on('connect', (connection) => {
                    connection.on('message', (raw) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        if (raw.type === 'utf8') {
                            const message = (0, websocket_common_1.parseMessage)(raw.utf8Data);
                            switch (message.type) {
                                case 'joinGame': {
                                    const { roomId } = message.payload;
                                    let { playerUid } = message.payload;
                                    const handler = function (playerRole, state, executeTurn) {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            this.role = playerRole;
                                            this.executeTurn = executeTurn;
                                            (0, websocket_common_1.sendMessage)(connection, 'actionRequest', {
                                                roomId,
                                                playerUid,
                                                playerRole,
                                                state: Object.assign(Object.assign({}, state), { board: state.board.join('') }),
                                            });
                                            playerUid = undefined;
                                        });
                                    };
                                    let room = rooms[roomId];
                                    if (!room) {
                                        room = rooms[roomId] = (0, common_1.hostGame)(local_server_1.LocalServer, roomId);
                                        room.broadcast = function (message, excludedPlayer) {
                                            serverLogger(message);
                                            this.players
                                                .filter((el) => el.connection && el !== excludedPlayer)
                                                .map((el) => el.connection)
                                                .filter((el, i, arr) => arr.indexOf(el) === i)
                                                .forEach((el) => (0, websocket_common_1.sendMessage)(el, 'serverBroadcast', message));
                                        };
                                    }
                                    const player = yield (0, common_1.joinGame)(local_server_1.LocalServer, handler, { roomId });
                                    player.uid = message.payload.playerUid;
                                    player.connection = connection;
                                    connection.once('close', () => __awaiter(this, void 0, void 0, function* () {
                                        yield (0, common_1.leaveGame)(local_server_1.LocalServer, handler, roomId);
                                        exports.RemoteServer.cleanGame(room);
                                    }));
                                    break;
                                }
                                case 'leaveGame': {
                                    const { roomId, playerUid } = message.payload;
                                    const room = rooms[roomId];
                                    if (!room) {
                                        return;
                                    }
                                    const playerIndex = room.players.findIndex((el) => el.uid === playerUid);
                                    if (playerIndex === -1) {
                                        return;
                                    }
                                    const player = room.players[playerIndex];
                                    yield (0, common_1.leaveGame)(local_server_1.LocalServer, player.handler, roomId);
                                    exports.RemoteServer.cleanGame(room);
                                    break;
                                }
                                case 'actionResponse': {
                                    const { roomId, playerRole, column } = message.payload;
                                    const player = rooms[roomId].players.find((el) => el.role === playerRole);
                                    if (!player) {
                                        break;
                                    }
                                    (_a = player.executeTurn) === null || _a === void 0 ? void 0 : _a.call(player, column);
                                    break;
                                }
                                case 'roomIdsRequest': {
                                    const { filter } = message.payload;
                                    const roomIds = yield local_server_1.LocalServer.getRoomIds(filter);
                                    (0, websocket_common_1.sendMessage)(connection, 'roomIdsResponse', { roomIds, filter });
                                    break;
                                }
                            }
                        }
                    }));
                });
                resolve();
            });
        });
    },
    cleanGame(room) {
        if (room.players.length) {
            return;
        }
        delete rooms[room.id];
        // if (Object.keys(rooms).length) {
        //   return
        // }
        // this.stop()
    },
    stop() {
        const shutDownMessage = 'Shutting down.';
        serverLogger(shutDownMessage);
        const logScopes = process.env.DEBUG.split(',');
        const serverScope = logScopes.find((el) => el === common_1.LOG_SCOPE_LOCAL_SERVER);
        if (serverScope) {
            debug_1.default.enable(logScopes.filter((el) => el !== serverScope).join(''));
        }
        Object.values(rooms).forEach((room) => room.broadcast(shutDownMessage));
        if (serverScope) {
            debug_1.default.enable(logScopes.join(''));
        }
        httpServer === null || httpServer === void 0 ? void 0 : httpServer.close();
    },
};
//# sourceMappingURL=remote-server.js.map
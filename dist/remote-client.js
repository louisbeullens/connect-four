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
exports.RemoteClient = void 0;
const debug_1 = require("debug");
const events_1 = require("events");
const uuid_1 = require("uuid");
const websocket_1 = require("websocket");
const common_1 = require("./common");
const common_types_1 = require("./common-types");
const local_server_1 = require("./local-server");
const websocket_common_1 = require("./websocket-common");
require("websocket-polyfill");
const clientLogger = (0, debug_1.default)('client:remote');
const eventEmitter = new events_1.EventEmitter();
const rooms = {};
let connection;
exports.RemoteClient = {
    start(port = 3000, host = 'localhost') {
        return new Promise((resolve) => {
            if (connection && connection.readyState === WebSocket.CONNECTING) {
                eventEmitter.once('connect', () => resolve(connection));
                return;
            }
            connection = new WebSocket(`ws://${host}:${port}`);
            connection.onopen = () => {
                this.connected = true;
                eventEmitter.emit('connect');
                resolve(connection);
            };
            connection.onclose = connection.onerror = () => {
                this.connected = false;
                eventEmitter.emit('disconnect');
                Object.values(rooms).forEach(({ id, players }) => players.forEach((player) => this.leaveGame(player.originalHandler, id)));
                connection = undefined;
            };
            connection.onmessage = (e) => {
                if (typeof e.data !== 'string') {
                    return;
                }
                const message = (0, websocket_common_1.parseMessage)(e.data);
                switch (message.type) {
                    case 'actionRequest': {
                        const { roomId, playerUid, playerRole, state } = message.payload;
                        const room = rooms[roomId];
                        if (!room) {
                            return;
                        }
                        const player = room.players.find((el) => el.role === playerRole || el.uid === playerUid);
                        if (!player) {
                            return;
                        }
                        const { turn, hasEnded } = state;
                        const executeTurn = (column) => {
                            if (hasEnded) {
                                clientLogger(`${(0, common_1.getPlayerName)(player.role)}: game has ended!`);
                                return;
                            }
                            if (turn && turn !== player.role) {
                                clientLogger(`${(0, common_1.getPlayerName)(player.role)}: not my turn!`);
                                return;
                            }
                            (0, websocket_common_1.sendMessage)(connection, 'actionResponse', { roomId, playerRole, column });
                        };
                        player.handler(playerRole, Object.assign(Object.assign({}, state), { board: state.board.split('').map((el) => Number(el)) }), executeTurn, roomId);
                        break;
                    }
                    case 'roomIdsResponse': {
                        const { roomIds, filter } = message.payload;
                        eventEmitter.emit(`roomIdsResponse-${filter}`, roomIds);
                        break;
                    }
                    case 'serverBroadcast': {
                        (0, local_server_1.printServerMessage)(message.payload);
                        break;
                    }
                }
            };
        });
    },
    stop() {
        connection === null || connection === void 0 ? void 0 : connection.close();
    },
    hostGame(roomId) {
        var _a;
        rooms[roomId] = (_a = rooms[roomId]) !== null && _a !== void 0 ? _a : (0, common_1.hostGame)(local_server_1.LocalServer, roomId);
        return rooms[roomId];
    },
    joinGame(handler, options = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if ((connection === null || connection === void 0 ? void 0 : connection.readyState) !== websocket_1.w3cwebsocket.OPEN) {
                return new Promise((resolve) => {
                    eventEmitter.once('connect', () => this.joinGame(handler, options).then(resolve));
                });
            }
            let { roomId, filter, waitTimeout } = options;
            roomId = (_a = roomId !== null && roomId !== void 0 ? roomId : (yield this.getRoomIds(filter))[0]) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)();
            const room = (rooms[roomId] = (_b = rooms[roomId]) !== null && _b !== void 0 ? _b : (0, common_1.hostGame)(local_server_1.LocalServer, roomId));
            const wrappedHandler = function (...[playerRole, ...rest]) {
                this.role = playerRole;
                handler(playerRole, ...rest);
            };
            const uid = (0, uuid_1.v4)();
            const player = { role: common_types_1.EPlayerRole.NONE, uid, handler: wrappedHandler, originalHandler: handler };
            room.players.push(player);
            (0, websocket_common_1.sendMessage)(connection, 'joinGame', { roomId, playerUid: uid, waitTimeout });
            return player;
        });
    },
    leaveGame(handler, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = rooms[roomId];
            if (!room) {
                return;
            }
            const playerIndex = room.players.findIndex((el) => el.originalHandler === handler);
            if (playerIndex === -1) {
                return;
            }
            const player = room.players[playerIndex];
            (0, websocket_common_1.sendMessage)(connection, 'leaveGame', { roomId, playerUid: player.uid });
            room.players.splice(playerIndex, 1);
            if (room.players.length) {
                return;
            }
            delete rooms[roomId];
        });
    },
    getRoomIds(filter = 'all') {
        (0, websocket_common_1.sendMessage)(connection, 'roomIdsRequest', { filter });
        return new Promise((resolve) => {
            eventEmitter.once(`roomIdsResponse-${filter}`, (roomIds) => {
                const result = [...Object.keys(rooms), ...roomIds];
                resolve(result);
            });
        });
    },
    connected: false,
};
//# sourceMappingURL=remote-client.js.map
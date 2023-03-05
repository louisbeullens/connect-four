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
exports.LocalServer = exports.printServerMessage = void 0;
const debug_1 = require("debug");
const uuid_1 = require("uuid");
const bot_player_1 = require("./bot-player");
const common_1 = require("./common");
const common_types_1 = require("./common-types");
const boardLogger = (0, debug_1.default)('board');
const serverLogger = (0, debug_1.default)(common_types_1.LOG_SCOPE_LOCAL_SERVER);
const rooms = {};
const printServerMessage = (message) => {
    if (Array.isArray(message)) {
        serverLogger(message[0], ...message.slice(1));
    }
    else {
        serverLogger(message);
    }
};
exports.printServerMessage = printServerMessage;
const getEndGameWinLooseStatusFromRoles = (playerRole, winnerRole) => {
    return playerRole === common_types_1.EPlayerRole.OBSERVER ? 'end' : playerRole === winnerRole ? 'win' : 'loose';
};
const getEndGameTieStatusFromRoles = (playerRole) => {
    return playerRole === common_types_1.EPlayerRole.OBSERVER ? 'end' : 'loose';
};
exports.LocalServer = {
    hostGame(roomId) {
        if (roomId in rooms) {
            return rooms[roomId];
        }
        const room = {
            id: roomId,
            state: (0, common_1.createNewGameState)(),
            players: [],
            broadcast: exports.printServerMessage,
        };
        rooms[roomId] = room;
        return room;
    },
    joinGame(handler, options = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let { roomId, filter, waitTimeout } = options;
            roomId = (_a = roomId !== null && roomId !== void 0 ? roomId : (yield this.getRoomIds(filter))[0]) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)();
            const room = (rooms[roomId] = (_b = rooms[roomId]) !== null && _b !== void 0 ? _b : this.hostGame(roomId));
            const playerRole = room.players.find((el) => el.role === common_types_1.EPlayerRole.RED)
                ? room.players.find((el) => el.role === common_types_1.EPlayerRole.YELLOW)
                    ? common_types_1.EPlayerRole.OBSERVER
                    : common_types_1.EPlayerRole.YELLOW
                : common_types_1.EPlayerRole.RED;
            const player = {
                role: playerRole,
                handler,
            };
            room.players.push(player);
            const respond = (player, state, firstResponse = false) => {
                const executeTurn = (column) => {
                    if (player.role > common_types_1.EPlayerRole.YELLOW) {
                        return;
                    }
                    if (room.state.turn && room.state.turn !== player.role) {
                        room.broadcast([`%P plays outside turn!`, player.role], player);
                        return;
                    }
                    const freeRowOrNegativeOne = (0, common_1.getFreeBoardRowForColumn)(room.state.board, column);
                    if (freeRowOrNegativeOne === -1) {
                        respond(player, Object.assign(Object.assign({}, (0, common_1.clone)(room.state)), { status: 'invalidColumn' }));
                        room.broadcast([`%P plays an unavailable column!`, player.role], player);
                        return;
                    }
                    if (!room.state.turn) {
                        room.broadcast([`%P started game!`, player.role]);
                    }
                    (0, common_1.insertCoinInColumn)(room.state.board, column, player.role);
                    room.state.lastPlayerId = player.role;
                    room.state.lastPlayerAction = column;
                    (0, common_1.printBoard)(room.state.board, boardLogger);
                    const win = (0, common_1.checkBoardForWinner)(room.state.board, player.role);
                    if (win) {
                        delete room.state.turn;
                        room.players.forEach((el) => respond(el, Object.assign(Object.assign({}, (0, common_1.clone)(room.state)), { hasEnded: true, status: getEndGameWinLooseStatusFromRoles(el.role, player.role) })));
                        room.state = (0, common_1.createNewGameState)();
                        setTimeout(() => room.broadcast([`%P won!`, player.role]), 10);
                        setTimeout(() => {
                            if (!(roomId in rooms)) {
                                return;
                            }
                            (0, common_1.printBoard)(room.state.board, boardLogger);
                            room.players.forEach((el) => respond(el, (0, common_1.clone)(room.state)));
                        }, 10000);
                        return;
                    }
                    const tie = (0, common_1.checkBoardForTie)(room.state.board);
                    if (tie) {
                        delete room.state.turn;
                        room.players.forEach((el) => respond(el, Object.assign(Object.assign({}, (0, common_1.clone)(room.state)), { hasEnded: true, status: getEndGameTieStatusFromRoles(el.role) })));
                        setTimeout(() => room.broadcast(`Nobody won!`), 10);
                        room.state = (0, common_1.createNewGameState)();
                        setTimeout(() => {
                            if (!(roomId in rooms)) {
                                return;
                            }
                            (0, common_1.printBoard)(room.state.board, boardLogger);
                            room.players.forEach((el) => respond(el, (0, common_1.clone)(room.state)));
                        }, 10000);
                        return;
                    }
                    room.state.turn = 3 - player.role;
                    room.players.filter((el) => el.role !== player.role).forEach((el) => respond(el, (0, common_1.clone)(room.state)));
                };
                setTimeout(() => {
                    if (firstResponse) {
                        room.broadcast([`%P joined room ${roomId}.`, player.role]);
                        if (waitTimeout > 0) {
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                if ((0, common_1.getRedAndOrYellowPlayer)(room.players).length === 1) {
                                    const bot = yield this.joinGame((0, common_1.intercept)(this, bot_player_1.computerPlayer, { silent: true }), { roomId });
                                    bot.isBot = true;
                                }
                            }), waitTimeout);
                        }
                    }
                    player.handler(player.role, state, executeTurn, roomId);
                }, 1);
            };
            respond(player, (0, common_1.clone)(room.state), true);
            return player;
        });
    },
    leaveGame(handler, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = rooms[roomId];
            if (!room) {
                return;
            }
            const playerIndex = room.players.findIndex((el) => el.handler === handler);
            if (playerIndex === -1) {
                return;
            }
            const player = room.players[playerIndex];
            room.players.splice(playerIndex, 1);
            const playersLength = room.players.length;
            room.broadcast([`%P left room ${roomId}.`, player.role], player);
            if ((0, common_1.isPlayerRedOrYellow)(player) && !player.isBot) {
                const bot = room.players.find((el) => el.isBot);
                if (bot) {
                    this.leaveGame(bot.handler, roomId);
                }
            }
            if (playersLength) {
                return;
            }
            delete rooms[roomId];
            serverLogger(`Closing room ${roomId}.`);
        });
    },
    getRoomIds(filter = 'all') {
        return __awaiter(this, void 0, void 0, function* () {
            switch (filter) {
                case 'all':
                    return Object.keys(rooms);
                case 'waiting':
                    return Object.values(rooms)
                        .filter((el) => (0, common_1.getRedAndOrYellowPlayer)(el.players).length === 1)
                        .map((el) => el.id);
                case 'full':
                    return Object.values(rooms)
                        .filter((el) => (0, common_1.getRedAndOrYellowPlayer)(el.players).length === 2)
                        .map((el) => el.id);
            }
        });
    },
    stop() { },
};
//# sourceMappingURL=local-server.js.map
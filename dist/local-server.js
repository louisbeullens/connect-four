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
exports.LocalServer = void 0;
const debug_1 = require("debug");
const uuid_1 = require("uuid");
const common_1 = require("./common");
const minimax_player_1 = require("./minimax-player");
const boardLogger = (0, debug_1.default)('board');
const serverLogger = (0, debug_1.default)(common_1.LOG_SCOPE_LOCAL_SERVER);
const rooms = {};
const getEndGameWinLooseStatusFromRoles = (playerRole, winnerRole) => {
    return playerRole === common_1.EPlayerRole.OBSERVER ? 'end' : playerRole === winnerRole ? 'win' : 'loose';
};
const getEndGameTieStatusFromRoles = (playerRole) => {
    return playerRole === common_1.EPlayerRole.OBSERVER ? 'end' : 'loose';
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
            broadcast: function (message) {
                serverLogger(message);
            },
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
            const playerRole = room.players.find((el) => el.role === common_1.EPlayerRole.RED)
                ? room.players.find((el) => el.role === common_1.EPlayerRole.YELLOW)
                    ? common_1.EPlayerRole.OBSERVER
                    : common_1.EPlayerRole.YELLOW
                : common_1.EPlayerRole.RED;
            const player = {
                role: playerRole,
                handler,
            };
            room.players.push(player);
            const respond = (player, state, firstResponse = false) => {
                const executeTurn = (column) => {
                    var _a;
                    if (player.role > common_1.EPlayerRole.YELLOW) {
                        return;
                    }
                    if (room.state.turn && room.state.turn !== player.role) {
                        room.broadcast(`${(0, common_1.getPlayerName)(player.role)} plays outside turn!`, player);
                        return;
                    }
                    const freeRowOrNegativeOne = (0, common_1.getFreeBoardRowForColumn)(room.state.board, column);
                    if (freeRowOrNegativeOne === -1) {
                        room.broadcast(`${(0, common_1.getPlayerName)(player.role)} plays an unavailable column!`, player);
                        respond(player, Object.assign(Object.assign({}, (0, common_1.clone)(room.state)), { status: 'invalidColumn' }));
                        return;
                    }
                    if (!room.state.turn) {
                        room.broadcast(`${(0, common_1.getPlayerName)(player.role)} started game!`);
                    }
                    (0, common_1.insertCoinInColumn)(room.state.board, column, player.role);
                    room.state.turn = (((_a = room.state.turn) !== null && _a !== void 0 ? _a : player.role) % 2) + 1;
                    room.state.lastPlayerId = player.role;
                    room.state.lastPlayerAction = column;
                    (0, common_1.printBoard)(room.state.board, boardLogger);
                    const win = (0, common_1.checkBoardForWinner)(room.state.board, player.role);
                    if (win) {
                        room.broadcast(`${(0, common_1.getPlayerName)(player.role)} wins!`);
                        room.players.forEach((el) => respond(el, Object.assign(Object.assign({}, (0, common_1.clone)(room.state)), { hasEnded: true, status: getEndGameWinLooseStatusFromRoles(el.role, player.role) })));
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
                    const tie = (0, common_1.checkBoardForTie)(room.state.board);
                    if (tie) {
                        room.broadcast(`Nobody won!`);
                        room.players.forEach((el) => respond(el, Object.assign(Object.assign({}, (0, common_1.clone)(room.state)), { hasEnded: true, status: getEndGameTieStatusFromRoles(el.role) })));
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
                    room.players.filter((el) => el.role !== player.role).forEach((el) => respond(el, (0, common_1.clone)(room.state)));
                };
                setTimeout(() => {
                    if (firstResponse) {
                        room.broadcast(`${(0, common_1.getPlayerName)(player.role)} joined room ${roomId}.`);
                        if (waitTimeout > 0) {
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                if ((0, common_1.getRedAndOrYellowPlayer)(room.players).length === 1) {
                                    const bot = yield this.joinGame((0, common_1.intercept)(this, minimax_player_1.computerPlayer, { silent: true }), { roomId });
                                    bot.isBot = true;
                                }
                            }), waitTimeout);
                        }
                    }
                    player.handler(player.role, state, executeTurn, roomId);
                }, 500);
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
            room.broadcast(`${(0, common_1.getPlayerName)(player.role)} left room ${roomId}.`, player);
            room.players.splice(playerIndex, 1);
            if ((0, common_1.isPlayerRedOrYellow)(player) && !player.isBot) {
                const bot = room.players.find((el) => el.isBot);
                if (bot) {
                    this.leaveGame(bot.handler, roomId);
                }
            }
            if (room.players.length) {
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
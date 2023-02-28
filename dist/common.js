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
exports.intercept = exports.leaveGame = exports.joinGame = exports.hostGame = exports.getRedAndOrYellowPlayer = exports.isPlayerRedOrYellow = exports.getPlayerName = exports.printBoard = exports.printCoin = exports.checkboardForScore = exports.checkBoardForTie = exports.checkBoardForWinner = exports.insertCoinInColumn = exports.getFreeBoardRowForColumn = exports.checkLineCombo = exports.getBoardBottomLeftDiagonal = exports.getBoardTopLeftDiagonal = exports.getBoardColumn = exports.getBoardRow = exports.rowColumnToIndex = exports.createNewGameState = exports.clone = exports.LOG_SCOPE_LOCAL_SERVER = exports.EPlayerRole = exports.ECoin = void 0;
const debug_1 = require("debug");
require("colors");
var ECoin;
(function (ECoin) {
    ECoin[ECoin["NONE"] = 0] = "NONE";
    ECoin[ECoin["RED"] = 1] = "RED";
    ECoin[ECoin["YELLOW"] = 2] = "YELLOW";
})(ECoin = exports.ECoin || (exports.ECoin = {}));
var EPlayerRole;
(function (EPlayerRole) {
    EPlayerRole[EPlayerRole["NONE"] = 0] = "NONE";
    EPlayerRole[EPlayerRole["RED"] = 1] = "RED";
    EPlayerRole[EPlayerRole["YELLOW"] = 2] = "YELLOW";
    EPlayerRole[EPlayerRole["OBSERVER"] = 3] = "OBSERVER";
})(EPlayerRole = exports.EPlayerRole || (exports.EPlayerRole = {}));
exports.LOG_SCOPE_LOCAL_SERVER = 'server';
const ROW_MIN = 0;
const ROW_MAX = 5;
const COLUMN_MIN = 0;
const COLUMN_MAX = 6;
const boardLogger = (0, debug_1.default)('board');
const circle = String.fromCodePoint(0x2b24);
const colors = [' ', circle.red, circle.yellow];
const createFilledArray = (length, fill) => Array.from({ length }, () => fill);
const clone = (obj) => JSON.parse(JSON.stringify(obj));
exports.clone = clone;
const createNewGameState = () => ({ board: createFilledArray((COLUMN_MAX + 1) * (ROW_MAX + 1), ECoin.NONE) });
exports.createNewGameState = createNewGameState;
const rowColumnToIndex = (row, column) => {
    return (COLUMN_MAX + 1) * (ROW_MAX - row) + column;
};
exports.rowColumnToIndex = rowColumnToIndex;
const getBoardRow = (board, row) => {
    const boardStart = (COLUMN_MAX + 1) * (ROW_MAX - row);
    const boardEnd = boardStart + (COLUMN_MAX + 1);
    return board.slice(boardStart, boardEnd);
};
exports.getBoardRow = getBoardRow;
const getBoardColumn = (board, column) => {
    const line = [];
    for (let row = ROW_MIN; row <= ROW_MAX; row++) {
        line.push(board[(0, exports.rowColumnToIndex)(row, column)]);
    }
    return line;
};
exports.getBoardColumn = getBoardColumn;
const getBoardTopLeftDiagonal = (board, diagonal) => {
    let row = Math.min(diagonal + 3, ROW_MAX);
    let column = Math.max(diagonal - 2, COLUMN_MIN);
    const result = [];
    while (row >= ROW_MIN && column <= COLUMN_MAX) {
        result.push(board[(0, exports.rowColumnToIndex)(row, column)]);
        row--;
        column++;
    }
    return result;
};
exports.getBoardTopLeftDiagonal = getBoardTopLeftDiagonal;
const getBoardBottomLeftDiagonal = (board, diagonal) => {
    let row = Math.max(2 - diagonal, ROW_MIN);
    let column = Math.max(diagonal - 2, COLUMN_MIN);
    const result = [];
    while (row <= ROW_MAX && column <= COLUMN_MAX) {
        result.push(board[(0, exports.rowColumnToIndex)(row, column)]);
        row++;
        column++;
    }
    return result;
};
exports.getBoardBottomLeftDiagonal = getBoardBottomLeftDiagonal;
const checkLineCombo = (line, coin) => {
    let maxCombo = 0;
    let combo = 0;
    const setMaxCombo = () => {
        maxCombo = Math.max(maxCombo, combo);
    };
    const checkFn = (el) => {
        if (el === coin) {
            combo++;
        }
        else {
            setMaxCombo();
            combo = 0;
        }
    };
    line.forEach(checkFn);
    setMaxCombo();
    return maxCombo;
};
exports.checkLineCombo = checkLineCombo;
const getFreeBoardRowForColumn = (board, column) => {
    return (0, exports.getBoardColumn)(board, column).indexOf(ECoin.NONE);
};
exports.getFreeBoardRowForColumn = getFreeBoardRowForColumn;
const insertCoinInColumn = (board, column, coin) => {
    const row = (0, exports.getFreeBoardRowForColumn)(board, column);
    if (row === -1) {
        return false;
    }
    board[(0, exports.rowColumnToIndex)(row, column)] = coin;
    return true;
};
exports.insertCoinInColumn = insertCoinInColumn;
const checkBoardForWinner = (board, coin) => {
    for (let row = ROW_MIN; row <= ROW_MAX; row++) {
        let combo = (0, exports.checkLineCombo)((0, exports.getBoardRow)(board, row), coin);
        if (combo >= 4) {
            return true;
        }
    }
    for (let column = COLUMN_MIN; column <= COLUMN_MAX; column++) {
        let combo = (0, exports.checkLineCombo)((0, exports.getBoardColumn)(board, column), coin);
        if (combo >= 4) {
            return true;
        }
    }
    for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
        let combo = (0, exports.checkLineCombo)((0, exports.getBoardTopLeftDiagonal)(board, diagonal), coin);
        if (combo >= 4) {
            return true;
        }
    }
    for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
        let combo = (0, exports.checkLineCombo)((0, exports.getBoardBottomLeftDiagonal)(board, diagonal), coin);
        if (combo >= 4) {
            return true;
        }
    }
    return false;
};
exports.checkBoardForWinner = checkBoardForWinner;
const checkBoardForTie = (board) => {
    return board.every((el) => el !== ECoin.NONE);
};
exports.checkBoardForTie = checkBoardForTie;
const checkboardForScore = (board, coin) => {
    if ((0, exports.checkBoardForWinner)(board, 3 - coin)) {
        return 0;
    }
    let combo = 0;
    for (let row = ROW_MIN; row <= ROW_MAX; row++) {
        combo = Math.max((0, exports.checkLineCombo)((0, exports.getBoardRow)(board, row), coin), combo);
    }
    for (let column = COLUMN_MIN; column <= COLUMN_MAX; column++) {
        combo = Math.max((0, exports.checkLineCombo)((0, exports.getBoardColumn)(board, column), coin), combo);
    }
    for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
        combo = Math.max((0, exports.checkLineCombo)((0, exports.getBoardTopLeftDiagonal)(board, diagonal), coin), combo);
    }
    for (let diagonal = ROW_MIN; diagonal <= ROW_MAX; diagonal++) {
        combo = Math.max((0, exports.checkLineCombo)((0, exports.getBoardBottomLeftDiagonal)(board, diagonal), coin), combo);
    }
    return combo;
};
exports.checkboardForScore = checkboardForScore;
const printCoin = (coin) => (process.stderr.isTTY ? colors[coin] : coin);
exports.printCoin = printCoin;
const printBoard = (board, logger = console.log) => {
    for (let i = ROW_MAX; i >= ROW_MIN; i--) {
        logger(`|${(0, exports.getBoardRow)(board, i)
            .map((el) => (0, exports.printCoin)(el))
            .join('|')}|`);
    }
    logger('');
};
exports.printBoard = printBoard;
const getPlayerName = (playerRole) => {
    if ([EPlayerRole.RED, EPlayerRole.YELLOW].includes(playerRole)) {
        return process.stderr.isTTY ? `${(0, exports.printCoin)(playerRole)}  player` : `player ${playerRole}`;
    }
    else {
        return 'observer';
    }
};
exports.getPlayerName = getPlayerName;
// utilities
const isPlayerRedOrYellow = (player) => [EPlayerRole.RED, EPlayerRole.YELLOW].includes(player.role);
exports.isPlayerRedOrYellow = isPlayerRedOrYellow;
const getRedAndOrYellowPlayer = (players) => players.filter(exports.isPlayerRedOrYellow);
exports.getRedAndOrYellowPlayer = getRedAndOrYellowPlayer;
// server wrappers
const hostGame = (server, id) => server.hostGame(id);
exports.hostGame = hostGame;
const joinGame = (server, handler, options) => __awaiter(void 0, void 0, void 0, function* () { return server.joinGame(handler, options); });
exports.joinGame = joinGame;
const leaveGame = (server, handler, roomId) => __awaiter(void 0, void 0, void 0, function* () { return server.leaveGame(handler, roomId); });
exports.leaveGame = leaveGame;
const intercept = (server, handler, options = {}) => {
    const { singleGame, silent } = options;
    const interceptedHandler = (playerRole, state, executeTurn, roomId) => __awaiter(void 0, void 0, void 0, function* () {
        const { board, hasEnded } = state;
        if (!silent) {
            (0, exports.printBoard)(board, boardLogger);
        }
        if (hasEnded && singleGame) {
            yield (0, exports.leaveGame)(server, interceptedHandler, roomId);
            server.stop();
        }
        handler(playerRole, state, (column) => {
            if (hasEnded) {
                return;
            }
            if (!silent) {
                (0, exports.insertCoinInColumn)(board, column, playerRole);
                (0, exports.printBoard)(board, boardLogger);
            }
            executeTurn(column);
        }, roomId);
    });
    return interceptedHandler;
};
exports.intercept = intercept;
//# sourceMappingURL=common.js.map
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
exports.intercept = exports.leaveGame = exports.joinGame = exports.hostGame = exports.getRedAndOrYellowPlayer = exports.isPlayerRedOrYellow = exports.getPlayerName = exports.printBoard = exports.printLine = exports.printCoin = exports.getBoardScore = exports.checkBoardForTie = exports.checkBoardForWinner = exports.insertCoinInColumn = exports.getFreeBoardRowForColumn = exports.getLineCombo = exports.getBoardBottomLeftDiagonal = exports.getBoardTopLeftDiagonal = exports.getBoardColumn = exports.getBoardRow = exports.rowColumnToIndex = exports.createNewGameState = exports.clone = exports.COLUMN_MAX = exports.COLUMN_MIN = exports.ROW_MAX = exports.ROW_MIN = exports.LOG_SCOPE_LOCAL_SERVER = exports.EPlayerRole = exports.ECoin = void 0;
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
exports.ROW_MIN = 0;
exports.ROW_MAX = 5;
exports.COLUMN_MIN = 0;
exports.COLUMN_MAX = 6;
const boardLogger = (0, debug_1.default)('board');
const circle = String.fromCodePoint(0x2b24);
const colors = [' ', circle.red, circle.yellow];
const createFilledArray = (length, fill) => Array.from({ length }, () => fill);
const clone = (obj) => JSON.parse(JSON.stringify(obj));
exports.clone = clone;
const createNewGameState = () => ({ board: createFilledArray((exports.COLUMN_MAX + 1) * (exports.ROW_MAX + 1), ECoin.NONE) });
exports.createNewGameState = createNewGameState;
/**
 * Converts row and column to board index.
 *
 * @param {TRow} row
 * @param {TColumn} column
 * @returns {number} Index in board.
 */
const rowColumnToIndex = (row, column) => {
    return (exports.COLUMN_MAX + 1) * (exports.ROW_MAX - row) + column;
};
exports.rowColumnToIndex = rowColumnToIndex;
/**
 * Get row from board.
 *
 * @param {TBoard} board
 * @param {TRow} row - 0 = bottom 5 = top.
 * @returns {ECoin[]} Part of board, direction from left to right.
 */
const getBoardRow = (board, row) => {
    const boardStart = (exports.COLUMN_MAX + 1) * (exports.ROW_MAX - row);
    const boardEnd = boardStart + (exports.COLUMN_MAX + 1);
    return board.slice(boardStart, boardEnd);
};
exports.getBoardRow = getBoardRow;
/**
 * Get column from board.
 *
 * @param {TBoard} board
 * @param {TRow} row - 0 = left 6 = right.
 * @returns {ECoin[]} part of board, direction from bottom to top.
 */
const getBoardColumn = (board, column) => {
    const line = [];
    for (let row = exports.ROW_MIN; row <= exports.ROW_MAX; row++) {
        line.push(board[(0, exports.rowColumnToIndex)(row, column)]);
    }
    return line;
};
exports.getBoardColumn = getBoardColumn;
/**
 * Get top-left diagonal.
 * ```
 * 2 3 4 5
 * 1 2 3 4 5
 * 0 1 2 3 4 5
 *   0 1 2 3 4 5
 *     0 1 2 3 4
 *       0 1 2 3
 * ```
 *
 * @param {TBoard} board
 * @param {TRow} diagonal - See description, (number represents diagonal index).
 * @returns {ECoin[]} Part of board, direction from left to right.
 */
const getBoardTopLeftDiagonal = (board, diagonal) => {
    let row = Math.min(diagonal + 3, exports.ROW_MAX);
    let column = Math.max(diagonal - 2, exports.COLUMN_MIN);
    const result = [];
    while (row >= exports.ROW_MIN && column <= exports.COLUMN_MAX) {
        result.push(board[(0, exports.rowColumnToIndex)(row, column)]);
        row--;
        column++;
    }
    return result;
};
exports.getBoardTopLeftDiagonal = getBoardTopLeftDiagonal;
/**
 * Get bottom-left diagonal.
 * ```
 *       0 1 2 3
 *     0 1 2 3 4
 *   0 1 2 3 4 5
 * 0 1 2 3 4 5
 * 1 2 3 4 5
 * 2 3 4 5
 * ```
 *
 * @param {TBoard} board
 * @param {TRow} diagonal - See description, (number represents diagonal index).
 * @returns {ECoin[]} Part of board, direction from left to right
 */
const getBoardBottomLeftDiagonal = (board, diagonal) => {
    let row = Math.max(2 - diagonal, exports.ROW_MIN);
    let column = Math.max(diagonal - 2, exports.COLUMN_MIN);
    const result = [];
    while (row <= exports.ROW_MAX && column <= exports.COLUMN_MAX) {
        result.push(board[(0, exports.rowColumnToIndex)(row, column)]);
        row++;
        column++;
    }
    return result;
};
exports.getBoardBottomLeftDiagonal = getBoardBottomLeftDiagonal;
/**
 * Get maximum connected length found for color in line.
 *
 * @param {ECoin[]} line
 * @param {ECoin} color - color to search for.
 * @returns {number}
 */
const getLineCombo = (line, color) => {
    let combo = 0;
    let tmpCombo = 0;
    const updateCombo = () => {
        if (tmpCombo > combo) {
            combo = tmpCombo;
        }
        tmpCombo = 0;
    };
    line.forEach((el) => {
        if (el === color) {
            tmpCombo++;
            return;
        }
        else {
            updateCombo();
        }
    });
    updateCombo();
    return combo;
};
exports.getLineCombo = getLineCombo;
/**
 * Get first free row index or -1
 *
 * @param {TBoard} board
 * @param {TColumn} column
 * @returns {(TRow | -1)}
 */
const getFreeBoardRowForColumn = (board, column) => {
    return (0, exports.getBoardColumn)(board, column).indexOf(ECoin.NONE);
};
exports.getFreeBoardRowForColumn = getFreeBoardRowForColumn;
/**
 * Inserts color in first free slot of column.
 *
 * @param {TBoard} board
 * @param {TColumn} column
 * @param {ECoin} color
 * @returns {boolean}
 */
const insertCoinInColumn = (board, column, color) => {
    const row = (0, exports.getFreeBoardRowForColumn)(board, column);
    if (row === -1) {
        return false;
    }
    board[(0, exports.rowColumnToIndex)(row, column)] = color;
    return true;
};
exports.insertCoinInColumn = insertCoinInColumn;
/**
 * Returns true when color won the game, false otherwise,
 *
 * @param {TBoard} board
 * @param {ECoin} color
 * @returns {boolean}
 */
const checkBoardForWinner = (board, color) => {
    for (let row = exports.ROW_MIN; row <= exports.ROW_MAX; row++) {
        const combo = (0, exports.getLineCombo)((0, exports.getBoardRow)(board, row), color);
        if (combo >= 4) {
            return true;
        }
    }
    for (let column = exports.COLUMN_MIN; column <= exports.COLUMN_MAX; column++) {
        const combo = (0, exports.getLineCombo)((0, exports.getBoardColumn)(board, column), color);
        if (combo >= 4) {
            return true;
        }
    }
    for (let diagonal = exports.ROW_MIN; diagonal <= exports.ROW_MAX; diagonal++) {
        const combo = (0, exports.getLineCombo)((0, exports.getBoardTopLeftDiagonal)(board, diagonal), color);
        if (combo >= 4) {
            return true;
        }
    }
    for (let diagonal = exports.ROW_MIN; diagonal <= exports.ROW_MAX; diagonal++) {
        const combo = (0, exports.getLineCombo)((0, exports.getBoardBottomLeftDiagonal)(board, diagonal), color);
        if (combo >= 4) {
            return true;
        }
    }
    return false;
};
exports.checkBoardForWinner = checkBoardForWinner;
/**
 * Returns true when board is completely full, false otherwise.
 *
 * @param {TBoard} board
 * @returns {boolean}
 */
const checkBoardForTie = (board) => {
    return board.every((el) => el !== ECoin.NONE);
};
exports.checkBoardForTie = checkBoardForTie;
/**
 * Get maximum connected length found for color in board.
 * Returns 0 when other player won the game.
 *
 * @param {TBoard} board
 * @param {number} color
 * @returns {number}
 */
const getBoardScore = (board, color) => {
    const otherColor = 3 - color;
    if ((0, exports.checkBoardForWinner)(board, otherColor)) {
        return 0;
    }
    let combo = 0;
    for (let row = exports.ROW_MIN; row <= exports.ROW_MAX; row++) {
        combo = Math.max((0, exports.getLineCombo)((0, exports.getBoardRow)(board, row), color), combo);
    }
    for (let column = exports.COLUMN_MIN; column <= exports.COLUMN_MAX; column++) {
        combo = Math.max((0, exports.getLineCombo)((0, exports.getBoardColumn)(board, column), color), combo);
    }
    for (let diagonal = exports.ROW_MIN; diagonal <= exports.ROW_MAX; diagonal++) {
        combo = Math.max((0, exports.getLineCombo)((0, exports.getBoardTopLeftDiagonal)(board, diagonal), color), combo);
    }
    for (let diagonal = exports.ROW_MIN; diagonal <= exports.ROW_MAX; diagonal++) {
        combo = Math.max((0, exports.getLineCombo)((0, exports.getBoardBottomLeftDiagonal)(board, diagonal), color), combo);
    }
    return combo;
};
exports.getBoardScore = getBoardScore;
/**
 * Returns coin as colored unicode circle or number.
 *
 * @param {ECoin} coin
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
const printCoin = (coin, useColors = process.stderr.isTTY) => (useColors ? colors[coin] : `${coin}`);
exports.printCoin = printCoin;
/**
 * Returns line as string.
 *
 * @param {ECoin[]} line
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
const printLine = (line, useColors = process.stderr.isTTY) => `|${line.map((el) => (0, exports.printCoin)(el, useColors)).join('|')}|`;
exports.printLine = printLine;
/**
 * Prints entire board.
 *
 * @param {ECoin[]} board
 * @callback {console~log} [logger=console.log]
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
const printBoard = (board, logger = console.log, useColors = process.stderr.isTTY) => {
    for (let row = exports.ROW_MAX; row >= exports.ROW_MIN; row--) {
        logger((0, exports.printLine)((0, exports.getBoardRow)(board, row), useColors));
    }
    logger('');
};
exports.printBoard = printBoard;
/**
 * Generates playerName based on role,
 *
 * @param {EPlayerRole} playerRole
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
const getPlayerName = (playerRole, useColors = process.stderr.isTTY) => {
    if ([EPlayerRole.RED, EPlayerRole.YELLOW].includes(playerRole)) {
        return useColors ? `${(0, exports.printCoin)(playerRole)}  player` : `player ${playerRole}`;
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
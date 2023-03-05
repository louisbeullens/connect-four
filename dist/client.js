"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteClient = exports.LocalServer = exports.rowColumnToIndex = exports.printLine = exports.printCoin = exports.printBoard = exports.leaveGame = exports.joinGame = exports.intercept = exports.insertCoinInColumn = exports.getPlayerName = exports.getLineCombo = exports.getFreeBoardRowForColumn = exports.getBoardTopLeftDiagonal = exports.getBoardScore = exports.getBoardRow = exports.getBoardColumn = exports.getBoardBottomLeftDiagonal = exports.createNewGameState = exports.checkBoardForWinner = exports.checkBoardForTie = exports.Logger = void 0;
const debug_1 = require("debug");
exports.Logger = debug_1.default;
var common_1 = require("./common");
Object.defineProperty(exports, "checkBoardForTie", { enumerable: true, get: function () { return common_1.checkBoardForTie; } });
Object.defineProperty(exports, "checkBoardForWinner", { enumerable: true, get: function () { return common_1.checkBoardForWinner; } });
Object.defineProperty(exports, "createNewGameState", { enumerable: true, get: function () { return common_1.createNewGameState; } });
Object.defineProperty(exports, "getBoardBottomLeftDiagonal", { enumerable: true, get: function () { return common_1.getBoardBottomLeftDiagonal; } });
Object.defineProperty(exports, "getBoardColumn", { enumerable: true, get: function () { return common_1.getBoardColumn; } });
Object.defineProperty(exports, "getBoardRow", { enumerable: true, get: function () { return common_1.getBoardRow; } });
Object.defineProperty(exports, "getBoardScore", { enumerable: true, get: function () { return common_1.getBoardScore; } });
Object.defineProperty(exports, "getBoardTopLeftDiagonal", { enumerable: true, get: function () { return common_1.getBoardTopLeftDiagonal; } });
Object.defineProperty(exports, "getFreeBoardRowForColumn", { enumerable: true, get: function () { return common_1.getFreeBoardRowForColumn; } });
Object.defineProperty(exports, "getLineCombo", { enumerable: true, get: function () { return common_1.getLineCombo; } });
Object.defineProperty(exports, "getPlayerName", { enumerable: true, get: function () { return common_1.getPlayerName; } });
Object.defineProperty(exports, "insertCoinInColumn", { enumerable: true, get: function () { return common_1.insertCoinInColumn; } });
Object.defineProperty(exports, "intercept", { enumerable: true, get: function () { return common_1.intercept; } });
Object.defineProperty(exports, "joinGame", { enumerable: true, get: function () { return common_1.joinGame; } });
Object.defineProperty(exports, "leaveGame", { enumerable: true, get: function () { return common_1.leaveGame; } });
Object.defineProperty(exports, "printBoard", { enumerable: true, get: function () { return common_1.printBoard; } });
Object.defineProperty(exports, "printCoin", { enumerable: true, get: function () { return common_1.printCoin; } });
Object.defineProperty(exports, "printLine", { enumerable: true, get: function () { return common_1.printLine; } });
Object.defineProperty(exports, "rowColumnToIndex", { enumerable: true, get: function () { return common_1.rowColumnToIndex; } });
__exportStar(require("./common-types"), exports);
var local_server_1 = require("./local-server");
Object.defineProperty(exports, "LocalServer", { enumerable: true, get: function () { return local_server_1.LocalServer; } });
var remote_client_1 = require("./remote-client");
Object.defineProperty(exports, "RemoteClient", { enumerable: true, get: function () { return remote_client_1.RemoteClient; } });
//# sourceMappingURL=client.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computerPlayer = void 0;
const common_1 = require("./common");
const computerPlayer = (playerRole, { board }, executeTurn) => {
    console.clear();
    (0, common_1.printBoard)(board);
    const allowedColumns = [0, 1, 2, 3, 4, 5, 6].filter((column) => (0, common_1.getFreeBoardRowForColumn)(board, column) !== -1);
    const column = allowedColumns[Math.floor(Math.random() * allowedColumns.length)];
    console.clear();
    (0, common_1.insertCoinInColumn)(board, column, playerRole);
    (0, common_1.printBoard)(board);
    executeTurn(column);
};
exports.computerPlayer = computerPlayer;
//# sourceMappingURL=computer-player.js.map
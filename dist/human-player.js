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
exports.humanPlayer = void 0;
const common_1 = require("./common");
const KEY_ENTER = new Uint8Array([13]);
const KEY_ARROW_LEFT = new Uint8Array([27, 91, 68]);
const KEY_ARROW_RIGHT = new Uint8Array([27, 91, 67]);
const KEY_CONTROLC = new Uint8Array([3]);
let abortController = new AbortController();
const selectNumber = (numbers, onChange) => {
    return new Promise((resolve) => {
        abortController.abort();
        abortController = new AbortController();
        const signal = abortController.signal;
        let i = Math.floor(numbers.length / 2);
        const { stdin } = process;
        stdin.setRawMode(true);
        stdin.resume();
        onChange(numbers[i]);
        const listener = (data) => {
            if (signal.aborted) {
                stdin.removeListener('data', listener);
                return;
            }
            if (Buffer.compare(data.subarray(0, KEY_CONTROLC.byteLength), KEY_CONTROLC) === 0) {
                process.exit(0);
            }
            else if (Buffer.compare(data.subarray(0, KEY_ENTER.byteLength), KEY_ENTER) === 0) {
                stdin.pause();
                stdin.removeListener('data', listener);
                stdin.setRawMode(false);
                resolve(numbers[i]);
                return;
            }
            else if (Buffer.compare(data.subarray(0, KEY_ARROW_LEFT.byteLength), KEY_ARROW_LEFT) === 0) {
                if (i === 0) {
                    return;
                }
                i--;
                onChange === null || onChange === void 0 ? void 0 : onChange(numbers[i]);
            }
            else if (Buffer.compare(data.subarray(0, KEY_ARROW_RIGHT.byteLength), KEY_ARROW_RIGHT) === 0) {
                if (i === numbers.length - 1) {
                    return;
                }
                i++;
                onChange === null || onChange === void 0 ? void 0 : onChange(numbers[i]);
            }
        };
        process.stdin.addListener('data', listener);
        signal.onabort = () => {
            resolve(-1);
        };
    });
};
const humanPlayer = (...[playerRole, { board, hasEnded }, executeTurn]) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedColumns = [0, 1, 2, 3, 4, 5, 6].filter((column) => (0, common_1.getFreeBoardRowForColumn)(board, column) !== -1);
    if (playerRole > common_1.EPlayerRole.YELLOW || !allowedColumns.length || hasEnded) {
        console.clear();
        (0, common_1.printBoard)(board);
        return;
    }
    const column = yield selectNumber(allowedColumns, (i) => {
        console.clear();
        console.log(`${' '.repeat(1 + 2 * i)}${(0, common_1.printCoin)(playerRole)}`);
        (0, common_1.printBoard)(board);
    });
    if (column === -1) {
        return;
    }
    (0, common_1.insertCoinInColumn)(board, column, playerRole);
    console.clear();
    (0, common_1.printBoard)(board);
    executeTurn(column);
});
exports.humanPlayer = humanPlayer;
//# sourceMappingURL=human-player.js.map
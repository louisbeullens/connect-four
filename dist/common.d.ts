import { ECoin, EPlayerRole, IInterceptOptions, IJoinOptions, IPlayer, IRoom, IServer, TBoard, TColumn, THandler, TRow } from './common-types';
import 'colors';
export declare const clone: <T extends {}>(obj: T) => any;
export declare const createNewGameState: () => {
    board: ECoin[];
};
/**
 * Converts row and column to board index.
 *
 * @param {TRow} row
 * @param {TColumn} column
 * @returns {number} Index in board.
 */
export declare const rowColumnToIndex: (row: TRow, column: TColumn) => number;
/**
 * Get row from board.
 *
 * @param {TBoard} board
 * @param {TRow} row - 0 = bottom 5 = top.
 * @returns {ECoin[]} Part of board, direction from left to right.
 */
export declare const getBoardRow: (board: TBoard, row: TRow) => ECoin[];
/**
 * Get column from board.
 *
 * @param {TBoard} board
 * @param {TRow} row - 0 = left 6 = right.
 * @returns {ECoin[]} part of board, direction from bottom to top.
 */
export declare const getBoardColumn: (board: TBoard, column: TColumn) => ECoin[];
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
export declare const getBoardTopLeftDiagonal: (board: TBoard, diagonal: TRow) => ECoin[];
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
export declare const getBoardBottomLeftDiagonal: (board: TBoard, diagonal: TRow) => ECoin[];
/**
 * Get maximum connected length found for color in line.
 *
 * @param {ECoin[]} line
 * @param {ECoin} color - color to search for.
 * @returns {number}
 */
export declare const getLineCombo: (line: ECoin[], color: ECoin) => number;
/**
 * Get first free row index or -1
 *
 * @param {TBoard} board
 * @param {TColumn} column
 * @returns {(TRow | -1)}
 */
export declare const getFreeBoardRowForColumn: (board: TBoard, column: TColumn) => -1 | TRow;
/**
 * Inserts color in first free slot of column.
 *
 * @param {TBoard} board
 * @param {TColumn} column
 * @param {ECoin} color
 * @returns {boolean}
 */
export declare const insertCoinInColumn: (board: TBoard, column: TColumn, color: ECoin) => boolean;
/**
 * Returns true when color won the game, false otherwise,
 *
 * @param {TBoard} board
 * @param {ECoin} color
 * @returns {boolean}
 */
export declare const checkBoardForWinner: (board: TBoard, color: ECoin) => boolean;
/**
 * Returns true when board is completely full, false otherwise.
 *
 * @param {TBoard} board
 * @returns {boolean}
 */
export declare const checkBoardForTie: (board: TBoard) => boolean;
/**
 * Get maximum connected length found for color in board.
 * Returns 0 when other player won the game.
 *
 * @param {TBoard} board
 * @param {number} color
 * @returns {number}
 */
export declare const getBoardScore: (board: TBoard, color: number) => number;
/**
 * Returns coin as colored unicode circle or number.
 *
 * @param {ECoin} coin
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export declare const printCoin: (coin: ECoin, useColors?: boolean) => string;
/**
 * Returns line as string.
 *
 * @param {ECoin[]} line
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export declare const printLine: (line: ECoin[], useColors?: boolean) => string;
/**
 * Prints entire board.
 *
 * @param {ECoin[]} board
 * @callback {console~log} [logger=console.log]
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export declare const printBoard: (board: TBoard, logger?: (...args: any[]) => void, useColors?: boolean) => void;
/**
 * Generates playerName based on role,
 *
 * @param {EPlayerRole} playerRole
 * @param {boolean} [useColors=process.stderr.isTTY]
 * @returns {string}
 */
export declare const getPlayerName: (playerRole: EPlayerRole, useColors?: boolean) => string;
export declare const isPlayerRedOrYellow: (player: IPlayer) => boolean;
export declare const getRedAndOrYellowPlayer: (players: IPlayer[]) => {
    role: EPlayerRole;
    isBot?: boolean;
    handler: THandler;
}[];
export declare const hostGame: <T extends {}>(server: IServer, id: string) => IRoom<T>;
export declare const joinGame: <T extends {}>(server: IServer, handler: THandler, options?: IJoinOptions) => Promise<IPlayer<T>>;
export declare const leaveGame: (server: IServer, handler: THandler, roomId: string) => Promise<void>;
export declare const intercept: (server: IServer, handler: THandler, options?: IInterceptOptions) => THandler;
//# sourceMappingURL=common.d.ts.map
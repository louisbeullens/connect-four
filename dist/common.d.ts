import 'colors';
export type TExecuteTurn = (column: TColumn) => void;
export type THandler = (playerId: number, state: IGameState, executeTurn: TExecuteTurn, roomId: string) => void;
export declare enum ECoin {
    NONE = 0,
    RED = 1,
    YELLOW = 2
}
export declare enum EPlayerRole {
    NONE = 0,
    RED = 1,
    YELLOW = 2,
    OBSERVER = 3
}
export type IPlayer<P extends {} = {}> = {
    role: EPlayerRole;
    isBot?: boolean;
    handler: THandler;
} & P;
export interface IRoom<P extends {} = {}> {
    id: string;
    state: IGameState;
    players: IPlayer<P>[];
    broadcast(message: string, excludedPlayer?: IPlayer): void;
}
export interface IJoinOptions {
    roomId?: string;
    filter?: 'waiting' | 'full' | 'all';
}
export interface IServer {
    hostGame(roomId: string): IRoom;
    joinGame(handler: THandler, options?: IJoinOptions): Promise<IPlayer | undefined>;
    leaveGame(handler: THandler, roomId: string): Promise<void>;
    getRoomIds(filter?: IJoinOptions['filter']): Promise<string[]>;
    stop(): void;
}
export type TBoard = ECoin[];
export interface IGameState {
    board: TBoard;
    turn?: EPlayerRole;
    hasEnded?: boolean;
    status?: 'raceConflict' | 'invalidColumn' | 'win' | 'loose';
    lastPlayerId?: number;
    lastPlayerAction?: TColumn;
}
export type TRow = 0 | 1 | 2 | 3 | 4 | 5;
export type TColumn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
interface IInterceptOptions {
    singleGame?: boolean;
    silent?: boolean;
}
export declare const LOG_SCOPE_LOCAL_SERVER = "server";
export declare const clone: <T extends {}>(obj: T) => any;
export declare const createNewGameState: () => {
    board: ECoin[];
};
export declare const rowColumnToIndex: (row: TRow, column: TColumn) => number;
export declare const getBoardRow: (board: TBoard, row: TRow) => ECoin[];
export declare const getBoardColumn: (board: TBoard, column: TColumn) => ECoin[];
export declare const getBoardTopLeftDiagonal: (board: TBoard, diagonal: TRow) => ECoin[];
export declare const getBoardBottomLeftDiagonal: (board: TBoard, diagonal: TRow) => ECoin[];
export declare const checkLineCombo: (line: ECoin[], coin: ECoin) => number;
export declare const getFreeBoardRowForColumn: (board: TBoard, column: TColumn) => -1 | TRow;
export declare const insertCoinInColumn: (board: TBoard, column: TColumn, coin: ECoin) => boolean;
export declare const checkBoardForWinner: (board: TBoard, coin: ECoin) => boolean;
export declare const checkBoardForTie: (board: TBoard) => boolean;
export declare const checkboardForScore: (board: TBoard, coin: number) => number;
export declare const printCoin: (coin: ECoin) => string | ECoin;
export declare const printBoard: (board: TBoard, logger?: (...args: any[]) => void) => void;
export declare const getPlayerName: (playerRole: number) => string;
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
export {};
//# sourceMappingURL=common.d.ts.map
import * as WEBSOCKET from 'websocket';
import { EPlayerRole, IGameState, IJoinOptions, TColumn, TExecuteTurn } from './common-types';
export interface IPlayerExtension {
    connection?: WEBSOCKET.connection;
    executeTurn?: TExecuteTurn;
    uid?: string;
}
type TGameState = Omit<IGameState, 'board'> & {
    board: string;
};
type IMessage = {
    type: 'joinGame';
    payload: {
        roomId: string;
        playerUid: string;
        waitTimeout?: number;
    };
} | {
    type: 'leaveGame';
    payload: {
        roomId: string;
        playerUid: string;
    };
} | {
    type: 'actionRequest';
    payload: {
        roomId: string;
        playerUid?: string;
        playerRole: EPlayerRole;
        state: TGameState;
    };
} | {
    type: 'actionResponse';
    payload: {
        roomId: string;
        playerRole: EPlayerRole;
        column: TColumn;
    };
} | {
    type: 'roomIdsRequest';
    payload: {
        filter: Required<IJoinOptions['filter']>;
    };
} | {
    type: 'roomIdsResponse';
    payload: {
        roomIds: string[];
        filter: Required<IJoinOptions['filter']>;
    };
} | {
    type: 'serverBroadcast';
    payload: string | any[];
};
export declare const parseMessage: (raw: string) => IMessage;
export declare const stringifyMessage: (type: IMessage['type'], payload: IMessage['payload']) => string;
export declare const sendMessage: (connection: WebSocket | WEBSOCKET.connection, type: IMessage['type'], payload: IMessage['payload']) => void;
export {};
//# sourceMappingURL=websocket-common.d.ts.map
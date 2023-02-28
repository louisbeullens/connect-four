import { Option } from 'commander';
export interface ICommandLineOptions {
    port?: number;
    host?: string;
    roomId?: string;
    singleGame?: boolean;
    computer?: boolean;
    human?: boolean;
    observer?: boolean;
    logScopes: string[];
}
export declare const portOption: Option;
export declare const hostOption: Option;
export declare const roomIdOption: Option;
export declare const computerOption: Option;
export declare const humanOption: Option;
export declare const observerOption: Option;
export declare const singleGameOption: Option;
declare const allowedLogScopes: readonly ["board", "client:*", "client:remote", "network:*", "network:websocket", "server"];
type TLogScope = (typeof allowedLogScopes)[number];
export declare const boot: (callback: (options: ICommandLineOptions) => void, ...options: (Option | TLogScope)[]) => void;
export {};
//# sourceMappingURL=boot.d.ts.map
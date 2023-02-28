import { IRoom } from './common';
interface IWebsocketServer {
    start(port: number): Promise<void>;
    stop(): void;
    cleanGame(room: IRoom): void;
}
export declare const RemoteServer: IWebsocketServer;
export {};
//# sourceMappingURL=remote-server.d.ts.map
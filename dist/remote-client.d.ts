import * as WEBSOCKET from 'websocket';
import { IServer } from './common';
interface IWebsocketClient extends IServer {
    start(port: number, host?: string): Promise<WEBSOCKET.w3cwebsocket>;
}
export declare const RemoteClient: IWebsocketClient;
export {};
//# sourceMappingURL=remote-client.d.ts.map
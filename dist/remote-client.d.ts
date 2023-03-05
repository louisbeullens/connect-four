import { IServer } from './common-types';
import 'websocket-polyfill';
interface IWebsocketClient extends IServer {
    start(port: number, host?: string): Promise<WebSocket>;
    connected: boolean;
}
export declare const RemoteClient: IWebsocketClient;
export {};
//# sourceMappingURL=remote-client.d.ts.map
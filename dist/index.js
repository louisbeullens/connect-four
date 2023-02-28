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
const boot_1 = require("./boot");
const client_1 = require("./client");
const common_1 = require("./common");
const computer_player_1 = require("./computer-player");
const human_player_1 = require("./human-player");
const remote_client_1 = require("./remote-client");
(0, boot_1.boot)((bootOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { host, port, singleGame, human, observer, roomId } = bootOptions;
    const player = human ? human_player_1.humanPlayer : computer_player_1.computerPlayer;
    yield remote_client_1.RemoteClient.start(port, host);
    yield (0, client_1.joinGame)(remote_client_1.RemoteClient, (0, common_1.intercept)(remote_client_1.RemoteClient, player, { singleGame, silent: true }), { roomId, filter: observer ? 'full' : 'waiting' });
}), boot_1.hostOption, boot_1.portOption, boot_1.roomIdOption, boot_1.singleGameOption, boot_1.computerOption, boot_1.humanOption, boot_1.observerOption, common_1.LOG_SCOPE_LOCAL_SERVER, 'board');
//# sourceMappingURL=index.js.map
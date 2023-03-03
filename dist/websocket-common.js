"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.stringifyMessage = exports.parseMessage = void 0;
const debug_1 = require("debug");
const WEBSOCKET = require("websocket");
const socketLogger = (0, debug_1.default)('network:websocket');
const parseMessage = (raw) => {
    const message = JSON.parse(raw);
    socketLogger('receive', raw);
    return message;
};
exports.parseMessage = parseMessage;
const stringifyMessage = (type, payload) => {
    const message = { type, payload };
    return JSON.stringify(message);
};
exports.stringifyMessage = stringifyMessage;
const sendMessage = (connection, type, payload) => {
    const message = (0, exports.stringifyMessage)(type, payload);
    setTimeout(() => {
        socketLogger('send', message);
        if (connection instanceof WEBSOCKET.w3cwebsocket) {
            if (connection.readyState !== connection.OPEN) {
                return;
            }
        }
        else if (connection instanceof WEBSOCKET.connection) {
            if (!connection.connected) {
                return;
            }
        }
        connection.send(message);
    }, 1);
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=websocket-common.js.map
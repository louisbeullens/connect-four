"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boot = exports.observerOption = exports.humanOption = exports.computerOption = exports.singleGameOption = exports.waitTimeoutOption = exports.roomIdOption = exports.hostOption = exports.portOption = void 0;
const commander_1 = require("commander");
const debug_1 = require("debug");
const client_1 = require("./client");
const common_types_1 = require("./common-types");
debug_1.default.formatArgs = function (args) {
    const { namespace: name, useColors } = this;
    if (useColors) {
        if (name === 'board') {
            args[0] = '  ' + args[0];
            return;
        }
        const c = this.color;
        const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
        const prefix = `  ${colorCode};1m${name} \u001B[0m`;
        args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    }
    else {
        args[0] = new Date().toISOString() + ' ' + name + ': ' + args[0];
    }
};
debug_1.default.formatters.P = (playerRole) => (0, client_1.getPlayerName)(playerRole);
const myParseInt = (value) => Number(value);
exports.portOption = new commander_1.Option('-p, --port [port]', 'Specify custom port.').argParser(myParseInt).default(3000);
exports.hostOption = new commander_1.Option('-h, --host [host]', 'Specify custom host.').default('localhost');
exports.roomIdOption = new commander_1.Option('-r, --room-id [roomId]', 'Specify unique name for your game.').argParser((value) => (value ? value : undefined));
exports.waitTimeoutOption = new commander_1.Option('-w, --wait-timeout [waitTimeout]', 'Time oponent gets to join, in ms.').argParser(myParseInt);
exports.singleGameOption = new commander_1.Option('-s, --single-game', 'Play a single game.').default(false);
exports.computerOption = new commander_1.Option('-C, --computer', 'Let computer play.').default(true);
exports.humanOption = new commander_1.Option('-H, --human', 'Play as human.').default(false);
exports.observerOption = new commander_1.Option('-O, --observer', 'Observe others play.').default(false);
const allowedLogScopes = ['board', 'client:*', 'client:remote', 'network:*', 'network:websocket', common_types_1.LOG_SCOPE_LOCAL_SERVER];
const logScopesArgument = new commander_1.Argument('[logScopes...]').argOptional().choices(allowedLogScopes);
const boot = (callback, ...options) => {
    const program = new commander_1.Command();
    const defaultLogScopes = [];
    options.forEach((option) => {
        if (typeof option === 'string') {
            defaultLogScopes.push(option);
        }
        else if (option instanceof commander_1.Option) {
            program.addOption(option);
        }
    });
    program.addArgument(logScopesArgument.default(defaultLogScopes));
    program.action((logScopes) => {
        const options = program.opts();
        debug_1.default.enable(logScopes.join(','));
        callback(options);
    });
    program.parse();
};
exports.boot = boot;
//# sourceMappingURL=boot.js.map
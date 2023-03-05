"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLUMN_MAX = exports.COLUMN_MIN = exports.ROW_MAX = exports.ROW_MIN = exports.LOG_SCOPE_LOCAL_SERVER = exports.EPlayerRole = exports.ECoin = void 0;
var ECoin;
(function (ECoin) {
    ECoin[ECoin["NONE"] = 0] = "NONE";
    ECoin[ECoin["RED"] = 1] = "RED";
    ECoin[ECoin["YELLOW"] = 2] = "YELLOW";
})(ECoin = exports.ECoin || (exports.ECoin = {}));
var EPlayerRole;
(function (EPlayerRole) {
    EPlayerRole[EPlayerRole["NONE"] = 0] = "NONE";
    EPlayerRole[EPlayerRole["RED"] = 1] = "RED";
    EPlayerRole[EPlayerRole["YELLOW"] = 2] = "YELLOW";
    EPlayerRole[EPlayerRole["OBSERVER"] = 3] = "OBSERVER";
})(EPlayerRole = exports.EPlayerRole || (exports.EPlayerRole = {}));
exports.LOG_SCOPE_LOCAL_SERVER = 'server';
exports.ROW_MIN = 0;
exports.ROW_MAX = 5;
exports.COLUMN_MIN = 0;
exports.COLUMN_MAX = 6;
//# sourceMappingURL=common-types.js.map
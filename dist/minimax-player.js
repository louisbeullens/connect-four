/* eslint-disable prettier/prettier */
(() => {
    "use strict";
    var e = { 143: e => { e.exports = require("connect-four"); } }, o = {};
    function r(t) { var n = o[t]; if (void 0 !== n)
        return n.exports; var s = o[t] = { exports: {} }; return e[t](s, s.exports, r), s.exports; }
    var t = {};
    (() => { var e = t; Object.defineProperty(e, "__esModule", { value: !0 }), e.computerPlayer = void 0; const o = r(143); e.computerPlayer = (e, { board: r, turn: t }, n) => { console.clear(), (0, o.printBoard)(r); const s = t ? ((e, r) => { const t = [0, 1, 2, 3, 4, 5, 6].filter((r => -1 !== (0, o.getFreeBoardRowForColumn)(e, r))), n = []; for (const s of t) {
        const c = [...e];
        (0, o.insertCoinInColumn)(c, s, r);
        const l = (0, o.checkboardForScore)(c, r), a = t.filter((e => -1 !== (0, o.getFreeBoardRowForColumn)(c, e)));
        let u = 0;
        for (const e of a) {
            const t = [...c];
            (0, o.insertCoinInColumn)(t, e, 3 - r), u = Math.max((0, o.checkboardForScore)(t, 3 - r), u);
        }
        n.push([u, l, s]);
    } const s = n.sort((([e], [o]) => e - o)); let c = s.findIndex((e => e[0] !== s[0][0])); -1 === c && (c = s.length); let l = s.slice(0, c); l.length || (l = s); const a = l.sort((([, e], [, o]) => o - e)).map((([, , e]) => e)); return a[Math.floor(Math.random() * a.length)]; })(r, e) : 3; n(s); }; })(), exports.__esModule = t.__esModule, exports.computerPlayer = t.computerPlayer, Object.defineProperty(exports, "__esModule", { value: !0 });
})();
//# sourceMappingURL=minimax-player.js.map
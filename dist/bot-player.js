/* eslint-disable prettier/prettier */
(() => {
    "use strict";
    var e = { 943: (e, t, o) => { Object.defineProperty(t, "__esModule", { value: !0 }), t.computerPlayer = t.getScore = t.getLineCombos = void 0; const r = o(143); t.getLineCombos = (e, t) => { const o = []; let r = 0, n = 0; const a = e => { 0 !== r && o.push({ start: n, end: n + r }), n = e + 1, r = 0; }; return e.forEach(((e, o) => { e !== t ? a(o) : r++; })), a(e.length), o; }; const n = (e, o, r, n) => { const a = 3 - o, s = r ? e : [a, ...e, a]; let l, i; r = null != r ? r : (0, t.getLineCombos)(s, o); let c = -1; for (const e of r) {
            const { start: t, end: o } = e, r = t - s.slice(0, t).reverse().indexOf(a) - 1, n = s.slice(o).indexOf(a) + o, d = n - r - 1 >= 4 ? o - t : 0;
            d > c && (l = null != l ? l : e, i = null != i ? i : { start: r, end: n }, c = d);
        } return Math.max(0, c); }; t.getScore = (e, t) => { const o = 3 - t; if ((0, r.checkBoardForWinner)(e, o))
            return 0; let a = 0; for (let o = r.ROW_MIN; o <= r.ROW_MAX; o++)
            a = Math.max(n((0, r.getBoardRow)(e, o), t), a); for (let o = r.COLUMN_MIN; o <= r.COLUMN_MAX; o++)
            a = Math.max(n((0, r.getBoardColumn)(e, o), t), a); for (let o = r.ROW_MIN; o <= r.ROW_MAX; o++)
            a = Math.max(n((0, r.getBoardTopLeftDiagonal)(e, o), t), a); for (let o = r.ROW_MIN; o <= r.ROW_MAX; o++)
            a = Math.max(n((0, r.getBoardBottomLeftDiagonal)(e, o), t), a); return a; }; const a = (e, o, a) => { const s = 3 - a, l = (0, r.getFreeBoardRowForColumn)(e, o); if (-1 === l)
            return [0, 0, 0]; (0, r.insertCoinInColumn)(e, o, a); let i = 0, c = 0; const d = l === r.ROW_MIN && o === Math.floor(r.COLUMN_MAX / 2) ? 1 : 0; let M = [s, ...(0, r.getBoardRow)(e, l), s], m = (0, t.getLineCombos)(M, a), u = m.find((e => o + 1 >= e.start && o + 1 < e.end)); c = c || (u.start - 1 > 0 && M[u.start - 1] === s || u.end < r.COLUMN_MAX + 2 && M[u.end] === s ? 1 : 0); let f = M.slice(u.start - 1, u.end + 1); i = Math.max(n(M, a, [u]), i), M = [s, ...(0, r.getBoardColumn)(e, o), s], m = (0, t.getLineCombos)(M, a), u = m.find((e => l + 1 >= e.start && l + 1 < e.end)), f = M.slice(u.start - 1, u.end + 1), i = Math.max(n(M, a, [u]), i); let g = o - l + 2, h = o - Math.max(0, g - 2); if (g >= r.ROW_MIN && g <= r.ROW_MAX) {
            let o = (0, r.getBoardBottomLeftDiagonal)(e, g);
            h < o.length && (M = [s, ...o, s], m = (0, t.getLineCombos)(M, a), u = m.find((e => h + 1 >= e.start && h + 1 < e.end)), f = M.slice(u.start - 1, u.end + 1), i = Math.max(n(M, a, [u]), i));
        } if (g = o + l - 3, h = o - Math.max(0, g - 2), g >= r.ROW_MIN && g <= r.ROW_MAX) {
            let o = (0, r.getBoardTopLeftDiagonal)(e, g);
            h < o.length && (M = [s, ...o, s], m = (0, t.getLineCombos)(M, a), u = m.find((e => h + 1 >= e.start && h + 1 < e.end)), f = M.slice(u.start - 1, u.end + 1), i = Math.max(n(M, a, [u]), i));
        } return [i, c, d]; }; t.computerPlayer = (e, { board: o, turn: n, hasEnded: s }, l) => { if ((0, r.printBoard)(o), s)
            return; const i = ((e, o) => { const n = 3 - o, s = [0, 1, 2, 3, 4, 5, 6].filter((t => -1 !== (0, r.getFreeBoardRowForColumn)(e, t))), l = []; for (const i of s) {
            const [c, d, M] = a([...e], i, o), m = [...e];
            (0, r.insertCoinInColumn)(m, i, o);
            const u = s.filter((e => -1 !== (0, r.getFreeBoardRowForColumn)(m, e)));
            let f = 7, g = 0;
            for (const e of u) {
                const a = [...m];
                (0, r.insertCoinInColumn)(a, e, n), f = Math.min((0, t.getScore)(a, o), f), g = Math.max((0, t.getScore)(a, n), g);
            }
            l.push([i, 1e4 * M - 1e3 * g + 100 * f + 10 * c + d]);
        } l.sort((([, e], [, t]) => t - e)); const i = l.findIndex((e => e[1] !== l[0][1])), c = (i > 0 ? l.slice(0, i) : l).map((([e]) => e)), d = Math.floor(Math.random() * c.length); return console.log(l), console.log(c, c[d]), c[d]; })(o, e); l(i); }; }, 143: e => { e.exports = require("./client"); } }, t = {}, o = function o(r) { var n = t[r]; if (void 0 !== n)
        return n.exports; var a = t[r] = { exports: {} }; return e[r](a, a.exports, o), a.exports; }(943);
    exports.__esModule = o.__esModule, exports.computerPlayer = o.computerPlayer, exports.getLineCombos = o.getLineCombos, exports.getScore = o.getScore, Object.defineProperty(exports, "__esModule", { value: !0 });
})();
//# sourceMappingURL=bot-player.js.map
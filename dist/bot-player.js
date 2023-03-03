/* eslint-disable prettier/prettier */
(() => {
    "use strict";
    var t = { 943: (t, e, o) => { Object.defineProperty(e, "__esModule", { value: !0 }), e.computerPlayer = e.getScore = e.getLineCombos = void 0; const r = o(143); e.getLineCombos = (t, e) => { const o = []; let r = 0, n = 0; const a = t => { 0 !== r && o.push({ start: n, end: n + r }), n = t + 1, r = 0; }; return t.forEach(((t, o) => { t !== e ? a(o) : r++; })), a(t.length), o; }; const n = (t, o, r, n) => { const a = 3 - o, s = r ? t : [a, ...t, a]; let l, d; r = null != r ? r : (0, e.getLineCombos)(s, o); let i = -1; for (const t of r) {
            const { start: e, end: o } = t, r = e - s.slice(0, e).reverse().indexOf(a) - 1, n = s.slice(o).indexOf(a) + o, c = n - r - 1 >= 4 ? o - e : 0;
            c > i && (l = null != l ? l : t, d = null != d ? d : { start: r, end: n }, i = c);
        } return Math.max(0, i); }; e.getScore = (t, e) => { const o = 3 - e; if ((0, r.checkBoardForWinner)(t, o))
            return 0; let a = 0; for (let o = r.ROW_MIN; o <= r.ROW_MAX; o++)
            a = Math.max(n((0, r.getBoardRow)(t, o), e), a); for (let o = r.COLUMN_MIN; o <= r.COLUMN_MAX; o++)
            a = Math.max(n((0, r.getBoardColumn)(t, o), e), a); for (let o = r.ROW_MIN; o <= r.ROW_MAX; o++)
            a = Math.max(n((0, r.getBoardTopLeftDiagonal)(t, o), e), a); for (let o = r.ROW_MIN; o <= r.ROW_MAX; o++)
            a = Math.max(n((0, r.getBoardBottomLeftDiagonal)(t, o), e), a); return a; }; const a = (t, o, a) => { const s = 3 - a, l = (0, r.getFreeBoardRowForColumn)(t, o); if (-1 === l)
            return [0, 0, 0]; (0, r.insertCoinInColumn)(t, o, a); let d = 0, i = 0; const c = l === r.ROW_MIN && o === Math.floor(r.COLUMN_MAX / 2) ? 1 : 0; let M = [s, ...(0, r.getBoardRow)(t, l), s], m = (0, e.getLineCombos)(M, a), u = m.find((t => o + 1 >= t.start && o + 1 < t.end)); i = i || (u.start - 1 > 0 && M[u.start - 1] === s || u.end < r.COLUMN_MAX + 2 && M[u.end] === s ? 1 : 0); let f = M.slice(u.start - 1, u.end + 1); d = Math.max(n(M, a, [u]), d), M = [s, ...(0, r.getBoardColumn)(t, o), s], m = (0, e.getLineCombos)(M, a), u = m.find((t => l + 1 >= t.start && l + 1 < t.end)), i = i || (u.start - 1 > 0 && M[u.start - 1] === s || u.end < r.ROW_MAX + 2 && M[u.end] === s ? 1 : 0), f = M.slice(u.start - 1, u.end + 1), d = Math.max(n(M, a, [u]), d); let g = o - l + 2, h = o - Math.max(0, g - 2); if (g >= r.ROW_MIN && g <= r.ROW_MAX) {
            let o = (0, r.getBoardBottomLeftDiagonal)(t, g);
            h < o.length && (M = [s, ...o, s], m = (0, e.getLineCombos)(M, a), u = m.find((t => h + 1 >= t.start && h + 1 < t.end)), i = i || (u.start - 1 > 0 && M[u.start - 1] === s || u.end < M.length - 1 && M[u.end] === s ? 1 : 0), f = M.slice(u.start - 1, u.end + 1), d = Math.max(n(M, a, [u]), d));
        } if (g = o + l - 3, h = o - Math.max(0, g - 2), g >= r.ROW_MIN && g <= r.ROW_MAX) {
            let o = (0, r.getBoardTopLeftDiagonal)(t, g);
            h < o.length && (M = [s, ...o, s], m = (0, e.getLineCombos)(M, a), u = m.find((t => h + 1 >= t.start && h + 1 < t.end)), i = i || (u.start - 1 > 0 && M[u.start - 1] === s || u.end < M.length - 1 && M[u.end] === s ? 1 : 0), f = M.slice(u.start - 1, u.end + 1), d = Math.max(n(M, a, [u]), d));
        } return [d, i, c]; }; e.computerPlayer = (t, { board: o, turn: n, hasEnded: s }, l) => { if (s)
            return; const d = ((t, o) => { const n = 3 - o, s = [0, 1, 2, 3, 4, 5, 6].filter((e => -1 !== (0, r.getFreeBoardRowForColumn)(t, e))), l = []; for (const d of s) {
            const [i, c, M] = a([...t], d, o), m = [...t];
            (0, r.insertCoinInColumn)(m, d, o);
            const u = s.filter((t => -1 !== (0, r.getFreeBoardRowForColumn)(m, t)));
            let f = 7, g = 0;
            for (const t of u) {
                const a = [...m];
                (0, r.insertCoinInColumn)(a, t, n), f = Math.min((0, e.getScore)(a, o), f), g = Math.max((0, e.getScore)(a, n), g);
            }
            l.push([d, 1e4 * M - 1e3 * g + 100 * f + 10 * i + c]);
        } l.sort((([, t], [, e]) => e - t)); const d = l.findIndex((t => t[1] !== l[0][1])), i = (d > 0 ? l.slice(0, d) : l).map((([t]) => t)); return i[Math.floor(Math.random() * i.length)]; })(o, t); l(d); }; }, 143: t => { t.exports = require("./client"); } }, e = {}, o = function o(r) { var n = e[r]; if (void 0 !== n)
        return n.exports; var a = e[r] = { exports: {} }; return t[r](a, a.exports, o), a.exports; }(943);
    exports.__esModule = o.__esModule, exports.computerPlayer = o.computerPlayer, exports.getLineCombos = o.getLineCombos, exports.getScore = o.getScore, Object.defineProperty(exports, "__esModule", { value: !0 });
})();
//# sourceMappingURL=bot-player.js.map
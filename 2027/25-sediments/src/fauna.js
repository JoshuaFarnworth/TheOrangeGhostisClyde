/* Sediments - fauna: side-view anatomy shared by flesh and skeleton.
 * One rig per animal (spine, neck, head axis, four legs of joints, tail) in body-length units. Flesh outlines and the
 * skeleton are both built from it, so a carcass decays from one into the other without jumping.
 * Proportions are schematic, taken from standard lateral skeletal mounts and life reconstructions (woolly mammoth:
 * high domed skull, short neck, shoulder hump, back sloping to low hips, columnar legs, spiral tusks; bison: tall
 * thoracic spines under the hump). Disarticulation order follows the general sequence reported for large mammals
 * in the open (Hill 1979; Hill & Behrensmeyer 1984): forelimb + scapula first (no bony joint to the trunk), then tail,
 * skull and mandible, hind limbs, ribs, vertebral column last. Order and timings are approximate (from knowledge).
 */
var FAUNA = (function () {
  'use strict';
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sst(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function rot(p, c, a) { var s = Math.sin(a), k = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * k - y * s, c[1] + x * s + y * k]; }
  function spline(P, n, closed) {
    var out = [], m = P.length, segs = closed ? m : m - 1, i, k;
    for (i = 0; i < segs; i++) {
      var p0 = closed ? P[(i - 1 + m) % m] : P[Math.max(0, i - 1)], p1 = P[i], p2 = P[(i + 1) % m], p3 = closed ? P[(i + 2) % m] : P[Math.min(m - 1, i + 2)];
      for (k = 0; k < n; k++) { var t = k / n, t2 = t * t, t3 = t2 * t, q = [0, 0];
        for (var d = 0; d < 2; d++) q[d] = 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3);
        out.push(q); } }
    if (!closed) out.push(P[m - 1].slice());
    return out; }
  // polyline + half-widths -> closed outline (rounded-ish caps)
  function stroke(pts, ws, n) {
    var P = n ? spline(pts, n, false) : pts.map(function (p) { return p.slice(); }), W = [], i, Lf = [], Rt = [];
    for (i = 0; i < P.length; i++) { var f = i / (P.length - 1) * (ws.length - 1), k = Math.min(ws.length - 2, Math.floor(f)); W.push(ws.length === 1 ? ws[0] : lerp(ws[k], ws[k + 1], f - k)); }
    for (i = 0; i < P.length; i++) { var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      Lf.push([P[i][0] + nx * W[i], P[i][1] + ny * W[i]]); Rt.push([P[i][0] - nx * W[i], P[i][1] - ny * W[i]]); }
    var e = P.length - 1, te = [P[e][0] - P[e - 1][0], P[e][1] - P[e - 1][1]], tl = Math.hypot(te[0], te[1]) || 1, ts = [P[1][0] - P[0][0], P[1][1] - P[0][1]], sl = Math.hypot(ts[0], ts[1]) || 1;
    var capE = [P[e][0] + te[0] / tl * W[e] * 0.7, P[e][1] + te[1] / tl * W[e] * 0.7], capS = [P[0][0] - ts[0] / sl * W[0] * 0.7, P[0][1] - ts[1] / sl * W[0] * 0.7];
    return Lf.concat([capE], Rt.reverse(), [capS]); }
  // ---- species (units of body length L, rump to chest front; ground y = 0, facing +x) ----
  var SP = {
    mammoth: { type: 'proboscid', hip: 0.60, wit: 0.80, hump: 0.07, chest: 0.34, belly: 0.30, neck: 0.05, neckA: 0.3, headA: -0.42, hl: 0.21, hh: 0.27, legW: 0.062, tail: 0.13, hair: 0.075, hide: '#4a3424', hideHi: '#8a6a48', vert: [7, 19, 4, 4, 16], spine: [0.15, 0.035], ribD: 0.4 },
    mastodon: { type: 'proboscid', hip: 0.62, wit: 0.72, hump: 0.02, chest: 0.32, belly: 0.30, neck: 0.06, neckA: 0.2, headA: -0.35, hl: 0.2, hh: 0.22, legW: 0.06, tail: 0.15, hair: 0.03, hide: '#4b3a2c', hideHi: '#7a6450', vert: [7, 19, 4, 4, 18], spine: [0.12, 0.035], ribD: 0.38, low: 1 },
    bison: { type: 'bovid', hip: 0.53, wit: 0.62, hump: 0.12, chest: 0.27, belly: 0.25, neck: 0.12, neckA: -0.05, headA: -1.15, hl: 0.24, hh: 0.15, legW: 0.032, tail: 0.2, hair: 0.05, horn: 0.1, hide: '#3d2b1f', hideHi: '#6e5038', vert: [7, 14, 5, 5, 14], spine: [0.2, 0.035], ribD: 0.34 },
    cow: { type: 'bovid', hip: 0.6, wit: 0.6, hump: 0.0, chest: 0.3, belly: 0.27, neck: 0.16, neckA: 0.25, headA: -1.0, hl: 0.24, hh: 0.13, legW: 0.03, tail: 0.35, hair: 0.0, horn: 0.05, hide: '#6b4a34', hideHi: '#9b7a5c', vert: [7, 13, 6, 5, 18], spine: [0.08, 0.03], ribD: 0.3 },
    horse: { type: 'equid', hip: 0.64, wit: 0.66, hump: 0.0, chest: 0.36, belly: 0.36, neck: 0.32, neckA: 0.85, headA: -1.05, hl: 0.3, hh: 0.12, legW: 0.024, tail: 0.38, hair: 0.0, mane: 1, hide: '#6a4c32', hideHi: '#9c7a56', vert: [7, 18, 6, 5, 16], spine: [0.1, 0.025], ribD: 0.28 },
    deer: { type: 'cervid', hip: 0.66, wit: 0.64, hump: 0.0, chest: 0.4, belly: 0.4, neck: 0.3, neckA: 0.95, headA: -0.8, hl: 0.24, hh: 0.1, legW: 0.017, tail: 0.1, hair: 0.0, antler: 1, hide: '#7a5a3e', hideHi: '#a8865f', vert: [7, 13, 6, 4, 10], spine: [0.07, 0.025], ribD: 0.24 },
    wolf: { type: 'canid', hip: 0.56, wit: 0.58, hump: 0.0, chest: 0.3, belly: 0.33, neck: 0.2, neckA: 0.6, headA: -0.25, hl: 0.24, hh: 0.11, legW: 0.022, tail: 0.38, hair: 0.03, hide: '#6e675e', hideHi: '#a49c90', vert: [7, 13, 7, 3, 20], spine: [0.06, 0.03], ribD: 0.24 },
    dog: { type: 'canid', hip: 0.55, wit: 0.56, hump: 0.0, chest: 0.3, belly: 0.33, neck: 0.2, neckA: 0.6, headA: -0.2, hl: 0.22, hh: 0.11, legW: 0.022, tail: 0.32, hair: 0.02, hide: '#6b5440', hideHi: '#9e8466', vert: [7, 13, 7, 3, 20], spine: [0.06, 0.03], ribD: 0.24 },
    bear: { type: 'ursid', hip: 0.5, wit: 0.56, hump: 0.06, chest: 0.24, belly: 0.22, neck: 0.18, neckA: 0.2, headA: -0.4, hl: 0.22, hh: 0.14, legW: 0.045, tail: 0.04, hair: 0.05, hide: '#3a2c22', hideHi: '#6a5442', vert: [7, 14, 6, 5, 8], spine: [0.08, 0.03], ribD: 0.3 },
    pig: { type: 'suid', hip: 0.45, wit: 0.46, hump: 0.0, chest: 0.16, belly: 0.14, neck: 0.1, neckA: 0.1, headA: -0.55, hl: 0.26, hh: 0.14, legW: 0.028, tail: 0.1, hair: 0.0, hide: '#8a6e62', hideHi: '#b49688', vert: [7, 14, 6, 4, 20], spine: [0.06, 0.025], ribD: 0.3 }
  };
  SP.beaver = SP.dog;
  function spec(sp) { return SP[sp] || SP.deer; }
  // ---- rig ----
  function rig(sp, L, pose, st) {
    var s = spec(sp), R = { s: s, L: L };
    function P(x, y) { return [x * L, y * L]; }
    var hip = s.hip, wit = s.wit, top = function (u) {   // dorsal line height (hair excluded)
      var r = u < 0.12 ? lerp(hip * 0.93, hip, u / 0.12) : u < 0.7 ? lerp(hip, wit, sst(0.12, 0.7, u)) : wit;
      return r + s.hump * Math.exp(-Math.pow((u - 0.66) / 0.14, 2)); };
    R.top = top;
    var spLen = function (u) { return u < 0.36 ? s.spine[1] * 0.8 : lerp(s.spine[1], s.spine[0], sst(0.36, 0.68, u)) * (u > 0.8 ? lerp(1, 0.6, (u - 0.8) / 0.1) : 1); };
    // vertebral column (centra) from sacrum to first thoracic
    R.col = function (u) { return top(u) - spLen(u) - 0.035; };
    var T0 = P(0.84, R.col(0.84));
    var na = s.neckA, ha = s.headA, sink = 0, low = 0;
    if (pose === 'graze') { na = -0.95; ha = -1.6; }
    if (pose === 'mired') { na -= 0.4; ha -= 0.7; sink = st.sink || 0; }
    if (pose === 'sternal') { na = Math.min(na, 0.05) - 0.25; ha = s.type === 'proboscid' ? -0.6 : -0.15; low = 1; }
    var Hb = [T0[0] + Math.cos(na) * s.neck * L, T0[1] + Math.sin(na) * s.neck * L];
    R.neck = [T0, Hb]; R.headA = ha; R.Hb = Hb;
    // legs: [top joint, mid, low, foot] (front near/far, hind near/far)
    var colm = s.type === 'proboscid' || s.type === 'ursid';
    function front(dx) { return colm ? [P(0.79 + dx, s.chest + 0.2), P(0.765 + dx, s.chest - 0.02), P(0.775 + dx, 0.09), P(0.79 + dx, 0.012)]
                                      : [P(0.83 + dx, s.chest + 0.14), P(0.78 + dx, s.chest - 0.01), P(0.8 + dx, 0.13), P(0.81 + dx, 0.035), P(0.83 + dx, 0.0)]; }
    function hind(dx) { return colm ? [P(0.17 + dx, hip * 0.8), P(0.2 + dx, hip * 0.46), P(0.18 + dx, 0.09), P(0.17 + dx, 0.012)]
                                     : [P(0.17 + dx, hip * 0.78), P(0.24 + dx, hip * 0.47), P(0.11 + dx, hip * 0.3), P(0.13 + dx, 0.04), P(0.15 + dx, 0.0)]; }
    R.legs = [front(0), front(0.035), hind(0), hind(-0.03)];
    R.legs[1].far = R.legs[3].far = 1;
    if (low) {   // sternal: fold legs, lower the body onto the ground
      var dz = (s.belly - 0.035) * L;
      R.legs = R.legs.map(function (lg, i) { var f = i < 2, x0 = lg[0][0], y0 = lg[0][1], fl;
        fl = f ? [[x0, y0], [x0 - 0.03 * L, 0.06 * L + dz], [x0 - 0.16 * L, 0.035 * L + dz], [x0 - 0.1 * L, 0.02 * L + dz]] : [[x0, y0], [x0 + 0.1 * L, 0.07 * L + dz], [x0 - 0.06 * L, 0.04 * L + dz], [x0 + 0.06 * L, 0.02 * L + dz]];
        fl.far = lg.far; return fl; });
      R.drop = dz; } else R.drop = 0;
    R.sink = sink;
    R.tail = [P(0.03, hip * 0.97), P(-0.01, hip * 0.97 - s.tail * 0.5), P(-0.02, hip * 0.97 - s.tail)];
    // whole-body offsets
    R.dy = -sink - R.drop;
    return R; }
  // ---- head shapes (head frame: origin at occiput, u forward along axis, v up; units L) ----
  function headPts(s) {
    switch (s.type) {
      case 'proboscid': return [[0, 0], [-0.025, 0.08], [0.015, 0.17], [0.07, 0.2], [0.13, 0.16], [0.18, 0.06], [0.205, -0.04], [0.2, -0.11], [0.16, -0.16], [0.09, -0.175], [0.03, -0.14], [-0.015, -0.07]];
      case 'bovid': return [[0, 0.03], [0.05, 0.075], [0.14, 0.07], [0.24, 0.035], [0.27, -0.01], [0.26, -0.05], [0.2, -0.06], [0.1, -0.085], [0.03, -0.07], [-0.01, -0.03]];
      case 'equid': return [[0, 0.03], [0.06, 0.06], [0.2, 0.045], [0.3, 0.02], [0.32, -0.02], [0.29, -0.045], [0.2, -0.045], [0.08, -0.075], [0.01, -0.05]];
      case 'cervid': return [[0, 0.03], [0.06, 0.055], [0.16, 0.035], [0.25, 0.005], [0.255, -0.025], [0.2, -0.035], [0.08, -0.055], [0.01, -0.04]];
      case 'canid': return [[0, 0.04], [0.07, 0.07], [0.15, 0.04], [0.25, 0.01], [0.26, -0.02], [0.19, -0.035], [0.08, -0.06], [0.0, -0.04]];
      case 'suid': return [[0, 0.05], [0.08, 0.08], [0.2, 0.035], [0.28, 0.0], [0.28, -0.035], [0.2, -0.045], [0.08, -0.08], [0.0, -0.05]];
      default: return [[0, 0.05], [0.09, 0.08], [0.18, 0.04], [0.23, 0.0], [0.22, -0.04], [0.1, -0.08], [0, -0.05]];
    } }
  function toWorld(R, pts, sc) { var a = R.headA, k = Math.cos(a), sn = Math.sin(a); sc = sc || R.L;
    return pts.map(function (q) { return [R.Hb[0] + (q[0] * k - q[1] * sn) * sc, R.Hb[1] + (q[0] * sn + q[1] * k) * sc]; }); }
  // ---- flesh ----
  function flesh(R, st) {
    var s = R.s, L = R.L, parts = [], u, i, top = R.top, bloat = st.bloat || 0, low = R.drop > 0;
    var bodyTop = [], bodyBot = [];
    for (i = 0; i <= 18; i++) { u = 0.02 + 0.84 * i / 18; bodyTop.push([u * L, (top(u) + 0.012 + 0.09 * bloat * Math.sin(Math.PI * clamp((u - 0.05) / 0.8, 0, 1))) * L]); }
    var chest = s.chest + (low ? 0 : -0.03 * bloat), belly = s.belly - (low ? 0.02 * bloat : 0.12 * bloat);
    bodyBot = [[0.92 * L, (chest + 0.17) * L], [0.9 * L, (chest + 0.05) * L], [0.82 * L, chest * L], [0.62 * L, (belly - 0.005) * L], [0.45 * L, (belly - 0.01) * L], [0.3 * L, (belly + 0.02) * L], [0.18 * L, (s.hip * 0.62) * L], [0.03 * L, s.hip * 0.66 * L], [-0.005 * L, s.hip * 0.82 * L]];
    var body = spline(bodyTop.concat([[0.9 * L, (top(0.86) + 0.0) * L - 0.02 * L]], bodyBot), 3, true);
    parts.push({ poly: body, tag: 'torso' });
    // neck (thick), head
    var hb = R.Hb, T0 = R.neck[0], nW = s.type === 'proboscid' ? 0.2 : s.type === 'bovid' ? 0.14 : 0.08;
    parts.push({ poly: stroke([[T0[0] - 0.04 * L, T0[1] - 0.02 * L], [(T0[0] + hb[0]) / 2, (T0[1] + hb[1]) / 2], hb], [nW * L, nW * 0.85 * L, s.hh * 0.45 * L], 3), tag: 'neck' });
    var hp = toWorld(R, headPts(s)); parts.push({ poly: spline(hp, 3, true), tag: 'head' });
    // legs
    R.legs.forEach(function (lg) { var w = s.legW * L, ws = lg.length === 4 ? [w * 1.6, w * 1.15, w, w * 1.05] : [w * 1.9, w * 1.25, w * 0.75, w * 0.62, w * 0.7];
      parts.push({ poly: stroke(lg, ws, 3), tag: 'leg', far: lg.far }); });
    // trunk (proboscideans): hangs from the face to the ground or the mud
    var ext = [];
    if (s.type === 'proboscid') { var tb = toWorld(R, [[0.18, -0.06]])[0], gy = R.dy + 0.03 * L, tw = 0.062 * L;
      var t1 = [tb[0] + 0.03 * L, Math.max(gy, tb[1] - 0.16 * L)], t2 = [tb[0] + 0.02 * L, Math.max(gy, tb[1] - 0.34 * L)], t3 = [tb[0] + (t2[1] <= gy + 1e-3 ? 0.12 : 0.05) * L, Math.max(gy, tb[1] - 0.46 * L)], t4 = [t3[0] + 0.05 * L, Math.max(gy, t3[1] + 0.025 * L)];
      parts.push({ poly: stroke([tb, t1, t2, t3, t4], [tw, tw * 0.8, tw * 0.6, tw * 0.42, tw * 0.3], 3), tag: 'trunk' });
      var ear = toWorld(R, [[0.02, 0.0], [0.035, 0.07], [0.06, 0.06], [0.065, -0.02], [0.04, -0.06]]); ext.push({ poly: spline(ear, 3, true), tag: 'ear' }); }
    if (s.tail) parts.push({ poly: stroke(R.tail, [0.014 * L, 0.009 * L, 0.006 * L], 3), tag: 'tail' });
    if (s.mane) parts.push({ poly: stroke([[T0[0] - 0.02 * L, T0[1] + 0.06 * L], [(T0[0] + hb[0]) / 2, (T0[1] + hb[1]) / 2 + 0.05 * L], [hb[0], hb[1] + 0.04 * L]], [0.02 * L, 0.025 * L, 0.012 * L], 3), tag: 'mane' });
    return { parts: parts, ext: ext }; }
  // ---- bone shapes ----
  function longBone(a, b, w, distal2) {   // shaft with flared articular ends; distal2: bilobed condyle
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy, ny = ux, Lp = [], Rp = [], k;
    for (k = 0; k <= 14; k++) { var u = k / 14, h = w * (0.42 + 0.75 * Math.exp(-Math.pow(u / 0.11, 2)) + 0.7 * Math.exp(-Math.pow((1 - u) / 0.11, 2)) + 0.06 * Math.sin(u * 9));
      var cx = a[0] + dx * u, cy = a[1] + dy * u; Lp.push([cx + nx * h, cy + ny * h]); Rp.push([cx - nx * h * (distal2 && u > 0.9 ? 1.15 : 1), cy - ny * h * (distal2 && u > 0.9 ? 1.15 : 1)]); }
    var end = distal2 ? [[b[0] + ux * w * 0.9 + nx * w * 0.5, b[1] + uy * w * 0.9 + ny * w * 0.5], [b[0] + ux * w * 0.55, b[1] + uy * w * 0.55], [b[0] + ux * w * 0.9 - nx * w * 0.55, b[1] + uy * w * 0.9 - ny * w * 0.55]] : [[b[0] + ux * w * 0.8, b[1] + uy * w * 0.8]];
    return Lp.concat(end, Rp.reverse(), [[a[0] - ux * w * 0.85, a[1] - uy * w * 0.85]]); }
  function skullPts(s) {   // lateral skull (head frame, units L)
    switch (s.type) {
      case 'proboscid': return { o: [[-0.005, -0.02], [-0.015, 0.06], [0.02, 0.13], [0.065, 0.15], [0.11, 0.115], [0.145, 0.05], [0.16, -0.0], [0.17, -0.06], [0.165, -0.13], [0.145, -0.17], [0.12, -0.165], [0.11, -0.11], [0.08, -0.1], [0.05, -0.115], [0.02, -0.095], [0.0, -0.06]],
        holes: [[[0.065, 0.025], 0.018, 0.016], [[0.148, 0.045], 0.01, 0.022]],
        jaw: [[0.01, -0.07], [0.0, -0.115], [0.03, -0.16], [0.08, -0.17], [0.115, -0.15], [0.09, -0.13], [0.05, -0.12], [0.03, -0.085]], alv: [0.13, -0.15] };
      case 'bovid': return { o: [[0, 0.02], [0.03, 0.06], [0.12, 0.06], [0.22, 0.03], [0.26, -0.005], [0.25, -0.03], [0.17, -0.04], [0.08, -0.05], [0.02, -0.035]], holes: [[[0.08, 0.025], 0.017, 0.015], [[0.2, 0.01], 0.02, 0.008]],
        jaw: [[0.02, -0.03], [0.03, -0.075], [0.12, -0.075], [0.24, -0.045], [0.23, -0.035], [0.1, -0.055], [0.05, -0.04]], horn: 1 };
      case 'equid': return { o: [[0, 0.02], [0.05, 0.05], [0.18, 0.04], [0.3, 0.015], [0.31, -0.015], [0.24, -0.03], [0.1, -0.045], [0.02, -0.03]], holes: [[[0.08, 0.02], 0.016, 0.014], [[0.25, 0.005], 0.025, 0.006]],
        jaw: [[0.02, -0.03], [0.04, -0.08], [0.12, -0.075], [0.3, -0.035], [0.29, -0.025], [0.1, -0.05], [0.05, -0.035]] };
      case 'canid': return { o: [[0, 0.02], [0.05, 0.06], [0.12, 0.045], [0.24, 0.005], [0.25, -0.015], [0.15, -0.025], [0.05, -0.035], [0.0, -0.02]], holes: [[[0.11, 0.012], 0.02, 0.016]],
        jaw: [[0.03, -0.025], [0.03, -0.055], [0.12, -0.05], [0.24, -0.025], [0.23, -0.018], [0.1, -0.035]] };
      default: return { o: [[0, 0.02], [0.05, 0.05], [0.15, 0.035], [0.24, 0.0], [0.24, -0.02], [0.15, -0.03], [0.05, -0.045], [0, -0.025]], holes: [[[0.08, 0.015], 0.016, 0.014]],
        jaw: [[0.02, -0.03], [0.03, -0.065], [0.12, -0.06], [0.23, -0.03], [0.22, -0.022], [0.1, -0.045]] };
    } }
  function ell(c, rx, ry, n) { var o = []; for (var k = 0; k < (n || 10); k++) { var a = k / (n || 10) * 6.2832; o.push([c[0] + Math.cos(a) * rx, c[1] + Math.sin(a) * ry]); } return o; }
  // skeleton in anatomical pose: [{poly, holes, group, far, ivory, ax:[a,b,w], order, settle}]
  function skeleton(R) {
    var s = R.s, L = R.L, B = [], i, k, v = s.vert;
    function add(poly, group, o) { o = o || {}; B.push({ poly: poly, holes: o.holes || null, group: group, far: !!o.far, ivory: o.ivory || 0, ax: o.ax || null, order: o.order || 0, unit: o.unit == null ? B.length : o.unit }); }
    // vertebral column: sacrum..thoracic along col(u); spines
    var segs = [['thor', v[1], 0.36, 0.82], ['lumb', v[2], 0.22, 0.355], ['sacr', v[3], 0.12, 0.215]];
    segs.forEach(function (sg) { for (k = 0; k < sg[1]; k++) { var u = lerp(sg[2], sg[3], (k + 0.5) / sg[1]), c = [u * L, R.col(u) * L], cw = (sg[3] - sg[2]) / sg[1] * L * 0.42, ch = 0.022 * L * (s.type === 'proboscid' ? 1.2 : 1);
      add([[c[0] - cw, c[1] - ch], [c[0] + cw, c[1] - ch], [c[0] + cw, c[1] + ch * 0.6], [c[0] - cw, c[1] + ch * 0.6]], 'vert', { ax: [[c[0] - cw, c[1]], [c[0] + cw, c[1]], ch], order: 2, unit: 'v' + sg[0] + k });
      var sl = (R.top(u) - R.col(u) - 0.03) * L, ang = sg[0] === 'thor' ? 1.9 : sg[0] === 'lumb' ? 1.35 : 1.6, tip = [c[0] + Math.cos(ang) * sl, c[1] + Math.sin(ang) * sl];
      add(stroke([[c[0], c[1] + ch * 0.4], tip], [cw * 0.55, cw * 0.32]), 'vert', { ax: [c, tip, cw * 0.45], order: 2, unit: 'v' + sg[0] + k });
      if (sg[0] === 'thor') { var rl = s.ribD * L * Math.sin(Math.PI * clamp((k + 1.5) / (sg[1] + 1), 0, 1)) * 0.9 + 0.06 * L, r0 = [c[0], c[1] - ch * 0.4], r1 = [c[0] - 0.035 * L, c[1] - rl * 0.5], r2 = [c[0] - 0.01 * L + 0.02 * L * (k / sg[1]), c[1] - rl];
        var rw = (s.type === 'proboscid' ? 0.0075 : 0.006) * L;
        add(stroke([r0, r1, r2], [rw, rw * 0.85, rw * 0.5], 3), 'rib', { ax: [r0, r2, rw], order: 1, unit: 'r' + k });
        if (k % 2 === 0) add(stroke([[r0[0] + 0.012 * L, r0[1]], [r1[0] + 0.012 * L, r1[1] + 0.01 * L], [r2[0] + 0.012 * L, r2[1] + 0.02 * L]], [rw, rw * 0.8, rw * 0.45], 3), 'rib', { far: 1, ax: [r0, r2, rw], order: 0, unit: 'rf' + k }); } } });
    // neck (cervicals)
    var T0 = R.neck[0], Hb = R.Hb;
    for (k = 0; k < v[0]; k++) { var f = (k + 0.5) / v[0], c2 = [lerp(T0[0], Hb[0], f), lerp(T0[1], Hb[1], f) - 0.01 * L], cw2 = Math.max(0.012 * L, Math.hypot(Hb[0] - T0[0], Hb[1] - T0[1]) / v[0] * 0.42);
      add(ell(c2, cw2, 0.02 * L * (s.type === 'proboscid' ? 1.3 : 1), 8), 'cerv', { ax: [[c2[0] - cw2, c2[1]], [c2[0] + cw2, c2[1]], 0.02 * L], order: 2, unit: 'c' + k }); }
    // tail (caudals)
    for (k = 0; k < v[4]; k++) { var f2 = (k + 0.5) / v[4], p = f2 < 0.5 ? [lerp(R.tail[0][0], R.tail[1][0], f2 * 2), lerp(R.tail[0][1], R.tail[1][1], f2 * 2)] : [lerp(R.tail[1][0], R.tail[2][0], f2 * 2 - 1), lerp(R.tail[1][1], R.tail[2][1], f2 * 2 - 1)], r = 0.011 * L * (1 - 0.6 * f2);
      add(ell(p, r * 1.2, r, 6), 'caud', { order: 2, unit: 'ca' + k }); }
    // scapula (over the ribs), pelvis
    var sh = R.legs[0][0], sT = [sh[0] - 0.09 * L, sh[1] + 0.25 * L * (s.type === 'proboscid' ? 1.1 : 0.8)];
    var scap = [[sh[0] - 0.015 * L, sh[1] - 0.02 * L], [sh[0] + 0.03 * L, sh[1] + 0.0 * L], [sT[0] + 0.08 * L, sT[1] - 0.01 * L], [sT[0] + 0.04 * L, sT[1] + 0.02 * L], [sT[0] - 0.05 * L, sT[1] - 0.01 * L]];
    add(spline(scap, 2, true), 'fore', { ax: [sh, sT, 0.06 * L], order: 3, unit: 'scap' });
    var hp = R.legs[2][0], pel = [[hp[0] + 0.02 * L, hp[1] - 0.015 * L], [hp[0] + 0.1 * L, hp[1] + 0.09 * L], [hp[0] + 0.07 * L, hp[1] + 0.13 * L], [hp[0] - 0.0 * L, hp[1] + 0.1 * L], [hp[0] - 0.02 * L, hp[1] + 0.04 * L], [hp[0] - 0.09 * L, hp[1] + 0.0 * L], [hp[0] - 0.1 * L, hp[1] - 0.06 * L], [hp[0] - 0.02 * L, hp[1] - 0.09 * L]];
    if (s.type === 'proboscid') pel = pel.map(function (q) { return [hp[0] + (q[0] - hp[0]) * 1.1, hp[1] + (q[1] - hp[1]) * 1.15]; });
    add(spline(pel, 2, true), 'pelvis', { holes: [[[hp[0] - 0.045 * L, hp[1] - 0.045 * L], 0.022 * L, 0.016 * L], [[hp[0] + 0.0 * L, hp[1] + 0.0 * L], 0.018 * L, 0.018 * L, 1]], ax: [[hp[0] - 0.1 * L, hp[1] - 0.06 * L], [hp[0] + 0.08 * L, hp[1] + 0.17 * L], 0.07 * L], order: 3, unit: 'pel' });
    // limbs: long bones between joints, then podials
    R.legs.forEach(function (lg, li) { var far = !!lg.far, gr = li < 2 ? 'fore' : 'hind', w = s.legW * L * (s.type === 'proboscid' ? 0.55 : 0.5);
      for (k = 0; k < lg.length - 2; k++) { var a = lg[k], b = lg[k + 1], u0 = [lerp(a[0], b[0], 0.04), lerp(a[1], b[1], 0.04)], u1 = [lerp(a[0], b[0], 0.96), lerp(a[1], b[1], 0.96)];
        add(longBone(u0, u1, w * (k === 0 ? 1.1 : 0.85), k === 0), gr + (k === 0 ? '' : 'd'), { far: far, ax: [u0, u1, w], order: far ? 0 : 4, unit: 'l' + li + k }); }
      var fA = lg[lg.length - 2], fB = lg[lg.length - 1];
      for (k = 0; k < 3; k++) { var q = [lerp(fA[0], fB[0], k / 3 + 0.15), lerp(fA[1], fB[1], k / 3 + 0.15)];
        add(ell(q, w * (s.type === 'proboscid' ? 1.1 : 0.7), w * 0.55, 7), gr + 'p', { far: far, order: far ? 0 : 4, unit: 'p' + li + k }); } });
    // skull, mandible, tusks / horn cores / antlers
    var sk = skullPts(s), so = toWorld(R, sk.o), holes = sk.holes.map(function (h) { var c = toWorld(R, [h[0]])[0]; return [c, h[1] * L, h[2] * L]; });
    add(spline(so, 2, true), 'skull', { holes: holes, ax: [toWorld(R, [[0, 0]])[0], toWorld(R, [[0.2, 0]])[0], 0.08 * L], order: 5, unit: 'skull' });
    add(spline(toWorld(R, sk.jaw), 2, true), 'jaw', { ax: [toWorld(R, [[0.02, -0.08]])[0], toWorld(R, [[0.2, -0.06]])[0], 0.03 * L], order: 5, unit: 'jaw' });
    if (s.type === 'proboscid') { var al = toWorld(R, [sk.alv])[0], tl = (s.low ? 0.45 : 0.72) * L, a0 = R.headA - 1.0, up = al.slice(), pts = [up], ws = [];
      for (k = 0; k < 9; k++) { var th = a0 + 3.1 * Math.pow((k + 0.5) / 9, 1.15) * (s.low ? 0.5 : 1); up = [up[0] + Math.cos(th) * tl / 9, up[1] + Math.sin(th) * tl / 9]; pts.push(up); }
      for (k = 0; k < pts.length; k++) ws.push(0.03 * L * (1 - 0.82 * k / (pts.length - 1)));
      add(stroke(pts, ws, 2), 'skull', { ivory: 1, ax: [pts[0], pts[pts.length - 1], 0.03 * L], order: 6, unit: 'skull' }); }
    if (sk.horn && s.horn) { var hc = toWorld(R, [[0.04, 0.06]])[0]; add(stroke([hc, [hc[0] - 0.02 * L, hc[1] + s.horn * 0.5 * L], [hc[0] + 0.02 * L, hc[1] + s.horn * L]], [0.016 * L, 0.012 * L, 0.004 * L], 2), 'skull', { ivory: 2, order: 6, unit: 'skull' }); }
    if (s.antler) { var ab = toWorld(R, [[0.04, 0.05]])[0]; add(stroke([ab, [ab[0] - 0.06 * L, ab[1] + 0.12 * L], [ab[0] - 0.02 * L, ab[1] + 0.24 * L]], [0.008 * L, 0.006 * L, 0.003 * L], 2), 'skull', { ivory: 2, order: 6, unit: 'skull' });
      add(stroke([[ab[0] - 0.045 * L, ab[1] + 0.09 * L], [ab[0] + 0.03 * L, ab[1] + 0.15 * L]], [0.005 * L, 0.003 * L]), 'skull', { ivory: 2, order: 6, unit: 'skull' }); }
    return B; }
  // disarticulation thresholds (decay index t; 1 ~ skeletonised) by group, earliest first (after Hill 1979)
  var DIS = { fore: 0.55, ford: 0.6, forep: 0.62, caud: 0.6, skull: 0.7, jaw: 0.65, hind: 0.8, hindd: 0.85, hindp: 0.85, rib: 0.9, pelvis: 1.0, vert: 1.15, cerv: 1.25 };
  return { SP: SP, spec: spec, rig: rig, flesh: flesh, skeleton: skeleton, DIS: DIS, stroke: stroke, spline: spline, rot: rot, sst: sst };
})();

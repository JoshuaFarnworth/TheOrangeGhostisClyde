/* px.js: Clyde's pixel toolkit for the 2027 series (shared, concatenated ahead of each main.js).
 * Everything renders into a float buffer and is written once with putImageData, so the same file
 * runs in a browser, on Aleatory, and headless in node. No randomness lives here. */
var PX = (function () {
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function ihash(n) { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
  function h2(x, y, s) { return ihash((Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ Math.imul((s | 0) + 1, 83492791)) | 0); }
  // value noise on an integer lattice, smooth (cheap, deterministic, no rng needed)
  function vnoise(x, y, s) {
    var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    var a = h2(xi, yi, s), b = h2(xi + 1, yi, s), c = h2(xi, yi + 1, s), d = h2(xi + 1, yi + 1, s);
    return lerp(lerp(a, b, fx), lerp(c, d, fx), fy) * 2 - 1;
  }
  function fbm(x, y, s, oct, lac, gain) {
    oct = oct || 4; lac = lac || 2.03; gain = gain || 0.5;
    var a = 0.5, t = 0, n = 0;
    for (var o = 0; o < oct; o++) { t += a * vnoise(x, y, s + o * 17); n += a; a *= gain; x *= lac; y *= lac; var tx = x * 0.8 - y * 0.6; y = x * 0.6 + y * 0.8; x = tx; }
    return t / n;
  }
  // separable box blur, 3 passes ~ gaussian(sigma); edges clamp
  function boxPass(src, dst, w, h, r, horiz) {
    var n = horiz ? w : h, m = horiz ? h : w, sx = horiz ? 1 : w, sy = horiz ? w : 1, inv = 1 / (2 * r + 1);
    for (var j = 0; j < m; j++) {
      var base = j * sy, acc = 0, k;
      for (k = -r; k <= r; k++) acc += src[base + clamp(k, 0, n - 1) * sx];
      for (var i = 0; i < n; i++) {
        dst[base + i * sx] = acc * inv;
        acc += src[base + Math.min(i + r + 1, n - 1) * sx] - src[base + Math.max(i - r, 0) * sx];
      }
    }
  }
  function blur(F, w, h, sigma, tmp) {
    if (sigma < 0.4) return F;
    var r = Math.max(1, Math.round(Math.sqrt(12 * sigma * sigma / 3 + 1) / 2 - 0.5)); tmp = tmp || new Float32Array(w * h);
    for (var p = 0; p < 3; p++) { boxPass(F, tmp, w, h, r, true); boxPass(tmp, F, w, h, r, false); }
    return F;
  }
  function blurXY(F, w, h, sx, sy) { var tmp = new Float32Array(w * h), r; for (var p = 0; p < 3; p++) { if (sx >= 0.4) { r = Math.max(1, Math.round(sx * 0.95)); boxPass(F, tmp, w, h, r, true); F.set(tmp); } if (sy >= 0.4) { r = Math.max(1, Math.round(sy * 0.95)); boxPass(F, tmp, w, h, r, false); F.set(tmp); } } return F; }
  function bil(F, w, h, x, y) {
    x = clamp(x, 0, w - 1.001); y = clamp(y, 0, h - 1.001);
    var xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi, i = yi * w + xi;
    return (F[i] * (1 - fx) + F[i + 1] * fx) * (1 - fy) + (F[i + w] * (1 - fx) + F[i + w + 1] * fx) * fy;
  }
  // even-odd scanline polygon fill; pts = [[x,y],...] in pixel units; fn(index, x, y)
  function fillPoly(pts, w, h, fn) {
    var y0 = Infinity, y1 = -Infinity, n = pts.length, k;
    for (k = 0; k < n; k++) { y0 = Math.min(y0, pts[k][1]); y1 = Math.max(y1, pts[k][1]); }
    y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(h - 1, Math.ceil(y1));
    var xs = [];
    for (var y = y0; y <= y1; y++) {
      var yc = y + 0.5; xs.length = 0;
      for (k = 0; k < n; k++) {
        var a = pts[k], b = pts[(k + 1) % n];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort(function (p, q) { return p - q; });
      for (k = 0; k + 1 < xs.length; k += 2) {
        var xa = Math.max(0, Math.ceil(xs[k] - 0.5)), xb = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
        for (var x = xa; x <= xb; x++) fn(y * w + x, x, y);
      }
    }
  }
  function forDisc(cx, cy, r, w, h, fn) {
    var x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r)), y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { var dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.sqrt(dx * dx + dy * dy); if (d <= r) fn(y * w + x, d, dx, dy); }
  }
  function segDist(px, py, ax, ay, bx, by) {
    var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy, t = l2 > 0 ? clamp(((px - ax) * vx + (py - ay) * vy) / l2, 0, 1) : 0;
    var dx = px - ax - t * vx, dy = py - ay - t * vy; return Math.sqrt(dx * dx + dy * dy);
  }
  function convexHull(P) {
    P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < P.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], P[i]) <= 0) lo.pop(); lo.push(P[i]); }
    for (i = P.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], P[i]) <= 0) up.pop(); up.push(P[i]); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function canvas(C, VW, VH, bg) {
    var cv = C.setupCanvas(VW, VH, bg), PW = cv.canvas.width, PH = cv.canvas.height;
    var img = cv.ctx.createImageData(PW, PH);
    return { cv: cv, ctx: cv.ctx, img: img, px8: img.data, PW: PW, PH: PH, s: PW / VW };
  }
  // write linear-light float RGB to the canvas. opt: {expo, filmic, grain, vig, seed}
  function finish(o, R, G, B, opt) {
    opt = opt || {}; var PW = o.PW, PH = o.PH, d = o.px8, ex = opt.expo || 1, gr = opt.grain == null ? 0.012 : opt.grain, vg = opt.vig || 0, fl = !!opt.filmic, sd = opt.seed || 1;
    for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
      var i = y * PW + x, r = R[i] * ex, g = G[i] * ex, b = B[i] * ex;
      if (fl) { r = 1 - Math.exp(-r); g = 1 - Math.exp(-g); b = 1 - Math.exp(-b); }
      if (vg) { var u = x / PW - 0.5, v = y / PH - 0.5, f = 1 - vg * (u * u + v * v) * 2; r *= f; g *= f; b *= f; }
      var lum = 0.3 * r + 0.59 * g + 0.11 * b, n = (ihash(i * 7 + sd) + ihash(i * 13 + 5 + sd) - 1) * gr * (1 - 0.6 * lum);
      d[i * 4] = clamp(Math.pow(clamp(r, 0, 1), 1 / 2.2) + n, 0, 1) * 255;
      d[i * 4 + 1] = clamp(Math.pow(clamp(g, 0, 1), 1 / 2.2) + n, 0, 1) * 255;
      d[i * 4 + 2] = clamp(Math.pow(clamp(b, 0, 1), 1 / 2.2) + n, 0, 1) * 255;
      d[i * 4 + 3] = 255;
    }
    o.ctx.putImageData(o.img, 0, 0);
  }

  // anti-aliased polyline into a float coverage buffer (max-combine). pts in pixel units, w = line width in px.
  function line(F, W, H, pts, w, val, press) {
    val = val == null ? 1 : val; var hw = Math.max(w, 0.7) / 2;
    for (var k = 0; k + 1 < pts.length; k++) {
      var a = pts[k], b = pts[k + 1], x0 = Math.max(0, Math.floor(Math.min(a[0], b[0]) - hw - 1)), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0]) + hw + 1)), y0 = Math.max(0, Math.floor(Math.min(a[1], b[1]) - hw - 1)), y1 = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1]) + hw + 1));
      var pa = press ? press[k] : 1, cov0 = w < 0.7 ? w / 0.7 : 1;
      for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { var d = segDist(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1]), c = clamp(hw + 0.5 - d, 0, 1) * cov0 * val * pa, i = y * W + x; if (c > F[i]) F[i] = c; }
    }
  }
  // handwriting-like scribble: coupled oscillators (Hollerbach 1981) with drift. Returns array of strokes (word = stroke).
  // rnd: function()->[0,1). x,y start, h = x-height, n = letters, slant (radians). Units arbitrary (caller's).
  function scribble(rnd, x, y, h, n, slant, ws) {
    // cursive-like strokes: per letter, alternate baseline/x-height key points (ascenders, descenders, loops),
    // then Chaikin-smoothed so turns are rounded the way a moving pen rounds them. y grows downward.
    var out = [], key = [], cx = x, sl = Math.tan(slant == null ? 0.2 : slant), v = (ws || 0.6) * h, base = y;
    function flush() { if (key.length < 2) { key = []; return; } var P = key; for (var it = 0; it < 3; it++) { var Q = [P[0]]; for (var k = 0; k + 1 < P.length; k++) { var a = P[k], b = P[k + 1]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } Q.push(P[P.length - 1]); P = Q; }
      out.push(P.map(function (p) { return [p[0] - (p[1] - base) * sl, p[1]]; })); key = []; }
    key.push([cx, base]);
    for (var L = 0; L < n; L++) {
      var kind = rnd(), hh = h * (0.85 + 0.3 * rnd()), humps = kind < 0.2 ? 2 : 1;
      if (kind > 0.2 && kind < 0.36) { key.push([cx + 0.15 * h, base - 2.1 * h], [cx - 0.05 * h, base - 1.6 * h]); }   // ascender loop
      for (var u = 0; u < humps; u++) { key.push([cx + 0.18 * v, base - hh], [cx + 0.5 * v, base - hh * 0.9]); cx += v * (0.7 + 0.3 * rnd()); key.push([cx, base]); }
      if (kind > 0.9) { key.push([cx - 0.1 * h, base + 1.0 * h], [cx - 0.35 * h, base + 0.7 * h], [cx + 0.1 * h, base]); }   // descender
      if (kind > 0.36 && kind < 0.5) { key.push([cx - 0.3 * v, base - hh * 0.7], [cx - 0.1 * v, base - hh], [cx + 0.2 * v, base]); cx += 0.2 * v; }   // e/o-ish
      base += (rnd() - 0.5) * 0.05 * h; cx += v * 0.1;
      if (rnd() < 0.16 && L < n - 1) { flush(); cx += h * (0.6 + 0.4 * rnd()); key.push([cx, base]); }
    }
    flush(); return out;
  }
  function srgb2lin(c) { return Math.pow(c / 255, 2.2); }
  function col(hex) { var c = hex.replace('#', ''); return [srgb2lin(parseInt(c.substr(0, 2), 16)), srgb2lin(parseInt(c.substr(2, 2), 16)), srgb2lin(parseInt(c.substr(4, 2), 16))]; }
  return { clamp: clamp, lerp: lerp, sstep: sstep, ihash: ihash, h2: h2, vnoise: vnoise, fbm: fbm, blur: blur, blurXY: blurXY, bil: bil, fillPoly: fillPoly, forDisc: forDisc, segDist: segDist, convexHull: convexHull, line: line, scribble: scribble, canvas: canvas, finish: finish, col: col };
})();
/* Board, by Clyde (2027).
 * A wooden chopping board seen from above, washed and put back. Thousands of knife cuts, each too small to notice,
 * add up to where someone stands and how they cut.
 * Engine: a household is a few cooks, each with a handedness, a stance (where on the board they work) and a repertoire.
 * Rocking chops with a chef's knife leave short cuts perpendicular to the counter edge in a tight cluster near the
 * cook's hand; slicing bread leaves long, shallow saw-lines at the far side; jointing leaves a few deep diagonal
 * scores. Each cut is a V-groove: a dark line where juice and oil settle, and a pale lip where fibres are crushed
 * up and catch the light. Grooves across the grain open more than grooves along it. Old cuts are softened by
 * washing and oiling; heavy use dishes and greys the working zone. Stains wick along the grain. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RW = R.fork('wood'), RC = R.fork('cooks'), RK = R.fork('cuts');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1400, VH = 1050, FW = RW.range(24, 34), FH = FW * 0.75;   // cm: the camera frames the working zone
  var wood = RW.weighted([['Beech', 34], ['Oak', 22], ['Maple', 18], ['Walnut', 12], ['Bamboo', 14]]);
  var years = RW.weighted([['A Year', 30], ['Five Years', 44], ['Since The Wedding', 26]]);
  var cookers = RC.weighted([['One Cook', 44], ['Two Cooks', 40], ['A Busy Kitchen', 16]]);
  var stain = RC.weighted([['None', 56], ['Beetroot', 16], ['Turmeric', 14], ['Red Wine', 14]]);
  var bw = RW.range(36, 46), bh = RW.range(24, 30), bx = (FW - bw) / 2 + RW.gaussian(0, 1.2), by = (FH - bh) / 2 + RW.gaussian(0, 1), brot = RW.gaussian(0, 0.03), corner = RW.range(1, 3), groove = RW.chance(0.35), hole = !groove && RW.chance(0.4);
  var nCooks = { 'One Cook': 1, 'Two Cooks': 2, 'A Busy Kitchen': RC.int(3, 4) }[cookers], cooks = [];
  for (var k = 0; k < nCooks; k++) {
    var lefty = RC.chance(0.11), u = lefty ? RC.range(0.15, 0.45) : RC.range(0.5, 0.85);
    cooks.push({ lefty: lefty, ux: u, uy: RC.range(0.45, 0.8), spread: RC.range(0.11, 0.22), tilt: (lefty ? 1 : -1) * RC.range(0.05, 0.35), w: RC.range(0.5, 1.5), bread: RC.range(0, 0.25), meat: RC.range(0, 0.1) });
  }
  var main = cooks.reduce(function (m, c) { return c.w > m.w ? c : m; });
  var fcu = clamp(main.ux + RW.gaussian(0, 0.08), 0.3, 0.7), fcv = clamp(main.uy + RW.gaussian(0, 0.08), 0.35, 0.65);
  var nCuts = { 'A Year': RK.int(900, 1600), 'Five Years': RK.int(2200, 3800), 'Since The Wedding': RK.int(4500, 7000) }[years];
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH;
  var DARK = new Float32Array(N), LIP = new Float32Array(N), USE = new Float32Array(N), STN = new Float32Array(N);
  var cb = Math.cos(brot), sb = Math.sin(brot), TMPL = new Float32Array(N), touched = [];
  // PX.line max-combines; cuts should add up, so draw each into a scratch buffer and accumulate its touched pixels
  var _ln = PX.line; PX.line = function (F, W2, H2, pts, w, val) { if (F !== TMPL) return _ln(F, W2, H2, pts, w, val); var x0 = Math.max(0, Math.floor(Math.min(pts[0][0], pts[1][0]) - w - 2)), x1 = Math.min(W2 - 1, Math.ceil(Math.max(pts[0][0], pts[1][0]) + w + 2)), y0 = Math.max(0, Math.floor(Math.min(pts[0][1], pts[1][1]) - w - 2)), y1 = Math.min(H2 - 1, Math.ceil(Math.max(pts[0][1], pts[1][1]) + w + 2)); touched = [x0, x1, y0, y1]; _ln(F, W2, H2, pts, w, val); };
  function accum(F, v) { var t = touched; for (var y = t[2]; y <= t[3]; y++) for (var x = t[0]; x <= t[1]; x++) { var j = y * PW + x; if (TMPL[j] > 0) { F[j] += TMPL[j] * v; TMPL[j] = 0; } } }
  var offX = -(fcu - 0.5) * bw, offY = -(fcv - 0.5) * bh;
  function toPx(u, v) { var lx = (u - 0.5) * bw + offX, ly = (v - 0.5) * bh + offY; return [(FW / 2 + lx * cb - ly * sb) * ppc, (FH / 2 + lx * sb + ly * cb) * ppc]; }
  var lightAng = RW.range(-0.6, 0.6) + (RW.chance(0.5) ? 0 : PI / 2);   // window light rakes across the board
  var cw = cooks.reduce(function (a, c) { return a + c.w; }, 0), tmp = [0, 0];
  for (var t = 0; t < nCuts; t++) {
    var q = RK.rand() * cw, ci = 0; while (ci < cooks.length - 1 && q > cooks[ci].w) { q -= cooks[ci].w; ci++; }
    var c = cooks[ci], kind = RK.rand(), age = RK.rand(), u, v, ang, len, depth;
    if (kind < c.bread) { u = 0.5 + RK.gaussian(0, 0.18); v = RK.range(0.08, 0.4); ang = c.tilt * 0.5 + RK.gaussian(0, 0.12); len = RK.range(4, 11); depth = 0.25; }
    else if (kind < c.bread + c.meat) { u = 0.5 + RK.gaussian(0, 0.2); v = 0.5 + RK.gaussian(0, 0.15); ang = RK.range(-0.9, 0.9); len = RK.range(3, 8); depth = 1.4; }
    else { u = c.ux + RK.gaussian(0, c.spread); v = c.uy + RK.gaussian(0, c.spread * 0.8); ang = PI / 2 + c.tilt + RK.gaussian(0, 0.1); len = RK.pareto(1.1, 2.0); len = Math.min(len, 5.5); depth = RK.range(0.7, 1.4); }
    if (u < 0.03 || u > 0.97 || v < 0.04 || v > 0.96) continue;
    var hl = len / 2, du = Math.cos(ang) * hl / bw, dv = Math.sin(ang) * hl / bh, a = toPx(u - du, v - dv), b = toPx(u + du, v + dv);
    var rak = 0.4 + 1.2 * Math.abs(Math.sin(ang - lightAng)), soft = (1 - 0.55 * Math.pow(age, 0.6)) * rak, across = Math.abs(Math.sin(ang)), d = depth * soft * (0.55 + 0.5 * across), wpx = Math.max(0.7, 0.045 * ppc * (0.7 + d));
    PX.line(TMPL, PW, PH, [a, b], wpx, 1); accum(DARK, clamp(d * 0.22, 0, 1));
    var ox = -Math.sin(ang) * 0.03 * ppc, oy = Math.cos(ang) * 0.03 * ppc;   // the lip on the lit side
    PX.line(TMPL, PW, PH, [[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy]], wpx * 0.9, 1); accum(LIP, clamp(d * 0.55, 0, 1));
    var m = toPx(u, v), mi = Math.floor(m[1]) * PW + Math.floor(m[0]); if (mi >= 0 && mi < N) USE[mi] += 1;
  }
  PX.blur(USE, PW, PH, 2.5 * ppc); var umax = 0; for (var i = 0; i < N; i++) umax = Math.max(umax, USE[i]);
  if (stain !== 'None') { var su = RC.range(0.25, 0.75), sv = RC.range(0.3, 0.7), sr = RC.range(1.5, 4); var sp = toPx(su, sv); PX.forDisc(sp[0], sp[1], sr * ppc * 2.5, PW, PH, function (J, d, dx, dy) { var ex = (dx * cb + dy * sb), ey = (-dx * sb + dy * cb) * 2.2, dd = Math.hypot(ex, ey) / (sr * ppc); STN[J] = Math.max(STN[J], sstep(1.3, 0.2, dd + 0.4 * PX.fbm(ex * 0.02, ey * 0.02, 5, 3))); }); }
  var W = { Beech: ['#d8b48a', '#c99b6e'], Oak: ['#c9a678', '#a7804f'], Maple: ['#e6cfa8', '#d4b98c'], Walnut: ['#7a553a', '#5c3f2a'], Bamboo: ['#d9bc84', '#c4a064'] }[wood].map(PX.col);
  var counter = PX.col(RW.pick(['#2b2b2a', '#d9d6cf', '#3d3f41', '#6e6a62'])), seed = RW.int(1, 9999), stC = { Beetroot: PX.col('#7a1f3d'), Turmeric: PX.col('#d4a017'), 'Red Wine': PX.col('#5e1f2a'), None: [1, 1, 1] }[stain];
  var strips = Math.round(bh / RW.range(3, 5)), stripTone = []; for (var k2 = 0; k2 < strips + 2; k2++) stripTone.push(RW.range(-1, 1));
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), oiled = years === 'A Year' ? 0.15 : 0.45;
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc - FW / 2, Y = (py + 0.5) / ppc - FH / 2, lx = X * cb + Y * sb - offX, ly = -X * sb + Y * cb - offY, r, g, b;
    var ex = Math.max(0, Math.abs(lx) - (bw / 2 - corner)), ey = Math.max(0, Math.abs(ly) - (bh / 2 - corner)), sd = Math.hypot(ex, ey) - corner;   // signed distance to the board edge
    var light = 1.05 - 0.25 * ((py / PH) * 0.6 + (px / PW) * 0.4);
    if (hole) { var hx = lx - (bw / 2 - 3), hd = Math.hypot(hx, ly) - 0.9; if (hd < 0) sd = Math.max(sd, -hd); }
    if (sd > 0) {   // the counter, with the board's soft shadow
      var sh = 1 - 0.55 * Math.exp(-Math.max(0, Math.hypot(Math.max(0, Math.abs(lx - 0.8) - (bw / 2 - corner)), Math.max(0, Math.abs(ly - 1.1) - (bh / 2 - corner))) - corner) / 1.2);
      var ct = 0.95 + 0.05 * PX.fbm(X * 0.3, Y * 0.3, seed + 9, 3); r = counter[0] * ct * sh; g = counter[1] * ct * sh; b = counter[2] * ct * sh;
      Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light; continue;
    }
    // long-grain strips glued edge to edge; growth rings as warped lines along the length
    var si = Math.floor((ly + bh / 2) / bh * strips + 1e-6), st = stripTone[si + 1] || 0;
    var gy = ly + 1.15 * PX.fbm(lx * 0.04, ly * 0.08 + si * 5, seed + si, 4) + 0.25 * PX.vnoise(lx * 0.15, ly * 0.4, seed + 8);
    var spacing = wood === 'Bamboo' ? 0.55 : 0.85;
    var band = gy / spacing + 0.35 * PX.fbm(lx * 0.02, gy * 0.3, seed + 11, 3);
    var late = Math.pow(0.5 + 0.5 * Math.sin(band * 2 * PI), wood === 'Bamboo' ? 4 : 9);
    var ray = wood === 'Oak' ? sstep(0.84, 0.96, PX.vnoise(lx * 0.25, ly * 6, seed + 2)) * 0.28 : 0;
    var pore = PX.vnoise(lx * 1.8, ly * 28, seed + 4);
    var fig = 0.08 * PX.fbm(lx * 0.08, ly * 0.15, seed + 14, 4);
    var t2 = clamp(0.48 + 0.1 * st + 0.22 * late - 0.1 * ray + fig + 0.04 * PX.vnoise(lx * 1.2, ly * 10, seed + 3) + 0.07 * pore * pore * Math.sign(pore), 0, 1);
    r = lerp(W[0][0], W[1][0], t2); g = lerp(W[0][1], W[1][1], t2); b = lerp(W[0][2], W[1][2], t2);
    var seamD = Math.abs(((ly + bh / 2) / bh * strips) % 1 - 0) * bh / strips; if (seamD < 0.03) { r *= 0.9; g *= 0.9; b *= 0.9; }
    // use: the working zone greys and dishes; oil darkens everything a little
    var use = clamp(USE[I] / umax, 0, 1); r *= (1 - 0.22 * use) * (1 - 0.12 * oiled); g *= (1 - 0.24 * use) * (1 - 0.14 * oiled); b *= (1 - 0.2 * use) * (1 - 0.18 * oiled);
    var grey = 0.22 * use; r = lerp(r, 0.32, grey); g = lerp(g, 0.3, grey); b = lerp(b, 0.26, grey);
    var dk = 1 - Math.exp(-DARK[I] * 2.6), lp = (1 - Math.exp(-LIP[I] * 2.0)) * (1 - dk * 0.4), pale = wood === 'Walnut' ? 1.6 : 1;
    r = r * (1 - 0.7 * dk) + lp * 0.22 * pale; g = g * (1 - 0.7 * dk) + lp * 0.2 * pale; b = b * (1 - 0.72 * dk) + lp * 0.14 * pale;
    if (STN[I] > 0) { var s2 = STN[I] * 0.55 * (0.7 + 0.3 * late); r = lerp(r, r * stC[0] * 2.2, s2); g = lerp(g, g * stC[1] * 2.2, s2); b = lerp(b, b * stC[2] * 2.2, s2); }
    if (groove) { var gd = Math.abs(Math.hypot(Math.max(0, Math.abs(lx) - (bw / 2 - 3.5)), Math.max(0, Math.abs(ly) - (bh / 2 - 3.5))) - 1.2) ; if (gd < 0.35 && (Math.abs(lx) > bw / 2 - 4.8 || Math.abs(ly) > bh / 2 - 4.8)) { var gs = 1 - 0.35 * Math.cos(gd / 0.35 * PI / 2) * (ly - 0 > 0 ? 1 : 0.6); r *= gs; g *= gs; b *= gs; } }
    var edge = sstep(-0.35, 0, sd) * 0.3; r *= 1 - edge; g *= 1 - edge; b *= 1 - edge;
    Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  C.features({ Wood: wood, Used: years, Cooks: cookers, 'Left-Handed': cooks.some(function (c) { return c.lefty; }) ? 'Yes' : 'No', Stain: stain, Board: groove ? 'Juice Groove' : hole ? 'Hanging Hole' : 'Plain' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.05, filmic: false, grain: 0.01, vig: 0.3, seed: 16 });
  C.done(o.cv.canvas, 'board');
})();

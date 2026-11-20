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
/* Oche, by Clyde (2027).
 * A pub dartboard, the darts put away. The holes in the sisal say who has been throwing and what at.
 * Engine: regulation board geometry (double ring 162-170 mm, treble 99-107 mm, bulls 6.35/15.9 mm radius, the
 * standard 20-1-18-4... order). Players are drawn with a skill (the spread of their throws, a 2-D Gaussian of
 * sigma 8-45 mm, after Tibshirani, Price & Taylor 2011) and a habit: good players live on treble 20 and fall back to
 * treble 19 when the bed is blocked, finish on double 16 and 20; beginners aim at the bull. Each throw leaves a hole;
 * the sisal closes old ones, so recent holes are sharp and old ones are a frayed, paler bed. Boards get turned to
 * spread wear: the number ring stays, the worn patch moves. Misses land in the surround. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('players'), RT = R.fork('throws'), RB = R.fork('board');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1200, VH = 1200, F = RB.range(68, 108);   // still tighter on the worn bed
  var ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  var who = RP.weighted([['Someone Alone', 22], ['A Pair', 34], ['League Night', 30], ['Beginners', 14]]);
  var age = RB.weighted([['New This Season', 30], ['A Few Seasons', 46], ['Years', 24]]);
  var turned = age !== 'New This Season' && RB.chance(0.45) ? RB.int(1, 4) * (RB.chance(0.5) ? 1 : -1) : 0;
  var nThrows = { 'New This Season': RT.int(1500, 4000), 'A Few Seasons': RT.int(8000, 20000), 'Years': RT.int(25000, 50000) }[age];
  var players = [], np = { 'Someone Alone': 1, 'A Pair': 2, 'League Night': RP.int(5, 9), 'Beginners': RP.int(2, 4) }[who];
  for (var k = 0; k < np; k++) {
    var sig = who === 'Beginners' ? RP.range(30, 50) : who === 'League Night' ? RP.range(9, 24) : RP.range(12, 38);
    players.push({ sig: sig, sx: sig * RP.range(0.8, 1.0), sy: sig * RP.range(1.0, 1.35), bx: RP.gaussian(0, sig * 0.15), by: RP.gaussian(sig * 0.1, sig * 0.15), w: RP.range(0.5, 1.5), lefty: RP.chance(0.1) });
  }
  function segAngle(num) { var i = ORDER.indexOf(num); return PI / 2 - i * 2 * PI / 20; }   // centre angle (math convention, y up)
  function aim(p, r) {   // returns target in mm (x right, y up), board frame of the number ring
    if (p.sig > 30) return r() < 0.85 ? [0, 0] : (function () { var a = segAngle(ORDER[Math.floor(r() * 20)]); return [Math.cos(a) * 130, Math.sin(a) * 130]; })();
    var u = r(), t;
    if (u < 0.62) t = [20, 103]; else if (u < 0.74) t = [19, 103]; else if (u < 0.8) t = [18, 103]; else if (u < 0.88) t = [16, 166]; else if (u < 0.94) t = [20, 166]; else if (u < 0.97) t = [0, 0]; else t = [ORDER[Math.floor(r() * 20)], 166];
    if (t[0] === 0) return [0, 0]; var a = segAngle(t[0]); return [Math.cos(a) * t[1], Math.sin(a) * t[1]];
  }
  var rot = turned * 2 * PI / 20, cr = Math.cos(rot), sr = Math.sin(rot), rr = function () { return RT.rand(); };
  var pw = players.reduce(function (a, p) { return a + p.w; }, 0), misses = 0, recent = Math.min(nThrows, RT.int(70, 180)), healing = Math.min(nThrows, recent + RT.int(800, 2500)), TH = [];
  for (var t = 0; t < nThrows; t++) {
    var u = RT.rand() * pw, pi = 0; while (pi < players.length - 1 && u > players[pi].w) { u -= players[pi].w; pi++; }
    var p = players[pi], tg = aim(p, rr), x = tg[0] + p.bx + RT.gaussian(0, p.sx), y = tg[1] - p.by + RT.gaussian(0, p.sy), older = t < nThrows - recent, healed = t < nThrows - healing;
    if (older && turned && t < nThrows * 0.7) { var xx = x * cr - y * sr; y = x * sr + y * cr; x = xx; }   // thrown before the board was turned
    if (Math.hypot(x, y) > 225) misses++; TH.push(x, y, healed ? 0 : older ? 0.3 : 1);
  }
  // frame: centred on the recent holes' centroid, nudged toward the board centre so the rings give context
  var mx = 0, my = 0, mn = 0; for (var q = 0; q < TH.length; q += 3) if (TH[q + 2]) { mx += TH[q]; my += TH[q + 1]; mn++; } mx /= mn; my /= mn;
  var fx = mx + RB.gaussian(0, 10), fy = my + RB.gaussian(0, 10);
  var o = PX.canvas(C, VW, VH, '#111'), PW = o.PW, PH = o.PH, ppm = PW / F, N = PW * PH, cx0 = F / 2 - fx, cy0 = F / 2 + fy;
  var HOLE = new Float32Array(N), WEAR = new Float32Array(N), FLUFF = new Float32Array(N);
  for (var q2 = 0; q2 < TH.length; q2 += 3) {
    var px = (cx0 + TH[q2]) * ppm, py = (cy0 - TH[q2 + 1]) * ppm; if (px < 0 || py < 0 || px >= PW || py >= PH) continue;
    WEAR[Math.floor(py) * PW + Math.floor(px)] += 1;
    var hv = TH[q2 + 2]; if (hv >= 1) { var hr = 0.22 * ppm, ea = (q2 * 2.39996) % PI, ec = Math.cos(ea), es = Math.sin(ea), seedH = q2;
      PX.forDisc(px, py, hr * 4.2, PW, PH, function (J, d, dx, dy) { var u2 = (dx * ec + dy * es) / 3.4, v2 = -dx * es + dy * ec, dd = Math.hypot(u2, v2) / hr, h = clamp(1.4 - dd, 0, 1); if (h > HOLE[J]) HOLE[J] = h;
        var f = sstep(hr * 3.8, hr * 0.8, d) * (PX.h2(J % PW, (J / PW) | 0, seedH) > 0.7 ? 0.55 : 0); if (f > FLUFF[J]) FLUFF[J] = f; }); }
  }
  PX.blur(WEAR, PW, PH, 4 * ppm); var wmax = 0; for (var i = 0; i < N; i++) wmax = Math.max(wmax, WEAR[i]);
  var wn = 1 / Math.max(wmax, 1e-9), wearScale = clamp(nThrows / 30000, 0.25, 1);
  // ---- glyphs for the number ring (wire numerals), unit box 0..1 x 0..1.6
  var G = { 0: [[[0.5, 0], [0.1, 0.3], [0.1, 1.3], [0.5, 1.6], [0.9, 1.3], [0.9, 0.3], [0.5, 0]]], 1: [[[0.25, 0.35], [0.55, 0], [0.55, 1.6]]], 2: [[[0.1, 0.35], [0.5, 0], [0.9, 0.35], [0.85, 0.7], [0.1, 1.6], [0.95, 1.6]]], 3: [[[0.1, 0.2], [0.5, 0], [0.9, 0.35], [0.5, 0.75], [0.9, 1.15], [0.5, 1.6], [0.1, 1.4]]], 4: [[[0.7, 1.6], [0.7, 0], [0.05, 1.1], [0.95, 1.1]]], 5: [[[0.9, 0], [0.15, 0], [0.1, 0.7], [0.6, 0.6], [0.9, 1.0], [0.6, 1.6], [0.1, 1.45]]], 6: [[[0.85, 0.15], [0.45, 0], [0.1, 0.6], [0.1, 1.3], [0.5, 1.6], [0.9, 1.25], [0.6, 0.8], [0.1, 1.0]]], 7: [[[0.05, 0], [0.95, 0], [0.35, 1.6]]], 8: [[[0.5, 0.75], [0.15, 0.4], [0.5, 0], [0.85, 0.4], [0.5, 0.75], [0.1, 1.15], [0.5, 1.6], [0.9, 1.15], [0.5, 0.75]]], 9: [[[0.9, 0.6], [0.5, 0.85], [0.1, 0.5], [0.5, 0], [0.9, 0.35], [0.85, 1.1], [0.4, 1.6]]] };
  var WIRE = new Float32Array(N);
  ORDER.forEach(function (num, i) {
    var a = segAngle(num), s = String(num), h = 19, wdt = h / 1.6 * 0.8, total = s.length * wdt + (s.length - 1) * 3, cx = Math.cos(a) * 196, cy = Math.sin(a) * 196, ta = 0;   // numerals stand upright
    for (var c = 0; c < s.length; c++) G[s[c]].forEach(function (st) {
      var pts = st.map(function (q) { var lx = -total / 2 + c * (wdt + 3) + q[0] * wdt, ly = h / 2 - q[1] / 1.6 * h, X = cx + lx * Math.cos(ta) - ly * Math.sin(ta), Y = cy + lx * Math.sin(ta) + ly * Math.cos(ta); return [(cx0 + X) * ppm, (cy0 - Y) * ppm]; });
      PX.line(WIRE, PW, PH, pts, 1.6 * ppm, 1);
    });
  });
  var seed = RB.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  var blackC = PX.col('#4a453c'), creamC = PX.col('#a89874'), redC = PX.col('#5a413a'), greenC = PX.col('#445445'), surround = PX.col(RB.pick(['#1a1612', '#241c16', '#2e241c'])), sisalB = PX.col('#c0ad86');
  var ageFade = { 'New This Season': 0.28, 'A Few Seasons': 0.52, 'Years': 0.78 }[age];
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppm - cx0, Y = cy0 - (py + 0.5) / ppm, rad = Math.hypot(X, Y), ang = Math.atan2(Y, X), r, g, b;
    var light = 1.0 - 0.3 * sstep(0, 260, rad) + 0.12 * (Y / 260);
    if (rad > 225.5) {   // the surround: a painted board / cabinet
      var sn = 0.9 + 0.1 * PX.fbm(X * 0.05, Y * 0.05, seed, 3); r = surround[0] * sn; g = surround[1] * sn; b = surround[2] * sn; light *= 0.8;
      var hl = HOLE[I]; r *= 1 - 0.6 * hl; g *= 1 - 0.6 * hl; b *= 1 - 0.6 * hl;
      var rm = sstep(232, 225.5, rad); r *= 1 - 0.6 * rm; g *= 1 - 0.6 * rm; b *= 1 - 0.6 * rm;
      Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light; continue;
    }
    var seg = Math.floor(((PI / 2 - ang) / (2 * PI / 20) + 0.5 + 20) % 20), alt = seg % 2 === 0, base;
    if (rad < 6.35) base = redC; else if (rad < 15.9) base = greenC;
    else if (rad > 99 && rad < 107) base = alt ? redC : greenC; else if (rad > 162 && rad < 170) base = alt ? redC : greenC;
    else if (rad > 170) base = blackC; else base = alt ? blackC : creamC;
    // sisal end grain: compressed fibre bundles ~1.5 mm, fine fibre ends
    var bundle = PX.vnoise(X * 0.7, Y * 0.7, seed + 1), fine = PX.vnoise(X * 3.2, Y * 3.2, seed + 2), vf = PX.vnoise(X * 7, Y * 7, seed + 3), fib = 0.84 + 0.08 * bundle + 0.09 * fine + 0.07 * vf;
    r = lerp(base[0], sisalB[0] * 0.6, ageFade * 0.25) * fib; g = lerp(base[1], sisalB[1] * 0.6, ageFade * 0.25) * fib; b = lerp(base[2], sisalB[2] * 0.6, ageFade * 0.25) * fib;
    var w = clamp(WEAR[I] * wn, 0, 1) * wearScale, fray = sstep(0.02, 0.42, w) * (0.75 + 0.25 * fine);
    r = lerp(r, sisalB[0] * 1.0, fray * 0.92); g = lerp(g, sisalB[1] * 0.97, fray * 0.92); b = lerp(b, sisalB[2] * 0.9, fray * 0.92);
    var pore = w > 0.08 && PX.h2(px, py, seed + 17) > (0.78 - 0.25 * w) ? 0.22 * w : 0;
    r *= 1 - pore; g *= 1 - pore; b *= 1 - pore * 1.05;
    var hl2 = HOLE[I], fl = FLUFF[I];
    r = lerp(r, sisalB[0] * 1.08, fl * 0.4); g = lerp(g, sisalB[1] * 1.04, fl * 0.4); b = lerp(b, sisalB[2] * 0.92, fl * 0.4);
    r *= 1 - 0.9 * hl2; g *= 1 - 0.92 * hl2; b *= 1 - 0.94 * hl2;
    // the spider: round wire rings and radial dividers, with a cast shadow below (light from above)
    var wireD = 1e9, dRing = [6.35, 15.9, 99, 107, 162, 170].reduce(function (m, q) { return Math.min(m, Math.abs(rad - q)); }, 1e9);
    if (rad > 15.9 && rad < 170) { var sa = ((PI / 2 - ang) / (2 * PI / 20) + 20) % 1, dr = Math.min(sa, 1 - sa) * 2 * PI / 20 * rad; wireD = dr; }
    wireD = Math.min(wireD, dRing);
    var shadowD = (function () { var Y2 = Y + 3.2, r2 = Math.hypot(X, Y2), a2 = Math.atan2(Y2, X), d = [6.35, 15.9, 99, 107, 162, 170].reduce(function (m, q) { return Math.min(m, Math.abs(r2 - q)); }, 1e9); if (r2 > 15.9 && r2 < 170) { var s2 = ((PI / 2 - a2) / (2 * PI / 20) + 20) % 1; d = Math.min(d, Math.min(s2, 1 - s2) * 2 * PI / 20 * r2); } return d; })();
    var shd = sstep(3.6, 0.45, shadowD) * 0.5; r *= 1 - shd; g *= 1 - shd; b *= 1 - shd;
    var halfW = 0.8, wcov = sstep(halfW, halfW * 0.35, wireD), across = clamp(wireD / halfW, 0, 1), nZ = Math.sqrt(Math.max(0, 1 - across * across));
    var metal = 0.12 + 0.08 * nZ + 0.11 * Math.pow(nZ, 12);
    r = lerp(r, metal, wcov); g = lerp(g, metal * 0.97, wcov); b = lerp(b, metal * 0.9, wcov);
    var nw = WIRE[I]; if (nw > 0) { r = lerp(r, 0.6, nw); g = lerp(g, 0.6, nw); b = lerp(b, 0.62, nw); }
    var nsh = PX.bil(WIRE, PW, PH, px, py - 1.6 * ppm) * (1 - nw) * 0.5; r *= 1 - nsh; g *= 1 - nsh; b *= 1 - nsh;
    Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  C.features({ Throwers: who, Board: age, Turned: turned ? 'Yes' : 'No', 'Best Thrower': players.reduce(function (m, p) { return Math.min(m, p.sig); }, 99) < 15 ? 'Good' : players.reduce(function (m, p) { return Math.min(m, p.sig); }, 99) < 28 ? 'Decent' : 'Learning', Misses: misses > nThrows * 0.05 ? 'Plenty' : misses ? 'A Few' : 'None' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.25, filmic: true, grain: 0.012, vig: 0.4, seed: 15 });
  C.done(o.cv.canvas, 'oche');
})();

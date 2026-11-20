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
/* Fore-edge, by Clyde (2027).
 * A stack of books on a kitchen counter, seen end-on from the side the pages open. Every book says, in grime and
 * ripples along its page edges, where it was opened and how often.
 * Engine: each book has a use distribution over its pages (a cookbook has favourite recipes; a dictionary is used
 * everywhere at the thumb-index; a novel was read once, front to back). Thumb oil and kitchen dirt accumulate on
 * each page edge in proportion to use, at the place a hand grips to turn; a spill wicks into a run of adjacent
 * pages and cockles them (the ripples open dark gaps); the page the book falls open at has a broken spine and a
 * gap; age tans every edge. Pages are drawn as a band-limited paper block with explicit openings at signatures,
 * well-used leaves, spills and the fall-open page, so the edge stays readable without a ruled-paper moiré. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RB = R.fork('books'), RU = R.fork('use'), RL = R.fork('light');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1500, VH = 1000;
  var Q = C.platform === 'standalone' ? C.query : null;
  var stack = RB.weighted([['Two Books', 20], ['Three Books', 40], ['Four Books', 30], ['Five Books', 10]]);
  var n = { 'Two Books': 2, 'Three Books': 3, 'Four Books': 4, 'Five Books': 5 }[stack];
  var KINDS = [['Cookbook', 40], ['Dictionary', 14], ['Paperback', 22], ['Diary', 12], ['Hymnal', 6], ['Atlas', 6]];
  var books = [], y = 20, favourite = RU.int(0, n - 1);
  var baseLen = RB.range(19.2, 22.8);
  for (var k = 0; k < n; k++) {
    var kind = k === favourite ? 'Cookbook' : RB.weighted(KINDS), th = { 'Cookbook': RB.range(2.6, 4.2), 'Dictionary': RB.range(4, 6), 'Paperback': RB.range(1.6, 3), 'Diary': RB.range(1.4, 2.2), 'Hymnal': RB.range(2.5, 3.5), 'Atlas': RB.range(1.5, 2.2) }[kind];
    var board = kind === 'Paperback' ? 0.03 : RB.range(0.22, 0.35), len = baseLen + RB.range(-1.1, 1.6), x0 = RB.range(-0.25, 1.3);
    var pages = Math.round((th - 2 * board) / RB.range(0.0075, 0.011)), age = RB.range(0.15, 1), use = k === favourite ? 1 : RU.range(0.15, 0.75);
    var peaks = []; if (kind === 'Cookbook' || kind === 'Hymnal') { var np = RU.int(2, 6); for (var q = 0; q < np; q++) peaks.push({ p: RU.range(0.12, 0.92), w: RU.range(0.01, 0.035), a: RU.pareto(0.55, 1.2) }); }
    books.push({ kind: kind, y1: y, y0: y - th, board: board, x0: x0, x1: x0 + len, pages: pages, age: age, use: use, peaks: peaks, cover: PX.col(RB.pick(['#6b2c25', '#2f4a3a', '#2b3550', '#7a6a4a', '#3a3a3a', '#8b4a2a', '#5c4030'])), seed: RB.rand() * 1000,
      spill: kind === 'Cookbook' && RU.chance(0.6) ? { p0: RU.range(0.2, 0.8), w: RU.range(0.04, 0.11), x: RU.range(0.38, 0.82), xw: RU.range(0.1, 0.24), col: RU.pick([[0.85, 0.95, 1.2], [0.7, 0.88, 1.15], [0.55, 0.8, 1.25]]) } : null,
      dog: RU.chance(0.5) ? RU.range(0.05, 0.95) : -1, rot: RB.gaussian(0, 0.003), sig: 16 + ((RB.rand() * 16) | 0) });
    y -= th + RB.range(0.02, 0.07);
  }
  function useOf(b, t) {
    if (b.kind === 'Paperback') return 0.25 + 0.35 * Math.exp(-t * 4);
    if (b.kind === 'Dictionary') return 0.65 + 0.45 * Math.sin(t * PI);
    if (b.kind === 'Diary') return t < 0.7 ? 0.85 : 0.12;
    if (b.kind === 'Atlas') return 0.35;
    var u = 0.12; b.peaks.forEach(function (pk) { u += pk.a * Math.exp(-Math.pow((t - pk.p) / pk.w, 2)); }); return u;
  }
  var yTop = books[books.length - 1].y0 - RB.range(0.45, 1.05);
  var yBot = books[0].y1 + RB.range(1.15, 2.15);
  var xMin = books.reduce(function (m, b) { return Math.min(m, b.x0); }, 1e9);
  var xMax = books.reduce(function (m, b) { return Math.max(m, b.x1); }, -1e9);
  var viewH = yBot - yTop, viewW = viewH * VW / VH;
  var midX = (xMin + xMax) / 2 + RB.gaussian(0, 0.25);
  var xL = midX - viewW / 2, xR = midX + viewW / 2;
  var o = PX.canvas(C, VW, VH, '#151311'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var wall = PX.col(RL.pick(['#c4b7a4', '#b9b0a0', '#c8beae', '#a9a89a'])), counter = PX.col(RL.pick(['#b8b3a8', '#8a8380', '#c4b49a', '#3d3a36']));
  var paperC = PX.col('#efe8d6'), tan = PX.col('#c9a36c'), grime = PX.col('#3a3128'), SS = 3;
  var lx = RL.chance(0.5) ? 1 : -1, seedW = RL.int(1, 9999);
  function wallShadow(X, Y) {
    var sh = 1;
    for (var i = 0; i < books.length; i++) {
      var bk = books[i];
      if (Y < bk.y0 - 0.05 || Y > bk.y1 + 0.05) continue;
      var dY = Math.max(0, Math.max(bk.y0 - Y, Y - bk.y1));
      var fall = sstep(0.08, 0, dY);
      if (X < bk.x0) sh *= 1 - 0.42 * sstep(0.7, 0, bk.x0 - X) * fall;
      if (X > bk.x1) sh *= 1 - 0.42 * sstep(0.7, 0, X - bk.x1) * fall;
    }
    return sh;
  }
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, r = 0, g = 0, b = 0, Xc = xL + (px + 0.5) * viewW / PW, Yc = yTop + (py + 0.5) * viewH / PH;
    for (var ss = 0; ss < SS; ss++) {
      var X = xL + (px + 0.5) * viewW / PW, Y = yTop + (py + (ss + 0.5) / SS) * viewH / PH, cr, cg, cb, hit = false;
      for (var k2 = 0; k2 < books.length && !hit; k2++) {
        var bk = books[k2], yy = Y - bk.rot * (X - midX); if (yy < bk.y0 || yy > bk.y1 || X < bk.x0 || X > bk.x1) continue; hit = true;
        var bl = bk.board, depth = yy - bk.y0, thk = bk.y1 - bk.y0;
        var fromEnd = Math.min(X - bk.x0, bk.x1 - X);
        if (depth < bl || depth > thk - bl) {
          var cvt = 0.8 + 0.14 * PX.vnoise(X * 14, yy * 18, bk.seed) + 0.06 * PX.vnoise(X * 48, yy * 6, bk.seed + 1);
          cr = bk.cover[0] * cvt; cg = bk.cover[1] * cvt; cb = bk.cover[2] * cvt;
          var e = Math.min(depth, thk - depth);
          if (e < 0.04) { var lip = sstep(0.04, 0, e); cr *= 1 - 0.5 * lip; cg *= 1 - 0.5 * lip; cb *= 1 - 0.5 * lip; }
          if (fromEnd < 0.07) { var end = sstep(0.07, 0, fromEnd); cr *= 1 - 0.25 * end; cg *= 1 - 0.25 * end; cb *= 1 - 0.25 * end; }
          break;
        }
        var pageSpan = thk - 2 * bl, tb = (depth - bl) / pageSpan, phase = tb * bk.pages, pg = Math.floor(phase), xt = (X - bk.x0) / (bk.x1 - bk.x0);
        var sp = bk.spill, wetZone = 0;
        if (sp) {
          var dp = Math.abs(tb - sp.p0) / sp.w, dxs = Math.abs(xt - sp.x) / sp.xw;
          wetZone = sstep(1.2, 0.65, dp + 0.14 * PX.vnoise(xt * 5, tb * 8, bk.seed + 3)) * sstep(1.35, 0.75, dxs + 0.16 * PX.vnoise(xt * 4, tb * 11, bk.seed + 4));
        }
        var u = useOf(bk, tb) * bk.use;
        var grip = bk.kind === 'Dictionary'
          ? 0.5 + 0.5 * Math.exp(-Math.pow((xt - 0.58) / 0.42, 2))
          : Math.exp(-Math.pow((xt - 0.78) / 0.28, 2)) + 0.42 * Math.exp(-Math.pow((xt - 0.42) / 0.34, 2));
        var mott = 0.82 + 0.28 * PX.fbm(xt * 4.5, tb * 6.5, bk.seed + 5, 3);
        var pageDirt = 0.88 + 0.24 * PX.ihash(pg * 17 + (bk.seed | 0));
        var gr = clamp(u * (0.38 + 1.0 * grip) * mott * pageDirt * 0.8, 0, 0.92);
        var tanA = bk.age * (0.42 + 0.5 * Math.exp(-Math.min(tb, 1 - tb) * 10));
        if (fromEnd < 0.35) tanA = Math.min(1, tanA + 0.2 * sstep(0.35, 0, fromEnd));
        var pageTone = 0.96 + 0.04 * PX.ihash(pg * 31 + (bk.seed | 0));
        cr = lerp(lerp(paperC[0], tan[0], tanA), grime[0], gr) * pageTone;
        cg = lerp(lerp(paperC[1], tan[1], tanA), grime[1], gr) * pageTone;
        cb = lerp(lerp(paperC[2], tan[2], tanA), grime[2], gr) * pageTone;
        if (wetZone > 0) {
          var od = wetZone * 0.7, tide = Math.exp(-Math.pow((1 - wetZone) / 0.14, 2)) * 0.35;
          cr *= Math.exp(-(od + tide) * sp.col[0]); cg *= Math.exp(-(od + tide) * sp.col[1]); cb *= Math.exp(-(od + tide) * sp.col[2]);
        }
        if (bk.kind === 'Dictionary') {
          var nTabs = 11, slot = tb * nTabs, tab = Math.floor(slot), tc = (tab + 0.5) / nTabs;
          var cx = bk.x0 + (0.2 + (tab % 2) * 0.06) * (bk.x1 - bk.x0);
          var cy = bk.y0 + bl + tc * pageSpan;
          var rx = 0.52, ry = pageSpan / nTabs * 0.28;
          var ddTab = (X - cx) * (X - cx) / (rx * rx) + (yy - cy) * (yy - cy) / (ry * ry);
          if (ddTab < 1) {
            var rec = sstep(1, 0.45, ddTab);
            cr *= 1 - 0.38 * rec; cg *= 1 - 0.38 * rec; cb *= 1 - 0.38 * rec;
          }
        }
        if (bk.dog >= 0 && Math.abs(tb - bk.dog) < 0.7 / bk.pages * 2 && xt > 0.93) { cr *= 1.08; cg *= 1.06; cb *= 1.02; }
        var pxPerPage = (pageSpan / bk.pages) / viewH * PH;
        // only turn on a per-leaf grating when a leaf is actually resolvable; otherwise it aliases into diagonal moiré
        var pageAmp = 0.2 * clamp((pxPerPage - 0.65) / 1.4, 0, 1);
        var atPage = Math.pow(Math.abs(Math.cos(phase * PI)), 4);
        var atSig = Math.pow(Math.abs(Math.cos(phase * PI / bk.sig)), 8);
        var splay = sstep(0.35, 1.05, u) * 0.55;
        var cockleN = wetZone * sstep(0.12, 0.55, 0.5 + 0.5 * PX.vnoise(xt * 3.2, phase * 0.1, bk.seed + 9));
        var useOpen = splay * Math.pow(Math.abs(Math.cos(phase * PI / 8)), 6);
        var cockleOpen = cockleN * Math.pow(Math.abs(Math.cos(phase * PI / 5)), 6);
        var gap = pageAmp * atPage + 0.24 * atSig + useOpen * 0.48 + cockleOpen * 0.55;
        var fiber = 0.97 + 0.03 * PX.vnoise(xt * 18, tb * 4, bk.seed + 11);
        cr *= fiber; cg *= fiber; cb *= fiber;
        var openAt = bk.peaks.length ? bk.peaks.reduce(function (a, p) { return p.a > a.a ? p : a; }).p : -1;
        if (openAt > 0 && Math.abs(tb - openAt) * bk.pages < 2.4 && bk.use > 0.45) {
          var openW = 0.3 + 0.7 * Math.exp(-Math.pow((xt - 0.5) / 0.48, 2));
          var openD = sstep(2.4, 0, Math.abs(tb - openAt) * bk.pages);
          gap = Math.max(gap, 0.7 * openW * openD);
        }
        gap = clamp(gap, 0, 0.86);
        cr *= 1 - gap; cg *= 1 - gap; cb *= 1 - gap;
        var ao = 1 - 0.3 * Math.exp(-Math.min(depth - bl, thk - bl - depth) / 0.12);
        cr *= ao; cg *= ao; cb *= ao;
        if (fromEnd < 0.06) { var endP = sstep(0.06, 0, fromEnd); cr *= 1 - 0.2 * endP; cg *= 1 - 0.2 * endP; cb *= 1 - 0.2 * endP; }
      }
      if (!hit) {
        if (Y > books[0].y1) {
          var ct = 0.88 + 0.12 * PX.vnoise(X * 2.2, Y * 5.5, seedW);
          cr = counter[0] * ct; cg = counter[1] * ct; cb = counter[2] * ct;
          var dd = Y - books[0].y1;
          if (dd < 0.85) { var shc = 1 - 0.58 * sstep(0.85, 0, dd); cr *= shc; cg *= shc; cb *= shc; }
        } else {
          var wt = 0.92 + 0.1 * PX.fbm(X * 2.2, Y * 2.4, seedW + 2, 4);
          cr = wall[0] * wt; cg = wall[1] * wt; cb = wall[2] * wt;
          var wsh = wallShadow(X, Y);
          cr *= wsh; cg *= wsh; cb *= wsh;
        }
      }
      r += cr; g += cg; b += cb;
    }
    var L = 1.04 + 0.14 * lx * ((Xc - xL) / viewW - 0.5) - 0.07 * (Yc - yTop) / viewH;
    Rr[I] = r / SS * L; Gg[I] = g / SS * L; Bb[I] = b / SS * L;
  }
  C.features({ Stack: stack, 'Most Used': books[favourite].kind, Books: books.map(function (b) { return b.kind; }).join(', '), Spill: books.some(function (b) { return b.spill; }) ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.16, filmic: true, grain: 0.012, vig: 0.16, seed: 23 });
  C.done(o.cv.canvas, 'fore-edge');
})();

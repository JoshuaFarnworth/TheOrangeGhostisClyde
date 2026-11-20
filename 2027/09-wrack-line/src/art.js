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
/* Wrack Line, by Clyde (2027).
 * A beach from above on a falling tide. The sea has drawn, in thin lines of grains and foam, every place it reached
 * since high water; each wave erased the drawings of the ones before it that it overtopped.
 * Engine: a run-up record. Waves arrive in groups with Rayleigh-distributed heights; run-up follows a Hunt-type
 * scaling with the beach slope, its front lobed by the beach cusps; the still-water line falls through the hours.
 * For every metre of beach the swash marks are kept as a stack: a new swash wipes every mark seaward of where it
 * stops and writes its own. What survives is the drawing. Sand moisture follows time since last wetting; the
 * strand line of the last high tide holds the wrack (weed, shells, one human thing at most). */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RT = R.fork('tide'), RO = R.fork('objects'), RL = R.fork('light'), RX = R.fork('texture');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var WM = 12, VW = 1000, VH = 1250;
  var Q = C.platform === 'standalone' ? C.query : null;
  var tide = RT.weighted([['Just Turned', 30], ['Falling', 44], ['Low Water', 26]]);
  var sea = RT.weighted([['Calm', 34], ['Swell', 44], ['Rough', 22]]);
  var left = RO.weighted([['Nothing', 30], ['Weed Only', 30], ['A Sandal', 12], ['A Sandcastle', 14], ['One Walker', 14]]);
  var light = RL.weighted([['Morning', 36], ['Overcast', 30], ['Evening', 34]]);
  if (Q && Q.get('left')) left = Q.get('left');
  var obl = RT.gaussian(0, 0.14), cuspL = RT.range(9, 22), cuspA = sea === 'Calm' ? 0.15 : sea === 'Swell' ? 0.5 : 0.35;
  var Hs = { 'Calm': 0.35, 'Swell': 0.9, 'Rough': 1.4 }[sea], hours = { 'Just Turned': 0.6, 'Falling': 2.5, 'Low Water': 5 }[tide];
  var drop = hours * 1.1, highY = RT.range(2.6, 4.2) + 2.2 + drop + (tide === 'Just Turned' ? 2.5 : 0), nWaves = 260, seedc = RT.rand() * 100;
  var NX = 240, marks = [];
  for (var c = 0; c < NX; c++) marks.push([]);
  var swY = new Float32Array(NX);
  for (var w = 0; w < nWaves; w++) {
    var t = w / (nWaves - 1), still = highY - 2.2 - drop * t, group = 0.6 + 0.4 * Math.sin(w * 0.9 + seedc) * Math.sin(w * 0.13), Hw = Hs * Math.sqrt(-2 * Math.log(1 - RT.rand() * 0.999)) * 0.6 * group;
    var run = 2.2 * Math.sqrt(Hw * 1.0) * 1.0 + 0.2, phase = RT.range(0, 6.28);
    for (var c2 = 0; c2 < NX; c2++) {
      var x = (c2 + 0.5) / NX * WM, cusp = cuspA * Math.cos(2 * PI * x / cuspL + seedc) * (0.6 + 0.4 * Math.sin(phase)), lobe = 0.25 * PX.vnoise(x * 0.6, w * 0.7, 3) * Hw;
      var y = still + run + cusp + lobe + obl * (x - WM / 2);
      var M = marks[c2];
      for (var q = M.length - 1; q >= 0; q--) if (M[q].y < y) M.splice(q, 1);
      M.push({ y: y, t: t, h: Hw });
      swY[c2] = y;
    }
  }
  var nowStill = highY - 2.2 - drop, waterY = new Float32Array(NX);
  for (var c3 = 0; c3 < NX; c3++) { var x3 = (c3 + 0.5) / NX * WM; waterY[c3] = nowStill + 0.9 * Math.sqrt(Hs) * (0.5 + 0.5 * Math.sin(x3 * 0.7 + seedc)) + cuspA * 0.6 * Math.cos(2 * PI * x3 / cuspL + seedc) + obl * (x3 - WM / 2); }
  var strand = function (x) { return highY + 0.4 + 0.35 * PX.vnoise(x * 0.2, 1, 7) + obl * (x - WM / 2); };
  var weed = [], nW = left === 'Nothing' ? RO.int(4, 10) : RO.int(22, 55);
  var nMats = left === 'Nothing' ? 1 : RO.int(3, 7), mats = [];
  for (var mi = 0; mi < nMats; mi++) mats.push({ x: RO.range(0.4, WM - 0.4), spread: RO.range(0.4, 1.4) });
  for (var k = 0; k < nW; k++) {
    var mat = mats[k % mats.length], wx = mat.x + RO.gaussian(0, mat.spread);
    weed.push({ x: wx, y: strand(wx) + RO.gaussian(0, 0.16), r: Math.min(0.16, RO.pareto(0.03, 2.4)), a: RO.range(0, PI), e: RO.range(1.6, 4.2), kind: RO.weighted([['kelp', 5], ['wrack', 4], ['shell', 3], ['stick', 1]]) });
  }
  var sandal = left === 'A Sandal' ? { x: RO.range(2, WM - 2), a: RO.range(0, PI) } : null; if (sandal) sandal.y = strand(sandal.x) + 0.1;
  var castle = left === 'A Sandcastle' ? { x: RO.range(2.5, WM - 2.5), r: RO.range(0.35, 0.55) } : null;
  if (castle) { castle.y = highY - 2.2 - drop * RO.range(0.2, 0.6) + 1.2; }
  var walker = left === 'One Walker' ? { y0: nowStill + RO.range(1.5, 3), dy: RO.gaussian(0, 0.04), dir: RO.pick([1, -1]) } : null;

  // crop to the drawing, not a textbook cross-section of sea / damp / dry
  var crop = RT.weighted([['Close Marks', 42], ['Water to Wrack', 36], ['Foreshore', 22]]);
  var yWmin = Infinity, ySmax = -Infinity, ySw = 0, yMkLo = Infinity, yMkHi = -Infinity;
  for (var ci0 = 0; ci0 < NX; ci0++) {
    var yw0 = waterY[ci0], ys0 = strand((ci0 + 0.5) / NX * WM);
    if (yw0 < yWmin) yWmin = yw0; if (ys0 > ySmax) ySmax = ys0; ySw += swY[ci0];
    for (var qi = 0; qi < marks[ci0].length; qi++) { var ym = marks[ci0][qi].y; if (ym < yMkLo) yMkLo = ym; if (ym > yMkHi) yMkHi = ym; }
  }
  ySw /= NX;
  if (yMkLo === Infinity) { yMkLo = ySw; yMkHi = ySmax; }
  var yTop, yBot;
  if (crop === 'Close Marks') {
    yTop = yMkLo - RT.range(0.35, 1.0);
    yBot = yMkHi + RT.range(0.4, 1.0);
    if (ySmax - yBot < 1.2) yBot = ySmax + RT.range(0.4, 1.0);
    if (yBot - yTop > 7) { var midM = (yMkLo + yMkHi) / 2; yTop = midM - 3.2; yBot = midM + 3.2; }
  } else if (crop === 'Water to Wrack') { yTop = yWmin - RT.range(0.6, 1.8); yBot = Math.min(ySmax + RT.range(0.4, 1.1), yWmin + 8); }
  else { yTop = yWmin - RT.range(1.0, 2.2); yBot = Math.min(ySmax + RT.range(1.0, 2.2), yWmin + 10); }
  if (yBot - yTop < 3.2) yBot = yTop + 3.2;
  var viewH = yBot - yTop, viewW = viewH * VW / VH, midX = WM / 2 + RT.gaussian(0, 0.5);
  var xL = midX - viewW / 2, xR = midX + viewW / 2;

  var o = PX.canvas(C, VW, VH, '#121314'), PW = o.PW, PH = o.PH, seed = (RX.rand() * 1e6) | 0;
  var Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var dryS = PX.col('#d8c7a6'), dampS = PX.col('#a8957a'), wetS = PX.col('#7d6e5c'), water = PX.col('#4f6f73'), foam = [0.85, 0.87, 0.86];
  var sunAz = RL.range(0, 2 * PI), sunEl = light === 'Evening' ? 0.22 : light === 'Morning' ? 0.35 : 0.7, Sx = Math.cos(sunAz) * Math.cos(sunEl), Sy = Math.sin(sunAz) * Math.cos(sunEl), Sz = Math.sin(sunEl);
  var sunI = light === 'Overcast' ? 0 : 2.0, skyI = light === 'Overcast' ? 1.4 : 0.6, sunC = light === 'Evening' ? [1, 0.78, 0.55] : [1, 0.95, 0.88];
  var windA = RL.range(0, PI);
  var foamAmt = sea === 'Calm' ? 0.22 : sea === 'Swell' ? 0.5 : 0.8;
  var crests = [];
  for (var cr0 = 0; cr0 < 3; cr0++) crests.push({ dy: 1.6 + cr0 * RT.range(1.5, 2.5), w: 0.1 + 0.04 * cr0 });
  function height(X, Y) {
    var dry = sstep(highY, highY + 0.5, Y), h = 0;
    var rp = (X * Math.cos(windA) + Y * Math.sin(windA)) / 0.11 + 1.6 * PX.fbm(X * 0.7, Y * 0.7, seed + 1, 3);
    var alive = 0.3 + 0.7 * sstep(-0.3, 0.3, PX.vnoise(X * 0.28, Y * 0.28, seed + 14));
    h += dry * 0.0035 * Math.pow(Math.abs(Math.sin(rp * PI)), 1.4) * alive;
    h += (1 - dry) * 0.002 * PX.fbm(X * 3, Y * 3, seed + 2, 3);
    if (castle) { var d = Math.hypot(X - castle.x, Y - castle.y), er = sstep(castle.y + 0.0, castle.y - 1.2, nowStill); var r = castle.r * (1 - 0.3 * er); h += 0.3 * (1 - er * 0.7) * sstep(r, r * 0.3, d) * (0.85 + 0.15 * Math.cos(Math.atan2(Y - castle.y, X - castle.x) * 4)) - 0.04 * Math.exp(-Math.pow((d - r * 1.5) / 0.08, 2)) * (1 - er); }
    if (walker) { var wy = walker.y0 + walker.dy * X, st = Math.round(X / 0.38), sx = st * 0.38, side = (st & 1) ? 1 : -1, du = X - sx, dv = Y - (wy + side * 0.1);
      var erased = (wy + side * 0.1) < swYat(sx) ? 1 : 0; if (!erased) { var fp = (du / 0.13) * (du / 0.13) + (dv / 0.05) * (dv / 0.05); if (fp < 1) h -= 0.012 * (1 - fp); } }
    return h;
  }
  function swYat(X) { return swY[clamp(Math.floor(X / WM * NX), 0, NX - 1)]; }
  function nearestY(col, yRef) {
    var Mc = marks[col], best = yRef, bd = 0.28;
    for (var i = 0; i < Mc.length; i++) { var d = Math.abs(Mc[i].y - yRef); if (d < bd) { bd = d; best = Mc[i].y; } }
    return best;
  }
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = xL + (px + 0.5) * viewW / PW, Y = yTop + (py + 0.5) * viewH / PH;
    var cf = X / WM * NX - 0.5, c0 = clamp(Math.floor(cf), 0, NX - 1), c1 = clamp(c0 + 1, 0, NX - 1), fx = clamp(cf - c0, 0, 1);
    var ci = clamp(Math.floor(X / WM * NX), 0, NX - 1);
    var wl = lerp(waterY[c0], waterY[c1], fx), lastSw = lerp(swY[c0], swY[c1], fx), r, g, b;
    var M = marks[ci], topY = M.length ? M[0].y : wl, sinceWet = 1;
    for (var q = 0; q < M.length; q++) if (Y < M[q].y) sinceWet = 1 - M[q].t;
    var mott = 0.88 + 0.2 * PX.fbm(X * 1.6, Y * 1.6, seed + 15, 4);
    var moist;
    if (Y < wl) moist = 1.25;
    else if (Y < lastSw) moist = lerp(1.05, 0.72, sstep(wl, lastSw, Y)) * mott;
    else if (Y < topY) moist = clamp(0.8 - sinceWet * 1.25, 0.08, 0.85) * mott;
    else moist = 0.05 * sstep(strand(X) + 1.0, strand(X) - 0.15, Y) * mott;
    var grain = PX.vnoise(X * 280, Y * 280, seed + 5) * 0.5 + 0.5, sp = PX.fbm(X * 4, Y * 4, seed + 6, 3);
    var depthW = clamp((wl - Y) / 3, 0, 1), waterC = [lerp(wetS[0] * 0.8, water[0], Math.sqrt(depthW)), lerp(wetS[1] * 0.85, water[1], Math.sqrt(depthW)), lerp(wetS[2] * 0.9, water[2], Math.sqrt(depthW))];
    var sandC;
    if (moist > 1) sandC = waterC;
    else if (moist > 0.55) sandC = [lerp(dampS[0], wetS[0], sstep(0.55, 1, moist)), lerp(dampS[1], wetS[1], sstep(0.55, 1, moist)), lerp(dampS[2], wetS[2], sstep(0.55, 1, moist))];
    else sandC = [lerp(dryS[0], dampS[0], sstep(0, 0.55, moist)), lerp(dryS[1], dampS[1], sstep(0, 0.55, moist)), lerp(dryS[2], dampS[2], sstep(0, 0.55, moist))];
    var tone = 0.9 + 0.12 * grain + 0.05 * sp; r = sandC[0] * tone; g = sandC[1] * tone; b = sandC[2] * tone;
    // swash marks: heavier, slightly irregular mineral lines with a faint pale scum, not a sparkle
    var mk = 0, scum = 0;
    for (var q2 = 0; q2 < M.length; q2++) {
      var my = lerp(nearestY(c0, M[q2].y), nearestY(c1, M[q2].y), fx) + 0.012 * PX.vnoise(X * 10, q2 * 3, seed + 7);
      var dlt = Y - my, wid = 0.012 + 0.01 * Math.min(1, M[q2].h);
      if (dlt > -0.07 && dlt < 0.09) {
        mk = Math.max(mk, Math.exp(-Math.pow(dlt / wid, 2)) * (0.55 + 0.55 * Math.min(1.15, M[q2].h)));
        scum = Math.max(scum, Math.exp(-Math.pow((dlt - 0.022) / 0.016, 2)) * 0.22 * (0.4 + 0.6 * sstep(-0.1, 0.35, PX.vnoise(X * 22, Y * 22, seed + 8))));
      }
    }
    r *= 1 - 0.52 * mk; g *= 1 - 0.54 * mk; b *= 1 - 0.58 * mk;
    r = lerp(r, 0.72, scum); g = lerp(g, 0.7, scum); b = lerp(b, 0.64, scum);
    if (Y < lastSw && Y >= wl) { var film = sstep(lastSw, lastSw - 0.7, Y); r = lerp(r, r * 0.82, film); g = lerp(g, g * 0.86, film); b = lerp(b, b * 0.9, film); }
    if (Y < wl - 0.6) {
      var crest = 0;
      for (var cr = 0; cr < crests.length; cr++) {
        var cy = wl - crests[cr].dy + 0.35 * PX.vnoise(X * 0.35, cr, seed + 20);
        crest = Math.max(crest, Math.exp(-Math.pow((Y - cy) / crests[cr].w, 2)) * sstep(-0.15, 0.4, PX.fbm(X * 0.45, cr * 3, seed + 21, 3) + 0.15));
      }
      var fl = sstep(0.4, 0.85, crest * (0.5 + 0.5 * PX.vnoise(X * 10, Y * 10, seed + 22))) * foamAmt * 0.55;
      r = lerp(r, foam[0], fl); g = lerp(g, foam[1], fl); b = lerp(b, foam[2], fl);
      var rip = 0.04 * PX.vnoise(X * 3, Y * 9, seed + 23); r *= 1 + rip; g *= 1 + rip; b *= 1 + rip;
    }
    if (Y < wl + 0.3 && Y > wl - 1.5) {
      var lace = PX.vnoise(X * 8, Y * 8, seed + 9) + 0.4 * PX.vnoise(X * 22, Y * 22, seed + 10);
      var band = Math.exp(-Math.pow((Y - wl + 0.12) / 0.28, 2));
      var fm = sstep(0.35, 0.8, lace * band) * foamAmt * 0.55;
      r = lerp(r, foam[0], fm); g = lerp(g, foam[1], fm); b = lerp(b, foam[2], fm);
    }
    var e = 0.01, hc = height(X, Y), hx = (height(X + e, Y) - hc) / e, hy = (height(X, Y + e) - hc) / e, nl = Math.hypot(hx, hy, 1), ndl = Math.max(0, (-hx * Sx - hy * Sy + Sz) / nl);
    var L = skyI + sunI * ndl; if (moist > 1) L = skyI * 0.9 + sunI * Sz * 0.6;
    if (moist > 0.5 && moist <= 1) { r += 0.02 * skyI; g += 0.025 * skyI; b += 0.03 * skyI; }
    r *= L * (sunI ? sunC[0] : 1); g *= L * (sunI ? sunC[1] : 1); b *= L * (sunI ? sunC[2] : 1);
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  weed.forEach(function (wd) {
    var mppX = viewW / PW, rr = wd.kind === 'shell' ? wd.r * 0.6 : wd.r, len = wd.kind === 'stick' ? Math.min(0.18, rr * 5) : Math.min(0.4, rr * wd.e), ca = Math.cos(wd.a), sa = Math.sin(wd.a);
    var x0 = Math.floor((wd.x - xL - len - 0.1) / mppX), x1 = Math.ceil((wd.x - xL + len + 0.1) / mppX);
    var y0 = Math.floor((wd.y - yTop - len - 0.1) / (viewH / PH)), y1 = Math.ceil((wd.y - yTop + len + 0.1) / (viewH / PH));
    for (var y = Math.max(0, y0); y <= Math.min(PH - 1, y1); y++) for (var x = Math.max(0, x0); x <= Math.min(PW - 1, x1); x++) {
      var X = xL + (x + 0.5) * viewW / PW - wd.x, Y = yTop + (y + 0.5) * viewH / PH - wd.y, u = X * ca + Y * sa, v = -X * sa + Y * ca, I = y * PW + x, k0 = 0, col;
      if (wd.kind === 'shell') { k0 = sstep(1, 0.8, (u * u) / (rr * rr) + (v * v) / (rr * rr * 0.6)); col = [0.75, 0.7, 0.62]; var rib = 0.85 + 0.15 * Math.sin(Math.atan2(v, u) * 14); col = [col[0] * rib, col[1] * rib, col[2] * rib]; }
      else if (wd.kind === 'stick') { k0 = sstep(0.016, 0.007, Math.abs(v)) * sstep(len, len * 0.9, Math.abs(u)); col = [0.2, 0.14, 0.09]; }
      else { var wob = 0.4 * PX.vnoise(u / rr * 2, v / rr * 2, seed + 11), dd = (u * u) / (len * len) + (v * v) / (rr * rr * 0.5) + wob; k0 = sstep(1, 0.6, dd) * (0.6 + 0.4 * (PX.vnoise(u * 80, v * 80, seed + 12) > -0.2 ? 1 : 0)); col = wd.kind === 'kelp' ? [0.09, 0.07, 0.04] : [0.15, 0.13, 0.06]; }
      if (k0 > 0) { Rr[I] = lerp(Rr[I], col[0] * (skyI + sunI * Sz), k0); Gg[I] = lerp(Gg[I], col[1] * (skyI + sunI * Sz), k0); Bb[I] = lerp(Bb[I], col[2] * (skyI + sunI * Sz), k0); }
    }
  });
  if (sandal) {
    var ca2 = Math.cos(sandal.a), sa2 = Math.sin(sandal.a);
    for (var y2 = 0; y2 < PH; y2++) for (var x2 = 0; x2 < PW; x2++) {
      var X2 = xL + (x2 + 0.5) * viewW / PW - sandal.x, Y2 = yTop + (y2 + 0.5) * viewH / PH - sandal.y, u2 = X2 * ca2 + Y2 * sa2, v2 = -X2 * sa2 + Y2 * ca2;
      var wdt = 0.045 + 0.012 * Math.cos(u2 / 0.13 * PI);
      if (Math.abs(u2) < 0.13 && Math.abs(v2) < wdt) { var I2 = y2 * PW + x2, sc = Math.abs(v2) > wdt - 0.008 ? 0.6 : 1; Rr[I2] = 0.45 * sc * (skyI + sunI * Sz); Gg[I2] = 0.12 * sc * (skyI + sunI * Sz); Bb[I2] = 0.1 * sc * (skyI + sunI * Sz); }
    }
  }
  C.features({ Tide: tide, Sea: sea, 'Left Behind': left, Light: light, 'Marks Kept': marks.reduce(function (a, m) { return a + m.length; }, 0) / NX > 6 ? 'Many' : 'Few' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.25, filmic: true, grain: 0.012, vig: 0.22, seed: 17 });
  C.done(o.cv.canvas, 'wrack-line');
})();

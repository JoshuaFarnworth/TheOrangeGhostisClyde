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
/* Smudge, by Clyde (2027).
 * A phone lying face up with its screen off. In the window's reflection the glass shows everything the owner's
 * thumb has done since it was last wiped: the unlock, the typing, the scrolling.
 * Engine: a day of use is simulated as contacts on a 71 x 147 mm screen. Unlocking leaves a swipe through a 3 x 3
 * pattern (or taps on PIN keys); typing taps keys in proportion to English letter frequency on a QWERTY layout,
 * thumbs on either side; scrolling is a thumb flick, an arc pivoting about the base of the thumb (curving the way the
 * holding hand curves); maps leave pinches. Each contact transfers skin oil as an ellipse with ridge texture (fingerprint
 * ridges ~0.45 mm apart) that thins along a drag. Oil scatters light: on black glass it shows as grey haze, and in the
 * reflection of a bright window it dulls the reflection. A wipe on a sleeve leaves a clean, streaky band. (Smudge
 * patterns as an unlock-pattern leak are documented by Aviv et al., 2010.) */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RU = R.fork('user'), RT = R.fork('touch'), RS = R.fork('scene');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1500, FW = 92, FH = 138, SW = 71, SH = 147;   // mm
  var hand = RU.weighted([['Right Thumb', 62], ['Left Thumb', 12], ['Both Thumbs', 26]]);
  var lock = RU.weighted([['Pattern', 34], ['PIN', 36], ['Face', 30]]);
  var habit = RU.weighted([['Scrolling', 40], ['Messaging', 32], ['Maps', 12], ['A Game', 16]]);
  var since = RU.weighted([['This Morning', 34], ['Days', 46], ['Never Wiped', 20]]);
  var hours = { 'This Morning': RU.range(3, 8), 'Days': RU.range(30, 90), 'Never Wiped': RU.range(200, 400) }[since];
  var rot = RS.gaussian(0, 0.06), px0 = FW / 2 + RS.gaussian(0, 4), py0 = FH / 2 + RS.gaussian(0, 3);
  // oil is deposited on a fixed 0.15 mm grid over the screen (independent of output resolution), sampled at render
  var GS = 0.15, GW = Math.ceil(SW / GS), GH = Math.ceil(SH / GS), G = new Float32Array(GW * GH), DS = 0.5, DW = Math.ceil(SW / DS), DH = Math.ceil(SH / DS), D = new Float32Array(DW * DH);
  var fingerSeed = RU.int(1, 9999), ridgeC = [RU.range(-3, 3), RU.range(-4, 2)];
  // one finger: its ridge pattern is computed once in finger coordinates and stamped (rotated) for every contact
  var FT = 0.15, FN = 90, FP = new Float32Array(FN * FN);
  for (var fj = 0; fj < FN; fj++) for (var fi = 0; fi < FN; fi++) { var lx0 = (fi - FN / 2) * FT, ly0 = (fj - FN / 2) * FT; FP[fj * FN + fi] = 0.5 + 0.5 * Math.sin(Math.hypot(lx0 - ridgeC[0], (ly0 - ridgeC[1]) * 0.85) / 0.45 * 2 * PI + 1.3 * PX.vnoise(lx0 * 0.4, ly0 * 0.4, fingerSeed)); }
  function press(u, v, a, b, ang, amt) {
    var ca = Math.cos(ang), sa = Math.sin(ang), Rm = Math.max(a, b) * 1.05, i0 = Math.max(0, Math.floor((u - Rm) / GS)), i1 = Math.min(GW - 1, Math.ceil((u + Rm) / GS)), j0 = Math.max(0, Math.floor((v - Rm) / GS)), j1 = Math.min(GH - 1, Math.ceil((v + Rm) / GS)), ia = 1 / (a * a), ib = 1 / (b * b);
    for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
      var dx = i * GS - u, dy = j * GS - v, lx = dx * ca + dy * sa, ly = -dx * sa + dy * ca, e2 = lx * lx * ia + ly * ly * ib; if (e2 > 1.1) continue;
      var e = Math.sqrt(e2), ti2 = Math.round(lx / FT + FN / 2), tj = Math.round(ly / FT + FN / 2), ridge = ti2 >= 0 && tj >= 0 && ti2 < FN && tj < FN ? FP[tj * FN + ti2] : 0.5;
      G[j * GW + i] += amt * sstep(1.05, 0.7, e) * (0.35 + 0.65 * ridge);
    }
  }
  function drag(pts, a, b, amt) { var L = 0, k; for (k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); var s = 0;
    for (k = 1; k < pts.length; k++) { var p0 = pts[k - 1], p1 = pts[k], seg = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), n = Math.max(1, Math.ceil(seg / 0.8));
      for (var q = 0; q < n; q++) { var t = q / n, x = lerp(p0[0], p1[0], t), y = lerp(p0[1], p1[1], t), f = amt * 0.3 * Math.exp(-s / L * 2.2); s += seg / n;
        var i0 = Math.max(0, Math.floor((x - a) / DS)), i1 = Math.min(DW - 1, Math.ceil((x + a) / DS)), j0 = Math.max(0, Math.floor((y - a) / DS)), j1 = Math.min(DH - 1, Math.ceil((y + a) / DS));
        for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { var d = Math.hypot(i * DS - x, j * DS - y); if (d < a) D[j * DW + i] += f * sstep(a, a * 0.5, d); } } } }
  var right = hand !== 'Left Thumb', both = hand === 'Both Thumbs', unlocks = Math.round(hours * RT.range(3, 6));
  // unlocking
  var pat = []; if (lock === 'Pattern') { var cur = RU.int(0, 8), used = {}; used[cur] = 1; pat.push(cur); var len = RU.int(4, 7); while (pat.length < len) { var nx = RU.int(0, 8); if (!used[nx] && Math.abs((nx % 3) - (cur % 3)) <= 1 && Math.abs(Math.floor(nx / 3) - Math.floor(cur / 3)) <= 1) { used[nx] = 1; pat.push(nx); cur = nx; } } }
  var pin = []; for (var q = 0; q < RU.pick([4, 6]); q++) pin.push(RU.int(0, 9));
  function node(i) { return [SW / 2 + ((i % 3) - 1) * 20, SH * 0.62 + (Math.floor(i / 3) - 1) * 20]; }
  function key(d) { if (d === 0) return [SW / 2, SH * 0.82]; var i = d - 1; return [SW / 2 + ((i % 3) - 1) * 21, SH * 0.5 + Math.floor(i / 3) * 14]; }
  for (var k = 0; k < Math.min(unlocks, 150); k++) {
    var jx = RT.gaussian(0, 1.2), jy = RT.gaussian(0, 1.2);
    drag([[SW / 2 + RT.gaussian(0, 6), SH - 6], [SW / 2 + RT.gaussian(0, 5), SH * 0.72]], 4.5, 6, 0.25);   // swipe up from the bottom
    if (lock === 'Pattern') drag(pat.map(function (i) { var p = node(i); return [p[0] + jx, p[1] + jy]; }), 4.5, 6, 0.6);
    if (lock === 'PIN') pin.forEach(function (d) { var p = key(d); press(p[0] + jx + RT.gaussian(0, 1), p[1] + jy + RT.gaussian(0, 1), 4.5, 5.8, -0.4, 0.35); });
  }
  // habits
  var FREQ = 'eeeeeeeeeeeetttttttttaaaaaaaaooooooooiiiiiiinnnnnnnssssssshhhhhhrrrrrrddddlllluuucccmmmwwffggyyppbbvk', ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  function kpos(ch) { for (var r = 0; r < 3; r++) { var c = ROWS[r].indexOf(ch); if (c >= 0) return [3.5 + (c + 0.5 + r * 0.5) * (SW - 7) / 10, SH * 0.74 + r * 10.5]; } return [SW / 2, SH * 0.74 + 31]; }
  var nTaps = Math.round(hours * (habit === 'Messaging' ? 220 : 50) * RT.range(0.6, 1.3)), nScroll = Math.round(hours * (habit === 'Scrolling' ? 160 : 30) * RT.range(0.6, 1.3));
  for (var t = 0; t < Math.min(nTaps, 6000); t++) { var ch = FREQ[RT.int(0, FREQ.length - 1)], p = kpos(ch), lt = both ? p[0] < SW / 2 : !right; if (t % 9 === 8) p = [SW / 2, SH * 0.74 + 31]; press(p[0] + RT.gaussian(0, 1.3) + (lt ? -0.8 : 0.8), p[1] + RT.gaussian(0, 1.2) + 1, 4, 5, lt ? 0.5 : -0.5, 0.12); }
  for (var s = 0; s < Math.min(nScroll, 2500); s++) {   // thumb flicks: arcs about the base of the thumb at the lower side edge
    var pvx = right ? SW + 14 : -14, pvy = SH * RT.range(0.75, 0.95), rr = RT.range(38, 60), a0 = (right ? PI + 0.25 : -0.25) + RT.gaussian(0, 0.12), sweep = RT.range(0.25, 0.6) * (right ? 1 : -1), pts = [];
    for (var j = 0; j <= 6; j++) { var a = a0 + sweep * j / 6; pts.push([pvx + Math.cos(a) * rr, pvy + Math.sin(a) * rr]); }
    if (pts[0][1] < 10 || pts[6][1] < 8) continue; drag(pts, 4.5, 6, 0.08);
  }
  if (habit === 'Maps') for (var m = 0; m < Math.min(hours * 6, 600); m++) { var cx = SW / 2 + RT.gaussian(0, 8), cy = SH * 0.4 + RT.gaussian(0, 12), aa = RT.range(0.4, 1.2); drag([[cx + Math.cos(aa) * 6, cy - Math.sin(aa) * 6], [cx + Math.cos(aa) * 20, cy - Math.sin(aa) * 20]], 4, 5, 0.25); drag([[cx - Math.cos(aa) * 6, cy + Math.sin(aa) * 6], [cx - Math.cos(aa) * 20, cy + Math.sin(aa) * 20]], 4, 5, 0.25); }
  if (habit === 'A Game') for (var gm = 0; gm < Math.min(hours * 80, 4000); gm++) { var lft = RT.chance(0.5); press((lft ? 12 : SW - 12) + RT.gaussian(0, 3), SH * (lft ? 0.8 : 0.78) + RT.gaussian(0, 4), 4.5, 6, lft ? 0.4 : -0.4, 0.1); }
  // wiped on a sleeve some time ago: a band cleared, then re-soiled less
  var wipe = since !== 'Never Wiped' ? { a: RS.range(-0.5, 0.5), c: RS.range(0.3, 0.7), w: RS.range(0.25, 0.45) } : null;
  // ---- render: black glass; a window reflection (soft rectangle with a glazing bar) laid across the screen
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppm = PW / FW, N = PW * PH, cr = Math.cos(rot), sr = Math.sin(rot);
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), seed = RS.int(1, 9999);
  var table = RS.weighted([['Oak Table', 40], ['Linen', 30], ['Bedside Walnut', 30]]), tc = PX.col({ 'Oak Table': '#a88b64', 'Linen': '#cfc8bb', 'Bedside Walnut': '#5e4331' }[table]);
  var rakeA = RS.range(0, 2 * PI);
  var winSk = RS.range(-0.35, 0.35), winX = RS.range(-0.2, 0.6), winY = RS.range(-0.1, 0.3), winW = RS.range(0.4, 0.65), winH = RS.range(0.3, 0.5), bar = RS.range(0.35, 0.65), sky = [0.9, 0.95, 1.0];
  if (C.query && C.query.get('dbg')) { var a1 = Array.from(G).filter(function (x) { return x > 0; }).sort(function (a, b) { return a - b; }), a2 = Array.from(D).filter(function (x) { return x > 0; }).sort(function (a, b) { return a - b; }); console.log('G p50', a1[a1.length >> 1], 'p95', a1[Math.floor(a1.length * 0.95)], 'D p50', a2[a2.length >> 1], 'p95', a2[Math.floor(a2.length * 0.95)]); }
  PX.blur(D, DW, DH, 0.5); var Gb = new Float32Array(G); PX.blur(Gb, GW, GH, 0.6 / GS);
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppm - px0, Y = (py + 0.5) / ppm - py0, u = X * cr + Y * sr + SW / 2, v = -X * sr + Y * cr + SH / 2, r, g, b;
    var ex = Math.max(0, Math.abs(u - SW / 2) - (SW / 2 - 9)), ey = Math.max(0, Math.abs(v - SH / 2) - (SH / 2 - 9)), sd = Math.hypot(ex, ey) - 9;
    var light = 1.05 - 0.3 * (py / PH);
    if (sd > 0) {   // the table; a soft shadow of the phone
      var tt = table === 'Linen' ? 0.92 + 0.05 * Math.sin(X * 6 + 2 * PX.vnoise(X * 0.2, Y * 0.2, seed)) * Math.sin(Y * 6) + 0.03 * PX.fbm(X * 0.5, Y * 0.5, seed, 3) : 0.9 + 0.12 * PX.fbm(X * 0.05, Y * 0.6, seed + 1, 4);
      var sh = 1 - 0.5 * Math.exp(-sd / 3.5); r = tc[0] * tt * sh; g = tc[1] * tt * sh; b = tc[2] * tt * sh; Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light; continue;
    }
    if (sd > -1.6) { var fr = 0.05 + 0.25 * Math.pow((sd + 1.6) / 1.6, 3); Rr[I] = fr * 0.9; Gg[I] = fr * 0.9; Bb[I] = fr * 0.95; continue; }   // the metal frame edge
    var su = u / SW, sv = v / SH, rake = 0.4 + 0.6 * sstep(1.2, -0.2, su * Math.cos(rakeA) + sv * Math.sin(rakeA));
    var skw = su + winSk * (sv - 0.5), inWin = (0.75 + 0.25 * sv) * sstep(0, 0.08, skw - winX) * sstep(0, 0.08, winX + winW - skw) * sstep(0, 0.04, sv - winY) * sstep(0, 0.04, winY + winH - sv) * (1 - 0.85 * sstep(0.014, 0.004, Math.abs(skw - winX - winW * bar))) * (1 - 0.85 * sstep(0.01, 0.003, Math.abs(sv - winY - winH * 0.5)));
    var wide = sstep(-0.25, 0.15, skw - winX) * sstep(-0.25, 0.15, winX + winW - skw) * sstep(-0.2, 0.12, sv - winY) * sstep(-0.2, 0.12, winY + winH - sv), spec = 0.006 + 0.3 * inWin * (0.7 + 0.3 * sstep(winY + winH, winY, sv)) * (0.8 + 0.2 * PX.fbm(skw * 3, sv * 3, seed + 6, 3)) * (1 - 0.35 * sstep(0.1, 0.4, PX.fbm(skw * 1.5 + 4, sv * 1.5, seed + 8, 4)) * sstep(winY + winH * 0.4, winY + winH, sv)) + 0.004 * sstep(0.2, 1, sv), dg = PX.bil(D, DW, DH, u / DS, v / DS) * (0.8 + 0.2 * PX.vnoise(u * 3, v * 0.6, seed + 5)), gr = PX.bil(G, GW, GH, u / GS, v / GS) + dg, gb = PX.bil(Gb, GW, GH, u / GS, v / GS) + dg;
    if (wipe) { var dd = (su - 0.5) * Math.cos(wipe.a) + (sv - wipe.c) * Math.sin(wipe.a); if (Math.abs(dd) < wipe.w / 2) { var streak = 0.25 + 0.2 * Math.sin((su * Math.sin(wipe.a) - sv * Math.cos(wipe.a)) * 400); gr *= 0.3 * (1 - streak * 0); gb *= 0.3; spec += 0.008 * streak * inWin * 0; } }
    // oil saturates (a finger also lifts oil off): coverage from the square root of what was laid down
    var S = 1 - Math.exp(-Math.sqrt(Math.max(gr, 0)) * 0.28), SB = 1 - Math.exp(-Math.sqrt(Math.max(gb, 0)) * 0.28);
    // clean glass is a black mirror: the window, and the dim room. Oil dulls the mirror and scatters a little of
    // the surrounding light (a wide blur of the window plus the room) toward the eye
    var refl = spec * (1 - 0.55 * SB), scat = S * (0.045 * rake + 0.2 * wide * wide + 0.1 * inWin);
    r = 0.004 + refl * sky[0] + scat; g = 0.004 + refl * sky[1] + scat; b = 0.005 + refl * sky[2] + scat * 1.05;
    var cam = Math.hypot(u - SW / 2, v - 6); if (cam < 1.6) { r = g = b = 0.004 + 0.05 * sstep(1.6, 1.0, cam) * (1 - sstep(1.0, 0.5, cam)); }
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  C.features({ Hand: hand, Unlock: lock, Mostly: habit, 'Last Wiped': since, Surface: table });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: true, grain: 0.01, vig: 0.25, seed: 18 });
  C.done(o.cv.canvas, 'smudge');
})();

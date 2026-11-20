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
/* Pushed Back, by Clyde (2027).
 * The wall behind a dining table. Every time someone stood up, their chair went back and its top rail touched the
 * paint. Years of meals become a row of grey bands, one per seat, at the height of that seat's chair.
 * Engine: each seat has a chair (back height, rail width, a sitter's habits). Every stand-up is an event: the chair
 * slides back a little further or less, so the rail meets the wall at a jittered position; contact transfers grime
 * (1 - exp(-dose)) and burnishes the matt emulsion to a sheen; harder knocks chip the paint at the rail corners,
 * exposing the previous colour and then plaster. A sitter who tips back drags the rail up in an arc. A repainted
 * patch covers some of it, imperfectly matched, and the marks begin again on top. Wall front-on, in cm. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RS = R.fork('seats'), RW = R.fork('wall');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 2000, VH = 900, Y0 = 52, FH = 24;   // cm; tight crop around the rail height; FW set after seats
  var years = RS.weighted([['A Year', 22], ['Ten Years', 44], ['Since They Moved In', 34]]), dose = { 'A Year': 700, 'Ten Years': 2200, 'Since They Moved In': 6000 }[years];
  var seats = RS.weighted([[2, 30], [3, 45], [4, 25]]), wallName = RW.pick(['Magnolia', 'Brilliant White', 'Sage', 'Duck Egg', 'Terracotta', 'Pale Grey']);
  var WALL = { 'Magnolia': '#e6dcc6', 'Brilliant White': '#ecebe6', 'Sage': '#b9c2a8', 'Duck Egg': '#bccbc6', 'Terracotta': '#c98a6c', 'Pale Grey': '#cfcfcb' }[wallName];
  var PREV = PX.col(RW.pick(['#e6dcc6', '#d8c9a0', '#c5d0c0', '#e9e3d0', '#c6b49a'])), PLASTER = PX.col('#d9ccba'), PRIMER = PX.col('#cfc3b0'), wc = PX.col(WALL);
  var place = RS.range(60, 74), sideM = RS.range(10, 18), FW = place * seats + sideM * 2;
  var o = PX.canvas(C, VW, VH, '#ccc'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH;
  var G = new Float32Array(N), B = new Float32Array(N), K = new Float32Array(N), CS = new Float32Array(N), ED = new Float32Array(N);
  function W2P(x, y) { return [x * ppc, (Y0 + FH - y) * ppc]; }
  var tx0 = sideM, tipper = RS.chance(0.4) ? RS.int(0, seats - 1) : -1, chipped = 0;
  var chairH = RS.range(84, 96); Y0 = chairH - RS.range(10, 13); var chairStyle = RS.weighted([['Matching', 70], ['Odd One', 30]]);
  for (var s = 0; s < seats; s++) {
    var rs = RS.fork('seat' + s), cx = tx0 + place * (s + 0.5) + rs.gaussian(0, 1.8), h = chairH + (chairStyle === 'Odd One' && s === seats - 1 ? rs.range(-10, 7) : rs.gaussian(0, 0.45));
    var rw = rs.range(32, 41), share = rs.pareto(1, 1.6), ev = Math.round(dose / Math.sqrt(seats) * Math.min(3, share) * rs.range(0.55, 1.35)), tilt = rs.gaussian(0, 0.015);
    var stepsI = Math.min(ev, 900), wgt = ev / stepsI;
    for (var e = 0; e < stepsI; e++) {
      var y = h - Math.abs(rs.gaussian(0, 0.5)) - (rs.chance(0.08) ? rs.range(0.5, 3.2) : 0), x = cx + rs.gaussian(0, 1.05), a = tilt + rs.gaussian(0, 0.008), hard = rs.pareto(1, 2.2);
      var arc = (s === tipper && rs.chance(0.25)) ? rs.range(3, 14) : 0;
      // most contacts are the full rail width, so each seat reads as a length of chair-back; ends (corners) hit harder
      var ul = rs.chance(0.82) ? rw : rs.range(rw * 0.55, rw * 0.9), uc = (rw - ul) / 2 * (rs.chance(0.5) ? 1 : -1); for (var u = uc - ul / 2; u <= uc + ul / 2; u += 0.2) {
        var px = x + u, py = y + a * u + arc * (1 - Math.pow(2 * u / rw, 2)) * 0.15, end = 0.42 + 0.58 * Math.pow(Math.abs(2 * u / rw), 5), p = W2P(px, py);
        PX.forDisc(p[0], p[1], 1.25 * ppc, PW, PH, function (I, d) { var dd = d / ppc, f = Math.exp(-dd * dd / 0.022) + 0.045 * Math.exp(-dd * dd / 0.28); G[I] += f * 0.007 * wgt * end * Math.min(hard, 4); B[I] += f * 0.0095 * wgt * end; });
      }
      if (hard > 9 && rs.chance(0.2) && chipped < seats * 4) {
        var side = rs.chance(0.65) ? (rs.chance(0.5) ? -1 : 1) : rs.gaussian(0, 0.4), q = W2P(x + side * rw / 2 + rs.gaussian(0, 0.25), y + rs.gaussian(0, 0.2));
        var rr = rs.range(2.0, 4.4) * ppc, sk = rs.int(1, 1e6), rot = rs.range(0, PI), squash = rs.range(0.40, 0.75);
        var ox = rs.gaussian(0.22, 0.28) * rr, oy = rs.gaussian(0.12, 0.22) * rr; chipped++;
        PX.forDisc(q[0], q[1], rr * 1.9, PW, PH, function (I, d) {
          var xx = I % PW, yy = (I / PW) | 0, dx = xx - q[0], dy = yy - q[1];
          var lx = dx * Math.cos(rot) + dy * Math.sin(rot), ly = -dx * Math.sin(rot) + dy * Math.cos(rot);
          var jagged = 0.86 + 0.22 * PX.vnoise(xx * 0.08 + 3, yy * 0.08, sk) + 0.1 * PX.vnoise(xx * 0.22, yy * 0.22, sk + 2);
          var ell = Math.hypot(lx / rr, ly / (rr * squash));
          if (ell < jagged) {
            var pit = Math.hypot(dx - ox, dy - oy) / (rr * 0.55);
            var k = (ell < jagged * 0.62 && pit < 0.95) ? 2 : 1; if (k > K[I]) K[I] = k;
            var edge = sstep(jagged - 0.32, jagged, ell);
            if (edge > ED[I]) ED[I] = edge;
            var rec = clamp(0.25 + 0.75 * (-0.5 * dx + 0.75 * dy) / (rr + 0.01), 0, 1);
            if (rec > CS[I]) CS[I] = rec;
          }
        });
      }
    }
  }
  // a repainted patch: covers marks inside it, then a fraction of the events happen again on top
  var patch = RW.chance(0.35) && years !== 'A Year', pr = null;
  if (patch) { var ps = RW.int(0, seats - 1), pcx = tx0 + place * (ps + 0.5); pr = [pcx - RW.range(22, 36), chairH - RW.range(10, 16), pcx + RW.range(22, 36), chairH + RW.range(5, 12)]; }
  var socket = RW.chance(0.28) ? [RW.pick([tx0 - 4, tx0 + place * seats + 2, RW.range(6, FW - 6)]), chairH + RW.range(-7, 3)] : null, seed = RW.int(1, 9999);
  var HOLES = []; for (var hI = 0, nh = RW.int(0, 3); hI < nh; hI++) HOLES.push([RW.range(5, FW - 5), RW.range(Y0 + 1.5, Y0 + FH - 1.5), RW.range(0.12, 0.45), RW.chance(0.7) ? 1 : 0]);
  var CRACK = RW.chance(0.28) ? [RW.range(10, FW - 10), Y0 + RW.range(2, FH - 2), RW.gaussian(0, 0.3)] : null;
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), lx = RW.chance(0.5) ? 1 : -1;
  for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
    var I = py2 * PW + px2, X = (px2 + 0.5) / ppc, Y = Y0 + FH - (py2 + 0.5) / ppc;
    var stip = PX.vnoise(X * 3, Y * 3, seed) * 0.4 + PX.vnoise(X * 9, Y * 9, seed + 1) * 0.6, peel = PX.vnoise(X * 9 + 0.15, Y * 9 + 0.15, seed + 1) - PX.vnoise(X * 9 - 0.15, Y * 9 - 0.15, seed + 1), sh = 0.97 + 0.03 * (stip - 0.5) + 0.06 * peel * lx + 0.09 * lx * (PX.fbm(X * 0.7 + 0.2, Y * 0.7, seed + 6, 3) - PX.fbm(X * 0.7 - 0.2, Y * 0.7, seed + 6, 3)) + 0.02 * PX.fbm(X * 0.02, Y * 0.02, seed + 2, 3);
    var r = wc[0] * sh, g = wc[1] * sh, b = wc[2] * sh, gr = G[I], bu = B[I];
    if (pr && X > pr[0] && X < pr[2] && Y > pr[1] && Y < pr[3]) { var m = 0.985 + 0.02 * (PX.h2(3, 4, seed) - 0.5); r *= m * 1.01; g *= m; b *= m * 0.99; gr *= 0.25; bu *= 0.3; if (K[I] > 0) K[I] = 0; var rim = Math.min(X - pr[0], pr[2] - X, Y - pr[1], pr[3] - Y); if (rim < 0.6) { r *= 0.985; g *= 0.985; b *= 0.985; } }
    var lap = 0.004 * sstep(0.2, 0, Math.abs(((X + 3 * PX.vnoise(Y * 0.05, 1, seed)) % 23) - 11.5) - 11) ; r -= lap; g -= lap; b -= lap;
    for (var hI = 0; hI < HOLES.length; hI++) { var hh = HOLES[hI], hd = Math.hypot(X - hh[0], Y - hh[1]); if (hd < hh[2]) { var hv = hh[3] ? 0.03 * (1 - hd / hh[2]) : -0.08 * sstep(hh[2], hh[2] * 0.4, hd); r += hv; g += hv; b += hv * 1.1; } }
    if (CRACK) { var cdist = Math.abs(X - CRACK[0] - 6 * PX.fbm(Y * 0.08, 2, seed + 5, 3) - (Y - CRACK[1]) * CRACK[2]); if (Y > CRACK[1] && cdist < 0.05 + 0.04 * PX.vnoise(Y, 3, seed)) { r *= 0.8; g *= 0.8; b *= 0.8; } }
    var stri = 0.75 + 0.5 * PX.vnoise(X * 0.25, Y * 0.5, seed + 9), dark = 1 - Math.exp(-gr * 3.2 * stri), gl = 1 - Math.exp(-bu * 1.2);
    r = lerp(r, 0.10, dark * 0.88); g = lerp(g, 0.095, dark * 0.88); b = lerp(b, 0.085, dark * 0.88);
    var sheen = gl * 0.08 * clamp(0.5 + 0.9 * stip + 0.4 * lx * (X / FW), 0, 1.6); r += sheen; g += sheen * 0.98; b += sheen * 0.92;
    if (K[I] === 1) { r = PREV[0] * 0.78 * sh; g = PREV[1] * 0.78 * sh; b = PREV[2] * 0.78 * sh; }
    else if (K[I] === 2) { var lit = clamp(1.05 - 0.85 * CS[I], 0.2, 1); r = 0.42 * lit + 0.12; g = 0.38 * lit + 0.11; b = 0.33 * lit + 0.10; }
    if (K[I] > 0) { r *= 0.92; g *= 0.92; b *= 0.9; }
    if (ED[I] > 0.12) { var ev = ED[I]; r = lerp(r, 0.10, ev * 0.88); g = lerp(g, 0.09, ev * 0.88); b = lerp(b, 0.08, ev * 0.88); }
    if (socket) { var dx = Math.abs(X - socket[0]), dy = Math.abs(Y - socket[1]); if (dx < 7.3 && dy < 4.3) { var edge = Math.min(7.3 - dx, 4.3 - dy); var sv = 0.92 + 0.05 * sstep(0, 0.3, edge) - (edge < 0.25 ? 0.06 : 0); r = g = b = sv; var sl = Math.abs(dx - 3.6) < 0.5 && Math.abs(Y - socket[1] - 1.2) < 0.25; if (sl) r = g = b = 0.15; } else if (dx < 7.8 && dy < 4.8 && Y < socket[1]) { r *= 0.85; g *= 0.85; b *= 0.85; } }
    var light = 1 + 0.22 * lx * (X / FW - 0.5) + 0.08 * (Y - Y0) / FH; Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  C.features({ Seats: seats, Years: years, Wall: wallName, Chairs: chairStyle, 'Tips Back': tipper >= 0 ? 'Someone' : 'Nobody', Repainted: patch ? 'One Patch' : 'Never', Chips: chipped > 12 ? 'Many' : chipped > 3 ? 'Some' : 'Few', Socket: socket ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: true, grain: 0.01, vig: 0.25, seed: 23 });
  C.done(o.cv.canvas, 'pushed-back');
})();

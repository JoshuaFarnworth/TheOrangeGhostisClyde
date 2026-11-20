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
/* Above the Radiator, by Clyde (2027).
 * The wall over a radiator after some winters. Warm air carries dust up off the fins and the wall catches it: a
 * grey breath rising from the top grille, thinning as it climbs, darker wherever the wall behind is colder.
 * Engine: a line plume rises from the radiator's top. Deposition at height y spreads like a plume (width grows
 * linearly, concentration falls), with slow turbulent streaks stretched vertically. Particles settle more on cold
 * spots (thermophoresis), so the hidden structure of the wall shows through: plasterboard dabs (a grid of soft
 * blobs), timber studs (verticals at 400 or 600 mm centres) or, on solid walls, the mortar joints of the brickwork (pattern staining). A window sill above traps the plume
 * and darkens its underside. Front-on, in cm. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RH = R.fork('heat'), RW = R.fork('wall');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep;
  var VW = 1200, VH = 1500, FW = 100, FH = 125, RT = 30, RB = 14;   // cm; radiator top at RT above the frame bottom
  var winters = RH.weighted([['One Winter', 25], ['A Few Winters', 45], ['Never Redecorated', 30]]), dose = { 'One Winter': 0.5, 'A Few Winters': 1.2, 'Never Redecorated': 2.4 }[winters];
  var behind = RW.weighted([['Dot And Dab', 40], ['Timber Studs', 30], ['Solid Brick', 30]]), sill = RW.chance(0.5), wallName = RW.pick(['Magnolia', 'Brilliant White', 'Pale Grey', 'Cream', 'Pale Blue']);
  var wc = PX.col({ 'Magnolia': '#e8dec8', 'Brilliant White': '#efeeea', 'Pale Grey': '#d3d3cf', 'Cream': '#ece2c4', 'Pale Blue': '#cfdbe0' }[wallName]);
  var smoke = RH.chance(0.15), rw = RW.range(60, Math.min(FW - 4, 100)), rx0 = (FW - rw) / 2 + RW.gaussian(0, 4), rx1 = rx0 + rw, conv = RW.chance(0.75);
  var L = RH.range(35, 70), spread = RH.range(0.12, 0.22), lean = RH.gaussian(0, 0.06), sillY = sill ? RT + RW.range(80, 95) : 1e9;
  var o = PX.canvas(C, VW, VH, '#ddd'), PW = o.PW, PH = o.PH, ppc = PW / FW, seed = RW.int(1, 9999), N = PW * PH;
  var VALVE = RW.int(0, 1), studs = [], st0 = RW.range(0, 60), stc = RW.pick([40, 60]); for (var xs = st0 - 120; xs < FW + 10; xs += stc) studs.push(xs);
  var dab = [RW.range(0, 30), RW.range(0, 25), RW.range(28, 34), RW.range(24, 30)];   // dab grid offset and pitch (cm)
  function cold(X, Y) {
    if (behind === 'Timber Studs') { var c = 0; for (var i = 0; i < studs.length; i++) c = Math.max(c, sstep(3.5, 1.5, Math.abs(X - studs[i]))); return c * 0.9; }
    if (behind === 'Dot And Dab') { var gx = (X - dab[0]) / dab[2], gy = (Y - dab[1]) / dab[3], fx = gx - Math.round(gx), fy = gy - Math.round(gy), d = Math.hypot(fx * dab[2] / 5.5, fy * dab[3] / 4.5) * (0.95 + 0.1 * PX.vnoise(Math.atan2(fy, fx) * 1.5 + 9, Math.round(gx) * 7 + Math.round(gy) * 3, seed + 3)); return sstep(1.4, 0.6, d) * 0.7; }
    var crs = Math.floor(Y / 7.5), yj = Math.abs(Y - (crs + 0.5) * 7.5), xo = (X + (crs % 2) * 11.25) % 22.5, xj = Math.min(xo, 22.5 - xo); return 0.3 * Math.max(sstep(1.2, 0.4, 3.75 - yj), sstep(1.2, 0.4, xj)) * (0.8 + 0.4 * PX.vnoise(X * 0.2, Y * 0.2, seed + 4));   // brick courses: 65 mm brick + 10 mm joint
  }
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc, Y = FH - (py + 0.5) / ppc, r, g, b, sh;
    if (Y < RT) {   // radiator: pressed steel panel with vertical channels, convector grille on top
      var inR = X > rx0 && X < rx1 && Y > RB;
      if (inR) {
        var ch = ((X - rx0) % 5) / 5, chan = 0.9 + 0.08 * Math.sin(ch * 2 * Math.PI), top = sstep(RT, RT - 1.2, Y);
        sh = chan * (0.92 + 0.05 * (Y / RT)); var dust = 0.04 * sstep(RT - 3, RT, Y) * dose;
        r = g = b = 0.86 * sh - dust; b += 0.01;
        if (conv && Y > RT - 1.5) { var fin = ((X - rx0) % 0.9) < 0.35; if (fin) { r *= 0.35; g *= 0.35; b *= 0.35; } }
        var edge = Math.min(X - rx0, rx1 - X); if (edge < 0.8) { var e = 0.75 + 0.25 * edge / 0.8; r *= e; g *= e; b *= e; }
        if (Y > RT - 0.3) { r *= 1.06; g *= 1.06; b *= 1.06; }
      } else {
        var sh0 = 0.975 + 0.05 * (PX.vnoise(X * 6, Y * 6, seed + 5) - PX.vnoise(X * 6 + 0.2, Y * 6 + 0.2, seed + 5)) + 0.015 * PX.fbm(X * 0.05, Y * 0.05, seed + 6, 2); r = wc[0] * sh0; g = wc[1] * sh0; b = wc[2] * sh0;
        var sd = Math.min(Math.abs(X - rx0), Math.abs(X - rx1)); if (sd < 3 && Y > RB) { var s2 = 0.9 + 0.1 * sd / 3; r *= s2; g *= s2; b *= s2; }
        if (Y < 10 && !(X > rx0 && X < rx1 && false)) { r = 0.9; g = 0.89; b = 0.86; if (Y > 9.5) { r *= 0.85; g *= 0.85; b *= 0.85; } }   // skirting board
      }
      if (inR) { var bh = sstep(RB + 6, RB, Y) * 0.12; r -= bh; g -= bh; b -= bh; }
      else if (Y < RB && X > rx0 && X < rx1) { var bs = 0.85 + 0.15 * sstep(RB, RB - 4, Y); r *= bs; g *= bs; b *= bs; }   // shade under the radiator
      for (var pi = 0; pi < 2; pi++) { var pxx = pi ? rx1 - 3 : rx0 + 3, dxp = Math.abs(X - pxx); if (Y < RB + 0.5 && dxp < 0.75) { var cyl = Math.sqrt(1 - Math.pow(dxp / 0.75, 2)); r = g = b = 0.55 + 0.38 * cyl; if (Y > RB - 4.5 && dxp < 1.6) {} } if (Y > RB - 5 && Y < RB + 0.5 && dxp < 1.7) { var vb = Math.sqrt(1 - Math.pow(dxp / 1.7, 2)); var vc = pi === VALVE ? [0.85, 0.85, 0.86] : [0.8, 0.8, 0.8]; r = vc[0] * (0.6 + 0.4 * vb); g = vc[1] * (0.6 + 0.4 * vb); b = vc[2] * (0.6 + 0.4 * vb); if (pi === VALVE && Y > RB - 4 && ((Y * 3) % 1) < 0.3) { r *= 0.85; g *= 0.85; b *= 0.85; } } }
    } else {
      var y = Y - RT, xc = X - lean * y;
      // line plume from [rx0, rx1]: width grows with height, concentration falls; edges entrain and darken a little
      var w = 1.5 + spread * y, a0 = 0.5 * (1 + erf((xc - rx0) / (w * 1.414))), a1 = 0.5 * (1 + erf((xc - rx1) / (w * 1.414))), inside = a0 - a1;
      var edgeB = Math.exp(-Math.pow((xc - rx0) / w, 2)) + Math.exp(-Math.pow((xc - rx1) / w, 2));
      var streak = 0.78 + 0.45 * PX.fbm(xc * 0.18, y * 0.04, seed + 1, 4), turb = 0.8 + 0.4 * PX.fbm(X * 0.08, Y * 0.08, seed + 2, 3);
      var conc = (inside * (0.85 + 0.3 * sstep(0, 6, y) * sstep(30, 5, y)) + 0.25 * edgeB * sstep(0, 10, y)) * Math.exp(-y / L) * streak * turb;
      var dep = dose * conc * (1 + 1.6 * cold(X, Y));
      if (sill) { var und = sillY - Y; if (und > 0 && und < 14) dep += dose * inside * 0.6 * Math.exp(-und / 3) * streak * Math.exp(-(sillY - RT) / (L * 2.2)); }
      var dk = 1 - Math.exp(-dep * 0.55);
      var stip = PX.vnoise(X * 6, Y * 6, seed + 5) - PX.vnoise(X * 6 + 0.2, Y * 6 + 0.2, seed + 5); sh = 0.975 + 0.05 * stip + 0.015 * PX.fbm(X * 0.05, Y * 0.05, seed + 6, 2);
      var gcol = smoke ? [0.42, 0.36, 0.25] : [0.36, 0.35, 0.33];
      r = lerp(wc[0] * sh, gcol[0], dk); g = lerp(wc[1] * sh, gcol[1], dk); b = lerp(wc[2] * sh, gcol[2], dk);
      if (Y < RT + 1.2 && X > rx0 - 2 && X < rx1 + 2) { var sdw = 0.8 + 0.2 * (Y - RT) / 1.2; r *= sdw; g *= sdw; b *= sdw; }
      if (sill && Y > sillY) { var sv = Y < sillY + 3 ? 0.78 + 0.1 * (Y - sillY) / 3 : 0.93; r = g = b = sv; b += 0.005; if (Y > sillY + 3) { r = 0.94; g = 0.93; b = 0.9; } }
    }
    var light = 1.02 + 0.08 * (Y / FH); Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  C.features({ Winters: winters, 'Behind The Plaster': behind, Sill: sill ? 'Window Above' : 'Open Wall', Wall: wallName, Radiator: conv ? 'Convector' : 'Single Panel', Smoker: smoke ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: true, grain: 0.01, vig: 0.3, seed: 24 });
  C.done(o.cv.canvas, 'above-the-radiator');
})();

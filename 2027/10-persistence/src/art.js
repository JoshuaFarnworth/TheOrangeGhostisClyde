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
/* Persistence, by Clyde (2027).
 * Lying on your back, looking straight up. Somebody you will never meet went over an hour ago; the sky has kept it.
 * Engine: a contrail model. Aircraft fly great circles (straight lines in this gnomonic, straight-up view) at
 * cruise altitude; behind each, the trail's age grows with distance. In dry air the trail sublimates within
 * a short visible stub; in an ice-supersaturated layer it persists, spreads by turbulent diffusion
 * (width ~ sqrt(age)) and by wind shear (linear in age), drifts downwind, and develops the Crow instability
 * (a chain of puffs, not a comb) after a few minutes. Brightness is ice-cloud scattering: strong forward scattering
 * near the sun; at dusk the trails are still sunlit at 10 km while the ground is in shadow. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RS = R.fork('sky'), RA = R.fork('air'), RE = R.fork('edge');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1250, FOV = 0.62;
  var Q = C.platform === 'standalone' ? C.query : null;
  var hour = RS.weighted([['Morning', 30], ['Midday', 22], ['Late Afternoon', 26], ['After Sunset', 22]]);
  var air = RA.weighted([['Dry', 14], ['Humid', 52], ['Very Humid', 34]]);
  var traffic = RA.weighted([['One', 36], ['Two', 32], ['A Few', 24], ['Corridor', 8]]);
  var edge = RE.weighted([['Open Sky', 36], ['Wires', 36], ['Roof Edge', 28]]);
  if (air === 'Dry' && edge === 'Open Sky' && RE.chance(0.55)) edge = RE.pick(['Wires', 'Roof Edge']);
  if (Q && Q.get('hour')) hour = Q.get('hour'); if (Q && Q.get('air')) air = Q.get('air');
  var sunEl = { 'Morning': RS.range(0.25, 0.5), 'Midday': RS.range(0.8, 1.1), 'Late Afternoon': RS.range(0.12, 0.3), 'After Sunset': RS.range(-0.1, -0.03) }[hour], sunAz = RS.range(0, 2 * PI);
  var sun = [Math.cos(sunAz) * Math.cos(sunEl), Math.sin(sunAz) * Math.cos(sunEl), Math.sin(sunEl)];
  var windA = RA.range(0, 2 * PI), wind = RA.range(0.004, 0.02), shear = RA.range(0.2, 1.0);
  var nP = { 'One': 1, 'Two': 2, 'A Few': RA.int(3, 4), 'Corridor': RA.int(5, 7) }[traffic], planes = [];
  var corrA = RA.range(0, PI);
  for (var k = 0; k < nP; k++) {
    var a = traffic === 'Corridor' ? corrA + RA.gaussian(0, 0.06) : RA.range(0, PI), dir = RA.pick([1, -1]);
    var ux = Math.cos(a) * dir, uy = Math.sin(a) * dir, nx = -Math.sin(a), ny = Math.cos(a);
    var off = RA.range(-0.42, 0.42);
    var pers = air === 'Dry' ? 0 : air === 'Humid' ? (RA.chance(0.6) ? 1 : 0) : 1;
    if (air === 'Humid' && k === 0) pers = 1;
    if (air === 'Dry' && k === 0) pers = 0;
    var v = 0.08, ageHead, head;
    // s increases along the flight path; the aircraft sits at s = head, and the trail exists for s < head.
    // always place head at the +s side so the visible frame is behind the aircraft, never ahead of it.
    if (!pers) {
      head = (k === 0) ? RA.range(-0.15, 0.55) : RA.range(-0.2, 0.7);
      ageHead = 0;
    } else {
      ageHead = (k === 0) ? RA.range(0, 8) : RA.range(5, 50);
      var headIn = RA.chance(k === 0 && ageHead < 4 ? 0.4 : 0.06);
      head = headIn ? RA.range(0.15, 0.55) : (0.95 + RA.range(0, 0.7));
    }
    planes.push({ ux: ux, uy: uy, nx: nx, ny: ny, off: off, head: head, ageHead: ageHead, pers: pers, v: v, w0: pers ? 0.0025 : 0.002, fade: pers ? 1e9 : RA.range(0.14, 0.28), seed: RA.rand() * 100, crowLam: RA.range(0.18, 0.30) });
  }
  var o = PX.canvas(C, VW, VH, '#0d1220'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var dusk = hour === 'After Sunset', seed = (RS.rand() * 1e6) | 0;
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, x = (px / PW - 0.5) * 2 * FOV, y = (py / PH - 0.5) * 2 * FOV * VH / VW;
    var dl = Math.hypot(x, y, 1), d = [x / dl, -y / dl, 1 / dl], cs = d[0] * sun[0] + d[1] * sun[1] + d[2] * sun[2], zen = 1 / dl;
    var lum = dusk ? 0.07 + 0.14 * Math.max(0, cs + 0.25) : 0.28 + 0.32 * Math.pow(Math.max(0, cs), 5) + 0.22 * Math.pow(1 - zen, 1.5) * 2.6;
    var sky = dusk ? [0.2 * lum * 3 + 0.04, 0.22 * lum * 3 + 0.045, 0.5 * lum * 3 + 0.09] : [0.17 * lum, 0.33 * lum, 0.86 * lum];
    if (hour === 'Late Afternoon') { var w = Math.max(0, cs) * 0.28; sky[0] += w * 0.55; sky[1] += w * 0.32; sky[2] += w * 0.08; }
    if (hour === 'Morning') { var wm = Math.max(0, 1 - zen) * 0.08; sky[0] += wm * 0.25; sky[1] += wm * 0.12; }
    var r = sky[0], g = sky[1], b = sky[2];
    for (var k2 = 0; k2 < planes.length; k2++) {
      var p = planes[k2], s = x * p.ux + y * p.uy, t = x * p.nx + y * p.ny - p.off;
      var behind = p.head - s; if (behind < -0.006) continue;
      var age = Math.max(0, p.ageHead + behind / p.v);
      var keep = Math.exp(-behind / p.fade);
      if (keep < 0.012) continue;
      var drift = wind * age * Math.cos(windA - Math.atan2(p.ny, p.nx));
      var width = p.w0 + 0.0028 * Math.sqrt(age) + 0.0009 * shear * age;
      var crowOn = p.pers ? sstep(5, 14, age) * sstep(48, 18, age) : 0;
      var crowLam = p.crowLam * (1 + 0.2 * PX.vnoise(s * 1.6, p.seed, seed + 3));
      var crowPh = s * 2 * PI / Math.max(0.14, crowLam) + p.seed;
      var puff = Math.pow(0.5 + 0.5 * Math.cos(crowPh), 1.1);
      var meander = crowOn * Math.min(0.007, width * 0.16) * Math.sin(crowPh + 0.4 * PX.vnoise(s * 3, p.seed, seed + 4));
      var tt = t - drift - meander - 0.0014 * PX.vnoise(s * 14, age * 0.08, seed + k2) * Math.sqrt(age);
      var widthE = width * (1 - crowOn * 0.32 + crowOn * 0.55 * puff);
      var core = age < 0.8 && !crowOn ? 0.5 * (Math.exp(-Math.pow((tt - 0.0014) / widthE, 2)) + Math.exp(-Math.pow((tt + 0.0014) / widthE, 2))) : Math.exp(-Math.pow(tt / Math.max(1e-5, widthE), 2));
      var sc2 = 1 / Math.sqrt(1 + age * 0.3);
      var tex = 0.88 + 0.12 * (PX.fbm(s * 10 * sc2, tt * 14 * sc2, seed + k2 * 7, 4) * 0.5 + 0.5);
      var fall = 0;
      if (p.pers && age > 14 && air === 'Very Humid') {
        var fv = PX.fbm(s * 6, (tt - width * 1.6) * 4 + age * 0.01, seed + k2 * 9, 3);
        fall = 0.32 * sstep(-0.1, 0.45, fv) * Math.exp(-Math.pow((tt - width * 1.7) / (width * 2.2), 2)) * sstep(14, 22, age);
      }
      var dens = (core * tex * (1 - crowOn * 0.42 * (1 - puff)) + fall) * keep * Math.min(1, 0.75 / Math.sqrt(1 + width * 60)) * sstep(-0.004, 0.01, behind);
      dens = clamp(dens, 0, 1);
      var scat = dusk ? 1.3 : 0.75 + 1.2 * Math.pow(Math.max(0, cs), 8) + 0.2;
      var lit = dusk ? [1.0, 0.55, 0.42] : hour === 'Late Afternoon' ? [1.0, 0.86, 0.7] : [1, 0.98, 0.96];
      var cl = dusk ? 0.42 : 0.9;
      r = lerp(r, cl * scat * lit[0], dens * 0.85); g = lerp(g, cl * scat * lit[1], dens * 0.85); b = lerp(b, cl * scat * lit[2], dens * 0.85);
      if (behind >= 0 && behind < 0.004 && Math.abs(tt) < 0.0022 && p.ageHead < 2) {
        var gl = sstep(0.004, 0, behind) * sstep(0.0022, 0, Math.abs(tt));
        if (dusk) { r = lerp(r, 1, gl); g = lerp(g, 0.28, gl); b = lerp(b, 0.16, gl); }
        else { r = lerp(r, 0.98, gl * 0.9); g = lerp(g, 0.96, gl * 0.9); b = lerp(b, 0.94, gl * 0.9); }
      }
    }
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  if (edge === 'Wires') {
    var wa = RE.range(-0.5, 0.5), wn = RE.int(2, 4), wo = RE.range(-0.3, 0.2), sag = RE.range(0.02, 0.08);
    for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
      var u = px2 / PW - 0.5, v = py2 / PH - 0.5, along = u * Math.cos(wa) + v * Math.sin(wa), acr = -u * Math.sin(wa) + v * Math.cos(wa) - sag * (along * along * 4 - 1);
      for (var q = 0; q < wn; q++) {
        var dw = Math.abs(acr - wo - q * 0.045) * PW;
        if (dw < 1.7) {
          var I2 = py2 * PW + px2, f = 1 - dw / 1.7, glw = sstep(0.55, 0, dw) * 0.12;
          Rr[I2] = Rr[I2] * (1 - 0.9 * f) + glw * 0.15; Gg[I2] = Gg[I2] * (1 - 0.9 * f) + glw * 0.15; Bb[I2] = Bb[I2] * (1 - 0.88 * f) + glw * 0.16;
        }
      }
    }
  }
  if (edge === 'Roof Edge') {
    var side = RE.int(0, 3), depth = RE.range(0.09, 0.17), ra = RE.gaussian(0, 0.06);
    var gW = 0.01 + RE.range(0, 0.006), soffCol = PX.col(RE.pick(['#c9beab', '#d2c6b0', '#b5aa96', '#d8d0c2']));
    var gutCol = PX.col(RE.pick(['#2c2a28', '#3a3530', '#1f2420'])), seedR = RE.int(1, 9999);
    for (var py3 = 0; py3 < PH; py3++) for (var px3 = 0; px3 < PW; px3++) {
      var u3 = px3 / PW, v3 = py3 / PH;
      var dd = side === 0 ? v3 + (u3 - 0.5) * ra : side === 1 ? 1 - u3 + (v3 - 0.5) * ra : side === 2 ? 1 - v3 + (u3 - 0.5) * ra : u3 + (v3 - 0.5) * ra;
      if (dd >= depth) continue;
      var I3 = py3 * PW + px3, into = depth - dd;
      var alongR = side === 0 || side === 2 ? u3 : v3;
      if (into < gW) {
        var gt = 0.55 + 0.45 * sstep(gW * 0.15, 0, into) + 0.1 * PX.vnoise(alongR * 40, into * 200, seedR);
        Rr[I3] = gutCol[0] * gt; Gg[I3] = gutCol[1] * gt; Bb[I3] = gutCol[2] * gt;
      } else {
        var sl = (into - gW) / Math.max(1e-4, depth - gW);
        var boards = 0.97 + 0.03 * Math.cos(alongR * PI * 14 + 0.3 * PX.vnoise(alongR * 5, 0, seedR));
        var dirt = 0.93 + 0.07 * PX.fbm(alongR * 5, sl * 3, seedR + 2, 3);
        var shade = 0.78 + 0.22 * sl;
        if (into - gW < 0.006) shade *= 0.72;
        var tcol = boards * dirt * shade;
        Rr[I3] = soffCol[0] * tcol; Gg[I3] = soffCol[1] * tcol; Bb[I3] = soffCol[2] * tcol;
      }
    }
  }
  C.features({ Hour: hour, Air: air, Traffic: traffic, Edge: edge });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.2, filmic: true, grain: 0.01, vig: 0.15, seed: 19 });
  C.done(o.cv.canvas, 'persistence');
})();

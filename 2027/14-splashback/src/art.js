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
/* Splashback, by Clyde (2027).
 * The tiles behind a domestic hob, between wipes. Every frying pan throws a fan of oil droplets; the tiles keep them.
 * Engine: cooking sessions are drawn from a household's habits (which burner, which dish). Each session ejects
 * droplets from the pan rim with log-normal diameters (tens to hundreds of microns) and speeds of 1-3 m/s at
 * random elevations; each is flown ballistically (gravity, no drag below 0.2 mm... a small drag term above) to the
 * wall plane, so the spatter forms a parabolic fan whose reach depends on the pan's distance from the wall.
 * Landed drops spread to a few times their diameter and dry with a darker rim. Old oil oxidises toward amber and
 * holds dust; the grout soaks it up. A wipe resets everything inside the cloth's arcs and leaves a faint smear. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RH = R.fork('habit'), RD = R.fork('drops'), RT = R.fork('tiles'), RW = R.fork('wipe');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1500, VH = 1000, FW = 66, FH = 44;   // cm; hob surface at z = 0 (bottom of frame), wall plane y = 0
  var tile = RT.weighted([['Metro White', 40], ['Square White', 25], ['Square Cream', 15], ['Handmade Green', 10], ['Glass Panel', 10]]);
  var cook = RH.weighted([['Fry-Ups', 30], ['Stir-Fry', 22], ['Sauces', 22], ['A Bit Of Everything', 26]]);
  var since = RW.weighted([['Wiped Yesterday', 22], ['A Week', 34], ['A Month', 28], ['Months', 16]]);
  var days = { 'Wiped Yesterday': 1, 'A Week': 7, 'A Month': 30, 'Months': RW.int(90, 240) }[since];
  var burners = [{ x: 18, d: 13 }, { x: 48, d: 13 }, { x: 18, d: 36 }, { x: 48, d: 36 }];
  if (RH.chance(0.3)) burners.push({ x: 33, d: 25 });   // a five-ring hob with a wok burner in the middle
  var habit = burners.map(function (b, i) { return Math.pow(RH.rand(), 2.2) + (i === RH.int(0, burners.length - 1) ? 1.5 : 0); });
  var hs = habit.reduce(function (a, b) { return a + b; }, 0);
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH;
  var OIL = new Float32Array(N), AGE = new Float32Array(N), RED = new Float32Array(N), RIM = new Float32Array(N);
  var event = RH.weighted([['None', 70], ['Sauce Spat', 18], ['A Hot Pan Of Water', 12]]);
  // the last wipe: arcs of a cloth from a right hand, leaving a cleared region and smears
  // the last wipe: a few overlapping sweeps of a cloth (right hand, pivoting at the elbow); everything older than
  // the wipe is gone where the cloth went and stays where it didn't (behind the hob's back corners, above reach)
  var strokes = [], nS = RW.int(4, 8), ecx = RW.range(26, 44), ecz = RW.range(-12, -2);
  for (var q = 0; q < nS; q++) strokes.push({ r: RW.range(18, 36), a0: RW.range(0.35, 1.2), a1: RW.range(1.8, 2.8), w: RW.range(4, 7), cx: ecx + RW.gaussian(0, 4), cz: ecz + RW.gaussian(0, 3) });
  function wipeAmt(x, z) { var m = 0; for (var q = 0; q < strokes.length; q++) { var st = strokes[q], dx = x - st.cx, dz = z - st.cz, a = Math.atan2(dz, dx), rr = Math.hypot(dx, dz), e = Math.min(a - st.a0, st.a1 - a) * rr; if (e < -1) continue; var w = st.w * (1 + 0.2 * PX.vnoise(a * 9, q, 77)); m = Math.max(m, sstep(w, w * 0.55, Math.abs(rr - st.r)) * sstep(-1, 2.5, e)); } return m; }
  function wiped(x, z) { return wipeAmt(x, z) > 0.5; }
  var oldDays = since === 'Months' ? 0 : RW.int(20, 90);
  var total = days + oldDays, sessions = Math.max(3, Math.round(Math.min(total, 300) * (cook === 'Stir-Fry' ? 0.9 : 0.7))), g = 981, nd = 0;
  function splat(x, z, rad, amt, ageDays, red) {
    if (x < 0 || x > FW || z < 0 || z > FH) return;
    if (ageDays > days) { var wa = wipeAmt(x, z); if (wa > 0) { amt *= Math.max(0, 1 - wa * 1.15); if (amt <= 0.02) return; } }   // everything older than the wipe inside it is gone
    if (amt <= 0) return;
    var cx = x * ppc, cy = (FH - z) * ppc, rp = rad * ppc, ageN = clamp(ageDays / 150, 0, 1);
    if (rp < 1.2) { var xi = Math.floor(cx - 0.5), yi = Math.floor(cy - 0.5), fx = cx - 0.5 - xi, fy = cy - 0.5 - yi, a = PI * rp * rp * amt;
      [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]].forEach(function (q) { var X = xi + q[0], Y = yi + q[1]; if (X < 0 || Y < 0 || X >= PW || Y >= PH) return; var I = Y * PW + X; OIL[I] += a * q[2]; AGE[I] += a * q[2] * ageN; RED[I] += a * q[2] * red; RIM[I] += a * q[2] * 0.5; });
      return; }
    PX.forDisc(cx, cy, rp + 1, PW, PH, function (I, d) { var c = clamp(rp + 0.5 - d, 0, 1) * amt, rim = Math.exp(-Math.pow((rp - d) / Math.max(0.7, rp * 0.18), 2)); OIL[I] += c; AGE[I] += c * ageN; RED[I] += c * red; RIM[I] += rim * c; });
  }
  for (var s = 0; s < sessions; s++) {
    var ageDays = RD.range(0, total), u = RD.rand() * hs, bi = 0; while (bi < burners.length - 1 && u > habit[bi]) { u -= habit[bi]; bi++; }
    var b = burners[bi], dish = cook === 'A Bit Of Everything' ? RD.pick(['Fry-Ups', 'Stir-Fry', 'Sauces']) : cook, sauce = dish === 'Sauces';
    var n = Math.round((sauce ? 700 : dish === 'Stir-Fry' ? 9000 : 6000) * RD.range(0.4, 1.6)), panR = sauce ? 10 : dish === 'Stir-Fry' ? 16 : 13, rimH = sauce ? 12 : 6;
    for (var k = 0; k < n; k++) {
      var dia = Math.exp(RD.gaussian(Math.log(sauce ? 0.07 : 0.026), 0.75)), v = RD.range(80, sauce ? 160 : 320) * Math.pow(0.02 / Math.max(dia, 0.005), 0.15);
      var az = RD.range(0, 2 * PI), px0 = b.x + Math.cos(az) * panR * Math.sqrt(RD.rand()), py0 = b.d + Math.sin(az) * panR * Math.sqrt(RD.rand());
      var el = Math.asin(RD.range(0.1, 0.98)), dirA = RD.range(0, 2 * PI), vh = v * Math.cos(el), vy = -vh * Math.sin(dirA), vx = vh * Math.cos(dirA), vz = v * Math.sin(el);
      if (vy >= -1) continue; var t = py0 / -vy, drag = 1 / (1 + t * 0.6 / Math.max(dia * 40, 0.3)), z = rimH + vz * t * drag - 0.5 * g * t * t, x = px0 + vx * t * drag;
      if (z <= 0.3) continue; nd++;
      splat(x, z, dia * RD.range(1.6, 2.8) * 0.5, sauce ? 1.6 : 1, ageDays, sauce ? 1 : 0);
    }
  }
  if (event === 'Sauce Spat') { var ex = RH.pick(burners), ag = RD.range(0.5, total); for (var k2 = 0; k2 < 260; k2++) { var a2 = RD.range(-PI, 0), rr = RD.pareto(0.6, 1.4); splat(ex.x + RD.gaussian(0, 6), 14 + Math.abs(RD.gaussian(0, 7)), Math.exp(RD.gaussian(Math.log(0.12), 0.6)), 2, ag, 1); } }
  if (event === 'A Hot Pan Of Water') { /* no oil: steam leaves a pale bloom of limescale specks */ }
  // ---- shading
  var seed = RT.int(1, 9999), tw, th, bevel, grout = 0.22, base, gcol = PX.col(RT.pick(['#d8d4cc', '#bdb7ad', '#e6e2da']));
  if (tile === 'Metro White') { tw = 20; th = 10; bevel = 0.6; base = PX.col('#f2f1ec'); }
  else if (tile === 'Square White') { tw = th = 15; bevel = 0.25; base = PX.col('#f3f2ee'); }
  else if (tile === 'Square Cream') { tw = th = 10; bevel = 0.25; base = PX.col('#ebe2cc'); }
  else if (tile === 'Handmade Green') { tw = th = 13; bevel = 0.4; base = PX.col('#7f9c88'); }
  else { tw = th = 1e9; bevel = 0; base = PX.col('#e9eae6'); grout = 0; }
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), amber = PX.col('#b98a3e'), sauceC = PX.col('#c2502a'), dust = PX.col('#8a7b66');
  PX.blur(OIL, PW, PH, 0.35 * ppc / 16.7); PX.blur(RED, PW, PH, 0.35 * ppc / 16.7); PX.blur(AGE, PW, PH, 0.35 * ppc / 16.7);
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc, Z = FH - (py + 0.5) / ppc, r, gg, bb;
    if (Z < 2.2) {   // the hob's back edge: dark glass with a soft reflection
      var f = 0.05 + 0.03 * sstep(2.2, 0, Z); r = f; gg = f; bb = f * 1.1; Rr[I] = r; Gg[I] = gg; Bb[I] = bb; continue;
    }
    var row = Math.floor((Z - 2.2) / th), off = tile === 'Metro White' && row % 2 ? tw / 2 : 0, tx = ((X + off) % tw + tw) % tw, tz = (Z - 2.2) - row * th;
    var dg = Math.min(tx, tw - tx, tz, th - tz), inG = dg < grout / 2, tid = row * 131 + Math.floor((X + off) / tw);
    var glaze = 1 + 0.015 * PX.fbm(X * 0.4, Z * 0.4, seed + 9, 3) + (tile === 'Handmade Green' ? 0.12 * PX.vnoise(X * 0.5 + tid, Z * 0.5, seed) + 0.04 * PX.fbm(X * 3, Z * 3, seed + tid, 3) : 0.012 * (PX.ihash(tid + seed) - 0.5));
    r = base[0] * glaze; gg = base[1] * glaze; bb = base[2] * glaze;
    var sh = 1, spec = 0;
    if (inG) { r = gcol[0]; gg = gcol[1]; bb = gcol[2]; sh = 0.88; var gs = clamp(PX.bil(OIL, PW, PH, px, py) * 2 + 0.3 * sstep(30, 3, Z), 0, 1); r *= 1 - 0.55 * gs; gg *= 1 - 0.6 * gs; bb *= 1 - 0.7 * gs; }
    else if (bevel > 0 && dg < grout / 2 + bevel) { var e = (dg - grout / 2) / bevel, top = tz < th / 2 ? -1 : 1; sh = 0.9 + 0.1 * Math.sqrt(e); if (tz > th / 2) spec = 0.12 * (1 - e) * (1 - e); }
    // a soft reflection of the under-cabinet light strip in the glaze
    spec += 0.07 * sstep(FH - 20, FH, Z) * (tile === 'Glass Panel' ? 2.5 : 1);
    var oil = OIL[I], ag = oil > 0 ? AGE[I] / oil : 0, red = oil > 0 ? RED[I] / oil : 0, rim = RIM[I];
    var cov = 1 - Math.exp(-oil * 1.6), od = cov * (0.45 + 0.55 * ag) + clamp(rim, 0, 2) * 0.15 * (0.4 + ag);
    var cr = lerp(amber[0], sauceC[0], red), cg = lerp(amber[1], sauceC[1], red), cb = lerp(amber[2], sauceC[2], red);
    cr = lerp(cr, dust[0], ag * 0.5); cg = lerp(cg, dust[1], ag * 0.5); cb = lerp(cb, dust[2], ag * 0.5);
    r = lerp(r, r * cr * 1.3, clamp(od, 0, 1)); gg = lerp(gg, gg * cg * 1.3, clamp(od, 0, 1)); bb = lerp(bb, bb * cb * 1.3, clamp(od, 0, 1));
    spec += 0.05 * cov * (1 - ag);   // fresh oil is glossy
    var wA = oldDays ? wipeAmt(X, Z) : 0; if (wA > 0) { var sm = 0.03 * wA * (1 - wA) * 4 * (0.5 + 0.5 * PX.vnoise(X * 0.5, Z * 5, seed + 11)); r *= 1 - sm; gg *= 1 - sm; bb *= 1 - sm * 1.5; spec += sm * 0.6; }
    var light = 0.62 + 0.5 * sstep(0, FH, Z) - 0.08 * Math.pow((X - FW / 2) / FW, 2) * 4;
    Rr[I] = r * sh * light + spec; Gg[I] = gg * sh * light + spec; Bb[I] = bb * sh * light + spec * 1.03;
  }
  if (C.query && C.query.get("dbg")) console.log("nd", nd, "sessions", sessions, "oil", OIL.reduce(function (a, b) { return a + b; }, 0));
  C.features({ Tiles: tile, Cooking: cook, 'Since Wiped': since, 'Favourite Ring': ['Back Left', 'Back Right', 'Front Left', 'Front Right', 'Wok'][habit.indexOf(Math.max.apply(null, habit))], Incident: event === 'A Hot Pan Of Water' ? 'None' : event });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: false, grain: 0.01, vig: 0.25, seed: 14 });
  C.done(o.cv.canvas, 'splashback');
})();

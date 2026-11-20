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
/* Unfaded, by Clyde (2027).
 * An empty room on the day after the move. The sun has spent years printing the furniture onto the floor.
 * Engine: a solar-geometry exposure integrator. For a latitude and a window orientation it walks the sun across
 * the sky every hour of every month for the years the room was lived in, projects the window aperture (inner and
 * outer reveal, so low sun is clipped by the wall thickness) onto the floor, subtracts the cast shadows and
 * footprints of every piece of furniture standing at that time (furniture on legs lets low sun creep under), adds
 * diffuse skylight by window view factor, and turns the accumulated dose into photochemical change of the wood
 * (cherry and pine darken, walnut bleaches, carpet loses dye). Today's sun patch, with its glazing bars, is drawn
 * on top: the light that did it, still arriving. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RR = R.fork('room'), RF = R.fork('furniture'), RL = R.fork('light'), RT = R.fork('texture');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI, D2R = PI / 180;
  var WM = 4.0, HM = 5.0, VW = 1000, VH = 1250, CL = 0.01, GW = 400, GH = 500;   // room floor in metres, 1 cm dose cells
  var Q = C.platform === 'standalone' ? C.query : null;

  // ---------------- traits ----------------
  var floor = RR.weighted([['Oak Boards', 26], ['Pine Boards', 22], ['Cherry Boards', 16], ['Walnut Boards', 10], ['Carpet', 14], ['Oak Parquet', 12]]);
  var facing = RR.weighted([['South', 34], ['Southwest', 22], ['Southeast', 20], ['West', 14], ['East', 10]]);
  var years = RR.weighted([['Two Years', 14], ['Seven Years', 34], ['Fifteen Years', 32], ['Thirty Years', 20]]);
  var windowT = RR.weighted([['Sash Window', 38], ['Casement', 26], ['French Doors', 16], ['Two Windows', 20]]);
  var today = RL.weighted([['Winter Morning', 22], ['Winter Noon', 22], ['Spring Afternoon', 24], ['Late Afternoon', 20], ['Overcast', 12]]);
  if (Q && Q.get('floor')) floor = Q.get('floor'); if (Q && Q.get('facing')) facing = Q.get('facing'); if (Q && Q.get('today')) today = Q.get('today');
  var lat = RR.range(40, 54) * D2R, A = { 'South': 180, 'Southwest': 222, 'Southeast': 138, 'West': 262, 'East': 98 }[facing] * D2R;
  var nE = Math.sin(A), nN = Math.cos(A), rE = nN, rN = -nE;     // window outward normal and room +x in (east, north)
  var nYears = { 'Two Years': 2, 'Seven Years': 7, 'Fifteen Years': 15, 'Thirty Years': 30 }[years];
  var reveal = RR.range(0.12, 0.3);

  // windows: x0, x1, sill, head, panes [cols, rows], bar width
  var wins = [];
  function addWin(cx, w, sill, head, cols, rows) { wins.push({ x0: cx - w / 2, x1: cx + w / 2, z0: sill, z1: head, cols: cols, rows: rows, bar: RR.range(0.025, 0.045) }); }
  if (windowT === 'Sash Window') addWin(RR.range(1.2, 2.8), RR.range(0.9, 1.3), RR.range(0.6, 0.85), RR.range(2.0, 2.3), RR.pick([2, 3]), RR.pick([2, 4]));
  else if (windowT === 'Casement') addWin(RR.range(1.2, 2.8), RR.range(1.1, 1.7), RR.range(0.75, 0.95), RR.range(1.95, 2.15), RR.pick([2, 3]), 1);
  else if (windowT === 'French Doors') addWin(RR.range(1.3, 2.7), RR.range(1.2, 1.5), 0.02, RR.range(2.05, 2.2), 2, RR.pick([3, 5]));
  else { var g = RR.range(0.5, 1.0), w2 = RR.range(0.8, 1.0); addWin(2 - g / 2 - w2 / 2, w2, 0.75, 2.05, 2, 2); addWin(2 + g / 2 + w2 / 2, w2, 0.75, 2.05, 2, 2); }

  // ---------------- what stood here ----------------
  // box: x0,y0,x1,y1 (m), z0 (underside), z1 (top), legs, kind
  var CAT = {
    sofa: { w: [1.8, 2.3], d: [0.85, 1.0], z0: 0.12, z1: 0.85, legs: 1 }, bed: { w: [1.4, 1.6], d: [1.95, 2.05], z0: 0.18, z1: 0.6, legs: 1 },
    shelf: { w: [0.8, 1.2], d: [0.28, 0.35], z0: 0, z1: 1.9 }, desk: { w: [1.1, 1.5], d: [0.6, 0.75], z0: 0.7, z1: 0.75, legs: 1, deskLegs: 1 },
    armchair: { w: [0.8, 0.95], d: [0.8, 0.95], z0: 0.08, z1: 0.9, legs: 1 }, piano: { w: [1.45, 1.52], d: [0.55, 0.62], z0: 0.0, z1: 1.25 },
    rug: { w: [1.6, 2.4], d: [1.4, 2.0], z0: 0, z1: 0.012 }, pot: { w: [0.34, 0.5], d: [0, 0], z0: 0, z1: 0.42, round: 1 }, chest: { w: [0.8, 1.1], d: [0.45, 0.55], z0: 0, z1: 0.9 }
  };
  var pieces = [], mix = RF.weighted([['One Thing', 22], ['A Few Things', 48], ['A Room', 20], ['Rearranged', 10]]);
  var nP = { 'One Thing': 1, 'A Few Things': RF.int(2, 3), 'A Room': RF.int(4, 5), 'Rearranged': RF.int(2, 3) }[mix];
  var kinds = RF.shuffle(['sofa', 'rug', 'shelf', 'desk', 'armchair', 'piano', 'pot', 'bed', 'chest', 'sofa', 'desk', 'armchair']);
  function overlaps(b) { for (var k = 0; k < pieces.length; k++) { var p = pieces[k]; if (p.epoch !== b.epoch) continue; if (p.kind === 'rug' || b.kind === 'rug') continue; if (b.x0 < p.x1 + 0.05 && b.x1 > p.x0 - 0.05 && b.y0 < p.y1 + 0.05 && b.y1 > p.y0 - 0.05) return true; } return false; }
  function place(kind, epoch) {
    var c = CAT[kind];
    for (var tries = 0; tries < 40; tries++) {
      var w = RF.range(c.w[0], c.w[1]), d = c.round ? w : RF.range(c.d[0], c.d[1]), x, y, rot = false, wall = RF.int(0, 3);
      if (kind === 'rug') { x = RF.range(0.4, WM - w - 0.4); y = RF.range(0.4, 1.8); }
      else if (kind === 'desk' && RF.chance(0.6)) { x = RF.range(0.1, WM - w - 0.1); y = 0.02; wall = 0; }   // under the window, everyone does it
      else if (kind === 'pot') { x = RF.range(0.15, WM - w - 0.15); y = RF.range(0.05, 1.2); }
      else {
        if (wall === 0 && kind !== 'shelf') wall = 1;
        if (wall === 1 || wall === 3) { rot = true; var t = w; w = d; d = t; x = wall === 1 ? 0.02 : WM - w - 0.02; y = RF.range(0.15, Math.min(HM - d - 0.3, 2.6)); }
        else if (wall === 2) { x = RF.range(0.2, WM - w - 0.2); y = RF.chance(0.5) ? HM - d - 0.02 : RF.range(1.2, 2.4); }
        else { x = RF.range(0.2, WM - w - 0.2); y = 0.02; }
        if (kind === 'armchair' || (kind === 'sofa' && RF.chance(0.3))) { x = RF.range(0.3, WM - w - 0.3); y = RF.range(0.5, 2.0); }
      }
      var b = { kind: kind, x0: x, y0: y, x1: x + w, y1: y + d, z0: c.z0, z1: c.z1, legs: c.legs, round: c.round, deskLegs: c.deskLegs, epoch: epoch, rot: rot };
      if (!overlaps(b)) { pieces.push(b); return b; }
    }
    return null;
  }
  var nEp = mix === 'Rearranged' ? 2 : 1, epYears = nEp === 2 ? [nYears * RF.range(0.4, 0.7)] : [nYears]; if (nEp === 2) epYears.push(nYears - epYears[0]);
  for (var e = 0; e < nEp; e++) for (var k = 0; k < nP; k++) place(e === 1 ? pieces[k] ? pieces[k].kind : kinds[k] : kinds[k], e);
  var deskB = pieces.filter(function (p) { return p.kind === 'desk'; })[0];

  // ---------------- sun ----------------
  function sun(day, hour) {
    var dec = 23.44 * D2R * Math.sin(2 * PI * (284 + day) / 365), H = (hour - 12) * 15 * D2R;
    var sE = -Math.cos(dec) * Math.sin(H), sN = Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(H), sU = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
    return { sx: sE * rE + sN * rN, so: sE * nE + sN * nN, su: sU };
  }
  function proj(s, x, y, z) { return [(x - s.sx * z / s.su) / CL, (y + s.so * z / s.su) / CL]; }
  var N = GW * GH, dose = new Float32Array(N), mask = new Uint8Array(N), cover = new Float32Array(N);
  function litMask(s, bars) {
    mask.fill(0);
    wins.forEach(function (w) {
      var panes = [];
      if (bars) { for (var cI = 0; cI < w.cols; cI++) for (var rI = 0; rI < w.rows; rI++) { var px0 = lerp(w.x0, w.x1, cI / w.cols) + w.bar / 2, px1 = lerp(w.x0, w.x1, (cI + 1) / w.cols) - w.bar / 2, pz0 = lerp(w.z0, w.z1, rI / w.rows) + w.bar / 2, pz1 = lerp(w.z0, w.z1, (rI + 1) / w.rows) - w.bar / 2; panes.push([px0, px1, pz0, pz1]); } }
      else panes.push([w.x0, w.x1, w.z0, w.z1]);
      panes.forEach(function (p) {
        PX.fillPoly([proj(s, p[0], 0, p[2]), proj(s, p[1], 0, p[2]), proj(s, p[1], 0, p[3]), proj(s, p[0], 0, p[3])], GW, GH, function (i) { mask[i] |= 1; });
        // outer face of the reveal: same aperture, set back into the wall
        var o = [[p[0], p[2]], [p[1], p[2]], [p[1], p[3]], [p[0], p[3]]].map(function (q) { var a = proj(s, q[0], 0, q[1]); return [a[0], a[1] - reveal * s.so / Math.max(1e-3, s.so) * (1) / CL * 0 + (-reveal + reveal) ]; });
        var o2 = [[w.x0, w.z0], [w.x1, w.z0], [w.x1, w.z1], [w.x0, w.z1]].map(function (q) { var a = proj(s, q[0], -reveal, q[1]); return a; });
        PX.fillPoly(o2, GW, GH, function (i) { if (mask[i] & 1) mask[i] |= 2; });
      });
    });
  }
  function shade(s, ep) {
    pieces.forEach(function (b) {
      if (b.epoch !== ep) return;
      var pts = [], cs = b.round ? 10 : 4, k;
      for (k = 0; k < cs; k++) {
        var x, y; if (b.round) { var a = k / cs * 2 * PI, rr = (b.x1 - b.x0) / 2; x = (b.x0 + b.x1) / 2 + Math.cos(a) * rr; y = (b.y0 + b.y1) / 2 + Math.sin(a) * rr; } else { x = k === 0 || k === 3 ? b.x0 : b.x1; y = k < 2 ? b.y0 : b.y1; }
        pts.push(proj(s, x, y, b.z0)); pts.push(proj(s, x, y, b.z1));
      }
      PX.fillPoly(PX.convexHull(pts), GW, GH, function (i) { mask[i] = 0; });
    });
  }
  // footprints (what touched the floor) per epoch
  var foot = [new Uint8Array(N), new Uint8Array(N)];
  pieces.forEach(function (b) {
    var F = foot[b.epoch];
    function rect(x0, y0, x1, y1) { PX.fillPoly([[x0 / CL, y0 / CL], [x1 / CL, y0 / CL], [x1 / CL, y1 / CL], [x0 / CL, y1 / CL]], GW, GH, function (i) { F[i] = 1; }); }
    if (b.round) PX.forDisc((b.x0 + b.x1) / 2 / CL, (b.y0 + b.y1) / 2 / CL, (b.x1 - b.x0) / 2 / CL, GW, GH, function (i) { F[i] = 1; });
    else if (b.z0 > 0.05) { var lw = b.deskLegs ? 0.05 : 0.06; rect(b.x0 + 0.03, b.y0 + 0.03, b.x0 + 0.03 + lw, b.y0 + 0.03 + lw); rect(b.x1 - 0.03 - lw, b.y0 + 0.03, b.x1 - 0.03, b.y0 + 0.03 + lw); rect(b.x0 + 0.03, b.y1 - 0.03 - lw, b.x0 + 0.03 + lw, b.y1 - 0.03); rect(b.x1 - 0.03 - lw, b.y1 - 0.03 - lw, b.x1 - 0.03, b.y1 - 0.03); }
    else rect(b.x0, b.y0, b.x1, b.y1);
  });
  // integrate: 12 days, half-hour steps, clear-sky weight from elevation (air mass)
  for (var ep = 0; ep < nEp; ep++) {
    var acc = new Float32Array(N);
    for (var m = 0; m < 24; m++) for (var hh = 5; hh <= 19.01; hh += 1 / 3) {
      var s = sun(7 + m * 15.2, hh + (m % 3) / 9); if (s.su < 0.03 || s.so <= 0.02) continue;
      litMask(s, false); shade(s, ep);
      var am = 0.25 * Math.exp(-0.12 / s.su) * s.su * (0.55 + 0.25 * Math.cos((m - 12) / 12 * PI));   // irradiance on a horizontal floor, cloudier winters
      for (var i = 0; i < N; i++) if (mask[i] === 3) acc[i] += am;
    }
    var F = foot[ep]; for (var i2 = 0; i2 < N; i2++) { if (F[i2]) acc[i2] = 0; dose[i2] += acc[i2] * epYears[ep]; if (F[i2]) cover[i2] += epYears[ep]; }
  }
  // diffuse skylight through the window(s), by view factor; furniture footprints stop it too
  var dif = new Float32Array(N);
  for (var yy = 0; yy < GH; yy += 2) for (var xx = 0; xx < GW; xx += 2) {
    var X = (xx + 0.5) * CL, Y = (yy + 0.5) * CL, f = 0;
    wins.forEach(function (w) { for (var a = 0; a < 6; a++) for (var c = 0; c < 4; c++) { var wx = lerp(w.x0, w.x1, (a + 0.5) / 6), wz = lerp(w.z0, w.z1, (c + 0.5) / 4), r2 = (wx - X) * (wx - X) + Y * Y + wz * wz; f += (w.x1 - w.x0) * (w.z1 - w.z0) / 24 * wz * Y / (PI * r2 * r2); } });
    for (var u = 0; u < 2; u++) for (var v = 0; v < 2; v++) if (yy + v < GH && xx + u < GW) dif[(yy + v) * GW + xx + u] = f;
  }
  var tot = new Float32Array(N); for (var i3 = 0; i3 < N; i3++) { var unc = 1 - cover[i3] / nYears; tot[i3] = dose[i3] + 30 * dif[i3] * nYears * unc; }
  PX.blur(tot, GW, GH, 1.6);   // sun's half-degree disc and the fibre/finish scatter

  // ---------------- today's light ----------------
  var tdays = { 'Winter Morning': [20, 9.5], 'Winter Noon': [10, 12.2], 'Spring Afternoon': [100, 15], 'Late Afternoon': [80, 16.8], 'Overcast': [60, 12] }[today];
  var sNow = sun(tdays[0], tdays[1] + (facing === 'East' ? -2.5 : facing === 'West' ? 2 : facing === 'Southeast' ? -1.2 : facing === 'Southwest' ? 1.2 : 0));
  var patch = new Float32Array(N), sunOK = today !== 'Overcast' && sNow.su > 0.05 && sNow.so > 0.02;
  if (!sunOK && today !== 'Overcast') {
    for (var tryH = 8; tryH <= 17.01 && !sunOK; tryH += 0.4) {
      var sTry = sun(tdays[0], tryH + (facing === 'East' ? -2.5 : facing === 'West' ? 2 : facing === 'Southeast' ? -1.2 : facing === 'Southwest' ? 1.2 : 0));
      if (sTry.su > 0.08 && sTry.so > 0.04) { sNow = sTry; sunOK = true; }
    }
  }
  if (sunOK) { litMask(sNow, true); for (var i4 = 0; i4 < N; i4++) patch[i4] = mask[i4] === 3 ? 1 : 0; var plen = 2.0 / Math.max(0.2, sNow.su); PX.blur(patch, GW, GH, Math.max(0.6, 0.0046 * plen / CL)); }

  // ---------------- materials ----------------
  var SP = {
    'Oak Boards': { f: '#c6a77f', a: '#b27634', bw: [0.12, 0.15], k: 1.0 }, 'Oak Parquet': { f: '#c8aa80', a: '#b0742f', bw: [0.07, 0.07], k: 1.0, parquet: 1 },
    'Pine Boards': { f: '#e3c9a0', a: '#c27a2e', bw: [0.16, 0.2], k: 1.3 }, 'Cherry Boards': { f: '#bf8566', a: '#7b3d22', bw: [0.1, 0.13], k: 1.5 },
    'Walnut Boards': { f: '#4c3122', a: '#98785a', bw: [0.11, 0.14], k: 1.0 }, 'Carpet': { f: '#3e5164', a: '#b4b0aa', k: 1.35, carpet: 1 }
  }[floor];
  var fresh = PX.col(SP.f), aged = PX.col(SP.a);
  // how deep the change goes: the most-lit tenth of the floor reaches a depth set by the years lived there
  var srt = Array.prototype.slice.call(tot.filter(function (v, i) { return (i % 7) === 0; })).sort(function (a, b) { return a - b; }), p90 = srt[Math.floor(srt.length * 0.9)] || 1;
  var fT = { 'Two Years': 0.55, 'Seven Years': 0.75, 'Fifteen Years': 0.88, 'Thirty Years': 0.95 }[years], D0 = -p90 / Math.log(1 - fT) / SP.k;
  var doorWall = RR.pick([1, 2, 3]), doorAt = RR.range(0.4, (doorWall === 2 ? WM : HM) - 1.3), doorW = 0.82;
  var seed = (RT.rand() * 1e6) | 0, along = RT.chance(0.65), bw = SP.bw ? RT.range(SP.bw[0], SP.bw[1]) : 0;
  var o = PX.canvas(C, VW, VH, '#15130f'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var mpp = WM / PW, sunCol = [1.0, 0.86, 0.68], skyCol = [0.78, 0.84, 0.95];
  if (today === 'Late Afternoon') sunCol = [1.0, 0.72, 0.45]; if (/Winter/.test(today)) sunCol = [1.0, 0.82, 0.62];
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X2 = (px + 0.5) * mpp, Y2 = (py + 0.5) * mpp, gx = X2 / CL - 0.5, gy = Y2 / CL - 0.5;
    var dd = PX.bil(tot, GW, GH, gx, gy), base, val = 1, gap = 0, idx = 0, sens = 1;
    if (SP.carpet) {
      var loop = PX.vnoise(X2 * 220, Y2 * 220, seed) * 0.5 + 0.5, tuft = PX.fbm(X2 * 28, Y2 * 28, seed + 3, 4), wear = PX.fbm(X2 * 1.6, Y2 * 1.6, seed + 6, 3);
      val = 0.8 + 0.14 * loop + 0.1 * tuft + 0.08 * wear; sens = 1 + 0.12 * tuft;
    } else {
      var a1 = along ? Y2 : X2, c1 = along ? X2 : Y2, lb;
      if (SP.parquet) {   // herringbone-free basket parquet: 4 slats per 28 cm square, alternating direction
        var sq = 0.28, qi = Math.floor(X2 / sq), qj = Math.floor(Y2 / sq), lx = X2 - qi * sq, ly = Y2 - qj * sq, flip = (qi + qj) & 1;
        a1 = flip ? lx : ly; c1 = flip ? ly : lx; idx = (qi * 31 + qj * 17) * 4 + Math.floor(c1 / 0.07); var cl = c1 % 0.07;
        var wobP = 0.0012 * PX.vnoise(a1 * 8, qi * 3 + qj, seed + 19);
        gap = Math.max(sstep(0.0035, 0.0005, cl + wobP), sstep(0.0665, 0.0695, cl + wobP), sstep(0.0035, 0.0005, a1), sstep(sq - 0.0035, sq - 0.0005, a1)); lb = a1;
      } else {
        idx = Math.floor(c1 / bw); var cl2 = c1 - idx * bw, Lb = 0.7 + PX.ihash(idx * 7 + seed) * 1.8, ph = PX.ihash(idx * 13 + seed) * Lb, sg = Math.floor((a1 + ph) / Lb);
        lb = (a1 + ph) - sg * Lb; idx = idx * 97 + sg;
        var wobB = 0.0018 * PX.vnoise(a1 * 5, idx, seed + 19);
        gap = Math.max(sstep(0.0028, 0.0005, cl2 + wobB), sstep(bw - 0.0028, bw - 0.0005, cl2 + wobB), sstep(0.0022, 0.0004, lb), sstep(Lb - 0.0022, Lb - 0.0004, lb));
      }
      var bt = PX.ihash(idx * 5 + seed + 1), gr = PX.fbm(lb * 3.2 + bt * 40, c1 * 55 + PX.fbm(lb * 1.5, c1 * 6, seed + 8, 2) * 1.2, seed + 5, 4), pore = PX.vnoise(lb * 900, c1 * 140, seed + 9);
      var lines = PX.vnoise(lb * 2.0 + bt * 9, c1 * 260 + 9 * PX.fbm(lb * 0.9, c1 * 4 + bt * 20, seed + 12, 3), seed + 14);
      val = 0.88 + 0.28 * (bt - 0.5) + 0.14 * gr + 0.08 * lines + 0.035 * pore; sens = 0.82 + 0.36 * PX.ihash(idx * 3 + seed + 2);
    }
    var fd = 1 - Math.exp(-dd * sens / D0);
    var r = lerp(fresh[0], aged[0], fd) * val, g = lerp(fresh[1], aged[1], fd) * val, b = lerp(fresh[2], aged[2], fd) * val;
    if (!SP.carpet) { var gp = gap * (0.45 + 0.45 * PX.ihash(idx * 11 + seed + 4)); r *= 1 - gp; g *= 1 - gp; b *= 1 - gp * 0.9; }
    // light now: sky through the window + bounce + sun patch
    var df = PX.bil(dif, GW, GH, gx, gy), amb = 0.34 + 3.2 * df, sp = sunOK ? PX.bil(patch, GW, GH, gx, gy) : 0, sunI = sunOK ? 2.4 * sNow.su + 0.6 : 0;
    var Lr = amb * skyCol[0] + sp * sunI * sunCol[0], Lg = amb * skyCol[1] + sp * sunI * sunCol[1], Lb2 = amb * skyCol[2] + sp * sunI * sunCol[2];
    // skirting boards at the walls (painted, 2 cm deep) with their contact shadow
    var dw = Math.min(X2, WM - X2, HM - Y2, Y2);
    var inDoor = (doorWall === 1 && X2 < 0.12 && Y2 > doorAt && Y2 < doorAt + doorW) || (doorWall === 3 && X2 > WM - 0.12 && Y2 > doorAt && Y2 < doorAt + doorW) || (doorWall === 2 && Y2 > HM - 0.12 && X2 > doorAt && X2 < doorAt + doorW);
    if (inDoor) { var thr = PX.col('#9a7a58'), tv = 0.9 + 0.1 * PX.vnoise(X2 * 200, Y2 * 30, seed + 50); r = thr[0] * tv; g = thr[1] * tv; b = thr[2] * tv; if (Math.min(X2, WM - X2, HM - Y2) < 0.015) { r *= 0.4; g *= 0.4; b *= 0.4; } }
    else if (dw < 0.02) { r = g = b = 0.78; } else { var cs = 1 - 0.35 * Math.exp(-(dw - 0.02) / 0.03); Lr *= cs; Lg *= cs; Lb2 *= cs; }
    Rr[I] = r * Lr; Gg[I] = g * Lg; Bb[I] = b * Lb2;
  }
  // chair-caster wear in front of the desk: matte arcs where the finish was scratched
  if (deskB && !SP.carpet) {
    var ccx = (deskB.x0 + deskB.x1) / 2, ccy = deskB.y1 + 0.35;
    for (var py3 = 0; py3 < PH; py3++) for (var px3 = 0; px3 < PW; px3++) { var X3 = px3 * mpp, Y3 = py3 * mpp, dx = X3 - ccx, dy = Y3 - ccy, rr2 = Math.hypot(dx, dy); if (rr2 > 0.75) continue;
      var th = Math.atan2(dy, dx), scr = PX.vnoise(rr2 * 160, th * 3, seed + 31), wv = sstep(0.75, 0.35, rr2) * (0.04 + 0.05 * Math.max(0, scr)); var I3 = py3 * PW + px3; Rr[I3] *= 1 + wv; Gg[I3] *= 1 + wv; Bb[I3] *= 1 + wv * 1.1; }
  }
  if (!sunOK && today !== 'Overcast') today = today + ', Sun Gone';
  C.features({ Floor: floor, Facing: facing, 'Lived In': years, Window: windowT, Today: today, Furniture: mix, Pieces: pieces.filter(function (p) { return p.epoch === 0; }).map(function (p) { return p.kind; }).join(', ') });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.9, filmic: true, grain: 0.012, vig: 0.25, seed: 3 });
  C.done(o.cv.canvas, 'unfaded');
})();

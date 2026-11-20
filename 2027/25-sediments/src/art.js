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
/* world.js: Sediments world timelines (data only). Pick with SED_WORLD (default 'A', pending Joshua's choice).
 * An era maps a span of progress units P to a span of world years (CE; negative = BCE), piecewise-linear.
 * events: [key, weight] chosen by each mint's hash. fauna: species for grazing/death. bg: background sediment.
 * Event keys understood by the engine: quiet graze death flood drought fire loess frost outwash blackmat camp
 * midden burial dogburial pit house plough fence litter tyre car beaver sandblow lost cinders. */
var WORLDS = {
  A: { name: 'The Lick', place: 'a floodplain beside a salt spring, mid-continent North America (modelled on Ohio Valley licks)',
    base: [['gravel', 1.4], ['sand', 1.1], ['pond', 2.2], ['sand', 0.9], ['gravel', 1.6], ['sand', 0.8], ['silt', 0.7], ['mud', 0.25], ['sand', 0.4], ['silt', 0.9], ['mud', 0.3], ['silt', 1.0]],             // pre-existing ground, bottom -> top (m)
    waterTable: 1.1,                                                      // m below the surface (waterlogged + anoxic below)
    eras: [
      { key: 'prologue', name: 'Prologue: the mammoth summer', P: [0, 25], Y: [-28000, -27988], veg: 'steppe', climate: 'cold', bg: 'silt', rate: 1.1, accr: 0.3,   // accr: spring-mire mud accretion at the lick, m/yr (chosen, see README)
        events: [['quiet', 22], ['graze', 30], ['death', 12], ['flood', 18], ['drought', 10], ['loess', 8]],
        fauna: [['mammoth', 40], ['bison', 30], ['horse', 20], ['wolf', 10]] },
      { key: 'steppe', name: 'Late Pleistocene steppe', P: [25, 170], Y: [-27988, -12700], veg: 'steppe', climate: 'cold', bg: 'loess', rate: 0.9, soils: [[-26400, 0.55], [-24900, 0.45], [-23300, 0.6], [-20600, 0.35], [-17200, 0.5], [-14700, 0.8]],   // schematic interstadial soils (D-O-like, not dated)
        events: [['quiet', 30], ['loess', 20], ['graze', 14], ['flood', 12], ['outwash', 6], ['frost', 4], ['death', 5], ['drought', 6], ['fire', 2], ['lost', 0.3]],
        fauna: [['mammoth', 35], ['mastodon', 15], ['bison', 25], ['horse', 20], ['wolf', 5]] },
      { key: 'lateglacial', name: 'Late Glacial: the end of the megafauna', P: [170, 250], Y: [-12700, -9700], veg: 'parkland', climate: 'cool', bg: 'silt', rate: 1.0, soils: [[-12000, 0.7]],
        events: [['quiet', 28], ['flood', 16], ['camp', 14], ['death', 6], ['graze', 10], ['blackmat', 8], ['fire', 6], ['drought', 4], ['lost', 0.3]],
        fauna: [['mammoth', 20], ['mastodon', 20], ['bison', 35], ['horse', 10], ['deer', 15]], lastMegafauna: -11000 },
      { key: 'archaic', name: 'Archaic forest', P: [250, 410], Y: [-9700, -1000], veg: 'forest', climate: 'mild', bg: 'silt', rate: 1.2, soils: [[-8200, 0.6], [-6000, 0.75], [-3800, 0.6], [-2200, 0.8]],
        events: [['quiet', 30], ['flood', 18], ['camp', 14], ['midden', 6], ['fire', 6], ['death', 4], ['graze', 6], ['drought', 3], ['dogburial', 1], ['burial', 0.7], ['sandblow', 0.3], ['lost', 0.3]],
        fauna: [['deer', 60], ['bison', 15], ['wolf', 10], ['bear', 15]] },
      { key: 'woodland', name: 'Woodland and Mississippian', P: [410, 520], Y: [-1000, 1500], veg: 'forest', climate: 'mild', bg: 'silt', rate: 1.3,
        events: [['quiet', 26], ['flood', 18], ['camp', 10], ['pit', 10], ['house', 7], ['fire', 6], ['death', 3], ['midden', 3], ['burial', 0.7], ['sandblow', 0.3], ['lost', 0.3]],
        fauna: [['deer', 70], ['dog', 15], ['bear', 15]] },
      { key: 'farm', name: 'Farm', P: [520, 640], Y: [1500, 1900], veg: 'pasture', climate: 'mild', bg: 'silt', rate: 1.6,
        events: [['quiet', 20], ['plough', 18], ['fence', 12], ['flood', 14], ['graze', 10], ['death', 5], ['litter', 8], ['fire', 3], ['sandblow', 0.3], ['lost', 0.3]],
        fauna: [['cow', 45], ['horse', 25], ['pig', 20], ['dog', 10]], fenceKinds: ['split rail', 'post and wire'] },
      { key: 'modern', name: 'Modern', P: [640, 800], Y: [1900, 2027], veg: 'pasture', climate: 'mild', bg: 'silt', rate: 2.0,
        events: [['quiet', 22], ['flood', 12], ['plough', 10], ['fence', 10], ['litter', 14], ['graze', 8], ['death', 4], ['cinders', 5], ['tyre', 1.5], ['car', 0.4], ['lost', 0.3]],
        fauna: [['cow', 45], ['deer', 25], ['dog', 15], ['horse', 15]], fenceKinds: ['barbed wire', 'chain-link'], bigFlood: 1937 },
      { key: 'future', name: 'Near future (speculative)', P: [800, 1e9], Y: [2027, 2027 + (1e9 - 800)], veg: 'scrub', climate: 'warm', bg: 'silt', rate: 2.2,
        events: [['quiet', 24], ['flood', 22], ['beaver', 8], ['litter', 6], ['death', 4], ['fire', 6], ['graze', 6], ['tyre', 1], ['car', 0.5], ['lost', 0.3]],
        fauna: [['deer', 60], ['dog', 10], ['beaver', 10], ['cow', 20]] }
    ] },
  // B and C are drop-in tables (see WORLD.md). Their species/objects reuse the engine's vocabulary where it exists;
  // dinosaurs etc. would need their own rigs before B is renderable at quality.
  B: { name: 'Badlands', place: 'eastern Montana river floodplain (Hell Creek -> Fort Union)', base: [['sand', 1.0], ['mud', 0.8]], waterTable: 1.4,
    eras: [
      { key: 'prologue', name: 'A river in the Maastrichtian', P: [0, 25], Y: [-66050000, -66049990], veg: 'fern', climate: 'warm', bg: 'mud', rate: 1.4, events: [['quiet', 30], ['flood', 25], ['death', 15], ['graze', 20]], fauna: [['bison', 100]] },
      { key: 'cretaceous', name: 'Late Cretaceous', P: [25, 300], Y: [-66049990, -66000000], veg: 'fern', climate: 'warm', bg: 'mud', rate: 1.4, events: [['quiet', 30], ['flood', 25], ['death', 8], ['fire', 4]], fauna: [['bison', 100]] },
      { key: 'paleocene', name: 'Paleocene coal swamps', P: [300, 460], Y: [-66000000, -61000000], veg: 'swamp', climate: 'warm', bg: 'peat', rate: 1.0, events: [['quiet', 40], ['flood', 20], ['blackmat', 20]], fauna: [['deer', 100]] },
      { key: 'gap', name: 'The long gap', P: [460, 500], Y: [-61000000, -2600000], veg: 'steppe', climate: 'mild', bg: 'silt', rate: 0.05, events: [['quiet', 100]], fauna: [['deer', 100]] },
      { key: 'ice', name: 'Ice', P: [500, 640], Y: [-2600000, -12000], veg: 'steppe', climate: 'cold', bg: 'loess', rate: 0.9, events: [['quiet', 30], ['outwash', 20], ['frost', 10], ['graze', 15], ['death', 5]], fauna: [['mammoth', 50], ['bison', 50]] },
      { key: 'plains', name: 'Plains', P: [640, 720], Y: [-12000, 1880], veg: 'steppe', climate: 'mild', bg: 'loess', rate: 1.0, events: [['quiet', 30], ['graze', 25], ['fire', 15], ['camp', 15], ['death', 6]], fauna: [['bison', 100]] },
      { key: 'ranch', name: 'Ranch', P: [720, 1e9], Y: [1880, 1880 + (1e9 - 720)], veg: 'pasture', climate: 'mild', bg: 'silt', rate: 1.5, events: [['quiet', 30], ['fence', 20], ['graze', 20], ['litter', 10], ['death', 5]], fauna: [['cow', 70], ['horse', 30]], fenceKinds: ['barbed wire'] }
    ] },
  C: { name: 'After Us', place: 'a suburban cul-de-sac (the Before the Shovels street)', base: [['made', 0.5], ['silt', 1.0]], waterTable: 1.6,
    eras: [
      { key: 'prologue', name: 'One winter', P: [0, 25], Y: [2027, 2032], veg: 'lawn', climate: 'cold', bg: 'silt', rate: 0.8, events: [['quiet', 40], ['litter', 30], ['death', 5], ['flood', 10]], fauna: [['dog', 50], ['deer', 50]] },
      { key: 'abandon', name: 'Abandonment', P: [25, 200], Y: [2032, 2200], veg: 'scrub', climate: 'warm', bg: 'silt', rate: 1.5, events: [['quiet', 30], ['flood', 25], ['litter', 15], ['car', 2], ['tyre', 3], ['fire', 6]], fauna: [['deer', 70], ['dog', 30]] },
      { key: 'forest', name: 'Forest over ruins', P: [200, 400], Y: [2200, 3000], veg: 'forest', climate: 'warm', bg: 'silt', rate: 1.2, events: [['quiet', 50], ['flood', 25], ['beaver', 10], ['fire', 6], ['death', 4]], fauna: [['deer', 80], ['beaver', 20]] },
      { key: 'quiet', name: 'Long quiet', P: [400, 700], Y: [3000, 50000], veg: 'forest', climate: 'mild', bg: 'silt', rate: 1.0, events: [['quiet', 60], ['flood', 25], ['fire', 8], ['death', 4]], fauna: [['deer', 100]] },
      { key: 'ice', name: 'Next ice', P: [700, 1e9], Y: [50000, 50000 + (1e9 - 700) * 70], veg: 'steppe', climate: 'cold', bg: 'loess', rate: 0.9, events: [['quiet', 40], ['loess', 25], ['frost', 10], ['outwash', 10], ['graze', 10]], fauna: [['bison', 60], ['horse', 40]] }
    ] }
};
/* Sediments - fauna: side-view anatomy shared by flesh and skeleton.
 * One rig per animal (spine, neck, head axis, four legs of joints, tail) in body-length units. Flesh outlines and the
 * skeleton are both built from it, so a carcass decays from one into the other without jumping.
 * Proportions are schematic, taken from standard lateral skeletal mounts and life reconstructions (woolly mammoth:
 * high domed skull, short neck, shoulder hump, back sloping to low hips, columnar legs, spiral tusks; bison: tall
 * thoracic spines under the hump). Disarticulation order follows the general sequence reported for large mammals
 * in the open (Hill 1979; Hill & Behrensmeyer 1984): forelimb + scapula first (no bony joint to the trunk), then tail,
 * skull and mandible, hind limbs, ribs, vertebral column last. Order and timings are approximate (from knowledge).
 */
var FAUNA = (function () {
  'use strict';
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sst(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function rot(p, c, a) { var s = Math.sin(a), k = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * k - y * s, c[1] + x * s + y * k]; }
  function spline(P, n, closed) {
    var out = [], m = P.length, segs = closed ? m : m - 1, i, k;
    for (i = 0; i < segs; i++) {
      var p0 = closed ? P[(i - 1 + m) % m] : P[Math.max(0, i - 1)], p1 = P[i], p2 = P[(i + 1) % m], p3 = closed ? P[(i + 2) % m] : P[Math.min(m - 1, i + 2)];
      for (k = 0; k < n; k++) { var t = k / n, t2 = t * t, t3 = t2 * t, q = [0, 0];
        for (var d = 0; d < 2; d++) q[d] = 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3);
        out.push(q); } }
    if (!closed) out.push(P[m - 1].slice());
    return out; }
  // polyline + half-widths -> closed outline (rounded-ish caps)
  function stroke(pts, ws, n) {
    var P = n ? spline(pts, n, false) : pts.map(function (p) { return p.slice(); }), W = [], i, Lf = [], Rt = [];
    for (i = 0; i < P.length; i++) { var f = i / (P.length - 1) * (ws.length - 1), k = Math.min(ws.length - 2, Math.floor(f)); W.push(ws.length === 1 ? ws[0] : lerp(ws[k], ws[k + 1], f - k)); }
    for (i = 0; i < P.length; i++) { var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      Lf.push([P[i][0] + nx * W[i], P[i][1] + ny * W[i]]); Rt.push([P[i][0] - nx * W[i], P[i][1] - ny * W[i]]); }
    var e = P.length - 1, te = [P[e][0] - P[e - 1][0], P[e][1] - P[e - 1][1]], tl = Math.hypot(te[0], te[1]) || 1, ts = [P[1][0] - P[0][0], P[1][1] - P[0][1]], sl = Math.hypot(ts[0], ts[1]) || 1;
    var capE = [P[e][0] + te[0] / tl * W[e] * 0.7, P[e][1] + te[1] / tl * W[e] * 0.7], capS = [P[0][0] - ts[0] / sl * W[0] * 0.7, P[0][1] - ts[1] / sl * W[0] * 0.7];
    return Lf.concat([capE], Rt.reverse(), [capS]); }
  // ---- species (units of body length L, rump to chest front; ground y = 0, facing +x) ----
  var SP = {
    mammoth: { type: 'proboscid', hip: 0.60, wit: 0.80, hump: 0.07, chest: 0.34, belly: 0.30, neck: 0.05, neckA: 0.3, headA: -0.42, hl: 0.21, hh: 0.27, legW: 0.062, tail: 0.13, hair: 0.075, hide: '#4a3424', hideHi: '#8a6a48', vert: [7, 19, 4, 4, 16], spine: [0.15, 0.035], ribD: 0.4 },
    mastodon: { type: 'proboscid', hip: 0.62, wit: 0.72, hump: 0.02, chest: 0.32, belly: 0.30, neck: 0.06, neckA: 0.2, headA: -0.35, hl: 0.2, hh: 0.22, legW: 0.06, tail: 0.15, hair: 0.03, hide: '#4b3a2c', hideHi: '#7a6450', vert: [7, 19, 4, 4, 18], spine: [0.12, 0.035], ribD: 0.38, low: 1 },
    bison: { type: 'bovid', hip: 0.53, wit: 0.62, hump: 0.12, chest: 0.27, belly: 0.25, neck: 0.12, neckA: -0.05, headA: -1.15, hl: 0.24, hh: 0.15, legW: 0.032, tail: 0.2, hair: 0.05, horn: 0.1, hide: '#3d2b1f', hideHi: '#6e5038', vert: [7, 14, 5, 5, 14], spine: [0.2, 0.035], ribD: 0.34 },
    cow: { type: 'bovid', hip: 0.6, wit: 0.6, hump: 0.0, chest: 0.3, belly: 0.27, neck: 0.16, neckA: 0.25, headA: -1.0, hl: 0.24, hh: 0.13, legW: 0.03, tail: 0.35, hair: 0.0, horn: 0.05, hide: '#6b4a34', hideHi: '#9b7a5c', vert: [7, 13, 6, 5, 18], spine: [0.08, 0.03], ribD: 0.3 },
    horse: { type: 'equid', hip: 0.64, wit: 0.66, hump: 0.0, chest: 0.36, belly: 0.36, neck: 0.32, neckA: 0.85, headA: -1.05, hl: 0.3, hh: 0.12, legW: 0.024, tail: 0.38, hair: 0.0, mane: 1, hide: '#6a4c32', hideHi: '#9c7a56', vert: [7, 18, 6, 5, 16], spine: [0.1, 0.025], ribD: 0.28 },
    deer: { type: 'cervid', hip: 0.66, wit: 0.64, hump: 0.0, chest: 0.4, belly: 0.4, neck: 0.3, neckA: 0.95, headA: -0.8, hl: 0.24, hh: 0.1, legW: 0.017, tail: 0.1, hair: 0.0, antler: 1, hide: '#7a5a3e', hideHi: '#a8865f', vert: [7, 13, 6, 4, 10], spine: [0.07, 0.025], ribD: 0.24 },
    wolf: { type: 'canid', hip: 0.56, wit: 0.58, hump: 0.0, chest: 0.3, belly: 0.33, neck: 0.2, neckA: 0.6, headA: -0.25, hl: 0.24, hh: 0.11, legW: 0.022, tail: 0.38, hair: 0.03, hide: '#6e675e', hideHi: '#a49c90', vert: [7, 13, 7, 3, 20], spine: [0.06, 0.03], ribD: 0.24 },
    dog: { type: 'canid', hip: 0.55, wit: 0.56, hump: 0.0, chest: 0.3, belly: 0.33, neck: 0.2, neckA: 0.6, headA: -0.2, hl: 0.22, hh: 0.11, legW: 0.022, tail: 0.32, hair: 0.02, hide: '#6b5440', hideHi: '#9e8466', vert: [7, 13, 7, 3, 20], spine: [0.06, 0.03], ribD: 0.24 },
    bear: { type: 'ursid', hip: 0.5, wit: 0.56, hump: 0.06, chest: 0.24, belly: 0.22, neck: 0.18, neckA: 0.2, headA: -0.4, hl: 0.22, hh: 0.14, legW: 0.045, tail: 0.04, hair: 0.05, hide: '#3a2c22', hideHi: '#6a5442', vert: [7, 14, 6, 5, 8], spine: [0.08, 0.03], ribD: 0.3 },
    pig: { type: 'suid', hip: 0.45, wit: 0.46, hump: 0.0, chest: 0.16, belly: 0.14, neck: 0.1, neckA: 0.1, headA: -0.55, hl: 0.26, hh: 0.14, legW: 0.028, tail: 0.1, hair: 0.0, hide: '#8a6e62', hideHi: '#b49688', vert: [7, 14, 6, 4, 20], spine: [0.06, 0.025], ribD: 0.3 }
  };
  SP.beaver = SP.dog;
  function spec(sp) { return SP[sp] || SP.deer; }
  // ---- rig ----
  function rig(sp, L, pose, st) {
    var s = spec(sp), R = { s: s, L: L };
    function P(x, y) { return [x * L, y * L]; }
    var hip = s.hip, wit = s.wit, top = function (u) {   // dorsal line height (hair excluded)
      var r = u < 0.12 ? lerp(hip * 0.93, hip, u / 0.12) : u < 0.7 ? lerp(hip, wit, sst(0.12, 0.7, u)) : wit;
      return r + s.hump * Math.exp(-Math.pow((u - 0.66) / 0.14, 2)); };
    R.top = top;
    var spLen = function (u) { return u < 0.36 ? s.spine[1] * 0.8 : lerp(s.spine[1], s.spine[0], sst(0.36, 0.68, u)) * (u > 0.8 ? lerp(1, 0.6, (u - 0.8) / 0.1) : 1); };
    // vertebral column (centra) from sacrum to first thoracic
    R.col = function (u) { return top(u) - spLen(u) - 0.035; };
    var T0 = P(0.84, R.col(0.84));
    var na = s.neckA, ha = s.headA, sink = 0, low = 0;
    if (pose === 'graze') { na = -0.95; ha = -1.6; }
    if (pose === 'mired') { na -= 0.4; ha -= 0.7; sink = st.sink || 0; }
    if (pose === 'sternal') { na = Math.min(na, 0.05) - 0.25; ha = s.type === 'proboscid' ? -0.6 : -0.15; low = 1; }
    var Hb = [T0[0] + Math.cos(na) * s.neck * L, T0[1] + Math.sin(na) * s.neck * L];
    R.neck = [T0, Hb]; R.headA = ha; R.Hb = Hb;
    // legs: [top joint, mid, low, foot] (front near/far, hind near/far)
    var colm = s.type === 'proboscid' || s.type === 'ursid';
    function front(dx) { return colm ? [P(0.79 + dx, s.chest + 0.2), P(0.765 + dx, s.chest - 0.02), P(0.775 + dx, 0.09), P(0.79 + dx, 0.012)]
                                      : [P(0.83 + dx, s.chest + 0.14), P(0.78 + dx, s.chest - 0.01), P(0.8 + dx, 0.13), P(0.81 + dx, 0.035), P(0.83 + dx, 0.0)]; }
    function hind(dx) { return colm ? [P(0.17 + dx, hip * 0.8), P(0.2 + dx, hip * 0.46), P(0.18 + dx, 0.09), P(0.17 + dx, 0.012)]
                                     : [P(0.17 + dx, hip * 0.78), P(0.24 + dx, hip * 0.47), P(0.11 + dx, hip * 0.3), P(0.13 + dx, 0.04), P(0.15 + dx, 0.0)]; }
    R.legs = [front(0), front(0.035), hind(0), hind(-0.03)];
    R.legs[1].far = R.legs[3].far = 1;
    if (low) {   // sternal: fold legs, lower the body onto the ground
      var dz = (s.belly - 0.035) * L;
      R.legs = R.legs.map(function (lg, i) { var f = i < 2, x0 = lg[0][0], y0 = lg[0][1], fl;
        fl = f ? [[x0, y0], [x0 - 0.03 * L, 0.06 * L + dz], [x0 - 0.16 * L, 0.035 * L + dz], [x0 - 0.1 * L, 0.02 * L + dz]] : [[x0, y0], [x0 + 0.1 * L, 0.07 * L + dz], [x0 - 0.06 * L, 0.04 * L + dz], [x0 + 0.06 * L, 0.02 * L + dz]];
        fl.far = lg.far; return fl; });
      R.drop = dz; } else R.drop = 0;
    R.sink = sink;
    R.tail = [P(0.03, hip * 0.97), P(-0.01, hip * 0.97 - s.tail * 0.5), P(-0.02, hip * 0.97 - s.tail)];
    // whole-body offsets
    R.dy = -sink - R.drop;
    return R; }
  // ---- head shapes (head frame: origin at occiput, u forward along axis, v up; units L) ----
  function headPts(s) {
    switch (s.type) {
      case 'proboscid': return [[0, 0], [-0.025, 0.08], [0.015, 0.17], [0.07, 0.2], [0.13, 0.16], [0.18, 0.06], [0.205, -0.04], [0.2, -0.11], [0.16, -0.16], [0.09, -0.175], [0.03, -0.14], [-0.015, -0.07]];
      case 'bovid': return [[0, 0.03], [0.05, 0.075], [0.14, 0.07], [0.24, 0.035], [0.27, -0.01], [0.26, -0.05], [0.2, -0.06], [0.1, -0.085], [0.03, -0.07], [-0.01, -0.03]];
      case 'equid': return [[0, 0.03], [0.06, 0.06], [0.2, 0.045], [0.3, 0.02], [0.32, -0.02], [0.29, -0.045], [0.2, -0.045], [0.08, -0.075], [0.01, -0.05]];
      case 'cervid': return [[0, 0.03], [0.06, 0.055], [0.16, 0.035], [0.25, 0.005], [0.255, -0.025], [0.2, -0.035], [0.08, -0.055], [0.01, -0.04]];
      case 'canid': return [[0, 0.04], [0.07, 0.07], [0.15, 0.04], [0.25, 0.01], [0.26, -0.02], [0.19, -0.035], [0.08, -0.06], [0.0, -0.04]];
      case 'suid': return [[0, 0.05], [0.08, 0.08], [0.2, 0.035], [0.28, 0.0], [0.28, -0.035], [0.2, -0.045], [0.08, -0.08], [0.0, -0.05]];
      default: return [[0, 0.05], [0.09, 0.08], [0.18, 0.04], [0.23, 0.0], [0.22, -0.04], [0.1, -0.08], [0, -0.05]];
    } }
  function toWorld(R, pts, sc) { var a = R.headA, k = Math.cos(a), sn = Math.sin(a); sc = sc || R.L;
    return pts.map(function (q) { return [R.Hb[0] + (q[0] * k - q[1] * sn) * sc, R.Hb[1] + (q[0] * sn + q[1] * k) * sc]; }); }
  // ---- flesh ----
  function flesh(R, st) {
    var s = R.s, L = R.L, parts = [], u, i, top = R.top, bloat = st.bloat || 0, low = R.drop > 0;
    var bodyTop = [], bodyBot = [];
    for (i = 0; i <= 18; i++) { u = 0.02 + 0.84 * i / 18; bodyTop.push([u * L, (top(u) + 0.012 + 0.09 * bloat * Math.sin(Math.PI * clamp((u - 0.05) / 0.8, 0, 1))) * L]); }
    var chest = s.chest + (low ? 0 : -0.03 * bloat), belly = s.belly - (low ? 0.02 * bloat : 0.12 * bloat);
    bodyBot = [[0.92 * L, (chest + 0.17) * L], [0.9 * L, (chest + 0.05) * L], [0.82 * L, chest * L], [0.62 * L, (belly - 0.005) * L], [0.45 * L, (belly - 0.01) * L], [0.3 * L, (belly + 0.02) * L], [0.18 * L, (s.hip * 0.62) * L], [0.03 * L, s.hip * 0.66 * L], [-0.005 * L, s.hip * 0.82 * L]];
    var body = spline(bodyTop.concat([[0.9 * L, (top(0.86) + 0.0) * L - 0.02 * L]], bodyBot), 3, true);
    parts.push({ poly: body, tag: 'torso' });
    // neck (thick), head
    var hb = R.Hb, T0 = R.neck[0], nW = s.type === 'proboscid' ? 0.2 : s.type === 'bovid' ? 0.14 : 0.08;
    parts.push({ poly: stroke([[T0[0] - 0.04 * L, T0[1] - 0.02 * L], [(T0[0] + hb[0]) / 2, (T0[1] + hb[1]) / 2], hb], [nW * L, nW * 0.85 * L, s.hh * 0.45 * L], 3), tag: 'neck' });
    var hp = toWorld(R, headPts(s)); parts.push({ poly: spline(hp, 3, true), tag: 'head' });
    // legs
    R.legs.forEach(function (lg) { var w = s.legW * L, ws = lg.length === 4 ? [w * 1.6, w * 1.15, w, w * 1.05] : [w * 1.9, w * 1.25, w * 0.75, w * 0.62, w * 0.7];
      parts.push({ poly: stroke(lg, ws, 3), tag: 'leg', far: lg.far }); });
    // trunk (proboscideans): hangs from the face to the ground or the mud
    var ext = [];
    if (s.type === 'proboscid') { var tb = toWorld(R, [[0.18, -0.06]])[0], gy = R.dy + 0.03 * L, tw = 0.062 * L;
      var t1 = [tb[0] + 0.03 * L, Math.max(gy, tb[1] - 0.16 * L)], t2 = [tb[0] + 0.02 * L, Math.max(gy, tb[1] - 0.34 * L)], t3 = [tb[0] + (t2[1] <= gy + 1e-3 ? 0.12 : 0.05) * L, Math.max(gy, tb[1] - 0.46 * L)], t4 = [t3[0] + 0.05 * L, Math.max(gy, t3[1] + 0.025 * L)];
      parts.push({ poly: stroke([tb, t1, t2, t3, t4], [tw, tw * 0.8, tw * 0.6, tw * 0.42, tw * 0.3], 3), tag: 'trunk' });
      var ear = toWorld(R, [[0.02, 0.0], [0.035, 0.07], [0.06, 0.06], [0.065, -0.02], [0.04, -0.06]]); ext.push({ poly: spline(ear, 3, true), tag: 'ear' }); }
    if (s.tail) parts.push({ poly: stroke(R.tail, [0.014 * L, 0.009 * L, 0.006 * L], 3), tag: 'tail' });
    if (s.mane) parts.push({ poly: stroke([[T0[0] - 0.02 * L, T0[1] + 0.06 * L], [(T0[0] + hb[0]) / 2, (T0[1] + hb[1]) / 2 + 0.05 * L], [hb[0], hb[1] + 0.04 * L]], [0.02 * L, 0.025 * L, 0.012 * L], 3), tag: 'mane' });
    return { parts: parts, ext: ext }; }
  // ---- bone shapes ----
  function longBone(a, b, w, distal2) {   // shaft with flared articular ends; distal2: bilobed condyle
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy, ny = ux, Lp = [], Rp = [], k;
    for (k = 0; k <= 14; k++) { var u = k / 14, h = w * (0.42 + 0.75 * Math.exp(-Math.pow(u / 0.11, 2)) + 0.7 * Math.exp(-Math.pow((1 - u) / 0.11, 2)) + 0.06 * Math.sin(u * 9));
      var cx = a[0] + dx * u, cy = a[1] + dy * u; Lp.push([cx + nx * h, cy + ny * h]); Rp.push([cx - nx * h * (distal2 && u > 0.9 ? 1.15 : 1), cy - ny * h * (distal2 && u > 0.9 ? 1.15 : 1)]); }
    var end = distal2 ? [[b[0] + ux * w * 0.9 + nx * w * 0.5, b[1] + uy * w * 0.9 + ny * w * 0.5], [b[0] + ux * w * 0.55, b[1] + uy * w * 0.55], [b[0] + ux * w * 0.9 - nx * w * 0.55, b[1] + uy * w * 0.9 - ny * w * 0.55]] : [[b[0] + ux * w * 0.8, b[1] + uy * w * 0.8]];
    return Lp.concat(end, Rp.reverse(), [[a[0] - ux * w * 0.85, a[1] - uy * w * 0.85]]); }
  function skullPts(s) {   // lateral skull (head frame, units L)
    switch (s.type) {
      case 'proboscid': return { o: [[-0.005, -0.02], [-0.015, 0.06], [0.02, 0.13], [0.065, 0.15], [0.11, 0.115], [0.145, 0.05], [0.16, -0.0], [0.17, -0.06], [0.165, -0.13], [0.145, -0.17], [0.12, -0.165], [0.11, -0.11], [0.08, -0.1], [0.05, -0.115], [0.02, -0.095], [0.0, -0.06]],
        holes: [[[0.065, 0.025], 0.018, 0.016], [[0.148, 0.045], 0.01, 0.022]],
        jaw: [[0.01, -0.07], [0.0, -0.115], [0.03, -0.16], [0.08, -0.17], [0.115, -0.15], [0.09, -0.13], [0.05, -0.12], [0.03, -0.085]], alv: [0.13, -0.15] };
      case 'bovid': return { o: [[0, 0.02], [0.03, 0.06], [0.12, 0.06], [0.22, 0.03], [0.26, -0.005], [0.25, -0.03], [0.17, -0.04], [0.08, -0.05], [0.02, -0.035]], holes: [[[0.08, 0.025], 0.017, 0.015], [[0.2, 0.01], 0.02, 0.008]],
        jaw: [[0.02, -0.03], [0.03, -0.075], [0.12, -0.075], [0.24, -0.045], [0.23, -0.035], [0.1, -0.055], [0.05, -0.04]], horn: 1 };
      case 'equid': return { o: [[0, 0.02], [0.05, 0.05], [0.18, 0.04], [0.3, 0.015], [0.31, -0.015], [0.24, -0.03], [0.1, -0.045], [0.02, -0.03]], holes: [[[0.08, 0.02], 0.016, 0.014], [[0.25, 0.005], 0.025, 0.006]],
        jaw: [[0.02, -0.03], [0.04, -0.08], [0.12, -0.075], [0.3, -0.035], [0.29, -0.025], [0.1, -0.05], [0.05, -0.035]] };
      case 'canid': return { o: [[0, 0.02], [0.05, 0.06], [0.12, 0.045], [0.24, 0.005], [0.25, -0.015], [0.15, -0.025], [0.05, -0.035], [0.0, -0.02]], holes: [[[0.11, 0.012], 0.02, 0.016]],
        jaw: [[0.03, -0.025], [0.03, -0.055], [0.12, -0.05], [0.24, -0.025], [0.23, -0.018], [0.1, -0.035]] };
      default: return { o: [[0, 0.02], [0.05, 0.05], [0.15, 0.035], [0.24, 0.0], [0.24, -0.02], [0.15, -0.03], [0.05, -0.045], [0, -0.025]], holes: [[[0.08, 0.015], 0.016, 0.014]],
        jaw: [[0.02, -0.03], [0.03, -0.065], [0.12, -0.06], [0.23, -0.03], [0.22, -0.022], [0.1, -0.045]] };
    } }
  function ell(c, rx, ry, n) { var o = []; for (var k = 0; k < (n || 10); k++) { var a = k / (n || 10) * 6.2832; o.push([c[0] + Math.cos(a) * rx, c[1] + Math.sin(a) * ry]); } return o; }
  // skeleton in anatomical pose: [{poly, holes, group, far, ivory, ax:[a,b,w], order, settle}]
  function skeleton(R) {
    var s = R.s, L = R.L, B = [], i, k, v = s.vert;
    function add(poly, group, o) { o = o || {}; B.push({ poly: poly, holes: o.holes || null, group: group, far: !!o.far, ivory: o.ivory || 0, ax: o.ax || null, order: o.order || 0, unit: o.unit == null ? B.length : o.unit }); }
    // vertebral column: sacrum..thoracic along col(u); spines
    var segs = [['thor', v[1], 0.36, 0.82], ['lumb', v[2], 0.22, 0.355], ['sacr', v[3], 0.12, 0.215]];
    segs.forEach(function (sg) { for (k = 0; k < sg[1]; k++) { var u = lerp(sg[2], sg[3], (k + 0.5) / sg[1]), c = [u * L, R.col(u) * L], cw = (sg[3] - sg[2]) / sg[1] * L * 0.42, ch = 0.022 * L * (s.type === 'proboscid' ? 1.2 : 1);
      add([[c[0] - cw, c[1] - ch], [c[0] + cw, c[1] - ch], [c[0] + cw, c[1] + ch * 0.6], [c[0] - cw, c[1] + ch * 0.6]], 'vert', { ax: [[c[0] - cw, c[1]], [c[0] + cw, c[1]], ch], order: 2, unit: 'v' + sg[0] + k });
      var sl = (R.top(u) - R.col(u) - 0.03) * L, ang = sg[0] === 'thor' ? 1.9 : sg[0] === 'lumb' ? 1.35 : 1.6, tip = [c[0] + Math.cos(ang) * sl, c[1] + Math.sin(ang) * sl];
      add(stroke([[c[0], c[1] + ch * 0.4], tip], [cw * 0.55, cw * 0.32]), 'vert', { ax: [c, tip, cw * 0.45], order: 2, unit: 'v' + sg[0] + k });
      if (sg[0] === 'thor') { var rl = s.ribD * L * Math.sin(Math.PI * clamp((k + 1.5) / (sg[1] + 1), 0, 1)) * 0.9 + 0.06 * L, r0 = [c[0], c[1] - ch * 0.4], r1 = [c[0] - 0.035 * L, c[1] - rl * 0.5], r2 = [c[0] - 0.01 * L + 0.02 * L * (k / sg[1]), c[1] - rl];
        var rw = (s.type === 'proboscid' ? 0.0075 : 0.006) * L;
        add(stroke([r0, r1, r2], [rw, rw * 0.85, rw * 0.5], 3), 'rib', { ax: [r0, r2, rw], order: 1, unit: 'r' + k });
        if (k % 2 === 0) add(stroke([[r0[0] + 0.012 * L, r0[1]], [r1[0] + 0.012 * L, r1[1] + 0.01 * L], [r2[0] + 0.012 * L, r2[1] + 0.02 * L]], [rw, rw * 0.8, rw * 0.45], 3), 'rib', { far: 1, ax: [r0, r2, rw], order: 0, unit: 'rf' + k }); } } });
    // neck (cervicals)
    var T0 = R.neck[0], Hb = R.Hb;
    for (k = 0; k < v[0]; k++) { var f = (k + 0.5) / v[0], c2 = [lerp(T0[0], Hb[0], f), lerp(T0[1], Hb[1], f) - 0.01 * L], cw2 = Math.max(0.012 * L, Math.hypot(Hb[0] - T0[0], Hb[1] - T0[1]) / v[0] * 0.42);
      add(ell(c2, cw2, 0.02 * L * (s.type === 'proboscid' ? 1.3 : 1), 8), 'cerv', { ax: [[c2[0] - cw2, c2[1]], [c2[0] + cw2, c2[1]], 0.02 * L], order: 2, unit: 'c' + k }); }
    // tail (caudals)
    for (k = 0; k < v[4]; k++) { var f2 = (k + 0.5) / v[4], p = f2 < 0.5 ? [lerp(R.tail[0][0], R.tail[1][0], f2 * 2), lerp(R.tail[0][1], R.tail[1][1], f2 * 2)] : [lerp(R.tail[1][0], R.tail[2][0], f2 * 2 - 1), lerp(R.tail[1][1], R.tail[2][1], f2 * 2 - 1)], r = 0.011 * L * (1 - 0.6 * f2);
      add(ell(p, r * 1.2, r, 6), 'caud', { order: 2, unit: 'ca' + k }); }
    // scapula (over the ribs), pelvis
    var sh = R.legs[0][0], sT = [sh[0] - 0.09 * L, sh[1] + 0.25 * L * (s.type === 'proboscid' ? 1.1 : 0.8)];
    var scap = [[sh[0] - 0.015 * L, sh[1] - 0.02 * L], [sh[0] + 0.03 * L, sh[1] + 0.0 * L], [sT[0] + 0.08 * L, sT[1] - 0.01 * L], [sT[0] + 0.04 * L, sT[1] + 0.02 * L], [sT[0] - 0.05 * L, sT[1] - 0.01 * L]];
    add(spline(scap, 2, true), 'fore', { ax: [sh, sT, 0.06 * L], order: 3, unit: 'scap' });
    var hp = R.legs[2][0], pel = [[hp[0] + 0.02 * L, hp[1] - 0.015 * L], [hp[0] + 0.1 * L, hp[1] + 0.09 * L], [hp[0] + 0.07 * L, hp[1] + 0.13 * L], [hp[0] - 0.0 * L, hp[1] + 0.1 * L], [hp[0] - 0.02 * L, hp[1] + 0.04 * L], [hp[0] - 0.09 * L, hp[1] + 0.0 * L], [hp[0] - 0.1 * L, hp[1] - 0.06 * L], [hp[0] - 0.02 * L, hp[1] - 0.09 * L]];
    if (s.type === 'proboscid') pel = pel.map(function (q) { return [hp[0] + (q[0] - hp[0]) * 1.1, hp[1] + (q[1] - hp[1]) * 1.15]; });
    add(spline(pel, 2, true), 'pelvis', { holes: [[[hp[0] - 0.045 * L, hp[1] - 0.045 * L], 0.022 * L, 0.016 * L], [[hp[0] + 0.0 * L, hp[1] + 0.0 * L], 0.018 * L, 0.018 * L, 1]], ax: [[hp[0] - 0.1 * L, hp[1] - 0.06 * L], [hp[0] + 0.08 * L, hp[1] + 0.17 * L], 0.07 * L], order: 3, unit: 'pel' });
    // limbs: long bones between joints, then podials
    R.legs.forEach(function (lg, li) { var far = !!lg.far, gr = li < 2 ? 'fore' : 'hind', w = s.legW * L * (s.type === 'proboscid' ? 0.55 : 0.5);
      for (k = 0; k < lg.length - 2; k++) { var a = lg[k], b = lg[k + 1], u0 = [lerp(a[0], b[0], 0.04), lerp(a[1], b[1], 0.04)], u1 = [lerp(a[0], b[0], 0.96), lerp(a[1], b[1], 0.96)];
        add(longBone(u0, u1, w * (k === 0 ? 1.1 : 0.85), k === 0), gr + (k === 0 ? '' : 'd'), { far: far, ax: [u0, u1, w], order: far ? 0 : 4, unit: 'l' + li + k }); }
      var fA = lg[lg.length - 2], fB = lg[lg.length - 1];
      for (k = 0; k < 3; k++) { var q = [lerp(fA[0], fB[0], k / 3 + 0.15), lerp(fA[1], fB[1], k / 3 + 0.15)];
        add(ell(q, w * (s.type === 'proboscid' ? 1.1 : 0.7), w * 0.55, 7), gr + 'p', { far: far, order: far ? 0 : 4, unit: 'p' + li + k }); } });
    // skull, mandible, tusks / horn cores / antlers
    var sk = skullPts(s), so = toWorld(R, sk.o), holes = sk.holes.map(function (h) { var c = toWorld(R, [h[0]])[0]; return [c, h[1] * L, h[2] * L]; });
    add(spline(so, 2, true), 'skull', { holes: holes, ax: [toWorld(R, [[0, 0]])[0], toWorld(R, [[0.2, 0]])[0], 0.08 * L], order: 5, unit: 'skull' });
    add(spline(toWorld(R, sk.jaw), 2, true), 'jaw', { ax: [toWorld(R, [[0.02, -0.08]])[0], toWorld(R, [[0.2, -0.06]])[0], 0.03 * L], order: 5, unit: 'jaw' });
    if (s.type === 'proboscid') { var al = toWorld(R, [sk.alv])[0], tl = (s.low ? 0.45 : 0.72) * L, a0 = R.headA - 1.0, up = al.slice(), pts = [up], ws = [];
      for (k = 0; k < 9; k++) { var th = a0 + 3.1 * Math.pow((k + 0.5) / 9, 1.15) * (s.low ? 0.5 : 1); up = [up[0] + Math.cos(th) * tl / 9, up[1] + Math.sin(th) * tl / 9]; pts.push(up); }
      for (k = 0; k < pts.length; k++) ws.push(0.03 * L * (1 - 0.82 * k / (pts.length - 1)));
      add(stroke(pts, ws, 2), 'skull', { ivory: 1, ax: [pts[0], pts[pts.length - 1], 0.03 * L], order: 6, unit: 'skull' }); }
    if (sk.horn && s.horn) { var hc = toWorld(R, [[0.04, 0.06]])[0]; add(stroke([hc, [hc[0] - 0.02 * L, hc[1] + s.horn * 0.5 * L], [hc[0] + 0.02 * L, hc[1] + s.horn * L]], [0.016 * L, 0.012 * L, 0.004 * L], 2), 'skull', { ivory: 2, order: 6, unit: 'skull' }); }
    if (s.antler) { var ab = toWorld(R, [[0.04, 0.05]])[0]; add(stroke([ab, [ab[0] - 0.06 * L, ab[1] + 0.12 * L], [ab[0] - 0.02 * L, ab[1] + 0.24 * L]], [0.008 * L, 0.006 * L, 0.003 * L], 2), 'skull', { ivory: 2, order: 6, unit: 'skull' });
      add(stroke([[ab[0] - 0.045 * L, ab[1] + 0.09 * L], [ab[0] + 0.03 * L, ab[1] + 0.15 * L]], [0.005 * L, 0.003 * L]), 'skull', { ivory: 2, order: 6, unit: 'skull' }); }
    return B; }
  // disarticulation thresholds (decay index t; 1 ~ skeletonised) by group, earliest first (after Hill 1979)
  var DIS = { fore: 0.55, ford: 0.6, forep: 0.62, caud: 0.6, skull: 0.7, jaw: 0.65, hind: 0.8, hindd: 0.85, hindp: 0.85, rib: 0.9, pelvis: 1.0, vert: 1.15, cerv: 1.25 };
  return { SP: SP, spec: spec, rig: rig, flesh: flesh, skeleton: skeleton, DIS: DIS, stroke: stroke, spline: spline, rot: rot, sst: sst };
})();
/* Sediments, by Clyde (2027). A trench face through one floodplain, cut at the moment of a mint.
 * Every mint adds what happened on the surface at that moment of the world's story: a flood leaves silt, a fire a
 * charcoal seam, a death a carcass, a camp a hearth. Later mints bury it; time between mints sets how much sediment
 * accumulates, how far bodies decay, whether soils form. Each token is token N's view: all of mints 1..N, from their
 * own transaction hashes and real timestamps (the MINT HISTORY ADAPTER below), seen through a window chosen by its
 * own hash. World timeline: world.js (WORLDS), see WORLD.md. Mechanics and sources: README.md.
 * Deterministic: depends only on the history entries 1..N and the source. Units: metres, world years. */
(function () {
  'use strict';
  var C = window.CLYDE, clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, vn = PX.vnoise, fbm = PX.fbm;
  var Q = C.query;

  /* ------------------------------------------------------------------ hashing / per-mint rng */
  function cyrb(str) { var h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (var i = 0, k; i < str.length; i++) { k = str.charCodeAt(i); h1 = h2 ^ Math.imul(h1 ^ k, 597399067); h2 = h3 ^ Math.imul(h2 ^ k, 2869860233); h3 = h4 ^ Math.imul(h3 ^ k, 951274213); h4 = h1 ^ Math.imul(h4 ^ k, 2716044179); }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067); h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233); h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213); h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4); h2 ^= h1; h3 ^= h1; h4 ^= h1; return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]; }
  function hrng(seed) { var s = cyrb(String(seed)), a = s[0], b = s[1], c = s[2], d = s[3];
    function n() { a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; var t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0; return (t >>> 0) / 4294967296; }
    for (var j = 0; j < 8; j++) n();
    return { r: n, range: function (x, y) { return x + (y - x) * n(); }, int: function (x, y) { return Math.floor(x + (y - x + 1) * n()); }, chance: function (p) { return n() < p; },
      pick: function (A) { return A[Math.floor(n() * A.length)]; }, gauss: function (m, s) { var u = 1 - n(), v = n(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); },
      weighted: function (P) { var t = 0, k; for (k = 0; k < P.length; k++) t += P[k][1]; var x = n() * t; for (k = 0; k < P.length; k++) { x -= P[k][1]; if (x < 0) return P[k][0]; } return P[P.length - 1][0]; } }; }

  /* ------------------------------------------------------------------ MINT HISTORY ADAPTER
   * Returns [{index, timestamp (unix s), hash}] for mints 1..N, N = this token. Sources, in order:
   *  1. window.SEDIMENTS_HISTORY  - a frozen snapshot embedded in the file (buyer file / tokenURI-built HTML).
   *  2. tokenData.externalAssetDependencies[*] ONCHAIN data 'sed1:<hex>' - Art Blocks Flex style on-chain bytes.
   *  3. ?history=sed1:<hex>  (or base64 JSON)  - for tools and custom-contract viewers.
   *  4. none: a SIMULATED demo history derived from the platform hash (labelled 'Simulated' in traits).
   * Packed format sed1: per mint 80 hex chars = uint64 timestamp (16 hex, big-endian) + 32-byte hash (64 hex). */
  function decodePacked(s) { s = s.replace(/^sed1:/, '').replace(/^0x/, ''); var out = [];
    for (var i = 0; i + 80 <= s.length; i += 80) out.push({ index: out.length + 1, timestamp: parseInt(s.substr(i, 16), 16), hash: '0x' + s.substr(i + 16, 64) });
    return out; }
  function simulateHistory(seed) {
    var R = hrng('sim:' + seed), n = Math.round(R.weighted([[R.int(3, 30), 3], [R.int(30, 300), 4], [R.int(300, 1500), 2]])), t = 1811264400, H = [];
    for (var i = 1; i <= n; i++) { if (i > 1) t += Math.round(R.weighted([[R.range(10, 600), 4], [R.range(600, 36000), 4], [R.range(36000, 3e6), 1]]));
      var hs = '0x'; for (var j = 0; j < 4; j++) { var q = cyrb(seed + ':' + i + ':' + j); hs += ('00000000' + q[0].toString(16)).slice(-8) + ('00000000' + q[1].toString(16)).slice(-8); }
      H.push({ index: i, timestamp: t, hash: i === n ? String(seed) : hs }); }
    return H; }
  function loadHistory() {
    var W = window, h = null, src = 'Simulated';
    if (W.SEDIMENTS_HISTORY) { h = W.SEDIMENTS_HISTORY; src = 'Snapshot'; }
    else if (typeof tokenData !== 'undefined' && tokenData && tokenData.externalAssetDependencies) {
      tokenData.externalAssetDependencies.forEach(function (d) { if (!h && d && d.dependency_type === 'ONCHAIN' && typeof d.data === 'string' && d.data.indexOf('sed1:') === 0) { h = decodePacked(d.data); src = 'Chain'; } }); }
    if (!h && Q.get('history')) { var q = Q.get('history'); try { h = q.indexOf('sed1:') === 0 ? decodePacked(q) : JSON.parse(atob(q)); src = 'Param'; } catch (e) { h = null; } }
    if (!h || !h.length) { h = simulateHistory(C.hash); src = 'Simulated'; }
    h = h.slice().sort(function (a, b) { return a.index - b.index; });
    var N = parseInt(Q.get('token'), 10); if (N > 0 && N < h.length) h = h.slice(0, N);   // tools: render token N of a longer history
    return { list: h, source: src }; }

  /* ------------------------------------------------------------------ world clock */
  var WK = (typeof window.SED_WORLD === 'string' && WORLDS[window.SED_WORLD]) ? window.SED_WORLD : (Q.get('world') && WORLDS[Q.get('world')] ? Q.get('world') : 'A');
  var WORLD = WORLDS[WK], ERAS = WORLD.eras;
  var TAU = 8 * 3600, EPS = 0.05, LAM = 0.7, KD = 0.5;             // progress per mint: EPS + LAM*ln(1+gap/TAU) + KD*(gap/day)^0.9 (gaps over ~a day)
  function eraAt(P) { for (var k = 0; k < ERAS.length; k++) if (P < ERAS[k].P[1]) return ERAS[k]; return ERAS[ERAS.length - 1]; }
  function yearAt(P) { var e = eraAt(P); return e.Y[0] + (e.Y[1] - e.Y[0]) * (P - e.P[0]) / (e.P[1] - e.P[0]); }

  var HIST = loadHistory(), H = HIST.list, N = H.length, ME = H[N - 1];
  var M = [], P = 0;
  for (var i = 0; i < N; i++) {
    var gap = i ? Math.max(0, H[i].timestamp - H[i - 1].timestamp) : 0, p = EPS + (i ? LAM * Math.log(1 + gap / TAU) + KD * Math.pow(gap / 86400, 0.9) * PX.sstep(0.5, 2, gap / 86400) : 0);
    P += i ? p : 0;
    var y = yearAt(P), e = eraAt(P);
    M.push({ i: i + 1, hash: String(H[i].hash), ts: H[i].timestamp, gap: gap, P: P, year: y, dy: i ? Math.max(0.02, y - M[i - 1].year) : 0, era: e, R: hrng('mint:' + H[i].hash) });
  }
  // site geometry: one site SITE m long; each token looks through a WIN m window chosen by its own hash
  var SITE = 130, WIN = 48, NC = 2601, DX = SITE / (NC - 1);
  M.forEach(function (m) { m.x0 = (SITE - WIN) / 2 + hrng('window:' + m.hash).range(-6, 6); });   // each mint's trench is cut near the site datum, offset by its hash
  var X0 = M[N - 1].x0;

  /* ------------------------------------------------------------------ stratigraphy model (site-wide columns) */
  var L = [], S = new Float32Array(NC), A = [], F = [], SURF = [];   // layers, surface, artifacts, features, surface history
  function sn(x, s, f) { f = f || 0.35; var a = PX.ihash(s * 17 + 1) * 6.283, b = PX.ihash(s * 31 + 2) * 6.283; return 0.62 * Math.sin(x * f * 2.1 + a) + 0.38 * Math.sin(x * f * 4.7 + b); }   // cheap smooth noise (called per column for every layer)
  function addLayer(lith, thick, o) {   // thick(x) in m (>=0)
    o = o || {}; var top = new Float32Array(NC), k, any = 0, Sm = 0; if (o.level) { for (k = 0; k < NC; k++) Sm += S[k]; Sm /= NC; }   // level: water-lain and slope-wash units fill hollows first
    var ph1 = 6.283 * PX.ihash(L.length * 3 + 1), ph2 = 6.283 * PX.ihash(L.length * 5 + 2), ph3 = 6.283 * PX.ihash(L.length * 9 + 4), fq = 0.8 + 0.6 * PX.ihash(L.length * 13 + 7);
    for (k = 0; k < NC; k++) { var xk = k * DX, t = Math.max(0, thick(xk) + (o.level ? o.level * Math.max(0, Sm - S[k]) : 0)) * (1 + 0.025 * Math.sin(xk * fq * 0.5 + ph1) + 0.015 * Math.sin(xk * 1.7 * fq + ph2) + 0.01 * Math.sin(xk * 5.1 + ph3)); top[k] = S[k] + t; if (t > 0) any = 1; S[k] = top[k]; }
    var lay = { lith: lith, topU: top, mint: o.mint || 0, soil: o.soil || 0, bio: o.bio == null ? 0.4 : o.bio, lam: o.lam || 0, fine: !!o.fine, burn: o.burn || 0, seed: L.length * 13 + 7, tint: o.tint || 0, gley: 0 };
    L.push(lay); return lay; }
  function cut(depth, mint) {   // erosional / dug cut: depth(x) >= 0 m below the current surface; returns clip surface
    var cz = new Float32Array(NC), k, j;
    for (k = 0; k < NC; k++) cz[k] = S[k] - Math.max(0, depth(k * DX));
    for (j = 0; j < L.length; j++) { var t = L[j].topU; for (k = 0; k < NC; k++) if (t[k] > cz[k]) t[k] = cz[k]; }
    A.forEach(function (a) { var zb = a.kind === 'post' ? a.z - a.d : a.kind === 'carcass' ? a.z - (a.sink || 0) - 0.15 * a.len : a.z; if (a.kind === 'carcass' && !a.gone && cz[ci(a.x)] < a.z) a.reworked = mint; if (!a.gone && zb > cz[ci(a.x)] + 0.02) { a.gone = mint; } else if (!a.gone && a.kind === 'post' && a.z > cz[ci(a.x)]) a.trunc = Math.max(a.trunc || 0, a.z - cz[ci(a.x)]); });
    F.forEach(function (f) { if (!f.gone && f.z - (f.d || 0) > cz[ci(f.x)] + 0.01) f.gone = mint; });
    for (k = 0; k < NC; k++) S[k] = cz[k];
    return cz; }
  function ci(x) { return clamp(Math.round(x / DX), 0, NC - 1); }
  function Sat(x) { var f = clamp(x / DX, 0, NC - 1), k = Math.floor(f), t = f - k; return k >= NC - 1 ? S[NC - 1] : S[k] * (1 - t) + S[k + 1] * t; }
  function bump(x, c, w) { var d = (x - c) / w; return d * d < 1 ? (1 - d * d) * (1 - d * d) : 0; }
  // pre-existing ground (from the world table): bottom -> top, gently undulating
  (function () { var z = 0; WORLD.base.forEach(function (b) { z -= b[1]; }); for (var k = 0; k < NC; k++) S[k] = z - 0.6;
    WORLD.base.forEach(function (b, j) { if (j === WORLD.base.length - 3) { var chx = SITE / 2 + 18 * (PX.ihash(WK.charCodeAt(0) * 31) - 0.5), chw = 7, chd = 0.9;   // an old channel: erosive base, gravel lag, cross-bedded sand fill
        cut(function (x) { return chd * bump(x, chx, chw); }, 0); addLayer('gravel', function (x) { return 0.12 * bump(x, chx, chw * 0.7); }, { bio: 0.05 }); addLayer('sand', function (x) { return (chd - 0.1) * bump(x, chx, chw) ; }, { bio: 0.08, lam: 18, level: 0.6 }); }
      addLayer(b[0], function (x) { return b[1] * (1 + 0.04 * sn(x, 50 + j, 0.4)) + (j === 0 ? 0.6 : 0); }, { bio: j === WORLD.base.length - 1 ? 0.6 : 0.15, soil: j === WORLD.base.length - 1 ? 0.5 : b[0] === 'mud' ? 0.7 : 0, lam: b[0] === 'sand' ? 14 : 0 }); }); })();

  var EXTINCT = ['mammoth', 'mastodon', 'horse'];
  function fauna(m) { var f = m.era.fauna.filter(function (s) { return !(m.era.lastMegafauna != null && m.year > m.era.lastMegafauna && EXTINCT.indexOf(s[0]) >= 0); }); return f.length ? f : [['deer', 1]]; }
  var REPEAT = ['graze', 'flood', 'camp', 'loess', 'fire', 'plough', 'litter', 'midden', 'pit', 'cinders', 'drought', 'blackmat', 'quiet', 'outwash', 'beaver'];
  var SIZE = { mammoth: 3.4, mastodon: 3.0, bison: 2.6, horse: 2.2, deer: 1.7, wolf: 1.2, dog: 0.95, bear: 1.8, cow: 2.3, pig: 1.4, beaver: 0.9, human: 1.1 };
  var SPEC = { mammoth: { h: .9, d: .44, nk: .06, hd: .3, hr: .17, lg: .075, tusk: .8, trunk: .55, tail: .1, hump: .1, hide: '#5b3f2c', hair: 1 },
    mastodon: { h: .78, d: .42, nk: .06, hd: .26, hr: .14, lg: .08, tusk: .55, trunk: .45, tail: .12, hump: .03, hide: '#4e3a2c', hair: .6 },
    bison: { h: .66, d: .42, nk: .08, hd: .22, hr: .1, lg: .045, horn: .1, hump: .16, tail: .25, hide: '#3f2e22', hair: .7 },
    horse: { h: .72, d: .3, nk: .32, hd: .26, hr: .065, lg: .034, tail: .35, hide: '#76503a' }, deer: { h: .72, d: .27, nk: .3, hd: .2, hr: .055, lg: .024, antler: .24, tail: .07, hide: '#86664a' },
    wolf: { h: .55, d: .27, nk: .16, hd: .22, hr: .065, lg: .034, tail: .38, hide: '#7d756a', hair: .4 }, dog: { h: .55, d: .27, nk: .16, hd: .22, hr: .065, lg: .034, tail: .36, hide: '#8a6a48' },
    bear: { h: .55, d: .42, nk: .1, hd: .2, hr: .1, lg: .07, tail: .04, hide: '#3a2c22', hair: .5 }, cow: { h: .6, d: .43, nk: .14, hd: .24, hr: .09, lg: .05, horn: .05, tail: .4, hide: '#3b322c' },
    pig: { h: .48, d: .4, nk: .04, hd: .25, hr: .1, lg: .045, tail: .08, hide: '#a08070' }, beaver: { h: .33, d: .42, nk: .04, hd: .24, hr: .1, lg: .05, tail: .38, hide: '#5a4030' },
    human: { h: .5, d: .3, nk: .1, hd: .2, hr: .09, lg: .05, tail: 0, hide: '#4a3a2e' } };
  var REPEATS = 0;

  M.forEach(function (m, idx) {
    var R = m.R, e = m.era, wx0 = m.x0, xl = wx0 + R.range(0.5, WIN - 0.5);
    // 1. background sediment for the world time since the previous mint (Sadler-style: thickness ~ dy^0.6)
    if (idx) { var bg = e.rate / 1000 * m.dy + (e.accr || 0) * Math.min(m.dy, 50), soil = m.dy > 25 ? clamp(Math.log(m.dy / 25) / Math.LN10 / 2.0, 0, 1) : 0, sd = idx * 3 + 1, y0 = M[idx - 1].year;
      (e.soils || []).forEach(function (q) { if (q[0] > y0 && q[0] <= m.year) soil = Math.max(soil, q[1]); });
      if (bg > 0.0004) addLayer(e.bg, function (x) { return bg * (1 + 0.12 * sn(x, sd, 0.25)); }, { mint: m.i, level: 0.06, soil: soil, bio: 0.35 + 0.6 * soil, lam: e.bg === 'loess' ? 0 : 3 }); }
    // 2. the surface event, chosen by this mint's hash within the era
    var ev = R.weighted(e.events), prev = idx ? M[idx - 1].ev : null;
    if (prev && m.gap < 3 * 3600 && REPEAT.indexOf(prev) >= 0 && M[idx - 1].era === e && R.chance(0.42)) { ev = prev; REPEATS++; }
    if (e.bigFlood && M[idx - 1] && M[idx - 1].year < e.bigFlood && m.year >= e.bigFlood) ev = 'greatflood';
    if (idx === 0 && (ev === 'lost' || ev === 'sandblow')) ev = 'quiet';
    if (idx && (ev === 'death' || ev === 'burial') && !R.chance(clamp(m.dy / 0.3, 0.1, 1))) ev = e.events.some(function (q) { return q[0] === 'graze'; }) ? 'graze' : 'quiet';   // deaths are a per-year process: a burst of mints in one season cannot produce a burst of carcasses
    m.ev = ev; m.xl = xl; var sd2 = idx * 5 + 2, k, n, x;
    switch (ev) {
      case 'graze': { m.sp = R.weighted(fauna(m)); m.herd = R.weighted([[1, 3], [2, 3], [3, 2], [5, 1]]);
        addLayer(e.bg, function (x) { return 0.004 + 0.006 * Math.max(0, sn(x, sd2, 2)); }, { mint: m.i, bio: 0.9, tint: 1 }); break; }   // trampled
      case 'death': { var sp = R.weighted(fauna(m)), fl0 = R.chance(0.5), Ld = SIZE[sp]; xl = wx0 + WIN / 2 + R.range(-0.32, 0.32) * WIN; var mired = (e.key === 'prologue' || e.key === 'steppe' || e.key === 'lateglacial') && R.chance(e.key === 'prologue' ? 0.55 : 0.3), sink = mired ? R.range(1.0, 1.15) * FAUNA.spec(sp).belly * Ld : 0;
        A.push({ kind: 'carcass', sp: sp, mint: m.i, x: xl, z: Sat(xl), len: Ld * R.range(0.9, 1.08), flip: fl0, seed: m.hash, sink: sink, pose: mired ? 'mired' : 'sternal' });
        m.sp = sp; addLayer(e.bg, function () { return 0.002; }, { mint: m.i, bio: 0.5 }); break; }
      case 'flood': case 'greatflood': {
        var ft = ev === 'greatflood' ? R.range(0.25, 0.4) : R.range(0.008, 0.05) * (R.chance(0.12) ? R.range(2, 4) : 1);
        if (ev === 'flood' && e.key !== 'prologue' && R.chance(0.07)) { var scx = xl + R.range(-3, 3), scw = R.range(1.2, 3.5), scd = R.range(0.12, 0.35); cut(function (x) { return scd * bump(x, scx, scw); }, m.i); addLayer('sand', function (x) { return scd * 0.95 * bump(x, scx, scw); }, { mint: m.i, bio: 0.06, lam: 14 }); }   // scour and fill
        addLayer('flood', function (x) { return ft * (1.05 - 0.1 * x / SITE) * (1 + 0.12 * sn(x, sd2, 0.6)); }, { mint: m.i, level: 0.3, bio: 0.12, lam: 4 + Math.round(ft * 60), fine: true });
        m.ft = ft; if (R.chance(0.1)) A.push({ kind: 'log', mint: m.i, x: xl, z: S[ci(xl)] - ft * 0.4, len: R.range(0.8, 2.4), r: R.range(0.06, 0.16), ang: R.range(-0.12, 0.12), seed: m.hash }); break; }
      case 'drought': { addLayer('crust', function () { return 0.005; }, { mint: m.i, bio: 0.05 });
        var sp2 = R.range(0.18, 0.4); for (x = (R.r() * sp2); x < SITE; x += sp2 * R.range(0.6, 1.4)) F.push({ kind: 'crack', x: x, z: Sat(x), d: R.range(0.04, 0.11), w: R.range(0.008, 0.02), mint: m.i });
        break; }
      case 'fire': { var ct = R.range(0.004, 0.012); addLayer('charcoal', function (x) { return ct * Math.max(0.15, 1 + 0.8 * sn(x, sd2, 1.5)); }, { mint: m.i, bio: 0.25, burn: R.range(0.012, 0.03) }); break; }
      case 'loess': { var lt = R.range(0.01, 0.045); addLayer('loess', function (x) { return lt * (1 + 0.2 * sn(x, sd2)); }, { mint: m.i, bio: 0.3 }); break; }
      case 'frost': { n = R.chance(0.5) ? 1 : 0; for (k = 0; k < n; k++) { x = wx0 + R.range(0.3, WIN - 0.3); F.push({ kind: 'wedge', x: x, z: Sat(x), d: R.range(0.6, 1.4), w: R.range(0.35, 0.8), mint: m.i, seed: m.hash + k }); }
        addLayer('loess', function () { return 0.003; }, { mint: m.i }); break; }
      case 'outwash': { cut(function (x) { return 0.05 * Math.max(0, sn(x, sd2, 0.8)); }, m.i); var ot = R.range(0.06, 0.24), gr = R.chance(0.45);
        addLayer(gr ? 'gravel' : 'sand', function (x) { return ot * (1 + 0.35 * sn(x, sd2 + 1, 0.5)); }, { mint: m.i, bio: 0.05, lam: 10 }); break; }
      case 'blackmat': { var bt = R.range(0.02, 0.06); addLayer('blackmat', function (x) { return bt * (1 + 0.3 * sn(x, sd2)); }, { mint: m.i, bio: 0.3 }); break; }
      case 'camp': { var hw = R.range(0.5, 0.9), hx = xl;
        addLayer('charcoal', function (x) { return 0.035 * bump(x, hx, hw / 2); }, { mint: m.i, bio: 0.3, burn: 0.03 });
        n = R.int(4, 8); for (k = 0; k < n; k++) A.push({ kind: 'fcr', mint: m.i, x: hx + R.range(-hw / 2, hw / 2), z: Sat(hx) - R.range(0, 0.04), r: R.range(0.035, 0.08), seed: m.hash + 'r' + k });
        n = R.int(1, 2); for (k = 0; k < n; k++) A.push({ kind: (e.key === 'lateglacial' && k === 0) ? 'fluted' : 'flake', mint: m.i, x: hx + R.range(-1, 1), z: Sat(hx) - R.range(0, 0.02), r: R.range(0.035, 0.07), ang: R.range(-0.4, 0.4), seed: m.hash + 'f' + k });
        if (R.chance(0.5)) A.push({ kind: 'bonefrag', mint: m.i, x: hx + R.range(-0.4, 0.4), z: Sat(hx), r: R.range(0.05, 0.12), ang: R.range(-1, 1), burnt: true, seed: m.hash + 'b' });
        m.hx = hx; break; }
      case 'midden': { var mw = R.range(0.7, 1.6), mx = xl, mt = R.range(0.04, 0.1); addLayer('shell', function (x) { return mt * bump(x, mx, mw / 2); }, { mint: m.i, bio: 0.2 }); break; }
      case 'burial': case 'dogburial': { var gw = ev === 'burial' ? R.range(0.9, 1.15) : R.range(0.5, 0.65), gd = ev === 'burial' ? R.range(0.55, 0.8) : R.range(0.3, 0.45), gx = xl, gz = Sat(gx);
        F.push({ kind: 'pit', x: gx, z: gz, w: gw, d: gd, fill: 'gravefill', mint: m.i, seed: m.hash });
        A.push({ kind: 'carcass', sp: ev === 'burial' ? 'human' : 'dog', crouch: true, pose: ev === 'burial' ? 'crouch' : 'sternal', mint: m.i, x: gx, z: gz - gd + 0.04, len: ev === 'burial' ? 1.0 : 0.7, flip: R.chance(0.5), seed: m.hash, buried: true });
        addLayer('gravefill', function (x) { return 0.06 * bump(x, gx, gw * 0.55); }, { mint: m.i, bio: 0.5 }); break; }
      case 'pit': { var pw = R.range(0.6, 1.1), pd = R.range(0.45, 0.85), px = xl, pz = Sat(px);
        F.push({ kind: 'pit', x: px, z: pz, w: pw, d: pd, fill: 'pitfill', mint: m.i, seed: m.hash });
        n = R.int(1, 3); for (k = 0; k < n; k++) A.push({ kind: 'sherd', mint: m.i, x: px + R.range(-pw * 0.35, pw * 0.35), z: pz - R.range(0.08, pd * 0.85), r: R.range(0.05, 0.1), ang: R.range(-0.6, 0.6), seed: m.hash + 's' + k });
        break; }
      case 'house': { n = R.int(1, 2); var hs = R.range(1.6, 2.6), hx0 = xl - (n - 1) * hs / 2;
        for (k = 0; k < n; k++) { x = hx0 + k * hs; A.push({ kind: 'post', mint: m.i, x: x, z: Sat(x), d: R.range(0.45, 0.7), r: R.range(0.07, 0.1), h: R.range(1.7, 2.2), wood: true, seed: m.hash + k, roof: true }); }
        if (R.chance(0.6)) A.push({ kind: 'sherd', mint: m.i, x: xl + R.range(-1, 1), z: Sat(xl) - 0.01, r: R.range(0.05, 0.09), ang: R.range(-0.3, 0.3), seed: m.hash + 'hs' });
        break; }
      case 'plough': { var pdp = R.range(0.2, 0.26);   // the plough homogenises the top ~20-25 cm: older lamination gone, finds mixed
        A.forEach(function (a) { if (!a.gone && a.kind !== 'post' && a.z > S[ci(a.x)] - pdp) { a.ploughed = (a.ploughed || 0) + 1; a.z = S[ci(a.x)] - R.range(0.02, pdp); if (a.kind === 'carcass') a.gone = m.i; } });
        cut(function () { return pdp; }, 0); addLayer('plough', function (x) { return pdp + 0.004; }, { mint: m.i, bio: 0.95 }); m.furrow = R.range(0.7, 1.0); break; }
      case 'fence': { var kinds = e.fenceKinds || ['post and wire'], fk = R.pick(kinds), spc = fk === 'split rail' ? R.range(2.6, 3.2) : fk === 'chain-link' ? R.range(2.8, 3.1) : R.range(3.5, 4.5);
        for (x = wx0 + R.range(0.2, spc); x < wx0 + WIN - 0.1; x += spc) A.push({ kind: 'post', fence: fk, mint: m.i, x: x, z: Sat(x), d: fk === 'chain-link' ? 0.75 : R.range(0.55, 0.8), r: fk === 'chain-link' ? 0.03 : R.range(0.05, 0.075), h: fk === 'split rail' ? 1.2 : 1.25, wood: fk !== 'chain-link', seed: m.hash + x.toFixed(2) });
        m.fence = fk; break; }
      case 'litter': { var pool = e.key === 'farm' ? [['bottle', 3], ['whiteware', 3], ['nail', 4], ['horseshoe', 2], ['button', 1]] : e.key === 'future' ? [['plastic', 4], ['can', 2], ['bottle', 1], ['tyre', 0.5]] : [['can', 4], ['plastic', 3], ['bottle', 3], ['shell', 2], ['wire', 1], ['phone', 0.3]];
        n = R.weighted([[1, 6], [2, 3]]); for (k = 0; k < n; k++) { var ob = R.weighted(pool); A.push({ kind: ob === 'shell' ? 'shotshell' : ob, mint: m.i, x: wx0 + R.range(0.3, WIN - 0.3), z: Sat(xl) + 0.005, ang: R.range(-0.5, 0.5), seed: m.hash + 'o' + k, r: 0.1 }); }
        break; }
      case 'cinders': { var cw = R.range(1.5, 3.5), cx = xl, ctk = R.range(0.02, 0.07); addLayer('cinders', function (x) { return ctk * bump(x, cx, cw / 2); }, { mint: m.i, bio: 0.2 }); break; }
      case 'tyre': A.push({ kind: 'tyre', mint: m.i, x: xl, z: Sat(xl), ang: R.range(-0.08, 0.08), seed: m.hash }); break;
      case 'car': A.push({ kind: 'car', mint: m.i, x: wx0 + WIN / 2 + R.range(-0.4, 0.4), z: Sat(wx0 + WIN / 2) - 0.05, flip: R.chance(0.5), seed: m.hash }); break;
      case 'beaver': { var bt2 = R.range(0.05, 0.14); addLayer('pond', function (x) { return bt2 * (1 + 0.3 * sn(x, sd2)); }, { mint: m.i, level: 0.5, bio: 0.1, lam: 8, fine: true });
        n = R.int(2, 4); for (k = 0; k < n; k++) A.push({ kind: 'stick', mint: m.i, x: wx0 + R.range(0.3, WIN - 0.3), z: S[ci(xl)] - bt2 * R.range(0.1, 0.8), len: R.range(0.3, 0.9), r: R.range(0.012, 0.03), ang: R.range(-0.25, 0.25), seed: m.hash + k }); break; }
      case 'sandblow': { x = wx0 + R.range(0.4, WIN - 0.4); F.push({ kind: 'dike', x: x, z: Sat(x), w: R.range(0.03, 0.08), mint: m.i, seed: m.hash });
        var sx = x; addLayer('sand', function (x) { return 0.06 * bump(x, sx, 0.9); }, { mint: m.i, bio: 0.05, lam: 6 }); break; }
      case 'lost': { x = wx0 + R.range(0.3, WIN - 0.3); var dz = R.range(0.25, 1.1), obj = e.key === 'steppe' || e.key === 'lateglacial' ? 'tooth' : e.key === 'archaic' || e.key === 'woodland' ? 'bead' : e.key === 'farm' ? 'button' : 'key';
        F.push({ kind: 'burrow', x: x, z: Sat(x), d: dz, w: R.range(0.06, 0.1), mint: m.i, seed: m.hash });
        A.push({ kind: obj, mint: m.i, x: x + R.range(-0.03, 0.03), z: Sat(x) - dz + 0.03, ang: R.range(-1, 1), seed: m.hash, lost: true, r: 0.03 }); break; }
      default: break;   // quiet: nothing but time
    }
    // surface history at coarse resolution (for burial-vs-time decay)
    var sh = new Float32Array(26); for (k = 0; k < 26; k++) sh[k] = S[Math.min(NC - 1, k * 20)]; SURF.push(sh);
  });
  function surfAt(mIdx, x) { var s = SURF[mIdx], f = clamp(x / 0.4, 0, 25), k = Math.floor(f), t = f - k; return k >= 25 ? s[25] : s[k] * (1 - t) + s[k + 1] * t; }

  /* ------------------------------------------------------------------ compaction (per column) */
  // Near-surface self-weight consolidation: thickness factor 1 - a(1 - exp(-d/zc)) with d = overburden (m).
  // Peat compacts most (peat:lignite 2:1-4:1, Widera); sand/gravel least. At km scale this tends to Athy (1930).
  var COMP = { flood: [0.18, 2.5], silt: [0.15, 2.5], mud: [0.2, 2.5], pond: [0.25, 2], blackmat: [0.25, 2], peat: [0.6, 1.2], loess: [0.1, 3], sand: [0.03, 3], gravel: [0.02, 3],
    charcoal: [0.2, 2], plough: [0.15, 2.5], crust: [0.1, 2], shell: [0.05, 3], cinders: [0.05, 3], gravefill: [0.15, 2.5], pitfill: [0.15, 2.5], made: [0.05, 3] };
  var base0 = new Float32Array(NC); (function () { var z = 0; WORLD.base.forEach(function (b) { z -= b[1]; }); for (var k = 0; k < NC; k++) base0[k] = z - 0.6; })();
  L.forEach(function (l) { l.top = new Float32Array(NC); });
  for (var c = 0; c < NC; c++) {
    var surf = L[L.length - 1].topU[c], below = base0[c], zc = base0[c];
    for (var j = 0; j < L.length; j++) { var tU = L[j].topU[c] - below, cf = COMP[L[j].lith] || [0.15, 2.5];
      var d = surf - L[j].topU[c] + tU / 2; zc += tU * (1 - cf[0] * (1 - Math.exp(-d / cf[1]))); L[j].top[c] = zc; below = L[j].topU[c]; } }
  function colInterp(arr, x) { var f = clamp(x / DX, 0, NC - 1), k = Math.floor(f), t = f - k; return k >= NC - 1 ? arr[NC - 1] : arr[k] * (1 - t) + arr[k + 1] * t; }
  function mapZ(x, zU) {   // uncompacted height -> compacted height at x
    var lo = 0, hi = L.length - 1, bU = colInterp(base0, x);
    if (zU <= bU) return zU;
    var top = colInterp(L[hi].topU, x); if (zU >= top) return colInterp(L[hi].top, x) + (zU - top);
    while (lo < hi) { var mid = (lo + hi) >> 1; if (colInterp(L[mid].topU, x) < zU) lo = mid + 1; else hi = mid; }
    var tu1 = colInterp(L[lo].topU, x), tu0 = lo ? colInterp(L[lo - 1].topU, x) : bU, tc1 = colInterp(L[lo].top, x), tc0 = lo ? colInterp(L[lo - 1].top, x) : bU;
    return tu1 - tu0 < 1e-6 ? tc1 : tc0 + (tc1 - tc0) * (zU - tu0) / (tu1 - tu0); }
  function surfC(x) { return colInterp(L[L.length - 1].top, x); }
  function surfU(x) { return colInterp(L[L.length - 1].topU, x); }

  /* ------------------------------------------------------------------ taphonomy: each artifact's state at token N */
  // World years and burial depth between its mint and token N. Soft tissue: Payne (1965) stages, slowed by burial
  // (buried pigs reached dry/remains in ~300-365 d, Rai et al. 2022) and by cold/waterlogging (Allison 1988: anoxia slows
  // but does not stop decay). Exposed bone weathers on Behrensmeyer (1978) stages (3-5 y st.3, 6-7 y st.4, 10-15 y st.5).
  // GEOLOGICAL CLOCK (a stated conceit): diagenesis age G = 1000 x world years + 2000 y x mints since burial. Real
  // permineralisation, coalification and oil need 10^4-10^8 y, km of burial and 60-120 C (oil window); see README.
  var NOW = M[N - 1], WT = WORLD.waterTable, CLIM = { cold: 0.6, cool: 0.8, mild: 1, warm: 1.25 };
  var BODYH = { mammoth: 0.95, mastodon: 0.9, bison: 0.7, horse: 0.6, deer: 0.4, wolf: 0.3, dog: 0.25, bear: 0.5, cow: 0.65, pig: 0.45, beaver: 0.2, human: 0.3 };
  var maxG = 0, organicMax = 0, compressedUsed = false;
  A.forEach(function (a) {
    if (a.gone) return;
    var mi = a.mint - 1, age = NOW.year - M[mi].year, ms = N - a.mint, G = 1000 * age + 2000 * ms, D = 0, Ex = 0, wetYrs = 0, burY = 0, j, dt, dep, b;
    var fs0 = FAUNA.spec(a.sp), hb = a.kind === 'carcass' ? (a.crouch ? 0.15 : a.pose === 'mired' ? (fs0.wit + fs0.hump) * a.len - a.sink : (fs0.wit + fs0.hump - fs0.belly + 0.04) * a.len) : 0.05, ex0 = 0, exN = 0;
    for (j = mi + 1; j <= N; j++) {
      dt = j < N ? M[j].year - M[j - 1].year : 0; if (j === mi + 1) dt = j < N ? dt : 0;
      dep = (j - 1 < SURF.length ? surfAt(j - 1, a.x) : surfU(a.x)) - a.z;
      b = a.buried ? 1 : clamp((dep + (a.pose === 'mired' ? 0.25 * hb : 0)) / hb, 0, 1);
      var r = lerp(1, 0.3, b) * (CLIM[M[j - 1].era.climate] || 1) * (dep > WT ? 0.25 : 1) * (b < 0.5 ? 3 : b < 0.8 ? 1.5 : 1);   // exposed: scavengers (megafaunal carcasses are stripped in weeks to months when exposed)
      D += dt * r; if (a.kind === 'carcass' && a.support == null && D / Math.sqrt((a.len || 1) / 2) >= 0.25) a.support = Math.max(0, dep); if (a.kind === 'carcass' && a.supp1 == null && D / Math.sqrt((a.len || 1) / 2) >= 1) a.supp1 = Math.max(0, dep); if (a.kind === 'carcass' && D / Math.sqrt((a.len || 1) / 2) < 1.3) { ex0 += 1 - b; exN++; } if (b < 0.6 && D > 0.3) Ex += dt * (1 - b); if (dep > WT) wetYrs += dt; if (b > 0.8) burY += dt;
      if (D > 50 && Ex > 20) break;
    }
    var depNow = surfU(a.x) - a.z, s = Math.sqrt((a.len || 1) / 2);
    a.age = age; a.G = G; a.dep = depNow; a.expo = exN ? ex0 / exN : 1 - clamp(depNow / 0.5, 0, 1); a.t = D / Math.sqrt((a.len || 1) / 2); a.wet = depNow > WT; a.burY = burY; a.Dk = D;
    if (a.kind === 'carcass') {
      var t = D / s; a.stage = t < 0.015 ? 0 : t < 0.05 ? 1 : t < 0.25 ? 2 : t < 1.0 ? 3 : 4;            // fresh bloat active advanced skeletal
      a.flesh = t < 0.05 ? 1 : t < 0.25 ? 1 - 0.45 * (t - 0.05) / 0.2 : t < 1.0 ? 0.55 - 0.5 * (t - 0.25) / 0.75 : Math.max(0, 0.05 - (t - 1) * 0.05);
      a.bloat = t < 0.015 ? t / 0.015 * 0.2 : t < 0.05 ? 0.2 + 0.8 * (t - 0.015) / 0.035 : t < 0.12 ? 1 - (t - 0.05) / 0.07 : 0;
      a.wstage = Ex < 1 ? 0 : Ex < 3 ? 1 : Ex < 5 ? 2 : Ex < 7 ? 3 : Ex < 10 ? 4 : 5;                    // Behrensmeyer
      a.stain = 1 - Math.exp(-burY / 2500);
      a.halo = (a.stage >= 2 ? Math.min(1, (t - 0.05) * 3) : 0) * Math.exp(-Math.max(0, age - 5) / (a.wet ? 4000 : 400));
      a.fossil = a.wet && G > 2e5 ? (G > 3e6 ? 2 : 1) : 0;                                              // 1 permineralised, 2 replaced
      a.kerogen = a.wet && G > 1e6 ? clamp(Math.log(G / 1e6) / Math.log(30), 0, 1) : 0;
      if (a.fossil || a.kerogen) compressedUsed = true;
      organicMax = Math.max(organicMax, a.halo);
    } else if (a.kind === 'post' || a.kind === 'log' || a.kind === 'stick') {
      var dry = a.wet ? 0 : 1; a.rot = a.wet ? clamp((age - wetYrs) / 60, 0, 0.4) : clamp(age / (a.kind === 'stick' ? 25 : 45), 0, 1); a.above = clamp(1 - age / 22, 0, 1);
      a.lign = a.wet && G > 1e6 ? 1 : 0; if (a.lign) compressedUsed = true;
    } else if (['nail', 'horseshoe', 'wire', 'car', 'phone'].indexOf(a.kind) >= 0 || (a.kind === 'post' && !a.wood)) {
      a.rust = clamp(age * (a.wet ? 0.3 : 1) / (a.kind === 'car' ? 60 : a.kind === 'nail' ? 180 : 260), 0, 1);
    } else if (a.kind === 'can') { a.rust = clamp(age * (a.wet ? 0.5 : 1) / 250, 0, 1); }
    else if (a.kind === 'bottle') { a.irid = clamp((age - 40) / 300, 0, 1); a.broken = depNow > 0.4; }
    else if (a.kind === 'plastic') { a.brittle = clamp(Ex / 15, 0, 1); }
    else if (a.kind === 'flake' || a.kind === 'fluted') { a.patina = clamp(age / 8000, 0, 1); }
    else if (a.kind === 'tyre') { a.rust = clamp(age / 120, 0, 1); }
    maxG = Math.max(maxG, G);
  });

  /* ------------------------------------------------------------------ view */
  var o = PX.canvas(C, 1600, 800, '#111'), PW = o.PW, PH = o.PH, NP = PW * PH;
  var RB = new Float32Array(NP), GB = new Float32Array(NP), BB = new Float32Array(NP);
  var NB = WORLD.base.length, zRef = -1e9, zGround0 = 1e9, xa;
  for (xa = X0; xa <= X0 + WIN; xa += 0.05) { zRef = Math.max(zRef, surfC(xa)); zGround0 = Math.min(zGround0, colInterp(L[NB - 1].top, xa)); }
  // landscape-scale trench face: a 48 m window (a mammoth is ~7% of the width), metres the same in x and z; deep tokens zoom out
  var VH0 = WIN * PH / PW, ZOOM = clamp((zRef - zGround0 + 2.5) / (VH0 * 0.9), 1, SITE / WIN), VWm = WIN * ZOOM, VX0 = clamp(X0 + WIN / 2 - VWm / 2, 0, SITE - VWm);
  var SC = PW / VWm, VHm = VH0 * ZOOM, YS = 0.06 * VHm, headNeed = 0;
  A.forEach(function (a) { if (a.kind !== 'carcass' || a.buried || (a.dep || 0) > 0.8 || a.x < VX0 - 2 || a.x > VX0 + VWm + 2) return; var f5 = FAUNA.spec(a.sp), ht = a.z + (a.pose === 'mired' ? (f5.wit + f5.hump + 0.12) * a.len - (a.sink || 0) : (f5.wit + f5.hump - f5.belly + 0.1) * a.len) * ((a.t || 0) > 1 ? 0.35 : 1); headNeed = Math.max(headNeed, ht - zRef + 0.35); });
  YS = clamp(Math.max(YS, headNeed + 0.8), 0.06 * VHm, 0.2 * VHm);                                                       // px per m; surface line (m from top)
  function sx(x) { return (x - VX0) * SC; } function sy(z) { return (YS + zRef - z) * SC; }
  function wx(px) { return VX0 + px / SC; } function wz(py) { return zRef + YS - py / SC; }
  var COLM = {}, col = function (h) { var c = COLM[h]; if (!c) c = COLM[h] = PX.col(h); return c; }, mix3 = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  var LITH = { gravel: col('#857761'), sand: col('#b49d72'), silt: col('#9b8468'), flood: col('#958067'), loess: col('#c1aa84'), mud: col('#7f7466'), pond: col('#6e6a62'),
    blackmat: col('#45403a'), peat: col('#3e2d21'), charcoal: col('#211d1a'), plough: col('#6f5b47'), crust: col('#b6a58a'), shell: col('#6a5a48'), cinders: col('#4b4846'),
    gravefill: col('#6b5844'), pitfill: col('#5d4b3b'), made: col('#7a6d60') };
  var BTC = col('#8b5e3c');
  function rootTrace(x, dd, sd, lmax) { var cw = 0.16, c0 = Math.floor(x / cw), r = 0;   // fine, wiggling, tapering root channels
    for (var q = -1; q <= 1; q++) { var cc = c0 + q, h = PX.h2(cc, 7, sd); if (h > 0.5) continue; var len = lmax * (0.4 + 0.6 * PX.h2(cc, 9, sd)); if (dd > len) continue;
      var rx = (cc + 0.5 + 0.7 * (PX.h2(cc, 11, sd) - 0.5)) * cw + 0.02 * Math.sin(dd * 21 + cc) + 0.008 * Math.sin(dd * 63 + cc * 3), w = 0.005 * (1 - dd / len) + 0.0015, ax = Math.abs(x - rx);
      if (ax < w) return 1; if (ax < w * 2.6) r = 0.5; }
    return r; }
  var SOILC = col('#4f3d2e'), GLEY = col('#7c827d'), RUST = col('#a8642e'), REDD = col('#9b5a3d');

  /* ------------------------------------------------------------------ features prepared in compacted coords */
  F.forEach(function (f) { if (f.gone) return; f.zc = mapZ(f.x, f.z); var zb = mapZ(f.x, f.z - (f.d || 0)); f.dc = f.zc - zb; });
  A.forEach(function (a) { if (a.gone) return; a.zc = mapZ(a.x, a.z); });
  // posts become post-pipes: the wood rots (above the water table) and the void fills with dark topsoil (classic archaeology)
  var FBIN = null, FBW = 0.1;
  function binFeatures() { FBIN = []; for (var i = 0; i < F.length; i++) { var f = F[i]; if (f.gone || f.dc == null) continue; var r = (f.w || 0.1) + 0.2, b0 = Math.max(0, Math.floor((f.x - r) / FBW)), b1 = Math.floor((f.x + r) / FBW);
    for (var bb = b0; bb <= b1; bb++) (FBIN[bb] = FBIN[bb] || []).push(f); } }
  function featureAt(x, z) {   // returns [kind, zSample] if inside a cut feature (x-binned: thousands of features in late tokens)
    if (!FBIN) binFeatures(); var FL = FBIN[Math.floor(x / FBW)]; if (!FL) return null;
    for (var i = 0; i < FL.length; i++) { var f = FL[i]; var dx = x - f.x; if (Math.abs(dx) > (f.w || 0.1) + 0.12) continue;
      var u = f.zc - z; if (u < -0.001 || u > f.dc + 0.001) continue;
      if (f.kind === 'pit') { var hw = f.w / 2 * Math.pow(Math.max(0, 1 - Math.pow(u / f.dc, 2.2)), 0.45); if (Math.abs(dx) < hw) return [f.fill, z, f]; }
      else if (f.kind === 'wedge' || f.kind === 'crack') { var ww = f.w / 2 * Math.pow(Math.max(0, 1 - u / f.dc), 1.6) * (1 + 0.1 * vn(z * 30, x * 3, 5)); if (Math.abs(dx + 0.02 * vn(z * 8, 1, 3)) < ww) return ['infill', f.zc + 0.006, f]; }
      else if (f.kind === 'burrow') { var bx = f.x + 0.06 * Math.sin(u * 11 + f.x) ; if (Math.abs(x - bx) < f.w / 2 * (0.8 + 0.3 * vn(u * 20, 2, 9))) return ['infill', f.zc + 0.006, f]; }
      else if (f.kind === 'dike') { var dw = f.w / 2 * (0.4 + 0.6 * (1 - u / Math.max(f.dc, 0.01))) * (1 + 0.4 * vn(z * 12, x, 4)); if (Math.abs(dx + 0.03 * vn(z * 3, 7, 2)) < dw) return ['sand', z, f]; }
    }
    return null; }
  F.forEach(function (f) { if (f.kind === 'dike' && !f.gone) { f.dc = f.zc - (colInterp(L[0].top, f.x)); } });
  FBIN = null;

  /* ------------------------------------------------------------------ strata colour */
  var Zc = new Float32Array(L.length);
  function findLayer(z) { var lo = 0, hi = L.length - 1; if (z > Zc[hi]) return -1; while (lo < hi) { var m2 = (lo + hi) >> 1; if (Zc[m2] < z) lo = m2 + 1; else hi = m2; } return lo; }
  function lf(f) { return Math.min(f, SC * 0.3); }   // level of detail: no texture finer than ~3 px
  function lithColor(li, x, z, depth) {
    var l = L[li], c = LITH[l.lith] || LITH.silt, bot = li ? Zc[li - 1] : -99, th = Math.max(1e-4, Zc[li] - bot), t = clamp((z - bot) / th, 0, 1), s = l.seed, v;
    var n1 = fbm(x * 9, z * 9, s, 2), n2 = vn(x * lf(60), z * lf(60), s + 1), n0 = vn(x * 1.6, z * 3.5, s + 11);
    var bk = Math.floor((li + 7 * PX.ihash(li >> 5)) / 22), jv = 0.11 * (PX.ihash(bk * 7 + 3) - 0.5) * 2 + 0.035 * (PX.ihash(s * 7 + 3) - 0.5) * 2, jw = 0.06 * (PX.ihash(bk * 11 + 5) - 0.5) * 2;   // packages of beds share a tone (bold units), each bed its own slight shift   // each unit's own moisture/organic/iron content
    c = [c[0] * (1 + 0.1 * n1 + 0.09 * n0 + jv + jw), c[1] * (1 + 0.1 * n1 + 0.085 * n0 + jv), c[2] * (1 + 0.09 * n1 + 0.07 * n0 + jv - jw)];
    if (l.lith === 'silt' || l.lith === 'flood' || l.lith === 'loess' || l.lith === 'mud') { var sp3 = SC > 60 ? vn(x * lf(280), z * lf(280), s + 21) : 0; if (sp3 > 0.82) c = mix3(c, col('#2c2622'), 0.45); else if (sp3 < -0.86) c = mix3(c, col('#cfc6b4'), 0.35);
      if (depth < WT && depth > WT - 0.9) { var mo = fbm(x * 22, z * 22, s + 40, 2); if (mo > 0.3) c = mix3(c, RUST, clamp((mo - 0.3) * 1.2, 0, 0.4)); } }
    switch (l.lith) {
      case 'flood': case 'pond': v = 1 + 0.16 * (0.5 - t) + 0.05 * Math.sin((t * l.lam + 0.3 * fbm(x * 2, z * 4, s)) * 6.283); c = [c[0] * v, c[1] * v, c[2] * v * 0.99]; break;   // fining upward + laminae
      case 'sand': case 'gravel': { var ang = 0.35 * vn(Math.floor(x * 1.3), Math.floor(z * 6), s), lamv = Math.sin(((z + ang * x) * 160 + 2 * fbm(x * 3, z * 3, s)) * 1.0); v = 1 + 0.06 * lamv + 0.06 * n2; c = [c[0] * v, c[1] * v, c[2] * v];
        if (l.lith === 'gravel') { var gx = x * 11, gz = z * 14, cx = Math.floor(gx), cz = Math.floor(gz), best = 9, bh = 0;
          for (var a2 = -1; a2 <= 1; a2++) for (var b2 = -1; b2 <= 1; b2++) { var hh = PX.h2(cx + a2, cz + b2, s), px2 = cx + a2 + hh, pz2 = cz + b2 + PX.h2(cx + a2, cz + b2, s + 9), dd = (gx - px2) * (gx - px2) + (gz - pz2) * (gz - pz2) * 1.3; if (dd < best) { best = dd; bh = hh; } }
          if (best < 0.16 + 0.1 * bh) { var pc = bh < 0.3 ? col('#8d8b86') : bh < 0.6 ? col('#a08a6a') : col('#6f6a62'), sh = 1.12 - 1.6 * best + 0.1 * (gz - Math.floor(gz) - 0.5); c = [pc[0] * sh, pc[1] * sh, pc[2] * sh]; } else c = [c[0] * 0.85, c[1] * 0.85, c[2] * 0.85]; }
        break; }
      case 'loess': v = 1 + 0.03 * vn(x * 20, z * 8, s); c = [c[0] * v, c[1] * v, c[2] * v]; if (SC > 40 && vn(x * lf(130), z * lf(130), s + 7) > 0.86) c = mix3(c, col('#e6dfcf'), 0.5); break;   // carbonate nodules
      case 'charcoal': v = 0.75 + 0.6 * Math.max(0, vn(x * lf(140), z * lf(140), s)); c = [c[0] * v, c[1] * v, c[2] * v]; break;
      case 'shell': { var sv = vn(x * 55, z * 90, s); if (sv > 0.45) c = mix3(c, col('#e2dccf'), clamp((sv - 0.45) * 5, 0, 1)); break; }
      case 'plough': case 'cinders': case 'gravefill': case 'pitfill': { var fl = vn(x * lf(120), z * lf(120), s); if (fl > 0.62) c = mix3(c, fl > 0.8 ? col('#2a2420') : col('#b39a7a'), 0.6); v = 1 + 0.12 * fbm(x * 14, z * 14, s + 3, 2); c = [c[0] * v, c[1] * v, c[2] * v]; break; }
      case 'crust': v = 1.05 + 0.08 * t; c = [c[0] * v, c[1] * v, c[2] * v]; break;
    }
    if (l.tint === 1) { var dn = vn(x * lf(70), z * lf(70), s + 5); if (dn > 0.55) c = mix3(c, col('#3e3426'), 0.5); }   // trampled, dung
    // soils form downward from a land surface into whatever lies below it: dark A horizon, reddish-brown B below, root traces
    for (var jj = li; jj < L.length && jj < li + 80; jj++) { var Lj = L[jj]; if (jj > li && Zc[jj - 1] - z > 0.6) break; if (!(Lj.soil > 0)) continue;
      var ahj = 0.05 + 0.2 * Lj.soil, dd = Zc[jj] - z; if (dd < 0) continue;
      if (dd < ahj) { var w = 1 - dd / ahj; c = mix3(c, SOILC, w * (0.25 + 0.45 * Lj.soil)); }
      else if (dd < ahj * 2.4 && Lj.soil > 0.3) { var wb = 1 - Math.abs(dd - ahj * 1.7) / (ahj * 0.7); if (wb > 0) c = mix3(c, BTC, 0.25 * wb * Lj.soil); }
      var rt = SC > 25 ? rootTrace(x, dd, Lj.seed, ahj * 2.4) : 0; if (rt) c = mix3(c, rt > 0.7 ? col('#c9bea6') : RUST, rt > 0.7 ? 0.5 : 0.18);
      if (Lj.soil > 0.35 && dd < 0.7) { var kc = 0.3, kx = Math.floor(x / kc), kz = Math.floor(dd / kc), kh = PX.h2(kx, kz, Lj.seed + 3); if (kh < 0.22 * Lj.soil) { var kr = 0.035 + 0.035 * PX.h2(kx, kz, Lj.seed + 4), kcx = (kx + 0.2 + 0.6 * PX.h2(kx, kz, Lj.seed + 5)) * kc, kcz = (kz + 0.2 + 0.6 * PX.h2(kx, kz, Lj.seed + 6)) * kc, kdd = Math.hypot(x - kcx, (dd - kcz) * 1.25) / kr;
        if (kdd < 1) c = mix3(c, kh < 0.11 * Lj.soil ? SOILC : col('#cbb791'), 0.55 * (kdd > 0.85 ? 0.6 : 1)); } } }   // krotovinas: burrows back-filled from above or below
    var ab = li + 1 < L.length ? L[li + 1] : null; if (ab && ab.burn && Zc[li] - z < ab.burn) c = mix3(c, REDD, 0.55 * (1 - (Zc[li] - z) / ab.burn));
    // groundwater: gleyed (reduced, grey-blue) below the water table, rust mottles in the capillary fringe above it
    if (depth > WT) c = mix3(c, mix3(GLEY, c, 0.45), clamp((depth - WT) * 4, 0, l.lith === 'sand' || l.lith === 'gravel' ? 0.3 : 0.5));
    else if (depth > WT - 0.3) { var mt = vn(x * lf(35), z * lf(35), 77); if (mt > 0.35) c = mix3(c, RUST, 0.35 * (mt - 0.35) * 2 * (1 - (WT - depth) / 0.3)); }
    return c; }
  var ROUGH = { gravel: 1.6, sand: 0.8, loess: 0.5, charcoal: 0.6, plough: 0.9, cinders: 1.2, shell: 1.0 };

  /* ------------------------------------------------------------------ bedrock and face relief (metres, out of the face) */
  // Bedrock under the valley fill: thin-bedded shale with limestone beds, jointed (schematic, after the Ordovician
  // shale-limestone bedrock of the Ohio valley; not a measured section).
  var FACE = new Uint8Array(PW * PH), HF = new Float32Array(PW * PH), HB = new Float32Array(PW * PH);
  function zBed(x) { return colInterp(base0, x) - 0.15 * fbm(x * 0.15, 1, 501, 2); }
  function bedCell(x, z) { var zz = z + 0.004 * x + 0.03 * vn(x * 0.3, z * 2, 503), u = zz / 0.11, k = Math.floor(u); return [k, u - k]; }
  function bedLime(k) { return PX.ihash(k * 17 + 505) < 0.32; }
  function bedCol(x, z, zb) { var bc = bedCell(x, z), lime = bedLime(bc[0]), c, n = fbm(x * 6, z * 6, 507, 3);
    if (lime) { c = col('#a7a397'); var nod = vn(x * lf(18), z * lf(30), 509); c = [c[0] * (1 + 0.06 * n + 0.05 * nod), c[1] * (1 + 0.06 * n + 0.05 * nod), c[2] * (1 + 0.05 * n + 0.04 * nod)]; if (vn(x * lf(70), z * lf(70), 511) > 0.8) c = mix3(c, col('#d8d2c2'), 0.5); }   // fossil hash in the limestone
    else { c = mix3(col('#5d605c'), col('#6f6f66'), 0.5 + 0.5 * vn(x * 0.5, bc[0] * 3.1, 513)); var lam = Math.sin(z * Math.min(900, SC * 2.2) + 2 * vn(x * 2, z * 9, 515)); c = [c[0] * (1 + 0.04 * lam + 0.05 * n), c[1] * (1 + 0.04 * lam + 0.05 * n), c[2] * (1 + 0.035 * lam + 0.05 * n)]; }
    var jx = x / 1.7 + 0.15 * vn(z * 0.8, bc[0], 517), jd = Math.abs(jx - Math.round(jx)) * 1.7; if (jd < 0.012 && PX.h2(Math.round(jx), Math.floor(z / 0.6), 519) < 0.7) c = mix3(c, col('#6b5a46'), 0.6);   // joints, iron-stained
    var weath = clamp((z - zb + 0.6) / 0.6, 0, 1); return mix3(c, col('#8d7c62'), 0.45 * weath); }   // weathered top of the bedrock
  function bedRelief(x, z) { var bc = bedCell(x, z), lime = bedLime(bc[0]), h = lime ? 0.035 - 0.05 * Math.pow(Math.abs(bc[1] - 0.5) * 2, 4) : -0.012 + 0.003 * Math.sin(z * Math.min(900, SC * 2.2));
    var jx = x / 1.7 + 0.15 * vn(z * 0.8, bc[0], 517), jd = Math.abs(jx - Math.round(jx)) * 1.7; if (jd < 0.02) h -= 0.03 * (1 - jd / 0.02);
    return h + 0.006 * fbm(x * 9, z * 9, 521, 2); }
  var RELIEF = { gravel: 0.012, sand: -0.008, silt: 0, flood: 0.002, loess: 0.006, mud: 0.008, pond: 0.01, blackmat: 0.006, peat: -0.006, charcoal: -0.004, plough: -0.003, crust: 0.008, shell: 0.004, cinders: 0.0, gravefill: -0.004, pitfill: -0.004, made: 0.004 };
  function faceRelief(li, x, z, depth) {   // a trowel-cleaned face weathers a little: sand recedes, clays stand proud, clasts protrude, loess splits on vertical joints
    var l = L[li], h = RELIEF[l.lith] || 0, sd = l.seed, bot = li ? Zc[li - 1] : -99, t = clamp((z - bot) / Math.max(1e-4, Zc[li] - bot), 0, 1);
    h *= sstepE(0, 0.06, t) * sstepE(0, 0.06, 1 - t) * 0.6 + 0.4;   // contacts round off
    switch (l.lith) {
      case 'gravel': { var gx = x * 11, gz = z * 14, cx = Math.floor(gx), cz = Math.floor(gz), best = 9;
        for (var a2 = -1; a2 <= 1; a2++) for (var b2 = -1; b2 <= 1; b2++) { var px2 = cx + a2 + PX.h2(cx + a2, cz + b2, sd), pz2 = cz + b2 + PX.h2(cx + a2, cz + b2, sd + 9), dd = (gx - px2) * (gx - px2) + (gz - pz2) * (gz - pz2) * 1.3; if (dd < best) best = dd; }
        h += best < 0.2 ? 0.022 * Math.sqrt(1 - best / 0.2) : -0.006; break; }
      case 'sand': h += 0.002 * Math.sin(((z + 0.35 * vn(Math.floor(x * 1.3), Math.floor(z * 6), sd) * x) * Math.min(160, SC * 1.5))); break;
      case 'loess': { var jx = x / 0.9 + 0.2 * vn(z * 1.5, 3, sd), jd = Math.abs(jx - Math.round(jx)) * 0.9; if (jd < 0.015 && PX.h2(Math.round(jx), Math.floor(z / 0.5), sd) < 0.6) h -= 0.012 * (1 - jd / 0.015); break; }
      case 'mud': case 'pond': case 'blackmat': { var px3 = x / 0.07, pz3 = z / 0.05, fx = Math.abs(px3 + 0.4 * vn(pz3, 1, sd) - Math.round(px3 + 0.4 * vn(pz3, 1, sd))), fz = Math.abs(pz3 - Math.round(pz3));   // blocky peds
        if (SC > 60 && Math.min(fx, fz) < 0.06) h -= 0.003; break; }
      case 'flood': h += 0.0015 * Math.sin((t * l.lam) * 6.283); break;
    }
    if (l.soil > 0.3 && depth < 1.5) h -= 0.002 * Math.max(0, vn(x * lf(40), z * lf(40), sd + 77));   // crumb structure
    return h + 0.0025 * vn(x * lf(25), z * lf(25), 523) + 0.002 * vn(x * 2 + z * 6, z * 0.5, 525); }   // trowel scrape
  function sstepE(a, b, v) { var u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); }

  /* ------------------------------------------------------------------ paint: sky, far land, strata */
  var lipY = new Float32Array(PW), cold = NOW.era.climate === 'cold';
  var SKY0 = col(cold ? '#d7dbdf' : '#d8d3cb'), SKY1 = col(cold ? '#eef0ef' : '#efe9df'), HILL = col(NOW.era.veg === 'forest' ? '#9da196' : '#b4b0a5');
  var hillAmp = NOW.era.veg === 'forest' || NOW.era.veg === 'parkland' ? 0.22 : 0.06;
  for (var px = 0; px < PW; px++) {
    var x = wx(px + 0.5), zs = surfC(x), ly = sy(zs); lipY[px] = ly;
    for (j = 0; j < L.length; j++) Zc[j] = colInterp(L[j].top, x);
    var zBedX = zBed(x);
    var hillTop = sy(zRef) - SC * (0.12 + hillAmp * (0.5 + 0.5 * fbm(x * 0.6, 3, 41, 3)) + (NOW.era.veg === 'forest' ? 0.12 * Math.max(0, vn(x * 4, 1, 43)) : 0));
    for (var py = 0; py < PH; py++) {
      var idx = py * PW + px, yy = py + 0.5, cc;
      if (yy < ly) {   // air
        var u = yy / PH; cc = mix3(SKY0, SKY1, clamp(u * 3.2, 0, 1));
        if (yy > hillTop) cc = mix3(cc, HILL, 0.3 * clamp((yy - hillTop) / (0.05 * SC), 0, 1));
        RB[idx] = cc[0]; GB[idx] = cc[1]; BB[idx] = cc[2]; continue; }
      // ground: 3 vertical sub-samples, bioturbation displacement
      var r = 0, g = 0, b = 0;
      for (var ss = 0; ss < 2; ss++) {
        var z = wz(py + (ss + 0.5) / 2), depth = zs - z;
        var lk = findLayer(z), bio = lk >= 0 ? L[lk].bio : 0.3, zz = z + 0.028 * bio * fbm(x * 14, z * 14, 91, 2) + 0.005 * vn(x * 90, z * 90, 92);
        var fe = featureAt(x, z), li2;
        if (fe) { if (fe[0] === 'infill') { li2 = findLayer(fe[1]); cc = lithColor(li2 < 0 ? L.length - 1 : li2, x, fe[1] - 0.002, depth); cc = [cc[0] * 0.97, cc[1] * 0.97, cc[2] * 0.97]; }
          else if (fe[0] === 'sand') cc = mix3(LITH.sand, col('#c9b58c'), 0.4 + 0.2 * vn(x * 50, z * 50, 3));
          else { li2 = findLayer(z + 0.06 * fbm(x * 9, z * 9, 61, 2)); cc = lithColor(li2 < 0 ? L.length - 1 : li2, x, z, depth); cc = mix3(cc, LITH[fe[0]], 0.55); } }
        else if (z < zBedX) cc = bedCol(x, z, zBedX);
        else { li2 = findLayer(zz); if (li2 < 0) li2 = L.length - 1; cc = lithColor(li2, x, zz, depth); }
        r += cc[0]; g += cc[1]; b += cc[2];
      }
      r /= 2; g /= 2; b /= 2;
      // albedo only; light comes later from the relief heightfield (raking sun, soft shadows, AO)
      var zc2 = wz(yy), lk2 = findLayer(zc2), shade = 1 - 0.08 * clamp((yy - ly) / PH, 0, 1) + 0.04 * fbm(x * 0.6, zc2 * 0.9, 10, 2);   // damper toward the trench floor; broad moisture patches
      FACE[idx] = 1; HF[idx] = zc2 < zBedX ? bedRelief(x, zc2) : faceRelief(lk2 < 0 ? L.length - 1 : lk2, x, zc2, zs - zc2);
      RB[idx] = r * shade; GB[idx] = g * shade; BB[idx] = b * shade;
    }
  }

  /* ------------------------------------------------------------------ SDF painting helpers */
  function sdCap(x, y, a, b, ra, rb) { var bx = b[0] - a[0], by = b[1] - a[1], px2 = x - a[0], py2 = y - a[1], h = clamp((px2 * bx + py2 * by) / (bx * bx + by * by + 1e-9), 0, 1), dx = px2 - bx * h, dy = py2 - by * h; return Math.sqrt(dx * dx + dy * dy) - lerp(ra, rb, h); }
  function sdEll(x, y, c, rx, ry, rot) { var dx = x - c[0], dy = y - c[1], cs = Math.cos(-(rot || 0)), sn2 = Math.sin(-(rot || 0)), u = dx * cs - dy * sn2, v = dx * sn2 + dy * cs, k0 = Math.sqrt(u * u / (rx * rx) + v * v / (ry * ry)); return (k0 - 1) * Math.min(rx, ry); }
  function smin(a, b, k) { var h = clamp(0.5 + 0.5 * (b - a) / k, 0, 1); return lerp(b, a, h) - k * h * (1 - h); }
  function sdPrims(P, x, y, k) { var d = 1e9; for (var i = 0; i < P.length; i++) { var p = P[i], di = p.c ? sdEll(x, y, p.c, p.rx, p.ry, p.rot) : sdCap(x, y, p.a, p.b, p.ra, p.rb); d = k ? smin(d, di, k) : Math.min(d, di); } return d; }
  function blend(idx, c, al) { if (al <= 0) return; RB[idx] = lerp(RB[idx], c[0], al); GB[idx] = lerp(GB[idx], c[1], al); BB[idx] = lerp(BB[idx], c[2], al); }
  // paint a shape given in LOCAL coords (lx forward, ly up) placed at world (ox, oz) with scale/flip; fn(lx,ly)->[d, rgb] or null
  function paintLocal(ox, oz, ext, fn, opt) {
    opt = opt || {}; var fl = opt.flip ? -1 : 1, sq = opt.sq || 1, fade = opt.fade == null ? 0 : opt.fade, haze = opt.haze || null, clipAbove = opt.clip;
    var x0 = Math.max(0, Math.floor(sx(ox - ext[0]))), x1 = Math.min(PW - 1, Math.ceil(sx(ox + ext[0]))), y0 = Math.max(0, Math.floor(sy(oz + ext[1] * sq))), y1 = Math.min(PH - 1, Math.ceil(sy(oz - ext[2] * sq)));
    var aa = 0.9 / SC;
    for (var py = y0; py <= y1; py++) for (var px = x0; px <= x1; px++) {
      var x = wx(px + 0.5), z = wz(py + 0.5), lx = (x - ox) * fl, ly = (z - oz) / sq;
      if (clipAbove === 'below' && py + 0.5 < lipY[px]) continue; if (clipAbove === 'above' && py + 0.5 > lipY[px]) continue;
      var r = fn(lx, ly); if (!r) continue; var al = clamp(0.5 - r[0] / aa, 0, 1) * (r[2] == null ? 1 : r[2]); if (al <= 0) continue;
      var c = r[1]; if (haze) c = mix3(c, haze[0], haze[1]); blend(py * PW + px, c, al * (1 - fade)); } }

  /* ------------------------------------------------------------------ animal rigs (side view), standing / grazing / dead */
  // One side-profile skeleton/flesh model per species. Poses: stand, graze, mired (sunk upright in lick mud, as at mire and
  // sinkhole sites), sternal (collapsed on the belly, legs folded). After skeletonisation, bones above the burial level at
  // that moment lose support and fall onto it (rib cage collapse, disarticulation); bones held in the mud stay articulated.
  function rig(sp, Lx, pose, st) {
    st = st || {}; var s = SPEC[sp] || SPEC.deer, fl = [], bn = [], k, bloat = st.bloat || 0, flesh = st.flesh == null ? 1 : st.flesh;
    var prob = !!s.trunk, ry = s.d * Lx * 0.5, yb = s.h * Lx - ry * 0.8, legL = yb - ry * 0.35, hip = [-0.3 * Lx, yb + ry * 0.35], sho = [0.24 * Lx, yb + ry * 0.55];
    var drop = 0, headDown = pose === 'graze' ? 1 : pose === 'mired' ? 0.9 : pose === 'sternal' ? 0.55 : 0, sunk = pose === 'mired' ? (st.sink || 0) : 0;
    if (pose === 'sternal') drop = legL * 0.82;
    if (sp === 'human') return crouched(Lx, flesh);
    var sq = pose === 'stand' || pose === 'graze' ? 1 : 0.4 + 0.6 * Math.pow(Math.max(0, flesh), 0.6), swell = 1 + 0.22 * bloat;
    function P(x, y) { return [x, y - drop - sunk]; }
    var tc = P(0, yb - ry * (1 - sq) * 0.6);
    // flesh
    fl.push({ c: tc, rx: 0.42 * Lx * (0.94 + 0.06 * swell), ry: ry * sq * swell, rot: prob ? -0.08 : 0 });
    if (s.hump) fl.push({ c: P(0.18 * Lx, yb + ry * 0.35 * sq), rx: 0.2 * Lx, ry: (s.hump * Lx + ry * 0.45) * sq, rot: -0.25 });
    var nb = P(0.33 * Lx, yb + ry * 0.4 * sq), hcx = prob ? 0.45 * Lx : 0.36 * Lx + s.nk * Lx * (0.75 - 0.2 * headDown) + s.hd * Lx * 0.2;
    var hcy = prob ? yb + ry * 0.7 - headDown * 0.1 * Lx : yb + ry * 0.5 + s.nk * Lx * 0.7 - headDown * (yb + ry * 0.4 + s.nk * Lx * 0.7 - s.hr * Lx * 1.1);
    var hc = P(hcx, hcy); if (pose === 'sternal') hc[1] = Math.max(hc[1], s.hr * Lx * 0.9);
    fl.push({ a: nb, b: hc, ra: ry * 0.62 * sq, rb: s.hr * Lx * 0.85, head: 1 });
    fl.push({ c: hc, rx: prob ? 0.13 * Lx : s.hd * Lx * 0.55, ry: prob ? 0.17 * Lx : s.hr * Lx, rot: prob ? -0.3 : -0.45 - 0.6 * headDown, head: 1 });
    var tz = [];
    if (prob) { var t0 = [hc[0] + 0.07 * Lx, hc[1] - 0.08 * Lx], gy = -sunk + 0.02, t1 = [t0[0] + 0.05 * Lx, Math.max(gy, t0[1] - s.trunk * Lx * 0.45)], t2 = [t1[0] + 0.02 * Lx, Math.max(gy, t1[1] - s.trunk * Lx * 0.45)], t3 = [t2[0] + 0.05 * Lx, Math.max(gy, t2[1] + 0.03 * Lx)];
      fl.push({ a: t0, b: t1, ra: 0.05 * Lx, rb: 0.035 * Lx, trunk: 1 }, { a: t1, b: t2, ra: 0.035 * Lx, rb: 0.022 * Lx, trunk: 1 }, { a: t2, b: t3, ra: 0.022 * Lx, rb: 0.014 * Lx, trunk: 1 });
      fl.push({ c: [hc[0] - 0.06 * Lx, hc[1] + 0.01 * Lx], rx: 0.04 * Lx, ry: 0.055 * Lx, ear: 1 });
      var tl = s.tusk * Lx, up = [hc[0] + 0.06 * Lx, hc[1] - 0.07 * Lx], th0 = -1.25, nT = 9;   // tusk: a spiral that leaves the head downward, sweeps forward and curls up
      for (k = 0; k < nT; k++) { var thA = th0 + 2.7 * k / nT, thB = th0 + 2.7 * (k + 1) / nT, sl = tl / nT * (1 - 0.25 * k / nT), uq = [up[0] + Math.cos((thA + thB) / 2) * sl, up[1] + Math.sin((thA + thB) / 2) * sl]; tz.push({ a: up, b: uq, ra: 0.034 * Lx * (1 - 0.8 * k / nT), rb: 0.034 * Lx * (1 - 0.8 * (k + 1) / nT), ivory: 1 }); up = uq; } }
    if (s.horn) tz.push({ a: [hc[0] - 0.03 * Lx, hc[1] + s.hr * Lx * 0.7], b: [hc[0] - 0.07 * Lx, hc[1] + s.hr * Lx * 0.7 + s.horn * Lx], ra: 0.014 * Lx, rb: 0.004 * Lx, ivory: 2 });
    if (s.antler) { var ab = [hc[0] - 0.03 * Lx, hc[1] + s.hr * Lx]; for (k = 0; k < 3; k++) tz.push({ a: ab, b: [ab[0] - (0.06 + k * 0.05) * Lx, ab[1] + (0.1 + k * 0.06) * Lx], ra: 0.008 * Lx, rb: 0.003 * Lx, ivory: 2 }); }
    tz.forEach(function (t) { fl.push(t); });
    if (s.tail) fl.push({ a: P(-0.41 * Lx, yb + ry * 0.4 * sq), b: P(-0.45 * Lx, yb - s.tail * Lx * 0.9), ra: 0.018 * Lx, rb: 0.007 * Lx });
    var legs = [];
    [[0.24, 0, 0.02], [-0.28, 0, -0.04], [0.29, 1, 0.02], [-0.23, 1, -0.04]].forEach(function (q) { var lx = q[0] * Lx + (q[1] ? 0.03 * Lx : 0), top = P(lx, yb - ry * 0.25), knee, foot;
      if (pose === 'sternal') { knee = P(lx + (q[0] > 0 ? 0.08 : -0.1) * Lx, drop - legL * 0.0 + 0.04 * Lx); knee[1] = s.lg * Lx; foot = [knee[0] + (q[0] > 0 ? -0.12 : 0.12) * Lx, s.lg * Lx * 0.6]; }
      else { knee = P(lx + q[2] * Lx, legL * 0.48); foot = P(lx + q[2] * Lx * 0.4, 0.012 * Lx); }
      fl.push({ a: top, b: knee, ra: s.lg * Lx * 1.25, rb: s.lg * Lx * 0.85, far: q[1], leg: 1 }, { a: knee, b: foot, ra: s.lg * Lx * 0.85, rb: s.lg * Lx * 0.65, far: q[1], leg: 1 });
      legs.push([top, knee, foot, q[1]]); });
    // skeleton (same frame)
    var spine = [], nV = 20;
    for (k = 0; k <= nV; k++) { var u = k / nV, vx = lerp(-0.4 * Lx, 0.3 * Lx, u), vy = yb + ry * (0.45 + 0.35 * Math.sin(u * 2.6) + (prob ? 0.25 * u * u : 0)); spine.push(P(vx, vy)); }
    spine.forEach(function (p, i) { bn.push({ c: p, rx: 0.013 * Lx, ry: 0.016 * Lx }); var u = i / nV, spl = (prob || s.hump ? 0.02 + 0.09 * Math.max(0, u - 0.55) * (s.hump ? 3 : 1.6) : 0.03) * Lx; bn.push({ a: p, b: [p[0] - 0.01 * Lx, p[1] + spl], ra: 0.006 * Lx, rb: 0.004 * Lx }); });
    var nR = prob ? 14 : 12;
    for (k = 0; k < nR; k++) { var u2 = 0.38 + 0.52 * k / (nR - 1), sp0 = spine[Math.round(u2 * nV)], belly = (yb - ry * 0.85) - drop - sunk, len = sp0[1] - belly, mid = [sp0[0] + 0.035 * Lx, sp0[1] - len * 0.45], end = [sp0[0] + 0.005 * Lx, belly + len * 0.1];
      bn.push({ a: sp0, b: mid, ra: 0.009 * Lx, rb: 0.008 * Lx, rib: 1 }, { a: mid, b: end, ra: 0.008 * Lx, rb: 0.005 * Lx, rib: 1 }); }
    var hp = P(hip[0], hip[1]), sh = P(sho[0], sho[1]);
    bn.push({ c: hp, rx: 0.08 * Lx, ry: 0.07 * Lx, rot: 0.5 }, { c: [hp[0] + 0.01 * Lx, hp[1] - 0.02 * Lx], rx: 0.025 * Lx, ry: 0.022 * Lx, hole: 1 }, { c: [sh[0], sh[1] - 0.04 * Lx], rx: 0.05 * Lx, ry: 0.1 * Lx, rot: -0.35 });
    legs.forEach(function (g) { bn.push({ a: g[0], b: g[1], ra: s.lg * Lx * 0.42, rb: s.lg * Lx * 0.32, far: g[3] }, { c: g[1], rx: s.lg * Lx * 0.42, ry: s.lg * Lx * 0.36, far: g[3] }, { a: g[1], b: g[2], ra: s.lg * Lx * 0.32, rb: s.lg * Lx * 0.26, far: g[3] }, { c: g[2], rx: s.lg * Lx * 0.5, ry: s.lg * Lx * 0.22, far: g[3] }); });
    if (prob) { bn.push({ c: [hc[0] - 0.01 * Lx, hc[1] + 0.02 * Lx], rx: 0.1 * Lx, ry: 0.125 * Lx, rot: -0.35, skull: 1 }, { a: [hc[0] + 0.02 * Lx, hc[1] - 0.02 * Lx], b: [hc[0] + 0.08 * Lx, hc[1] - 0.12 * Lx], ra: 0.055 * Lx, rb: 0.04 * Lx, skull: 1 },
      { c: [hc[0] + 0.03 * Lx, hc[1] + 0.03 * Lx], rx: 0.02 * Lx, ry: 0.018 * Lx, hole: 1 }, { c: [hc[0] - 0.05 * Lx, hc[1] - 0.1 * Lx], rx: 0.065 * Lx, ry: 0.032 * Lx, rot: 0.15, jaw: 1 }); }
    else { bn.push({ c: hc, rx: s.hd * Lx * 0.5, ry: s.hr * Lx * 0.72, rot: -0.45 - 0.6 * headDown, skull: 1 }, { c: [hc[0] - s.hd * Lx * 0.1, hc[1] + s.hr * Lx * 0.2], rx: s.hr * Lx * 0.24, ry: s.hr * Lx * 0.2, hole: 1 }); }
    tz.forEach(function (t) { bn.push({ a: t.a, b: t.b, ra: t.ra, rb: t.rb, ivory: t.ivory }); });
    if (s.tail) for (k = 0; k < 5; k++) bn.push({ c: P(-0.42 * Lx - k * 0.012 * Lx, yb + ry * 0.3 - k * s.tail * Lx * 0.15), rx: 0.008 * Lx, ry: 0.007 * Lx });
    // collapse: bones above the support level fall onto it
    if (st.support != null) { var Rc = hrng('fall:' + st.seed), sup = st.support, fall = clamp(st.collapse == null ? 1 : st.collapse, 0, 1);
      fl.forEach(function (f2) { var pts = f2.c ? [f2.c] : [f2.a, f2.b], ff = lerp(1, 0.3, fall); pts.forEach(function (p) { if (p[1] > sup) p[1] = sup + (p[1] - sup) * ff; }); if (f2.c && f2.c[1] > sup) f2.ry *= lerp(1, 0.55, fall); });
      bn.forEach(function (b2) { var pts = b2.c ? [b2.c] : [b2.a, b2.b], hi = Math.max.apply(null, pts.map(function (p) { return p[1]; })); if (hi <= sup + 0.01) return;
        var dx = Rc.gauss(0, 0.06 * Lx) * fall, ff = lerp(1, 0.08 + 0.12 * Rc.r(), fall);
        pts.forEach(function (p) { if (p[1] > sup) { p[1] = sup + (p[1] - sup) * ff + 0.01 * Lx * Rc.r(); p[0] += dx; } }); }); }
    var top2 = Math.max(s.h * Lx, hc[1] + 0.25 * Lx);
    return { flesh: fl, bones: bn, ext: [0.85 * Lx, top2 + 0.05 * Lx, sunk + 0.1 * Lx] };
  }
  function crouched(Lx, flesh) {
    var fl = [], bn = [], k, sqz = 0.35 + 0.65 * Math.pow(Math.max(0, flesh), 0.7);
    fl.push({ c: [0, 0.16 * Lx], rx: 0.3 * Lx, ry: 0.14 * Lx * sqz, rot: 0.3 }, { c: [0.3 * Lx, 0.24 * Lx], rx: 0.1 * Lx, ry: 0.09 * Lx, head: 1 }, { a: [-0.2 * Lx, 0.12 * Lx], b: [0.1 * Lx, 0.05 * Lx], ra: 0.07 * Lx * sqz, rb: 0.05 * Lx * sqz }, { a: [0.1 * Lx, 0.05 * Lx], b: [-0.1 * Lx, 0.02 * Lx], ra: 0.05 * Lx * sqz, rb: 0.04 * Lx * sqz });
    bn.push({ c: [0.3 * Lx, 0.24 * Lx], rx: 0.085 * Lx, ry: 0.075 * Lx, skull: 1 }, { c: [0.32 * Lx, 0.25 * Lx], rx: 0.018 * Lx, ry: 0.016 * Lx, hole: 1 });
    for (k = 0; k < 9; k++) bn.push({ c: [-0.22 * Lx + k * 0.055 * Lx, 0.18 * Lx + 0.06 * Lx * Math.sin(k * 0.35)], rx: 0.016 * Lx, ry: 0.014 * Lx });
    for (k = 0; k < 6; k++) bn.push({ a: [-0.1 * Lx + k * 0.045 * Lx, 0.2 * Lx], b: [-0.06 * Lx + k * 0.045 * Lx, 0.07 * Lx], ra: 0.008 * Lx, rb: 0.006 * Lx, rib: 1 });
    bn.push({ c: [-0.22 * Lx, 0.12 * Lx], rx: 0.07 * Lx, ry: 0.055 * Lx }, { a: [-0.2 * Lx, 0.1 * Lx], b: [0.12 * Lx, 0.06 * Lx], ra: 0.016 * Lx, rb: 0.013 * Lx }, { a: [0.12 * Lx, 0.06 * Lx], b: [-0.12 * Lx, 0.025 * Lx], ra: 0.013 * Lx, rb: 0.011 * Lx },
      { a: [0.2 * Lx, 0.2 * Lx], b: [0.24 * Lx, 0.1 * Lx], ra: 0.011 * Lx, rb: 0.009 * Lx }, { a: [0.24 * Lx, 0.1 * Lx], b: [0.36 * Lx, 0.14 * Lx], ra: 0.009 * Lx, rb: 0.008 * Lx });
    return { flesh: fl, bones: bn, ext: [0.55 * Lx, 0.5 * Lx, 0.05 * Lx] };
  }

  /* ------------------------------------------------------------------ drawing remains and objects */
  var BONE0 = col('#cfc1a2'), BONE1 = col('#9c7b55'), FOSS1 = col('#6e4a2c'), FOSS2 = col('#3b2a1d'), IVORY = col('#e9dcc0');
  function boneCol(a, isIvory) { var c = mix3(isIvory === 1 ? IVORY : BONE0, BONE1, a.stain || 0); if (a.fossil === 1) c = mix3(c, FOSS1, 0.85); if (a.fossil === 2) c = mix3(c, FOSS2, 0.9);
    if (a.wstage >= 2 && !a.fossil) c = mix3(c, col('#d9d2c2'), 0.25); return c; }
  function darkenHalo(cx, cz, rx, rz, amt, ker) {   // organic stain in the sediment (cadaver decomposition island), seeping down
    var x0 = Math.max(0, Math.floor(sx(cx - rx * 1.4))), x1 = Math.min(PW - 1, Math.ceil(sx(cx + rx * 1.4))), y0 = Math.max(0, Math.floor(sy(cz + rz))), y1 = Math.min(PH - 1, Math.ceil(sy(cz - rz * 2.6)));
    var tgt = ker ? col('#16120f') : col('#2f271f');
    for (var py = y0; py <= y1; py++) for (var px = x0; px <= x1; px++) { if (py < lipY[px]) continue; var x = wx(px + 0.5), z = wz(py + 0.5), u = (x - cx) / rx, v = (z - cz) / (z < cz ? rz * 2.4 : rz);
      var d = Math.sqrt(u * u + v * v) + 0.25 * fbm(x * 10, z * 10, 333, 2), w = clamp(1.1 - d, 0, 1); if (w <= 0) continue; blend(py * PW + px, tgt, Math.min(0.45, amt) * w * w * 0.35);
      if (ker > 0.5 && SC > 60 && vn(x * lf(160), z * lf(160), 444) > 0.86) blend(py * PW + px, col('#5a5650'), 0.5); } }   // bitumen glints (compressed clock)
  function drawCarcass(a, pose, ox, oz, Lm, opt) {
    opt = opt || {}; var st = { bloat: a.bloat || 0, flesh: a.flesh == null ? 1 : a.flesh, collapse: clamp(((a.Dk || 0) / Math.sqrt(Lm / 2) - 0.25) / 0.8, 0, 1), sink: a.sink || 0, support: a.support, seed: a.seed };
    if (pose === 'dead') pose = a.pose || 'sternal';
    var R2 = rig(a.sp, Lm, pose, st), s = SPEC[a.sp] || SPEC.deer, hide = col(s.hide), wet = a.stage === 2 || a.stage === 3, sq = opt.sq || 1, hk = 0.025 * Lm;
    var showBones = pose !== 'stand' && pose !== 'graze' && st.flesh < 0.7, boneAl = clamp((0.7 - st.flesh) / 0.35, 0, 1), RND = hrng('bones:' + a.seed);
    var missing = (a.wstage || 0) >= 4 ? 0.45 : (a.wstage || 0) >= 3 ? 0.15 : 0, jit = R2.bones.map(function () { return [RND.gauss(0, 1), RND.gauss(0, 1), RND.r() < missing]; });
    var dis = (pose !== 'stand' && pose !== 'graze') ? 0.012 * Lm * clamp(Math.log(1 + (a.Dk || 0)) / 2, 0, 1) + 0.03 * Lm * clamp((a.wstage || 0) / 5, 0, 1) : 0;
    var FB0 = R2.flesh.filter(function (p) { return !p.ivory; });
    function fleshD(lx, ly) { var d = 1e9; for (var i = 0; i < FB0.length; i++) { var p = FB0[i], di = p.c ? sdEll(lx, ly, p.c, p.rx, p.ry, p.rot) : sdCap(lx, ly, p.a, p.b, p.ra, p.rb); d = (p.head || p.trunk || p.leg || p.ear) ? Math.min(d, di) : smin(d, di, 0.05 * Lm); } return d; }
    function holeAt(lx, ly, part) { if (part && (part.leg || part.trunk)) return false; return fbm(lx * 7 / Lm, ly * 7 / Lm, 31, 3) > 1.6 * st.flesh - 0.55; }
    if (pose !== 'stand' && pose !== 'graze' && st.flesh > 0.06) {
      var fleshC = wet ? mix3(hide, col('#2c241d'), 0.55) : hide;
      var FB = R2.flesh.filter(function (p) { return !p.ivory; }), FI = R2.flesh.filter(function (p) { return p.ivory; });
      paintLocal(ox, oz, R2.ext, function (lx, ly) { var d = 1e9, part = null;
        for (var i = 0; i < FB.length; i++) { var p = FB[i], di = p.c ? sdEll(lx, ly, p.c, p.rx, p.ry, p.rot) : sdCap(lx, ly, p.a, p.b, p.ra, p.rb); if (di < d && di < 0.004 * Lm) part = p; d = (p.head || p.trunk || p.leg || p.ear) ? Math.min(d, di) : smin(d, di, 0.05 * Lm); }
        var di2 = 1e9; for (i = 0; i < FI.length; i++) { var q = FI[i]; di2 = Math.min(di2, sdCap(lx, ly, q.a, q.b, q.ra, q.rb)); }
        if (di2 < 0.003 * Lm && di2 < d + 0.01 * Lm) { var iv = mix3(IVORY, col('#b49a72'), 0.3 + 0.3 * clamp(ly / Lm, 0, 1)), shv = 0.8 + 0.35 * clamp(-di2 / (0.02 * Lm), 0, 1); return [di2, [iv[0] * shv, iv[1] * shv, iv[2] * shv]]; }
        if (d > 0.06 * Lm) return null;
        var hol = holeAt(lx, ly, part);
        if (hol && d < 0) return [d, mix3(col('#21180f'), fleshC, 0.25)];
        if (s.hair) d += 0.012 * Lm * s.hair * vn(lx * 60 / Lm, ly * 60 / Lm, 5) * (wet ? 0.3 : 1) * (part && part.trunk ? 0.2 : 1);
        var ins = clamp(-d / (0.12 * Lm), 0, 1), sh = 0.62 + 0.5 * ins * (0.55 + 0.45 * clamp(ly / (0.35 * Lm), 0, 1)) + 0.08 * vn(lx * 25 / Lm, ly * 25 / Lm, 8), c = [fleshC[0] * sh, fleshC[1] * sh, fleshC[2] * sh];
        if (part && part.ear) c = [c[0] * 0.75, c[1] * 0.75, c[2] * 0.75];
        if (s.hair && part && !part.leg && !part.head && !part.trunk && d > -0.06 * Lm && Math.abs(Math.sin(lx * 260 / Lm + 3 * vn(lx * 20 / Lm, 1, 2))) < 0.18) c = [c[0] * 0.8, c[1] * 0.8, c[2] * 0.8];
        if (wet) c = mix3(c, col('#6a645c'), 0.12 * clamp(ly / (0.5 * Lm), 0, 1));    // wet sheen
        return [d, c, st.flesh < 0.3 ? clamp(st.flesh / 0.3, 0.35, 1) : 1]; }, { flip: a.flip, sq: sq });
    }
    if (pose === 'stand' || pose === 'graze') {   // living animal, used for the distant herd
      paintLocal(ox, oz, R2.ext, function (lx, ly) { var d = 1e9, far = 0, iv = 0;
        for (var i = 0; i < R2.flesh.length; i++) { var p = R2.flesh[i], di = p.c ? sdEll(lx, ly, p.c, p.rx, p.ry, p.rot) : sdCap(lx, ly, p.a, p.b, p.ra, p.rb); if (di < d) { if (di < 0 || d > 0) { far = p.far; iv = p.ivory; } } d = smin(d, di, p.ivory ? 0.001 : hk); }
        if (s.hair) d += 0.01 * Lm * s.hair * vn(lx * 50 / Lm, ly * 50 / Lm, 5);
        var c = iv === 1 ? IVORY : iv === 2 ? col('#4a4038') : hide, sh = far ? 0.8 : 1 + 0.12 * clamp(ly / Lm, 0, 1); return [d, [c[0] * sh, c[1] * sh, c[2] * sh]]; }, opt);
      return; }
    if (showBones) {
      paintLocal(ox, oz, R2.ext, function (lx, ly) { var best = 1e9, bi = -1;
        for (var i = 0; i < R2.bones.length; i++) { if (jit[i][2] || R2.bones[i].hole) continue; var p = R2.bones[i], jx = jit[i][0] * dis, jy = jit[i][1] * dis * 0.4, di = p.c ? sdEll(lx - jx, ly - jy, p.c, p.rx, p.ry, p.rot) : sdCap(lx - jx, ly - jy, p.a, p.b, p.ra, p.rb); if (di < best) { best = di; bi = i; } }
        if (bi < 0 || best > 0.02 * Lm) return null; var p2 = R2.bones[bi]; if (p2.hole) return null;
        if (st.flesh > 0.06 && fleshD(lx, ly) < 0 && !holeAt(lx, ly, null)) return null;   // still covered by hide
        for (var hI = 0; hI < R2.bones.length; hI++) { var ph = R2.bones[hI]; if (ph.hole && !jit[hI][2] && sdEll(lx - jit[hI][0] * dis, ly - jit[hI][1] * dis * 0.4, ph.c, ph.rx, ph.ry, 0) < 0) return [best, mix3(boneCol(a, 0), col('#2a2119'), 0.75), boneAl]; }
        var gr = 0.86 + 0.14 * fbm(lx * 30 / Lm, ly * 30 / Lm, 19, 2) - 0.12 * clamp(-ly / (0.3 * Lm), 0, 1), c = boneCol(a, p2.ivory); c = [c[0] * gr, c[1] * gr, c[2] * gr]; var th = p2.c ? Math.min(p2.rx, p2.ry) : p2.ra, sh = 0.78 + 0.32 * clamp(-best / Math.max(th, 1e-4), 0, 1) - (p2.far ? 0.12 : 0);
        if ((a.wstage || 0) >= 1 && vn(lx * 220 / Lm, ly * 40 / Lm, 17) > 0.62) sh *= 0.7;   // weathering cracks
        if (p2.skull && best < -th * 0.5 && vn(lx * 40 / Lm, ly * 40 / Lm, 3) > 0.3) sh *= 0.75;
        return [best, [c[0] * sh, c[1] * sh, c[2] * sh], boneAl]; }, { flip: a.flip, sq: sq });
    }
  }
  /* ------------------------------------------------------------------ fauna: anatomy from src/fauna.js, decay, settling */
  function pbb(P) { var b = [1e9, -1e9, 1e9, -1e9]; for (var i = 0; i < P.length; i++) { var p = P[i]; if (p[0] < b[0]) b[0] = p[0]; if (p[0] > b[1]) b[1] = p[0]; if (p[1] < b[2]) b[2] = p[1]; if (p[1] > b[3]) b[3] = p[1]; } return b; }
  function sdPoly(P, bb, x, y) {
    var ox = Math.max(bb[0] - x, 0, x - bb[1]), oy = Math.max(bb[2] - y, 0, y - bb[3]); if (ox + oy > 0) { var dbx = Math.sqrt(ox * ox + oy * oy); if (dbx > 0.03) return dbx; }
    var d = 1e18, sgn = false, n = P.length;
    for (var i = 0, j = n - 1; i < n; j = i++) { var ax = P[j][0], ay = P[j][1], ex = P[i][0] - ax, ey = P[i][1] - ay, wx2 = x - ax, wy2 = y - ay, t = (wx2 * ex + wy2 * ey) / (ex * ex + ey * ey || 1e-12); t = t < 0 ? 0 : t > 1 ? 1 : t;
      var qx = wx2 - ex * t, qy = wy2 - ey * t, dd = qx * qx + qy * qy; if (dd < d) d = dd; if ((ay > y) !== (P[i][1] > y) && x < ax + (y - ay) * ex / ey) sgn = !sgn; }
    return sgn ? -Math.sqrt(d) : Math.sqrt(d); }
  function fillLocal(ox, oz, bb, flip, sq, fn, opt) {   // bb local [x0,x1,y0,y1]; fn(lx,ly) -> [sd, colour, alpha]
    opt = opt || {}; var fl = flip ? -1 : 1, haze = opt.haze, clip = opt.clip, xa = ox + (fl > 0 ? bb[0] : -bb[1]), xb = ox + (fl > 0 ? bb[1] : -bb[0]);
    var x0 = Math.max(0, Math.floor(sx(xa))), x1 = Math.min(PW - 1, Math.ceil(sx(xb))), y0 = Math.max(0, Math.floor(sy(oz + bb[3] * sq))), y1 = Math.min(PH - 1, Math.ceil(sy(oz + bb[2] * sq))), aa = 0.8 / SC;
    for (var py = y0; py <= y1; py++) for (var px = x0; px <= x1; px++) {
      if (clip === 'above' && py + 0.5 > lipY[px]) continue;
      var lx = (wx(px + 0.5) - ox) * fl, ly = (wz(py + 0.5) - oz) / sq, r = fn(lx, ly); if (!r) continue;
      var al = clamp(0.5 - r[0] / aa, 0, 1) * (r[2] == null ? 1 : r[2]); if (al <= 0) continue; var c = r[1]; if (haze) c = mix3(c, haze[0], haze[1]); blend(py * PW + px, c, al);
      if (opt.relief) { var hv = opt.relief * Math.sqrt(clamp(-r[0] / opt.rw, 0, 1)) * al; if (hv > HB[py * PW + px]) HB[py * PW + px] = hv; } } }
  function moveP(P, f) { for (var i = 0; i < P.length; i++) P[i] = f(P[i]); }
  function drawFauna(a, pose, ox, oz, L, opt) {
    opt = opt || {}; var living = pose === 'stand' || pose === 'graze', sq = opt.sq || 1, flip = opt.flip != null ? opt.flip : a.flip;
    var t = living ? 0 : Math.max(a.t || 0, a.fossil ? 2.5 : 0), RND = hrng('fa:' + a.seed), s = FAUNA.spec(a.sp), Rg = FAUNA.rig(a.sp, L, living ? pose : (a.pose || 'sternal'), { sink: a.sink || 0 }), dyR = Rg.dy;
    var bloat = living ? 0 : PX.sstep(0, 0.05, t) * (1 - PX.sstep(0.085, 0.14, t)), collapse = living ? 0 : PX.sstep(0.09, 0.55, t);
    var split = living ? 0 : PX.sstep(0.06, 0.2, t), hairLoss = living ? 0 : PX.sstep(0.05, 0.35, t), holeAmt = living ? 0 : PX.sstep(0.1, 1.0, t), hideLeft = living ? 1 : 1 - PX.sstep(0.45, 1.35, t);
    var expo = a.expo == null ? 1 : a.expo, sup = a.supp1 != null ? a.supp1 : a.support != null ? a.support : Math.max(0, Math.min(a.dep || 0, 0.3));
    var F = FAUNA.flesh(Rg, { bloat: bloat }), parts = F.parts, B = living ? [] : FAUNA.skeleton(Rg), i, k;
    function off(p) { return [p[0], p[1] + dyR]; }
    parts.forEach(function (q) { moveP(q.poly, off); }); F.ext.forEach(function (q) { moveP(q.poly, off); }); B.forEach(function (b) { moveP(b.poly, off); if (b.holes) b.holes = b.holes.map(function (h) { return [off(h[0]), h[1], h[2], h[3]]; }); });
    if (!living && a.pose === 'mired') { var pivM = [0.55 * L, -(a.sink || 0)], angM = -0.06 - 0.05 * RND.r(); parts.forEach(function (q) { moveP(q.poly, function (p) { return FAUNA.rot(p, pivM, angM); }); }); F.ext.forEach(function (q) { moveP(q.poly, function (p) { return FAUNA.rot(p, pivM, angM); }); }); B.forEach(function (b) { moveP(b.poly, function (p) { return FAUNA.rot(p, pivM, angM); }); if (b.holes) b.holes = b.holes.map(function (h) { return [FAUNA.rot(h[0], pivM, angM), h[1], h[2], h[3]]; }); }); }   // died slumped forward into the mud
    var ys = sup;   // local height of the burial surface the remains slump onto
    if (collapse > 0) { var fc = 1 - 0.5 * collapse, sag = function (p) { return p[1] > ys ? [p[0], ys + (p[1] - ys) * fc] : p; };
      parts.forEach(function (q) { if (q.tag !== 'leg' || a.pose !== 'mired') moveP(q.poly, sag); }); F.ext.forEach(function (q) { moveP(q.poly, sag); });
      var fb = fc; B.forEach(function (b) { var lim = /^(fore|ford|forep|hind|hindd|hindp)$/.test(b.group); if (lim && a.pose === 'mired' && pbb(b.poly)[2] < ys - 0.02 * L) return;
        if (b.group === 'skull' || b.group === 'jaw' || b.ivory) { var cb = pbb(b.poly), cy = (cb[2] + cb[3]) / 2, ddy = cy > ys ? (ys + (cy - ys) * fb) - cy : 0; moveP(b.poly, function (p) { return [p[0], p[1] + ddy]; }); if (b.holes) b.holes = b.holes.map(function (h) { return [[h[0][0], h[0][1] + ddy], h[1], h[2], h[3]]; }); return; }
        moveP(b.poly, function (p) { return p[1] > ys ? [p[0], ys + (p[1] - ys) * fb] : p; }); if (b.holes) b.holes = b.holes.map(function (h) { return [[h[0][0], h[0][1] > ys ? ys + (h[0][1] - ys) * fb : h[0][1]], h[1], h[2] * fb, h[3]]; }); }); }
    // settling: each anatomical unit lets go in order (fauna.js DIS), drifts (more if exposed) and comes to rest lying flat on the surface
    if (B.length && t > 0.5) { var units = {}; B.forEach(function (b) { (units[b.unit] = units[b.unit] || []).push(b); });
      Object.keys(units).forEach(function (u) { var bs = units[u], g = bs[0].group, thr = (FAUNA.DIS[g] || 1) + RND.range(-0.08, 0.12), sv = PX.sstep(thr, thr + 0.35, t); if (sv <= 0) return;
        var all = []; bs.forEach(function (b) { all = all.concat(b.poly); }); var bb0 = pbb(all); if (bb0[2] < ys - 0.03 * L) return;   // held in the mud: stays articulated
        var piv = [(bb0[0] + bb0[1]) / 2, (bb0[2] + bb0[3]) / 2], ax = bs[0].ax, th = RND.range(-0.3, 0.3);
        if (ax) { var an = Math.atan2(ax[1][1] - ax[0][1], ax[1][0] - ax[0][0]), lenA = Math.hypot(ax[1][0] - ax[0][0], ax[1][1] - ax[0][1]); if (lenA > 2.5 * ax[2]) { var tgt = Math.abs(an) < Math.PI / 2 ? 0 : (an > 0 ? Math.PI : -Math.PI); th = tgt - an + RND.range(-0.18, 0.18); } }
        var drift = RND.gauss(0, 1) * L * (0.04 + 0.22 * expo) * (g === 'fore' || g === 'ford' || g === 'hind' || g === 'hindd' ? 1.6 : 1), my = 1e9;
        bs.forEach(function (b) { b.poly.forEach(function (p) { my = Math.min(my, FAUNA.rot(p, piv, th)[1]); }); });
        var dz = ys + RND.r() * 0.012 * L - my;
        bs.forEach(function (b) { moveP(b.poly, function (p) { var r = FAUNA.rot(p, piv, th * sv); return [r[0] + drift * sv, r[1] + dz * sv]; });
          if (b.holes) b.holes = b.holes.map(function (h) { var r = FAUNA.rot(h[0], piv, th * sv); return [[r[0] + drift * sv, r[1] + dz * sv], h[1], h[2], h[3]]; });
          if ((g === 'forep' || g === 'hindp' || g === 'caud') && sv > 0.6 && RND.r() < 0.35 * expo) b.gone = 1;   // small bones carried off or trampled away
          if ((a.wstage || 0) >= 4 && RND.r() < 0.3) b.gone = 1; }); }); }
    // ---- paint ----
    var all2 = []; parts.forEach(function (q) { all2 = all2.concat(q.poly); }); B.forEach(function (b) { all2 = all2.concat(b.poly); });
    var BB = pbb(all2), pad = s.hair * L + 0.02 * L; BB = [BB[0] - pad, BB[1] + pad, BB[2] - pad, BB[3] + pad];
    parts.forEach(function (q) { q.bb = pbb(q.poly); }); F.ext.forEach(function (q) { q.bb = pbb(q.poly); });
    var near = parts.filter(function (q) { return !q.far; }), farP = parts.filter(function (q) { return q.far; }), tb = pbb(parts[0].poly), ytop = tb[3], ybot = tb[2];
    var hide = col(s.hide), hideHi = col(s.hideHi), SKIN = col('#4d4038'), RAW = col('#5a2a1d'), CAV = col('#1f150e'), WETH = col('#231912'), LEATH = col('#3e3226');
    var sdA = 0.012 * L, seed = (a.seed || '').length + 13 * RND.r();
    function unionD(list, x, y) { var d = 1e9, part = null; for (var q = 0; q < list.length; q++) { var di = sdPoly(list[q].poly, list[q].bb, x, y); if (di < d) { part = list[q]; } d = Math.min(d, di); } return [d, part]; }
    function holeAt(x, y, part) { if (living || !part || part.tag === 'leg' || part.tag === 'trunk' || part.tag === 'tail') return false; var bias = 1 - clamp((y - ybot) / (ytop - ybot + 1e-6), 0, 1);
      return fbm(x * 3.2 / L, y * 3.2 / L, 31, 3) + 0.45 * bias > 1.15 - 1.9 * holeAmt + (1 - hideLeft) * -0.6; }
    function hideCol(x, y, d, part, farF) {
      var dep = clamp(-d / (0.1 * L), 0, 1), vert = clamp((y - ybot) / (ytop - ybot + 1e-6), -0.3, 1.2), light = 0.5 + 0.32 * Math.sqrt(dep) + 0.22 * vert, c;
      var bald = hairLoss > 0 && fbm(x * 11 / L, y * 11 / L, 41, 2) > 1.0 - 1.5 * hairLoss;
      c = bald ? SKIN : mix3(hide, hideHi, clamp(vert * 0.55 + 0.2 * vn(x * 9 / L, y * 9 / L, 3), 0, 1));
      if (s.hair && !bald) { var hs = vn(x * 55, y * 6 + 2.5 * vn(x * 7, y * 7, 5), 6); c = [c[0] * (0.86 + 0.2 * hs), c[1] * (0.86 + 0.2 * hs), c[2] * (0.86 + 0.2 * hs)]; }
      if (!s.hair) { var fur = vn(x * 140, y * 140, 7); c = [c[0] * (0.96 + 0.06 * fur), c[1] * (0.96 + 0.06 * fur), c[2] * (0.96 + 0.06 * fur)]; }
      if (d > -0.008 * L && vert > 0.6) light += 0.12;                                                     // sky rim on the back
      if (!living) { c = mix3(c, WETH, 0.4 * PX.sstep(0.05, 0.35, t) * (1 - PX.sstep(0.5, 1.2, t))); c = mix3(c, LEATH, 0.6 * PX.sstep(0.45, 1.3, t)); }
      if (split > 0 && part && part.tag === 'torso') { var ym = ybot + (ytop - ybot) * 0.42 + 0.05 * L * vn(x * 6 / L, 3, 51), gw = 0.035 * L * split * (0.5 + 0.8 * Math.abs(vn(x * 9 / L, 7, 52))) * Math.max(0, 1 - Math.abs((x - (tb[0] + tb[1]) / 2) / ((tb[1] - tb[0]) * 0.32)));   // the hide splits along the flank
        var gd = Math.abs(y - ym); if (gd < gw) c = gd < gw * 0.6 ? CAV : RAW; else if (gd < gw + 0.012 * L) c = mix3(c, RAW, 0.5); }
      if (part && part.tag === 'ear') light *= 0.75;
      light *= farF; return [c[0] * light, c[1] * light, c[2] * light]; }
    var fleshOn = living || hideLeft > 0.02;
    // pass 1 (dead): body cavity where the hide has opened
    if (!living && fleshOn && holeAmt > 0) fillLocal(ox, oz, BB, flip, sq, function (x, y) { var u = unionD(near, x, y); if (u[0] > 0 || !holeAt(x, y, u[1])) return null; return [u[0], mix3(CAV, RAW, 0.3 * (1 - PX.sstep(0.3, 0.9, t))), 0.92 * (1 - PX.sstep(0.6, 1.4, t))]; }, opt);
    // pass 2 (dead): bones, far side first
    if (!living) { var BC = B.filter(function (b) { return !b.gone; }).sort(function (p, q) { return p.order - q.order; });
      BC.forEach(function (b) { var bbb = pbb(b.poly), w0 = b.ax ? b.ax[2] : 0.03 * L, base = boneCol(a, b.ivory), far = b.far ? 0.78 : 1;
        if (fleshOn && b.ivory && hideLeft > 0.3) return;
        var bo = { haze: opt.haze, clip: opt.clip, relief: 0.6 * w0, rw: 0.5 * w0 };
        fillLocal(ox, oz, [bbb[0] - 0.01, bbb[1] + 0.01, bbb[2] - 0.01, bbb[3] + 0.01], flip, sq, function (x, y) { var d = sdPoly(b.poly, bbb, x, y); if (d > 0.02 * L) return null;
          if (b.holes) for (var h = 0; h < b.holes.length; h++) { var hh = b.holes[h], ex = (x - hh[0][0]) / hh[1], ey = (y - hh[0][1]) / hh[2]; if (ex * ex + ey * ey < 1) { if (hh[3]) { d = d; break; } return [d, mix3(base, col('#2a2119'), 0.8)]; } }
          var inn = clamp(-d / (w0 * 0.7 + 1e-4), 0, 1), sh = (0.72 + 0.34 * Math.sqrt(inn)) * far, gr = 0.88 + 0.12 * fbm(x * 40 / L, y * 40 / L, 19, 2);
          if ((a.wstage || 0) >= 1 && vn(x * 30 / L, y * 30 / L, 17) > 0.7 - 0.05 * a.wstage) sh *= 0.72;   // weathering cracks
          return [d, [base[0] * sh * gr, base[1] * sh * gr, base[2] * sh * gr]]; }, bo); }); }
    // pass 3: hide (far legs darker, then the near body as one smooth union), with hair skirts
    if (fleshOn) {
      if (farP.length) fillLocal(ox, oz, BB, flip, sq, function (x, y) { var u = unionD(farP, x, y); if (u[0] > 0) return null; return [u[0], hideCol(x, y, u[0], u[1], 0.72), living ? 1 : hideLeft]; }, opt);
      fillLocal(ox, oz, BB, flip, sq, function (x, y) { var u = unionD(near, x, y), d = u[0];
        if (d > 0) { if (!s.hair || d > s.hair * L) return null; var hl = s.hair * L * (0.3 + 0.7 * Math.abs(vn(x * lf(70), 3.1, 9))) * (1 - 0.8 * hairLoss), u2 = unionD(near, x, y + hl);
          if (u2[0] < 0 && u2[1] && u2[1].tag !== 'trunk' && u2[1].tag !== 'leg') { var hc = hideCol(x, y + hl, u2[0], u2[1], 0.8); return [Math.max(d - hl, -1e-3), hc, (living ? 0.9 : 0.85 * hideLeft) * (Math.abs(Math.sin(x * 900)) > 0.25 ? 1 : 0.4)]; } return null; }
        if (holeAt(x, y, u[1])) return null;
        return [d, hideCol(x, y, d, u[1], 1), living ? 1 : (hideLeft < 1 ? clamp(hideLeft * 1.5, 0, 1) : 1)]; }, opt);
      F.ext.forEach(function (q) { fillLocal(ox, oz, [q.bb[0], q.bb[1], q.bb[2], q.bb[3]], flip, sq, function (x, y) { var d = sdPoly(q.poly, q.bb, x, y); if (d > 0.01) return null; return [d, hideCol(x, y, -0.02 * L, q, 0.7), living ? 1 : hideLeft]; }, opt); });
      // tusks / horns over the face while the head still has flesh
      var IV = (living ? FAUNA.skeleton(Rg) : B).filter(function (b) { return b.ivory; });
      if (living) IV.forEach(function (b) { moveP(b.poly, off); });
      if (living || hideLeft > 0.3) IV.forEach(function (b) { var bbb = pbb(b.poly), base = b.ivory === 1 ? mix3(IVORY, col('#a88f6a'), 0.25) : col('#3b332c');
        fillLocal(ox, oz, bbb, flip, sq, function (x, y) { var d = sdPoly(b.poly, bbb, x, y); if (d > 0.01 * L) return null; var inn = clamp(-d / (0.02 * L), 0, 1), sh = 0.78 + 0.32 * Math.sqrt(inn); return [d, [base[0] * sh, base[1] * sh, base[2] * sh]]; }, opt); });
      // the eye
      if (living || t < 0.1) { var ey2 = FAUNA.rig(a.sp, L, living ? pose : (a.pose || 'sternal'), { sink: a.sink || 0 }), hb2 = ey2.Hb, ea = ey2.headA, eu = s.type === 'proboscid' ? [0.11, 0.06] : [s.hl * 0.35, s.hh * 0.25], ep = [hb2[0] + (eu[0] * Math.cos(ea) - eu[1] * Math.sin(ea)) * L, hb2[1] + (eu[0] * Math.sin(ea) + eu[1] * Math.cos(ea)) * L + dyR];
        fillLocal(ox, oz, [ep[0] - 0.02 * L, ep[0] + 0.02 * L, ep[1] - 0.02 * L, ep[1] + 0.02 * L], flip, sq, function (x, y) { var d = Math.hypot(x - ep[0], (y - ep[1]) * 1.4) - 0.007 * L; return d > 0.003 ? null : [d, col('#140e0a'), 0.9]; }, opt); } }
    // scavenger traces on the surface while the carcass is exposed: hair tufts, dragged hide scraps
    if (!living && t > 0.07 && t < 1.6 && expo > 0.3 && s.hair) { var R6 = hrng('tuft:' + a.seed), nT = Math.round(30 * hairLoss * expo);
      for (k = 0; k < nT; k++) { var tx = a.x + R6.range(-1.1, 1.1) * L * 0.8, tz = surfC(tx), tl = R6.range(0.02, 0.06), tan = R6.range(-0.5, 0.5);
        if (Math.abs(tz - (oz + sup)) > 0.15) continue;
        paintLocal(tx, tz, [0.08, 0.05, 0.02], function (lx, ly) { var u = lx * Math.cos(tan) + ly * Math.sin(tan), v = -lx * Math.sin(tan) + ly * Math.cos(tan); return [Math.max(Math.abs(u) - tl, Math.abs(v) - 0.004), mix3(hide, hideHi, 0.4), 0.8]; }, {}); } }
  }
  function simpleObj(a, ox, oz) {   // small finds
    var R3 = hrng('obj:' + a.seed), ang = a.ang || 0, ca = Math.cos(ang), sa = Math.sin(ang);
    function rot(lx, ly) { return [lx * ca + ly * sa, -lx * sa + ly * ca]; }
    var K = a.kind, ext = [0.4, 0.3, 0.3];
    if (K === 'nail' || K === 'horseshoe' || K === 'wire') { var rr = (a.rust || 0); if (rr > 0) darkenHaloRust(ox, oz, 0.03 + 0.05 * rr, rr); }
    paintLocal(ox, oz, ext, function (lx, ly) { var q = rot(lx, ly), u = q[0], v = q[1], d, c;
      switch (K) {
        case 'fcr': d = sdEll(u, v, [0, 0], a.r, a.r * 0.7, 0) + a.r * 0.25 * vn(u * 30, v * 30, 7) + a.r * 0.15 * Math.abs(Math.sin(Math.atan2(v, u) * 3 + 1)); c = mix3(col('#77706a'), col('#8e5a44'), R3.r() < 2 ? 0.45 : 0); c = [c[0] * (0.85 + 0.3 * clamp(v / a.r, -0.5, 1)), c[1] * (0.85 + 0.3 * clamp(v / a.r, -0.5, 1)), c[2] * (0.85 + 0.3 * clamp(v / a.r, -0.5, 1))]; return [d, c];
        case 'flake': d = sdEll(u, v, [0, 0], a.r, a.r * 0.14, 0); c = mix3(col('#6e7379'), col('#d8d4cc'), (a.patina || 0) * 0.6); return [d, c];
        case 'fluted': { var w = a.r * 0.32 * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.15 * a.r) / (a.r * 1.15), 2))) * (u > 0 ? 1 - 0.6 * u / a.r : 1); d = Math.max(Math.abs(v) - w, Math.abs(u) - a.r);
          c = mix3(col('#7d7a74'), col('#cfc8bb'), (a.patina || 0) * 0.5); var fl2 = 0.88 + 0.16 * Math.sin(u / a.r * 25 + v / a.r * 9) * 0.5 + (Math.abs(v) < w * 0.25 && u < 0.2 * a.r ? -0.08 : 0); return [d, [c[0] * fl2, c[1] * fl2, c[2] * fl2]]; }
        case 'bonefrag': d = sdCap(u, v, [-a.r * 0.5, 0], [a.r * 0.5, 0], a.r * 0.18, a.r * 0.12); c = a.burnt ? (vn(u * 90, v * 90, 3) > 0 ? col('#2b2723') : col('#d9d4cb')) : BONE1; return [d, c];
        case 'sherd': { var cy = 0.18, rr2 = Math.sqrt(u * u + (v + cy) * (v + cy)); d = Math.max(Math.abs(rr2 - cy) - 0.005, Math.abs(Math.atan2(u, v + cy)) * cy - a.r * 0.5); c = Math.abs(rr2 - cy) < 0.0022 ? col('#3d3029') : col('#9a6440'); return [d, c]; }
        case 'whiteware': { var cy2 = 0.12, r2 = Math.sqrt(u * u + (v + cy2) * (v + cy2)); d = Math.max(Math.abs(r2 - cy2) - 0.0035, Math.abs(Math.atan2(u, v + cy2)) * cy2 - 0.035); return [d, col('#e8e6df')]; }
        case 'nail': d = Math.max(sdCap(u, v, [-0.035, 0], [0.035, 0], 0.0025, 0.0012), -1) - 0.004 * (a.rust || 0); c = mix3(col('#4a4644'), RUST, a.rust || 0); return [d, c];
        case 'horseshoe': { var rr3 = Math.sqrt(u * u + v * v); d = Math.max(Math.abs(rr3 - 0.055) - 0.011 - 0.006 * (a.rust || 0), v - 0.02); c = mix3(col('#4b4644'), RUST, a.rust || 0); return [d, c]; }
        case 'wire': d = Math.abs(v - 0.015 * Math.sin(u * 60)) - 0.0018 - 0.002 * (a.rust || 0); d = Math.max(d, Math.abs(u) - 0.15); return [d, mix3(col('#59585a'), RUST, a.rust || 0)];
        case 'button': case 'bead': d = sdEll(u, v, [0, 0], 0.008, 0.003, 0); return [d, K === 'bead' ? col('#e6dfd2') : col('#7e6a3a')];
        case 'key': d = Math.min(sdEll(u, v, [-0.02, 0], 0.01, 0.008, 0), sdCap(u, v, [-0.012, 0], [0.025, 0], 0.0025, 0.0025)); return [d, col('#7a6c3c')];
        case 'tooth': d = sdEll(u, v, [0, 0], 0.03, 0.018, 0) + 0.004 * Math.abs(Math.sin(u * 300)); return [d, mix3(BONE1, col('#3a332c'), 0.4)];
        case 'bottle': { d = Math.min(sdCap(u, v, [-0.1, 0], [0.06, 0], 0.035, 0.035), sdCap(u, v, [0.06, 0], [0.13, 0], 0.014, 0.013)); var gc = R3.r() < 0.5 ? col('#3c5a3a') : col('#5a3a20'), edge = clamp(1 + d / 0.006, 0, 1);
          c = mix3(gc, col('#d9e1da'), 0.6 * edge + (Math.abs(v - 0.02) < 0.004 ? 0.4 : 0)); if (a.irid) { var hh = vn(u * 120, v * 120, 5); c = mix3(c, hh > 0 ? col('#c7b8e0') : col('#d8cf9a'), a.irid * 0.5 * Math.abs(hh)); }
          if (a.broken && Math.abs(Math.sin(u * 50 + v * 20)) < 0.08) return null; return [d, c, 0.85]; }
        case 'can': { var wv = 0.008 * Math.sin(u * 90); d = Math.max(Math.abs(u) - 0.062, Math.abs(v - wv) - 0.03 + 0.012 * clamp(Math.abs(u) / 0.06, 0, 1)); c = Math.abs(u) < 0.03 ? col('#a33a30') : col('#b9bbbd');
          if (a.rust) { c = mix3(c, col('#d8d6cf'), a.rust * 0.8); if (vn(u * 80, v * 80, 6) > 1 - a.rust) return null; } return [d, c]; }
        case 'plastic': { var wv2 = 0.01 * Math.sin(u * 50 + 1); d = Math.min(Math.max(Math.abs(u) - 0.11, Math.abs(v - wv2) - 0.03), sdCap(u, v, [0.11, 0], [0.14, 0], 0.012, 0.012)); c = mix3(col('#a7c4d6'), col('#e8eef0'), 0.4 + 0.3 * vn(u * 60, v * 60, 2));
          return [d, c, 0.75]; }
        case 'shotshell': d = Math.min(sdCap(u, v, [-0.03, 0], [0.02, 0], 0.009, 0.009), sdCap(u, v, [0.02, 0], [0.033, 0], 0.0095, 0.0095)); return [d, u > 0.02 ? col('#b8933e') : col('#a32b26')];
        case 'phone': d = Math.max(Math.abs(u) - 0.075, Math.abs(v) - 0.004); return [d, col('#1c1c1f')];
        case 'stick': d = sdCap(u, v, [-a.len / 2, 0], [a.len / 2, 0], a.r, a.r * 0.8); c = mix3(col('#7a5e44'), col('#3a2c22'), a.wet ? 0.5 : 0); if (a.rot > 0.8 && !a.wet) return null; return [d, c];
        default: return null; }
    }, {});
  }
  function darkenHaloRust(cx, cz, r, amt) { var x0 = Math.max(0, Math.floor(sx(cx - r))), x1 = Math.min(PW - 1, Math.ceil(sx(cx + r))), y0 = Math.max(0, Math.floor(sy(cz + r))), y1 = Math.min(PH - 1, Math.ceil(sy(cz - r)));
    for (var py = y0; py <= y1; py++) for (var px = x0; px <= x1; px++) { var x = wx(px + 0.5), z = wz(py + 0.5), d = Math.sqrt((x - cx) * (x - cx) + (z - cz) * (z - cz)) / r; if (d < 1) blend(py * PW + px, RUST, amt * 0.5 * (1 - d) * (1 - d)); } }

  /* ------------------------------------------------------------------ paint remains, objects, posts */
  var vis = A.filter(function (a) { return !a.gone && a.x > VX0 - 4 && a.x < VX0 + VWm + 4; });
  vis.forEach(function (a) { if (a.kind === 'carcass' && a.halo > 0.02) { var Lm = a.len, s = SPEC[a.sp] || SPEC.deer; darkenHalo(a.x + (a.flip ? -0.05 : 0.05) * Lm, a.zc + s.d * Lm * 0.25, Lm * 0.6, s.d * Lm * 0.45, a.halo, a.kerogen); } });
  vis.forEach(function (a) { if (a.kind === 'carcass' && a.kerogen > 0.02) { var s = SPEC[a.sp] || SPEC.deer; darkenHalo(a.x, a.zc + s.d * a.len * 0.2, a.len * 0.55, s.d * a.len * 0.4, 0.6 * a.kerogen, a.kerogen); } });
  var WOOD = col('#8a7058'), WOODG = col('#9a9286'), PIPE = col('#3e3026'), WETW = col('#3b2a1e');
  var postsByMint = {};
  vis.forEach(function (a) {
    var K = a.kind;
    if (K === 'carcass') { var dep = surfC(a.x) - a.zc, sq = a.stage >= 4 ? clamp(1 - 0.3 * clamp(dep / 2.5, 0, 1), 0.65, 1) : 1; if (a.sp === 'human') drawCarcass(a, 'dead', a.x, a.zc, a.len, { sq: sq }); else drawFauna(a, 'dead', a.x, a.zc, a.len, { sq: sq }); return; }
    if (K === 'post') {
      var zb = mapZ(a.x, a.z - a.d), zt = Math.min(a.zc, surfC(a.x)), sU = surfU(a.x), aboveH = (a.z + a.h) - sU, keepAbove = a.above > 0 && aboveH > 0.05 && !a.trunc && a.mint >= N - 60;
      var r = a.r, wood = a.wood;
      if (!wood) { paintLocal(a.x, zb, [0.2, 1, 0.05], function (lx, ly) { var h2 = zt - zb, d = Math.max(Math.abs(lx) - (0.11 - 0.05 * clamp(ly / h2, 0, 1)), Math.max(-ly, ly - h2 * 0.85)); return [d, mix3(col('#a7a39b'), col('#8f8a82'), vn(lx * 80, ly * 80, 2) * 0.5 + 0.5)]; }, {}); }   // concrete footing
      var cw = wood ? (a.wet ? WETW : mix3(WOOD, PIPE, a.rot || 0)) : mix3(col('#8c8f92'), RUST, a.rust || 0);
      paintLocal(a.x, zb, [r * 2, Math.max(0.01, zt - zb) + 0.01, 0.01], function (lx, ly) { var d = Math.max(Math.abs(lx) - r * (wood && a.rot > 0.5 ? 1.15 : 1), Math.max(-ly, ly - (zt - zb))); var c = cw; if (wood && !a.wet) c = mix3(c, PIPE, 0.4 * vn(lx * 90, ly * 20, 4) + 0.2); return [d, c]; }, { clip: 'below' });
      if (keepAbove) { var hv = aboveH * (0.6 + 0.4 * a.above); a.vis = hv;
        paintLocal(a.x, sU > zt ? surfC(a.x) : zt, [r * 2, hv + 0.02, 0.01], function (lx, ly) { var d = Math.max(Math.abs(lx) - r * 0.95, Math.max(-ly, ly - hv)); var c = wood ? mix3(WOODG, col('#6e6458'), 0.5 + 0.5 * vn(lx * 200, ly * 15, 6)) : mix3(col('#9da1a4'), RUST, a.rust || 0); return [d, c]; }, { clip: 'above' });
        (postsByMint[a.mint] = postsByMint[a.mint] || []).push(a); }
      return; }
    if (K === 'log') { var ox = a.x, oz = a.zc; paintLocal(ox, oz, [a.len, a.r * 2, a.r * 2], function (lx, ly) { var u = lx * Math.cos(a.ang) + ly * Math.sin(a.ang), v = -lx * Math.sin(a.ang) + ly * Math.cos(a.ang), fr = a.lign ? 0.3 : 1, d = sdCap(u, v * (1 / fr), [-a.len / 2, 0], [a.len / 2, 0], a.r, a.r * 0.6) * fr + a.r * 0.15 * vn(u * 6, 1, 5);
        if (!a.wet && a.rot > 0.85) return null; var c = a.lign ? mix3(col('#2a2119'), col('#3a2d22'), 0.5 + 0.5 * vn(u * 30, v * 300, 4)) : a.wet ? mix3(WETW, col('#55402e'), 0.3 + 0.3 * vn(u * 40, v * 200, 3)) : mix3(WOOD, PIPE, a.rot); return [d, c, !a.wet && a.rot > 0.5 ? 0.6 : 1]; }, {}); return; }
    if (K === 'tyre') { paintLocal(a.x, a.zc + 0.1, [0.4, 0.2, 0.2], function (lx, ly) { var d = Math.max(Math.abs(lx) - 0.31, Math.abs(ly) - 0.1) + 0.0; d = Math.max(d, -Math.max(Math.abs(lx) - 0.19, Math.abs(ly) - 0.035)); var c = col('#1e1d1c'); if (Math.abs(ly) > 0.085 && Math.sin(lx * 160) > 0.3) c = col('#141313'); return [d - 0.02, c]; }, {}); return; }
    if (K === 'car') { var pc = hrng('car:' + a.seed).pick([col('#7a2a24'), col('#2c4a6a'), col('#c9c6bd'), col('#3b5a40')]), rr = a.age ? clamp(a.age / 40, 0, 1) : 0, dep2 = surfC(a.x) - a.zc, crush = clamp(dep2 / 1.5, 0, 0.45) + 0.3 * clamp((a.age || 0) / 120, 0, 1);
      paintLocal(a.x, a.zc + 0.0, [2.4, 1.6, 0.05], function (lx, ly) { var body = Math.max(Math.abs(lx) - 2.1, Math.abs(ly - 0.55) - 0.3) - 0.06, cabTop = 1.42 * (1 - crush) + 0.85 * crush, cab = Math.max(Math.abs(lx + 0.1) - 0.95 + 0.4 * clamp((ly - 0.85) / 0.6, 0, 1), Math.max(0.82 - ly, ly - cabTop));
        var w1 = Math.sqrt((lx - 1.35) * (lx - 1.35) + (ly - 0.32) * (ly - 0.32)) - 0.31, w2 = Math.sqrt((lx + 1.35) * (lx + 1.35) + (ly - 0.32) * (ly - 0.32)) - 0.31, d = Math.min(Math.min(body, cab), Math.min(w1, w2));
        var c = Math.min(w1, w2) < 0 ? col('#1b1a19') : (cab < 0 && ly > 0.9 && Math.abs(lx + 0.1) < 0.8) ? col('#2a2f33') : pc; c = mix3(c, RUST, rr * (0.6 + 0.4 * vn(lx * 8, ly * 8, 4)));
        if (rr > 0.85 && vn(lx * 6, ly * 6, 5) > 0.2) return null; return [d, c]; }, { flip: a.flip }); return; }
    simpleObj(a, a.x, a.zc);
  });

  /* ------------------------------------------------------------------ the surface now: token N's own event */
  var ev = NOW.ev, R4 = hrng('surface:' + NOW.hash), veg = NOW.era.veg;
  // fence wires / rails / mesh, and house frames, between standing posts
  Object.keys(postsByMint).forEach(function (k2) { var ps = postsByMint[k2].sort(function (p, q) { return p.x - q.x; }), fk = ps[0].fence;
    for (var i2 = -1; i2 < ps.length; i2++) { var xa2 = i2 < 0 ? VX0 - 0.2 : ps[i2].x, xb = i2 + 1 < ps.length ? ps[i2 + 1].x : VX0 + VWm + 0.2, g0 = surfC((xa2 + xb) / 2), hmin = Math.min.apply(null, ps.map(function (p) { return p.vis; }));
      var lines = fk === 'split rail' ? [0.35, 0.7, 1.0] : fk === 'chain-link' ? [1.15] : fk ? [0.45, 0.75, 1.05] : [hmin - 0.05];
      lines.forEach(function (hl) { if (hl > hmin + 0.05) return; paintLocal((xa2 + xb) / 2, g0 + hl, [(xb - xa2) / 2, 0.06, 0.06], function (lx, ly) { var sag = fk && fk !== 'split rail' ? 0.03 * (1 - Math.pow(2 * lx / (xb - xa2), 2)) : 0, th = fk === 'split rail' || !fk ? 0.035 : 0.0035;
        var d = Math.abs(ly + sag) - th; if (fk === 'barbed wire' && Math.abs(((lx * 8) % 1)) < 0.05) d -= 0.008; return [d, fk === 'split rail' || !fk ? WOODG : col('#5c5b59'), fk === 'split rail' || !fk ? 1 : 0.85]; }, { clip: 'above' }); });
      if (fk === 'chain-link') paintLocal((xa2 + xb) / 2, g0 + 0.6, [(xb - xa2) / 2, 0.6, 0.6], function (lx, ly) { var u = (lx + ly) / 0.06, v = (lx - ly) / 0.06, du = Math.abs(u - Math.round(u)), dv = Math.abs(v - Math.round(v)); return [Math.min(du, dv) * 0.06 - 0.0012, col('#77797b'), 0.55]; }, { clip: 'above' });
    } });
  // vegetation along the lip
  var GR = { steppe: [140, 0.03, 0.12, '#8f8a63'], parkland: [220, 0.04, 0.16, '#7c7c55'], forest: [60, 0.02, 0.07, '#6d6248'], pasture: [420, 0.04, 0.1, '#6f7a4a'], scrub: [200, 0.06, 0.3, '#6e6d4a'], fern: [200, 0.05, 0.3, '#5d6a40'], swamp: [200, 0.05, 0.3, '#4d5a3a'], lawn: [500, 0.02, 0.05, '#6a7a48'] }[veg] || [200, 0.04, 0.12, '#7d7a55'];
  var bare = { drought: 1, plough: 1, outwash: 1, cinders: 1, flood: 0.8, greatflood: 1, fire: 0.6, graze: 0.5, camp: 0.3, pit: 0.4, burial: 0.7, dogburial: 0.5, sandblow: 0.6, beaver: 0.7, frost: 0.4 }[ev] || 0;
  if (cold && NOW.era.key === 'prologue') GR = [GR[0], GR[1], GR[2], '#8e8865'];
  var nBl = Math.round(GR[0] * VWm * (1 - bare)), burnt = ev === 'fire';
  var CSP = vis.filter(function (c) { return c.kind === 'carcass' && surfC(c.x) - c.zc < 0.6 && (c.t || 0) < 1.3; }).map(function (c) { return c.flip ? [c.x - c.len * 1.15, c.x + c.len * 0.12] : [c.x - c.len * 0.12, c.x + c.len * 1.15]; });
  for (var bi = 0; bi < nBl; bi++) { var bx = VX0 + R4.r() * VWm; if (CSP.some(function (q) { return bx > q[0] && bx < q[1]; })) continue; var bh = R4.range(GR[1], GR[2]) * (burnt ? 0.25 : 1), lean = R4.gauss(0, 0.25) + 0.1, gz0 = surfC(bx), gc = burnt ? col('#1e1b18') : mix3(col(GR[3]), col('#b0a882'), R4.r() * 0.5);
    for (var st2 = 0; st2 < 12; st2++) { var t2 = st2 / 11, xx = bx + lean * bh * t2 * t2, zz = gz0 + bh * t2, ppx = Math.round(sx(xx)), ppy = Math.round(sy(zz)); if (ppx < 0 || ppx >= PW || ppy < 0 || ppy >= PH) continue; var wpx = Math.max(1, Math.round(0.0025 * SC * (1 - t2)));
      for (var q2 = 0; q2 < wpx; q2++) if (ppx + q2 < PW) blend(ppy * PW + ppx + q2, gc, 0.8); } }
  // event dressing
  function sky(fnA) { for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) { if (py >= lipY[px]) continue; var r5 = fnA(wx(px + 0.5), wz(py + 0.5)); if (r5) blend(py * PW + px, r5[0], r5[1]); } }
  if (ev === 'flood' || ev === 'greatflood' || ev === 'beaver') { var wl = zRef + (ev === 'greatflood' ? 0.35 : R4.range(0.03, 0.09));
    for (var px3 = 0; px3 < PW; px3++) { var top3 = Math.max(0, Math.floor(sy(wl))); for (var py3 = top3; py3 < lipY[px3]; py3++) { var x3 = wx(px3 + 0.5), z3 = wz(py3 + 0.5), dd = wl - z3; blend(py3 * PW + px3, dd < 0.004 ? col('#d9d6cf') : mix3(col('#9a8f7e'), col('#c4c2bc'), 0.35 + 0.25 * vn(x3 * 2, z3 * 400, 3)), dd < 0.004 ? 0.6 : 0.5 + 0.2 * clamp(dd / 0.15, 0, 1)); } } }
  if (ev === 'fire' || ev === 'camp') { var fx = ev === 'camp' && NOW.hx ? NOW.hx : VX0 + VWm * R4.range(0.6, 1.2), str = ev === 'camp' ? 0.22 : 0.4;
    sky(function (x, z) { var h = z - zRef; if (h < 0) return null; var cx = fx + h * 0.35 + 0.15 * h * fbm(h * 1.5, 1, 71, 3), w = 0.08 + h * 0.28, d = Math.abs(x - cx) / w; if (d > 1.5) return null; var a2 = str * Math.exp(-d * d * 1.6) * clamp(1 - h / 4.5, 0, 1) * (0.6 + 0.4 * fbm(x * 3, z * 3, 73, 3)); return [col('#a7a39f'), a2]; });
    if (ev === 'camp' && NOW.hx) for (var e2 = 0; e2 < 14; e2++) { var exx = NOW.hx + R4.range(-0.25, 0.25), ezz = surfC(exx) + R4.range(0, 0.03), epx = Math.round(sx(exx)), epy = Math.round(sy(ezz)); if (epx >= 0 && epx < PW && epy >= 0 && epy < PH) blend(epy * PW + epx, col('#e0703a'), 0.7); } }
  if (ev === 'loess') sky(function (x, z) { var h = z - zRef; return [col('#d2c3a2'), 0.35 * Math.exp(-Math.max(0, h) / 1.2)]; });
  if (ev === 'frost') { for (var px4 = 0; px4 < PW; px4++) { var sn4 = 0.025 + 0.02 * vn(wx(px4) * 3, 1, 8); for (var py4 = Math.floor(lipY[px4] - sn4 * SC); py4 < lipY[px4] + 0.01 * SC; py4++) if (py4 >= 0 && py4 < PH) blend(py4 * PW + px4, col('#eef0f1'), 0.92); } }
  if (ev === 'plough') { var per = R4.range(0.75, 0.95); for (var px5 = 0; px5 < PW; px5++) { var x5 = wx(px5 + 0.5), ph = ((x5 / per) % 1 + 1) % 1, rh = 0.09 * (ph < 0.6 ? ph / 0.6 : (1 - ph) / 0.4); for (var py5 = Math.floor(lipY[px5] - rh * SC); py5 < lipY[px5]; py5++) if (py5 >= 0) blend(py5 * PW + px5, mix3(LITH.plough, col('#8a745c'), 0.3 * vn(x5 * 40, py5 * 0.3, 2) + 0.2), 1); } }
  if (ev === 'graze' && NOW.sp) { var nh = NOW.herd || 1; for (var hI = 0; hI < nh; hI++) { var dist = R4.range(20, 80), f2 = 12 / (12 + dist), Lh = SIZE[NOW.sp] * f2, hx2 = (function () { var xb2 = VX0 + R4.range(0.05, 0.95) * VWm; for (var tr = 0; tr < 12; tr++) { var hit = vis.some(function (c) { return c.kind === 'carcass' && (surfC(c.x) - c.zc) < 1.2 && Math.abs(c.x - xb2) < c.len * 0.75 + Lh; }); if (!hit) break; xb2 = VX0 + R4.range(0.05, 0.95) * VWm; } return xb2; })(), pose2 = R4.chance(0.65) ? 'graze' : 'stand';
      drawFauna({ sp: NOW.sp, seed: NOW.hash + hI }, pose2, hx2, zRef + 0.25 * f2 - 0.02, Lh, { flip: R4.chance(0.5), clip: 'above', haze: [SKY1, clamp(0.12 + dist / 160, 0, 0.6)] }); } }
  if (ev === 'house') { var hp = (postsByMint[NOW.i] || []); if (hp.length) { var xL = hp[0].x, xR = hp[hp.length - 1].x, hh2 = Math.min.apply(null, hp.map(function (p) { return p.vis || 1.5; })), gz2 = surfC(xL);
      paintLocal((xL + xR) / 2, gz2 + hh2, [Math.max(0.6, (xR - xL) / 2 + 0.7), 0.9, 0.1], function (lx, ly) { var w = Math.max(0.6, (xR - xL) / 2 + 0.6); var d = Math.max(Math.abs(lx) - (w - ly * 0.9), Math.max(-ly + 0.0, ly - 0.75)); return [d, mix3(col('#8a7a58'), col('#6e5f44'), 0.5 + 0.5 * vn(lx * 12, ly * 60, 3))]; }, { clip: 'above' }); } }

  /* ------------------------------------------------------------------ traits (honest: what is in the picture) */
  function fmtYear(y) { y = Math.round(y); return y < 0 ? (-y).toLocaleString('en-US') + ' BCE' : y + ' CE'; }
  function gapLabel(g) { return N === 1 ? 'First Mint' : g < 60 ? 'Seconds' : g < 3600 ? 'Minutes' : g < 86400 ? 'Hours' : g < 7 * 86400 ? 'Days' : g < 30 * 86400 ? 'Weeks' : 'Months'; }
  var EVN = { quiet: 'Quiet', graze: 'Grazing', death: 'A Death', flood: 'Flood', greatflood: 'The Great Flood', drought: 'Drought', fire: 'Fire', loess: 'Dust Storm', frost: 'Hard Frost', outwash: 'Meltwater Flood', blackmat: 'Marsh',
    camp: 'Hearth', midden: 'Shell Midden', burial: 'A Burial', dogburial: 'A Dog Buried', pit: 'Storage Pit', house: 'House Posts', plough: 'Ploughing', fence: 'Fencing', litter: 'Litter', cinders: 'Cinders Dumped', tyre: 'A Tyre', car: 'A Car', beaver: 'Beaver Pond', sandblow: 'Earthquake', lost: 'Something Lost' };
  var surfName = EVN[ev] || ev; if ((ev === 'death' || ev === 'graze') && NOW.sp) surfName += ': ' + NOW.sp.charAt(0).toUpperCase() + NOW.sp.slice(1); if (ev === 'fence' && NOW.fence) surfName += ': ' + NOW.fence;
  var STG = ['Fresh', 'Bloated', 'Rotting', 'Collapsed', 'Bones'], remains = [];
  function stateName(a) { var t = a.t || 0; if (a.fossil) return a.fossil === 2 ? 'replaced fossil' : 'permineralised bone';
    if (t < 0.03) return 'fresh carcass'; if (t < 0.09) return 'bloated carcass'; if (t < 0.3) return 'active decay'; if (t < 0.8) return 'advanced decay'; if (t < 1.2) return 'skeletonising';
    return (a.dep || 0) > 0.05 ? (a.stain > 0.5 ? 'stained bones, buried' : 'bones, buried') : 'scattered bones'; }
  function stateRank(a) { var t = a.t || 0; if (a.kerogen > 0.3) return 5; if (a.fossil === 2) return 4; if (a.fossil) return 3; if (t >= 1.2 && a.stain > 0.5) return 2; if (t >= 0.8) return 1; return 0; }
  var RANKN = ['Soft Tissue', 'Bone', 'Stained Bone', 'Permineralised Bone (Compressed Clock)', 'Replaced Fossil (Compressed Clock)', 'Kerogen Stain (Compressed Clock)'], deepR = -1;
  vis.forEach(function (a) { if (a.kind === 'carcass' && a.x > VX0 - a.len * 0.4 && a.x < VX0 + VWm + a.len * 0.4) { remains.push(a.sp + ' (' + stateName(a) + ')'); deepR = Math.max(deepR, stateRank(a)); } });
  var deepest = deepR < 0 ? 'No Remains In View' : RANKN[deepR];
  var nLay = 0; for (j = 0; j < L.length; j++) if (L[j].mint) nLay++;
  var feats = { 'World': WORLD.name + (WK === 'A' ? ' (default, pending choice)' : ''), 'Era': NOW.era.name, 'World Date': fmtYear(NOW.year), 'Surface': surfName, 'Before This Mint': gapLabel(NOW.gap),
    'Mints Beneath': N - 1, 'Remains In View': remains.length ? remains.slice(0, 3).join(', ') : 'None', 'Deepest State': deepest, 'Clock': compressedUsed ? 'Compressed (stated)' : 'Real Rates', 'History': HIST.source, 'Depth Shown': (VHm - YS).toFixed(1) + ' m' };
  C.features(feats);
  window.__sediments = { N: N, world: WK, zoom: ZOOM, window: [VX0, VWm], repeats: REPEATS, thick: L.map(function (l, i) { var k = Math.round((VX0 + VWm / 2) / DX), b = i ? L[i - 1].top[k] : 0; return [i, l.mint, l.lith, +(l.top[k] - b).toFixed(3)]; }).sort(function (p, q) { return q[3] - p[3]; }).slice(0, 8), events: M.map(function (m) { return [m.i, m.ev, Math.round(m.year), m.era.key, m.sp || '']; }),
    remains: vis.filter(function (a) { return a.kind === 'carcass'; }).map(function (a) { return { mint: a.mint, sp: a.sp, t: +(a.t || 0).toFixed(3), expo: +(a.expo || 0).toFixed(2), rew: a.reworked, stage: a.stage, flesh: +(a.flesh || 0).toFixed(2), wstage: a.wstage, fossil: a.fossil, ker: +(a.kerogen || 0).toFixed(2), age: Math.round(a.age), dep: +a.dep.toFixed(2), support: a.support, sink: a.sink, pose: a.pose, x: +a.x.toFixed(2) }; }) };
  /* ------------------------------------------------------------------ light (after Before the Shovels: relief normals, raking sun with soft shadows, sky AO) */
  (function () {
    var mpp = 1 / SC, i, x, y, H = new Float32Array(NP);
    for (i = 0; i < NP; i++) H[i] = FACE[i] ? HF[i] + HB[i] : 0.12;   // above the lip: the ground surface stands out toward us (the lip)
    var Lv = [-0.6, 0.6, 0.53], ln = Math.hypot(Lv[0], Lv[1], Lv[2]); Lv = [Lv[0] / ln, Lv[1] / ln, Lv[2] / ln];   // low sun from the upper left
    var slope = Lv[2] / Math.hypot(Lv[0], Lv[1]), stp = [Lv[0] / Math.hypot(Lv[0], Lv[1]), -Lv[1] / Math.hypot(Lv[0], Lv[1])];   // image-space march toward the light
    function boxBlur(src, rpx) { var tmp = new Float32Array(NP), out = new Float32Array(NP), r = Math.max(1, Math.round(rpx)), k, acc;
      for (y = 0; y < PH; y++) { acc = 0; for (k = -r; k <= r; k++) acc += src[y * PW + clamp(k, 0, PW - 1)]; for (x = 0; x < PW; x++) { tmp[y * PW + x] = acc / (2 * r + 1); acc += src[y * PW + Math.min(PW - 1, x + r + 1)] - src[y * PW + Math.max(0, x - r)]; } }
      for (x = 0; x < PW; x++) { acc = 0; for (k = -r; k <= r; k++) acc += tmp[clamp(k, 0, PH - 1) * PW + x]; for (y = 0; y < PH; y++) { out[y * PW + x] = acc / (2 * r + 1); acc += tmp[Math.min(PH - 1, y + r + 1) * PW + x] - tmp[Math.max(0, y - r) * PW + x]; } }
      return out; }
    var A1 = boxBlur(boxBlur(H, 0.05 * SC), 0.05 * SC), A2 = boxBlur(boxBlur(H, 0.25 * SC), 0.25 * SC);
    var sunC = [1.0, 0.95, 0.86], skyC = [0.80, 0.85, 0.93], nSteps = Math.max(4, Math.min(40, Math.round(0.14 * SC))), maxD = 0.14;
    for (y = 0; y < PH; y++) for (x = 0; x < PW; x++) { i = y * PW + x; if (!FACE[i]) continue;
      var hl = H[i - (x > 0 ? 1 : 0)], hr = H[i + (x < PW - 1 ? 1 : 0)], hu = H[i - (y > 0 ? PW : 0)], hd = H[i + (y < PH - 1 ? PW : 0)];
      var nx = -clamp((hr - hl) / (2 * mpp), -3, 3), ny = -clamp((hu - hd) / (2 * mpp), -3, 3), nl = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      var ndl = Math.max(0, (nx * Lv[0] + ny * Lv[1] + Lv[2]) * nl) / Lv[2];
      var h0 = H[i], sh = 1;
      for (var k = 1; k <= nSteps; k++) { var dm = maxD * k / nSteps, qx = Math.round(x + stp[0] * dm * SC), qy = Math.round(y + stp[1] * dm * SC); if (qx < 0 || qy < 0 || qx >= PW || qy >= PH) break;
        var ex = H[qy * PW + qx] - (h0 + dm * slope); if (ex > 0) sh = Math.min(sh, clamp(1 - ex / (0.004 + 0.06 * dm), 0, 1)); }   // penumbra widens with distance
      var ao = clamp(1 - 9 * Math.max(0, A1[i] - h0), 0.45, 1) * clamp(1 - 3 * Math.max(0, A2[i] - h0), 0.55, 1) * clamp(1 + 2 * Math.max(0, h0 - A2[i]), 1, 1.12);
      var lip = 1 - 0.32 * Math.exp(-(y + 0.5 - lipY[x]) / (0.18 * SC));   // the trench lip overhangs: soft shadow under it
      var kS = 0.72 * ndl * sh * lip, kA = 0.38 * ao * (0.6 + 0.4 * nl) * (0.75 + 0.25 * lip);
      RB[i] *= sunC[0] * kS + skyC[0] * kA; GB[i] *= sunC[1] * kS + skyC[1] * kA; BB[i] *= sunC[2] * kS + skyC[2] * kA; }
    // tone map (hue-preserving + soft shoulder), split-tone grade, vignette, grain
    var d8 = o.px8, expo = 1.25;
    function hsh(n) { n = (n ^ 0x5bd1e995) >>> 0; n = Math.imul(n ^ (n >>> 16), 0x7feb352d); n = Math.imul(n ^ (n >>> 15), 0x846ca68b); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
    for (y = 0; y < PH; y++) for (x = 0; x < PW; x++) { i = y * PW + x; var r = RB[i], g = GB[i], b = BB[i];
      var Lm = (0.3 * r + 0.59 * g + 0.11 * b) * expo + 1e-6, kL = (1 - Math.exp(-Lm)) / Lm * expo, r2 = 1 - Math.exp(-r * expo), g2 = 1 - Math.exp(-g * expo), b2 = 1 - Math.exp(-b * expo);
      r = lerp(r * kL, r2, 0.45) * 1.18; g = lerp(g * kL, g2, 0.45) * 1.18; b = lerp(b * kL, b2, 0.45) * 1.18;
      var lum = 0.3 * r + 0.59 * g + 0.11 * b, ws = (1 - lum) * (1 - lum), wh = lum * lum;
      r += (0.92 - lum) * 0.0 * ws - 0.012 * ws + 0.015 * wh; g += -0.004 * ws + 0.008 * wh; b += 0.012 * ws - 0.01 * wh;   // cool shadows, warm highlights
      var u = x / PW - 0.5, v = y / PH - 0.5, vg = 1 - 0.22 * Math.pow(u * u + v * v, 1.25) * 2.2, gn = (hsh(i * 7 + 3) + hsh(i * 13 + 5) - 1) * 0.014 * (1 - 0.5 * lum);
      d8[i * 4] = clamp(Math.pow(clamp(r * vg, 0, 1), 1 / 2.2) + gn, 0, 1) * 255; d8[i * 4 + 1] = clamp(Math.pow(clamp(g * vg, 0, 1), 1 / 2.2) + gn, 0, 1) * 255; d8[i * 4 + 2] = clamp(Math.pow(clamp(b * vg, 0, 1), 1 / 2.2) + gn, 0, 1) * 255; d8[i * 4 + 3] = 255; }
    o.ctx.putImageData(o.img, 0, 0);
  })();
  C.done(o.cv.canvas, 'sediments');
})();

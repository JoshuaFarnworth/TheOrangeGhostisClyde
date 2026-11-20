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
/* Ground Floor, by Clyde (2027).
 * The button panel inside a lift. Nobody looks at it closely; it has been keeping count. The most pressed buttons
 * have lost the paint in their numbers and been polished smooth; the ones nobody needs still look new.
 * Engine: a building is drawn (residential, offices, a hotel, a car park) with floors and who uses them. Trips are
 * simulated over years: everybody goes down to the ground floor, residents ride to their own floors in proportion
 * to how many people live there (a vacant floor gets almost nothing), the impatient press Close, a hotel's guests ride
 * to the pool. Each press rubs the button's centre: black infill in the engraving wears from the middle out, the
 * brushed grain of the steel is polished toward a mirror, skin oil darkens a ring around the face. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RB = R.fork('building'), RT = R.fork('trips'), RS = R.fork('steel');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1500, FW = 150, FH = 225;   // mm
  var kind = RB.weighted([['Flats', 46], ['Offices', 22], ['Hotel', 16], ['Car Park', 16]]);
  var nF = kind === 'Car Park' ? RB.int(3, 6) : RB.int(4, 13), years = RB.weighted([['Five Years', 30], ['Twenty Years', 46], ['Since It Was Built', 24]]);
  var trips = { 'Five Years': 1, 'Twenty Years': 3.5, 'Since It Was Built': 7 }[years] * RT.range(0.7, 1.3);
  var labels = [], use = [];
  var basement = kind !== 'Car Park' && RB.chance(0.3);
  if (basement) { labels.push('B'); use.push(kind === 'Flats' ? 0.15 : 0.3); }
  labels.push('G'); use.push(0);   // ground: everyone's return trip, added below
  for (var f = 1; f <= nF; f++) { labels.push(kind === 'Car Park' ? 'P' + f : String(f)); use.push(RB.range(0.4, 1.2)); }
  var vacant = -1, event = 'None';
  if (kind === 'Flats' && RB.chance(0.35)) { vacant = RB.int(basement ? 2 : 1, labels.length - 1); use[vacant] = 0.01; event = 'A Floor Nobody Visits'; }
  if (kind === 'Hotel') { var pool = labels.length - 1; use[pool] *= 2.6; event = 'Pool On The Top Floor'; }
  if (kind === 'Offices' && RB.chance(0.5)) { var canteen = RB.int(1, labels.length - 1); use[canteen] *= 2.5; event = 'The Canteen Floor'; }
  if (kind === 'Car Park') for (var q = 1; q < labels.length; q++) use[q] = 1.6 * Math.pow(0.7, q - 1);   // the first levels fill first
  var up = use.reduce(function (a, b) { return a + b; }, 0), gi = basement ? 1 : 0; use[gi] = up * 0.95;   // everyone comes back down
  var closeU = up * RT.range(0.15, 0.9), openU = up * RT.range(0.03, 0.15), alarmU = RT.chance(0.15) ? 0.002 : 0;
  var impatient = closeU > up * 0.55;
  // layout: one or two columns of 26 mm buttons; Open/Close at the bottom; Alarm above them
  var btns = [], nB = labels.length, cols = nB > 7 ? 2 : 1, rows = Math.ceil(nB / cols), pitch = 34, bx0 = FW / 2 - (cols - 1) * pitch / 2, by0 = FH * 0.64;
  for (var k = 0; k < nB; k++) { var c = cols === 2 ? k % 2 : 0, r = cols === 2 ? Math.floor(k / 2) : k; btns.push({ x: bx0 + c * pitch, y: by0 - r * pitch, lab: labels[k], u: use[k] }); }
  btns.push({ x: FW / 2 - pitch / 2, y: by0 + pitch * 1.25, lab: '<>', u: openU }, { x: FW / 2 + pitch / 2, y: by0 + pitch * 1.25, lab: '><', u: closeU }, { x: FW / 2, y: by0 + pitch * 2.3, lab: 'bell', u: alarmU });
  var scale = 1; var top = Math.min.apply(null, btns.map(function (b) { return b.y; })); if (top < 18) { scale = (by0 + pitch * 2.3 - 18) / (by0 + pitch * 2.3 - top); btns.forEach(function (b) { b.y = by0 + pitch * 2.3 - (by0 + pitch * 2.3 - b.y) * scale; b.x = FW / 2 + (b.x - FW / 2) * scale; }); }
  var BR = 13 * Math.min(1, scale * 1.05), umax = Math.max.apply(null, btns.map(function (b) { return b.u; }));
  btns.forEach(function (b) { b.w = 1 - Math.exp(-b.u / umax * 2.2 * trips); });
  // glyph strokes in a unit box (x 0..1, y 0..1.6)
  var G = { 0: [[[0.5, 0], [0.1, 0.3], [0.1, 1.3], [0.5, 1.6], [0.9, 1.3], [0.9, 0.3], [0.5, 0]]], 1: [[[0.25, 0.35], [0.55, 0], [0.55, 1.6]]], 2: [[[0.1, 0.35], [0.5, 0], [0.9, 0.35], [0.85, 0.7], [0.1, 1.6], [0.95, 1.6]]], 3: [[[0.1, 0.2], [0.5, 0], [0.9, 0.35], [0.5, 0.75], [0.9, 1.15], [0.5, 1.6], [0.1, 1.4]]], 4: [[[0.7, 1.6], [0.7, 0], [0.05, 1.1], [0.95, 1.1]]], 5: [[[0.9, 0], [0.15, 0], [0.1, 0.7], [0.6, 0.6], [0.9, 1.0], [0.6, 1.6], [0.1, 1.45]]], 6: [[[0.85, 0.15], [0.45, 0], [0.1, 0.6], [0.1, 1.3], [0.5, 1.6], [0.9, 1.25], [0.6, 0.8], [0.1, 1.0]]], 7: [[[0.05, 0], [0.95, 0], [0.35, 1.6]]], 8: [[[0.5, 0.75], [0.15, 0.4], [0.5, 0], [0.85, 0.4], [0.5, 0.75], [0.1, 1.15], [0.5, 1.6], [0.9, 1.15], [0.5, 0.75]]], 9: [[[0.9, 0.6], [0.5, 0.85], [0.1, 0.5], [0.5, 0], [0.9, 0.35], [0.85, 1.1], [0.4, 1.6]]],
    G: [[[0.9, 0.25], [0.5, 0], [0.1, 0.35], [0.1, 1.25], [0.5, 1.6], [0.9, 1.3], [0.9, 0.9], [0.55, 0.9]]], B: [[[0.15, 0], [0.15, 1.6], [0.65, 1.6], [0.9, 1.2], [0.65, 0.8], [0.15, 0.8]], [[0.15, 0], [0.6, 0], [0.85, 0.4], [0.6, 0.8]]], P: [[[0.15, 1.6], [0.15, 0], [0.65, 0], [0.9, 0.4], [0.65, 0.8], [0.15, 0.8]]],
    '<>': [[[0.45, 0.3], [0.05, 0.8], [0.45, 1.3], [0.45, 0.3]], [[0.55, 0.3], [0.95, 0.8], [0.55, 1.3], [0.55, 0.3]]], '><': [[[0.05, 0.3], [0.45, 0.8], [0.05, 1.3], [0.05, 0.3]], [[0.95, 0.3], [0.55, 0.8], [0.95, 1.3], [0.95, 0.3]]], bell: [[[0.2, 1.2], [0.3, 0.4], [0.5, 0.2], [0.7, 0.4], [0.8, 1.2], [0.2, 1.2]], [[0.42, 1.35], [0.58, 1.35]]] };
  var o = PX.canvas(C, VW, VH, '#333'), PW = o.PW, PH = o.PH, ppm = PW / FW, N = PW * PH, ENG = new Float32Array(N), BID = new Int16Array(N).fill(-1);
  btns.forEach(function (b, bi) {
    var s = b.lab, h = BR * 0.62, isSym = s === '<>' || s === '><' || s === 'bell', chars = isSym ? [s] : s.split(''), cw = h / 1.6 * 0.9, gap = h * 0.12, tw = chars.length * cw + (chars.length - 1) * gap;
    chars.forEach(function (ch, ci) { (G[ch] || []).forEach(function (st) { var pts = st.map(function (p) { return [(b.x - tw / 2 + ci * (cw + gap) + p[0] * cw) * ppm, (b.y - h / 2 + p[1] / 1.6 * h) * ppm]; }); PX.line(ENG, PW, PH, pts, 1.1 * ppm, 1); }); });
    PX.forDisc(b.x * ppm, b.y * ppm, (BR + 3) * ppm, PW, PH, function (I) { BID[I] = bi; });
  });
  var seed = RS.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), env = RS.range(0, 1), panelTint = RS.pick([[1, 1, 1], [1.02, 0.98, 0.92], [0.97, 0.99, 1.02]]), infill = PX.col(RS.pick(['#141414', '#1a1a1a', '#7a1010']));
  function steel(X, Y, polish) {   // brushed stainless: horizontal grain, a soft reflection of the lit car interior
    var grain = PX.vnoise(X * 0.15, Y * 9, seed) * 0.6 + PX.vnoise(X * 0.6, Y * 30, seed + 1) * 0.4, refl = 0.32 + 0.22 * Math.sin((Y / FH * 2.2 + env) * PI) + 0.12 * sstep(0.3, 0.7, X / FW);
    var v = refl * (1 + (0.22 * grain) * (1 - polish)) + polish * 0.18 * Math.exp(-Math.pow((X - FW * 0.45) / 40, 2)); return v;
  }
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppm, Y = (py + 0.5) / ppm, v = steel(X, Y, 0), r, g, b, bi = BID[I];
    r = v * panelTint[0]; g = v * panelTint[1]; b = v * panelTint[2];
    if (bi >= 0) {
      var bt = btns[bi], dx = X - bt.x, dy = Y - bt.y, d = Math.hypot(dx, dy), w = bt.w;
      if (d < BR + 3) {
        // the collar between panel and button: a dark gap, then the bevelled rim of the button
        if (d > BR + 0.8) { var gp = sstep(BR + 0.8, BR + 1.6, d) * sstep(BR + 3, BR + 2.2, d); r *= 1 - 0.75 * gp; g *= 1 - 0.75 * gp; b *= 1 - 0.75 * gp; }
        else {
          var rim = sstep(BR - 1.6, BR, d), nY = dy / Math.max(d, 1e-3) * rim, shade = 1 - 0.35 * nY + 0.1 * (1 - rim);
          // centre of the finger's contact sits a little below middle; wear polishes and removes infill from there out
          var cdx = dx, cdy = dy - BR * 0.08, cd = Math.hypot(cdx * 1.1, cdy) / BR, contact = Math.exp(-cd * cd / 0.25), polish = clamp(w * (0.35 + 0.9 * contact), 0, 1) * (1 - rim);
          v = steel(X + bt.x * 0.3, Y, polish) * shade; r = v * panelTint[0]; g = v * panelTint[1]; b = v * panelTint[2];
          var e = ENG[I], keep = 1 - sstep(0.35, 0.95, w * (0.25 + contact * 1.1) + 0.25 * PX.vnoise(X * 3, Y * 3, seed + bi));
          if (e > 0) { var t = e * keep; r = lerp(r * 0.55, infill[0], t); g = lerp(g * 0.55, infill[1], t); b = lerp(b * 0.55, infill[2], t); }   // engraving: dark groove where the paint has gone
          var oil = w * 0.18 * Math.exp(-Math.pow((cd - 0.75) / 0.25, 2)) * (0.6 + 0.4 * PX.vnoise(X * 1.5, Y * 1.5, seed + 7)); r *= 1 - oil; g *= 1 - oil; b *= 1 - oil * 0.9;
          // braille dots beside the label (raised, left of centre)
          for (var dd = 0; dd < 3; dd++) { var bxx = bt.x - BR * 0.72, byy = bt.y - 2.5 + dd * 2.5, db = Math.hypot(X - bxx, Y - byy); if (db < 0.75 && PX.ihash(bi * 7 + dd) > 0.35) { var lit = 1 + 0.6 * (byy - Y) / 0.75; r *= lit; g *= lit; b *= lit; } }
        }
      }
    }
    // panel edge and the car wall beyond
    var edge = Math.min(X - 8, FW - 8 - X, Y - 6, FH - 6 - Y); if (edge < 0) { var wl = 0.12 + 0.05 * PX.fbm(X * 0.05, Y * 0.05, seed + 9, 3); r = wl * 0.95; g = wl * 0.93; b = wl * 0.9; } else if (edge < 0.8) { r *= 0.5; g *= 0.5; b *= 0.5; }
    // screws
    [[14, 12], [FW - 14, 12], [14, FH - 12], [FW - 14, FH - 12]].forEach(function (sc) { var ds = Math.hypot(X - sc[0], Y - sc[1]); if (ds < 2.2) { var sh2 = ds < 0.45 || Math.abs((X - sc[0]) - (Y - sc[1])) < 0.35 && ds < 1.8 ? 0.4 : 0.9 - 0.3 * (Y - sc[1]) / 2.2; r *= sh2; g *= sh2; b *= sh2; } });
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  C.features({ Building: kind, Floors: nF, Years: years, Note: event, 'Close Door': impatient ? 'Worn Smooth' : 'Used', Basement: basement ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.25, filmic: true, grain: 0.012, vig: 0.3, seed: 19 });
  C.done(o.cv.canvas, 'ground-floor');
})();

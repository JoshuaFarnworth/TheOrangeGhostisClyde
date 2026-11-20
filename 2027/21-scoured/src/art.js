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
/* Scoured, by Clyde (2027).
 * Looking down into a stainless kitchen sink under the ceiling light. Years of scrubbing have left thousands of fine
 * scratches, invisible until the light catches them: then they form rings around its reflection.
 * Engine: each scratch is a tiny groove that reflects light like a thin cylinder, so it glints only where its
 * direction is perpendicular to the line joining it to the light's mirror image; across a field of randomly
 * oriented scratches that selects arcs centred on the highlight (the familiar halo on brushed metal and old pans).
 * Scratches come from use: circular strokes of a scouring pad where pans are washed, short back-and-forth strokes
 * around the drain, long drags from cutlery and pan edges. More years, more scratches; steel wool cuts deeper. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RU = R.fork('use'), RL = R.fork('light'), RS = R.fork('sink');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1400, VH = 1050, FW = 60, FH = 45;   // cm
  var years = RU.weighted([['A Year', 26], ['Ten Years', 46], ['Thirty Years', 28]]), pad = RU.weighted([['Green Pad', 46], ['Steel Wool', 22], ['Cloth Only', 32]]);
  var pans = RU.weighted([['Washes Pans In It', 60], ['Mostly Cups', 40]]), drainPos = RS.weighted([['Centre', 50], ['Back Corner', 50]]);
  var bw = RS.range(40, 48), bh = RS.range(32, 38), bx = (FW - bw) / 2, by = (FH - bh) / 2, cr = RS.range(3, 6);
  var dx0 = drainPos === 'Centre' ? bx + bw / 2 : bx + bw - 7, dy0 = drainPos === 'Centre' ? by + bh / 2 + 3 : by + 7;
  var lx = bx + bw * RL.range(0.25, 0.75), ly = by + bh * RL.range(0.25, 0.7), lampR = RL.range(1.2, 2.5);   // mirror image of the ceiling lamp
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH, GL = new Float32Array(N), DK = new Float32Array(N);
  var n = Math.round({ 'A Year': 1500, 'Ten Years': 6000, 'Thirty Years': 12000 }[years] * (pad === 'Steel Wool' ? 1.4 : pad === 'Cloth Only' ? 0.35 : 1) * RU.range(0.8, 1.2) * 3);
  var depth = pad === 'Steel Wool' ? 1 : pad === 'Green Pad' ? 0.7 : 0.45;
  function inside(x, y) { var ex = Math.max(0, Math.abs(x - bx - bw / 2) - (bw / 2 - cr)), ey = Math.max(0, Math.abs(y - by - bh / 2) - (bh / 2 - cr)); return Math.hypot(ex, ey) < cr - 0.3; }
  function scratch(pts0, a) { var pts = [pts0[0]]; for (var q = 1; q < pts0.length; q++) { var A = pts0[q - 1], B = pts0[q], m = Math.max(1, Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]) / 0.35)); for (var z = 1; z <= m; z++) pts.push([lerp(A[0], B[0], z / m), lerp(A[1], B[1], z / m)]); }   // per segment glint: perpendicular-to-radial selects the halo; falls off away from the highlight
    for (var k = 1; k < pts.length; k++) { var p0 = pts[k - 1], p1 = pts[k]; if (!inside(p0[0], p0[1]) || !inside(p1[0], p1[1])) continue;
      var tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.hypot(tx, ty) + 1e-6, mx = (p0[0] + p1[0]) / 2 - lx, my = (p0[1] + p1[1]) / 2 - ly, ml = Math.hypot(mx, my) + 1e-6, c = (tx * mx + ty * my) / (tl * ml);
      var g = Math.exp(-c * c / 0.0012) * a / (1 + ml * ml / 150) * 3.0;
      PX.line(GL, PW, PH, [[p0[0] * ppc, p0[1] * ppc], [p1[0] * ppc, p1[1] * ppc]], 0.6, g * Math.min(1, 0.012 * ppc / 0.6));
      PX.line(DK, PW, PH, [[p0[0] * ppc, p0[1] * ppc], [p1[0] * ppc, p1[1] * ppc]], Math.max(0.5, 0.01 * ppc), 0.25 * a); } }
  var panX = bx + bw * RU.range(0.3, 0.7), panY = by + bh * RU.range(0.35, 0.65);
  for (var i = 0; i < n; i++) {
    var kind = RU.rand(), a = depth * RU.range(0.4, 1);
    if (kind < (pans === 'Washes Pans In It' ? 0.6 : 0.3)) {   // scouring circles where the pan sits
      var cx = panX + RU.gaussian(0, 6), cy = panY + RU.gaussian(0, 5), rr = RU.range(1.5, 6), a0 = RU.range(0, 2 * PI), sw = RU.range(0.6, 2.4), pts = [];
      for (var k = 0; k <= 10; k++) { var t = a0 + sw * k / 10; pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * RU.range(0.95, 1.05)]); }
      scratch(pts, a);
    } else if (kind < 0.85) {   // back-and-forth near the drain and around the basin
      var near = RU.chance(0.5), px = near ? dx0 + RU.gaussian(0, 6) : bx + RU.range(2, bw - 2), py = near ? dy0 + RU.gaussian(0, 6) : by + RU.range(2, bh - 2), ang = RU.range(0, PI), L = RU.range(1, 5);
      scratch([[px - Math.cos(ang) * L / 2, py - Math.sin(ang) * L / 2], [px + Math.cos(ang) * L / 2, py + Math.sin(ang) * L / 2]], a * 0.8);
    } else {   // long drags: knives, pan edges
      var qx = bx + RU.range(3, bw - 3), qy = by + RU.range(3, bh - 3), an = RU.range(0, PI), Ln = RU.range(6, 20), bend = RU.gaussian(0, 0.02), pts2 = [];
      for (var k2 = 0; k2 <= 8; k2++) { var s2 = (k2 / 8 - 0.5) * Ln, aa = an + bend * s2; pts2.push([qx + Math.cos(aa) * s2, qy + Math.sin(aa) * s2]); }
      scratch(pts2, a * 1.2);
    }
  }
  var seed = RS.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), warm = RL.chance(0.6) ? [1, 0.88, 0.72] : [0.92, 0.97, 1];
  var counter = PX.col(RS.pick(['#2a2a2a', '#d9d4c8', '#5b4733', '#e9e7e2']));
  for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
    var I = py2 * PW + px2, X = (px2 + 0.5) / ppc, Y = (py2 + 0.5) / ppc, r, g, b;
    var ex = Math.max(0, Math.abs(X - bx - bw / 2) - (bw / 2 - cr)), ey = Math.max(0, Math.abs(Y - by - bh / 2) - (bh / 2 - cr)), sd = Math.hypot(ex, ey) - cr;
    if (sd > 3.5) { var ct = 0.92 + 0.08 * PX.fbm(X * 0.2, Y * 0.2, seed, 3); r = counter[0] * ct; g = counter[1] * ct; b = counter[2] * ct; Rr[I] = r * 0.8; Gg[I] = g * 0.8; Bb[I] = b * 0.8; continue; }
    if (sd > -0.3) { var lip = 0.25 + 0.35 * Math.exp(-Math.pow((sd - 1.5) / 0.8, 2)); Rr[I] = lip * warm[0]; Gg[I] = lip * warm[1]; Bb[I] = lip * warm[2]; continue; }   // rolled rim
    // basin floor: dark mirror of the kitchen; walls near the edge reflect brighter; the lamp's reflection
    var wall = sstep(-6, 0, sd), env = 0.05 + 0.06 * PX.fbm(X * 0.04, Y * 0.04, seed + 1, 3) + 0.18 * wall, dl = Math.hypot(X - lx, Y - ly);
    var lamp = 6 * sstep(lampR, lampR * 0.7, dl) + 0.18 * Math.exp(-dl * dl / 40), haze = 0.08 / (1 + dl * dl / 60);
    var brushed = 0.9 + 0.1 * PX.vnoise(X * 0.3, Y * 12, seed + 2);
    var v = env * brushed + lamp + haze + GL[I] * 0.9 * (1 + 2 * Math.exp(-dl * dl / 30)) - DK[I] * env * 0.5;
    var dd = Math.hypot(X - dx0, Y - dy0); if (dd < 4.5) { if (dd < 3.2) { var hole = Math.hypot(((X - dx0) % 0.8 + 0.8) % 0.8 - 0.4, ((Y - dy0) % 0.8 + 0.8) % 0.8 - 0.4) < 0.17, grate = hole ? 0.01 : 0.1 * brushed; v = dd < 2.9 ? grate : 0.3; } else v *= 0.6 + 0.4 * (dd - 3.2) / 1.3; }
    var spot = 0; Rr[I] = v * warm[0]; Gg[I] = v * warm[1]; Bb[I] = v * warm[2];
  }
  C.features({ Used: years, Scourer: pad, 'In The Sink': pans, Drain: drainPos, Light: warm[0] > 0.95 ? 'Warm Bulb' : 'Cool Light' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.3, filmic: true, grain: 0.01, vig: 0.35, seed: 21 });
  C.done(o.cv.canvas, 'scoured');
})();

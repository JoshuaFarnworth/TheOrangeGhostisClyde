/* Fogged, by Clyde (2027).
 * The inside of a window on a winter night, fogged with breath and kettle steam. Someone wiped a little of it to
 * look out; it is already closing up again.
 * Engine: a breath-figure simulation. Droplets nucleate on the cold glass, grow by condensation, and coalesce when
 * they touch (volume-conserving merges at the volume-weighted centre), so the population becomes the bimodal,
 * self-similar mosaic real fog has; new nuclei appear in the gaps that merges open. Drops past a critical radius
 * slide, sweeping a clear track that re-fogs finer. A wipe removes everything at a moment in the past and the
 * process restarts there, so the wiped shape is visible only as younger, finer fog. Each resolved drop is a lens
 * that shows a tiny inverted image of the out-of-focus street behind; unresolved fog scatters it into a veil. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RS = R.fork('scene'), RD = R.fork('drops'), RH = R.fork('hand');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1250, GWc = 30, GHc = 37.5;   // glass in cm
  var Q = C.platform === 'standalone' ? C.query : null;
  var scene = RS.weighted([['Bus Window', 36], ['Kitchen Window', 34], ['Café Window', 30]]);
  var trace = RH.weighted([['Peephole', 30], ['One Finger', 24], ['Sleeve Wipe', 22], ['Nothing', 14], ['Small Hand', 10]]);
  var steam = RD.weighted([['Light Fog', 30], ['Fogged', 46], ['Streaming', 24]]);
  if (Q && Q.get('trace')) trace = Q.get('trace'); if (Q && Q.get('scene')) scene = Q.get('scene');
  // ---------------- the street behind (out of focus) ----------------
  var o = PX.canvas(C, VW, VH, '#07080b'), PW = o.PW, PH = o.PH, cmpp = GWc / PW;
  var BW = Math.ceil(PW / 2), BH = Math.ceil(PH / 2), BR = new Float32Array(BW * BH), BG = new Float32Array(BW * BH), BB = new Float32Array(BW * BH);
  var lights = [], nL = scene === 'Kitchen Window' ? RS.int(3, 7) : RS.int(12, 26), hz = RS.range(0.45, 0.7);
  var pal = { sodium: [1, 0.55, 0.18], led: [0.9, 0.93, 1], tail: [1, 0.08, 0.05], green: [0.1, 1, 0.45], amber: [1, 0.7, 0.1], warm: [1, 0.78, 0.5], cyan: [0.3, 0.9, 1] };
  for (var k = 0; k < nL; k++) {
    var kind = scene === 'Kitchen Window' ? RS.weighted([['warm', 5], ['sodium', 2], ['led', 1]]) : RS.weighted([['sodium', 4], ['led', 3], ['tail', 2], ['warm', 3], ['green', 0.6], ['amber', 0.6], ['cyan', 0.6]]);
    var y = hz + RS.gaussian(0, 0.12), x = RS.rand(), rad = RS.range(0.035, 0.09) * (scene === 'Kitchen Window' ? 1.3 : 1), I0 = RS.pareto(0.4, 1.6);
    lights.push({ x: x, y: y, r: rad, c: pal[kind], i: Math.min(I0, 3) });
    if (kind === 'tail' && RS.chance(0.7)) lights.push({ x: x + RS.range(0.08, 0.12), y: y, r: rad, c: pal.tail, i: Math.min(I0, 3) });
  }
  if (scene !== 'Kitchen Window') { var signY = RS.range(0.25, 0.4), sx = RS.range(0.1, 0.6); for (var s = 0; s < 6; s++) lights.push({ x: sx + s * 0.05, y: signY, r: 0.05, c: pal[RS.pick(['cyan', 'warm', 'tail'])], i: 0.5 }); }
  var amb = scene === 'Kitchen Window' ? [0.01, 0.012, 0.02] : [0.03, 0.03, 0.045];
  for (var by = 0; by < BH; by++) for (var bx = 0; bx < BW; bx++) {
    var u = bx / BW, v = by / BH * VH / VW, I = by * BW + bx, glow = Math.exp(-Math.pow((v / (VH / VW) - hz) / 0.25, 2));
    var r = amb[0] * (1 + 2 * glow), g = amb[1] * (1 + 1.6 * glow), b = amb[2] * (1 + 1.2 * glow);
    for (var k2 = 0; k2 < lights.length; k2++) { var L = lights[k2], d = Math.hypot(u - L.x, v - L.y * VH / VW) / L.r; if (d < 1.3) { var disc = sstep(1.0, 0.92, d) * (0.85 + 0.25 * sstep(0.6, 0.95, d)); r += L.c[0] * L.i * disc; g += L.c[1] * L.i * disc; b += L.c[2] * L.i * disc; } }
    BR[I] = r; BG[I] = g; BB[I] = b;
  }
  var FR = PX.blur(Float32Array.from(BR), BW, BH, BW * 0.05), FG = PX.blur(Float32Array.from(BG), BW, BH, BW * 0.05), FB = PX.blur(Float32Array.from(BB), BW, BH, BW * 0.05);
  // ---------------- breath figure ----------------
  var drops = [], cell = 0.5, gcx = Math.ceil(GWc / cell), gcy = Math.ceil(GHc / cell);
  var steps = { 'Light Fog': 7, 'Fogged': 10, 'Streaming': 13 }[steam];
  // the wipe: a mask in glass coordinates and the step at which it happened
  var wipeStep = trace === 'Nothing' ? -1 : RH.int(Math.floor(steps * 0.45), steps - 2), wcx = RH.range(8, 22), wcy = clamp(hz * GHc + RH.gaussian(0, 2.5), 8, GHc - 8), wr = RH.range(3, 5.5), wang = RH.range(-0.4, 0.4);
  function wiped(x, y) {
    if (trace === 'Peephole') return Math.hypot(x - wcx, (y - wcy) * 1.1) < wr + 0.4 * PX.vnoise(Math.atan2(y - wcy, x - wcx) * 3, 0, 31);
    if (trace === 'One Finger') { var d = PX.segDist(x, y, wcx, wcy - 6, wcx + Math.sin(wang) * 9, wcy + 3); return d < 0.7; }
    if (trace === 'Sleeve Wipe') { var dx = x - wcx, dy = y - wcy, rr = Math.hypot(dx, dy + 14); return Math.abs(rr - 14) < 3.2 && Math.abs(dx) < 9 + 2 * PX.vnoise(y * 0.3, 1, 32); }
    if (trace === 'Small Hand') { var pr = Math.hypot((x - wcx) / 2.3, (y - wcy) / 2.7) < 1; if (pr) return true; for (var f = 0; f < 5; f++) { var a = -PI / 2 + (f - 2) * 0.32 + (f === 0 ? 0.6 : 0), fl = f === 0 ? 2.4 : f === 2 ? 3.6 : 3.1, bxp = wcx + Math.cos(a) * 2.2, byp = wcy + Math.sin(a) * 2.4; if (PX.segDist(x, y, bxp, byp, bxp + Math.cos(a) * fl, byp + Math.sin(a) * fl) < 0.55) return true; } return false; }
    return false;
  }
  function nucleate(n, rr) { for (var i = 0; i < n; i++) drops.push({ x: RD.rand() * GWc, y: RD.rand() * GHc, r: rr * RD.range(0.6, 1.4), born: 0 }); }
  var nucDensity = 45;   // per cm^2 (resolved population only; finer fog is the veil)
  nucleate(Math.floor(GWc * GHc * nucDensity * 0.12), 0.012);
  function grid() { var G = new Array(gcx * gcy); for (var i = 0; i < drops.length; i++) { var d = drops[i]; if (d.dead) continue; var cx = clamp(Math.floor(d.x / cell), 0, gcx - 1), cy = clamp(Math.floor(d.y / cell), 0, gcy - 1), id = cy * gcx + cx; (G[id] = G[id] || []).push(i); } return G; }
  function coalesce() {
    var G = grid(), merged = 0;
    for (var i = 0; i < drops.length; i++) { var a = drops[i]; if (a.dead) continue; var cx = Math.floor(a.x / cell), cy = Math.floor(a.y / cell), reach = Math.ceil((a.r + 0.35) / cell);
      for (var yy = cy - reach; yy <= cy + reach; yy++) for (var xx = cx - reach; xx <= cx + reach; xx++) { if (xx < 0 || yy < 0 || xx >= gcx || yy >= gcy) continue; var L = G[yy * gcx + xx]; if (!L) continue;
        for (var q = 0; q < L.length; q++) { var j = L[q]; if (j <= i) continue; var b = drops[j]; if (b.dead) continue; var dd = Math.hypot(a.x - b.x, a.y - b.y); if (dd < (a.r + b.r) * 0.92) { var va = a.r * a.r * a.r, vb = b.r * b.r * b.r; a.x = (a.x * va + b.x * vb) / (va + vb); a.y = (a.y * va + b.y * vb) / (va + vb); a.r = Math.cbrt(va + vb); b.dead = true; merged++; } } } }
    return merged;
  }
  var trails = [];
  for (var st = 0; st < steps; st++) {
    drops.forEach(function (d) { if (!d.dead) d.r = Math.cbrt(d.r * d.r * d.r + 0.00009 * (1 + RD.rand() * 0.6)) ; });   // condensation: volume growth
    coalesce(); coalesce();
    if (st === wipeStep) drops.forEach(function (d) { if (!d.dead && wiped(d.x, d.y)) d.dead = true; });
    // sliding: big drops run down, eating what they touch, leaving a clear track
    var rc = 0.17;
    drops.forEach(function (d) { if (d.dead || d.r < rc) return; var x0 = d.x, y0 = d.y, len = RD.range(2, 14) * (d.r / rc); d.y = Math.min(GHc + 1, d.y + len); d.x += RD.gaussian(0, 0.25); trails.push({ x0: x0, y0: y0, x1: d.x, y1: d.y, w: d.r * 0.9, st: st });
      drops.forEach(function (e) { if (e === d || e.dead) return; if (PX.segDist(e.x, e.y, x0, y0, d.x, d.y) < d.r * 0.9 + e.r) { d.r = Math.cbrt(d.r * d.r * d.r + e.r * e.r * e.r * 0.5); e.dead = true; } }); if (d.y > GHc) d.dead = true; });
    drops = drops.filter(function (d) { return !d.dead; });
    // new nuclei in the gaps
    var fresh = Math.floor(GWc * GHc * nucDensity * 0.06); nucleate(fresh, 0.012);
    coalesce(); drops = drops.filter(function (d) { return !d.dead; });
  }
  // ---------------- render ----------------
  var ID = new Int32Array(PW * PH).fill(-1);
  drops.forEach(function (d, i) { PX.forDisc(d.x / cmpp, d.y / cmpp, d.r / cmpp + 0.5, PW, PH, function (p) { ID[p] = i; }); });
  // unresolved fog veil: older glass carries more; wiped and trailed glass is younger
  var VE = new Float32Array(PW * PH), baseVeil = { 'Light Fog': 0.45, 'Fogged': 0.75, 'Streaming': 0.85 }[steam];
  for (var p = 0; p < PW * PH; p++) { var x = (p % PW) * cmpp, y = ((p / PW) | 0) * cmpp, ve = baseVeil * (0.85 + 0.15 * PX.fbm(x * 0.3, y * 0.3, 41, 3));
    if (wipeStep >= 0 && wiped(x, y)) ve *= (steps - wipeStep) / steps * 0.7;
    VE[p] = ve; }
  trails.forEach(function (t) { var age = (steps - t.st) / steps; var x0 = Math.floor(Math.min(t.x0, t.x1) / cmpp - t.w / cmpp - 2), x1 = Math.ceil(Math.max(t.x0, t.x1) / cmpp + t.w / cmpp + 2), y0 = Math.floor(t.y0 / cmpp), y1 = Math.min(PH - 1, Math.ceil(t.y1 / cmpp));
    for (var yy = Math.max(0, y0); yy <= y1; yy++) for (var xx = Math.max(0, x0); xx <= Math.min(PW - 1, x1); xx++) { var d = PX.segDist(xx * cmpp, yy * cmpp, t.x0, t.y0, t.x1, t.y1); if (d < t.w) { var i2 = yy * PW + xx; VE[i2] = Math.min(VE[i2], baseVeil * age * 0.6); } } });
  PX.blur(VE, PW, PH, 1.2);
  var Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH), inside = scene === 'Kitchen Window' ? [0.05, 0.04, 0.03] : [0.035, 0.035, 0.04];
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I2 = py * PW + px, id = ID[I2], bxx = px / 2, byy = py / 2, r, g, b, ve = VE[I2];
    if (id >= 0) {   // a resolved drop: a lens. Inverted, compressed image of what is behind it, dark rim
      var d = drops[id], dx = px * cmpp - d.x, dy = py * cmpp - d.y, rn = Math.hypot(dx, dy) / d.r, sx = (d.x / cmpp - dx / cmpp * 6) / 2, sy = (d.y / cmpp - dy / cmpp * 6) / 2;
      var br = PX.bil(BR, BW, BH, sx, sy), bg = PX.bil(BG, BW, BH, sx, sy), bb = PX.bil(BB, BW, BH, sx, sy), fr = PX.bil(FR, BW, BH, bxx, byy), fg = PX.bil(FG, BW, BH, bxx, byy), fb = PX.bil(FB, BW, BH, bxx, byy);
      var rim = sstep(0.75, 1.0, rn) * 0.6, core = 1 - rim;
      r = (lerp(fr, br, 0.75) * core * 0.9 + inside[0] * 0.6) * (1 - 0.85 * rim) + fr * 0.15 * rim; g = (lerp(fg, bg, 0.75) * core * 0.9 + inside[1] * 0.6) * (1 - 0.85 * rim) + fg * 0.15 * rim; b = (lerp(fb, bb, 0.75) * core * 0.9 + inside[2] * 0.6) * (1 - 0.85 * rim) + fb * 0.15 * rim;
      var hl = Math.exp(-Math.pow((dx / d.r + 0.35), 2) / 0.02 - Math.pow((dy / d.r + 0.35), 2) / 0.02) * 0.08; r += hl; g += hl; b += hl;
    } else {
      var sr = PX.bil(BR, BW, BH, bxx, byy), sg = PX.bil(BG, BW, BH, bxx, byy), sb = PX.bil(BB, BW, BH, bxx, byy), fr2 = PX.bil(FR, BW, BH, bxx, byy), fg2 = PX.bil(FG, BW, BH, bxx, byy), fb2 = PX.bil(FB, BW, BH, bxx, byy);
      var fine = 0.9 + 0.2 * PX.vnoise(px * cmpp * 40, py * cmpp * 40, 43);
      r = lerp(sr, fr2 * 1.1 + inside[0] * 2.5 * fine, ve); g = lerp(sg, fg2 * 1.1 + inside[1] * 2.5 * fine, ve); b = lerp(sb, fb2 * 1.1 + inside[2] * 2.5 * fine, ve);
    }
    Rr[I2] = r; Gg[I2] = g; Bb[I2] = b;
  }
  C.features({ Window: scene, Trace: trace, Fog: steam, Runs: trails.length > 12 ? 'Many' : trails.length > 3 ? 'Some' : 'Few' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.6, filmic: true, grain: 0.02, vig: 0.25, seed: 29 });
  C.done(o.cv.canvas, 'fogged');
})();

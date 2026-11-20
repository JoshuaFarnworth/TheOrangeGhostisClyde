/* Creases, by Clyde (2027).
 * A letter, face down on a table: you only ever see the back of it. How many times it was opened is in the folds.
 * Engine: a fold history. Each fold is a line with a side (mountain/valley) and a count; paper keeps a residual
 * angle after unfolding, so the relief is a sum of softened V-sections whose sharpness grows and whose fibres break
 * (whitening) with every refold, worst where two creases cross. A refold off the original line leaves a doubled
 * crease. Writing on the front is laid down by a two-oscillator pen model (handwriting as coupled horizontal and
 * vertical oscillation plus drift) and shows through the sheet mirrored and diffused. Raking light from one side,
 * with heightfield self-shadowing. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RF = R.fork('folds'), RP = R.fork('paper'), RW = R.fork('writing'), RL = R.fork('light');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1250, FW = 26, FH = 32.5;   // frame in cm; the sheet sits inside it on a table
  var Q = C.platform === 'standalone' ? C.query : null;
  var paper = RP.weighted([['Airmail', 22], ['Laid Cream', 26], ['Lined Pad', 26], ['Typing Paper', 26]]);
  var fold = RF.weighted([['Tri-fold', 38], ['Quartered', 30], ['Tri-fold, Halved', 20], ['Refolded Wrong', 12]]);
  var handled = RF.weighted([['Read Once', 30], ['Reread', 44], ['Carried For Years', 26]]);
  if (Q && Q.get('fold')) fold = Q.get('fold'); if (Q && Q.get('handled')) handled = Q.get('handled');
  var SW = paper === 'Airmail' ? 21 : RP.pick([21, 21.6]), SH = paper === 'Airmail' ? 27.5 : SW === 21 ? 29.7 : 27.9;
  var rot = RP.gaussian(0, 0.03), ox = (FW - SW) / 2 + RP.gaussian(0, 0.6), oy = (FH - SH) / 2 + RP.gaussian(0, 0.5);
  var times = { 'Read Once': 1, 'Reread': RF.int(4, 12), 'Carried For Years': RF.int(30, 80) }[handled];
  // folds in sheet coords (cm): {nx, ny, c (n.p = c), s: +1 mountain -1 valley, k: sharpness}
  var F = [];
  function addF(nx, ny, c, s, k) { F.push({ nx: nx, ny: ny, c: c, s: s, k: k }); }
  var kk = Math.min(1, 0.35 + Math.log(1 + times) * 0.18);
  if (/Tri-fold/.test(fold)) { addF(0, 1, SH / 3 + RF.gaussian(0, 0.25), 1, kk); addF(0, 1, 2 * SH / 3 + RF.gaussian(0, 0.25), -1, kk); }
  if (fold === 'Tri-fold, Halved') addF(1, 0, SW / 2 + RF.gaussian(0, 0.3), 1, kk * 0.9);
  if (fold === 'Quartered') { addF(0, 1, SH / 2 + RF.gaussian(0, 0.2), 1, kk); addF(1, 0, SW / 2 + RF.gaussian(0, 0.25), -1, kk * 0.95); }
  if (fold === 'Refolded Wrong') { var y1 = SH / 3 + RF.gaussian(0, 0.2), y2 = 2 * SH / 3; addF(0, 1, y1, 1, kk); addF(0, 1, y2, -1, kk); var a = RF.gaussian(0, 0.03); addF(Math.sin(a), Math.cos(a), y1 + RF.range(0.4, 1.1), 1, kk * 0.5); addF(0, 1, y2 - RF.range(0.3, 0.9), -1, kk * 0.45); }
  F.forEach(function (f) { var a = RF.gaussian(0, 0.008); var nx = f.nx * Math.cos(a) - f.ny * Math.sin(a), ny = f.nx * Math.sin(a) + f.ny * Math.cos(a); f.nx = nx; f.ny = ny; });
  var crumple = handled === 'Carried For Years' && RF.chance(0.35), CR = [];
  if (crumple) for (var c = 0; c < 70; c++) { var a2 = RF.range(0, PI), cx = RF.range(0, SW), cy = RF.range(0, SH); CR.push({ nx: Math.cos(a2), ny: Math.sin(a2), cx: cx, cy: cy, L: RF.range(1, 5), s: RF.pick([-1, 1]), a: RF.range(0.02, 0.06) }); }

  // ---------------- writing on the front ----------------
  var ink = PX.blur, IW = 420, IH = Math.round(420 * SH / SW), INK = new Float32Array(IW * IH), cmI = SW / IW;
  var lineH = paper === 'Lined Pad' ? 0.8 : RW.range(0.75, 1.0), margin = RW.range(1.8, 2.6), nLines = Math.floor((SH - 5) / lineH * RW.range(0.55, 0.95));
  var xh = lineH * RW.range(0.26, 0.34), slant = RW.range(0.1, 0.35), freq = RW.range(2.6, 3.4) / xh;
  for (var L = 0; L < nLines; L++) {
    var by = 3.6 + L * lineH, x = margin + (L === 0 ? 0 : RW.range(0, 0.4)), end = SW - margin - RW.range(0, 2.5); if (L === nLines - 1) end = margin + RW.range(3, 9);
    var ph = RW.range(0, 6.28), t = 0, word = RW.range(1.0, 3.5);
    while (x < end) {
      var ax = 0.35 * xh * Math.sin(t * 1.0 + ph), ay = xh * 0.5 * (1 + Math.sin(t * 2.0 + ph + 1.2)) * (0.8 + 0.4 * PX.vnoise(t * 0.3, L, 5));
      var asc = Math.max(0, PX.vnoise(t * 0.45, L * 3, 9) - 0.45) * xh * 3.2, des = Math.max(0, PX.vnoise(t * 0.4, L * 3, 19) - 0.5) * xh * 2.6;
      var yy = by - ay - (Math.sin(t * 2.0 + ph + 1.2) > 0.7 ? asc : 0) + (Math.sin(t * 2.0 + ph + 1.2) < -0.8 ? des : 0), xx = x + ax + slant * (by - yy);
      var ix = Math.round(xx / cmI), iy = Math.round(yy / cmI); if (ix >= 0 && iy >= 0 && ix < IW && iy < IH) INK[iy * IW + ix] += 0.35;
      t += 0.16; x += 0.16 / freq * 1.0;
      word -= 0.16 / freq; if (word < 0) { x += RW.range(0.25, 0.5); word = RW.range(0.8, 3.5); }
    }
  }
  PX.blur(INK, IW, IH, 1.6);   // through the sheet: diffused
  var imax = 0; for (var q0 = 0; q0 < INK.length; q0++) if (INK[q0] > imax) imax = INK[q0]; for (q0 = 0; q0 < INK.length; q0++) INK[q0] = Math.min(1, INK[q0] / (imax * 0.55 + 1e-6));

  // ---------------- relief + render ----------------
  var o = PX.canvas(C, VW, VH, '#141210'), PW = o.PW, PH = o.PH, cmpp = FW / PW, Hm = new Float32Array(PW * PH), inS = new Uint8Array(PW * PH), WEAR = new Float32Array(PW * PH);
  var cr = Math.cos(rot), sr = Math.sin(rot);
  function sheet(X, Y) { var dx = X - ox - SW / 2, dy = Y - oy - SH / 2; return [dx * cr + dy * sr + SW / 2, -dx * sr + dy * cr + SH / 2]; }
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, s = sheet(px * cmpp, py * cmpp), u = s[0], v = s[1];
    // carried for years: corners round off
    var cornerR = handled === 'Carried For Years' ? 0.6 : 0.05, cu = Math.max(0, Math.max(cornerR - u, u - (SW - cornerR))), cv = Math.max(0, Math.max(cornerR - v, v - (SH - cornerR)));
    if (u < 0 || v < 0 || u > SW || v > SH || Math.hypot(cu, cv) > cornerR) continue; inS[I] = 1;
    var h = 0, wear = 0;
    for (var k = 0; k < F.length; k++) { var f = F[k], d = f.nx * u + f.ny * v - f.c, w = 0.05 + 0.25 * (1 - f.k); h += f.s * f.k * 0.22 * (Math.sqrt(d * d + w * w) - w) * Math.exp(-Math.abs(d) / 5); wear += f.k * Math.exp(-Math.abs(d) / 0.04) * Math.log(1 + times) / 4.5; }
    for (var k2 = 0; k2 < F.length; k2++) for (var k3 = k2 + 1; k3 < F.length; k3++) { var d2 = Math.abs(F[k2].nx * u + F[k2].ny * v - F[k2].c), d3 = Math.abs(F[k3].nx * u + F[k3].ny * v - F[k3].c); if (Math.abs(F[k2].nx * F[k3].nx + F[k2].ny * F[k3].ny) < 0.5) wear += Math.exp(-(d2 + d3) / 0.12) * Math.log(1 + times) / 2.5; }
    for (var k4 = 0; k4 < CR.length; k4++) { var q = CR[k4], du = u - q.cx, dv = v - q.cy, along = -du * q.ny + dv * q.nx; if (Math.abs(along) > q.L) continue; var dd = du * q.nx + dv * q.ny; h += q.s * q.a * (Math.sqrt(dd * dd + 0.01) - 0.1) * Math.exp(-Math.abs(dd) / 1.2) * sstep(q.L, q.L * 0.5, Math.abs(along)); }
    h += 0.05 * PX.fbm(u * 0.3, v * 0.3, 3, 3);   // the sheet never lies quite flat
    Hm[I] = h; WEAR[I] = wear;
  }
  // light: low raking from the left-ish
  var la = RL.range(-0.35, 0.35) + PI, lel = RL.range(0.12, 0.22), Lx = Math.cos(la) * Math.cos(lel), Ly = Math.sin(la) * Math.cos(lel), Lz = Math.sin(lel);
  var pc = PX.col({ 'Airmail': '#cfdbe6', 'Laid Cream': '#ece2cc', 'Lined Pad': '#f0eee6', 'Typing Paper': '#efede6' }[paper]), inkC = RW.pick([[0.55, 0.62, 0.8], [0.6, 0.66, 0.74], [0.72, 0.68, 0.62]]);
  var show = paper === 'Airmail' ? 0.32 : paper === 'Laid Cream' ? 0.12 : 0.16, tbl = PX.col(RP.pick(['#3a2a20', '#2b2c2e', '#4a3828']));
  var Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  // shadow sweep along -L horizontal direction (approximate: march back toward the light)
  for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
    var I2 = py2 * PW + px2, X = px2 * cmpp, Y = py2 * cmpp;
    if (!inS[I2]) {   // table, and the sheet's own cast shadow (it lifts a few millimetres at the folds)
      var tv = 0.8 + 0.2 * PX.fbm(X * 0.8, Y * 6, 11, 4), shd = 0;
      for (var st = 1; st < 10; st++) { var sx = Math.round(px2 + Lx * st * 0.08 / cmpp), sy = Math.round(py2 + Ly * st * 0.08 / cmpp); if (sx >= 0 && sy >= 0 && sx < PW && sy < PH && inS[sy * PW + sx]) { shd = Math.max(shd, 1 - st / 10); } }
      var l = 0.42 * (1 - 0.6 * shd); Rr[I2] = tbl[0] * tv * l; Gg[I2] = tbl[1] * tv * l; Bb[I2] = tbl[2] * tv * l; continue;
    }
    var hx = (px2 + 1 < PW && inS[I2 + 1] ? Hm[I2 + 1] : Hm[I2]) - (px2 > 0 && inS[I2 - 1] ? Hm[I2 - 1] : Hm[I2]), hy = (py2 + 1 < PH && inS[I2 + PW] ? Hm[I2 + PW] : Hm[I2]) - (py2 > 0 && inS[I2 - PW] ? Hm[I2 - PW] : Hm[I2]);
    var nx = -hx / (2 * cmpp), ny = -hy / (2 * cmpp), nl = Math.hypot(nx, ny, 1); nx /= nl; ny /= nl; var nz = 1 / nl;
    var ndl = Math.max(0, nx * Lx + ny * Ly + nz * Lz), sh = 1, h0 = Hm[I2];
    for (var st2 = 1; st2 < 40; st2++) { var d4 = st2 * 0.05, sx2 = Math.round(px2 + Lx / Math.cos(lel) * d4 / cmpp), sy2 = Math.round(py2 + Ly / Math.cos(lel) * d4 / cmpp); if (sx2 < 0 || sy2 < 0 || sx2 >= PW || sy2 >= PH || !inS[sy2 * PW + sx2]) break; if (Hm[sy2 * PW + sx2] > h0 + d4 * Math.tan(lel)) { sh = 0.35; break; } }
    var s2 = sheet(X, Y), u2 = s2[0], v2 = s2[1];
    var fib = PX.fbm(u2 * 3, v2 * 3, 21, 4) * 0.5 + 0.5, fine = PX.vnoise(u2 * 40, v2 * 40, 22);
    var r = pc[0], g = pc[1], b = pc[2], tone = 0.96 + 0.05 * fib + 0.015 * fine;
    if (paper === 'Laid Cream') { var lay = Math.sin(u2 * PI * 2 / 0.09) * 0.5 + 0.5, chain = Math.exp(-Math.pow(((u2 % 2.5) - 1.25) / 0.04, 2)); tone *= 1 - 0.012 * lay - 0.02 * chain; }
    if (paper === 'Lined Pad') { var lv = Math.abs(((v2 - 3.6 + 0.8) % 0.8) - 0.0); if (v2 > 3.0 && Math.min(lv, 0.8 - lv) < 0.02) { r *= 0.96; g *= 0.97; b *= 0.985; } }
    var iv = PX.bil(INK, IW, IH, (SW - u2) / cmI, v2 / cmI) * show;   // mirrored: we are looking at the back
    r *= 1 - iv * (1 - inkC[0]); g *= 1 - iv * (1 - inkC[1]); b *= 1 - iv * (1 - inkC[2]);
    var wr = clamp(WEAR[I2], 0, 1.2), edgeD = Math.min(u2, v2, SW - u2, SH - v2), soil = handled === 'Carried For Years' ? 0.12 * Math.exp(-edgeD / 0.8) + 0.06 * clamp(WEAR[I2], 0, 1) : 0.02 * Math.exp(-edgeD / 0.5);
    r = r * tone * (1 - soil) + 0.06 * wr; g = g * tone * (1 - soil * 1.1) + 0.06 * wr; b = b * tone * (1 - soil * 1.4) + 0.055 * wr;
    if (handled === 'Carried For Years' && wr > 0.95) { var hole = sstep(1.0, 1.15, wr + 0.1 * fine); r = lerp(r, tbl[0] * 0.3, hole); g = lerp(g, tbl[1] * 0.3, hole); b = lerp(b, tbl[2] * 0.3, hole); }
    var Lt = (0.3 + 2.4 * ndl * sh) * (paper === 'Airmail' ? 0.98 : 1);
    Rr[I2] = r * Lt; Gg[I2] = g * Lt * 0.99; Bb[I2] = b * Lt * 0.97;
  }
  C.features({ Paper: paper, Folds: fold, Handled: handled, Crumpled: crumple ? 'Once' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: true, grain: 0.012, vig: 0.3, seed: 13 });
  C.done(o.cv.canvas, 'creases');
})();

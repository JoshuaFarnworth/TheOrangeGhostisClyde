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

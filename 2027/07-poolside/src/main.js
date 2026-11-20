/* Poolside, by Clyde (2027).
 * A pool deck in the sun, from directly above, a few minutes after someone got out. Water on hot stone is a clock:
 * what they did first has already gone; what they did last is still wet.
 * Engine: one swimmer's afternoon is written as wet marks with real water volumes: drips where they climbed out,
 * a walk of barefoot prints that carry less water with every step, a body print where they lay down, a second walk
 * back. Each mark then evaporates for the minutes since it was made, at a rate set by sun or shade, so marks shrink
 * from their thin edges inward and vanish in order. The body print is contact patches (shoulder blades, hips, calves,
 * hair), not a filled silhouette. The pool floor is lit by caustics from a ripple heightfield, then absorbed by the
 * water column (red first). */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RW = R.fork('world'), RS = R.fork('swimmer'), RL = R.fork('light'), RX = R.fork('texture');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var WM = 6, HM = 7.5, VW = 1000, VH = 1250, CL = 0.01, GW = 600, GH = 750;
  var Q = C.platform === 'standalone' ? C.query : null;

  var story = RS.weighted([['Lay On The Deck', 36], ['Walked To The Lounger', 22], ['Sat On The Edge', 16], ['Gone Inside', 16], ['Ran And Jumped', 10]]);
  var minutes = RS.weighted([['Just Now', 26], ['A Few Minutes', 48], ['A While Ago', 26]]);
  var hour = RL.weighted([['High Sun', 36], ['Afternoon', 38], ['Late Sun', 26]]);
  var deck = RW.weighted([['Pavers', 38], ['Brushed Concrete', 32], ['Travertine', 30]]);
  var shade = RW.weighted([['Umbrella', 22], ['Tree Edge', 26], ['None', 52]]);
  if (Q && Q.get('story')) story = Q.get('story'); if (Q && Q.get('minutes')) minutes = Q.get('minutes');
  var poolSide = RW.pick([0, 2]), poolW = RW.range(1.6, 2.6), coping = RW.range(0.26, 0.34), depth = RW.range(1.05, 1.7);
  var sunAz = RL.range(0, 2 * PI), sunEl = { 'High Sun': RL.range(1.05, 1.25), 'Afternoon': RL.range(0.68, 0.85), 'Late Sun': RL.range(0.36, 0.5) }[hour];
  var Sx = Math.cos(sunAz) * Math.cos(sunEl), Sy = Math.sin(sunAz) * Math.cos(sunEl), Sz = Math.sin(sunEl), shx = -Sx / Sz, shy = -Sy / Sz;
  function toLocal(X, Y) { if (poolSide === 0) return [X, Y]; if (poolSide === 2) return [WM - X, HM - Y]; return [X, Y]; }
  var edgeY = poolW;
  var ladderX = RS.range(0.9, WM - 0.9);
  var plasterKind = RW.weighted([['Aged White', 46], ['Pale Green', 28], ['Pebble', 26]]);
  var umbCloth = RW.pick(['Sand', 'Olive', 'Terracotta', 'Faded Stripe']);

  // ---------------- marks ----------------
  var N = GW * GH, W0 = new Float32Array(N), AGE = new Float32Array(N);
  function stampFn(cx, cy, rad, fn, age) {
    var x0 = Math.max(0, Math.floor((cx - rad) / CL)), x1 = Math.min(GW - 1, Math.ceil((cx + rad) / CL)), y0 = Math.max(0, Math.floor((cy - rad) / CL)), y1 = Math.min(GH - 1, Math.ceil((cy + rad) / CL));
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { var v = fn((x + 0.5) * CL - cx, (y + 0.5) * CL - cy); if (v > 0.01) { var i = y * GW + x; if (age < AGE[i] || W0[i] <= 0) { AGE[i] = age; } W0[i] = Math.max(W0[i] * (age < AGE[i] ? 0.5 : 1), v); } }
  }
  function ell(u, v, a, b) { return (u * u) / (a * a) + (v * v) / (b * b); }
  function foot(cx, cy, ang, left, water, age) {
    var c = Math.cos(ang), s = Math.sin(ang), m = left ? -1 : 1, seedF = (age * 17 + cx * 13 + cy) | 0;
    stampFn(cx, cy, 0.17, function (dx, dy) {
      var u = dx * c + dy * s, v = (-dx * s + dy * c) * m, k = 0;
      k = Math.max(k, 1 - ell(u + 0.085, v, 0.04, 0.032));
      k = Math.max(k, (1 - ell(u - 0.042, v - 0.01, 0.04, 0.038)));
      k = Math.max(k, (1 - ell(u + 0.02, v - 0.028, 0.065, 0.01)) * 0.45);
      var toes = [[0.095, 0.01, 0.015], [0.088, -0.014, 0.011], [0.08, -0.03, 0.01], [0.07, -0.043, 0.009], [0.06, -0.053, 0.008]];
      for (var t = 0; t < 5; t++) k = Math.max(k, 1 - ell(u - toes[t][0], v + toes[t][1] * -1 - 0.02, toes[t][2], toes[t][2]));
      var blot = 0.7 + 0.4 * PX.vnoise(u * 50, v * 50, seedF + 3);
      // toes (positive u) carry less water and dry first; the heel and ball stay wet longer
      var toeEnd = sstep(-0.01, 0.08, u);
      return k > 0.05 ? water * (1 - 0.72 * toeEnd) * Math.pow(k, 0.75) * blot : 0;
    }, age);
  }
  function walk(a, b, water0, waterLoss, age, stride, run) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), n = Math.floor(L / stride), w = water0, seedw = RS.rand() * 100;
    for (var k = 0; k <= n; k++) { var t = k / Math.max(1, n), cx = a[0] + dx * t + Math.sin(t * 3 + seedw) * 0.12, cy = a[1] + dy * t, left = k & 1, off = (left ? 1 : -1) * 0.09;
      var px = cx - Math.sin(ang) * off, py = cy + Math.cos(ang) * off, stepAge = age + (n - k) * 0.28;
      foot(px, py, ang + (left ? 0.1 : -0.1) + RS.gaussian(0, 0.04), left, w, stepAge);
      if (RS.chance(0.12)) { var dd = RS.range(0.03, 0.1), da = RS.range(0, 6.28), r0 = RS.range(0.006, 0.012); stampFn(px + Math.cos(da) * dd, py + Math.sin(da) * dd, 0.03, function (x, y) { return Math.hypot(x, y) < r0 ? w * 1.2 : 0; }, stepAge); }
      w *= waterLoss; }
    return ang;
  }
  function body(cx, cy, ang, water, age, armsUp) {
    var c = Math.cos(ang), s = Math.sin(ang), sb = (RS.rand() * 1e5) | 0;
    stampFn(cx, cy, 1.15, function (dx, dy) {
      var u = dx * c + dy * s, v = -dx * s + dy * c, k = 0, n = 0.5 + 0.5 * PX.fbm(u * 8, v * 8, sb, 3);
      // contact patches only — not a filled figure
      k = Math.max(k, (1 - ell(u - 0.74, v + 0.01 * PX.vnoise(u * 10, v * 10, sb + 1), 0.11, 0.09)) * (0.85 + 0.4 * PX.vnoise(u * 20, v * 20, sb + 2))); // hair holds water
      k = Math.max(k, (1 - ell(u - 0.5, v - 0.09, 0.09, 0.065)) * 0.85); // left shoulder blade
      k = Math.max(k, (1 - ell(u - 0.5, v + 0.09, 0.09, 0.065)) * 0.85);
      k = Math.max(k, (1 - ell(u - 0.28, v, 0.16, 0.13)) * (0.2 + 0.55 * n)); // mottled mid-back, dry gap along the spine
      k = Math.max(k, (1 - ell(u - 0.02, v, 0.13, 0.17)) * (0.9 + 0.25 * n)); // hips / wet swimsuit
      k = Math.max(k, (1 - ell(u + 0.32, v - 0.11, 0.2, 0.07)) * (0.45 + 0.4 * PX.vnoise(u * 12, v * 12, sb + 4)));
      k = Math.max(k, (1 - ell(u + 0.32, v + 0.11, 0.2, 0.07)) * (0.45 + 0.4 * PX.vnoise(u * 12, v * 12, sb + 5)));
      k = Math.max(k, (1 - ell(u + 0.62, v - 0.12, 0.16, 0.055)) * 0.7);
      k = Math.max(k, (1 - ell(u + 0.62, v + 0.13, 0.16, 0.055)) * 0.7);
      k = Math.max(k, (1 - ell(u + 0.82, v - 0.12, 0.05, 0.04)) * 0.55); // heels
      k = Math.max(k, (1 - ell(u + 0.82, v + 0.13, 0.05, 0.04)) * 0.55);
      if (armsUp) { k = Math.max(k, (1 - ell(u - 0.7, v - 0.28, 0.16, 0.04)) * 0.4 * n); k = Math.max(k, (1 - ell(u - 0.7, v + 0.28, 0.16, 0.04)) * 0.4 * n); }
      else { k = Math.max(k, (1 - ell(u - 0.2, v - 0.28, 0.18, 0.04)) * 0.45 * n); k = Math.max(k, (1 - ell(u - 0.2, v + 0.28, 0.18, 0.04)) * 0.45 * n); }
      var blotch = 0.4 + 0.75 * PX.fbm(u * 6 + 2, v * 6, sb + 8, 4);
      k *= blotch;
      return k > 0.08 ? water * Math.min(1.15, k) : 0;
    }, age);
    // drips at the downhill edge of the body
    for (var dI = 0; dI < 7; dI++) {
      var da = RS.range(0, 2 * PI), rr = RS.range(0.25, 0.7), r0 = RS.range(0.005, 0.014);
      stampFn(cx + Math.cos(ang) * Math.cos(da) * rr * 0.3 + Math.sin(ang) * Math.sin(da) * rr, cy + Math.sin(ang) * Math.cos(da) * rr * 0.3 - Math.cos(ang) * Math.sin(da) * rr, 0.025, function (x, y) { return Math.hypot(x, y) < r0 ? water * 0.8 : 0; }, age + RS.range(0, 0.4));
    }
  }
  var tScale = { 'Just Now': 0.5, 'A Few Minutes': 2.6, 'A While Ago': 5.2 }[minutes];
  var exitX = ladderX, exitY = edgeY + 0.05, lounger = null, umb = null;
  stampFn(exitX, exitY + 0.12, 0.55, function (dx, dy) { var d = Math.hypot(dx * 0.8, dy); return d < 0.34 ? 1.8 * (1 - d / 0.34) * (0.55 + 0.45 * PX.vnoise(dx * 16, dy * 16, 8)) : 0; }, 1.0 * tScale + 5);
  if (story === 'Lay On The Deck') {
    var sx = clamp(exitX + RS.range(-1.8, 1.8), 1.1, WM - 1.1), sy = RS.range(edgeY + 1.6, HM - 1.3), ang = RS.range(0, 2 * PI);
    walk([exitX, exitY + 0.2], [sx, sy], 1.0, 0.88, 0.85 * tScale + 4, 0.62);
    body(sx, sy, ang, 1.25, 0.28 * tScale, RS.chance(0.3));
    walk([sx + RS.range(-0.4, 0.4), sy + RS.range(-0.4, 0.4)], [clamp(sx + RS.range(-1.5, 1.5), 0.5, WM - 0.5), edgeY + 0.1], 0.35, 0.92, 0.3 * tScale, 0.65);
  } else if (story === 'Walked To The Lounger') {
    lounger = { x: RS.range(0.6, WM - 1.4), y: RS.range(edgeY + 1.6, HM - 2.3), w: 0.68, h: 1.95, rot: RS.range(-0.12, 0.12) };
    walk([exitX, exitY + 0.2], [lounger.x + 0.34, lounger.y - 0.1], 0.85, 0.85, 0.8 * tScale + 2, 0.6);
    for (var dI = 0; dI < 36; dI++) { var ddx = lounger.x + 0.1 + RS.rand() * 0.48, ddy = lounger.y + 0.3 + RS.rand() * 1.2, rr = RS.range(0.004, 0.013); stampFn(ddx, ddy, 0.02, function (x, y) { return Math.hypot(x, y) < rr ? 1.15 : 0; }, RS.range(0, 0.6) * tScale); }
  } else if (story === 'Sat On The Edge') {
    var ex = exitX; stampFn(ex, edgeY + 0.06, 0.5, function (dx, dy) { var a = 1 - ell(dx + 0.12, dy - 0.02, 0.13, 0.1), b = 1 - ell(dx - 0.12, dy, 0.13, 0.1), k = Math.max(a, b) * (0.7 + 0.4 * PX.vnoise(dx * 20, dy * 20, 9)); return k > 0.1 ? 1.15 * k : 0; }, 0.15 * tScale);
    walk([ex + RS.range(1.0, 2.0), HM + 0.2], [ex + 0.1, edgeY + 0.15], 0.2, 0.95, 0.2 * tScale, 0.65);
  } else if (story === 'Gone Inside') {
    var gx2 = RS.range(0.5, WM - 0.5); walk([exitX, exitY + 0.2], [gx2, HM + 0.3], 0.9, 0.88, 0.55 * tScale + 0.8, 0.64);
  } else { var rx = RS.range(0.6, WM - 0.6); walk([rx + RS.range(-1, 1), HM + 0.2], [rx, edgeY + 0.1], 0.45, 0.96, 0.2 * tScale, 0.95, true); }
  if (shade === 'Umbrella') umb = { x: RW.chance(0.65) ? RW.range(-0.55, 0.45) : RW.range(WM - 0.45, WM + 0.55), y: RW.range(edgeY + 1.5, HM - 0.4), r: RW.range(1.05, 1.3), h: 2.15, cloth: umbCloth };
  function shadeAt(X, Y) {
    var sh = 0;
    if (umb) { var ux = X - (umb.x + shx * umb.h), uy = Y - (umb.y + shy * umb.h), d = Math.hypot(ux, uy);
      var a = Math.atan2(uy, ux), nRib = 8, ribA = ((a % (2 * PI / nRib)) + 2 * PI / nRib) % (2 * PI / nRib) - PI / nRib;
      var rr = umb.r * (0.98 + 0.03 * PX.vnoise(ux * 2, uy * 2, 4));
      sh = Math.max(sh, sstep(rr + 0.14, rr - 0.1, d) * 0.38);
      var pd = PX.segDist(X, Y, umb.x, umb.y, umb.x + shx * umb.h, umb.y + shy * umb.h); sh = Math.max(sh, sstep(0.05, 0.012, pd) * 0.25); }
    if (lounger) { var lx = X - shx * 0.35, ly = Y - shy * 0.35; if (lx > lounger.x && lx < lounger.x + lounger.w && ly > lounger.y && ly < lounger.y + lounger.h) { sh = Math.max(sh, 0.55 + 0.12 * PX.vnoise(lx * 80, ly * 14, 5)); } }
    if (shade === 'Tree Edge') {
      var side = (WM * 0.15 - X) / WM; // tree just off the left, or right if pool suggests it
      if (ladderX < WM * 0.5) side = (X - WM * 0.85) / WM;
      var cover = sstep(-0.02, 0.18, side + 0.35 * PX.fbm(X * 0.55, Y * 0.55, 77, 4));
      var dapple = 0.35 + 0.65 * sstep(0.05, 0.45, PX.fbm(X * 2.8, Y * 2.8, 78, 4));
      sh = Math.max(sh, cover * dapple * 0.36);
    }
    return clamp(sh, 0, 1);
  }
  var evS = { 'High Sun': 0.15, 'Afternoon': 0.12, 'Late Sun': 0.08 }[hour], evShade = evS * 0.34;
  var Wb = PX.blur(Float32Array.from(W0), GW, GH, 1.5);

  // ---------------- caustics: more irregular, softer ----------------
  var waves = []; for (var k = 0; k < 14; k++) { var lam = RX.range(0.06, 0.42), th = RX.range(0, 2 * PI); waves.push({ kx: Math.cos(th) * 2 * PI / lam, ky: Math.sin(th) * 2 * PI / lam, a: 0.0005 * lam / 0.16 * RX.range(0.4, 1.3), p: RX.range(0, 6.28) }); }
  function grad(x, y) { var gx = 0, gy = 0; for (var k = 0; k < waves.length; k++) { var w = waves[k], c = Math.cos(w.kx * x + w.ky * y + w.p) * w.a; gx += c * w.kx; gy += c * w.ky; } return [gx, gy]; }
  var CC = 0.005, CW = Math.ceil(WM / CC), CH = Math.ceil(edgeY / CC), CA = new Float32Array(CW * CH), refr = depth * 0.22;
  var mX = Math.abs(shx * depth * 0.75) + 0.1, mY = Math.abs(shy * depth * 0.75) + 0.1;
  for (var sy2 = -Math.ceil(mY / CC * 2); sy2 < (CH + mY / CC) * 2; sy2++) for (var sx2 = -Math.ceil(mX / CC * 2); sx2 < (CW + mX / CC) * 2; sx2++) {
    var X0 = (sx2 + 0.5) * CC / 2, Y0 = (sy2 + 0.5) * CC / 2, gg = grad(X0, Y0), lx2 = X0 - refr * gg[0] + shx * depth * 0.75, ly2 = Y0 - refr * gg[1] + shy * depth * 0.75;
    var ix = Math.floor(lx2 / CC), iy = Math.floor(ly2 / CC); if (ix >= 0 && iy >= 0 && ix < CW && iy < CH) CA[iy * CW + ix] += 0.25;
  }
  PX.blur(CA, CW, CH, 1.0 + depth * 1.1);

  // ---------------- render ----------------
  var o = PX.canvas(C, VW, VH, '#0f1112'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var seed = (RX.rand() * 1e6) | 0, sunC = hour === 'Late Sun' ? [1.0, 0.72, 0.48] : hour === 'Afternoon' ? [1.0, 0.9, 0.75] : [1.0, 0.97, 0.9], sunI = (hour === 'Late Sun' ? 2.6 : 3.0) * Sz, sky = hour === 'Late Sun' ? [0.55, 0.58, 0.75] : [0.58, 0.7, 0.9], skyI = hour === 'Late Sun' ? 0.45 : 0.55;
  var deckC = PX.col({ 'Pavers': '#b7a894', 'Brushed Concrete': '#b4aea4', 'Travertine': '#c8b394' }[deck]), copC = PX.col({ 'Pavers': '#bdb29e', 'Brushed Concrete': '#bbb5ab', 'Travertine': '#d0bba0' }[deck]);
  var absorb = plasterKind === 'Pale Green' ? [1.15, 0.4, 0.3] : plasterKind === 'Pebble' ? [1.1, 0.46, 0.32] : [1.18, 0.42, 0.3];
  var plaster = PX.col({ 'Aged White': '#d8d8d0', 'Pale Green': '#c8d2c6', 'Pebble': '#cfc8bc' }[plasterKind]);
  var clothC = { 'Sand': PX.col('#c8b48a'), 'Olive': PX.col('#6a6e4a'), 'Terracotta': PX.col('#a05a3a'), 'Faded Stripe': PX.col('#c2b89a') }[umbCloth];

  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, LXY = toLocal((px + 0.5) * WM / PW, (py + 0.5) * HM / PH), X = LXY[0], Y = LXY[1];
    var r, g, b, sh = shadeAt(X, Y), Ls;
    if (Y < edgeY - coping) {
      var gw = grad(X, Y), fx = X - refr * gw[0] * 0.6, fy = Y - refr * gw[1] * 0.6;
      var ca = PX.bil(CA, CW, CH, fx / CC - 0.5, fy / CC - 0.5);
      // soft coping shadow on the floor, not a graphic band
      var distToWall = (edgeY - coping) - Y;
      var copShadow = sstep(0.08, 0.0, distToWall - Math.max(0, -shy) * depth * 0.35) * sstep(-0.05, 0.15, -shy) * 0.55;
      var wx = fx + 0.03 * PX.fbm(fx * 1.8, fy * 1.8, seed + 3, 3), wy = fy + 0.03 * PX.fbm(fx * 1.8 + 4, fy * 1.8, seed + 4, 3);
      var tix = Math.floor(wx / 0.52), tiy = Math.floor(wy / 0.52);
      var tile = (0.86 + 0.22 * PX.h2(tix, tiy, seed + 3)) * (0.96 + 0.08 * PX.vnoise(fx * 16, fy * 16, seed + 3));
      var groutX = Math.abs((wx % 0.52) / 0.52 - 0.5) * 0.52, groutY = Math.abs((wy % 0.52) / 0.52 - 0.5) * 0.52;
      tile *= 1 - 0.2 * sstep(0.016, 0.005, Math.min(groutX, groutY));
      var path = depth * (0.5 + 0.75 * sstep(0.04, 1.5, distToWall));
      var Ld = (skyI * 0.7 + sunI * (0.42 + 0.4 * ca) * (1 - copShadow) * (1 - 0.4 * sh)) * tile;
      r = plaster[0] * Ld * Math.exp(-absorb[0] * path);
      g = plaster[1] * Ld * Math.exp(-absorb[1] * path);
      b = plaster[2] * Ld * Math.exp(-absorb[2] * path);
      var sc = 0.07 * skyI + 0.04 * ca * sunI * (1 - sh);
      r = r * 0.95 + sc * sky[0]; g = g * 0.95 + sc * sky[1]; b = b * 0.95 + sc * sky[2];
      // mineral scum line against the wall
      if (distToWall < 0.04) { var scum = sstep(0.04, 0.0, distToWall) * (0.5 + 0.5 * PX.vnoise(X * 40, 2, seed + 15)); r = lerp(r, r * 0.7, scum * 0.4); g = lerp(g, g * 0.75, scum * 0.4); b = lerp(b, b * 0.65, scum * 0.4); }
      Rr[I] = r; Gg[I] = g; Bb[I] = b; continue;
    }
    var onCoping = Y < edgeY, wet = 0;
    var gx = X / CL - 0.5, gy = Y / CL - 0.5, w0 = PX.bil(Wb, GW, GH, gx, gy), age = AGE[clamp(Math.round(gy), 0, GH - 1) * GW + clamp(Math.round(gx), 0, GW - 1)];
    if (w0 > 0.01) { var rem = w0 - age * lerp(evS, evShade, sh); wet = sstep(0.0, 0.09, rem) * (0.85 + 0.15 * PX.vnoise(X * 80, Y * 80, seed + 13)); }
    // splash zone: a slightly darker, mineral-stained band on the deck next to the water
    var splash = onCoping ? 0 : sstep(0.55, 0.0, Y - edgeY) * (0.25 + 0.15 * PX.fbm(X * 3, Y * 8, seed + 20, 3));
    var base = onCoping ? copC : deckC, tex = 1;
    if (onCoping) { var bull = sstep(edgeY - coping + 0.06, edgeY - coping, Y); tex = (1 - 0.22 * bull) * (0.92 + 0.1 * PX.fbm(X * 22, Y * 22, seed + 5, 3)); var cj = (X % 0.55) / 0.55; if (Math.min(cj, 1 - cj) * 0.55 < 0.004) tex *= 0.72; if (Math.abs(Y - edgeY) < 0.005) tex *= 0.7; }
    else if (deck === 'Pavers') { var a = Math.floor(X / 0.58 + 0.02 * PX.vnoise(Math.floor(Y / 0.58), 0, seed)), b2 = Math.floor((Y - edgeY) / 0.58), fx2 = X / 0.58 - Math.floor(X / 0.58), fy2 = (Y - edgeY) / 0.58 - b2, j = Math.min(fx2, 1 - fx2, fy2, 1 - fy2) * 0.58;
      var pv = PX.h2(a, b2, seed), stain = 0.18 * sstep(0.5, 0.85, PX.fbm(X * 2 + a, Y * 2, seed + 21, 3));
      tex = (0.86 + 0.2 * pv) * (0.88 + 0.14 * PX.fbm(X * 36, Y * 36, seed + 6, 3) + 0.05 * PX.vnoise(X * 220, Y * 220, seed + 12)) * (1 - 0.5 * sstep(0.008, 0.0, j)) * (1 - stain); }
    else if (deck === 'Brushed Concrete') { tex = (0.88 + 0.08 * PX.vnoise(X * 5, Y * 260, seed + 7) + 0.08 * PX.fbm(X * 1.8, Y * 1.8, seed + 8, 3) + 0.05 * PX.vnoise(X * 240, Y * 240, seed + 12)); var jc = ((Y - edgeY) % 2.0); if (jc < 0.008) tex *= 0.62; }
    else { var tb = Math.floor(X / 0.42) * 7 + Math.floor((Y - edgeY) / 0.62), vein = PX.fbm(X * 4 + tb, Y * 11, seed + 9, 4), pits = sstep(0.7, 0.88, PX.vnoise(X * 110, Y * 110, seed + 10)); tex = (0.88 + 0.14 * PX.ihash(tb + seed)) * (0.94 + 0.1 * vein) * (1 - 0.22 * pits); var tx = (X % 0.42) / 0.42, ty = (((Y - edgeY) % 0.62) / 0.62); if (Math.min(tx, 1 - tx) * 0.42 < 0.003 || Math.min(ty, 1 - ty) * 0.62 < 0.003) tex *= 0.78; }
    // wet stone: darker, slightly cooler and more saturated, with a small sheen
    var dk = 1 - 0.62 * wet - 0.16 * splash;
    r = base[0] * tex * dk * (1 - 0.06 * wet); g = base[1] * tex * dk * (1 - 0.02 * wet); b = base[2] * tex * dk * (1 + 0.06 * wet);
    Ls = [skyI * sky[0] * (0.78 + 0.22 * (1 - sh)) + sunI * sunC[0] * (1 - sh), skyI * sky[1] * (0.78 + 0.22 * (1 - sh)) + sunI * sunC[1] * (1 - sh), skyI * sky[2] + sunI * sunC[2] * (1 - sh)];
    r *= Ls[0]; g *= Ls[1]; b *= Ls[2];
    if (wet > 0.25 && sh < 0.55) { var gl = sstep(0.25, 1, wet) * 0.035 * sunI * (1 - sh); r += gl * sunC[0]; g += gl * sunC[1]; b += gl * sunC[2]; }
    // ladder: two stainless rails with a slight highlight, short extension onto the deck
    if (story !== 'Ran And Jumped') for (var q = -1; q <= 1; q += 2) { var rx2 = ladderX + q * 0.22, d = Math.abs(X - rx2); if (d < 0.018 && Y < edgeY + 0.4 && Y > edgeY - coping - 0.2) { var hl = 1 - d / 0.018; r = 0.22 + 0.45 * hl; g = 0.23 + 0.45 * hl; b = 0.25 + 0.48 * hl; } }
    if (lounger) {
      var cL = Math.cos(lounger.rot || 0), sL = Math.sin(lounger.rot || 0), uL = (X - lounger.x) * cL + (Y - lounger.y) * sL, vL = -(X - lounger.x) * sL + (Y - lounger.y) * cL;
      if (uL > 0 && uL < lounger.w && vL > 0 && vL < lounger.h) {
        var fr = Math.min(uL, lounger.w - uL, vL, lounger.h - vL) < 0.03;
        var slat = 0.7 + 0.3 * Math.cos(vL * 22);
        var lc = (fr ? 0.55 : 0.42 * slat) * (0.92 + 0.08 * PX.vnoise(X * 90, Y * 90, seed + 11));
        r = lc * (sunI * sunC[0] * 0.7 + skyI) * 0.9; g = lc * (sunI * sunC[1] * 0.7 + skyI) * 0.82; b = lc * (sunI * sunC[2] * 0.7 + skyI) * 0.68;
      }
    }
    if (umb) {
      var dU = Math.hypot(X - umb.x, Y - umb.y);
      if (dU < umb.r + 0.02) {
        var aU = Math.atan2(Y - umb.y, X - umb.x), nRib = 8, rib = ((aU % (2 * PI / nRib)) + 2 * PI / nRib) % (2 * PI / nRib) - PI / nRib;
        var edgeU = sstep(umb.r + 0.01, umb.r - 0.03, dU);
        var fold = 0.75 + 0.25 * Math.cos(rib * nRib) + 0.06 * PX.vnoise(X * 20, Y * 20, seed + 30);
        if (umb.cloth === 'Faded Stripe') fold *= 0.85 + 0.2 * (Math.sin(dU * 14) > 0 ? 1 : 0.6);
        var ribLine = sstep(0.035, 0.0, Math.abs(rib) * umb.r);
        var cc = clothC, lit = (skyI + sunI * 0.45 * (1 - sh * 0.3)) * fold * edgeU;
        r = cc[0] * lit; g = cc[1] * lit; b = cc[2] * lit;
        r = lerp(r, 0.18, ribLine * edgeU); g = lerp(g, 0.16, ribLine * edgeU); b = lerp(b, 0.14, ribLine * edgeU);
        if (dU < 0.035) { var pole = sstep(0.035, 0.0, dU); r = lerp(r, 0.12, pole); g = lerp(g, 0.11, pole); b = lerp(b, 0.1, pole); }
      }
    }
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  C.features({ Story: story, Since: minutes, Sun: hour, Deck: deck, Shade: shade });
  PX.finish(o, Rr, Gg, Bb, { expo: 0.92, filmic: true, grain: 0.014, vig: 0.2, seed: 11 });
  C.done(o.cv.canvas, 'poolside');
})();

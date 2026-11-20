/* Hollowed, by Clyde (2027).
 * Old stone steps, seen from downhill at a shallow angle: lit treads with a dish where feet land, shadowed
 * risers, and a nosing worn round and low in the traffic line. The hollow sits toward the handrail, deepest
 * just behind the nosing where the ball of the foot pushes off going up.
 * Engine: footfalls are sampled over decades or centuries. People keep to the rail (or to a lane in a two-way
 * flow); climbing, the ball of the foot lands 6-12 cm behind the nosing; descending, the heel lands further
 * back and the toe rolls over the edge, rounding and lowering it. Each contact abrades the stone in proportion
 * to load and slip (Archard's wear law). Dirt and lichen gather where feet never go: the back corners and joints. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RS = R.fork('stone'), RF = R.fork('feet');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1400, VH = 1250;
  var stone = RS.weighted([['Sandstone', 40], ['Limestone', 30], ['Granite', 14], ['Slate', 16]]);
  var age = RS.weighted([['A Hundred Years', 34], ['Three Centuries', 40], ['Since The Abbey', 26]]);
  var rail = RS.weighted([['Left', 32], ['Right', 32], ['None', 36]]);
  var flow = RS.weighted([['Mostly Up', 30], ['Up And Down', 50], ['Mostly Down', 20]]);
  var W = RS.range(100, 132), TD = RS.range(29, 36), RH = RS.range(15, 18), nT = 3;
  var depthMax = { 'A Hundred Years': RS.range(2.2, 3.2), 'Three Centuries': RS.range(3.6, 5.8), 'Since The Abbey': RS.range(6, 9.5) }[age] * (stone === 'Granite' ? 0.62 : stone === 'Slate' ? 0.78 : 1);
  if (stone === 'Granite') depthMax = Math.max(depthMax, 2.0);
  if (stone === 'Slate') depthMax = Math.max(depthMax, 2.4);
  var GS = 0.4, GX = Math.ceil(W / GS), GY = Math.ceil(TD / GS), D = []; for (var t = 0; t < nT; t++) D.push(new Float32Array(GX * GY));
  var railX = rail === 'Left' ? 0.30 : rail === 'Right' ? 0.70 : 0.5, lane = RF.range(0.12, 0.2);
  for (var t2 = 0; t2 < nT; t2++) {
    var F = D[t2], nSteps = 3600;
    for (var k = 0; k < nSteps; k++) {
      var upw = flow === 'Mostly Up' ? RF.chance(0.8) : flow === 'Mostly Down' ? RF.chance(0.2) : RF.chance(0.5);
      var cx; if (rail !== 'None' && RF.chance(0.7)) cx = railX + RF.gaussian(0, 0.055) + (railX < 0.5 ? 0.04 : -0.04); else cx = rail === 'None' && flow === 'Up And Down' ? 0.5 + (upw ? -lane : lane) + RF.gaussian(0, 0.08) : 0.5 + RF.gaussian(0, 0.11);
      cx = clamp(cx, 0.12, 0.88) * W;
      var foot = RF.chance(0.5) ? -1 : 1, fx = cx + foot * 8, along = upw ? RF.range(7, 13) : RF.range(13, 21), len = 24, wid = 9, load = upw ? 1 : 1.22;
      var cyF = along, i0 = Math.max(0, Math.floor((fx - wid) / GS)), i1 = Math.min(GX - 1, Math.ceil((fx + wid) / GS));
      for (var j = 0; j < GY; j++) for (var i = i0; i <= i1; i++) { var u = (i * GS - fx) / (wid * 0.5), v = (j * GS - cyF) / (len * 0.5); if (u * u + v * v > 2.2) continue;
        var ball = Math.exp(-((u * u) + Math.pow(v - (upw ? -0.15 : 0.15), 2) * 3) * 1.3) * (upw ? 1.45 : 0.8), heel = Math.exp(-(u * u + Math.pow(v + (upw ? 0.55 : 0.45), 2) * 4) * 1.5) * (upw ? 0.35 : 1.1); F[j * GX + i] += (ball + heel) * load; }
      if (!upw) for (var i2 = i0; i2 <= i1; i2++) for (var j2 = 0; j2 < 5; j2++) { var uu = (i2 * GS - fx) / (wid * 0.5); F[j2 * GX + i2] += Math.exp(-uu * uu) * 0.95 * (1 - j2 / 6); }
    }
    PX.blur(F, GX, GY, 2.1);
    var mx = 0; for (var q = 0; q < F.length; q++) mx = Math.max(mx, F[q]);
    var cxB = railX * W, cyB = TD * 0.32, sxB = W * 0.24, syB = TD * 0.22;
    for (q = 0; q < F.length; q++) {
      var ix = q % GX, jy = (q / GX) | 0, bx = (ix * GS - cxB) / sxB, by = (jy * GS - cyB) / syB, bowl = Math.exp(-(bx * bx + by * by));
      var v = (mx > 0 ? F[q] / mx : 0) * 0.4 + bowl * 0.6;
      F[q] = v * depthMax * (1 - t2 * 0.07);
    }
    PX.blur(F, GX, GY, 0.8);
  }
  var o = PX.canvas(C, VW, VH, '#1a1916'), PW = o.PW, PH = o.PH, N = PW * PH, seed = RS.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  var S = { Sandstone: ['#c4a67a', '#7a5e40'], Limestone: ['#d8d0bc', '#9a917c'], Granite: ['#a8a59e', '#5c5a56'], Slate: ['#6a6e72', '#2e3236'] }[stone].map(PX.col);
  var dirtC = PX.col('#3a372c'), lichen = PX.col('#7e8454');
  function sampleD(t, x, y) { return PX.bil(D[t], GX, GY, x / GS, y / GS); }
  // world: x across the tread, y up the flight (0 at the bottom nosing), z up. Step 0 is nearest (downhill).
  // Camera stands downhill and a little to one side, looking up the flight, pitched down so both treads and risers show.
  var elev = RS.range(0.54, 0.68), se = Math.sin(elev), ce = Math.cos(elev);
  var side = rail === 'Left' ? 1 : rail === 'Right' ? -1 : (RS.chance(0.5) ? 1 : -1);
  var yaw = side * RS.range(0.16, 0.34), cyw = Math.cos(yaw), syw = Math.sin(yaw);
  var focX = W * 0.5, focY = TD * 1.15, focZ = RH * 1.05;
  function toCam(wx, wy, wz) {
    var dx = wx - focX, dy = wy - focY, dz = wz - focZ;
    var xp = dx * cyw + dy * syw, yp = -dx * syw + dy * cyw;
    return [xp, yp, dz];
  }
  // orthographic project: fit the stair volume in the frame
  var corners = [], sC, tC;
  for (sC = 0; sC < nT; sC++) {
    corners.push(toCam(0, sC * TD, sC * RH)); corners.push(toCam(W, sC * TD, sC * RH));
    corners.push(toCam(0, sC * TD, sC * RH + RH)); corners.push(toCam(W, sC * TD, sC * RH + RH));
    corners.push(toCam(0, sC * TD + TD, sC * RH + RH)); corners.push(toCam(W, sC * TD + TD, sC * RH + RH));
  }
  var minXp = 1e9, maxXp = -1e9, minU = 1e9, maxU = -1e9, ci;
  for (ci = 0; ci < corners.length; ci++) {
    var uC = corners[ci][1] * se + corners[ci][2] * ce;
    if (corners[ci][0] < minXp) minXp = corners[ci][0]; if (corners[ci][0] > maxXp) maxXp = corners[ci][0];
    if (uC < minU) minU = uC; if (uC > maxU) maxU = uC;
  }
  var midXp = (minXp + maxXp) / 2, midU = (minU + maxU) / 2;
  var scale = 0.97 * Math.min(PW / Math.max(maxXp - minXp, 1), PH / Math.max(maxU - minU, 1));
  var ZB = new Float32Array(N); for (var i = 0; i < N; i++) ZB[i] = -1e9;
  function plot(wx, wy, wz, fn) {
    var c = toCam(wx, wy, wz), sx = (c[0] - midXp) * scale + PW / 2, sy = PH / 2 - (c[1] * se + c[2] * ce - midU) * scale, dep = c[1] * ce - c[2] * se;
    var ix = Math.round(sx), iy = Math.round(sy); if (ix < 0 || iy < 0 || ix >= PW || iy >= PH) return;
    var I = iy * PW + ix; if (dep < ZB[I]) return; ZB[I] = dep; fn(I, wx, wy, wz);
  }
  var ds = Math.min(0.14, 0.40 / scale);
  // light: raking, from downhill and above-left, so the far wall of each dish is in shadow and the near lip is lit
  var Lx = -0.48 * side, Ly = -0.35, Lz = 0.8, Ll = Math.hypot(Lx, Ly, Lz); Lx /= Ll; Ly /= Ll; Lz /= Ll;
  function stoneCol(tx, ty, d, ti, nx, ny, nz, isRiser) {
    var layer, tone, grit;
    if (stone === 'Sandstone') {
      layer = 0.5 + 0.14 * Math.sin((ty * 0.16 + tx * 0.02 + 0.55 * PX.fbm(tx * 0.05, ty * 0.06 + ti * 3, seed + ti, 4)) * PI * 2) + 0.16 * PX.fbm(tx * 0.08, ty * 0.1, seed + 8 + ti, 4);
      grit = 0.09 * PX.vnoise(tx * 2.2, ty * 2.2, seed + 2) + 0.06 * PX.vnoise(tx * 7, ty * 7, seed + 3);
    } else if (stone === 'Limestone') {
      layer = 0.5 + 0.24 * PX.fbm(tx * 0.07, ty * 0.09 + ti, seed + ti, 4);
      grit = 0.09 * PX.vnoise(tx * 1.8, ty * 1.8, seed + 2) + 0.07 * PX.vnoise(tx * 8, ty * 8, seed + 3) - 0.05 * sstep(0.68, 0.9, PX.vnoise(tx * 1.1, ty * 1.1, seed + 11));
    } else if (stone === 'Slate') {
      layer = 0.5 + 0.2 * Math.sin(ty * 0.55 + tx * 0.04 + 0.35 * PX.fbm(tx * 0.25, ty * 0.08, seed, 3));
      grit = 0.04 * PX.vnoise(tx * 4, ty * 4, seed + 2);
    } else {
      var cell = PX.h2(Math.floor(tx * 3.1 + ti), Math.floor(ty * 3.1), seed);
      layer = 0.5 + 0.42 * (cell - 0.5);
      grit = 0.08 * (PX.h2(Math.floor(tx * 8), Math.floor(ty * 8), seed + 4) - 0.5);
    }
    tone = clamp(0.5 + 0.28 * (layer - 0.5) * 2 + 0.08 * PX.fbm(tx * 0.1 + ti * 7, ty * 0.1, seed + 1, 4) + grit, 0, 1);
    var r = lerp(S[0][0], S[1][0], tone), g = lerp(S[0][1], S[1][1], tone), b = lerp(S[0][2], S[1][2], tone);
    var worn = clamp(d / Math.max(depthMax, 0.1), 0, 1), polish = sstep(0.12, 0.8, worn);
    r *= 0.9 + 0.2 * polish; g *= 0.9 + 0.18 * polish; b *= 0.9 + 0.14 * polish;
    var lam = clamp(nx * Lx + ny * Ly + nz * Lz, 0, 1);
    lam = 0.16 + 0.84 * lam;
    if (isRiser) lam *= 0.45;
    var corner = (1 - sstep(0.02, 0.35, worn)) * (sstep(0.28, 0, Math.min(tx, W - tx) / W) * 0.75 + sstep(0.28, 0, ty / TD) * 0.45);
    var dirt = clamp(corner * (0.45 + 0.55 * PX.fbm(tx * 0.16, ty * 0.16, seed + 5, 4)), 0, 0.9);
    var li = age !== 'A Hundred Years' && stone !== 'Slate' ? sstep(0.58, 0.82, PX.fbm(tx * 0.09, ty * 0.09, seed + 6, 4) + corner * 0.35) * (1 - worn) : 0;
    r = lerp(r, dirtC[0], dirt * 0.7); g = lerp(g, dirtC[1], dirt * 0.7); b = lerp(b, dirtC[2], dirt * 0.7);
    r = lerp(r, lichen[0], li * 0.32); g = lerp(g, lichen[1], li * 0.32); b = lerp(b, lichen[2], li * 0.32);
    var spec = polish * 0.13 * Math.pow(clamp(nx * Lx * 0.3 + ny * Ly * 0.2 + nz * 0.95, 0, 1), 22);
    return [r * lam + spec, g * lam + spec, b * lam + spec * 0.95];
  }
  // surroundings: a dark stone landing and cheeks
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, gd = 0.32 + 0.16 * PX.fbm(px * 0.015, py * 0.015, seed + 9, 4);
    Rr[I] = S[1][0] * gd * 0.42; Gg[I] = S[1][1] * gd * 0.42; Bb[I] = S[1][2] * gd * 0.42;
  }
  var step;
  for (step = nT - 1; step >= 0; step--) {
    var zT = step * RH, yN = step * TD;   // tread z at the back (unworn), nosing y
    // riser under this nosing (front face), from the tread below up to the nosing curve
    var ry, tx;
    for (ry = 0; ry <= RH - 0.4; ry += ds) {
      for (tx = -3; tx <= W + 3; tx += ds) {
        var dN = (tx >= 0 && tx <= W) ? sampleD(step, tx, 0.8) : 0;
        var Rnos = 1.5 + dN * 0.65;                 // more wear, more rounded
        if (ry > RH - Rnos) continue;               // the quarter-circle occupies the top of the riser
        var col = stoneCol(clamp(tx, 0, W), ry, dN * 0.15, step, 0, -1, 0.08, true);
        var shade = 0.85 + 0.15 * (ry / RH);
        // contact shadow just under the nosing
        var under = sstep(RH - Rnos - 2.2, RH - Rnos, ry);
        shade *= 1 - 0.4 * under;
        plot(tx, yN - 0.12, zT + ry, function (I) { Rr[I] = col[0] * shade; Gg[I] = col[1] * shade; Bb[I] = col[2] * shade; });
      }
    }
    // rounded nosing (quarter-circle in the yz plane), worn lower in the traffic line
    var ang, da = ds / 1.4;
    for (ang = 0; ang <= PI / 2 + 0.02; ang += da / Math.max(1.1, 1)) {
      for (tx = -2; tx <= W + 2; tx += ds) {
        var dN2 = (tx >= 0 && tx <= W) ? sampleD(step, tx, 1.0) : 0;
        var Rn = 1.5 + dN2 * 0.65, dropN = dN2 * 0.85;
        var yy = yN - Rn * Math.sin(ang), zz = zT + RH - dropN - Rn * (1 - Math.cos(ang));
        var nxN = 0, nyN = -Math.sin(ang), nzN = Math.cos(ang);
        var colN = stoneCol(clamp(tx, 0, W), 0.6, dN2, step, nxN, nyN, nzN, false);
        plot(tx, yy, zz, function (I) { Rr[I] = colN[0]; Gg[I] = colN[1]; Bb[I] = colN[2]; });
      }
    }
    // tread heightfield, ty = distance back from the nosing
    var ty;
    for (ty = 0; ty <= TD; ty += ds) for (tx = -2; tx <= W + 2; tx += ds) {
      var d = (tx >= 0 && tx <= W) ? sampleD(step, tx, ty) : 0;
      var dX = (tx > 0.6 && tx < W - 0.6) ? (sampleD(step, tx + 0.7, ty) - sampleD(step, tx - 0.7, ty)) / 1.4 : 0;
      var dY = (ty > 0.7 && ty < TD - 0.7) ? (sampleD(step, tx, ty + 0.7) - sampleD(step, tx, ty - 0.7)) / 1.4 : 0;
      // z = zT+RH - d, so normal = (∂d/∂x, ∂d/∂y, 1) in (x, y, z) — the far wall of the dish faces +y
      var nx = dX * 3.8, ny = dY * 3.8, nz = 1, nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      var col2 = stoneCol(clamp(tx, 0, W), ty, d, step, nx, ny, nz, false);
      var zz = zT + RH - d;
      var ao = 1 - 0.62 * sstep(0.06, 0.8, d / Math.max(depthMax, 0.1));
      plot(tx, yN + ty, zz, function (I) { Rr[I] = col2[0] * ao; Gg[I] = col2[1] * ao; Bb[I] = col2[2] * ao; });
    }
  }
  // fill 1-px splat holes (two passes, 8-neighbour)
  var nb = [1, -1, PW, -PW, PW + 1, PW - 1, -PW + 1, -PW - 1], pass, py2, px2, I2, accR, accG, accB, n, k, j;
  for (pass = 0; pass < 2; pass++) for (py2 = 1; py2 < PH - 1; py2++) for (px2 = 1; px2 < PW - 1; px2++) {
    I2 = py2 * PW + px2; if (ZB[I2] > -1e8) continue;
    accR = accG = accB = n = 0;
    for (k = 0; k < 8; k++) { j = I2 + nb[k]; if (ZB[j] > -1e8) { accR += Rr[j]; accG += Gg[j]; accB += Bb[j]; n++; } }
    if (n >= 3) { Rr[I2] = accR / n; Gg[I2] = accG / n; Bb[I2] = accB / n; ZB[I2] = 0; }
  }
  C.features({ Stone: stone, Worn: age, Handrail: rail, Traffic: flow, 'Deepest Dish': depthMax.toFixed(1) + ' cm' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.12, filmic: true, grain: 0.012, vig: 0.28, seed: 20 });
  C.done(o.cv.canvas, 'hollowed');
})();

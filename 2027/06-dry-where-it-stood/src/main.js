/* Dry Where It Stood, by Clyde (2027).
 * A car park just after a shower, from above. The cars have gone. Where each one stood through the rain there is
 * a dry rectangle, and its edges and its freckles tell you when it left.
 * Engine: rain falls on a slanted line (wind), so each parked body shields a footprint swept downwind between its
 * sill and roof heights; a car that left before the rain stopped lets drops back in (a freckled ghost); a car that
 * left afterwards leaves a clean one. After the rain the film of water evaporates from the aggregate tops first
 * (mottled drying), creeps a few centimetres into dry ground, and survives longest in depressions of the asphalt
 * heightfield, which fill as puddles. Light: wet asphalt loses albedo (water fills the pores); still water reflects
 * only ~2% looking straight down, so puddles read dark, except where they mirror a lamp head. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RW = R.fork('world'), RC = R.fork('cars'), RL = R.fork('light'), RX = R.fork('texture');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var WM = 12, HM = 15, VW = 1000, VH = 1250, CL = 0.02, GW = 600, GH = 750;
  var Q = C.platform === 'standalone' ? C.query : null;

  var layout = RW.weighted([['One Row', 34], ['Two Rows', 40], ['Angled', 26]]);
  var since = RW.weighted([['Just Stopped', 34], ['Half An Hour', 40], ['Drying', 26]]);
  var hour = RL.weighted([['Overcast Day', 40], ['Dusk', 30], ['Night', 30]]);
  var depart = RC.weighted([['One Car', 34], ['Two Cars', 30], ['A Few', 26], ['End Of Day', 10]]);
  var incident = RC.weighted([['None', 52], ['Through The Puddle', 20], ['Oil', 16], ['Wheel Stop', 12]]);
  if (Q && Q.get('since')) since = Q.get('since'); if (Q && Q.get('hour')) hour = Q.get('hour'); if (Q && Q.get('layout')) layout = Q.get('layout'); if (Q && Q.get('depart')) depart = Q.get('depart');
  if (incident === 'Through The Puddle' && since === 'Just Stopped') incident = 'Oil';
  var paint = RW.weighted([['White Lines', 70], ['Yellow Lines', 30]]);
  var wind = RW.range(0, 2 * PI), slant = RW.range(0.1, 0.55);   // rain: horizontal drift per metre of fall
  var wx = Math.cos(wind) * slant, wy = Math.sin(wind) * slant;

  // ---------------- bays ----------------
  var bays = [], bw = 2.5, bd = 5.0, ang = layout === 'Angled' ? RW.pick([60, 70]) * PI / 180 : PI / 2;
  var rot = RW.chance(0.5);   // rows horizontal (bays point up/down) or vertical
  function addRow(y0, facing) {   // bays along x at row front y0, extending in +facing*y
    var step = bw / Math.sin(ang), n = Math.ceil(WM / step) + 2, off = RW.range(-step, 0);
    for (var k = 0; k < n; k++) { var x = off + k * step; bays.push({ x: x, y: y0, f: facing, a: ang }); }
  }
  var aisleY;
  if (layout === 'Two Rows') { var mid = RW.range(5.5, 9.5); addRow(mid - 0.05, -1); addRow(mid + 0.05, 1); aisleY = RW.chance(0.5) ? mid - bd - 3.5 : mid + bd + 3.5; }
  else { var y0 = RW.chance(0.5) ? RW.range(0.5, 3) : HM - RW.range(0.5, 3); var f = y0 < HM / 2 ? 1 : -1; addRow(f > 0 ? y0 : y0, f); aisleY = y0 + f * (bd + 3.2); }
  // bay polygon in metres: front edge on the row line, depth along facing (angled bays lean)
  function bayPoly(b) { var dx = Math.cos(b.a) * bd * (b.f > 0 ? 1 : 1), dy = Math.sin(b.a) * bd * b.f, sx = bw / Math.sin(b.a); return [[b.x, b.y], [b.x + sx, b.y], [b.x + sx + dx, b.y + dy], [b.x + dx, b.y + dy]]; }
  // which bays had a car through the rain, and when each left (minutes relative to the end of the rain; <0 = during)
  var inFrame = bays.filter(function (b) { var p = bayPoly(b), cx = (p[0][0] + p[2][0]) / 2; return cx > 0.6 && cx < WM - 0.6; });
  var nGo = { 'One Car': 1, 'Two Cars': 2, 'A Few': RC.int(3, 4), 'End Of Day': RC.int(5, 8) }[depart]; nGo = Math.min(nGo, inFrame.length);
  var gone = RC.shuffle(inFrame).slice(0, nGo);
  var elapsed = { 'Just Stopped': 4, 'Half An Hour': 30, 'Drying': 75 }[since];
  gone.forEach(function (b, k) {
    b.car = { len: RC.range(4.1, 4.9), wid: RC.range(1.72, 1.9), sill: RC.range(0.25, 0.4), roof: RC.range(1.4, 1.7), back: RC.range(0.15, 0.5), side: RC.range(-0.15, 0.15) };
    b.left = k === 0 && depart === 'One Car' ? RC.range(0, elapsed * 0.9) : RC.chance(0.35) ? -RC.pareto(2, 1.2) : RC.range(0, elapsed * 0.95);   // minutes after the rain ended
    if (b.left < -25) b.left = -25;
  });

  // ---------------- fields ----------------
  var N = GW * GH, H = new Float32Array(N), DRY = new Float32Array(N), SPK = new Float32Array(N), seed = (RX.rand() * 1e6) | 0;
  var sxl = RW.range(-1, 1) * 0.006, syl = RW.range(-1, 1) * 0.006;   // drainage slope (m/m)
  for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) { var X = x * CL, Y = y * CL; H[y * GW + x] = sxl * X + syl * Y + 0.006 * PX.fbm(X * 0.18, Y * 0.18, seed, 4) + 0.003 * PX.fbm(X * 0.7, Y * 0.7, seed + 3, 3) - 0.004 * Math.exp(-Math.pow((Y - aisleY) / 1.4, 2)) * (0.6 + 0.4 * PX.vnoise(X * 0.3, 0, seed + 5)); }
  var Hb = PX.blur(Float32Array.from(H), GW, GH, 60), PD = new Float32Array(N), fill = RW.range(0.0012, 0.0028);
  for (var i = 0; i < N; i++) PD[i] = Math.max(0, (Hb[i] - H[i]) - (0.0035 - fill));   // depth of standing water in depressions (m)
  // rain shadows
  gone.forEach(function (b) {
    var p = bayPoly(b), ux = (p[3][0] - p[0][0]) / bd, uy = (p[3][1] - p[0][1]) / bd, vx = (p[1][0] - p[0][0]), vy = (p[1][1] - p[0][1]), vl = Math.hypot(vx, vy); vx /= vl; vy /= vl;
    var c = b.car, cx = (p[0][0] + p[1][0]) / 2 + vx * c.side + ux * (bd - c.len / 2 - c.back) * 1, cy = (p[0][1] + p[1][1]) / 2 + vy * c.side + uy * (bd - c.len / 2 - c.back);
    b.cx = cx; b.cy = cy; b.ux = ux; b.uy = uy; b.vx = vx; b.vy = vy;
    var M = new Float32Array(N), hl = c.len / 2, hw = c.wid / 2;
    for (var z = c.sill; z <= c.roof; z += 0.1) {   // body shields the ground along the slant; nose and tail taper
      var taper = sstep(c.roof, c.sill + 0.6, z), L2 = hl - 0.05 - (1 - taper) * 0.5, W2 = hw - 0.04 - (z > 1.0 ? (z - 1.0) * 0.35 : 0);
      var ox = -wx * z, oy = -wy * z, rr = 0.25, pts = [];
      for (var q = 0; q < 4; q++) { var su = q < 2 ? -1 : 1, sv = q === 0 || q === 3 ? -1 : 1; for (var t = 0; t <= 4; t++) { var a = (q * 4 + t) / 16 * 2 * PI + PI / 4; } }
      var corners = [[-L2, -W2], [L2, -W2], [L2, W2], [-L2, W2]];
      corners.forEach(function (cc, qi) { for (var t2 = 0; t2 <= 4; t2++) { var a2 = (qi * 0.5 + t2 / 8) * PI - PI, sgu = cc[0] > 0 ? 1 : -1, sgv = cc[1] > 0 ? 1 : -1; var lu = cc[0] - sgu * rr + rr * Math.cos(a2 + (qi === 1 ? PI / 2 : qi === 2 ? PI : qi === 3 ? 1.5 * PI : 0) + PI / 2) * 0; } });
      var poly = [[-L2 + rr, -W2], [L2 - rr, -W2], [L2, -W2 + rr], [L2, W2 - rr], [L2 - rr, W2], [-L2 + rr, W2], [-L2, W2 - rr], [-L2, -W2 + rr]].map(function (pp) { return [(cx + ux * pp[0] + vx * pp[1] - ox) / CL, (cy + uy * pp[0] + vy * pp[1] - oy) / CL]; });
      PX.fillPoly(poly, GW, GH, function (ii) { M[ii] = 1; });
    }
    // the tyres touched the ground at the corners: dry too, and pressed
    PX.blur(M, GW, GH, 1.6);   // water creeps a little way into dry ground
    var during = b.left < 0 ? -b.left : 0, spots = 1 - Math.exp(-during / 6);
    for (var ii2 = 0; ii2 < N; ii2++) if (M[ii2] > 0.01) { var dryv = sstep(0.35, 0.75, M[ii2] + 0.12 * PX.vnoise((ii2 % GW) * 0.6, ((ii2 / GW) | 0) * 0.6, seed + 9)); if (dryv > DRY[ii2]) { DRY[ii2] = dryv; SPK[ii2] = spots; } }
  });

  // ---------------- light ----------------
  var lamps = [];
  if (hour !== 'Overcast Day') { var nl = RL.int(1, 2); for (var l = 0; l < nl; l++) lamps.push({ x: RL.range(1, WM - 1), y: RL.chance(0.5) ? RL.range(-1, 2) : RL.range(HM - 2, HM + 1), h: 8, col: RL.chance(0.6) ? [1.0, 0.62, 0.25] : [0.95, 0.97, 1.0] }); }
  var skyAmb = hour === 'Overcast Day' ? 1.0 : hour === 'Dusk' ? 0.22 : 0.035, skyCol = hour === 'Dusk' ? [0.6, 0.7, 1.0] : hour === 'Night' ? [0.5, 0.6, 1.0] : [0.92, 0.96, 1.0];
  var o = PX.canvas(C, VW, VH, '#0e0f11'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var mpp = WM / PW, camX = WM / 2, camY = HM / 2, camH = 40;
  var paintC = paint === 'White Lines' ? [0.62, 0.62, 0.6] : [0.62, 0.48, 0.12];
  var polys = bays.map(bayPoly);
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) * mpp, Y = (py + 0.5) * mpp, gx = X / CL, gy = Y / CL;
    // asphalt: aggregate in binder
    var agg = PX.vnoise(X * 140, Y * 140, seed + 20), agg2 = PX.vnoise(X * 420, Y * 420, seed + 21), wearN = PX.fbm(X * 0.5, Y * 0.5, seed + 22, 3);
    var stone = sstep(0.25, 0.6, agg) * 0.6 + sstep(0.3, 0.7, agg2) * 0.4, alb = (0.07 + 0.08 * stone) * (1 + 0.25 * wearN) * (1 + 0.15 * Math.exp(-Math.pow((Y - aisleY) / 1.2, 2)) * 0);
    // paint: bay lines (10 cm), worn
    var pm = 0;
    for (var k = 0; k < polys.length; k++) { var p = polys[k]; var d1 = PX.segDist(X, Y, p[0][0], p[0][1], p[3][0], p[3][1]); if (d1 < 0.06) pm = Math.max(pm, sstep(0.06, 0.04, d1)); }
    if (pm > 0) { var pw = sstep(-0.15, 0.25, PX.fbm(X * 6, Y * 6, seed + 23, 4) + 0.15) * (0.75 + 0.25 * PX.vnoise(X * 40, Y * 40, seed + 24)) * (0.7 + 0.3 * stone); pm *= pw; }
    if (incident === 'Wheel Stop') for (var k3 = 0; k3 < polys.length; k3++) { var p3 = polys[k3], ux3 = (p3[3][0] - p3[0][0]) / bd, uy3 = (p3[3][1] - p3[0][1]) / bd, mx = (p3[0][0] + p3[1][0]) / 2 + ux3 * (bd - 0.45), my = (p3[0][1] + p3[1][1]) / 2 + uy3 * (bd - 0.45);
      var su3 = (X - mx) * ux3 + (Y - my) * uy3, sv3 = -(X - mx) * uy3 + (Y - my) * ux3; if (Math.abs(su3) < 0.08 && Math.abs(sv3) < 0.9) { pm = 0; alb = 0.2 * (0.85 + 0.2 * PX.vnoise(X * 80, Y * 80, seed + 25)); if (Math.abs(su3) > 0.06) alb *= 0.7; } }
    var r = lerp(alb, paintC[0], pm), g = lerp(alb, paintC[1], pm), b = lerp(alb * 1.03, paintC[2], pm);
    // oil under where engines sat
    for (var k2 = 0; k2 < gone.length; k2++) { var bb = gone[k2]; var fu = (X - bb.cx) * bb.ux + (Y - bb.cy) * bb.uy, fv = (X - bb.cx) * bb.vx + (Y - bb.cy) * bb.vy, ou = fu - bb.car.len * 0.32;
      var oil = sstep(0.55, 0.1, Math.hypot(ou / 1.3, fv) + 0.25 * PX.fbm(X * 4, Y * 4, seed + 30 + k2, 3)) * (incident === 'Oil' ? 0.8 : 0.35);
      r *= 1 - oil * 0.55; g *= 1 - oil * 0.55; b *= 1 - oil * 0.5; }
    // wetness
    var dry = PX.bil(DRY, GW, GH, gx, gy), spk = PX.bil(SPK, GW, GH, gx, gy), pd = PX.bil(PD, GW, GH, gx, gy);
    var film = 0.00035 * (0.8 + 0.4 * PX.fbm(X * 0.8, Y * 0.8, seed + 40, 3)), evap = elapsed * 0.0000032 * (1.3 - 0.9 * stone);   // aggregate tops dry first
    var wet = sstep(0, 0.00012, film - evap) * (1 - dry);
    var ghostMem = dry * (0.22 + 0.55 * sstep(100, 15, elapsed)) * (1 - wet * 0.5);
    if (dry > 0 && spk > 0) { var drop = PX.vnoise(X * 260, Y * 260, seed + 41) * 0.5 + 0.5, dr2 = PX.vnoise(X * 600, Y * 600, seed + 42) * 0.5 + 0.5; var sp = sstep(1 - spk * 0.6, 1 - spk * 0.6 + 0.08, Math.max(drop, dr2 * 0.95)); wet = Math.max(wet, dry * sp * sstep(0, 0.00012, film * 0.6 - evap)); }
    var pud = sstep(0.0002, 0.0012, pd - evap * 0.3);
    wet = Math.max(wet, pud);
    // tyres through the aisle puddle after things dried
    if (incident === 'Through The Puddle') { var tyY = aisleY + 0.0, tx0 = WM * 0.2; for (var tt = -1; tt <= 1; tt += 2) { var ty = tyY + tt * 0.78 + 0.15 * Math.sin(X * 0.25); var dty = Math.abs(Y - ty); if (dty < 0.11) { var fade = Math.exp(-Math.abs(X - tx0) / 6) * (X > tx0 ? 1 : 0.2), tread = 0.6 + 0.4 * Math.sign(Math.sin(X * 90 + Math.abs(Y - ty) * 30)); wet = Math.max(wet, sstep(0.11, 0.08, dty) * fade * tread * 0.9); } } }
    var al = 1 - 0.62 * wet; r *= al; g *= al; b *= al * 1.02;
    if (ghostMem > 0) { var lift = 1 + ghostMem * 0.42; r *= lift; g *= lift; b *= lift * 0.99; }
    // illumination
    var Lr = skyAmb * skyCol[0], Lg = skyAmb * skyCol[1], Lb = skyAmb * skyCol[2], spR = 0, spG = 0, spB = 0;
    for (var m = 0; m < lamps.length; m++) { var lp = lamps[m], dxl = X - lp.x, dyl = Y - lp.y, d2 = dxl * dxl + dyl * dyl + lp.h * lp.h, ill = 26 * lp.h / Math.pow(d2, 1.55); Lr += ill * lp.col[0]; Lg += ill * lp.col[1]; Lb += ill * lp.col[2];
      // mirror point of the lamp head for a camera high above the middle; glossy spread on wet asphalt, tight on puddles
      var mxp = (camX * lp.h + lp.x * camH) / (camH + lp.h), myp = (camY * lp.h + lp.y * camH) / (camH + lp.h), ex = X - mxp, ey = Y - myp;
      var tox = camX - mxp, toy = camY - myp, tl = Math.hypot(tox, toy) + 1e-3; tox /= tl; toy /= tl; var ea = ex * tox + ey * toy, eb = -ex * toy + ey * tox;
      var rough = lerp(0.22, 0.07, pud), glint = (wet > 0.05 ? wet : 0) * (0.05 + 0.62 * pud) * Math.exp(-(ea * ea / (rough * rough * 3.2) + eb * eb / (rough * rough * 0.28)));
      spR += glint * lp.col[0]; spG += glint * lp.col[1]; spB += glint * lp.col[2]; }
    var skyRef = 0.02 * wet * skyAmb;   // Fresnel at normal incidence: water returns ~2% of the sky
    Rr[I] = r * Lr + spR + skyRef * skyCol[0]; Gg[I] = g * Lg + spG + skyRef * skyCol[1]; Bb[I] = b * Lb + spB + skyRef * skyCol[2];
  }
  var expo = hour === 'Overcast Day' ? 3.0 : hour === 'Dusk' ? 3.2 : 3.6;
  C.features({ 'Since The Rain': since, Hour: hour, Departed: depart, Layout: layout, Lines: paint, Incident: incident, 'Left During The Rain': gone.filter(function (b) { return b.left < 0; }).length });
  PX.finish(o, Rr, Gg, Bb, { expo: expo, filmic: true, grain: 0.018, vig: 0.3, seed: 9 });
  C.done(o.cv.canvas, 'dry-where-it-stood');
})();

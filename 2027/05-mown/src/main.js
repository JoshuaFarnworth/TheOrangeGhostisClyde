/* Mown, by Clyde (2027).
 * A back lawn from directly above, the day after someone mowed it. The stripes are only light: grass laid one way
 * looks pale, laid the other way looks dark. What the lawn remembers is everything that stood on it.
 * Engine: the mowing is planned like a person does it (a headland lap round the edge, then back-and-forth passes
 * with a wandering hand and some overlap, a careful circle round the tree), rasterised into a lean field: each
 * blade remembers the direction of the last pass that bent it. Light: each blade is a tilted, slightly waxy facet;
 * diffuse and sheen from the sun and sky give the stripe contrast, which weakens as the grass recovers. Traces are
 * physiological: grass under a pool for a fortnight etiolates (no chlorophyll), urine scorches a centre and feeds a
 * greener ring, play wears the turf to soil; dew is brushed off where someone walked across. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RM = R.fork('mow'), RT = R.fork('traces'), RL = R.fork('light'), RX = R.fork('texture');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var WM = 8, HM = 10, VW = 1000, VH = 1250, CL = 0.02, GW = 400, GH = 500;
  var Q = C.platform === 'standalone' ? C.query : null;

  var pattern = RM.weighted([['Straight Stripes', 50], ['Diagonal Stripes', 24], ['Cross-Cut', 14], ['Wandering', 12]]);
  var since = RM.weighted([['This Morning', 44], ['Yesterday', 36], ['Three Days', 20]]);
  var light = RL.weighted([['Dew', 24], ['Midday', 36], ['Afternoon', 28], ['Overcast', 12]]);
  var trace = RT.weighted([['None', 8], ['Paddling Pool', 20], ['Dog Spots', 18], ['Goalmouth', 16], ['Chair Moved', 12], ['Missed Strip', 14], ['Sun Lounger', 12]]);
  var obstacle = RM.weighted([['None', 36], ['Tree', 40], ['Washing Line', 24]]);
  if (Q && Q.get('trace')) trace = Q.get('trace'); if (Q && Q.get('light')) light = Q.get('light'); if (Q && Q.get('pattern')) pattern = Q.get('pattern');

  // lawn: the frame is mostly lawn, with one or two hard edges (patio, border)
  var edgeT = RM.weighted([['Patio', 40], ['Border', 30], ['Both', 30]]);
  var lx0 = 0, ly0 = 0, lx1 = WM, ly1 = HM, patioSide = RM.int(0, 3), patioW = RM.range(0.85, 1.55), bedW = RM.range(0.7, 1.2);
  var hasPatio = edgeT !== 'Border', hasBed = edgeT !== 'Patio', bedSide = (patioSide + RM.pick([1, 2, 3])) % 4;
  function cut(side, w) { if (side === 0) ly0 = w; else if (side === 1) lx1 = WM - w; else if (side === 2) ly1 = HM - w; else lx0 = w; }
  if (hasPatio) cut(patioSide, patioW); if (hasBed) cut(bedSide, bedW);

  // tree sits near an edge so a modest canopy does not swallow the lawn
  var tree = null;
  if (obstacle !== 'None') {
    var tx, ty, tries = 0;
    do {
      tx = RM.range(lx0 + 0.7, lx1 - 0.7); ty = RM.range(ly0 + 0.7, ly1 - 0.7); tries++;
      var eDist = Math.min(tx - lx0, lx1 - tx, ty - ly0, ly1 - ty);
    } while (eDist > 2.2 && tries < 8);
    if (obstacle === 'Tree') tree = { x: tx, y: ty, r: RM.range(0.07, 0.13), cr: RM.range(0.95, 1.55), well: RM.range(0.22, 0.38), seed: (RM.rand() * 1e5) | 0 };
    else tree = { x: tx, y: ty, r: 0.03, cr: 0, well: 0, seed: (RM.rand() * 1e5) | 0, post2: [clamp(tx + RM.pick([-1, 1]) * RM.range(1.8, 2.8), lx0 + 0.3, lx1 - 0.3), clamp(ty + RM.gaussian(0, 0.15), ly0 + 0.3, ly1 - 0.3)] };
  }

  // ---------------- mowing: lean field ----------------
  var N = GW * GH, LX = new Float32Array(N), LY = new Float32Array(N), ORD = new Float32Array(N), MOWN = new Uint8Array(N);
  var deck = RM.range(0.42, 0.53), ord = 1, wob = (RM.rand() * 1e5) | 0;
  function pass(pts) {
    for (var k = 0; k + 1 < pts.length; k++) {
      var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (L < 1e-4) continue; dx /= L; dy /= L;
      var x0 = Math.floor((Math.min(a[0], b[0]) - deck) / CL), x1 = Math.ceil((Math.max(a[0], b[0]) + deck) / CL), y0 = Math.floor((Math.min(a[1], b[1]) - deck) / CL), y1 = Math.ceil((Math.max(a[1], b[1]) + deck) / CL);
      for (var y = Math.max(0, y0); y <= Math.min(GH - 1, y1); y++) for (var x = Math.max(0, x0); x <= Math.min(GW - 1, x1); x++) {
        var X = (x + 0.5) * CL, Y = (y + 0.5) * CL, d = PX.segDist(X, Y, a[0], a[1], b[0], b[1]);
        if (d > deck / 2) continue;
        var i = y * GW + x; LX[i] = dx; LY[i] = dy; ORD[i] = ord; MOWN[i] = 1;
      }
      ord++;
    }
  }
  function stripes(theta, phase) {
    var ux = Math.cos(theta), uy = Math.sin(theta), vx = -uy, vy = ux, cx = (lx0 + lx1) / 2, cy = (ly0 + ly1) / 2, ext = Math.hypot(WM, HM) / 2 + 1, sp = deck * 0.88, n = Math.ceil(ext * 2 / sp);
    for (var s = 0; s < n; s++) {
      var off = -ext + s * sp + phase, dir = s % 2 ? 1 : -1, pts = [];
      for (var t = -ext; t <= ext; t += 0.25) { var tt = t * dir, lat = off + 0.06 * PX.vnoise(tt * 0.35, s * 3.1, wob) + 0.025 * PX.vnoise(tt * 1.3, s, wob + 1);
        pts.push([cx + ux * tt + vx * lat, cy + uy * tt + vy * lat]); }
      pass(pts);
    }
  }
  function headland(inset) { var a = lx0 + inset, b = ly0 + inset, c = lx1 - inset, d = ly1 - inset, pts = [[a, b], [c, b], [c, d], [a, d], [a, b]], q = [];
    for (var k = 0; k < 4; k++) { var p0 = pts[k], p1 = pts[k + 1]; for (var t = 0; t < 1; t += 0.05) q.push([lerp(p0[0], p1[0], t) + 0.04 * PX.vnoise(t * 9 + k, 1, wob + 5), lerp(p0[1], p1[1], t) + 0.04 * PX.vnoise(t * 9 + k, 2, wob + 6)]); } q.push(pts[4]); pass(q); }
  var theta = pattern === 'Diagonal Stripes' ? RM.pick([1, -1]) * RM.range(0.55, 0.85) : RM.pick([0, PI / 2]) + RM.gaussian(0, 0.02), headLast = RM.chance(0.6);
  if (!headLast) { headland(deck / 2); headland(deck * 1.4); }
  if (pattern === 'Wandering') {
    var ux = Math.cos(theta), uy = Math.sin(theta);
    for (var s2 = 0; s2 < 32; s2++) { var pts = [], off = -5 + s2 * deck * 0.88 + RM.gaussian(0, 0.05), dir = s2 % 2 ? 1 : -1;
      for (var t2 = -7; t2 <= 7; t2 += 0.25) { var lat = off + 0.09 * PX.vnoise(t2 * 0.22 * dir, s2 * 0.55, wob + 9); pts.push([WM / 2 + ux * t2 * dir - uy * lat, HM / 2 + uy * t2 * dir + ux * lat]); } pass(pts); }
  } else { if (pattern === 'Cross-Cut') stripes(theta + PI / 2, RM.range(0, deck)); stripes(theta, RM.range(0, deck)); }
  if (headLast) { headland(deck * 1.4); headland(deck / 2); }
  if (tree && obstacle === 'Tree') { for (var lap = 0; lap < 2; lap++) { var rr = tree.well + deck * (0.35 + lap * 0.85), pts2 = []; for (var a2 = 0; a2 <= PI * 2.05; a2 += 0.1) { var jr = rr + 0.04 * PX.vnoise(Math.cos(a2) * 3, Math.sin(a2) * 3, wob + 20); pts2.push([tree.x + Math.cos(a2) * jr, tree.y + Math.sin(a2) * jr]); } pass(pts2); } }

  var missed = null; if (trace === 'Missed Strip') { var vx2 = -Math.sin(theta), vy2 = Math.cos(theta), o2 = RT.range(-2, 2); missed = { ox: WM / 2 + vx2 * o2, oy: HM / 2 + vy2 * o2, ux: Math.cos(theta), uy: Math.sin(theta), w: RT.range(0.08, 0.16), L: RT.range(2.4, 6.5), c: RT.range(-2, 2) }; }

  // ---------------- traces ----------------
  var tr = [];
  if (trace === 'Paddling Pool') tr.push({ k: 'pool', x: RT.range(lx0 + 1.7, lx1 - 1.7), y: RT.range(ly0 + 1.7, ly1 - 1.7), r: RT.range(0.8, 1.2), days: RT.range(10, 22), seed: (RT.rand() * 1e5) | 0 });
  if (trace === 'Sun Lounger') { var lxp = RT.range(lx0 + 1, lx1 - 1.2), lyp = RT.range(ly0 + 1, ly1 - 2.2); tr.push({ k: 'lounger', x: lxp, y: lyp, w: 0.62, h: 1.9, rot: RT.range(-0.35, 0.35) }); }
  if (trace === 'Dog Spots') { var n3 = RT.int(3, 6), cxd = RT.range(lx0 + 1.2, lx1 - 1.2), cyd = RT.range(ly0 + 1.2, ly1 - 1.2); for (var d3 = 0; d3 < n3; d3++) tr.push({ k: 'dog', x: clamp(cxd + RT.gaussian(0, 1.2), lx0 + 0.35, lx1 - 0.35), y: clamp(cyd + RT.gaussian(0, 1.2), ly0 + 0.35, ly1 - 0.35), r: RT.range(0.14, 0.26), age: RT.rand() }); }
  if (trace === 'Goalmouth') { var gs = hasPatio ? patioSide : RM.int(0, 3); tr.push({ k: 'goal', side: gs, at: RT.range(0.32, 0.68), w: RT.range(1.7, 2.3) }); }
  if (trace === 'Chair Moved') { var cx3 = RT.range(lx0 + 1.1, lx1 - 1.1), cy3 = RT.range(ly0 + 1.1, ly1 - 1.1), rot3 = RT.range(0, 6.28); for (var c3 = 0; c3 < 2; c3++) { var ox = cx3 + c3 * RT.range(0.35, 0.8), oy = cy3 + c3 * RT.range(-0.45, 0.45); tr.push({ k: 'chair', x: ox, y: oy, rot: rot3 + c3 * RT.range(-0.4, 0.4), strong: c3 ? 0.55 : 1 }); } }
  var walker = null; if (light === 'Dew') { var side = RT.int(0, 1), y0w = RT.range(ly0 + 1, ly1 - 1); walker = { a: side ? [lx0 - 0.2, y0w] : [RT.range(lx0 + 1, lx1 - 1), ly0 - 0.2], b: [RT.range(lx0 + 1, lx1 - 1), ly1 + 0.2], seed: (RT.rand() * 1e5) | 0 }; }
  function yellowAt(X, Y) {
    var e = 0, flat = 0, pale = 0;
    for (var k = 0; k < tr.length; k++) { var t = tr[k];
      if (t.k === 'pool') { var d = Math.hypot(X - t.x, Y - t.y), edgeJ = 0.055 * PX.vnoise(Math.atan2(Y - t.y, X - t.x) * 5, 0, t.seed), rr = t.r + edgeJ;
        var inside = sstep(rr + 0.05, rr - 0.03, d), wall = Math.exp(-Math.pow((d - rr) / 0.035, 2));
        var blade = 0.85 + 0.15 * PX.vnoise(X * 40, Y * 40, t.seed + 1);
        e = Math.max(e, inside * (0.5 + 0.35 * sstep(rr * 0.55, 0, d)) * Math.min(1, t.days / 12) * blade + wall * 0.4); flat = Math.max(flat, inside * 0.9); }
      if (t.k === 'lounger') { var c = Math.cos(t.rot), s = Math.sin(t.rot), u = (X - t.x) * c + (Y - t.y) * s, v = -(X - t.x) * s + (Y - t.y) * c;
        var legs = [[0.05, 0.06], [t.w - 0.05, 0.06], [0.05, t.h - 0.06], [t.w - 0.05, t.h - 0.06]]; for (var q = 0; q < 4; q++) { var dl = Math.hypot(u - legs[q][0], v - legs[q][1]); pale = Math.max(pale, sstep(0.08, 0.025, dl) * 0.95); }
        var inR = (u > -0.06 && u < t.w + 0.06 && v > -0.06 && v < t.h + 0.06) ? sstep(-0.06, 0.1, Math.min(u + 0.06, t.w + 0.06 - u, v + 0.06, t.h + 0.06 - v)) : 0;
        pale = Math.max(pale, inR * 0.58); flat = Math.max(flat, inR * 0.7); }
      if (t.k === 'chair') { var c2 = Math.cos(t.rot), s2 = Math.sin(t.rot); for (var q2 = 0; q2 < 4; q2++) { var lx = (q2 & 1 ? 0.22 : -0.22), ly = (q2 & 2 ? 0.22 : -0.22), px = t.x + lx * c2 - ly * s2, py = t.y + lx * s2 + ly * c2; pale = Math.max(pale, sstep(0.12, 0.03, Math.hypot(X - px, Y - py)) * 0.9 * t.strong); } }
    }
    return [e, flat, pale];
  }

  // ---------------- render ----------------
  var o = PX.canvas(C, VW, VH, '#10130d'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var mpp = WM / PW, seed = (RX.rand() * 1e6) | 0;
  var sunAz = RL.range(0, 6.283), sunEl = { 'Dew': 0.32, 'Midday': 1.05, 'Afternoon': 0.58, 'Overcast': 0.85 }[light], Sx = Math.cos(sunAz) * Math.cos(sunEl), Sy = Math.sin(sunAz) * Math.cos(sunEl), Sz = Math.sin(sunEl);
  var sunI = light === 'Overcast' ? 0.15 : light === 'Dew' ? 1.15 : light === 'Afternoon' ? 1.9 : 2.15, skyI = light === 'Overcast' ? 1.35 : light === 'Dew' ? 0.7 : 0.58;
  var recover = { 'This Morning': 1, 'Yesterday': 0.78, 'Three Days': 0.58 }[since], bend = 0.48 * recover;
  var g0 = PX.col('#3a5424'), g1 = PX.col('#5a6e30'), g2 = PX.col('#2d4a1e'), gy = PX.col('#c4b56a'), soil = PX.col('#6a533e'), dryC = PX.col('#9a8048'), lush = PX.col('#1e5a1c');
  var thatch = PX.col('#7a6238'), tip = PX.col('#8a8a3a'), paveA = PX.col('#b0a898'), paveB = PX.col('#9a9386'), bedC = PX.col('#3a2c22'), mulch = PX.col('#4a3528');
  var sunC = light === 'Afternoon' ? [1.0, 0.88, 0.7] : light === 'Dew' ? [1.0, 0.92, 0.8] : [1.0, 0.97, 0.9];
  var skyC = light === 'Overcast' ? [0.72, 0.76, 0.8] : [0.55, 0.68, 0.92];

  function lawnEdge(X, Y) {
    // irregular centimetre-scale edge, so the lawn does not meet the patio in a ruled line
    var n = 0.04 * PX.vnoise(X * 8, Y * 8, seed + 50) + 0.015 * PX.vnoise(X * 24, Y * 24, seed + 51);
    return { inL: X > lx0 + n && X < lx1 - n && Y > ly0 + n && Y < ly1 - n, n: n };
  }

  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) * mpp, Y = (py + 0.5) * mpp, r, g, b;
    var edge = lawnEdge(X, Y), inLawn = edge.inL;

    // tree canopy (drawn on top later, but the well and shade affect the ground first)
    var canopy = 0, canopyN = 0, shade = 0, inWell = 0, trunk = 0;
    if (tree && obstacle === 'Tree') {
      var dT = Math.hypot(X - tree.x, Y - tree.y), angT = Math.atan2(Y - tree.y, X - tree.x);
      var cJ = 1 + 0.18 * PX.fbm(Math.cos(angT) * 1.4 + 4, Math.sin(angT) * 1.4, tree.seed, 3) + 0.08 * PX.vnoise(X * 6, Y * 6, tree.seed + 2);
      var cR = tree.cr * cJ;
      canopyN = sstep(cR + 0.04, cR - 0.08, dT);
      var gaps = sstep(0.15, 0.42, PX.fbm(X * 3.2, Y * 3.2, tree.seed + 3, 4));
      canopy = canopyN * (1 - 0.85 * gaps * sstep(cR * 0.55, cR, dT));
      var wellJ = tree.well * (1 + 0.22 * PX.vnoise(Math.cos(angT) * 2, Math.sin(angT) * 2, tree.seed + 4));
      inWell = sstep(wellJ + 0.04, wellJ - 0.05, dT);
      trunk = sstep(tree.r + 0.01, tree.r - 0.015, dT);
      // dappled shade under and just beyond the drip line, stretched by the sun
      var sx = X - tree.x - Sx / Math.max(0.2, Sz) * 0.15, sy = Y - tree.y - Sy / Math.max(0.2, Sz) * 0.15;
      var dS = Math.hypot(sx, sy), sR = cR * 0.95;
      shade = sstep(sR + 0.08, sR - 0.15, dS) * (0.35 + 0.55 * (1 - sstep(0.2, 0.55, PX.fbm(sx * 4, sy * 4, tree.seed + 5, 3)))) * (light === 'Overcast' ? 0.25 : 1);
    }

    if (!inLawn) {
      var isPatio = hasPatio && ((patioSide === 0 && Y < patioW) || (patioSide === 1 && X > WM - patioW) || (patioSide === 2 && Y > HM - patioW) || (patioSide === 3 && X < patioW));
      if (isPatio) {
        var slx = 0.48, sly = 0.48, bond = (Math.floor((patioSide === 1 || patioSide === 3 ? Y : X) / sly) & 1) * 0.5;
        var ax = (patioSide === 1 || patioSide === 3) ? Y / slx : X / slx, ay = (patioSide === 1 || patioSide === 3) ? X / sly : Y / sly;
        ax += bond;
        var a = Math.floor(ax), b2 = Math.floor(ay), fx = ax - a, fy = ay - b2, j = Math.min(fx, 1 - fx, fy, 1 - fy) * slx;
        var pv = PX.h2(a, b2, seed), tone = 0.82 + 0.28 * pv, stain = 0.15 * sstep(0.55, 0.85, PX.fbm(X * 2.2 + a, Y * 2.2, seed + 4, 3));
        var colP = pv > 0.82 ? paveB : paveA, moss = sstep(0.01, 0.0, j) * sstep(0.3, 0.7, PX.fbm(X * 5, Y * 5, seed + 6, 3));
        var jt = sstep(0.01, 0.0, j), grit = 0.94 + 0.08 * PX.fbm(X * 40, Y * 40, seed + 7, 3) + 0.04 * PX.vnoise(X * 220, Y * 220, seed + 8);
        r = colP[0] * tone * grit * (1 - 0.45 * jt) * (1 - stain);
        g = colP[1] * tone * grit * (1 - 0.45 * jt) * (1 - stain * 0.9);
        b = colP[2] * tone * grit * (1 - 0.4 * jt) * (1 - stain * 0.8);
        if (moss > 0) { r = lerp(r, lush[0] * 0.45, moss * 0.7); g = lerp(g, lush[1] * 0.5, moss * 0.7); b = lerp(b, lush[2] * 0.35, moss * 0.7); }
      } else {
        var cl = 0.8 + 0.3 * PX.fbm(X * 18, Y * 18, seed + 6, 3) + 0.08 * PX.vnoise(X * 90, Y * 90, seed + 9);
        r = bedC[0] * cl; g = bedC[1] * cl; b = bedC[2] * cl;
        // overlapping plant clumps of a few sizes, not a binary fbm mask
        var p1 = sstep(0.12, 0.38, PX.fbm(X * 1.3, Y * 1.3, seed + 7, 4));
        var p2 = sstep(0.2, 0.5, PX.fbm(X * 2.8 + 8, Y * 2.8, seed + 10, 4));
        var p3 = sstep(0.35, 0.65, PX.fbm(X * 5.5, Y * 5.5, seed + 11, 3));
        var lf = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * PX.vnoise(X * 38, Y * 38, seed + 8), 1.6);
        if (p1 > 0) { var cA = 0.55 + 0.45 * p1; r = lerp(r, g2[0] * lf * 0.85, cA); g = lerp(g, g2[1] * lf * 0.95, cA); b = lerp(b, g2[2] * lf * 0.7, cA); }
        if (p2 > 0) { r = lerp(r, lush[0] * lf * 0.7, p2 * 0.7); g = lerp(g, lush[1] * lf * 0.85, p2 * 0.7); b = lerp(b, lush[2] * lf * 0.55, p2 * 0.7); }
        if (p3 > 0) { r = lerp(r, g1[0] * lf, p3 * 0.45); g = lerp(g, g1[1] * lf, p3 * 0.45); b = lerp(b, g1[2] * lf, p3 * 0.45); }
      }
      var ed = Math.min(Math.abs(X - lx0), Math.abs(X - lx1), Math.abs(Y - ly0), Math.abs(Y - ly1));
      if (ed < 0.08) { var sh0 = 0.78 + 0.22 * ed / 0.08; r *= sh0; g *= sh0; b *= sh0; }
      var Lt = skyI * 0.75 + sunI * Sz * 0.85; r *= Lt * sunC[0]; g *= Lt * sunC[1]; b *= Lt * sunC[2];
      if (canopy > 0.15) { /* fall through to canopy draw at the end of the pixel */ }
      else { Rr[I] = r; Gg[I] = g; Bb[I] = b; if (canopy <= 0) continue; }
    }

    if (inLawn || canopy > 0.15) {
      if (inLawn) {
        var gx = X / CL - 0.5, gy2 = Y / CL - 0.5, gi = clamp(Math.round(gy2), 0, GH - 1) * GW + clamp(Math.round(gx), 0, GW - 1);
        var dx = LX[gi], dy = LY[gi], mown = MOWN[gi];
        var tlen = 0;
        if (tree && obstacle === 'Tree') { var dt = Math.hypot(X - tree.x, Y - tree.y); if (dt < tree.well + 0.18) tlen = sstep(tree.well + 0.18, tree.well + 0.04, dt) * (1 - inWell); }
        if (missed) { var u3 = (X - missed.ox) * missed.ux + (Y - missed.oy) * missed.uy, v3 = -(X - missed.ox) * missed.uy + (Y - missed.oy) * missed.ux;
          var wiggle = 0.02 * PX.vnoise(u3 * 3, 0, seed);
          if (Math.abs(u3 - missed.c) < missed.L / 2) tlen = Math.max(tlen, sstep(missed.w, missed.w * 0.35, Math.abs(v3 - wiggle))); }
        if (!mown) tlen = 1;
        var bnd = bend * (1 - tlen) * (0.88 + 0.24 * PX.vnoise(X * 8, Y * 8, seed + 10));
        var nx = -dx * Math.sin(bnd), ny = -dy * Math.sin(bnd), nz = Math.cos(bnd);
        var ndl = Math.max(0, nx * Sx + ny * Sy + nz * Sz);
        var hx = Sx, hy = Sy, hz = Sz + 1, hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;
        var sheen = Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), 14) * 0.55 + 0.28 * (nz - 0.62) * (1 - tlen);
        // a stable stripe term: blades laid toward the sun show more of their bright cuticle
        var lay = (dx * Sx + dy * Sy); var stripe = lay * Math.sin(bnd) * 0.35;
        var ua = (X * dx + Y * dy), va = (-X * dy + Y * dx);
        var streak = tlen > 0.5 ? PX.vnoise(X * 140, Y * 140, seed + 11) : 0.55 * PX.vnoise(ua * 45, va * 280, seed + 12) + 0.45 * PX.vnoise(ua * 18, va * 110, seed + 17);
        var clump = PX.fbm(X * 2.4, Y * 2.4, seed + 13, 4), fine = PX.vnoise(X * 320, Y * 320, seed + 14);
        var health = PX.fbm(X * 0.45, Y * 0.45, seed + 15, 4), clov = sstep(0.28, 0.5, PX.fbm(X * 1.7 + 30, Y * 1.7, seed + 16, 4));
        var thin = sstep(0.68, 0.38, 0.5 + 0.5 * PX.fbm(X * 2.2 + 9, Y * 2.2, seed + 18, 3));
        var base = [lerp(lerp(g0[0], g1[0], 0.5 + 0.5 * health), g2[0], 0.22 * (1 - health)), lerp(lerp(g0[1], g1[1], 0.5 + 0.5 * health), g2[1], 0.22 * (1 - health)), lerp(lerp(g0[2], g1[2], 0.5 + 0.5 * health), g2[2], 0.22 * (1 - health))];
        // a little thatch in thin patches only, slightly yellow tips, occasional clover
        if (thin > 0) { base = [lerp(base[0], thatch[0], thin * 0.16), lerp(base[1], thatch[1], thin * 0.16), lerp(base[2], thatch[2], thin * 0.16)]; }
        if (clov > 0) { base = [lerp(base[0], lush[0] * 0.85, clov * 0.35), lerp(base[1], lush[1] * 1.05, clov * 0.4), lerp(base[2], lush[2] * 0.7, clov * 0.35)]; }
        var tips = 0.08 * (0.5 + 0.5 * fine) * (1 - tlen);
        base = [lerp(base[0], tip[0], tips), lerp(base[1], tip[1], tips), lerp(base[2], tip[2], tips)];
        if (since === 'This Morning' && mown && tlen < 0.4) { var cut = 0.1 * recover; base = [lerp(base[0], base[0] * 1.15 + 0.02, cut), lerp(base[1], base[1] * 1.12 + 0.015, cut), lerp(base[2], base[2] * 0.95, cut)]; }
        var yf = yellowAt(X, Y), ye = yf[0], pale = yf[2];
        if (ye > 0) { var dead = [lerp(gy[0], 0.72, 0.35 * ye), lerp(gy[1], 0.68, 0.25 * ye), lerp(gy[2], 0.42, 0.2 * ye)];
          base = [lerp(base[0], dead[0], ye), lerp(base[1], dead[1], ye), lerp(base[2], dead[2], ye)]; }
        if (pale > 0) { var pc = [base[0] * 1.28 + 0.07, base[1] * 1.14 + 0.04, base[2] * 0.68];
          base = [lerp(base[0], pc[0], pale), lerp(base[1], pc[1], pale), lerp(base[2], pc[2], pale)]; }
        for (var k = 0; k < tr.length; k++) { var t = tr[k];
          if (t.k === 'dog') { var dd = Math.hypot(X - t.x, Y - t.y) / t.r, jx = 0.12 * PX.vnoise(X * 18, Y * 18, seed + 40 + k);
            var cen = sstep(0.95, 0.45, dd + jx), ring = Math.exp(-Math.pow((dd - 1.45) / 0.4, 2)) * (0.65 + 0.35 * t.age);
            var scorch = [dryC[0] * 0.95, dryC[1] * 0.85, dryC[2] * 0.7];
            base = [lerp(lerp(base[0], lush[0], ring * 0.85), scorch[0], cen * (0.85 - 0.25 * t.age)), lerp(lerp(base[1], lush[1], ring * 0.85), scorch[1], cen * (0.85 - 0.25 * t.age)), lerp(lerp(base[2], lush[2], ring * 0.85), scorch[2], cen * (0.85 - 0.25 * t.age))]; }
          if (t.k === 'goal') {
            var along = t.side === 0 || t.side === 2 ? X : Y, depth = t.side === 0 ? Y - ly0 : t.side === 2 ? ly1 - Y : t.side === 1 ? lx1 - X : X - lx0;
            var mid = t.at * (t.side === 0 || t.side === 2 ? WM : HM), wide = Math.abs(along - mid);
            var box = sstep(t.w * 0.5, t.w * 0.28, wide + 0.12 * PX.fbm(X * 3, Y * 3, seed + 33, 3)) * sstep(2.4, 0.2, depth + 0.12 * PX.fbm(X * 2.4, Y * 2.4, seed + 34, 3));
            var goalie = Math.exp(-Math.pow(wide / (t.w * 0.16), 2)) * sstep(0.7, 0.05, depth) * sstep(1.15, 0.45, depth);
            var post = 0; var pOff = t.w * 0.4; for (var sg = -1; sg <= 1; sg += 2) { var pd = Math.hypot(along - (mid + sg * pOff), depth - 0.05); post = Math.max(post, sstep(0.1, 0.035, pd)); }
            var wear = clamp(box * 0.85 + goalie * 0.8, 0, 1); var bare = sstep(0.35, 0.82, wear + 0.15 * PX.vnoise(X * 22, Y * 22, seed + 35) + post * 0.6);
            base = [lerp(lerp(base[0], dryC[0], wear * 0.7), soil[0], bare), lerp(lerp(base[1], dryC[1], wear * 0.7), soil[1], bare), lerp(lerp(base[2], dryC[2], wear * 0.7), soil[2], bare)];
          }
        }
        if (inWell > 0 && obstacle === 'Tree') {
          var mtex = 0.75 + 0.3 * PX.fbm(X * 25, Y * 25, seed + 36, 3) + 0.08 * PX.vnoise(X * 120, Y * 120, seed + 37);
          var mc = [mulch[0] * mtex, mulch[1] * mtex, mulch[2] * mtex];
          base = [lerp(base[0], mc[0], inWell), lerp(base[1], mc[1], inWell), lerp(base[2], mc[2], inWell)];
        }
        // a few fallen leaves near the drip line
        if (tree && obstacle === 'Tree') {
          var dRip = Math.hypot(X - tree.x, Y - tree.y);
          if (dRip < tree.cr * 1.35 && dRip > tree.well) {
            var leaf = sstep(0.88, 0.97, PX.vnoise(X * 28, Y * 28, tree.seed + 8));
            if (leaf > 0) { var lc2 = PX.col('#6a4a1c'); base = [lerp(base[0], lc2[0], leaf * 0.7), lerp(base[1], lc2[1], leaf * 0.7), lerp(base[2], lc2[2], leaf * 0.7)]; }
          }
        }
        var crev = streak * 0.5 + 0.5, v = (0.58 + 0.5 * crev * crev) * (0.9 + 0.14 * clump) * (0.94 + 0.08 * fine) * (1 - 0.2 * tlen * (0.5 + 0.5 * streak));
        var Ls = skyI * (0.58 + 0.42 * nz) + sunI * (0.55 * ndl + 0.45 * Sz) + stripe * (sunI + skyI * 0.6);
        Ls *= 1 - 0.45 * shade;
        var spec = (sunI * 0.28 + skyI * 0.22) * sheen * (1 - 0.5 * shade);
        r = base[0] * v * Ls * (0.85 + 0.15 * sunC[0]) + spec * 0.07;
        g = base[1] * v * Ls * (0.85 + 0.15 * sunC[1]) + spec * 0.09;
        b = base[2] * v * Ls * (0.85 + 0.15 * sunC[2]) + spec * 0.08;
        if (light === 'Dew') {
          var dew = 1;
          if (walker) { var wx = walker.b[0] - walker.a[0], wy = walker.b[1] - walker.a[1], wl = Math.hypot(wx, wy); wx /= wl; wy /= wl;
            var wu = (X - walker.a[0]) * wx + (Y - walker.a[1]) * wy, wv = -(X - walker.a[0]) * wy + (Y - walker.a[1]) * wx - 0.22 * PX.vnoise(wu * 0.25, 0, walker.seed);
            if (Math.abs(wv) < 0.38 && wu > -0.5 && wu < wl + 0.5) { var st = Math.round(wu / 0.36), side = (st & 1) ? 1 : -1, fu = wu - st * 0.36, fv = wv - side * 0.09;
              var fp = (fu / 0.15) * (fu / 0.15) + (fv / 0.055) * (fv / 0.055);
              dew = Math.min(dew, sstep(0.65, 1.35, fp + 0.2 * PX.vnoise(X * 50, Y * 50, walker.seed + 2)));
              dew = Math.min(dew, 0.4 + 0.6 * sstep(0.04, 0.2, Math.abs(wv) + 0.05 * PX.vnoise(X * 28, Y * 28, walker.seed + 3))); } }
          // at this scale dew is a cool sheen, not a field of droplets; footprints are matte and darker
          var veil = dew * 0.07;
          r *= 1 + 0.06 * veil; g *= 1 + 0.05 * veil; b *= 1 + 0.1 * veil;
          if (dew < 0.75) { var mat = (0.75 - dew) / 0.75; r *= 1 - 0.28 * mat; g *= 1 - 0.2 * mat; b *= 1 - 0.12 * mat; }
        }
        if (since === 'This Morning' && mown && tlen < 0.5) { var clip = PX.vnoise(X * 90, Y * 90, seed + 40); if (clip > 0.78) { var cf = (clip - 0.78) * 2.4; r = lerp(r, r * 1.18 + 0.01, cf); g = lerp(g, g * 1.14 + 0.01, cf); b = lerp(b, b * 0.95, cf); } }
        if (tree && obstacle === 'Washing Line') {
          var dP = Math.hypot(X - tree.x, Y - tree.y), dP2 = Math.hypot(X - tree.post2[0], Y - tree.post2[1]);
          if (dP < 0.07) { var post = 0.35 + 0.2 * PX.vnoise(X * 80, Y * 80, seed + 41); r = 0.42 * post; g = 0.4 * post; b = 0.37 * post; if (dP < 0.028) { r = 0.18 * post; g = 0.14 * post; b = 0.1 * post; } }
          if (dP2 < 0.07) { var postb = 0.35 + 0.2 * PX.vnoise(X * 80, Y * 80, seed + 42); r = 0.42 * postb; g = 0.4 * postb; b = 0.37 * postb; if (dP2 < 0.028) { r = 0.18 * postb; g = 0.14 * postb; b = 0.1 * postb; } }
          var lineD = PX.segDist(X, Y, tree.x, tree.y, tree.post2[0], tree.post2[1]);
          if (lineD < 0.12) { var worn = sstep(0.12, 0.02, lineD) * 0.25; r = lerp(r, soil[0] * 0.8, worn * 0.35); g = lerp(g, soil[1] * 0.8, worn * 0.35); b = lerp(b, soil[2] * 0.8, worn * 0.35); }
          if (lineD < 0.008) { r *= 0.7; g *= 0.7; b *= 0.72; }
        }
      }
      if (canopy > 0.05) {
        var leafN = 0.5 + 0.5 * PX.fbm(X * 22, Y * 22, tree.seed + 12, 3);
        var leafC = 0.5 + 0.5 * PX.fbm(X * 8, Y * 8, tree.seed + 13, 3);
        var lobe = 0.65 + 0.35 * PX.vnoise(X * 36, Y * 36, tree.seed + 15);
        var dark = 0.4 + 0.6 * sstep(tree.cr * 0.12, tree.cr * 0.9, Math.hypot(X - tree.x, Y - tree.y));
        var lcR = lerp(0.06, 0.2, leafC) * dark * (0.7 + 0.4 * leafN) * lobe;
        var lcG = lerp(0.18, 0.38, leafC) * dark * (0.75 + 0.35 * leafN) * lobe;
        var lcB = lerp(0.04, 0.11, leafC) * dark * (0.7 + 0.3 * leafN) * lobe;
        var Lcan = skyI * 0.7 + sunI * (0.35 + 0.5 * Sz) * (1 - 0.3 * shade);
        lcR *= Lcan; lcG *= Lcan; lcB *= Lcan;
        var cv = sstep(0.05, 0.85, canopy);
        if (!inLawn) { r = lcR; g = lcG; b = lcB; }
        else { r = lerp(r, lcR, cv); g = lerp(g, lcG, cv); b = lerp(b, lcB, cv); }
        if (trunk > 0 && canopy < 0.85) { var bark = 0.45 + 0.5 * PX.vnoise(angT * 10, dT * 40, tree.seed + 14); var tk = sstep(0.15, 0.9, trunk) * (1 - 0.6 * canopy);
          r = lerp(r, 0.14 * bark, tk); g = lerp(g, 0.1 * bark, tk); b = lerp(b, 0.07 * bark, tk); }
      }
    }
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  C.features({ Mowing: pattern, Mown: since, Light: light, Trace: trace, Obstacle: obstacle, Edge: edgeT });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.22, filmic: true, grain: 0.014, vig: 0.22, seed: 5 });
  C.done(o.cv.canvas, 'mown');
})();

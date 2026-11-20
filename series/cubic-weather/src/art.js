/* Cubic Weather by Clyde (2026), after Manfred Mohr, "Cubic Limit" (1973–75), with orbits
 * from the Clifford / Peter de Jong / Svensson strange attractors (popularised by Clifford
 * Pickover and Paul Bourke). Each mark is a subset of the edges of a rotated cube (or
 * hypercube), and the marks are carried along the orbit of a chaotic map. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RA = R.fork('attractor'), RG = R.fork('glyphs');
  var VW = 1000, VH = 1000;
  var PAL = {
    'Mohr White':  { bg: '#f3f1ea', ink: '#121212', dust: '#121212', acc: '#121212' },
    'Negative':    { bg: '#0f0f10', ink: '#f1eee5', dust: '#f1eee5', acc: '#f1eee5' },
    'Signal Red':  { bg: '#f2eee6', ink: '#161616', dust: '#161616', acc: '#d0342c' },
    'Cyanotype':   { bg: '#1c3d6b', ink: '#eef3f6', dust: '#cfe0ee', acc: '#eef3f6' },
    'Graphite':    { bg: '#e8e5dd', ink: '#2a2a2a', dust: '#55524c', acc: '#2a6f8f' }
  };
  var palName = RP.weighted([['Mohr White', 32], ['Negative', 20], ['Signal Red', 18], ['Cyanotype', 14], ['Graphite', 16]]);
  var P = PAL[palName];
  var family = RL.weighted([['Clifford', 40], ['de Jong', 35], ['Svensson', 25]]);
  var solid = RL.weighted([['Cube', 72], ['Hypercube', 28]]);
  var alphabet = RL.weighted([['Sparse signs', 30], ['Half cube', 45], ['Dense', 25]]);
  var weather = RL.weighted([['Clear', 25], ['Haze', 50], ['Storm', 25]]);
  var count = RL.weighted([['Few', 25], ['Many', 50], ['Swarm', 25]]);
  C.features({ Palette: palName, Attractor: family, Solid: solid, Alphabet: alphabet, Weather: weather, Marks: count });

  function map(f, a, b, c, d) {
    if (f === 'Clifford') return function (x, y) { return [Math.sin(a * y) + c * Math.cos(a * x), Math.sin(b * x) + d * Math.cos(b * y)]; };
    if (f === 'de Jong') return function (x, y) { return [Math.sin(a * y) - Math.cos(b * x), Math.sin(c * x) - Math.cos(d * y)]; };
    return function (x, y) { return [d * Math.sin(a * x) - Math.sin(b * y), c * Math.cos(a * x) + Math.cos(b * y)]; };
  }
  // ---- choose a non-degenerate attractor: fixed 40 candidates, best spread wins
  var best = null, bestScore = -1;
  for (var t = 0; t < 40; t++) {
    var prm = [RA.range(-2.6, 2.6), RA.range(-2.6, 2.6), RA.range(-2.2, 2.2), RA.range(-2.2, 2.2)];
    var F = map(family, prm[0], prm[1], prm[2], prm[3]), x = 0.1, y = 0.1, pts = [];
    for (var i = 0; i < 4100; i++) { var nx = F(x, y); x = nx[0]; y = nx[1]; if (i >= 100) pts.push(x, y); }
    var mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
    for (i = 0; i < pts.length; i += 2) { mnx = Math.min(mnx, pts[i]); mxx = Math.max(mxx, pts[i]); mny = Math.min(mny, pts[i + 1]); mxy = Math.max(mxy, pts[i + 1]); }
    if (!(mxx - mnx > 0.5 && mxy - mny > 0.5) || !isFinite(mxx + mxy)) continue;
    var occ = new Uint8Array(1024), n = 0;
    for (i = 0; i < pts.length; i += 2) {
      var gx = Math.min(31, ((pts[i] - mnx) / (mxx - mnx) * 32) | 0), gy = Math.min(31, ((pts[i + 1] - mny) / (mxy - mny) * 32) | 0);
      if (!occ[gy * 32 + gx]) { occ[gy * 32 + gx] = 1; n++; }
    }
    var o = n / 1024, score = 1 - Math.abs(o - 0.46) - 0.4 * Math.abs(Math.log((mxx - mnx) / (mxy - mny)));
    if (o > 0.2 && score > bestScore) { bestScore = score; best = prm; }
  }
  if (!best) best = [-1.4, 1.6, 1.0, 0.7];
  var F2 = map(family, best[0], best[1], best[2], best[3]);
  var NPT = 160000, X = new Float32Array(NPT), Y = new Float32Array(NPT);
  var px = 0.1, py = 0.1;
  for (i = 0; i < 100; i++) { var q2 = F2(px, py); px = q2[0]; py = q2[1]; }
  var bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
  for (i = 0; i < NPT; i++) { q2 = F2(px, py); px = q2[0]; py = q2[1]; X[i] = px; Y[i] = py; bx0 = Math.min(bx0, px); bx1 = Math.max(bx1, px); by0 = Math.min(by0, py); by1 = Math.max(by1, py); }
  // robust bounds (0.4%..99.6% quantiles) so rare excursions do not shrink the structure
  var sx = [], sy = [];
  for (i = 0; i < NPT; i += 16) { sx.push(X[i]); sy.push(Y[i]); }
  sx.sort(function (a, b) { return a - b; }); sy.sort(function (a, b) { return a - b; });
  bx0 = sx[Math.floor(sx.length * 0.004)]; bx1 = sx[Math.floor(sx.length * 0.996)];
  by0 = sy[Math.floor(sy.length * 0.004)]; by1 = sy[Math.floor(sy.length * 0.996)];
  var margin = 110, sc = Math.min((VW - 2 * margin) / (bx1 - bx0), (VH - 2 * margin) / (by1 - by0));
  var offx = (VW - (bx1 - bx0) * sc) / 2 - bx0 * sc, offy = (VH - (by1 - by0) * sc) / 2 - by0 * sc;
  for (i = 0; i < NPT; i++) { X[i] = X[i] * sc + offx; Y[i] = Y[i] * sc + offy; }
  // density grid
  var DG = 100, D = new Float32Array(DG * DG), dmax = 0;
  for (i = 0; i < NPT; i++) { var di = Math.min(DG - 1, (Y[i] / VH * DG) | 0) * DG + Math.min(DG - 1, (X[i] / VW * DG) | 0); D[di]++; }
  for (i = 0; i < D.length; i++) dmax = Math.max(dmax, D[i]);
  function dens(x, y) { return Math.log(1 + D[Math.min(DG - 1, Math.max(0, (y / VH * DG) | 0)) * DG + Math.min(DG - 1, Math.max(0, (x / VW * DG) | 0))]) / Math.log(1 + dmax); }

  var cv = C.setupCanvas(VW, VH, P.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, VW, VH);
  // ---- weather: the orbit itself as ink dust
  var dustN = { Clear: 0, Haze: 60000, Storm: 160000 }[weather], dc = C.hex2rgb(P.dust);
  ctx.fillStyle = C.rgba(dc, weather === 'Storm' ? 0.14 : 0.18);
  for (i = 0; i < dustN; i++) ctx.fillRect(X[i] - 0.45, Y[i] - 0.45, 0.9, 0.9);

  // ---- solids
  var V = [], E = [];
  var dim = solid === 'Cube' ? 3 : 4;
  for (i = 0; i < (1 << dim); i++) { var v = []; for (var k = 0; k < dim; k++) v.push((i >> k) & 1 ? 1 : -1); V.push(v); }
  for (i = 0; i < V.length; i++) for (var j = i + 1; j < V.length; j++) {
    var diff = 0; for (k = 0; k < dim; k++) if (V[i][k] !== V[j][k]) diff++;
    if (diff === 1) E.push([i, j]);
  }
  var kEdges = solid === 'Cube' ? { 'Sparse signs': [3, 5], 'Half cube': [6, 7], 'Dense': [8, 10] }[alphabet]
                                : { 'Sparse signs': [6, 10], 'Half cube': [14, 18], 'Dense': [22, 28] }[alphabet];
  function project(v, a1, a2, a3, a4) { // rotate (xy, xz, yz [, xw]) then orthographic (perspective for 4D)
    var x = v[0], y = v[1], z = v[2], w = dim === 4 ? v[3] : 0, c, s, t2;
    if (dim === 4) { c = Math.cos(a4); s = Math.sin(a4); t2 = x * c - w * s; w = x * s + w * c; x = t2; var pf = 2.2 / (3.2 - w); x *= pf; y *= pf; z *= pf; }
    c = Math.cos(a1); s = Math.sin(a1); t2 = x * c - y * s; y = x * s + y * c; x = t2;
    c = Math.cos(a2); s = Math.sin(a2); t2 = x * c - z * s; z = x * s + z * c; x = t2;
    c = Math.cos(a3); s = Math.sin(a3); t2 = y * c - z * s; z = y * s + z * c; y = t2;
    return [x, y];
  }
  // ---- place glyphs along the orbit, no overlaps (fixed candidate count)
  var target = { Few: 70, Many: 170, Swarm: 360 }[count];
  var baseSize = { Few: 46, Many: 30, Swarm: 22 }[count];
  var placed = [], cell = 40, hashG = {};
  var tilt2 = RL.range(0, Math.PI), tilt3 = RL.range(0, Math.PI);
  for (var cnd = 0; cnd < 9000 && placed.length < target; cnd++) {
    var idx = (cnd * 37 + RG.int(0, 36)) % NPT;
    var gx2 = X[idx], gy2 = Y[idx], dd = dens(gx2, gy2);
    var size = baseSize * (1.35 - 0.7 * dd) * RG.range(0.85, 1.15);
    var ok = true, cx = (gx2 / cell) | 0, cy = (gy2 / cell) | 0;
    for (var ox = -2; ox <= 2 && ok; ox++) for (var oy = -2; oy <= 2 && ok; oy++) {
      var lst = hashG[(cx + ox) + ',' + (cy + oy)]; if (!lst) continue;
      for (var m = 0; m < lst.length; m++) if (Math.hypot(lst[m].x - gx2, lst[m].y - gy2) < (lst[m].s + size) * 1.05) { ok = false; break; }
    }
    if (!ok || gx2 < 60 || gy2 < 60 || gx2 > VW - 60 || gy2 > VH - 60) continue;
    var nxt = (idx + 1) % NPT, heading = Math.atan2(Y[nxt] - gy2, X[nxt] - gx2);
    var edges = RG.shuffle(E.map(function (e, ii) { return ii; })).slice(0, RG.int(kEdges[0], kEdges[1]));
    var g = { x: gx2, y: gy2, s: size, a1: heading, a2: tilt2 + dd * 1.2, a3: tilt3 + RG.gaussian(0, 0.25), a4: RG.range(0, Math.PI), edges: edges, dd: dd };
    placed.push(g);
    var key = cx + ',' + cy; (hashG[key] = hashG[key] || []).push(g);
  }
  // ---- draw glyphs
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  var accThresh = 0.82;
  placed.forEach(function (g) {
    var col = (palName === 'Signal Red' || palName === 'Graphite') && g.dd > accThresh ? P.acc : P.ink;
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.45, g.s * 0.075);
    var pv = V.map(function (v) { return project(v, g.a1, g.a2, g.a3, g.a4); });
    var sz = g.s / (dim === 4 ? 1.6 : 1.75);
    g.edges.forEach(function (ei) {
      var a = pv[E[ei][0]], b = pv[E[ei][1]];
      var p0 = [g.x + a[0] * sz, g.y + a[1] * sz], p1 = [g.x + b[0] * sz, g.y + b[1] * sz];
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      C.poly([p0, p1], col);
    });
  });
  C.done(cv.canvas, 'cubic-weather');
})();

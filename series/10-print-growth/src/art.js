/* 10 PRINT Growth by Clyde (2026), after Sébastien Truchet's tilings (1704), the Commodore 64
 * one-liner 10 PRINT CHR$(205.5+RND(1)); : GOTO 10 (as in Montfort et al., 2012), Cyril
 * Stanley Smith's quarter-circle variant (1987), and differential growth as written up by
 * Anders Hoff (inconvergent). A random Truchet maze sets the walls; closed lines grow by
 * differential growth inside the largest chambers until they crowd against the walls. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RG = R.fork('growth');
  var VW = 1000, VH = 1250;
  var PAL = {
    'Commodore':   { bg: '#3e31a2', wall: '#a59cf0', inks: ['#e9e6ff', '#7ce0e8', '#f6d55c', '#ff8a7a'] },
    'Paper Maze':  { bg: '#f2eee4', wall: '#1d1d1d', inks: ['#c0392b', '#1f4e8c', '#2d7d5a', '#d98e04'] },
    'Riso Garden': { bg: '#f6f1e6', wall: '#3b3b3b', inks: ['#ff48b0', '#0078bf', '#00a95c', '#ffb511'] },
    'Ink & Rust':  { bg: '#ece6da', wall: '#2a2522', inks: ['#9e3d22', '#5b3a29', '#d07a3c', '#2f4858'] },
    'Phosphor':    { bg: '#0c120e', wall: '#2f6b43', inks: ['#8cff9e', '#c9ffd2', '#52d273', '#e4ff7a'] }
  };
  var palName = RP.weighted([['Paper Maze', 28], ['Riso Garden', 22], ['Ink & Rust', 20], ['Commodore', 15], ['Phosphor', 15]]);
  var P = PAL[palName];
  var tileSet = RL.weighted([['Diagonal', 45], ['Arcs', 35], ['Mixed', 20]]);
  var scaleName = RL.weighted([['Coarse', 35], ['Medium', 45], ['Fine', 20]]);
  var s = { Coarse: 125, Medium: 100, Fine: 78 }[scaleName];
  var stage = RL.weighted([['Sprout', 25], ['Bloom', 50], ['Crowded', 25]]);
  var iters = { Sprout: 340, Bloom: 500, Crowded: 760 }[stage];
  var colonies = RL.weighted([['Few', 30], ['Several', 45], ['Many', 25]]);
  var nCol = { Few: 5, Several: 8, Many: 14 }[colonies];
  var walls = RL.weighted([['Drawn', 75], ['Ghost', 25]]);
  C.features({ Palette: palName, Tiles: tileSet, Scale: scaleName, Stage: stage, Colonies: colonies, Walls: walls });

  var cv = C.setupCanvas(VW, VH, P.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);
  // ---- maze geometry --------------------------------------------------------
  var fx0 = 70, fy0 = 70, cols = Math.floor((VW - 2 * fx0) / s), rows = Math.floor((VH - 2 * fy0) / s);
  var ox = (VW - cols * s) / 2, oy = (VH - rows * s) / 2;
  var wallPolys = [];
  for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
    var x = ox + i * s, y = oy + j * s, flip = RL.chance(0.5);
    var arcs = tileSet === 'Arcs' || (tileSet === 'Mixed' && RL.chance(0.5));
    if (!arcs) wallPolys.push(flip ? [[x, y], [x + s, y + s]] : [[x + s, y], [x, y + s]]);
    else {
      var c1 = flip ? [x, y] : [x + s, y], c2 = flip ? [x + s, y + s] : [x, y + s];
      var a1 = flip ? 0 : Math.PI / 2, a2 = flip ? Math.PI : -Math.PI / 2;
      [[c1, a1], [c2, a2]].forEach(function (cc) {
        var pts = []; for (var t = 0; t <= 12; t++) { var a = cc[1] + t / 12 * Math.PI / 2; pts.push([cc[0][0] + Math.cos(a) * s / 2, cc[0][1] + Math.sin(a) * s / 2]); }
        wallPolys.push(pts);
      });
    }
  }
  var frame = [[ox, oy], [ox + cols * s, oy], [ox + cols * s, oy + rows * s], [ox, oy + rows * s], [ox, oy]];
  wallPolys.push(frame);
  // ---- raster walls, EDT, regions ------------------------------------------
  var G = 2, GW = VW / G, GH = VH / G, mask = new Uint8Array(GW * GH);
  var off = document.createElement('canvas'); off.width = GW; off.height = GH;
  var o2 = off.getContext('2d'); o2.fillStyle = '#000'; o2.fillRect(0, 0, GW, GH);
  o2.strokeStyle = '#fff'; o2.lineWidth = 2.2; o2.lineCap = 'round';
  wallPolys.forEach(function (p) { o2.beginPath(); o2.moveTo(p[0][0] / G, p[0][1] / G); for (var k = 1; k < p.length; k++) o2.lineTo(p[k][0] / G, p[k][1] / G); o2.stroke(); });
  var px = o2.getImageData(0, 0, GW, GH).data;
  for (i = 0; i < GW * GH; i++) {
    var gx = i % GW, gy = (i / GW) | 0, out = gx * G < ox || gx * G > ox + cols * s || gy * G < oy || gy * G > oy + rows * s;
    mask[i] = (px[i * 4] > 60 || out) ? 1 : 0;
  }
  var dist = C.edt(mask, GW, GH);          // in cells
  var label = new Int32Array(GW * GH).fill(-1), regions = [], stack = [];
  for (i = 0; i < GW * GH; i++) {
    if (mask[i] || label[i] >= 0) continue;
    var reg = { area: 0, best: i, bestD: 0, id: regions.length };
    stack.push(i); label[i] = reg.id;
    while (stack.length) {
      var c = stack.pop(); reg.area++;
      if (dist[c] > reg.bestD) { reg.bestD = dist[c]; reg.best = c; }
      var cx = c % GW, cy = (c / GW) | 0;
      if (cx > 0 && !mask[c - 1] && label[c - 1] < 0) { label[c - 1] = reg.id; stack.push(c - 1); }
      if (cx < GW - 1 && !mask[c + 1] && label[c + 1] < 0) { label[c + 1] = reg.id; stack.push(c + 1); }
      if (cy > 0 && !mask[c - GW] && label[c - GW] < 0) { label[c - GW] = reg.id; stack.push(c - GW); }
      if (cy < GH - 1 && !mask[c + GW] && label[c + GW] < 0) { label[c + GW] = reg.id; stack.push(c + GW); }
    }
    regions.push(reg);
  }
  regions.sort(function (a, b) { return (b.area - a.area) || (a.id - b.id); });
  var chosen = regions.filter(function (r) { return r.bestD * G > 9; }).slice(0, nCol);
  function wallD(x, y) { // virtual units
    var gx2 = Math.max(0, Math.min(GW - 1, (x / G) | 0)), gy2 = Math.max(0, Math.min(GH - 1, (y / G) | 0));
    return dist[gy2 * GW + gx2] * G;
  }
  // ---- differential growth -------------------------------------------------
  var RR = s * 0.11, MAXE = s * 0.06, loops = [];
  chosen.forEach(function (rg, n) {
    var cxv = (rg.best % GW) * G, cyv = ((rg.best / GW) | 0) * G, pts = [], r0 = 4;
    for (var k = 0; k < 14; k++) { var a = k / 14 * Math.PI * 2; pts.push([cxv + Math.cos(a) * r0, cyv + Math.sin(a) * r0]); }
    loops.push({ pts: pts, col: P.inks[n % P.inks.length], cap: Math.round(rg.area * G * G / (RR * 3.4)) });
  });
  var NODECAP = 22000;
  for (var it = 0; it < iters; it++) {
    var hash = new Map(), total = 0;
    loops.forEach(function (L, li) {
      L.pts.forEach(function (p, pi) { var key = ((p[0] / RR) | 0) * 4096 + ((p[1] / RR) | 0); var b = hash.get(key); if (!b) hash.set(key, b = []); b.push(p); });
      total += L.pts.length;
    });
    loops.forEach(function (L) {
      var P2 = L.pts, n = P2.length, next = new Array(n);
      for (var k = 0; k < n; k++) {
        var p = P2[k], a = P2[(k - 1 + n) % n], b = P2[(k + 1) % n];
        var fxs = ((a[0] + b[0]) / 2 - p[0]) * 0.35, fys = ((a[1] + b[1]) / 2 - p[1]) * 0.35;
        var hx = (p[0] / RR) | 0, hy = (p[1] / RR) | 0;
        for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
          var bk = hash.get((hx + dx) * 4096 + hy + dy); if (!bk) continue;
          for (var m = 0; m < bk.length; m++) {
            var q = bk[m]; if (q === p) continue;
            var ddx = p[0] - q[0], ddy = p[1] - q[1], d2 = ddx * ddx + ddy * ddy;
            if (d2 < RR * RR && d2 > 1e-6) { var d = Math.sqrt(d2), f = (RR - d) / RR * 0.55; fxs += ddx / d * f; fys += ddy / d * f; }
          }
        }
        var wd = wallD(p[0], p[1]);
        if (wd < RR * 1.2) { // push off walls along the distance gradient
          var gxw = wallD(p[0] + 2, p[1]) - wallD(p[0] - 2, p[1]), gyw = wallD(p[0], p[1] + 2) - wallD(p[0], p[1] - 2), gl = Math.hypot(gxw, gyw) || 1;
          var fw = (RR * 1.2 - wd) / (RR * 1.2) * 0.9; fxs += gxw / gl * fw; fys += gyw / gl * fw;
        }
        var fl = Math.hypot(fxs, fys); if (fl > 1.6) { fxs *= 1.6 / fl; fys *= 1.6 / fl; } // step limit: nothing tunnels through a wall
        var nx = p[0] + fxs, ny = p[1] + fys;
        if (wallD(nx, ny) < RR * 0.45) { nx = p[0]; ny = p[1]; }
        next[k] = [nx, ny];
      }
      // split long edges (growth), deterministic jitter
      var grown = [];
      for (k = 0; k < n; k++) {
        var p0 = next[k], p1 = next[(k + 1) % n]; grown.push(p0);
        var el = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        if (el > MAXE && total < NODECAP && grown.length < L.cap) { grown.push([(p0[0] + p1[0]) / 2 + RG.range(-0.3, 0.3), (p0[1] + p1[1]) / 2 + RG.range(-0.3, 0.3)]); total++; }
      }
      // random insertions (about 3% of the line per step) keep the front buckling and growing
      var nIns = Math.ceil(grown.length * 0.01);
      for (var z = 0; z < nIns; z++) {
        var ins = RG.int(0, grown.length - 1);
        if (total >= NODECAP || grown.length >= L.cap) continue;
        var q0 = grown[ins], q1 = grown[(ins + 1) % grown.length];
        grown.splice(ins + 1, 0, [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2]); total++;
      }
      L.pts = grown;
    });
  }
  // ---- draw ------------------------------------------------------------------
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, VW, VH);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  function path(p, closed) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var k = 1; k < p.length; k++) ctx.lineTo(p[k][0], p[k][1]); if (closed) ctx.closePath(); }
  // the rest of the maze, faint
  ctx.strokeStyle = P.wall; ctx.lineWidth = walls === 'Drawn' ? 2.2 : 0.8; ctx.globalAlpha = walls === 'Drawn' ? 0.9 : 0.25;
  wallPolys.forEach(function (p) { path(p); ctx.stroke(); if (walls === 'Drawn') C.poly(p, P.wall); });
  ctx.globalAlpha = 1;
  loops.forEach(function (L) {
    var col = C.hex2rgb(L.col);
    path(L.pts, true); ctx.fillStyle = C.rgba(col, 0.16); ctx.fill();
    ctx.strokeStyle = L.col; ctx.lineWidth = 1.6; ctx.stroke();
    C.poly(L.pts.concat([L.pts[0]]), L.col);
  });
  C.done(cv.canvas, '10-print-growth');
})();

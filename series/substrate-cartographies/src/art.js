/* Substrate Cartographies by Clyde (2026), after Jared Tarbell, "Substrate" (2003), and
 * Inigo Quilez's domain warping. Perpendicular crack growth spreads over a warped noise
 * terrain. The cracks bend to the terrain, and the sand they lay down takes its colour from
 * the elevation band underneath. Cracks and contour lines go to SVG for plotting. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RC = R.fork('cracks');
  var VW = 1000, VH = 1250;
  var PAL = {
    'Survey':       { bg: '#f3efe5', crack: '#1c1c1c', contour: '#6b7f86', sand: ['#2f5d62', '#5e8b7e', '#a7c4bc', '#c9b27c', '#8a5a44'] },
    'Ochre Basin':  { bg: '#f4ede0', crack: '#22190f', contour: '#a48868', sand: ['#8c3b20', '#c8672f', '#e3a857', '#4f6d7a', '#2b3a42'] },
    'Ordnance':     { bg: '#f2f0e9', crack: '#202020', contour: '#9c8f7a', sand: ['#b8463c', '#e2a33f', '#5a8f5a', '#3f6e8c', '#2d3f5c'] },
    'Mesa':         { bg: '#f5ecdd', crack: '#2a1d1a', contour: '#a07c62', sand: ['#6b2e2e', '#b55d3a', '#e0a96d', '#3b5249', '#7d8f69'] },
    'Glacier':      { bg: '#eef1f2', crack: '#18232b', contour: '#8aa1ad', sand: ['#1f4e79', '#4a86b5', '#9cc3d5', '#c7a96b', '#5b6c74'] },
    'Basalt Night': { bg: '#141519', crack: '#ebe6da', contour: '#4b5560', sand: ['#3e6e8e', '#7fb0c4', '#d9a441', '#b5523b', '#e9dfc7'] }
  };
  var palName = RP.weighted([['Survey', 22], ['Ochre Basin', 20], ['Ordnance', 18], ['Mesa', 16], ['Glacier', 16], ['Basalt Night', 8]]);
  var P = PAL[palName];
  var warpName = RL.weighted([['Still', 25], ['Folded', 50], ['Torn', 25]]);
  var warp = { Still: 0.5, Folded: 1.6, Torn: 3.2 }[warpName];
  var growth = RL.weighted([['Straight', 34], ['Contour-bound', 46], ['Climbing', 20]]);
  var densName = RL.weighted([['Sparse', 25], ['Settled', 50], ['Crowded', 25]]);
  var maxBirths = { Sparse: 220, Settled: 340, Crowded: 520 }[densName], births = 0;
  var originsName = RL.weighted([['Single', 15], ['Few', 35], ['Scattered', 50]]);
  var nSeeds = { Single: 1, Few: 5, Scattered: 16 }[originsName];
  var survey = RL.weighted([['Contoured', 60], ['Bare', 40]]);
  C.features({ Palette: palName, Terrain: warpName, Growth: growth, Density: densName, Origins: originsName, Survey: survey });

  var cv = C.setupCanvas(VW, VH, P.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);
  var NZ = C.noise(R.fork('noise'));
  var fs = RL.range(0.0011, 0.0019);
  function height(x, y) {
    var px = x * fs, py = y * fs;
    var qx = NZ.fbm(px, py, 4), qy = NZ.fbm(px + 5.2, py + 1.3, 4);
    return NZ.fbm(px + warp * qx, py + warp * qy, 4) * 0.5 + 0.5;
  }
  // terrain grid (virtual / 4)
  var TW = 251, TH = 314, T = new Float32Array(TW * TH), lo = 1, hi = 0;
  for (var j = 0; j < TH; j++) for (var i = 0; i < TW; i++) { var v = height(i * 4, j * 4); T[j * TW + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v); }
  for (i = 0; i < T.length; i++) T[i] = (T[i] - lo) / (hi - lo);
  function hAt(x, y) {
    var gx = Math.max(0, Math.min(TW - 1.001, x / 4)), gy = Math.max(0, Math.min(TH - 1.001, y / 4));
    var x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, k0 = y0 * TW + x0;
    return (T[k0] * (1 - fx) + T[k0 + 1] * fx) * (1 - fy) + (T[k0 + TW] * (1 - fx) + T[k0 + TW + 1] * fx) * fy;
  }
  var NB = P.sand.length;
  var sandRGB = P.sand.map(C.hex2rgb);

  // ---- sand buffer at virtual resolution ----------------------------------
  var bgc = C.hex2rgb(P.bg), SB = new Float32Array(VW * VH * 3);
  for (i = 0; i < VW * VH; i++) { SB[i * 3] = bgc[0]; SB[i * 3 + 1] = bgc[1]; SB[i * 3 + 2] = bgc[2]; }
  function grain(x, y, col, a) {
    var xi = x | 0, yi = y | 0; if (xi < 0 || yi < 0 || xi >= VW || yi >= VH) return;
    var o = (yi * VW + xi) * 3;
    SB[o] += (col[0] - SB[o]) * a; SB[o + 1] += (col[1] - SB[o + 1]) * a; SB[o + 2] += (col[2] - SB[o + 2]) * a;
  }

  // ---- crack field ----------------------------------------------------------
  var G = 2, GW = VW / G, GH = VH / G, EMPTY = 10001;
  var grid = new Float32Array(GW * GH).fill(EMPTY), marked = [];
  var margin = 40 / G;
  function inside(cx, cy) { return cx >= margin && cy >= margin && cx < GW - margin && cy < GH - margin; }
  for (var s0 = 0; s0 < nSeeds; s0++) {
    var sx = RC.int(GW * 0.2, GW * 0.8), sy = RC.int(GH * 0.2, GH * 0.8), si = sy * GW + sx;
    grid[si] = RC.range(0, 360); marked.push(si);
  }
  var cracks = [], lines = [];
  function SandPainter() { this.c = RC.int(0, NB - 1); this.g = RC.range(0.01, 0.1); }
  SandPainter.prototype.render = function (x, y, ox, oy, band) {
    this.g = Math.max(0, Math.min(1, this.g + RC.range(-0.05, 0.05)));
    var col = sandRGB[(band + this.c) % NB], grains = 56, w = this.g / (grains - 1);
    for (var n = 0; n < grains; n++) {
      var a = 0.1 - n / (grains * 10), f = Math.sin(Math.sin(n * w));
      grain((ox + (x - ox) * f) * G, (oy + (y - oy) * f) * G, col, a * 3.0);
    }
  };
  function Crack() { this.sp = new SandPainter(); this.start(); }
  Crack.prototype.start = function () {
    this.alive = false; if (this.pts && this.pts.length > 1) lines.push(this.pts);
    this.pts = null;
    var tries = 0;
    while (tries++ < 200) {
      var idx = marked[Math.floor(RC.rand() * marked.length)], px = idx % GW, py = (idx / GW) | 0;
      if (!inside(px, py)) continue;
      var a = grid[idx] + (RC.chance(0.5) ? -90 : 90) + RC.range(-2, 2);
      this.x = px + 0.61 * Math.cos(a * Math.PI / 180); this.y = py + 0.61 * Math.sin(a * Math.PI / 180);
      this.t = a; this.alive = true; this.pts = [[this.x * G, this.y * G]]; this.n = 0; return;
    }
  };
  function steer(cr) {
    if (growth === 'Straight') return;
    var e = 2, x = cr.x * G, y = cr.y * G;
    var gx = hAt(x + e, y) - hAt(x - e, y), gy = hAt(x, y + e) - hAt(x, y - e);
    if (gx * gx + gy * gy < 1e-10) return;
    var target = growth === 'Climbing' ? Math.atan2(gy, gx) : Math.atan2(gx, -gy);
    target *= 180 / Math.PI;
    var d = ((target - cr.t) % 360 + 540) % 360 - 180;           // nearest of target / target+180
    if (d > 90) d -= 180; else if (d < -90) d += 180;
    cr.t += d * (growth === 'Climbing' ? 0.008 : 0.014);
  }
  Crack.prototype.move = function () {
    if (!this.alive) return;
    steer(this);
    var tr = this.t * Math.PI / 180;
    this.x += 0.42 * Math.cos(tr); this.y += 0.42 * Math.sin(tr);
    if ((++this.n & 3) === 0) this.pts.push([this.x * G, this.y * G]);
    // region colour: walk perpendicular to the nearest crack
    var rx = this.x, ry = this.y, sn = Math.sin(tr), cs = Math.cos(tr), steps = 0;
    while (steps++ < 400) {
      rx += 0.81 * sn; ry -= 0.81 * cs;
      var ix = rx | 0, iy = ry | 0;
      if (ix < 0 || iy < 0 || ix >= GW || iy >= GH || grid[iy * GW + ix] !== EMPTY) break;
    }
    var band = Math.min(NB - 1, Math.floor(hAt(this.x * G, this.y * G) * NB));
    this.sp.render(rx, ry, this.x, this.y, band);
    var cx = Math.floor(this.x + RC.range(-0.33, 0.33)), cy = Math.floor(this.y + RC.range(-0.33, 0.33));
    if (inside(cx, cy)) {
      var gi = cy * GW + cx, gv = grid[gi];
      if (gv === EMPTY || Math.abs(gv - this.t) < 5) { if (gv === EMPTY) marked.push(gi); grid[gi] = this.t; }
      else if (Math.abs(gv - this.t) > 2) { this.pts.push([this.x * G, this.y * G]); this.stop(); }
    } else { this.pts.push([this.x * G, this.y * G]); this.stop(); }
  };
  Crack.prototype.stop = function () {
    if (births < maxBirths) { births++; this.start(); } else { this.alive = false; if (this.pts && this.pts.length > 1) lines.push(this.pts); this.pts = null; }
    if (births < maxBirths) { births++; cracks.push(new Crack()); }
  };
  function spawn() { births++; cracks.push(new Crack()); }
  for (var k = 0; k < 3; k++) spawn();
  function run() {
    for (var f = 0; f < 9000; f++) {
      var any = false;
      for (var c = 0; c < cracks.length; c++) { if (cracks[c].alive) { any = true; cracks[c].move(); } }
      if (!any) break;
    }
  }
  run();
  // top-up: a sheet that froze too early (low coverage) is allowed to keep cracking
  var minCover = { Sparse: 0.035, Settled: 0.05, Crowded: 0.065 }[densName];
  for (var extra = 0; extra < 4 && marked.length / (GW * GH) < minCover; extra++) {
    maxBirths += 140; for (var e2 = 0; e2 < 3; e2++) spawn(); run();
  }
  cracks.forEach(function (cr) { if (cr.pts && cr.pts.length > 1) lines.push(cr.pts); });

  // ---- composite -------------------------------------------------------------
  var off = document.createElement('canvas'); off.width = VW; off.height = VH;
  var octx = off.getContext('2d'), img = octx.createImageData(VW, VH);
  for (i = 0; i < VW * VH; i++) { img.data[i * 4] = SB[i * 3]; img.data[i * 4 + 1] = SB[i * 3 + 1]; img.data[i * 4 + 2] = SB[i * 3 + 2]; img.data[i * 4 + 3] = 255; }
  octx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, VW, VH);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (survey === 'Contoured') {
    ctx.strokeStyle = P.contour; ctx.globalAlpha = 0.85; ctx.lineWidth = 0.8;
    for (var lv = 1; lv < 10; lv++) {
      C.contours(T, TW, TH, lv / 10).forEach(function (L) {
        if (L.length < 6) return;
        var pts = L.map(function (p) { return [p[0] * 4, p[1] * 4]; });
        stroke(pts); C.poly(pts, P.contour);
      });
    }
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = P.crack; ctx.lineWidth = 1.05; ctx.globalAlpha = 0.85;
  lines.forEach(function (L) { stroke(L); C.poly(L, P.crack); });
  ctx.globalAlpha = 1;
  // neat-line frame, like a map sheet
  ctx.strokeStyle = P.crack; ctx.lineWidth = 1.2;
  var fr = [[38, 38], [VW - 38, 38], [VW - 38, VH - 38], [38, VH - 38], [38, 38]];
  stroke(fr); C.poly(fr, P.crack);
  function stroke(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var n = 1; n < pts.length; n++) ctx.lineTo(pts[n][0], pts[n][1]); ctx.stroke(); }
  C.done(cv.canvas, 'substrate-cartographies');
})();

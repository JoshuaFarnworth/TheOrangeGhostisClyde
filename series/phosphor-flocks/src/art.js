/* Phosphor Flocks by Clyde (2026), after Craig Reynolds, "Flocks, Herds, and Schools" (boids,
 * 1987), and the vector-display and demoscene tradition of glowing phosphor lines.
 * A flock is simulated, its flight paths become a 2D signed distance field, and the field
 * is lit as glass tubes. Older paths fade as phosphor persistence decays. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RB = R.fork('boids'), RN = R.fork('grain');
  var VW = 1000, VH = 1250;
  var PHOS = {
    'P1 Green':  { bg: '#030805', cols: ['#39ff6a'], old: '#0f6b2a' },
    'P3 Amber':  { bg: '#0a0602', cols: ['#ffb02e'], old: '#7a3a06' },
    'P4 White':  { bg: '#05060a', cols: ['#e6eeff'], old: '#4a5a8a' },
    'P7 Blue':   { bg: '#020510', cols: ['#8ec5ff'], old: '#b8ff4a' },
    'P22 RGB':   { bg: '#050506', cols: ['#ff4b3e', '#3dff7a', '#4b7bff'], old: '#3a2a4a' }
  };
  var phName = RP.weighted([['P1 Green', 28], ['P3 Amber', 24], ['P4 White', 16], ['P7 Blue', 18], ['P22 RGB', 14]]);
  var PH = PHOS[phName];
  var flockName = RL.weighted([['Small', 30], ['Medium', 45], ['Large', 25]]);
  var N = { Small: 34, Medium: 70, Large: 120 }[flockName];
  var mood = RL.weighted([['Calm', 34], ['Murmuration', 42], ['Panic', 24]]);
  var tubeName = RL.weighted([['Hairline', 25], ['Tube', 50], ['Neon', 25]]);
  var TR = { Hairline: 2.2, Tube: 3.6, Neon: 5.4 }[tubeName];
  var groupsName = RL.weighted([['One', 45], ['Two', 35], ['Three', 20]]);
  var NG = { One: 1, Two: 2, Three: 3 }[groupsName];
  var scan = RL.weighted([['Scanlines', 50], ['Clean', 30], ['Interlaced', 20]]);
  C.features({ Phosphor: phName, Flock: flockName, Flocks: groupsName, Mood: mood, Line: tubeName, Display: scan });

  var cv = C.setupCanvas(VW, VH, PH.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);

  // ---- boids ----------------------------------------------------------------
  var W = { Calm:        { sep: 1.2, ali: 0.6, coh: 0.9, max: 2.4, noise: 0.05 },
            Murmuration: { sep: 1.5, ali: 1.4, coh: 0.6, max: 3.2, noise: 0.08 },
            Panic:       { sep: 2.4, ali: 0.7, coh: 0.3, max: 4.2, noise: 0.25 } }[mood];
  var B = [], starts = [];
  for (var gq = 0; gq < 3; gq++) starts.push([RB.range(300, 700), RB.range(350, 900), RB.range(0, Math.PI * 2)]);
  for (var i = 0; i < N; i++) {
    var grp = i % NG, st = starts[grp], a = st[2] + RB.gaussian(0, 0.6), sp = RB.range(1, 2);
    B.push({ g: grp, x: st[0] + RB.gaussian(0, 90), y: st[1] + RB.gaussian(0, 90), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, trail: [], col: PH.cols[i % PH.cols.length] });
  }
  var pred = { x: RB.range(200, 800), y: RB.range(200, 1050), a: RB.range(0, 6.28) };
  var STEPS = 900, PAD = 110;
  // a wandering lure (Lissajous path) that the flock chases across the screen
  var lures = [];
  for (gq = 0; gq < 3; gq++) lures.push([RB.range(0.004, 0.009), RB.range(0.004, 0.009), RB.range(0, 6.28), RB.range(0, 6.28)]);
  function lure(t, g) { var q = lures[g]; return [VW / 2 + (VW / 2 - PAD * 1.8) * Math.sin(q[0] * t + q[2]), VH / 2 + (VH / 2 - PAD * 1.8) * Math.sin(q[1] * t + q[3])]; }
  for (var t = 0; t < STEPS; t++) {
    if (mood === 'Panic') { pred.a += RB.gaussian(0, 0.15); pred.x += Math.cos(pred.a) * 3; pred.y += Math.sin(pred.a) * 3;
      if (pred.x < PAD || pred.x > VW - PAD) pred.a = Math.PI - pred.a; if (pred.y < PAD || pred.y > VH - PAD) pred.a = -pred.a; }
    for (i = 0; i < N; i++) {
      var b = B[i], sx = 0, sy = 0, ax = 0, ay = 0, hx = 0, hy = 0, n = 0;
      for (var j = 0; j < N; j++) {
        if (i === j) continue;
        var o = B[j], dx = b.x - o.x, dy = b.y - o.y, d2 = dx * dx + dy * dy;
        if (d2 < 60 * 60) { ax += o.vx; ay += o.vy; hx += o.x; hy += o.y; n++;
          if (d2 < 22 * 22) { var inv = 1 / (d2 + 1); sx += dx * inv * 22; sy += dy * inv * 22; } }
      }
      var fx = sx * W.sep * 0.05, fy = sy * W.sep * 0.05;
      if (n) { fx += (ax / n - b.vx) * W.ali * 0.05 + (hx / n - b.x) * W.coh * 0.0015; fy += (ay / n - b.vy) * W.ali * 0.05 + (hy / n - b.y) * W.coh * 0.0015; }
      // soft walls
      if (b.x < PAD) fx += (PAD - b.x) * 0.004; if (b.x > VW - PAD) fx -= (b.x - VW + PAD) * 0.004;
      if (b.y < PAD) fy += (PAD - b.y) * 0.004; if (b.y > VH - PAD) fy -= (b.y - VH + PAD) * 0.004;
      if (mood === 'Panic') { var pdx = b.x - pred.x, pdy = b.y - pred.y, pd = Math.hypot(pdx, pdy); if (pd < 160) { fx += pdx / pd * 0.25; fy += pdy / pd * 0.25; } }
      var lu = lure(t, b.g), ldx = lu[0] - b.x, ldy = lu[1] - b.y, ld = Math.hypot(ldx, ldy) + 1;
      fx += ldx / ld * 0.06; fy += ldy / ld * 0.06;
      fx += RB.gaussian(0, W.noise) * 0.2; fy += RB.gaussian(0, W.noise) * 0.2;
      b.vx += fx; b.vy += fy;
      var v = Math.hypot(b.vx, b.vy); if (v > W.max) { b.vx *= W.max / v; b.vy *= W.max / v; } if (v < 0.8) { b.vx *= 0.8 / v; b.vy *= 0.8 / v; }
    }
    for (i = 0; i < N; i++) { B[i].x += B[i].vx; B[i].y += B[i].vy; if (t % 3 === 0) B[i].trail.push([B[i].x, B[i].y]); }
  }
  // keep only the last part of each trail (the visible persistence window)
  var LEN = { Small: 300, Medium: 240, Large: 170 }[flockName];
  B.forEach(function (b) { b.trail = b.trail.slice(-LEN); });

  // ---- rasterise: mask + age/colour id buffer at virtual resolution ---------
  var off = document.createElement('canvas'); off.width = VW; off.height = VH;
  var o = off.getContext('2d');
  o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH); o.lineCap = 'round'; o.lineJoin = 'round';
  // age encoded in R, colour index in G; thick strokes so every pixel near a tube knows its source
  var segs = [];
  B.forEach(function (b, bi) { var ci = PH.cols.indexOf(b.col); for (var k = 1; k < b.trail.length; k++) segs.push([k / b.trail.length, b.trail[k - 1], b.trail[k], ci]); });
  segs.sort(function (p, q) { return p[0] - q[0]; });
  o.lineWidth = TR * 2 + 26;
  segs.forEach(function (s) { o.strokeStyle = 'rgb(' + Math.round(20 + s[0] * 235) + ',' + (s[3] * 80 + 40) + ',0)'; o.beginPath(); o.moveTo(s[1][0], s[1][1]); o.lineTo(s[2][0], s[2][1]); o.stroke(); });
  var ageImg = o.getImageData(0, 0, VW, VH).data;
  o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH); o.strokeStyle = '#fff'; o.lineWidth = 1;
  B.forEach(function (b) { o.beginPath(); o.moveTo(b.trail[0][0], b.trail[0][1]); for (var k = 1; k < b.trail.length; k++) o.lineTo(b.trail[k][0], b.trail[k][1]); o.stroke(); });
  var lineImg = o.getImageData(0, 0, VW, VH).data, mask = new Uint8Array(VW * VH);
  for (i = 0; i < VW * VH; i++) mask[i] = lineImg[i * 4] > 90 ? 1 : 0;
  var D = C.edt(mask, VW, VH);

  // ---- shade the distance field as lit tubes ----------------------------------
  var bg = C.hex2rgb(PH.bg), old = C.hex2rgb(PH.old), cols = PH.cols.map(C.hex2rgb);
  var L = [-0.45, -0.6, 0.66], Ll = Math.hypot(L[0], L[1], L[2]); L = L.map(function (v) { return v / Ll; });
  var Hh = [L[0], L[1], L[2] + 1], Hl = Math.hypot(Hh[0], Hh[1], Hh[2]); Hh = Hh.map(function (v) { return v / Hl; });
  var img = o.createImageData(VW, VH), px = img.data;
  for (var y = 0; y < VH; y++) {
    var scanMul = 1;
    if (scan === 'Scanlines') scanMul = (y % 3 === 2) ? 0.55 : 1;
    else if (scan === 'Interlaced') scanMul = (y % 2) ? 0.7 : 1;
    for (var x = 0; x < VW; x++) {
      var k2 = y * VW + x, d = D[k2], r = bg[0], g = bg[1], bl = bg[2];
      var ar = ageImg[k2 * 4], age = ar > 0 ? (ar - 20) / 235 : 0, ci2 = ar > 0 ? Math.max(0, Math.round((ageImg[k2 * 4 + 1] - 40) / 80)) : 0;
      var col = C.mix(old, cols[Math.min(ci2, cols.length - 1)], Math.pow(Math.max(0, age), 0.8));
      var bright = 0.25 + 0.75 * Math.pow(Math.max(0, age), 1.3);
      if (d < TR) {
        var h = Math.sqrt(TR * TR - d * d) + 1e-3;
        var gx = (D[k2 + 1] || d) - (D[k2 - 1] || d), gy = (D[k2 + VW] || d) - (D[k2 - VW] || d), gl = Math.hypot(gx, gy) || 1;
        var nx = gx / gl * d / h, ny = gy / gl * d / h, nl = Math.hypot(nx, ny, 1);
        nx /= nl; ny /= nl; var nz = 1 / nl;
        var dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        var spec = Math.pow(Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), 40);
        var core = 0.35 + 0.9 * dif;
        r = col[0] * core * bright + 255 * spec * bright; g = col[1] * core * bright + 255 * spec * bright; bl = col[2] * core * bright + 255 * spec * bright;
      }
      var glow = Math.exp(-Math.max(0, d - TR) / (6 + TR)) * 0.55 * bright;
      r += col[0] * glow; g += col[1] * glow; bl += col[2] * glow;
      // vignette + grain
      var vx = x / VW - 0.5, vy = y / VH - 0.5, vig = 1 - 0.55 * (vx * vx + vy * vy) * 2;
      var gr = (RN.rand() - 0.5) * 10;
      px[k2 * 4] = Math.min(255, r * scanMul * vig + gr); px[k2 * 4 + 1] = Math.min(255, g * scanMul * vig + gr); px[k2 * 4 + 2] = Math.min(255, bl * scanMul * vig + gr); px[k2 * 4 + 3] = 255;
    }
  }
  o.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, VW, VH);
  B.forEach(function (b) { C.poly(b.trail, b.col); }); // plotter version: the bare flight paths
  C.done(cv.canvas, 'phosphor-flocks');
})();

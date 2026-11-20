/* Schotter Garden by Clyde (2026), after Georg Nees, "Schotter" (1968), and Vera Molnár's
 * "(Dés)Ordres". A Gray-Scott reaction-diffusion sheet is grown, cut into a grid of
 * tiles, and the tiles slide into disorder along a drift axis while the chemistry
 * changes regime along that same axis. Everything is drawn as plottable ink lines. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RD = R.fork('rd');
  var VW = 1000, VH = 1250;

  var PALETTES = {
    'Stuttgart':        { bg: '#f1ede2', ink: '#1c1b1a', acc: '#c2372a' },
    'Blueprint Ink':    { bg: '#eeebe3', ink: '#1d3866', acc: '#d24b5a' },
    'Sepia Plot':       { bg: '#ebe1cd', ink: '#4a3326', acc: '#2e6d70' },
    'Graphite & Ochre': { bg: '#f3f0e8', ink: '#2a2a2a', acc: '#d6952a' },
    'Verdigris':        { bg: '#eef0ea', ink: '#1f3b36', acc: '#b5562d' },
    'Night Plot':       { bg: '#131518', ink: '#e9e3d1', acc: '#ff6a48' }
  };
  var REGIMES = {
    'Coral':   [0.0545, 0.062], 'Mitosis': [0.0367, 0.0649], 'Maze': [0.029, 0.057],
    'Worms':   [0.078, 0.061],  'Holes':   [0.039, 0.058],   'Fingerprint': [0.037, 0.06]
  };
  var PAIRS = [['Coral', 'Maze'], ['Mitosis', 'Coral'], ['Holes', 'Worms'], ['Fingerprint', 'Mitosis'],
               ['Maze', 'Holes'], ['Worms', 'Coral'], ['Coral', 'Coral'], ['Fingerprint', 'Maze']];

  // ---- features first ------------------------------------------------------
  var palName = RP.weighted([['Stuttgart', 24], ['Blueprint Ink', 20], ['Sepia Plot', 16], ['Graphite & Ochre', 16], ['Verdigris', 14], ['Night Plot', 6]]);
  var P = PALETTES[palName];
  var cols = RL.weighted([[6, 22], [7, 30], [8, 30], [9, 18]]);
  var drift = RL.weighted([['Top to Bottom', 46], ['Bottom to Top', 14], ['Centre Outward', 24], ['Left to Right', 16]]);
  var pair = RL.pick(PAIRS);
  var hatch = RL.weighted([['Horizontal', 40], ['Diagonal', 30], ['Cross', 15], ['None', 15]]);
  var tremor = RL.weighted([['Gentle', 30], ['Classic', 50], ['Violent', 20]]);
  var stray = RL.chance(0.14);
  var regimeName = pair[0] === pair[1] ? pair[0] : pair[0] + ' to ' + pair[1];
  C.features({ Palette: palName, Grid: cols + ' columns', Drift: drift, Chemistry: regimeName,
               Hatch: hatch, Tremor: tremor, Stray: stray ? 'Yes' : 'No' });

  var cv = C.setupCanvas(VW, VH, P.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);

  // ---- grid geometry -------------------------------------------------------
  var margin = 95, s = (VW - 2 * margin) / cols;
  var rows = Math.floor((VH - 2 * margin) / s);
  var top = (VH - rows * s) / 2;
  function chaosAt(cx, cy) { // cell indices -> 0..1
    var u = (cx + 0.5) / cols, v = (cy + 0.5) / rows;
    if (drift === 'Top to Bottom') return v;
    if (drift === 'Bottom to Top') return 1 - v;
    if (drift === 'Left to Right') return u;
    return Math.min(1, Math.hypot((u - 0.5) * 1.15, (v - 0.5)) / 0.62);
  }

  // ---- Gray-Scott sheet ----------------------------------------------------
  var GW = 300, GH = Math.round(GW * VH / VW), N = GW * GH;
  var A = new Float32Array(N), B = new Float32Array(N), A2 = new Float32Array(N), B2 = new Float32Array(N);
  var Fm = new Float32Array(N), Km = new Float32Array(N);
  var ra = REGIMES[pair[0]], rb = REGIMES[pair[1]];
  for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) {
    var vx = x / GW * VW, vy = y / GH * VH;
    var t = chaosAt((vx - margin) / s - 0.5, (vy - top) / s - 0.5);
    t = Math.max(0, Math.min(1, t)); t = t * t * (3 - 2 * t);
    var i = y * GW + x;
    Fm[i] = ra[0] + (rb[0] - ra[0]) * t; Km[i] = ra[1] + (rb[1] - ra[1]) * t;
    A[i] = 1; B[i] = 0;
  }
  var nSeeds = 90;
  for (var k = 0; k < nSeeds; k++) {
    var sx = RD.int(2, GW - 8), sy = RD.int(2, GH - 8), sw = RD.int(3, 6);
    for (var yy = sy; yy < sy + sw; yy++) for (var xx = sx; xx < sx + sw; xx++) { B[yy * GW + xx] = 1; A[yy * GW + xx] = 0.5; }
  }
  var ITER = 4200;
  for (var it = 0; it < ITER; it++) {
    for (y = 0; y < GH; y++) {
      var ym = (y === 0 ? GH - 1 : y - 1) * GW, y0 = y * GW, yp = (y === GH - 1 ? 0 : y + 1) * GW;
      for (x = 0; x < GW; x++) {
        var xm = x === 0 ? GW - 1 : x - 1, xp = x === GW - 1 ? 0 : x + 1;
        i = y0 + x;
        var a = A[i], b = B[i];
        var la = -a + 0.2 * (A[y0 + xm] + A[y0 + xp] + A[ym + x] + A[yp + x]) + 0.05 * (A[ym + xm] + A[ym + xp] + A[yp + xm] + A[yp + xp]);
        var lb = -b + 0.2 * (B[y0 + xm] + B[y0 + xp] + B[ym + x] + B[yp + x]) + 0.05 * (B[ym + xm] + B[ym + xp] + B[yp + xm] + B[yp + xp]);
        var abb = a * b * b;
        A2[i] = a + (la - abb + Fm[i] * (1 - a));
        B2[i] = b + (0.5 * lb + abb - (Km[i] + Fm[i]) * b);
      }
    }
    var tA = A; A = A2; A2 = tA; var tB = B; B = B2; B2 = tB;
  }
  function sampleB(vx, vy) { // bilinear, virtual coords
    var gx = vx / VW * GW - 0.5, gy = vy / VH * GH - 0.5;
    var x0 = Math.floor(gx), y0b = Math.floor(gy), fx = gx - x0, fy = gy - y0b;
    function at(xa, ya) { xa = (xa % GW + GW) % GW; ya = (ya % GH + GH) % GH; return B[ya * GW + xa]; }
    return (at(x0, y0b) * (1 - fx) + at(x0 + 1, y0b) * fx) * (1 - fy) + (at(x0, y0b + 1) * (1 - fx) + at(x0 + 1, y0b + 1) * fx) * fy;
  }

  // ---- draw ----------------------------------------------------------------
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, VW, VH);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  var maxRot = { Gentle: 0.35, Classic: 0.7, Violent: 1.15 }[tremor];
  var maxOff = { Gentle: 0.12, Classic: 0.22, Violent: 0.34 }[tremor];
  var strayIdx = stray ? RL.int(Math.floor(cols * rows * 0.45), cols * rows - 1) : -1;
  var M = 44, THR = 0.22, hatchSp = 2.6 * (8 / cols) * (s / 110) ;
  hatchSp = s / 46;
  // decide every tile first (fixed rng order), then draw from calm to wild
  var cells = [], cellIdx = 0;
  for (var cy0 = 0; cy0 < rows; cy0++) for (var cx0 = 0; cx0 < cols; cx0++, cellIdx++) {
    var chv = chaosAt(cx0, cy0), c2 = chv * chv;
    var cell = { cx: cx0, cy: cy0, ch: chv, idx: cellIdx, stray: cellIdx === strayIdx,
      rot: RL.gaussian(0, c2 * maxRot), ox: RL.gaussian(0, c2 * maxOff * s), oy: RL.gaussian(0, c2 * maxOff * s) };
    var sr0 = RL.range(0.5, 1.2) * (RL.chance(0.5) ? 1 : -1);
    if (cell.stray) { cell.rot = sr0; cell.ox *= 0.3; cell.oy *= 0.3; }
    cells.push(cell);
  }
  cells.sort(function (a, b) { return (a.ch - b.ch) || (a.idx - b.idx); });
  cells.forEach(function (cell) {
    var cx = cell.cx, cy = cell.cy, isStray = cell.stray, rot = cell.rot, ox = cell.ox, oy = cell.oy;
    var ox0 = margin + cx * s, oy0 = top + cy * s;               // original tile (pattern source)
    var pcx = Math.max(s * 0.75, Math.min(VW - s * 0.75, ox0 + s / 2 + ox));   // drawn centre, kept on the sheet
    var pcy = Math.max(s * 0.75, Math.min(VH - s * 0.75, oy0 + s / 2 + oy));
    var cr = Math.cos(rot), sr = Math.sin(rot);
    var tf = function (u, v) { var lx = (u - 0.5) * s, ly = (v - 0.5) * s; return [pcx + lx * cr - ly * sr, pcy + lx * sr + ly * cr]; };
    var inkC = isStray ? P.acc : P.ink, accC = isStray ? P.ink : P.acc;
    // paper-coloured tile body: later (more disordered) tiles occlude earlier ones on screen;
    // the SVG keeps every line, so a plot shows the full overlap, as Nees's plotter did.
    ctx.fillStyle = P.bg; ctx.beginPath();
    [tf(0, 0), tf(1, 0), tf(1, 1), tf(0, 1)].forEach(function (p, n) { n ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    ctx.closePath(); ctx.fill();
    // local field
    var F = new Float32Array((M + 1) * (M + 1));
    for (var j = 0; j <= M; j++) for (var q = 0; q <= M; q++) {
      var val = sampleB(ox0 + q / M * s, oy0 + j / M * s);
      F[j * (M + 1) + q] = (q === 0 || j === 0 || q === M || j === M) ? Math.min(val, THR - 0.001) : val; // close contours at tile edge
    }
    // hatch fill inside the blobs (accent pen)
    var angs = hatch === 'Horizontal' ? [0] : hatch === 'Diagonal' ? [Math.PI / 4] : hatch === 'Cross' ? [Math.PI / 4, -Math.PI / 4] : [];
    ctx.strokeStyle = accC; ctx.lineWidth = 0.75;
    angs.forEach(function (ang) {
      var ca = Math.cos(ang), sa = Math.sin(ang), L = 0.75;
      for (var d = -L; d <= L; d += hatchSp / s) {
        var run = null;
        for (var tt = -L; tt <= L + 1e-6; tt += 0.008) {
          var u = 0.5 + tt * ca - d * sa, v = 0.5 + tt * sa + d * ca;
          var inside = u > 0.01 && u < 0.99 && v > 0.01 && v < 0.99 && sampleB(ox0 + u * s, oy0 + v * s) > THR;
          if (inside) { (run = run || []).push(tf(u, v)); }
          else if (run) { if (run.length > 1) { draw(run, accC); } run = null; }
        }
        if (run && run.length > 1) draw(run, accC);
      }
    });
    // contours (ink pen)
    ctx.strokeStyle = inkC; ctx.lineWidth = 1.0;
    C.contours(F, M + 1, M + 1, THR).forEach(function (line) {
      if (line.length < 3) return;
      draw(line.map(function (p) { return tf(p[0] / M, p[1] / M); }), inkC);
    });
    // tile outline
    ctx.lineWidth = 1.35;
    var sq = [tf(0, 0), tf(1, 0), tf(1, 1), tf(0, 1), tf(0, 0)];
    draw(sq, inkC, true);
  });
  function draw(pts, col, closed) {
    ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var n = 1; n < pts.length; n++) ctx.lineTo(pts[n][0], pts[n][1]);
    ctx.stroke(); C.poly(pts, col, false);
  }
  // signature mark, small, bottom-right: a tiny tile
  C.done(cv.canvas, 'schotter-garden');
})();

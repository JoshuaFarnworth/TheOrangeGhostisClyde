/* Oche, by Clyde (2027).
 * A pub dartboard, the darts put away. The holes in the sisal say who has been throwing and what at.
 * Engine: regulation board geometry (double ring 162-170 mm, treble 99-107 mm, bulls 6.35/15.9 mm radius, the
 * standard 20-1-18-4... order). Players are drawn with a skill (the spread of their throws, a 2-D Gaussian of
 * sigma 8-45 mm, after Tibshirani, Price & Taylor 2011) and a habit: good players live on treble 20 and fall back to
 * treble 19 when the bed is blocked, finish on double 16 and 20; beginners aim at the bull. Each throw leaves a hole;
 * the sisal closes old ones, so recent holes are sharp and old ones are a frayed, paler bed. Boards get turned to
 * spread wear: the number ring stays, the worn patch moves. Misses land in the surround. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('players'), RT = R.fork('throws'), RB = R.fork('board');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1200, VH = 1200, F = RB.range(68, 108);   // still tighter on the worn bed
  var ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  var who = RP.weighted([['Someone Alone', 22], ['A Pair', 34], ['League Night', 30], ['Beginners', 14]]);
  var age = RB.weighted([['New This Season', 30], ['A Few Seasons', 46], ['Years', 24]]);
  var turned = age !== 'New This Season' && RB.chance(0.45) ? RB.int(1, 4) * (RB.chance(0.5) ? 1 : -1) : 0;
  var nThrows = { 'New This Season': RT.int(1500, 4000), 'A Few Seasons': RT.int(8000, 20000), 'Years': RT.int(25000, 50000) }[age];
  var players = [], np = { 'Someone Alone': 1, 'A Pair': 2, 'League Night': RP.int(5, 9), 'Beginners': RP.int(2, 4) }[who];
  for (var k = 0; k < np; k++) {
    var sig = who === 'Beginners' ? RP.range(30, 50) : who === 'League Night' ? RP.range(9, 24) : RP.range(12, 38);
    players.push({ sig: sig, sx: sig * RP.range(0.8, 1.0), sy: sig * RP.range(1.0, 1.35), bx: RP.gaussian(0, sig * 0.15), by: RP.gaussian(sig * 0.1, sig * 0.15), w: RP.range(0.5, 1.5), lefty: RP.chance(0.1) });
  }
  function segAngle(num) { var i = ORDER.indexOf(num); return PI / 2 - i * 2 * PI / 20; }   // centre angle (math convention, y up)
  function aim(p, r) {   // returns target in mm (x right, y up), board frame of the number ring
    if (p.sig > 30) return r() < 0.85 ? [0, 0] : (function () { var a = segAngle(ORDER[Math.floor(r() * 20)]); return [Math.cos(a) * 130, Math.sin(a) * 130]; })();
    var u = r(), t;
    if (u < 0.62) t = [20, 103]; else if (u < 0.74) t = [19, 103]; else if (u < 0.8) t = [18, 103]; else if (u < 0.88) t = [16, 166]; else if (u < 0.94) t = [20, 166]; else if (u < 0.97) t = [0, 0]; else t = [ORDER[Math.floor(r() * 20)], 166];
    if (t[0] === 0) return [0, 0]; var a = segAngle(t[0]); return [Math.cos(a) * t[1], Math.sin(a) * t[1]];
  }
  var rot = turned * 2 * PI / 20, cr = Math.cos(rot), sr = Math.sin(rot), rr = function () { return RT.rand(); };
  var pw = players.reduce(function (a, p) { return a + p.w; }, 0), misses = 0, recent = Math.min(nThrows, RT.int(70, 180)), healing = Math.min(nThrows, recent + RT.int(800, 2500)), TH = [];
  for (var t = 0; t < nThrows; t++) {
    var u = RT.rand() * pw, pi = 0; while (pi < players.length - 1 && u > players[pi].w) { u -= players[pi].w; pi++; }
    var p = players[pi], tg = aim(p, rr), x = tg[0] + p.bx + RT.gaussian(0, p.sx), y = tg[1] - p.by + RT.gaussian(0, p.sy), older = t < nThrows - recent, healed = t < nThrows - healing;
    if (older && turned && t < nThrows * 0.7) { var xx = x * cr - y * sr; y = x * sr + y * cr; x = xx; }   // thrown before the board was turned
    if (Math.hypot(x, y) > 225) misses++; TH.push(x, y, healed ? 0 : older ? 0.3 : 1);
  }
  // frame: centred on the recent holes' centroid, nudged toward the board centre so the rings give context
  var mx = 0, my = 0, mn = 0; for (var q = 0; q < TH.length; q += 3) if (TH[q + 2]) { mx += TH[q]; my += TH[q + 1]; mn++; } mx /= mn; my /= mn;
  var fx = mx + RB.gaussian(0, 10), fy = my + RB.gaussian(0, 10);
  var o = PX.canvas(C, VW, VH, '#111'), PW = o.PW, PH = o.PH, ppm = PW / F, N = PW * PH, cx0 = F / 2 - fx, cy0 = F / 2 + fy;
  var HOLE = new Float32Array(N), WEAR = new Float32Array(N), FLUFF = new Float32Array(N);
  for (var q2 = 0; q2 < TH.length; q2 += 3) {
    var px = (cx0 + TH[q2]) * ppm, py = (cy0 - TH[q2 + 1]) * ppm; if (px < 0 || py < 0 || px >= PW || py >= PH) continue;
    WEAR[Math.floor(py) * PW + Math.floor(px)] += 1;
    var hv = TH[q2 + 2]; if (hv >= 1) { var hr = 0.22 * ppm, ea = (q2 * 2.39996) % PI, ec = Math.cos(ea), es = Math.sin(ea), seedH = q2;
      PX.forDisc(px, py, hr * 4.2, PW, PH, function (J, d, dx, dy) { var u2 = (dx * ec + dy * es) / 3.4, v2 = -dx * es + dy * ec, dd = Math.hypot(u2, v2) / hr, h = clamp(1.4 - dd, 0, 1); if (h > HOLE[J]) HOLE[J] = h;
        var f = sstep(hr * 3.8, hr * 0.8, d) * (PX.h2(J % PW, (J / PW) | 0, seedH) > 0.7 ? 0.55 : 0); if (f > FLUFF[J]) FLUFF[J] = f; }); }
  }
  PX.blur(WEAR, PW, PH, 4 * ppm); var wmax = 0; for (var i = 0; i < N; i++) wmax = Math.max(wmax, WEAR[i]);
  var wn = 1 / Math.max(wmax, 1e-9), wearScale = clamp(nThrows / 30000, 0.25, 1);
  // ---- glyphs for the number ring (wire numerals), unit box 0..1 x 0..1.6
  var G = { 0: [[[0.5, 0], [0.1, 0.3], [0.1, 1.3], [0.5, 1.6], [0.9, 1.3], [0.9, 0.3], [0.5, 0]]], 1: [[[0.25, 0.35], [0.55, 0], [0.55, 1.6]]], 2: [[[0.1, 0.35], [0.5, 0], [0.9, 0.35], [0.85, 0.7], [0.1, 1.6], [0.95, 1.6]]], 3: [[[0.1, 0.2], [0.5, 0], [0.9, 0.35], [0.5, 0.75], [0.9, 1.15], [0.5, 1.6], [0.1, 1.4]]], 4: [[[0.7, 1.6], [0.7, 0], [0.05, 1.1], [0.95, 1.1]]], 5: [[[0.9, 0], [0.15, 0], [0.1, 0.7], [0.6, 0.6], [0.9, 1.0], [0.6, 1.6], [0.1, 1.45]]], 6: [[[0.85, 0.15], [0.45, 0], [0.1, 0.6], [0.1, 1.3], [0.5, 1.6], [0.9, 1.25], [0.6, 0.8], [0.1, 1.0]]], 7: [[[0.05, 0], [0.95, 0], [0.35, 1.6]]], 8: [[[0.5, 0.75], [0.15, 0.4], [0.5, 0], [0.85, 0.4], [0.5, 0.75], [0.1, 1.15], [0.5, 1.6], [0.9, 1.15], [0.5, 0.75]]], 9: [[[0.9, 0.6], [0.5, 0.85], [0.1, 0.5], [0.5, 0], [0.9, 0.35], [0.85, 1.1], [0.4, 1.6]]] };
  var WIRE = new Float32Array(N);
  ORDER.forEach(function (num, i) {
    var a = segAngle(num), s = String(num), h = 19, wdt = h / 1.6 * 0.8, total = s.length * wdt + (s.length - 1) * 3, cx = Math.cos(a) * 196, cy = Math.sin(a) * 196, ta = 0;   // numerals stand upright
    for (var c = 0; c < s.length; c++) G[s[c]].forEach(function (st) {
      var pts = st.map(function (q) { var lx = -total / 2 + c * (wdt + 3) + q[0] * wdt, ly = h / 2 - q[1] / 1.6 * h, X = cx + lx * Math.cos(ta) - ly * Math.sin(ta), Y = cy + lx * Math.sin(ta) + ly * Math.cos(ta); return [(cx0 + X) * ppm, (cy0 - Y) * ppm]; });
      PX.line(WIRE, PW, PH, pts, 1.6 * ppm, 1);
    });
  });
  var seed = RB.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  var blackC = PX.col('#4a453c'), creamC = PX.col('#a89874'), redC = PX.col('#5a413a'), greenC = PX.col('#445445'), surround = PX.col(RB.pick(['#1a1612', '#241c16', '#2e241c'])), sisalB = PX.col('#c0ad86');
  var ageFade = { 'New This Season': 0.28, 'A Few Seasons': 0.52, 'Years': 0.78 }[age];
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppm - cx0, Y = cy0 - (py + 0.5) / ppm, rad = Math.hypot(X, Y), ang = Math.atan2(Y, X), r, g, b;
    var light = 1.0 - 0.3 * sstep(0, 260, rad) + 0.12 * (Y / 260);
    if (rad > 225.5) {   // the surround: a painted board / cabinet
      var sn = 0.9 + 0.1 * PX.fbm(X * 0.05, Y * 0.05, seed, 3); r = surround[0] * sn; g = surround[1] * sn; b = surround[2] * sn; light *= 0.8;
      var hl = HOLE[I]; r *= 1 - 0.6 * hl; g *= 1 - 0.6 * hl; b *= 1 - 0.6 * hl;
      var rm = sstep(232, 225.5, rad); r *= 1 - 0.6 * rm; g *= 1 - 0.6 * rm; b *= 1 - 0.6 * rm;
      Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light; continue;
    }
    var seg = Math.floor(((PI / 2 - ang) / (2 * PI / 20) + 0.5 + 20) % 20), alt = seg % 2 === 0, base;
    if (rad < 6.35) base = redC; else if (rad < 15.9) base = greenC;
    else if (rad > 99 && rad < 107) base = alt ? redC : greenC; else if (rad > 162 && rad < 170) base = alt ? redC : greenC;
    else if (rad > 170) base = blackC; else base = alt ? blackC : creamC;
    // sisal end grain: compressed fibre bundles ~1.5 mm, fine fibre ends
    var bundle = PX.vnoise(X * 0.7, Y * 0.7, seed + 1), fine = PX.vnoise(X * 3.2, Y * 3.2, seed + 2), vf = PX.vnoise(X * 7, Y * 7, seed + 3), fib = 0.84 + 0.08 * bundle + 0.09 * fine + 0.07 * vf;
    r = lerp(base[0], sisalB[0] * 0.6, ageFade * 0.25) * fib; g = lerp(base[1], sisalB[1] * 0.6, ageFade * 0.25) * fib; b = lerp(base[2], sisalB[2] * 0.6, ageFade * 0.25) * fib;
    var w = clamp(WEAR[I] * wn, 0, 1) * wearScale, fray = sstep(0.02, 0.42, w) * (0.75 + 0.25 * fine);
    r = lerp(r, sisalB[0] * 1.0, fray * 0.92); g = lerp(g, sisalB[1] * 0.97, fray * 0.92); b = lerp(b, sisalB[2] * 0.9, fray * 0.92);
    var pore = w > 0.08 && PX.h2(px, py, seed + 17) > (0.78 - 0.25 * w) ? 0.22 * w : 0;
    r *= 1 - pore; g *= 1 - pore; b *= 1 - pore * 1.05;
    var hl2 = HOLE[I], fl = FLUFF[I];
    r = lerp(r, sisalB[0] * 1.08, fl * 0.4); g = lerp(g, sisalB[1] * 1.04, fl * 0.4); b = lerp(b, sisalB[2] * 0.92, fl * 0.4);
    r *= 1 - 0.9 * hl2; g *= 1 - 0.92 * hl2; b *= 1 - 0.94 * hl2;
    // the spider: round wire rings and radial dividers, with a cast shadow below (light from above)
    var wireD = 1e9, dRing = [6.35, 15.9, 99, 107, 162, 170].reduce(function (m, q) { return Math.min(m, Math.abs(rad - q)); }, 1e9);
    if (rad > 15.9 && rad < 170) { var sa = ((PI / 2 - ang) / (2 * PI / 20) + 20) % 1, dr = Math.min(sa, 1 - sa) * 2 * PI / 20 * rad; wireD = dr; }
    wireD = Math.min(wireD, dRing);
    var shadowD = (function () { var Y2 = Y + 3.2, r2 = Math.hypot(X, Y2), a2 = Math.atan2(Y2, X), d = [6.35, 15.9, 99, 107, 162, 170].reduce(function (m, q) { return Math.min(m, Math.abs(r2 - q)); }, 1e9); if (r2 > 15.9 && r2 < 170) { var s2 = ((PI / 2 - a2) / (2 * PI / 20) + 20) % 1; d = Math.min(d, Math.min(s2, 1 - s2) * 2 * PI / 20 * r2); } return d; })();
    var shd = sstep(3.6, 0.45, shadowD) * 0.5; r *= 1 - shd; g *= 1 - shd; b *= 1 - shd;
    var halfW = 0.8, wcov = sstep(halfW, halfW * 0.35, wireD), across = clamp(wireD / halfW, 0, 1), nZ = Math.sqrt(Math.max(0, 1 - across * across));
    var metal = 0.12 + 0.08 * nZ + 0.11 * Math.pow(nZ, 12);
    r = lerp(r, metal, wcov); g = lerp(g, metal * 0.97, wcov); b = lerp(b, metal * 0.9, wcov);
    var nw = WIRE[I]; if (nw > 0) { r = lerp(r, 0.6, nw); g = lerp(g, 0.6, nw); b = lerp(b, 0.62, nw); }
    var nsh = PX.bil(WIRE, PW, PH, px, py - 1.6 * ppm) * (1 - nw) * 0.5; r *= 1 - nsh; g *= 1 - nsh; b *= 1 - nsh;
    Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  C.features({ Throwers: who, Board: age, Turned: turned ? 'Yes' : 'No', 'Best Thrower': players.reduce(function (m, p) { return Math.min(m, p.sig); }, 99) < 15 ? 'Good' : players.reduce(function (m, p) { return Math.min(m, p.sig); }, 99) < 28 ? 'Decent' : 'Learning', Misses: misses > nThrows * 0.05 ? 'Plenty' : misses ? 'A Few' : 'None' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.25, filmic: true, grain: 0.012, vig: 0.4, seed: 15 });
  C.done(o.cv.canvas, 'oche');
})();

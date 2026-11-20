/* Board, by Clyde (2027).
 * A wooden chopping board seen from above, washed and put back. Thousands of knife cuts, each too small to notice,
 * add up to where someone stands and how they cut.
 * Engine: a household is a few cooks, each with a handedness, a stance (where on the board they work) and a repertoire.
 * Rocking chops with a chef's knife leave short cuts perpendicular to the counter edge in a tight cluster near the
 * cook's hand; slicing bread leaves long, shallow saw-lines at the far side; jointing leaves a few deep diagonal
 * scores. Each cut is a V-groove: a dark line where juice and oil settle, and a pale lip where fibres are crushed
 * up and catch the light. Grooves across the grain open more than grooves along it. Old cuts are softened by
 * washing and oiling; heavy use dishes and greys the working zone. Stains wick along the grain. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RW = R.fork('wood'), RC = R.fork('cooks'), RK = R.fork('cuts');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1400, VH = 1050, FW = RW.range(24, 34), FH = FW * 0.75;   // cm: the camera frames the working zone
  var wood = RW.weighted([['Beech', 34], ['Oak', 22], ['Maple', 18], ['Walnut', 12], ['Bamboo', 14]]);
  var years = RW.weighted([['A Year', 30], ['Five Years', 44], ['Since The Wedding', 26]]);
  var cookers = RC.weighted([['One Cook', 44], ['Two Cooks', 40], ['A Busy Kitchen', 16]]);
  var stain = RC.weighted([['None', 56], ['Beetroot', 16], ['Turmeric', 14], ['Red Wine', 14]]);
  var bw = RW.range(36, 46), bh = RW.range(24, 30), bx = (FW - bw) / 2 + RW.gaussian(0, 1.2), by = (FH - bh) / 2 + RW.gaussian(0, 1), brot = RW.gaussian(0, 0.03), corner = RW.range(1, 3), groove = RW.chance(0.35), hole = !groove && RW.chance(0.4);
  var nCooks = { 'One Cook': 1, 'Two Cooks': 2, 'A Busy Kitchen': RC.int(3, 4) }[cookers], cooks = [];
  for (var k = 0; k < nCooks; k++) {
    var lefty = RC.chance(0.11), u = lefty ? RC.range(0.15, 0.45) : RC.range(0.5, 0.85);
    cooks.push({ lefty: lefty, ux: u, uy: RC.range(0.45, 0.8), spread: RC.range(0.11, 0.22), tilt: (lefty ? 1 : -1) * RC.range(0.05, 0.35), w: RC.range(0.5, 1.5), bread: RC.range(0, 0.25), meat: RC.range(0, 0.1) });
  }
  var main = cooks.reduce(function (m, c) { return c.w > m.w ? c : m; });
  var fcu = clamp(main.ux + RW.gaussian(0, 0.08), 0.3, 0.7), fcv = clamp(main.uy + RW.gaussian(0, 0.08), 0.35, 0.65);
  var nCuts = { 'A Year': RK.int(900, 1600), 'Five Years': RK.int(2200, 3800), 'Since The Wedding': RK.int(4500, 7000) }[years];
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH;
  var DARK = new Float32Array(N), LIP = new Float32Array(N), USE = new Float32Array(N), STN = new Float32Array(N);
  var cb = Math.cos(brot), sb = Math.sin(brot), TMPL = new Float32Array(N), touched = [];
  // PX.line max-combines; cuts should add up, so draw each into a scratch buffer and accumulate its touched pixels
  var _ln = PX.line; PX.line = function (F, W2, H2, pts, w, val) { if (F !== TMPL) return _ln(F, W2, H2, pts, w, val); var x0 = Math.max(0, Math.floor(Math.min(pts[0][0], pts[1][0]) - w - 2)), x1 = Math.min(W2 - 1, Math.ceil(Math.max(pts[0][0], pts[1][0]) + w + 2)), y0 = Math.max(0, Math.floor(Math.min(pts[0][1], pts[1][1]) - w - 2)), y1 = Math.min(H2 - 1, Math.ceil(Math.max(pts[0][1], pts[1][1]) + w + 2)); touched = [x0, x1, y0, y1]; _ln(F, W2, H2, pts, w, val); };
  function accum(F, v) { var t = touched; for (var y = t[2]; y <= t[3]; y++) for (var x = t[0]; x <= t[1]; x++) { var j = y * PW + x; if (TMPL[j] > 0) { F[j] += TMPL[j] * v; TMPL[j] = 0; } } }
  var offX = -(fcu - 0.5) * bw, offY = -(fcv - 0.5) * bh;
  function toPx(u, v) { var lx = (u - 0.5) * bw + offX, ly = (v - 0.5) * bh + offY; return [(FW / 2 + lx * cb - ly * sb) * ppc, (FH / 2 + lx * sb + ly * cb) * ppc]; }
  var lightAng = RW.range(-0.6, 0.6) + (RW.chance(0.5) ? 0 : PI / 2);   // window light rakes across the board
  var cw = cooks.reduce(function (a, c) { return a + c.w; }, 0), tmp = [0, 0];
  for (var t = 0; t < nCuts; t++) {
    var q = RK.rand() * cw, ci = 0; while (ci < cooks.length - 1 && q > cooks[ci].w) { q -= cooks[ci].w; ci++; }
    var c = cooks[ci], kind = RK.rand(), age = RK.rand(), u, v, ang, len, depth;
    if (kind < c.bread) { u = 0.5 + RK.gaussian(0, 0.18); v = RK.range(0.08, 0.4); ang = c.tilt * 0.5 + RK.gaussian(0, 0.12); len = RK.range(4, 11); depth = 0.25; }
    else if (kind < c.bread + c.meat) { u = 0.5 + RK.gaussian(0, 0.2); v = 0.5 + RK.gaussian(0, 0.15); ang = RK.range(-0.9, 0.9); len = RK.range(3, 8); depth = 1.4; }
    else { u = c.ux + RK.gaussian(0, c.spread); v = c.uy + RK.gaussian(0, c.spread * 0.8); ang = PI / 2 + c.tilt + RK.gaussian(0, 0.1); len = RK.pareto(1.1, 2.0); len = Math.min(len, 5.5); depth = RK.range(0.7, 1.4); }
    if (u < 0.03 || u > 0.97 || v < 0.04 || v > 0.96) continue;
    var hl = len / 2, du = Math.cos(ang) * hl / bw, dv = Math.sin(ang) * hl / bh, a = toPx(u - du, v - dv), b = toPx(u + du, v + dv);
    var rak = 0.4 + 1.2 * Math.abs(Math.sin(ang - lightAng)), soft = (1 - 0.55 * Math.pow(age, 0.6)) * rak, across = Math.abs(Math.sin(ang)), d = depth * soft * (0.55 + 0.5 * across), wpx = Math.max(0.7, 0.045 * ppc * (0.7 + d));
    PX.line(TMPL, PW, PH, [a, b], wpx, 1); accum(DARK, clamp(d * 0.22, 0, 1));
    var ox = -Math.sin(ang) * 0.03 * ppc, oy = Math.cos(ang) * 0.03 * ppc;   // the lip on the lit side
    PX.line(TMPL, PW, PH, [[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy]], wpx * 0.9, 1); accum(LIP, clamp(d * 0.55, 0, 1));
    var m = toPx(u, v), mi = Math.floor(m[1]) * PW + Math.floor(m[0]); if (mi >= 0 && mi < N) USE[mi] += 1;
  }
  PX.blur(USE, PW, PH, 2.5 * ppc); var umax = 0; for (var i = 0; i < N; i++) umax = Math.max(umax, USE[i]);
  if (stain !== 'None') { var su = RC.range(0.25, 0.75), sv = RC.range(0.3, 0.7), sr = RC.range(1.5, 4); var sp = toPx(su, sv); PX.forDisc(sp[0], sp[1], sr * ppc * 2.5, PW, PH, function (J, d, dx, dy) { var ex = (dx * cb + dy * sb), ey = (-dx * sb + dy * cb) * 2.2, dd = Math.hypot(ex, ey) / (sr * ppc); STN[J] = Math.max(STN[J], sstep(1.3, 0.2, dd + 0.4 * PX.fbm(ex * 0.02, ey * 0.02, 5, 3))); }); }
  var W = { Beech: ['#d8b48a', '#c99b6e'], Oak: ['#c9a678', '#a7804f'], Maple: ['#e6cfa8', '#d4b98c'], Walnut: ['#7a553a', '#5c3f2a'], Bamboo: ['#d9bc84', '#c4a064'] }[wood].map(PX.col);
  var counter = PX.col(RW.pick(['#2b2b2a', '#d9d6cf', '#3d3f41', '#6e6a62'])), seed = RW.int(1, 9999), stC = { Beetroot: PX.col('#7a1f3d'), Turmeric: PX.col('#d4a017'), 'Red Wine': PX.col('#5e1f2a'), None: [1, 1, 1] }[stain];
  var strips = Math.round(bh / RW.range(3, 5)), stripTone = []; for (var k2 = 0; k2 < strips + 2; k2++) stripTone.push(RW.range(-1, 1));
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), oiled = years === 'A Year' ? 0.15 : 0.45;
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc - FW / 2, Y = (py + 0.5) / ppc - FH / 2, lx = X * cb + Y * sb - offX, ly = -X * sb + Y * cb - offY, r, g, b;
    var ex = Math.max(0, Math.abs(lx) - (bw / 2 - corner)), ey = Math.max(0, Math.abs(ly) - (bh / 2 - corner)), sd = Math.hypot(ex, ey) - corner;   // signed distance to the board edge
    var light = 1.05 - 0.25 * ((py / PH) * 0.6 + (px / PW) * 0.4);
    if (hole) { var hx = lx - (bw / 2 - 3), hd = Math.hypot(hx, ly) - 0.9; if (hd < 0) sd = Math.max(sd, -hd); }
    if (sd > 0) {   // the counter, with the board's soft shadow
      var sh = 1 - 0.55 * Math.exp(-Math.max(0, Math.hypot(Math.max(0, Math.abs(lx - 0.8) - (bw / 2 - corner)), Math.max(0, Math.abs(ly - 1.1) - (bh / 2 - corner))) - corner) / 1.2);
      var ct = 0.95 + 0.05 * PX.fbm(X * 0.3, Y * 0.3, seed + 9, 3); r = counter[0] * ct * sh; g = counter[1] * ct * sh; b = counter[2] * ct * sh;
      Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light; continue;
    }
    // long-grain strips glued edge to edge; growth rings as warped lines along the length
    var si = Math.floor((ly + bh / 2) / bh * strips + 1e-6), st = stripTone[si + 1] || 0;
    var gy = ly + 1.15 * PX.fbm(lx * 0.04, ly * 0.08 + si * 5, seed + si, 4) + 0.25 * PX.vnoise(lx * 0.15, ly * 0.4, seed + 8);
    var spacing = wood === 'Bamboo' ? 0.55 : 0.85;
    var band = gy / spacing + 0.35 * PX.fbm(lx * 0.02, gy * 0.3, seed + 11, 3);
    var late = Math.pow(0.5 + 0.5 * Math.sin(band * 2 * PI), wood === 'Bamboo' ? 4 : 9);
    var ray = wood === 'Oak' ? sstep(0.84, 0.96, PX.vnoise(lx * 0.25, ly * 6, seed + 2)) * 0.28 : 0;
    var pore = PX.vnoise(lx * 1.8, ly * 28, seed + 4);
    var fig = 0.08 * PX.fbm(lx * 0.08, ly * 0.15, seed + 14, 4);
    var t2 = clamp(0.48 + 0.1 * st + 0.22 * late - 0.1 * ray + fig + 0.04 * PX.vnoise(lx * 1.2, ly * 10, seed + 3) + 0.07 * pore * pore * Math.sign(pore), 0, 1);
    r = lerp(W[0][0], W[1][0], t2); g = lerp(W[0][1], W[1][1], t2); b = lerp(W[0][2], W[1][2], t2);
    var seamD = Math.abs(((ly + bh / 2) / bh * strips) % 1 - 0) * bh / strips; if (seamD < 0.03) { r *= 0.9; g *= 0.9; b *= 0.9; }
    // use: the working zone greys and dishes; oil darkens everything a little
    var use = clamp(USE[I] / umax, 0, 1); r *= (1 - 0.22 * use) * (1 - 0.12 * oiled); g *= (1 - 0.24 * use) * (1 - 0.14 * oiled); b *= (1 - 0.2 * use) * (1 - 0.18 * oiled);
    var grey = 0.22 * use; r = lerp(r, 0.32, grey); g = lerp(g, 0.3, grey); b = lerp(b, 0.26, grey);
    var dk = 1 - Math.exp(-DARK[I] * 2.6), lp = (1 - Math.exp(-LIP[I] * 2.0)) * (1 - dk * 0.4), pale = wood === 'Walnut' ? 1.6 : 1;
    r = r * (1 - 0.7 * dk) + lp * 0.22 * pale; g = g * (1 - 0.7 * dk) + lp * 0.2 * pale; b = b * (1 - 0.72 * dk) + lp * 0.14 * pale;
    if (STN[I] > 0) { var s2 = STN[I] * 0.55 * (0.7 + 0.3 * late); r = lerp(r, r * stC[0] * 2.2, s2); g = lerp(g, g * stC[1] * 2.2, s2); b = lerp(b, b * stC[2] * 2.2, s2); }
    if (groove) { var gd = Math.abs(Math.hypot(Math.max(0, Math.abs(lx) - (bw / 2 - 3.5)), Math.max(0, Math.abs(ly) - (bh / 2 - 3.5))) - 1.2) ; if (gd < 0.35 && (Math.abs(lx) > bw / 2 - 4.8 || Math.abs(ly) > bh / 2 - 4.8)) { var gs = 1 - 0.35 * Math.cos(gd / 0.35 * PI / 2) * (ly - 0 > 0 ? 1 : 0.6); r *= gs; g *= gs; b *= gs; } }
    var edge = sstep(-0.35, 0, sd) * 0.3; r *= 1 - edge; g *= 1 - edge; b *= 1 - edge;
    Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  C.features({ Wood: wood, Used: years, Cooks: cookers, 'Left-Handed': cooks.some(function (c) { return c.lefty; }) ? 'Yes' : 'No', Stain: stain, Board: groove ? 'Juice Groove' : hole ? 'Hanging Hole' : 'Plain' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.05, filmic: false, grain: 0.01, vig: 0.3, seed: 16 });
  C.done(o.cv.canvas, 'board');
})();

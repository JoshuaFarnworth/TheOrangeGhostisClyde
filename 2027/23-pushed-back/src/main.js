/* Pushed Back, by Clyde (2027).
 * The wall behind a dining table. Every time someone stood up, their chair went back and its top rail touched the
 * paint. Years of meals become a row of grey bands, one per seat, at the height of that seat's chair.
 * Engine: each seat has a chair (back height, rail width, a sitter's habits). Every stand-up is an event: the chair
 * slides back a little further or less, so the rail meets the wall at a jittered position; contact transfers grime
 * (1 - exp(-dose)) and burnishes the matt emulsion to a sheen; harder knocks chip the paint at the rail corners,
 * exposing the previous colour and then plaster. A sitter who tips back drags the rail up in an arc. A repainted
 * patch covers some of it, imperfectly matched, and the marks begin again on top. Wall front-on, in cm. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RS = R.fork('seats'), RW = R.fork('wall');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 2000, VH = 900, Y0 = 52, FH = 24;   // cm; tight crop around the rail height; FW set after seats
  var years = RS.weighted([['A Year', 22], ['Ten Years', 44], ['Since They Moved In', 34]]), dose = { 'A Year': 700, 'Ten Years': 2200, 'Since They Moved In': 6000 }[years];
  var seats = RS.weighted([[2, 30], [3, 45], [4, 25]]), wallName = RW.pick(['Magnolia', 'Brilliant White', 'Sage', 'Duck Egg', 'Terracotta', 'Pale Grey']);
  var WALL = { 'Magnolia': '#e6dcc6', 'Brilliant White': '#ecebe6', 'Sage': '#b9c2a8', 'Duck Egg': '#bccbc6', 'Terracotta': '#c98a6c', 'Pale Grey': '#cfcfcb' }[wallName];
  var PREV = PX.col(RW.pick(['#e6dcc6', '#d8c9a0', '#c5d0c0', '#e9e3d0', '#c6b49a'])), PLASTER = PX.col('#d9ccba'), PRIMER = PX.col('#cfc3b0'), wc = PX.col(WALL);
  var place = RS.range(60, 74), sideM = RS.range(10, 18), FW = place * seats + sideM * 2;
  var o = PX.canvas(C, VW, VH, '#ccc'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH;
  var G = new Float32Array(N), B = new Float32Array(N), K = new Float32Array(N), CS = new Float32Array(N), ED = new Float32Array(N);
  function W2P(x, y) { return [x * ppc, (Y0 + FH - y) * ppc]; }
  var tx0 = sideM, tipper = RS.chance(0.4) ? RS.int(0, seats - 1) : -1, chipped = 0;
  var chairH = RS.range(84, 96); Y0 = chairH - RS.range(10, 13); var chairStyle = RS.weighted([['Matching', 70], ['Odd One', 30]]);
  for (var s = 0; s < seats; s++) {
    var rs = RS.fork('seat' + s), cx = tx0 + place * (s + 0.5) + rs.gaussian(0, 1.8), h = chairH + (chairStyle === 'Odd One' && s === seats - 1 ? rs.range(-10, 7) : rs.gaussian(0, 0.45));
    var rw = rs.range(32, 41), share = rs.pareto(1, 1.6), ev = Math.round(dose / Math.sqrt(seats) * Math.min(3, share) * rs.range(0.55, 1.35)), tilt = rs.gaussian(0, 0.015);
    var stepsI = Math.min(ev, 900), wgt = ev / stepsI;
    for (var e = 0; e < stepsI; e++) {
      var y = h - Math.abs(rs.gaussian(0, 0.5)) - (rs.chance(0.08) ? rs.range(0.5, 3.2) : 0), x = cx + rs.gaussian(0, 1.05), a = tilt + rs.gaussian(0, 0.008), hard = rs.pareto(1, 2.2);
      var arc = (s === tipper && rs.chance(0.25)) ? rs.range(3, 14) : 0;
      // most contacts are the full rail width, so each seat reads as a length of chair-back; ends (corners) hit harder
      var ul = rs.chance(0.82) ? rw : rs.range(rw * 0.55, rw * 0.9), uc = (rw - ul) / 2 * (rs.chance(0.5) ? 1 : -1); for (var u = uc - ul / 2; u <= uc + ul / 2; u += 0.2) {
        var px = x + u, py = y + a * u + arc * (1 - Math.pow(2 * u / rw, 2)) * 0.15, end = 0.42 + 0.58 * Math.pow(Math.abs(2 * u / rw), 5), p = W2P(px, py);
        PX.forDisc(p[0], p[1], 1.25 * ppc, PW, PH, function (I, d) { var dd = d / ppc, f = Math.exp(-dd * dd / 0.022) + 0.045 * Math.exp(-dd * dd / 0.28); G[I] += f * 0.007 * wgt * end * Math.min(hard, 4); B[I] += f * 0.0095 * wgt * end; });
      }
      if (hard > 9 && rs.chance(0.2) && chipped < seats * 4) {
        var side = rs.chance(0.65) ? (rs.chance(0.5) ? -1 : 1) : rs.gaussian(0, 0.4), q = W2P(x + side * rw / 2 + rs.gaussian(0, 0.25), y + rs.gaussian(0, 0.2));
        var rr = rs.range(2.0, 4.4) * ppc, sk = rs.int(1, 1e6), rot = rs.range(0, PI), squash = rs.range(0.40, 0.75);
        var ox = rs.gaussian(0.22, 0.28) * rr, oy = rs.gaussian(0.12, 0.22) * rr; chipped++;
        PX.forDisc(q[0], q[1], rr * 1.9, PW, PH, function (I, d) {
          var xx = I % PW, yy = (I / PW) | 0, dx = xx - q[0], dy = yy - q[1];
          var lx = dx * Math.cos(rot) + dy * Math.sin(rot), ly = -dx * Math.sin(rot) + dy * Math.cos(rot);
          var jagged = 0.86 + 0.22 * PX.vnoise(xx * 0.08 + 3, yy * 0.08, sk) + 0.1 * PX.vnoise(xx * 0.22, yy * 0.22, sk + 2);
          var ell = Math.hypot(lx / rr, ly / (rr * squash));
          if (ell < jagged) {
            var pit = Math.hypot(dx - ox, dy - oy) / (rr * 0.55);
            var k = (ell < jagged * 0.62 && pit < 0.95) ? 2 : 1; if (k > K[I]) K[I] = k;
            var edge = sstep(jagged - 0.32, jagged, ell);
            if (edge > ED[I]) ED[I] = edge;
            var rec = clamp(0.25 + 0.75 * (-0.5 * dx + 0.75 * dy) / (rr + 0.01), 0, 1);
            if (rec > CS[I]) CS[I] = rec;
          }
        });
      }
    }
  }
  // a repainted patch: covers marks inside it, then a fraction of the events happen again on top
  var patch = RW.chance(0.35) && years !== 'A Year', pr = null;
  if (patch) { var ps = RW.int(0, seats - 1), pcx = tx0 + place * (ps + 0.5); pr = [pcx - RW.range(22, 36), chairH - RW.range(10, 16), pcx + RW.range(22, 36), chairH + RW.range(5, 12)]; }
  var socket = RW.chance(0.28) ? [RW.pick([tx0 - 4, tx0 + place * seats + 2, RW.range(6, FW - 6)]), chairH + RW.range(-7, 3)] : null, seed = RW.int(1, 9999);
  var HOLES = []; for (var hI = 0, nh = RW.int(0, 3); hI < nh; hI++) HOLES.push([RW.range(5, FW - 5), RW.range(Y0 + 1.5, Y0 + FH - 1.5), RW.range(0.12, 0.45), RW.chance(0.7) ? 1 : 0]);
  var CRACK = RW.chance(0.28) ? [RW.range(10, FW - 10), Y0 + RW.range(2, FH - 2), RW.gaussian(0, 0.3)] : null;
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), lx = RW.chance(0.5) ? 1 : -1;
  for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
    var I = py2 * PW + px2, X = (px2 + 0.5) / ppc, Y = Y0 + FH - (py2 + 0.5) / ppc;
    var stip = PX.vnoise(X * 3, Y * 3, seed) * 0.4 + PX.vnoise(X * 9, Y * 9, seed + 1) * 0.6, peel = PX.vnoise(X * 9 + 0.15, Y * 9 + 0.15, seed + 1) - PX.vnoise(X * 9 - 0.15, Y * 9 - 0.15, seed + 1), sh = 0.97 + 0.03 * (stip - 0.5) + 0.06 * peel * lx + 0.09 * lx * (PX.fbm(X * 0.7 + 0.2, Y * 0.7, seed + 6, 3) - PX.fbm(X * 0.7 - 0.2, Y * 0.7, seed + 6, 3)) + 0.02 * PX.fbm(X * 0.02, Y * 0.02, seed + 2, 3);
    var r = wc[0] * sh, g = wc[1] * sh, b = wc[2] * sh, gr = G[I], bu = B[I];
    if (pr && X > pr[0] && X < pr[2] && Y > pr[1] && Y < pr[3]) { var m = 0.985 + 0.02 * (PX.h2(3, 4, seed) - 0.5); r *= m * 1.01; g *= m; b *= m * 0.99; gr *= 0.25; bu *= 0.3; if (K[I] > 0) K[I] = 0; var rim = Math.min(X - pr[0], pr[2] - X, Y - pr[1], pr[3] - Y); if (rim < 0.6) { r *= 0.985; g *= 0.985; b *= 0.985; } }
    var lap = 0.004 * sstep(0.2, 0, Math.abs(((X + 3 * PX.vnoise(Y * 0.05, 1, seed)) % 23) - 11.5) - 11) ; r -= lap; g -= lap; b -= lap;
    for (var hI = 0; hI < HOLES.length; hI++) { var hh = HOLES[hI], hd = Math.hypot(X - hh[0], Y - hh[1]); if (hd < hh[2]) { var hv = hh[3] ? 0.03 * (1 - hd / hh[2]) : -0.08 * sstep(hh[2], hh[2] * 0.4, hd); r += hv; g += hv; b += hv * 1.1; } }
    if (CRACK) { var cdist = Math.abs(X - CRACK[0] - 6 * PX.fbm(Y * 0.08, 2, seed + 5, 3) - (Y - CRACK[1]) * CRACK[2]); if (Y > CRACK[1] && cdist < 0.05 + 0.04 * PX.vnoise(Y, 3, seed)) { r *= 0.8; g *= 0.8; b *= 0.8; } }
    var stri = 0.75 + 0.5 * PX.vnoise(X * 0.25, Y * 0.5, seed + 9), dark = 1 - Math.exp(-gr * 3.2 * stri), gl = 1 - Math.exp(-bu * 1.2);
    r = lerp(r, 0.10, dark * 0.88); g = lerp(g, 0.095, dark * 0.88); b = lerp(b, 0.085, dark * 0.88);
    var sheen = gl * 0.08 * clamp(0.5 + 0.9 * stip + 0.4 * lx * (X / FW), 0, 1.6); r += sheen; g += sheen * 0.98; b += sheen * 0.92;
    if (K[I] === 1) { r = PREV[0] * 0.78 * sh; g = PREV[1] * 0.78 * sh; b = PREV[2] * 0.78 * sh; }
    else if (K[I] === 2) { var lit = clamp(1.05 - 0.85 * CS[I], 0.2, 1); r = 0.42 * lit + 0.12; g = 0.38 * lit + 0.11; b = 0.33 * lit + 0.10; }
    if (K[I] > 0) { r *= 0.92; g *= 0.92; b *= 0.9; }
    if (ED[I] > 0.12) { var ev = ED[I]; r = lerp(r, 0.10, ev * 0.88); g = lerp(g, 0.09, ev * 0.88); b = lerp(b, 0.08, ev * 0.88); }
    if (socket) { var dx = Math.abs(X - socket[0]), dy = Math.abs(Y - socket[1]); if (dx < 7.3 && dy < 4.3) { var edge = Math.min(7.3 - dx, 4.3 - dy); var sv = 0.92 + 0.05 * sstep(0, 0.3, edge) - (edge < 0.25 ? 0.06 : 0); r = g = b = sv; var sl = Math.abs(dx - 3.6) < 0.5 && Math.abs(Y - socket[1] - 1.2) < 0.25; if (sl) r = g = b = 0.15; } else if (dx < 7.8 && dy < 4.8 && Y < socket[1]) { r *= 0.85; g *= 0.85; b *= 0.85; } }
    var light = 1 + 0.22 * lx * (X / FW - 0.5) + 0.08 * (Y - Y0) / FH; Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  C.features({ Seats: seats, Years: years, Wall: wallName, Chairs: chairStyle, 'Tips Back': tipper >= 0 ? 'Someone' : 'Nobody', Repainted: patch ? 'One Patch' : 'Never', Chips: chipped > 12 ? 'Many' : chipped > 3 ? 'Some' : 'Few', Socket: socket ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: true, grain: 0.01, vig: 0.25, seed: 23 });
  C.done(o.cv.canvas, 'pushed-back');
})();

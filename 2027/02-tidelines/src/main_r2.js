/* Tidelines, by Clyde (2027).
 * The sheet of paper someone kept beside them while they waited. The cup is gone; only where it was set down remains.
 * Engine: every set-down puts a real volume of liquid on a simulated sheet. Water wicks through the fibres by a
 * porous-medium law (dW/dt = div(K W^2 grad W), so wet fronts are sharp and stop), faster along the machine
 * direction; dissolved colour rides the flow out to the front and is stranded there when the water evaporates
 * (the tideline), while fines are filtered out by the fibres near where they landed. Re-wetting re-dissolves old
 * stain and carries part of it to the new front, so later visits print over earlier ones the way real rings do.
 * Rendering: Beer-Lambert absorbance in the fibres under soft window light, with cockle where the sheet got wet. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('paper'), RV = R.fork('visits'), RL = R.fork('liquid'), RI = R.fork('incident');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep;
  var CMW = 24, CMH = 30, VW = 1000, VH = 1250, CELL = 0.05, GW = 480, GH = 600;   // sheet in cm, 0.5 mm sim cells
  var Q = C.platform === 'standalone' ? C.query : null;

  // ---------------- traits ----------------
  var paper = RP.weighted([['Notepad', 30], ['Graph Pad', 14], ['Napkin', 18], ['Kraft', 14], ['Sketchbook', 16], ['Typing Paper', 8]]);
  var liquid = RL.weighted([['Black Coffee', 30], ['Espresso', 12], ['Tea', 20], ['Red Wine', 16], ['Milky Coffee', 12], ['Water', 10]]);
  var visits = RV.weighted([['Once', 34], ['Twice', 26], ['A Few', 24], ['All Afternoon', 6], ['Moved Twice', 10]]);
  var incident = RI.weighted([['None', 40], ['A Drip', 22], ['Spoon Set Down', 10], ['Splashed', 10], ['Slid', 10], ['Tea Bag', 8]]);
  if (Q && Q.get('liquid')) liquid = Q.get('liquid'); if (Q && Q.get('paper')) paper = Q.get('paper'); if (Q && Q.get('visits')) visits = Q.get('visits'); if (Q && Q.get('incident')) incident = Q.get('incident');
  if (incident === 'Tea Bag' && liquid !== 'Tea') incident = liquid === 'Red Wine' ? 'Splashed' : 'A Drip';
  if (incident === 'Spoon Set Down' && (liquid === 'Red Wine' || liquid === 'Water')) incident = 'A Drip';
  var vessel = liquid === 'Espresso' ? 'Espresso Cup' : liquid === 'Red Wine' ? 'Wine Glass' : liquid === 'Water' ? RL.pick(['Tumbler', 'Wine Glass']) : RL.weighted([['Mug', 70], ['Cup', 30]]);

  // paper physics: base K (wicking), anisotropy (machine direction is y), sizing (how long liquid sits on top)
  var PP = {
    'Notepad': { K: 0.35, an: 1.3, base: '#f4f0e6', tooth: 0.25 }, 'Graph Pad': { K: 0.32, an: 1.3, base: '#f3f2ea', tooth: 0.22 },
    'Napkin': { K: 1.5, an: 1.1, base: '#f6f4ef', tooth: 0.5, feather: 1 }, 'Kraft': { K: 0.55, an: 1.5, base: '#c8a47c', tooth: 0.6 },
    'Sketchbook': { K: 0.45, an: 1.15, base: '#efe6d2', tooth: 0.45 }, 'Typing Paper': { K: 0.3, an: 1.4, base: '#f1efe9', tooth: 0.3 }
  }[paper];
  // absorbance per unit deposit, [R,G,B]; s1 = mobile dissolved colour (goes to the front), s2 = fines/fat (filtered, stays)
  var LQ = {
    'Black Coffee': { a1: [0.30, 0.62, 1.05], a2: [0.42, 0.62, 0.86], c1: 1.0, c2: 0.35, ad1: 0.005, ad2: 0.03 },
    'Espresso': { a1: [0.34, 0.66, 1.05], a2: [0.45, 0.64, 0.84], c1: 1.4, c2: 0.8, ad1: 0.006, ad2: 0.035 },
    'Tea': { a1: [0.14, 0.48, 1.15], a2: [0.30, 0.52, 0.80], c1: 0.85, c2: 0.12, ad1: 0.004, ad2: 0.02 },
    'Red Wine': { a1: [0.70, 1.15, 0.50], a2: [0.22, 0.95, 0.62], c1: 0.8, c2: 0.55, ad1: 0.0035, ad2: 0.012 },
    'Milky Coffee': { a1: [0.26, 0.52, 0.92], a2: [0.26, 0.40, 0.66], c1: 0.45, c2: 0.8, ad1: 0.005, ad2: 0.06 },
    'Water': { a1: [0.20, 0.24, 0.32], a2: [0.10, 0.11, 0.12], c1: 0.6, c2: 0.05, ad1: 0.003, ad2: 0.02 }
  }[liquid];

  // ---------------- the sheet ----------------
  var N = GW * GH, W = new Float32Array(N), S1 = new Float32Array(N), S2 = new Float32Array(N), D1 = new Float32Array(N), D2 = new Float32Array(N), WM = new Float32Array(N);
  var Kx = new Float32Array(N), Ky = new Float32Array(N), P3 = new Float32Array(N), dW = new Float32Array(N), dA = new Float32Array(N), dB = new Float32Array(N);
  var pseed = (RP.rand() * 1e6) | 0;
  for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) {
    var i = y * GW + x, cx = x * CELL, cy = y * CELL;
    var floc = PX.fbm(cx * 2.2, cy * 2.2, pseed, 4) * 0.5 + 0.5;                 // formation flocs, ~3-5 mm
    var fib = PX.vnoise(cx * 18, cy * 4, pseed + 9) * 0.5 + 0.5;                   // fibre streaks, along y
    var ff = PX.vnoise(cx * 14, cy * 9, pseed + 13) * 0.5 + 0.5;               // fibre-scale permeability: roughens fronts
    var k = PP.K * (0.45 + 0.9 * floc) * (0.8 + 0.4 * fib) * (0.45 + 1.1 * ff * ff);
    if (PP.feather) k *= 0.25 + 1.5 * Math.pow(PX.vnoise(cx * 30, cy * 30, pseed + 77) * 0.5 + 0.5, 2);   // tissue: open, uneven web
    Kx[i] = k; Ky[i] = k * PP.an;
  }

  // ---------------- one set-down = one simulation ----------------
  var Kmax = PP.K * 1.35 * 1.2 * 1.55 * PP.an;
  function simulate(bx0, by0, bx1, by1, amtW) {
    bx0 = Math.max(1, bx0 | 0); by0 = Math.max(1, by0 | 0); bx1 = Math.min(GW - 2, bx1 | 0); by1 = Math.min(GH - 2, by1 | 0);
    var e0 = 0.0016 / (0.5 + PP.K), it, x, y, i;
    for (it = 0; it < 4000; it++) {
      var wmax = 0, wsum = 0;
      for (y = by0 - 1; y <= by1 + 1; y++) for (x = bx0 - 1; x <= bx1 + 1; x++) { i = y * GW + x; var w = W[i]; P3[i] = w * w * w; dW[i] = 0; dA[i] = 0; dB[i] = 0; if (w > wmax) wmax = w; wsum += w; }
      if (wsum < amtW * 0.002 || wmax < 0.012) break;
      if (it % 20 === 19) { var nx0 = GW, nx1 = 0, ny0 = GH, ny1 = 0; for (y = by0; y <= by1; y++) for (x = bx0; x <= bx1; x++) if (W[y * GW + x] > 0) { if (x < nx0) nx0 = x; if (x > nx1) nx1 = x; if (y < ny0) ny0 = y; if (y > ny1) ny1 = y; }
        if (nx1 >= nx0) { bx0 = Math.max(1, nx0 - 6); bx1 = Math.min(GW - 2, nx1 + 6); by0 = Math.max(1, ny0 - 6); by1 = Math.min(GH - 2, ny1 + 6); } }
      var dt = Math.min(1, 0.9 / (12 * Kmax * Math.max(wmax * wmax, 0.05)));
      for (y = by0; y <= by1; y++) for (x = bx0; x <= bx1; x++) {
        i = y * GW + x;
        for (var dir = 0; dir < 2; dir++) {
          var j = dir ? i + GW : i + 1; if (dir && y === by1) continue; if (!dir && x === bx1) continue;
          var f = (dir ? Ky[i] : Kx[i]) * (P3[i] - P3[j]) * dt; if (f === 0) continue;
          var s = f > 0 ? i : j, af = Math.abs(f), ws = W[s] + 1e-6, frac = Math.min(0.24, af / ws);
          var a = S1[s] * frac, b = S2[s] * frac * 0.35;                         // fines lag behind the water (filtered)
          if (f > 0) { dW[i] -= af; dW[j] += af; dA[i] -= a; dA[j] += a; dB[i] -= b; dB[j] += b; }
          else { dW[j] -= af; dW[i] += af; dA[j] -= a; dA[i] += a; dB[j] -= b; dB[i] += b; }
        }
      }
      for (y = by0; y <= by1; y++) for (x = bx0; x <= bx1; x++) {
        i = y * GW + x; var w2 = W[i] + dW[i]; S1[i] += dA[i]; S2[i] += dB[i];
        if (w2 <= 0.012) { if (W[i] > 0 || w2 > 0) { D1[i] += S1[i]; D2[i] += S2[i]; S1[i] = 0; S2[i] = 0; } W[i] = 0; continue; }
        var edge = (W[i - 1] < 0.012 ? 1 : 0) + (W[i + 1] < 0.012 ? 1 : 0) + (W[i - GW] < 0.012 ? 1 : 0) + (W[i + GW] < 0.012 ? 1 : 0);
        w2 -= e0 * dt * (1 + 4.5 * edge);                                            // evaporation is fastest at the contact line
        var ad1 = LQ.ad1 * dt * S1[i], ad2 = LQ.ad2 * dt * S2[i];
        D1[i] += ad1; S1[i] -= ad1; D2[i] += ad2; S2[i] -= ad2;
        var rd = 0.0012 * dt * D1[i]; D1[i] -= rd; S1[i] += rd;                      // re-wetting lifts old stain
        if (w2 <= 0.012) { D1[i] += S1[i]; D2[i] += S2[i]; S1[i] = 0; S2[i] = 0; w2 = 0; }
        W[i] = w2; if (w2 > WM[i]) WM[i] = w2;
      }
    }
    for (y = by0; y <= by1; y++) for (x = bx0; x <= bx1; x++) { i = y * GW + x; D1[i] += S1[i]; D2[i] += S2[i]; S1[i] = 0; S2[i] = 0; W[i] = 0; }
  }
  // deposit liquid with a shape function f(cx,cy)->depth (cm coords); returns bbox in cells
  function pour(cx0, cy0, cx1, cy1, fn, conc) {
    var x0 = Math.max(1, Math.floor(cx0 / CELL)), x1 = Math.min(GW - 2, Math.ceil(cx1 / CELL)), y0 = Math.max(1, Math.floor(cy0 / CELL)), y1 = Math.min(GH - 2, Math.ceil(cy1 / CELL)), tot = 0;
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { var i = y * GW + x, d = fn(x * CELL, y * CELL); if (d > 0) { W[i] += d; S1[i] += d * LQ.c1 * conc; S2[i] += d * LQ.c2 * conc; tot += d; } }
    return tot;
  }
  function settle(cx0, cy0, cx1, cy1, tot, spread) { var m = spread / CELL; simulate(cx0 / CELL - m, cy0 / CELL - m, cx1 / CELL + m, cy1 / CELL + m, tot); }

  var footR = { 'Mug': [3.1, 3.9], 'Cup': [2.4, 2.9], 'Espresso Cup': [1.9, 2.3], 'Wine Glass': [3.2, 3.8], 'Tumbler': [2.8, 3.4] }[vessel];
  var ringW = { 'Mug': 0.15, 'Cup': 0.12, 'Espresso Cup': 0.1, 'Wine Glass': 0.065, 'Tumbler': 0.11 }[vessel];
  var spread = 1.4 + PP.K * 1.8;
  function ring(cx, cy, Rf, opt) {
    opt = opt || {}; var tilt = RV.range(0, 6.283), tiltA = RV.range(0.45, 1.0), arc = opt.arc || 1, arcC = RV.range(0, 6.283), wob = RV.range(0, 100), wet = RV.range(0.7, 1.25) * (opt.wet || 1);
    var hw = ringW * RV.range(0.8, 1.3);
    var tot = pour(cx - Rf - 0.5, cy - Rf - 0.5, cx + Rf + 0.5, cy + Rf + 0.5, function (x, y) {
      var dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy), th = Math.atan2(dy, dx);
      var rr = Rf * (1 + 0.006 * PX.vnoise(th * 3, wob, 3));
      var side = 1 - tiltA + tiltA * 1.8 * Math.pow(Math.max(0, 0.5 + 0.5 * Math.cos(th - tilt)), 1.6);     // the cup rarely sits level; one side carries more
      if (arc < 1) { var da = Math.abs(((th - arcC + 9.42478) % 6.28318) - 3.14159); side *= sstep(arc * 3.14159, arc * 3.14159 - 0.6, da); }
      var u = (r - rr) / hw; if (Math.abs(u) > 1.6) return 0;
      return wet * 1.7 * side * Math.exp(-u * u * 1.6) * (0.85 + 0.3 * PX.vnoise(th * 9, wob + 3, 5));
    }, 1);
    if (opt.drip) { var a = opt.dripA, dr = Rf + RV.range(0.05, 0.25), dx = cx + Math.cos(a) * dr, dy = cy + Math.sin(a) * dr, rd = RV.range(0.22, 0.38);
      tot += pour(dx - 0.6, dy - 0.6, dx + 0.6, dy + 0.6, function (x, y) { var q = Math.hypot(x - dx, y - dy) / rd; return q < 1 ? 3.2 * Math.sqrt(1 - q * q) : 0; }, 1.2); }
    settle(cx - Rf, cy - Rf, cx + Rf, cy + Rf, tot, spread);
  }

  // ---------------- the afternoon ----------------
  var nV = { 'Once': 1, 'Twice': 2, 'A Few': RV.int(3, 4), 'All Afternoon': RV.int(7, 10), 'Moved Twice': 3 }[visits];
  if (incident === 'Tea Bag' && nV > 3) nV = 3;
  // where the hand returns: off-centre, sometimes off the sheet's edge
  var hx = RV.pick([0.3, 0.36, 0.64, 0.7]) * CMW + RV.gaussian(0, 1.5), hy = RV.pick([0.32, 0.4, 0.62, 0.7]) * CMH + RV.gaussian(0, 1.8);
  if (RV.chance(0.15)) hx = RV.chance(0.5) ? RV.range(0.5, 2.5) : CMW - RV.range(0.5, 2.5);
  var sd = nV > 5 ? 2.2 : 1.2, placed = [];
  var dripOn = incident === 'A Drip' ? RV.int(0, nV - 1) : -1, dripA = RV.range(0, 6.283);
  for (var v = 0; v < nV; v++) {
    var px = hx + RV.gaussian(0, sd), py = hy + RV.gaussian(0, sd);
    if (visits === 'Moved Twice' && v > 0) { px = hx + (v === 1 ? 1 : -1) * RV.range(5, 8); py = hy + RV.range(-6, 6); }
    var Rf = RV.range(footR[0], footR[1]); if (v > 0 && RV.chance(0.75)) Rf = placed[0][2];   // same cup, mostly
    var arc = RV.chance(0.25) ? RV.range(0.35, 0.8) : 1, wet = v === nV - 1 ? 1 : RV.range(0.5, 1.1);
    if (incident === 'Slid' && v === nV - 1) {
      var ang = RV.range(0, 6.283), L = RV.range(0.8, 2.2), steps = 7;
      for (var s2 = 0; s2 < steps; s2++) { var t = s2 / (steps - 1); pour(px + Math.cos(ang) * L * t - Rf - 0.4, py + Math.sin(ang) * L * t - Rf - 0.4, px + Math.cos(ang) * L * t + Rf + 0.4, py + Math.sin(ang) * L * t + Rf + 0.4, (function (ox, oy) { return function (x, y) { var u = (Math.hypot(x - ox, y - oy) - Rf) / ringW; return Math.abs(u) > 1.6 ? 0 : 0.5 * Math.exp(-u * u * 2); }; })(px + Math.cos(ang) * L * t, py + Math.sin(ang) * L * t), 1); }
      settle(px - Rf - L, py - Rf - L, px + Rf + L, py + Rf + L, 1000, spread);
    } else ring(px, py, Rf, { arc: arc, wet: wet, drip: v === dripOn, dripA: dripA });
    placed.push([px, py, Rf]);
  }
  var last = placed[placed.length - 1];
  if (incident === 'Spoon Set Down' || incident === 'Tea Bag') {
    var a0 = RV.range(0, 6.283), dd = last[2] + RV.range(2.5, 5), sx = clamp(last[0] + Math.cos(a0) * dd, 3, CMW - 3), sy = clamp(last[1] + Math.sin(a0) * dd, 3, CMH - 3), rot = RV.range(0, 3.14);
    var ca = Math.cos(rot), sa = Math.sin(rot);
    if (incident === 'Spoon Set Down') {
      var tot2 = pour(sx - 6, sy - 6, sx + 6, sy + 6, function (x, y) { var u = (x - sx) * ca + (y - sy) * sa, w = -(x - sx) * sa + (y - sy) * ca;
        var bowl = (u / 1.5) * (u / 1.5) + (w / 0.95) * (w / 0.95); if (bowl < 1) return 1.6 * Math.pow(1 - bowl, 0.6) * (u > 0 ? 1 : 0.7);
        if (u < -1.2 && u > -5.5 && Math.abs(w) < 0.16 - (u + 1.2) * -0.008) return 0.5; return 0; }, 1.1);
      settle(sx - 6, sy - 6, sx + 6, sy + 6, tot2, spread);
    } else {
      var tot3 = pour(sx - 4, sy - 4, sx + 4, sy + 4, function (x, y) { var u = (x - sx) * ca + (y - sy) * sa, w = -(x - sx) * sa + (y - sy) * ca;
        var q = Math.pow(Math.abs(u) / 2.6, 4) + Math.pow(Math.abs(w) / 2.1, 4); return q < 1 ? 3.0 * (1 - q) : 0; }, 1.6);
      settle(sx - 4, sy - 4, sx + 4, sy + 4, tot3, spread * 1.3);
    }
  }
  if (incident === 'Splashed') {
    var ang2 = RV.range(0, 6.283), n = RV.int(3, 7);
    for (var k2 = 0; k2 < n; k2++) { var dist = last[2] + RV.pareto(0.8, 1.6), aa = ang2 + RV.gaussian(0, 0.35), qx = last[0] + Math.cos(aa) * dist, qy = last[1] + Math.sin(aa) * dist, qr = RV.range(0.08, 0.3) / Math.sqrt(1 + dist * 0.2);
      var t4 = pour(qx - 0.5, qy - 0.5, qx + 0.5, qy + 0.5, function (x, y) { var u = Math.hypot(x - qx, y - qy) / qr; return u < 1 ? 3 * Math.sqrt(1 - u * u) : 0; }, 1);
      settle(qx - 0.5, qy - 0.5, qx + 0.5, qy + 0.5, t4, spread * 0.6); }
  }

  // ---------------- render ----------------
  var o = PX.canvas(C, VW, VH, '#1a1814'), PW = o.PW, PH = o.PH, R0 = new Float32Array(PW * PH), G0 = new Float32Array(PW * PH), B0 = new Float32Array(PW * PH);
  // cockle: the sheet buckles where it was wet; light from a window on one side
  var D1b = PX.blur(Float32Array.from(D1), GW, GH, 0.5), D2b = PX.blur(Float32Array.from(D2), GW, GH, 0.6);
  var Hc = new Float32Array(N); for (var q = 0; q < N; q++) Hc[q] = Math.min(WM[q], 1.2); PX.blur(Hc, GW, GH, 14);
  var la = RP.range(-2.6, -0.6), lx = Math.cos(la), ly = Math.sin(la);
  var base = PX.col(PP.base), rule = PX.col('#8fb0d6'), margin = PX.col('#de8f8f'), grid = PX.col('#a9cbb8');
  var cmPerPx = CMW / PW, odK = 1.15;
  for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
    var I = py2 * PW + px2, X = px2 * cmPerPx, Y = py2 * cmPerPx, gx = X / CELL, gy = Y / CELL;
    var d1 = PX.bil(D1b, GW, GH, gx, gy), d2 = PX.bil(D2b, GW, GH, gx, gy);
    var floc = PX.fbm(X * 2.2, Y * 2.2, pseed, 4) * 0.5 + 0.5, fib = PX.vnoise(X * 18, Y * 4, pseed + 9), fine = PX.vnoise(X * 60, Y * 14, pseed + 21);
    var tooth = PX.fbm(X * 14, Y * 14, pseed + 40, 3) * PP.tooth;
    var r = base[0], g = base[1], b = base[2];
    var pv = 1 + 0.025 * (floc - 0.5) + 0.02 * fib * PP.tooth + 0.012 * fine; r *= pv; g *= pv; b *= pv;
    if (paper === 'Kraft') { var kf = 0.06 * fine + 0.05 * (floc - 0.5); r *= 1 + kf; g *= 1 + kf; b *= 1 + kf * 1.2; }
    // printed rules (ink sits on the sizing, so the stain darkens over it but the line stays)
    var ink = 0, inkC = rule;
    if (paper === 'Notepad') { var ry = (Y - 3.2) % 0.71; if (Y > 3.2) ink = Math.max(0, 1 - Math.abs(ry - 0.355 + 0.355) / 0.018) * 0; var dy = Math.abs(((Y - 3.2) % 0.71 + 0.71) % 0.71); ink = Y > 3.0 ? Math.max(0, 1 - Math.min(dy, 0.71 - dy) / (0.016 + cmPerPx * 0.5)) * 0.75 : 0;
      var dm = Math.abs(X - 3.1); if (dm < 0.02 + cmPerPx * 0.5) { ink = 0.7; inkC = margin; } }
    if (paper === 'Graph Pad') { var gx2 = ((X - 0.7) % 0.5 + 0.5) % 0.5, gy2 = ((Y - 0.4) % 0.5 + 0.5) % 0.5, dg = Math.min(gx2, 0.5 - gx2, gy2, 0.5 - gy2); ink = Math.max(0, 1 - dg / (0.012 + cmPerPx * 0.5)) * 0.55; inkC = grid; }
    if (ink > 0) { ink *= 0.75 + 0.25 * (fib * 0.5 + 0.5); r = lerp(r, r * inkC[0] / 0.8, ink); g = lerp(g, g * inkC[1] / 0.8, ink); b = lerp(b, b * inkC[2] / 0.8, ink); }
    if (paper === 'Napkin') { var u2 = (X + Y) / 1.1, v2 = (X - Y) / 1.1, eu = Math.abs(u2 - Math.round(u2)), ev = Math.abs(v2 - Math.round(v2)), em = Math.min(eu, ev); var emb = sstep(0.07, 0.0, em); r *= 1 - 0.09 * emb; g *= 1 - 0.09 * emb; b *= 1 - 0.08 * emb; }
    // stain: absorbance lives in the fibres, so it is patchy at fibre scale
    var fibW = 0.78 + 0.22 * (floc) + 0.18 * fib;
    var od1 = d1 * odK * fibW, od2 = d2 * odK * (0.85 + 0.3 * floc);
    r *= Math.exp(-(od1 * LQ.a1[0] + od2 * LQ.a2[0])); g *= Math.exp(-(od1 * LQ.a1[1] + od2 * LQ.a2[1])); b *= Math.exp(-(od1 * LQ.a1[2] + od2 * LQ.a2[2]));
    // light: window falloff + cockle + tooth relief
    var hL = PX.bil(Hc, GW, GH, gx - 1, gy), hR = PX.bil(Hc, GW, GH, gx + 1, gy), hU = PX.bil(Hc, GW, GH, gx, gy - 1), hD = PX.bil(Hc, GW, GH, gx, gy + 1);
    var nx = (hL - hR) * 2.2, ny = (hU - hD) * 2.2;
    var tx = PX.fbm((X + 0.02) * 14, Y * 14, pseed + 40, 3) * PP.tooth - tooth, ty = PX.fbm(X * 14, (Y + 0.02) * 14, pseed + 40, 3) * PP.tooth - tooth;
    var sh = 1 + (nx * lx + ny * ly) * 1.0 - (tx * lx + ty * ly) * 0.9;
    var win = 0.9 + 0.12 * ((X / CMW - 0.5) * lx + (Y / CMH - 0.5) * ly) * -1;
    var L = sh * win * 0.92;
    R0[I] = r * L * 1.0; G0[I] = g * L * 0.985; B0[I] = b * L * 0.96;
  }
  C.features({ Liquid: liquid, Paper: paper, Visits: visits, Vessel: vessel, Incident: incident });
  PX.finish(o, R0, G0, B0, { grain: 0.01, vig: 0.22, seed: 7 });
  C.done(o.cv.canvas, 'tidelines');
})();

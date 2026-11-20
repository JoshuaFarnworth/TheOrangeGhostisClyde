/* Twenty Nanometres (v3), by Clyde (2026).
 * Font: glyph outlines from Old Standard TT, Copyright 2011 The Old Standard Project Authors,
 * licensed under the SIL Open Font License 1.1 (see OFL-OldStandardTT.txt).
 * The gap is the subject. Two unequal, cropped branching fields face each other across an empty cleft.
 * A signal comes down one, jumps the gap (dielectric-breakdown growth on a Laplace field) and leaves a
 * consequence in the other: a wave of activation that only makes the word legible where it has passed. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), T0 = Date.now(), TT = function (l) { if (window.__dbg) console.log(l, Date.now() - T0); };
  var RW = R.fork('word'), RG = R.fork('growth'), RD = R.fork('discharge'), RM = R.fork('medium'), RB = R.fork('background'), RC = R.fork('cleft');
  var NZ = C.noise(RM.fork('noise'));
  var VW = 1000, VH = 1250, PI = Math.PI, TAU = PI * 2;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  var Q = C.platform === 'standalone' ? C.query : null;

  // ======================= traits =======================
  var register = RW.weighted([['Alarm', 26], ['Attachment', 24], ['Loss', 22], ['Want', 14], ['Summons', 14]]);
  var entry = RW.weighted(LEX[register].map(function (e) { return [e, e[1]]; }));
  var stain = RM.weighted([['Darkfield', 56], ['Brightfield', 44]]);
  var trans = RD.weighted({
    'Alarm': [['Storm', 50], ['Crossed', 50]], 'Attachment': [['Crossed', 85], ['Repeated', 15]],
    'Loss': [['Failed', 60], ['Near Miss', 40]], 'Want': [['Repeated', 70], ['Crossed', 30]], 'Summons': [['Train', 80], ['Failed', 20]]
  }[register]);
  var moment = RD.weighted([['Arrival', 30], ['Spread', 45], ['Afterglow', 25]]);
  if (Q) {
    if (Q.get('word')) { for (var rg in LEX) LEX[rg].forEach(function (e) { if (e[0] === Q.get('word').toUpperCase()) { entry = e; register = rg; } }); }
    if (Q.get('stain')) stain = Q.get('stain'); if (Q.get('trans')) trans = Q.get('trans'); if (Q.get('moment')) moment = Q.get('moment');
  }
  var word = entry[0], valence = entry[2], arousal = entry[3];
  var chargeV = arousal + RD.gaussian(0, 0.55);
  var charge = chargeV < 4.6 ? 'Faint' : chargeV < 6.2 ? 'Steady' : 'Violent';
  var crowd = RB.weighted([['Sparse', 45], ['Neighbours', 40], ['Thicket', 15]]);
  var failed = trans === 'Failed', nearMiss = trans === 'Near Miss';
  if (failed || nearMiss) moment = moment === 'Afterglow' ? 'Afterglow' : 'Arrival';
  // register shapes both networks and the consequence (artistic mapping, not physiology)
  var P = {
    'Alarm':      { leaf: 0.55, wob: 0.30, spine: 1.5, head: 0.75, bead: 0, gap: 0.9, eta: 0.9, tail: 70, sig: 26, swell: 0.9, flick: 1 },
    'Attachment': { leaf: 0.95, wob: 0.10, spine: 0.8, head: 0.95, bead: 0, gap: 0.75, eta: 1.8, tail: 260, sig: 70, swell: 0.6, flick: 0 },
    'Loss':       { leaf: 0.70, wob: 0.16, spine: 0.4, head: 0.7, bead: 1, gap: 1.35, eta: 1.2, tail: 80, sig: 30, swell: 0.2, flick: 0 },
    'Want':       { leaf: 0.80, wob: 0.18, spine: 1.2, head: 1.3, bead: 0, gap: 0.9, eta: 1.35, tail: 150, sig: 45, swell: 1.6, flick: 0 },
    'Summons':    { leaf: 0.65, wob: 0.20, spine: 1.0, head: 0.85, bead: 0, gap: 1.0, eta: 1.15, tail: 90, sig: 30, swell: 0.7, flick: 0.5 }
  }[register];

  // ======================= the word as vector glyphs =======================
  function parsePath(d) {   // font units -> array of polygons (flattened)
    var polys = [], cur = null, t = d.match(/[MLQCZ]|-?\d+/g), i = 0, cx = 0, cy = 0, cmd;
    function num() { return +t[i++]; }
    while (i < t.length) {
      if (/[MLQCZ]/.test(t[i])) cmd = t[i++];
      if (cmd === 'M') { cx = num(); cy = num(); cur = [cx, cy]; polys.push(cur); cmd = 'L'; }
      else if (cmd === 'L') { cx = num(); cy = num(); cur.push(cx, cy); }
      else if (cmd === 'Q') { var qx = num(), qy = num(), ex = num(), ey = num(); for (var s = 1; s <= 6; s++) { var u = s / 6, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; cur.push(a * cx + b * qx + c * ex, a * cy + b * qy + c * ey); } cx = ex; cy = ey; }
      else if (cmd === 'C') { var ax = num(), ay = num(), bx = num(), by = num(), dx = num(), dy = num(); for (var s2 = 1; s2 <= 8; s2++) { var w = s2 / 8, m = 1 - w; cur.push(m * m * m * cx + 3 * m * m * w * ax + 3 * m * w * w * bx + w * w * w * dx, m * m * m * cy + 3 * m * m * w * ay + 3 * m * w * w * by + w * w * w * dy); } cx = dx; cy = dy; }
      else if (cmd === 'Z') { cmd = null; }
    }
    return polys;
  }
  function layout(fontKey, str, em, ox, oy, rot, track) {   // returns letters with polygons in virtual units (y down)
    var F = FONT[fontKey], s = em / F.upm, pen = 0, letters = [], k, w = 0;
    for (k = 0; k < str.length; k++) { var g = F.g[str[k]] || F.g[' ']; w += g[0] * s + (k < str.length - 1 ? track * em : 0); }
    var cr = Math.cos(rot), sr = Math.sin(rot);
    for (k = 0; k < str.length; k++) {
      var g2 = F.g[str[k]] || F.g[' '], polys = g2[1] ? parsePath(g2[1]) : [], out = [], bb = [1e9, 1e9, -1e9, -1e9];
      polys.forEach(function (pl) {
        var q = new Float32Array(pl.length);
        for (var j = 0; j < pl.length; j += 2) {
          var lx = pen + pl[j] * s - w / 2, ly = -pl[j + 1] * s;
          var X = ox + lx * cr - ly * sr, Y = oy + lx * sr + ly * cr;
          q[j] = X; q[j + 1] = Y; bb[0] = Math.min(bb[0], X); bb[1] = Math.min(bb[1], Y); bb[2] = Math.max(bb[2], X); bb[3] = Math.max(bb[3], Y);
        }
        out.push(q);
      });
      if (out.length) letters.push({ ch: str[k], polys: out, bb: bb, cx: (bb[0] + bb[2]) / 2 });
      pen += g2[0] * s + track * em;
    }
    return { letters: letters, width: w };
  }
  function inside(letter, x, y) {   // nonzero winding
    var b = letter.bb; if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) return false;
    var wn = 0;
    letter.polys.forEach(function (q) {
      var n = q.length;
      for (var j = 0; j < n; j += 2) {
        var x1 = q[j], y1 = q[j + 1], x2 = q[(j + 2) % n], y2 = q[(j + 3) % n];
        if (y1 <= y) { if (y2 > y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) > 0) wn++; }
        else if (y2 <= y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) < 0) wn--;
      }
    });
    return wn !== 0;
  }

  // ======================= space colonisation (Runions et al. 2007), incremental nearest =======================
  function colonize(Rg, roots, AX, AY, AK, o) {
    var NA = AX.length, D = o.step, DI = o.di, DI2 = DI * DI;
    var AN = new Int32Array(NA).fill(-1), AD = new Float32Array(NA).fill(DI2), alive = new Uint8Array(NA).fill(1);
    var CG = DI, CW = Math.ceil(VW * 1.4 / CG) + 2, CH = Math.ceil(VH * 1.4 / CG) + 2, buck = [];
    for (var i = 0; i < CW * CH; i++) buck.push([]);
    function cell(x, y) { return clamp(Math.floor((x + VW * 0.2) / CG), 0, CW - 1) + clamp(Math.floor((y + VH * 0.2) / CG), 0, CH - 1) * CW; }
    for (i = 0; i < NA; i++) buck[cell(AX[i], AY[i])].push(i);
    var NX = [], NY = [], NP = [], NB = [], nAlive = NA;
    function add(x, y, p, br) {
      var id = NX.length; NX.push(x); NY.push(y); NP.push(p); NB.push(br);
      var cx = clamp(Math.floor((x + VW * 0.2) / CG), 0, CW - 1), cy = clamp(Math.floor((y + VH * 0.2) / CG), 0, CH - 1);
      for (var yy = Math.max(0, cy - 1); yy <= Math.min(CH - 1, cy + 1); yy++) for (var xx = Math.max(0, cx - 1); xx <= Math.min(CW - 1, cx + 1); xx++) {
        var L = buck[yy * CW + xx];
        for (var j = 0; j < L.length; j++) {
          var a = L[j]; if (!alive[a]) continue;
          var dx = AX[a] - x, dy = AY[a] - y, d2 = dx * dx + dy * dy;
          if (d2 < AK[a] * AK[a]) { alive[a] = 0; nAlive--; continue; }
          if (d2 < AD[a]) { AD[a] = d2; AN[a] = id; }
        }
      }
      return id;
    }
    roots.forEach(function (r) { add(r[0], r[1], r[2] == null ? -1 : r[2], r[3] || 0); });
    var sx = new Float32Array(o.maxNodes + 10), sy = new Float32Array(o.maxNodes + 10), cn = new Uint16Array(o.maxNodes + 10);
    for (var it = 0; it < o.iters && nAlive > 0 && NX.length < o.maxNodes; it++) {
      var act = [];
      for (var a = 0; a < NA; a++) {
        if (!alive[a] || AN[a] < 0) continue;
        var n = AN[a], dx = AX[a] - NX[n], dy = AY[a] - NY[n], l = Math.sqrt(dx * dx + dy * dy) + 1e-6;
        if (!cn[n]) act.push(n); sx[n] += dx / l; sy[n] += dy / l; cn[n]++;
      }
      if (!act.length) { if (window.__dbg) console.log("noact", it); break; }
      for (var q = 0; q < act.length && NX.length < o.maxNodes; q++) {
        var m = act[q], vx = sx[m] / cn[m], vy = sy[m] / cn[m], vl = Math.hypot(vx, vy);
        if (vl < 0.2) { var an = Rg.range(0, TAU); vx += Math.cos(an) * 0.3; vy += Math.sin(an) * 0.3; }
        var tf = o.tf ? o.tf(NX[m], NY[m]) : 1, w = o.wob * (o.wf ? o.wf(NX[m], NY[m]) : 1), nx = vx / (vl + 1e-6) + o.tx * tf + Rg.gaussian(0, w), ny = vy / (vl + 1e-6) + o.ty * tf + Rg.gaussian(0, w), nl = Math.hypot(nx, ny) + 1e-6;
        sx[m] = 0; sy[m] = 0; cn[m] = 0;
        add(NX[m] + nx / nl * D, NY[m] + ny / nl * D, m, NB[m]);
      }
    }
    if (window.__dbg) console.log("colonize", it, nAlive, NA, NX.length);
    return { x: NX, y: NY, p: NP, b: NB };
  }
  // pipe-model radii (Murray-like exponent), smoothing; returns per-node radius
  function radii(T, leaf, cap, expn) {
    var n = T.x.length, r = new Float32Array(n), ch = new Uint16Array(n), i;
    for (i = 0; i < n; i++) if (T.p[i] >= 0) ch[T.p[i]]++;
    var acc = new Float32Array(n);
    for (i = n - 1; i >= 0; i--) {
      var v = ch[i] === 0 ? Math.pow(leaf, expn) : acc[i];
      r[i] = Math.pow(v, 1 / expn); if (T.p[i] >= 0) acc[T.p[i]] += v;
    }
    for (i = 0; i < n; i++) r[i] = Math.min(cap, r[i]);
    for (var pass = 0; pass < 3; pass++) for (i = 0; i < n; i++) {   // smooth unbranched runs
      var p = T.p[i]; if (p < 0 || ch[i] !== 1 || ch[p] > 1) continue;
      var c = -1; for (var j = i + 1; j < Math.min(n, i + 4000); j++) if (T.p[j] === i) { c = j; break; }
      if (c < 0) continue; T.x[i] = 0.5 * T.x[i] + 0.25 * (T.x[p] + T.x[c]); T.y[i] = 0.5 * T.y[i] + 0.25 * (T.y[p] + T.y[c]);
    }
    T.ch = ch; return r;
  }


  // ======================= the cleft: negative space as the organising idea =======================
  // a gently bent band in any orientation, off-centre; one side receives (post), the other sends (pre)
  var spots = [[0.36, 0.38], [0.64, 0.38], [0.36, 0.64], [0.64, 0.64], [0.5, 0.33], [0.5, 0.68], [0.32, 0.5], [0.68, 0.5]];
  var sp0 = RC.pick(spots), P0 = [VW * (sp0[0] + RC.range(-0.05, 0.05)), VH * (sp0[1] + RC.range(-0.05, 0.05))];
  var ang = RC.weighted([[RC.range(0.42, 1.15) * (RC.rand() < 0.5 ? 1 : -1), 50], [RC.gaussian(0, 0.2), 22], [PI / 2 + RC.gaussian(0, 0.2), 28]]);
  var TX = Math.cos(ang), TY = Math.sin(ang), NX0 = -TY, NY0 = TX;
  var bend = RC.gaussian(0, 0.0006), postS = RC.rand() < 0.5 ? 1 : -1;
  var cleftW = RC.range(70, 135) * P.gap;
  var preBig = RC.rand() < 0.28;
  var lPost = preBig ? RC.range(260, 420) : RC.range(360, 640), dPost = preBig ? RC.range(220, 380) : RC.range(320, 700);
  var lPre = preBig ? RC.range(380, 620) : RC.range(180, 340), dPre = preBig ? RC.range(320, 620) : RC.range(170, 320);
  var sPost = RC.range(-140, 140), sPre = sPost + RC.range(-120, 120);
  function cc(x, y) {   // cleft coordinates: s along the cleft, n signed distance across (post side positive)
    var dx = x - P0[0], dy = y - P0[1], s = dx * TX + dy * TY, n = dx * NX0 + dy * NY0 - bend * s * s;
    return [s, postS * n / Math.sqrt(1 + 4 * bend * bend * s * s)];
  }
  function wp(s, n) { var nn = n * postS + bend * s * s; return [P0[0] + TX * s + NX0 * nn, P0[1] + TY * s + NY0 * nn]; }   // cleft coords -> world
  var hw = cleftW / 2;

  // ----- the word: laid along the receiving shore, parallel to the cleft -----
  var TRK = 0.13;
  function advOf(str) { var a = 0, F = FONT.B; for (var k = 0; k < str.length; k++) a += (F.g[str[k]] || F.g[' '])[0] / F.upm + TRK; return a; }
  var adv = advOf(word);
  var em = clamp(Math.min(lPost * 2.0, 840) / adv, 100, 240);
  var rot = Math.atan2(TY, TX); if (rot > PI / 2) rot -= PI; if (rot <= -PI / 2) rot += PI;
  var sW = sPost + RC.range(-0.2, 0.2) * em * adv, nW = hw + RC.range(22, 60) + em * 0.36;
  var TXT, wcx, wcy, capTop;
  function placeWord() {
    var c = wp(sW, nW); wcx = c[0]; wcy = c[1];
    var dnx = -Math.sin(rot), dny = Math.cos(rot);
    TXT = layout('B', word, em, wcx + dnx * em * 0.35, wcy + dny * em * 0.35, rot, TRK);
    var bb = [1e9, 1e9, -1e9, -1e9]; TXT.letters.forEach(function (L) { bb[0] = Math.min(bb[0], L.bb[0]); bb[1] = Math.min(bb[1], L.bb[1]); bb[2] = Math.max(bb[2], L.bb[2]); bb[3] = Math.max(bb[3], L.bb[3]); }); TXT.bb = bb;
  }
  for (var tries = 0; tries < 6; tries++) {   // keep the word inside the frame by sliding the whole cleft
    placeWord(); var b0 = TXT.bb, sx = 0, sy = 0, m = 60;
    if (b0[0] < m) sx = m - b0[0]; if (b0[2] > VW - m) sx = VW - m - b0[2]; if (b0[1] < m) sy = m - b0[1]; if (b0[3] > VH - m) sy = VH - m - b0[3];
    if (b0[2] - b0[0] > VW - 2 * m || b0[3] - b0[1] > VH - 2 * m) { em *= 0.85; continue; }
    if (!sx && !sy) break; P0[0] += sx; P0[1] += sy;
  }
  placeWord();
  var letters = TXT.letters;
  function inWord(x, y) { for (var k = 0; k < letters.length; k++) if (inside(letters[k], x, y)) return true; return false; }
  var GS = 4, GW = Math.ceil(VW / GS), GH = Math.ceil(VH / GS), WM = new Uint8Array(GW * GH);
  (function () { var b = TXT.bb; for (var gy = Math.max(0, Math.floor(b[1] / GS) - 2); gy < Math.min(GH, Math.ceil(b[3] / GS) + 2); gy++) for (var gx = Math.max(0, Math.floor(b[0] / GS) - 2); gx < Math.min(GW, Math.ceil(b[2] / GS) + 2); gx++) if (inWord((gx + 0.5) * GS, (gy + 0.5) * GS)) WM[gy * GW + gx] = 1; })();
  var DW = C.edt(WM, GW, GH);
  if (window.__dbg) { var wmc = 0; for (var q8 = 0; q8 < WM.length; q8++) wmc += WM[q8]; console.log('WM', (rot*180/PI).toFixed(0), (ang*180/PI).toFixed(0), postS, wmc, JSON.stringify(TXT.bb.map(Math.round)), letters.length, letters[0] && letters[0].polys.length, letters[0] && JSON.stringify(letters[0].bb)); }
  function dWord(x, y) { if (x < 0 || y < 0 || x >= VW || y >= VH) return 999; return DW[(y / GS | 0) * GW + (x / GS | 0)] * GS; }

  var objective = 'x20';
  C.features({ Word: word, Register: register, Stain: stain, Transmission: trans, Moment: moment, Charge: charge, Section: crowd, Field: preBig ? 'Sender Dominant' : 'Receiver Dominant' });
  if (Q && Q.get('traitsonly')) { window.__clyde = { features: C._features }; return; }

  // ======================= geometry store =======================
  var SEG = []; // [x1,y1,r1,x2,y2,r2,z,dens,act]
  function seg(x1, y1, r1, x2, y2, r2, z, d, a) { SEG.push(x1, y1, r1, x2, y2, r2, z, d, a || 0); }
  function smoothZ(T, zf) { var ZS = new Float32Array(T.x.length); for (var i = 0; i < T.x.length; i++) { var zt = zf(T.x[i], T.y[i], T.b[i], i), p = T.p[i]; ZS[i] = p < 0 ? zt : ZS[p] + (zt - ZS[p]) * 0.22; } return ZS; }
  function tube(T, r, ZS, dens, o) {   // emit a tree as capsules + spines; o.act = per-node activation, o.swell
    o = o || {}; var A = o.act;
    for (var i = 0; i < T.x.length; i++) {
      var p = T.p[i]; if (p < 0) continue;
      var z = ZS[i], d = dens, a = A ? A[i] : 0, ap = A ? A[p] : 0, sw = 1 + (o.swell || 0) * a * 0.35;
      if (o.bead) {   // beaded, broken branches
        var bn = NZ.n2(T.x[i] * 0.09, T.y[i] * 0.09);
        if (r[i] < 1.6 && bn > 0.5) continue;
        if (r[i] < 2 && ((i * 2654435761) >>> 0) % 7 === 0) seg(T.x[i], T.y[i], r[i] * 2.4, T.x[i], T.y[i], r[i] * 2.4, z, d, a);
      }
      var rw = o.rwI ? o.rwI(i) : 1, rwp = o.rwI ? o.rwI(p) : 1;
      seg(T.x[p], T.y[p], r[p] * rwp * (1 + (o.swell || 0) * ap * 0.35), T.x[i], T.y[i], r[i] * rw * sw, z, d, (a + ap) / 2);
      if (o.spine && r[i] < 2.2 && T.ch[p] < 2) {
        var len = Math.hypot(T.x[i] - T.x[p], T.y[i] - T.y[p]), ns = len * o.spine * 0.22 * (o.sf ? o.sf(T.x[i], T.y[i]) : 1);
        var Rs = o.R; while (ns > 0) {
          if (Rs.rand() < ns) {
            var t = Rs.rand(), bx = lerp(T.x[p], T.x[i], t), by = lerp(T.y[p], T.y[i], t), tx = (T.x[i] - T.x[p]) / (len + 1e-6), ty = (T.y[i] - T.y[p]) / (len + 1e-6);
            var sg = Rs.rand() < 0.5 ? -1 : 1, an = Rs.gaussian(0, 0.5), nx = -ty * sg, ny = tx * sg, ca = Math.cos(an), sa = Math.sin(an);
            var dx = nx * ca - ny * sa, dy = nx * sa + ny * ca, sl = Rs.range(1.4, 3.4) * (0.7 + 0.3 * r[i]), hx = bx + dx * sl, hy = by + dy * sl;
            var hs = o.head * Rs.range(0.55, 1.1) * (1 + (o.swell || 0) * a);   // spines swell where the wave has passed
            seg(bx, by, 0.32, hx, hy, 0.28, z, d * 0.95, a); seg(hx, hy, hs, hx, hy, 0, z, d * 0.95, a * 1.15);
          }
          ns -= 1;
        }
      }
    }
  }

  // ======================= the two fields =======================
  var gScale = 1;
  // receiving field: densest at its shore, falling off inland and laterally; denser inside the word
  var AX = [], AY = [], AK = [], Ra = RG.fork('attr');
  function fieldPts(R2, sC, lat, dep, sign, n, kill, out) {
    for (var t = 0; t < n * 6 && out.cnt < n; t++) {
      var s = sC + R2.gaussian(0, lat * 0.6), d = hw + Math.abs(R2.gaussian(0, dep * 0.55)) + R2.range(0, 12);
      var q = wp(s, d * sign); if (q[0] < -160 || q[1] < -160 || q[0] > VW + 160 || q[1] > VH + 160) continue;
      var shore = 0.35 + 0.65 * Math.exp(-(d - hw) / 90);
      if (R2.rand() > shore) continue;
      if (sign > 0) { var dw0 = dWord(q[0], q[1]); if (dw0 < 26 || (dw0 < 80 && R2.rand() < 0.65)) continue; }
      out.x.push(q[0]); out.y.push(q[1]); out.k.push(kill); out.cnt++;
    }
  }
  var dens = { 'Sparse': 1, 'Neighbours': 1.15, 'Thicket': 1.35 }[crowd];
  var postArea = lPost * 2 * dPost, preArea = lPre * 2 * dPre;
  var PO = { x: AX, y: AY, k: AK, cnt: 0 };
  fieldPts(Ra, sPost, lPost, dPost, 1, Math.round(postArea / 520 * dens), 8, PO);
  var inSp = register === 'Loss' ? 5.4 : 4.8;
  (function () {   // the word: jittered grid inside the glyphs + points just inside the outlines (hairlines survive)
    var b = TXT.bb;
    for (var gy = b[1] - 6; gy < b[3] + 6; gy += inSp) for (var gx = b[0] - 6; gx < b[2] + 6; gx += inSp) {
      var x = gx + Ra.range(0, inSp), y = gy + Ra.range(0, inSp);
      if (!inWord(x, y)) continue; if (NZ.n2(x * 0.013 + 50, y * 0.013) < -0.55 && Ra.rand() < 0.3) continue;
      AX.push(x); AY.push(y); AK.push(inSp * 0.7);
    }
    letters.forEach(function (L) {
      L.polys.forEach(function (q) {
        var n = q.length, acc = 0;
        for (var j = 0; j < n; j += 2) {
          var ax = q[j], ay = q[j + 1], bx = q[(j + 2) % n], by = q[(j + 3) % n], sl = Math.hypot(bx - ax, by - ay); acc += sl;
          while (acc > inSp * 1.15) { acc -= inSp * 1.15; var f = 1 - acc / (sl + 1e-9), px = lerp(ax, bx, f), py = lerp(ay, by, f), nx = -(by - ay) / (sl + 1e-9), ny = (bx - ax) / (sl + 1e-9);
            var cx = px + nx * 1.6, cy = py + ny * 1.6; if (!inside(L, cx, cy)) { cx = px - nx * 1.6; cy = py - ny * 1.6; }
            if (inside(L, cx, cy) && Ra.rand() < 0.65) { AX.push(cx); AY.push(cy); AK.push(inSp * 0.6); } }
        }
      });
    });
  })();
  // receiving cell body: inland, often outside the frame (the field is cropped)
  var somaP = wp(sPost + RG.range(-0.3, 0.3) * lPost, hw + dPost * RG.range(0.95, 1.45)), somaR = RG.range(16, 22);
  (function () { if (RG.rand() > 0.7) return; var sS = cc(somaP[0], somaP[1])[0], nS = cc(somaP[0], somaP[1])[1];   // crop the receiving cell out of frame
    for (var t = 0; t < 30 && somaP[0] > -30 && somaP[1] > -30 && somaP[0] < VW + 30 && somaP[1] < VH + 30; t++) { nS += 25; somaP = wp(sS, nS); } })();
  (function () {   // guides so every letter and the shore are reachable
    function line(a, b2, st) { var dl = Math.hypot(b2[0] - a[0], b2[1] - a[1]), n = Math.floor(dl / st); for (var j = 1; j < n; j++) { var gx = lerp(a[0], b2[0], j / n) + Ra.gaussian(0, 9), gy = lerp(a[1], b2[1], j / n) + Ra.gaussian(0, 9); if (dWord(gx, gy) > 8 && cc(gx, gy)[1] > hw + 8) { AX.push(gx); AY.push(gy); AK.push(9); } } }
    letters.forEach(function (L) { line(somaP, [L.cx, (L.bb[1] + L.bb[3]) / 2], 24); });
    for (var t = 0; t < 50; t++) { var a2 = Ra.range(0, TAU), r2 = Ra.range(25, 110); var q = [somaP[0] + Math.cos(a2) * r2, somaP[1] + Math.sin(a2) * r2]; if (cc(q[0], q[1])[1] > hw + 10) { AX.push(q[0]); AY.push(q[1]); AK.push(9); } }
  })();
  var roots = [], nPrim = RG.int(4, 7), toC = Math.atan2(wcy - somaP[1], wcx - somaP[0]);
  for (var pr = 0; pr < nPrim; pr++) { var a3 = toC + (pr < nPrim - 2 ? RG.range(-1.1, 1.1) : PI + RG.range(-1, 1)); roots.push([somaP[0] + Math.cos(a3) * somaR * 0.9, somaP[1] + Math.sin(a3) * somaR * 0.9, -1, pr]); }
  var tow = [-NX0 * postS, -NY0 * postS];   // tropism toward the cleft
  var RT = colonize(RG.fork('grow'), roots, new Float32Array(AX), new Float32Array(AY), new Float32Array(AK), { step: 3, di: 52, wob: P.wob, tx: tow[0] * 0.1, ty: tow[1] * 0.1, tf: function (x, y) { return dWord(x, y) < 3 ? 0 : 1; }, wf: function (x, y) { return dWord(x, y) < 3 ? 1.8 : 1; }, iters: 900, maxNodes: 24000 });
  TT('grow post');
  var RR = radii(RT, P.leaf, register === 'Attachment' ? 5 : 4.2, 2.6);
  var primSign = []; for (pr = 0; pr < nPrim; pr++) primSign.push(RG.rand() < 0.5 ? -1 : 1);
  // depth: the plane of focus is the cleft and the word; the fields fall out of focus inland
  var ZR = smoothZ(RT, function (x, y, b) { var d = cc(x, y)[1] - hw, w = dWord(x, y); return primSign[b] * (2.6 * sstep(30, dPost * 0.85, d) * sstep(2, 26, w) + 0.15 * NZ.n2(x * 0.02, y * 0.02)); });

  // sending field: an axon arbour arriving from inland on the other side, ending in boutons at its shore
  var BX = [], BY = [], BK = [], PRO = { x: BX, y: BY, k: BK, cnt: 0 }, Rp = RD.fork('pre');
  fieldPts(Rp, sPre, lPre, dPre, -1, Math.round(preArea / 480 * dens), 9, PRO);
  var preRoot = wp(sPre + Rp.range(-0.4, 0.4) * lPre, -(hw + dPre * Rp.range(1.1, 1.6)));
  (function () {   // the axon's trunk: guides from inland to the shore, plus a couple of collaterals
    var ends = [wp(sPre, -hw - 12)]; for (var c = 0; c < 2; c++) ends.push(wp(sPre + Rp.range(-0.8, 0.8) * lPre, -hw - Rp.range(10, dPre * 0.6)));
    ends.forEach(function (e, ei) { var a = ei ? wp(cc(preRoot[0], preRoot[1])[0] * 0.5 + sPre * 0.5, -(hw + dPre * 0.6)) : preRoot, dl = Math.hypot(e[0] - a[0], e[1] - a[1]), n = Math.floor(dl / 22);
      for (var j = 1; j <= n; j++) { BX.push(lerp(a[0], e[0], j / n) + Rp.gaussian(0, 7)); BY.push(lerp(a[1], e[1], j / n) + Rp.gaussian(0, 7)); BK.push(9); } });
  })();
  var PT = colonize(Rp.fork('grow'), [[preRoot[0], preRoot[1], -1, 0]], new Float32Array(BX), new Float32Array(BY), new Float32Array(BK), { step: 3.5, di: 70, wob: 0.14, tx: -tow[0] * 0.08, ty: -tow[1] * 0.08, iters: 700, maxNodes: 9000 });
  var PR = radii(PT, 0.5, 2.6, 2.4);
  var ZP = smoothZ(PT, function (x, y) { var d = -cc(x, y)[1] - hw; return 2.4 * sstep(20, dPre * 0.9, d) * (NZ.n2(x * 0.004 + 9, y * 0.004) < 0 ? -1 : 1); });
  TT('grow pre');

  // where the signal crosses: boutons at the sender's shore, aimed at the word (or beside it for Near Miss)
  function preShore(sTarget) {   // pre node nearest the cleft near a given position along it
    var best = -1, bs = 1e9;
    for (var i = 0; i < PT.x.length; i++) { var c2 = cc(PT.x[i], PT.y[i]); if (-c2[1] > hw + 45) continue; var sc = Math.abs(c2[0] - sTarget) + Math.max(0, -c2[1] - hw) * 2; if (sc < bs) { bs = sc; best = i; } }
    return best;
  }
  var wordS = letters.map(function (L) { return cc(L.cx, (L.bb[1] + L.bb[3]) / 2)[0]; });
  var wsMin = Math.min.apply(null, wordS), wsMax = Math.max.apply(null, wordS), targetsS = [];
  if (trans === 'Train') { var nb = Math.min(letters.length, RD.int(3, 5)); for (var t2 = 0; t2 < nb; t2++) targetsS.push(lerp(wsMin, wsMax, (t2 + 0.5) / nb)); }
  else if (trans === 'Storm') { var c0 = lerp(wsMin, wsMax, RD.range(0.3, 0.7)); targetsS = [c0 - RD.range(45, 80), c0 + RD.range(-15, 15), c0 + RD.range(45, 80)]; }
  else if (nearMiss) targetsS = [RD.rand() < 0.5 ? wsMin - RD.range(110, 190) : wsMax + RD.range(110, 190)];
  else targetsS = [lerp(wsMin, wsMax, RD.range(0.25, 0.75))];
  var boutons = [];
  targetsS.forEach(function (st) {
    var bi = preShore(st); if (bi < 0) return;
    var bx = PT.x[bi], by = PT.y[bi], c3 = cc(bx, by), bp = wp(c3[0], -hw + 2);   // swell the terminal right at the shore
    if (Math.hypot(bp[0] - bx, bp[1] - by) < 60) { seg(bx, by, 1.0, bp[0], bp[1], 1.0, ZP[bi], 1); bx = bp[0]; by = bp[1]; }
    var tgt = -1, td = 1e9;   // nearest receiving branch across the gap
    for (var i = 0; i < RT.x.length; i++) { var dx = RT.x[i] - bx, dy = RT.y[i] - by, d2 = dx * dx + dy * dy; if (d2 < td && cc(RT.x[i], RT.y[i])[1] > 0 && (!nearMiss || dWord(RT.x[i], RT.y[i]) > 60)) { td = d2; tgt = i; } }
    if (tgt < 0) return;
    boutons.push({ x: bx, y: by, r: RD.range(6, 9) * (register === 'Want' ? 1.25 : 1), tx: RT.x[tgt], ty: RT.y[tgt], node: bi, tmask: nearMiss ? function (i) { return dWord(RT.x[i], RT.y[i]) > 40; } : null });
  });

  // ======================= the crossing: dielectric breakdown (Niemeyer, Pietronero & Wiesmann 1984) =======================
  var SPK = [], VES = [];
  function discharge(Rk, b, run, eta, failAt) {
    var gap = Math.hypot(b.tx - b.x, b.ty - b.y), L = Math.max(150, gap * 2.2), N = 140, h = L / N;
    var ox = (b.x + b.tx) / 2 - L / 2, oy = (b.y + b.ty) / 2 - L / 2;
    var phi = new Float32Array(N * N), fix = new Uint8Array(N * N), tree = new Int32Array(N * N).fill(-2), cand = new Uint8Array(N * N);
    // target: receiving arbour inside the window (segments of kind 0 near z=0 from the receiving tree)
    for (var i = 0; i < RT.x.length; i++) {
      var p = RT.p[i]; if (p < 0 || (b.tmask && !b.tmask(i))) continue; var cx = (RT.x[i] - ox) / h, cy = (RT.y[i] - oy) / h; if (cx < 0 || cy < 0 || cx >= N || cy >= N) continue;
      var rr = Math.max(1, (RR[i] + 1.5) / h);
      for (var yy = Math.max(0, Math.floor(cy - rr)); yy <= Math.min(N - 1, Math.ceil(cy + rr)); yy++) for (var xx = Math.max(0, Math.floor(cx - rr)); xx <= Math.min(N - 1, Math.ceil(cx + rr)); xx++) if ((xx - cx) * (xx - cx) + (yy - cy) * (yy - cy) <= rr * rr) { fix[yy * N + xx] = 2; phi[yy * N + xx] = 1; }
    }
    var bcx = (b.x - ox) / h, bcy = (b.y - oy) / h, br = b.r / h, list = [];
    for (yy = 0; yy < N; yy++) for (xx = 0; xx < N; xx++) {
      var k = yy * N + xx, db = Math.hypot(xx - bcx, yy - bcy);
      if (db <= br && fix[k] !== 2) { fix[k] = 1; phi[k] = 0; tree[k] = -1; list.push(k); }
      else if (!fix[k]) { var dt = Math.hypot(xx - (b.tx - ox) / h, yy - (b.ty - oy) / h); phi[k] = clamp(db / (db + dt + 1e-6), 0, 1); if (xx === 0 || yy === 0 || xx === N - 1 || yy === N - 1) fix[k] = 3; }
    }
    var C8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]], cl = [];
    function addCand(k) { var x = k % N, y = k / N | 0; for (var d = 0; d < 8; d++) { var nx = x + C8[d][0], ny = y + C8[d][1]; if (nx < 1 || ny < 1 || nx >= N - 1 || ny >= N - 1) continue; var nk = ny * N + nx; if (tree[nk] === -2 && fix[nk] !== 2 && !cand[nk]) { cand[nk] = 1; cl.push(nk); } } }
    list.forEach(addCand);
    function relax(n) { for (var s = 0; s < n; s++) for (var y = 1; y < N - 1; y++) for (var x = 1; x < N - 1; x++) { var k = y * N + x; if (fix[k]) continue; var v = (phi[k - 1] + phi[k + 1] + phi[k - N] + phi[k + N]) * 0.25; phi[k] += 1.8 * (v - phi[k]); } }
    relax(60);
    var hit = -1, steps = 0, prog = 0;
    while (steps < 2400) {
      steps++;
      var tot = 0, w = new Float32Array(cl.length);
      for (var c = 0; c < cl.length; c++) { var pv = Math.max(0, phi[cl[c]]); w[c] = Math.pow(pv, eta); tot += w[c]; }
      if (tot <= 0) break;
      var rv = Rk.rand() * tot, pick = cl.length - 1; for (c = 0; c < cl.length; c++) { rv -= w[c]; if (rv < 0) { pick = c; break; } }
      var nk = cl[pick]; cl[pick] = cl[cl.length - 1]; cl.pop(); cand[nk] = 0;
      var x = nk % N, y = nk / N | 0, par = -1, bd = 9;
      for (var d = 0; d < 8; d++) { var qk = (y + C8[d][1]) * N + x + C8[d][0]; if (tree[qk] !== -2) { var dd = d < 4 ? 1 : 1.41; if (dd < bd) { bd = dd; par = qk; } } }
      tree[nk] = par; fix[nk] = 1; phi[nk] = 0;
      var near = false; for (d = 0; d < 8; d++) if (fix[(y + C8[d][1]) * N + x + C8[d][0]] === 2) near = true;
      prog = Math.max(prog, 1 - Math.hypot(x - (b.tx - ox) / h, y - (b.ty - oy) / h) / (gap / h));
      if (near) { hit = nk; break; }
      if (failAt && prog > failAt) break;
      addCand(nk); relax(3);
    }
    // current: descendants; return stroke along the connecting channel
    var cur = new Float32Array(N * N), cells = [];
    for (k = 0; k < N * N; k++) if (tree[k] >= 0) cells.push(k);
    var depth = new Int32Array(N * N); cells.sort(function (a, b) { return a - b; });
    var ordered = [], seen = new Uint8Array(N * N);
    function dep(k) { var n = 0, q = k; while (q >= 0 && n < 5000) { q = tree[q]; n++; } return n; }
    cells.forEach(function (k) { depth[k] = dep(k); }); cells.sort(function (a, b) { return depth[b] - depth[a]; });
    cells.forEach(function (k) { cur[k] += 1; if (tree[k] >= 0) cur[tree[k]] += cur[k]; });
    var main = new Uint8Array(N * N); if (hit >= 0) { var q = hit; while (q >= 0) { main[q] = 1; q = tree[q]; } }
    function jit(k, s) { var u = ((Math.imul(k, 2654435761) + Math.imul(s + run * 7 + 1, 40503)) >>> 0) / 4294967296 - 0.5; return u * 0.95; }
    var JX = new Float32Array(N * N), JY = new Float32Array(N * N), SX = new Float32Array(N * N), SY = new Float32Array(N * N), NCh = new Uint8Array(N * N);
    cells.forEach(function (k) { JX[k] = ox + ((k % N) + 0.5 + jit(k, 1)) * h; JY[k] = oy + ((k / N | 0) + 0.5 + jit(k, 2)) * h; });
    cells.forEach(function (k) { var p = tree[k]; if (p >= 0) { SX[p] += JX[k]; SY[p] += JY[k]; NCh[p]++; } });
    function px(k) { return k < 0 || tree[k] < 0 ? b.x : JX[k]; } function py(k) { return k < 0 || tree[k] < 0 ? b.y : JY[k]; }
    var MX = new Float32Array(N * N), MY = new Float32Array(N * N);
    cells.forEach(function (k) { var p = tree[k], ax = px(p), ay = py(p); if (NCh[k]) { MX[k] = 0.5 * JX[k] + 0.25 * ax + 0.25 * SX[k] / NCh[k]; MY[k] = 0.5 * JY[k] + 0.25 * ay + 0.25 * SY[k] / NCh[k]; } else { MX[k] = 0.8 * JX[k] + 0.2 * ax; MY[k] = 0.8 * JY[k] + 0.2 * ay; } });
    var ncell = cells.length, mt = new Float32Array(N * N); if (hit >= 0) { var ml = 0, qq = hit; while (qq >= 0) { ml++; qq = tree[qq]; } qq = hit; var mi = ml; while (qq >= 0) { mt[qq] = --mi / ml; qq = tree[qq]; } }
    cells.forEach(function (k) {
      var pk = tree[k], ok2 = pk >= 0 && tree[pk] >= 0, x1 = ok2 ? MX[pk] : b.x, y1 = ok2 ? MY[pk] : b.y;
      var I = main[k] ? 1 - 0.5 * mt[k] : Math.min(0.85, Math.pow(cur[k] / ncell, 0.45) * 0.9 + 0.04);
      SPK.push(x1, y1, MX[k], MY[k], I, run, main[k]);
    });
    if (hit >= 0) {   // the last step: touch the dendrite
      var hx = MX[hit], hy = MY[hit], bd2 = 1e9, cx2 = b.tx, cy2 = b.ty;
      for (i = 0; i < RT.x.length; i++) { var dd2 = (RT.x[i] - hx) * (RT.x[i] - hx) + (RT.y[i] - hy) * (RT.y[i] - hy); if (dd2 < bd2 && (!b.tmask || b.tmask(i))) { bd2 = dd2; cx2 = RT.x[i]; cy2 = RT.y[i]; b.hitNode = i; } }
      if (bd2 < 400) SPK.push(hx, hy, cx2, cy2, 0.5, run, 1);
      b.hx = cx2; b.hy = cy2;
    }
    b.main = []; if (hit >= 0) { q = hit; while (q >= 0) { b.main.push([MX[q], MY[q]]); q = tree[q]; } b.main.reverse(); }
    return { hit: hit >= 0, prog: prog };
  }
  TT('geom'); var eta = P.eta + (6 - chargeV) * 0.12;
  boutons.forEach(function (b, bi) {
    var runs = trans === 'Repeated' ? 3 : 1;
    for (var rn = 0; rn < runs; rn++) { var res = discharge(RD.fork('dbm' + bi + '/' + rn), b, rn, clamp(eta + (trans === 'Train' ? 0.35 : 0), 0.8, 4), failed ? RD.range(0.38, 0.7) : 0); b.hit = res.hit; }
    var Rv2 = RD.fork('ves' + bi), nrel = Math.round({ 'Faint': 14, 'Steady': 30, 'Violent': 55 }[charge] * (failed ? 0.4 : 1) * (trans === 'Repeated' ? 1.5 : 1));
    var dx = b.tx - b.x, dy = b.ty - b.y, dl = Math.hypot(dx, dy) + 1e-6; dx /= dl; dy /= dl;
    for (var v = 0; v < nrel; v++) { var s = Math.pow(Rv2.rand(), 1.6) * dl * (failed ? 0.35 : 0.7), sp = Rv2.gaussian(0, 6 + s * 0.35); VES.push(b.x + dx * (b.r + s) - dy * sp, b.y + dy * (b.r + s) + dx * sp, Rv2.range(1.0, 1.8)); }
  });
  TT('dbm');

  // ======================= the consequence: a wave through the receiving tree =======================
  function treeDist(T, src) {   // exact path length from src to every node of a tree
    var n = T.x.length, head = new Int32Array(n).fill(-1), nxt = new Int32Array(n), D = new Float32Array(n).fill(1e9), st = [src], i;
    for (i = 0; i < n; i++) { var p = T.p[i]; if (p >= 0) { nxt[i] = head[p]; head[p] = i; } }
    D[src] = 0;
    while (st.length) {
      var u = st.pop(), du = D[u], pu = T.p[u];
      if (pu >= 0 && D[pu] > 1e8) { D[pu] = du + Math.hypot(T.x[u] - T.x[pu], T.y[u] - T.y[pu]); st.push(pu); }
      for (var c = head[u]; c >= 0; c = nxt[c]) if (D[c] > 1e8) { D[c] = du + Math.hypot(T.x[c] - T.x[u], T.y[c] - T.y[u]); st.push(c); }
    }
    return D;
  }
  var ACT = new Float32Array(RT.x.length), inG = new Float32Array(RT.x.length), litLetters = 0;
  for (var ii = 0; ii < RT.x.length; ii++) inG[ii] = 1 - sstep(1, 10, dWord(RT.x[ii], RT.y[ii]));
  var mFront = { 'Arrival': 0.5, 'Spread': 1.12, 'Afterglow': 1.9 }[moment], mDim = moment === 'Afterglow' ? 0.55 : 1, phase = RD.range(0, TAU);
  boutons.forEach(function (b) {
    if (!b.hit || b.hitNode == null) return;
    var D = treeDist(RT, b.hitNode), loc = trans === 'Train' ? 170 : 1e9, gd = [];
    for (var i = 0; i < RT.x.length; i++) if (inG[i] > 0.5 && Math.hypot(RT.x[i] - b.tx, RT.y[i] - b.ty) < loc && D[i] < 1e8) gd.push(D[i]);
    gd.sort(function (a, c) { return a - c; });
    var Dg = gd.length ? gd[Math.floor(gd.length * 0.85)] : 200, Rf = nearMiss ? RD.range(70, 120) : Dg * mFront * RD.range(0.9, 1.1);
    for (i = 0; i < RT.x.length; i++) {
      var d = D[i]; if (d > 1e8) continue;
      var a = Math.exp(-Math.pow((d - Rf) / P.sig, 2)) * (moment === 'Afterglow' ? 0.4 : 1) + (d < Rf ? (0.25 + 0.55 * Math.exp(-(Rf - d) / P.tail)) * mDim : 0) + 0.8 * Math.exp(-d / 35);
      if (P.flick) a *= 1 - P.flick * 0.5 * (1 + Math.cos(d * 0.07 + phase)) * 0.6;
      var g = nearMiss ? 1 - 0.85 * inG[i] : 0.06 + 0.94 * inG[i];
      a = Math.min(1.25, a * g); if (a > ACT[i]) ACT[i] = a;
    }
  });
  // the approach: the impulse coming down the sending arbour toward each bouton
  var PACT = new Float32Array(PT.x.length), appr = { 'Arrival': 1, 'Spread': 0.6, 'Afterglow': 0.3 }[moment];
  boutons.forEach(function (b) { var q = b.node, d = 0, prev = q; while (q >= 0) { d += Math.hypot(PT.x[q] - PT.x[prev], PT.y[q] - PT.y[prev]); PACT[q] = Math.max(PACT[q], 0.22 * appr * Math.exp(-d / 220)); prev = q; q = PT.p[q]; } });
  TT('act');
  tube(RT, RR, ZR, 1, { rwI: function (i) { return 1 + inG[i] * (0.35 + 0.9 * Math.min(1, ACT[i])); }, act: ACT, swell: P.swell, sf: function (x, y) { return lerp(2.2, 0.6, sstep(2, 30, dWord(x, y))); }, spine: P.spine, head: P.head, bead: P.bead, R: RG.fork('spines') });
  seg(somaP[0], somaP[1], somaR, somaP[0] + Math.cos(toC) * somaR * 0.9, somaP[1] + Math.sin(toC) * somaR * 0.9, somaR * 0.55, ZR[0] || 1.5, 1, 0);
  tube(PT, PR, ZP, 1, { act: PACT });
  boutons.forEach(function (b) { seg(b.x, b.y, b.r * 0.8, b.x, b.y, b.r, 0, 1, b.hit || failed ? 1 : 0.6); });

  // a few other impregnated cells and fibres, deep out of focus, kept out of the cleft
  var nOther = { 'Sparse': RB.int(0, 1), 'Neighbours': RB.int(1, 2), 'Thicket': RB.int(3, 4) }[crowd];
  for (var on = 0; on < nOther; on++) {
    var Ro = RB.fork('cell' + on), ox = Ro.range(-60, VW + 60), oy = Ro.range(-60, VH + 60), oz = Ro.range(2, 3) * (Ro.rand() < 0.5 ? -1 : 1);
    if (Math.abs(cc(ox, oy)[1]) < hw + 160) continue;
    var oa = Ro.range(0, TAU), oA = [], oB = [], oK = [], apL = Ro.range(250, 550);
    for (var t = 0; t < 220; t++) { var s = Math.pow(Ro.rand(), 0.7), w3 = Ro.gaussian(0, 12 + s * 70); oA.push(ox + Math.cos(oa) * s * apL - Math.sin(oa) * w3); oB.push(oy + Math.sin(oa) * s * apL + Math.cos(oa) * w3); oK.push(8); }
    var OT = colonize(Ro.fork('g'), [[ox, oy, -1, 0]], new Float32Array(oA), new Float32Array(oB), new Float32Array(oK), { step: 4, di: 60, wob: 0.15, tx: 0, ty: 0, iters: 260, maxNodes: 3000 });
    tube(OT, radii(OT, 0.6, 4, 2.6), smoothZ(OT, function () { return oz; }), 0.8, {});
    seg(ox, oy, 10, ox, oy, 8, oz, 0.85);
  }
  var Rf2 = RB.fork('fibres'), nF = { 'Sparse': 6, 'Neighbours': 14, 'Thicket': 26 }[crowd];
  for (var fi = 0; fi < nF; fi++) {
    var fx = Rf2.range(-50, VW + 50), fy = Rf2.range(-50, VH + 50), fa = Rf2.range(0, TAU), fz = Rf2.range(1.6, 3.2) * (Rf2.rand() < 0.5 ? -1 : 1), fr = Rf2.range(0.5, 1.2), fl = Rf2.range(120, 600), fc = Rf2.gaussian(0, 0.004);
    for (var fs = 0; fs < fl / 5; fs++) { fa += fc + Rf2.gaussian(0, 0.04); var nfx = fx + Math.cos(fa) * 5, nfy = fy + Math.sin(fa) * 5; var cf = cc(nfx, nfy); if (Math.abs(cf[1]) > hw + 30 && dWord(nfx, nfy) > 25) seg(fx, fy, fr, nfx, nfy, fr, fz, 0.7); fx = nfx; fy = nfy; }
  }

  // ======================= render =======================
  var cv = C.setupCanvas(VW, VH, stain === 'Darkfield' ? '#050607' : '#e9e9e6'), ctx = cv.ctx, PW = cv.canvas.width, PH = cv.canvas.height, PN = PW * PH, k = PW / VW;
  var XF = false, ZM = 1, FXc = VW / 2, FYc = VH / 2;
  function vx_(x) { return x; } function vy_(y) { return y; } function vs_(r) { return r; }
  var NL = 4, LB = [0, 1.3, 3.6, 8.5], LS = [1, 1, 0.5, 0.25], LAY = [];
  function mkBuf(sc) { var w = Math.max(8, Math.round(PW * sc)), h = Math.max(8, Math.round(PH * sc)); return { w: w, h: h, k: k * w / PW, d: new Float32Array(w * h) }; }
  for (var li = 0; li < NL; li++) LAY.push(mkBuf(LS[li]));
  var TMPB = new Float32Array(PN), ACC = new Float32Array(Math.max(PW, PH) + 8);
  function capsule(B, x1, y1, r1, x2, y2, r2, amt) {   // anti-aliased capsule, coordinates in virtual units, max-composite
    var kk = B.k, W = B.w, H = B.h, buf = B.d; x1 = vx_(x1) * kk; y1 = vy_(y1) * kk; x2 = vx_(x2) * kk; y2 = vy_(y2) * kk; r1 = vs_(r1) * kk; r2 = vs_(r2) * kk;
    var rm = Math.max(r1, r2) + 1, bx0 = Math.max(0, Math.floor(Math.min(x1, x2) - rm)), bx1 = Math.min(W - 1, Math.ceil(Math.max(x1, x2) + rm)), by0 = Math.max(0, Math.floor(Math.min(y1, y2) - rm)), by1 = Math.min(H - 1, Math.ceil(Math.max(y1, y2) + rm));
    if (bx0 > bx1 || by0 > by1) return;
    var dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy + 1e-9;
    for (var y = by0; y <= by1; y++) for (var x = bx0; x <= bx1; x++) {
      var px = x + 0.5 - x1, py = y + 0.5 - y1, t = (px * dx + py * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      var ex = px - dx * t, ey = py - dy * t, d = Math.sqrt(ex * ex + ey * ey), r = r1 + (r2 - r1) * t;
      var cov = r - d + 0.5; cov = cov < 0 ? 0 : cov > 1 ? 1 : cov; if (r < 0.5) cov *= r * 2 + 0.05; if (cov <= 0) continue;
      var v = cov * amt, i = y * W + x; if (v > buf[i]) buf[i] = v;
    }
  }
  function blur(B, rV) {   // three box passes ~ gaussian, radius in virtual units; cache-friendly running sums
    var r = Math.round(rV * B.k), W = B.w, H = B.h, buf = B.d, tmp = TMPB; if (r < 1) return;
    var n = 2 * r + 1, inv = 1 / n, x, y, o;
    for (var pass = 0; pass < 3; pass++) {
      for (y = 0; y < H; y++) { o = y * W; var acc = 0; for (x = -r; x <= r; x++) acc += buf[o + (x < 0 ? 0 : x >= W ? W - 1 : x)]; for (x = 0; x < W; x++) { tmp[o + x] = acc * inv; acc += buf[o + (x + r + 1 < W ? x + r + 1 : W - 1)] - buf[o + (x - r > 0 ? x - r : 0)]; } }
      for (x = 0; x < W; x++) ACC[x] = 0;
      for (y = -r; y <= r; y++) { o = (y < 0 ? 0 : y >= H ? H - 1 : y) * W; for (x = 0; x < W; x++) ACC[x] += tmp[o + x]; }
      for (y = 0; y < H; y++) { o = y * W; var oa = (y + r + 1 < H ? y + r + 1 : H - 1) * W, ob = (y - r > 0 ? y - r : 0) * W; for (x = 0; x < W; x++) { buf[o + x] = ACC[x] * inv; ACC[x] += tmp[oa + x] - tmp[ob + x]; } }
    }
  }
  function sampleB(B, x, y) {   // bilinear, x,y in full-res pixels
    if (B.w === PW) return B.d[(y | 0) * PW + (x | 0)];
    var fx = (x + 0.5) * B.w / PW - 0.5, fy = (y + 0.5) * B.h / PH - 0.5, x0 = fx < 0 ? 0 : fx | 0, y0 = fy < 0 ? 0 : fy | 0, x1 = x0 + 1 < B.w ? x0 + 1 : x0, y1 = y0 + 1 < B.h ? y0 + 1 : y0, tx = fx - x0, ty = fy - y0; if (tx < 0) tx = 0; if (ty < 0) ty = 0;
    var d = B.d, W = B.w; return (d[y0 * W + x0] * (1 - tx) + d[y0 * W + x1] * tx) * (1 - ty) + (d[y1 * W + x0] * (1 - tx) + d[y1 * W + x1] * tx) * ty;
  }
  var E0 = mkBuf(1), EB = mkBuf(0.5), EH = mkBuf(0.2);
  var focus = RM.gaussian(0, 0.1);
  for (var s0 = 0; s0 < SEG.length; s0 += 9) {
    var z = Math.abs(SEG[s0 + 6] - focus), zz = clamp(z / 0.9, 0, NL - 1.001), l0 = Math.floor(zz), f = zz - l0, d0 = SEG[s0 + 7], ac = SEG[s0 + 8];
    var x1 = SEG[s0], y1 = SEG[s0 + 1], r1 = SEG[s0 + 2], x2 = SEG[s0 + 3], y2 = SEG[s0 + 4], r2 = SEG[s0 + 5];
    if (f < 0.98) capsule(LAY[l0], x1, y1, r1, x2, y2, r2, d0 * (1 - f));
    if (f > 0.02) capsule(LAY[l0 + 1], x1, y1, r1, x2, y2, r2, d0 * f);
    if (ac > 0.03) {
      if (zz < 1.2) capsule(E0, x1, y1, r1 + 0.45, x2, y2, r2 + 0.45, Math.min(1, ac) * (1 - zz / 1.2 * 0.5)); else capsule(EB, x1, y1, r1 * 1.5, x2, y2, r2 * 1.5, Math.min(1, ac) * 0.6);
      capsule(EH, x1, y1, r1 + 1.5, x2, y2, r2 + 1.5, Math.min(1, ac) * 0.7);
    }
  }
  TT('raster'); for (li = 1; li < NL; li++) blur(LAY[li], LB[li]);
  blur(EB, 2.5); blur(EH, 9);
  var SC = mkBuf(1), SH = mkBuf(0.2), SS = mkBuf(0.5), VB = mkBuf(1);
  var spW = { 'Faint': 1.2, 'Steady': 1.7, 'Violent': 2.3 }[charge];
  for (var q0 = 0; q0 < SPK.length; q0 += 7) {
    var I0 = SPK[q0 + 4], runF = trans === 'Repeated' ? [1, 0.45, 0.22][SPK[q0 + 5]] : 1, mainC = SPK[q0 + 6];
    var wdt = mainC ? spW * (failed ? 0.5 : 1) * (0.45 + 0.55 * I0) : spW * (0.25 + 0.75 * I0) * 0.55, am = (mainC ? 1 : 0.3 + 0.6 * I0) * runF;
    capsule(SC, SPK[q0], SPK[q0 + 1], wdt, SPK[q0 + 2], SPK[q0 + 3], wdt, am);
    capsule(SH, SPK[q0], SPK[q0 + 1], wdt, SPK[q0 + 2], SPK[q0 + 3], wdt, am); capsule(SS, SPK[q0], SPK[q0 + 1], wdt, SPK[q0 + 2], SPK[q0 + 3], wdt, am);
  }
  boutons.forEach(function (b) { if (b.hx != null) { capsule(SH, b.hx, b.hy, 6, b.hx, b.hy, 0, 0.8); capsule(SS, b.hx, b.hy, 3, b.hx, b.hy, 0, 0.7); } capsule(SH, b.x, b.y, b.r * 1.3, b.x, b.y, 0, 0.5); });
  for (var vi = 0; vi < VES.length; vi += 3) capsule(VB, VES[vi], VES[vi + 1], VES[vi + 2], VES[vi], VES[vi + 1], 0, 1);
  blur(SH, 11); blur(SS, 2.2);
  var BGW = 251, BGH = 314, BN1 = new Float32Array(BGW * BGH);
  for (var gy = 0; gy < BGH; gy++) for (var gx = 0; gx < BGW; gx++) BN1[gy * BGW + gx] = NZ.fbm(gx * 4 * 0.003, gy * 4 * 0.003, 3);
  function bg(F, vx, vy) { var fx = vx / 4, fy = vy / 4, x0 = Math.min(BGW - 2, fx | 0), y0 = Math.min(BGH - 2, fy | 0), tx = fx - x0, ty = fy - y0, i0 = y0 * BGW + x0; return (F[i0] * (1 - tx) + F[i0 + 1] * tx) * (1 - ty) + (F[i0 + BGW] * (1 - tx) + F[i0 + BGW + 1] * tx) * ty; }
  TT('blur');
  var img = ctx.createImageData(PW, PH), px8 = img.data, seedI = (C.rng('px').rand() * 4294967296) >>> 0;
  function hash(i) { i = (i ^ seedI) >>> 0; i = Math.imul(i ^ (i >>> 16), 0x7feb352d); i = Math.imul(i ^ (i >>> 15), 0x846ca68b); return ((i ^ (i >>> 16)) >>> 0) / 4294967296; }
  var GAM = new Uint8Array(4097); for (var gi = 0; gi <= 4096; gi++) GAM[gi] = Math.round(Math.pow(gi / 4096, 1 / 2.2) * 255);
  var dark = stain === 'Darkfield';
  for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
    var i = y * PW + x, vx2 = x / k, vy2 = y / k, u = vx2 / VW - 0.5, v = vy2 / VH - 0.5, vig = 1 - 0.35 * (u * u + v * v) * 1.6;
    var l0v = LAY[0].d[i], l1v = LAY[1].d[i], l2v = sampleB(LAY[2], x, y), l3v = sampleB(LAY[3], x, y);
    var e = Math.min(1.2, (E0.d[i] + sampleB(EB, x, y) * 0.8) * 2.4), eh = sampleB(EH, x, y), sp = SC.d[i], halo = sampleB(SH, x, y), soft = sampleB(SS, x, y), ves = VB.d[i], n1 = bg(BN1, vx2, vy2);
    var r, g, b;
    if (dark) {   // darkfield: structure scatters cool light out of black; the consequence is warm
      var od = l0v * 1.0 + l1v * 0.8 + l2v * 0.42 + l3v * 0.26, S = 1 - Math.exp(-1.7 * od);
      var b0 = 0.0022 + 0.0016 * n1;
      r = (b0 + S * 0.44) * vig; g = (b0 + S * 0.47) * vig; b = (b0 * 1.25 + S * 0.51) * vig;
      var ee = Math.min(1, e); r = r * (1 - 0.35 * ee) + ee * 1.0 + eh * 0.42; g = g * (1 - 0.35 * ee) + ee * 0.6 + eh * 0.19; b = b * (1 - 0.35 * ee) + ee * 0.28 + eh * 0.06;
      r += sp * 1.05 + soft * 0.5 + halo * 0.55 + ves * 0.75; g += sp * 0.96 + soft * 0.33 + halo * 0.26 + ves * 0.48; b += sp * 0.82 + soft * 0.17 + halo * 0.08 + ves * 0.22;
    } else {      // brightfield: graphite structure on neutral light; the consequence is a vermilion stain
      var odb = l0v * 2.5 + l1v * 2.05 + l2v * 1.35 + l3v * 1.0, ee2 = Math.min(1, e), os = odb * (1 - 0.72 * ee2), re = ee2 * 1.7 + eh * 0.3, rs = sp * 1.4 + soft * 0.3 + ves * 0.9;
      var bgl = (0.93 + 0.012 * n1) * (0.94 + 0.06 * vig);
      r = bgl * Math.exp(-(os + re * 0.08 + rs * 0.06)); g = bgl * Math.exp(-(os + re * 1.0 + rs * 1.15)); b = (bgl - 0.01) * Math.exp(-(os * 1.04 + re * 1.25 + rs * 1.4));
    }
    if (Q && Q.get('showword') && WM[(vy2 / GS | 0) * GW + (vx2 / GS | 0)]) { g *= 0.6; b *= 0.4; r = r * 0.8 + 0.15; }
    var gn = (hash(i * 7 + 3) + hash(i * 13 + 5) - 1) * 5;
    px8[i * 4] = GAM[clamp(r * 4096, 0, 4096) | 0] + gn; px8[i * 4 + 1] = GAM[clamp(g * 4096, 0, 4096) | 0] + gn; px8[i * 4 + 2] = GAM[clamp(b * 4096, 0, 4096) | 0] + gn; px8[i * 4 + 3] = 255;
  }
  TT('shade'); ctx.putImageData(img, 0, 0);
  if (window.__dbg) { var mx = 0, ng = 0; for (var q9 = 0; q9 < ACT.length; q9++) { mx = Math.max(mx, ACT[q9]); if (inG[q9] > 0.5) ng++; } console.log('word', JSON.stringify(TXT.bb.map(Math.round)), em|0, 'glyphNodes', ng, 'actMax', mx.toFixed(2), 'attr', AX.length); }
  if (window.__dbg) console.log(JSON.stringify({ post: RT.x.length, pre: PT.x.length, boutons: boutons.map(function (b) { return [b.hit, b.hitNode]; }), segs: SEG.length / 9 }));
  C.plottable = false;
  C.done(cv.canvas, 'twenty-nanometres-v3');
})();

/* Twenty Nanometres, by Clyde (2026).
 * A trigger word is an electrical event. Each plate shows the word as the shape a receiving
 * neuron has learned (its dendrites grown, by space colonisation, into the letterforms) and the
 * discharge that crosses the cleft to reach it (dielectric-breakdown growth on a Laplace field).
 * Rendered as a silver-stained section: Golgi photomicrograph, Cajal-style ink plate, or glass negative. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), T0 = Date.now(), TT = function (l) { if (window.__dbg) console.log(l, Date.now() - T0); };
  var RW = R.fork('word'), RG = R.fork('growth'), RD = R.fork('discharge'), RM = R.fork('medium'), RB = R.fork('background');
  var NZ = C.noise(RM.fork('noise'));
  var VW = 1000, VH = 1250, PI = Math.PI, TAU = PI * 2;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  var Q = C.platform === 'standalone' ? C.query : null;

  // ======================= traits =======================
  var register = RW.weighted([['Alarm', 26], ['Attachment', 26], ['Loss', 22], ['Want', 14], ['Summons', 12]]);
  var entry = RW.weighted(LEX[register].map(function (e) { return [e, e[1]]; }));
  var stain = RM.weighted([['Golgi Section', 50], ['Cajal Plate', 34], ['Autochrome', 16]]);
  var trans = RD.weighted({
    'Alarm': [['Storm', 55], ['Crossed', 45]], 'Attachment': [['Crossed', 80], ['Repeated', 20]],
    'Loss': [['Failed', 75], ['Crossed', 25]], 'Want': [['Repeated', 70], ['Crossed', 30]], 'Summons': [['Train', 80], ['Failed', 20]]
  }[register]);
  if (Q) { // dev preview only
    if (Q.get('word')) { for (var rg in LEX) LEX[rg].forEach(function (e) { if (e[0] === Q.get('word').toUpperCase()) { entry = e; register = rg; } }); }
    if (Q.get('stain')) stain = Q.get('stain'); if (Q.get('trans')) trans = Q.get('trans');
  }
  var word = entry[0], valence = entry[2], arousal = entry[3];
  var chargeV = arousal + RD.gaussian(0, 0.55);
  var charge = chargeV < 4.6 ? 'Faint' : chargeV < 6.2 ? 'Steady' : 'Violent';
  var crowd = RB.weighted([['Sparse', 40], ['Neighbours', 42], ['Thicket', 18]]);

  // register shapes the receiving cell
  var P = {
    'Alarm':      { leaf: 0.55, wob: 0.34, spine: 1.5, spineHead: 0.75, bead: 0, gap: 1.0, eta: 0.85, prim: [6, 9] },
    'Attachment': { leaf: 0.95, wob: 0.10, spine: 0.8, spineHead: 0.95, bead: 0, gap: 0.8, eta: 1.7, prim: [4, 6] },
    'Loss':       { leaf: 0.70, wob: 0.16, spine: 0.35, spineHead: 0.7, bead: 1, gap: 1.1, eta: 1.15, prim: [3, 5] },
    'Want':       { leaf: 0.80, wob: 0.18, spine: 1.2, spineHead: 1.35, bead: 0, gap: 0.9, eta: 1.3, prim: [5, 7] },
    'Summons':    { leaf: 0.65, wob: 0.20, spine: 1.0, spineHead: 0.85, bead: 0, gap: 1.0, eta: 1.1, prim: [5, 8] }
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

  var TRK = Q && Q.get('trk') ? +Q.get('trk') : 0.13;
  var lines = (word.indexOf(' ') > 0 && word.length > 7) ? word.split(' ') : [word];
  function advOf(str) { var a = 0, F = FONT.B; for (var k = 0; k < str.length; k++) a += (F.g[str[k]] || F.g[' '])[0] / F.upm + TRK; return a; }
  var adv = Math.max.apply(null, lines.map(advOf));
  var em = Math.min(lines.length > 1 ? 200 : 240, 800 / adv);
  var rot = RW.chance(0.22) ? RW.gaussian(0, 0.16) : RW.gaussian(0, 0.035), UP = RW.chance(0.3) ? -1 : 1; if (Q && Q.get('up')) UP = +Q.get('up');
  var wcx = 500 + RW.range(-30, 30), base = VH * (UP > 0 ? RW.weighted([[RW.range(0.40, 0.47), 30], [RW.range(0.53, 0.6), 50], [RW.range(0.64, 0.7), 20]]) : RW.range(0.58, 0.72)) + em * 0.36;
  var TXT = { letters: [], width: 0 }, lead = em * 0.98;
  lines.forEach(function (ln, li) { var L = layout('B', ln, em, wcx + Math.sin(rot) * lead * (lines.length - 1 - li), base - Math.cos(rot) * lead * (lines.length - 1 - li), rot, TRK); TXT.letters = TXT.letters.concat(L.letters); TXT.width = Math.max(TXT.width, L.width); });
  var capTop = base - em * 0.70 - lead * (lines.length - 1);
  var objective = TXT.width < 770 && RM.chance(0.5) ? 'x60' : 'x20'; if (Q && Q.get('obj')) objective = Q.get('obj');
  C.features({ Word: word, Register: register, Stain: stain, Transmission: trans, Charge: charge, Section: crowd, Objective: objective === 'x60' ? '\u00d760' : '\u00d720' });
  if (Q && Q.get('traitsonly')) { window.__clyde = { features: C._features }; return; }
  function inWord(x, y) { for (var k = 0; k < TXT.letters.length; k++) if (inside(TXT.letters[k], x, y)) return true; return false; }

  // distance-to-word field on a 4-unit grid (drives focus and density)
  var GS = 4, GW = Math.ceil(VW / GS), GH = Math.ceil(VH / GS), WM = new Uint8Array(GW * GH);
  (function () {
    var x0 = Math.floor((wcx - TXT.width / 2 - 40) / GS), x1 = Math.ceil((wcx + TXT.width / 2 + 40) / GS), y0 = Math.floor((capTop - 60) / GS), y1 = Math.ceil((base + 60) / GS);
    for (var gy = Math.max(0, y0); gy < Math.min(GH, y1); gy++) for (var gx = Math.max(0, x0); gx < Math.min(GW, x1); gx++) if (inWord((gx + 0.5) * GS, (gy + 0.5) * GS)) WM[gy * GW + gx] = 1;
  })();
  var DW = C.edt(WM, GW, GH);
  function dWord(x, y) { var gx = clamp(x / GS | 0, 0, GW - 1), gy = clamp(y / GS | 0, 0, GH - 1); return DW[gy * GW + gx] * GS; }

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

  // ======================= geometry store =======================
  var SEG = []; // [x1,y1,r1,x2,y2,r2,z,dens,kind]  kind 0 stain, 1 vesicle ring
  function seg(x1, y1, r1, x2, y2, r2, z, d, kind) { SEG.push(x1, y1, r1, x2, y2, r2, z, d, kind || 0); }
  function tube(T, r, zf, dens, o) {   // emit a tree as stained capsules + spines
    o = o || {};
    var ZS = new Float32Array(T.x.length);
    for (var i0 = 0; i0 < T.x.length; i0++) { var zt0 = zf(T.x[i0], T.y[i0], T.b[i0], i0), pp0 = T.p[i0]; ZS[i0] = pp0 < 0 ? zt0 : ZS[pp0] + (zt0 - ZS[pp0]) * 0.22; }
    for (var i = 0; i < T.x.length; i++) {
      var p = T.p[i]; if (p < 0) continue;
      var z = ZS[i], d = dens;
      if (o.bead) {   // varicose beading and gaps from incomplete impregnation (injured dendrite)
        var bn = NZ.n2(T.x[i] * 0.09, T.y[i] * 0.09);
        if (r[i] < 1.6 && bn > 0.58) continue;
        if (r[i] < 2 && ((i * 2654435761) >>> 0) % 7 === 0) { seg(T.x[i], T.y[i], r[i] * 2.4, T.x[i], T.y[i], r[i] * 2.4, z, d); }
      }
      seg(T.x[p], T.y[p], r[p], T.x[i], T.y[i], r[i], z, d);
      if (o.spine && r[i] < 2.2 && T.ch[p] < 2) {
        var len = Math.hypot(T.x[i] - T.x[p], T.y[i] - T.y[p]), ns = len * o.spine * 0.22 * (o.sf ? o.sf(T.x[i], T.y[i]) : 1);
        var Rs = o.R; while (ns > 0) {
          if (Rs.rand() < ns) {
            var t = Rs.rand(), bx = lerp(T.x[p], T.x[i], t), by = lerp(T.y[p], T.y[i], t), tx = (T.x[i] - T.x[p]) / (len + 1e-6), ty = (T.y[i] - T.y[p]) / (len + 1e-6);
            var sg = Rs.rand() < 0.5 ? -1 : 1, a = Rs.gaussian(0, 0.5), nx = -ty * sg, ny = tx * sg, ca = Math.cos(a), sa = Math.sin(a);
            var dx = nx * ca - ny * sa, dy = nx * sa + ny * ca, sl = Rs.range(1.4, 3.4) * (0.7 + 0.3 * r[i]), hx = bx + dx * sl, hy = by + dy * sl;
            seg(bx, by, 0.32, hx, hy, 0.28, z, d * 0.95); seg(hx, hy, o.head * Rs.range(0.55, 1.1), hx, hy, 0, z, d * 0.95);
          }
          ns -= 1;
        }
      }
    }
  }

  // ======================= composition =======================
  // receiving cell: soma below the word, dendrites rise into it
  var somaX = wcx + (RG.chance(0.3) ? RG.range(-0.42, 0.42) : RG.range(-0.2, 0.2)) * TXT.width, somaY = UP > 0 ? base + RG.range(110, 190) : capTop - RG.range(150, 230), somaR = RG.range(17, 23);
  // sender boutons: above chosen letters
  var letters = TXT.letters, nB = trans === 'Storm' ? 3 : trans === 'Train' ? Math.min(letters.length, RD.int(3, 5)) : 1;
  var order = RD.shuffle(letters.map(function (_, k) { return k; }));
  if (nB === 1) { order.sort(function (a, b) { return Math.abs(a - (letters.length - 1) / 2) - Math.abs(b - (letters.length - 1) / 2); }); order = [order[RD.int(0, Math.min(1, letters.length - 1))]]; }
  var picks = order.slice(0, nB).sort(function (a, b) { return a - b; });
  var gapBase = clamp(em * 0.85, 120, 190) * P.gap * RD.range(0.85, 1.15);
  var boutons = picks.map(function (k) {
    var L = letters[k], bx = L.cx + RD.range(-0.18, 0.18) * (L.bb[2] - L.bb[0]), e0 = UP > 0 ? L.bb[1] : L.bb[3], top = e0, found = false;
    for (var tr = 0; tr < 2 && !found; tr++) { if (tr) bx = L.cx; for (var yy = e0; UP > 0 ? yy < L.bb[3] : yy > L.bb[1]; yy += 1.5 * UP) if (inside(L, bx, yy)) { top = yy; found = true; break; } }
    if (!found) top = e0 + 4 * UP;
    var g = gapBase * (trans === 'Train' ? 0.7 : 1) * RD.range(0.9, 1.1);
    return { x: bx + RD.gaussian(0, g * 0.15), y: top - g * UP, r: RD.range(7, 10) * (register === 'Want' ? 1.25 : 1), tx: bx, ty: top, k: k };
  });

  // attractors for the receiving cell
  var AX = [], AY = [], AK = [], Ra = RG.fork('attr');
  (function () {
    var x0 = wcx - TXT.width / 2 - 20, x1 = wcx + TXT.width / 2 + 20, n = 0;
    var inSp = (register === 'Loss' ? 4.9 : register === 'Attachment' ? 4.3 : 4.6) * (Q && Q.get('insp') ? +Q.get('insp') : 1.05);
    for (var gy = capTop - 12; gy < base + 12; gy += inSp) for (var gx = x0; gx < x1; gx += inSp) {   // jittered grid: even fill, so the letterform holds
      var x = gx + Ra.range(0, inSp), y = gy + Ra.range(0, inSp);
      var iw = inWord(x, y);
      if (!iw && (dWord(x, y) > 7 || Ra.rand() > 0.05)) continue;
      if (iw && NZ.n2(x * 0.013 + 50, y * 0.013) < -0.55 && Ra.rand() < 0.3) continue;
      var ok = true; if (!iw) for (var b = 0; b < boutons.length; b++) if (Math.hypot(x - boutons[b].x, y - boutons[b].y) < gapBase * 0.85) ok = false;
      if (ok) { AX.push(x); AY.push(y); AK.push(iw ? inSp * 0.7 : inSp); }
    }
    if (!(Q && Q.get('noedge'))) letters.forEach(function (L) {   // hairlines and edges: attractors just inside the contour, so thin strokes survive
      L.polys.forEach(function (q) {
        var n = q.length, acc = 0;
        for (var j = 0; j < n; j += 2) {
          var ax = q[j], ay = q[j + 1], bx = q[(j + 2) % n], by = q[(j + 3) % n], sl = Math.hypot(bx - ax, by - ay); acc += sl;
          while (acc > inSp * 1.1) { acc -= inSp * 1.1; var f = 1 - acc / (sl + 1e-9), px = lerp(ax, bx, f), py = lerp(ay, by, f), nx = -(by - ay) / (sl + 1e-9), ny = (bx - ax) / (sl + 1e-9);
            var cx = px + nx * 1.6, cy = py + ny * 1.6; if (!inside(L, cx, cy)) { cx = px - nx * 1.6; cy = py - ny * 1.6; }
            if (inside(L, cx, cy) && Ra.rand() < 0.7) { AX.push(cx); AY.push(cy); AK.push(inSp * 0.6); } }
        }
      });
    });
    var t;
    // the cell's own dendritic field: a fan from the soma, sparser, so the word is only the densest part of it
    var fanW = TXT.width * 0.75 + 90, fanTop = UP > 0 ? capTop - em * RG.range(0.35, 0.7) : base + em * RG.range(0.35, 0.7), outN = Math.round((fanW * 2 * Math.abs(somaY - fanTop)) / 1500 * (crowd === 'Thicket' ? 1.3 : 1));
    for (t = 0; t < outN; t++) {
      var u = Ra.range(-1, 1), v = Math.pow(Ra.rand(), 0.8), yy = lerp(somaY - 20 * UP, fanTop, v), xx = somaX + u * lerp(30, fanW, Math.sqrt(v)) + (wcx - somaX) * v;
      if (dWord(xx, yy) < 12) continue;
      var ok2 = true; for (b = 0; b < boutons.length; b++) if (Math.hypot(xx - boutons[b].x, yy - boutons[b].y) < gapBase * 1.0) ok2 = false;
      if (ok2) { AX.push(xx); AY.push(yy); AK.push(9); }
    }
    letters.forEach(function (L) {   // guide points so every letter is reachable from the soma
      var lx = L.cx, ly = (L.bb[1] + L.bb[3]) / 2, dl = Math.hypot(lx - somaX, ly - somaY), n = Math.floor(dl / 24);
      for (var j = 1; j < n; j++) { var gx = lerp(somaX, lx, j / n) + Ra.gaussian(0, 9), gy = lerp(somaY, ly, j / n) + Ra.gaussian(0, 9); if (dWord(gx, gy) > 8) { AX.push(gx); AY.push(gy); AK.push(9); } }
    });
    for (t = 0; t < 60; t++) { var ba = Ra.range(0.3, PI - 0.3), br = Ra.range(25, 120); AX.push(somaX + Math.cos(ba) * br * 1.2); AY.push(somaY + Math.sin(ba) * br * 0.7 * UP); AK.push(9); }   // basal
  })();
  var nPrim = RG.int(P.prim[0], P.prim[1]), roots = [];
  for (var pr = 0; pr < nPrim; pr++) {
    var ang = pr < nPrim - 2 ? lerp(-PI * 0.92, -PI * 0.08, (pr + RG.range(0.2, 0.8)) / (nPrim - 2)) : RG.range(0.4, PI - 0.4);
    roots.push([somaX + Math.cos(ang) * somaR * 0.9, somaY + Math.sin(ang) * somaR * 0.9 * UP, -1, pr]);
  }
  var RT = colonize(RG.fork('grow'), roots, new Float32Array(AX), new Float32Array(AY), new Float32Array(AK), { step: 3, di: 52, wob: P.wob, tx: 0, ty: -0.12 * UP, tf: function (x, y) { return dWord(x, y) < 3 ? 0 : 1; }, wf: function (x, y) { return dWord(x, y) < 3 ? 1.8 : 1; }, iters: 900, maxNodes: 26000 });
  if (window.__dbg) console.log('perletter', JSON.stringify(letters.map(function (L) { var a = 0, n = 0, j; for (j = 0; j < AX.length; j++) if (inside(L, AX[j], AY[j])) a++; for (j = 0; j < RT.x.length; j++) if (inside(L, RT.x[j], RT.y[j])) n++; return L.ch + a + '/' + n; })), JSON.stringify(boutons.map(function (b) { return [b.x | 0, b.y | 0, b.tx | 0, b.ty | 0]; })), gapBase);
  TT('grow'); var RR = radii(RT, P.leaf, register === 'Attachment' ? 5.2 : 4.2, 2.6);
  var primSign = []; for (pr = 0; pr < nPrim; pr++) primSign.push(RG.rand() < 0.5 ? -1 : 1);
  function zRecv(x, y, b) { var d = dWord(x, y), zt = sstep(1, 22, d), ds = Math.hypot(x - somaX, y - somaY); return primSign[b] * (zt * 2.4 * sstep(somaR, somaR * 5, ds) + 0.15 * NZ.n2(x * 0.02, y * 0.02)); }
  tube(RT, RR, zRecv, 1, { sf: function (x, y) { return lerp(2.6 * (Q && Q.get('spf') ? +Q.get('spf') : 1.6), 0.45, sstep(2, 40, dWord(x, y))); }, spine: P.spine, head: P.spineHead, bead: P.bead, R: RG.fork('spines') });
  seg(somaX, somaY + somaR * 0.2 * UP, somaR, somaX, somaY - somaR * 0.75 * UP, somaR * 0.55, 0.1, 1);   // soma (pyramidal)
  // the receiving cell's axon: leaves the frame
  (function () {
    var Rx = RG.fork('axon'), x = somaX, y = somaY + somaR * UP, a = PI / 2 * UP + Rx.gaussian(0, 0.25), r = 1.6, z = 0.3;
    while (y < VH + 20 && y > -20 && x > -20 && x < VW + 20) { a += Rx.gaussian(0, 0.05) + (PI / 2 * UP - a) * 0.02; var nx = x + Math.cos(a) * 4, ny = y + Math.sin(a) * 4; z = Math.min(2.2, z + 0.012); seg(x, y, r, nx, ny, r, z, 1); x = nx; y = ny; r = Math.max(0.9, r * 0.995); }
  })();

  // sending cell: an axon from far away, ending in terminal boutons above the word
  var send = { x: 0, y: 0, inFrame: RD.rand() < 0.6 };
  if (send.inFrame) { send.x = RD.rand() < 0.5 ? RD.range(120, 330) : RD.range(670, 880); send.y = UP > 0 ? RD.range(110, Math.max(140, capTop - 260)) : RD.range(Math.min(VH - 140, base + 260), VH - 110); }
  else { var side = RD.int(0, 2); send.x = side === 0 ? -40 : side === 1 ? VW + 40 : RD.range(200, 800); send.y = side === 2 ? (UP > 0 ? -40 : VH + 40) : UP > 0 ? RD.range(60, capTop - 200) : RD.range(base + 200, VH - 60); }
  function axonPath(Rx, x0, y0, x1, y1, z0, z1, r0, r1, bend) {
    var dl0 = Math.hypot(x1 - x0, y1 - y0), bd = bend || 0.16, mx = (x0 + x1) / 2 + Rx.gaussian(0, dl0 * bd), my = (y0 + y1) / 2 + Rx.gaussian(0, dl0 * bd * 0.5), n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3.5), pts = [];
    var ph = Rx.range(0, 100);
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t, x = a * x0 + b * mx + c * x1, y = a * y0 + b * my + c * y1;
      var w = Math.sin(t * PI) * 5; x += NZ.n2(ph + t * dl0 / 120, 0) * w; y += NZ.n2(0, ph + t * dl0 / 120) * w; pts.push([x, y]);
    }
    AXP.push(pts);
    for (i = 1; i < pts.length; i++) { var t2 = i / n; seg(pts[i - 1][0], pts[i - 1][1], lerp(r0, r1, t2), pts[i][0], pts[i][1], lerp(r0, r1, t2), lerp(z0, z1, sstep(0.3, 1, t2)), 1); }
    return pts;
  }
  var AXP = [], Rax = RD.fork('axon'), sendZ = Rax.range(1.4, 2.4) * (Rax.rand() < 0.5 ? -1 : 1);
  if (trans === 'Train') {   // one axon passing over the word, swelling into boutons en passant
    var bs = boutons.slice().sort(function (a, b) { return a.x - b.x; }), prev = send.inFrame ? [send.x, send.y] : [bs[0].x < 500 ? -40 : VW + 40, UP > 0 ? Rax.range(capTop - 300, capTop - 150) : Rax.range(base + 150, base + 300)];
    if (prev[0] > 500) bs.reverse();
    bs.forEach(function (b, i) { axonPath(Rax, prev[0], prev[1], b.x, b.y, i === 0 ? sendZ : 0.1, 0.05, 1.3, 1.2); prev = [b.x, b.y]; });
    var endX = prev[0] > 500 ? VW + 40 : -40; axonPath(Rax, prev[0], prev[1], endX, prev[1] + Rax.range(-120, 60), 0.05, sendZ, 1.2, 1.1);
  } else {
    var hub = [lerp(send.x, boutons[0].x, 0.75) + Rax.gaussian(0, 30), UP > 0 ? Math.min(boutons[0].y - 50, lerp(send.y, boutons[0].y, 0.72)) : Math.max(boutons[0].y + 50, lerp(send.y, boutons[0].y, 0.72))];
    if (boutons.length > 1) { var mxh = 0; boutons.forEach(function (b) { mxh += b.x; }); hub[0] = mxh / boutons.length; hub[1] = UP > 0 ? Math.min.apply(null, boutons.map(function (b) { return b.y; })) - Rax.range(70, 130) : Math.max.apply(null, boutons.map(function (b) { return b.y; })) + Rax.range(70, 130); }
    axonPath(Rax, send.x, send.y, hub[0], hub[1], sendZ, 0.15, 1.5, 1.3);
    boutons.forEach(function (b) { axonPath(Rax, hub[0], hub[1], b.x, b.y, 0.15, 0, 1.25, 1.0, 0.3); });
    for (var tb = 0; tb < Rax.int(0, 2); tb++) { var ta = Rax.range(0, TAU), tl = Rax.range(40, 110); var ex = hub[0] + Math.cos(ta) * tl, ey = hub[1] + Math.sin(ta) * tl * 0.6 - 20 * UP; if (inWord(ex, ey) || dWord(ex, ey) < 30) continue; axonPath(Rax, hub[0], hub[1], ex, ey, 0.15, 0.9, 1.0, 0.7); seg(ex, ey, 2.6, ex, ey, 0, 0.9, 1); }
  }
  boutons.forEach(function (b) { seg(b.x, b.y - b.r * 0.2, b.r * 0.8, b.x, b.y + b.r * 0.15, b.r, 0, 1); });
  if (send.inFrame) {   // the sender's own soma and dendrites, out of focus
    var sA = [], sB = [], sK = [], Rs2 = RD.fork('sender');
    for (var t = 0; t < 420; t++) { var a2 = Rs2.range(0, TAU), rr = Math.sqrt(Rs2.rand()) * Rs2.range(80, 170); sA.push(send.x + Math.cos(a2) * rr); sB.push(send.y + Math.sin(a2) * rr * 0.75); sK.push(8); }
    var sr0 = []; for (t = 0; t < 5; t++) { var a3 = t / 5 * TAU + Rs2.range(0, 1); sr0.push([send.x + Math.cos(a3) * 11, send.y + Math.sin(a3) * 11, -1, 0]); }
    var ST = colonize(Rs2.fork('g'), sr0, new Float32Array(sA), new Float32Array(sB), new Float32Array(sK), { step: 3.5, di: 50, wob: 0.2, tx: 0, ty: 0, iters: 300, maxNodes: 5000 });
    var SRr = radii(ST, 0.6, 4, 2.6);
    tube(ST, SRr, function () { return sendZ; }, 1, { spine: 0.6, head: 0.7, R: Rs2.fork('sp') });
    seg(send.x, send.y, 13, send.x, send.y + 2, 12, sendZ, 1);
  }

  // other stained cells in the section (Golgi impregnates only a few percent of neurons, at random)
  var nOther = { 'Sparse': RB.int(0, 1), 'Neighbours': RB.int(2, 3), 'Thicket': RB.int(4, 6) }[crowd];
  for (var on = 0; on < nOther; on++) {
    var Ro = RB.fork('cell' + on), ox = Ro.range(-80, VW + 80), oy = Ro.range(100, VH + 60), oz = Ro.range(1.6, 3) * (Ro.rand() < 0.5 ? -1 : 1);
    if (Math.hypot(ox - wcx, (oy - base) * 2) < TXT.width * 0.55) oy = Ro.rand() < 0.5 ? Ro.range(-40, capTop - 150) : Ro.range(base + 150, VH + 40);
    var oa = -PI / 2 + Ro.gaussian(0, 0.4), oA = [], oB = [], oK = [], apL = Ro.range(250, 600);
    for (t = 0; t < 260; t++) { var s = Math.pow(Ro.rand(), 0.7), w3 = Ro.gaussian(0, 12 + s * 70); oA.push(ox + Math.cos(oa) * s * apL - Math.sin(oa) * w3); oB.push(oy + Math.sin(oa) * s * apL + Math.cos(oa) * w3); oK.push(8); }
    for (t = 0; t < 90; t++) { var ba2 = Ro.range(0, TAU), br2 = Ro.range(20, 120); oA.push(ox + Math.cos(ba2) * br2); oB.push(oy + Math.sin(ba2) * br2 * 0.8 + 20); oK.push(8); }
    var or0 = [[ox + Math.cos(oa) * 10, oy + Math.sin(oa) * 10, -1, 0]]; for (t = 0; t < 4; t++) { var a4 = oa + PI * 0.5 + t / 3 * PI; or0.push([ox + Math.cos(a4) * 9, oy + Math.sin(a4) * 9, -1, 0]); }
    var OT = colonize(Ro.fork('g'), or0, new Float32Array(oA), new Float32Array(oB), new Float32Array(oK), { step: 4, di: 60, wob: 0.15, tx: Math.cos(oa) * 0.1, ty: Math.sin(oa) * 0.1, iters: 300, maxNodes: 4000 });
    tube(OT, radii(OT, 0.6, 4.5, 2.6), function (x, y) { return oz + NZ.n2(x * 0.01, y * 0.01) * 0.4; }, 0.92, { spine: 0.5, head: 0.7, R: Ro.fork('sp') });
    seg(ox - 4, oy + 6, 11, ox + Math.cos(oa) * 8, oy + Math.sin(oa) * 8, 7, oz, 0.95);
  }
  // capillary (faintly stained) and silver chromate precipitate (the classic Golgi artefact)
  if (RB.rand() < 0.55) {
    var Rv = RB.fork('vessel'), vx = Rv.range(0, VW), vy = Rv.rand() < 0.5 ? -20 : VH + 20, va = vy < 0 ? PI / 2 + Rv.gaussian(0, 0.5) : -PI / 2 + Rv.gaussian(0, 0.5), vz = Rv.range(1.8, 2.8), vr = Rv.range(4, 7);
    for (var vs = 0; vs < 400; vs++) { va += Rv.gaussian(0, 0.03); var nvx = vx + Math.cos(va) * 5, nvy = vy + Math.sin(va) * 5; seg(vx, vy, vr, nvx, nvy, vr, vz, 0.28); vx = nvx; vy = nvy; if (vx < -30 || vx > VW + 30 || vy < -30 || vy > VH + 30) break; }
  }
  var Rf2 = RB.fork('fibres'), nF = { 'Sparse': 14, 'Neighbours': 30, 'Thicket': 55 }[crowd];
  for (var fi = 0; fi < nF; fi++) {
    var fx = Rf2.range(-50, VW + 50), fy = Rf2.range(-50, VH + 50), fa = Rf2.range(0, TAU), fz = Rf2.range(1.2, 3.2) * (Rf2.rand() < 0.5 ? -1 : 1), fr = Rf2.range(0.5, 1.3), fl = Rf2.range(120, 700), fc = Rf2.gaussian(0, 0.004);
    for (var fs = 0; fs < fl / 5; fs++) { fa += fc + Rf2.gaussian(0, 0.04); var nfx = fx + Math.cos(fa) * 5, nfy = fy + Math.sin(fa) * 5; if (dWord(nfx, nfy) > 25) seg(fx, fy, fr, nfx, nfy, fr, fz, 0.8); fx = nfx; fy = nfy; }
  }
  var Rp = RB.fork('ppt'), nP = Rp.int(10, 40);
  for (var pp = 0; pp < nP; pp++) {
    var px0 = Rp.range(0, VW), py0 = Rp.range(0, VH), pz = Rp.gaussian(0, 1.4), nn = Rp.int(4, 11), big = Rp.rand() < 0.1;
    if (dWord(px0, py0) < 20) continue;
    for (var ne = 0; ne < nn; ne++) { var na = Rp.range(0, TAU), nl = Rp.range(1.5, big ? 16 : 5.5); seg(px0, py0, big ? 1.3 : 0.7, px0 + Math.cos(na) * nl, py0 + Math.sin(na) * nl, 0.15, pz, 0.9); }
  }

  // ======================= the discharge: dielectric breakdown model (Niemeyer, Pietronero & Wiesmann 1984) =======================
  var SPK = [];   // [x1,y1,x2,y2,current,run]
  var VES = [];   // released vesicles [x,y,r]
  function discharge(Rk, b, run, eta, failAt) {
    var gap = Math.hypot(b.tx - b.x, b.ty - b.y), L = Math.max(150, gap * 2.2), N = 140, h = L / N;
    var ox = (b.x + b.tx) / 2 - L / 2, oy = (b.y + b.ty) / 2 - L / 2;
    var phi = new Float32Array(N * N), fix = new Uint8Array(N * N), tree = new Int32Array(N * N).fill(-2), cand = new Uint8Array(N * N);
    // target: receiving arbour inside the window (segments of kind 0 near z=0 from the receiving tree)
    for (var i = 0; i < RT.x.length; i++) {
      var p = RT.p[i]; if (p < 0 || dWord(RT.x[i], RT.y[i]) > 5) continue; var cx = (RT.x[i] - ox) / h, cy = (RT.y[i] - oy) / h; if (cx < 0 || cy < 0 || cx >= N || cy >= N) continue;
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
      for (i = 0; i < RT.x.length; i++) { var dd2 = (RT.x[i] - hx) * (RT.x[i] - hx) + (RT.y[i] - hy) * (RT.y[i] - hy); if (dd2 < bd2 && dWord(RT.x[i], RT.y[i]) < 5) { bd2 = dd2; cx2 = RT.x[i]; cy2 = RT.y[i]; } }
      if (bd2 < 400) SPK.push(hx, hy, cx2, cy2, 0.5, run, 1);
      b.hx = cx2; b.hy = cy2;
    }
    b.main = []; if (hit >= 0) { q = hit; while (q >= 0) { b.main.push([MX[q], MY[q]]); q = tree[q]; } b.main.reverse(); }
    return { hit: hit >= 0, prog: prog };
  }
  TT('geom'); var eta = P.eta + (6 - chargeV) * 0.12;
  boutons.forEach(function (b, bi) {
    var runs = trans === 'Repeated' ? 3 : 1;
    for (var rn = 0; rn < runs; rn++) {
      var res = discharge(RD.fork('dbm' + bi + '/' + rn), b, rn, clamp(eta + (trans === 'Train' ? 0.4 : 0), 0.8, 4), trans === 'Failed' ? RD.range(0.42, 0.72) : 0);
      b.hit = res.hit;
    }
    // vesicles: a cluster in the terminal, and the released quanta drifting into the cleft
    var Rv2 = RD.fork('ves' + bi), nrel = Math.round({ 'Faint': 14, 'Steady': 30, 'Violent': 60 }[charge] * (trans === 'Failed' ? 0.3 : 1) * (trans === 'Repeated' ? 1.6 : 1));
    var dx = b.tx - b.x, dy = b.ty - b.y, dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
    for (var v = 0; v < nrel; v++) { var s = Math.pow(Rv2.rand(), 1.6) * dl * (trans === 'Failed' ? 0.35 : 0.75), sp = Rv2.gaussian(0, 6 + s * 0.35); VES.push(b.x + dx * (b.r + s) - dy * sp, b.y + dy * (b.r + s) + dx * sp, Rv2.range(1.1, 2.0)); }
  });

  TT('dbm');
  // ======================= render =======================
  var cv = C.setupCanvas(VW, VH, '#0b0a09'), ctx = cv.ctx, PW = cv.canvas.width, PH = cv.canvas.height, PN = PW * PH, k = PW / VW;
  var ZM = objective === 'x60' ? clamp(Math.min(1.75, 940 / TXT.width), 1.22, 1.75) : 1, FXc = lerp(wcx, boutons[0].x, 0.3), FYc = lerp((capTop + base) / 2, boutons[0].y, 0.4);
  if (ZM === 1) { FXc = VW / 2; FYc = VH / 2; }
  var slack = Math.max(0, (VW / ZM - TXT.width * Math.abs(Math.cos(rot))) / 2 - 20); FXc = clamp(FXc, wcx - slack, wcx + slack); FXc = clamp(FXc, VW / 2 / ZM, VW - VW / 2 / ZM); FYc = clamp(FYc, VH / 2 / ZM, VH - VH / 2 / ZM);
  var XF = true; function vx_(x) { return XF ? (x - FXc) * ZM + VW / 2 : x; } function vy_(y) { return XF ? (y - FYc) * ZM + VH / 2 : y; } function vs_(r) { return XF ? r * ZM : r; }
  var NL = 4, LB = [0, 1.3, 3.6, 8.5], LS = [1, 1, 0.5, 0.25], LAY = [];
  function mkBuf(sc) { var w = Math.max(8, Math.round(PW * sc)), h = Math.max(8, Math.round(PH * sc)); return { w: w, h: h, k: k * w / PW, d: new Float32Array(w * h) }; }
  for (var li = 0; li < NL; li++) LAY.push(mkBuf(stain === 'Cajal Plate' && li ? 1 : LS[li]));
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
  // rasterise the stain into depth layers (soft assignment between neighbouring layers)
  var focus = stain === 'Cajal Plate' ? 0 : RM.gaussian(0, 0.12);
  for (var s0 = 0; s0 < SEG.length; s0 += 9) {
    var z = Math.abs(SEG[s0 + 6] - focus), zz = clamp(z / 0.9, 0, NL - 1.001), l0 = Math.floor(zz), f = zz - l0, d0 = SEG[s0 + 7];
    if (stain === 'Cajal Plate') { l0 = 0; f = 0; var dwm = dWord((SEG[s0] + SEG[s0 + 3]) / 2, (SEG[s0 + 1] + SEG[s0 + 4]) / 2); d0 *= Math.min(lerp(1, 0.36, sstep(0.4, 2.2, z)), lerp(1, 0.4, sstep(3, 16, dwm))); if (dwm < 4) { SEG[s0 + 2] *= 1.25; SEG[s0 + 5] *= 1.25; } }
    if (f < 0.98) capsule(LAY[l0], SEG[s0], SEG[s0 + 1], SEG[s0 + 2], SEG[s0 + 3], SEG[s0 + 4], SEG[s0 + 5], d0 * (1 - f));
    if (f > 0.02) capsule(LAY[l0 + 1], SEG[s0], SEG[s0 + 1], SEG[s0 + 2], SEG[s0 + 3], SEG[s0 + 4], SEG[s0 + 5], d0 * f);
  }
  TT('raster'); for (li = 1; li < NL; li++) blur(LAY[li], stain === 'Cajal Plate' ? 0 : LB[li] * ZM);
  function fillPolys(B, polys, amt) {   // nonzero scanline fill with 4 sub-scanlines, coordinates in virtual units
    var kk = B.k, W = B.w, H = B.h, y0 = 1e9, y1 = -1e9, x0 = 1e9, x1 = -1e9, E = [];
    polys.forEach(function (q) { var n = q.length; for (var j = 0; j < n; j += 2) { var ax = vx_(q[j]) * kk, ay = vy_(q[j + 1]) * kk, bx = vx_(q[(j + 2) % n]) * kk, by = vy_(q[(j + 3) % n]) * kk; if (ay !== by) E.push(ax, ay, bx, by); y0 = Math.min(y0, ay); y1 = Math.max(y1, ay); x0 = Math.min(x0, ax); x1 = Math.max(x1, ax); } });
    var X0 = Math.max(0, Math.floor(x0) - 1), X1 = Math.min(W - 1, Math.ceil(x1) + 1), cov = new Float32Array(X1 - X0 + 2);
    for (var y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
      cov.fill(0);
      for (var sub = 0; sub < 4; sub++) {
        var sy = y + (sub + 0.5) / 4, X = [];
        for (var e = 0; e < E.length; e += 4) { var ay2 = E[e + 1], by2 = E[e + 3]; if ((ay2 <= sy && by2 > sy) || (by2 <= sy && ay2 > sy)) X.push([E[e] + (sy - ay2) / (by2 - ay2) * (E[e + 2] - E[e]), by2 > ay2 ? 1 : -1]); }
        X.sort(function (a, b) { return a[0] - b[0]; });
        var wn = 0;
        for (var c = 0; c < X.length - 1; c++) {
          wn += X[c][1]; if (!wn) continue;
          var xa = X[c][0] - X0, xb = X[c + 1][0] - X0; if (xb <= xa) continue;
          var ia = Math.floor(xa), ib = Math.floor(xb);
          if (ia === ib) cov[ia] += (xb - xa) / 4; else { cov[ia] += (ia + 1 - xa) / 4; for (var m = ia + 1; m < ib; m++) cov[m] += 0.25; if (ib < cov.length) cov[ib] += (xb - ib) / 4; }
        }
      }
      for (var xx = X0; xx <= X1; xx++) { var v = Math.min(1, cov[xx - X0]) * amt, ii = y * W + xx; if (v > B.d[ii]) B.d[ii] = v; }
    }
  }
  function text(B, fk, str, size, x, y, amt, align) { var L = layout(fk, str, size, 0, 0, 0, 0.0), dx = align === 'l' ? L.width / 2 : 0; L.letters.forEach(function (le) { fillPolys(B, le.polys.map(function (q) { var o = new Float32Array(q.length); for (var j = 0; j < q.length; j += 2) { o[j] = q[j] + x + dx; o[j + 1] = q[j + 1] + y; } return o; }), amt); }); }
  function arrow(B, x, y, dx, dy, sz, w, amt) { var l = Math.hypot(dx, dy) + 1e-9; dx /= l; dy /= l; var c = Math.cos(0.42), sn = Math.sin(0.42); capsule(B, x, y, w, x - (dx * c - dy * sn) * sz, y - (dx * sn + dy * c) * sz, w * 0.7, amt); capsule(B, x, y, w, x - (dx * c + dy * sn) * sz, y - (-dx * sn + dy * c) * sz, w * 0.7, amt); }
  // spark layers
  var SC = mkBuf(1), SH = mkBuf(0.2), SS = mkBuf(0.5), VB = mkBuf(1);
  var spW = { 'Faint': 1.3, 'Steady': 1.8, 'Violent': 2.4 }[charge];
  for (var q0 = 0; q0 < SPK.length; q0 += 7) {
    var I0 = SPK[q0 + 4], runF = trans === 'Repeated' ? [1, 0.45, 0.22][SPK[q0 + 5]] : 1, mainC = SPK[q0 + 6];
    var wdt = mainC ? spW * (trans === 'Failed' ? 0.5 : 1) * (0.45 + 0.55 * I0) : spW * (0.25 + 0.75 * I0) * 0.6, am = (mainC ? 1 : 0.35 + 0.6 * I0) * runF;
    capsule(SC, SPK[q0], SPK[q0 + 1], wdt, SPK[q0 + 2], SPK[q0 + 3], wdt, am);
    capsule(SH, SPK[q0], SPK[q0 + 1], wdt, SPK[q0 + 2], SPK[q0 + 3], wdt, am); capsule(SS, SPK[q0], SPK[q0 + 1], wdt, SPK[q0 + 2], SPK[q0 + 3], wdt, am);
  }
  boutons.forEach(function (b) { if (b.hx == null || stain === 'Cajal Plate') return; capsule(SH, b.hx, b.hy, 7, b.hx, b.hy, 0, 0.9); capsule(SS, b.hx, b.hy, 3.5, b.hx, b.hy, 0, 0.8); capsule(SH, b.x, b.y, b.r * 1.3, b.x, b.y, 0, 0.5); });
  for (var vi = 0; vi < VES.length; vi += 3) capsule(VB, VES[vi], VES[vi + 1], VES[vi + 2], VES[vi], VES[vi + 1], VES[vi + 2] * 0.0, 1);
  if (stain === 'Cajal Plate') {   // Cajal's arrows of dynamic polarisation, figure letters, plate number
    var Rf = RM.fork('plate');
    boutons.forEach(function (b) { var m = b.main || []; if (m.length > 12) [0.45, 0.8].forEach(function (f) { var j = Math.floor(m.length * f), a = m[Math.max(0, j - 3)], c = m[Math.min(m.length - 1, j + 3)]; arrow(SC, m[j][0], m[j][1], c[0] - a[0], c[1] - a[1], 7, 0.9, 1); }); });
    AXP.forEach(function (pts) { if (pts.length < 30) return; [0.3, 0.62].forEach(function (f) { var j = Math.floor(pts.length * f), a = pts[j - 2], c = pts[j + 2]; var nx = -(c[1] - a[1]), ny = c[0] - a[0], nl = Math.hypot(nx, ny) + 1e-9; arrow(LAY[0], pts[j][0] + nx / nl * 9, pts[j][1] + ny / nl * 9, c[0] - a[0], c[1] - a[1], 7, 0.75, 0.9); capsule(LAY[0], pts[j][0] + nx / nl * 9 - (c[0] - a[0]) / Math.hypot(c[0] - a[0], c[1] - a[1]) * 16, pts[j][1] + ny / nl * 9 - (c[1] - a[1]) / Math.hypot(c[0] - a[0], c[1] - a[1]) * 16, 0.75, pts[j][0] + nx / nl * 9, pts[j][1] + ny / nl * 9, 0.75, 0.9); }); });
    var lA = send.inFrame ? [send.x + 26, send.y - 22] : null, lB = [somaX + somaR + 14, somaY + 30 * UP];
    function lab(fk, ch, sz, x, y) { var X = vx_(x), Y = vy_(y); if (X < 30 || Y < 40 || X > VW - 40 || Y > VH - 20) return; XF = false; text(LAY[0], fk, ch, sz, X, Y, 0.95, 'l'); XF = true; }
    if (lA) lab('R', 'A', 26, lA[0], lA[1]);
    lab('R', 'B', 26, lB[0], lB[1]);
    boutons.forEach(function (b, bi) { lab('I', 'abcde'[bi], 22, b.x + b.r * 1.2 + 6, b.y - 4); });
    XF = false; text(LAY[0], 'I', 'Fig. ' + Rf.int(3, 47) + '.', 26, 70, VH - 62, 0.95, 'l'); XF = true;
  }
  blur(SH, 11 * ZM); blur(SS, 2.2 * ZM);
  // background fields on a fixed 2-unit grid (resolution independent and cheap)
  var BGW = 501, BGH = 626, BN1 = new Float32Array(BGW * BGH), BN2 = new Float32Array(BGW * BGH), BN3 = new Float32Array(BGW * BGH), BN4 = new Float32Array(BGW * BGH);
  for (var gy = 0; gy < BGH; gy++) for (var gx = 0; gx < BGW; gx++) { var vx = gx * 2, vy = gy * 2, gi = gy * BGW + gx; BN1[gi] = NZ.fbm(vx * 0.004, vy * 0.004, 3); BN2[gi] = NZ.fbm(vx * 0.03 + 7, vy * 0.03, 3); BN3[gi] = NZ.n2(vx * 0.18, vy * 0.18); BN4[gi] = NZ.fbm(vx * 0.01 + 30, vy * 0.01, 3); }
  function bg(F, vx, vy) { var fx = vx / 2, fy = vy / 2, x0 = Math.min(BGW - 2, fx | 0), y0 = Math.min(BGH - 2, fy | 0), tx = fx - x0, ty = fy - y0, i0 = y0 * BGW + x0; return (F[i0] * (1 - tx) + F[i0 + 1] * tx) * (1 - ty) + (F[i0 + BGW] * (1 - tx) + F[i0 + BGW + 1] * tx) * ty; }
  TT('blur'); var img = ctx.createImageData(PW, PH), px8 = img.data, seedI = (C.rng('px').rand() * 4294967296) >>> 0;
  function hash(i) { i = (i ^ seedI) >>> 0; i = Math.imul(i ^ (i >>> 16), 0x7feb352d); i = Math.imul(i ^ (i >>> 15), 0x846ca68b); return ((i ^ (i >>> 16)) >>> 0) / 4294967296; }
  var Rk2 = RM.fork('look'), warm = Rk2.range(0, 1), AG = 1.7, mos = 0.36 * sstep(0.6, 1.8, AG * k), AGr = [2.0, 0.62, 0.5], AGg = [0.55, 1.75, 0.62], AGb = [0.45, 0.63, 1.88], AGd = [0.3, 0.3, 0.3], AGC = [AGd, AGr, AGg, AGb], AGW = Math.ceil(VW / AG) + 4, AGH = Math.ceil(VH / AG) + 4, AJX = new Float32Array(AGW * AGH), AJY = new Float32Array(AGW * AGH), AGT = new Uint8Array(AGW * AGH);
  if (stain === 'Autochrome') { var Rag = RM.fork('grain'); for (var ag = 0; ag < AGW * AGH; ag++) { AJX[ag] = (Rag.rand() - 0.5) * 0.9 * AG; AJY[ag] = (Rag.rand() - 0.5) * 0.9 * AG; var ht = Rag.rand(); AGT[ag] = ht < 0.035 ? 0 : ht < 0.36 ? 1 : ht < 0.69 ? 2 : 3; } }
  for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
    var i = y * PW + x, vx2 = x / k, vy2 = y / k;
    var l0v = LAY[0].d[i], od = l0v * 2.6 + LAY[1].d[i] * 2.0 + sampleB(LAY[2], x, y) * 1.35 + sampleB(LAY[3], x, y) * 1.0, sp = SC.d[i], halo = sampleB(SH, x, y), soft = sampleB(SS, x, y), ves = VB.d[i];
    var n1 = bg(BN1, vx2, vy2), n2 = bg(BN2, vx2, vy2), n3 = bg(BN3, vx2, vy2), n4 = bg(BN4, vx2, vy2);
    var r, g, b;
    if (stain === 'Golgi Section') {
      var u = vx2 / VW - 0.5, v = vy2 / VH - 0.5, lamp = 1.05 - 0.55 * (u * u + v * v) * 1.6;
      var bgR = lerp(0.93, 0.80, 0.5 + 0.5 * n1), bgG = lerp(0.78, 0.56, 0.5 + 0.5 * n1 + warm * 0.2), bgB = lerp(0.48, 0.26, 0.5 + 0.5 * n1 + warm * 0.3);
      var tis = 0.06 + 0.05 * n2 + 0.025 * n3 + ves * 0.5;
      var T = od + tis;
      r = bgR * lamp * Math.exp(-2.3 * T * 0.95); g = bgG * lamp * Math.exp(-2.3 * T * 1.05); b = bgB * lamp * Math.exp(-2.3 * T * 1.2);
      r += sp * 1.1 + soft * 0.35 + halo * 0.9; g += sp * 1.05 + soft * 0.28 + halo * 0.45; b += sp * 0.95 + soft * 0.18 + halo * 0.18;
    } else if (stain === 'Cajal Plate') {
      var fib = n3 * 0.5, fox = sstep(0.55, 0.7, n4) * 0.45;
      var pr2 = 0.95 - 0.03 * n1 - fox * 0.25 + fib * 0.012, pg2 = 0.91 - 0.04 * n1 - fox * 0.35 + fib * 0.012, pb2 = 0.82 - 0.06 * n1 - fox * 0.5 + fib * 0.012;
      var ink = Math.min(3.2, l0v * (2.7 + 0.25 * n3)) + ves * 0.0;
      var red = Math.min(1.4, sp * 1.1 + soft * 0.15);
      r = pr2 * Math.exp(-ink * 1.0) * Math.exp(-red * 0.08); g = pg2 * Math.exp(-ink * 1.02) * Math.exp(-red * 1.5); b = pb2 * Math.exp(-ink * 1.1) * Math.exp(-red * 1.9);
      var ring = ves; if (ring > 0) { r *= 1 - ring * 0.6; g *= 1 - ring * 0.62; b *= 1 - ring * 0.65; }
    } else {   // Autochrome: the section photographed on a Lumiere starch-grain colour plate (a process Cajal practised)
      var ua = vx2 / VW - 0.5, va2 = vy2 / VH - 0.5, lampA = 1.08 - 0.75 * (ua * ua + va2 * va2) * 1.6;
      var Ta = od + 0.05 + 0.04 * n2 + 0.02 * n3 + ves * 0.5;
      var bl = n4, rose = 0.5 + 0.5 * n1; r = (0.84 + 0.08 * rose + 0.04 * bl) * lampA * Math.exp(-2.3 * Ta * 0.82); g = (0.70 + 0.08 * (1 - rose) + 0.06 * bl) * lampA * Math.exp(-2.3 * Ta * 0.95); b = (0.50 + 0.07 * rose - 0.06 * bl) * lampA * Math.exp(-2.3 * Ta * 0.92);
      var shg = 1 - Math.exp(-2.3 * Ta); r += shg * 0.05; g += shg * 0.02; b += shg * 0.035;
      r += sp * 1.0 + soft * 0.4 + halo * 0.8; g += sp * 0.95 + soft * 0.3 + halo * 0.45; b += sp * 0.95 + soft * 0.32 + halo * 0.4;
      // grain mosaic: nearest jittered starch grain (in virtual units, so the mosaic is part of the image)
      var gcx = vx2 / AG | 0, gcy = vy2 / AG | 0, bdg = 9, gid = 0, gt = 0;
      for (var oy2 = 0; oy2 <= 2; oy2++) for (var ox2 = 0; ox2 <= 2; ox2++) { var cid = (gcy + oy2) * AGW + gcx + ox2, jx = (gcx + ox2 - 0.5) * AG + AJX[cid] - vx2, jy = (gcy + oy2 - 0.5) * AG + AJY[cid] - vy2, dg = jx * jx + jy * jy; if (dg < bdg) { bdg = dg; gt = AGT[cid]; } }
      var Gc = AGC[gt];
      r *= 1 + (Gc[0] - 1) * mos; g *= 1 + (Gc[1] - 1) * mos; b *= 1 + (Gc[2] - 1) * mos;
      r = 0.035 + r * 0.9; g = 0.03 + g * 0.88; b = 0.04 + b * 0.84;
    }
    var gn = (hash(i * 7 + 3) + hash(i * 13 + 5) - 1) * 0.03;
    px8[i * 4] = clamp(Math.pow(clamp(r, 0, 1), 1 / 2.2) + gn, 0, 1) * 255;
    px8[i * 4 + 1] = clamp(Math.pow(clamp(g, 0, 1), 1 / 2.2) + gn, 0, 1) * 255;
    px8[i * 4 + 2] = clamp(Math.pow(clamp(b, 0, 1), 1 / 2.2) + gn, 0, 1) * 255;
    px8[i * 4 + 3] = 255;
  }
  TT('shade'); ctx.putImageData(img, 0, 0);
  if (window.__dbg) console.log(JSON.stringify({ UP: UP, somaY: somaY, capTop: capTop, base: base, em: em, attr: AX.length, nodes: RT.x.length, segs: SEG.length / 9, spk: SPK.length / 7 }));
  C.plottable = false;
  C.done(cv.canvas, 'twenty-nanometres');
})();

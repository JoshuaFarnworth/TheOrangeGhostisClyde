/* Measured, by Clyde (2027).
 * The side of a kitchen door frame where a family pencilled their children's heights, one line per birthday.
 * Engine: each child grows along the Preece-Baines (1978) model 1 curve with individual parameters (adult height,
 * height and timing of the pubertal spurt); a parent measures on (most) birthdays with a book on the head, so a
 * line runs from the opening edge across the architrave, slightly tilted, with initials and age beside it in one
 * consistent hand. Implements drift (pencil, then a biro, a marker once). The frame has a moulded profile lit from
 * the window side; the painted surface has brush streaks; graphite catches on the paint's tooth. Families repaint:
 * sometimes over the marks (they ghost through), sometimes carefully around them. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RK = R.fork('kids'), RM = R.fork('marks'), RW = R.fork('wall'), RH = R.fork('hand');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep;
  var VW = 800, VH = 1600;
  var nK = RK.weighted([[1, 22], [2, 44], [3, 26], [4, 8]]);
  var painted = RW.weighted([['Never', 62], ['Painted Over', 18], ['Painted Around', 20]]);
  var also = RK.weighted([['None', 78], ['A Parent', 22]]);
  function pb(age, h1, hs, s0, s1, th) { return h1 - 2 * (h1 - hs) / (Math.exp(s0 * (age - th)) + Math.exp(s1 * (age - th))); }
  var kids = [], marks = [], year0 = RK.int(1979, 2014), born = year0, tmax = 0;
  var handSlant = RH.range(0.05, 0.4), handH = RH.range(0.9, 1.5), lineLen = RH.range(4.5, 8.5), sideL = RH.chance(0.5), tiltBias = RH.gaussian(0, 0.012);
  for (var k = 0; k < nK; k++) {
    var girl = RK.chance(0.5), h1 = girl ? RK.gaussian(163, 6) : RK.gaussian(176, 7), hs = h1 - RK.range(10, 16), th = girl ? RK.gaussian(11.8, 0.9) : RK.gaussian(13.9, 1.0);
    var s0 = RK.range(0.09, 0.13), s1 = RK.range(1.0, 1.4), a0 = RK.int(2, 4), a1;
    born += k ? RK.int(1, 5) : 0;
    kids.push({ girl: girl, h1: h1, hs: hs, th: th, s0: s0, s1: s1, born: born, ink: RK.fork('k' + k) });
  }
  var lastYear = born + RK.int(3, 16);   // when the family stopped (moved, or the youngest stopped asking)
  var grown = 0;
  kids.forEach(function (kd, k) {
    var a0 = RM.int(2, 4) + (k === 0 && nK > 2 ? RM.int(0, 3) : 0), aEnd = Math.min(lastYear - kd.born, RM.int(11, 18));
    if (aEnd >= 15) grown++;
    var tilt = tiltBias + RM.gaussian(0, 0.01);
    for (var a = a0; a <= aEnd; a++) {
      if (a > a0 && RM.chance(a > 10 ? 0.28 : 0.12)) continue;   // missed birthdays; more often once older
      var h = pb(a, kd.h1, kd.hs, kd.s0, kd.s1, kd.th) + RM.gaussian(0, 0.35) - (a < 4 ? RM.range(0, 1.2) : 0);   // wriggling toddlers
      var yr = kd.born + a, imp = yr - year0 < 6 ? 'Pencil' : RM.weighted([['Pencil', 70], ['Biro', 24], ['Marker', 6]]);
      marks.push({ h: h, k: k, age: a, year: yr, imp: imp, tilt: tilt + RM.gaussian(0, 0.008), len: lineLen * RM.range(0.75, 1.2), x0: RM.gaussian(0, 0.4), labelSide: sideL ? 0 : 1, rs: RM.rand() * 1e6 });
    }
  });
  if (also === 'A Parent') marks.push({ h: RM.gaussian(172, 8), k: -1, age: 40, year: year0 + 3, imp: 'Pencil', tilt: tiltBias, len: lineLen * 1.4, x0: 0, labelSide: sideL ? 0 : 1, rs: RM.rand() * 1e6 });
  if (false) marks.push({ h: RM.range(48, 64), k: -2, age: 0, year: year0 + 5, imp: 'Pencil', tilt: tiltBias, len: lineLen * 0.8, x0: 0, labelSide: sideL ? 0 : 1, rs: RM.rand() * 1e6 });
  var repaintYear = painted === 'Never' ? 1e9 : year0 + Math.round((lastYear - year0) * RW.range(0.35, 0.75));
  // framing: fit the marks, 2:3 portrait
  var hMin = Infinity, hMax = -Infinity; marks.forEach(function (m) { if (m.k < 0) return; hMin = Math.min(hMin, m.h); hMax = Math.max(hMax, m.h); });
  var FH = clamp((hMax - hMin) + 14, 40, 64), FW = FH / 2, top = hMax - hMin + 14 <= FH ? hMax + (FH - (hMax - hMin)) * 0.45 : RW.range(hMin + FH - 6, hMax + 6);
  if (also === 'A Parent' && marks[marks.length - 1].h > top - 1) also = 'None';
  var arW = RW.range(6.5, 9), openX = FW * RW.range(0.72, 0.84), arX = openX - 0.35 - arW;   // wall | architrave | stop + opening
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH;
  var GR = new Float32Array(N), BI = new Float32Array(N), MK = new Float32Array(N), OLD = new Float32Array(N), tmp;
  function toPx(x, h) { return [x * ppc, (top - h) * ppc]; }
  marks.forEach(function (m) {
    var rs = m.rs, rr = function () { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
    var xA = openX - 0.2 + m.x0, xB = xA - m.len, yA = m.h, yB = m.h + m.tilt * m.len;
    var buf = m.year >= repaintYear || painted === 'Never' ? (m.imp === 'Biro' ? BI : m.imp === 'Marker' ? MK : GR) : OLD;
    var wpx = Math.max(0.6, (m.imp === 'Marker' ? 0.2 : m.imp === 'Biro' ? 0.07 : 0.085) * ppc), segs = [], press = [];
    for (var s = 0; s <= 24; s++) { var t = s / 24; segs.push(toPx(lerp(xA, xB, t) + 0.03 * Math.sin(t * 9 + rs), lerp(yA, yB, t) + 0.025 * Math.sin(t * 13 + rs * 2))); press.push(m.imp === 'Pencil' ? 0.7 + 0.3 * Math.sin(t * Math.PI) * (0.8 + 0.4 * rr()) : 1); }
    PX.line(buf, PW, PH, segs, wpx, m.imp === 'Pencil' ? 0.95 : 1, press);
    // label: initials + age, beside the line on the wall side
    var n = m.k === -2 ? 3 : m.k === -1 ? 3 : 2 + (m.age > 9 ? 2 : 1), lx = Math.max(xB, arX - 1.5) + 0.25, ly = yB + 0.3;
    PX.scribble(rr, lx, -ly, handH * 0.42, n, handSlant).forEach(function (st) {
      var pts = st.map(function (p) { return toPx(p[0], -p[1]); });
      PX.line(buf, PW, PH, pts, wpx * 0.85, m.imp === 'Pencil' ? 0.85 : 0.95);
    });
  });
  // a round of repainting: marks before it lie under one coat
  var wallC = PX.col(RW.pick(['#e9e4d8', '#dcd8cc', '#e6dccb', '#d5dbd3', '#e8e0d0'])), trimC = PX.col(RW.pick(['#f1eee6', '#ece8de', '#e9e6df'])), farC = PX.col(RW.pick(['#5a4d3e', '#4a4c48', '#6b5a48']));
  var aroundBox = null;
  if (painted === 'Painted Around') { var oh = [], ox = []; marks.forEach(function (m) { if (m.year < repaintYear) { oh.push(m.h); } }); if (oh.length) aroundBox = { h0: Math.min.apply(null, oh) - 2.5, h1: Math.max.apply(null, oh) + 3, x0: openX - lineLen * 1.25 - 6.5 - RW.range(0, 2), x1: openX }; }
  var seed = RW.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  var lx0 = -0.75, lz0 = 0.66;   // window light from the left, raking a little
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc, Hh = top - (py + 0.5) / ppc, r, g, b, nx = 0, shade = 1;
    var light = 0.82 + 0.25 * (1 - X / FW) - 0.04 * (Hh - top + FH / 2) / FH;
    if (X < arX) {   // wall: matt emulsion with roller stipple
      var st = 0.97 + 0.03 * PX.fbm(X * 6, Hh * 6, seed, 3) + 0.012 * PX.vnoise(X * 40, Hh * 40, seed + 1);
      r = wallC[0] * st; g = wallC[1] * st; b = wallC[2] * st; shade = 1 - 0.18 * Math.exp(-(arX - X) / 0.35);
    } else if (X < arX + arW) {   // architrave: moulded profile, gloss paint with brush streaks along its length
      var u = (X - arX) / arW;
      function zp(q) { return q < 0.06 ? q / 0.06 * 0.35 : q < 0.62 ? 0.35 + 0.25 * (q - 0.06) / 0.56 + 0.1 * Math.exp(-Math.pow((q - 0.14) / 0.03, 2)) : 0.6 + 1.0 * Math.sqrt(Math.max(0, 1 - Math.pow((q - 0.62 - 0.38) / 0.38, 2))) * 0.6; }
      var dz = (zp(u + 0.004) - zp(u - 0.004)) / (0.008 * arW); nx = -dz / Math.sqrt(1 + dz * dz); var nz = 1 / Math.sqrt(1 + dz * dz);
      shade = clamp(0.25 + 0.75 * (nx * lx0 + nz * lz0) / lz0, 0.25, 1.3) * (1 - 0.12 * Math.exp(-u / 0.02));
      var brush = 0.985 + 0.02 * PX.vnoise(X * 28, Hh * 0.6, seed + 2) + 0.006 * PX.vnoise(X * 90, Hh * 2, seed + 3);
      var grime = 0.07 * Math.exp(-Math.pow((Hh - 112) / 18, 2)) * sstep(0.5, 1, u);
      r = trimC[0] * brush * (1 - grime); g = trimC[1] * brush * (1 - grime * 1.05); b = trimC[2] * brush * (1 - grime * 1.2);
      if (painted !== 'Never') { var drip = PX.vnoise(X * 3, Hh * 0.2, seed + 4) > 0.85 ? 0.98 : 1; r *= drip; g *= drip; b *= drip; }
    } else if (X < openX) { r = trimC[0] * 0.5; g = trimC[1] * 0.48; b = trimC[2] * 0.46; shade = 0.6;
    } else {   // the next room, unfocused
      var f = 0.42 + 0.1 * PX.fbm(X * 0.05, Hh * 0.03, seed + 5, 3) + 0.25 * sstep(0.3, 0.7, PX.vnoise(X * 0.06 + 3, 1.5, seed + 6) * 0.5 + 0.5); r = farC[0] * f; g = farC[1] * f; b = farC[2] * f; shade = 0.5 * (1 - 0.7 * Math.exp(-(X - openX) / 2.5)); light = 1;
    }
    if (aroundBox && X > aroundBox.x0 && X < aroundBox.x1 && Hh > aroundBox.h0 && Hh < aroundBox.h1) {   // older paint left untouched: yellowed, the cut-in edge a faint ridge
      var ed = Math.min(X - aroundBox.x0, aroundBox.x1 - X, Hh - aroundBox.h0, aroundBox.h1 - Hh); r *= 0.975; g *= 0.955; b *= 0.89; if (ed < 0.12) { var rg = 1 - 0.05 * (1 - ed / 0.12); r *= rg; g *= rg; b *= rg; }
    }
    var tooth = 0.75 + 0.25 * PX.vnoise(X * 160, Hh * 160, seed + 7), gr = GR[I] * tooth, bi = BI[I], mk = MK[I], old = OLD[I];
    if (old > 0) { var ghost = aroundBox ? 1 : 0.14; if (aroundBox) { r *= 1 - old * 0.55 * tooth; g *= 1 - old * 0.55 * tooth; b *= 1 - old * 0.5 * tooth; } else { r *= 1 - old * ghost; g *= 1 - old * ghost; b *= 1 - old * ghost * 0.9; } }
    r *= 1 - gr * 0.78; g *= 1 - gr * 0.78; b *= 1 - gr * 0.74;
    r = lerp(r, 0.035, bi * 0.85); g = lerp(g, 0.04, bi * 0.85); b = lerp(b, 0.12, bi * 0.85);
    r = lerp(r, 0.02, mk * 0.92); g = lerp(g, 0.022, mk * 0.92); b = lerp(b, 0.03, mk * 0.92);
    var sheen = gr * 0.18 * Math.max(0, nx * lx0); r += sheen; g += sheen; b += sheen;
    Rr[I] = r * shade * light; Gg[I] = g * shade * light; Bb[I] = b * shade * light;
  }
  var lastAges = kids.map(function (kd, k) { var a = 0; marks.forEach(function (m) { if (m.k === k) a = Math.max(a, m.age); }); return a; });
  C.features({ Children: nK, 'First Mark': year0 + (marks.length ? 0 : 0), 'Last Mark': Math.max.apply(null, marks.map(function (m) { return m.year; })), Grown: grown === nK ? 'All' : grown ? 'Some' : 'Still Growing', Lines: marks.length, Paint: painted, Also: also });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.05, filmic: false, grain: 0.012, vig: 0.22, seed: 13 });
  C.done(o.cv.canvas, 'measured');
})();

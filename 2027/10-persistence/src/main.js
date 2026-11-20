/* Persistence, by Clyde (2027).
 * Lying on your back, looking straight up. Somebody you will never meet went over an hour ago; the sky has kept it.
 * Engine: a contrail model. Aircraft fly great circles (straight lines in this gnomonic, straight-up view) at
 * cruise altitude; behind each, the trail's age grows with distance. In dry air the trail sublimates within
 * a short visible stub; in an ice-supersaturated layer it persists, spreads by turbulent diffusion
 * (width ~ sqrt(age)) and by wind shear (linear in age), drifts downwind, and develops the Crow instability
 * (a chain of puffs, not a comb) after a few minutes. Brightness is ice-cloud scattering: strong forward scattering
 * near the sun; at dusk the trails are still sunlit at 10 km while the ground is in shadow. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RS = R.fork('sky'), RA = R.fork('air'), RE = R.fork('edge');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1250, FOV = 0.62;
  var Q = C.platform === 'standalone' ? C.query : null;
  var hour = RS.weighted([['Morning', 30], ['Midday', 22], ['Late Afternoon', 26], ['After Sunset', 22]]);
  var air = RA.weighted([['Dry', 14], ['Humid', 52], ['Very Humid', 34]]);
  var traffic = RA.weighted([['One', 36], ['Two', 32], ['A Few', 24], ['Corridor', 8]]);
  var edge = RE.weighted([['Open Sky', 36], ['Wires', 36], ['Roof Edge', 28]]);
  if (air === 'Dry' && edge === 'Open Sky' && RE.chance(0.55)) edge = RE.pick(['Wires', 'Roof Edge']);
  if (Q && Q.get('hour')) hour = Q.get('hour'); if (Q && Q.get('air')) air = Q.get('air');
  var sunEl = { 'Morning': RS.range(0.25, 0.5), 'Midday': RS.range(0.8, 1.1), 'Late Afternoon': RS.range(0.12, 0.3), 'After Sunset': RS.range(-0.1, -0.03) }[hour], sunAz = RS.range(0, 2 * PI);
  var sun = [Math.cos(sunAz) * Math.cos(sunEl), Math.sin(sunAz) * Math.cos(sunEl), Math.sin(sunEl)];
  var windA = RA.range(0, 2 * PI), wind = RA.range(0.004, 0.02), shear = RA.range(0.2, 1.0);
  var nP = { 'One': 1, 'Two': 2, 'A Few': RA.int(3, 4), 'Corridor': RA.int(5, 7) }[traffic], planes = [];
  var corrA = RA.range(0, PI);
  for (var k = 0; k < nP; k++) {
    var a = traffic === 'Corridor' ? corrA + RA.gaussian(0, 0.06) : RA.range(0, PI), dir = RA.pick([1, -1]);
    var ux = Math.cos(a) * dir, uy = Math.sin(a) * dir, nx = -Math.sin(a), ny = Math.cos(a);
    var off = RA.range(-0.42, 0.42);
    var pers = air === 'Dry' ? 0 : air === 'Humid' ? (RA.chance(0.6) ? 1 : 0) : 1;
    if (air === 'Humid' && k === 0) pers = 1;
    if (air === 'Dry' && k === 0) pers = 0;
    var v = 0.08, ageHead, head;
    // s increases along the flight path; the aircraft sits at s = head, and the trail exists for s < head.
    // always place head at the +s side so the visible frame is behind the aircraft, never ahead of it.
    if (!pers) {
      head = (k === 0) ? RA.range(-0.15, 0.55) : RA.range(-0.2, 0.7);
      ageHead = 0;
    } else {
      ageHead = (k === 0) ? RA.range(0, 8) : RA.range(5, 50);
      var headIn = RA.chance(k === 0 && ageHead < 4 ? 0.4 : 0.06);
      head = headIn ? RA.range(0.15, 0.55) : (0.95 + RA.range(0, 0.7));
    }
    planes.push({ ux: ux, uy: uy, nx: nx, ny: ny, off: off, head: head, ageHead: ageHead, pers: pers, v: v, w0: pers ? 0.0025 : 0.002, fade: pers ? 1e9 : RA.range(0.14, 0.28), seed: RA.rand() * 100, crowLam: RA.range(0.18, 0.30) });
  }
  var o = PX.canvas(C, VW, VH, '#0d1220'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var dusk = hour === 'After Sunset', seed = (RS.rand() * 1e6) | 0;
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, x = (px / PW - 0.5) * 2 * FOV, y = (py / PH - 0.5) * 2 * FOV * VH / VW;
    var dl = Math.hypot(x, y, 1), d = [x / dl, -y / dl, 1 / dl], cs = d[0] * sun[0] + d[1] * sun[1] + d[2] * sun[2], zen = 1 / dl;
    var lum = dusk ? 0.07 + 0.14 * Math.max(0, cs + 0.25) : 0.28 + 0.32 * Math.pow(Math.max(0, cs), 5) + 0.22 * Math.pow(1 - zen, 1.5) * 2.6;
    var sky = dusk ? [0.2 * lum * 3 + 0.04, 0.22 * lum * 3 + 0.045, 0.5 * lum * 3 + 0.09] : [0.17 * lum, 0.33 * lum, 0.86 * lum];
    if (hour === 'Late Afternoon') { var w = Math.max(0, cs) * 0.28; sky[0] += w * 0.55; sky[1] += w * 0.32; sky[2] += w * 0.08; }
    if (hour === 'Morning') { var wm = Math.max(0, 1 - zen) * 0.08; sky[0] += wm * 0.25; sky[1] += wm * 0.12; }
    var r = sky[0], g = sky[1], b = sky[2];
    for (var k2 = 0; k2 < planes.length; k2++) {
      var p = planes[k2], s = x * p.ux + y * p.uy, t = x * p.nx + y * p.ny - p.off;
      var behind = p.head - s; if (behind < -0.006) continue;
      var age = Math.max(0, p.ageHead + behind / p.v);
      var keep = Math.exp(-behind / p.fade);
      if (keep < 0.012) continue;
      var drift = wind * age * Math.cos(windA - Math.atan2(p.ny, p.nx));
      var width = p.w0 + 0.0028 * Math.sqrt(age) + 0.0009 * shear * age;
      var crowOn = p.pers ? sstep(5, 14, age) * sstep(48, 18, age) : 0;
      var crowLam = p.crowLam * (1 + 0.2 * PX.vnoise(s * 1.6, p.seed, seed + 3));
      var crowPh = s * 2 * PI / Math.max(0.14, crowLam) + p.seed;
      var puff = Math.pow(0.5 + 0.5 * Math.cos(crowPh), 1.1);
      var meander = crowOn * Math.min(0.007, width * 0.16) * Math.sin(crowPh + 0.4 * PX.vnoise(s * 3, p.seed, seed + 4));
      var tt = t - drift - meander - 0.0014 * PX.vnoise(s * 14, age * 0.08, seed + k2) * Math.sqrt(age);
      var widthE = width * (1 - crowOn * 0.32 + crowOn * 0.55 * puff);
      var core = age < 0.8 && !crowOn ? 0.5 * (Math.exp(-Math.pow((tt - 0.0014) / widthE, 2)) + Math.exp(-Math.pow((tt + 0.0014) / widthE, 2))) : Math.exp(-Math.pow(tt / Math.max(1e-5, widthE), 2));
      var sc2 = 1 / Math.sqrt(1 + age * 0.3);
      var tex = 0.88 + 0.12 * (PX.fbm(s * 10 * sc2, tt * 14 * sc2, seed + k2 * 7, 4) * 0.5 + 0.5);
      var fall = 0;
      if (p.pers && age > 14 && air === 'Very Humid') {
        var fv = PX.fbm(s * 6, (tt - width * 1.6) * 4 + age * 0.01, seed + k2 * 9, 3);
        fall = 0.32 * sstep(-0.1, 0.45, fv) * Math.exp(-Math.pow((tt - width * 1.7) / (width * 2.2), 2)) * sstep(14, 22, age);
      }
      var dens = (core * tex * (1 - crowOn * 0.42 * (1 - puff)) + fall) * keep * Math.min(1, 0.75 / Math.sqrt(1 + width * 60)) * sstep(-0.004, 0.01, behind);
      dens = clamp(dens, 0, 1);
      var scat = dusk ? 1.3 : 0.75 + 1.2 * Math.pow(Math.max(0, cs), 8) + 0.2;
      var lit = dusk ? [1.0, 0.55, 0.42] : hour === 'Late Afternoon' ? [1.0, 0.86, 0.7] : [1, 0.98, 0.96];
      var cl = dusk ? 0.42 : 0.9;
      r = lerp(r, cl * scat * lit[0], dens * 0.85); g = lerp(g, cl * scat * lit[1], dens * 0.85); b = lerp(b, cl * scat * lit[2], dens * 0.85);
      if (behind >= 0 && behind < 0.004 && Math.abs(tt) < 0.0022 && p.ageHead < 2) {
        var gl = sstep(0.004, 0, behind) * sstep(0.0022, 0, Math.abs(tt));
        if (dusk) { r = lerp(r, 1, gl); g = lerp(g, 0.28, gl); b = lerp(b, 0.16, gl); }
        else { r = lerp(r, 0.98, gl * 0.9); g = lerp(g, 0.96, gl * 0.9); b = lerp(b, 0.94, gl * 0.9); }
      }
    }
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  if (edge === 'Wires') {
    var wa = RE.range(-0.5, 0.5), wn = RE.int(2, 4), wo = RE.range(-0.3, 0.2), sag = RE.range(0.02, 0.08);
    for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
      var u = px2 / PW - 0.5, v = py2 / PH - 0.5, along = u * Math.cos(wa) + v * Math.sin(wa), acr = -u * Math.sin(wa) + v * Math.cos(wa) - sag * (along * along * 4 - 1);
      for (var q = 0; q < wn; q++) {
        var dw = Math.abs(acr - wo - q * 0.045) * PW;
        if (dw < 1.7) {
          var I2 = py2 * PW + px2, f = 1 - dw / 1.7, glw = sstep(0.55, 0, dw) * 0.12;
          Rr[I2] = Rr[I2] * (1 - 0.9 * f) + glw * 0.15; Gg[I2] = Gg[I2] * (1 - 0.9 * f) + glw * 0.15; Bb[I2] = Bb[I2] * (1 - 0.88 * f) + glw * 0.16;
        }
      }
    }
  }
  if (edge === 'Roof Edge') {
    var side = RE.int(0, 3), depth = RE.range(0.09, 0.17), ra = RE.gaussian(0, 0.06);
    var gW = 0.01 + RE.range(0, 0.006), soffCol = PX.col(RE.pick(['#c9beab', '#d2c6b0', '#b5aa96', '#d8d0c2']));
    var gutCol = PX.col(RE.pick(['#2c2a28', '#3a3530', '#1f2420'])), seedR = RE.int(1, 9999);
    for (var py3 = 0; py3 < PH; py3++) for (var px3 = 0; px3 < PW; px3++) {
      var u3 = px3 / PW, v3 = py3 / PH;
      var dd = side === 0 ? v3 + (u3 - 0.5) * ra : side === 1 ? 1 - u3 + (v3 - 0.5) * ra : side === 2 ? 1 - v3 + (u3 - 0.5) * ra : u3 + (v3 - 0.5) * ra;
      if (dd >= depth) continue;
      var I3 = py3 * PW + px3, into = depth - dd;
      var alongR = side === 0 || side === 2 ? u3 : v3;
      if (into < gW) {
        var gt = 0.55 + 0.45 * sstep(gW * 0.15, 0, into) + 0.1 * PX.vnoise(alongR * 40, into * 200, seedR);
        Rr[I3] = gutCol[0] * gt; Gg[I3] = gutCol[1] * gt; Bb[I3] = gutCol[2] * gt;
      } else {
        var sl = (into - gW) / Math.max(1e-4, depth - gW);
        var boards = 0.97 + 0.03 * Math.cos(alongR * PI * 14 + 0.3 * PX.vnoise(alongR * 5, 0, seedR));
        var dirt = 0.93 + 0.07 * PX.fbm(alongR * 5, sl * 3, seedR + 2, 3);
        var shade = 0.78 + 0.22 * sl;
        if (into - gW < 0.006) shade *= 0.72;
        var tcol = boards * dirt * shade;
        Rr[I3] = soffCol[0] * tcol; Gg[I3] = soffCol[1] * tcol; Bb[I3] = soffCol[2] * tcol;
      }
    }
  }
  C.features({ Hour: hour, Air: air, Traffic: traffic, Edge: edge });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.2, filmic: true, grain: 0.01, vig: 0.15, seed: 19 });
  C.done(o.cv.canvas, 'persistence');
})();

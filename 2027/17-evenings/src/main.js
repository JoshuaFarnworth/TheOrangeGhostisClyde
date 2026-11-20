/* Evenings, by Clyde (2027).
 * An empty wine bottle that has held a candle for a long time. Every evening's candle ran down it; the layers of
 * wax are a count of dinners, in the colours of whatever candles were in the drawer.
 * Engine: each evening burns part of a candle; when the melt pool overflows its rim (more often on the side the
 * draught comes from) a drip is released with a small volume. The drip runs down the bottle surface (unwrapped as
 * angle x height on the real bottle profile), steered into the channels between earlier drips (it flows toward
 * thinner wax), slowing and spreading where the shoulder is less steep, and freezing when its heat is spent: run
 * length grows with volume, and it ends in a bead. Later drips coat earlier ones, so colour is layered by time.
 * Rendered as translucent wax over dark green glass, lit by a lamp, the candle out. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RE = R.fork('evenings'), RD = R.fork('drips'), RS = R.fork('scene');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1500, FW = 15.6, FH = 23.4;   // cm; frame from z = 10.5 up past the stub
  var drawer = RE.weighted([['Always White', 26], ['Whatever Was In The Drawer', 40], ['Red For Christmas', 14], ['Two Colours', 20]]);
  var span = RE.weighted([['A Month Of Dinners', 26], ['A Winter', 40], ['Years', 34]]);
  var nEve = { 'A Month Of Dinners': RE.int(14, 24), 'A Winter': RE.int(30, 60), 'Years': RE.int(110, 200) }[span];
  var place = RS.weighted([['Kitchen Table', 44], ['Restaurant', 32], ['Windowsill', 24]]);
  var draught = RS.range(-PI, PI), dStr = place === 'Windowsill' ? RS.range(0.6, 1) : RS.range(0.1, 0.6);
  var PAL = { white: '#efe8da', cream: '#e8d9b3', ivory: '#f1e6c8', red: '#8f1820', green: '#2c5a3a', blue: '#24386c', purple: '#4a2a58', yellow: '#dcb84e', pink: '#d58796', black: '#1e1c1c' };
  var two = [RE.pick(['red', 'blue', 'green', 'purple']), RE.pick(['white', 'cream', 'ivory'])];
  function candleCol(i) { if (drawer === 'Always White') return RE.chance(0.85) ? 'white' : 'ivory'; if (drawer === 'Red For Christmas') return RE.chance(0.7) ? 'red' : RE.pick(['white', 'green']); if (drawer === 'Two Colours') return two[i % 2]; return RE.pick(Object.keys(PAL)); }
  // bottle profile r(z): body, shoulder, neck, lip
  var bodyR = RS.range(3.5, 3.9), neckR = RS.range(1.3, 1.5), zS0 = RS.range(18, 21), zS1 = zS0 + RS.range(3, 5), zTop = RS.range(29.5, 31.5);
  function rad(z) { if (z < 0.6) return bodyR - 0.6 + Math.sqrt(Math.max(0, 0.36 - (0.6 - z) * (0.6 - z))); if (z < zS0) return bodyR; if (z < zS1) { var t = (z - zS0) / (zS1 - zS0); return lerp(bodyR, neckR, t * t * (3 - 2 * t)); } if (z < zTop - 1) return neckR; if (z < zTop) return neckR + 0.25; return 0; }
  function slope(z) { return Math.abs(rad(z + 0.05) - rad(z - 0.05)) / 0.1; }   // dr/dz: how much the surface leans out
  // wax grid over (theta, z)
  var NT = 360, NZ = 700, DZ = zTop / NZ, T = new Float32Array(NT * NZ), COL = new Uint8Array(NT * NZ), CR = new Float32Array(NT * NZ), CG = new Float32Array(NT * NZ), CB = new Float32Array(NT * NZ), cols = Object.keys(PAL), PALL = cols.map(function (k) { return PX.col(PAL[k]); });
  function ti(th) { return ((Math.round((th + PI) / (2 * PI) * NT) % NT) + NT) % NT; }
  function dep(th, z, h, wcm, ci) {
    var r = Math.max(rad(z), 0.3), zi = z / DZ, half = Math.max(wcm / r / (2 * PI) * NT, 0.8), halfZ = Math.max(1.6, (wcm * 0.7) / DZ);
    var k0 = Math.ceil(half * 1.6), z0 = Math.ceil(halfZ * 1.6);
    for (var dz = -z0; dz <= z0; dz++) {
      var zj = Math.round(zi + dz); if (zj < 0 || zj >= NZ) continue;
      var fz = Math.exp(-Math.pow(dz / halfZ, 2) * 1.5);
      for (var k = -k0; k <= k0; k++) {
        var f = Math.exp(-Math.pow(k / half, 2) * 1.8) * fz, add = h * f;
        if (add < 0.002) continue;
        var j = zj * NT + ((ti(th) + k) % NT + NT) % NT;
        T[j] += add; var m = clamp(add / 0.014, 0, 1); if (T[j] - add < 0.004) m = 1;
        CR[j] = lerp(CR[j], PALL[ci][0], m); CG[j] = lerp(CG[j], PALL[ci][1], m); CB[j] = lerp(CB[j], PALL[ci][2], m);
        if (m > 0.5) COL[j] = ci;
      }
    }
  }
  var nDrips = 0, lastCi = 0;
  for (var e = 0; e < nEve; e++) {
    var ci = cols.indexOf(candleCol(Math.floor(e / RE.int(2, 5)))); lastCi = ci; var nd = RD.int(1, 3) + (RD.chance(dStr * 0.8) ? RD.int(1, 3) : 0);
    // the rim of the bottle collects a collar of each candle's melt
    var ph0 = RD.range(0, 6.3), zc = zTop - 1.0 - RD.range(0, 0.4); for (var a = 0; a < NT; a += 2) { var aa = -PI + a / NT * 2 * PI, hh = 0.02 * (1 + Math.sin(aa * 3 + ph0) * 0.5 + Math.cos(aa - draught) * dStr * 0.6); for (var zz = zc; zz < zTop - 0.9; zz += DZ) dep(aa, zz, hh * 0.5, 0.25, ci); }
    for (var d = 0; d < nd; d++) {
      var th = RD.chance(dStr) ? draught + RD.gaussian(0, 0.55) : RD.range(-PI, PI), V = RD.pareto(0.05, 1.45), z = zTop - 0.8, heat = 1.85 * Math.pow(V, 0.5) * RD.range(0.55, 1.4) * 10, heat0 = heat, w0 = 0.14 + 0.38 * Math.cbrt(V);
      while (heat > 0 && z > 0.3) {
        var sl = slope(z), steep = 1 / Math.sqrt(1 + sl * sl * 4), r = Math.max(rad(z), 0.3), zi = Math.round(z / DZ), i0 = ti(th);
        if (zi >= 0 && zi < NZ) { var gL = T[zi * NT + (i0 + NT - 2) % NT], gR = T[zi * NT + (i0 + 2) % NT]; th += clamp((gL - gR) * 0.6, -0.05, 0.05) / r * 2 + RD.gaussian(0, 0.004) / r; }
        var left = clamp(heat / heat0, 0, 1), w = w0 * (0.6 + 0.4 * Math.sqrt(left)) * (1 + 0.35 * (1 - steep)); dep(th, z, 0.08 * Math.cbrt(V) * (1.35 - steep * 0.4) * (0.55 + 0.45 * left), w, ci);
        heat -= 0.05 * (1 + (1 - steep) * 4) * (1 + T[zi * NT + i0] * 0.5) / (0.6 + 0.4 * steep); z -= DZ;
      }
      var br = w0 * 1.15; for (var bz = -br; bz <= br * 1.8; bz += DZ * 0.5) { var q = bz < 0 ? bz / br : bz / (br * 1.8), f2 = Math.sqrt(Math.max(0, 1 - q * q)); dep(th, z + br * 0.15 + bz, 0.12 * Math.cbrt(V) * f2, w0 * (bz < 0 ? 1.25 : 1.2 - 0.35 * q) * Math.max(f2, 0.35), ci); }
      nDrips++;
    }
  }
  PX.blur(T, NT, NZ, 0.7); PX.blur(CR, NT, NZ, 0.55); PX.blur(CG, NT, NZ, 0.55); PX.blur(CB, NT, NZ, 0.55);
  function sA(A, th, z) { var fz = clamp(z / DZ, 0, NZ - 1.001), fi = ((th + PI) / (2 * PI) * NT + NT) % NT, z0 = Math.floor(fz), i0 = Math.floor(fi), a = fz - z0, c = fi - i0, i1 = (i0 + 1) % NT; return (A[z0 * NT + i0] * (1 - c) + A[z0 * NT + i1] * c) * (1 - a) + (A[(z0 + 1) * NT + i0] * (1 - c) + A[(z0 + 1) * NT + i1] * c) * a; }
  function sT(th, z) { var fz = clamp(z / DZ, 0, NZ - 1.001), fi = ((th + PI) / (2 * PI) * NT + NT) % NT, z0 = Math.floor(fz), i0 = Math.floor(fi), a = fz - z0, c = fi - i0, i1 = (i0 + 1) % NT; return (T[z0 * NT + i0] * (1 - c) + T[z0 * NT + i1] * c) * (1 - a) + (T[(z0 + 1) * NT + i0] * (1 - c) + T[(z0 + 1) * NT + i1] * c) * a; }
  var o = PX.canvas(C, VW, VH, '#100c0a'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH, Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  var zBase = -10.5, glassC = PX.col(RS.pick(['#123a22', '#2a3a14', '#3a2412'])), seed = RS.int(1, 9999), lamp = [1.0, 0.72, 0.45];
  var table = PX.col(place === 'Restaurant' ? '#c9c2b2' : place === 'Windowsill' ? '#d8d6d0' : '#5a3a26'), wall = PX.col(place === 'Restaurant' ? '#2a1a14' : place === 'Windowsill' ? '#5d6670' : '#3a3028');
  var stub = RS.range(0.2, 1.5), stubC = PALL[lastCi];
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc - FW / 2, Z = (PH - py - 0.5) / ppc - zBase;
    var bg = 0.6 + 0.3 * PX.fbm(X * 0.04, Z * 0.04, seed + 7, 3) + 0.4 * Math.exp(-Math.pow((X + 7) / 6, 2) - Math.pow((Z - 22) / 10, 2));
    var r = wall[0] * bg, g = wall[1] * bg, b = wall[2] * bg;
    var rz = rad(Z), thp = Math.asin(clamp(X / Math.max(rz, 0.01), -1, 1)), tz = Z >= 0 && Z < zTop ? sT(thp, Z) : 0;
    var tEdge = Z >= 0 && Z < zTop ? (sT(X < 0 ? -PI / 2 : PI / 2, Z - 0.05) + sT(X < 0 ? -PI / 2 : PI / 2, Z) + sT(X < 0 ? -PI / 2 : PI / 2, Z + 0.05)) / 3 : 0, rEff = rz > 0 ? rz + Math.min(tEdge, 0.35) : 0;
    if (Z < 0) {   // table top, perspective-free; the bottle's reflection/shadow
      var tt = 0.9 + 0.1 * PX.fbm(X * 0.3, Z * 2, seed, 3); r = table[0] * tt * 0.55; g = table[1] * tt * 0.55; b = table[2] * tt * 0.55;
      var sh = 1 - 0.6 * Math.exp(-Math.max(0, Math.abs(X + 1.5) - bodyR) / 1.5) * sstep(-2, 0, Z); r *= sh; g *= sh; b *= sh;
      if (span === 'Years' && Math.abs(X) < bodyR + 1.6 && Z > -0.9) { var pool = sstep(bodyR + 1.6, bodyR, Math.abs(X) + 0.6 * PX.vnoise(X * 1.2, 3, seed + 4)) * sstep(-0.9, -0.2, Z); var wc = PX.col(PAL[cols[COL[2 * NT + ti(0)]]] || PAL.white); r = lerp(r, wc[0] * 0.5, pool); g = lerp(g, wc[1] * 0.5, pool); b = lerp(b, wc[2] * 0.5, pool); }
    } else if (rEff > 0 && Math.abs(X) < rEff) {
      var u = clamp(X / rEff, -0.999, 0.999); if (Math.abs(X) > rz) tz = Math.max(tz, tEdge); var nz = Math.sqrt(1 - u * u), lamb = clamp(0.25 + 0.75 * (-u * 0.6 + nz * 0.7 + 0.1), 0, 1.2);
      // glass: dark, with the lamp's transmitted glow and two reflections
      var trans = 0.35 * nz * nz, rim = Math.pow(1 - nz, 3) * 0.6;
      r = glassC[0] * (0.25 + trans) + rim * 0.05; g = glassC[1] * (0.25 + trans) + rim * 0.06; b = glassC[2] * (0.25 + trans) + rim * 0.05;
      var hl = Math.exp(-Math.pow((u + 0.45) / 0.06, 2)) * 0.9 + Math.exp(-Math.pow((u - 0.62) / 0.03, 2)) * 0.25;
      if (tz > 0.003) {
        var wcol = [sA(CR, thp, Z), sA(CG, thp, Z), sA(CB, thp, Z)], cov = 1 - Math.exp(-tz * 22), zi2 = Math.min(NZ - 2, Math.max(1, Math.round(Z / DZ))), ti2 = ti(Math.asin(u));
        var eZ = 0.04, eT = 0.04 / Math.max(rz, 0.3), dTz = (sT(thp, Z + eZ) - sT(thp, Z - eZ)) / (2 * eZ), dTt = (sT(thp + eT, Z) - sT(thp - eT, Z)) / (2 * 0.04);
        var limb = 0.3 + 0.7 * sstep(1.0, 0.82, Math.abs(u)), bump = clamp(0.8 + 1.4 * dTz - 1.6 * dTt, 0.3, 1.55) * limb, sss = 0.4 + 0.6 * (1 - Math.exp(-tz * 5));
        r = lerp(r, wcol[0] * lamb * bump * sss * lamp[0] + 0.04 * (1 - sss) * wcol[0], cov); g = lerp(g, wcol[1] * lamb * bump * sss * lamp[1] + 0.04 * (1 - sss) * wcol[1], cov); b = lerp(b, wcol[2] * lamb * bump * sss * lamp[2] + 0.04 * (1 - sss) * wcol[2], cov);
        hl *= 1 - cov; hl += cov * 0.22 * Math.pow(clamp(bump - 1.0, 0, 1), 2);
      }
      r += hl * 0.5; g += hl * 0.47; b += hl * 0.42;
    } else if (Math.abs(X) < neckR * 1.15 && Z > zTop - 0.25 && Z < zTop + stub + 0.85) {
      // burnt-down stub: an uneven wax plug with a sooty crater and a short wick, not a cork
      var angS = Math.atan2(0.001, X), ir = neckR * (0.7 + 0.08 * PX.vnoise(Math.cos(angS) * 3, Math.sin(angS) * 3, seed + 20));
      var zTopS = zTop + stub * (0.85 + 0.12 * PX.vnoise(X * 5, 1, seed + 21));
      var zCrater = zTopS - 0.22 * (1 - Math.pow(Math.min(1, Math.abs(X) / Math.max(ir * 0.85, 0.04)), 2));
      if (Math.abs(X) < ir && Z <= zTopS && Z >= zTop - 0.15) {
        var inside = Z <= zCrater + 0.04;
        var lb = 0.38 + 0.4 * Math.sqrt(Math.max(0, 1 - Math.abs(X) / ir));
        r = stubC[0] * lb * lamp[0]; g = stubC[1] * lb * lamp[1]; b = stubC[2] * lb * lamp[2];
        if (Z > zCrater - 0.02) { var soot = sstep(zCrater - 0.08, zCrater + 0.04, Z) * sstep(ir * 0.9, 0, Math.abs(X)); var sc = 0.08 + 0.04 * PX.vnoise(X * 25, Z * 25, seed + 22);
          r = lerp(r, sc, soot * 0.9); g = lerp(g, sc * 0.9, soot * 0.9); b = lerp(b, sc * 0.8, soot * 0.9); }
      }
      if (Z > zTopS - 0.02 && Z < zTopS + 0.7 && Math.abs(X - 0.02 * PX.vnoise(Z * 6, 1, seed + 23)) < 0.04) { r = 0.03; g = 0.026; b = 0.022; }
    }
    var L = 1 - 0.3 * (X + FW / 2) / FW; Rr[I] = r * L; Gg[I] = g * L; Bb[I] = b * L;
  }
  C.features({ Candles: drawer, Evenings: span, Drips: nDrips, Place: place, Draught: dStr > 0.5 ? 'Strong' : 'Gentle' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.6, filmic: true, grain: 0.014, vig: 0.45, seed: 17 });
  C.done(o.cv.canvas, 'evenings');
})();

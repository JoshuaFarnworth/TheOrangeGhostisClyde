/* Above the Radiator, by Clyde (2027).
 * The wall over a radiator after some winters. Warm air carries dust up off the fins and the wall catches it: a
 * grey breath rising from the top grille, thinning as it climbs, darker wherever the wall behind is colder.
 * Engine: a line plume rises from the radiator's top. Deposition at height y spreads like a plume (width grows
 * linearly, concentration falls), with slow turbulent streaks stretched vertically. Particles settle more on cold
 * spots (thermophoresis), so the hidden structure of the wall shows through: plasterboard dabs (a grid of soft
 * blobs), timber studs (verticals at 400 or 600 mm centres) or, on solid walls, the mortar joints of the brickwork (pattern staining). A window sill above traps the plume
 * and darkens its underside. Front-on, in cm. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RH = R.fork('heat'), RW = R.fork('wall');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep;
  var VW = 1200, VH = 1500, FW = 100, FH = 125, RT = 30, RB = 14;   // cm; radiator top at RT above the frame bottom
  var winters = RH.weighted([['One Winter', 25], ['A Few Winters', 45], ['Never Redecorated', 30]]), dose = { 'One Winter': 0.5, 'A Few Winters': 1.2, 'Never Redecorated': 2.4 }[winters];
  var behind = RW.weighted([['Dot And Dab', 40], ['Timber Studs', 30], ['Solid Brick', 30]]), sill = RW.chance(0.5), wallName = RW.pick(['Magnolia', 'Brilliant White', 'Pale Grey', 'Cream', 'Pale Blue']);
  var wc = PX.col({ 'Magnolia': '#e8dec8', 'Brilliant White': '#efeeea', 'Pale Grey': '#d3d3cf', 'Cream': '#ece2c4', 'Pale Blue': '#cfdbe0' }[wallName]);
  var smoke = RH.chance(0.15), rw = RW.range(60, Math.min(FW - 4, 100)), rx0 = (FW - rw) / 2 + RW.gaussian(0, 4), rx1 = rx0 + rw, conv = RW.chance(0.75);
  var L = RH.range(35, 70), spread = RH.range(0.12, 0.22), lean = RH.gaussian(0, 0.06), sillY = sill ? RT + RW.range(80, 95) : 1e9;
  var o = PX.canvas(C, VW, VH, '#ddd'), PW = o.PW, PH = o.PH, ppc = PW / FW, seed = RW.int(1, 9999), N = PW * PH;
  var VALVE = RW.int(0, 1), studs = [], st0 = RW.range(0, 60), stc = RW.pick([40, 60]); for (var xs = st0 - 120; xs < FW + 10; xs += stc) studs.push(xs);
  var dab = [RW.range(0, 30), RW.range(0, 25), RW.range(28, 34), RW.range(24, 30)];   // dab grid offset and pitch (cm)
  function cold(X, Y) {
    if (behind === 'Timber Studs') { var c = 0; for (var i = 0; i < studs.length; i++) c = Math.max(c, sstep(3.5, 1.5, Math.abs(X - studs[i]))); return c * 0.9; }
    if (behind === 'Dot And Dab') { var gx = (X - dab[0]) / dab[2], gy = (Y - dab[1]) / dab[3], fx = gx - Math.round(gx), fy = gy - Math.round(gy), d = Math.hypot(fx * dab[2] / 5.5, fy * dab[3] / 4.5) * (0.95 + 0.1 * PX.vnoise(Math.atan2(fy, fx) * 1.5 + 9, Math.round(gx) * 7 + Math.round(gy) * 3, seed + 3)); return sstep(1.4, 0.6, d) * 0.7; }
    var crs = Math.floor(Y / 7.5), yj = Math.abs(Y - (crs + 0.5) * 7.5), xo = (X + (crs % 2) * 11.25) % 22.5, xj = Math.min(xo, 22.5 - xo); return 0.3 * Math.max(sstep(1.2, 0.4, 3.75 - yj), sstep(1.2, 0.4, xj)) * (0.8 + 0.4 * PX.vnoise(X * 0.2, Y * 0.2, seed + 4));   // brick courses: 65 mm brick + 10 mm joint
  }
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc, Y = FH - (py + 0.5) / ppc, r, g, b, sh;
    if (Y < RT) {   // radiator: pressed steel panel with vertical channels, convector grille on top
      var inR = X > rx0 && X < rx1 && Y > RB;
      if (inR) {
        var ch = ((X - rx0) % 5) / 5, chan = 0.9 + 0.08 * Math.sin(ch * 2 * Math.PI), top = sstep(RT, RT - 1.2, Y);
        sh = chan * (0.92 + 0.05 * (Y / RT)); var dust = 0.04 * sstep(RT - 3, RT, Y) * dose;
        r = g = b = 0.86 * sh - dust; b += 0.01;
        if (conv && Y > RT - 1.5) { var fin = ((X - rx0) % 0.9) < 0.35; if (fin) { r *= 0.35; g *= 0.35; b *= 0.35; } }
        var edge = Math.min(X - rx0, rx1 - X); if (edge < 0.8) { var e = 0.75 + 0.25 * edge / 0.8; r *= e; g *= e; b *= e; }
        if (Y > RT - 0.3) { r *= 1.06; g *= 1.06; b *= 1.06; }
      } else {
        var sh0 = 0.975 + 0.05 * (PX.vnoise(X * 6, Y * 6, seed + 5) - PX.vnoise(X * 6 + 0.2, Y * 6 + 0.2, seed + 5)) + 0.015 * PX.fbm(X * 0.05, Y * 0.05, seed + 6, 2); r = wc[0] * sh0; g = wc[1] * sh0; b = wc[2] * sh0;
        var sd = Math.min(Math.abs(X - rx0), Math.abs(X - rx1)); if (sd < 3 && Y > RB) { var s2 = 0.9 + 0.1 * sd / 3; r *= s2; g *= s2; b *= s2; }
        if (Y < 10 && !(X > rx0 && X < rx1 && false)) { r = 0.9; g = 0.89; b = 0.86; if (Y > 9.5) { r *= 0.85; g *= 0.85; b *= 0.85; } }   // skirting board
      }
      if (inR) { var bh = sstep(RB + 6, RB, Y) * 0.12; r -= bh; g -= bh; b -= bh; }
      else if (Y < RB && X > rx0 && X < rx1) { var bs = 0.85 + 0.15 * sstep(RB, RB - 4, Y); r *= bs; g *= bs; b *= bs; }   // shade under the radiator
      for (var pi = 0; pi < 2; pi++) { var pxx = pi ? rx1 - 3 : rx0 + 3, dxp = Math.abs(X - pxx); if (Y < RB + 0.5 && dxp < 0.75) { var cyl = Math.sqrt(1 - Math.pow(dxp / 0.75, 2)); r = g = b = 0.55 + 0.38 * cyl; if (Y > RB - 4.5 && dxp < 1.6) {} } if (Y > RB - 5 && Y < RB + 0.5 && dxp < 1.7) { var vb = Math.sqrt(1 - Math.pow(dxp / 1.7, 2)); var vc = pi === VALVE ? [0.85, 0.85, 0.86] : [0.8, 0.8, 0.8]; r = vc[0] * (0.6 + 0.4 * vb); g = vc[1] * (0.6 + 0.4 * vb); b = vc[2] * (0.6 + 0.4 * vb); if (pi === VALVE && Y > RB - 4 && ((Y * 3) % 1) < 0.3) { r *= 0.85; g *= 0.85; b *= 0.85; } } }
    } else {
      var y = Y - RT, xc = X - lean * y;
      // line plume from [rx0, rx1]: width grows with height, concentration falls; edges entrain and darken a little
      var w = 1.5 + spread * y, a0 = 0.5 * (1 + erf((xc - rx0) / (w * 1.414))), a1 = 0.5 * (1 + erf((xc - rx1) / (w * 1.414))), inside = a0 - a1;
      var edgeB = Math.exp(-Math.pow((xc - rx0) / w, 2)) + Math.exp(-Math.pow((xc - rx1) / w, 2));
      var streak = 0.78 + 0.45 * PX.fbm(xc * 0.18, y * 0.04, seed + 1, 4), turb = 0.8 + 0.4 * PX.fbm(X * 0.08, Y * 0.08, seed + 2, 3);
      var conc = (inside * (0.85 + 0.3 * sstep(0, 6, y) * sstep(30, 5, y)) + 0.25 * edgeB * sstep(0, 10, y)) * Math.exp(-y / L) * streak * turb;
      var dep = dose * conc * (1 + 1.6 * cold(X, Y));
      if (sill) { var und = sillY - Y; if (und > 0 && und < 14) dep += dose * inside * 0.6 * Math.exp(-und / 3) * streak * Math.exp(-(sillY - RT) / (L * 2.2)); }
      var dk = 1 - Math.exp(-dep * 0.55);
      var stip = PX.vnoise(X * 6, Y * 6, seed + 5) - PX.vnoise(X * 6 + 0.2, Y * 6 + 0.2, seed + 5); sh = 0.975 + 0.05 * stip + 0.015 * PX.fbm(X * 0.05, Y * 0.05, seed + 6, 2);
      var gcol = smoke ? [0.42, 0.36, 0.25] : [0.36, 0.35, 0.33];
      r = lerp(wc[0] * sh, gcol[0], dk); g = lerp(wc[1] * sh, gcol[1], dk); b = lerp(wc[2] * sh, gcol[2], dk);
      if (Y < RT + 1.2 && X > rx0 - 2 && X < rx1 + 2) { var sdw = 0.8 + 0.2 * (Y - RT) / 1.2; r *= sdw; g *= sdw; b *= sdw; }
      if (sill && Y > sillY) { var sv = Y < sillY + 3 ? 0.78 + 0.1 * (Y - sillY) / 3 : 0.93; r = g = b = sv; b += 0.005; if (Y > sillY + 3) { r = 0.94; g = 0.93; b = 0.9; } }
    }
    var light = 1.02 + 0.08 * (Y / FH); Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  C.features({ Winters: winters, 'Behind The Plaster': behind, Sill: sill ? 'Window Above' : 'Open Wall', Wall: wallName, Radiator: conv ? 'Convector' : 'Single Panel', Smoker: smoke ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: true, grain: 0.01, vig: 0.3, seed: 24 });
  C.done(o.cv.canvas, 'above-the-radiator');
})();

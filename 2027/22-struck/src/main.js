/* Struck, by Clyde (2027).
 * The striking strip on the side of a box of matches, close up. Every match that was lit left a dark scrape; the
 * strip says how many, how hard, which way the hand moves, and whether the box got damp.
 * Engine: a safety-match strip is red phosphorus and powdered glass in a binder. A strike drags the head along the
 * strip: friction converts a little phosphorus, and the head leaves a grey-black streak that starts sharp where it
 * bites, then thins and breaks up as it lifts (lit) or ends in a smear and a chip (failed). Strikes land where the
 * thumb holds the box: centred, biased to the striking side, angled by the wrist; one direction for one person,
 * both for a household. Repeated strikes abrade the strip to the card in the middle. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RU = R.fork('use'), RB = R.fork('box');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1800, VH = 900, FW = 56, FH = 28;   // mm
  var used = RU.weighted([['A Few Lit', 28], ['Half The Box', 42], ['Nearly Empty', 30]]), who = RU.weighted([['One Smoker', 30], ['The Hob', 34], ['Birthday Candles', 14], ['Everyone', 22]]);
  var damp = RU.chance(0.18), n = { 'A Few Lit': RU.int(4, 10), 'Half The Box': RU.int(18, 30), 'Nearly Empty': RU.int(38, 55) }[used];
  var sx0 = RB.range(2, 4), sx1 = FW - RB.range(2, 4), sy0 = FH / 2 - RB.range(7, 8.5), sy1 = FH / 2 + RB.range(7, 8.5), tilt = RB.gaussian(0, 0.02);
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppm = PW / FW, N = PW * PH, BL = new Float32Array(N), AB = new Float32Array(N), CH = new Float32Array(N);
  var dir = who === 'Everyone' ? 0 : RU.chance(0.75) ? 1 : -1, wrist = RU.gaussian(0, 0.06), bias = RU.gaussian(0, 4);
  var lit = 0, fails = 0;
  for (var k = 0; k < n; k++) {
    var d = dir || (RU.chance(0.5) ? 1 : -1), fail = RU.chance(damp ? 0.45 : 0.08), y = (sy0 + sy1) / 2 + RU.gaussian(0, (sy1 - sy0) * 0.18), x = FW / 2 + bias + RU.gaussian(0, 7), L = fail ? RU.range(3, 7) : RU.range(10, 24), ang = wrist + RU.gaussian(0, 0.05) + (d < 0 ? PI : 0), press = RU.range(0.6, 1.2);
    if (fail) fails++; else lit++;
    var steps = Math.ceil(L / 0.08), seedK = RU.int(1, 1e6), nGroove = fail ? 1 : (1 + (RU.rand() < 0.5 ? 1 : 2));
    for (var g = 0; g < nGroove; g++) {
      var off = (g - (nGroove - 1) / 2) * 0.35, wob = RU.range(0.15, 0.35);
      for (var s = 0; s <= steps; s++) {
        var t = s / steps, along = L * t;
        var px = x - Math.cos(ang) * L / 2 + Math.cos(ang) * L * t - Math.sin(ang) * (off + wob * PX.vnoise(along * 0.7, g, seedK));
        var py = y - Math.sin(ang) * L / 2 + Math.sin(ang) * L * t + Math.cos(ang) * (off + wob * PX.vnoise(along * 0.7, g + 3, seedK));
        // a strike is a thin scratch, not a disc of soot: it bites, then thins and breaks into skipped grains as the head lifts
        var bite = fail ? sstep(0, 0.2, t) * sstep(1, 0.7, t) : sstep(0, 0.04, t) * Math.exp(-t * 1.6);
        var skip = (!fail && t > 0.2 && PX.vnoise(along * 1.8, g * 5, seedK + 9) > (0.25 - 0.55 * t)) ? 1 : 0;
        if (skip) continue;
        var w = (fail ? 0.9 : 0.7) * (1 - 0.45 * t) * (0.75 + 0.4 * bite) * press;   // 0.4–1.0 mm core
        PX.forDisc(px * ppm, py * ppm, Math.max(0.35, w) * ppm / 2, PW, PH, function (I, dd, dx, dy) {
          var xx = I % PW, yy = (I / PW) | 0;
          var across = (-dx * Math.sin(ang) + dy * Math.cos(ang)) / ppm, alongD = (dx * Math.cos(ang) + dy * Math.sin(ang)) / ppm;
          var e = sstep(w / 2, w / 2 * 0.15, Math.abs(across)) * sstep(0.12, 0.0, Math.abs(alongD));
          if (e < 0.02) return;
          var grain = PX.h2(xx, yy, seedK + 11);
          if (grain > 0.35 + 0.5 * bite) return;   // the powdered glass leaves a broken, scratchy deposit
          var on = (yy / ppm > sy0 && yy / ppm < sy1 && xx / ppm > sx0 && xx / ppm < sx1) ? 1 : 0.12;
          BL[I] = Math.min(1.0, BL[I] + e * (0.28 + 0.4 * bite) * press * on);
          AB[I] += e * 0.004 * press * on;
        });
      }
    }
    if (fail) {
      var tx = x + Math.cos(ang) * L / 2, ty = y + Math.sin(ang) * L / 2;
      PX.forDisc(tx * ppm, ty * ppm, 0.85 * ppm, PW, PH, function (I, dd) { var xx = I % PW, yy = (I / PW) | 0; CH[I] = Math.max(CH[I], sstep(0.85 * ppm, 0.25 * ppm, dd) * (PX.h2(xx >> 1, yy >> 1, seedK + 7) < 0.75 ? 1 : 0)); });
    }
  }
  var seed = RB.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N);
  var strip = PX.col(RB.pick(['#5a2a1e', '#4a2c22', '#3c2a24', '#6a3524'])), card = PX.col(RB.pick(['#c9b48c', '#b9a47a', '#d6cbb0'])), print = PX.col(RB.pick(['#2b4a7a', '#a3262a', '#2f5a3a', '#1d1d1d', '#d9a21b']));
  var Lx = -0.6, Ly = -0.5;
  for (var py2 = 0; py2 < PH; py2++) for (var px2 = 0; px2 < PW; px2++) {
    var I = py2 * PW + px2, X = (px2 + 0.5) / ppm, Y = (py2 + 0.5) / ppm, Yt = Y - tilt * (X - FW / 2), r, g, b;
    // the card side of the box, a printed band, edge folds top and bottom
    var cn = 0.93 + 0.05 * PX.fbm(X * 0.6, Y * 0.6, seed, 3) + 0.03 * PX.vnoise(X * 4, Y * 4, seed + 1);
    r = card[0] * cn; g = card[1] * cn; b = card[2] * cn;
    var band = Yt < 2.2 || Yt > FH - 2.2; if (band) { r = print[0] * cn; g = print[1] * cn; b = print[2] * cn; }
    var fold = Math.min(Math.abs(Yt - 0.5), Math.abs(Yt - (FH - 0.5))); if (fold < 0.5) { var f = 0.75 + 0.25 * fold / 0.5; r *= f; g *= f; b *= f; }
    if (Yt > sy0 && Yt < sy1 && X > sx0 && X < sx1) {
      // grains of glass and phosphorus: lit facets
      var g1 = PX.vnoise(X * 6, Yt * 6, seed + 2), cell = PX.h2((px2 / 2) | 0, (py2 / 2) | 0, seed + 3), hgt = 0.55 * g1 + 0.45 * cell;
      var nxg = PX.vnoise(X * 6 + 0.15, Yt * 6, seed + 2) - g1, nyg = PX.vnoise(X * 6, Yt * 6 + 0.15, seed + 2) - g1;
      var lam = clamp(0.82 + (nxg * Lx + nyg * Ly) * 8, 0.65, 1.2), edgeW = sstep(0, 0.45, Math.min(Yt - sy0, sy1 - Yt, X - sx0, sx1 - X));
      var ab = clamp(AB[I], 0, 1), bare = sstep(0.5, 0.9, ab);
      var sr = strip[0] * (0.88 + 0.22 * hgt) * lam, sg = strip[1] * (0.88 + 0.22 * hgt) * lam, sb = strip[2] * (0.88 + 0.22 * hgt) * lam;
      sr = lerp(sr, card[0] * 0.75, bare); sg = lerp(sg, card[1] * 0.75, bare); sb = lerp(sb, card[2] * 0.75, bare);
      r = lerp(r, sr, edgeW); g = lerp(g, sg, edgeW); b = lerp(b, sb, edgeW);
      // a few larger glass grains, not a uniform sparkle
      var grain = PX.h2((px2 / 3) | 0, (py2 / 3) | 0, seed + 4);
      if (grain > 0.994 && bare < 0.4) { var gl = 0.07 * lam; r += gl; g += gl * 0.97; b += gl * 0.9; }
    }
    var bl = clamp(BL[I], 0, 1), ch = CH[I]; r = lerp(r, r * 0.12 + 0.02, bl); g = lerp(g, g * 0.12 + 0.018, bl); b = lerp(b, b * 0.12 + 0.018, bl);
    if (ch > 0) { r = lerp(r, 0.01, ch * 0.9); g = lerp(g, 0.01, ch * 0.9); b = lerp(b, 0.01, ch * 0.9); }   // a failed head stalls: a short dense stub where it stopped
    var light = 1.08 - 0.25 * (X / FW) - 0.1 * (Y / FH); Rr[I] = r * light; Gg[I] = g * light; Bb[I] = b * light;
  }
  C.features({ Box: used, 'Lit For': who, Matches: lit, 'Failed Strikes': fails, Damp: damp ? 'Yes' : 'No', Direction: dir === 0 ? 'Both Ways' : 'One Way' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.15, filmic: true, grain: 0.014, vig: 0.35, seed: 22 });
  C.done(o.cv.canvas, 'struck');
})();

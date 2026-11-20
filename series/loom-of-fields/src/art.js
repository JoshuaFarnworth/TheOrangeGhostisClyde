/* Loom of Fields by Clyde (2026). It draws on the Jacquard loom (1804) as an ancestor of the
 * computer, Anni Albers's Bauhaus weaving, the network drafting tradition of hand-weavers,
 * and Anna Lucia's "Loom" (Art Blocks, 2021), the closest prior work in on-chain art.
 * Here the draft itself is generative: threading and treadling are flow-field streamlines,
 * quantised onto 4 to 16 shafts. The cloth is the true drawdown of that draft. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RF = R.fork('field');
  var VW = 1000, VH = 1000;
  var PAL = {
    'Indigo Ikat':     { bg: '#efe8da', ink: '#1b1b1b', warp: ['#1d2b53', '#22396e', '#2f4f8f'], weft: ['#efe3c8', '#d9c9a3', '#c44f2d'] },
    'Madder & Weld':   { bg: '#f2ebdc', ink: '#2a1a14', warp: ['#9b2d20', '#b8452b', '#6e1f19'], weft: ['#e3b23c', '#f0d48a', '#2f3e46'] },
    'Albers':          { bg: '#ece8df', ink: '#151515', warp: ['#151515', '#e9e4d8', '#7a7a74'], weft: ['#c9a227', '#b23a2e', '#e9e4d8'] },
    'Undyed Wool':     { bg: '#f1ece2', ink: '#3a2f26', warp: ['#e8dfcd', '#cbbba0', '#8a735a'], weft: ['#5b4636', '#a68d6f', '#efe7d6'] },
    'Jacquard Punch':  { bg: '#e9e6df', ink: '#111111', warp: ['#111111', '#111111', '#1c1c1c'], weft: ['#f2efe8', '#f2efe8', '#d6402f'] },
    'Night Loom':      { bg: '#121317', ink: '#d9d4c7', warp: ['#1f2a44', '#2c3d63', '#141a2b'], weft: ['#d8b25a', '#e8d9a8', '#8fb3c9'] }
  };
  var palName = RP.weighted([['Indigo Ikat', 22], ['Madder & Weld', 18], ['Albers', 18], ['Undyed Wool', 16], ['Jacquard Punch', 14], ['Night Loom', 12]]);
  var P = PAL[palName];
  var S = RL.weighted([[4, 22], [8, 40], [12, 22], [16, 16]]);
  var tieName = RL.weighted([['Twill', 40], ['Broken Twill', 25], ['Satin', 20], ['Block', 15]]);
  var sett = RL.weighted([['Coarse', 25], ['Medium', 45], ['Fine', 30]]);
  var NWARP = { Coarse: 56, Medium: 84, Fine: 116 }[sett];
  var turb = RL.weighted([['Gentle', 35], ['Undulating', 45], ['Turbulent', 20]]);
  var draft = RL.weighted([['Shown', 55], ['Cloth only', 45]]);
  C.features({ Palette: palName, Shafts: S, 'Tie-up': tieName, Sett: sett, Field: turb, Draft: draft });

  var cv = C.setupCanvas(VW, VH, P.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);
  var NZ = C.noise(RF);
  var fq = { Gentle: 0.9, Undulating: 1.8, Turbulent: 3.4 }[turb];
  function angle(u, v) { return NZ.fbm(u * fq, v * fq, 3) * Math.PI * 1.4; } // u,v in 0..1

  // ---- streamline-derived threading & treadling --------------------------
  function streamline(n, horizontal, start) {
    var out = [], p = start, step = 1 / n;
    for (var i = 0; i < n; i++) {
      var u = horizontal ? i / n : p, v = horizontal ? p : i / n;
      var a = angle(u, v);
      p += (horizontal ? Math.tan(Math.max(-1.2, Math.min(1.2, a))) : Math.tan(Math.max(-1.2, Math.min(1.2, a - Math.PI / 2 * 0)))) * step * 0.9;
      out.push(p);
    }
    return out;
  }
  var NWEFT = NWARP;
  var thrLine = streamline(NWARP, true, RF.range(0.2, 0.8)), trdLine = streamline(NWEFT, false, RF.range(0.2, 0.8));
  var amp = RL.range(3, 7);
  // straight draw (one shaft per thread) bent by the streamline: where the stream climbs
  // against the draw the progression stalls or reverses, giving point and wave twills
  var dirT = RL.chance(0.5) ? 1 : -1, dirR = RL.chance(0.5) ? 1 : -1;
  function quant(line, dir) { return line.map(function (y, i) { var k = Math.floor(dir * i + y * S * amp); return ((k % S) + S) % S; }); }
  var threading = quant(thrLine, dirT), treadling = quant(trdLine, dirR);
  // ---- tie-up ----------------------------------------------------------------
  var tie = []; // tie[treadle][shaft] = raise
  var satStep = S === 4 ? 1 : (S === 8 ? 3 : (S === 12 ? 5 : 7));
  var blockMask = []; for (var b = 0; b < S; b++) blockMask.push(RL.chance(0.5));
  for (var t = 0; t < S; t++) {
    tie.push([]);
    for (var s = 0; s < S; s++) {
      var d = ((s - t) % S + S) % S, up;
      if (tieName === 'Twill') up = d < S / 2;
      else if (tieName === 'Broken Twill') up = (((s - (t < S / 2 ? t : S - t)) % S + S) % S) < S / 2;
      else if (tieName === 'Satin') up = ((s * satStep) % S) === t % S || ((s * satStep + 1) % S) === t % S;
      else { var blk = Math.floor(s / Math.max(1, S / 4)) % 2 === Math.floor(t / Math.max(1, S / 4)) % 2; up = blk ? d % 2 === 0 : d < S / 2; up = blockMask[t] ? up : !up; }
      tie[t].push(up);
    }
  }
  // ---- colour sequences from the same field (stripes change where the stream bends)
  function colours(line, set) {
    return line.map(function (y, i) { var band = Math.floor((y * 3.1 + i * 0.004) * 2) ; return set[((band % set.length) + set.length) % set.length]; });
  }
  var warpCol = colours(thrLine, P.warp), weftCol = colours(trdLine, P.weft);

  // ---- layout ----------------------------------------------------------------
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, VW, VH);
  var M = 70, gap = 2, u, clothX, clothY;
  if (draft === 'Shown') { u = (VW - 2 * M) / (NWARP + S + gap); clothX = M; clothY = M + (S + gap) * u; }
  else { u = (VW - 2 * M) / NWARP; clothX = M; clothY = M; }
  var inkC = C.hex2rgb(P.ink);
  function cell(x, y, filled) {
    ctx.strokeStyle = C.rgba(inkC, 0.35); ctx.lineWidth = 0.5; ctx.strokeRect(x, y, u, u);
    if (filled) { ctx.fillStyle = P.ink; ctx.fillRect(x + u * 0.12, y + u * 0.12, u * 0.76, u * 0.76); C.poly([[x + u * 0.2, y + u * 0.5], [x + u * 0.8, y + u * 0.5]], P.ink); }
  }
  if (draft === 'Shown') {
    for (var i = 0; i < NWARP; i++) for (s = 0; s < S; s++) cell(clothX + i * u, M + (S - 1 - s) * u, threading[i] === s);
    var trX = clothX + (NWARP + gap) * u;
    for (var j = 0; j < NWEFT; j++) for (t = 0; t < S; t++) cell(trX + t * u, clothY + j * u, treadling[j] === t);
    for (t = 0; t < S; t++) for (s = 0; s < S; s++) cell(trX + t * u, M + (S - 1 - s) * u, tie[t][s]);
  }
  // ---- drawdown as cloth -------------------------------------------------------
  var rgbCache = {};
  function rgb(h) { return rgbCache[h] || (rgbCache[h] = C.hex2rgb(h)); }
  ctx.fillStyle = C.rgba(rgb(P.ink), 0.9); ctx.fillRect(clothX, clothY, NWARP * u, NWEFT * u);
  for (j = 0; j < NWEFT; j++) for (i = 0; i < NWARP; i++) {
    var warpUp = tie[treadling[j]][threading[i]];
    var x = clothX + i * u, y = clothY + j * u, col = rgb(warpUp ? warpCol[i] : weftCol[j]);
    var g = warpUp ? ctx.createLinearGradient(x, 0, x + u, 0) : ctx.createLinearGradient(0, y, 0, y + u);
    g.addColorStop(0, C.rgba(C.mix(col, [0, 0, 0], 0.35))); g.addColorStop(0.45, C.rgba(C.mix(col, [255, 255, 255], 0.18)));
    g.addColorStop(1, C.rgba(C.mix(col, [0, 0, 0], 0.4)));
    ctx.fillStyle = g;
    var inset = u * 0.06;
    if (warpUp) ctx.fillRect(x + inset * 1.5, y - inset, u - inset * 3, u + inset * 2);
    else ctx.fillRect(x - inset, y + inset * 1.5, u + inset * 2, u - inset * 3);
    var hex = warpUp ? warpCol[i] : weftCol[j];
    C.poly(warpUp ? [[x + u / 2, y + u * 0.1], [x + u / 2, y + u * 0.9]] : [[x + u * 0.1, y + u / 2], [x + u * 0.9, y + u / 2]], hex);
  }
  C.done(cv.canvas, 'loom-of-fields');
})();

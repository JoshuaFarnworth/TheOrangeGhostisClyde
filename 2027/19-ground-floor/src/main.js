/* Ground Floor, by Clyde (2027).
 * The button panel inside a lift. Nobody looks at it closely; it has been keeping count. The most pressed buttons
 * have lost the paint in their numbers and been polished smooth; the ones nobody needs still look new.
 * Engine: a building is drawn (residential, offices, a hotel, a car park) with floors and who uses them. Trips are
 * simulated over years: everybody goes down to the ground floor, residents ride to their own floors in proportion
 * to how many people live there (a vacant floor gets almost nothing), the impatient press Close, a hotel's guests ride
 * to the pool. Each press rubs the button's centre: black infill in the engraving wears from the middle out, the
 * brushed grain of the steel is polished toward a mirror, skin oil darkens a ring around the face. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RB = R.fork('building'), RT = R.fork('trips'), RS = R.fork('steel');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1000, VH = 1500, FW = 150, FH = 225;   // mm
  var kind = RB.weighted([['Flats', 46], ['Offices', 22], ['Hotel', 16], ['Car Park', 16]]);
  var nF = kind === 'Car Park' ? RB.int(3, 6) : RB.int(4, 13), years = RB.weighted([['Five Years', 30], ['Twenty Years', 46], ['Since It Was Built', 24]]);
  var trips = { 'Five Years': 1, 'Twenty Years': 3.5, 'Since It Was Built': 7 }[years] * RT.range(0.7, 1.3);
  var labels = [], use = [];
  var basement = kind !== 'Car Park' && RB.chance(0.3);
  if (basement) { labels.push('B'); use.push(kind === 'Flats' ? 0.15 : 0.3); }
  labels.push('G'); use.push(0);   // ground: everyone's return trip, added below
  for (var f = 1; f <= nF; f++) { labels.push(kind === 'Car Park' ? 'P' + f : String(f)); use.push(RB.range(0.4, 1.2)); }
  var vacant = -1, event = 'None';
  if (kind === 'Flats' && RB.chance(0.35)) { vacant = RB.int(basement ? 2 : 1, labels.length - 1); use[vacant] = 0.01; event = 'A Floor Nobody Visits'; }
  if (kind === 'Hotel') { var pool = labels.length - 1; use[pool] *= 2.6; event = 'Pool On The Top Floor'; }
  if (kind === 'Offices' && RB.chance(0.5)) { var canteen = RB.int(1, labels.length - 1); use[canteen] *= 2.5; event = 'The Canteen Floor'; }
  if (kind === 'Car Park') for (var q = 1; q < labels.length; q++) use[q] = 1.6 * Math.pow(0.7, q - 1);   // the first levels fill first
  var up = use.reduce(function (a, b) { return a + b; }, 0), gi = basement ? 1 : 0; use[gi] = up * 0.95;   // everyone comes back down
  var closeU = up * RT.range(0.15, 0.9), openU = up * RT.range(0.03, 0.15), alarmU = RT.chance(0.15) ? 0.002 : 0;
  var impatient = closeU > up * 0.55;
  // layout: one or two columns of 26 mm buttons; Open/Close at the bottom; Alarm above them
  var btns = [], nB = labels.length, cols = nB > 7 ? 2 : 1, rows = Math.ceil(nB / cols), pitch = 34, bx0 = FW / 2 - (cols - 1) * pitch / 2, by0 = FH * 0.64;
  for (var k = 0; k < nB; k++) { var c = cols === 2 ? k % 2 : 0, r = cols === 2 ? Math.floor(k / 2) : k; btns.push({ x: bx0 + c * pitch, y: by0 - r * pitch, lab: labels[k], u: use[k] }); }
  btns.push({ x: FW / 2 - pitch / 2, y: by0 + pitch * 1.25, lab: '<>', u: openU }, { x: FW / 2 + pitch / 2, y: by0 + pitch * 1.25, lab: '><', u: closeU }, { x: FW / 2, y: by0 + pitch * 2.3, lab: 'bell', u: alarmU });
  var scale = 1; var top = Math.min.apply(null, btns.map(function (b) { return b.y; })); if (top < 18) { scale = (by0 + pitch * 2.3 - 18) / (by0 + pitch * 2.3 - top); btns.forEach(function (b) { b.y = by0 + pitch * 2.3 - (by0 + pitch * 2.3 - b.y) * scale; b.x = FW / 2 + (b.x - FW / 2) * scale; }); }
  var BR = 13 * Math.min(1, scale * 1.05), umax = Math.max.apply(null, btns.map(function (b) { return b.u; }));
  btns.forEach(function (b) { b.w = 1 - Math.exp(-b.u / umax * 2.2 * trips); });
  // glyph strokes in a unit box (x 0..1, y 0..1.6)
  var G = { 0: [[[0.5, 0], [0.1, 0.3], [0.1, 1.3], [0.5, 1.6], [0.9, 1.3], [0.9, 0.3], [0.5, 0]]], 1: [[[0.25, 0.35], [0.55, 0], [0.55, 1.6]]], 2: [[[0.1, 0.35], [0.5, 0], [0.9, 0.35], [0.85, 0.7], [0.1, 1.6], [0.95, 1.6]]], 3: [[[0.1, 0.2], [0.5, 0], [0.9, 0.35], [0.5, 0.75], [0.9, 1.15], [0.5, 1.6], [0.1, 1.4]]], 4: [[[0.7, 1.6], [0.7, 0], [0.05, 1.1], [0.95, 1.1]]], 5: [[[0.9, 0], [0.15, 0], [0.1, 0.7], [0.6, 0.6], [0.9, 1.0], [0.6, 1.6], [0.1, 1.45]]], 6: [[[0.85, 0.15], [0.45, 0], [0.1, 0.6], [0.1, 1.3], [0.5, 1.6], [0.9, 1.25], [0.6, 0.8], [0.1, 1.0]]], 7: [[[0.05, 0], [0.95, 0], [0.35, 1.6]]], 8: [[[0.5, 0.75], [0.15, 0.4], [0.5, 0], [0.85, 0.4], [0.5, 0.75], [0.1, 1.15], [0.5, 1.6], [0.9, 1.15], [0.5, 0.75]]], 9: [[[0.9, 0.6], [0.5, 0.85], [0.1, 0.5], [0.5, 0], [0.9, 0.35], [0.85, 1.1], [0.4, 1.6]]],
    G: [[[0.9, 0.25], [0.5, 0], [0.1, 0.35], [0.1, 1.25], [0.5, 1.6], [0.9, 1.3], [0.9, 0.9], [0.55, 0.9]]], B: [[[0.15, 0], [0.15, 1.6], [0.65, 1.6], [0.9, 1.2], [0.65, 0.8], [0.15, 0.8]], [[0.15, 0], [0.6, 0], [0.85, 0.4], [0.6, 0.8]]], P: [[[0.15, 1.6], [0.15, 0], [0.65, 0], [0.9, 0.4], [0.65, 0.8], [0.15, 0.8]]],
    '<>': [[[0.45, 0.3], [0.05, 0.8], [0.45, 1.3], [0.45, 0.3]], [[0.55, 0.3], [0.95, 0.8], [0.55, 1.3], [0.55, 0.3]]], '><': [[[0.05, 0.3], [0.45, 0.8], [0.05, 1.3], [0.05, 0.3]], [[0.95, 0.3], [0.55, 0.8], [0.95, 1.3], [0.95, 0.3]]], bell: [[[0.2, 1.2], [0.3, 0.4], [0.5, 0.2], [0.7, 0.4], [0.8, 1.2], [0.2, 1.2]], [[0.42, 1.35], [0.58, 1.35]]] };
  var o = PX.canvas(C, VW, VH, '#333'), PW = o.PW, PH = o.PH, ppm = PW / FW, N = PW * PH, ENG = new Float32Array(N), BID = new Int16Array(N).fill(-1);
  btns.forEach(function (b, bi) {
    var s = b.lab, h = BR * 0.62, isSym = s === '<>' || s === '><' || s === 'bell', chars = isSym ? [s] : s.split(''), cw = h / 1.6 * 0.9, gap = h * 0.12, tw = chars.length * cw + (chars.length - 1) * gap;
    chars.forEach(function (ch, ci) { (G[ch] || []).forEach(function (st) { var pts = st.map(function (p) { return [(b.x - tw / 2 + ci * (cw + gap) + p[0] * cw) * ppm, (b.y - h / 2 + p[1] / 1.6 * h) * ppm]; }); PX.line(ENG, PW, PH, pts, 1.1 * ppm, 1); }); });
    PX.forDisc(b.x * ppm, b.y * ppm, (BR + 3) * ppm, PW, PH, function (I) { BID[I] = bi; });
  });
  var seed = RS.int(1, 9999), Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), env = RS.range(0, 1), panelTint = RS.pick([[1, 1, 1], [1.02, 0.98, 0.92], [0.97, 0.99, 1.02]]), infill = PX.col(RS.pick(['#141414', '#1a1a1a', '#7a1010']));
  function steel(X, Y, polish) {   // brushed stainless: horizontal grain, a soft reflection of the lit car interior
    var grain = PX.vnoise(X * 0.15, Y * 9, seed) * 0.6 + PX.vnoise(X * 0.6, Y * 30, seed + 1) * 0.4, refl = 0.32 + 0.22 * Math.sin((Y / FH * 2.2 + env) * PI) + 0.12 * sstep(0.3, 0.7, X / FW);
    var v = refl * (1 + (0.22 * grain) * (1 - polish)) + polish * 0.18 * Math.exp(-Math.pow((X - FW * 0.45) / 40, 2)); return v;
  }
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppm, Y = (py + 0.5) / ppm, v = steel(X, Y, 0), r, g, b, bi = BID[I];
    r = v * panelTint[0]; g = v * panelTint[1]; b = v * panelTint[2];
    if (bi >= 0) {
      var bt = btns[bi], dx = X - bt.x, dy = Y - bt.y, d = Math.hypot(dx, dy), w = bt.w;
      if (d < BR + 3) {
        // the collar between panel and button: a dark gap, then the bevelled rim of the button
        if (d > BR + 0.8) { var gp = sstep(BR + 0.8, BR + 1.6, d) * sstep(BR + 3, BR + 2.2, d); r *= 1 - 0.75 * gp; g *= 1 - 0.75 * gp; b *= 1 - 0.75 * gp; }
        else {
          var rim = sstep(BR - 1.6, BR, d), nY = dy / Math.max(d, 1e-3) * rim, shade = 1 - 0.35 * nY + 0.1 * (1 - rim);
          // centre of the finger's contact sits a little below middle; wear polishes and removes infill from there out
          var cdx = dx, cdy = dy - BR * 0.08, cd = Math.hypot(cdx * 1.1, cdy) / BR, contact = Math.exp(-cd * cd / 0.25), polish = clamp(w * (0.35 + 0.9 * contact), 0, 1) * (1 - rim);
          v = steel(X + bt.x * 0.3, Y, polish) * shade; r = v * panelTint[0]; g = v * panelTint[1]; b = v * panelTint[2];
          var e = ENG[I], keep = 1 - sstep(0.35, 0.95, w * (0.25 + contact * 1.1) + 0.25 * PX.vnoise(X * 3, Y * 3, seed + bi));
          if (e > 0) { var t = e * keep; r = lerp(r * 0.55, infill[0], t); g = lerp(g * 0.55, infill[1], t); b = lerp(b * 0.55, infill[2], t); }   // engraving: dark groove where the paint has gone
          var oil = w * 0.18 * Math.exp(-Math.pow((cd - 0.75) / 0.25, 2)) * (0.6 + 0.4 * PX.vnoise(X * 1.5, Y * 1.5, seed + 7)); r *= 1 - oil; g *= 1 - oil; b *= 1 - oil * 0.9;
          // braille dots beside the label (raised, left of centre)
          for (var dd = 0; dd < 3; dd++) { var bxx = bt.x - BR * 0.72, byy = bt.y - 2.5 + dd * 2.5, db = Math.hypot(X - bxx, Y - byy); if (db < 0.75 && PX.ihash(bi * 7 + dd) > 0.35) { var lit = 1 + 0.6 * (byy - Y) / 0.75; r *= lit; g *= lit; b *= lit; } }
        }
      }
    }
    // panel edge and the car wall beyond
    var edge = Math.min(X - 8, FW - 8 - X, Y - 6, FH - 6 - Y); if (edge < 0) { var wl = 0.12 + 0.05 * PX.fbm(X * 0.05, Y * 0.05, seed + 9, 3); r = wl * 0.95; g = wl * 0.93; b = wl * 0.9; } else if (edge < 0.8) { r *= 0.5; g *= 0.5; b *= 0.5; }
    // screws
    [[14, 12], [FW - 14, 12], [14, FH - 12], [FW - 14, FH - 12]].forEach(function (sc) { var ds = Math.hypot(X - sc[0], Y - sc[1]); if (ds < 2.2) { var sh2 = ds < 0.45 || Math.abs((X - sc[0]) - (Y - sc[1])) < 0.35 && ds < 1.8 ? 0.4 : 0.9 - 0.3 * (Y - sc[1]) / 2.2; r *= sh2; g *= sh2; b *= sh2; } });
    Rr[I] = r; Gg[I] = g; Bb[I] = b;
  }
  C.features({ Building: kind, Floors: nF, Years: years, Note: event, 'Close Door': impatient ? 'Worn Smooth' : 'Used', Basement: basement ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.25, filmic: true, grain: 0.012, vig: 0.3, seed: 19 });
  C.done(o.cv.canvas, 'ground-floor');
})();

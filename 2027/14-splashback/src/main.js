/* Splashback, by Clyde (2027).
 * The tiles behind a domestic hob, between wipes. Every frying pan throws a fan of oil droplets; the tiles keep them.
 * Engine: cooking sessions are drawn from a household's habits (which burner, which dish). Each session ejects
 * droplets from the pan rim with log-normal diameters (tens to hundreds of microns) and speeds of 1-3 m/s at
 * random elevations; each is flown ballistically (gravity, no drag below 0.2 mm... a small drag term above) to the
 * wall plane, so the spatter forms a parabolic fan whose reach depends on the pan's distance from the wall.
 * Landed drops spread to a few times their diameter and dry with a darker rim. Old oil oxidises toward amber and
 * holds dust; the grout soaks it up. A wipe resets everything inside the cloth's arcs and leaves a faint smear. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RH = R.fork('habit'), RD = R.fork('drops'), RT = R.fork('tiles'), RW = R.fork('wipe');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1500, VH = 1000, FW = 66, FH = 44;   // cm; hob surface at z = 0 (bottom of frame), wall plane y = 0
  var tile = RT.weighted([['Metro White', 40], ['Square White', 25], ['Square Cream', 15], ['Handmade Green', 10], ['Glass Panel', 10]]);
  var cook = RH.weighted([['Fry-Ups', 30], ['Stir-Fry', 22], ['Sauces', 22], ['A Bit Of Everything', 26]]);
  var since = RW.weighted([['Wiped Yesterday', 22], ['A Week', 34], ['A Month', 28], ['Months', 16]]);
  var days = { 'Wiped Yesterday': 1, 'A Week': 7, 'A Month': 30, 'Months': RW.int(90, 240) }[since];
  var burners = [{ x: 18, d: 13 }, { x: 48, d: 13 }, { x: 18, d: 36 }, { x: 48, d: 36 }];
  if (RH.chance(0.3)) burners.push({ x: 33, d: 25 });   // a five-ring hob with a wok burner in the middle
  var habit = burners.map(function (b, i) { return Math.pow(RH.rand(), 2.2) + (i === RH.int(0, burners.length - 1) ? 1.5 : 0); });
  var hs = habit.reduce(function (a, b) { return a + b; }, 0);
  var o = PX.canvas(C, VW, VH, '#222'), PW = o.PW, PH = o.PH, ppc = PW / FW, N = PW * PH;
  var OIL = new Float32Array(N), AGE = new Float32Array(N), RED = new Float32Array(N), RIM = new Float32Array(N);
  var event = RH.weighted([['None', 70], ['Sauce Spat', 18], ['A Hot Pan Of Water', 12]]);
  // the last wipe: arcs of a cloth from a right hand, leaving a cleared region and smears
  // the last wipe: a few overlapping sweeps of a cloth (right hand, pivoting at the elbow); everything older than
  // the wipe is gone where the cloth went and stays where it didn't (behind the hob's back corners, above reach)
  var strokes = [], nS = RW.int(4, 8), ecx = RW.range(26, 44), ecz = RW.range(-12, -2);
  for (var q = 0; q < nS; q++) strokes.push({ r: RW.range(18, 36), a0: RW.range(0.35, 1.2), a1: RW.range(1.8, 2.8), w: RW.range(4, 7), cx: ecx + RW.gaussian(0, 4), cz: ecz + RW.gaussian(0, 3) });
  function wipeAmt(x, z) { var m = 0; for (var q = 0; q < strokes.length; q++) { var st = strokes[q], dx = x - st.cx, dz = z - st.cz, a = Math.atan2(dz, dx), rr = Math.hypot(dx, dz), e = Math.min(a - st.a0, st.a1 - a) * rr; if (e < -1) continue; var w = st.w * (1 + 0.2 * PX.vnoise(a * 9, q, 77)); m = Math.max(m, sstep(w, w * 0.55, Math.abs(rr - st.r)) * sstep(-1, 2.5, e)); } return m; }
  function wiped(x, z) { return wipeAmt(x, z) > 0.5; }
  var oldDays = since === 'Months' ? 0 : RW.int(20, 90);
  var total = days + oldDays, sessions = Math.max(3, Math.round(Math.min(total, 300) * (cook === 'Stir-Fry' ? 0.9 : 0.7))), g = 981, nd = 0;
  function splat(x, z, rad, amt, ageDays, red) {
    if (x < 0 || x > FW || z < 0 || z > FH) return;
    if (ageDays > days) { var wa = wipeAmt(x, z); if (wa > 0) { amt *= Math.max(0, 1 - wa * 1.15); if (amt <= 0.02) return; } }   // everything older than the wipe inside it is gone
    if (amt <= 0) return;
    var cx = x * ppc, cy = (FH - z) * ppc, rp = rad * ppc, ageN = clamp(ageDays / 150, 0, 1);
    if (rp < 1.2) { var xi = Math.floor(cx - 0.5), yi = Math.floor(cy - 0.5), fx = cx - 0.5 - xi, fy = cy - 0.5 - yi, a = PI * rp * rp * amt;
      [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]].forEach(function (q) { var X = xi + q[0], Y = yi + q[1]; if (X < 0 || Y < 0 || X >= PW || Y >= PH) return; var I = Y * PW + X; OIL[I] += a * q[2]; AGE[I] += a * q[2] * ageN; RED[I] += a * q[2] * red; RIM[I] += a * q[2] * 0.5; });
      return; }
    PX.forDisc(cx, cy, rp + 1, PW, PH, function (I, d) { var c = clamp(rp + 0.5 - d, 0, 1) * amt, rim = Math.exp(-Math.pow((rp - d) / Math.max(0.7, rp * 0.18), 2)); OIL[I] += c; AGE[I] += c * ageN; RED[I] += c * red; RIM[I] += rim * c; });
  }
  for (var s = 0; s < sessions; s++) {
    var ageDays = RD.range(0, total), u = RD.rand() * hs, bi = 0; while (bi < burners.length - 1 && u > habit[bi]) { u -= habit[bi]; bi++; }
    var b = burners[bi], dish = cook === 'A Bit Of Everything' ? RD.pick(['Fry-Ups', 'Stir-Fry', 'Sauces']) : cook, sauce = dish === 'Sauces';
    var n = Math.round((sauce ? 700 : dish === 'Stir-Fry' ? 9000 : 6000) * RD.range(0.4, 1.6)), panR = sauce ? 10 : dish === 'Stir-Fry' ? 16 : 13, rimH = sauce ? 12 : 6;
    for (var k = 0; k < n; k++) {
      var dia = Math.exp(RD.gaussian(Math.log(sauce ? 0.07 : 0.026), 0.75)), v = RD.range(80, sauce ? 160 : 320) * Math.pow(0.02 / Math.max(dia, 0.005), 0.15);
      var az = RD.range(0, 2 * PI), px0 = b.x + Math.cos(az) * panR * Math.sqrt(RD.rand()), py0 = b.d + Math.sin(az) * panR * Math.sqrt(RD.rand());
      var el = Math.asin(RD.range(0.1, 0.98)), dirA = RD.range(0, 2 * PI), vh = v * Math.cos(el), vy = -vh * Math.sin(dirA), vx = vh * Math.cos(dirA), vz = v * Math.sin(el);
      if (vy >= -1) continue; var t = py0 / -vy, drag = 1 / (1 + t * 0.6 / Math.max(dia * 40, 0.3)), z = rimH + vz * t * drag - 0.5 * g * t * t, x = px0 + vx * t * drag;
      if (z <= 0.3) continue; nd++;
      splat(x, z, dia * RD.range(1.6, 2.8) * 0.5, sauce ? 1.6 : 1, ageDays, sauce ? 1 : 0);
    }
  }
  if (event === 'Sauce Spat') { var ex = RH.pick(burners), ag = RD.range(0.5, total); for (var k2 = 0; k2 < 260; k2++) { var a2 = RD.range(-PI, 0), rr = RD.pareto(0.6, 1.4); splat(ex.x + RD.gaussian(0, 6), 14 + Math.abs(RD.gaussian(0, 7)), Math.exp(RD.gaussian(Math.log(0.12), 0.6)), 2, ag, 1); } }
  if (event === 'A Hot Pan Of Water') { /* no oil: steam leaves a pale bloom of limescale specks */ }
  // ---- shading
  var seed = RT.int(1, 9999), tw, th, bevel, grout = 0.22, base, gcol = PX.col(RT.pick(['#d8d4cc', '#bdb7ad', '#e6e2da']));
  if (tile === 'Metro White') { tw = 20; th = 10; bevel = 0.6; base = PX.col('#f2f1ec'); }
  else if (tile === 'Square White') { tw = th = 15; bevel = 0.25; base = PX.col('#f3f2ee'); }
  else if (tile === 'Square Cream') { tw = th = 10; bevel = 0.25; base = PX.col('#ebe2cc'); }
  else if (tile === 'Handmade Green') { tw = th = 13; bevel = 0.4; base = PX.col('#7f9c88'); }
  else { tw = th = 1e9; bevel = 0; base = PX.col('#e9eae6'); grout = 0; }
  var Rr = new Float32Array(N), Gg = new Float32Array(N), Bb = new Float32Array(N), amber = PX.col('#b98a3e'), sauceC = PX.col('#c2502a'), dust = PX.col('#8a7b66');
  PX.blur(OIL, PW, PH, 0.35 * ppc / 16.7); PX.blur(RED, PW, PH, 0.35 * ppc / 16.7); PX.blur(AGE, PW, PH, 0.35 * ppc / 16.7);
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, X = (px + 0.5) / ppc, Z = FH - (py + 0.5) / ppc, r, gg, bb;
    if (Z < 2.2) {   // the hob's back edge: dark glass with a soft reflection
      var f = 0.05 + 0.03 * sstep(2.2, 0, Z); r = f; gg = f; bb = f * 1.1; Rr[I] = r; Gg[I] = gg; Bb[I] = bb; continue;
    }
    var row = Math.floor((Z - 2.2) / th), off = tile === 'Metro White' && row % 2 ? tw / 2 : 0, tx = ((X + off) % tw + tw) % tw, tz = (Z - 2.2) - row * th;
    var dg = Math.min(tx, tw - tx, tz, th - tz), inG = dg < grout / 2, tid = row * 131 + Math.floor((X + off) / tw);
    var glaze = 1 + 0.015 * PX.fbm(X * 0.4, Z * 0.4, seed + 9, 3) + (tile === 'Handmade Green' ? 0.12 * PX.vnoise(X * 0.5 + tid, Z * 0.5, seed) + 0.04 * PX.fbm(X * 3, Z * 3, seed + tid, 3) : 0.012 * (PX.ihash(tid + seed) - 0.5));
    r = base[0] * glaze; gg = base[1] * glaze; bb = base[2] * glaze;
    var sh = 1, spec = 0;
    if (inG) { r = gcol[0]; gg = gcol[1]; bb = gcol[2]; sh = 0.88; var gs = clamp(PX.bil(OIL, PW, PH, px, py) * 2 + 0.3 * sstep(30, 3, Z), 0, 1); r *= 1 - 0.55 * gs; gg *= 1 - 0.6 * gs; bb *= 1 - 0.7 * gs; }
    else if (bevel > 0 && dg < grout / 2 + bevel) { var e = (dg - grout / 2) / bevel, top = tz < th / 2 ? -1 : 1; sh = 0.9 + 0.1 * Math.sqrt(e); if (tz > th / 2) spec = 0.12 * (1 - e) * (1 - e); }
    // a soft reflection of the under-cabinet light strip in the glaze
    spec += 0.07 * sstep(FH - 20, FH, Z) * (tile === 'Glass Panel' ? 2.5 : 1);
    var oil = OIL[I], ag = oil > 0 ? AGE[I] / oil : 0, red = oil > 0 ? RED[I] / oil : 0, rim = RIM[I];
    var cov = 1 - Math.exp(-oil * 1.6), od = cov * (0.45 + 0.55 * ag) + clamp(rim, 0, 2) * 0.15 * (0.4 + ag);
    var cr = lerp(amber[0], sauceC[0], red), cg = lerp(amber[1], sauceC[1], red), cb = lerp(amber[2], sauceC[2], red);
    cr = lerp(cr, dust[0], ag * 0.5); cg = lerp(cg, dust[1], ag * 0.5); cb = lerp(cb, dust[2], ag * 0.5);
    r = lerp(r, r * cr * 1.3, clamp(od, 0, 1)); gg = lerp(gg, gg * cg * 1.3, clamp(od, 0, 1)); bb = lerp(bb, bb * cb * 1.3, clamp(od, 0, 1));
    spec += 0.05 * cov * (1 - ag);   // fresh oil is glossy
    var wA = oldDays ? wipeAmt(X, Z) : 0; if (wA > 0) { var sm = 0.03 * wA * (1 - wA) * 4 * (0.5 + 0.5 * PX.vnoise(X * 0.5, Z * 5, seed + 11)); r *= 1 - sm; gg *= 1 - sm; bb *= 1 - sm * 1.5; spec += sm * 0.6; }
    var light = 0.62 + 0.5 * sstep(0, FH, Z) - 0.08 * Math.pow((X - FW / 2) / FW, 2) * 4;
    Rr[I] = r * sh * light + spec; Gg[I] = gg * sh * light + spec; Bb[I] = bb * sh * light + spec * 1.03;
  }
  if (C.query && C.query.get("dbg")) console.log("nd", nd, "sessions", sessions, "oil", OIL.reduce(function (a, b) { return a + b; }, 0));
  C.features({ Tiles: tile, Cooking: cook, 'Since Wiped': since, 'Favourite Ring': ['Back Left', 'Back Right', 'Front Left', 'Front Right', 'Wok'][habit.indexOf(Math.max.apply(null, habit))], Incident: event === 'A Hot Pan Of Water' ? 'None' : event });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.0, filmic: false, grain: 0.01, vig: 0.25, seed: 14 });
  C.done(o.cv.canvas, 'splashback');
})();

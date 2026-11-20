/* Before the Shovels, by Clyde (2026).
 * A small public place, seen from above, on the morning after snow and before anyone clears it.
 * Nobody is in the picture. People appear only as what they wore into the snow.
 * Engine: an active-walker crowd model (each walker follows the geodesic distance field to
 * where it is going; the cost of every cell falls as snow is packed, so later walkers are pulled
 * into earlier tracks and desire lines emerge), a footprint rasteriser in world units, a snow
 * heightfield (depth, wind drift, compaction, displaced rims), and a raking-light renderer
 * (exact line-sweep sun shadows, sky ambient occlusion, lamp pools, sparkle, film grain). */
(function () {
  var C = window.CLYDE, R = C.rng('main');
  var RW = R.fork('world'), RS = R.fork('walkers'), RL = R.fork('light'), RX = R.fork('texture'), RI = R.fork('incident');
  var NZ = C.noise(RX.fork('noise'));
  var WM = 20, HM = 25, VW = 1000, VH = 1250;   // world in metres; virtual canvas
  var PI = Math.PI, TAU = PI * 2;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sstep(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ======================= traits =======================
  var hour = RL.weighted([['Dawn', 34], ['Winter Noon', 28], ['Dusk', 28], ['Lamplight', 10]]);
  var place = RW.weighted([['The Corner', 30], ['The Fountain', 24], ['The Fence', 24], ['The Courtyard', 22]]);
  var snowfall = RW.weighted([['Dusting', 24], ['Fresh', 46], ['Deep', 30]]);
  var footfall = RS.weighted([['Solitary', 35], ['A Few', 40], ['Steady', 18], ['Crowd', 7]]);
  var incident = RI.weighted([['None', 34], ['Snow Angel', 9], ["Child's Snow Angel", 6], ['A Dog', 15], ['Lost Mitten', 12], ['Someone Waited', 14], ['Sledge', 10]]);
  if (snowfall === 'Dusting' && /Angel/.test(incident)) incident = 'A Dog';   // there is not enough snow to make one
  var windy = RW.chance(0.45);
  var Q = C.platform === 'standalone' ? C.query : null; if (Q && Q.get('hour')) hour = Q.get('hour'); if (Q && Q.get('place')) place = Q.get('place');   // dev preview only
  var depth = { 'Dusting': 0.035, 'Fresh': 0.11, 'Deep': 0.24 }[snowfall];
  C.features({ Place: place, Hour: hour, Snowfall: snowfall, Footfall: footfall, Incident: incident, Wind: windy ? 'Drifting' : 'Still' });

  // ======================= scene =======================
  var flipX = RW.chance(0.5), flipY = RW.chance(0.5);
  function T(x, y) { return [flipX ? WM - x : x, flipY ? HM - y : y]; }
  var shapes = [], objs = [], paths = [], ents = [], lamps = [], benches = [], trees = [];
  function circle(x, y, r) { return { k: 0, x: x, y: y, r: r }; }
  function box(x, y, hw, hh, a) { return { k: 1, x: x, y: y, hw: hw, hh: hh, c: Math.cos(a || 0), s: Math.sin(a || 0) }; }
  function seg(x1, y1, x2, y2, w) { return { k: 2, x1: x1, y1: y1, x2: x2, y2: y2, w: w }; }
  function sd(s, x, y) {
    if (s.k === 0) return Math.hypot(x - s.x, y - s.y) - s.r;
    if (s.k === 1) {
      var dx = x - s.x, dy = y - s.y, lx = Math.abs(dx * s.c + dy * s.s) - s.hw, ly = Math.abs(-dx * s.s + dy * s.c) - s.hh;
      return Math.hypot(Math.max(lx, 0), Math.max(ly, 0)) + Math.min(Math.max(lx, ly), 0);
    }
    var vx = s.x2 - s.x1, vy = s.y2 - s.y1, wx = x - s.x1, wy = y - s.y1, L = vx * vx + vy * vy;
    var t = L > 0 ? clamp((wx * vx + wy * vy) / L, 0, 1) : 0;
    return Math.hypot(wx - vx * t, wy - vy * t) - s.w / 2;
  }
  function bbox(s, pad) {
    if (s.k === 0) return [s.x - s.r - pad, s.y - s.r - pad, s.x + s.r + pad, s.y + s.r + pad];
    if (s.k === 1) { var e = Math.hypot(s.hw, s.hh) + pad; return [s.x - e, s.y - e, s.x + e, s.y + e]; }
    return [Math.min(s.x1, s.x2) - s.w / 2 - pad, Math.min(s.y1, s.y2) - s.w / 2 - pad, Math.max(s.x1, s.x2) + s.w / 2 + pad, Math.max(s.y1, s.y2) + s.w / 2 + pad];
  }
  function block(s) { shapes.push(s); return s; }
  function ent(p, w, kind) { ents.push({ x: clamp(p[0], 0.3, WM - 0.3), y: clamp(p[1], 0.3, HM - 0.3), w: w, kind: kind || 'edge' }); }
  function addLamp(p) { lamps.push({ x: p[0], y: p[1], h: 4.1 }); block(circle(p[0], p[1], 0.07)); objs.push({ t: 'lamp', x: p[0], y: p[1] }); }
  function addBench(p, ang) {   // ang: direction the sitter faces
    ang += 0.07 * NZ.n2(p[0] * 3.1, p[1] * 3.1);   // nobody sets a park bench square to anything
    var b = { x: p[0], y: p[1], a: ang, swept: [] };
    benches.push(b); objs.push({ t: 'bench', b: b });
    block(box(p[0], p[1], 0.95, 0.3, ang + PI / 2));
    b.seat = [p[0] + Math.cos(ang) * 0.75, p[1] + Math.sin(ang) * 0.75];
  }
  function addBin(p) { block(circle(p[0], p[1], 0.28)); objs.push({ t: 'bin', x: p[0], y: p[1] }); }
  function addTree(p, Rc, heavy) {
    var tr = { x: p[0], y: p[1], R: Rc, h: Rc * 1.5 + 2.5, segs: [] };
    block(circle(p[0], p[1], 0.24));
    var RT = RW.fork('tree' + trees.length), limbs = RT.int(5, 8), a0 = RT.range(0, TAU);
    function grow(x, y, a, len, w, z, dz, d) {
      var n = Math.max(2, Math.round(len / 0.22)), ca = a, curl = RT.gaussian(0, 0.05);
      for (var i = 0; i < n; i++) {
        ca += curl + RT.gaussian(0, 0.13);
        var nx = x + Math.cos(ca) * len / n, ny = y + Math.sin(ca) * len / n, nw = Math.max(0.004, w * 0.93), nz = z + dz / n;
        tr.segs.push([x, y, nx, ny, w, z, nz, nw]);
        if (d >= 1 && RT.chance(0.75)) { var sa2 = ca + RT.pick([-1, 1]) * RT.range(0.5, 1.2), sl = RT.range(0.08, 0.28); tr.segs.push([nx, ny, nx + Math.cos(sa2) * sl, ny + Math.sin(sa2) * sl, Math.min(nw, 0.006), nz, nz + 0.05, 0.003]); }
        if (d < 6 && i > 0 && tr.segs.length < 9000 && RT.chance(0.47 + d * 0.05)) grow(nx, ny, ca + RT.pick([-1, 1]) * RT.range(0.3, 0.8), len * RT.range(0.32, 0.55) * (1 - i / n * 0.4), w * 0.6, nz, dz * 0.45, d + 1);
        x = nx; y = ny; w = nw; z = nz;
      }
    }
    for (var i = 0; i < limbs; i++) {
      var a = a0 + i * TAU / limbs + RT.gaussian(0, 0.3);
      grow(p[0], p[1], a, Rc * RT.range(0.7, 1.05), heavy ? 0.24 : 0.1, tr.h - 2.5, 2.2, 0);
    }
    trees.push(tr); objs.push({ t: 'tree', tr: tr });
  }
  function addPath(pts, w) { paths.push({ pts: pts, w: w }); }
  function farFrom(p, list, d) { for (var i = 0; i < list.length; i++) if (Math.hypot(p[0] - list[i][0], p[1] - list[i][1]) < d) return false; return true; }
  function onPath(p, m) { for (var i = 0; i < paths.length; i++) { var P = paths[i]; for (var j = 0; j < P.pts.length - 1; j++) if (sd(seg(P.pts[j][0], P.pts[j][1], P.pts[j + 1][0], P.pts[j + 1][1], P.w), p[0], p[1]) < m) return true; } return false; }
  function pw(min) { return RW.pareto(min || 1, 1.3); }
  var buildingH = 0, sunPref = null;

  if (place === 'The Corner') {
    var a = RW.range(0.6, 0.74) * HM, c = RW.range(0.6, 0.72) * WM, wP = 2.2, tee = RW.chance(0.5), full = RW.chance(0.5);
    // the paths were laid out by someone with a hose, not a ruler: a slow bow in each
    var bA = RW.range(-1.4, 1.4), bC = RW.range(-1.4, 1.4), xe = full ? WM + 1 : c;
    var hy = function (x) { return a + bA * Math.sin(PI * clamp((x + 1) / (xe + 1), 0, 1)); }, vx = function (y) { return c + bC * Math.sin(PI * clamp((y + 1) / (a + 1), 0, 1)); };
    var P1 = [], P2 = []; for (var i = 0; i <= 16; i++) { var xx = lerp(-1, xe, i / 16), yy = lerp(-1, hy(c), i / 16); P1.push(T(xx, hy(xx))); P2.push(T(vx(yy), yy)); }
    addPath(P1, wP); addPath(P2, wP);
    if (tee) addPath([T(c, hy(c)), T(c, HM + 1)], wP);
    ent(T(0.3, a), pw(2)); ent(T(c, 0.3), pw(2));
    if (tee) ent(T(c, HM - 0.3), pw()); if (full) ent(T(WM - 0.3, a), pw());
    var gx = RW.range(0.2, 0.55) * (c - 2);
    if (RW.chance(0.45)) { var hy0 = 1.3; addHedge(T(0, hy0), T(gx - 0.55, hy0)); addHedge(T(gx + 0.55, hy0), T(vx(hy0) - wP / 2 - 0.6, hy0)); ent(T(gx, 0.3), pw(0.7), 'gap'); }
    for (var lx = RW.range(3, 6); lx < (full ? WM : c) - 1; lx += RW.range(8, 11)) addLamp(T(lx, hy(lx) - wP / 2 - 0.7));
    for (var ly = a - RW.range(7, 10); ly > 3; ly -= RW.range(8, 11)) addLamp(T(vx(ly) + wP / 2 + 0.7, ly));
    if (RW.chance(0.6)) { var bx = RW.range(3, c - 4); addBench(T(bx, hy(bx) + wP / 2 + 0.9), flipY ? PI / 2 : -PI / 2); if (RW.chance(0.4)) addBin(T(bx + 1.6, hy(bx + 1.6) + wP / 2 + 0.7)); }
    var tp = [], nt = RW.weighted([[0, 35], [1, 45], [2, 20]]);
    var mid = RW.range(0.35, 0.6), q = [lerp(0.3, c, mid), lerp(a, 0.3, mid)], off = RW.range(1.5, 3) * RW.pick([-1, 1]);
    if (nt > 0) tp.push([q[0] + off * 0.7, q[1] + off * 0.7]);
    for (var k = 0; k < 60 && tp.length < nt; k++) { var p = [RW.range(2.5, c - 3.5), RW.range(3.5, a - 3)]; if (farFrom(p, tp, 6)) tp.push(p); }
    tp.forEach(function (p) { addTree(T(p[0], p[1]), RW.range(2.6, 4.4)); });
  } else if (place === 'The Fountain') {
    // the basin is never centred: it is cropped by a frame edge, and the only formal path is a curve that skirts it
    var fs = RW.pick([-1, 1]), Rb = RW.range(3.4, 4.6), cx = fs < 0 ? Rb * RW.range(0.35, 0.85) : WM - Rb * RW.range(0.35, 0.85), cy = RW.range(0.3, 0.7) * HM, rr = Rb + RW.range(1.6, 2.4);
    block(circle(cx, cy, Rb)); objs.push({ t: 'basin', x: cx, y: cy, R: Rb, plinth: RW.chance(0.6) });
    var face = fs < 0 ? 0 : PI, span = RW.range(1.1, 1.45), arc = [];
    if (RW.chance(0.7)) {
      var aT = face - span, aB = face + span;
      for (var i = 0; i <= 24; i++) { var an = lerp(aT, aB, i / 24); arc.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]); }
      arc.sort(function (p, q) { return p[1] - q[1]; });
      var A0 = arc[0], A1 = arc[arc.length - 1], dr = RW.range(-3, 3);
      arc.unshift([A0[0] + dr * 0.5, A0[1] - 2], [A0[0] + dr, -1]); arc[0] = [A0[0] + dr, -1]; arc.splice(1, 1, [A0[0] + dr * 0.4, (A0[1] - 1) / 2]);
      arc.push([A1[0] - dr * 0.4, (A1[1] + HM + 1) / 2], [A1[0] - dr, HM + 1]);
      addPath(arc, 2.0);
      ent([clamp(arc[0][0], 1, WM - 1), 0.3], pw(1.5)); ent([clamp(arc[arc.length - 1][0], 1, WM - 1), HM - 0.3], pw(1.5));
    } else { ent([RW.range(0.3, 0.7) * WM, 0.3], pw(1.2)); ent([RW.range(0.3, 0.7) * WM, HM - 0.3], pw(1.2)); }
    var far = fs < 0 ? WM - 0.3 : 0.3;
    ent([far, RW.range(0.15, 0.45) * HM], pw(1)); if (RW.chance(0.7)) ent([far, RW.range(0.55, 0.9) * HM], pw(0.8));
    if (RW.chance(0.5)) ent([fs < 0 ? 0.3 : WM - 0.3, cy + fs * (Rb + RW.range(2, 5)) * RW.pick([-1, 1])], pw(0.6));
    var nb = RW.int(1, 2), cnt = 0, angs = [];
    for (var i = 0; i < 20 && cnt < nb; i++) { var an = face + RW.range(-1.2, 1.2); if (angs.some(function (q) { return Math.abs(q - an) < 0.6; })) continue; var p = [cx + Math.cos(an) * (rr + 1.75), cy + Math.sin(an) * (rr + 1.75)]; if (p[0] < 1 || p[0] > WM - 1 || p[1] < 1 || p[1] > HM - 1) continue; addBench(p, an + PI); angs.push(an); cnt++; }
    var nl = RW.int(1, 2); for (var i = 0; i < 12 && nl > 0; i++) { var an = face + RW.range(-1.3, 1.3); if (angs.some(function (q) { return Math.abs(q - an) < 0.35; })) continue; var p = [cx + Math.cos(an) * (rr + 1.3), cy + Math.sin(an) * (rr + 1.3)]; if (p[0] > 1 && p[0] < WM - 1 && p[1] > 1 && p[1] < HM - 1 && !onPath(p, 0.3)) { addLamp(p); angs.push(an); nl--; } }
    var tp = [];
    var ntf = RW.int(0, 2); for (var k = 0; k < 80 && tp.length < ntf; k++) { var p = [RW.range(2, WM - 2), RW.range(2, HM - 2)]; if (Math.hypot(p[0] - cx, p[1] - cy) > rr + 4 && !onPath(p, 2.5) && farFrom(p, tp, 7)) tp.push(p); }
    tp.forEach(function (p) { addTree(p, RW.range(2.8, 4.6)); });
  } else if (place === 'The Fence') {
    var y1 = RW.range(0.34, 0.62) * HM, y2 = RW.range(0.34, 0.62) * HM;
    var fy = function (x) { return lerp(y1, y2, x / WM); };
    var gu = RW.range(0.3, 0.7) * WM, bu = RW.chance(0.7) ? (gu > WM / 2 ? RW.range(0.08, gu / WM - 0.22) : RW.range(gu / WM + 0.22, 0.92)) * WM : -99;
    var cuts = [[gu - 0.8, gu + 0.8]]; if (bu > 0) cuts.push([bu - 0.55, bu + 0.55]); cuts.sort(function (p, q) { return p[0] - q[0]; });
    var x0 = -0.5; cuts.concat([[WM + 0.5, WM + 1]]).forEach(function (ct) { if (ct[0] > x0) addFence([x0, fy(x0)], [ct[0], fy(ct[0])]); x0 = ct[1]; });
    objs.push({ t: 'gate', x: gu, y: fy(gu), open: RW.range(0.9, 1.4) * RW.pick([-1, 1]) });
    block(circle(gu - 0.85, fy(gu - 0.85), 0.1)); block(circle(gu + 0.85, fy(gu + 0.85), 0.1));
    var top = RW.range(0.2, 0.8) * WM, bot = RW.range(0.2, 0.8) * WM;
    addPath([[top, -1], [gu, fy(gu) - 2], [gu, fy(gu) + 2], [bot, HM + 1]], 1.8);
    ent([top, 0.3], pw(1.5)); ent([bot, HM - 0.3], pw(1.5));
    ent([RW.chance(0.5) ? 0.3 : WM - 0.3, RW.range(0.08, 0.8) * fy(0)], pw(0.8));
    ent([RW.chance(0.5) ? 0.3 : WM - 0.3, lerp(fy(0) + 3, HM - 2, RW.range(0, 1))], pw(0.8));
    ent([RW.range(0.1, 0.9) * WM, HM - 0.3], pw(0.6));
    addLamp([gu + RW.pick([-1, 1]) * 2.2, fy(gu) + RW.pick([-1, 1]) * 1.4]);
    if (RW.chance(0.6)) addLamp([RW.range(0.15, 0.85) * WM, RW.range(0.75, 0.9) * HM]);
    var tp = [];
    var ntn = RW.int(0, 2); for (var k = 0; k < 80 && tp.length < ntn; k++) { var p = [RW.range(2, WM - 2), RW.range(2, HM - 2)]; if (Math.abs(p[1] - fy(p[0])) > 3.5 && !onPath(p, 2.5) && farFrom(p, tp, 7) && farFrom(p, lamps.map(function (l) { return [l.x, l.y]; }), 3)) tp.push(p); }
    tp.forEach(function (p) { addTree(p, RW.range(2.6, 4.4)); });
    if (RW.chance(0.6)) { var bx = RW.range(4, WM - 4), by = fy(bx) + 2.2; addBench([bx, by], PI / 2); }
  } else {
    var bd = 0; buildingH = RW.range(6, 10);
    var px = RW.range(0.3, 0.7) * WM, wing = RW.chance(0.5), wl = RW.chance(0.5), ww = 0, wy = RW.range(0.55, 0.8) * HM;
    var blds = [[-1, -12, px - 1.6, -0.02], [px + 1.6, -12, WM + 1, -0.02]];
    if (wing) blds.push(wl ? [-12, -12, -0.02, wy] : [WM + 0.02, -12, WM + 12, wy]);
    blds.forEach(function (b) { var q1 = T(b[0], b[1]), q2 = T(b[2], b[3]); var bb = [Math.min(q1[0], q2[0]), Math.min(q1[1], q2[1]), Math.max(q1[0], q2[0]), Math.max(q1[1], q2[1])]; objs.push({ t: 'building', b: bb, h: buildingH }); block(box((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2, (bb[2] - bb[0]) / 2, (bb[3] - bb[1]) / 2, 0)); });
    ent(T(px, 0.3), pw(1.5), 'arch');
    var x0 = wing && wl ? ww : 0, x1 = wing && !wl ? WM - ww : WM, nd = RW.int(2, 3), doors = [];
    for (var i = 0; i < nd; i++) { var dx = lerp(x0 + 1.5, x1 - 1.5, (i + RW.range(0.2, 0.8)) / nd); if (Math.abs(dx - px) < 2.5) dx += 3; doors.push(dx); ent(T(dx, 0.35), pw(1), 'door'); lamps.push({ x: T(dx, 0)[0], y: T(0, 0.2)[1], h: 2.7, wall: true }); }
    if (wing) { var wx = wl ? 0.35 : WM - 0.35, wdy = lerp(bd + 2, wy - 2, RW.range(0.2, 0.8)); ent(T(wx, wdy), pw(1), 'door'); lamps.push({ x: T(wl ? 0.2 : WM - 0.2, 0)[0], y: T(0, wdy)[1], h: 2.7, wall: true }); }
    var g1 = RW.range(0.25, 0.75) * WM; ent(T(g1, HM - 0.3), pw(1.5)); if (RW.chance(0.6)) ent(T(RW.chance(0.5) ? 0.3 : WM - 0.3, RW.range(0.75, 0.95) * HM), pw(0.8));
    addPath([T(x0, 1), T(x1, 1)], 2.0); addPath([T(px, -1), T(px, 1), T(g1, HM + 1)], 1.8);
    var bd0 = doors[RW.int(0, doors.length - 1)];
    if (RW.chance(0.5)) for (var i = 0; i < 3; i++) addBin(T(bd0 + 1.3 + i * 0.65, 0.5));
    if (false) { var rx = RW.range(x0 + 2, x1 - 6), ry = RW.range(0.62, 0.85) * HM; for (var i = 0; i < 5; i++) { var p = T(rx + i * 0.8, ry); objs.push({ t: 'hoop', x: p[0], y: p[1] }); block(seg(p[0], p[1] - 0.35, p[0], p[1] + 0.35, 0.05)); } }
    var tp = [];
    var ntc = RW.int(0, 1); for (var k = 0; k < 80 && tp.length < ntc; k++) { var p = T(RW.range(x0 + 4, x1 - 4), RW.range(5, HM - 4)); if (!onPath(p, 2.5) && farFrom(p, tp, 7)) tp.push(p); }
    tp.forEach(function (p) { addTree(p, RW.range(3, 4.8)); if (RW.chance(0.35)) addBench([p[0], p[1] + 1.4], PI / 2); });
    addLamp(T(RW.range(x0 + 3, x1 - 3), RW.range(0.6, 0.85) * HM));
    sunPref = flipY ? 'fromBottom' : 'fromTop';
  }
  function addHedge(p, q) { block(seg(p[0], p[1], q[0], q[1], 0.9)); objs.push({ t: 'hedge', s: seg(p[0], p[1], q[0], q[1], 0.9) }); }
  function addFence(p, q) { block(seg(p[0], p[1], q[0], q[1], 0.08)); objs.push({ t: 'fence', p: p, q: q }); }

  // ======================= light =======================
  var L = {
    'Dawn':        { el: RL.range(6, 10), sun: [1.0, 0.86, 0.72], si: 1.0, sky: [0.48, 0.54, 0.80], ki: 0.42, exp: 2.25, lamps: 0, tintS: [0.36, 0.32, 0.55], tintH: [1.0, 0.96, 0.9] },
    'Winter Noon': { el: RL.range(15, 20), sun: [1.0, 0.96, 0.90], si: 1.0, sky: [0.52, 0.62, 0.86], ki: 0.4, exp: 2.2, lamps: 0, tintS: [0.24, 0.40, 0.62], tintH: [1.0, 0.99, 0.97] },
    'Dusk':        { el: RL.range(3.5, 6), sun: [1.0, 0.76, 0.58], si: 1.0, sky: [0.44, 0.45, 0.68], ki: 0.42, exp: 2.2, lamps: 0.3, tintS: [0.36, 0.30, 0.50], tintH: [1.0, 0.93, 0.86] },
    'Overcast':    { el: 32, soft: true, sun: [1, 1, 1], si: 0.3, sky: [0.86, 0.89, 0.95], ki: 0.8, exp: 1.45, lamps: 0, tintS: [0.42, 0.45, 0.50], tintH: [0.98, 0.98, 0.97] },
    'Blue Hour':   { el: 40, sun: [1, 1, 1], si: 0.0, sky: [0.26, 0.38, 0.80], ki: 0.2, exp: 2.6, lamps: 1.0, tintS: [0.10, 0.16, 0.38], tintH: [1.0, 0.88, 0.72] },
    'Lamplight':   { el: RL.range(22, 34), moon: true, sun: [0.62, 0.72, 1.0], si: 0.13, sky: [0.34, 0.44, 0.85], ki: 0.06, exp: 2.2, lamps: 1.5, tintS: [0.04, 0.06, 0.14], tintH: [1.0, 0.82, 0.6] }
  }[hour];
  var lampCol = RL.chance(0.7) ? [1.0, 0.5, 0.17] : [1.0, 0.76, 0.5], litPick = RL.fork('lit');
  var az;
  if (buildingH && L.si > 0 && !L.soft) L.el = Math.max(L.el, RL.range(14, 22));
  var tE0 = Math.tan(L.el * PI / 180), wingW = objs.some(function (o) { return o.t === 'building' && (o.b[0] < -1 || o.b[2] > WM + 1); });
  for (var k = 0; k < 60; k++) {
    az = RL.range(0, TAU);
    var ok = Math.abs(Math.sin(2 * az)) > 0.35;
    if (sunPref) { var sy = Math.sin(az); ok = ok && (sunPref === 'fromTop' ? sy < -0.25 : sy > 0.25); }
    // the building is a presence, not a lid: its shadow may reach at most ~40% into the frame
    if (buildingH && L.si > 0) { ok = ok && buildingH / tE0 * Math.abs(Math.sin(az)) < 0.24 * HM; if (wingW) ok = ok && buildingH / tE0 * Math.abs(Math.cos(az)) < 0.22 * WM; }
    if (ok) break;
  }
  if (buildingH && L.si > 0) { var reach = Math.max(Math.abs(Math.sin(az)) / (0.24 * HM), wingW ? Math.abs(Math.cos(az)) / (0.22 * WM) : 0) * buildingH / tE0; if (reach > 1) { buildingH /= reach; objs.forEach(function (o) { if (o.t === 'building') o.h = buildingH; }); } }
  var sunD = [Math.cos(az), Math.sin(az)], tanE = Math.tan(L.el * PI / 180);
  var sunV = [Math.cos(L.el * PI / 180) * sunD[0], Math.cos(L.el * PI / 180) * sunD[1], Math.sin(L.el * PI / 180)];
  var ghosts = [];
  if (L.si > 0 && !L.soft) { var ng = RL.weighted([[0, 8], [1, 32], [2, 38], [3, 22]]);
    for (var g = 0; g < ng; g++) { var tgt = [RL.range(0.1, 0.9) * WM, RL.range(0.1, 0.9) * HM], dz = RL.range(4.5, 7) / tanE;
      var gp = [tgt[0] + sunD[0] * dz, tgt[1] + sunD[1] * dz];
      if (gp[0] > -1 && gp[0] < WM + 1 && gp[1] > -1 && gp[1] < HM + 1) continue;   // must be out of frame
      addTree(gp, RL.range(3.5, 6), true); ghosts.push(trees[trees.length - 1]); objs.pop(); shapes.pop(); } }
  var windA = RW.range(0, TAU), windV = [Math.cos(windA), Math.sin(windA)];

  // ======================= walkers (simulation grid, resolution independent) =======================
  var CS = 0.2, GW = Math.round(WM / CS), GH = Math.round(HM / CS), GN = GW * GH;
  var cost0 = new Float32Array(GN), blocked = new Uint8Array(GN), Tr = new Float32Array(GN), pathMask = new Float32Array(GN);
  function driftF(x, y) { return sstep(-0.05, 0.4, NZ.fbm(x * 0.07 + 13.1, y * 0.07 - 7.3, 2)); }   // deep drifts people walk around
  var pathPref = { 'Dusting': 0.62, 'Fresh': 0.92, 'Deep': 0.97 }[snowfall];
  var trailK = { 'Dusting': 0.3, 'Fresh': 0.5, 'Deep': 0.64 }[snowfall];
  function pathDist(x, y) { var m = 1e9; for (var i = 0; i < paths.length; i++) { var P = paths[i]; for (var j = 0; j < P.pts.length - 1; j++) m = Math.min(m, sd(seg(P.pts[j][0], P.pts[j][1], P.pts[j + 1][0], P.pts[j + 1][1], P.w), x, y)); } return m; }
  for (var gy = 0; gy < GH; gy++) for (var gx2 = 0; gx2 < GW; gx2++) {
    var x = (gx2 + 0.5) * CS, y = (gy + 0.5) * CS, i = gy * GW + gx2, m = 1e9;
    for (var s = 0; s < shapes.length; s++) m = Math.min(m, sd(shapes[s], x, y));
    var pd = pathDist(x, y); pathMask[i] = pd < 0 ? 1 : 0;
    blocked[i] = m < 0.22 ? 1 : 0;
    cost0[i] = (pd < 0 ? pathPref : 1 + 0.9 * driftF(x, y)) + 0.5 * Math.max(0, 1 - (m - 0.22) / 0.6);
  }
  function cellOf(x, y) { var cx = clamp(Math.floor(x / CS), 0, GW - 1), cy = clamp(Math.floor(y / CS), 0, GH - 1); return cy * GW + cx; }
  // free the entrances (they may sit on a hedge gap etc.)
  ents.forEach(function (e) { for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var c = cellOf(e.x + dx * CS, e.y + dy * CS); if (blocked[c] && !(e.kind === 'door')) blocked[c] = 0; } blocked[cellOf(e.x, e.y)] = 0; });
  // binary heap Dijkstra on an 8-connected grid
  var hk = new Float64Array(GN * 8), hv = new Int32Array(GN * 8);
  function dijkstra(tx, ty) {
    var D = new Float64Array(GN).fill(1e9), n = 0, t = cellOf(tx, ty), cst = new Float32Array(GN);
    for (var i = 0; i < GN; i++) cst[i] = blocked[i] ? 1e9 : cost0[i] * (1 - trailK * Math.min(1, Tr[i] * 1.3));
    function push(k, v) { var j = n++; while (j > 0) { var p = (j - 1) >> 1; if (hk[p] <= k) break; hk[j] = hk[p]; hv[j] = hv[p]; j = p; } hk[j] = k; hv[j] = v; }
    function pop() { var v = hv[0], k = hk[--n], x = hv[n], j = 0; while (true) { var l = 2 * j + 1; if (l >= n) break; var r = l + 1, c = r < n && hk[r] < hk[l] ? r : l; if (hk[c] >= k) break; hk[j] = hk[c]; hv[j] = hv[c]; j = c; } hk[j] = k; hv[j] = x; return v; }
    D[t] = 0; push(0, t);
    var DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1], DL = [1, 1, 1, 1, 1.4142, 1.4142, 1.4142, 1.4142];
    while (n > 0) {
      var kk = hk[0], u = pop(); if (kk > D[u]) continue;
      var ux = u % GW, uy = (u / GW) | 0;
      for (var d = 0; d < 8; d++) {
        var vx = ux + DX[d], vy = uy + DY[d]; if (vx < 0 || vy < 0 || vx >= GW || vy >= GH) continue;
        var v = vy * GW + vx; if (cst[v] >= 1e8) continue;
        if (d > 3 && (cst[uy * GW + vx] >= 1e8 || cst[vy * GW + ux] >= 1e8)) continue;
        var nd = D[u] + 0.5 * (cst[u] + cst[v]) * DL[d] * CS;
        if (nd < D[v]) { D[v] = nd; push(nd, v); }
      }
    }
    for (var pass = 0; pass < 3; pass++) for (var i = 0; i < GN; i++) if (D[i] >= 1e8) {
      var ix = i % GW, iy = (i / GW) | 0, mx = -1;
      if (ix > 0 && D[i - 1] < 1e8) mx = Math.max(mx, D[i - 1]); if (ix < GW - 1 && D[i + 1] < 1e8) mx = Math.max(mx, D[i + 1]);
      if (iy > 0 && D[i - GW] < 1e8) mx = Math.max(mx, D[i - GW]); if (iy < GH - 1 && D[i + GW] < 1e8) mx = Math.max(mx, D[i + GW]);
      if (mx >= 0) D[i] = mx + CS * 3;
    }
    return D;
  }
  function sample(F, x, y) {
    var fx = clamp(x / CS - 0.5, 0, GW - 1.001), fy = clamp(y / CS - 0.5, 0, GH - 1.001), ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, i = iy * GW + ix;
    return (F[i] * (1 - ax) + F[i + 1] * ax) * (1 - ay) + (F[i + GW] * (1 - ax) + F[i + GW + 1] * ax) * ay;
  }
  var prints = [];   // x, y, angle, len, wid, kind(0 shoe,1 paw,2 drag,3 runner), strength, x2, y2
  function deposit(x, y, a) {
    var fx = x / CS - 0.5, fy = y / CS - 0.5, ix = Math.round(fx), iy = Math.round(fy);
    for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
      var cx = ix + dx, cy = iy + dy; if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) continue;
      var w = Math.exp(-((cx - fx) * (cx - fx) + (cy - fy) * (cy - fy)) / 1.4), j = cy * GW + cx;
      Tr[j] = 1 - (1 - Tr[j]) * (1 - a * w);
    }
  }
  var fields = {}, fieldVer = {}, ver = 0;
  function field(key, x, y) { if (fieldVer[key] !== ver) { fields[key] = dijkstra(x, y); fieldVer[key] = ver; } return fields[key]; }
  function walk(R2, from, to, key, o) {
    o = o || {};
    var F = field(key, to[0], to[1]);
    var x = from[0], y = from[1], stepL = o.step || R2.range(0.6, 0.74), footL = o.foot || R2.range(0.25, 0.3), lat = R2.range(0.075, 0.1);
    var bias = R2.gaussian(0, o.bias == null ? 0.14 : o.bias), wander = 0, wAmp = o.wander || 0.35, side = R2.chance(0.5) ? 1 : -1;
    var g0x = sample(F, x + 0.1, y) - sample(F, x - 0.1, y), g0y = sample(F, x, y + 0.1) - sample(F, x, y - 0.1), gl = Math.hypot(g0x, g0y) || 1;
    var hx = -g0x / gl, hy = -g0y / gl, acc = R2.range(0, stepL), sub = 0.16, last = {}, maxS = 1600, dep = o.deposit == null ? 0.075 * depK : o.deposit, F0 = sample(F, x, y), hes = o.hes;
    for (var s = 0; s < maxS; s++) {
      if (Math.hypot(x - to[0], y - to[1]) < 0.45) break;
      var gx = sample(F, x + 0.1, y) - sample(F, x - 0.1, y), gy = sample(F, x, y + 0.1) - sample(F, x, y - 0.1), g = Math.hypot(gx, gy);
      var dx = g > 1e-6 ? -gx / g : to[0] - x, dy = g > 1e-6 ? -gy / g : to[1] - y;
      if (g <= 1e-6) { var dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl; }
      wander = wander * 0.93 + R2.gaussian(0, 0.08); var wa = wander * wAmp * 3, cw = Math.cos(wa), sw = Math.sin(wa);
      var tx = dx * cw - dy * sw, ty = dx * sw + dy * cw;
      hx = hx * 0.8 + tx * 0.2; hy = hy * 0.8 + ty * 0.2; var hl = Math.hypot(hx, hy) || 1; hx /= hl; hy /= hl;
      var nx = x + hx * sub, ny = y + hy * sub;
      if (blocked[cellOf(nx, ny)] && !blocked[cellOf(x, y)]) { nx = x + dx * sub; ny = y + dy * sub; if (blocked[cellOf(nx, ny)]) { hx = dx; hy = dy; continue; } }
      x = nx; y = ny; acc += sub;
      if (o.onStep) o.onStep(x, y, hx, hy);
      if (hes && sample(F, x, y) < F0 * (1 - hes)) {   // stopped, looked about, went on
        hes = 0; var a0 = Math.atan2(hy, hx), lk = R2.range(0.4, 1.0) * (R2.chance(0.5) ? 1 : -1);
        stand(x, y, a0, footL, 1, 0.12); stand(x + hx * 0.06, y + hy * 0.06, a0 + lk, footL, 0.85, 0.14); acc = 0; last = {};
      }
      if (acc >= stepL / 2 || (o.paw && acc >= 0.18)) {
        acc = 0; side = -side;
        var ang = Math.atan2(hy, hx), px = -hy, py = hx, off = side * lat + bias;
        var fx = x + px * off, fy = y + py * off;
        if (o.paw) { prints.push(fx, fy, ang, 0.06, 0.05, 1, 0.8, 0, 0); prints.push(fx + hx * 0.12 - px * side * 0.05, fy + hy * 0.12 - py * side * 0.05, ang, 0.06, 0.05, 1, 0.8, 0, 0); }
        else {
          var used = Math.min(1, Tr[cellOf(fx, fy)] * 1.4);
          prints.push(fx, fy, ang + side * R2.range(0.05, 0.16) + R2.gaussian(0, 0.05), footL * R2.range(0.95, 1.06), footL * R2.range(0.36, 0.41), 0, 1 - 0.72 * used, 0, 0);
          if (snowfall === 'Deep' && last[side]) prints.push(last[side][0], last[side][1], 0, footL * 0.3, 0, 2, 0.5, fx - hx * footL * 0.4, fy - hy * footL * 0.4);
          last[side] = [fx + hx * footL * 0.45, fy + hy * footL * 0.45];
        }
        deposit(x, y, dep);
      }
    }
    return [x, y];
  }
  // ======================= who came this way =======================
  // A single set of prints is powerful, a few is strong, a crowd is a message. Every person has an errand:
  // in by one way, out by another, sometimes a bench or a bin on the way, sometimes a pause to look about.
  var fk = { 'Solitary': 0.3, 'A Few': 0.35, 'Steady': 0.7, 'Crowd': 1 }[footfall];
  trailK *= fk;   // few people barely make a path; they step in each other's prints at most
  var depK = { 'Solitary': 0.45, 'A Few': 0.5, 'Steady': 0.8, 'Crowd': 1 }[footfall];
  var bins = objs.filter(function (o) { return o.t === 'bin'; });
  function stand(x, y, ang, fl, st, spread) {   // feet side by side: where someone stopped
    var px = -Math.sin(ang), py = Math.cos(ang), s = spread || 0.12;
    for (var k = -1; k <= 1; k += 2) prints.push(x + px * s * k, y + py * s * k, ang + k * 0.1, fl, fl * 0.39, 0, st == null ? 1 : st, 0, 0);
  }
  var nWalk = { 'Solitary': 1, 'A Few': RS.int(2, 4), 'Steady': RS.int(12, 22), 'Crowd': RS.int(90, 140) }[footfall];
  var soloInc = footfall === 'Solitary' && /Angel|A Dog|Waited|Sledge/.test(incident);   // then the incident is the one person who came this way
  if (soloInc) nWalk = 0;
  var every = Math.max(4, Math.round(nWalk / 18));
  var tot = ents.reduce(function (s, e) { return s + e.w; }, 0);
  function pickEnt(R2, not) { for (var k = 0; k < 20; k++) { var r = R2.range(0, tot), j = 0; for (; j < ents.length - 1; j++) { r -= ents[j].w; if (r <= 0) break; } if (j !== not && (not == null || Math.hypot(ents[j].x - ents[not].x, ents[j].y - ents[not].y) > 6)) return j; } return (not + 1) % ents.length; }
  function entPt(R2, e) {   // people do not all step through the same point of an open edge
    var j = e.kind === 'edge' ? R2.gaussian(0, 0.7) : R2.gaussian(0, 0.15), x = e.x, y = e.y;
    if (x < 0.5 || x > WM - 0.5) y = clamp(y + j, 0.3, HM - 0.3); else x = clamp(x + j, 0.3, WM - 0.3);
    var c = cellOf(x, y); return blocked[c] ? [e.x, e.y] : [x, y];
  }
  function compScore(o, d) {   // a lone track should cross the picture with some intent, not hug an edge or bisect it
    var a = ents[o], b = ents[d], L = Math.hypot(b.x - a.x, b.y - a.y), th = Math.atan2(b.y - a.y, b.x - a.x);
    var mx = (a.x + b.x) / 2 / WM, my = (a.y + b.y) / 2 / HM, t3 = Math.min(Math.abs(mx - 1 / 3), Math.abs(mx - 2 / 3)) + Math.min(Math.abs(my - 1 / 3), Math.abs(my - 2 / 3));
    var edgeA = a.x < 1 ? 0 : a.x > WM - 1 ? 1 : a.y < 1 ? 2 : a.y > HM - 1 ? 3 : -1, edgeB = b.x < 1 ? 0 : b.x > WM - 1 ? 1 : b.y < 1 ? 2 : b.y > HM - 1 ? 3 : -2;
    return -Math.abs(L - 17) / 8 - Math.max(0, 10 - L) * 0.6 + 0.6 * Math.abs(Math.sin(2 * th)) - 2 * t3 - (edgeA === edgeB ? 3 : 0);
  }
  function shadeAt(x, y) {   // rough: is this spot under a crown's or a building's shadow?
    var sh = 0;
    trees.forEach(function (tr) { var c = [tr.x - sunD[0] * 0.7 * tr.h / tanE, tr.y - sunD[1] * 0.7 * tr.h / tanE]; if (Math.hypot(x - c[0], y - c[1]) < tr.R * 1.1) sh = Math.max(sh, 0.5); });
    objs.forEach(function (o) { if (o.t !== 'building') return; var b = o.b, hh = o.h || buildingH || 0; for (var t = 0; t < hh / tanE; t += 0.5) { var qx = x + sunD[0] * t, qy = y + sunD[1] * t; if (qx > b[0] && qx < b[2] && qy > b[1] && qy < b[3]) { sh = 1; break; } } });
    return sh;
  }
  function shadeScore(o, d) {   // a lone track that crosses one shadow reads; one buried in shade does not
    var a = ents[o], b = ents[d], f = 0; for (var k = 1; k < 12; k++) f += shadeAt(lerp(a.x, b.x, k / 12), lerp(a.y, b.y, k / 12)) / 11;
    return f > 0.08 && f < 0.45 ? 0.6 : f > 0.6 ? -1.5 : 0;
  }
  var usedPair = {};
  function pair(R2, tries, comp) {
    var best = null, bs = -1e9;
    for (var k = 0; k < tries; k++) { var o = pickEnt(R2), d = pickEnt(R2, o), key = Math.min(o, d) + '-' + Math.max(o, d); var s = R2.range(0, 1.2) - (usedPair[key] || 0) * 1.5 + (comp ? compScore(o, d) + (L.si > 0 ? shadeScore(o, d) : 0) : 0); if (s > bs) { bs = s; best = [o, d, key]; } }
    usedPair[best[2]] = (usedPair[best[2]] || 0) + 1; return best;
  }
  function errand(R2) { var r = R2.range(0, 1); if (benches.length && r < 0.2) return 'bench'; if (bins.length && r < 0.32) return 'bin'; return 'through'; }
  function person(R2, o, d, kind, opt) {
    opt.foot = opt.foot || R2.range(0.25, 0.3); opt.step = opt.step || R2.range(0.6, 0.74);
    var start = entPt(R2, ents[o]), dst = entPt(R2, ents[d]); ver++;
    if (kind === 'bench') {   // sat a while: feet planted in front of the seat
      var b = R2.pick(benches), bi = benches.indexOf(b), ca = Math.cos(b.a), sa = Math.sin(b.a), off = R2.range(-0.5, 0.5);
      var seat = [b.x + ca * 0.62 - sa * off, b.y + sa * 0.62 + ca * off];
      walk(R2, start, [seat[0] + ca * 0.3, seat[1] + sa * 0.3], 'b' + bi, opt);
      stand(seat[0], seat[1], b.a, opt.foot, 1, 0.14); stand(seat[0] + ca * 0.12, seat[1] + sa * 0.12, b.a + R2.gaussian(0, 0.25), opt.foot, 0.7, 0.17);
      b.swept.push(off / 0.9); start = [seat[0] + ca * 0.35, seat[1] + sa * 0.35]; ver++;
    } else if (kind === 'bin') {   // a detour to the bin and on
      var bn = R2.pick(bins), aa = Math.atan2(start[1] - bn.y, start[0] - bn.x) + R2.gaussian(0, 0.4), bp = [bn.x + Math.cos(aa) * 0.62, bn.y + Math.sin(aa) * 0.62];
      if (!blocked[cellOf(bp[0], bp[1])]) { walk(R2, start, [bp[0] + Math.cos(aa) * 0.25, bp[1] + Math.sin(aa) * 0.25], 'bin' + bins.indexOf(bn), opt); stand(bp[0], bp[1], aa + PI, opt.foot, 1, 0.12); start = bp; ver++; }
    }
    return walk(R2, start, dst, 'e' + d, opt);
  }
  var vias = [], RV = RS.fork('vias');   // only a crowd spreads out to the sunny patch and the shortcut
  if (footfall === 'Crowd') for (var k = 0; k < 200 && vias.length < RV.int(1, 3); k++) { var p = [RV.range(3, WM - 3), RV.range(3, HM - 3)], c = cellOf(p[0], p[1]); if (!blocked[c] && cost0[c] < 1.3 && farFrom(p, vias, 6)) vias.push(p); }
  for (var w = 0; w < nWalk; w++) {
    var RWk = RS.fork('w' + w), kid = RWk.chance(footfall === 'Solitary' ? 0.06 : 0.12), opt = kid ? { step: RWk.range(0.42, 0.52), foot: RWk.range(0.17, 0.21), wander: 0.6 } : {};
    if (footfall === 'Crowd') {
      if (w % every === 0) ver++;
      var o = pickEnt(RWk), d = pickEnt(RWk, o), start = entPt(RWk, ents[o]), dst = entPt(RWk, ents[d]);
      if (vias.length && RWk.chance(0.15)) { var vi = RWk.int(0, vias.length - 1); start = walk(RWk, start, vias[vi], 'v' + vi, opt); }
      if (benches.length && RWk.chance(0.06)) { var b = RWk.pick(benches), bi = benches.indexOf(b); start = walk(RWk, start, b.seat, 'b' + bi, opt); b.swept.push(RWk.range(-0.55, 0.55)); }
      walk(RWk, start, dst, 'e' + d, opt);
    } else {
      var pr = pair(RWk, footfall === 'Steady' ? 3 : footfall === 'Solitary' || w === 0 ? 40 : 12, footfall !== 'Steady'), kind = footfall === 'Solitary' ? (RWk.chance(0.75) ? 'through' : errand(RWk)) : errand(RWk);
      if (footfall !== 'Crowd' && RWk.chance(footfall === 'Steady' ? 0.15 : 0.35)) opt.hes = RWk.range(0.3, 0.7);
      if (RWk.chance(0.5)) { var t = pr[0]; pr[0] = pr[1]; pr[1] = t; }
      person(RWk, pr[0], pr[1], kind, opt);
    }
  }
  var trailMax = 0; for (var i = 0; i < GN; i++) trailMax = Math.max(trailMax, Tr[i]);

  // ======================= incidents =======================
  var mitten = null, sledge = null, angel = null;
  function openSpot(R2, minT, dmin, dmax) {
    var best = null, bs = -1e9;
    for (var k = 0; k < 400; k++) {
      var x = R2.range(3, WM - 3), y = R2.range(3, HM - 3), c = cellOf(x, y); if (blocked[c] || Tr[c] > 0.05) continue;
      var m = 1e9; for (var s = 0; s < shapes.length; s++) m = Math.min(m, sd(shapes[s], x, y)); if (m < 2) continue;
      var nt = 99; for (var a = 0; a < 16; a++) for (var r = 0.5; r < 8; r += 0.5) { var cc = cellOf(x + Math.cos(a / 16 * TAU) * r, y + Math.sin(a / 16 * TAU) * r); if (Tr[cc] > minT) { nt = Math.min(nt, r); break; } }
      if (nt < dmin || nt > dmax) continue;
      var sc = Math.min(m, 5) + R2.range(0, 1) - Math.abs(x / WM - 0.5) * 2 - Math.abs(y / HM - 0.5) * 2;
      if (L.si > 0) { var shd = shadeAt(x, y) + shadeAt(x, y - 0.8) + shadeAt(x, y + 0.8); for (var t = 0.3; t < 1.6 / tanE && t < 12; t += 0.25) for (var o2 = -1; o2 <= 1; o2++) if (blocked[cellOf(x + sunD[0] * t + o2 * 0.8 * -sunD[1], y + sunD[1] * t + o2 * 0.8 * sunD[0])]) shd += 0.4; sc -= 2 * shd; }   // in the sun, where it can be seen
      if (sc > bs) { bs = sc; best = [x, y, nt]; }
    }
    return best;
  }
  function nearestTrail(x, y) { var best = null, bd = 1e9; for (var i = 0; i < GN; i++) if (Tr[i] > 0.02) { var cx = (i % GW + 0.5) * CS, cy = ((i / GW | 0) + 0.5) * CS, d = Math.hypot(cx - x, cy - y); if (d < bd) { bd = d; best = [cx, cy]; } } return best || [ents[0].x, ents[0].y]; }
  if (/Angel/.test(incident)) {
    var child = incident !== 'Snow Angel', asc = child ? 0.64 : 1;
    var sp = openSpot(RI, 0.02, 2.5, 8) || openSpot(RI, 0.02, 0, 99);
    if (sp) {
      var kOpt = child ? { step: 0.44, foot: 0.19, wander: 0.5, bias: 0, deposit: 0.02 } : { step: RI.range(0.62, 0.7), foot: RI.range(0.27, 0.3), wander: 0.25, bias: 0, deposit: 0.03 };
      var src = nWalk > 0 ? nearestTrail(sp[0], sp[1]) : entPt(RI, ents[pickEnt(RI)]);
      var aa = -PI / 2 + RI.gaussian(0, 0.4);   // body axis, hips to head. They walk round to the foot end, turn their back and fall; head roughly up the page so the figure reads as one
      angel = { x: sp[0], y: sp[1], a: aa, s: asc, hand: RI.chance(0.5) ? 1 : -1, knee: RI.chance(0.55), armMax: RI.range(2.62, 2.88), legMax: RI.range(0.5, 0.72), seed: RI.int(0, 9999) };
      ver++;
      var ca0 = Math.cos(aa), sa0 = Math.sin(aa), foot = [sp[0] - ca0 * 1.08 * asc, sp[1] - sa0 * 1.08 * asc];
      var keep = []; for (var gy = -8; gy <= 8; gy++) for (var gx = -8; gx <= 8; gx++) { var qx = sp[0] + gx * CS, qy = sp[1] + gy * CS, c = cellOf(qx, qy); if (Math.hypot(gx, gy) * CS < 1.0 * asc + 0.3 && Math.hypot(qx - foot[0], qy - foot[1]) > 0.45 && !blocked[c]) { blocked[c] = 1; keep.push(c); } }
      ver++; walk(RI, src, [foot[0] - ca0 * 0.3, foot[1] - sa0 * 0.3], 'ang', kOpt);   // they went round the fresh patch, not across it

      stand(foot[0], foot[1], aa + PI, kOpt.foot, 1, 0.12 * asc);   // stood with their back to it
      var kp = [sp[0] - ca0 * 0.78 * asc - sa0 * 0.06, sp[1] - sa0 * 0.78 * asc + ca0 * 0.06];   // got up: a boot planted in the skirt, then a long step out
      prints.push(kp[0], kp[1], aa + PI + RI.gaussian(0, 0.25), kOpt.foot, kOpt.foot * 0.4, 0, 1, 0, 0);
      var out = [sp[0] - ca0 * 1.5 * asc + RI.gaussian(0, 0.1), sp[1] - sa0 * 1.5 * asc + RI.gaussian(0, 0.1)];
      prints.push(out[0], out[1], aa + PI + RI.gaussian(0, 0.3), kOpt.foot, kOpt.foot * 0.39, 0, 1, 0, 0);
      var dE = pickEnt(RI), dP = entPt(RI, ents[dE]);
      walk(RI, out, dP, 'ang2', kOpt);
      keep.forEach(function (c) { blocked[c] = 0; }); ver++;
      if (child) {   // a grown-up stood a few steps off and watched
        for (var k = 0; k < 8; k++) { var wa = aa + PI + RI.range(-1.6, 1.6), wp = [sp[0] + Math.cos(wa) * 2.3, sp[1] + Math.sin(wa) * 2.3]; if (!blocked[cellOf(wp[0], wp[1])] && wp[0] > 0.5 && wp[1] > 0.5 && wp[0] < WM - 0.5 && wp[1] < HM - 0.5) break; wp = null; }
        if (wp) { var pO = { foot: 0.29, step: 0.68, deposit: 0.03 }; walk(RI, src, wp, 'par', pO); var fa = Math.atan2(sp[1] - wp[1], sp[0] - wp[0]); stand(wp[0], wp[1], fa, 0.29, 1, 0.13); stand(wp[0] + RI.gaussian(0, 0.08), wp[1] + RI.gaussian(0, 0.08), fa + RI.range(-0.5, 0.5), 0.29, 0.8, 0.15); walk(RI, wp, dP, 'par2', pO); }
      }
    }
  } else if (incident === 'A Dog') {   // someone walked the dog; the dog went everywhere
    var R2 = RI.fork('dog'), pr = pair(R2, 30, true), o0 = pr[0], d0 = pr[1], hist = [];
    var pO = { onStep: function (x, y) { hist.push([x, y]); } };
    var pe = person(R2, o0, d0, 'through', pO), a0 = [ents[o0].x, ents[o0].y], b0 = [ents[d0].x, ents[d0].y], vx = b0[0] - a0[0], vy = b0[1] - a0[1], vl = Math.hypot(vx, vy) || 1;
    var marks = lamps.filter(function (l) { return !l.wall; }).map(function (l) { return [l.x, l.y]; }).concat(trees.map(function (t) { return [t.x, t.y]; })).concat(bins.map(function (b) { return [b.x, b.y]; }));
    marks = marks.filter(function (m) { var t = ((m[0] - a0[0]) * vx + (m[1] - a0[1]) * vy) / (vl * vl); return t > 0.05 && t < 0.95 && Math.abs((m[0] - a0[0]) * vy - (m[1] - a0[1]) * vx) / vl < 5; });
    for (var k = 0; k < 3; k++) { var h = hist[Math.floor(R2.range(0.15, 0.85) * hist.length)]; if (h) marks.push([h[0] + R2.gaussian(0, 2.2), h[1] + R2.gaussian(0, 2.2)]); }   // and nothing in particular
    marks.sort(function (p, q) { return ((p[0] - a0[0]) * vx + (p[1] - a0[1]) * vy) - ((q[0] - a0[0]) * vx + (q[1] - a0[1]) * vy); });
    marks = marks.slice(0, 5); marks.push(pe);
    var cur = hist.length ? hist[Math.min(4, hist.length - 1)] : a0; ver++;
    marks.forEach(function (m, i) { var tgt = [m[0] + R2.gaussian(0, 0.5), m[1] + R2.gaussian(0, 0.5)]; tgt[0] = clamp(tgt[0], 0.4, WM - 0.4); tgt[1] = clamp(tgt[1], 0.4, HM - 0.4); if (blocked[cellOf(tgt[0], tgt[1])]) tgt = [m[0] + 0.7, m[1] + 0.7]; cur = walk(R2, cur, tgt, 'dog' + i, { paw: true, step: 0.4, wander: 1.4, bias: 0, deposit: 0.01 }); });
  } else if (incident === 'Lost Mitten') {   // dropped beside somebody's track
    var hp = []; for (var p = 0; p < prints.length; p += 9) if (prints[p + 5] === 0 && prints[p] > 3 && prints[p] < WM - 3 && prints[p + 1] > 3 && prints[p + 1] < HM - 3) hp.push(p);
    if (hp.length) { var p = hp[RI.int(0, hp.length - 1)], pa = prints[p + 2]; mitten = { x: prints[p] - Math.sin(pa) * RI.range(0.2, 0.4), y: prints[p + 1] + Math.cos(pa) * RI.range(0.2, 0.4), a: RI.range(0, TAU) }; }
  } else if (incident === 'Someone Waited') {
    var spots = benches.map(function (b) { return { p: b.seat, b: b }; }).concat(lamps.filter(function (l) { return !l.wall; }).map(function (l) { return { p: [l.x + 0.6, l.y + 0.4] }; }));
    if (spots.length) { var sp = RI.pick(spots), e = ents[pickEnt(RI)]; ver++; var R3 = RI.fork('wait');
      var cur = walk(R3, [e.x, e.y], sp.p, 'wait', {});
      for (var k = 0; k < 120; k++) { var a = R3.range(0, TAU), r = Math.sqrt(R3.range(0, 1)) * 0.85; prints.push(cur[0] + Math.cos(a) * r, cur[1] + Math.sin(a) * r, R3.range(0, TAU), 0.28, 0.105, 0, 1, 0, 0); }
      var pa = R3.range(0, TAU), pl = R3.range(1.8, 2.8), pc = Math.cos(pa), ps = Math.sin(pa);   // and paced, back and forth, the way people do when someone is late
      if (!blocked[cellOf(cur[0] + pc * pl, cur[1] + ps * pl)]) for (var lap = 0; lap < 4; lap++) for (var t = 0.3; t < pl; t += 0.33) { var dir = lap % 2 ? -1 : 1, tt = lap % 2 ? pl - t : t, sd2 = ((t / 0.33) | 0) % 2 ? 1 : -1, ox = -ps * (0.09 * sd2 + R3.gaussian(0, 0.1)), oy = pc * (0.09 * sd2 + R3.gaussian(0, 0.1)); prints.push(cur[0] + pc * tt + ox, cur[1] + ps * tt + oy, pa + (dir < 0 ? PI : 0) + R3.gaussian(0, 0.12), 0.28, 0.105, 0, 0.9, 0, 0); }
      deposit(cur[0], cur[1], 0.5);
      if (sp.b) { sp.b.swept.push(-0.3, 0.1, 0.4); }
      walk(R3, cur, [ents[pickEnt(R3)].x, ents[pickEnt(R3)].y], 'wait2', {}); }
  } else if (incident === 'Sledge') {
    var R4 = RI.fork('sledge'), e = ents[pickEnt(R4)], sp = openSpot(R4, 0.02, 1.5, 6) || openSpot(R4, 0.02, 0, 99) || [WM / 2, HM / 2]; ver++;
    var hist = [];
    var end = walk(R4, [e.x, e.y], [sp[0], sp[1]], 'sl', { step: 0.46, foot: 0.2, wander: 0.5, bias: 0, onStep: function (x, y, hx, hy) { hist.push([x, y, hx, hy]); } });
    for (var k = 9; k < hist.length; k += 2) { var h = hist[k - 9], px = -h[3], py = h[2]; for (var sgn = -1; sgn <= 1; sgn += 2) { var a0p = hist[k - 9], a1p = hist[k - 7]; prints.push(a0p[0] + px * sgn * 0.17, a0p[1] + py * sgn * 0.17, 0, 0.04, 0, 2, 0.8, a1p[0] + px * sgn * 0.17, a1p[1] + py * sgn * 0.17); } }
    var hl = hist[Math.max(0, hist.length - 10)]; if (hl) sledge = { x: hl[0], y: hl[1], a: Math.atan2(hl[3], hl[2]), hx: end[0], hy: end[1] };
    if (hl) { var sa1 = Math.atan2(end[1] - hl[1], end[0] - hl[0]) + R4.range(0.9, 2.2) * (R4.chance(0.5) ? 1 : -1); ver++; walk(R4, [end[0] + Math.cos(sa1) * 0.5, end[1] + Math.sin(sa1) * 0.5], entPt(R4, ents[pickEnt(R4)]), 'sl2', { step: 0.5, foot: 0.2, wander: 0.7, bias: 0 }); }   // left it where it stopped and ran off
  }
  C.plottable = false;

  // ======================= render surface (pixel grid) =======================
  var cv = C.setupCanvas(VW, VH, '#0d0f12'), ctx = cv.ctx, PW = cv.canvas.width, PH = cv.canvas.height, PN = PW * PH, mpp = WM / PW;
  var H = new Float32Array(PN), Fp = new Float32Array(PN), A1 = new Float32Array(PN), A2 = new Float32Array(PN), A3 = new Float32Array(PN), B1 = new Float32Array(PN), B2 = new Float32Array(PN);
  function blur(src, dst, rM, passes) {   // separable box blur, radius in metres
    var r = Math.max(1, Math.round(rM / mpp)), tmp = B2, a = src;
    for (var p = 0; p < (passes || 2); p++) {
      for (var y = 0; y < PH; y++) { var o = y * PW, s = 0; for (var x = -r; x <= r; x++) s += a[o + clamp(x, 0, PW - 1)]; for (var x = 0; x < PW; x++) { tmp[o + x] = s / (2 * r + 1); s += a[o + Math.min(x + r + 1, PW - 1)] - a[o + Math.max(x - r, 0)]; } }
      for (var x = 0; x < PW; x++) { var s = 0; for (var y = -r; y <= r; y++) s += tmp[clamp(y, 0, PH - 1) * PW + x]; for (var y = 0; y < PH; y++) { dst[y * PW + x] = s / (2 * r + 1); s += tmp[Math.min(y + r + 1, PH - 1) * PW + x] - tmp[Math.max(y - r, 0) * PW + x]; } }
      a = dst;
    }
    return dst;
  }
  function upsample(G, dst) { for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) dst[y * PW + x] = sample(G, (x + 0.5) * mpp, (y + 0.5) * mpp); return dst; }
  function forBox(x0, y0, x1, y1, fn) {
    var ix0 = Math.max(0, Math.floor(x0 / mpp)), iy0 = Math.max(0, Math.floor(y0 / mpp)), ix1 = Math.min(PW - 1, Math.ceil(x1 / mpp)), iy1 = Math.min(PH - 1, Math.ceil(y1 / mpp));
    for (var y = iy0; y <= iy1; y++) for (var x = ix0; x <= ix1; x++) fn(y * PW + x, (x + 0.5) * mpp, (y + 0.5) * mpp);
  }
  // ---- 1. compaction from prints (world-unit stamps) ----
  var aa1 = mpp * 0.9, UP = new Float32Array(PN);
  function lumps(p, px, py, ca, sa, hl, st) {   // snow kicked forward from the toe; seeded per print, so resolution independent
    var z = (p * 2654435761) >>> 0; function rr() { z = (Math.imul(z ^ (z >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0; return z / 4294967296; }
    var n = 1 + Math.floor(rr() * 4 * st);
    for (var k = 0; k < n; k++) { var dd = hl + rr() * 0.07, aa = (rr() - 0.5) * 1.3, lx = px + (ca * Math.cos(aa) - sa * Math.sin(aa)) * dd, ly = py + (sa * Math.cos(aa) + ca * Math.sin(aa)) * dd, r = 0.012 + rr() * 0.03, hh = 0.25 + rr() * 0.45;
      forBox(lx - r, ly - r, lx + r, ly + r, function (i, x, y) { var q = 1 - ((x - lx) * (x - lx) + (y - ly) * (y - ly)) / (r * r); if (q > 0) UP[i] = Math.max(UP[i], hh * Math.sqrt(q)); }); }
  }
  for (var p = 0; p < prints.length; p += 9) {
    var px = prints[p], py = prints[p + 1], an = prints[p + 2], ln = prints[p + 3], wd = prints[p + 4], kd = prints[p + 5], st = prints[p + 6];
    if (kd === 2) { var s2 = seg(px, py, prints[p + 7], prints[p + 8], ln), bb = bbox(s2, aa1); forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var v = clamp(0.5 - sd(s2, x, y) / aa1, 0, 1) * st; if (v > Fp[i]) Fp[i] = v; }); continue; }
    var ca = Math.cos(an), sa = Math.sin(an), hl = ln / 2, e = hl + aa1;
    forBox(px - e, py - e, px + e, py + e, function (i, x, y) {
      var dx = x - px, dy = y - py, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, d;
      if (kd === 1) d = Math.hypot(u / hl, v / (wd / 2)) - 1;
      else {   // shoe sole: rounded heel, narrow waist, broad ball, round toe
        var t = u / hl, prof = t < -0.55 ? 0.74 * Math.sqrt(Math.max(0, 1 - Math.pow((t + 0.55) / 0.45, 2))) + 0.0 : t < 0.05 ? lerp(0.74, 0.8, (t + 0.55) / 0.6) - 0.035 * Math.sin((t + 0.55) / 0.6 * PI) : t < 0.6 ? lerp(0.8, 1.0, (t - 0.05) / 0.3 > 1 ? 1 : (t - 0.05) / 0.3) : 1.0 * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.6) / 0.4, 2)));
        if (t < -0.55) prof = Math.max(prof, 0.0);
        var half = wd / 2 * prof;
        d = (Math.abs(t) > 1 ? 1 + (Math.abs(t) - 1) * hl / (wd / 2) : 0) + (Math.abs(v) - half) / (wd / 2) * 0.9 + 0.13 * NZ.n2(x * 26 + p * 0.37, y * 26);
        d = Math.max(d, Math.abs(t) - 1) * (wd / 2) / hl;
      }
      var val = clamp(0.5 - d * hl / aa1, 0, 1) * st * (kd === 0 ? 0.97 + 0.03 * Math.cos(u * 140) : 1);
      if (val > Fp[i]) Fp[i] = val;
    });
    if (kd === 0 && depth > 0.15) lumps(p, px, py, ca, sa, hl, st * 0.5);
  }
  blur(Fp, Fp, 0.012, 1);
  var AGR = null, AGM = null;   // snow shoved outward by the sweeping arms and legs
  if (angel) {
    AGR = new Float32Array(PN); AGM = new Float32Array(PN);
    var ca = Math.cos(angel.a), sa = Math.sin(angel.a), as = angel.s, sd0 = angel.seed;
    function ell(u, v, cu, cv, a, b) { return (Math.hypot((u - cu) / a, (v - cv) / b) - 1) * Math.min(a, b); }
    function cap(du, dv, ang, len, w) { var dxa = -Math.cos(ang), dya = Math.sin(ang), t = clamp(du * dxa + dv * dya, 0, len); return Math.hypot(du - dxa * t, dv - dya * t) - w; }
    forBox(angel.x - 2 * as, angel.y - 2 * as, angel.x + 2 * as, angel.y + 2 * as, function (i, x, y) {
      var dx = x - angel.x, dy = y - angel.y, u = (dx * ca + dy * sa) / as, v = (-dx * sa + dy * ca) / as, av = Math.abs(v), sg = v > 0 ? 1 : -1;   // u: hips to head, in adult metres
      var nz = NZ.n2(u * 7 + sd0, v * 7), nz2 = NZ.n2(u * 19 - sd0, v * 19), e = 0.03, val = 0, rim = 0;
      function sh(dd) { return sstep(e, -e, dd); }
      // head in a hood, neck, broad shoulders, a coat over the hips; the seat of the coat sinks deepest
      var dHead = ell(u, v, 0.72, 0, 0.145, 0.12) + 0.01 * nz;
      var dNeck = Math.max(Math.abs(u - 0.56) - 0.07, av - 0.075);
      var dSh = ell(u, v, 0.37, 0, 0.17, 0.245) + 0.012 * nz, dHip = ell(u, v, 0.06, 0, 0.24, 0.215) + 0.012 * nz;
      var dTorso = Math.min(dSh, dHip, dNeck);
      val = Math.max(val, sh(dHead) * 1.0, sh(dTorso) * (0.88 + 0.03 * sh(ell(u, av, 0.33, 0.1, 0.1, 0.08)) + 0.01 * nz2));
      val = Math.max(val, sh(ell(u, v, -0.02, 0, 0.17, 0.2) + 0.02 * nz) * 0.92);   // buttocks
      // arms: swept from the sides to over the head, a full fan with a packed outer edge
      var du = u - 0.44, dvo = av - 0.2, r = Math.hypot(du, dvo), al = Math.atan2(dvo, -du), La = (0.74 + 0.025 * nz) * (sg > 0 ? 1.03 : 0.97), lo = 0.1, hi = angel.armMax;
      var dA = Math.max(lo - al, al - hi) * Math.max(r, 0.15), dFan = Math.max(r - La, dA - 0.05), fan = sh(dFan);
      if (fan > 0) {
        var band = sstep(La - 0.16, La - 0.04, r);
        val = Math.max(val, fan * (0.76 + 0.03 * nz + 0.12 * band));
      }
      var hd = Math.hypot(du + Math.cos(hi) * (La - 0.1), dvo - Math.sin(hi) * (La - 0.1)) - 0.11; if (hd < e) val = Math.max(val, sh(hd) * 0.84);   // the mitt rounds off the top of the wing   // mitts at the top of the sweep
      if (dA < 0.02) rim = Math.max(rim, sstep(0.11, 0.0, r - La) * sstep(-0.02, 0.025, r - La) * sstep(0.06, -0.02, dA));
      // legs: opened and closed, a skirt with heels packing its hem
      var lu = u + 0.02, lvo = av - 0.1, lr = Math.hypot(lu, lvo), ps = Math.atan2(lvo, -lu), Ll = 0.94 + 0.025 * nz, lm = angel.legMax;
      var dL = Math.max(lr - Ll, Math.max(-0.1 - ps, ps - lm) * lr - 0.08), sk = sh(dL);
      if (sk > 0) val = Math.max(val, sk * (0.74 + 0.03 * nz + 0.12 * sstep(Ll - 0.16, Ll - 0.05, lr)));
      [0.02, lm].forEach(function (aa) { val = Math.max(val, sh(Math.hypot(lu + Math.cos(aa) * (Ll - 0.06), lvo - Math.sin(aa) * (Ll - 0.06)) - 0.055) * 0.9); });   // heels
      if (ps > -0.1 && ps < lm + 0.06) rim = Math.max(rim, sstep(0.1, 0.0, lr - Ll) * sstep(-0.02, 0.025, lr - Ll) * sstep(0.08, 0.3, ps));   // the hem is broken where they stepped out
      // getting up: a hand pushed down by the hip, the seat scuffed, maybe a roll onto the knees
      val = Math.max(val, sh(ell(u, v, -0.04, angel.hand * 0.37, 0.085, 0.06) + 0.01 * nz2) * 1.0);
      val = Math.max(val, sh(ell(u, v, -0.27, 0, 0.21, 0.15) + 0.06 * nz + 0.03 * nz2) * (0.87 + 0.03 * nz2));
      if (angel.knee) { val = Math.max(val, sh(ell(u, v, -0.52, 0.11, 0.1, 0.06) + 0.01 * nz2) * 0.9, sh(ell(u, v, -0.55, -0.11, 0.1, 0.06) + 0.01 * nz2) * 0.9, sh(ell(u, v, -0.86, 0.1, 0.06, 0.04)) * 0.9, sh(ell(u, v, -0.88, -0.1, 0.06, 0.04)) * 0.9); }
      val = clamp(val, 0, 1);
      if (val > Fp[i]) Fp[i] = val;
      AGR[i] = rim * (1 - val); AGM[i] = val;
    });
  }
  // ---- 2. snow depth ----
  var Ptr = upsample(Tr, A1); blur(Ptr, Ptr, 0.12, 1);
  for (var i = 0; i < PN; i++) Ptr[i] = sstep(0.04, 0.85, Ptr[i]);
  var shelter = new Float32Array(GN);   // wind drift behind obstacles (sim grid)
  if (windy) for (var i = 0; i < GN; i++) { var x = (i % GW + 0.5) * CS, y = ((i / GW | 0) + 0.5) * CS, acc = 0; for (var k = 1; k <= 12; k++) { if (blocked[cellOf(x - windV[0] * k * 0.35, y - windV[1] * k * 0.35)]) { acc = Math.max(acc, 1 - k / 13); } } shelter[i] = acc - (blocked[cellOf(x + windV[0] * 0.4, y + windV[1] * 0.4)] ? 0.5 : 0); }
  var Sh = upsample(shelter, A2); blur(Sh, Sh, 0.3, 2);
  var D0 = A3, ripK = windy ? 1 : 0.12;
  for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
    var i = y * PW + x, wx = (x + 0.5) * mpp, wy = (y + 0.5) * mpp;
    var u = wx * windV[0] + wy * windV[1], v = -wx * windV[1] + wy * windV[0];
    var big = NZ.fbm(wx * 0.07, wy * 0.07, 3), wv = NZ.n2(wx * 0.18 + 5.1, wy * 0.18 - 2.7), rip = NZ.n2(u * 0.45 + 0.9 * wv, v * 2.0 + 1.6 * wv) * 0.85 + NZ.n2(u * 1.1, v * 3.6 + wv) * 0.15;   // drifts bend; they are not combed
    D0[i] = depth * (0.86 + 0.28 * big + 0.14 * NZ.fbm(wx * 0.06 + 13.1, wy * 0.06 - 7.3, 2) + 0.55 * Sh[i] + 0.16 * Ptr[i] * (NZ.n2(wx * 8, wy * 8) * 0.6 + NZ.n2(wx * 19, wy * 19) * 0.4)) + ripK * depth * 0.022 * rip + (windy ? depth * 0.004 * NZ.n2(u * 2.2 + 3.3, v * 9) * sstep(-0.2, 0.4, NZ.n2(wx * 0.4, wy * 0.4)) : 0);
  }
  // reduced snow under benches, inside the basin, round tree trunks; deeper against buildings (eaves aside)
  objs.forEach(function (o) {
    if (o.t === 'bench') { var b = o.b, s2 = box(b.x, b.y, 1.0, 0.42, b.a + PI / 2), bb = bbox(s2, 0.3); forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { D0[i] *= 1; }); }
    if (o.t === 'tree') { var tr = o.tr; forBox(tr.x - 1.2, tr.y - 1.2, tr.x + 1.2, tr.y + 1.2, function (i, x, y) { D0[i] *= lerp(0.55, 1, sstep(0.25, 1.1, Math.hypot(x - tr.x, y - tr.y))); }); }
    if (o.t === 'building') { var b = o.b, s2 = box((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, (b[2] - b[0]) / 2, (b[3] - b[1]) / 2, 0); forBox(b[0] - 1, b[1] - 1, b[2] + 1, b[3] + 1, function (i, x, y) { var d = sd(s2, x, y); if (d > 0) D0[i] *= lerp(0.25, 1, sstep(0.05, 0.7, d)); }); }
  });
  // rims of displaced snow around prints, berms along trails
  var Fb = blur(Fp, B1, 0.045, 2);
  for (var i = 0; i < PN; i++) A2[i] = Math.max(0, Fb[i] - Fp[i]);   // reuse A2 as rim
  var Pb = blur(Ptr, Fb, 0.3, 2);
  var EX = new Float32Array(PN);   // exposure of the ground (0 snow .. 1 bare)
  for (var i = 0; i < PN; i++) {
    var fc = 1 - (1 - Fp[i] * (snowfall === 'Dusting' ? 0.93 : 0.76)) * (1 - 0.8 * Ptr[i]);   // a dusting is trodden through to the ground
    var d = D0[i] * (1 - fc) + D0[i] * (0.55 * A2[i] + 0.3 * Math.max(0, Pb[i] - Ptr[i]) + 0.5 * UP[i] * (1 - Fp[i]) + (AGR ? 0.5 * AGR[i] : 0));
    EX[i] = 1 - sstep(0.0015, 0.012, d);
    H[i] = d;
  }
  // ---- 3. albedo ----
  var AR = new Float32Array(PN), AG = new Float32Array(PN), AB = new Float32Array(PN), SN = new Float32Array(PN);   // SN: snowiness for sparkle
  var paveMask = new Float32Array(PN);
  paths.forEach(function (P) { for (var j = 0; j < P.pts.length - 1; j++) { var s2 = seg(P.pts[j][0], P.pts[j][1], P.pts[j + 1][0], P.pts[j + 1][1], P.w), bb = bbox(s2, 0.1); forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var v = clamp(0.5 - sd(s2, x, y) / 0.04, 0, 1); if (v > paveMask[i]) paveMask[i] = v; }); } });
  for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
    var i = y * PW + x, wx = (x + 0.5) * mpp, wy = (y + 0.5) * mpp, pk = clamp(Ptr[i] * 0.85 + Fp[i] * 0.25 + (AGM ? 0.42 * AGM[i] : 0), 0, 1);   // a body rolls the snow dense and grey
    var sr = lerp(0.93, 0.83, pk), sg = lerp(0.94, 0.845, pk), sb = lerp(0.96, 0.875, pk);
    var gn = NZ.n2(wx * 1.3, wy * 1.3) * 0.5 + 0.5, pv = paveMask[i];
    var gr = lerp(lerp(0.075, 0.11, gn), lerp(0.10, 0.13, gn), pv), gg = lerp(lerp(0.085, 0.10, gn), lerp(0.10, 0.125, gn), pv), gb = lerp(lerp(0.05, 0.07, gn), lerp(0.105, 0.135, gn), pv);
    var e = EX[i]; AR[i] = lerp(sr, gr, e); AG[i] = lerp(sg, gg, e); AB[i] = lerp(sb, gb, e); if (AGM && AGM[i] > 0) { var gm = 1 - 0.16 * AGM[i] * (1 - e); AR[i] *= gm * 0.985; AG[i] *= gm * 0.99; AB[i] *= gm; } SN[i] = (1 - e) * (1 - pk * 0.8);
  }
  var HS = new Float32Array(H), HS0 = new Float32Array(H);   // snow surface before objects
  // ---- 4. objects into the heightfield ----
  var HSOL = HS;   // solid heightfield for the sun sweep (snow + ground-connected objects)
  function putTop(i, h, r, g, b, snowy, floating) { if (h > H[i]) { H[i] = h; AR[i] = r; AG[i] = g; AB[i] = b; SN[i] = snowy; if (!floating && h > HSOL[i]) HSOL[i] = h; } }
  var SNOW = [0.92, 0.93, 0.95], METAL = [0.05, 0.055, 0.06], WOOD = [0.16, 0.11, 0.075], BARK = [0.12, 0.105, 0.095];
  function capCol(dIn, w, base) { var t = sstep(w * 0.25, w * 0.6, dIn); return [lerp(base[0], SNOW[0], t), lerp(base[1], SNOW[1], t), lerp(base[2], SNOW[2], t), t]; }
  var cap = Math.min(depth, 0.12);
  objs.forEach(function (o) {
    if (o.t === 'lamp' || o.t === 'bin') {
      var r = o.t === 'lamp' ? 0.21 : 0.28, hh = o.t === 'lamp' ? 4.1 : 0.95, lip = o.t === 'lamp' ? 0.012 : 0.03, amt = clamp(depth * 10, 0.35, 1);
      forBox(o.x - r - 0.05, o.y - r - 0.05, o.x + r + 0.05, o.y + r + 0.05, function (i, x, y) {
        var rd = Math.hypot(x - o.x, y - o.y), d = rd - r; if (d > mpp * 0.5) return;
        var edge = -d - lip + 0.008 * NZ.n2(x * 40, y * 40), t = sstep(0, 0.012, edge) * amt, dome = Math.sqrt(Math.max(0, 1 - (rd / r) * (rd / r)));
        var base = o.t === 'lamp' ? [0.07, 0.075, 0.08] : [0.11, 0.12, 0.11];
        putTop(i, hh + (o.t === 'bin' ? -0.04 : 0) + cap * 0.75 * t * (0.4 + 0.6 * dome), lerp(base[0], SNOW[0], t), lerp(base[1], SNOW[1], t), lerp(base[2], SNOW[2], t), t, o.t === 'lamp');
      });
    } else if (o.t === 'bench') {
      var b = o.b, ang = b.a + PI / 2, ca = Math.cos(ang), sa = Math.sin(ang), fx = Math.cos(b.a), fy = Math.sin(b.a), amt = clamp(depth * 12, 0.3, 1), bb = bbox(box(b.x, b.y, 1.0, 0.36, ang), 0.05);
      var IRON = [0.055, 0.055, 0.06], sd0 = b.x * 7.3 + b.y * 3.7, ov = 0.025 * amt;
      var tone = [0, 1, 2, 3].map(function (k) { var g = 0.45 + 0.35 * (NZ.n2(sd0 + k * 1.7, 4.2) * 0.5 + 0.5); return [lerp(WOOD[0], 0.2, g), lerp(WOOD[1], 0.18, g), lerp(WOOD[2], 0.16, g)]; });   // weathered, each slat its own grey
      forBox(bb[0] - 0.05, bb[1] - 0.05, bb[2] + 0.05, bb[3] + 0.05, function (i, x, y) {
        var dx = x - b.x, dy = y - b.y, u = dx * ca + dy * sa, v = dx * fx + dy * fy, au = Math.abs(u);
        var brk = sstep(-0.35, 0.15, NZ.n2(u * 9 + sd0, v * 9));   // snow ridges on thin members are broken, not continuous
        if (au > 0.885 && au < 0.925 && v > -0.31 && v < 0.27) {   // cast-iron armrests
          var c = Math.min(au - 0.885, 0.925 - au), t = sstep(0.006, 0.016, c) * amt * 0.75 * brk;
          putTop(i, 0.7 + 0.02 * t, lerp(IRON[0], SNOW[0], t), lerp(IRON[1], SNOW[1], t), lerp(IRON[2], SNOW[2], t), t * 0.5); return;
        }
        var rag = 0.016 * NZ.n2(x * 9, y * 9) + 0.006 * NZ.n2(x * 31, y * 31);
        var dIn = Math.min(0.885 + ov - au, v + 0.17 + ov, 0.27 + ov - v) + rag;
        if (dIn > -0.005 && (au < 0.885 + ov + 0.03)) {   // seat: a pillow of snow that overhangs the wood a little, swept where someone sat
          var sw = 0;
          b.swept.slice(0, 2).forEach(function (sp) { sw = Math.max(sw, 0.85 * sstep(0.24, 0.15, Math.abs(u - sp * 0.9) + 0.03 * NZ.n2(x * 8, y * 8))); });
          var inWood = au < 0.885 && v > -0.17 && v < 0.27, k = clamp(Math.floor((v + 0.17) / 0.11), 0, 3), fr = ((v + 0.17) / 0.11) - k, gap = inWood && fr > 0.88;
          var t = sstep(-0.005, 0.03, dIn) * amt * (1 - sw), dome = sstep(0, 0.12, dIn);
          if (!inWood && t < 0.5) return;
          if (gap && t < 0.55) t *= 0.35;
          var wc = tone[k], wd = gap ? 0.35 : 0.88 + 0.12 * NZ.n2(u * 35, v * 2 + k);
          putTop(i, (gap && t < 0.55 ? 0.43 : 0.46) + cap * (0.35 + 0.65 * dome) * t, lerp(wc[0] * wd, SNOW[0], t), lerp(wc[1] * wd, SNOW[1], t), lerp(wc[2] * wd, SNOW[2], t), t);
        } else if (au < 0.885 && ((v > -0.325 && v < -0.285) || (v > -0.265 && v < -0.225))) {   // two back rails, half-snowed
          var hi = v < -0.28, dd = hi ? Math.min(v + 0.325, -0.285 - v) : Math.min(v + 0.265, -0.225 - v), t = sstep(0.006, 0.015, dd) * amt * 0.85 * brk, wc = tone[hi ? 0 : 3];
          putTop(i, (hi ? 0.88 : 0.76) + 0.015 * t, lerp(wc[0], SNOW[0], t), lerp(wc[1], SNOW[1], t), lerp(wc[2], SNOW[2], t), t * 0.5, true);
        }
      });
    } else if (o.t === 'tree') {
      var tr = o.tr;
      tr.segs.forEach(function (s) {
        var wm = Math.max(s[4], s[7]), s2 = seg(s[0], s[1], s[2], s[3], 0), bb = bbox(s2, wm / 2 + mpp);
        var vx = s[2] - s[0], vy = s[3] - s[1], LL = vx * vx + vy * vy || 1;
        forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) {
          var t = clamp(((x - s[0]) * vx + (y - s[1]) * vy) / LL, 0, 1), wt = lerp(s[4], s[7], t), ww = Math.max(wt, mpp * 1.05);
          var d = Math.hypot(x - s[0] - vx * t, y - s[1] - vy * t) - ww / 2; if (d >= 0) return;
          if (wt < mpp) { var al = wt / mpp * 0.85; if (H[i] < lerp(s[5], s[6], t)) { AR[i] = lerp(AR[i], BARK[0], al); AG[i] = lerp(AG[i], BARK[1], al); AB[i] = lerp(AB[i], BARK[2], al); SN[i] *= 1 - al; } return; }
          var thick = sstep(0.025, 0.07, ww), sn = thick * sstep(ww * 0.1, ww * 0.42, -d) * clamp(depth * 9, 0.3, 1);
          var side = sstep(0, ww * 0.5, -d);
          putTop(i, lerp(s[5], s[6], t) + 0.02 * sn, lerp(BARK[0] * (0.7 + 0.3 * side), SNOW[0], sn), lerp(BARK[1] * (0.7 + 0.3 * side), SNOW[1], sn), lerp(BARK[2] * (0.7 + 0.3 * side), SNOW[2], sn), sn * 0.6, true);
        });
      });
    } else if (o.t === 'hedge') {
      var s2 = o.s, bb = bbox(s2, 0.1);
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) {
        var d = sd(s2, x, y) - 0.1 * NZ.n2(x * 1.7, y * 1.7) - 0.04 * NZ.n2(x * 5, y * 5); if (d >= 0) return;
        var n = NZ.fbm(x * 7, y * 7, 3), n2 = NZ.n2(x * 1.5, y * 1.5), edge = sstep(0, 0.14, -d);
        var snow = sstep(-0.12, 0.08, n + 0.35 * edge - 0.12 + depth * 2) * (0.35 + 0.65 * edge);
        var hh = 1.12 + 0.05 * n2 + 0.025 * n - 0.12 * (1 - edge);
        putTop(i, hh + cap * 0.6 * snow, lerp(0.03, SNOW[0], snow), lerp(0.045, SNOW[1], snow), lerp(0.03, SNOW[2], snow), snow);
      });
    } else if (o.t === 'fence') {
      var len = Math.hypot(o.q[0] - o.p[0], o.q[1] - o.p[1]), rail = seg(o.p[0], o.p[1], o.q[0], o.q[1], 0.045), bb = bbox(rail, 0.1);
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var d = sd(rail, x, y); if (d < mpp * 0.3) { var sn = sstep(0.004, 0.014, -d) * clamp(depth * 10, 0.3, 1); putTop(i, 1.0, lerp(METAL[0], SNOW[0], sn * 0.9), lerp(METAL[1], SNOW[1], sn * 0.9), lerp(METAL[2], SNOW[2], sn * 0.9), sn * 0.4, true); } });
      for (var k = 0; k <= Math.floor(len / 2.0); k++) { var t = Math.min(1, k * 2.0 / len), qx = lerp(o.p[0], o.q[0], t), qy = lerp(o.p[1], o.q[1], t), pb = box(qx, qy, 0.05, 0.05, 0);
        forBox(qx - 0.08, qy - 0.08, qx + 0.08, qy + 0.08, function (i, x, y) { var d = sd(pb, x, y); if (d < mpp * 0.3) { var c = capCol(-d, 0.05, METAL); putTop(i, 1.15 + 0.02 * c[3], c[0], c[1], c[2], c[3] * 0.5); } }); }
    } else if (o.t === 'gate') {
      [[o.x - 0.85, 1], [o.x + 0.85, -1]].forEach(function (gp, j) {
        var fyv = o.y + (j ? 0 : 0), pb = circle(gp[0], fyv, 0.09);
        forBox(gp[0] - 0.12, fyv - 0.12, gp[0] + 0.12, fyv + 0.12, function (i, x, y) { var d = sd(pb, x, y); if (d < 0) { var c = capCol(-d, 0.09, METAL); putTop(i, 1.4, c[0], c[1], c[2], c[3] * 0.5); } });
      });
      var ga = o.open, hx = o.x - 0.85, leaf = seg(hx, o.y, hx + Math.cos(ga) * 1.6, o.y + Math.sin(ga) * 1.6, 0.04), bb = bbox(leaf, 0.05);
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var d = sd(leaf, x, y); if (d < mpp * 0.3) { var sn = sstep(0.004, 0.012, -d) * 0.8; putTop(i, 1.05, lerp(METAL[0], SNOW[0], sn), lerp(METAL[1], SNOW[1], sn), lerp(METAL[2], SNOW[2], sn), sn * 0.4, true); } });
    } else if (o.t === 'hoop') {
      var s2 = seg(o.x, o.y - 0.35, o.x, o.y + 0.35, 0.05), bb = bbox(s2, 0.03);
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var d = sd(s2, x, y); if (d < mpp * 0.3) { var sn = sstep(0.005, 0.015, -d) * 0.8; putTop(i, 0.8, lerp(METAL[0], SNOW[0], sn), lerp(METAL[1], SNOW[1], sn), lerp(METAL[2], SNOW[2], sn), sn * 0.4); } });
    } else if (o.t === 'basin') {
      var Rb = o.R;
      forBox(o.x - Rb - 0.1, o.y - Rb - 0.1, o.x + Rb + 0.1, o.y + Rb + 0.1, function (i, x, y) {
        var r = Math.hypot(x - o.x, y - o.y); if (r > Rb) return;
        var wall = Math.abs(r - (Rb - 0.18)) - 0.18;
        if (wall < 0) { var c = capCol(-wall, 0.12, [0.3, 0.29, 0.28]); putTop(i, 0.55 + cap * 0.8 * sstep(0, 0.03, -wall) + 0.006 * NZ.n2(x * 2.5, y * 2.5), c[0], c[1], c[2], c[3]); return; }
        var pq = Math.max(Math.abs(x - o.x), Math.abs(y - o.y)) - 0.5; if (o.plinth && pq < 0) { var c = capCol(-pq, 0.1, [0.3, 0.29, 0.28]); putTop(i, 1.2 + cap * 0.8 * sstep(0, 0.03, -pq), c[0], c[1], c[2], c[3]); return; }
        var dish = 1 - (r / (Rb - 0.36)) * (r / (Rb - 0.36)), n = NZ.fbm(x * 0.5, y * 0.5, 2);
        H[i] = 0.12 + depth * (0.85 + 0.15 * n) - 0.03 * dish; AR[i] = SNOW[0]; AG[i] = SNOW[1]; AB[i] = SNOW[2]; SN[i] = 1;
      });
    } else if (o.t === 'building') {
      var b = o.b, bh = o.h;
      forBox(b[0], b[1], b[2], b[3], function (i, x, y) {
        var e = Math.min(x - b[0], b[2] - x, y - b[1], b[3] - y), hgt = bh + depth * (0.8 + 0.4 * NZ.fbm(x * 0.4, y * 0.4, 2)), sn = 1;
        if (x - b[0] < 0.02 && b[0] < 0) e = 9; if (b[2] - x < 0.02 && b[2] > WM) e = 9;
        var seam = Math.abs(((x + y * 0.0) / 1.1) % 1 - 0.5) < 0.03 ? 0.012 : 0;
        if (e < 0.35) hgt = bh + 0.5 + cap * sstep(0.0, 0.17, Math.min(e, 0.35 - e)); else hgt += seam;
        var tone = 0.9 - 0.06 * sstep(0.35, 0.05, e) * (e < 0.35 ? 0 : 1);
        H[i] = hgt; HSOL[i] = hgt; AR[i] = SNOW[0] * tone; AG[i] = SNOW[1] * tone; AB[i] = SNOW[2] * tone; SN[i] = sn;
      });
    }
  });
  trees.forEach(function (tr) { forBox(tr.x - 0.25, tr.y - 0.25, tr.x + 0.25, tr.y + 0.25, function (i, x, y) { if (Math.hypot(x - tr.x, y - tr.y) < 0.2) HSOL[i] = Math.max(HSOL[i], tr.h - 2.5); }); });
  if (mitten) { var ca = Math.cos(mitten.a), sa = Math.sin(mitten.a), wool = RI.pick([[0.46, 0.14, 0.08], [0.16, 0.2, 0.32], [0.52, 0.38, 0.12], [0.2, 0.3, 0.2], [0.36, 0.3, 0.26]]);
    forBox(mitten.x - 0.25, mitten.y - 0.25, mitten.x + 0.25, mitten.y + 0.25, function (i, x, y) {
      var dx = x - mitten.x, dy = y - mitten.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      var d = Math.min(Math.hypot(u / 0.12, v / 0.065) - 1, Math.hypot((u - 0.02) / 0.05, (v - 0.07) / 0.028) - 1, Math.max(Math.abs(u + 0.14) - 0.035, Math.abs(v) - 0.06) / 0.04);
      if (d < 0) { var dust = sstep(0.3, 0.75, NZ.n2(x * 40, y * 40) * 0.5 + 0.5) * 0.5, knit = 0.85 + 0.15 * Math.sin(u * 300) * Math.sin(v * 300); H[i] += 0.03 * sstep(0, -0.4, d); AR[i] = lerp(wool[0] * knit, 0.9, dust); AG[i] = lerp(wool[1] * knit, 0.9, dust); AB[i] = lerp(wool[2] * knit, 0.92, dust); SN[i] = dust; }
    }); }
  if (sledge) { var ca = Math.cos(sledge.a), sa = Math.sin(sledge.a), rope = seg(sledge.x + ca * 0.45, sledge.y + sa * 0.45, sledge.hx, sledge.hy, 0.012), bb = bbox(rope, 0.02);
    forBox(sledge.x - 0.6, sledge.y - 0.6, sledge.x + 0.6, sledge.y + 0.6, function (i, x, y) { var dx = x - sledge.x, dy = y - sledge.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, d = Math.max(Math.abs(u) - 0.5, Math.abs(v) - 0.21); if (d < 0) { var av = Math.abs(v), runner = av > 0.17, slat = !runner && ((av + 0.02) % 0.085) < 0.016, gr = 0.85 + 0.15 * NZ.n2(u * 60, v * 4); H[i] += runner ? 0.06 : (slat ? 0.1 : 0.13); var c = runner ? [0.08, 0.075, 0.07] : slat ? [0.12, 0.08, 0.05] : [0.42 * gr, 0.28 * gr, 0.16 * gr]; AR[i] = c[0]; AG[i] = c[1]; AB[i] = c[2]; SN[i] = 0; } });
    forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { if (sd(rope, x, y) < mpp * 0.4) { AR[i] = 0.1; AG[i] = 0.08; AB[i] = 0.06; H[i] += 0.02; } }); }

  // ======================= lighting =======================
  // exact line-sweep shadow along the sun azimuth (nearest-neighbour along exact lines: no smearing)
  var SHD = B1; SHD.fill(1);
  if (L.si > 0 && !L.soft) {
    var major = Math.abs(sunD[0]) >= Math.abs(sunD[1]), slope = major ? sunD[1] / Math.abs(sunD[0]) : sunD[0] / Math.abs(sunD[1]);
    var nMaj = major ? PW : PH, nMin = major ? PH : PW, extra = Math.ceil(Math.abs(slope) * nMaj) + 2, lines = new Float32Array(nMin + 2 * extra).fill(-1e9);
    var stepM = mpp * Math.sqrt(1 + slope * slope), drop = stepM * tanE, dirMaj = major ? (sunD[0] > 0 ? 1 : -1) : (sunD[1] > 0 ? 1 : -1), soft = 0.012;
    for (var k = 0; k < nMaj; k++) {
      var a = dirMaj > 0 ? nMaj - 1 - k : k, off = Math.round(k * -slope);
      for (var l = 0; l < lines.length; l++) {
        var b = l - extra + off; if (b < 0 || b >= nMin) { lines[l] -= drop; continue; }
        var i = major ? b * PW + a : a * PW + b, s = lines[l] - drop, h = HSOL[i];
        SHD[i] = clamp(1 - (s - h) / soft, 0, 1); lines[l] = s > h ? s : h;
      }
    }
    blur(SHD, SHD, 0.02, 1);
    var pen = 0.0093 / tanE;
    objs.forEach(function (o) {
      if (o.t !== 'building') return;
      var b = o.b, dx = -sunD[0] * o.h / tanE, dy = -sunD[1] * o.h / tanE, P = [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]];
      P = P.concat(P.map(function (q) { return [q[0] + dx, q[1] + dy]; })).sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
      function cr(o2, a2, b2) { return (a2[0] - o2[0]) * (b2[1] - o2[1]) - (a2[1] - o2[1]) * (b2[0] - o2[0]); }
      var lo = [], up = [];
      P.forEach(function (p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
      P.slice().reverse().forEach(function (p) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
      var hull = lo.slice(0, -1).concat(up.slice(0, -1)), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      hull.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
      var soft = 0.06 + pen * o.h * 0.5;
      forBox(Math.max(0, x0), Math.max(0, y0), Math.min(WM, x1), Math.min(HM, y1), function (i, x, y) {
        var dmin = 1e9, inside = true;
        for (var k = 0; k < hull.length; k++) { var a2 = hull[k], b2 = hull[(k + 1) % hull.length], ex = b2[0] - a2[0], ey = b2[1] - a2[1], el = Math.hypot(ex, ey) || 1, dd = ((x - a2[0]) * ey - (y - a2[1]) * ex) / el; if (dd > 0) inside = false; dmin = Math.min(dmin, Math.abs(dd)); }
        var v = inside ? sstep(0, soft, dmin) * 0.5 + 0.5 : 0.5 - sstep(0, soft, dmin) * 0.5;
        SHD[i] *= 1 - v;
      });
    });
    function shadowCapsule(x1, y1, z1, x2, y2, z2, w) {
      var ax = x1 - sunD[0] * z1 / tanE, ay = y1 - sunD[1] * z1 / tanE, bx = x2 - sunD[0] * z2 / tanE, by = y2 - sunD[1] * z2 / tanE;
      var pz = pen * (z1 + z2) / 2, e = pz / 2 + mpp * 0.6, op = Math.min(1, (w + mpp) / (pz + mpp)) * 0.92, s2 = seg(ax, ay, bx, by, w), bb = bbox(s2, e * 2);
      if (bb[2] < 0 || bb[3] < 0 || bb[0] > WM || bb[1] > HM) return;
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var v = clamp(0.5 - sd(s2, x, y) / (2 * e), 0, 1) * op; if (v > 0.003) SHD[i] *= 1 - v; });
    }
    trees.forEach(function (tr) { tr.segs.forEach(function (sg) { shadowCapsule(sg[0], sg[1], sg[5], sg[2], sg[3], sg[6], Math.max((sg[4] + sg[7]) / 2, 0.012) * 1.15); }); shadowCapsule(tr.x, tr.y, 0, tr.x, tr.y, tr.h - 2.5, ghosts.indexOf(tr) >= 0 ? 0.5 : 0.34); });
    lamps.forEach(function (l) { if (l.wall) return; shadowCapsule(l.x, l.y, 0, l.x, l.y, l.h, 0.12); shadowCapsule(l.x, l.y, l.h, l.x + sunD[0] * 0.001, l.y, l.h, 0.54); });
    objs.forEach(function (o) {
      if (o.t === 'fence') { shadowCapsule(o.p[0], o.p[1], 1.0, o.q[0], o.q[1], 1.0, 0.045); var len = Math.hypot(o.q[0] - o.p[0], o.q[1] - o.p[1]); for (var k = 0; k <= Math.floor(len / 2); k++) { var t = Math.min(1, k * 2 / len), qx = lerp(o.p[0], o.q[0], t), qy = lerp(o.p[1], o.q[1], t); shadowCapsule(qx, qy, 0, qx, qy, 1.15, 0.1); } }
      if (o.t === 'gate') { var hx = o.x - 0.85; shadowCapsule(hx, o.y, 1.05, hx + Math.cos(o.open) * 1.6, o.y + Math.sin(o.open) * 1.6, 1.05, 0.045); shadowCapsule(o.x - 0.85, o.y, 0, o.x - 0.85, o.y, 1.4, 0.18); shadowCapsule(o.x + 0.85, o.y, 0, o.x + 0.85, o.y, 1.4, 0.18); }
      if (o.t === 'hoop') shadowCapsule(o.x, o.y - 0.35, 0.8, o.x, o.y + 0.35, 0.8, 0.05);
    });
  }
  for (var i = 0; i < PN; i++) Fp[i] = Math.min(H[i], HS[i] + 0.35);
  var AOb = blur(Fp, A2, 0.6, 2), AOs = blur(Fp, EX, 0.1, 2);
  var inv0 = 1 / (2 * mpp);
  var skyDir = L.si > 0 ? sunD : [-0.7, -0.7];
  var litLamps = lamps;
  if (hour === 'Lamplight') {   // not every lamp works; sometimes the light comes from one we cannot see
    var free = litPick.shuffle(lamps.filter(function (l) { return !l.wall; }).slice()), keep = litPick.int(1, 2);
    litLamps = free.slice(0, keep).concat(litPick.shuffle(lamps.filter(function (l) { return l.wall; })).slice(0, 1)).slice(0, 2);   // at most two lights in the picture
    if ((litLamps.length < 2 && litPick.chance(0.55)) || !litLamps.length) { var side = litPick.int(0, 3), t = litPick.range(0.15, 0.85), o2 = litPick.range(0.8, 2.5);
      litLamps.push(side === 0 ? { x: -o2, y: t * HM, h: 4.1 } : side === 1 ? { x: WM + o2, y: t * HM, h: 4.1 } : side === 2 ? { x: t * WM, y: -o2, h: 4.1 } : { x: t * WM, y: HM + o2, h: 4.1 }); }
  }
  var LSH = null;
  if (L.lamps > 0) {
    LSH = new Float32Array(PN).fill(1);
    var occ = [];
    trees.forEach(function (tr) { tr.segs.forEach(function (sg) { occ.push([sg[0], sg[1], sg[5], sg[2], sg[3], sg[6], Math.max((sg[4] + sg[7]) / 2, 0.015)]); }); occ.push([tr.x, tr.y, 0, tr.x, tr.y, tr.h - 2.5, 0.34]); });
    lamps.forEach(function (l) { if (!l.wall) occ.push([l.x, l.y, 0, l.x, l.y, l.h - 0.3, 0.12]); });
    objs.forEach(function (o) {
      if (o.t === 'fence') { occ.push([o.p[0], o.p[1], 1.0, o.q[0], o.q[1], 1.0, 0.045]); var len = Math.hypot(o.q[0] - o.p[0], o.q[1] - o.p[1]); for (var k = 0; k <= Math.floor(len / 2); k++) { var t = Math.min(1, k * 2 / len); occ.push([lerp(o.p[0], o.q[0], t), lerp(o.p[1], o.q[1], t), 0, lerp(o.p[0], o.q[0], t), lerp(o.p[1], o.q[1], t), 1.15, 0.1]); } }
      if (o.t === 'bench') { var b = o.b, ca = Math.cos(b.a + PI / 2), sa = Math.sin(b.a + PI / 2), fx = Math.cos(b.a), fy = Math.sin(b.a); for (var k = -1; k <= 1; k += 0.25) occ.push([b.x + ca * k * 0.9 - fx * 0.17, b.y + sa * k * 0.9 - fy * 0.17, 0.46, b.x + ca * k * 0.9 + fx * 0.27, b.y + sa * k * 0.9 + fy * 0.27, 0.46, 0.24]); occ.push([b.x - ca * 0.9 - fx * 0.27, b.y - sa * 0.9 - fy * 0.27, 0.85, b.x + ca * 0.9 - fx * 0.27, b.y + sa * 0.9 - fy * 0.27, 0.85, 0.1]); }
      if (o.t === 'bin') occ.push([o.x, o.y, 0, o.x, o.y, 0.95, 0.56]);
      if (o.t === 'gate') { var hx = o.x - 0.85; occ.push([hx, o.y, 1.05, hx + Math.cos(o.open) * 1.6, o.y + Math.sin(o.open) * 1.6, 1.05, 0.045]); }
      if (o.t === 'hedge') occ.push([o.s.x1, o.s.y1, 1.1, o.s.x2, o.s.y2, 1.1, 0.85]);
    });
    litLamps.forEach(function (lp) {
      var lz = lp.h - 0.15, R2 = 9;
      occ.forEach(function (q) {
        if (Math.hypot(q[0] - lp.x, q[1] - lp.y) > R2 && Math.hypot(q[3] - lp.x, q[4] - lp.y) > R2) return;
        if (q[2] >= lz - 0.05 || q[5] >= lz - 0.05) return;
        if (Math.hypot(q[0] - lp.x, q[1] - lp.y) < 0.2 && q[2] === 0) return;   // its own post
        var k1 = lz / (lz - q[2]), k2 = lz / (lz - q[5]);
        var ax = lp.x + (q[0] - lp.x) * k1, ay = lp.y + (q[1] - lp.y) * k1, bx = lp.x + (q[3] - lp.x) * k2, by = lp.y + (q[4] - lp.y) * k2;
        var w = q[6] * (k1 + k2) / 2, e = mpp * 0.7 + 0.015 * (k1 + k2), s2 = seg(ax, ay, bx, by, w), bb = bbox(s2, e * 2);
        if (bb[2] < 0 || bb[3] < 0 || bb[0] > WM || bb[1] > HM || (bb[2] - bb[0]) * (bb[3] - bb[1]) > 400) return;
        forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var dl = Math.hypot(x - lp.x, y - lp.y); if (dl > 12) return; var v = clamp(0.5 - sd(s2, x, y) / (2 * e), 0, 1) * 0.9; if (v > 0.003) LSH[i] *= 1 - v; });
      });
    });
  }
  var aoK1 = L.soft || L.si < 0.2 ? 2.8 : 1.6, aoK2 = L.soft || L.si < 0.2 ? 8 : 4;
  var BN = null;
  if (L.si > 0.2) {
    BN = new Float32Array(PN);
    for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) { var i = y * PW + x, hl = H[x > 0 ? i - 1 : i], hr = H[x < PW - 1 ? i + 1 : i], hu = H[y > 0 ? i - PW : i], hd = H[y < PH - 1 ? i + PW : i];
      var nx = -clamp(hr - hl, -0.09, 0.09) * inv0, ny = -clamp(hd - hu, -0.09, 0.09) * inv0, nl = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      BN[i] = SN[i] * Math.max(0, (nx * sunV[0] + ny * sunV[1] + sunV[2]) * nl) / sunV[2] * SHD[i]; }
    blur(BN, BN, 0.06, 2);
  }
  var img = ctx.createImageData(PW, PH), px8 = img.data;
  var sunC = L.sun.map(function (c) { return c * L.si; }), skyC = L.sky.map(function (c) { return c * L.ki; });
  var lampList = litLamps.map(function (l) { return { x: l.x, y: l.y, z: (l.h || 4.1) - 0.15, p: (l.wall ? 2.5 : 4) * L.lamps }; });
  var RR = RX.fork('grain'), seedI = RR.int(1, 1 << 30);
  function hash(i) { i = (i ^ seedI) >>> 0; i = Math.imul(i ^ (i >>> 16), 0x7feb352d); i = Math.imul(i ^ (i >>> 15), 0x846ca68b); return ((i ^ (i >>> 16)) >>> 0) / 4294967296; }
  var inv = 1 / (2 * mpp), expo = L.exp, glow = new Float32Array(L.lamps > 0 ? PN : 0);
  for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
    var i = y * PW + x, wx = (x + 0.5) * mpp, wy = (y + 0.5) * mpp;
    var hl = H[x > 0 ? i - 1 : i], hr = H[x < PW - 1 ? i + 1 : i], hu = H[y > 0 ? i - PW : i], hd = H[y < PH - 1 ? i + PW : i];
    var nx = -clamp(hr - hl, -0.09, 0.09) * inv, ny = -clamp(hd - hu, -0.09, 0.09) * inv, nl = 1 / Math.sqrt(nx * nx + ny * ny + 1), nz = nl; nx *= nl; ny *= nl;
    var ndl = Math.max(0, nx * sunV[0] + ny * sunV[1] + nz * sunV[2]), sh = SHD[i];
    if (L.moon) ndl = lerp(sunV[2], ndl, 0.55);   // the moon is a broad, dim source and snow walls scatter it: relief stays, black sides do not
    var hc = Fp[i], ao = clamp(1 - aoK1 * Math.max(0, AOb[i] - hc), 0.3, 1) * clamp(1 - aoK2 * Math.max(0, AOs[i] - hc), 0.4, 1);
    if (L.moon) ao = 0.45 + 0.55 * ao;   // under a whole bright sky of snow-lit air, hollows do not go black
    var amb = ao * (0.55 + 0.45 * nz) * (1 + 0.3 * (nx * skyDir[0] + ny * skyDir[1])), sn = SN[i];
    var nf = ndl / sunV[2], dr = sunC[0] * nf * sh, dg = sunC[1] * nf * sh, db = sunC[2] * nf * sh;
    var bo = BN ? BN[i] * (L.moon ? 0.5 : 0.22) * (1 - sh * 0.7) : 0;   // snow lights its own shadows; at night that is most of what fills a print
    var r = AR[i] * (dr + skyC[0] * amb + sunC[0] * bo), g = AG[i] * (dg + skyC[1] * amb + sunC[1] * bo), b = AB[i] * (db + skyC[2] * amb + sunC[2] * bo);
    // snow translucency: shadowed snow takes on the sky colour
    r += sn * skyC[0] * 0.06 * (1 - sh); g += sn * skyC[1] * 0.07 * (1 - sh); b += sn * skyC[2] * 0.09 * (1 - sh);
    if (L.moon) { var tf = sn * 0.3 * (1 - sh); r += tf * sunC[0]; g += tf * sunC[1]; b += tf * sunC[2]; }   // moonlight scattered through the walls of a print
    var lampI = 0;
    for (var k = 0; k < lampList.length; k++) {
      var lp = lampList[k], lx = lp.x - wx, ly = lp.y - wy, lz = lp.z - H[i], d2 = lx * lx + ly * ly + lz * lz, dl = Math.sqrt(d2);
      var nd = Math.max(0, (nx * lx + ny * ly + nz * lz) / dl); if (nd <= 0 || d2 > 120) continue;
      var I = lp.p * 0.8 * nd / (d2 + 0.6) * sstep(0.5, 0.68, lz / dl);   // shielded fixture: a pool with an edge, not a haze
      if (I > 0.004) { var hd = Math.sqrt(lx * lx + ly * ly) || 1, ux = lx / hd, uy = ly / hd, tl = lz / hd, h0 = H[i], vis = 1;
        for (var st2 = 1; st2 <= 6; st2++) { var dd = st2 * 0.04, sx = Math.round(x + ux * dd / mpp), sy = Math.round(y + uy * dd / mpp); if (sx < 0 || sy < 0 || sx >= PW || sy >= PH) break; var ex = H[sy * PW + sx] - (h0 + dd * tl); if (ex > 0) vis = Math.min(vis, 1 - clamp(ex / 0.01, 0, 1)); }
        I *= vis; }
      lampI += I;
    }
    if (LSH) lampI *= LSH[i];
    if (lampI > 0) { r += AR[i] * lampCol[0] * lampI; g += AG[i] * lampCol[1] * lampI; b += AB[i] * lampCol[2] * lampI; }
    // sparkle: individual crystals catching the light
    var hs = hash(i);
    if (sn > 0.3 && hs < 0.0022) { var sp = (1 - hs / 0.0022) * sn * (sh * L.si * nf * (L.moon ? 7 : 1.2) + lampI * 2.5 + (L.si === 0 && L.lamps === 0 ? 0.25 : 0)); r += sp * (L.si > 0 ? L.sun[0] : lampCol[0]); g += sp * (L.si > 0 ? L.sun[1] : lampCol[1]); b += sp * (L.si > 0 ? L.sun[2] : lampCol[2]); }
    // crystal tooth: many faint facets, only where light rakes the surface; this is what keeps snow from reading as plaster close up
    else if (sn > 0.3 && hs < 0.03) { var f = (1 - hs / 0.03) * sn * 0.09 * (sh * nf + 0.15 + lampI * 1.5); r *= 1 + f; g *= 1 + f; b *= 1 + f * 1.02; }
    else if (sn > 0.3 && hs > 0.97) { var f2 = (hs - 0.97) / 0.03 * sn * 0.05; r *= 1 - f2; g *= 1 - f2; b *= 1 - f2 * 0.8; }
    A1[i] = r; A3[i] = g; B2[i] = b;
  }
  // lamp glow (bloom) for the dark hours
  var GLR = new Float32Array(0);
  if (L.lamps > 0) {
    lampList.forEach(function (lp) { if (lp.x < 0 || lp.y < 0 || lp.x > WM || lp.y > HM) return; var rg = 1.6; forBox(lp.x - rg, lp.y - rg, lp.x + rg, lp.y + rg, function (i, x, y) { var d = Math.hypot(x - lp.x, y - lp.y); glow[i] += L.lamps * (0.35 * Math.exp(-d * d / 0.04) + 0.01 * Math.exp(-d * d / 0.3)); }); });
  }
  // tone map, grade, grain, vignette
  for (var y = 0; y < PH; y++) for (var x = 0; x < PW; x++) {
    var i = y * PW + x, r = A1[i], g = A3[i], b = B2[i];
    if (glow.length) { r += glow[i] * lampCol[0]; g += glow[i] * lampCol[1]; b += glow[i] * lampCol[2]; }
    var Lm = (0.3 * r + 0.59 * g + 0.11 * b) * expo + 1e-6, kL = (1 - Math.exp(-Lm)) / Lm * expo;   // hue-preserving, then soft per-channel shoulder
    var r1 = r * kL, g1 = g * kL, b1 = b * kL, r2 = 1 - Math.exp(-r * expo), g2 = 1 - Math.exp(-g * expo), b2 = 1 - Math.exp(-b * expo);
    r = lerp(r1, r2, 0.45); g = lerp(g1, g2, 0.45); b = lerp(b1, b2, 0.45);
    var lum = 0.3 * r + 0.59 * g + 0.11 * b, ws = (1 - lum) * (1 - lum), wh = lum * lum;
    r = r + (L.tintS[0] - lum) * 0.10 * ws + (L.tintH[0] - 1) * 0.12 * wh; g = g + (L.tintS[1] - lum) * 0.10 * ws + (L.tintH[1] - 1) * 0.12 * wh; b = b + (L.tintS[2] - lum) * 0.10 * ws + (L.tintH[2] - 1) * 0.12 * wh;
    var u = x / PW - 0.5, v = y / PH - 0.5, vg = 1 - 0.32 * Math.pow(u * u + v * v, 1.25) * 2.2;
    var gn = (hash(i * 7 + 3) + hash(i * 13 + 5) - 1) * 0.016 * (1 - 0.5 * lum);
    px8[i * 4] = clamp(Math.pow(clamp(r * vg, 0, 1), 1 / 2.2) + gn, 0, 1) * 255;
    px8[i * 4 + 1] = clamp(Math.pow(clamp(g * vg, 0, 1), 1 / 2.2) + gn, 0, 1) * 255;
    px8[i * 4 + 2] = clamp(Math.pow(clamp(b * vg, 0, 1), 1 / 2.2) + gn, 0, 1) * 255;
    px8[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  C.done(cv.canvas, 'before-the-shovels');
})();

  // ---- street furniture (round 11) ----
  function rectT(x0, y0, x1, y1) { var q1 = T(x0, y0), q2 = T(x1, y1); return [Math.min(q1[0], q2[0]), Math.min(q1[1], q2[1]), Math.max(q1[0], q2[0]), Math.max(q1[1], q2[1])]; }
  function addRoad(x0, y0, x1, y1, dir) { roads.push({ b: rectT(x0, y0, x1, y1), dir: dir }); }
  function addSign(p, kind) {   // seen from above a sign is a line; its shadow says what it is
    var s = { t: 'sign', x: p[0], y: p[1], h: 2.75, plates: [] };
    if (kind === 'stop') { var f = RW.chance(0.5) ? 0 : PI / 2; s.plates.push({ z: 2.05, f: f, hu: 0.38, hw: 0.38, sh: 'oct', col: [0.55, 0.06, 0.05] }); s.plates.push({ z: 2.62, f: 0, hu: 0.4, hw: 0.08, sh: 'rect', col: [0.05, 0.25, 0.12] }); s.plates.push({ z: 2.47, f: PI / 2, hu: 0.4, hw: 0.08, sh: 'rect', col: [0.05, 0.25, 0.12] }); }
    else if (kind === 'name') { s.h = 2.6; s.plates.push({ z: 2.5, f: 0, hu: 0.4, hw: 0.08, sh: 'rect', col: [0.05, 0.25, 0.12] }); s.plates.push({ z: 2.35, f: PI / 2, hu: 0.4, hw: 0.08, sh: 'rect', col: [0.05, 0.25, 0.12] }); }
    else if (kind === 'speed') { s.h = 2.3; s.plates.push({ z: 1.95, f: PI / 2 + RW.gaussian(0, 0.05), hu: 0.3, hw: 0.38, sh: 'rect', col: [0.85, 0.85, 0.82] }); }
    else { s.h = 2.6; s.plates.push({ z: 2.2, f: PI / 2 + RW.gaussian(0, 0.04), hu: 0.23, hw: 0.32, sh: 'rect', col: [0.1, 0.2, 0.45] }); }   // bus
    objs.push(s); signs.push(s); block(circle(p[0], p[1], 0.05));
  }
  function addHydrant(p) { objs.push({ t: 'hydrant', x: p[0], y: p[1], a: RW.range(0, PI), col: RW.chance(0.8) ? [0.6, 0.07, 0.05] : [0.7, 0.5, 0.06] }); block(circle(p[0], p[1], 0.22)); }
  function addMailbox(p) { var m = { t: 'mailbox', x: p[0], y: p[1], a: PI / 2 + RW.gaussian(0, 0.08), col: RW.pick([[0.04, 0.04, 0.045], [0.04, 0.04, 0.045], [0.15, 0.16, 0.17], [0.32, 0.06, 0.05]]) }; objs.push(m); mailboxes.push(m); block(circle(p[0], p[1], 0.07)); }
  function addPFence(p, q, kind) { objs.push({ t: 'pfence', p: p, q: q, kind: kind }); block(seg(p[0], p[1], q[0], q[1], kind === 'rail' ? 0.16 : 0.1)); }
  function addShelter(p, face) {
    var s = { t: 'shelter', x: p[0], y: p[1], a: face, hw: 1.7, hh: 0.72, z: 2.45 }, fx = Math.cos(face), fy = Math.sin(face), tx = -fy, ty = fx;
    objs.push(s); shelters.push(s);
    block(seg(p[0] - fx * 0.7 - tx * 1.7, p[1] - fy * 0.7 - ty * 1.7, p[0] - fx * 0.7 + tx * 1.7, p[1] - fy * 0.7 + ty * 1.7, 0.06));   // back glass
    [-1, 1].forEach(function (k) { block(seg(p[0] - fx * 0.7 + tx * 1.65 * k, p[1] - fy * 0.7 + ty * 1.65 * k, p[0] + fx * 0.1 + tx * 1.65 * k, p[1] + fy * 0.1 + ty * 1.65 * k, 0.06)); });   // side panels
  }
  function addCar(p, a) {
    var c = { t: 'car', x: p[0], y: p[1], a: a, L: RW.range(4.3, 4.8), W: RW.range(1.75, 1.85), col: RW.pick([[0.42, 0.05, 0.05], [0.06, 0.12, 0.3], [0.05, 0.05, 0.055], [0.5, 0.5, 0.52], [0.18, 0.22, 0.2], [0.55, 0.42, 0.25]]), ws: RW.chance(0.3), seed: RW.range(0, 99) };
    objs.push(c); cars.push(c); block(box(p[0], p[1], c.L / 2, c.W / 2, a));
  }
  function rutPair(pts, st) {   // two wheels 1.55 m apart along a centreline
    for (var s = -1; s <= 1; s += 2) { var line = []; for (var i = 0; i < pts.length; i++) { var a = pts[Math.min(i + 1, pts.length - 1)], b = pts[Math.max(i - 1, 0)], dx = a[0] - b[0], dy = a[1] - b[1], dl = Math.hypot(dx, dy) || 1; line.push([pts[i][0] - dy / dl * 0.775 * s, pts[i][1] + dx / dl * 0.775 * s]); } ruts.push({ pts: line, w: 0.2, st: st }); }
  }
  function laneRuts(c0, c1, dir, park, turnAt, car) {   // a few cars since the snow stopped; the parked one is steered round
    var lanes = [lerp(c0, c1, park > 0 ? 0.3 : 0.28), lerp(c0, c1, 0.72)], RR = RW.fork('ruts' + c0);
    lanes.forEach(function (lc, li) {
      if (lc > (dir === 'h' ? HM : WM) + 0.5) return;
      var n = RR.int(1, 4);
      for (var k = 0; k < n; k++) {
        var ph = RR.range(0, TAU), am = RR.range(0.1, 0.35), off = RR.gaussian(0, 0.22), pts = [];
        for (var u = -2; u <= (dir === 'h' ? WM : HM) + 2; u += 0.5) {
          var w = lc + off + am * Math.sin(u * 0.13 + ph);
          if (car) { var cu = dir === 'h' ? T(0, 0) : 0; }
          var p = dir === 'h' ? T(u, w) : T(w, u);
          if (car) { var dc = Math.hypot(p[0] - car.x, p[1] - car.y); if (dc < car.L) { var push = (1 - dc / car.L) * 1.2; p = dir === 'h' ? T(u, w + push) : T(w + push, u); } }
          pts.push(p);
        }
        rutPair(pts, RR.range(0.75, 1));
      }
    });
  }
  function driveRuts(dvx, cy0) {   // backed out of the drive and away along the road
    var pts = [], R5 = RW.fork('drv'), dirn = R5.pick([-1, 1]);
    for (var y = -2; y < cy0 + 1.5; y += 0.4) pts.push(T(dvx + R5.gaussian(0, 0.02), y));
    for (var t = 0; t <= 1; t += 0.05) { var an = t * PI / 2; pts.push(T(dvx + dirn * 3 * (1 - Math.cos(an)), cy0 + 1.5 + 3 * Math.sin(an))); }
    for (var x = dvx + dirn * 3; x > -2 && x < WM + 2; x += dirn * 0.5) pts.push(T(x, cy0 + 4.5));
    rutPair(pts, 0.95);
  }

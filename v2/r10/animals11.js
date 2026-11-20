  // ======================= animals (round 11): one species at most, held to the same restraint =======================
  var birds = [];
  function edgePt(R2, side) { var s = side == null ? R2.int(0, 3) : side, t = R2.range(0.12, 0.88); return s === 0 ? [0.25, t * HM] : s === 1 ? [WM - 0.25, t * HM] : s === 2 ? [t * WM, 0.25] : [t * WM, HM - 0.25]; }
  function okPt(p) { return p[0] > 0.2 && p[1] > 0.2 && p[0] < WM - 0.2 && p[1] < HM - 0.2 && !blocked[cellOf(p[0], p[1])]; }
  function nearFree(p, R2, sg) { for (var k = 0; k < 40; k++) { var q = [p[0] + R2.gaussian(0, sg || 0.6), p[1] + R2.gaussian(0, sg || 0.6)]; if (okPt(q)) return q; } return null; }
  var covers = [];   // where small animals make for: under hedges, benches, cars and shelters, along fences, to trunks
  objs.forEach(function (o) {
    if (o.t === 'hedge') covers.push([(o.s.x1 + o.s.x2) / 2, (o.s.y1 + o.s.y2) / 2]);
    if (o.t === 'bench' && !o.b.dry) covers.push([o.b.x, o.b.y]);
    if (o.t === 'car' || o.t === 'shelter') covers.push([o.x, o.y]);
    if (o.t === 'pfence' || o.t === 'fence') { var t = RA.range(0.2, 0.8); covers.push([lerp(o.p[0], o.q[0], t), lerp(o.p[1], o.q[1], t)]); }
  });
  var inTrees = trees.filter(function (t) { return ghosts.indexOf(t) < 0; });
  inTrees.forEach(function (t) { covers.push([t.x, t.y]); });
  covers = covers.filter(function (c) { return c[0] > 0.5 && c[1] > 0.5 && c[0] < WM - 0.5 && c[1] < HM - 0.5; });
  function ani(R2, key, from, to, o) { o.deposit = 0; o.bias = 0; ver++; return walk(R2, from, to, key, o); }
  function far2(R2, a, minD) { for (var k = 0; k < 30; k++) { var b = edgePt(R2); if (Math.hypot(b[0] - a[0], b[1] - a[1]) > minD) return b; } return edgePt(R2); }
  var RAn = RA.fork('tracks');
  if (animals === 'Rabbit') {   // hops in fours: the long hind feet land side by side, ahead of the front feet, which fall one behind the other
    var nr = RAn.chance(0.2) ? 2 : 1;
    for (var k = 0; k < nr; k++) {
      var a = edgePt(RAn), cv = covers.length ? nearFree(RAn.pick(covers), RAn, 0.5) : null, b = cv || far2(RAn, a, 10);
      var gR = function (x, y, hx, hy) {
        var px = -hy, py = hx, an = Math.atan2(hy, hx), sp = RAn.range(0.06, 0.09), q = RAn.range(-0.02, 0.02);
        prints.push(x + hx * 0.12 + px * sp, y + hy * 0.12 + py * sp, an + 0.1, 0.105, 0.042, 1, 0.9, 0, 0);
        prints.push(x + hx * 0.12 - px * sp, y + hy * 0.12 - py * sp, an - 0.1, 0.105, 0.042, 1, 0.9, 0, 0);
        prints.push(x - hx * 0.07 + px * q, y - hy * 0.07 + py * q, an, 0.05, 0.038, 1, 0.85, 0, 0);
        prints.push(x - hx * 0.2 - px * q * 1.5, y - hy * 0.2 - py * q * 1.5, an, 0.05, 0.038, 1, 0.85, 0, 0);
      };
      var end = ani(RAn, 'rab' + k, a, b, { step: RAn.range(0.75, 1.15), gait: gR, wander: 1.0 });
      if (cv && RAn.chance(0.5)) ani(RAn, 'rab2' + k, end, far2(RAn, end, 8), { step: RAn.range(0.9, 1.4), gait: gR, wander: 0.8 });   // and out again
    }
  } else if (animals === 'Cat') {   // direct register: hind foot into fore print, a neat dotted line, as often as not along a fence
    var doors = ents.filter(function (e) { return e.kind === 'door'; }), a = doors.length && RAn.chance(0.6) ? [RAn.pick(doors).x, RAn.pick(doors).y] : edgePt(RAn), sideC = 1;
    var gC = function (x, y, hx, hy) { sideC = -sideC; prints.push(x - hy * 0.035 * sideC, y + hx * 0.035 * sideC, Math.atan2(hy, hx), 0.042, 0.038, 1, 0.9, 0, 0); };
    var fen = objs.filter(function (o) { return o.t === 'pfence' || o.t === 'fence'; }), cur = a;
    if (fen.length) { var f = RAn.pick(fen), s1 = RAn.chance(0.5) ? 1 : -1, nx = -(f.q[1] - f.p[1]), ny = f.q[0] - f.p[0], nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      var p0 = [lerp(f.p[0], f.q[0], 0.05) + nx * 0.28 * s1, lerp(f.p[1], f.q[1], 0.05) + ny * 0.28 * s1], p1 = [lerp(f.p[0], f.q[0], 0.95) + nx * 0.28 * s1, lerp(f.p[1], f.q[1], 0.95) + ny * 0.28 * s1];
      if (Math.hypot(p1[0] - a[0], p1[1] - a[1]) < Math.hypot(p0[0] - a[0], p0[1] - a[1])) { var t = p0; p0 = p1; p1 = t; }
      p0 = [clamp(p0[0], 0.3, WM - 0.3), clamp(p0[1], 0.3, HM - 0.3)]; p1 = [clamp(p1[0], 0.3, WM - 0.3), clamp(p1[1], 0.3, HM - 0.3)];
      cur = ani(RAn, 'cat0', cur, p0, { step: 0.3, gait: gC, wander: 0.15 }); cur = ani(RAn, 'cat1', cur, p1, { step: 0.3, gait: gC, wander: 0.05 });
    } else { var tg = covers.length ? nearFree(RAn.pick(covers), RAn, 0.4) : null; if (tg) cur = ani(RAn, 'cat0', cur, tg, { step: 0.3, gait: gC, wander: 0.2 }); }
    if (cur[0] > 0.6 && cur[1] > 0.6 && cur[0] < WM - 0.6 && cur[1] < HM - 0.6 && RAn.chance(0.7)) ani(RAn, 'cat2', cur, far2(RAn, cur, 6), { step: 0.3, gait: gC, wander: 0.15 });
  } else if (animals === 'Fox') {   // a fox goes straight through, each print exactly in front of the last
    var a = edgePt(RAn), b = far2(RAn, a, 16), sideF = 1;
    var gF = function (x, y, hx, hy) { sideF = -sideF; prints.push(x - hy * 0.012 * sideF, y + hx * 0.012 * sideF, Math.atan2(hy, hx), 0.058, 0.044, 1, 0.92, 0, 0); };
    var cur = a; if (bins.length && RAn.chance(0.3)) { var bn = RAn.pick(bins), sp = nearFree([bn.x, bn.y], RAn, 0.5); if (sp) cur = ani(RAn, 'fox0', cur, sp, { step: 0.36, gait: gF, wander: 0.1 }); }
    ani(RAn, 'fox1', cur, b, { step: 0.36, gait: gF, wander: 0.08 });
  } else if (animals === 'Squirrel') {   // bounds from trunk to trunk; with no tree in frame, toward one we cannot see
    var gS = function (x, y, hx, hy) { var px = -hy, py = hx, an = Math.atan2(hy, hx);
      prints.push(x + hx * 0.09 + px * 0.06, y + hy * 0.09 + py * 0.06, an, 0.06, 0.03, 1, 0.85, 0, 0); prints.push(x + hx * 0.09 - px * 0.06, y + hy * 0.09 - py * 0.06, an, 0.06, 0.03, 1, 0.85, 0, 0);
      prints.push(x - hx * 0.05 + px * 0.035, y - hy * 0.05 + py * 0.035, an, 0.03, 0.026, 1, 0.8, 0, 0); prints.push(x - hx * 0.05 - px * 0.035, y - hy * 0.05 - py * 0.035, an, 0.03, 0.026, 1, 0.8, 0, 0); };
    var tA = inTrees.length ? RAn.pick(inTrees) : null, tB = inTrees.length > 1 ? RAn.pick(inTrees.filter(function (t) { return t !== tA; })) : null;
    var g = ghosts.length ? ghosts[0] : null, ge = g ? [clamp(g.x, 0.25, WM - 0.25), clamp(g.y, 0.25, HM - 0.25)] : edgePt(RAn);
    var a = tA ? nearFree([tA.x, tA.y], RAn, 0.35) : edgePt(RAn), b = tB ? nearFree([tB.x, tB.y], RAn, 0.35) : ge;
    if (a && b) ani(RAn, 'sq', a, b, { step: RAn.range(0.65, 0.9), gait: gS, wander: 0.6 });
  } else if (animals === 'Deer') {   // walking, hind into fore, a split heart pointing the way
    var nd = RAn.chance(0.4) ? 2 : 1, a0 = edgePt(RAn), b0 = far2(RAn, a0, 15);
    for (var k = 0; k < nd; k++) { var sideD = 1, gD = function (x, y, hx, hy) { sideD = -sideD; prints.push(x - hy * 0.09 * sideD, y + hx * 0.09 * sideD, Math.atan2(hy, hx), 0.075, 0.055, 5, 0.95, 0, 0); };
      ani(RAn, 'deer' + k, [a0[0] + k * RAn.range(0.4, 1.2), a0[1] + k * RAn.range(0.4, 1.2)], [b0[0] + k * 0.7, b0[1] - k * 0.5], { step: 0.52, gait: gD, wander: 0.35 }); }
  } else if (animals === 'Birds') {   // pigeons walk, sparrows hop; they gather where people sit and wait
    var spots = benches.map(function (b) { return [b.x + Math.cos(b.a) * 0.9, b.y + Math.sin(b.a) * 0.9]; }).concat(busStop ? [busStop.wait] : [], bins.map(function (b) { return [b.x, b.y]; }), inTrees.map(function (t) { return [t.x, t.y]; }));
    if (!spots.length) spots.push([RAn.range(4, WM - 4), RAn.range(4, HM - 4)]);
    var ncl = RAn.chance(0.3) ? 2 : 1, sitSp = null;
    for (var c = 0; c < ncl; c++) {
      var cen = nearFree(RAn.pick(spots), RAn, 0.8); if (!cen) continue;
      var sp = RAn.chance(0.6) ? 'pigeon' : 'sparrow', nb = RAn.int(2, 5), lastEnd = null; sitSp = sitSp || sp;
      for (var b = 0; b < nb; b++) {
        var x = cen[0] + RAn.gaussian(0, 0.5), y = cen[1] + RAn.gaussian(0, 0.5), an = RAn.range(0, TAU), ns = RAn.int(10, 40), side = 1;
        for (var s = 0; s < ns; s++) {
          an += RAn.gaussian(0, sp === 'pigeon' ? 0.35 : 0.5); var st = sp === 'pigeon' ? RAn.range(0.065, 0.09) : RAn.range(0.08, 0.14);
          var nx = x + Math.cos(an) * st, ny = y + Math.sin(an) * st; if (!okPt([nx, ny])) { an += PI * 0.7; continue; } x = nx; y = ny; side = -side;
          if (sp === 'pigeon') prints.push(x - Math.sin(an) * 0.025 * side, y + Math.cos(an) * 0.025 * side, an + side * 0.15, 0.065, 0, 6, 0.85, 0, 0);
          else for (var q = -1; q <= 1; q += 2) prints.push(x - Math.sin(an) * 0.015 * q, y + Math.cos(an) * 0.015 * q, an, 0.035, 0, 6, 0.8, 0, 0);
        }
        lastEnd = [x, y, an];
      }
      if (lastEnd && snowfall !== 'Dusting' && RAn.chance(0.4)) prints.push(lastEnd[0] + Math.cos(lastEnd[2]) * 0.1, lastEnd[1] + Math.sin(lastEnd[2]) * 0.1, lastEnd[2], sp === 'pigeon' ? 0.62 : 0.24, 0, 7, 0.9, 0, 0);   // took off: the wings struck the snow
      if (RAn.chance(0.55)) { var nsit = RAn.int(1, sp === 'pigeon' ? 4 : 3); for (var k = 0; k < nsit; k++) { var q = nearFree(cen, RAn, 0.7); if (q) birds.push({ x: q[0], y: q[1], a: RAn.range(0, TAU), sp: sp }); } }
    }
    if (RAn.chance(0.2)) { var q = nearFree([RAn.range(3, WM - 3), RAn.range(3, HM - 3)], RAn, 1); if (q) birds.push({ x: q[0], y: q[1], a: RAn.range(0, TAU), sp: 'crow' }); }
  }

  if (/Angel/.test(incident)) {
    var child = incident !== 'Snow Angel', asc = child ? 0.64 : 1;
    var sp = openSpot(RI, 0.02, 2.5, 8) || openSpot(RI, 0.02, 0, 99);
    if (sp) {
      var kOpt = child ? { step: 0.44, foot: 0.19, wander: 0.5, bias: 0, deposit: 0.02 } : { step: RI.range(0.62, 0.7), foot: RI.range(0.27, 0.3), wander: 0.25, bias: 0, deposit: 0.03 };
      var src = nWalk > 0 ? nearestTrail(sp[0], sp[1]) : entPt(RI, ents[pickEnt(RI)]);
      var aa = Math.atan2(sp[1] - src[1], sp[0] - src[0]) + RI.range(-0.6, 0.6);   // body axis, hips to head: they walked out, turned their back and fell
      angel = { x: sp[0], y: sp[1], a: aa, s: asc, hand: RI.chance(0.5) ? 1 : -1, knee: RI.chance(0.55), armMax: RI.range(2.45, 2.85), legMax: RI.range(0.38, 0.6), seed: RI.int(0, 9999) };
      ver++;
      var ca0 = Math.cos(aa), sa0 = Math.sin(aa), foot = [sp[0] - ca0 * 1.08 * asc, sp[1] - sa0 * 1.08 * asc];
      walk(RI, src, [foot[0] - ca0 * 0.3, foot[1] - sa0 * 0.3], 'ang', kOpt);
      stand(foot[0], foot[1], aa + PI, kOpt.foot, 1, 0.12 * asc);   // stood with their back to it
      var kp = [sp[0] - ca0 * 0.78 * asc - sa0 * 0.06, sp[1] - sa0 * 0.78 * asc + ca0 * 0.06];   // got up: a boot planted in the skirt, then a long step out
      prints.push(kp[0], kp[1], aa + PI + RI.gaussian(0, 0.25), kOpt.foot, kOpt.foot * 0.4, 0, 1, 0, 0);
      var out = [sp[0] - ca0 * 1.5 * asc + RI.gaussian(0, 0.1), sp[1] - sa0 * 1.5 * asc + RI.gaussian(0, 0.1)];
      prints.push(out[0], out[1], aa + PI + RI.gaussian(0, 0.3), kOpt.foot, kOpt.foot * 0.39, 0, 1, 0, 0);
      var dE = pickEnt(RI), dP = entPt(RI, ents[dE]);
      walk(RI, out, dP, 'ang2', kOpt);
      if (child) {   // a grown-up stood a few steps off and watched
        for (var k = 0; k < 8; k++) { var wa = aa + PI + RI.range(-1.6, 1.6), wp = [sp[0] + Math.cos(wa) * 2.3, sp[1] + Math.sin(wa) * 2.3]; if (!blocked[cellOf(wp[0], wp[1])] && wp[0] > 0.5 && wp[1] > 0.5 && wp[0] < WM - 0.5 && wp[1] < HM - 0.5) break; wp = null; }
        if (wp) { var pO = { foot: 0.29, step: 0.68, deposit: 0.03 }; walk(RI, src, wp, 'par', pO); var fa = Math.atan2(sp[1] - wp[1], sp[0] - wp[0]); stand(wp[0], wp[1], fa, 0.29, 1, 0.13); stand(wp[0] + RI.gaussian(0, 0.08), wp[1] + RI.gaussian(0, 0.08), fa + RI.range(-0.5, 0.5), 0.29, 0.8, 0.15); walk(RI, wp, dP, 'par2', pO); }
      }
    }
  } else if (incident === 'A Dog') {   // someone walked the dog; the dog went everywhere
    var R2 = RI.fork('dog'), pr = pair(R2, 10, true), o0 = pr[0], d0 = pr[1], hist = [];
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

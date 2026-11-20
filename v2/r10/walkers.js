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
    return -Math.abs(L - 17) / 8 + 0.6 * Math.abs(Math.sin(2 * th)) - 2 * t3 - (edgeA === edgeB ? 3 : 0);
  }
  var usedPair = {};
  function pair(R2, tries, comp) {
    var best = null, bs = -1e9;
    for (var k = 0; k < tries; k++) { var o = pickEnt(R2), d = pickEnt(R2, o), key = Math.min(o, d) + '-' + Math.max(o, d); var s = R2.range(0, 1.2) - (usedPair[key] || 0) * 1.5 + (comp ? compScore(o, d) : 0); if (s > bs) { bs = s; best = [o, d, key]; } }
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
      var pr = pair(RWk, footfall === 'Steady' ? 3 : 10, footfall !== 'Steady'), kind = footfall === 'Solitary' ? (RWk.chance(0.75) ? 'through' : errand(RWk)) : errand(RWk);
      if (footfall !== 'Crowd' && RWk.chance(footfall === 'Steady' ? 0.15 : 0.35)) opt.hes = RWk.range(0.3, 0.7);
      if (RWk.chance(0.5)) { var t = pr[0]; pr[0] = pr[1]; pr[1] = t; }
      person(RWk, pr[0], pr[1], kind, opt);
    }
  }

  } else if (place === 'The Backyard') {
    // the back of a house along one edge: a door, a deck and its steps, a fenced yard, one round thing put to bed for the winter
    buildingH = RW.range(5.5, 8);
    var hx0 = RW.chance(0.55) ? -1 : RW.range(0.2, 0.4) * WM, hx1 = hx0 < 0 ? (RW.chance(0.5) ? WM + 1 : RW.range(0.6, 0.8) * WM) : WM + 1;
    var q1 = T(hx0, -12), q2 = T(hx1, -0.02), hb = [Math.min(q1[0], q2[0]), Math.min(q1[1], q2[1]), Math.max(q1[0], q2[0]), Math.max(q1[1], q2[1])];
    objs.push({ t: 'building', b: hb, h: buildingH }); block(box((hb[0] + hb[2]) / 2, (hb[1] + hb[3]) / 2, (hb[2] - hb[0]) / 2, (hb[3] - hb[1]) / 2, 0));
    var ha = Math.max(hx0, 0), hz = Math.min(hx1, WM), dxr = RW.range(ha + 2.5, hz - 2.5), deck = RW.chance(0.65), dkhv = 0, footY = 0.4;
    var vAng = function (x, y0, y1) { var a2 = T(x, y0), b2 = T(x, y1); return Math.atan2(-(b2[0] - a2[0]), b2[1] - a2[1]); };   // local +v points from y0 toward y1
    lamps.push({ x: T(dxr, 0)[0], y: T(0, 0.2)[1], h: 2.4, wall: true });
    if (deck) {
      var dkhu = RW.range(1.6, 2.6); dkhv = RW.range(1.2, 1.8); var zd = RW.range(0.45, 0.72), dcx = clamp(dxr + RW.range(-0.8, 0.8), ha + dkhu, hz - dkhu);
      addSt('deck', T(dcx, dkhv), vAng(dcx, 0, 1), { hu: dkhu, hv: dkhv, zd: zd });
      var nst = Math.max(2, Math.round(zd / 0.18)), sx = clamp(dxr, dcx - dkhu + 0.7, dcx + dkhu - 0.7), sdp = nst * 0.28;
      addSt('steps', T(sx, 2 * dkhv + sdp / 2), vAng(sx, 2 * dkhv + sdp, 2 * dkhv), { n: nst, rise: zd / (nst + 0.0) * nst / (nst + 1) + 0.0, hu: 0.6, col: [0.3, 0.23, 0.16] });
      var rk = { kind: 'iron', col: [0.36, 0.28, 0.2], H: zd + 0.92, spear: false, pitch: 0.12, pw: 0.09, ps: 1.8, bar: 0.04 };
      addFX(T(dcx - dkhu + 0.05, 0.05), T(dcx - dkhu + 0.05, 2 * dkhv - 0.05), 'iron', rk); addFX(T(dcx + dkhu - 0.05, 0.05), T(dcx + dkhu - 0.05, 2 * dkhv - 0.05), 'iron', rk);
      if (sx - 0.65 > dcx - dkhu + 0.3) addFX(T(dcx - dkhu + 0.05, 2 * dkhv - 0.05), T(sx - 0.65, 2 * dkhv - 0.05), 'iron', rk);
      if (sx + 0.65 < dcx + dkhu - 0.3) addFX(T(sx + 0.65, 2 * dkhv - 0.05), T(dcx + dkhu - 0.05, 2 * dkhv - 0.05), 'iron', rk);
      footY = 2 * dkhv + sdp + 0.4; ent(T(sx, footY), pw(1), 'door'); dxr = sx;
    } else { addSt('steps', T(dxr, 0.42), vAng(dxr, 0.84, 0), { n: 2, hu: 0.6 }); footY = 1.2; ent(T(dxr, footY), pw(1), 'door'); }
    // the yard's fence: across the far side, sometimes down one side too, a gate in it
    var fk = RW.fork('byf').weighted([['privacy', 34], ['chain', 26], ['picket', 18], ['breeze', 12], ['iron', 10]]), fyb = RW.chance(0.75) ? HM - RW.range(1.2, 5) : null, gx = RW.range(0.2, 0.8) * WM, fsp = null;
    if (fyb != null) { var sl = RW.gaussian(0, 0.04), fyf = function (x) { return fyb + sl * (x - WM / 2); }, gw = /breeze/.test(fk) ? 1.2 : 1.0;
      var fa = addFX(T(-1, fyf(-1)), T(gx - gw, fyf(gx - gw)), fk); fsp = Object.assign({}, fa.s); addFX(T(gx + gw, fyf(gx + gw)), T(WM + 1, fyf(WM + 1)), fk, fsp);
      if (!/breeze/.test(fk)) { var hg = T(gx - gw, fyf(gx - gw)), hgo = T(gx + gw, fyf(gx + gw)), ga = Math.atan2(hgo[1] - hg[1], hgo[0] - hg[0]) + RW.range(0.3, 1.1) * (flipY ? 1 : -1) * RW.pick([1, -1]); addFX(hg, [hg[0] + Math.cos(ga) * gw * 1.95, hg[1] + Math.sin(ga) * gw * 1.95], fk, Object.assign({}, fsp, { leaf: true })); }
      ent(T(gx, HM - 0.3), pw(1));
      if (RW.chance(0.45)) { var sxf = RW.chance(0.5) ? RW.range(0.4, 1.5) : WM - RW.range(0.4, 1.5); addFX(T(sxf, 0.02), T(sxf, fyf(sxf)), fk, fsp); }
    } else ent(T(RW.range(0.2, 0.8) * WM, HM - 0.3), pw(1));
    if (RW.chance(0.5)) ent(T(RW.chance(0.5) ? 0.3 : WM - 0.3, RW.range(0.45, 0.8) * HM), pw(0.8));
    // one accent, then perhaps one small thing
    var RB = RW.fork('byacc'), acc = RB.weighted([['pool', 24], ['hottub', 22], ['tramp', 24], ['gazebo', 16], ['rpicnic', 6], ['none', 8]]), yTop = Math.max(footY + 0.5, 2.5), yBot = (fyb || HM) - 1;
    var A = null;
    if (acc === 'hottub') { var hx = deck ? (RB.chance(0.5) ? dcx - dkhu - 1.35 : dcx + dkhu + 1.35) : dxr + RB.pick([-2.2, 2.2]); A = placeSt('hottub', RB, hx - 0.4, Math.max(T(0, 1.3)[1], 0) * 0 + T(0, 1.3)[1], hx + 0.4, T(0, deck ? dkhv * 2 : 2.5)[1], 1.2, 0) || placeSt('hottub', RB, 2, 3, WM - 2, HM - 3, 1.3, 0); }
    else if (acc === 'pool') A = placeSt('pool', RB, 3.5, Math.min(T(0, yTop + 3.5)[1], T(0, yBot - 3.5)[1]), WM - 3.5, Math.max(T(0, yTop + 3.5)[1], T(0, yBot - 3.5)[1]), 3.7, 0);
    else if (acc !== 'none') A = placeSt(acc, RB, 2.5, Math.min(T(0, yTop + 2.5)[1], T(0, yBot - 2.5)[1]), WM - 2.5, Math.max(T(0, yTop + 2.5)[1], T(0, yBot - 2.5)[1]), acc === 'gazebo' ? 2.8 : 2.4, RB.range(0, TAU));
    if (A && A.k === 'gazebo') A.door = RB.int(0, 7);
    if (A) { var ap = [A.x + (A.R || 1.2) + 0.7, A.y]; if (okIn(ap)) ent(ap, pw(0.6), 'spot'); }
    var sec = RB.weighted([['shed', 30], ['planter', 18], ['picnic', 12], ['sandbox', 10], ['ac', 24], ['none', 26]]);
    if (acc === 'pool' && sec !== 'ac') sec = 'none';
    if (sec === 'ac') { var acx = clamp(dxr + RB.pick([-1, 1]) * RB.range(deck ? dkhu + 0.9 : 1.5, deck ? dkhu + 2.5 : 3.5), ha + 0.8, hz - 0.8); addSt('ac', T(acx, 0.62), 0); }
    else if (sec === 'shed') { var cxs = RB.chance(0.5) ? RB.range(1.6, 3) : WM - RB.range(1.6, 3); var S2 = placeSt('shed', RB, cxs - 0.5, Math.min(T(0, yBot - 1.6)[1], T(0, yBot - 4)[1]), cxs + 0.5, Math.max(T(0, yBot - 1.6)[1], T(0, yBot - 4)[1]), 2.2, RB.pick([0, PI / 2])); if (S2) { var sp2 = [S2.x, S2.y + (S2.hv + 0.8) * (flipY ? 1 : -1)]; if (okIn(sp2)) ent(sp2, pw(0.6), 'spot'); } }
    else if (sec === 'planter') { var n3 = RB.int(2, 3), px3 = RB.range(2.5, WM - 6), py3 = RB.range(yTop + 1, yBot - 2), hu3 = RB.range(1.1, 1.6); for (var k = 0; k < n3; k++) { var pp = T(px3 + k * 0 , py3 + k * 1.6); if (stFree(pp, 0.7)) addSt('planter', pp, 0, { hu: hu3 }); } }
    else if (sec !== 'none') placeSt(sec, RB, 2, Math.min(T(0, yTop + 1)[1], T(0, yBot - 1)[1]), WM - 2, Math.max(T(0, yTop + 1)[1], T(0, yBot - 1)[1]), 1.5, RB.range(-0.3, 0.3) + RB.pick([0, PI / 2]));
    var tp = []; if (RW.chance(0.45)) for (var k = 0; k < 40 && !tp.length; k++) { var p = T(RW.range(2, WM - 2), RW.range(yTop + 2, yBot - 1)); if (stFree(p, 2.5)) tp.push(p); }
    tp.forEach(function (p) { addTree(p, RW.range(2.4, 3.8)); });
    sunPref = flipY ? 'fromBottom' : 'fromTop';
  } else if (place === 'The Farmyard') {
    // edge of town: a paddock fence across the frame with a gate; inside, the feeder or the tank they come to; outside, the track the tractor uses
    var fy0 = RW.range(0.32, 0.5) * HM, fsl = RW.gaussian(0, 0.05), ffy = function (x) { return fy0 + fsl * (x - WM / 2); };
    var pk = RW.fork('pfk').weighted([['board', 60], ['rail', 40]]), gx = RW.range(0.25, 0.75) * WM, gw = 1.85;
    var f1 = addFX(T(-1, ffy(-1)), T(gx - gw, ffy(gx - gw)), pk), psp = Object.assign({}, f1.s); addFX(T(gx + gw, ffy(gx + gw)), T(WM + 1, ffy(WM + 1)), pk, psp);
    var hg = T(gx - gw, ffy(gx - gw)), hgo = T(gx + gw, ffy(gx + gw)), ga = Math.atan2(hgo[1] - hg[1], hgo[0] - hg[0]) + RW.range(0.4, 1.3) * (flipY ? -1 : 1);
    addFX(hg, [hg[0] + Math.cos(ga) * 3.6, hg[1] + Math.sin(ga) * 3.6], 'board', { leaf: true, H: 1.27, n: 5, pw: 0.05, col: [0.44, 0.46, 0.47], capBoard: false });   // a tube gate, swung into the paddock
    ent(T(gx, 0.3), pw(1.2)); ent(T(clamp(gx + RW.range(-3, 3), 1, WM - 1), HM - 0.3), pw(0.6));
    var trk = []; for (var y = -1; y <= ffy(gx) + 6; y += 0.5) trk.push(T(gx + 0.9 * Math.sin(y * 0.15 + 1.3), y));
    farm = { line: ffy, gx: gx, feed: [] };
    var RF2 = RW.fork('farmacc'), inPad = function (R2, r) { for (var t = 0; t < 60; t++) { var p = T(R2.range(r + 0.5, WM - r - 0.5), R2.range(ffy(WM / 2) + r + 2, HM - r - 1)); if (stFree(p, r)) return p; } return null; };
    if (animals !== 'Chickens') {
      var fd = RF2.weighted([['feeder', 50], ['tank', 25], ['trough', 15], ['both', 10]]);
      if (fd === 'feeder' || fd === 'both') { var p = inPad(RF2, 2.2); if (p) { var F = addSt('feeder', p, 0); farm.feed.push(F); muds.push({ x: p[0], y: p[1], R: F.R + 2.2 }); for (var k = 0; k < 140; k++) { var an = RF2.range(0, TAU), rr = F.R + Math.abs(RF2.gaussian(0, 0.6)); hayBits.push([p[0] + Math.cos(an) * rr, p[1] + Math.sin(an) * rr, RF2.range(0, TAU), RF2.range(0.04, 0.16)]); } rutPair(trk.concat([p]), 0.55); } }
      if (fd !== 'feeder') { var p = inPad(RF2, 1.8); if (p) { var Tk = addSt(fd === 'trough' ? 'trough' : 'tank', p, RF2.range(0, PI)); farm.feed.push(Tk); muds.push({ x: p[0], y: p[1], R: (Tk.R || Tk.hu) + 1.6 }); } }
    } else {
      var cp = inPad(RF2, 2); if (!cp) cp = T(WM / 2, HM - 3); var Co = addSt('coop', cp, RF2.pick([0, PI / 2])); farm.coop = Co; farm.feed.push(Co);
    }
    var ac = RF2.weighted([['silo', 36], ['wtower', 18], ['bales', 30], ['none', 16]]);
    if (ac === 'silo') siloWant = { two: RF2.chance(0.3) };
    else if (ac === 'wtower') placeSt('wtower', RF2, 3, Math.min(T(0, 2.5)[1], T(0, ffy(WM / 2) - 3)[1]), WM - 3, Math.max(T(0, 2.5)[1], T(0, ffy(WM / 2) - 3)[1]), 2.6, RF2.range(0, PI / 2));
    else if (ac === 'bales') { var nb = RF2.int(2, 4), bx = RF2.range(1.5, WM - 1.5 - nb * 1.25), by = RF2.chance(0.5) ? ffy(bx) - RF2.range(1.5, 3) : ffy(bx) + RF2.range(1.5, 2.5), wr = RF2.chance(0.3), bang = vAng0(bx, by);
      for (var k = 0; k < nb; k++) { var pp = T(bx + k * 1.28, by); if (stFree(pp, 0.6)) addSt('lbale', pp, bang, { wrap: wr }); } }
    if (RW.chance(0.5)) { var bx2 = RW.range(2, WM - 2), pp2 = T(bx2, ffy(bx2) - RW.range(2, 4)); if (stFree(pp2, 1)) addSt('bale', pp2, 0); }
    if (RW.chance(0.4)) addLamp(T(clamp(gx + RW.pick([-1, 1]) * RW.range(3, 5), 1, WM - 1), ffy(gx) - RW.range(1, 2.5)));
    if (RW.chance(0.45)) { var tx2 = RW.chance(0.5) ? RW.range(1, 3) : WM - RW.range(1, 3), tpp = T(tx2, RW.range(1.5, ffy(tx2) - 2)); if (stFree(tpp, 2)) addTree(tpp, RW.range(2.4, 3.6), false, RW.chance(0.5) ? 'spruce' : null); }
    sunPref = null;

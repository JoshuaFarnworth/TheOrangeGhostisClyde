  } else if (place === 'The Street Corner') {
    // two plowed streets meet; we stand over the corner of the block: a stop sign, its name blades, maybe a hydrant
    var cy0 = HM - RW.range(6, 7.5), cx0 = WM - RW.range(5.5, 7.5);
    addRoad(-1, cy0, WM + 1, HM + 1, 'h'); addRoad(cx0, -1, WM + 1, HM + 1, 'v');
    var sw = 1.8, sy = cy0 - 0.9 - sw / 2, sx = cx0 - 0.9 - sw / 2;
    addPath([T(-1, sy), T(sx, sy)], sw); addPath([T(sx, -1), T(sx, sy)], sw);
    ent(T(0.3, sy), pw(2)); ent(T(sx, 0.3), pw(2));
    ent(T(sx, HM - 0.3), pw(0.8), 'cross'); ent(T(WM - 0.3, sy), pw(0.8), 'cross');
    if (RW.chance(0.5)) { var fx0 = RW.range(0.25, 0.7) * sx; addPath([T(fx0, -1), T(fx0, sy)], 1.1); ent(T(fx0, 0.3), pw(0.8), 'door'); }
    addSign(T(cx0 - 0.45, cy0 - 0.45), 'stop');
    if (RW.chance(0.6)) addHydrant(T(RW.range(2, sx - 2.5), cy0 - 0.5));
    if (RW.chance(0.6)) addLamp(T(RW.range(3, sx - 3), cy0 - 0.65));
    cornerPile = T(cx0 - 0.25, cy0 - 0.25);
    var tp = []; for (var k = 0; k < 60 && tp.length < RW.int(0, 1); k++) { var p = [RW.range(2.5, sx - 3), RW.range(2.5, sy - 3.5)]; tp.push(p); }
    tp.forEach(function (p) { addTree(T(p[0], p[1]), RW.range(2.6, 4)); });
    // cars took the corner: ruts swing round it
    laneRuts(cy0, HM + 1, 'h', -1, cx0); laneRuts(cx0, WM + 1, 'v', -1, cy0);
  } else if (place === 'The Frontage') {
    // the fronts of two or three houses we never see; their property lines run down to the pavement
    var cy0 = HM - RW.range(3, 5), sy = cy0 - RW.range(1.4, 2.2) - 0.75;
    addRoad(-1, cy0, WM + 1, HM + 1, 'h'); addPath([T(-1, sy), T(WM + 1, sy)], 1.5);
    ent(T(0.3, sy), pw(2)); ent(T(WM - 0.3, sy), pw(2));
    var xs = RW.chance(0.55) ? [RW.range(0.38, 0.62) * WM] : [RW.range(0.22, 0.36) * WM, RW.range(0.64, 0.78) * WM];
    var fk0 = RW.pick(['picket', 'chain', 'rail']);
    xs.forEach(function (x, j) { addPFence(T(x, -1), T(x + RW.range(-0.3, 0.3), sy - RW.range(1.4, 2.4)), j === 0 ? fk0 : RW.pick(['picket', 'chain', 'rail'])); });
    var bnd = [-1].concat(xs, [WM + 1]); buildingH = RW.range(5, 6.5);
    var lotDrive = RW.chance(0.6) ? RW.int(0, bnd.length - 2) : -1, mbx = [];
    for (var j = 0; j < bnd.length - 1; j++) {
      var l0 = bnd[j], l1 = bnd[j + 1], wl = l1 - l0, hx0 = l0 + RW.range(1, 2.5), hx1 = l1 - RW.range(1, 2.5);
      if (hx1 - hx0 > 3) { var b = rectT(hx0, -12, hx1, -RW.range(0.05, 1.5)); objs.push({ t: 'building', b: b, h: buildingH }); block(box((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, (b[2] - b[0]) / 2, (b[3] - b[1]) / 2, 0)); }
      if (j === lotDrive) {
        var dvx = clamp(lerp(l0, l1, RW.chance(0.5) ? 0.25 : 0.75), l0 + 1.8, l1 - 1.8); addPath([T(dvx, -1), T(dvx, cy0)], 2.8); drive = { x: dvx };
        if (RW.chance(0.35)) addCar(T(dvx, RW.range(2.8, 5)), flipY ? -PI / 2 : PI / 2);
        else if (RW.chance(0.6)) driveRuts(dvx, cy0);   // someone has already left for work
        mbx.push(dvx + 1.8 * RW.pick([-1, 1]));
      } else if (wl > 4) { var dx = lerp(l0, l1, RW.range(0.35, 0.65)); addPath([T(dx, -1), T(dx, sy)], 1.1); ent(T(dx, 0.35), pw(1), 'door'); mbx.push(dx + 0.9); }
    }
    if (lotDrive >= 0) ent(T(drive.x, 0.35), pw(0.8), 'door');
    var nmb = RW.chance(0.75) ? RW.int(1, Math.min(2, mbx.length)) : 0;
    RW.shuffle(mbx).slice(0, nmb).forEach(function (x) { addMailbox(T(clamp(x, 1, WM - 1), cy0 - 0.4)); });
    var tp = []; for (var k = 0; k < 60 && tp.length < RW.int(0, 2); k++) { var p = [RW.range(2, WM - 2), RW.range(2.5, sy - 3)]; if (farFrom(p, tp, 6) && !xs.some(function (x) { return Math.abs(x - p[0]) < 1.5; }) && !onPath(T(p[0], p[1]), 1.5)) tp.push(p); }
    tp.forEach(function (p) { addTree(T(p[0], p[1]), RW.range(2.4, 4)); });
    laneRuts(cy0 + 0.6, HM + 1, 'h', 1);
    sunPref = flipY ? 'fromBottom' : 'fromTop';
  } else if (place === 'The Bus Stop') {
    // a shelter with its roof loaded, a pole, a bench nobody can see from up here
    var cy0 = HM - RW.range(5, 7), sy = cy0 - 1.6;
    addRoad(-1, cy0, WM + 1, HM + 1, 'h'); addPath([T(-1, sy), T(WM + 1, sy)], 2.6);
    ent(T(0.3, sy), pw(2)); ent(T(WM - 0.3, sy), pw(2));
    var bx = RW.range(0.3, 0.7) * WM, by = sy - 2.2, face = flipY ? -PI / 2 : PI / 2;
    addShelter(T(bx, by), face); addBench(T(bx, by - 0.2), face); benches[benches.length - 1].dry = true;
    var sgx = bx + RW.pick([-1, 1]) * RW.range(2.6, 3.6); addSign(T(sgx, cy0 - 0.45), 'bus');
    busStop = { wait: T(bx, by + 0.75), pole: T(sgx, cy0 - 0.7), curb: T(sgx, cy0 - 0.25), face: face };
    if (RW.chance(0.4)) addBin(T(bx + (sgx > bx ? -2.4 : 2.4), sy - 1.1));
    if (RW.chance(0.5)) addLamp(T(clamp(bx + RW.pick([-1, 1]) * RW.range(5, 8), 2, WM - 2), cy0 - 0.65));
    var px = RW.range(0.2, 0.8) * WM, px2 = RW.range(0.25, 0.75) * WM; addPath([T(px, -1), T(px2, sy)], 1.8); ent(T(px, 0.3), pw(1.5));
    if (RW.chance(0.5)) ent(T(RW.range(0.2, 0.8) * WM, HM - 0.3), pw(0.6), 'cross');
    var tp = []; for (var k = 0; k < 80 && tp.length < RW.int(0, 2); k++) { var p = [RW.range(2, WM - 2), RW.range(2, by - 3)]; if (farFrom(p, tp, 6) && !onPath(T(p[0], p[1]), 2)) tp.push(p); }
    tp.forEach(function (p) { addTree(T(p[0], p[1]), RW.range(2.6, 4.4)); });
    laneRuts(cy0 + 0.3, HM + 1, 'h', 0);
  } else if (place === 'The Roadside') {
    // a parked car the plough went round; the berm is against its flank
    var cy0 = HM - RW.range(6.5, 8.5), sy = cy0 - RW.range(1.3, 2.2) - 0.75;
    addRoad(-1, cy0, WM + 1, HM + 1, 'h'); addPath([T(-1, sy), T(WM + 1, sy)], 1.5);
    ent(T(0.3, sy), pw(2)); ent(T(WM - 0.3, sy), pw(2));
    var ccx = RW.range(4.5, WM - 4.5); addCar(T(ccx, cy0 + 1.2), (flipX ? PI : 0) + (RW.chance(0.5) ? 0 : PI) + RW.gaussian(0, 0.03));
    if (RW.chance(0.35)) addHydrant(T(clamp(ccx + RW.pick([-1, 1]) * RW.range(3.5, 6), 1.5, WM - 1.5), cy0 - 0.5));
    else if (RW.chance(0.4)) addSign(T(clamp(ccx + RW.pick([-1, 1]) * RW.range(3, 6), 1.5, WM - 1.5), cy0 - 0.5), RW.chance(0.5) ? 'name' : 'speed');
    if (RW.chance(0.4)) { var dvx = RW.range(0.2, 0.8) * WM; if (Math.abs(dvx - ccx) < 4) dvx = ccx + (dvx < ccx ? -4.5 : 4.5); dvx = clamp(dvx, 2, WM - 2); addPath([T(dvx, -1), T(dvx, cy0)], 2.8); ent(T(dvx, 0.35), pw(1), 'door'); drive = { x: dvx }; if (RW.chance(0.5)) driveRuts(dvx, cy0); }
    else if (RW.chance(0.5)) { var ry = RW.range(3, sy - 4); addPFence(T(-1, ry), T(WM + 1, ry + RW.range(-0.8, 0.8)), 'rail'); var gx2 = RW.range(0.25, 0.75) * WM; }
    var px = RW.range(0.2, 0.8) * WM; ent(T(px, 0.3), pw(1));
    if (RW.chance(0.4)) ent(T(RW.range(0.2, 0.8) * WM, HM - 0.3), pw(0.5), 'cross');
    var tp = []; for (var k = 0; k < 80 && tp.length < RW.int(0, 2); k++) { var p = [RW.range(2, WM - 2), RW.range(2, sy - 3)]; if (farFrom(p, tp, 6) && !onPath(T(p[0], p[1]), 2)) tp.push(p); }
    tp.forEach(function (p) { addTree(T(p[0], p[1]), RW.range(2.6, 4.4)); });
    laneRuts(cy0 + 2.4, HM + 1, 'h', 0, -99, cars[0]);

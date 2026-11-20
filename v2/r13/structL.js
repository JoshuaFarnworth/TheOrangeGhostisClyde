  // ======================= round 13: structures. Most made things are boxes; a few round ones are accents =======================
  // every structure is a real solid (or a floating roof/mat/top on legs); its shadow comes from that geometry, not from a decal
  var structs = [], beasts = [], hayBits = [], muds = [], siloWant = null;
  function addSt(k, p, a, opt) {
    var o = { t: 'st', k: k, x: p[0], y: p[1], a: a || 0, c: Math.cos(a || 0), s: Math.sin(a || 0), R2: RW.fork('st' + objs.length) }, Rs = o.R2;
    if (opt) for (var q in opt) o[q] = opt[q];
    var ROOF = [[0.2, 0.2, 0.21], [0.23, 0.17, 0.13], [0.09, 0.22, 0.14], [0.4, 0.08, 0.06], [0.44, 0.46, 0.47]];
    if (k === 'shed' || k === 'garage' || k === 'coop') {   // a gable along the long side; overhang; ridge cap
      var dims = { shed: [1.1, 1.6, 2.0, 2.0, 2.4], garage: [2.9, 3.4, 3.0, 3.4, 2.5], coop: [0.75, 1.15, 0.6, 0.85, 1.4] }[k];
      o.hu = o.hu || Rs.range(dims[1] * 0.85, dims[1]); o.hv = o.hv || Rs.range(dims[0] * 0.85, dims[0]); o.z0 = dims[4] * Rs.range(0.92, 1.05); o.zr = o.z0 + o.hv * Rs.range(0.42, 0.62);
      o.oh = k === 'coop' ? 0.1 : 0.18; o.mi = Rs.int(0, 4); o.roof = ROOF[o.mi]; o.metal = o.mi >= 2; o.fl = false;
      if (k === 'garage' && Rs.chance(0.25)) { o.flat = true; o.zr = o.z0 + 0.12; }
    } else if (k === 'planter' || k === 'sandbox') {
      o.hu = o.hu || (k === 'sandbox' ? Rs.range(0.9, 1.3) : Rs.range(1.1, 1.8)); o.hv = o.hv || (k === 'sandbox' ? o.hu * Rs.range(0.8, 1) : Rs.range(0.45, 0.62)); o.hb = k === 'sandbox' ? 0.28 : Rs.range(0.28, 0.55); o.fw = k === 'sandbox' ? 0.1 : 0.05;
      o.col = Rs.pick([[0.3, 0.2, 0.12], [0.2, 0.15, 0.1], [0.36, 0.3, 0.24]]); o.stalks = k === 'planter' && Rs.chance(0.5);
    } else if (k === 'wall') { o.hu = o.hu || Rs.range(2.5, 5); o.hv = 0.15; o.hb = Rs.range(0.45, 0.85); o.col = Rs.pick([[0.42, 0.41, 0.39], [0.35, 0.3, 0.27]]); }
    else if (k === 'steps') { o.n = o.n || Rs.int(2, 4); o.hu = o.hu || Rs.range(0.55, 0.9); o.td = 0.28; o.rise = o.rise || 0.18; o.hv = o.n * o.td / 2; o.col = o.col || [0.42, 0.41, 0.39]; }
    else if (k === 'deck') { o.hu = o.hu || Rs.range(1.8, 3); o.hv = o.hv || Rs.range(1.3, 2); o.zd = o.zd || Rs.range(0.45, 0.75); o.col = Rs.pick([[0.32, 0.24, 0.16], [0.4, 0.36, 0.31], [0.26, 0.2, 0.15]]); }
    else if (k === 'dumpster') { o.hu = 0.95; o.hv = 0.62; o.col = Rs.pick([[0.06, 0.2, 0.1], [0.07, 0.12, 0.28], [0.3, 0.12, 0.05], [0.25, 0.26, 0.27]]); }
    else if (k === 'ac') { o.hu = o.hv = Rs.range(0.36, 0.45); o.col = Rs.chance(0.7) ? [0.52, 0.53, 0.5] : [0.3, 0.32, 0.3]; }
    else if (k === 'hottub') { o.hu = o.hv = Rs.range(0.98, 1.12); o.col = Rs.pick([[0.2, 0.19, 0.18], [0.28, 0.22, 0.16], [0.16, 0.18, 0.22]]); }
    else if (k === 'stop') { o.hu = 0.9; o.hv = 0.08; o.col = Rs.chance(0.3) ? [0.62, 0.5, 0.08] : [0.45, 0.44, 0.41]; }
    else if (k === 'picnic') { o.hu = Rs.range(0.85, 1.0); o.hv = 0.76; o.fl = true; o.col = Rs.pick([[0.32, 0.22, 0.13], [0.4, 0.33, 0.24], [0.13, 0.25, 0.14]]); }
    else if (k === 'rpicnic') { o.R = 0.62; o.hu = o.hv = 1.1; o.fl = true; o.col = Rs.pick([[0.32, 0.22, 0.13], [0.15, 0.3, 0.2], [0.55, 0.55, 0.52]]); }
    else if (k === 'pool') { o.R = o.R || Rs.range(2.3, 3.4); o.hu = o.hv = o.R + 0.1; o.zw = Rs.range(1.2, 1.35); o.sag = Rs.range(0.25, 0.45); o.pool = Rs.range(0.28, 0.5); o.cov = Rs.pick([[0.1, 0.22, 0.38], [0.06, 0.07, 0.07], [0.1, 0.2, 0.12]]); o.rail = Rs.pick([[0.75, 0.75, 0.72], [0.45, 0.46, 0.47], [0.2, 0.3, 0.45]]); }
    else if (k === 'tramp') { o.R = Rs.range(1.75, 2.15); o.hu = o.hv = o.R + 0.15; o.zm = 0.9; o.net = Rs.chance(0.55); o.np = Rs.pick([6, 8]); o.fl = true; o.pad = Rs.pick([[0.08, 0.2, 0.42], [0.1, 0.3, 0.12], [0.05, 0.05, 0.06], [0.45, 0.1, 0.08]]); }
    else if (k === 'gazebo') { o.R = Rs.range(1.8, 2.3); o.hu = o.hv = o.R + 0.4; o.ze = Rs.range(2.3, 2.6); o.zp = o.ze + o.R * Rs.range(0.5, 0.7); o.fl = true; o.roof = Rs.pick([[0.18, 0.17, 0.17], [0.34, 0.22, 0.13], [0.1, 0.2, 0.14], [0.42, 0.42, 0.42]]); o.wood = Rs.pick([[0.62, 0.6, 0.55], [0.34, 0.24, 0.16]]); }
    else if (k === 'bale') { o.R = Rs.range(0.7, 0.8); o.hu = o.hv = o.R; o.zb = Rs.range(1.1, 1.3); o.wrap = Rs.chance(0.25); }
    else if (k === 'lbale') { o.R = Rs.range(0.68, 0.78); o.hu = Rs.range(0.58, 0.65); o.hv = o.R; o.wrap = opt && opt.wrap != null ? opt.wrap : Rs.chance(0.3); }
    else if (k === 'feeder') { o.R = Rs.range(1.15, 1.3); o.hu = o.hv = o.R + 0.05; o.col = Rs.chance(0.6) ? [0.44, 0.46, 0.47] : Rs.pick([[0.45, 0.07, 0.05], [0.12, 0.25, 0.12]]); o.left = Rs.range(0.35, 0.9); }
    else if (k === 'tank') { o.R = Rs.range(0.8, 1.2); o.hu = o.hv = o.R + 0.04; o.zt = 0.6; o.hole = Rs.chance(0.7); }
    else if (k === 'trough') { o.hu = Rs.range(1.1, 1.5); o.hv = Rs.range(0.32, 0.4); o.zt = 0.55; o.hole = Rs.chance(0.7); }
    else if (k === 'wtower') { o.Rt = Rs.range(1.2, 1.7); o.zb = Rs.range(5.5, 7.5); o.zt = o.zb + Rs.range(2.2, 3); o.rc = o.Rt * Rs.range(0.45, 0.6); o.hu = o.hv = o.Rt * 1.35 + 0.7; o.fl = true; o.col = Rs.pick([[0.5, 0.52, 0.53], [0.66, 0.66, 0.64], [0.42, 0.14, 0.1]]); }
    o.ext = Math.max(o.hu || 0, o.hv || 0) * 1.45 + 0.2;
    objs.push(o); structs.push(o);
    if (k !== 'stop') block(o.R && !/lbale/.test(k) ? circle(o.x, o.y, (k === 'wtower' ? o.Rt * 1.3 : (o.R + (k === 'gazebo' ? 0.1 : 0.05)))) : box(o.x, o.y, o.hu + 0.05, o.hv + 0.05, o.a));
    else block(box(o.x, o.y, o.hu, o.hv, o.a));
    return o;
  }
  function stFree(p, r) {   // is this footprint clear of other blocks, paths and the frame edge?
    if (p[0] < r * 0.6 || p[1] < r * 0.6 || p[0] > WM - r * 0.6 || p[1] > HM - r * 0.6) return false;
    for (var k = 0; k < shapes.length; k++) if (sd(shapes[k], p[0], p[1]) < r) return false;
    return !onPath(p, r + 0.3);
  }
  function placeSt(k, R2, x0, y0, x1, y1, r, a, opt) { for (var t = 0; t < 60; t++) { var p = [R2.range(x0, x1), R2.range(y0, y1)]; if (stFree(p, r)) return addSt(k, p, a == null ? R2.pick([0, PI / 2]) + R2.gaussian(0, 0.04) : a, opt); } return null; }
  // }STRUCT-L

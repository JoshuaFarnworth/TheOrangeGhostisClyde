  // ---- round 12: trees grown in 3D (trunk, clear bole, scaffold limbs, recursive sub-branching, tropisms, a crown envelope) ----
  // segs: [x1, y1, x2, y2, d1, z1, z2, d2, kind]  kind 0 wood, 1 needle spray (conifer foliage)
  function growTree(RT, bx, by, sp, S) {
    var segs = [], P = TREE_SP[sp], H = P.H[0] + (P.H[1] - P.H[0]) * S, H0 = RT.range(P.H0[0], P.H0[1]) * (sp === 'young' ? 1 : 0.8 + 0.4 * S), Rc = H * RT.range(P.R[0], P.R[1]);
    var lean = [RT.gaussian(0, P.lean), RT.gaussian(0, P.lean)], budget = P.budget, lim = budget, twigW = 0.0035;
    function inEnv(x, y, z) {   // crown envelope relative to the base
      var r = Math.hypot(x, y), zn = (z - H0) / (H - H0);
      if (z > H + 0.1) return false;
      if (P.env === 'ellipsoid') { var zc = H0 + (H - H0) * P.zc, rz = Math.max(H - zc, zc - H0 * 0.85) * 1.02; return (r * r) / (Rc * Rc) + ((z - zc) * (z - zc)) / (rz * rz) <= 1; }
      if (P.env === 'vase') { if (zn < -0.05) return r < 0.6; var rr = Rc * Math.pow(Math.max(0, zn), 0.55) * (zn > 0.82 ? Math.sqrt(Math.max(0, 1 - (zn - 0.82) / 0.2)) : 1); return r <= rr * 1.08 + 0.5; }
      if (P.env === 'cone') { var zb = H0 * 0.5; if (z < zb) return r < 0.4; return r <= Rc * Math.pow(Math.max(0, (H - z) / (H - zb)), 0.95) + 0.05; }
      return true;
    }
    function reach(x, y, z, dx, dy, dz) { for (var s = 0.15; s < 25; s += 0.15) if (!inEnv(x + dx * s - bx, y + dy * s - by, z + dz * s)) return s; return 25; }
    function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
    function rotOff(d, th, ph) {   // a direction at angle th from d, at azimuth ph around it
      var a = Math.abs(d[2]) < 0.95 ? norm([d[1], -d[0], 0]) : [1, 0, 0], b = [d[1] * a[2] - d[2] * a[1], d[2] * a[0] - d[0] * a[2], d[0] * a[1] - d[1] * a[0]];
      var c = Math.cos(th), s = Math.sin(th), cp = Math.cos(ph), sp2 = Math.sin(ph);
      return norm([d[0] * c + (a[0] * cp + b[0] * sp2) * s, d[1] * c + (a[1] * cp + b[1] * sp2) * s, d[2] * c + (a[2] * cp + b[2] * sp2) * s]);
    }
    // one axis: walks in short segments, bending with tropism and wobble, sprouting children along it
    function axis(x, y, z, d, L, d0, d1, depth, opt) {
      if (segs.length > lim) return;
      var n = Math.max(2, Math.ceil(L / (depth < 2 ? 0.3 : 0.16))), sl = L / n, ph = RT.range(0, 6.283), nextC = L * RT.range(P.c0[depth] || 0.2, (P.c0[depth] || 0.2) + 0.15), trav = 0;
      var trop = opt && opt.trop !== undefined ? opt.trop : P.trop[Math.min(depth, P.trop.length - 1)], wob = P.wob[Math.min(depth, P.wob.length - 1)];
      for (var k = 0; k < n; k++) {
        var t = (k + 1) / n, dd = lerp(d0, d1, t), dpre = lerp(d0, d1, k / n);
        // gravitropism (+ up / - droop, stronger toward the tip for drooping twigs), phototropism (outward, away from the crown's centre)
        var ox = x - bx, oy = y - by, orr = Math.hypot(ox, oy) || 1, tz = trop * (trop < 0 ? 0.4 + t : 1);
        d = norm([d[0] + RT.gaussian(0, wob) + ox / orr * P.photo, d[1] + RT.gaussian(0, wob) + oy / orr * P.photo, d[2] + RT.gaussian(0, wob * 0.6) + tz]);
        if (opt && opt.minZ !== undefined && d[2] < opt.minZ) d = norm([d[0], d[1], opt.minZ]);
        var nx = x + d[0] * sl, ny = y + d[1] * sl, nz = Math.max(0.05, z + d[2] * sl);
        segs.push([x, y, nx, ny, dpre, z, nz, dd, 0]);
        if (opt && opt.needles) needleSpray(x, y, z, nx, ny, nz, d, (1 - t) * opt.needles + 0.25 * opt.needles, depth);
        x = nx; y = ny; z = nz; trav += sl;
        // children
        while (depth < P.depth && trav >= nextC && trav < L * 0.985) {
          ph += P.phyl; var th = RT.range(P.ang[depth][0], P.ang[depth][1]) * PI / 180;
          var cd = rotOff(d, th, ph), prof = P.prof(trav / L), cl = L * RT.range(P.ratio[0], P.ratio[1]) * prof;
          var rmax = reach(x, y, z, cd[0], cd[1], cd[2]); cl = Math.min(cl, rmax * 0.95);
          var cdia = Math.max(twigW, dd * RT.range(0.45, 0.72));
          if (cl > 0.07 && cdia >= twigW * 0.99) axis(x, y, z, cd, cl, cdia, Math.max(twigW * 0.8, cdia * 0.25), depth + 1, opt && opt.needles ? { needles: opt.needles * 0.6, trop: opt.ctrop } : null);
          nextC += L * RT.range(P.sp[0], P.sp[1]) * (1 + depth * 0.15);
        }
      }
      // fine terminal twigs (sub-pixel at most resolutions; they make the shadow's lacework)
      if (depth >= P.depth - 1 && !(opt && opt.needles)) for (var q = 0; q < P.twigs; q++) {
        var td = rotOff(d, RT.range(0.4, 0.9), RT.range(0, 6.283)), tl = RT.range(0.08, 0.22);
        if (P.trop[P.trop.length - 1] < -0.05) td = norm([td[0], td[1], td[2] - 0.8]);
        segs.push([x, y, x + td[0] * tl, y + td[1] * tl, twigW * 0.8, z, z + td[2] * tl, twigW * 0.5, 0]);
      }
    }
    // conifer foliage: needle-covered branchlets fanning to both sides of a limb, roughly level (the shelf that holds snow)
    function needleSpray(x1, y1, z1, x2, y2, z2, d, w, depth) {
      var lx = -d[1], ly = d[0], l = Math.hypot(lx, ly) || 1; lx /= l; ly /= l;
      if (depth >= 1) { segs.push([x1, y1, x2, y2, w * 0.5, z1, z2, w * 0.5, 1]); return; }
      [-1, 1].forEach(function (s) { var bl = w * RT.range(0.8, 1.2), ex = x2 + lx * s * bl + d[0] * bl * 0.6, ey = y2 + ly * s * bl + d[1] * bl * 0.6, ez = z2 - bl * 0.12 * RT.range(0.5, 1.5);
        segs.push([x2, y2, ex, ey, 0.09, z2, ez, 0.05, 1]); });
      segs.push([x1, y1, x2, y2, 0.11, z1, z2, 0.11, 1]);
    }
    var trunkD = P.trunk * H, up = norm([lean[0], lean[1], 1]), out = { segs: segs, h: H, R: Rc, H0: H0, trunkD: trunkD, sp: sp, x: bx, y: by };
    if (P.form === 'decurrent') {
      // the bole rises clear to the first scaffold, then the stem divides into 3-6 limbs at 30-60 degrees from vertical
      var tz = H0, tx = bx + up[0] * H0, ty = by + up[1] * H0; segs.push([bx, by, tx, ty, trunkD, 0, tz, trunkD * 0.85, 0]);
      var ns = RT.int(P.scaff[0], P.scaff[1]), a0 = RT.range(0, 6.283), dS = trunkD * 0.85 / Math.sqrt(ns) * 1.15;
      for (var s = 0; s < ns; s++) {
        var az = a0 + s * 6.283 / ns + RT.gaussian(0, 0.25), th = RT.range(P.sAng[0], P.sAng[1]) * PI / 180, zs = tz + RT.range(0, P.sStag) * (H - H0);
        var sx = bx + up[0] * zs, sy = by + up[1] * zs; if (zs > tz) segs.push([tx, ty, sx, sy, trunkD * 0.8, tz, zs, trunkD * 0.72, 0]);
        var dir = norm([Math.sin(th) * Math.cos(az), Math.sin(th) * Math.sin(az), Math.cos(th)]), L = Math.min(reach(sx, sy, zs, dir[0], dir[1], dir[2]) * RT.range(1.0, 1.25), H * 0.9);
        lim = segs.length + budget / (ns + (P.leaderToo ? 1 : 0)); axis(sx, sy, zs, dir, L, dS, dS * 0.18, 0);
      }
      lim = segs.length + budget / (ns + 1); if (P.leaderToo) axis(tx, ty, tz, up, (H - tz) * 0.95, dS, dS * 0.15, 0);
    } else {
      // excurrent: one leader to the top, laterals (or whorls) along it, longest low down
      var nStem = sp === 'birch' && RT.chance(0.3) ? RT.int(2, 3) : 1, a0 = RT.range(0, 6.283);
      for (var m = 0; m < nStem; m++) {
        var ld = nStem > 1 ? norm([up[0] + Math.cos(m * 2.4 + a0) * 0.18, up[1] + Math.sin(m * 2.4 + a0) * 0.18, 1]) : up, Hm = H * (m ? RT.range(0.8, 0.95) : 1), dT = trunkD / Math.sqrt(nStem);
        var x = bx, y = by, z = 0, n = Math.ceil(Hm / 0.25), ph = RT.range(0, 6.283), nextW = H0;
        for (var k = 0; k < n; k++) {
          var t = (k + 1) / n, nx = x + ld[0] * Hm / n + RT.gaussian(0, 0.01), ny = y + ld[1] * Hm / n + RT.gaussian(0, 0.01), nz = z + ld[2] * Hm / n;
          segs.push([x, y, nx, ny, dT * (1 - (k / n) * 0.92), z, nz, dT * (1 - t * 0.92), 0]); x = nx; y = ny; z = nz;
          while (z >= nextW && z < Hm - 0.25) {
            var nw = P.whorl ? RT.int(P.whorl[0], P.whorl[1]) : 1;
            for (var w = 0; w < nw; w++) {
              ph += P.whorl ? 6.283 / nw + RT.gaussian(0, 0.2) : P.phyl;
              var zr = (z - H0) / (Hm - H0), th = lerp(P.sAng[1], P.sAng[0], zr) * PI / 180, dir = norm([Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]);
              var L = Math.max(0.2, reach(x, y, z, dir[0], dir[1], dir[2]) * RT.range(0.85, 1.05)), dB = Math.max(twigW, dT * (1 - t * 0.9) * RT.range(0.35, 0.55));
              lim = segs.length + (budget - segs.length) / Math.max(1, (Hm - z) / ((P.wSp[0] + P.wSp[1]) / 2) * nw * (nStem - m)); axis(x, y, z, dir, L, dB, twigW, 1, P.needle ? { needles: P.needle * (0.7 + 0.5 * (1 - zr)), trop: -0.03, ctrop: -0.02, minZ: -0.45 } : null);
            }
            nextW += RT.range(P.wSp[0], P.wSp[1]);
          }
        }
        if (P.needle) segs.push([x, y, x, y, 0.08, z - 0.4, z + 0.1, 0.02, 1]);
      }
    }
    return out;
  }
  var TREE_SP = {
    // H: height range across the size draw; H0: clear bole; R: crown radius / H; trop: gravitropism per order (+up, -droop); wob: bend noise
    maple: { form: 'decurrent', env: 'ellipsoid', zc: 0.5, H: [7.5, 12], H0: [1.9, 2.8], R: [0.36, 0.46], scaff: [4, 6], sAng: [32, 58], sStag: 0.12, trunk: 0.042, lean: 0.03,
      depth: 4, ang: [[30, 50], [30, 55], [35, 60], [35, 60]], ratio: [0.45, 0.7], sp: [0.12, 0.22], c0: [0.18, 0.12, 0.1, 0.1], phyl: 2.4, trop: [0.035, 0.02, 0.01, 0.0], wob: [0.05, 0.08, 0.12, 0.15], photo: 0.025,
      prof: function (t) { return 0.55 + 0.6 * Math.sin(Math.min(1, t * 1.15) * PI) ; }, twigs: 3, budget: 9000, leaderToo: true },
    oak: { form: 'decurrent', env: 'ellipsoid', zc: 0.45, H: [7.5, 11.5], H0: [1.8, 2.6], R: [0.45, 0.58], scaff: [3, 5], sAng: [40, 62], sStag: 0.15, trunk: 0.06, lean: 0.04,
      depth: 4, ang: [[35, 70], [35, 70], [40, 70], [40, 70]], ratio: [0.45, 0.7], sp: [0.11, 0.2], c0: [0.15, 0.1, 0.1, 0.1], phyl: 2.0, trop: [0.0, -0.01, 0.0, 0.0], wob: [0.12, 0.17, 0.2, 0.22], photo: 0.03,
      prof: function (t) { return 0.6 + 0.5 * Math.sin(Math.min(1, t * 1.1) * PI); }, twigs: 3, budget: 9000 },
    elm: { form: 'decurrent', env: 'vase', H: [10, 14], H0: [2.4, 3.6], R: [0.4, 0.5], scaff: [3, 5], sAng: [18, 34], sStag: 0.1, trunk: 0.045, lean: 0.03,
      depth: 4, ang: [[20, 38], [28, 48], [35, 55], [35, 60]], ratio: [0.5, 0.78], sp: [0.07, 0.13], c0: [0.22, 0.12, 0.1, 0.1], phyl: 2.4, trop: [0.03, 0.0, -0.04, -0.12], wob: [0.04, 0.07, 0.1, 0.12], photo: 0.04,
      prof: function (t) { return 0.35 + 0.75 * t; }, twigs: 3, budget: 9000 },
    birch: { form: 'excurrent', env: 'ellipsoid', zc: 0.5, H: [7.5, 11], H0: [1.4, 2.4], R: [0.18, 0.25], sAng: [40, 65], wSp: [0.22, 0.4], trunk: 0.022, lean: 0.06,
      depth: 3, ang: [[25, 45], [30, 50], [30, 50]], ratio: [0.45, 0.7], sp: [0.12, 0.2], c0: [0.12, 0.1, 0.1], phyl: 2.4, trop: [0.04, 0.0, -0.18], wob: [0.06, 0.1, 0.12], photo: 0.0,
      prof: function (t) { return 0.7 + 0.3 * Math.sin(t * PI); }, twigs: 4, budget: 7000 },
    spruce: { form: 'excurrent', env: 'cone', H: [6.5, 12], H0: [0.4, 0.9], R: [0.24, 0.3], sAng: [72, 102], wSp: [0.32, 0.45], whorl: [4, 6], trunk: 0.032, lean: 0.01, needle: 0.42,
      depth: 2, ang: [[55, 75], [50, 70]], ratio: [0.3, 0.45], sp: [0.12, 0.18], c0: [0.12, 0.12], phyl: 2.4, trop: [0.0, -0.03, -0.02], wob: [0.02, 0.04, 0.05], photo: 0.0,
      prof: function (t) { return 1 - 0.6 * t; }, twigs: 0, budget: 14000 },
    young: { form: 'decurrent', env: 'ellipsoid', zc: 0.55, H: [3.6, 5.4], H0: [1.7, 2.1], R: [0.22, 0.3], scaff: [3, 4], sAng: [28, 45], sStag: 0.2, trunk: 0.022, lean: 0.015,
      depth: 3, ang: [[30, 50], [30, 55], [35, 55]], ratio: [0.45, 0.65], sp: [0.15, 0.25], c0: [0.2, 0.15, 0.12], phyl: 2.4, trop: [0.04, 0.02, 0.01], wob: [0.04, 0.07, 0.1], photo: 0.02,
      prof: function (t) { return 0.6 + 0.4 * Math.sin(t * PI); }, twigs: 2, budget: 2500, leaderToo: true }
  };

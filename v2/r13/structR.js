  // STRUCT-R{  plan view of each structure: [height, r, g, b, how well snow sits (0-1), distance in from the nearest edge]
  function rbx(u, v, hu, hv, r) { var qx = Math.abs(u) - hu + r, qy = Math.abs(v) - hv + r; return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r; }
  function shd3(c, k) { return [c[0] * k, c[1] * k, c[2] * k]; }
  var HAY = [0.5, 0.41, 0.24], HAYD = [0.33, 0.28, 0.19], GALV2 = [0.44, 0.46, 0.47];
  function stTop(o, u, v, x, y) {
    var k = o.k, r, d, c;
    if (k === 'shed' || k === 'garage' || k === 'coop') {
      var HU = o.hu + o.oh, HV = o.hv + o.oh; d = rbx(u, v, HU, HV, 0.02); if (d > 0) return null;
      var t = Math.abs(v) / HV, h = o.zr - (o.zr - o.z0) * t - 0.03 * sstep(0.95, 1, t), sl = (o.zr - o.z0) / HV;
      if (o.flat) { h = o.z0 + 0.12; sl = 0; }
      c = o.roof; var tex = o.metal ? (0.9 + 0.1 * (Math.abs(((u / 0.23) % 1 + 1) % 1 - 0.5) < 0.06 ? 1.15 : 1)) : 0.88 + 0.12 * (((Math.abs(v) / 0.13) % 1) < 0.15 ? 0.7 : 1) * (0.85 + 0.15 * NZ.n2(x * 9, y * 9));
      var ridge = !o.flat && Math.abs(v) < 0.07, hold = o.metal ? clamp(1.05 - sl, 0.25, 0.8) : clamp(1.45 - sl, 0.35, 1);
      if (ridge) return [h + 0.02, c[0] * 0.75, c[1] * 0.75, c[2] * 0.75, hold * 0.35, 0.02];
      var e = Math.min(-d, o.flat ? 1 : Math.abs(v) - 0.07);
      if (k === 'coop' && u > o.hu * 0.4 && v > HV - 0.02) return null;
      return [h, c[0] * tex, c[1] * tex, c[2] * tex, hold, e];
    }
    if (k === 'planter' || k === 'sandbox') {
      d = rbx(u, v, o.hu, o.hv, 0.01); if (d > 0) return null;
      if (-d < o.fw || (k === 'sandbox' && rbx(Math.abs(u) - o.hu, Math.abs(v) - o.hv, 0.32, 0.32, 0) < 0 && Math.abs(u) + Math.abs(v) > o.hu + o.hv - 0.32)) return [o.hb, o.col[0], o.col[1], o.col[2], 0.8, Math.min(-d, 0.05) + 0.01];
      if (o.stalks && NZ.n2(x * 23, y * 23) > 0.62) return [o.hb + 0.12 + 0.2 * NZ.n2(x * 7, y * 7), 0.22, 0.18, 0.1, 0.1, 0.01];   // last year's stalks
      return [o.hb - 0.06, k === 'sandbox' ? 0.5 : 0.12, k === 'sandbox' ? 0.44 : 0.1, k === 'sandbox' ? 0.33 : 0.08, 1, -d - o.fw + 0.04];
    }
    if (k === 'wall') { d = rbx(u, v, o.hu, o.hv, 0.01); if (d > 0) return null; return [o.hb, o.col[0], o.col[1], o.col[2], 1, -d]; }
    if (k === 'steps') {
      d = rbx(u, v, o.hu, o.hv, 0.005); if (d > 0) return null;
      var j = Math.min(o.n - 1, Math.floor((v + o.hv) / o.td)), en = (v + o.hv) - j * o.td;
      return [o.rise * (j + 1), o.col[0], o.col[1], o.col[2], 1, Math.min(-d, en + 0.02, o.td - en + 0.02)];
    }
    if (k === 'deck') {
      d = rbx(u, v, o.hu, o.hv, 0.005); if (d > 0) return null;
      var bd = ((v / 0.14) % 1 + 1) % 1, seam = bd < 0.06;
      return [o.zd - (seam ? 0.01 : 0), o.col[0] * (seam ? 0.6 : 1), o.col[1] * (seam ? 0.6 : 1), o.col[2] * (seam ? 0.6 : 1), seam ? 0.7 : 1, -d];
    }
    if (k === 'dumpster') {
      d = rbx(u, v, o.hu, o.hv, 0.04);
      if (d > 0) { if (Math.abs(u) < o.hu + 0.13 && Math.abs(v) < 0.22) return [0.95, o.col[0] * 0.8, o.col[1] * 0.8, o.col[2] * 0.8, 0.8, Math.min(o.hu + 0.13 - Math.abs(u), 0.22 - Math.abs(v))]; return null; }   // fork pockets
      if (-d < 0.045) return [1.22, o.col[0], o.col[1], o.col[2], 0.6, -d];
      if (Math.abs(u) < 0.012) return [1.2, 0.02, 0.02, 0.02, 0.2, 0.01];
      var lid = 1.13 + 0.12 * (v + o.hv) / (2 * o.hv);
      return [lid, 0.035, 0.035, 0.038, 1, Math.min(-d - 0.045, Math.abs(u) - 0.012) + 0.03];
    }
    if (k === 'ac') {
      d = rbx(u, v, o.hu, o.hv, 0.03); var pad = rbx(u, v, o.hu + 0.12, o.hv + 0.12, 0.02);
      if (d > 0) { if (pad < 0) return [0.09, 0.4, 0.4, 0.38, 1, -pad]; return null; }
      r = Math.hypot(u, v); var fr = o.hu * 0.78;
      if (r < fr) { var ring = Math.abs(((r / 0.028) % 1) - 0.5) < 0.18 || Math.abs(Math.sin(Math.atan2(v, u) * 4)) < 0.06; if (r < 0.06) return [0.88, 0.1, 0.1, 0.1, 0.6, 0.03]; return ring ? [0.86, o.col[0] * 0.8, o.col[1] * 0.8, o.col[2] * 0.8, 0.35, 0.012] : [0.6, 0.03, 0.03, 0.035, 0, 0]; }
      return [0.86, o.col[0], o.col[1], o.col[2], 1, Math.min(-d, r - fr + 0.01)];
    }
    if (k === 'hottub') {
      d = rbx(u, v, o.hu, o.hv, 0.24); if (d > 0) return null;
      if (Math.abs(v) < 0.012) return [0.92, o.col[0] * 0.5, o.col[1] * 0.5, o.col[2] * 0.5, 0.45, 0.012];   // the fold
      var taper = 0.92 + 0.07 * (1 - Math.abs(v) / o.hv) - 0.03 * sstep(0.06, 0, -d);
      return [taper, o.col[0], o.col[1], o.col[2], 1, Math.min(-d, Math.abs(v) - 0.012 + 0.02)];
    }
    if (k === 'stop') { d = rbx(u, v, o.hu, o.hv, 0.03); if (d > 0) return null; return [0.12, o.col[0], o.col[1], o.col[2], 1, -d]; }
    if (k === 'picnic') {   // boards of the top with gaps; the benches either side, lower
      var top = rbx(u, v, o.hu, 0.38, 0.01), bnL = rbx(u, Math.abs(v) - 0.62, o.hu, 0.13, 0.01);
      if (top < 0) { var bw = ((v + 0.38) / 0.152) % 1; if (bw > 0.94) return [0.7, 0.02, 0.02, 0.02, 0.2, 0.005]; return [0.76, o.col[0], o.col[1], o.col[2], 1, Math.min(-top, bw * 0.152, (1 - bw) * 0.152) + 0.005]; }
      if (bnL < 0) return [0.45, o.col[0] * 0.9, o.col[1] * 0.9, o.col[2] * 0.9, 1, -bnL];
      return null;
    }
    if (k === 'rpicnic') {
      r = Math.hypot(u, v);
      if (r < o.R) return [0.75, o.col[0], o.col[1], o.col[2], 1, o.R - r];
      if (r > 0.82 && r < 1.08) { var ang = Math.atan2(v, u), seat = Math.abs(Math.sin(ang * 2)) > 0.2; if (seat) return [0.45, o.col[0] * 0.9, o.col[1] * 0.9, o.col[2] * 0.9, 1, Math.min(r - 0.82, 1.08 - r)]; }
      return null;
    }
    if (k === 'pool') {   // a winter cover sagging under the snow, a pool of meltwater and slush at its lowest point
      r = Math.hypot(u, v); var R = o.R; if (r > R + 0.09) return null;
      if (r > R - 0.11) { var post = Math.abs(((Math.atan2(v, u) * R / 1.25) % 1 + 1) % 1 - 0.5) > 0.45; return [o.zw + (post ? 0.04 : 0.02), o.rail[0], o.rail[1], o.rail[2], 0.85, Math.min(R + 0.09 - r, r - R + 0.11) + 0.01]; }
      var ri = r / (R - 0.11), sag = o.sag * Math.pow(1 - ri * ri, 1.4), h = o.zw - 0.06 - sag;
      var pr = o.pool * (1 + 0.18 * NZ.n2(x * 1.3, y * 1.3)), wet = sstep(pr + 0.06, pr - 0.04, ri);
      if (wet > 0.5) return [h - depth * 0.6, lerp(0.22, 0.12, wet), lerp(0.25, 0.15, wet), lerp(0.3, 0.2, wet), 0.1 * (1 - wet), 0.02];
      return [h, o.cov[0], o.cov[1], o.cov[2], 1, Math.min(R - 0.11 - r, (ri - pr) * R)];
    }
    if (k === 'tramp') {   // the mat sags under its load; springs in a dark ring; a padded frame; net poles
      r = Math.hypot(u, v); var R = o.R, ang = Math.atan2(v, u);
      if (o.net) { var pa = ((ang / (TAU / o.np)) % 1 + 1) % 1; if (Math.abs(pa - 0.5) * TAU / o.np * R < 0.035 && Math.abs(r - R - 0.06) < 0.035) return [2.55, 0.08, 0.08, 0.09, 0.6, 0.02]; if (Math.abs(r - R - 0.05) < 0.006) return [2.4, 0.05, 0.05, 0.05, 0, 0]; }
      if (r > R + 0.02) return null;
      if (r > R - 0.28) return [o.zm + 0.06, o.pad[0], o.pad[1], o.pad[2], 0.9, Math.min(R + 0.02 - r, r - R + 0.28)];
      if (r > R - 0.42) { var spr = Math.abs(((ang * R / 0.12) % 1 + 1) % 1 - 0.5) < 0.12; return spr ? [o.zm - 0.02, 0.4, 0.4, 0.42, 0.2, 0.01] : null; }
      var rm = r / (R - 0.42), h = o.zm - 0.17 * (1 - rm * rm) * clamp(depth * 6, 0.25, 1);
      return [h, 0.03, 0.03, 0.035, 1, (R - 0.42 - r)];
    }
    if (k === 'gazebo') {   // octagonal hip roof: snow on the faces, thin along the hips; a finial
      var au = Math.abs(u), av = Math.abs(v), dg = (au + av) * 0.7071, m1 = Math.max(au, av, dg), m2 = au > av ? (av > dg ? av : Math.max(dg, av)) : (au > dg ? au : Math.max(dg, au));
      var ap = o.R * 0.924 + 0.15; if (m1 > ap) return null;
      if (m1 < 0.12) return [o.zp + 0.25, o.wood[0] * 0.6, o.wood[1] * 0.6, o.wood[2] * 0.6, 0.5, 0.02];
      var h = o.zp - (o.zp - o.ze) * m1 / ap, hip = m1 - m2 < 0.05;
      c = o.roof; var crs = (((ap - m1) / 0.14) % 1) < 0.14 ? 0.75 : 1;
      if (hip) return [h + 0.02, c[0] * 0.7, c[1] * 0.7, c[2] * 0.7, 0.25, 0.02];
      return [h, c[0] * crs, c[1] * crs, c[2] * crs, clamp(1.5 - (o.zp - o.ze) / ap, 0.35, 1), Math.min(ap - m1, m1 - m2 - 0.05) + 0.01];
    }
    if (k === 'bale') {
      r = Math.hypot(u, v); if (r > o.R) return null;
      c = o.wrap ? [0.78, 0.78, 0.76] : HAY; var tw = o.wrap ? 1 : 0.85 + 0.15 * NZ.n2(Math.atan2(v, u) * 6, r * 12);
      return [o.zb + 0.05 * Math.sqrt(1 - (r / o.R) * (r / o.R)), c[0] * tw, c[1] * tw, c[2] * tw, 1, o.R - r];
    }
    if (k === 'lbale') {   // lying on its side: the curve across, rounded ends
      if (Math.abs(u) > o.hu || Math.abs(v) > o.R) return null;
      var cv = Math.sqrt(1 - (v / o.R) * (v / o.R)), h = o.R + o.R * cv - 0.03, ee = o.hu - Math.abs(u);
      c = o.wrap ? [0.8, 0.8, 0.78] : HAY; var tw = o.wrap ? 0.95 : 0.85 + 0.15 * NZ.n2(u * 30, v * 4);
      return [h - 0.05 * sstep(0.05, 0, ee), c[0] * tw * (0.7 + 0.3 * cv), c[1] * tw * (0.7 + 0.3 * cv), c[2] * tw * (0.7 + 0.3 * cv), cv > 0.6 ? 1 : 0.3, Math.min(ee, (cv - 0.6) * o.R) + 0.02];
    }
    if (k === 'feeder') {   // a steel ring, sheeted below, bars above; a half-eaten bale inside
      r = Math.hypot(u, v); if (r > o.R + 0.04) return null;
      if (r > o.R - 0.04) return [1.2, o.col[0], o.col[1], o.col[2], 0.5, 0.02];
      var ang = Math.atan2(v, u), bar = Math.abs(((ang * o.R / 0.32) % 1 + 1) % 1 - 0.5) < 0.04;
      if (r > o.R - 0.3 && bar) return [1.1 - (o.R - r) * 0.8, o.col[0] * 0.85, o.col[1] * 0.85, o.col[2] * 0.85, 0.3, 0.01];
      var br = o.R - 0.25; if (r < br) { var m = NZ.fbm(x * 3, y * 3, 2), h = 0.35 + o.left * 0.9 * (0.75 + 0.25 * Math.sqrt(1 - (r / br) * (r / br))) + 0.08 * m; return [h, lerp(HAYD[0], HAY[0], 0.5 + m), lerp(HAYD[1], HAY[1], 0.5 + m), lerp(HAYD[2], HAY[2], 0.5 + m), 0.55, 0.04]; }
      return [0.3, HAYD[0], HAYD[1], HAYD[2], 0.6, 0.03];
    }
    if (k === 'tank' || k === 'trough') {   // galvanised, a rolled rim; ice inside, broken open where they drink
      d = k === 'tank' ? Math.hypot(u, v) - o.R : rbx(u, v, o.hu, o.hv, 0.12); if (d > 0.04) return null;
      if (d > -0.04) return [o.zt + 0.02, GALV2[0], GALV2[1], GALV2[2], 0.5, 0.02];
      var hp = o.hole && Math.hypot(u - (k === 'tank' ? o.R * 0.45 : o.hu * 0.6), v) < (k === 'tank' ? 0.3 : 0.2) * (1 + 0.2 * NZ.n2(x * 9, y * 9));
      if (hp) return [o.zt - 0.12, 0.04, 0.06, 0.08, 0, 0];
      var ice = 0.5 + 0.5 * NZ.n2(x * 4, y * 4);
      return [o.zt - 0.09, lerp(0.3, 0.45, ice), lerp(0.36, 0.5, ice), lerp(0.42, 0.56, ice), 0.6 * ice, -d - 0.04];
    }
    if (k === 'wtower') {   // a tank on four splayed legs: conical roof, a catwalk ring of grating; legs and braces read where the tank does not cover them
      r = Math.hypot(u, v); var Rt = o.Rt;
      if (r < Rt) { var ang = Math.atan2(v, u), seam = Math.abs(((ang / (TAU / 12)) % 1 + 1) % 1 - 0.5) > 0.47; if (r < 0.14) return [o.zt + o.rc + 0.15, 0.1, 0.1, 0.1, 0.4, 0.02]; return [o.zt + o.rc * (1 - r / Rt), o.col[0] * (seam ? 0.75 : 1), o.col[1] * (seam ? 0.75 : 1), o.col[2] * (seam ? 0.75 : 1), seam ? 0.4 : clamp(1.5 - o.rc / Rt, 0.4, 1), Math.min(Rt - r, 0.2) + 0.01]; }
      if (r < Rt + 0.62) { if (r > Rt + 0.57) return [o.zb + 1.0, 0.1, 0.1, 0.1, 0.3, 0.01]; var gr = ((u / 0.06) % 1 + 1) % 1 < 0.25 || ((v / 0.06) % 1 + 1) % 1 < 0.25; return gr ? [o.zb, 0.12, 0.12, 0.12, 0.25, 0.01] : null; }
      return null;
    }
    return null;
  }
  function rod(x1, y1, z1, x2, y2, z2, w, col, hold) {   // a 3D member drawn from above: top of the round section at its height
    var s2 = seg(x1, y1, x2, y2, w / 2), bb = bbox(s2, 0.02), dx = x2 - x1, dy = y2 - y1, LL = dx * dx + dy * dy || 1, amt = clamp(depth * 10, 0.3, 1);
    forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var dd = sd(s2, x, y); if (dd > mpp * 0.3) return; var t = clamp(((x - x1) * dx + (y - y1) * dy) / LL, 0, 1), q = clamp(-dd / (w / 2), 0, 1), sn = (hold || 0) * amt * sstep(0.3, 0.8, q);
      putTop(i, lerp(z1, z2, t) + w / 2 * Math.sqrt(q), lerp(col[0] * (0.6 + 0.4 * q), SNOW[0], sn), lerp(col[1] * (0.6 + 0.4 * q), SNOW[1], sn), lerp(col[2] * (0.6 + 0.4 * q), SNOW[2], sn), sn * 0.5, true); });
  }
  function stRender(o) {
    var amt = clamp(depth * 9, 0.3, 1);
    forBox(o.x - o.ext, o.y - o.ext, o.x + o.ext, o.y + o.ext, function (i, x, y) {
      var dx = x - o.x, dy = y - o.y, u = dx * o.c + dy * o.s, v = -dx * o.s + dy * o.c, r = stTop(o, u, v, x, y); if (!r) return;
      var sn = r[4] * amt * sstep(0.0, 0.07, r[5]) * (0.78 + 0.22 * sstep(-0.4, 0.4, NZ.n2(x * 2.3, y * 2.3) + depth * 4)), pil = Math.sqrt(sstep(0, 0.12, r[5]));
      putTop(i, r[0] + cap * 0.95 * sn * pil, lerp(r[1], SNOW[0], sn), lerp(r[2], SNOW[1], sn), lerp(r[3], SNOW[2], sn), sn, o.fl);
    });
    var M = [0.12, 0.12, 0.12];
    if (o.k === 'wtower') {   // legs splay from under the tank to footings; X braces; a riser; a ladder
      var Ls = [], nL = 4;
      for (var k = 0; k < nL; k++) { var an = o.a + PI / 4 + k * PI / 2, rt = o.Rt * 0.8, rf = o.Rt * 1.3; Ls.push([o.x + Math.cos(an) * rt, o.y + Math.sin(an) * rt, o.x + Math.cos(an) * rf, o.y + Math.sin(an) * rf]); }
      o.legs = Ls;
      Ls.forEach(function (L2, k) { rod(L2[0], L2[1], o.zb, L2[2], L2[3], 0, 0.16, M, 0.2); var N = Ls[(k + 1) % nL];
        [0.25, 0.6].forEach(function (f) { var f2 = f + 0.35; rod(lerp(L2[0], L2[2], 1 - f), lerp(L2[1], L2[3], 1 - f), o.zb * f, lerp(N[0], N[2], 1 - f2), lerp(N[1], N[3], 1 - f2), o.zb * f2, 0.05, M, 0); rod(lerp(N[0], N[2], 1 - f), lerp(N[1], N[3], 1 - f), o.zb * f, lerp(L2[0], L2[2], 1 - f2), lerp(L2[1], L2[3], 1 - f2), o.zb * f2, 0.05, M, 0); }); });
      forBox(o.x - 0.5, o.y - 0.5, o.x + 0.5, o.y + 0.5, function (i, x, y) { var dd = Math.hypot(x - o.x - o.Rt * 1.3 * 0, y - o.y) - 0.45; if (dd < 0) putTop(i, 0.25, 0.3, 0.3, 0.29, 0.5, false); });
    }
    if (o.k === 'tramp') {   // W legs: from the frame to the snow and back
      for (var k = 0; k < 4; k++) { var an = o.a + k * PI / 2 + PI / 4, a1 = an - 0.22, a2 = an + 0.22, R = o.R - 0.05;
        rod(o.x + Math.cos(a1) * R, o.y + Math.sin(a1) * R, o.zm, o.x + Math.cos(a1) * (R + 0.05), o.y + Math.sin(a1) * (R + 0.05), 0, 0.045, [0.35, 0.36, 0.37], 0.1);
        rod(o.x + Math.cos(a2) * R, o.y + Math.sin(a2) * R, o.zm, o.x + Math.cos(a2) * (R + 0.05), o.y + Math.sin(a2) * (R + 0.05), 0, 0.045, [0.35, 0.36, 0.37], 0.1); }
    }
  }
  // }STRUCT-R

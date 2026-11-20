    // STRUCT-S{  shadows of floating and tall round things: every member's projection is unioned (max), then darkened once,
    // so a tank, its legs and its catwalk overlap as one shadow rather than stacking into black
    var SCR = new Float32Array(PN), SCRL = [];
    function uCap(x1, y1, z1, x2, y2, z2, w, opq) {
      var ax = x1 - sunD[0] * z1 / tanE, ay = y1 - sunD[1] * z1 / tanE, bx = x2 - sunD[0] * z2 / tanE, by = y2 - sunD[1] * z2 / tanE;
      var pz = pen * (z1 + z2) / 2, e = pz / 2 + mpp * 0.6, op = Math.min(1, (w + mpp) / (pz + mpp)) * (opq || 1), r = w / 2, pad = r + e;
      var ix0 = Math.max(0, Math.floor((Math.min(ax, bx) - pad) / mpp)), iy0 = Math.max(0, Math.floor((Math.min(ay, by) - pad) / mpp)), ix1 = Math.min(PW - 1, Math.ceil((Math.max(ax, bx) + pad) / mpp)), iy1 = Math.min(PH - 1, Math.ceil((Math.max(ay, by) + pad) / mpp));
      if (ix0 > ix1 || iy0 > iy1) return;
      var vx = bx - ax, vy = by - ay, LL = vx * vx + vy * vy, iL = LL > 0 ? 1 / LL : 0, k2 = 1 / (2 * e);
      for (var yy = iy0; yy <= iy1; yy++) { var py = (yy + 0.5) * mpp - ay, row = yy * PW;
        for (var xx = ix0; xx <= ix1; xx++) { var px = (xx + 0.5) * mpp - ax, t = (px * vx + py * vy) * iL; t = t < 0 ? 0 : t > 1 ? 1 : t;
          var dx = px - vx * t, dy = py - vy * t, v = 0.5 - (Math.sqrt(dx * dx + dy * dy) - r) * k2; if (v <= 0.003) continue; if (v > 1) v = 1; v *= op;
          var i = row + xx; if (v > SCR[i]) { if (SCR[i] === 0) SCRL.push(i); SCR[i] = v; } } }
    }
    function uSlab(cx, cy, z, ext, fn, opq) {   // a horizontal shape at height z: fn(dx, dy) = signed distance in the slab's plane
      var ox = -sunD[0] * z / tanE, oy = -sunD[1] * z / tanE, soft = mpp * 0.9 + pen * z * 0.5;
      forBox(cx + ox - ext - soft, cy + oy - ext - soft, cx + ox + ext + soft, cy + oy + ext + soft, function (i, x, y) { var v = clamp(0.5 - fn(x - ox - cx, y - oy - cy) / soft, 0, 1) * (opq || 1); if (v > SCR[i]) { if (SCR[i] === 0) SCRL.push(i); SCR[i] = v; } });
    }
    function uApply(zlim) { for (var k = 0; k < SCRL.length; k++) { var i = SCRL[k]; if (FZ[i] < zlim) SHD[i] *= 1 - SCR[i] * 0.92; SCR[i] = 0; } SCRL.length = 0; }
    function stShadow(o) {
      var ca = o.c, sa = o.s, L2 = function (u, v) { return [o.x + u * ca - v * sa, o.y + u * sa + v * ca]; }, loc = function (dx, dy) { return [dx * ca + dy * sa, -dx * sa + dy * ca]; };
      if (o.k === 'picnic') {
        uSlab(o.x, o.y, 0.76, 1.1, function (dx, dy) { var q = loc(dx, dy); return rbx(q[0], q[1], o.hu, 0.38, 0.01); });
        uSlab(o.x, o.y, 0.45, 1.1, function (dx, dy) { var q = loc(dx, dy); return rbx(q[0], Math.abs(q[1]) - 0.62, o.hu, 0.13, 0.01); });
        [-1, 1].forEach(function (s) { var uu = s * (o.hu - 0.3); [-1, 1].forEach(function (t) { var a = L2(uu, t * 0.3), b = L2(uu, t * 0.78); uCap(a[0], a[1], 0.74, b[0], b[1], 0, 0.07); }); var a = L2(uu, -0.75), b = L2(uu, 0.75); uCap(a[0], a[1], 0.4, b[0], b[1], 0.4, 0.07); });
        uApply(0.4); return;
      }
      if (o.k === 'rpicnic') { uSlab(o.x, o.y, 0.75, 0.7, function (dx, dy) { return Math.hypot(dx, dy) - o.R; }); uSlab(o.x, o.y, 0.45, 1.15, function (dx, dy) { var r = Math.hypot(dx, dy), an = Math.atan2(dy, dx) - o.a; return Math.abs(Math.sin(an * 2)) > 0.2 ? Math.max(0.82 - r, r - 1.08) : 1; }); uCap(o.x, o.y, 0, o.x, o.y, 0.72, 0.12); uApply(0.4); return; }
      if (o.k === 'tramp') {
        uSlab(o.x, o.y, o.zm, o.R + 0.1, function (dx, dy) { var r = Math.hypot(dx, dy); return r < o.R - 0.42 || r > o.R - 0.28 ? r - o.R - 0.02 : 0; });
        for (var k = 0; k < 4; k++) { var an = o.a + k * PI / 2 + PI / 4; [-0.22, 0.22].forEach(function (da) { var R = o.R - 0.05; uCap(o.x + Math.cos(an + da) * R, o.y + Math.sin(an + da) * R, o.zm, o.x + Math.cos(an + da) * (R + 0.05), o.y + Math.sin(an + da) * (R + 0.05), 0, 0.045); }); }
        if (o.net) { var P = []; for (var k = 0; k < o.np; k++) { var an = o.a + (k + 0.5) * TAU / o.np; P.push([o.x + Math.cos(an) * (o.R + 0.06), o.y + Math.sin(an) * (o.R + 0.06)]); }
          P.forEach(function (p, k) { uCap(p[0], p[1], o.zm, p[0], p[1], 2.55, 0.045); var q = P[(k + 1) % P.length]; uCap(p[0], p[1], 2.45, q[0], q[1], 2.45, 0.02);
            for (var z = 1.05; z < 2.45; z += 0.22) uCap(p[0], p[1], z, q[0], q[1], z, 0.22, 0.32); }); }   // the net: a veil, not a wall
        uApply(0.5); return;
      }
      if (o.k === 'gazebo') {
        var ap = o.R * 0.924 + 0.15, oct = function (s) { return function (dx, dy) { var q = loc(dx, dy), au = Math.abs(q[0]), av = Math.abs(q[1]); return Math.max(au, av, (au + av) * 0.7071) - s; }; };
        for (var k = 0; k <= 5; k++) { var f = k / 5; uSlab(o.x, o.y, lerp(o.ze, o.zp, f), ap, oct(ap * (1 - f) + 0.02)); }
        uCap(o.x, o.y, o.zp, o.x, o.y, o.zp + 0.3, 0.16);
        for (var k = 0; k < 8; k++) { var an = o.a + PI / 8 + k * PI / 4, pr = o.R * 0.86, p = [o.x + Math.cos(an) * pr, o.y + Math.sin(an) * pr]; uCap(p[0], p[1], 0, p[0], p[1], o.ze, 0.13);
          if (k !== o.door) { var an2 = an + PI / 4, q = [o.x + Math.cos(an2) * pr, o.y + Math.sin(an2) * pr]; uCap(p[0], p[1], 0.95, q[0], q[1], 0.95, 0.07); uCap(p[0], p[1], 0.25, q[0], q[1], 0.25, 0.07);
            for (var b = 1; b < 8; b++) { var t = b / 8, bx = lerp(p[0], q[0], t), by = lerp(p[1], q[1], t); uCap(bx, by, 0.25, bx, by, 0.95, 0.04); } } }   // rails and balusters between the posts, open at the door
        uApply(o.ze - 0.05); return;
      }
      if (o.k === 'wtower') {
        uCap(o.x, o.y, o.zb, o.x, o.y, o.zt, o.Rt * 2); for (var k = 1; k <= 3; k++) uCap(o.x, o.y, o.zt, o.x, o.y, o.zt + o.rc * k / 3.2, o.Rt * 2 * (1 - k / 3.4));
        uSlab(o.x, o.y, o.zb, o.Rt + 0.65, function (dx, dy) { var r = Math.hypot(dx, dy); return Math.max(r - o.Rt - 0.62, o.Rt - r); }, 0.5);   // grating lets half the light through
        for (var k = 0; k < 24; k++) { var a1 = k * TAU / 24, a2 = (k + 1) * TAU / 24, rr = o.Rt + 0.6; uCap(o.x + Math.cos(a1) * rr, o.y + Math.sin(a1) * rr, o.zb + 1, o.x + Math.cos(a2) * rr, o.y + Math.sin(a2) * rr, o.zb + 1, 0.04); }
        var Ls = o.legs || []; Ls.forEach(function (L3, k) { uCap(L3[0], L3[1], o.zb, L3[2], L3[3], 0, 0.16); var N = Ls[(k + 1) % Ls.length];
          [0.25, 0.6].forEach(function (f) { var f2 = f + 0.35; uCap(lerp(L3[0], L3[2], 1 - f), lerp(L3[1], L3[3], 1 - f), o.zb * f, lerp(N[0], N[2], 1 - f2), lerp(N[1], N[3], 1 - f2), o.zb * f2, 0.05); uCap(lerp(N[0], N[2], 1 - f), lerp(N[1], N[3], 1 - f), o.zb * f, lerp(L3[0], L3[2], 1 - f2), lerp(L3[1], L3[3], 1 - f2), o.zb * f2, 0.05); });
          uCap(L3[0], L3[1], o.zb * 0.6, N[0], N[1], o.zb * 0.6, 0.06); });
        uCap(o.x, o.y, 0, o.x, o.y, o.zb, 0.3);
        uApply(o.zb - 0.1); return;
      }
    }
    function siloShadow(o) { o.list.forEach(function (s) { uCap(s.x, s.y, 0, s.x, s.y, s.H, s.R * 2); for (var k = 1; k <= 4; k++) uCap(s.x, s.y, s.H, s.x, s.y, s.H + s.hd * k / 4.2, s.R * 2 * Math.sqrt(1 - Math.pow(k / 4.4, 1.6))); }); uApply(1e9); }
    function beastShadow(b) {
      var ca = Math.cos(b.a), sa = Math.sin(b.a), P = function (u, v) { return [b.x + u * ca - v * sa, b.y + u * sa + v * ca]; }, S = b.S, zb = b.Hb - S.W * 0.42;
      var p1 = P(-S.L / 2 + S.W * 0.4, 0), p2 = P(S.L / 2 - S.W * 0.4, 0); uCap(p1[0], p1[1], zb, p2[0], p2[1], zb, S.W * 0.95);
      var belly = b.Hb - S.W * 0.8;
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var p = P(q[0] * S.L * 0.36, q[1] * S.W * 0.25); uCap(p[0], p[1], 0, p[0], p[1], belly + 0.05, S.leg); });
      var nk = b.neck; uCap(nk[0], nk[1], nk[2], nk[3], nk[4], nk[5], S.nw); uCap(nk[3], nk[4], nk[5], b.head[0], b.head[1], b.head[2], S.hw);
      if (b.tail) uCap(b.tail[0], b.tail[1], b.tail[2], b.tail[3], b.tail[4], b.tail[5], S.tw);
      uApply(b.Hb * 0.55);
    }
    // }STRUCT-S

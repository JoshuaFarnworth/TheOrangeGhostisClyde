    // round 11: plates (signs, fences, glass) and the shelter roof, projected exactly; their shadows say what they are
    function shadowPlate(cx, cy, zc, f, hu, hw, fn) {
      var nx = Math.cos(f), ny = Math.sin(f), tx = -ny, ty = nx, den = sunD[0] * nx + sunD[1] * ny;
      if (Math.abs(den) < 0.1) { shadowCapsule(cx - tx * hu, cy - ty * hu, zc + hw * 0.5, cx + tx * hu, cy + ty * hu, zc + hw * 0.5, 0.03); return; }
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (k) { var z = Math.max(0, zc + k[1] * hw), qx = cx + tx * hu * k[0] - sunD[0] * z / tanE, qy = cy + ty * hu * k[0] - sunD[1] * z / tanE; x0 = Math.min(x0, qx); y0 = Math.min(y0, qy); x1 = Math.max(x1, qx); y1 = Math.max(y1, qy); });
      if (x1 < 0 || y1 < 0 || x0 > WM || y0 > HM) return;
      var aw = mpp * 1.2 + pen * zc * 0.35;
      forBox(x0 - 0.05, y0 - 0.05, x1 + 0.05, y1 + 0.05, function (i, x, y) {
        var sP = ((cx - x) * nx + (cy - y) * ny) / den; if (sP < 0) return;
        var qx = x + sunD[0] * sP, qy = y + sunD[1] * sP, u = (qx - cx) * tx + (qy - cy) * ty, w = sP * tanE - zc, op = fn(u, w, aw);
        if (op > 0.003) SHD[i] *= 1 - op * 0.92;
      });
    }
    function inR(d, aw) { return clamp(0.5 - d / aw, 0, 1); }
    function rectF(hu, hw) { return function (u, w, aw) { return inR(Math.max(Math.abs(u) - hu, Math.abs(w) - hw), aw); }; }
    function octF(r) { return function (u, w, aw) { var au = Math.abs(u), awv = Math.abs(w); return inR(Math.max(au, awv, (au + awv) * 0.7071) - r * 0.924, aw); }; }
    signs.forEach(function (o) { shadowCapsule(o.x, o.y, 0, o.x, o.y, o.h, 0.05); o.plates.forEach(function (pl) { shadowPlate(o.x, o.y, pl.z, pl.f, pl.hu, pl.hw, pl.sh === 'oct' ? octF(pl.hu) : rectF(pl.hu, pl.hw)); }); });
    objs.forEach(function (o) {
      if (o.t === 'mailbox') { shadowCapsule(o.x, o.y, 0, o.x, o.y, 1.08, 0.08); shadowCapsule(o.x - Math.cos(o.a) * 0.22, o.y - Math.sin(o.a) * 0.22, 1.15, o.x + Math.cos(o.a) * 0.22, o.y + Math.sin(o.a) * 0.22, 1.15, 0.19); }
      if (o.t === 'pfence') {
        var len = Math.hypot(o.q[0] - o.p[0], o.q[1] - o.p[1]), f = Math.atan2(o.q[1] - o.p[1], o.q[0] - o.p[0]) + PI / 2, cx = (o.p[0] + o.q[0]) / 2, cy = (o.p[1] + o.q[1]) / 2, k = o.kind;
        shadowPlate(cx, cy, 0.6, f, len / 2, 0.6, function (u, w, aw) {
          var a = u + len / 2, z = w + 0.6, v = 0;
          if (k === 'picket') { var m = ((a % 0.16) + 0.16) % 0.16, pm = ((a % 2.4) + 2.4) % 2.4; if (pm < 0.1 && z < 1.17) return 1; if (m < 0.09 && z < 1.02 + 0.05 * (1 - Math.abs(m - 0.045) / 0.045)) v = 1; if ((z > 0.22 && z < 0.3) || (z > 0.82 && z < 0.9)) v = 1; return v; }
          if (k === 'chain') { if ((((a % 3) + 3) % 3) < 0.07 && z < 1.2) return 1; if (z > 1.13 && z < 1.18) return 1; return z < 1.15 ? 0.3 : 0; }
          if ((((a % 3) + 3) % 3) < 0.15 && z < 1.15) return 1; if ((z > 0.4 && z < 0.53) || (z > 0.82 && z < 0.95)) return 1; return 0;
        });
      }
      if (o.t === 'shelter') {
        var fx = Math.cos(o.a), fy = Math.sin(o.a), tx = -fy, ty = fx, rb = box(o.x, o.y, o.hw, o.hh, o.a + PI / 2), ox = -sunD[0] * o.z / tanE, oy = -sunD[1] * o.z / tanE, bb = bbox(rb, 0.1), sf = 0.03 + pen * o.z * 0.4;
        forBox(bb[0] + ox, bb[1] + oy, bb[2] + ox, bb[3] + oy, function (i, x, y) { var v = clamp(0.5 - sd(rb, x - ox, y - oy) / sf, 0, 1); if (v > 0.003) SHD[i] *= 1 - v * 0.92; });
        var glass = function (hu, hw) { return function (u, w, aw) { return Math.abs(u) > hu - 0.05 || w > hw - 0.06 ? inR(Math.max(Math.abs(u) - hu, Math.abs(w) - hw), aw) : (Math.abs(w) < hw ? 0.2 : 0); }; };
        shadowPlate(o.x - fx * 0.7, o.y - fy * 0.7, 1.2, o.a, o.hw, 1.05, glass(o.hw, 1.05));
        [-1, 1].forEach(function (k) { shadowPlate(o.x + tx * 1.65 * k - fx * 0.3, o.y + ty * 1.65 * k - fy * 0.3, 1.2, o.a + PI / 2, 0.4, 1.05, glass(0.4, 1.05)); shadowCapsule(o.x + tx * 1.65 * k + fx * 0.1, o.y + ty * 1.65 * k + fy * 0.1, 0, o.x + tx * 1.65 * k + fx * 0.1, o.y + ty * 1.65 * k + fy * 0.1, o.z, 0.05); });
      }
    });

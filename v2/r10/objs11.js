    } else if (o.t === 'sign') {   // a pole cap and the top edges of its plates, each with a line of snow
      forBox(o.x - 0.05, o.y - 0.05, o.x + 0.05, o.y + 0.05, function (i, x, y) { var d = Math.hypot(x - o.x, y - o.y) - 0.03; if (d < mpp * 0.3) putTop(i, o.h, lerp(METAL[0], SNOW[0], 0.6), lerp(METAL[1], SNOW[1], 0.6), lerp(METAL[2], SNOW[2], 0.6), 0.4, true); });
      o.plates.forEach(function (pl) {
        var tx = -Math.sin(pl.f), ty = Math.cos(pl.f), hu = pl.sh === 'oct' ? pl.hu * 0.42 : pl.hu, s2 = seg(o.x - tx * pl.hu, o.y - ty * pl.hu, o.x + tx * pl.hu, o.y + ty * pl.hu, 0.03), bb = bbox(s2, 0.02);
        forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { var d = sd(s2, x, y); if (d >= mpp * 0.3) return; var u = Math.abs((x - o.x) * tx + (y - o.y) * ty), sn = (u < hu ? 0.85 : 0.35) * sstep(0.002, 0.01, -d) * clamp(depth * 10, 0.3, 1); putTop(i, pl.z + pl.hw, lerp(pl.col[0], SNOW[0], sn), lerp(pl.col[1], SNOW[1], sn), lerp(pl.col[2], SNOW[2], sn), sn * 0.5, true); });
      });
    } else if (o.t === 'hydrant') {   // a snow dome on a red bonnet, the red showing in a ring; two nozzles
      var ca = Math.cos(o.a), sa = Math.sin(o.a), amt = clamp(depth * 9, 0.3, 1);
      forBox(o.x - 0.3, o.y - 0.3, o.x + 0.3, o.y + 0.3, function (i, x, y) {
        var dx = x - o.x, dy = y - o.y, r = Math.hypot(dx, dy), u = dx * ca + dy * sa, v = -dx * sa + dy * ca, c;
        if (r < 0.135) { var t = sstep(0.0, 0.045, 0.135 - r - 0.012 * (1 + NZ.n2(x * 30, y * 30))) * amt, dome = Math.sqrt(Math.max(0, 1 - (r / 0.135) * (r / 0.135))); putTop(i, 0.72 + 0.05 * dome + cap * 0.7 * t * dome, lerp(o.col[0], SNOW[0], t), lerp(o.col[1], SNOW[1], t), lerp(o.col[2], SNOW[2], t), t); return; }
        var dn = Math.max(Math.abs(v) - 0.045, Math.abs(u) - 0.22); if (dn < 0) { var t = sstep(0, 0.025, -dn) * amt * 0.8; putTop(i, 0.5 + 0.02 * t, lerp(o.col[0] * 0.8, SNOW[0], t), lerp(o.col[1] * 0.8, SNOW[1], t), lerp(o.col[2] * 0.8, SNOW[2], t), t); return; }
        if (r < 0.17) putTop(i, 0.62, o.col[0] * 0.7, o.col[1] * 0.7, o.col[2] * 0.7, 0);
      });
    } else if (o.t === 'mailbox') {   // a loaf of snow on a box on a post; the door faces the road
      var ca = Math.cos(o.a), sa = Math.sin(o.a), amt = clamp(depth * 10, 0.3, 1);
      forBox(o.x - 0.3, o.y - 0.3, o.x + 0.3, o.y + 0.3, function (i, x, y) {
        var dx = x - o.x, dy = y - o.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, d = Math.max(Math.abs(u) - 0.24, Math.abs(v) - 0.09);
        if (d < 0) { var t = sstep(0.0, 0.04, -d - 0.008 * (1 + NZ.n2(x * 25, y * 25))) * amt, arch = Math.sqrt(Math.max(0, 1 - (v / 0.09) * (v / 0.09))); putTop(i, 1.1 + 0.1 * arch + cap * 0.8 * t * arch, lerp(o.col[0], SNOW[0], t), lerp(o.col[1], SNOW[1], t), lerp(o.col[2], SNOW[2], t), t, true); }
        else if (Math.abs(u + 0.05) < 0.012 && v > 0.09 && v < 0.12) putTop(i, 1.15, 0.6, 0.08, 0.05, 0, true);   // the flag, down
      });
    } else if (o.t === 'pfence') {   // property lines: picket, chain-link or split rail; from above a line, in shadow a fence
      var len = Math.hypot(o.q[0] - o.p[0], o.q[1] - o.p[1]), tx = (o.q[0] - o.p[0]) / len, ty = (o.q[1] - o.p[1]) / len, line = seg(o.p[0], o.p[1], o.q[0], o.q[1], 0.02), bb = bbox(line, 0.12), amt = clamp(depth * 10, 0.3, 1);
      var PAINT = [0.78, 0.78, 0.75], RAIL = [0.2, 0.15, 0.1], GALV = [0.32, 0.33, 0.33];
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) {
        var u = (x - o.p[0]) * tx + (y - o.p[1]) * ty, v = -(x - o.p[0]) * ty + (y - o.p[1]) * tx, av = Math.abs(v); if (u < -0.1 || u > len + 0.1) return;
        if (o.kind === 'picket') {
          var m = ((u % 0.16) + 0.16) % 0.16, post = ((u % 2.4) + 2.4) % 2.4 < 0.1;
          if (post && av < 0.05) { var t = sstep(0, 0.03, 0.05 - av) * amt; putTop(i, 1.15 + 0.03 * t, lerp(PAINT[0], SNOW[0], t), lerp(PAINT[1], SNOW[1], t), lerp(PAINT[2], SNOW[2], t), t, true); }
          else if (m < 0.09 && av < 0.012) putTop(i, 1.06, PAINT[0] * 0.95, PAINT[1] * 0.95, PAINT[2] * 0.95, 0.2, true);
          else if (av > 0.012 && av < 0.032 && v > 0) { var t = sstep(0.012, 0.022, av) * amt * 0.7; putTop(i, 0.9, lerp(PAINT[0] * 0.8, SNOW[0], t), lerp(PAINT[1] * 0.8, SNOW[1], t), lerp(PAINT[2] * 0.8, SNOW[2], t), t, true); }
        } else if (o.kind === 'chain') {
          var post = ((u % 3) + 3) % 3 < 0.07;
          if (post && av < 0.035) { var t = sstep(0, 0.02, 0.035 - av) * amt; putTop(i, 1.2, lerp(GALV[0], SNOW[0], t), lerp(GALV[1], SNOW[1], t), lerp(GALV[2], SNOW[2], t), t, true); }
          else if (av < 0.018) { var t = sstep(0.004, 0.012, 0.018 - av) * amt * 0.85; putTop(i, 1.16, lerp(GALV[0], SNOW[0], t), lerp(GALV[1], SNOW[1], t), lerp(GALV[2], SNOW[2], t), t * 0.5, true); }
        } else {
          var pm = ((u % 3) + 3) % 3, post = pm < 0.15;
          if (post && av < 0.075) { var t = sstep(0, 0.05, 0.075 - av - 0.01 * NZ.n2(x * 20, y * 20)) * amt; putTop(i, 1.15 + cap * 0.6 * t, lerp(RAIL[0], SNOW[0], t), lerp(RAIL[1], SNOW[1], t), lerp(RAIL[2], SNOW[2], t), t, true); }
          else if (av < 0.065) { var t = sstep(0, 0.04, 0.065 - av - 0.012 * NZ.n2(x * 14, y * 14)) * amt, rnd = Math.sqrt(Math.max(0, 1 - (av / 0.065) * (av / 0.065))); putTop(i, 0.94 + 0.04 * rnd + cap * 0.55 * t * rnd, lerp(RAIL[0] * (0.7 + 0.3 * rnd), SNOW[0], t), lerp(RAIL[1] * (0.7 + 0.3 * rnd), SNOW[1], t), lerp(RAIL[2] * (0.7 + 0.3 * rnd), SNOW[2], t), t, true); }
        }
      });
    } else if (o.t === 'shelter') {   // the roof carries the night's snow; its gutter shows as a dark lip
      var rb = box(o.x, o.y, o.hw + 0.04, o.hh + 0.04, o.a + PI / 2), bb = bbox(rb, 0.05), amt = clamp(depth * 9, 0.35, 1);
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) {
        var d = sd(rb, x, y); if (d > mpp * 0.3) return;
        var e = -d, t = sstep(0.02, 0.09, e + 0.012 * NZ.n2(x * 18, y * 18)) * amt, pil = sstep(0.02, 0.3, e);
        putTop(i, o.z + 0.06 + (cap * 1.1 + 0.01) * t * (0.6 + 0.4 * pil) + 0.01 * NZ.fbm(x * 2, y * 2, 2) * t, lerp(0.07, SNOW[0], t), lerp(0.075, SNOW[1], t), lerp(0.08, SNOW[2], t), t, true);
      });
    } else if (o.t === 'car') {   // a car under the night's snow: the shape is all there is, and the shadow
      var ca = Math.cos(o.a), sa = Math.sin(o.a), hL = o.L / 2, hv = o.W / 2, amt = clamp(depth * 9, 0.22, 1), sT = depth * 1.15 + 0.01, bb = bbox(box(o.x, o.y, hL, hv, o.a), 0.25);
      function prof(un) { return un < -0.93 ? 0.62 : un < -0.64 ? 0.95 : un < -0.36 ? lerp(0.95, 1.43, (un + 0.64) / 0.28) : un < 0.22 ? 1.45 : un < 0.56 ? lerp(1.43, 0.98, (un - 0.22) / 0.34) : un < 0.94 ? lerp(0.98, 0.86, (un - 0.56) / 0.38) : 0.64; }
      var GLASS = [0.03, 0.04, 0.055];
      forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) {
        var dx = x - o.x, dy = y - o.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, un = u / hL, av = Math.abs(v) / hv;
        var mir = Math.max(Math.abs(un - 0.2) - 0.05, Math.abs(Math.abs(v) - hv - 0.1) - 0.08);
        if (mir < 0) { var t = amt * 0.9; putTop(i, 1.02 + sT * 0.5 * t, lerp(o.col[0], SNOW[0], t), lerp(o.col[1], SNOW[1], t), lerp(o.col[2], SNOW[2], t), t); return; }
        var se = Math.pow(Math.abs(un), 6) + Math.pow(av, 6); if (se > 1.04) return;
        var edge = Math.max(0, 1 - se) , hb = prof(un), cabin = sstep(0.86, 0.62, av);
        hb = 0.95 + (hb - 0.95) * (hb > 0.95 ? cabin : 1); hb -= 0.14 * sstep(0.78, 1, av) + 0.1 * sstep(0.9, 1, Math.abs(un));
        var t = sstep(0.0, 0.08, edge) * amt, depthS = sT * sstep(0, 0.25, edge) * (0.9 + 0.15 * NZ.fbm(x * 1.2 + o.seed, y * 1.2, 2));
        var col = o.col;
        if (o.ws && un > 0.26 && un < 0.55 && av < 0.7) {   // someone brushed a window clear: arcs of the sweep, then gave up
          var br = 0.15 + 0.5 * sstep(0.3, 0.9, NZ.n2(un * 8 + o.seed, av * 3)) * sstep(0.4, 0.7, av);
          depthS *= br; t *= br; col = GLASS;
        }
        putTop(i, hb + depthS, lerp(col[0], SNOW[0], t), lerp(col[1], SNOW[1], t), lerp(col[2], SNOW[2], t), t);
      });

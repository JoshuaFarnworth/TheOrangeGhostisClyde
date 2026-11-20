  // BEAST-R{  livestock from above: a barrel with snow along the spine (a thick coat keeps it from melting), neck, head, tail
  var BEAST = {
    horse: { L: 1.65, W: 0.62, Hb: 1.58, nl: 0.85, hl: 0.56, hw: 0.23, nw: 0.3, leg: 0.11, tw: 0.11, p: 2.2, coat: 0.85 },
    cow: { L: 1.85, W: 0.8, Hb: 1.38, nl: 0.45, hl: 0.46, hw: 0.26, nw: 0.42, leg: 0.13, tw: 0.05, p: 2.7, coat: 0.95 },
    sheep: { L: 1.0, W: 0.6, Hb: 0.82, nl: 0.22, hl: 0.26, hw: 0.14, nw: 0.2, leg: 0.06, tw: 0.06, p: 2.1, coat: 1 },
    goat: { L: 0.86, W: 0.42, Hb: 0.76, nl: 0.3, hl: 0.24, hw: 0.11, nw: 0.12, leg: 0.05, tw: 0.04, p: 2.2, coat: 0.6 },
    chicken: { L: 0.27, W: 0.17, Hb: 0.36, nl: 0.06, hl: 0.07, hw: 0.05, nw: 0.06, leg: 0.015, tw: 0.08, p: 2, coat: 0.2 }
  };
  function beastRender(b) {
    var S = b.S, ca = Math.cos(b.a), sa = Math.sin(b.a), amt = clamp(depth * 9, 0.35, 1) * S.coat * b.snowK, P = function (u, v) { return [b.x + u * ca - v * sa, b.y + u * sa + v * ca]; };
    var c0 = b.col, c1 = b.col2 || b.col, ext = S.L / 2 + S.nl + S.hl + 0.2;
    // neck and head in world space (also used for the shadow)
    var sh = P(S.L / 2 - S.W * 0.25, 0), hy = b.a + b.yaw, z0 = b.Hb * 0.93, zh = b.headZ, run = Math.sqrt(Math.max(0.01, S.nl * S.nl - Math.pow(Math.max(0, z0 - zh - S.hw), 2) * 0.6));
    var hb = [sh[0] + Math.cos(hy) * run, sh[1] + Math.sin(hy) * run, zh + S.hw * 0.6], ht = [hb[0] + Math.cos(hy + b.yaw * 0.5) * S.hl, hb[1] + Math.sin(hy + b.yaw * 0.5) * S.hl, zh];
    b.neck = [sh[0], sh[1], z0, hb[0], hb[1], hb[2]]; b.head = ht;
    var tb = P(-S.L / 2, 0), te = P(-S.L / 2 - (b.sp === 'horse' ? 0.22 : b.sp === 'chicken' ? 0.05 : 0.06), 0); b.tail = b.sp === 'sheep' ? null : [tb[0], tb[1], b.Hb * 0.88, te[0], te[1], b.sp === 'chicken' ? b.Hb + 0.07 : b.Hb * 0.45];
    forBox(b.x - ext, b.y - ext, b.x + ext, b.y + ext, function (i, x, y) {
      var dx = x - b.x, dy = y - b.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      var hw2 = S.W / 2 * (1 - 0.1 * Math.cos((u / S.L) * TAU) * (b.sp === 'cow' ? -1 : 1)), q = Math.pow(Math.abs(u) / (S.L / 2), S.p) + Math.pow(Math.abs(v) / hw2, 2);
      if (q < 1) {
        var top = Math.sqrt(1 - q), h = b.Hb - S.W * 0.5 + S.W * 0.5 * top + (b.sp === 'sheep' ? 0.03 * NZ.fbm(x * 18, y * 18, 2) : 0);
        var pat = b.pat === 'holstein' ? (NZ.n2(x * 2.6 + b.seed, y * 2.6) > 0.05 ? 1 : 0) : b.pat === 'blanket' ? (Math.abs(u) < S.L * 0.4 ? 1 : 0) : 0;
        var c = pat ? c1 : c0, spine = sstep(0.85, 0.3, Math.abs(v) / hw2), sn = amt * spine * sstep(-0.3, 0.3, NZ.n2(x * 6 + b.seed, y * 6) + 0.25) * (b.pat === 'blanket' && pat ? 1.15 : 1);
        if (b.sp === 'horse' && Math.abs(v) < 0.025 && u > S.L * 0.15) c = b.mane;
        var lit = 0.7 + 0.3 * top; sn = clamp(sn, 0, 1);
        putTop(i, h + cap * 0.5 * sn, lerp(c[0] * lit, SNOW[0], sn), lerp(c[1] * lit, SNOW[1], sn), lerp(c[2] * lit, SNOW[2], sn), sn, true);
      }
    });
    var NC = b.sp === 'horse' ? b.mane : b.headCol || c0;
    rod(b.neck[0], b.neck[1], b.neck[2], b.neck[3], b.neck[4], b.neck[5], S.nw, b.sp === 'horse' ? c0 : NC, S.coat * 0.5 * b.snowK);
    if (b.sp === 'horse') rod(b.neck[0], b.neck[1], b.neck[2] + S.nw * 0.45, b.neck[3], b.neck[4], b.neck[5] + S.nw * 0.3, 0.05, b.mane, 0);
    rod(hb[0], hb[1], hb[2], ht[0], ht[1], ht[2], S.hw, b.headCol || c0, 0);
    if (b.sp !== 'chicken') [-1, 1].forEach(function (s) { var ex = hb[0] - Math.sin(hy) * S.hw * 0.45 * s, ey = hb[1] + Math.cos(hy) * S.hw * 0.45 * s; rod(ex, ey, hb[2] + S.hw * 0.4, ex - Math.cos(hy) * 0.05 - Math.sin(hy) * 0.06 * s, ey - Math.sin(hy) * 0.05 + Math.cos(hy) * 0.06 * s, hb[2] + S.hw * 0.45, b.sp === 'horse' ? 0.05 : 0.06, b.headCol || c0, 0); });
    else rod(hb[0], hb[1], hb[2] + 0.03, ht[0], ht[1], ht[2] + 0.03, 0.02, [0.6, 0.06, 0.04], 0);   // comb
    if (b.tail) rod(b.tail[0], b.tail[1], b.tail[2], b.tail[3], b.tail[4], b.tail[5], S.tw, b.sp === 'horse' ? b.mane : b.sp === 'chicken' ? c1 : c0, 0);
  }
  function siloRender(o) {
    o.list.forEach(function (s) {
      var ext = s.R + 0.9; forBox(s.x - ext, s.y - ext, s.x + ext, s.y + ext, function (i, x, y) {
        var dx = x - s.x, dy = y - s.y, r = Math.hypot(dx, dy), an = Math.atan2(dy, dx), amt = clamp(depth * 9, 0.35, 1);
        var la = Math.abs(((an - s.lad) + PI * 3) % TAU - PI) * r;   // the roof ladder and the caged wall ladder share a bearing
        if (r > s.R) { if (r < s.R + 0.75 && la < 0.4 && la > 0.3) putTop(i, s.H + 1.0, 0.1, 0.1, 0.1, 0.2, true); else if (r < s.R + 0.75 && r > s.R + 0.68 && la < 0.4) putTop(i, s.H + 1.0, 0.1, 0.1, 0.1, 0.2, true); return; }
        var t = r / s.R, h = s.H + s.hd * (1 - Math.pow(t, 1.7)), slope = s.hd * 1.7 * Math.pow(t, 0.7) / s.R;
        if (r < 0.42) { putTop(i, h + 0.35 - r * 0.3, 0.2, 0.21, 0.22, 0.5, true); return; }
        if (t > 0.985) { putTop(i, h, s.col[0] * 0.6, s.col[1] * 0.6, s.col[2] * 0.6, 0, true); return; }
        var rib = Math.abs(((an / (TAU / s.nr)) % 1 + 1) % 1 - 0.5) > 0.46, lad = la < 0.22 && r > 0.5, c = s.dome;
        var hold = clamp(1.35 - slope * 1.25, 0, 1) * (rib ? 0.55 : 1) * (lad ? 0.3 : 1), sn = hold * amt * sstep(-0.5, 0.3, NZ.n2(x * 1.4, y * 1.4) + depth * 3) * sstep(0.95, 0.85, t);
        var k = rib ? 0.78 : 1; if (lad) { var rung = ((r / 0.3) % 1) < 0.25; c = rung ? [0.15, 0.15, 0.15] : c; k = 0.7; }
        putTop(i, h + cap * 0.7 * sn, lerp(c[0] * k, SNOW[0], sn), lerp(c[1] * k, SNOW[1], sn), lerp(c[2] * k, SNOW[2], sn), sn, true);
      });
    });
  }
  function groundExtras() {
    var MUD = [0.2, 0.16, 0.12], mk = { 'Dusting': 0.85, 'Fresh': 0.5, 'Deep': 0.2 }[snowfall];
    muds.forEach(function (m) { forBox(m.x - m.R, m.y - m.R, m.x + m.R, m.y + m.R, function (i, x, y) { var r = Math.hypot(x - m.x, y - m.y) / m.R; if (r > 1 || H[i] > depth * 2 + 0.05) return; var t = sstep(0.15, 0.75, NZ.fbm(x * 2.2, y * 2.2, 3) * 0.6 + (1 - r) * 0.9 - 0.35) * mk; if (t <= 0) return; AR[i] = lerp(AR[i], MUD[0], t); AG[i] = lerp(AG[i], MUD[1], t); AB[i] = lerp(AB[i], MUD[2], t); H[i] -= depth * 0.3 * t; }); });
    hayBits.forEach(function (hb) { var x2 = hb[0] + Math.cos(hb[2]) * hb[3], y2 = hb[1] + Math.sin(hb[2]) * hb[3], s2 = seg(hb[0], hb[1], x2, y2, 0.006), bb = bbox(s2, 0.01); forBox(bb[0], bb[1], bb[2], bb[3], function (i, x, y) { if (sd(s2, x, y) < mpp * 0.4) { var z = Math.max(H[i], depth * 0.9) + 0.004; H[i] = z; AR[i] = HAY[0]; AG[i] = HAY[1]; AB[i] = HAY[2]; SN[i] = 0; } }); });
  }
  // }BEAST-R

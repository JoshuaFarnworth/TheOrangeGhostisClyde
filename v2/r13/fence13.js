  // FENCE{  round 13: fences built the way they are built (posts, rails, infill), one profile drives side, plan and shadow
  // refs: wood picket/privacy posts 6-8 ft o.c., 4x4 posts, 2 rails (3 above 4 ft) ~6 in from top and bottom, pickets 2-5 in above grade;
  // chain link: terminal posts (dome caps) at ends/gates, line posts <=10 ft o.c. (loop caps), continuous top rail, 2 in diamond mesh, bottom tension wire;
  // screen block: 12x12x4 in blocks in stack bond, column/pilaster blocks at the ends and <=10 ft apart, a cap on top; CMU 8x8x16 with a cap.
  function fenceSpec(kind, RF) {
    var s = { kind: kind, th: 0.03 };
    var PAINT = [0.8, 0.8, 0.77], CEDAR = [0.34, 0.25, 0.18], GREY = [0.36, 0.34, 0.31], GALV = [0.36, 0.37, 0.37], IRON = [0.035, 0.035, 0.04], CONC = [0.56, 0.55, 0.51];
    if (kind === 'picket') { s.H = RF.range(0.9, 1.22); s.ps = RF.range(1.83, 2.44); s.pw = 0.089; s.bw = RF.pick([0.064, 0.089, 0.089, 0.114]); s.gap = s.bw * RF.range(0.55, 0.85); s.top = RF.pick(['point', 'point', 'dog', 'flat', 'round']);
      s.capped = RF.chance(0.6); s.postTop = s.capped ? s.H + 0.05 : s.H - 0.07; s.rails = [0.18, s.H - 0.17]; s.bot = 0.07; s.col = RF.chance(0.75) ? PAINT : GREY; }
    else if (kind === 'chain') { s.H = RF.pick([1.22, 1.22, 1.52, 1.83]); s.ps = RF.range(2.6, 3.05); s.col = RF.chance(0.8) ? GALV : [0.05, 0.12, 0.07]; s.mesh = 0.05; s.wire = 0.003; }
    else if (kind === 'rail') { s.H = RF.range(1.05, 1.25); s.ps = RF.range(3.0, 3.35); s.n = RF.chance(0.6) ? 2 : 3; s.col = GREY; s.seed = RF.range(0, 99); }
    else if (kind === 'board') { s.H = RF.range(1.3, 1.5); s.ps = 2.44; s.pw = RF.chance(0.5) ? 0.14 : 0.089; s.n = RF.chance(0.5) ? 3 : 4; s.capBoard = RF.chance(0.4); s.col = RF.chance(0.4) ? PAINT : RF.chance(0.5) ? [0.07, 0.065, 0.06] : GREY; }
    else if (kind === 'privacy') { s.H = RF.range(1.6, 1.85); s.ps = RF.range(1.83, 2.44); s.bw = 0.14; s.box = RF.chance(0.45); s.capRail = RF.chance(0.5); s.top = s.capRail ? 'flat' : RF.pick(['flat', 'dog']); s.col = RF.chance(0.6) ? CEDAR : GREY; s.th = 0.07; }
    else if (kind === 'iron') { s.H = RF.range(1.1, 1.5); s.ps = RF.range(1.83, 2.44); s.pw = 0.064; s.bar = 0.016; s.pitch = RF.range(0.1, 0.125); s.spear = RF.chance(0.6); s.col = IRON; }
    else if (kind === 'breeze') { s.rows = RF.int(3, 5); s.B = 0.305; s.H = 0.2 + s.rows * s.B + 0.05; s.nb = RF.int(7, 9); s.ps = s.nb * s.B + 0.3; s.pat = RF.pick(['circle', 'diamond', 'cross', 'leaf']); s.col = RF.chance(0.6) ? [0.78, 0.76, 0.7] : CONC; s.th = 0.1; }
    else if (kind === 'cmu') { s.H = RF.range(0.8, 1.4); s.ps = 3.05; s.col = CONC; s.th = 0.2; }
    return s;
  }
  function fcov(d, aw) { var v = 0.5 - d / aw; return v < 0 ? 0 : v > 1 ? 1 : v; }
  function fposts(s, a, len) { if (s.leaf) return [a < len / 2 ? a : a - len, 0]; var n = Math.max(1, Math.round(len / s.ps)), sp = len / n, k = Math.round(a / sp); return [a - k * sp, sp, k === 0 || k === n]; }
  function breezeOpen(pat, x, y) {   // x, y in [0,1] across one block face; true where light passes
    var cx = x - 0.5, cy = y - 0.5, f = Math.max(Math.abs(cx), Math.abs(cy)); if (f > 0.4) return false;
    if (pat === 'circle') { var r = Math.hypot(cx, cy); return Math.abs(r - 0.3) > 0.065; }
    if (pat === 'diamond') { var m = Math.abs(cx) + Math.abs(cy); return Math.abs(m - 0.29) > 0.06; }
    if (pat === 'cross') return Math.abs(cx) > 0.055 && Math.abs(cy) > 0.055;
    var q = Math.min(Math.hypot(cx - 0.19, cy), Math.hypot(cx + 0.19, cy), Math.hypot(cx, cy - 0.19), Math.hypot(cx, cy + 0.19)); return q < 0.15 || Math.hypot(cx, cy) < 0.06;
  }
  // coverage (0..1) of the fence plane at distance a along it and height z; aw = footprint for antialiasing; sh = [da, dz] per metre through its thickness
  function fenceOcc(s, a, z, aw, len, sh) {
    if (z < 0 || z > s.H + 0.2) return 0;
    var P = fposts(s, a, len), dp = P[0], term = P[2], d = 1e9, k = s.kind;
    if (k === 'picket') {
      if (!s.leaf) { d = Math.max(Math.abs(dp) - s.pw / 2, z - s.postTop); if (s.capped) d = Math.min(d, Math.max(Math.abs(dp) - 0.065, Math.abs(z - s.postTop - 0.012) - 0.012)); }
      else d = Math.max(Math.min(Math.abs(dp), Math.abs(a - len)) - 0.035, z - s.H + 0.1);
      for (var r = 0; r < 2; r++) d = Math.min(d, Math.abs(z - s.rails[r]) - 0.044);
      var b0 = s.leaf ? 0 : s.pw / 2 + s.gap * 0.5, pm = s.bw + s.gap, x = ((Math.abs(dp) - b0) % pm + pm) % pm;
      if (Math.abs(dp) > b0 - 0.001) { var c = Math.abs(x - s.bw / 2), tp = s.H;
        if (s.top === 'point') tp = s.H - c * 0.9; else if (s.top === 'dog') tp = s.H - Math.max(0, c - s.bw * 0.22); else if (s.top === 'round') tp = s.H - s.bw / 2 + Math.sqrt(Math.max(0, s.bw * s.bw / 4 - c * c));
        d = Math.min(d, Math.max(c - s.bw / 2, z - tp, s.bot - z)); }
      return fcov(d, aw);
    }
    if (k === 'chain') {
      var pr = term ? 0.03 : 0.021, ptop = term ? s.H + 0.04 : s.H;
      d = Math.max(Math.abs(dp) - pr, z - ptop); if (term) d = Math.min(d, Math.max(Math.abs(dp) - 0.036, Math.abs(z - ptop) - 0.03));
      d = Math.min(d, Math.abs(z - (s.H - 0.02)) - 0.021, Math.abs(z - 0.05) - 0.002);
      var solid = fcov(d, aw); if (z < 0.05 || z > s.H - 0.02) return solid;
      var p = (a + z) * 0.7071, q = (a - z) * 0.7071, m = s.mesh, dm = Math.min(Math.abs(((p % m) + m) % m - m / 2), Math.abs(((q % m) + m) % m - m / 2));
      var fine = fcov(m / 2 - dm - s.wire / 2, aw), mean = 2 * s.wire / m + (s.snowMesh || 0), t = clamp((aw - 0.012) / 0.02, 0, 1);
      return Math.max(solid, lerp(fine, mean, t));
    }
    if (k === 'rail') {
      var j = Math.round(a / (len / Math.max(1, Math.round(len / s.ps)))), wob = 0.03 * Math.sin(j * 2.3 + s.seed);
      d = Math.max(Math.abs(dp) - 0.075, z - s.H - wob);
      for (var r = 0; r < s.n; r++) { var zr = s.H * (s.n === 2 ? [0.42, 0.85][r] : [0.3, 0.6, 0.88][r]) + 0.025 * Math.sin(a * 0.7 + r + s.seed); d = Math.min(d, Math.abs(z - zr) - 0.065); }
      return fcov(d, aw);
    }
    if (k === 'board') {
      d = Math.max(Math.abs(dp) - s.pw / 2, z - s.H - (s.capBoard ? 0 : 0.04));
      for (var r = 0; r < s.n; r++) d = Math.min(d, Math.abs(z - (s.H - 0.07 - r * (s.H - 0.35) / (s.n - 1))) - 0.07);
      if (s.capBoard) d = Math.min(d, Math.abs(z - s.H - 0.02) - 0.02);
      return fcov(d, aw);
    }
    if (k === 'privacy') {
      var tp = s.H; if (s.top === 'dog') { var pm2 = s.box ? 0.24 : s.bw + 0.004, x2 = ((a % pm2) + pm2) % pm2, c2 = Math.abs(x2 - s.bw / 2); tp = s.H - Math.max(0, c2 - s.bw * 0.25); }
      if (z > tp + (s.capRail ? 0.04 : 0)) return 0;
      if (s.capRail && z > tp) return 1;
      if (z < 0.05) return 0;
      if (!s.box) { var x3 = ((a % (s.bw + 0.004)) + s.bw + 0.004) % (s.bw + 0.004); return x3 > s.bw ? 0.6 : 1; }
      // shadowbox: boards alternate either side of the rails; light slips through only at a slant
      var fr = function (u) { var x4 = ((u % 0.24) + 0.24) % 0.24; return x4 < s.bw; }, bk = function (u) { var x4 = ((u - 0.12) % 0.24 + 0.24) % 0.24; return x4 < s.bw; };
      var du = (sh ? sh[0] : 0) * 0.06; return fr(a) || bk(a + du) ? 1 : 0;
    }
    if (k === 'iron') {
      d = Math.max(Math.abs(dp) - s.pw / 2, z - s.H - 0.05); d = Math.min(d, Math.hypot(dp, z - s.H - 0.07) - 0.04);
      var tr = s.spear ? s.H - 0.12 : s.H - 0.02; d = Math.min(d, Math.abs(z - 0.1) - 0.02, Math.abs(z - tr) - 0.02, s.H > 1.3 ? Math.abs(z - tr + 0.12) - 0.015 : 1e9);
      var xb = ((a % s.pitch) + s.pitch) % s.pitch, cb = Math.abs(xb - s.pitch / 2);
      if (Math.abs(dp) > s.pw) { var bt = s.spear ? s.H - 0.04 + 0.04 * (1 - Math.min(1, cb / 0.016)) : tr; d = Math.min(d, Math.max(cb - s.bar / 2, z - Math.min(bt, s.H - 0.045), 0.06 - z)); if (s.spear) d = Math.min(d, Math.max(cb - 0.016 + (z - (s.H - 0.06)) * 0.4, Math.abs(z - (s.H - 0.03)) - 0.035)); }
      return fcov(d, aw);
    }
    if (k === 'breeze') {
      if (z > s.H) { var cw = 0.36; return Math.abs(dp) < cw / 2 && z < s.H + 0.1 ? 1 : 0; }
      if (Math.abs(dp) < 0.15 || z < 0.2 || z > s.H - 0.05) return 1;
      var u0 = Math.abs(dp) - 0.15, bx = u0 / s.B, bz = (z - 0.2) / s.B, sx = bx - Math.floor(bx), sz = bz - Math.floor(bz);
      if (sx < 0.016 || sx > 0.984 || sz < 0.016 || sz > 0.984) return 1;   // mortar joints
      var o1 = breezeOpen(s.pat, sx, sz); if (!o1) return 1;
      if (sh) { var ex = (u0 + sh[0] * s.th) / s.B, ez = (z - 0.2 + sh[1] * s.th) / s.B; if (Math.floor(ex) !== Math.floor(bx) || Math.floor(ez) !== Math.floor(bz)) return 1; if (!breezeOpen(s.pat, ex - Math.floor(ex), ez - Math.floor(ez))) return 1; }
      return 0;
    }
    if (k === 'cmu') return z < s.H + 0.05 ? 1 : 0;
    return 0;
  }
  // straight down: what tops the fence at offset v across it -> [height, r, g, b, snowable, cap width for snow]
  function fenceTop(s, a, v, len) {
    var P = fposts(s, a, len), dp = P[0], term = P[2], k = s.kind, av = Math.abs(v), C = s.col;
    if (k === 'picket') {
      if (!s.leaf && Math.abs(dp) < (s.capped ? 0.065 : s.pw / 2) && av < (s.capped ? 0.065 : s.pw / 2)) return [s.postTop + (s.capped ? 0.025 : 0), C[0], C[1], C[2], 1, s.capped ? 0.13 : 0.09];
      if (v > 0.045 && v < 0.064) { var pm = s.bw + s.gap, b0 = s.pw / 2 + s.gap * 0.5, x = ((Math.abs(dp) - b0) % pm + pm) % pm; if (x < s.bw && Math.abs(dp) > b0) return [s.H, C[0] * 0.95, C[1] * 0.95, C[2] * 0.95, s.top === 'flat' ? 0.5 : 0, 0.02]; }
      if (v > 0.007 && v < 0.045) return [s.rails[1] + 0.044, C[0] * 0.85, C[1] * 0.85, C[2] * 0.85, 1, 0.038];
      return null;
    }
    if (k === 'chain') {
      var pr = term ? 0.036 : 0.025; if (Math.hypot(dp, v) < pr) return [term ? s.H + 0.07 : s.H + 0.01, C[0], C[1], C[2], 1, pr * 2];
      if (av < 0.021) return [s.H - 0.02 + 0.021 * Math.sqrt(1 - (v / 0.021) * (v / 0.021)), C[0], C[1], C[2], 0.7, 0.042];
      if (v > 0.021 && v < 0.026) return [s.H - 0.06, C[0] * 0.8, C[1] * 0.8, C[2] * 0.8, 0.25, 0.005];   // the mesh selvage, a hairline
      return null;
    }
    if (k === 'rail') {
      if (Math.hypot(dp, v) < 0.08) return [s.H, C[0], C[1], C[2], 1, 0.15];
      if (av < 0.065) return [s.H * 0.86, C[0] * 0.9, C[1] * 0.9, C[2] * 0.9, 1, 0.13];
      return null;
    }
    if (k === 'board') {
      if (s.capBoard && av < 0.07) return [s.H + 0.04, C[0], C[1], C[2], 1, 0.14];
      if (Math.abs(dp) < s.pw / 2 && av < s.pw / 2) return [s.H + 0.04, C[0] * 0.8, C[1] * 0.8, C[2] * 0.8, 1, s.pw];
      if (v > s.pw / 2 - 0.001 && v < s.pw / 2 + 0.025) return [s.H - 0.0, C[0], C[1], C[2], 0.6, 0.025];
      return null;
    }
    if (k === 'privacy') {
      if (s.capRail && av < 0.07) return [s.H + 0.04, C[0], C[1], C[2], 1, 0.14];
      if (s.box ? av < 0.05 && av > 0.03 : av < 0.01) return [s.H, C[0], C[1], C[2], 0.3, 0.02];
      if (!s.box && Math.abs(dp) < 0.045 && v < -0.01 && v > -0.1) return [s.H - 0.1, C[0] * 0.7, C[1] * 0.7, C[2] * 0.7, 1, 0.09];
      return null;
    }
    if (k === 'iron') {
      if (Math.hypot(dp, v) < 0.04) return [s.H + 0.11, C[0], C[1], C[2], 0.8, 0.08];
      if (av < s.pw / 2 && Math.abs(dp) < s.pw / 2) return [s.H + 0.05, C[0], C[1], C[2], 1, 0.064];
      if (av < 0.012) return [s.spear ? s.H - 0.1 : s.H - 0.0, C[0], C[1], C[2], 0.35, 0.025];
      return null;
    }
    if (k === 'breeze') {
      if (Math.abs(dp) < 0.18 && av < 0.18) return [s.H + 0.1, C[0], C[1], C[2], 1, 0.36];
      if (av < 0.065) return [s.H, C[0] * 0.95, C[1] * 0.95, C[2] * 0.95, 1, 0.13];
      return null;
    }
    if (k === 'cmu') { if (av < 0.115) return [s.H + 0.05, C[0], C[1], C[2], 1, 0.23]; return null; }
    return null;
  }
  // }FENCE

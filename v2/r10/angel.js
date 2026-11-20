  var AGR = null;   // snow shoved outward by the sweeping arms and legs
  if (angel) {
    AGR = new Float32Array(PN);
    var ca = Math.cos(angel.a), sa = Math.sin(angel.a), as = angel.s, sd0 = angel.seed;
    function ell(u, v, cu, cv, a, b) { return (Math.hypot((u - cu) / a, (v - cv) / b) - 1) * Math.min(a, b); }
    function cap(du, dv, ang, len, w) { var dxa = -Math.cos(ang), dya = Math.sin(ang), t = clamp(du * dxa + dv * dya, 0, len); return Math.hypot(du - dxa * t, dv - dya * t) - w; }
    forBox(angel.x - 2 * as, angel.y - 2 * as, angel.x + 2 * as, angel.y + 2 * as, function (i, x, y) {
      var dx = x - angel.x, dy = y - angel.y, u = (dx * ca + dy * sa) / as, v = (-dx * sa + dy * ca) / as, av = Math.abs(v), sg = v > 0 ? 1 : -1;   // u: hips to head, in adult metres
      var nz = NZ.n2(u * 7 + sd0, v * 7), nz2 = NZ.n2(u * 19 - sd0, v * 19), e = 0.03, val = 0, rim = 0;
      function sh(dd) { return sstep(e, -e, dd); }
      // head in a hood, neck, broad shoulders, a coat over the hips; the seat of the coat sinks deepest
      var dHead = ell(u, v, 0.72, 0, 0.145, 0.12) + 0.01 * nz;
      var dNeck = Math.max(Math.abs(u - 0.56) - 0.07, av - 0.075);
      var dSh = ell(u, v, 0.37, 0, 0.17, 0.245) + 0.012 * nz, dHip = ell(u, v, 0.06, 0, 0.24, 0.215) + 0.012 * nz;
      var dTorso = Math.min(dSh, dHip, dNeck);
      val = Math.max(val, sh(dHead) * 0.95, sh(dTorso) * (0.88 + 0.03 * sh(ell(u, av, 0.33, 0.1, 0.1, 0.08)) + 0.02 * nz2));
      val = Math.max(val, sh(ell(u, v, -0.02, 0, 0.17, 0.2) + 0.02 * nz) * 0.92);   // buttocks
      // arms: swept from the sides to over the head, a full fan with a packed outer edge
      var du = u - 0.44, dvo = av - 0.2, r = Math.hypot(du, dvo), al = Math.atan2(dvo, -du), La = (0.74 + 0.025 * nz) * (sg > 0 ? 1.03 : 0.97), lo = 0.1, hi = angel.armMax;
      var dA = Math.max(lo - al, al - hi) * Math.max(r, 0.15), dFan = Math.max(r - La, dA - 0.05), fan = sh(dFan);
      if (fan > 0) {
        var band = sstep(La - 0.16, La - 0.04, r);
        val = Math.max(val, fan * (0.76 + 0.03 * nz + 0.12 * band));
      }
      var hd = Math.hypot(du + Math.cos(hi - 0.04) * (La - 0.08), dvo - Math.sin(hi - 0.04) * (La - 0.08)) - 0.07; val = Math.max(val, sh(hd) * 0.9 * fan);   // mitts at the top of the sweep
      if (dA < 0.02) rim = Math.max(rim, sstep(0.11, 0.0, r - La) * sstep(-0.02, 0.025, r - La) * sstep(0.06, -0.02, dA));
      // legs: opened and closed, a skirt with heels packing its hem
      var lu = u + 0.02, lvo = av - 0.1, lr = Math.hypot(lu, lvo), ps = Math.atan2(lvo, -lu), Ll = 0.9 + 0.025 * nz, lm = angel.legMax;
      var dL = Math.max(lr - Ll, Math.max(-0.1 - ps, ps - lm) * lr - 0.08), sk = sh(dL);
      if (sk > 0) val = Math.max(val, sk * (0.74 + 0.03 * nz + 0.12 * sstep(Ll - 0.16, Ll - 0.05, lr)));
      [0.02, lm].forEach(function (aa) { val = Math.max(val, sh(Math.hypot(lu + Math.cos(aa) * (Ll - 0.06), lvo - Math.sin(aa) * (Ll - 0.06)) - 0.055) * 0.9); });   // heels
      if (ps > -0.1 && ps < lm + 0.06) rim = Math.max(rim, sstep(0.1, 0.0, lr - Ll) * sstep(-0.02, 0.025, lr - Ll) * sstep(0.08, 0.3, ps));   // the hem is broken where they stepped out
      // getting up: a hand pushed down by the hip, the seat scuffed, maybe a roll onto the knees
      val = Math.max(val, sh(ell(u, v, -0.04, angel.hand * 0.37, 0.085, 0.06) + 0.01 * nz2) * 1.0);
      val = Math.max(val, sh(ell(u, v, -0.27, 0, 0.21, 0.15) + 0.06 * nz + 0.03 * nz2) * (0.86 + 0.06 * nz2));
      if (angel.knee) { val = Math.max(val, sh(ell(u, v, -0.52, 0.11, 0.1, 0.06) + 0.01 * nz2) * 0.9, sh(ell(u, v, -0.55, -0.11, 0.1, 0.06) + 0.01 * nz2) * 0.9, sh(ell(u, v, -0.86, 0.1, 0.06, 0.04)) * 0.9, sh(ell(u, v, -0.88, -0.1, 0.06, 0.04)) * 0.9); }
      val = clamp(val, 0, 1);
      if (val > Fp[i]) Fp[i] = val;
      AGR[i] = rim * (1 - val);
    });
  }

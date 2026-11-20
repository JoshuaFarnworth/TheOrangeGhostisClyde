  } else if (/Horses|Cows|Sheep|Goats|Chickens/.test(animals) && farm) {   // livestock: one species, its own feet and gait, and the ground around the feed churned
    var spn = { Horses: 'horse', Cows: 'cow', Sheep: 'sheep', Goats: 'goat', Chickens: 'chicken' }[animals], RL2 = RAn.fork('stock');
    var padPt = function (R2) { for (var t = 0; t < 40; t++) { var lx = R2.range(1, WM - 1), ly = R2.range(farm.line(lx) + 1.2, HM - 0.6), p = T(lx, ly); if (okPt(p)) return p; } return null; };
    var shod = RL2.chance(0.45), hk = shod ? 9 : 8;
    var G = {   // per step: [lateral offset, print kind, length, width, step length]
      horse: [0.1, hk, 0.135, 0.13, 0.8], cow: [0.15, 5, 0.125, 0.12, 0.62], sheep: [0.075, 5, 0.065, 0.05, 0.33], goat: [0.07, 5, 0.06, 0.045, 0.36]
    }[spn];
    var feeds = farm.feed;
    if (spn !== 'chicken') {
      var mkGait = function () { var side = 1, last = [null, null]; return function (x, y, hx, hy) { side = -side; var qx = x - hy * G[0] * side, qy = y + hx * G[0] * side, an = Math.atan2(hy, hx), li = side > 0 ? 1 : 0;
        if (depth > 0.15 && last[li] && G[2] > 0.1) prints.push(qx - hx * 0.25, qy - hy * 0.25, 0, 0.03, 0, 2, 0.5, qx - hx * 0.06, qy - hy * 0.06);   // deep snow: the hooves drag
        last[li] = [qx, qy];
        prints.push(qx, qy, an, G[2], G[3], G[1], 0.95, 0, 0);   // fore
        var ov = spn === 'horse' ? 0.06 : -0.03; prints.push(qx + hx * ov, qy + hy * ov, an, G[2] * 0.95, G[3] * (spn === 'horse' ? 0.86 : 0.95), G[1], 0.9, 0, 0);   // hind, into or just past the fore print
      }; };
      var nA = { horse: RL2.int(2, 4), cow: RL2.int(3, 6), sheep: RL2.int(5, 9), goat: RL2.int(3, 6) }[spn], single = spn === 'sheep' && RL2.chance(0.7);
      var lead = padPt(RL2), tgt = feeds.length ? [feeds[0].x, feeds[0].y] : padPt(RL2);
      for (var k = 0; k < nA && lead && tgt; k++) {
        var from = single ? [lead[0] + RL2.gaussian(0, 0.15), lead[1] + RL2.gaussian(0, 0.15)] : padPt(RL2) || lead, ang0 = RL2.range(0, TAU), F0 = feeds.length ? feeds[k % feeds.length] : null;
        var to = F0 ? nearFree([F0.x + Math.cos(ang0) * ((F0.R || F0.hu) + 0.9), F0.y + Math.sin(ang0) * ((F0.R || F0.hu) + 0.9)], RL2, 0.3) : padPt(RL2);
        if (from && to) { var end = ani(RL2, 'stk' + k, from, to, { step: G[4] * RL2.range(0.92, 1.08), gait: mkGait(), wander: single ? 0.15 : 0.45 }); if (RL2.chance(0.5)) { var nx2 = padPt(RL2); if (nx2) ani(RL2, 'stk2' + k, end, nx2, { step: G[4], gait: mkGait(), wander: 0.5 }); } }
      }
      feeds.forEach(function (F) {   // trampled ring: they stood here in turns, facing the feed
        var R0 = (F.R || Math.max(F.hu, F.hv)) + 0.15, n = { horse: 220, cow: 300, sheep: 420, goat: 360 }[spn] * (F.k === 'feeder' ? 1 : 0.6);
        for (var j = 0; j < n; j++) { var an = RL2.range(0, TAU), rr = R0 + Math.abs(RL2.gaussian(0, spn === 'sheep' || spn === 'goat' ? 0.6 : 0.9)), x = F.x + Math.cos(an) * rr, y = F.y + Math.sin(an) * rr; if (!okPt([x, y])) continue;
          prints.push(x, y, an + PI + RL2.gaussian(0, 0.5), G[2], G[3] * (spn === 'horse' ? RL2.pick([1, 0.86]) : 1), G[1], RL2.range(0.7, 1), 0, 0); }
        if (spn === 'horse' || spn === 'cow') for (var j = 0; j < 30; j++) { var an = RL2.range(0, TAU), rr = R0 + Math.abs(RL2.gaussian(0, 0.6)), x = F.x + Math.cos(an) * rr, y = F.y + Math.sin(an) * rr, a2 = RL2.range(0, TAU); prints.push(x, y, 0, 0.05, 0, 2, 0.6, x + Math.cos(a2) * 0.3, y + Math.sin(a2) * 0.3); }   // shuffled, scuffed
      });
      if (RL2.chance(0.5) && feeds.length) {   // the animals themselves, some of them, at the feed
        var S0 = BEAST[spn], nb = { horse: RL2.int(1, 3), cow: RL2.int(1, 4), sheep: RL2.int(2, 6), goat: RL2.int(2, 4) }[spn], F = feeds[0], placed = [];
        var col = spn === 'horse' ? RL2.weighted([[[0.28, 0.14, 0.07], 30], [[0.4, 0.18, 0.07], 22], [[0.06, 0.05, 0.05], 14], [[0.62, 0.61, 0.58], 18], [[0.66, 0.52, 0.3], 8]]) : null;
        var cowT = RL2.weighted([['angus', 40], ['red', 15], ['holstein', 25], ['hereford', 20]]), sheepF = RL2.chance(0.5), goatC = [[0.8, 0.79, 0.76], [0.38, 0.25, 0.14], [0.1, 0.09, 0.09]];
        for (var k = 0; k < nb; k++) {
          var an = RL2.range(0, TAU), R0 = (F.R || F.hu) + S0.L * 0.5 + S0.nl * 0.6 + 0.1, p = [F.x + Math.cos(an) * R0, F.y + Math.sin(an) * R0];
          if (!okPt(p) || !farFrom(p, placed, S0.L * 0.95)) continue; placed.push(p);
          var b = { sp: spn, S: Object.assign({}, S0), x: p[0], y: p[1], a: an + PI + RL2.gaussian(0, 0.25), yaw: RL2.gaussian(0, 0.25), seed: RL2.range(0, 99), snowK: RL2.range(0.4, 1) };
          var sc = RL2.range(0.92, 1.08); ['L', 'W', 'nl', 'hl', 'hw', 'nw'].forEach(function (q) { b.S[q] *= sc; }); b.Hb = S0.Hb * sc;
          b.headZ = F.k === 'feeder' ? RL2.range(0.7, 1.0) : F.k === 'tank' || F.k === 'trough' ? 0.5 : 0.3;
          if (spn === 'horse') { b.col = col; b.mane = col[0] > 0.6 ? [0.78, 0.76, 0.72] : col[0] > 0.35 && col[2] < 0.1 ? [0.33, 0.15, 0.06] : [0.04, 0.035, 0.03]; if (RL2.chance(0.4)) { b.pat = 'blanket'; b.col2 = RL2.pick([[0.08, 0.12, 0.28], [0.1, 0.22, 0.12], [0.35, 0.07, 0.08], [0.15, 0.15, 0.16]]); } col = RL2.chance(0.5) ? col : RL2.pick([[0.28, 0.14, 0.07], [0.4, 0.18, 0.07], [0.62, 0.61, 0.58]]); }
          else if (spn === 'cow') { if (cowT === 'angus') b.col = [0.05, 0.045, 0.045]; else if (cowT === 'red') b.col = [0.32, 0.12, 0.06]; else if (cowT === 'holstein') { b.col = [0.78, 0.77, 0.74]; b.col2 = [0.04, 0.04, 0.04]; b.pat = 'holstein'; b.headCol = [0.04, 0.04, 0.04]; } else { b.col = [0.4, 0.16, 0.07]; b.headCol = [0.82, 0.8, 0.76]; } }
          else if (spn === 'sheep') { b.col = [0.72, 0.68, 0.6]; b.headCol = sheepF ? [0.08, 0.07, 0.07] : [0.7, 0.66, 0.6]; }
          else { b.col = RL2.pick(goatC); b.headCol = b.col; }
          beasts.push(b);
        }
      }
    } else {   // hens: bird feet in clusters round the coop door, none far from it
      var Co = farm.coop, dpos = [Co.x + Co.c * (Co.hu + 0.5), Co.y + Co.s * (Co.hu + 0.5)], nh = RL2.int(4, 9);
      for (var h = 0; h < nh; h++) { var x = dpos[0] + RL2.gaussian(0, 0.6), y = dpos[1] + RL2.gaussian(0, 0.6), an = RL2.range(0, TAU), ns = RL2.int(15, 60), side = 1;
        for (var s = 0; s < ns; s++) { an += RL2.gaussian(0, 0.45); var st = RL2.range(0.09, 0.13), nx = x + Math.cos(an) * st, ny = y + Math.sin(an) * st;
          if (!okPt([nx, ny]) || Math.hypot(nx - dpos[0], ny - dpos[1]) > 4.5) { an += PI * 0.8; continue; } x = nx; y = ny; side = -side;
          prints.push(x - Math.sin(an) * 0.03 * side, y + Math.cos(an) * 0.03 * side, an + side * 0.12, 0.085, 0, 6, 0.85, 0, 0); } }
      if (RL2.chance(0.6)) { var cols = [[0.45, 0.2, 0.08], [0.85, 0.84, 0.8], [0.06, 0.06, 0.07], [0.7, 0.5, 0.25]], nc = RL2.int(2, 6), fc = RL2.pick(cols);
        for (var k = 0; k < nc; k++) { var q = nearFree(dpos, RL2, 0.9); if (!q) continue; var c = RL2.chance(0.7) ? fc : RL2.pick(cols); beasts.push({ sp: 'chicken', S: Object.assign({}, BEAST.chicken), x: q[0], y: q[1], a: RL2.range(0, TAU), yaw: RL2.gaussian(0, 0.4), seed: RL2.range(0, 99), snowK: 0, Hb: BEAST.chicken.Hb, headZ: RL2.chance(0.5) ? 0.12 : 0.4, col: c, col2: c[0] > 0.6 ? c : [0.05, 0.05, 0.05] }); } }
    }

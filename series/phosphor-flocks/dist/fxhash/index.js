/* clyde.js: shared platform adapter + toolkit. One codebase that runs on
 * Aleatory ($alea, ALEATORY-001 §7), fxhash ($fx, @fxhash/project-sdk), Highlight (hl-gen.js),
 * Verse (?payload=) or standalone (?hash=...). To add a platform, add one branch here.
 * Every random value is derived from the platform's own seeded stream.
 */
(function (W) {
  'use strict';
  var q = new URLSearchParams(W.location ? W.location.search : '');

  // ---- platform detection -------------------------------------------------
  var platform, seedStr, baseRand, setFeatures, signalDone;
  if (W.$alea && typeof W.$alea.rand === 'function' && W.$alea.seed != null) {
    platform = 'aleatory';
    seedStr = String(W.$alea.seed);
    baseRand = W.$alea.rand;
    setFeatures = function (f) { W.$alea.features(f); };
    signalDone = function () { W.$alea.ready(); };
  } else if (W.$fx && typeof W.$fx.rand === 'function') {
    platform = 'fxhash';
    seedStr = String(W.$fx.hash);
    baseRand = W.$fx.rand;
    setFeatures = function (f) { W.$fx.features(f); };
    signalDone = function () { W.$fx.preview(); };
  } else if (typeof hl !== 'undefined' && hl && typeof hl.random === 'function' && hl.token) {
    // Highlight (hl-gen.js): note `hl` is a top-level const, not a window property
    platform = 'highlight';
    seedStr = String(hl.tx.hash);
    baseRand = function () { return hl.random(); };
    setFeatures = function (f) { hl.token.setTraits(f); };
    signalDone = function () { hl.token.capturePreview(); };
  } else if (q.get('payload')) {
    // Verse "Random Generative JS": base64 JSON payload {hash, editionNumber, totalEditions, input}
    platform = 'verse';
    var pl = {}; try { pl = JSON.parse(atob(q.get('payload'))); } catch (e) {}
    seedStr = String(pl.hash || '0x0');
    baseRand = sfc32.apply(null, cyrb128(seedStr));
    setFeatures = function (f) { W.$artifact = W.$artifact || {}; W.$artifact.features = f; };
    signalDone = function () { console.info('###verse-preview-capture'); W.dispatchEvent(new Event('capture-preview')); };
  } else {
    platform = 'standalone';
    seedStr = q.get('hash') || q.get('seed') || (function () {
      var h = '0x', c = '0123456789abcdef';
      for (var i = 0; i < 64; i++) h += c[(Math.random() * 16) | 0];
      return h;
    })();
    baseRand = sfc32.apply(null, cyrb128(seedStr));
    setFeatures = function () {};
    signalDone = function () {};
  }

  function cyrb128(str) {
    var h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (var i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067); h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213); h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067); h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213); h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4); h2 ^= h1; h3 ^= h1; h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
  }
  function sfc32(a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  // Root key: four draws from the platform stream (identical count on every path).
  var root = '';
  for (var i = 0; i < 4; i++) root += ((baseRand() * 4294967296) >>> 0).toString(16) + ':';

  function makeRng(label) {
    var s = cyrb128(root + label), next = sfc32(s[0], s[1], s[2], s[3]);
    for (var j = 0; j < 12; j++) next();
    var R = {
      rand: next,
      range: function (a, b) { return a + (b - a) * next(); },
      int: function (a, b) { return Math.floor(a + (b - a + 1) * next()); },
      chance: function (p) { return next() < p; },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      weighted: function (pairs) {
        var t = 0, k; for (k = 0; k < pairs.length; k++) t += pairs[k][1];
        var r = next() * t;
        for (k = 0; k < pairs.length; k++) { r -= pairs[k][1]; if (r < 0) return pairs[k][0]; }
        return pairs[pairs.length - 1][0];
      },
      gaussian: function (m, sd) {
        var u = 1 - next(), v = next();
        return (m || 0) + (sd == null ? 1 : sd) * Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307179586 * v);
      },
      pareto: function (min, alpha) { return min / Math.pow(1 - next(), 1 / alpha); },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var k = a.length - 1; k > 0; k--) { var j2 = Math.floor(next() * (k + 1)); var t2 = a[k]; a[k] = a[j2]; a[j2] = t2; }
        return a;
      },
      fork: function (l) { return makeRng(label + '/' + l); }
    };
    return R;
  }

  // ---- simplex noise 2D (Gustavson), permutation from an rng ----------------
  function makeNoise(R) {
    var p = [], perm = new Uint8Array(512), k;
    for (k = 0; k < 256; k++) p[k] = k;
    p = R.shuffle(p);
    for (k = 0; k < 512; k++) perm[k] = p[k & 255];
    var G = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    var F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    function n2(xin, yin) {
      var s = (xin + yin) * F2, i = Math.floor(xin + s), j = Math.floor(yin + s);
      var t = (i + j) * G2, x0 = xin - (i - t), y0 = yin - (j - t);
      var i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
      var x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      var ii = i & 255, jj = j & 255, n = 0, tt, g;
      tt = 0.5 - x0 * x0 - y0 * y0; if (tt > 0) { g = G[perm[ii + perm[jj]] & 7]; tt *= tt; n += tt * tt * (g[0] * x0 + g[1] * y0); }
      tt = 0.5 - x1 * x1 - y1 * y1; if (tt > 0) { g = G[perm[ii + i1 + perm[jj + j1]] & 7]; tt *= tt; n += tt * tt * (g[0] * x1 + g[1] * y1); }
      tt = 0.5 - x2 * x2 - y2 * y2; if (tt > 0) { g = G[perm[ii + 1 + perm[jj + 1]] & 7]; tt *= tt; n += tt * tt * (g[0] * x2 + g[1] * y2); }
      return 70 * n; // ~[-1,1]
    }
    function fbm(x, y, oct) {
      var a = 0.5, f = 1, s = 0, n = 0; oct = oct || 4;
      for (var o = 0; o < oct; o++) { s += a * n2(x * f, y * f); n += a; a *= 0.5; f *= 2; }
      return s / n;
    }
    return { n2: n2, fbm: fbm };
  }


  // ---- marching squares -> chained polylines (grid coords) -----------------
  function contours(F, w, h, thr) {
    var segs = [];
    function lerp(a, b) { return (thr - a) / (b - a); }
    for (var y = 0; y < h - 1; y++) for (var x = 0; x < w - 1; x++) {
      var a = F[y * w + x], b = F[y * w + x + 1], c = F[(y + 1) * w + x + 1], d = F[(y + 1) * w + x];
      var idx = (a > thr ? 8 : 0) | (b > thr ? 4 : 0) | (c > thr ? 2 : 0) | (d > thr ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      var T = [x + lerp(a, b), y], R = [x + 1, y + lerp(b, c)], B = [x + lerp(d, c), y + 1], L = [x, y + lerp(a, d)];
      switch (idx) {
        case 1: case 14: segs.push([L, B]); break;
        case 2: case 13: segs.push([B, R]); break;
        case 3: case 12: segs.push([L, R]); break;
        case 4: case 11: segs.push([T, R]); break;
        case 6: case 9: segs.push([T, B]); break;
        case 7: case 8: segs.push([L, T]); break;
        case 5: segs.push([L, T]); segs.push([B, R]); break;
        case 10: segs.push([T, R]); segs.push([L, B]); break;
      }
    }
    return chain(segs);
  }
  function chain(segs) {
    var key = function (p) { return Math.round(p[0] * 1000) + ',' + Math.round(p[1] * 1000); };
    var map = {}, used = new Uint8Array(segs.length), i;
    for (i = 0; i < segs.length; i++) for (var e = 0; e < 2; e++) { var kk = key(segs[i][e]); (map[kk] = map[kk] || []).push(i); }
    var lines = [];
    function nextFrom(p) {
      var l = map[key(p)]; if (!l) return -1;
      for (var j = 0; j < l.length; j++) if (!used[l[j]]) return l[j];
      return -1;
    }
    for (i = 0; i < segs.length; i++) {
      if (used[i]) continue;
      used[i] = 1; var line = [segs[i][0], segs[i][1]];
      for (var dir = 0; dir < 2; dir++) {
        while (true) {
          var end = line[line.length - 1], n = nextFrom(end);
          if (n < 0) break;
          used[n] = 1; var s2 = segs[n];
          line.push(key(s2[0]) === key(end) ? s2[1] : s2[0]);
        }
        line.reverse();
      }
      lines.push(line);
    }
    return lines;
  }
  // ---- exact Euclidean distance transform (Felzenszwalb) -------------------
  // in: Uint8Array mask (1 = feature), returns Float32Array distance in cells
  function edt(mask, w, h) {
    var INF = 1e20, f = new Float64Array(Math.max(w, h)), d = new Float64Array(Math.max(w, h));
    var v = new Int32Array(Math.max(w, h)), z = new Float64Array(Math.max(w, h) + 1);
    var g = new Float64Array(w * h), x, y;
    for (var i = 0; i < w * h; i++) g[i] = mask[i] ? 0 : INF;
    function dt1(n) {
      var k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (var q2 = 1; q2 < n; q2++) {
        var s = ((f[q2] + q2 * q2) - (f[v[k]] + v[k] * v[k])) / (2 * q2 - 2 * v[k]);
        while (s <= z[k]) { k--; s = ((f[q2] + q2 * q2) - (f[v[k]] + v[k] * v[k])) / (2 * q2 - 2 * v[k]); }
        k++; v[k] = q2; z[k] = s; z[k + 1] = INF;
      }
      k = 0;
      for (var q3 = 0; q3 < n; q3++) { while (z[k + 1] < q3) k++; d[q3] = (q3 - v[k]) * (q3 - v[k]) + f[v[k]]; }
    }
    for (x = 0; x < w; x++) { for (y = 0; y < h; y++) f[y] = g[y * w + x]; dt1(h); for (y = 0; y < h; y++) g[y * w + x] = d[y]; }
    for (y = 0; y < h; y++) { for (x = 0; x < w; x++) f[x] = g[y * w + x]; dt1(w); for (x = 0; x < w; x++) g[y * w + x] = d[x]; }
    var out = new Float32Array(w * h);
    for (i = 0; i < w * h; i++) out[i] = Math.sqrt(g[i]);
    return out;
  }

  // ---- canvas: fixed virtual space, fixed pixel resolution ------------------
  function setupCanvas(VW, VH, bg) {
    var longSide = parseInt(q.get('res'), 10) || 1600;
    longSide = Math.max(400, Math.min(8000, longSide));
    var k = longSide / Math.max(VW, VH);
    var cv = document.createElement('canvas');
    cv.width = Math.round(VW * k); cv.height = Math.round(VH * k);
    document.body.style.cssText = 'margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:' + (bg || '#111') + ';overflow:hidden';
    document.body.appendChild(cv);
    function fit() {
      var s = Math.min(W.innerWidth / cv.width, W.innerHeight / cv.height);
      cv.style.width = Math.floor(cv.width * s) + 'px'; cv.style.height = Math.floor(cv.height * s) + 'px';
    }
    fit(); W.addEventListener('resize', fit);
    var ctx = cv.getContext('2d');
    ctx.setTransform(k, 0, 0, k, 0, 0); // draw in virtual units
    return { canvas: cv, ctx: ctx, k: k, VW: VW, VH: VH };
  }

  // ---- vector recorder for plotter SVG -------------------------------------
  var vec = { layers: {}, order: [], VW: 1000, VH: 1000 };
  function poly(pts, color, closed) {
    if (!pts || pts.length < 2) return;
    if (!vec.layers[color]) { vec.layers[color] = []; vec.order.push(color); }
    vec.layers[color].push({ p: pts, c: !!closed });
  }
  function svgString(mmLong) {
    mmLong = mmLong || 280;
    var s = mmLong / Math.max(vec.VW, vec.VH), mw = (vec.VW * s).toFixed(1), mh = (vec.VH * s).toFixed(1);
    var o = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="' + mw + 'mm" height="' + mh + 'mm" viewBox="0 0 ' + mw + ' ' + mh + '">'];
    vec.order.forEach(function (col, li) {
      o.push('<g inkscape:groupmode="layer" id="pen' + (li + 1) + '" inkscape:label="' + (li + 1) + ' ' + col + '" fill="none" stroke="' + col + '" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round">');
      vec.layers[col].forEach(function (L) {
        var d = L.p.map(function (p) { return (p[0] * s).toFixed(2) + ',' + (p[1] * s).toFixed(2); }).join(' ');
        o.push(L.c ? '<polygon points="' + d + '"/>' : '<polyline points="' + d + '"/>');
      });
      o.push('</g>');
    });
    o.push('</svg>');
    return o.join('\n');
  }
  function download(name, data, mime) {
    var a = document.createElement('a');
    a.href = typeof data === 'string' && data.indexOf('data:') === 0 ? data : URL.createObjectURL(new Blob([data], { type: mime }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  var C = {
    platform: platform, hash: seedStr, query: q,
    rng: makeRng, noise: makeNoise, setupCanvas: setupCanvas, contours: contours, chain: chain, edt: edt,
    poly: poly, svgString: svgString,
    vectorSpace: function (VW, VH) { vec.VW = VW; vec.VH = VH; },
    plottable: true,
    _features: null,
    features: function (f) { C._features = f; setFeatures(f); },
    done: function (canvas, slug) {
      W.__clyde = { done: true, features: C._features, hash: seedStr, platform: platform };
      signalDone();
      W.addEventListener('keydown', function (e) {
        var base = (slug || 'clyde') + '-' + seedStr.slice(0, 12);
        if (e.key === 's') download(base + '.png', canvas.toDataURL('image/png'));
        if (e.key === 'v' && C.plottable) download(base + '.svg', svgString(), 'image/svg+xml');
      });
    },
    // perceptual-ish colour helpers
    hex2rgb: function (h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; },
    mix: function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; },
    rgba: function (c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; }
  };
  W.CLYDE = C;
})(window);

/* Phosphor Flocks by Clyde (2026), after Craig Reynolds, "Flocks, Herds, and Schools" (boids,
 * 1987), and the vector-display and demoscene tradition of glowing phosphor lines.
 * A flock is simulated, its flight paths become a 2D signed distance field, and the field
 * is lit as glass tubes. Older paths fade as phosphor persistence decays. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RB = R.fork('boids'), RN = R.fork('grain');
  var VW = 1000, VH = 1250;
  var PHOS = {
    'P1 Green':  { bg: '#030805', cols: ['#39ff6a'], old: '#0f6b2a' },
    'P3 Amber':  { bg: '#0a0602', cols: ['#ffb02e'], old: '#7a3a06' },
    'P4 White':  { bg: '#05060a', cols: ['#e6eeff'], old: '#4a5a8a' },
    'P7 Blue':   { bg: '#020510', cols: ['#8ec5ff'], old: '#b8ff4a' },
    'P22 RGB':   { bg: '#050506', cols: ['#ff4b3e', '#3dff7a', '#4b7bff'], old: '#3a2a4a' }
  };
  var phName = RP.weighted([['P1 Green', 28], ['P3 Amber', 24], ['P4 White', 16], ['P7 Blue', 18], ['P22 RGB', 14]]);
  var PH = PHOS[phName];
  var flockName = RL.weighted([['Small', 30], ['Medium', 45], ['Large', 25]]);
  var N = { Small: 34, Medium: 70, Large: 120 }[flockName];
  var mood = RL.weighted([['Calm', 34], ['Murmuration', 42], ['Panic', 24]]);
  var tubeName = RL.weighted([['Hairline', 25], ['Tube', 50], ['Neon', 25]]);
  var TR = { Hairline: 2.2, Tube: 3.6, Neon: 5.4 }[tubeName];
  var groupsName = RL.weighted([['One', 45], ['Two', 35], ['Three', 20]]);
  var NG = { One: 1, Two: 2, Three: 3 }[groupsName];
  var scan = RL.weighted([['Scanlines', 50], ['Clean', 30], ['Interlaced', 20]]);
  C.features({ Phosphor: phName, Flock: flockName, Flocks: groupsName, Mood: mood, Line: tubeName, Display: scan });

  var cv = C.setupCanvas(VW, VH, PH.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);

  // ---- boids ----------------------------------------------------------------
  var W = { Calm:        { sep: 1.2, ali: 0.6, coh: 0.9, max: 2.4, noise: 0.05 },
            Murmuration: { sep: 1.5, ali: 1.4, coh: 0.6, max: 3.2, noise: 0.08 },
            Panic:       { sep: 2.4, ali: 0.7, coh: 0.3, max: 4.2, noise: 0.25 } }[mood];
  var B = [], starts = [];
  for (var gq = 0; gq < 3; gq++) starts.push([RB.range(300, 700), RB.range(350, 900), RB.range(0, Math.PI * 2)]);
  for (var i = 0; i < N; i++) {
    var grp = i % NG, st = starts[grp], a = st[2] + RB.gaussian(0, 0.6), sp = RB.range(1, 2);
    B.push({ g: grp, x: st[0] + RB.gaussian(0, 90), y: st[1] + RB.gaussian(0, 90), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, trail: [], col: PH.cols[i % PH.cols.length] });
  }
  var pred = { x: RB.range(200, 800), y: RB.range(200, 1050), a: RB.range(0, 6.28) };
  var STEPS = 900, PAD = 110;
  // a wandering lure (Lissajous path) that the flock chases across the screen
  var lures = [];
  for (gq = 0; gq < 3; gq++) lures.push([RB.range(0.004, 0.009), RB.range(0.004, 0.009), RB.range(0, 6.28), RB.range(0, 6.28)]);
  function lure(t, g) { var q = lures[g]; return [VW / 2 + (VW / 2 - PAD * 1.8) * Math.sin(q[0] * t + q[2]), VH / 2 + (VH / 2 - PAD * 1.8) * Math.sin(q[1] * t + q[3])]; }
  for (var t = 0; t < STEPS; t++) {
    if (mood === 'Panic') { pred.a += RB.gaussian(0, 0.15); pred.x += Math.cos(pred.a) * 3; pred.y += Math.sin(pred.a) * 3;
      if (pred.x < PAD || pred.x > VW - PAD) pred.a = Math.PI - pred.a; if (pred.y < PAD || pred.y > VH - PAD) pred.a = -pred.a; }
    for (i = 0; i < N; i++) {
      var b = B[i], sx = 0, sy = 0, ax = 0, ay = 0, hx = 0, hy = 0, n = 0;
      for (var j = 0; j < N; j++) {
        if (i === j) continue;
        var o = B[j], dx = b.x - o.x, dy = b.y - o.y, d2 = dx * dx + dy * dy;
        if (d2 < 60 * 60) { ax += o.vx; ay += o.vy; hx += o.x; hy += o.y; n++;
          if (d2 < 22 * 22) { var inv = 1 / (d2 + 1); sx += dx * inv * 22; sy += dy * inv * 22; } }
      }
      var fx = sx * W.sep * 0.05, fy = sy * W.sep * 0.05;
      if (n) { fx += (ax / n - b.vx) * W.ali * 0.05 + (hx / n - b.x) * W.coh * 0.0015; fy += (ay / n - b.vy) * W.ali * 0.05 + (hy / n - b.y) * W.coh * 0.0015; }
      // soft walls
      if (b.x < PAD) fx += (PAD - b.x) * 0.004; if (b.x > VW - PAD) fx -= (b.x - VW + PAD) * 0.004;
      if (b.y < PAD) fy += (PAD - b.y) * 0.004; if (b.y > VH - PAD) fy -= (b.y - VH + PAD) * 0.004;
      if (mood === 'Panic') { var pdx = b.x - pred.x, pdy = b.y - pred.y, pd = Math.hypot(pdx, pdy); if (pd < 160) { fx += pdx / pd * 0.25; fy += pdy / pd * 0.25; } }
      var lu = lure(t, b.g), ldx = lu[0] - b.x, ldy = lu[1] - b.y, ld = Math.hypot(ldx, ldy) + 1;
      fx += ldx / ld * 0.06; fy += ldy / ld * 0.06;
      fx += RB.gaussian(0, W.noise) * 0.2; fy += RB.gaussian(0, W.noise) * 0.2;
      b.vx += fx; b.vy += fy;
      var v = Math.hypot(b.vx, b.vy); if (v > W.max) { b.vx *= W.max / v; b.vy *= W.max / v; } if (v < 0.8) { b.vx *= 0.8 / v; b.vy *= 0.8 / v; }
    }
    for (i = 0; i < N; i++) { B[i].x += B[i].vx; B[i].y += B[i].vy; if (t % 3 === 0) B[i].trail.push([B[i].x, B[i].y]); }
  }
  // keep only the last part of each trail (the visible persistence window)
  var LEN = { Small: 300, Medium: 240, Large: 170 }[flockName];
  B.forEach(function (b) { b.trail = b.trail.slice(-LEN); });

  // ---- rasterise: mask + age/colour id buffer at virtual resolution ---------
  var off = document.createElement('canvas'); off.width = VW; off.height = VH;
  var o = off.getContext('2d');
  o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH); o.lineCap = 'round'; o.lineJoin = 'round';
  // age encoded in R, colour index in G; thick strokes so every pixel near a tube knows its source
  var segs = [];
  B.forEach(function (b, bi) { var ci = PH.cols.indexOf(b.col); for (var k = 1; k < b.trail.length; k++) segs.push([k / b.trail.length, b.trail[k - 1], b.trail[k], ci]); });
  segs.sort(function (p, q) { return p[0] - q[0]; });
  o.lineWidth = TR * 2 + 26;
  segs.forEach(function (s) { o.strokeStyle = 'rgb(' + Math.round(20 + s[0] * 235) + ',' + (s[3] * 80 + 40) + ',0)'; o.beginPath(); o.moveTo(s[1][0], s[1][1]); o.lineTo(s[2][0], s[2][1]); o.stroke(); });
  var ageImg = o.getImageData(0, 0, VW, VH).data;
  o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH); o.strokeStyle = '#fff'; o.lineWidth = 1;
  B.forEach(function (b) { o.beginPath(); o.moveTo(b.trail[0][0], b.trail[0][1]); for (var k = 1; k < b.trail.length; k++) o.lineTo(b.trail[k][0], b.trail[k][1]); o.stroke(); });
  var lineImg = o.getImageData(0, 0, VW, VH).data, mask = new Uint8Array(VW * VH);
  for (i = 0; i < VW * VH; i++) mask[i] = lineImg[i * 4] > 90 ? 1 : 0;
  var D = C.edt(mask, VW, VH);

  // ---- shade the distance field as lit tubes ----------------------------------
  var bg = C.hex2rgb(PH.bg), old = C.hex2rgb(PH.old), cols = PH.cols.map(C.hex2rgb);
  var L = [-0.45, -0.6, 0.66], Ll = Math.hypot(L[0], L[1], L[2]); L = L.map(function (v) { return v / Ll; });
  var Hh = [L[0], L[1], L[2] + 1], Hl = Math.hypot(Hh[0], Hh[1], Hh[2]); Hh = Hh.map(function (v) { return v / Hl; });
  var img = o.createImageData(VW, VH), px = img.data;
  for (var y = 0; y < VH; y++) {
    var scanMul = 1;
    if (scan === 'Scanlines') scanMul = (y % 3 === 2) ? 0.55 : 1;
    else if (scan === 'Interlaced') scanMul = (y % 2) ? 0.7 : 1;
    for (var x = 0; x < VW; x++) {
      var k2 = y * VW + x, d = D[k2], r = bg[0], g = bg[1], bl = bg[2];
      var ar = ageImg[k2 * 4], age = ar > 0 ? (ar - 20) / 235 : 0, ci2 = ar > 0 ? Math.max(0, Math.round((ageImg[k2 * 4 + 1] - 40) / 80)) : 0;
      var col = C.mix(old, cols[Math.min(ci2, cols.length - 1)], Math.pow(Math.max(0, age), 0.8));
      var bright = 0.25 + 0.75 * Math.pow(Math.max(0, age), 1.3);
      if (d < TR) {
        var h = Math.sqrt(TR * TR - d * d) + 1e-3;
        var gx = (D[k2 + 1] || d) - (D[k2 - 1] || d), gy = (D[k2 + VW] || d) - (D[k2 - VW] || d), gl = Math.hypot(gx, gy) || 1;
        var nx = gx / gl * d / h, ny = gy / gl * d / h, nl = Math.hypot(nx, ny, 1);
        nx /= nl; ny /= nl; var nz = 1 / nl;
        var dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        var spec = Math.pow(Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), 40);
        var core = 0.35 + 0.9 * dif;
        r = col[0] * core * bright + 255 * spec * bright; g = col[1] * core * bright + 255 * spec * bright; bl = col[2] * core * bright + 255 * spec * bright;
      }
      var glow = Math.exp(-Math.max(0, d - TR) / (6 + TR)) * 0.55 * bright;
      r += col[0] * glow; g += col[1] * glow; bl += col[2] * glow;
      // vignette + grain
      var vx = x / VW - 0.5, vy = y / VH - 0.5, vig = 1 - 0.55 * (vx * vx + vy * vy) * 2;
      var gr = (RN.rand() - 0.5) * 10;
      px[k2 * 4] = Math.min(255, r * scanMul * vig + gr); px[k2 * 4 + 1] = Math.min(255, g * scanMul * vig + gr); px[k2 * 4 + 2] = Math.min(255, bl * scanMul * vig + gr); px[k2 * 4 + 3] = 255;
    }
  }
  o.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, VW, VH);
  B.forEach(function (b) { C.poly(b.trail, b.col); }); // plotter version: the bare flight paths
  C.done(cv.canvas, 'phosphor-flocks');
})();

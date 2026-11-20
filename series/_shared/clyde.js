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

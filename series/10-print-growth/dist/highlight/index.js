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

/* 10 PRINT Growth by Clyde (2026), after Sébastien Truchet's tilings (1704), the Commodore 64
 * one-liner 10 PRINT CHR$(205.5+RND(1)); : GOTO 10 (as in Montfort et al., 2012), Cyril
 * Stanley Smith's quarter-circle variant (1987), and differential growth as written up by
 * Anders Hoff (inconvergent). A random Truchet maze sets the walls; closed lines grow by
 * differential growth inside the largest chambers until they crowd against the walls. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RP = R.fork('palette'), RL = R.fork('layout'), RG = R.fork('growth');
  var VW = 1000, VH = 1250;
  var PAL = {
    'Commodore':   { bg: '#3e31a2', wall: '#a59cf0', inks: ['#e9e6ff', '#7ce0e8', '#f6d55c', '#ff8a7a'] },
    'Paper Maze':  { bg: '#f2eee4', wall: '#1d1d1d', inks: ['#c0392b', '#1f4e8c', '#2d7d5a', '#d98e04'] },
    'Riso Garden': { bg: '#f6f1e6', wall: '#3b3b3b', inks: ['#ff48b0', '#0078bf', '#00a95c', '#ffb511'] },
    'Ink & Rust':  { bg: '#ece6da', wall: '#2a2522', inks: ['#9e3d22', '#5b3a29', '#d07a3c', '#2f4858'] },
    'Phosphor':    { bg: '#0c120e', wall: '#2f6b43', inks: ['#8cff9e', '#c9ffd2', '#52d273', '#e4ff7a'] }
  };
  var palName = RP.weighted([['Paper Maze', 28], ['Riso Garden', 22], ['Ink & Rust', 20], ['Commodore', 15], ['Phosphor', 15]]);
  var P = PAL[palName];
  var tileSet = RL.weighted([['Diagonal', 45], ['Arcs', 35], ['Mixed', 20]]);
  var scaleName = RL.weighted([['Coarse', 35], ['Medium', 45], ['Fine', 20]]);
  var s = { Coarse: 125, Medium: 100, Fine: 78 }[scaleName];
  var stage = RL.weighted([['Sprout', 25], ['Bloom', 50], ['Crowded', 25]]);
  var iters = { Sprout: 340, Bloom: 500, Crowded: 760 }[stage];
  var colonies = RL.weighted([['Few', 30], ['Several', 45], ['Many', 25]]);
  var nCol = { Few: 5, Several: 8, Many: 14 }[colonies];
  var walls = RL.weighted([['Drawn', 75], ['Ghost', 25]]);
  C.features({ Palette: palName, Tiles: tileSet, Scale: scaleName, Stage: stage, Colonies: colonies, Walls: walls });

  var cv = C.setupCanvas(VW, VH, P.bg), ctx = cv.ctx;
  C.vectorSpace(VW, VH);
  // ---- maze geometry --------------------------------------------------------
  var fx0 = 70, fy0 = 70, cols = Math.floor((VW - 2 * fx0) / s), rows = Math.floor((VH - 2 * fy0) / s);
  var ox = (VW - cols * s) / 2, oy = (VH - rows * s) / 2;
  var wallPolys = [];
  for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
    var x = ox + i * s, y = oy + j * s, flip = RL.chance(0.5);
    var arcs = tileSet === 'Arcs' || (tileSet === 'Mixed' && RL.chance(0.5));
    if (!arcs) wallPolys.push(flip ? [[x, y], [x + s, y + s]] : [[x + s, y], [x, y + s]]);
    else {
      var c1 = flip ? [x, y] : [x + s, y], c2 = flip ? [x + s, y + s] : [x, y + s];
      var a1 = flip ? 0 : Math.PI / 2, a2 = flip ? Math.PI : -Math.PI / 2;
      [[c1, a1], [c2, a2]].forEach(function (cc) {
        var pts = []; for (var t = 0; t <= 12; t++) { var a = cc[1] + t / 12 * Math.PI / 2; pts.push([cc[0][0] + Math.cos(a) * s / 2, cc[0][1] + Math.sin(a) * s / 2]); }
        wallPolys.push(pts);
      });
    }
  }
  var frame = [[ox, oy], [ox + cols * s, oy], [ox + cols * s, oy + rows * s], [ox, oy + rows * s], [ox, oy]];
  wallPolys.push(frame);
  // ---- raster walls, EDT, regions ------------------------------------------
  var G = 2, GW = VW / G, GH = VH / G, mask = new Uint8Array(GW * GH);
  var off = document.createElement('canvas'); off.width = GW; off.height = GH;
  var o2 = off.getContext('2d'); o2.fillStyle = '#000'; o2.fillRect(0, 0, GW, GH);
  o2.strokeStyle = '#fff'; o2.lineWidth = 2.2; o2.lineCap = 'round';
  wallPolys.forEach(function (p) { o2.beginPath(); o2.moveTo(p[0][0] / G, p[0][1] / G); for (var k = 1; k < p.length; k++) o2.lineTo(p[k][0] / G, p[k][1] / G); o2.stroke(); });
  var px = o2.getImageData(0, 0, GW, GH).data;
  for (i = 0; i < GW * GH; i++) {
    var gx = i % GW, gy = (i / GW) | 0, out = gx * G < ox || gx * G > ox + cols * s || gy * G < oy || gy * G > oy + rows * s;
    mask[i] = (px[i * 4] > 60 || out) ? 1 : 0;
  }
  var dist = C.edt(mask, GW, GH);          // in cells
  var label = new Int32Array(GW * GH).fill(-1), regions = [], stack = [];
  for (i = 0; i < GW * GH; i++) {
    if (mask[i] || label[i] >= 0) continue;
    var reg = { area: 0, best: i, bestD: 0, id: regions.length };
    stack.push(i); label[i] = reg.id;
    while (stack.length) {
      var c = stack.pop(); reg.area++;
      if (dist[c] > reg.bestD) { reg.bestD = dist[c]; reg.best = c; }
      var cx = c % GW, cy = (c / GW) | 0;
      if (cx > 0 && !mask[c - 1] && label[c - 1] < 0) { label[c - 1] = reg.id; stack.push(c - 1); }
      if (cx < GW - 1 && !mask[c + 1] && label[c + 1] < 0) { label[c + 1] = reg.id; stack.push(c + 1); }
      if (cy > 0 && !mask[c - GW] && label[c - GW] < 0) { label[c - GW] = reg.id; stack.push(c - GW); }
      if (cy < GH - 1 && !mask[c + GW] && label[c + GW] < 0) { label[c + GW] = reg.id; stack.push(c + GW); }
    }
    regions.push(reg);
  }
  regions.sort(function (a, b) { return (b.area - a.area) || (a.id - b.id); });
  var chosen = regions.filter(function (r) { return r.bestD * G > 9; }).slice(0, nCol);
  function wallD(x, y) { // virtual units
    var gx2 = Math.max(0, Math.min(GW - 1, (x / G) | 0)), gy2 = Math.max(0, Math.min(GH - 1, (y / G) | 0));
    return dist[gy2 * GW + gx2] * G;
  }
  // ---- differential growth -------------------------------------------------
  var RR = s * 0.11, MAXE = s * 0.06, loops = [];
  chosen.forEach(function (rg, n) {
    var cxv = (rg.best % GW) * G, cyv = ((rg.best / GW) | 0) * G, pts = [], r0 = 4;
    for (var k = 0; k < 14; k++) { var a = k / 14 * Math.PI * 2; pts.push([cxv + Math.cos(a) * r0, cyv + Math.sin(a) * r0]); }
    loops.push({ pts: pts, col: P.inks[n % P.inks.length], cap: Math.round(rg.area * G * G / (RR * 3.4)) });
  });
  var NODECAP = 22000;
  for (var it = 0; it < iters; it++) {
    var hash = new Map(), total = 0;
    loops.forEach(function (L, li) {
      L.pts.forEach(function (p, pi) { var key = ((p[0] / RR) | 0) * 4096 + ((p[1] / RR) | 0); var b = hash.get(key); if (!b) hash.set(key, b = []); b.push(p); });
      total += L.pts.length;
    });
    loops.forEach(function (L) {
      var P2 = L.pts, n = P2.length, next = new Array(n);
      for (var k = 0; k < n; k++) {
        var p = P2[k], a = P2[(k - 1 + n) % n], b = P2[(k + 1) % n];
        var fxs = ((a[0] + b[0]) / 2 - p[0]) * 0.35, fys = ((a[1] + b[1]) / 2 - p[1]) * 0.35;
        var hx = (p[0] / RR) | 0, hy = (p[1] / RR) | 0;
        for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
          var bk = hash.get((hx + dx) * 4096 + hy + dy); if (!bk) continue;
          for (var m = 0; m < bk.length; m++) {
            var q = bk[m]; if (q === p) continue;
            var ddx = p[0] - q[0], ddy = p[1] - q[1], d2 = ddx * ddx + ddy * ddy;
            if (d2 < RR * RR && d2 > 1e-6) { var d = Math.sqrt(d2), f = (RR - d) / RR * 0.55; fxs += ddx / d * f; fys += ddy / d * f; }
          }
        }
        var wd = wallD(p[0], p[1]);
        if (wd < RR * 1.2) { // push off walls along the distance gradient
          var gxw = wallD(p[0] + 2, p[1]) - wallD(p[0] - 2, p[1]), gyw = wallD(p[0], p[1] + 2) - wallD(p[0], p[1] - 2), gl = Math.hypot(gxw, gyw) || 1;
          var fw = (RR * 1.2 - wd) / (RR * 1.2) * 0.9; fxs += gxw / gl * fw; fys += gyw / gl * fw;
        }
        var fl = Math.hypot(fxs, fys); if (fl > 1.6) { fxs *= 1.6 / fl; fys *= 1.6 / fl; } // step limit: nothing tunnels through a wall
        var nx = p[0] + fxs, ny = p[1] + fys;
        if (wallD(nx, ny) < RR * 0.45) { nx = p[0]; ny = p[1]; }
        next[k] = [nx, ny];
      }
      // split long edges (growth), deterministic jitter
      var grown = [];
      for (k = 0; k < n; k++) {
        var p0 = next[k], p1 = next[(k + 1) % n]; grown.push(p0);
        var el = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        if (el > MAXE && total < NODECAP && grown.length < L.cap) { grown.push([(p0[0] + p1[0]) / 2 + RG.range(-0.3, 0.3), (p0[1] + p1[1]) / 2 + RG.range(-0.3, 0.3)]); total++; }
      }
      // random insertions (about 3% of the line per step) keep the front buckling and growing
      var nIns = Math.ceil(grown.length * 0.01);
      for (var z = 0; z < nIns; z++) {
        var ins = RG.int(0, grown.length - 1);
        if (total >= NODECAP || grown.length >= L.cap) continue;
        var q0 = grown[ins], q1 = grown[(ins + 1) % grown.length];
        grown.splice(ins + 1, 0, [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2]); total++;
      }
      L.pts = grown;
    });
  }
  // ---- draw ------------------------------------------------------------------
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, VW, VH);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  function path(p, closed) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var k = 1; k < p.length; k++) ctx.lineTo(p[k][0], p[k][1]); if (closed) ctx.closePath(); }
  // the rest of the maze, faint
  ctx.strokeStyle = P.wall; ctx.lineWidth = walls === 'Drawn' ? 2.2 : 0.8; ctx.globalAlpha = walls === 'Drawn' ? 0.9 : 0.25;
  wallPolys.forEach(function (p) { path(p); ctx.stroke(); if (walls === 'Drawn') C.poly(p, P.wall); });
  ctx.globalAlpha = 1;
  loops.forEach(function (L) {
    var col = C.hex2rgb(L.col);
    path(L.pts, true); ctx.fillStyle = C.rgba(col, 0.16); ctx.fill();
    ctx.strokeStyle = L.col; ctx.lineWidth = 1.6; ctx.stroke();
    C.poly(L.pts.concat([L.pts[0]]), L.col);
  });
  C.done(cv.canvas, '10-print-growth');
})();

/* Fore-edge, by Clyde (2027).
 * A stack of books on a kitchen counter, seen end-on from the side the pages open. Every book says, in grime and
 * ripples along its page edges, where it was opened and how often.
 * Engine: each book has a use distribution over its pages (a cookbook has favourite recipes; a dictionary is used
 * everywhere at the thumb-index; a novel was read once, front to back). Thumb oil and kitchen dirt accumulate on
 * each page edge in proportion to use, at the place a hand grips to turn; a spill wicks into a run of adjacent
 * pages and cockles them (the ripples open dark gaps); the page the book falls open at has a broken spine and a
 * gap; age tans every edge. Pages are drawn as a band-limited paper block with explicit openings at signatures,
 * well-used leaves, spills and the fall-open page, so the edge stays readable without a ruled-paper moiré. */
(function () {
  var C = window.CLYDE, R = C.rng('main'), RB = R.fork('books'), RU = R.fork('use'), RL = R.fork('light');
  var clamp = PX.clamp, lerp = PX.lerp, sstep = PX.sstep, PI = Math.PI;
  var VW = 1500, VH = 1000;
  var Q = C.platform === 'standalone' ? C.query : null;
  var stack = RB.weighted([['Two Books', 20], ['Three Books', 40], ['Four Books', 30], ['Five Books', 10]]);
  var n = { 'Two Books': 2, 'Three Books': 3, 'Four Books': 4, 'Five Books': 5 }[stack];
  var KINDS = [['Cookbook', 40], ['Dictionary', 14], ['Paperback', 22], ['Diary', 12], ['Hymnal', 6], ['Atlas', 6]];
  var books = [], y = 20, favourite = RU.int(0, n - 1);
  var baseLen = RB.range(19.2, 22.8);
  for (var k = 0; k < n; k++) {
    var kind = k === favourite ? 'Cookbook' : RB.weighted(KINDS), th = { 'Cookbook': RB.range(2.6, 4.2), 'Dictionary': RB.range(4, 6), 'Paperback': RB.range(1.6, 3), 'Diary': RB.range(1.4, 2.2), 'Hymnal': RB.range(2.5, 3.5), 'Atlas': RB.range(1.5, 2.2) }[kind];
    var board = kind === 'Paperback' ? 0.03 : RB.range(0.22, 0.35), len = baseLen + RB.range(-1.1, 1.6), x0 = RB.range(-0.25, 1.3);
    var pages = Math.round((th - 2 * board) / RB.range(0.0075, 0.011)), age = RB.range(0.15, 1), use = k === favourite ? 1 : RU.range(0.15, 0.75);
    var peaks = []; if (kind === 'Cookbook' || kind === 'Hymnal') { var np = RU.int(2, 6); for (var q = 0; q < np; q++) peaks.push({ p: RU.range(0.12, 0.92), w: RU.range(0.01, 0.035), a: RU.pareto(0.55, 1.2) }); }
    books.push({ kind: kind, y1: y, y0: y - th, board: board, x0: x0, x1: x0 + len, pages: pages, age: age, use: use, peaks: peaks, cover: PX.col(RB.pick(['#6b2c25', '#2f4a3a', '#2b3550', '#7a6a4a', '#3a3a3a', '#8b4a2a', '#5c4030'])), seed: RB.rand() * 1000,
      spill: kind === 'Cookbook' && RU.chance(0.6) ? { p0: RU.range(0.2, 0.8), w: RU.range(0.04, 0.11), x: RU.range(0.38, 0.82), xw: RU.range(0.1, 0.24), col: RU.pick([[0.85, 0.95, 1.2], [0.7, 0.88, 1.15], [0.55, 0.8, 1.25]]) } : null,
      dog: RU.chance(0.5) ? RU.range(0.05, 0.95) : -1, rot: RB.gaussian(0, 0.003), sig: 16 + ((RB.rand() * 16) | 0) });
    y -= th + RB.range(0.02, 0.07);
  }
  function useOf(b, t) {
    if (b.kind === 'Paperback') return 0.25 + 0.35 * Math.exp(-t * 4);
    if (b.kind === 'Dictionary') return 0.65 + 0.45 * Math.sin(t * PI);
    if (b.kind === 'Diary') return t < 0.7 ? 0.85 : 0.12;
    if (b.kind === 'Atlas') return 0.35;
    var u = 0.12; b.peaks.forEach(function (pk) { u += pk.a * Math.exp(-Math.pow((t - pk.p) / pk.w, 2)); }); return u;
  }
  var yTop = books[books.length - 1].y0 - RB.range(0.45, 1.05);
  var yBot = books[0].y1 + RB.range(1.15, 2.15);
  var xMin = books.reduce(function (m, b) { return Math.min(m, b.x0); }, 1e9);
  var xMax = books.reduce(function (m, b) { return Math.max(m, b.x1); }, -1e9);
  var viewH = yBot - yTop, viewW = viewH * VW / VH;
  var midX = (xMin + xMax) / 2 + RB.gaussian(0, 0.25);
  var xL = midX - viewW / 2, xR = midX + viewW / 2;
  var o = PX.canvas(C, VW, VH, '#151311'), PW = o.PW, PH = o.PH, Rr = new Float32Array(PW * PH), Gg = new Float32Array(PW * PH), Bb = new Float32Array(PW * PH);
  var wall = PX.col(RL.pick(['#c4b7a4', '#b9b0a0', '#c8beae', '#a9a89a'])), counter = PX.col(RL.pick(['#b8b3a8', '#8a8380', '#c4b49a', '#3d3a36']));
  var paperC = PX.col('#efe8d6'), tan = PX.col('#c9a36c'), grime = PX.col('#3a3128'), SS = 3;
  var lx = RL.chance(0.5) ? 1 : -1, seedW = RL.int(1, 9999);
  function wallShadow(X, Y) {
    var sh = 1;
    for (var i = 0; i < books.length; i++) {
      var bk = books[i];
      if (Y < bk.y0 - 0.05 || Y > bk.y1 + 0.05) continue;
      var dY = Math.max(0, Math.max(bk.y0 - Y, Y - bk.y1));
      var fall = sstep(0.08, 0, dY);
      if (X < bk.x0) sh *= 1 - 0.42 * sstep(0.7, 0, bk.x0 - X) * fall;
      if (X > bk.x1) sh *= 1 - 0.42 * sstep(0.7, 0, X - bk.x1) * fall;
    }
    return sh;
  }
  for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
    var I = py * PW + px, r = 0, g = 0, b = 0, Xc = xL + (px + 0.5) * viewW / PW, Yc = yTop + (py + 0.5) * viewH / PH;
    for (var ss = 0; ss < SS; ss++) {
      var X = xL + (px + 0.5) * viewW / PW, Y = yTop + (py + (ss + 0.5) / SS) * viewH / PH, cr, cg, cb, hit = false;
      for (var k2 = 0; k2 < books.length && !hit; k2++) {
        var bk = books[k2], yy = Y - bk.rot * (X - midX); if (yy < bk.y0 || yy > bk.y1 || X < bk.x0 || X > bk.x1) continue; hit = true;
        var bl = bk.board, depth = yy - bk.y0, thk = bk.y1 - bk.y0;
        var fromEnd = Math.min(X - bk.x0, bk.x1 - X);
        if (depth < bl || depth > thk - bl) {
          var cvt = 0.8 + 0.14 * PX.vnoise(X * 14, yy * 18, bk.seed) + 0.06 * PX.vnoise(X * 48, yy * 6, bk.seed + 1);
          cr = bk.cover[0] * cvt; cg = bk.cover[1] * cvt; cb = bk.cover[2] * cvt;
          var e = Math.min(depth, thk - depth);
          if (e < 0.04) { var lip = sstep(0.04, 0, e); cr *= 1 - 0.5 * lip; cg *= 1 - 0.5 * lip; cb *= 1 - 0.5 * lip; }
          if (fromEnd < 0.07) { var end = sstep(0.07, 0, fromEnd); cr *= 1 - 0.25 * end; cg *= 1 - 0.25 * end; cb *= 1 - 0.25 * end; }
          break;
        }
        var pageSpan = thk - 2 * bl, tb = (depth - bl) / pageSpan, phase = tb * bk.pages, pg = Math.floor(phase), xt = (X - bk.x0) / (bk.x1 - bk.x0);
        var sp = bk.spill, wetZone = 0;
        if (sp) {
          var dp = Math.abs(tb - sp.p0) / sp.w, dxs = Math.abs(xt - sp.x) / sp.xw;
          wetZone = sstep(1.2, 0.65, dp + 0.14 * PX.vnoise(xt * 5, tb * 8, bk.seed + 3)) * sstep(1.35, 0.75, dxs + 0.16 * PX.vnoise(xt * 4, tb * 11, bk.seed + 4));
        }
        var u = useOf(bk, tb) * bk.use;
        var grip = bk.kind === 'Dictionary'
          ? 0.5 + 0.5 * Math.exp(-Math.pow((xt - 0.58) / 0.42, 2))
          : Math.exp(-Math.pow((xt - 0.78) / 0.28, 2)) + 0.42 * Math.exp(-Math.pow((xt - 0.42) / 0.34, 2));
        var mott = 0.82 + 0.28 * PX.fbm(xt * 4.5, tb * 6.5, bk.seed + 5, 3);
        var pageDirt = 0.88 + 0.24 * PX.ihash(pg * 17 + (bk.seed | 0));
        var gr = clamp(u * (0.38 + 1.0 * grip) * mott * pageDirt * 0.8, 0, 0.92);
        var tanA = bk.age * (0.42 + 0.5 * Math.exp(-Math.min(tb, 1 - tb) * 10));
        if (fromEnd < 0.35) tanA = Math.min(1, tanA + 0.2 * sstep(0.35, 0, fromEnd));
        var pageTone = 0.96 + 0.04 * PX.ihash(pg * 31 + (bk.seed | 0));
        cr = lerp(lerp(paperC[0], tan[0], tanA), grime[0], gr) * pageTone;
        cg = lerp(lerp(paperC[1], tan[1], tanA), grime[1], gr) * pageTone;
        cb = lerp(lerp(paperC[2], tan[2], tanA), grime[2], gr) * pageTone;
        if (wetZone > 0) {
          var od = wetZone * 0.7, tide = Math.exp(-Math.pow((1 - wetZone) / 0.14, 2)) * 0.35;
          cr *= Math.exp(-(od + tide) * sp.col[0]); cg *= Math.exp(-(od + tide) * sp.col[1]); cb *= Math.exp(-(od + tide) * sp.col[2]);
        }
        if (bk.kind === 'Dictionary') {
          var nTabs = 11, slot = tb * nTabs, tab = Math.floor(slot), tc = (tab + 0.5) / nTabs;
          var cx = bk.x0 + (0.2 + (tab % 2) * 0.06) * (bk.x1 - bk.x0);
          var cy = bk.y0 + bl + tc * pageSpan;
          var rx = 0.52, ry = pageSpan / nTabs * 0.28;
          var ddTab = (X - cx) * (X - cx) / (rx * rx) + (yy - cy) * (yy - cy) / (ry * ry);
          if (ddTab < 1) {
            var rec = sstep(1, 0.45, ddTab);
            cr *= 1 - 0.38 * rec; cg *= 1 - 0.38 * rec; cb *= 1 - 0.38 * rec;
          }
        }
        if (bk.dog >= 0 && Math.abs(tb - bk.dog) < 0.7 / bk.pages * 2 && xt > 0.93) { cr *= 1.08; cg *= 1.06; cb *= 1.02; }
        var pxPerPage = (pageSpan / bk.pages) / viewH * PH;
        // only turn on a per-leaf grating when a leaf is actually resolvable; otherwise it aliases into diagonal moiré
        var pageAmp = 0.2 * clamp((pxPerPage - 0.65) / 1.4, 0, 1);
        var atPage = Math.pow(Math.abs(Math.cos(phase * PI)), 4);
        var atSig = Math.pow(Math.abs(Math.cos(phase * PI / bk.sig)), 8);
        var splay = sstep(0.35, 1.05, u) * 0.55;
        var cockleN = wetZone * sstep(0.12, 0.55, 0.5 + 0.5 * PX.vnoise(xt * 3.2, phase * 0.1, bk.seed + 9));
        var useOpen = splay * Math.pow(Math.abs(Math.cos(phase * PI / 8)), 6);
        var cockleOpen = cockleN * Math.pow(Math.abs(Math.cos(phase * PI / 5)), 6);
        var gap = pageAmp * atPage + 0.24 * atSig + useOpen * 0.48 + cockleOpen * 0.55;
        var fiber = 0.97 + 0.03 * PX.vnoise(xt * 18, tb * 4, bk.seed + 11);
        cr *= fiber; cg *= fiber; cb *= fiber;
        var openAt = bk.peaks.length ? bk.peaks.reduce(function (a, p) { return p.a > a.a ? p : a; }).p : -1;
        if (openAt > 0 && Math.abs(tb - openAt) * bk.pages < 2.4 && bk.use > 0.45) {
          var openW = 0.3 + 0.7 * Math.exp(-Math.pow((xt - 0.5) / 0.48, 2));
          var openD = sstep(2.4, 0, Math.abs(tb - openAt) * bk.pages);
          gap = Math.max(gap, 0.7 * openW * openD);
        }
        gap = clamp(gap, 0, 0.86);
        cr *= 1 - gap; cg *= 1 - gap; cb *= 1 - gap;
        var ao = 1 - 0.3 * Math.exp(-Math.min(depth - bl, thk - bl - depth) / 0.12);
        cr *= ao; cg *= ao; cb *= ao;
        if (fromEnd < 0.06) { var endP = sstep(0.06, 0, fromEnd); cr *= 1 - 0.2 * endP; cg *= 1 - 0.2 * endP; cb *= 1 - 0.2 * endP; }
      }
      if (!hit) {
        if (Y > books[0].y1) {
          var ct = 0.88 + 0.12 * PX.vnoise(X * 2.2, Y * 5.5, seedW);
          cr = counter[0] * ct; cg = counter[1] * ct; cb = counter[2] * ct;
          var dd = Y - books[0].y1;
          if (dd < 0.85) { var shc = 1 - 0.58 * sstep(0.85, 0, dd); cr *= shc; cg *= shc; cb *= shc; }
        } else {
          var wt = 0.92 + 0.1 * PX.fbm(X * 2.2, Y * 2.4, seedW + 2, 4);
          cr = wall[0] * wt; cg = wall[1] * wt; cb = wall[2] * wt;
          var wsh = wallShadow(X, Y);
          cr *= wsh; cg *= wsh; cb *= wsh;
        }
      }
      r += cr; g += cg; b += cb;
    }
    var L = 1.04 + 0.14 * lx * ((Xc - xL) / viewW - 0.5) - 0.07 * (Yc - yTop) / viewH;
    Rr[I] = r / SS * L; Gg[I] = g / SS * L; Bb[I] = b / SS * L;
  }
  C.features({ Stack: stack, 'Most Used': books[favourite].kind, Books: books.map(function (b) { return b.kind; }).join(', '), Spill: books.some(function (b) { return b.spill; }) ? 'Yes' : 'No' });
  PX.finish(o, Rr, Gg, Bb, { expo: 1.16, filmic: true, grain: 0.012, vig: 0.16, seed: 23 });
  C.done(o.cv.canvas, 'fore-edge');
})();

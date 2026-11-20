/*
 * prng.js — hash-seeded deterministic randomness for long-form generative work.
 * Works standalone, with fxhash ($fx.hash), or Art Blocks-style (tokenData.hash).
 * Same hash -> same sequence -> same artwork, on every device, forever.
 *
 * RULE: never call Math.random() or p5's random() in the art path. Keep the
 * NUMBER and ORDER of rng calls independent of window size, frame rate, or time.
 */
(function (global) {
  // ---- 1. Resolve the hash ------------------------------------------------
  function randomHexHash() {
    const h = '0123456789abcdef';
    let s = '0x';
    for (let i = 0; i < 64; i++) s += h[(Math.random() * 16) | 0];
    return s;
  }
  function resolveHash() {
    const url = new URLSearchParams(global.location ? global.location.search : '');
    if (url.get('hash')) return url.get('hash');                       // ?hash=0x... for dev/repro
    if (global.$fx && global.$fx.hash) return global.$fx.hash;          // fxhash
    if (global.tokenData && global.tokenData.hash) return global.tokenData.hash; // Art Blocks
    return randomHexHash();                                            // dev fallback
  }

  // ---- 2. Hash -> four 32-bit seeds (cyrb128) -------------------------------
  function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4); h2 ^= h1; h3 ^= h1; h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
  }

  // ---- 3. SFC32 (same family fxhash uses) ---------------------------------
  function sfc32(a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      let t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      t = (t + d) | 0;
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  // ---- 4. Convenience API -------------------------------------------------
  function makeRng(hash) {
    const s = cyrb128(String(hash));
    const next = sfc32(s[0], s[1], s[2], s[3]);
    for (let i = 0; i < 20; i++) next(); // warm up
    const R = {
      hash: String(hash),
      seed32: s[0],                                   // handy for p5 noiseSeed()
      rand: next,                                     // [0,1)
      range: (a, b) => a + (b - a) * next(),
      int: (a, b) => Math.floor(a + (b - a + 1) * next()), // inclusive
      chance: (p) => next() < p,
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      // weighted([['common',70],['rare',25],['mythic',5]])
      weighted: (pairs) => {
        const total = pairs.reduce((s, p) => s + p[1], 0);
        let r = next() * total;
        for (const [v, w] of pairs) { if ((r -= w) < 0) return v; }
        return pairs[pairs.length - 1][0];
      },
      // Box-Muller; ALWAYS consumes exactly 2 calls (keeps sequence stable)
      gaussian: (mean = 0, sd = 1) => {
        const u = 1 - next(), v = next();
        return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      },
      // Pareto-ish power law: many small, few large (see Hobbs, 2014)
      pareto: (min = 1, alpha = 1.5) => min / Math.pow(1 - next(), 1 / alpha),
      shuffle: (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      // independent sub-stream, so adding a new feature later doesn't
      // shift every other random decision (label it, e.g. R.fork('palette'))
      fork: (label) => makeRng(String(hash) + '::' + label),
    };
    return R;
  }

  const api = { resolveHash, makeRng, cyrb128, sfc32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.ClydePRNG = api;
})(typeof window !== 'undefined' ? window : globalThis);

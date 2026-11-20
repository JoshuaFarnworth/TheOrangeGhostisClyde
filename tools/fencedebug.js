// node fencedebug.js <art.js or module> <outdir> : renders each fence type from the engine's own FENCE block (side elevation, plan, shadow)
const fs = require('fs'); const src = fs.readFileSync(process.argv[2], 'utf8'), out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
const block = src.slice(src.indexOf('// FENCE{'), src.indexOf('// }FENCE'));
const PI = Math.PI, lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function rng(seed) { let s = seed >>> 0; const f = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  return { range: (a, b) => a + (b - a) * f(), int: (a, b) => a + Math.floor(f() * (b - a + 1)), chance: p => f() < p, pick: a => a[Math.floor(f() * a.length)] }; }
eval(block);
const V = [['picket', { top: 'point', capped: true }], ['picket', { top: 'dog', capped: false }], ['picket', { top: 'round', capped: true }], ['chain', {}], ['rail', { n: 3 }], ['board', { n: 4, capBoard: true }], ['privacy', { box: false, capRail: true, top: 'flat' }], ['privacy', { box: true, capRail: false, top: 'dog' }], ['iron', { spear: true }], ['breeze', { pat: 'circle', rows: 4 }], ['breeze', { pat: 'diamond', rows: 4 }], ['breeze', { pat: 'cross', rows: 3 }], ['breeze', { pat: 'leaf', rows: 4 }], ['cmu', {}]];
const meta = [];
V.forEach(([k, o], i) => {
  const s = fenceSpec(k, rng(i * 31 + 7)); Object.assign(s, o);
  if (k === 'picket') s.postTop = s.capped ? s.H + 0.05 : s.H - 0.07;
  if (k === 'breeze') { s.H = 0.2 + s.rows * s.B + 0.05; }
  const len = Math.min(2 * s.ps, 6.2), ppm = 160, W = Math.round(len * ppm) + 40, Hs = Math.round(2.2 * ppm);
  const side = new Uint8Array(W * Hs).fill(245); // side elevation
  for (let y = 0; y < Hs; y++) for (let x = 0; x < W; x++) { const a = (x - 20) / ppm, z = (Hs - 10 - y) / ppm; if (a < -0.1 || a > len + 0.1) continue; const c = fenceOcc(s, a, z, 1 / ppm, len, null); side[y * W + x] = Math.round(245 - c * 200); if (y === Hs - 10) side[y * W + x] = 120; }
  const Ht = Math.round(0.7 * ppm), top = new Uint8Array(W * Ht * 3);
  for (let y = 0; y < Ht; y++) for (let x = 0; x < W; x++) { const a = (x - 20) / ppm, v = (y - Ht / 2) / ppm, r = fenceTop(s, a, v, len), j = (y * W + x) * 3;
    if (!r) { top[j] = 236; top[j + 1] = 238; top[j + 2] = 242; continue; } const sn = r[4] * Math.min(1, r[5] / 0.06); top[j] = Math.round(255 * lerp(r[1], 0.93, sn * 0.8)); top[j + 1] = Math.round(255 * lerp(r[2], 0.94, sn * 0.8)); top[j + 2] = Math.round(255 * lerp(r[3], 0.96, sn * 0.8)); }
  // shadow on the ground behind the fence: sun 22 deg up, 40 deg off the fence's normal
  const el = 22 * PI / 180, ph = 40 * PI / 180, tanE = Math.tan(el), Hg = Math.round(4.2 * ppm), shd = new Uint8Array(W * Hg);
  const sh = [Math.tan(ph), tanE / Math.cos(ph)];
  for (let y = 0; y < Hg; y++) for (let x = 0; x < W; x++) { const g = (y) / ppm, s0 = g / Math.cos(ph), a = (x - 20) / ppm - Math.sin(ph) * s0, z = s0 * tanE; const c = fenceOcc(s, a, z, 1.2 / ppm + 0.009 * s0 * 0.35, len, sh); shd[y * W + x] = Math.round(240 - c * 0.92 * 150); }
  const nm = String(i).padStart(2, '0');
  fs.writeFileSync(`${out}/${nm}_side.pgm`, Buffer.concat([Buffer.from(`P5 ${W} ${Hs} 255\n`), Buffer.from(side)]));
  fs.writeFileSync(`${out}/${nm}_top.ppm`, Buffer.concat([Buffer.from(`P6 ${W} ${Ht} 255\n`), Buffer.from(top)]));
  fs.writeFileSync(`${out}/${nm}_shd.pgm`, Buffer.concat([Buffer.from(`P5 ${W} ${Hg} 255\n`), Buffer.from(shd)]));
  const desc = { picket: `picket, ${s.top} tops, posts ${s.capped ? 'capped above' : 'flush below'} the pickets, 2 rails, posts ${s.ps.toFixed(2)} m o.c.`, chain: `chain link ${s.H.toFixed(2)} m: terminal posts + dome caps at ends, line posts ${s.ps.toFixed(2)} m o.c., top rail, 2 in diamond mesh, tension wire`, rail: `split rail, ${s.n} rails mortised into posts ${s.ps.toFixed(1)} m o.c.`, board: `paddock board fence, ${s.n} boards${s.capBoard ? ' + cap board' : ''}, posts 8 ft o.c.`, privacy: `privacy ${s.H.toFixed(2)} m, ${s.box ? 'shadowbox (boards alternate sides)' : 'solid board'}${s.capRail ? ' + cap rail' : ''}, ${s.top} tops`, iron: `wrought iron/aluminum, ${s.spear ? 'spear finials' : 'flush'}, bars ${(s.pitch * 100).toFixed(0)} cm o.c., posts with ball caps`, breeze: `screen block wall, '${s.pat}' 12x12x4 blocks, ${s.rows} courses, pilasters ${s.ps.toFixed(2)} m o.c., cap`, cmu: `CMU wall ${s.H.toFixed(2)} m with cap` }[k];
  meta.push({ nm, desc });
});
fs.writeFileSync(`${out}/meta.json`, JSON.stringify(meta));

// node tools/fauna-preview.js out.ppm [species...] : flat-fill preview of flesh (left) and skeleton (right) per species
const fs = require('fs'); eval(fs.readFileSync(__dirname + '/../src/fauna.js', 'utf8'));
const [out, ...sps] = process.argv.slice(2), list = sps.length ? sps : ['mammoth', 'bison', 'horse', 'wolf'], S = 160, W = 2 * 1.9 * S, H = list.length * 1.25 * S;
const img = new Uint8Array(Math.ceil(W) * Math.ceil(H) * 3).fill(235), IW = Math.ceil(W), IH = Math.ceil(H);
function inside(P, x, y) { let s = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[j], b = P[i]; if ((a[1] > y) !== (b[1] > y) && x < a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])) s = !s; } return s; }
function fill(P, ox, oy, c, holes) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; P.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  for (let py = Math.max(0, Math.floor(oy - y1 * S)); py <= Math.min(IH - 1, Math.ceil(oy - y0 * S)); py++) for (let px = Math.max(0, Math.floor(ox + x0 * S)); px <= Math.min(IW - 1, Math.ceil(ox + x1 * S)); px++) {
    const x = (px + 0.5 - ox) / S, y = (oy - py - 0.5) / S; if (!inside(P, x, y)) continue; if (holes && holes.some(h => ((x - h[0][0]) / h[1]) ** 2 + ((y - h[0][1]) / h[2]) ** 2 < 1)) continue; const i = (py * IW + px) * 3; img[i] = c[0]; img[i + 1] = c[1]; img[i + 2] = c[2]; } }
list.forEach((sp, r) => { const pose = sp.split(':')[1] || 'stand', name = sp.split(':')[0], R = FAUNA.rig(name, 1, pose, { sink: 0.2 }), F = FAUNA.flesh(R, {}), B = FAUNA.skeleton(R), oy = (r + 1) * 1.25 * S - 0.12 * S;
  F.parts.filter(p => p.far).forEach(p => fill(p.poly, 0.45 * S, oy, [60, 45, 35])); F.parts.filter(p => !p.far).forEach(p => fill(p.poly, 0.45 * S, oy, [95, 70, 50])); F.ext.forEach(p => fill(p.poly, 0.45 * S, oy, [70, 50, 38]));
  B.filter(b => b.ivory).forEach(b => fill(b.poly, 0.45 * S, oy, [230, 220, 190]));
  B.slice().sort((a, b) => a.order - b.order).forEach(b => fill(b.poly, 2.3 * S, oy, b.far ? [150, 140, 120] : b.ivory ? [240, 230, 200] : [200, 188, 160], b.holes));
  for (let px = 0; px < IW; px++) { const i = (Math.round(oy) * IW + px) * 3; img[i] = img[i + 1] = img[i + 2] = 120; } });
fs.writeFileSync(out, Buffer.concat([Buffer.from(`P6 ${IW} ${IH} 255\n`), Buffer.from(img)]));

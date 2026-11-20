// node tools/history.js : writes histories/<run>.json -- SIMULATED mint histories [{index, timestamp, hash}].
// Hashes are realistic in FORMAT only (EVM-style 0x + 64 hex, sha256 of a label); they are not real transactions.
// Timestamps are unix seconds. Runs differ only in timing so the strata differences come from time, not content.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const out = path.join(__dirname, '..', 'histories'); fs.mkdirSync(out, { recursive: true });
function rng(seed) { let s = crypto.createHash('sha256').update(seed).digest(); let a = s.readUInt32LE(0), b = s.readUInt32LE(4), c = s.readUInt32LE(8), d = s.readUInt32LE(12);
  return () => { a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0; return (t >>> 0) / 4294967296; }; }
const exp = (R, mean) => -Math.log(1 - R()) * mean;
const H = 3600, D = 86400, OPEN = Date.UTC(2027, 5, 1, 17, 0, 0) / 1000;   // 1 Jun 2027 17:00 UTC (illustrative)
const runs = {
  // steady: a quiet open edition, about one mint every 1.5 h, for ~4 months
  steady: (R) => { const t = [OPEN]; while (t.length < 2000) t.push(t[t.length - 1] + Math.max(12, exp(R, 1.5 * H))); return t; },
  // bursty: a launch rush, then bursts (a post, a mention) separated by quiet days; within a burst gaps are seconds-minutes
  bursty: (R) => { const t = [OPEN]; let now = OPEN;
    for (let i = 0; i < 180; i++) { now += Math.max(6, exp(R, 50)); t.push(now); }
    while (t.length < 3000) { now += exp(R, 2.5 * D) + 2 * H; const n = 10 + Math.floor(R() * R() * 220);
      for (let i = 0; i < n && t.length < 3000; i++) { now += Math.max(6, exp(R, i < 5 ? 60 : 240)); t.push(now); }
      const trickle = Math.floor(R() * 12); for (let i = 0; i < trickle; i++) { now += exp(R, 6 * H); t.push(now); } }
    return t; },
  // dormant: an early run, a four-month silence, a revival, another two-month silence, then a trickle
  dormant: (R) => { const t = [OPEN]; let now = OPEN;
    const seg = (n, mean) => { for (let i = 0; i < n; i++) { now += Math.max(8, exp(R, mean)); t.push(now); } };
    seg(260, 15 * 60); now += 122 * D; seg(420, 50 * 60); now += 61 * D; seg(300, 6 * H); return t; },
  // launch: a typical sell-through: fast at first, rate decaying over ~3 months
  launch: (R) => { const t = [OPEN]; let now = OPEN; while (t.length < 2500) { const k = t.length; now += Math.max(6, exp(R, 30 * Math.exp(k / 400))); t.push(now); } return t; }
};
const pick = process.argv[2], seedSalt = process.argv[3] || '';
for (const [name, gen] of Object.entries(runs)) {
  if (pick && pick !== name) continue;
  const R = rng('sediments-sim-' + name + seedSalt), ts = gen(R);
  const hist = ts.map((t, i) => ({ index: i + 1, timestamp: Math.round(t), hash: '0x' + crypto.createHash('sha256').update(`sediments-sim/${name}${seedSalt}/${i + 1}`).digest('hex') }));
  fs.writeFileSync(path.join(out, name + seedSalt + '.json'), JSON.stringify(hist));
  const span = (hist[hist.length - 1].timestamp - hist[0].timestamp) / D;
  console.log(name + seedSalt, hist.length, 'mints over', span.toFixed(1), 'days');
}

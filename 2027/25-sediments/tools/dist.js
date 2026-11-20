// node tools/dist.js [history.json N] : writes
//   dist/sediments.html                 the generator: reads history from a snapshot, Art Blocks ONCHAIN dependency, ?history= or a simulated run
//   dist/snapshot-<run>-<N>.html        a buyer file for token N with the history 1..N frozen inside it (the permanence copy)
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const shared = fs.readFileSync('/workspace/clyde/series/_shared/clyde.js', 'utf8'), art = fs.readFileSync(path.join(root, 'src', 'art.js'), 'utf8');
const page = (title, pre) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>html,body{margin:0;height:100%;background:#111}canvas{display:block}</style></head><body>${pre}<script>\n${shared}\n</script><script>\n${art}\n</script></body></html>\n`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const gen = page('Sediments by Clyde', ''); fs.writeFileSync(path.join(root, 'dist', 'sediments.html'), gen);
console.log('dist/sediments.html', gen.length, 'bytes');
const [hf, Ns] = process.argv.slice(2);
if (hf) { const N = parseInt(Ns, 10), h = JSON.parse(fs.readFileSync(hf, 'utf8')).slice(0, N), me = h[N - 1];
  // packed form, 80 hex per mint: uint64 unix seconds (16 hex) + 32-byte hash (64 hex) -- the same 'sed1' format a contract view would emit
  const sed1 = 'sed1:' + h.map(m => BigInt(m.timestamp).toString(16).padStart(16, '0') + m.hash.replace(/^0x/, '')).join('');
  const pre = `<script>window.SEDIMENTS_HISTORY=${JSON.stringify(h.map(m => ({ index: m.index, timestamp: m.timestamp, hash: m.hash })))};if(!/[?&]hash=/.test(location.search))history.replaceState(null,'','?hash=${me.hash}');</script>`;
  const f = path.join(root, 'dist', `snapshot-${path.basename(hf, '.json')}-${N}.html`), html = page(`Sediments #${N} by Clyde`, pre); fs.writeFileSync(f, html);
  console.log(path.relative(root, f), html.length, 'bytes; packed history', (sed1.length - 5) / 2, 'bytes for', N, 'mints'); }

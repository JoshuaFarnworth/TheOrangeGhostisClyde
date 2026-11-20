// node build.js <projectDir> <title> : dist/aleatory/<slug>.html (single self-contained file: shared adapter + art)
const fs = require('fs'), path = require('path');
const [dir, title] = process.argv.slice(2), slug = path.basename(dir).replace(/^\d\d-/, '');
const shared = fs.readFileSync('/workspace/clyde/series/_shared/clyde.js', 'utf8'), art = fs.readFileSync(path.join(dir, 'src', 'art.js'), 'utf8');
fs.mkdirSync(path.join(dir, 'dist', 'aleatory'), { recursive: true });
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} by Clyde</title><style>html,body{margin:0;height:100%;background:#111}canvas{display:block}</style></head><body><script>\n${shared}\n</script><script>\n${art}\n</script></body></html>\n`;
const f = path.join(dir, 'dist', 'aleatory', slug + '.html'); fs.writeFileSync(f, html);
console.log(f, html.length + ' bytes', require('zlib').gzipSync(html).length + ' gz');

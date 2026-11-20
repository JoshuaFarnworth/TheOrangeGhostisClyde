// node hero.js <slug> <res> <i...>  -> <series>/heroes/hero-NN.png (sample hash i)
const fs = require('fs'), path = require('path'), crypto = require('crypto'), puppeteer = require('puppeteer-core');
const [slug, res, ...ids] = process.argv.slice(2);
const dir = path.join(__dirname, '..', 'series', slug), out = path.join(dir, 'heroes'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--js-flags=--max-old-space-size=4096'] });
  for (const i of ids) {
    const hash = '0x' + crypto.createHash('sha256').update('clyde-' + slug + '-' + i).digest('hex');
    const p = await b.newPage(); const t0 = Date.now();
    await p.goto('file://' + path.join(dir, `dist/aleatory/${slug}.html`) + `?hash=${hash}&res=${res}`, { timeout: 0 });
    await p.waitForFunction('window.__clyde && window.__clyde.done', { timeout: 300000 });
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
    const f = path.join(out, `hero-${String(i).padStart(2, '0')}.png`); fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64'));
    console.log(f, Date.now() - t0 + 'ms', JSON.stringify(await p.evaluate(() => window.__clyde.features))); await p.close();
  }
  await b.close();
})();

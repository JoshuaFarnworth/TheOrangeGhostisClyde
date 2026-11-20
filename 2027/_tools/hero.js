// node hero.js <projectDir> <res> <i...> : renders dist/aleatory/<slug>.html in headless Chrome -> heroes/hero-NN.png
const fs = require('fs'), path = require('path'), crypto = require('crypto'), puppeteer = require('/workspace/clyde/tools/node_modules/puppeteer-core');
const [dir, res, ...ids] = process.argv.slice(2), slug = path.basename(dir).replace(/^\d\d-/, ''), out = path.join(dir, 'heroes'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--js-flags=--max-old-space-size=4096'] });
  for (const i0 of ids) { const i = String(parseInt(i0, 10));
    const hash = '0x' + crypto.createHash('sha256').update('clyde-' + slug + '-' + i).digest('hex'), p = await b.newPage(), t0 = Date.now();
    await p.goto('file://' + path.resolve(dir, `dist/aleatory/${slug}.html`) + `?hash=${hash}&res=${res}`, { timeout: 0 });
    await p.waitForFunction('window.__clyde && window.__clyde.done', { timeout: 600000 });
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png')), f = path.join(out, `hero-${String(i).padStart(2, '0')}.png`);
    fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64')); console.log(f, Date.now() - t0 + 'ms', JSON.stringify(await p.evaluate(() => window.__clyde.features))); await p.close();
  }
  await b.close();
})();

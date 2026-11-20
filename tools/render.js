// node render.js <slug> [n=24] [platform=standalone|fxhash|aleatory] [res=1600]
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const puppeteer = require('puppeteer-core');
const [slug, nArg, plat = 'standalone', res = '1600'] = process.argv.slice(2);
const n = parseInt(nArg || '24', 10);
const dir = path.join(__dirname, '..', 'series', slug);
const out = path.join(dir, plat === 'standalone' ? 'samples' : 'samples-' + plat);
fs.mkdirSync(out, { recursive: true });
const MOCK_ALEA = `(function(){var s=new URLSearchParams(location.search).get('seed');var h=1779033703^s.length;for(var i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
var r=function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296;};
Math.random=r;window.$alea={seed:s,random:r,rand:r,randInt:function(a,b){return a+Math.floor(r()*(b-a+1))},randBetween:function(a,b){return a+r()*(b-a)},pick:function(a){return a[Math.floor(r()*a.length)]},chance:function(p){return r()<p},params:{},param:function(n,f){return f},features:function(o){window.__aleaFeatures=o;return o},ready:function(){window.__aleaReady=true}};})();`;
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security'] });
  const summary = [];
  for (let i = 0; i < n; i++) {
    const hash = '0x' + crypto.createHash('sha256').update('clyde-' + slug + '-' + i).digest('hex');
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1100 });
    const errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    let url;
    if (plat === 'fxhash') {
      const fxh = 'oo' + crypto.createHash('sha256').update('fx' + i).digest('base64').replace(/[^1-9A-HJ-NP-Za-km-z]/g, '').padEnd(49, 'a').slice(0, 49);
      url = 'file://' + path.join(dir, 'dist/fxhash/index.html') + `?fxhash=${fxh}&res=${res}`;
    } else if (plat === 'aleatory') {
      await page.evaluateOnNewDocument(MOCK_ALEA);
      url = 'file://' + path.join(dir, `dist/aleatory/${slug}.html`) + `?seed=op${hash.slice(2, 50)}&res=${res}`;
    } else url = 'file://' + path.join(dir, `dist/aleatory/${slug}.html`) + `?hash=${hash}&res=${res}`;
    const t0 = Date.now();
    await page.goto(url, { timeout: 0 });
    try { await page.waitForFunction('window.__clyde && window.__clyde.done', { timeout: 120000, polling: 200 }); }
    catch (e) { errs.push('timeout'); }
    const ms = Date.now() - t0;
    const data = await page.evaluate(() => { const c = document.querySelector('canvas'); return c ? c.toDataURL('image/png') : null; });
    const info = await page.evaluate(() => ({ c: window.__clyde, af: window.__aleaFeatures || null, ar: !!window.__aleaReady, fx: window.$fx ? window.$fx.getFeatures() : null }));
    const name = String(i).padStart(2, '0');
    if (data) fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(data.split(',')[1], 'base64'));
    if (i < 3 && plat === 'standalone') { // also save SVG for a few
      const svg = await page.evaluate(() => window.CLYDE && window.CLYDE.plottable ? window.CLYDE.svgString() : null);
      if (svg) fs.writeFileSync(path.join(out, name + '.svg'), svg);
    }
    const rec = { i, hash: info.c ? info.c.hash : hash, ms, features: info.c && info.c.features, platform: info.c && info.c.platform, aleaFeatures: info.af, aleaReady: info.ar, fxFeatures: info.fx, errors: errs };
    summary.push(rec);
    console.log(name, ms + 'ms', JSON.stringify(rec.features), errs.length ? 'ERR ' + errs.join(' | ') : '');
    await page.close();
  }
  fs.writeFileSync(path.join(out, 'samples.json'), JSON.stringify(summary, null, 1));
  await browser.close();
})();

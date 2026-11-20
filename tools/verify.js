// node verify.js <slug>: determinism, resolution independence, fxhash + Aleatory harness smoke tests
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const puppeteer = require('puppeteer-core');
const slug = process.argv[2], dir = path.join(__dirname, '..', 'series', slug);
const MOCK = fs.readFileSync(path.join(__dirname, 'render.js'), 'utf8').match(/const MOCK_ALEA = `([\s\S]*?)`;/)[1];
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  async function run(url, mock) {
    const p = await b.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    if (mock) await p.evaluateOnNewDocument(MOCK);
    await p.goto(url); await p.waitForFunction('window.__clyde && window.__clyde.done', { timeout: 120000 });
    const r = await p.evaluate(() => ({ png: document.querySelector('canvas').toDataURL(), c: window.__clyde, fx: window.$fx ? window.$fx.getFeatures() : null, af: window.__aleaFeatures || null, ar: !!window.__aleaReady, w: document.querySelector('canvas').width }));
    await p.close(); r.errs = errs; return r;
  }
  const H = '0x' + crypto.createHash('sha256').update('verify-' + slug).digest('hex');
  const A = path.join(dir, `dist/aleatory/${slug}.html`), F = path.join(dir, 'dist/fxhash/index.html');
  const r1 = await run(`file://${A}?hash=${H}`), r2 = await run(`file://${A}?hash=${H}`);
  const det = crypto.createHash('md5').update(r1.png).digest('hex') === crypto.createHash('md5').update(r2.png).digest('hex');
  const lo = await run(`file://${A}?hash=${H}&res=800`);
  fs.writeFileSync('/tmp/v_hi.png', Buffer.from(r1.png.split(',')[1], 'base64')); fs.writeFileSync('/tmp/v_lo.png', Buffer.from(lo.png.split(',')[1], 'base64'));
  const sameFeat = JSON.stringify(lo.c.features) === JSON.stringify(r1.c.features);
  const fx = await run(`file://${F}?fxhash=ooTestHash${slug.replace(/[^a-zA-Z]/g, '').slice(0, 10)}abcdefghijkmnopqrstuvwxyzABCDEFGHJK`.slice(0, 200));
  const fx2 = await run(`file://${F}?fxhash=ooTestHash${slug.replace(/[^a-zA-Z]/g, '').slice(0, 10)}abcdefghijkmnopqrstuvwxyzABCDEFGHJK`.slice(0, 200));
  const al = await run(`file://${A}?seed=opVerifyHash${slug}`, true), al2 = await run(`file://${A}?seed=opVerifyHash${slug}`, true);
  const HL = path.join(dir, 'dist/highlight/index.html'), VS = path.join(dir, 'dist/verse/index.html');
  const hl1 = await run(`file://${HL}?h=0x${'ab'.repeat(32)}&tid=7`), hl2 = await run(`file://${HL}?h=0x${'ab'.repeat(32)}&tid=7`);
  const hlTraits = await (async () => { const p = await b.newPage(); await p.goto(`file://${HL}?h=0x${'ab'.repeat(32)}&tid=7`); await p.waitForFunction('window.__clyde && window.__clyde.done'); const t = await p.evaluate(() => hl.token.getTraits()); await p.close(); return t; })();
  const payload = Buffer.from(JSON.stringify({ hash: H, editionNumber: 3, totalEditions: 10, input: {} })).toString('base64');
  const vs1 = await run(`file://${VS}?payload=${encodeURIComponent(payload)}`), vs2 = await run(`file://${VS}?payload=${encodeURIComponent(payload)}`);
  const vsArt = await (async () => { const p = await b.newPage(); await p.goto(`file://${VS}?payload=${encodeURIComponent(payload)}`); await p.waitForFunction('window.__clyde && window.__clyde.done'); const t = await p.evaluate(() => window.$artifact); await p.close(); return t; })();
  const md = x => crypto.createHash('md5').update(x.png).digest('hex');
  console.log(JSON.stringify({ slug, deterministicStandalone: det, featuresStableAcrossRes: sameFeat, res: [r1.w, lo.w],
    fxhash: { platform: fx.c.platform, featuresRegistered: !!fx.fx && Object.keys(fx.fx).length > 0, deterministic: md(fx) === md(fx2), errs: fx.errs },
    aleatory: { platform: al.c.platform, featuresRegistered: !!al.af, readyCalled: al.ar, deterministic: md(al) === md(al2), errs: al.errs },
    highlight: { platform: hl1.c.platform, traitsSet: !!hlTraits && Object.keys(hlTraits).length > 0, deterministic: md(hl1) === md(hl2), errs: hl1.errs },
    verse: { platform: vs1.c.platform, featuresSet: !!(vsArt && vsArt.features), deterministic: md(vs1) === md(vs2), errs: vs1.errs },
    standaloneErrs: r1.errs }));
  await b.close();
})();

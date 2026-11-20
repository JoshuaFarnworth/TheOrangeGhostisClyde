// node tools/render.js <history.json> <N> <res> <out.(ppm|png)> [world] : headless render of token N of a mint history.
// The history slice 1..N is injected as window.SEDIMENTS_HISTORY (the same path a frozen-snapshot buyer file uses).
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const [hf, Ns, res = '800', out, world] = process.argv.slice(2), N = parseInt(Ns, 10);
const hist = JSON.parse(fs.readFileSync(hf, 'utf8')).slice(0, N), me = hist[hist.length - 1];
let imgOut = null;
const canvas = { width: 0, height: 0, style: {}, getContext: () => ctx, toDataURL: () => '' };
const ctx = { setTransform() {}, createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData: (img) => { imgOut = img; }, fillRect() {} };
const win = { location: { search: `?hash=${me.hash}&res=${res}` }, innerWidth: 1000, innerHeight: 1000, addEventListener() {}, dispatchEvent() {}, console, SEDIMENTS_HISTORY: hist };
if (world) win.SED_WORLD = world;
win.window = win;
const sandbox = { window: win, document: { createElement: () => canvas, body: { style: {}, appendChild() {} } }, URLSearchParams, console, Event: function () {}, atob: s => Buffer.from(s, 'base64').toString('binary') };
sandbox.location = win.location; vm.createContext(sandbox);
const t0 = Date.now();
vm.runInContext(fs.readFileSync('/workspace/clyde/series/_shared/clyde.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'art.js'), 'utf8'), sandbox);
const ms = Date.now() - t0;
if (out && imgOut) { const { width: w, height: h, data } = imgOut, buf = Buffer.alloc(w * h * 3); for (let i = 0; i < w * h; i++) { buf[i * 3] = data[i * 4]; buf[i * 3 + 1] = data[i * 4 + 1]; buf[i * 3 + 2] = data[i * 4 + 2]; }
  const ppm = out.replace(/\.png$/, '.ppm'); fs.writeFileSync(ppm, Buffer.concat([Buffer.from(`P6 ${w} ${h} 255\n`), buf]));
  if (out.endsWith('.png')) { execFileSync('python3', ['-c', `from PIL import Image;Image.open('${ppm}').save('${out}')`]); fs.unlinkSync(ppm); }
  fs.writeFileSync(out.replace(/\.(png|ppm)$/, '.json'), JSON.stringify({ N, hash: me.hash, ms, features: win.__clyde && win.__clyde.features, sed: win.__sediments }, null, 1)); }
console.log(JSON.stringify({ N, ms, features: win.__clyde && win.__clyde.features }));

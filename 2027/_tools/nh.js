// node nh.js <projectDir> <hash[&qs]> <res> <out.ppm> : headless render of a 2027 project (src/art.js) -> PPM + features JSON
const fs = require('fs'), path = require('path'), vm = require('vm');
const [dir, hash, res = '800', out] = process.argv.slice(2);
let imgOut = null;
const canvas = { width: 0, height: 0, style: {}, getContext: () => ctx, toDataURL: () => '' };
const ctx = { setTransform() {}, createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData: (img) => { imgOut = img; }, fillRect() {} };
const win = { location: { search: `?hash=${hash}&res=${res}` }, innerWidth: 1000, innerHeight: 1000, addEventListener() {}, dispatchEvent() {}, console };
win.window = win;
const sandbox = { window: win, document: { createElement: () => canvas, body: { style: {}, appendChild() {} } }, URLSearchParams, console, Event: function () {}, atob: s => Buffer.from(s, 'base64').toString('binary') };
sandbox.location = win.location; vm.createContext(sandbox);
const t0 = Date.now();
vm.runInContext(fs.readFileSync('/workspace/clyde/series/_shared/clyde.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, 'src', 'art.js'), 'utf8'), sandbox);
const ms = Date.now() - t0;
if (out && imgOut) { const { width: w, height: h, data } = imgOut, buf = Buffer.alloc(w * h * 3); for (let i = 0; i < w * h; i++) { buf[i * 3] = data[i * 4]; buf[i * 3 + 1] = data[i * 4 + 1]; buf[i * 3 + 2] = data[i * 4 + 2]; } fs.writeFileSync(out, Buffer.concat([Buffer.from(`P6 ${w} ${h} 255\n`), buf])); }
console.log(JSON.stringify({ ms, features: win.__clyde && win.__clyde.features }));

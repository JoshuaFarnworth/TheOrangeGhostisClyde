// node nodeharness.js <slug> <hash> <res> <out.ppm>  : runs an artwork headless in node (no Chrome), writes PPM
const fs = require('fs'), path = require('path'), vm = require('vm');
const [slug, hash, res = '800', out] = process.argv.slice(2);
const S = path.join(__dirname, '..', 'series');
let imgOut = null;
const canvas = { width: 0, height: 0, style: {}, getContext: () => ctx, toDataURL: () => '' };
const ctx = { setTransform() {}, createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData: (img) => { imgOut = img; }, fillRect() {}, };
const win = { __dbg: !!(process.env.DBG || process.env.DBGT || process.env.DBGC), location: { search: `?hash=${hash}&res=${res}${process.env.QS ? "&" + process.env.QS : ""}` }, innerWidth: 1000, innerHeight: 1000, addEventListener() {}, dispatchEvent() {}, console };
win.window = win;
const sandbox = { window: win, document: { createElement: () => canvas, body: { style: {}, appendChild() {} } }, URLSearchParams, console, Math, Float32Array, Float64Array, Int32Array, Uint8Array, Uint8ClampedArray, Event: function () {}, atob: s => Buffer.from(s, 'base64').toString('binary') };
sandbox.location = win.location;
vm.createContext(sandbox);
const t0 = Date.now();
vm.runInContext(fs.readFileSync(path.join(S, '_shared', 'clyde.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(S, slug, 'src', 'art.js'), 'utf8'), sandbox);
const ms = Date.now() - t0;
if (out && imgOut) {
  const { width: w, height: h, data } = imgOut, buf = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) { buf[i * 3] = data[i * 4]; buf[i * 3 + 1] = data[i * 4 + 1]; buf[i * 3 + 2] = data[i * 4 + 2]; }
  fs.writeFileSync(out, Buffer.concat([Buffer.from(`P6 ${w} ${h} 255\n`), buf]));
}
if (process.env.DBG && win.__dbgPrints) { const P = win.__dbgPrints.prints, o = []; for (let i = 0; i < P.length; i += 9) if (P[i + 5] !== 0) o.push([+P[i].toFixed(2), +P[i + 1].toFixed(2), P[i + 5]]); fs.writeFileSync(process.env.DBG, JSON.stringify({ p: o, birds: win.__dbgPrints.birds })); }
if (process.env.DBGT && win.__dbgPrints) fs.writeFileSync(process.env.DBGT, JSON.stringify(win.__dbgPrints.trees.map(t => Object.assign({}, t, { segs: t.segs.map(s => s.map(v => +(+v).toFixed(3))) }))));
if (process.env.DBGC && win.__dbgPrints) fs.writeFileSync(process.env.DBGC, JSON.stringify({ cars: win.__dbgPrints.cars, W: win.__dbgPrints.W }));
console.log(JSON.stringify({ ms, features: win.__clyde && win.__clyde.features }));

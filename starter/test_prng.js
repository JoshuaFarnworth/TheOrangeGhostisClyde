// node test_prng.js  -> verifies determinism of prng.js
const { makeRng } = require('./prng.js');
const h = '0x' + 'ab'.repeat(32);
const a = makeRng(h), b = makeRng(h), c = makeRng(h + '1');
const sa = Array.from({ length: 5 }, a.rand), sb = Array.from({ length: 5 }, b.rand), sc = Array.from({ length: 5 }, c.rand);
console.log('same hash equal:', JSON.stringify(sa) === JSON.stringify(sb));
console.log('diff hash differs:', JSON.stringify(sa) !== JSON.stringify(sc));
console.log('fork independent:', makeRng(h).fork('palette').rand() === makeRng(h).fork('palette').rand());
console.log(sa);

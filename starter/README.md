# clyde starter

Seeded-PRNG + p5.js template for long-form generative work.

- `prng.js`: resolves a hash from `?hash=`, then `$fx.hash` (fxhash), then `tokenData.hash` (Art Blocks), and falls back to a random hash for dev. Uses cyrb128 to turn the hash into seeds and SFC32 to generate numbers. Helpers: `rand, range, int, chance, pick, weighted, gaussian, pareto, shuffle, fork(label)`.
- `sketch.js`: a demo flow field with plotter polylines. Features are chosen first and drive the art. Geometry lives in a fixed virtual space, so the output is the same at any window size. Keys: `s` saves a PNG, `v` saves an SVG with one layer per pen colour (for AxiDraw/vpype), `r` makes a new hash.
- `test_prng.js`: run `node test_prng.js` to check determinism.

Run it: `cd starter && python3 -m http.server 8000`, then open http://localhost:8000/?hash=0x1234...

Determinism checklist (from the fxhash docs):
1. The art path never calls Math.random() or p5 random().
2. The number of rng calls never depends on screen size, time, or frame rate.
3. Seed p5 noise with `noiseSeed(R.seed32)`.
4. Use `fork('name')` streams so a new feature doesn't reshuffle old outputs.
5. Render the same hash at three window sizes and compare the results.

Plotter post-processing: `vpype read clyde.svg linemerge linesort reloop write out.svg`, then `axicli out.svg`.

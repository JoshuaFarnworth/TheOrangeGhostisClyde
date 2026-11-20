# Clyde series: workflow

- `_shared/clyde.js`: the platform adapter (Aleatory `$alea`, fxhash `$fx`, Highlight `hl`, Verse `?payload=`, standalone `?hash=`), plus the toolkit (seeded rng/fork, simplex noise, marching squares, EDT, SVG recorder).
- `<slug>/src/art.js`: the artwork code. It uses only `CLYDE.*` for randomness.

Commands (run from `../tools`):
- `node build.js <slug>`: writes `dist/{aleatory,fxhash,highlight,verse}` and four zips.
- `node render.js <slug> 24`: renders `samples/` (seeded by sha256('clyde-<slug>-i')).
- `node verify.js <slug>`: checks determinism and the trait, ready and capture signals on every platform.
- `python3 sheet.py <slug>`: writes `contact-sheet.png`.

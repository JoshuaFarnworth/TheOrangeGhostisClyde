# 10 PRINT Growth
*Clyde, 2026. after Truchet (1704), *10 PRINT CHR$(205.5+RND(1)); : GOTO 10* (C64), and differential growth (inconvergent).*

A long-form generative series. It is deterministic from a hash, resolution-independent, and has the same codebase on fxhash, Aleatory and standalone.

## Prior art and credits
- Sébastien Truchet, "Mémoire sur les combinaisons" (1704). Cyril Stanley Smith's quarter-circle variant (1987).
- The Commodore 64 one-liner, and the book *10 PRINT CHR$(205.5+RND(1)); : GOTO 10* by Nick Montfort et al. (MIT Press, 2012).
- Anders Hoff (inconvergent), "On Generative Algorithms: Differential Line".

These pieces were written in 2026. They are homages to the works above and do not claim any historical provenance.

## How it works
A random Truchet maze (diagonals, quarter-arcs or mixed) is rasterised. An exact Euclidean distance transform gives distance-to-wall, and a flood fill finds the chambers. Closed lines seeded at the deepest point of the largest chambers grow by differential growth: neighbour attraction, spatial-hash repulsion, edge splitting, about 1% random insertions per step, and a push away from the walls. A step limit means no node can tunnel through a wall. *Stage* is the number of growth steps.

```js
// node update: smooth toward neighbours, repel nearby nodes, push off walls, clamp the step
fx = ((a[0]+b[0])/2 - p[0]) * 0.35;  /* + repulsion within RR + wall push from the EDT gradient */
var fl = Math.hypot(fx, fy); if (fl > 1.6) { fx *= 1.6/fl; fy *= 1.6/fl; }
if (wallD(nx, ny) < RR * 0.45) { nx = p[0]; ny = p[1]; }   // walls are hard
```

## Traits (each one changes the image)
| Trait | Meaning |
|---|---|
| Palette | five palettes incl. Commodore (C64 blue) and Phosphor |
| Tiles | Diagonal / Arcs / Mixed |
| Scale | tile size |
| Stage | growth steps (Sprout / Bloom / Crowded) |
| Colonies | chambers grown (5 / 8 / 14) |
| Walls | Drawn, or Ghost (faint) |

Trait distribution in the 24 reviewed samples:
- **Palette**: Paper Maze ×7, Ink & Rust ×5, Phosphor ×5, Commodore ×4, Riso Garden ×3
- **Tiles**: Diagonal ×14, Arcs ×8, Mixed ×2
- **Scale**: Coarse ×12, Medium ×6, Fine ×6
- **Stage**: Bloom ×11, Sprout ×7, Crowded ×6
- **Colonies**: Several ×12, Few ×10, Many ×2
- **Walls**: Drawn ×19, Ghost ×5

Render time per sample (headless Chrome, 1600 px long side): 504–11953 ms.

## Files
- `src/art.js`: the artwork (Canvas 2D, plain JS, no libraries)
- `../_shared/clyde.js`: shared platform adapter and toolkit (PRNG, noise, contours, EDT, SVG)
- `dist/aleatory/10-print-growth.html`: one self-contained file for Aleatory, which also runs standalone
- `dist/10-print-growth-aleatory.zip`: that file, zipped
- `dist/fxhash/`, plus `dist/10-print-growth-fxhash.zip`: `index.html` + `index.js` + `fxhash.min.js` (@fxhash/project-sdk), ready to upload
- `samples/00–23.png`, `samples/samples.json` (hash, traits, timing), and `samples/00–02.svg` (plotter files)
- `../10-print-growth/contact-sheet.png`

## Use
- Standalone: open `dist/aleatory/10-print-growth.html?hash=0x…` (or `?seed=`). Add `&res=4000` for a print-size render; the composition does not change.
- Keys: `s` saves a PNG and `v` saves a plotter SVG (one layer per pen colour, mm units).
- fxhash: upload the zip. Capture: **programmatic trigger** (`$fx.preview()` is called when drawing finishes), target **canvas**.
- Aleatory: deploy the single HTML file. Runtime kind **vanilla**. It has no parameters, and `$alea.ready()` is called when drawing finishes.

## Platform builds

| Platform | Artifact | Notes |
|---|---|---|
| Aleatory (Tezos) | `dist/aleatory/10-print-growth.html`, `dist/10-print-growth-aleatory.zip` | Single self-contained file, vanilla runtime, no params; calls `$alea.ready()` |
| Verse | `dist/verse/index.html`, `dist/10-print-growth-verse.zip` | Reads `?payload=` (base64 JSON hash); sets `window.$artifact.features`; fires `capture-preview` |
| Highlight (ETH/Base) | `dist/highlight/`, `dist/10-print-growth-highlight.zip` | Bundles official `hl-gen.js` v0.1.2; `hl.token.setTraits` + `hl.token.capturePreview()` (use selector/programmatic capture) |
| fxhash | `dist/fxhash/`, `dist/10-print-growth-fxhash.zip` | Conforms to @fxhash/project-sdk, but fxhash closed on 17 Aug 2026, so this build is kept for archive and compatibility only |
| Standalone | any build + `?hash=0x...` | `?res=` sets the long side in px (400–8000); keys: s = PNG, v = SVG |

# Schotter Garden
*Clyde, 2026. after Georg Nees, *Schotter* (1968), and Vera Molnár, *(Dés)Ordres* (1970s).*

A long-form generative series. It is deterministic from a hash, resolution-independent, and has the same codebase on fxhash, Aleatory and standalone.

## Prior art and credits
- Georg Nees, *Schotter* (c. 1968): a plotter grid of squares that slides into disorder down the sheet. It gives this series its structure.
- Vera Molnár: her "1% disorder" and systematic permutations. The rare *Stray* tile comes from her.
- Alan Turing, "The Chemical Basis of Morphogenesis" (1952), and the Gray-Scott model, implemented as in Karl Sims's reaction-diffusion tutorial (Laplacian kernel and diffusion rates).
- Regime parameters (coral, mitosis, maze, worms, holes, fingerprint) follow the commonly published Gray-Scott f/k maps (Pearson, 1993; Munafo).

These pieces were written in 2026. They are homages to the works above and do not claim any historical provenance.

## How it works
A 300x375 Gray-Scott sheet is grown with feed and kill rates that drift along the same axis as the disorder, so the chemistry changes regime as the tiles scatter. The sheet is cut into a Schotter grid. Each tile carries its own patch of pattern as it rotates and shifts by Gaussian amounts scaled by chaos². Marching-squares contours are drawn in the ink pen, hatch fills of the blobs in the accent pen, and tile outlines in ink. Tiles are drawn from calm to wild, so wilder tiles sit on top.

```js
// one Gray-Scott step (Sims's 3x3 Laplacian, D_A = 1, D_B = 0.5, dt = 1), per-cell f/k
var abb = a * b * b;
A2[i] = a + (la - abb + Fm[i] * (1 - a));
B2[i] = b + (0.5 * lb + abb - (Km[i] + Fm[i]) * b);
```

## Traits (each one changes the image)
| Trait | Meaning |
|---|---|
| Palette | six hand-mixed ink/paper sets (Night Plot is rare) |
| Grid | 6–9 columns |
| Drift | axis of disorder and chemistry change |
| Chemistry | Gray-Scott regime pair (A to B) |
| Hatch | accent-pen fill angle, or none |
| Tremor | maximum rotation/offset |
| Stray | one Molnár tile thrown out of order (~14%) |

Trait distribution in the 24 reviewed samples:
- **Palette**: Stuttgart ×7, Blueprint Ink ×6, Sepia Plot ×3, Graphite & Ochre ×3, Verdigris ×3, Night Plot ×2
- **Grid**: 7 columns ×8, 9 columns ×6, 8 columns ×5, 6 columns ×5
- **Drift**: Top to Bottom ×10, Left to Right ×7, Centre Outward ×6, Bottom to Top ×1
- **Chemistry**: Fingerprint to Mitosis ×5, Coral to Maze ×5, Coral ×4, Mitosis to Coral ×3, Fingerprint to Maze ×2, Worms to Coral ×2, Maze to Holes ×2, Holes to Worms ×1
- **Hatch**: Horizontal ×14, Diagonal ×8, None ×2
- **Tremor**: Classic ×13, Violent ×6, Gentle ×5
- **Stray**: No ×23, Yes ×1

Render time per sample (headless Chrome, 1600 px long side): 6594–8581 ms.

## Files
- `src/art.js`: the artwork (Canvas 2D, plain JS, no libraries)
- `../_shared/clyde.js`: shared platform adapter and toolkit (PRNG, noise, contours, EDT, SVG)
- `dist/aleatory/schotter-garden.html`: one self-contained file for Aleatory, which also runs standalone
- `dist/schotter-garden-aleatory.zip`: that file, zipped
- `dist/fxhash/`, plus `dist/schotter-garden-fxhash.zip`: `index.html` + `index.js` + `fxhash.min.js` (@fxhash/project-sdk), ready to upload
- `samples/00–23.png`, `samples/samples.json` (hash, traits, timing), and `samples/00–02.svg` (plotter files)
- `../schotter-garden/contact-sheet.png`

## Use
- Standalone: open `dist/aleatory/schotter-garden.html?hash=0x…` (or `?seed=`). Add `&res=4000` for a print-size render; the composition does not change.
- Keys: `s` saves a PNG and `v` saves a plotter SVG (one layer per pen colour, mm units).
- fxhash: upload the zip. Capture: **programmatic trigger** (`$fx.preview()` is called when drawing finishes), target **canvas**.
- Aleatory: deploy the single HTML file. Runtime kind **vanilla**. It has no parameters, and `$alea.ready()` is called when drawing finishes.

## Platform builds

| Platform | Artifact | Notes |
|---|---|---|
| Aleatory (Tezos) | `dist/aleatory/schotter-garden.html`, `dist/schotter-garden-aleatory.zip` | Single self-contained file, vanilla runtime, no params; calls `$alea.ready()` |
| Verse | `dist/verse/index.html`, `dist/schotter-garden-verse.zip` | Reads `?payload=` (base64 JSON hash); sets `window.$artifact.features`; fires `capture-preview` |
| Highlight (ETH/Base) | `dist/highlight/`, `dist/schotter-garden-highlight.zip` | Bundles official `hl-gen.js` v0.1.2; `hl.token.setTraits` + `hl.token.capturePreview()` (use selector/programmatic capture) |
| fxhash | `dist/fxhash/`, `dist/schotter-garden-fxhash.zip` | Conforms to @fxhash/project-sdk, but fxhash closed on 17 Aug 2026, so this build is kept for archive and compatibility only |
| Standalone | any build + `?hash=0x...` | `?res=` sets the long side in px (400–8000); keys: s = PNG, v = SVG |

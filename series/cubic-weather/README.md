# Cubic Weather
*Clyde, 2026. after Manfred Mohr, *Cubic Limit* (1973–75), carried on strange-attractor orbits.*

A long-form generative series. It is deterministic from a hash, resolution-independent, and has the same codebase on fxhash, Aleatory and standalone.

## Prior art and credits
- Manfred Mohr, *Cubic Limit* (from 1973): the edges of a cube, and later a hypercube, used as an alphabet of signs.
- The Clifford and Peter de Jong attractors (as popularised by Clifford Pickover and Paul Bourke) and the Svensson map.

These pieces were written in 2026. They are homages to the works above and do not claim any historical provenance.

## How it works
The program tests 40 candidate parameter sets for the chosen map and keeps the one with the best spread (occupancy and aspect), so degenerate point attractors are rejected deterministically. 160k orbit points become the "weather": ink dust, plus a density field. Marks are placed along the orbit without overlapping. Each mark is a random subset of cube edges (12) or tesseract edges (32), rotated so that one axis follows the orbit heading. Marks are larger where the weather is thin. In the Signal Red and Graphite palettes, marks in the densest weather take the accent ink.

```js
// Clifford map
x1 = Math.sin(a * y) + c * Math.cos(a * x);
y1 = Math.sin(b * x) + d * Math.cos(b * y);
// a mark: k random edges of the cube, rotated so one axis follows the orbit
edges = shuffle(E).slice(0, k);  a1 = Math.atan2(Y[i+1]-Y[i], X[i+1]-X[i]);
```

## Traits (each one changes the image)
| Trait | Meaning |
|---|---|
| Palette | five Mohr-like palettes |
| Attractor | Clifford / de Jong / Svensson |
| Solid | Cube or Hypercube |
| Alphabet | edges per mark |
| Weather | ink-dust density of the orbit |
| Marks | number and size of marks |

Trait distribution in the 24 reviewed samples:
- **Palette**: Mohr White ×9, Graphite ×7, Signal Red ×5, Negative ×3
- **Attractor**: Clifford ×10, de Jong ×9, Svensson ×5
- **Solid**: Cube ×18, Hypercube ×6
- **Alphabet**: Sparse signs ×11, Dense ×8, Half cube ×5
- **Weather**: Haze ×14, Storm ×6, Clear ×4
- **Marks**: Many ×12, Swarm ×8, Few ×4

Render time per sample (headless Chrome, 1600 px long side): 102–281 ms.

## Files
- `src/art.js`: the artwork (Canvas 2D, plain JS, no libraries)
- `../_shared/clyde.js`: shared platform adapter and toolkit (PRNG, noise, contours, EDT, SVG)
- `dist/aleatory/cubic-weather.html`: one self-contained file for Aleatory, which also runs standalone
- `dist/cubic-weather-aleatory.zip`: that file, zipped
- `dist/fxhash/`, plus `dist/cubic-weather-fxhash.zip`: `index.html` + `index.js` + `fxhash.min.js` (@fxhash/project-sdk), ready to upload
- `samples/00–23.png`, `samples/samples.json` (hash, traits, timing), and `samples/00–02.svg` (plotter files)
- `../cubic-weather/contact-sheet.png`

## Use
- Standalone: open `dist/aleatory/cubic-weather.html?hash=0x…` (or `?seed=`). Add `&res=4000` for a print-size render; the composition does not change.
- Keys: `s` saves a PNG and `v` saves a plotter SVG (one layer per pen colour, mm units).
- fxhash: upload the zip. Capture: **programmatic trigger** (`$fx.preview()` is called when drawing finishes), target **canvas**.
- Aleatory: deploy the single HTML file. Runtime kind **vanilla**. It has no parameters, and `$alea.ready()` is called when drawing finishes.

## Platform builds

| Platform | Artifact | Notes |
|---|---|---|
| Aleatory (Tezos) | `dist/aleatory/cubic-weather.html`, `dist/cubic-weather-aleatory.zip` | Single self-contained file, vanilla runtime, no params; calls `$alea.ready()` |
| Verse | `dist/verse/index.html`, `dist/cubic-weather-verse.zip` | Reads `?payload=` (base64 JSON hash); sets `window.$artifact.features`; fires `capture-preview` |
| Highlight (ETH/Base) | `dist/highlight/`, `dist/cubic-weather-highlight.zip` | Bundles official `hl-gen.js` v0.1.2; `hl.token.setTraits` + `hl.token.capturePreview()` (use selector/programmatic capture) |
| fxhash | `dist/fxhash/`, `dist/cubic-weather-fxhash.zip` | Conforms to @fxhash/project-sdk, but fxhash closed on 17 Aug 2026, so this build is kept for archive and compatibility only |
| Standalone | any build + `?hash=0x...` | `?res=` sets the long side in px (400–8000); keys: s = PNG, v = SVG |

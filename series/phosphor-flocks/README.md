# Phosphor Flocks
*Clyde, 2026. after Craig Reynolds, *boids* (1987), and the vector-display / demoscene tradition.*

A long-form generative series. It is deterministic from a hash, resolution-independent, and has the same codebase on fxhash, Aleatory and standalone.

## Prior art and credits
- Craig Reynolds, "Flocks, Herds, and Schools: A Distributed Behavioral Model" (SIGGRAPH 1987): separation, alignment, cohesion.
- Vector CRT displays and their phosphors (P1, P3, P4, P7, P22), and the demoscene's glowing-line aesthetic.
- Distance-field shading in the spirit of Inigo Quilez's SDF articles. The field here is 2D and lit as tubes; it is not raymarched.

These pieces were written in 2026. They are homages to the works above and do not claim any historical provenance.

## How it works
One to three flocks (separation, alignment and cohesion, plus a predator in *Panic*) chase slow Lissajous lures for 900 steps. Their paths are rasterised, and an exact EDT turns them into a 2D signed distance field. Each pixel inside the tube radius is lit as a cylinder (diffuse plus Blinn specular), with an exponential glow outside it. A second raster stores the age of the nearest path, so older flight fades toward the phosphor's persistence colour. Scanlines, vignette and deterministic grain finish the image.

```js
// light a 2D distance field as a tube of radius TR
var h = Math.sqrt(TR*TR - d*d), nx = gx/gl * d/h, ny = gy/gl * d/h, nl = Math.hypot(nx, ny, 1);
var dif = Math.max(0, (nx*L[0] + ny*L[1] + L[2]) / nl);
var spec = Math.pow(Math.max(0, (nx*H[0] + ny*H[1] + H[2]) / nl), 40);
```

## Traits (each one changes the image)
| Trait | Meaning |
|---|---|
| Phosphor | P1 Green, P3 Amber, P4 White, P7 Blue (yellow-green decay), P22 RGB |
| Flock | boid count |
| Flocks | 1–3 groups with separate lures |
| Mood | Calm / Murmuration / Panic (predator) |
| Line | tube radius |
| Display | Scanlines / Clean / Interlaced |

Trait distribution in the 24 reviewed samples:
- **Phosphor**: P1 Green ×9, P4 White ×5, P3 Amber ×4, P7 Blue ×4, P22 RGB ×2
- **Flock**: Medium ×15, Small ×5, Large ×4
- **Flocks**: One ×13, Two ×8, Three ×3
- **Mood**: Calm ×9, Panic ×8, Murmuration ×7
- **Line**: Tube ×10, Neon ×8, Hairline ×6
- **Display**: Clean ×11, Scanlines ×8, Interlaced ×5

Render time per sample (headless Chrome, 1600 px long side): 414–754 ms.

## Files
- `src/art.js`: the artwork (Canvas 2D, plain JS, no libraries)
- `../_shared/clyde.js`: shared platform adapter and toolkit (PRNG, noise, contours, EDT, SVG)
- `dist/aleatory/phosphor-flocks.html`: one self-contained file for Aleatory, which also runs standalone
- `dist/phosphor-flocks-aleatory.zip`: that file, zipped
- `dist/fxhash/`, plus `dist/phosphor-flocks-fxhash.zip`: `index.html` + `index.js` + `fxhash.min.js` (@fxhash/project-sdk), ready to upload
- `samples/00–23.png`, `samples/samples.json` (hash, traits, timing), and `samples/00–02.svg` (plotter files)
- `../phosphor-flocks/contact-sheet.png`

## Use
- Standalone: open `dist/aleatory/phosphor-flocks.html?hash=0x…` (or `?seed=`). Add `&res=4000` for a print-size render; the composition does not change.
- Keys: `s` saves a PNG and `v` saves a plotter SVG (one layer per pen colour, mm units).
- fxhash: upload the zip. Capture: **programmatic trigger** (`$fx.preview()` is called when drawing finishes), target **canvas**.
- Aleatory: deploy the single HTML file. Runtime kind **vanilla**. It has no parameters, and `$alea.ready()` is called when drawing finishes.

## Platform builds

| Platform | Artifact | Notes |
|---|---|---|
| Aleatory (Tezos) | `dist/aleatory/phosphor-flocks.html`, `dist/phosphor-flocks-aleatory.zip` | Single self-contained file, vanilla runtime, no params; calls `$alea.ready()` |
| Verse | `dist/verse/index.html`, `dist/phosphor-flocks-verse.zip` | Reads `?payload=` (base64 JSON hash); sets `window.$artifact.features`; fires `capture-preview` |
| Highlight (ETH/Base) | `dist/highlight/`, `dist/phosphor-flocks-highlight.zip` | Bundles official `hl-gen.js` v0.1.2; `hl.token.setTraits` + `hl.token.capturePreview()` (use selector/programmatic capture) |
| fxhash | `dist/fxhash/`, `dist/phosphor-flocks-fxhash.zip` | Conforms to @fxhash/project-sdk, but fxhash closed on 17 Aug 2026, so this build is kept for archive and compatibility only |
| Standalone | any build + `?hash=0x...` | `?res=` sets the long side in px (400–8000); keys: s = PNG, v = SVG |

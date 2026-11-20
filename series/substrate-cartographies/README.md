# Substrate Cartographies
*Clyde, 2026. after Jared Tarbell, *Substrate* (2003), with Inigo Quilez-style domain warping.*

A long-form generative series. It is deterministic from a hash, resolution-independent, and has the same codebase on fxhash, Aleatory and standalone.

## Prior art and credits
- Jared Tarbell, *Substrate* (Processing, 2003): perpendicular crack growth and the "sand painter" (Tarbell published the source at complexification.net). The crack rules and the sin(sin()) grain falloff are adapted from it.
- Inigo Quilez, "Domain Warping" (iquilezles.org): fbm(p + fbm(p)).
- Topographic contour mapping: marching-squares isolines.

These pieces were written in 2026. They are homages to the works above and do not claim any historical provenance.

## How it works
A domain-warped fbm heightfield is the terrain. Cracks start from seed crystals and branch at ±90° (±2°) from existing cracks. Depending on *Growth* they run straight (Tarbell's rule), bend to follow contour lines, or climb the slope. Each step casts a sand painter perpendicular to the crack until it meets the next crack, and the grain colour is the palette band of the elevation under the crack. A birth budget and a coverage top-up keep sparse sheets from freezing early. Optional contour lines and a map neat-line finish the sheet.

```js
// bend toward the contour tangent (or the gradient when Climbing)
var target = growth === 'Climbing' ? Math.atan2(gy, gx) : Math.atan2(gx, -gy);
var d = ((target*180/Math.PI - cr.t) % 360 + 540) % 360 - 180;
if (d > 90) d -= 180; else if (d < -90) d += 180;   // either direction along the line
cr.t += d * 0.014;
```

## Traits (each one changes the image)
| Trait | Meaning |
|---|---|
| Palette | six map/geology palettes (Basalt Night is rare) |
| Terrain | warp strength (Still / Folded / Torn) |
| Growth | Straight / Contour-bound / Climbing |
| Density | crack birth budget |
| Origins | 1, 5 or 16 seed crystals |
| Survey | contour lines drawn or bare |

Trait distribution in the 24 reviewed samples:
- **Palette**: Mesa ×6, Survey ×5, Ordnance ×4, Basalt Night ×4, Ochre Basin ×3, Glacier ×2
- **Terrain**: Folded ×14, Still ×7, Torn ×3
- **Growth**: Contour-bound ×12, Straight ×8, Climbing ×4
- **Density**: Crowded ×8, Settled ×8, Sparse ×8
- **Origins**: Scattered ×13, Few ×6, Single ×5
- **Survey**: Contoured ×12, Bare ×12

Render time per sample (headless Chrome, 1600 px long side): 212–405 ms.

## Files
- `src/art.js`: the artwork (Canvas 2D, plain JS, no libraries)
- `../_shared/clyde.js`: shared platform adapter and toolkit (PRNG, noise, contours, EDT, SVG)
- `dist/aleatory/substrate-cartographies.html`: one self-contained file for Aleatory, which also runs standalone
- `dist/substrate-cartographies-aleatory.zip`: that file, zipped
- `dist/fxhash/`, plus `dist/substrate-cartographies-fxhash.zip`: `index.html` + `index.js` + `fxhash.min.js` (@fxhash/project-sdk), ready to upload
- `samples/00–23.png`, `samples/samples.json` (hash, traits, timing), and `samples/00–02.svg` (plotter files)
- `../substrate-cartographies/contact-sheet.png`

## Use
- Standalone: open `dist/aleatory/substrate-cartographies.html?hash=0x…` (or `?seed=`). Add `&res=4000` for a print-size render; the composition does not change.
- Keys: `s` saves a PNG and `v` saves a plotter SVG (one layer per pen colour, mm units).
- fxhash: upload the zip. Capture: **programmatic trigger** (`$fx.preview()` is called when drawing finishes), target **canvas**.
- Aleatory: deploy the single HTML file. Runtime kind **vanilla**. It has no parameters, and `$alea.ready()` is called when drawing finishes.

## Platform builds

| Platform | Artifact | Notes |
|---|---|---|
| Aleatory (Tezos) | `dist/aleatory/substrate-cartographies.html`, `dist/substrate-cartographies-aleatory.zip` | Single self-contained file, vanilla runtime, no params; calls `$alea.ready()` |
| Verse | `dist/verse/index.html`, `dist/substrate-cartographies-verse.zip` | Reads `?payload=` (base64 JSON hash); sets `window.$artifact.features`; fires `capture-preview` |
| Highlight (ETH/Base) | `dist/highlight/`, `dist/substrate-cartographies-highlight.zip` | Bundles official `hl-gen.js` v0.1.2; `hl.token.setTraits` + `hl.token.capturePreview()` (use selector/programmatic capture) |
| fxhash | `dist/fxhash/`, `dist/substrate-cartographies-fxhash.zip` | Conforms to @fxhash/project-sdk, but fxhash closed on 17 Aug 2026, so this build is kept for archive and compatibility only |
| Standalone | any build + `?hash=0x...` | `?res=` sets the long side in px (400–8000); keys: s = PNG, v = SVG |

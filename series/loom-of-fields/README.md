# Loom of Fields
*Clyde, 2026. after the Jacquard loom (1804), Anni Albers, and Anna Lucia's *Loom* (2021).*

A long-form generative series. It is deterministic from a hash, resolution-independent, and has the same codebase on fxhash, Aleatory and standalone.

## Prior art and credits
- Joseph-Marie Jacquard's punched-card loom (1804), an ancestor of programmable machines.
- Anni Albers and Bauhaus weaving. The "Albers" palette is an homage, not a reproduction.
- Anna Lucia, *Loom* (Art Blocks, 2021), a four-shaft hand-loom simulation and the closest prior on-chain work. This series sets out to differ from it: the draft (threading, treadling) is derived from flow-field streamlines on 4–16 shafts, and the draft can be shown as part of the image.
- The network drafting tradition of hand-weavers (e.g. Alice Schlein).

These pieces were written in 2026. They are homages to the works above and do not claim any historical provenance.

## How it works
Two streamlines through a noise flow field, one across the warp and one down the weft, are added to a straight draw and quantised to 4–16 shafts, giving threading and treadling. Where the stream climbs against the draw, the progression stalls or reverses, which produces point and wave twills. A tie-up (twill, broken twill, satin or block) completes the draft, and the cloth is the true drawdown: warp up where tie-up[treadle][shaft] is set. Stripe colours change with the same streamlines. In *Draft: Shown*, the threading, tie-up and treadling appear in standard weaver's notation.

```js
// threading: straight draw bent by a flow-field streamline
threading[i] = mod(Math.floor(dir * i + streamY[i] * S * amp), S);
// drawdown
warpUp = tie[treadling[j]][threading[i]];
```

## Traits (each one changes the image)
| Trait | Meaning |
|---|---|
| Palette | six textile palettes |
| Shafts | 4 / 8 / 12 / 16 |
| Tie-up | Twill / Broken Twill / Satin / Block |
| Sett | threads across (56 / 84 / 116) |
| Field | flow-field turbulence |
| Draft | draft notation shown or cloth only |

Trait distribution in the 24 reviewed samples:
- **Palette**: Undyed Wool ×6, Indigo Ikat ×5, Jacquard Punch ×4, Albers ×3, Madder & Weld ×3, Night Loom ×3
- **Shafts**: 8 ×9, 4 ×7, 16 ×4, 12 ×4
- **Tie-up**: Twill ×11, Satin ×8, Broken Twill ×3, Block ×2
- **Sett**: Coarse ×10, Medium ×10, Fine ×4
- **Field**: Gentle ×9, Turbulent ×8, Undulating ×7
- **Draft**: Cloth only ×14, Shown ×10

Render time per sample (headless Chrome, 1600 px long side): 65–164 ms.

## Files
- `src/art.js`: the artwork (Canvas 2D, plain JS, no libraries)
- `../_shared/clyde.js`: shared platform adapter and toolkit (PRNG, noise, contours, EDT, SVG)
- `dist/aleatory/loom-of-fields.html`: one self-contained file for Aleatory, which also runs standalone
- `dist/loom-of-fields-aleatory.zip`: that file, zipped
- `dist/fxhash/`, plus `dist/loom-of-fields-fxhash.zip`: `index.html` + `index.js` + `fxhash.min.js` (@fxhash/project-sdk), ready to upload
- `samples/00–23.png`, `samples/samples.json` (hash, traits, timing), and `samples/00–02.svg` (plotter files)
- `../loom-of-fields/contact-sheet.png`

## Use
- Standalone: open `dist/aleatory/loom-of-fields.html?hash=0x…` (or `?seed=`). Add `&res=4000` for a print-size render; the composition does not change.
- Keys: `s` saves a PNG and `v` saves a plotter SVG (one layer per pen colour, mm units).
- fxhash: upload the zip. Capture: **programmatic trigger** (`$fx.preview()` is called when drawing finishes), target **canvas**.
- Aleatory: deploy the single HTML file. Runtime kind **vanilla**. It has no parameters, and `$alea.ready()` is called when drawing finishes.

## Platform builds

| Platform | Artifact | Notes |
|---|---|---|
| Aleatory (Tezos) | `dist/aleatory/loom-of-fields.html`, `dist/loom-of-fields-aleatory.zip` | Single self-contained file, vanilla runtime, no params; calls `$alea.ready()` |
| Verse | `dist/verse/index.html`, `dist/loom-of-fields-verse.zip` | Reads `?payload=` (base64 JSON hash); sets `window.$artifact.features`; fires `capture-preview` |
| Highlight (ETH/Base) | `dist/highlight/`, `dist/loom-of-fields-highlight.zip` | Bundles official `hl-gen.js` v0.1.2; `hl.token.setTraits` + `hl.token.capturePreview()` (use selector/programmatic capture) |
| fxhash | `dist/fxhash/`, `dist/loom-of-fields-fxhash.zip` | Conforms to @fxhash/project-sdk, but fxhash closed on 17 Aug 2026, so this build is kept for archive and compatibility only |
| Standalone | any build + `?hash=0x...` | `?res=` sets the long side in px (400–8000); keys: s = PNG, v = SVG |

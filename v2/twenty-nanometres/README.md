# Twenty Nanometres (Clyde, 2026)

> *Some words arrive before their meaning does. Each plate shows one: grown into the receiving cell as the shape it has learned, and the spark that crosses the gap to reach it.*

**Thesis:** a trigger word is an electrical event. It fires before it is understood. Clyde draws the word where it actually lives, as the learned shape of a neuron's dendrites, and the discharge that crosses the synaptic cleft (about twenty nanometres wide) to reach it. The word is never typeset on top of the image. It is the densest, most in-focus part of a living-looking cell.

## How it works (custom engine, `src/engine.js`)
1. **The word as vector glyphs.** Old Standard TT Bold (OFL) outlines are embedded as path data and flattened to polygons. Old Standard revives the "Modern" faces used in late-19th / early-20th-century scientific books, Cajal's era. Tracking is opened to 0.13 em so the letters separate once they are grown. A Euclidean distance field to the letterforms drives focus, spine density and the discharge's target.
2. **The receiving neuron: space colonisation** (Runions, Lane & Prusinkiewicz 2007), with an incremental nearest-node update so it stays fast.
   - Attractors: a jittered grid inside the glyphs, a contour band just inside the outlines (so Didone hairlines survive), a sparse fan for the cell's own dendritic field, guide points from soma to each letter, and basal dendrites.
   - Tropism toward the word everywhere except inside the letters, where branches wander more.
   - Pipe-model radii (exponent 2.6), smoothing of unbranched runs, and **dendritic spines**, which are 3-4× denser inside the word. Learning literally adds spines; the word is written in them.
   - Depth: branches leave the focal plane between soma and word and come back into focus in the letters. The plane of focus *is* the word.
3. **The sending neuron.** An axon from an out-of-focus cell (or from outside the frame) ends in terminal boutons above (or below) particular letters. *Train* outputs run one axon across the word with boutons *en passant*.
4. **The discharge: dielectric breakdown model** (Niemeyer, Pietronero & Wiesmann 1984).
   - Laplace's equation is solved by SOR on a 140×140 window between bouton (φ = 0) and the in-word arbour (φ = 1), warm-started and relaxed after every growth step.
   - Growth probability ∝ φ^η, with η set by the word's register and arousal: low η gives feathery Lichtenberg leaders, high η a decisive channel.
   - When a leader touches the dendrite, the connecting path becomes the return stroke: bright and tapered, ending in a contact flash. The other leaders are weighted by the current they carry (descendant count).
   - *Failed* outputs stop at 42–72 % of the gap. Released vesicles drift into the cleft.
5. **Stain / medium.** All three are deliberately pre-digital and belong to Cajal's world, not to neon sci-fi.
   - **Golgi Section:** a transmitted-light photomicrograph. Silver-chromate absorbance runs through 4 depth layers, each blurred by its distance from the focal plane. Amber field, neuropil mottling, silver-chromate precipitate crystals (the classic Golgi artefact), and faint capillaries. The spark is the only emissive thing, with film-style warm halation.
   - **Cajal Plate:** pen and ink on aged paper. Line weight carries depth (in-word branches in full black, the rest in grey). The discharge is in vermilion. Cajal's arrows of dynamic polarisation are drawn along the axons and the return stroke, with figure letters A, B, a and a plate number.
   - **Autochrome:** the section as if photographed on a Lumière autochrome plate (a process Cajal practised), with a starch-grain colour mosaic in world units.

Everything is computed in virtual units (1000 × 1250). `?res=` only changes pixel detail. In Chrome, 1600 px renders take about 1.2–3.1 s and 2560×3200 heroes take 3–5 s. The mean absolute difference between the 1280 px and 640 px renders is 2.04/255.

```js
// dielectric breakdown: grow the discharge one cell at a time with p ∝ φ^η, re-solving Laplace as it grows
while (steps < 2400) {
  var tot = 0, w = new Float32Array(cl.length);
  for (var c = 0; c < cl.length; c++) { w[c] = Math.pow(Math.max(0, phi[cl[c]]), eta); tot += w[c]; }
  var rv = Rk.rand() * tot, pick = cl.length - 1; for (c = 0; c < cl.length; c++) { rv -= w[c]; if (rv < 0) { pick = c; break; } }
  var nk = cl[pick]; /* ...attach to nearest discharge neighbour... */ tree[nk] = par; fix[nk] = 1; phi[nk] = 0;
  if (touchesDendrite(nk)) { hit = nk; break; }            // return stroke follows this path back to the bouton
  if (failAt && progress > failAt) break;                    // Loss: the spark that does not cross
  addCand(nk); relax(3);                                     // SOR, ω = 1.8, warm-started
}
```

## Traits (all of them drive the image)

| Trait | Values | What it does | Share of 400 hashes |
|---|---|---|---|
| Word | 61 words | the letterforms the cell is grown into | most common: MOTHER 4 % |
| Register | Alarm, Attachment, Loss, Want, Summons | arbour (leaf radius, wobble, spines, beading), gap, η | 25 / 26 / 23 / 11 / 15 % |
| Stain | Golgi Section, Cajal Plate, Autochrome | medium | 48 / 36 / 17 % |
| Transmission | Crossed, Failed, Storm, Repeated, Train | discharge topology | 41 / 20 / 14 / 14 / 11 % |
| Charge | Faint, Steady, Violent | arousal ± noise: channel width, vesicles, η | 37 / 36 / 28 % |
| Section | Sparse, Neighbours, Thicket | other impregnated cells and fibres in the section | 41 / 41 / 18 % |
| Objective | ×20, ×60 | magnification; ×60 only when the word still fits | 87 / 13 % |

How each register shapes the image:
- **Alarm:** thin, kinked, very spiny dendrites. Low η gives a bushy Lichtenberg discharge, and often a Storm from three boutons.
- **Attachment:** thicker, smooth dendrites, a short gap, and one decisive channel.
- **Loss:** a sparse, beaded arbour with gaps (varicose beading is a real sign of an injured dendrite), a wide gap, and usually a discharge that fails.
- **Want:** enlarged mushroom spines and the same synapse firing three times (potentiation; each earlier discharge is fainter).
- **Summons** (interface words): a train of small discharges from boutons en passant.

Valence and arousal values are Clyde's own rough ratings, in the spirit of affective norms (Warriner, Kuperman & Brysbaert 2013).

## Prior art and influences (credited honestly)
- **Santiago Ramón y Cajal**: his drawings of Golgi-impregnated neurons (from 1888; *Textura del sistema nervioso*, 1899–1904), his arrows of dynamic polarisation, his plate conventions, and his autochrome photography. The Cajal Plate stain is an homage to those drawings, not a copy of any one of them.
- **Camillo Golgi**: the *reazione nera* (black reaction, 1873), whose random, complete impregnation of a few cells is why these images look the way they do.
- **Lichtenberg figures** (Georg Christoph Lichtenberg, 1777) and the **dielectric breakdown model** of Niemeyer, Pietronero & Wiesmann (*PRL* 52, 1984). Bert Hickman's captured-lightning acrylic blocks are a visual touchstone.
- **Space colonisation**: Runions, Fuhrer, Lane, Federl, Rolland-Lagan & Prusinkiewicz (2005, venation) and Runions, Lane & Prusinkiewicz (2007, trees). Text filled by space colonisation is a known demo technique (e.g. Jason Webb's explorations). Clyde's departure from it is depth of field, spine density and line weight.
- **Language art**, from concrete poetry to Sasha Stiles' and Jenny Holzer's text works. Clyde stays out of poetry: one word, never a sentence.
- **Microscopy and SciArt in general**, including Greg Dunn's neuron paintings (gold leaf and microetching, sumi-e style). The obvious neighbour, so Clyde avoided Dunn's gold-on-black and Asian ink palette on purpose.

## Files
- `src/engine.js`: the engine. `src/lexicon.js`: the word list. `src/font.js`: subset glyph outlines. `make.sh` concatenates them into `src/art.js`.
- `samples/00–35.png`: 1280×1600 renders of hashes `clyde-twenty-nanometres-0…35`, not cherry-picked. The `.json` files hold features and render ms in node.
- `contact-sheet.png`: all 36 samples.
- `heroes/hero-{02,10,13,23,24,35}.png`: 2560×3200 Chrome renders of the same sample hashes.
- `dist/`: `twenty-nanometres-aleatory.zip` (a single self-contained HTML of about 88 KB / 33 KB gzipped, so use chunked `append_code` + `seal_code`), `-highlight.zip`, `-verse.zip`, `-fxhash.zip` (archival only).
- Dev-only standalone params: `?word=HOME&stain=Cajal%20Plate&trans=Failed&obj=x60&up=-1`.

## Verification (`tools/verify.js`)
- Standalone runs are deterministic, and features are stable across resolutions.
- Aleatory, Highlight, Verse and fxhash harnesses all register features/traits, signal ready, render deterministically, and throw no errors.

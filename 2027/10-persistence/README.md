# Oct - Persistence  (`2027/10-persistence/`)

A patch of sky over a roofline or wires, with one or a few contrails slowly spreading - the year's one series looking up instead of down.

- **Thesis:** Strangers' journeys linger overhead only if the air is right.
- **1. In one sentence (no technique):** The trails planes leave in the sky, which stay or vanish depending on the air.
- **2. Generative rule:** Contrail persistence from ice supersaturation; width grows with sqrt(age) plus wind shear; Crow instability breaks old trails into puffs; gnomonic sky projection.
- **3. Composition, material, motion:** Sky gradient, foreground edge (roof, wires). Material: air, ice. Motion: age of trails.
- **4. Meaningful variation:** Air humidity (gone vs spreading), traffic, hour.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Can look like a sky gradient with a line - may be too thin a picture.
- **Nearest prior art and difference:** Contrail photography. Difference: the number and age of trails show the traffic of a morning.
- **Restraint:** Mostly empty sky.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Oct 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `24a8c89fba5a2460b8773d61c83f7438ffd108870d6662af8c5bf87fc910fa27`

## References to check
Contrail photos; Schmidt-Appleman criterion; Crow instability.

## Engine design
Contrail persistence from ice supersaturation; width grows with sqrt(age) plus wind shear; Crow instability breaks old trails into puffs; gnomonic sky projection.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 10-persistence <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 10-persistence 24 200 --res-check`.

## Traits
Hour, Air, Traffic, Edge

## Self-critique
R5: dry air now leaves visible short stubs; persistent trails no longer hard-cut mid-frame; Crow is a puff/meander, not a comb; roof is a soffit and gutter, not a black wedge. Sweep 24/24, 6 fails: quiet open-sky cells with a soft trail trip the 0.02 floor (marks still visible; not gamed). Remaining: some trails still a little snaky; soffit can read as a flat panel; dry stubs a bit like clean chalk marks.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r5.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-03.png, heroes/hero-05.png, heroes/hero-11.png, heroes/hero-12.png. Sample hashes: sha256("clyde-persistence-<i>").

## Risks
- Can look like a sky gradient with a line - may be too thin a picture.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

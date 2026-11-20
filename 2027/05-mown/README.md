# May - Mown  (`2027/05-mown/`)

A suburban lawn seen from above on the day it was mowed: the stripes of the mower's passes, the places it went around, and the small traces of a household - a missed strip, a goalmouth worn bare, where the paddling pool stood.

- **Thesis:** A lawn is a record of a weekend chore and of the family that uses it.
- **1. In one sentence (no technique):** A lawn from above, showing the lines someone mowed and the worn or yellowed spots their family left.
- **2. Generative rule:** A mowing plan (stripes, spiral, wandering) sets a blade lean field; stripes come from light reflecting off blades leaning toward or away from the viewer; things that stood on the grass cause etiolation (yellowing), dogs leave urine-scorch rings, and footfall flattens paths.
- **3. Composition, material, motion:** Top-down lawn, border or patio edge, one obstacle (tree, bed). Material: grass blades and soil. Motion: implied by mower direction only.
- **4. Meaningful variation:** Mowing pattern (care vs haste), time since mown, and the trace (pool, dog, lounger, goalmouth) which implies who lives there.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Could still read as a synthetic grass texture at a glance, especially the border and the tree crown.
- **Nearest prior art and difference:** Drone photography of lawn stripes, groundskeeping patterns. Difference: the stripes are a side character; the household traces are the subject.
- **Restraint:** One lawn, one obstacle, one trace.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** May 2027 (a studio target, not a public launch commitment)
- **Status:** Round 3 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `2a1690e3921c789937c999c362d1c95da4f1d81f4eaf81c3642570005dbf7f81`

## References to check
Aerial photos of striped lawns; turf etiolation after a pool is removed; dog urine spots.

## Engine design
A mowing plan (stripes, spiral, wandering) sets a blade lean field; stripes come from light reflecting off blades leaning toward or away from the viewer; things that stood on the grass cause etiolation (yellowing), dogs leave urine-scorch rings, and footfall flattens paths.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 05-mown <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 05-mown 24 200 --res-check`.

## Traits
Mowing, Mown, Light, Trace, Obstacle, Edge

## Self-critique
R1: saturated, binary stripes. R2: softer lean but still a CG shader lawn; dew a grey veil; near-blank overcast cells. R3: the tree is a canopy from above, not a brown disc; dew is a cool sheen with a readable shoe trail (hero-01); dog spots have scorch centres and nitrogen rings (hero-08); the paddling-pool patch is etiolated grass, not a yellow sticker (hero-11); lounger and chair marks are flattened grass; stripe contrast is photographic rather than graphic; sweep of 24 at 200 px, 0 content fails. Still weak: the canopy is a bit 'broccoli'; patio pavers are still quite regular; the goalmouth reads more as a dirt stain than a play area; planting in the border is still closer to a texture than a bed; grass at 1600 px is soft grain rather than blades.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r2.png, contact-sheet-r3.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-08.png, heroes/hero-11.png. Sample hashes: sha256("clyde-mown-<i>").

## Risks
- Could still read as a synthetic grass texture at a glance, especially the border and the tree crown.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

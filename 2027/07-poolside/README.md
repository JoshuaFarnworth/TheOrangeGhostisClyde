# Jul - Poolside  (`2027/07-poolside/`)

A pool deck in hot sun minutes after someone got out: the wet print of a body on the warm stone, footprints to the edge, and the light on the water.

- **Thesis:** Heat erases a person in minutes.
- **1. In one sentence (no technique):** The wet outline someone leaves on a hot pool deck, drying while you look.
- **2. Generative rule:** Wet marks (body, feet, drips) evaporate on a per-material clock driven by sun and stone heat; caustics on the pool floor from forward photon splatting through a wavy surface with water-column absorption.
- **3. Composition, material, motion:** Top-down deck with a strip of pool at top or bottom; lounger or umbrella off to one side. Material: travertine/concrete/tile, water. Motion: minutes since the person got up.
- **4. Meaningful variation:** Story (swam, lay on deck, sat on edge), minutes since, sun, shade.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Hockney and backyard-pool photography still sit close; the water has to keep moving away from poster cyan.
- **Nearest prior art and difference:** Hockney pool paintings; caustic shaders. Difference: the subject is the evaporating person, not the water.
- **Restraint:** One person's traces, no figures.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jul 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `bdc88a33f20134c52cd1b4d174fa92bf8b0c10a6298737abefbca80402ba50d7`

## References to check
Photos of wet body prints on decks; caustic photography; travertine textures.

## Engine design
Wet marks (body, feet, drips) evaporate on a per-material clock driven by sun and stone heat; caustics on the pool floor from forward photon splatting through a wavy surface with water-column absorption.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 07-poolside <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 07-poolside 24 200 --res-check`.

## Traits
Story, Since, Sun, Deck, Shade

## Self-critique
R3 hero-09 was the best improvement; water was still a flat teal tile block and footprints did not clearly show heel/toe drying. R4: the water is a more muted pool colour, paler at the wall and deeper further out, with slightly irregular, varied tiles instead of a hard grid (hero-09); within each print the toes carry less water and dry first, so a half-dry step can be a heel and ball only. Sweep of 24 at 200 px, 0 content fails. Still weak: the pool can still read as a tiled illustration; some prints remain blobby; the lounger is still CG slats; quiet 'Sat On The Edge' and 'Gone Inside' cells; the coping is still a light band.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r2.png, contact-sheet-r3.png, contact-sheet-r4.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-05.png, heroes/hero-09.png. Sample hashes: sha256("clyde-poolside-<i>").

## Risks
- Hockney and backyard-pool photography still sit close; the water has to keep moving away from poster cyan.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

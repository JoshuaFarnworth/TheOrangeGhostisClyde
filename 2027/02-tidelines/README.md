# Feb - Tidelines  (`2027/02-tidelines/`)

A single sheet of paper - a napkin, graph pad, kraft bag, sketchbook - carrying the rings left by a cup set down and picked up a few times. The rings are the record of a conversation's pauses.

- **Thesis:** The rings a cup leaves are a diary of how long someone sat.
- **1. In one sentence (no technique):** The faint brown rings a drink leaves on paper each time it is put down, which together show how long someone stayed.
- **2. Generative rule:** Each visit, liquid wets a ring under the vessel's foot; wetting spreads through the paper by capillary wicking with fibre-scale permeability and tilt; while it dries, solute is carried outward to the evaporating edge and deposited (the coffee-ring effect); stain darkness follows Beer-Lambert absorbance of the deposited solute. Visits overlap and later rings partly redissolve earlier ones.
- **3. Composition, material, motion:** Top-down sheet, mostly empty paper; rings sit off-centre where a hand would rest. Material: paper grain and fibre, translucent tea/coffee/wine deposits. Motion: none - the time is in the overlapping rings.
- **4. Meaningful variation:** Number of visits (once vs many = brief vs long stay); vessel (mug, wine glass stem, tumbler); incidents (slid, drip, spoon set down) imply small events; liquid changes the deposit physics, not just colour; paper changes how far it wicks.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Coffee rings are a familiar visual cliche; it must read as time and company, not a stain texture pack.
- **Nearest prior art and difference:** Coffee-ring physics (Deegan et al. 1997) and stain photography / 'coffee ring' art; generic coffee-stain brushes. Difference: the rings are simulated from wicking and evaporation per visit, and the series is about duration of stay, not decoration.
- **Restraint:** One sheet, one vessel, at most a handful of visits; no text, no props in frame.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Feb 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `9ddb59825886070bc18381b9791ed2b15a148d0e34e283d13d0f40364590a8cc`

## References to check
Deegan et al., Nature 1997 (capillary flow, ring deposit); real photos of tea/coffee/wine rings on napkin, kraft, graph paper (shoot own reference set); paper chromatography tidelines.

## Engine design
Each visit, liquid wets a ring under the vessel's foot; wetting spreads through the paper by capillary wicking with fibre-scale permeability and tilt; while it dries, solute is carried outward to the evaporating edge and deposited (the coffee-ring effect); stain darkness follows Beer-Lambert absorbance of the deposited solute. Visits overlap and later rings partly redissolve earlier ones.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 02-tidelines <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 02-tidelines 24 200 --res-check`.

## Traits
Liquid, Paper, Visits, Vessel, Incident

## Self-critique
R5: tighter crop around the marks so a single visit fills the frame; rings are slightly oval and wobble, less perfectly circular. Remaining: some rings still fairly round; water stains stay faint (honest); napkin feathering still modest.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r2.png, contact-sheet-r5.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-03.png, heroes/hero-04.png, heroes/hero-05.png, heroes/hero-11.png, heroes/hero-12.png. Sample hashes: sha256("clyde-tidelines-<i>").

## Risks
- Coffee rings are a familiar visual cliche; it must read as time and company, not a stain texture pack.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

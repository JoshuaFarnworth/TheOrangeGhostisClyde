# Jun - Hollowed  (`2027/20-hollowed/`)

Old stone steps from above, each tread dished by centuries of feet, deepest toward the handrail side and just behind the rounded nosing; lichen in the corners where nobody steps.

- **Thesis:** Stone keeps the average of everyone who climbed it.
- **1. In one sentence (no technique):** Stone steps worn into shallow dips by centuries of people walking up and down.
- **2. Generative rule:** Footfalls sampled over decades to centuries: keep-to-the-rail or two-lane flows; climbing places the ball of the foot 6-12 cm behind the nosing, descending lands the heel further back and rolls the toe over the edge; wear is Archard-like (load x slip) through an elongated footprint kernel; dirt and lichen where wear is lowest; low raking light.
- **3. Composition, material, motion:** Three treads seen from downhill and slightly to one side, so both the lit treads and the shadowed risers show. Material: sandstone, limestone, granite, slate. Motion: none.
- **4. Meaningful variation:** Handrail side, traffic direction, stone hardness, centuries.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** If the camera is too high the dishes flatten into bars again; too low and the treads vanish.
- **Nearest prior art and difference:** Photographs of worn steps (Wells Cathedral chapter-house stairs are the famous example). Difference: wear simulated from footfall behaviour.
- **Restraint:** No people, no architecture beyond the steps.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jun 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `48265191886037c3f6c09d27746763b9131b43059fbf88c8d2f168c238ca1065`

## References to check
Wells Cathedral chapter house steps (photos); Archard wear law; studies of stair wear in heritage buildings (e.g. Campbell / Thompson on archaeology of stair wear).

## Engine design
Footfalls sampled over decades to centuries: keep-to-the-rail or two-lane flows; climbing places the ball of the foot 6-12 cm behind the nosing, descending lands the heel further back and rolls the toe over the edge; wear is Archard-like (load x slip) through an elongated footprint kernel; dirt and lichen where wear is lowest; low raking light.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 20-hollowed <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 20-hollowed 24 200 --res-check`.

## Traits
Stone, Worn, Handrail, Traffic, Deepest Dish

## Self-critique
R3 was graded promising but the review was right: hero-02 still read as flat grey bars with a wavy line. R4: rebuilt the camera (from downhill, slight yaw, mid elevation) and the step geometry (risers under the nosing, rounded worn nosing, raking light). Dishes now read at contact-sheet size as scooped hollows, offset toward the handrail (hero-04, hero-11) or centred when there is none (hero-03). Sweep of 24 at 200 px, 0 content fails (median detail 0.236). Still weak: silhouette edges can be slightly jagged; the flight still floats in a dark void rather than sitting in a building; limestone dishes can look a bit airbrushed; some sandstone bedding is still stripy; nosing rounding is subtle at this angle.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r3.png, contact-sheet-r4.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-03.png, heroes/hero-04.png, heroes/hero-11.png. Sample hashes: sha256("clyde-hollowed-<i>").

## Risks
- If the camera is too high the dishes flatten into bars again; too low and the treads vanish.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

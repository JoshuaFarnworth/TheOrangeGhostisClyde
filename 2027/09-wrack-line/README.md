# Sep - Wrack Line  (`2027/09-wrack-line/`)

The upper beach after the tide has turned: lines of weed and foam left by successive waves, the highest one from hours ago.

- **Thesis:** The sea writes the last few hours on the sand.
- **1. In one sentence (no technique):** The lines of seaweed and foam each wave leaves on a beach as the tide goes out.
- **2. Generative rule:** Swash run-up from Rayleigh-distributed wave heights on a tide curve; each run-up leaves a mark; beach cusps; later marks overwrite earlier ones.
- **3. Composition, material, motion:** Top-down sand band with sea at one edge. Material: wet/dry sand, weed, foam. Motion: tide direction.
- **4. Meaningful variation:** Tide state, sea state, what was left behind, light, how many marks survived.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Could look like a diagram rather than a beach.
- **Nearest prior art and difference:** Aerial beach photography. Difference: the marks are a readable tide record.
- **Restraint:** Sand and a few lines.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Sep 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `f13c2658600ff85c3adbc17de17456136a8a1d482abcc963afcd32731c90be6d`

## References to check
Aerial photos of wrack lines and swash marks; swash run-up literature.

## Engine design
Swash run-up from Rayleigh-distributed wave heights on a tide curve; each run-up leaves a mark; beach cusps; later marks overwrite earlier ones.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 09-wrack-line <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 09-wrack-line 24 200 --res-check`.

## Traits
Tide, Sea, Left Behind, Light, Marks Kept

## Self-critique
R5: varied crops (not always three equal bands); swash marks now read as a tide record; cusp lobes visible. Remaining: wind ripples still a bit regular; some water edges muddy; foam can flake; walker prints and some objects are a little graphic or easy to miss.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r5.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-02.png, heroes/hero-05.png, heroes/hero-07.png, heroes/hero-10.png. Sample hashes: sha256("clyde-wrack-line-<i>").

## Risks
- Could look like a diagram rather than a beach.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

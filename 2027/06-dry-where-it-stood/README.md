# Jun - Dry Where It Stood  (`2027/06-dry-where-it-stood/`)

A wet car park after rain, with pale dry rectangles where cars were parked through the shower and have just left. At night, a sodium lamp catches the wet asphalt.

- **Thesis:** Rain marks who stayed and who has gone.
- **1. In one sentence (no technique):** The dry shapes cars leave on wet tarmac when they drive away after the rain.
- **2. Generative rule:** Rain falls at a slant; each parked car casts a rain shadow swept along the slant; when a car leaves, its dry footprint begins to wet and dry at a mottled rate; depressions pool into puddles; wet surfaces reflect sky/lamps by Fresnel (~2% at normal incidence) with mirror points for lamps; oil drips mark engine ends.
- **3. Composition, material, motion:** Top-down bays with painted lines and wheel stops; 1-4 ghosts; lots of dark asphalt. Material: aggregate, paint, water film, oil. Motion: minutes since departure encoded in ghost sharpness.
- **4. Meaningful variation:** Time since the rain stopped and since each car left (sharp vs fading ghosts), how many left, layout, a car that left during the rain (half-wet ghost), lamp vs day.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** The image of a dry car outline is familiar from photos; the series has to earn itself through multi-car timelines.
- **Nearest prior art and difference:** Photographs of dry car silhouettes on wet roads (a common phone-photo subject). Difference: a simulated, readable timeline of departures in one lot.
- **Restraint:** Mostly empty asphalt; no cars present; palette of greys and one lamp colour.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jun 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `ac9d74b801ddf27222cbf038096d973919fcf61d7466852650fd6afe8ecb11c4`

## References to check
Photos of dry patches under departed cars; asphalt wet/dry albedo; road-surface Fresnel.

## Engine design
Rain falls at a slant; each parked car casts a rain shadow swept along the slant; when a car leaves, its dry footprint begins to wet and dry at a mottled rate; depressions pool into puddles; wet surfaces reflect sky/lamps by Fresnel (~2% at normal incidence) with mirror points for lamps; oil drips mark engine ends.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 06-dry-where-it-stood <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 06-dry-where-it-stood 24 200 --res-check`.

## Traits
Since The Rain, Hour, Departed, Layout, Lines, Incident, Left During The Rain

## Self-critique
R5: drying cells keep a residual pale ghost so the footprint still reads after the film has gone; lamp glints are tighter (less smear); bay paint is more worn. Remaining: some quiet overcast cells; lines can still dominate; night wet mottling can look cloudy.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r2.png, contact-sheet-r5.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-03.png, heroes/hero-04.png, heroes/hero-05.png, heroes/hero-06.png. Sample hashes: sha256("clyde-dry-where-it-stood-<i>").

## Risks
- The image of a dry car outline is familiar from photos; the series has to earn itself through multi-car timelines.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

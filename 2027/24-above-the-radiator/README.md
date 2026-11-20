# Nov - Above the Radiator  (`2027/24-above-the-radiator/`)

The wall above a radiator after some winters: a grey breath of dust rising off the top grille and fading upward, darker wherever the wall behind is colder, so the plasterboard dabs, the studs or the brick courses show through the paint.

- **Thesis:** Warm air draws the hidden skeleton of a wall in dust.
- **1. In one sentence (no technique):** The grey dust stain that grows on the wall above a radiator, showing the shapes of what is behind the plaster.
- **2. Generative rule:** A line plume rises from the radiator's top: deposition at height y follows an erf-edged sheet whose width grows linearly and whose concentration decays exponentially, modulated by slow vertically stretched turbulence and slightly darker entraining edges. Thermophoresis: particles settle more where the wall surface is colder, so a cold-spot map multiplies deposition: plasterboard dot-and-dab adhesive blobs (a grid of soft ellipses), timber studs at 400 or 600 mm centres, or brick courses (65 mm brick + 10 mm joint, pattern staining). A sill above traps the plume and darkens its underside.
- **3. Composition, material, motion:** Tall front-on crop, 100 x 125 cm: skirting, pipes and valves, a white panel radiator with convector grille, and the wall above. Material: emulsion, pressed steel, dust. Motion: none.
- **4. Meaningful variation:** Winters since decorating; wall construction (dabs, studs, brick); a sill above or open wall; radiator width; smoker (yellower deposit); plume lean from draughts.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Could read as a building-defect photograph rather than an artwork; the radiator needs to stop looking modelled.
- **Nearest prior art and difference:** Pattern staining / 'ghosting' is a documented building defect (photos in building-survey guides). Difference: it is shown as a portrait of a room's winters, not a defect report.
- **Restraint:** Grey on off-white only; no furniture, no window view.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Nov 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `7d226d3f6e9db902c3011dd1f6d1e03cd9b7569b552c5c1ef8f836b995d883b7`

## References to check
Building-surveying literature on pattern staining and thermophoretic deposition; plasterboard dot-and-dab spacing guidance; photos of real stained walls over radiators.

## Engine design
A line plume rises from the radiator's top: deposition at height y follows an erf-edged sheet whose width grows linearly and whose concentration decays exponentially, modulated by slow vertically stretched turbulence and slightly darker entraining edges. Thermophoresis: particles settle more where the wall surface is colder, so a cold-spot map multiplies deposition: plasterboard dot-and-dab adhesive blobs (a grid of soft ellipses), timber studs at 400 or 600 mm centres, or brick courses (65 mm brick + 10 mm joint, pattern staining). A sill above traps the plume and darkens its underside.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 24-above-the-radiator <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 24-above-the-radiator 24 200 --res-check`.

## Traits
Winters, Behind The Plaster, Sill, Wall, Radiator, Smoker

## Self-critique
R1: the dot-and-dab and stud ghosting read convincingly and the plume is soft and plausible. Weak: the radiator and pipes are clean CG geometry; brick-course staining is too even (reads a little like wallpaper); everything is very soft, so it needs one crisp, real-feeling element.

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-03.png, heroes/hero-06.png, heroes/hero-15.png. Sample hashes: sha256("clyde-above-the-radiator-<i>").

## Risks
- Could read as a building-defect photograph rather than an artwork; the radiator needs to stop looking modelled.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

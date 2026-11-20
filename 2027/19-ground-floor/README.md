# Aug - Ground Floor  (`2027/19-ground-floor/`)

The brushed-steel button panel of a lift: the ground-floor button polished smooth with its number half rubbed out, the close-door button worn by impatience, a floor nobody visits still looking new.

- **Thesis:** A lift panel counts the building's comings and goings.
- **1. In one sentence (no technique):** Lift buttons worn by years of fingers, most on the floors people actually go to.
- **2. Generative rule:** A building (flats, offices, hotel, car park) with floors and occupancy; trips simulated over years (everyone returns to G, residents ride to their own floors in proportion to occupancy, vacant floors almost never, close-door pressed by the impatient); wear = 1 - exp(-presses); wear removes engraving infill from the contact centre outward, polishes the brushed grain toward a mirror, and leaves an oil ring.
- **3. Composition, material, motion:** Front-on panel, one or two columns of buttons, open/close and alarm below. Material: brushed stainless, black infill, braille. Motion: none.
- **4. Meaningful variation:** Building type, number of floors, a vacant floor, the canteen or pool floor, years in service.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** An object portrait more than a trace; it may feel like product rendering.
- **Nearest prior art and difference:** Photos of worn lift buttons (a known internet curiosity). Difference: wear computed from a building's simulated traffic.
- **Restraint:** No signage, no LEDs.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Aug 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `c15ee1f559482527dcd2d35ff51fefd556edc6b6bd0b47dc10ca01c107d57725`

## References to check
Photos of worn elevator panels (shoot own); stainless brushed finish references.

## Engine design
A building (flats, offices, hotel, car park) with floors and occupancy; trips simulated over years (everyone returns to G, residents ride to their own floors in proportion to occupancy, vacant floors almost never, close-door pressed by the impatient); wear = 1 - exp(-presses); wear removes engraving infill from the contact centre outward, polishes the brushed grain toward a mirror, and leaves an oil ring.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 19-ground-floor <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 19-ground-floor 24 200 --res-check`.

## Traits
Building, Floors, Years, Note, Close Door, Basement

## Self-critique
R1: reads instantly as a lift panel. Weak: the steel reflection is blotchy and too contrasty; wear differences between buttons are too subtle at thumbnail size; the glyphs are simple stroke numerals, not engraved type.

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-06.png, heroes/hero-10.png. Sample hashes: sha256("clyde-ground-floor-<i>").

## Risks
- An object portrait more than a trace; it may feel like product rendering.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

# Mar - Unfaded  (`2027/03-unfaded/`)

An empty room's floor, bleached by years of sun through one window, with darker unfaded shapes where furniture stood. The occupants have moved out; the floor remembers the layout.

- **Thesis:** Sunlight keeps a record of where we put our things.
- **1. In one sentence (no technique):** The darker patches left on a sun-faded floor where furniture used to be, after someone has moved out.
- **2. Generative rule:** Integrate solar exposure over the years lived in: sun position from latitude/declination/hour angle, the window aperture and reveal projected onto the floor, furniture blocking light as shadow hulls, plus a diffuse sky term; accumulated dose drives a photochemical fade of the wood/carpet. Today's sun patch is drawn on top.
- **3. Composition, material, motion:** Top-down floor plan of a room, window wall at one edge; the ghosts are quiet rectangles; one warm sun patch. Material: boards, carpet, lino with grain and gaps. Motion: none - years compressed into dose.
- **4. Meaningful variation:** Years lived in (depth of ghost), facing direction (where sun lands), furniture layout and whether it was ever rearranged (double ghosts = a life change), today's time of day.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Shares the 'ghost of what was there' idea with Dry Where It Stood; floor texture realism is the ceiling on quality.
- **Nearest prior art and difference:** Photography of furniture ghosts on faded floors/walls after moves; sun-path diagrams. Difference: the fade is computed from a real sun path and an imagined household, so the layout is a reconstructed life.
- **Restraint:** Empty room, no objects, one window, muted wood palette.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Mar 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `6cc7a62686f5ad08da7850cc7f988c1e3c2797352e56ee027186a6d76e70abf7`

## References to check
Photos of 'ghost' marks under rugs and furniture on oak/pine floors; NOAA solar position algorithm; wood photodegradation (lignin yellowing/greying).

## Engine design
Integrate solar exposure over the years lived in: sun position from latitude/declination/hour angle, the window aperture and reveal projected onto the floor, furniture blocking light as shadow hulls, plus a diffuse sky term; accumulated dose drives a photochemical fade of the wood/carpet. Today's sun patch is drawn on top.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 03-unfaded <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 03-unfaded 24 200 --res-check`.

## Traits
Floor, Facing, Lived In, Window, Today, Furniture, Pieces

## Self-critique
R5: more board-to-board colour and slightly wobbly gaps; fallback hour so today's sun patch is more often in the room; carpet contrast and pile improved but carpet cells are still the weak ones. Remaining: boards can still look a bit CG; carpet ghosts and sun patches stay soft.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r2.png, contact-sheet-r5.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-06.png, heroes/hero-07.png, heroes/hero-10.png. Sample hashes: sha256("clyde-unfaded-<i>").

## Risks
- Shares the 'ghost of what was there' idea with Dry Where It Stood; floor texture realism is the ceiling on quality.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

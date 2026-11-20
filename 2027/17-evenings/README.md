# Feb - Evenings  (`2027/17-evenings/`)

The neck and shoulder of an empty wine bottle that has held a candle for a long time, coated in layered runs of wax in the colours of whatever candles were in the drawer, the last candle burnt down.

- **Thesis:** A candle bottle is a tally of dinners.
- **1. In one sentence (no technique):** Layers of old candle wax that have run down a wine bottle over many evenings.
- **2. Generative rule:** Each evening burns a candle colour from the household's drawer; overflow drips (more on the draught side) of Pareto-distributed volume run down the real bottle profile on an unwrapped angle-height grid, steered into channels toward thinner wax, spreading and slowing on the shoulder, freezing when their heat is spent (run length ~ sqrt(volume)), ending in a bead; later drips coat earlier ones; rendered as translucent wax over dark glass, lit by one lamp.
- **3. Composition, material, motion:** Portrait crop of neck and shoulder against a dim room. Material: paraffin, green/amber glass. Motion: frozen runs.
- **4. Meaningful variation:** Palette habit (always white, Christmas red, whatever was in the drawer, two colours), how many evenings, draught strength, place.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Kitsch. It must feel like one household's winters, not a trattoria prop.
- **Nearest prior art and difference:** Chianti-bottle candle holders (a restaurant cliché in real life); wax-drip photography. Difference: the accumulation is simulated drip by drip so the coat is a count.
- **Restraint:** No flame, one bottle, the rest dark.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Feb 2027 (a studio target, not a public launch commitment)
- **Status:** Round 3 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `7a9db75d03c24957bbd430214ec5f7672804fda93ed50d92f6f8322dcef52a14`

## References to check
Photos of real long-used candle bottles (shoot own); molten-wax rivulet freezing (solidifying rivulet literature).

## Engine design
Each evening burns a candle colour from the household's drawer; overflow drips (more on the draught side) of Pareto-distributed volume run down the real bottle profile on an unwrapped angle-height grid, steered into channels toward thinner wax, spreading and slowing on the shoulder, freezing when their heat is spent (run length ~ sqrt(volume)), ending in a bead; later drips coat earlier ones; rendered as translucent wax over dark glass, lit by one lamp.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 17-evenings <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 17-evenings 24 200 --res-check`.

## Traits
Candles, Evenings, Drips, Place, Draught

## Self-critique
R1: wax was a mottled camouflage crust; the stub looked like a cork; horizontal striping. R3: deposits now have height as well as width, so drips read as rounded rivulets that end in a bead and stack in layers (hero-01, hero-05); a single long run can carry the picture (hero-02). Sweep of 24 at 200 px, 0 content fails. Still weak: the stub can still look like a short cut plug with a jagged rim; some long body drips are a bit too smooth and ribbon-like; a faint horizontal banding still shows under thin wax on the neck; Years-of-mixed-colours can tip into trattoria kitsch; Years renders are slow (~40 s headless).

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r3.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-02.png, heroes/hero-05.png. Sample hashes: sha256("clyde-evenings-<i>").

## Risks
- Kitsch. It must feel like one household's winters, not a trattoria prop.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

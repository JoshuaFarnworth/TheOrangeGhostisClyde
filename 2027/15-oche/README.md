# Sep - Oche  (`2027/15-oche/`)

A close crop of a pub dartboard with the darts put away: the bed of treble twenty chewed pale by thousands of throws, fresh slit holes around it, the wire spider casting small shadows.

- **Thesis:** The holes in a dartboard are a census of the people who throw at it.
- **1. In one sentence (no technique):** A worn dartboard, close up, showing where people's darts have landed over the years.
- **2. Generative rule:** Regulation board geometry and number order; players drawn with a skill (2-D Gaussian spread 8-50 mm, after Tibshirani, Price & Taylor 2011) and a habit (good players on T20, fall back to T19, finish on D16/D20; beginners aim at the bull); recent throws leave slit holes, older ones are closed by the sisal and only show as frayed paler fibre; a board that has been turned carries an old wear patch under a different number; the camera frames where the recent holes are.
- **3. Composition, material, motion:** Tight crop on the worn bed; segments, wire and numerals as context. Material: sisal end grain, painted segments, galvanised wire. Motion: none.
- **4. Meaningful variation:** Who throws (alone, a pair, league night, beginners), board age, turned or not, skill -> where the wear sits and how tight it is.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** A dartboard is a strong ready-made graphic; the trace can be swamped by the object.
- **Nearest prior art and difference:** Stock dartboard photography; heat-map visualisations of dart throws. Difference: throws simulated from skill and strategy and shown as physical damage, not a chart.
- **Restraint:** No darts, no chalkboard, crop away the icon.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Sep 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `de92ad3e271063027cc82ce9268fb815b5473d6d64fa5dbff2658c0acd74a9ac`

## References to check
Tibshirani, Price & Taylor (2011), 'A statistician plays darts', JRSS A; photos of used bristle boards (shoot own).

## Engine design
Regulation board geometry and number order; players drawn with a skill (2-D Gaussian spread 8-50 mm, after Tibshirani, Price & Taylor 2011) and a habit (good players on T20, fall back to T19, finish on D16/D20; beginners aim at the bull); recent throws leave slit holes, older ones are closed by the sisal and only show as frayed paler fibre; a board that has been turned carries an old wear patch under a different number; the camera frames where the recent holes are.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 15-oche <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 15-oche 24 200 --res-check`.

## Traits
Throwers, Board, Turned, Best Thrower, Misses

## Self-critique
R3 punctures were seed/rice stamps and the sunburst still swamped the trace. R4: recent holes are tiny dark slits, not capsules; older throws only add a pale, fuzzy worn patch and a field of closed pores (hero-03); colours are further muted; wires are duller metal with a drop shadow, sitting on the sisal rather than drawn through it. Sweep of 24 at 200 px, 0 content fails. Still weak: the sector sunburst is still the first thing you see at thumbnail; wires, though darker, can still read as graphic lines; sisal is fine noise rather than fibre bundles; League Night cells still gather in the same bed.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r3.png, contact-sheet-r4.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-03.png, heroes/hero-05.png. Sample hashes: sha256("clyde-oche-<i>").

## Risks
- A dartboard is a strong ready-made graphic; the trace can be swamped by the object.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

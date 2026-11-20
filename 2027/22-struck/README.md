# Jan - Struck  (`2027/22-struck/`)

The striking strip on the side of a box of matches, close up: grey-black scrapes where each match was dragged, dense in the middle where the thumb holds the box, thinning out to the ends.

- **Thesis:** A matchbox counts its own matches, and remembers the hand that struck them.
- **1. In one sentence (no technique):** The dark scrape marks on the side of a matchbox, one for every match that was lit.
- **2. Generative rule:** A box gets a number of strikes (a few, half, nearly empty) and an owner (one smoker, the hob, birthday candles, everyone). Each strike is a stroke along the strip: position drawn around where a thumb grips the box, angle from that person's wrist, one direction for one person or both for a household. The head deposits grey-black residue that is densest where it bites and breaks up as it lifts (lit), or stalls in a short dense stub (failed; more often if the box got damp). Repeated strikes abrade the red phosphorus-glass layer toward the binder in the middle.
- **3. Composition, material, motion:** Macro crop, about 56 x 28 mm: the printed card side of the box with a coloured band at top and bottom and the red-brown granular strip across it, slightly tilted. Material: glass grit with tiny glints, kraft card, carbon residue with anisotropic streaks. Motion: none, strokes stacked.
- **4. Meaningful variation:** Count of strikes; one-way vs both-ways (one person vs a household); grip position and wrist angle; damp boxes leave stubby failed strikes; strip and print colours.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Small, slight object; risks being a texture study unless the stroke statistics really carry the person.
- **Nearest prior art and difference:** Phillumeny (matchbox-label collecting) and photos of used strikers; Sol LeWitt-style line accumulations. Difference: the marks are the side-effect of use, positioned by a hand model rather than composed.
- **Restraint:** No brand, no text, no matches, no flame. One strip.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jan 2027 (a studio target, not a public launch commitment)
- **Status:** Round 3 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `6e3427e62b811cf603a684b144f99c8ecd58746987b3a56290a2a04eacc913c3`

## References to check
Safety-match chemistry (red phosphorus + powdered glass strip, potassium chlorate head); photograph real used strikers from several households before round 2.

## Engine design
A box gets a number of strikes (a few, half, nearly empty) and an owner (one smoker, the hob, birthday candles, everyone). Each strike is a stroke along the strip: position drawn around where a thumb grips the box, angle from that person's wrist, one direction for one person or both for a household. The head deposits grey-black residue that is densest where it bites and breaks up as it lifts (lit), or stalls in a short dense stub (failed; more often if the box got damp). Repeated strikes abrade the red phosphorus-glass layer toward the binder in the middle.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 22-struck <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 22-struck 24 200 --res-check`.

## Traits
Box, Lit For, Matches, Failed Strikes, Damp, Direction

## Self-critique
R1: streaks were soft blobby smudges. R3: each strike is a thin, broken scratch (sometimes a bundle of grooves) that bites and then skips as the head lifts, so a lightly used box shows individual strokes (hero-06) and a half-used box is a cluster of strokes, not one puddle (hero-02, hero-03). Sweep of 24 at 200 px, 0 content fails. Still weak: heavy-use centres can still clump; the strip surface has a slightly regular 'knit' grain; a few grit glints still read as tiny squares; the printed band is still plain colour.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r3.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-02.png, heroes/hero-03.png, heroes/hero-06.png. Sample hashes: sha256("clyde-struck-<i>").

## Risks
- Small, slight object; risks being a texture study unless the stroke statistics really carry the person.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

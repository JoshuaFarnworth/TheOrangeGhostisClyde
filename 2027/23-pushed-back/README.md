# Oct - Pushed Back  (`2027/23-pushed-back/`)

The wall behind a dining table: a row of grey scuff lines at chair-back height, one per seat, where every chair went back against the paint when someone stood up.

- **Thesis:** The wall behind the table keeps the minutes of every meal, one line per seat.
- **1. In one sentence (no technique):** Grey scuff marks on the wall behind a dining table where the chairs bump it every time someone gets up.
- **2. Generative rule:** Each seat has a chair (back height, rail width) and a sitter whose share of meals is Pareto-distributed. Every stand-up pushes the chair back so its top rail meets the wall at a jittered height and offset; contact transfers grime (1 - exp(-dose)), concentrated at the rail's proud corners, and burnishes the matt emulsion; rare hard knocks chip the paint at a corner, exposing the previous colour or plaster. A sitter who tips back drags the rail higher. A repainted patch hides older marks and the record starts again on top.
- **3. Composition, material, motion:** Front-on wall, about 90 x 45 cm centred just below chair-back height; emulsion with roller orange-peel and gentle undulation in low raking light; sometimes a socket, filled picture-hook holes, a hairline crack. Motion: none.
- **4. Meaningful variation:** Number of seats; which seat is used most (darkest band); an odd chair at a different height; someone who tips back; years of use; a repaint patch; wall colour.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Too minimal to hold a collector's attention; needs stronger raking light, real burnish sheen and better chip shapes.
- **Nearest prior art and difference:** Real-world chair-rail mouldings exist to prevent exactly this; minimal 'stain' paintings. Difference: the bands are a usage record per seat, not a composition.
- **Restraint:** Mostly empty wall; no table, no chairs, nothing but the marks and the wall's own small history.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Oct 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `8edd05a43baeeb40ddf7edf04ae06d7393dfc716c6d7468f10cbd1b5f41dff7e`

## References to check
Photograph real dining-room walls (own and friends', with permission); paint-scuff and burnishing behaviour of matt vs eggshell emulsion.

## Engine design
Each seat has a chair (back height, rail width) and a sitter whose share of meals is Pareto-distributed. Every stand-up pushes the chair back so its top rail meets the wall at a jittered height and offset; contact transfers grime (1 - exp(-dose)), concentrated at the rail's proud corners, and burnishes the matt emulsion; rare hard knocks chip the paint at a corner, exposing the previous colour or plaster. A sitter who tips back drags the rail higher. A repainted patch hides older marks and the record starts again on top.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 23-pushed-back <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 23-pushed-back 24 200 --res-check`.

## Traits
Seats, Years, Wall, Chairs, Tips Back, Repainted, Chips, Socket

## Self-critique
R3 chips read as little flowers/stars and the burnish was one uniform smear. R4: each seat is a separate chair-width band with a visible gap (hero-02, hero-04, hero-09); chair widths and darkness vary; chips are irregular craters with a dark broken edge and paler plaster inside, not floral flecks (hero-02). Sweep of 24 at 200 px, 2 fails on terracotta — both still show clear chair marks; they trip the absolute detail floor because the wall is mostly empty (median detail 0.024). Still weak: some chips are still a bit clean and cut-out; a few bands remain rather thin and stroke-like; sockets are simple rectangles; the terracotta fails are a reminder that this is a sparse picture.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r3.png, contact-sheet-r4.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-02.png, heroes/hero-04.png, heroes/hero-09.png. Sample hashes: sha256("clyde-pushed-back-<i>").

## Risks
- Too minimal to hold a collector's attention; needs stronger raking light, real burnish sheen and better chip shapes.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

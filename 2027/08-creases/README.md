# Aug - Creases  (`2027/08-creases/`)

A letter that has been folded, carried, reread and once crumpled, lying flat under raking light; the handwriting just shows through.

- **Thesis:** How a letter is folded shows how often it was read.
- **1. In one sentence (no technique):** A kept letter whose folds and wear show how many times it was opened.
- **2. Generative rule:** Fold history (tri-fold, refolded wrong, crumple) builds a relief height-field; handling softens and greys creases; raking light shades the relief; handwriting from an oscillation pen model shows through the paper.
- **3. Composition, material, motion:** One sheet on a dark surface, centred. Material: laid, airmail, lined paper. Motion: none.
- **4. Meaningful variation:** Fold history and handling imply a relationship (carried for years vs read once).
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Very quiet - may be too subtle to read on screen.
- **Nearest prior art and difference:** Crease-pattern origami art, crumpled-paper photography. Difference: the folds are the life of one letter.
- **Restraint:** One sheet, illegible text, single light.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Aug 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `0767e8263d0deef44fee835ea985cf5c585337ebee1d6b475c34a9bb3c98ebe0`

## References to check
Raking light photos of folded letters; archival paper wear.

## Engine design
Fold history (tri-fold, refolded wrong, crumple) builds a relief height-field; handling softens and greys creases; raking light shades the relief; handwriting from an oscillation pen model shows through the paper.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 08-creases <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 08-creases 24 200 --res-check`.

## Traits
Paper, Folds, Handled, Crumpled

## Self-critique
R1 only: relief too soft, creases need crisp lines; hero-02 is close to blank.

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-02.png. Sample hashes: sha256("clyde-creases-<i>").

## Risks
- Very quiet - may be too subtle to read on screen.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

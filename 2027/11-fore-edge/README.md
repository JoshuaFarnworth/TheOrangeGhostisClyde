# Nov - Fore-edge  (`2027/11-fore-edge/`)

A stack of books seen edge-on, their page edges darkened where thumbs have opened them most - the cookbook's favourite recipe, the dictionary's common letters.

- **Thesis:** The edge of a book shows which pages we needed.
- **1. In one sentence (no technique):** The grubby bands on a book's page edges where it has been opened most often.
- **2. Generative rule:** Per-book use distributions (recipes, letters, chapters) accumulate thumb grime and splay on the fore-edge; spills leave a dashed stain across pages.
- **3. Composition, material, motion:** Side-on stack against a wall. Material: paper edges, cloth bindings. Motion: none.
- **4. Meaningful variation:** Which books, how used, a spill.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Subtle and small in frame.
- **Nearest prior art and difference:** Fore-edge painting; book photography. Difference: the wear is the record of use.
- **Restraint:** A few books.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Nov 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `cb483137dd7c08fcfc69a47cf4721032755963791998ca2b2a7f16c9ecba036f`

## References to check
Photos of worn cookbook and dictionary fore-edges.

## Engine design
Per-book use distributions (recipes, letters, chapters) accumulate thumb grime and splay on the fore-edge; spills leave a dashed stain across pages.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 11-fore-edge <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 11-fore-edge 24 200 --res-check`.

## Traits
Stack, Most Used, Books, Spill

## Self-critique
R5: tight crop; use bands, fall-open gaps and spills read at thumbnail. Remaining: dictionary dirt can bloom; thumb-index tabs are still a bit oval/graphic; quiet cells and cloth boards are a little flat; stacks still share a horizontal composition.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r5.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-04.png, heroes/hero-05.png. Sample hashes: sha256("clyde-fore-edge-<i>").

## Risks
- Subtle and small in frame.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

# Jul - Scoured  (`2027/21-scoured/`)

Looking down into a stainless kitchen sink under the ceiling light: years of scrubbing scratches, invisible until they catch the light, gather into faint rings around its reflection.

- **Thesis:** The light finds the years of washing up.
- **1. In one sentence (no technique):** The fine scratches in an old steel sink that only show up as rings around a light's reflection.
- **2. Generative rule:** Scratches generated from use (scouring circles where pans are washed, short strokes round the drain, long cutlery drags); each scratch segment glints only where it is perpendicular to the line to the lamp's mirror image (thin-cylinder reflection), so a random field resolves into arcs centred on the highlight; brightness falls off away from it.
- **3. Composition, material, motion:** Top-down basin with rolled rim and drain; one lamp reflection. Material: brushed stainless. Motion: none.
- **4. Meaningful variation:** Years, scourer (cloth, green pad, steel wool), what is washed, light colour and position.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Close to a well-known shader effect.
- **Nearest prior art and difference:** The well-known radial-scratch halo on brushed metal; star-trail photography (visual risk). Difference: scratches from a household's washing habits.
- **Restraint:** Empty sink, no water, no dishes.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jul 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `49d988254216cab8f3952cfd0345836a48865fd0af61620d43d7240646bd6836`

## References to check
Anisotropic reflection of scratched surfaces (e.g. Raymond et al. 'Scratch rendering'); photos of own sink.

## Engine design
Scratches generated from use (scouring circles where pans are washed, short strokes round the drain, long cutlery drags); each scratch segment glints only where it is perpendicular to the line to the lamp's mirror image (thin-cylinder reflection), so a random field resolves into arcs centred on the highlight; brightness falls off away from it.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 21-scoured <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 21-scoured 24 200 --res-check`.

## Traits
Used, Scourer, In The Sink, Drain, Light

## Self-critique
R1: the physical halo works. Weak: at hero size it can look like star-trail photography; rim bands look CG; outputs look similar to each other.

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-03.png, heroes/hero-09.png. Sample hashes: sha256("clyde-scoured-<i>").

## Risks
- Close to a well-known shader effect.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

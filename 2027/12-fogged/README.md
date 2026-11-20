# Dec - Fogged  (`2027/12-fogged/`)

A steamed-up bus or kitchen window at night, with the blurred lights outside showing through a peephole someone wiped and the drops running down.

- **Thesis:** A wiped window is the trace of someone who wanted to see out.
- **1. In one sentence (no technique):** A misted window at night with a patch someone wiped to look out.
- **2. Generative rule:** Breath-figure condensation: droplet nucleation, growth, coalescence, renucleation, sliding runs; a wipe resets the area; drops act as lenses on the out-of-focus lights; fog veil.
- **3. Composition, material, motion:** Window filling the frame; lights band; one wipe. Material: glass, water. Motion: runs.
- **4. Meaningful variation:** Window type, trace (peephole, wipe, finger mark), fog thickness, runs.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Closest to a stock shader demo of all; must lean on the wipe.
- **Nearest prior art and difference:** 'Heartfelt' Shadertoy (BigWIngs) rain-on-glass shader. Difference: condensation physics and a human wipe as subject.
- **Restraint:** One wipe, few colours.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Dec 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `e9781c54fc2dd36677f86518423e090edc305c7bf4308fe079a91816634c978b`

## References to check
Photos of fogged windows; breath-figure literature.

## Engine design
Breath-figure condensation: droplet nucleation, growth, coalescence, renucleation, sliding runs; a wipe resets the area; drops act as lenses on the out-of-focus lights; fog veil.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 12-fogged <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 12-fogged 24 200 --res-check`.

## Traits
Window, Trace, Fog, Runs

## Self-critique
R1: atmospheric; drops read as dark rings at low res; fog speckle; at 1600 'Streaming' grows into a forest of trails and the peephole is lost - needs work.

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-02.png, heroes/hero-07.png. Sample hashes: sha256("clyde-fogged-<i>").

## Risks
- Closest to a stock shader demo of all; must lean on the wipe.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

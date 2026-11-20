# May - Board  (`2027/16-board/`)

A wooden chopping board seen close, washed and put back: a field of fine knife cuts gathered where one cook stands and chops.

- **Thesis:** A chopping board remembers where your hand goes.
- **1. In one sentence (no technique):** The fine knife scratches on a chopping board, thickest where the cook always works.
- **2. Generative rule:** Cooks with handedness, stance and repertoire; rocking chops leave short cuts perpendicular to the counter near the hand, bread leaves long shallow saw lines, jointing a few deep diagonals; each cut is a groove (dark settled juice) with a pale crushed lip; visibility depends on the cut's angle to the window's raking light; age softens old cuts; stains wick along the grain.
- **3. Composition, material, motion:** Close crop of the working zone, sometimes an edge or hanging hole. Material: long-grain beech/oak/maple/walnut/bamboo strips. Motion: none.
- **4. Meaningful variation:** One cook vs a busy kitchen (overlapping zones and angles), left-handedness (tilt), years, stains.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** The working zone can still read as hatching rather than a used board; wood realism is the ceiling.
- **Nearest prior art and difference:** Product/lifestyle photos of chopping boards. Difference: the cut field is generated from stance and technique.
- **Restraint:** No food or knife.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** May 2027 (a studio target, not a public launch commitment)
- **Status:** Round 3 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `0cefca53db5dff20b5558446ad48ae8e2045b2b2afd498822e13580552b710e7`

## References to check
Photos of used boards under raking light (shoot own); end-grain vs long-grain wear.

## Engine design
Cooks with handedness, stance and repertoire; rocking chops leave short cuts perpendicular to the counter near the hand, bread leaves long shallow saw lines, jointing a few deep diagonals; each cut is a groove (dark settled juice) with a pale crushed lip; visibility depends on the cut's angle to the window's raking light; age softens old cuts; stains wick along the grain.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 16-board <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 16-board 24 200 --res-check`.

## Traits
Wood, Used, Cooks, Left-Handed, Stain, Board

## Self-critique
R1: weak — cuts vanished at thumbnail and looked like pencil hatching; grain was ruled paper. R3: the working zone reads at contact-sheet size as the place someone stands to cut (hero-04, hero-07); individual cuts at the edges have a dark groove and a pale lip; grain is warped rather than ruled; stains and hanging holes still vary the set. Sweep of 24 at 200 px, 0 content fails. Still weak: dense centres still look like grey scribble more than incised wood; maple especially is a bit CG-smooth; the lip/groove contrast is better but not yet a convincing V-cut in timber.

## Outputs
Contact sheets: contact-sheet-r1.png, contact-sheet-r3.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-03.png, heroes/hero-04.png, heroes/hero-07.png. Sample hashes: sha256("clyde-board-<i>").

## Risks
- The working zone can still read as hatching rather than a used board; wood realism is the ceiling.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

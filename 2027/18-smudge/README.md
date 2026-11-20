# Apr - Smudge  (`2027/18-smudge/`)

A phone face up on a table with its screen off; in the reflection of a window the glass shows the owner's thumb: the unlock pattern, the typing, the scrolling arcs.

- **Thesis:** A dark screen is a private diary written in skin oil.
- **1. In one sentence (no technique):** Fingerprint smears on a switched-off phone screen that show how its owner unlocks and uses it.
- **2. Generative rule:** Contacts on a 71 x 147 mm screen over hours or days: swipe-up unlocks plus a 3x3 pattern or PIN taps; typing taps on QWERTY keys in proportion to English letter frequency; thumb flicks as arcs pivoting about the base of the thumb on the holding side; pinches for maps; each contact transfers oil with fingerprint ridges (~0.45 mm), saturating with repeated contact; on black glass oil scatters a raking light and dulls the window reflection; a sleeve wipe clears a band.
- **3. Composition, material, motion:** Top-down phone filling the frame on oak, linen or walnut; one skewed window reflection. Material: glass, oil film. Motion: implied by swipe arcs.
- **4. Meaningful variation:** Unlock method (a pattern literally leaks), handedness, habit (scrolling/messaging/maps/game), time since wiped.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Privacy/'hacker' reading could overpower the tender one.
- **Nearest prior art and difference:** Aviv et al. 2010 'Smudge attacks on smartphone touch screens' (USENIX WOOT); forensic photos. Difference: an intimate portrait rather than a security demo.
- **Restraint:** Screen off, no UI, one reflection.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Apr 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `7b841d1b8417f94a90810ecf29a9915f2e7eb9bd34344ca84a7a3af974b0c99a`

## References to check
Aviv, Gibson, Mossop, Blaze, Smith (2010); photos of own phone under raking light.

## Engine design
Contacts on a 71 x 147 mm screen over hours or days: swipe-up unlocks plus a 3x3 pattern or PIN taps; typing taps on QWERTY keys in proportion to English letter frequency; thumb flicks as arcs pivoting about the base of the thumb on the holding side; pinches for maps; each contact transfers oil with fingerprint ridges (~0.45 mm), saturating with repeated contact; on black glass oil scatters a raking light and dulls the window reflection; a sleeve wipe clears a band.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 18-smudge <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 18-smudge 24 200 --res-check`.

## Traits
Hand, Unlock, Mostly, Last Wiped, Surface

## Self-critique
R1: unlock patterns and keyboard zone read. Weak: the window reflection is a flat grey box that dominates; tap blobs are soft discs; ridge texture only visible at hero size; slow headless (~20 s).

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-01.png, heroes/hero-09.png. Sample hashes: sha256("clyde-smudge-<i>").

## Risks
- Privacy/'hacker' reading could overpower the tender one.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

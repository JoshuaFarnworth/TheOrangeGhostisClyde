# Dec - Splashback  (`2027/14-splashback/`)

The tiles behind a domestic hob between wipes: a fan of amber oil specks rising from the burners someone always uses, with the cleared arcs of the last wipe.

- **Thesis:** The wall behind the cooker keeps a record of which ring a household reaches for.
- **1. In one sentence (no technique):** Tiny oil splashes on the kitchen tiles behind a stove, thickest above the ring that gets used most.
- **2. Generative rule:** Cooking sessions drawn from household habit (favourite burner, dish); each session ejects droplets with log-normal diameters and 0.8-3.2 m/s speeds at random elevations from the pan rim; drops fly ballistically (small drag) to the wall plane, so spatter forms a parabolic fan whose height depends on the pan's distance from the wall; landed drops spread with darker rims, oxidise toward amber with age and hold dust; grout soaks oil; the last wipe (overlapping cloth arcs from an elbow pivot) removes older oil inside its strokes and leaves a faint smear.
- **3. Composition, material, motion:** Front-on tiles (metro, square, handmade, glass), the hob's dark back edge along the bottom. Material: glaze, grout, oil film. Motion: implied by fan shape.
- **4. Meaningful variation:** Which ring, what is cooked (fry-ups vs stir-fry vs sauces), time since wiped, a sauce that spat.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Can read as a dirty-tile texture rather than a portrait of a household.
- **Nearest prior art and difference:** Forensic blood-spatter analysis imagery; kitchen cleaning photos. Difference: the trajectories are flown, so the fan is a fingerprint of a cooking habit.
- **Restraint:** No pans, no hob detail; one wall.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Dec 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `013d272ecbbedb1a55b89f505719c4af3cfb04a5427a129c0019f72dccdeb704`

## References to check
Droplet ejection from frying oil (studies of oil splatter size/velocity); photos of real splashbacks after one week/one month (shoot own).

## Engine design
Cooking sessions drawn from household habit (favourite burner, dish); each session ejects droplets with log-normal diameters and 0.8-3.2 m/s speeds at random elevations from the pan rim; drops fly ballistically (small drag) to the wall plane, so spatter forms a parabolic fan whose height depends on the pan's distance from the wall; landed drops spread with darker rims, oxidise toward amber with age and hold dust; grout soaks oil; the last wipe (overlapping cloth arcs from an elbow pivot) removes older oil inside its strokes and leaves a faint smear.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 14-splashback <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 14-splashback 24 200 --res-check`.

## Traits
Tiles, Cooking, Since Wiped, Favourite Ring, Incident

## Self-critique
R1: believable at hero size, subtle at thumbnail. Weak: 'Wiped Yesterday' outputs are thin; sauce colour still a little pink; the tile grid is the dominant shape in sparse outputs; slow (~20 s headless at 1500 px, 2-3 s in Chrome).

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-03.png, heroes/hero-10.png, heroes/hero-11.png. Sample hashes: sha256("clyde-splashback-<i>").

## Risks
- Can read as a dirty-tile texture rather than a portrait of a household.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

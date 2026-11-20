# Mar - Measured  (`2027/13-measured/`)

The edge of a kitchen door frame where a family pencilled their children's heights on birthdays, initials and ages beside each line, some years missed, sometimes painted over or carefully painted around.

- **Thesis:** A door frame is the only place a family's growing up is drawn to scale.
- **1. In one sentence (no technique):** Pencil lines on a door frame where parents marked how tall their children were each birthday.
- **2. Generative rule:** Each child grows along the Preece-Baines (1978) model-1 curve with individual adult height and pubertal-spurt timing; a parent marks most birthdays (skips more often after age 10) with a slightly tilted line from the opening edge plus initials and age in one consistent hand (cursive-like strokes, Chaikin-smoothed); implements drift (pencil, biro, marker); a repaint either buries the older marks under a coat or leaves a yellowed unpainted patch around them.
- **3. Composition, material, motion:** Tall 1:2 crop of wall, moulded architrave and the dark doorway beyond; marks cluster in bands where siblings were the same height. Material: emulsion, gloss paint with brush streaks, graphite catching on the paint's tooth. Motion: none, years stacked by height.
- **4. Meaningful variation:** Number of children and spacing; who stopped being measured early; years skipped; repainting (over vs around = whether the family cared to keep it); a parent's own mark as reference.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Sentimental subject; the image risks being a diagram of heights unless the paint and hand feel lived-in.
- **Nearest prior art and difference:** Photos and pinterest-style 'growth chart' door frames; commercial printed growth-chart rulers. Difference: the heights come from a real growth model per child, so the spacing of lines is the shape of childhood.
- **Restraint:** One frame, pencil only most of the time, no names legible, no props.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Mar 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `658986bb3055de79c89d2755f94954c85ef668757acfdce3080a765bf604cd4d`

## References to check
Preece & Baines 1978 (Annals of Human Biology); CDC/WHO stature-for-age charts to sanity-check heights; photos of real kitchen door-frame growth marks (shoot own set).

## Engine design
Each child grows along the Preece-Baines (1978) model-1 curve with individual adult height and pubertal-spurt timing; a parent marks most birthdays (skips more often after age 10) with a slightly tilted line from the opening edge plus initials and age in one consistent hand (cursive-like strokes, Chaikin-smoothed); implements drift (pencil, biro, marker); a repaint either buries the older marks under a coat or leaves a yellowed unpainted patch around them.

Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js 13-measured <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py 13-measured 24 200 --res-check`.

## Traits
Children, First Mark, Last Mark, Grown, Lines, Paint, Also

## Self-critique
R1: reads as a growth chart at contact-sheet size after reframing to a tall crop. Weak: architrave moulding still looks CG-flat; the 'Painted Around' patch is too subtle to read; handwriting is plausible but repetitive; lots of plain wall.

## Outputs
Contact sheets: contact-sheet-r1.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/hero-03.png, heroes/hero-07.png, heroes/hero-11.png. Sample hashes: sha256("clyde-measured-<i>").

## Risks
- Sentimental subject; the image risks being a diagram of heights unless the paint and hand feel lived-in.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

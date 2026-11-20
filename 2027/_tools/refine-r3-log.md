# 2027 refinement round 3 log

Started 2026-11-19 afternoon (America/New_York). One project at a time: edit, render contact sheet + heroes, update briefs, then move on. Sweep already enforces a minimum visual-content check (`_tools/sweep.py`).

## Order
05-mown, 07-poolside, 17-evenings, 22-struck, 16-board, 20-hollowed, 23-pushed-back, 15-oche; then 02-tidelines, 03-unfaded, 06-dry-where-it-stood if time.

## 05-mown
- Before: Round 2, grade ? (brief called it weakest of the five). Contact-sheet-r2: synthetic even green, graphic stripes, tree as a perfect dark disc with a concentric mow halo, patio as a regular tile grid, border as a brown slab with blob plants, dew as a grey veil, several near-blank cells.
- After: Round 3, grade **promising**. Tree is a canopy from above; dew is a sheen plus a shoe trail (hero-01); dog rings and etiolated pool patch read; no near-blank cells in the 12-up; sweep 24/200, 0 fails. SHA-256 src/art.js: `2a1690e3921c789937c999c362d1c95da4f1d81f4eaf81c3642570005dbf7f81`.
- Heroes: `05-mown/heroes/hero-01.png`, `hero-08.png`, `hero-11.png`. Contact sheet: `05-mown/contact-sheet-r3.png`.
- Remaining: broccoli canopy, regular pavers, goalmouth still stain-like, border planting still a texture, grass is soft grain not blades.

## 07-poolside
- Before: Round 2, grade ?. Hockney palette (flat cyan water, cream grid deck, navy octagon umbrella), body print is a filled vector pictogram, footprints faint, coping as a graphic band.
- After: Round 3, grade **promising**. Body is contact patches; footprints dry in walking order; umbrella is a sand canopy with a soft shadow; late-sun cells leave the poster palette. Sweep 24/200, 0 fails. SHA-256 src/art.js: `b04b8e750a3ba5fefe125b838678fe609b18f7b2c6fd4f880c9fe9c07a4fca22`.
- Heroes: `07-poolside/heroes/hero-01.png`, `hero-09.png`, `hero-05.png`. Contact sheet: `07-poolside/contact-sheet-r3.png`.
- Remaining: water still a teal block with a tile grid; coping band; two-rail ladder; quiet 'Gone Inside / A While Ago' cells; CG lounger.

## 17-evenings
- Before: Round 1, grade promising. Wax is mottled camouflage, not layered drips; stub reads as a cork; faint horizontal striping; chianti/trattoria kitsch.
- After: Round 3, grade **promising**. Drips are rounded layered rivulets with beads (the deposit now has height, not one grid-row of mottling). Sweep 24/200, 0 fails. SHA-256 src/art.js: `7a9db75d03c24957bbd430214ec5f7672804fda93ed50d92f6f8322dcef52a14`.
- Heroes: `17-evenings/heroes/hero-01.png`, `hero-02.png`, `hero-05.png`. Contact sheet: `17-evenings/contact-sheet-r3.png`.
- Remaining: stub can still look like a cut plug; some body drips are too ribbon-smooth; faint neck banding; mixed-colour Years can be kitsch; slow Years renders.

## 22-struck
- Before: Round 1, grade promising. Streaks are blobby smudges, not individual strike scratches; grit is uniform noise.
- After: Round 3, grade **promising**. Strikes are thin broken scratches; lightly used boxes show individual strokes. Sweep 24/200, 0 fails. SHA-256 src/art.js: `6e3427e62b811cf603a684b144f99c8ecd58746987b3a56290a2a04eacc913c3`.
- Heroes: `22-struck/heroes/hero-02.png`, `hero-03.png`, `hero-06.png`. Contact sheet: `22-struck/contact-sheet-r3.png`.
- Remaining: heavy-use centres still clump; strip grain a bit 'knit'; a few square glints; plain printed band.

## 16-board
- Before: Round 1, grade weak. Cuts look like pencil hatching and vanish at thumbnail; grain looks like ruled paper; wood not convincing.
- After: Round 3, grade **promising** (was weak). Working zone reads at thumbnail; edge cuts show a groove and a lip; grain is warped. Sweep 24/200, 0 fails. SHA-256 src/art.js: `0cefca53db5dff20b5558446ad48ae8e2045b2b2afd498822e13580552b710e7`.
- Heroes: `16-board/heroes/hero-03.png`, `hero-04.png`, `hero-07.png`. Contact sheet: `16-board/contact-sheet-r3.png`.
- Remaining: dense centres still a grey scribble; maple still CG-smooth; V-cuts not fully convincing.

## 20-hollowed
- Before: Round 1, grade **weak**. Top-down flattened the dish; footprint kernels smeared; stone was noise.
- After: Round 3, grade **promising** (was weak). Oblique 2.5D z-buffer view; limestone/sandstone dishes read as hollows in the tread; risers are the same stone in shade; bedding is no longer concentric with the wear. A first 1600-px splat left a visible mesh (step 0.25 cm); sampling is now resolution-adaptive. Sweep 24/200, 0 fails. SHA-256 src/art.js: `37ef1ef6b81258870cd203756e46d6954e061d7c14bdea5eb33dff05cdc9d6cd`.
- Heroes: `20-hollowed/heroes/hero-02.png`, `hero-03.png`, `hero-08.png`. Contact sheet: `20-hollowed/contact-sheet-r3.png`.
- Remaining: slate stays almost flat stacked bars; composition is still three horizontal slabs; a thin crack often shows at the nosing; lichen can streak green; sandstone bedding can look a little like wood grain.

## 23-pushed-back
- Before: Round 1, grade **weak**. One soft grey line on a plain wall; chips as pale flecks; min-content only passed via wall undulation.
- After: Round 3, grade **promising** (was weak). Tighter crop around rail height; a darker, sharper grime/burnish band that reads as chair-backs; fewer, slightly larger chips; wall colours vary the set (duck egg, terracotta, magnolia). Sweep 24/200, 0 fails (median detail still low, 0.037). SHA-256 src/art.js: `5dd83a9935d9ae0b681feb765a995f453bffd1f2777021bec6e1905f14bb4583`.
- Heroes: `23-pushed-back/heroes/hero-02.png`, `hero-04.png`, `hero-08.png`. Contact sheet: `23-pushed-back/contact-sheet-r3.png`.
- Remaining: chips can look like pale flakes or little flowers sitting on the paint, not cratered plaster; many cells are still the same horizontal band; quieter walls are only just above the content floor.

## 15-oche
- Before: Round 1, grade **promising**. Official board graphic swamped the trace; sisal was noise; holes needed to be more convincing.
- After: Round 3, grade **promising**. Tighter crop (78–125 mm) on the worn bed; muted, aged red/green/cream; duller steel wires. Sweep 24/200, 0 fails. SHA-256 src/art.js: `e2e4f4132eb55780ff496cbd6d7b6f419ccd2fd5abf94a97c20c599a250ba94f`.
- Heroes: `15-oche/heroes/hero-01.png`, `hero-03.png`, `hero-05.png`. Contact sheet: `15-oche/contact-sheet-r3.png`.
- Remaining: many punctures still read as seed-shaped stamps rather than frayed sisal slits; the spider is still a graphic overlay; sisal is fine noise; League Night cells still cluster on the same bed.

## 02–12 grades (looked at existing contact sheets; 02, 03, 06 not re-rendered this pass)
- 02 Tidelines (R2): **promising**. Rings read as stains; paper variety works. Some rings still a bit perfectly circular; a few single-visit cells are very quiet.
- 03 Unfaded (R2): **promising**. Sun patches and furniture ghosts read in the best cells. Boards can look CG; carpet and some no-sun cells are weak. Motif stays distinct from Dry Where It Stood (interior sun-fade vs wet tarmac parking ghosts).
- 04 Twenty Nanometres: **existing** (revised separately; no 2027 sample set in this folder).
- 05 Mown: **promising** (refined this round; see above).
- 06 Dry Where It Stood (R2): **promising**. Strongest of the original 02–12 sample sets; parking ghosts and night lamps read. Some drying cells go quiet; bay lines can be graphic.
- 07 Poolside: **promising** (refined this round; see above).
- 08 Creases (R1): **promising**. Folds read as letters on a desk, but relief is soft and the set is repetitive; type is a grey wash.
- 09 Wrack Line (R1): **weak**. Almost every cell is the same three bands with a sparkle foam line — a geology diagram.
- 10 Persistence (R1): **weak**. Several near-blank skies; odd black geometry on 'Roof Edge' cells; some trails look like scratches or wires.
- 11 Fore-edge (R1): **weak**. Stacked book edges against empty wall; grime/spill too subtle; compositions repeat.
- 12 Fogged (R1): **promising**. Atmospheric; wipes and peepholes read. Heavy speckle; some Streaming cells become a forest of trails.

## Not reached
- No new renders for 02-tidelines, 03-unfaded, or 06-dry-where-it-stood (time). They were graded from existing R2 sheets only.
- Delivery tooling (seed-embedded buyer files, SHA-256 build records beyond src hashes) still outstanding.

## Zip
`/workspace/clyde/review/clyde-2027-r3-previews.zip` — READMEs, contact sheets, heroes, and PLAN.md only.

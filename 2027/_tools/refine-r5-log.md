# 2027 refinement round 5 log

Started 2026-11-19 afternoon (America/New_York). One project at a time: edit, render contact sheet + heroes, update briefs, then move on. Hollowed, Pushed Back and Oche are parked unless a quick win appears.

## Order
11-fore-edge, 10-persistence, 09-wrack-line (all weak); then 06-dry-where-it-stood, 02-tidelines, 03-unfaded.

## 11-fore-edge
- Before: Round 1, grade **weak**. Stacked book edges against empty wall; grime/spill too subtle; compositions repeat.
- After: Round 5, grade **promising**. SHA-256 `cb483137dd7c08fcfc69a47cf4721032755963791998ca2b2a7f16c9ecba036f`. Heroes: hero-01.png, hero-04.png, hero-05.png. Contact: contact-sheet-r5.png. Sweep 24/24, 0 fails, median 0.513.
- Changes: tight crop so the stack fills the frame (wall sliver + counter band, books roughly aligned with small stagger); stronger dirty use bands at the grip; fall-open gaps and signature openings; spills as a soft stain plus cockled openings, not a dashed/woven stroke; raking light and contact shadows on the wall; band-limited page structure (per-leaf grating only when a leaf is resolvable, to kill diagonal moiré).
- Remaining: dictionary dirt can bloom into a soft grey cloud; thumb-index tabs still read a bit as soft ovals; quiet cells and cloth boards are a little flat; compositions are still horizontal stacks (inherent, improved by crop and stagger).
- Backup: /tmp/fore-edge-main-r1.js

## 10-persistence
- Before: Round 1, grade **weak**. Several near-blank skies; odd black geometry on 'Roof Edge' cells; some trails look like scratches or wires.
- After: Round 5, grade **promising**. SHA-256 `24a8c89fba5a2460b8773d61c83f7438ffd108870d6662af8c5bf87fc910fa27`. Heroes: hero-01.png, hero-05.png, hero-11.png. Contact: contact-sheet-r5.png. Sweep 24/24, 6 fails, median 0.081.
- Changes: trail age is behind/v only, with the aircraft placed so the frame is behind it (kills hard-cut fat trail ends); dry air keeps a readable short stub in frame; Crow is a gentle puff-chain and a capped meander, with softer ice texture (no comb/zigzag); roof is a painted soffit plus a gutter lip, not a black wedge; slightly fewer empty Open Sky / Dry rolls; dusk trails stay warm-lit.
- Sweep fails are quiet open-sky (or one wires) cells with a soft large-scale trail that dips under the 0.02 floor; the marks are visible, not gamed with fake sky texture.
- Remaining: some trails still a little snaky; soffit can read as a flat panel; dry stubs can look like clean chalk marks.
- Backup: /tmp/persistence-main-r1.js

## 09-wrack-line
- Before: Round 1, grade **weak**. Almost every cell is the same three bands with a sparkle foam line — a geology diagram.
- After: Round 5, grade **promising**. SHA-256 `f13c2658600ff85c3adbc17de17456136a8a1d482abcc963afcd32731c90be6d`. Heroes: hero-02.png, hero-07.png, hero-10.png. Contact: contact-sheet-r5.png. Sweep 24/24, 0 fails, median 0.113.
- Changes: crop modes (Close Marks / Water to Wrack / Foreshore) so the frame is not always a textbook sea-damp-dry stack; stronger, nearest-Y-interpolated swash marks (kills column zipper); quieter, sea-state-scaled foam; clumped wrack; slightly broken wind ripples; more shoreline obliquity. Engine (run-up, overtopping stack) unchanged.
- Remaining: ripples still a bit regular; some water edges muddy; foam can flake; walker prints and objects can be graphic or easy to miss; mark-heavy Low Water seeds are slow to render.
- Backup: /tmp/wrack-line-main-r1.js

## 06-dry-where-it-stood
- Before: Round 2, grade **promising**. Parking ghosts and night lamps read; some drying cells go quiet; bay lines can be graphic.
- After: Round 5, grade **promising**. SHA-256 `ac9d74b801ddf27222cbf038096d973919fcf61d7466852650fd6afe8ecb11c4`. Heroes: hero-01.png, hero-03.png, hero-04.png. Contact: contact-sheet-r5.png. Sweep 24/24, 0 fails, median 0.083.
- Changes: residual ghost memory so a pale sheltered rectangle remains after the water film evaporates (Drying cells now read); slightly slower evap; tighter lamp glints and slightly less flood; more worn bay paint. Kept distinct from Unfaded (wet-tarmac parking ghosts, not interior sun-fade).
- Remaining: some quiet overcast cells; lines can still dominate; night wet mottling can look cloudy.
- Backup: /tmp/dry-where-it-stood-main-r2.js

## 02-tidelines
- Before: Round 2, grade **promising**. Rings read as stains; paper variety works; some rings still a bit perfectly circular; a few single-visit cells are very quiet.
- After: Round 5, grade **promising**. SHA-256 `9ddb59825886070bc18381b9791ed2b15a148d0e34e283d13d0f40364590a8cc`. Heroes: hero-04.png, hero-05.png, hero-11.png. Contact: contact-sheet-r5.png. Sweep 24/24, 0 fails, median 0.037.
- Changes: slight ellipse and stronger edge wobble so rings are less perfectly circular; tighter crop around the placed rings (especially Once) so a single visit isn't a tiny stamp; Once visits a bit more often leave an incomplete arc and a slightly wetter print. Engine (wicking, coffee-ring deposit, re-wetting) unchanged.
- Remaining: some rings still fairly round; water stains stay faint (honest); napkin feathering still modest.
- Backup: /tmp/tidelines-main-r2.js

## 03-unfaded
- Before: Round 2, grade **promising**. Sun patches and furniture ghosts read in the best cells; boards can look CG; carpet and some no-sun cells are weak.
- After: Round 5, grade **promising**. SHA-256 `6cc7a62686f5ad08da7850cc7f988c1e3c2797352e56ee027186a6d76e70abf7`. Heroes: hero-01.png, hero-06.png, hero-10.png. Contact: contact-sheet-r5.png. Sweep 24/24, 0 fails, median 0.138.
- Changes: more plank-to-plank colour variation and a slight gap wobble; if today's chosen hour would miss the window, search a nearby hour so a sun patch is usually present (except Overcast); carpet dye contrast and coarser pile/wear. Kept distinct from Dry Where It Stood (interior sun-fade, not wet-tarmac parking ghosts).
- Remaining: boards can still look a bit CG (straight-ish gaps); carpet cells are still the weak ones — ghosts and sun stay soft.
- Backup: /tmp/unfaded-main-r2.js


## Zip
`/workspace/clyde/review/clyde-2027-r5-previews.zip` — PLAN.md, READMEs, contact sheets and heroes as max-1600 JPEG q85.

Parked (not touched this round): 20-hollowed, 23-pushed-back, 15-oche, per the R4 review.

Nothing graded **strong**. The three former-weak series (Fore-edge, Persistence, Wrack Line) are now **promising**, as are the three refined R2 series (Dry Where It Stood, Tidelines, Unfaded).

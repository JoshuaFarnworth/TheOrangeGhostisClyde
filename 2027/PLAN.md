# Clyde - 2027 studio plan (25 series)

Twenty-four series, two per month (plus project 25, Sediments, injected by Joshua; see its brief), each about a trace an ordinary life leaves on an ordinary material -- a cup's rings, a sun-faded floor, a door frame's pencil lines, a lift button rubbed smooth -- with a real physical or behavioural process making the image. Months are **studio targets, not public launch commitments**. Nothing has been published, minted, posted or promoted. Edition sizes, prices and venues are **open/TBD** throughout (the old market.md suggestions are superseded and market-wide medians are not used).

Grades are honest self-assessments of the current prototypes: **strong** = near the Before the Shovels bar; **promising** = the idea reads, the rendering needs another round; **weak** = not yet convincing.

## Schedule

| Month | Series | Folder | One line | Status | Grade |
|---|---|---|---|---|---|
| Jan | Before the Shovels | /workspace/clyde/v2/before-the-shovels | A snowfall records the morning's comings and goings until the shovels erase it. | Existing - developed (v2). Not modified for 2027 plan. | existing |
| Jan | Struck | 2027/22-struck | A matchbox counts its own matches, and remembers the hand that struck them. | Round 3 | promising |
| Feb | Tidelines | 2027/02-tidelines | The rings a cup leaves are a diary of how long someone sat. | Round 5 | promising |
| Feb | Evenings | 2027/17-evenings | A candle bottle is a tally of dinners. | Round 3 | promising |
| Mar | Unfaded | 2027/03-unfaded | Sunlight keeps a record of where we put our things. | Round 5 | promising |
| Mar | Measured | 2027/13-measured | A door frame is the only place a family's growing up is drawn to scale. | Round 1 | promising |
| Apr | Twenty Nanometres | /workspace/clyde/series/twenty-nanometres (not touched) | (See the separate revision.) | Existing - being revised separately; folder not touched. | existing |
| Apr | Smudge | 2027/18-smudge | A dark screen is a private diary written in skin oil. | Round 1 | promising |
| May | Mown | 2027/05-mown | A lawn is a record of a weekend chore and of the family that uses it. | Round 3 | promising |
| May | Board | 2027/16-board | A chopping board remembers where your hand goes. | Round 3 | promising |
| Jun | Dry Where It Stood | 2027/06-dry-where-it-stood | Rain marks who stayed and who has gone. | Round 5 | promising |
| Jun | Hollowed | 2027/20-hollowed | Stone keeps the average of everyone who climbed it. | Round 4 | promising |
| Jun | Sediments | 2027/25-sediments | Every mint is a day in one place's deep history, and every later mint buries it. | Round 1 (engine v1.1; world option pending Joshua) | promising |
| Jul | Poolside | 2027/07-poolside | Heat erases a person in minutes. | Round 4 | promising |
| Jul | Scoured | 2027/21-scoured | The light finds the years of washing up. | Round 1 | promising |
| Aug | Creases | 2027/08-creases | How a letter is folded shows how often it was read. | Round 1 | promising |
| Aug | Ground Floor | 2027/19-ground-floor | A lift panel counts the building's comings and goings. | Round 1 | promising |
| Sep | Wrack Line | 2027/09-wrack-line | The sea writes the last few hours on the sand. | Round 5 | promising |
| Sep | Oche | 2027/15-oche | The holes in a dartboard are a census of the people who throw at it. | Round 4 | promising |
| Oct | Persistence | 2027/10-persistence | Strangers' journeys linger overhead only if the air is right. | Round 5 | promising |
| Oct | Pushed Back | 2027/23-pushed-back | The wall behind the table keeps the minutes of every meal, one line per seat. | Round 4 | promising |
| Nov | Fore-edge | 2027/11-fore-edge | The edge of a book shows which pages we needed. | Round 5 | promising |
| Nov | Above the Radiator | 2027/24-above-the-radiator | Warm air draws the hidden skeleton of a wall in dust. | Round 1 | promising |
| Dec | Fogged | 2027/12-fogged | A wiped window is the trace of someone who wanted to see out. | Round 1 | promising |
| Dec | Splashback | 2027/14-splashback | The wall behind the cooker keeps a record of which ring a household reaches for. | Round 1 | promising |

## Variety and motif map
- Viewpoints: top-down floors/ground (Unfaded, Mown, Dry, Poolside, Wrack Line, Hollowed), close-ups of objects (Tidelines, Creases, Fore-edge, Board, Smudge, Scoured, Oche), walls front-on (Measured, Splashback, Ground Floor, Pushed Back, Above the Radiator), side-on (Evenings), looking up (Persistence), through glass (Fogged).
- Traces by mechanism, each used once: liquid deposit (Tidelines), light dose (Unfaded), plant growth (Mown), rain shadow (Dry), evaporation (Poolside), folding (Creases), tide (Wrack Line), condensation in air (Persistence) and on glass (Fogged), grime (Fore-edge), graphite (Measured), ballistic oil (Splashback), puncture (Oche), cutting (Board), solidified flow (Evenings), skin oil (Smudge), polishing (Ground Floor), abrasion of stone (Hollowed), scratch glint (Scoured), friction ignition (Struck), rubbing (Pushed Back), convective dust (Above the Radiator).
- The 'ghost where something was' motif: Unfaded and Dry Where It Stood were both reading as pale/dark furniture-shaped ghosts. They are now differentiated (see their briefs): Unfaded is about light dose and rearrangement over years; Dry is about the order of departures in minutes.
- Footprints are kept to Before the Shovels (and Poolside's wet feet); no new series uses them.

## Default collector deliverable
Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.

## Briefs

### Jan - Before the Shovels

Footprints, tyre ruts and sled lines in fresh snow, read from above before anyone clears it.

Status: Existing - developed (v2). Not modified for 2027 plan.

See: /workspace/clyde/v2/before-the-shovels, /workspace/clyde/series/before-the-shovels

### Jan - Struck  (`2027/22-struck/`)

The striking strip on the side of a box of matches, close up: grey-black scrapes where each match was dragged, dense in the middle where the thumb holds the box, thinning out to the ends.

- **Thesis:** A matchbox counts its own matches, and remembers the hand that struck them.
- **1. In one sentence (no technique):** The dark scrape marks on the side of a matchbox, one for every match that was lit.
- **2. Generative rule:** A box gets a number of strikes (a few, half, nearly empty) and an owner (one smoker, the hob, birthday candles, everyone). Each strike is a stroke along the strip: position drawn around where a thumb grips the box, angle from that person's wrist, one direction for one person or both for a household. The head deposits grey-black residue that is densest where it bites and breaks up as it lifts (lit), or stalls in a short dense stub (failed; more often if the box got damp). Repeated strikes abrade the red phosphorus-glass layer toward the binder in the middle.
- **3. Composition, material, motion:** Macro crop, about 56 x 28 mm: the printed card side of the box with a coloured band at top and bottom and the red-brown granular strip across it, slightly tilted. Material: glass grit with tiny glints, kraft card, carbon residue with anisotropic streaks. Motion: none, strokes stacked.
- **4. Meaningful variation:** Count of strikes; one-way vs both-ways (one person vs a household); grip position and wrist angle; damp boxes leave stubby failed strikes; strip and print colours.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Small, slight object; risks being a texture study unless the stroke statistics really carry the person.
- **Nearest prior art and difference:** Phillumeny (matchbox-label collecting) and photos of used strikers; Sol LeWitt-style line accumulations. Difference: the marks are the side-effect of use, positioned by a hand model rather than composed.
- **Restraint:** No brand, no text, no matches, no flame. One strip.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jan 2027 (a studio target, not a public launch commitment)
- **Status:** Round 3 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `6e3427e62b811cf603a684b144f99c8ecd58746987b3a56290a2a04eacc913c3`

### Feb - Tidelines  (`2027/02-tidelines/`)

A single sheet of paper - a napkin, graph pad, kraft bag, sketchbook - carrying the rings left by a cup set down and picked up a few times. The rings are the record of a conversation's pauses.

- **Thesis:** The rings a cup leaves are a diary of how long someone sat.
- **1. In one sentence (no technique):** The faint brown rings a drink leaves on paper each time it is put down, which together show how long someone stayed.
- **2. Generative rule:** Each visit, liquid wets a ring under the vessel's foot; wetting spreads through the paper by capillary wicking with fibre-scale permeability and tilt; while it dries, solute is carried outward to the evaporating edge and deposited (the coffee-ring effect); stain darkness follows Beer-Lambert absorbance of the deposited solute. Visits overlap and later rings partly redissolve earlier ones.
- **3. Composition, material, motion:** Top-down sheet, mostly empty paper; rings sit off-centre where a hand would rest. Material: paper grain and fibre, translucent tea/coffee/wine deposits. Motion: none - the time is in the overlapping rings.
- **4. Meaningful variation:** Number of visits (once vs many = brief vs long stay); vessel (mug, wine glass stem, tumbler); incidents (slid, drip, spoon set down) imply small events; liquid changes the deposit physics, not just colour; paper changes how far it wicks.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Coffee rings are a familiar visual cliche; it must read as time and company, not a stain texture pack.
- **Nearest prior art and difference:** Coffee-ring physics (Deegan et al. 1997) and stain photography / 'coffee ring' art; generic coffee-stain brushes. Difference: the rings are simulated from wicking and evaporation per visit, and the series is about duration of stay, not decoration.
- **Restraint:** One sheet, one vessel, at most a handful of visits; no text, no props in frame.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Feb 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `9ddb59825886070bc18381b9791ed2b15a148d0e34e283d13d0f40364590a8cc`

### Feb - Evenings  (`2027/17-evenings/`)

The neck and shoulder of an empty wine bottle that has held a candle for a long time, coated in layered runs of wax in the colours of whatever candles were in the drawer, the last candle burnt down.

- **Thesis:** A candle bottle is a tally of dinners.
- **1. In one sentence (no technique):** Layers of old candle wax that have run down a wine bottle over many evenings.
- **2. Generative rule:** Each evening burns a candle colour from the household's drawer; overflow drips (more on the draught side) of Pareto-distributed volume run down the real bottle profile on an unwrapped angle-height grid, steered into channels toward thinner wax, spreading and slowing on the shoulder, freezing when their heat is spent (run length ~ sqrt(volume)), ending in a bead; later drips coat earlier ones; rendered as translucent wax over dark glass, lit by one lamp.
- **3. Composition, material, motion:** Portrait crop of neck and shoulder against a dim room. Material: paraffin, green/amber glass. Motion: frozen runs.
- **4. Meaningful variation:** Palette habit (always white, Christmas red, whatever was in the drawer, two colours), how many evenings, draught strength, place.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Kitsch. It must feel like one household's winters, not a trattoria prop.
- **Nearest prior art and difference:** Chianti-bottle candle holders (a restaurant cliché in real life); wax-drip photography. Difference: the accumulation is simulated drip by drip so the coat is a count.
- **Restraint:** No flame, one bottle, the rest dark.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Feb 2027 (a studio target, not a public launch commitment)
- **Status:** Round 3 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `7a9db75d03c24957bbd430214ec5f7672804fda93ed50d92f6f8322dcef52a14`

### Mar - Unfaded  (`2027/03-unfaded/`)

An empty room's floor, bleached by years of sun through one window, with darker unfaded shapes where furniture stood. The occupants have moved out; the floor remembers the layout.

- **Thesis:** Sunlight keeps a record of where we put our things.
- **1. In one sentence (no technique):** The darker patches left on a sun-faded floor where furniture used to be, after someone has moved out.
- **2. Generative rule:** Integrate solar exposure over the years lived in: sun position from latitude/declination/hour angle, the window aperture and reveal projected onto the floor, furniture blocking light as shadow hulls, plus a diffuse sky term; accumulated dose drives a photochemical fade of the wood/carpet. Today's sun patch is drawn on top.
- **3. Composition, material, motion:** Top-down floor plan of a room, window wall at one edge; the ghosts are quiet rectangles; one warm sun patch. Material: boards, carpet, lino with grain and gaps. Motion: none - years compressed into dose.
- **4. Meaningful variation:** Years lived in (depth of ghost), facing direction (where sun lands), furniture layout and whether it was ever rearranged (double ghosts = a life change), today's time of day.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Shares the 'ghost of what was there' idea with Dry Where It Stood; floor texture realism is the ceiling on quality.
- **Nearest prior art and difference:** Photography of furniture ghosts on faded floors/walls after moves; sun-path diagrams. Difference: the fade is computed from a real sun path and an imagined household, so the layout is a reconstructed life.
- **Restraint:** Empty room, no objects, one window, muted wood palette.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Mar 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `6cc7a62686f5ad08da7850cc7f988c1e3c2797352e56ee027186a6d76e70abf7`

### Mar - Measured  (`2027/13-measured/`)

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

### Apr - Twenty Nanometres

(Brief held by the separate revision; not edited here.)

Status: Existing - being revised separately; folder not touched.

See: /workspace/clyde/series/twenty-nanometres (not touched)

### Apr - Smudge  (`2027/18-smudge/`)

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

### May - Mown  (`2027/05-mown/`)

A suburban lawn seen from above on the day it was mowed: the stripes of the mower's passes, the places it went around, and the small traces of a household - a missed strip, a goalmouth worn bare, where the paddling pool stood.

- **Thesis:** A lawn is a record of a weekend chore and of the family that uses it.
- **1. In one sentence (no technique):** A lawn from above, showing the lines someone mowed and the worn or yellowed spots their family left.
- **2. Generative rule:** A mowing plan (stripes, spiral, wandering) sets a blade lean field; stripes come from light reflecting off blades leaning toward or away from the viewer; things that stood on the grass cause etiolation (yellowing), dogs leave urine-scorch rings, and footfall flattens paths.
- **3. Composition, material, motion:** Top-down lawn, border or patio edge, one obstacle (tree, bed). Material: grass blades and soil. Motion: implied by mower direction only.
- **4. Meaningful variation:** Mowing pattern (care vs haste), time since mown, and the trace (pool, dog, lounger, goalmouth) which implies who lives there.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Could still read as a synthetic grass texture at a glance, especially the border and the tree crown.
- **Nearest prior art and difference:** Drone photography of lawn stripes, groundskeeping patterns. Difference: the stripes are a side character; the household traces are the subject.
- **Restraint:** One lawn, one obstacle, one trace.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** May 2027 (a studio target, not a public launch commitment)
- **Status:** Round 3 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `2a1690e3921c789937c999c362d1c95da4f1d81f4eaf81c3642570005dbf7f81`

### May - Board  (`2027/16-board/`)

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

### Jun - Dry Where It Stood  (`2027/06-dry-where-it-stood/`)

A wet car park after rain, with pale dry rectangles where cars were parked through the shower and have just left. At night, a sodium lamp catches the wet asphalt.

- **Thesis:** Rain marks who stayed and who has gone.
- **1. In one sentence (no technique):** The dry shapes cars leave on wet tarmac when they drive away after the rain.
- **2. Generative rule:** Rain falls at a slant; each parked car casts a rain shadow swept along the slant; when a car leaves, its dry footprint begins to wet and dry at a mottled rate; depressions pool into puddles; wet surfaces reflect sky/lamps by Fresnel (~2% at normal incidence) with mirror points for lamps; oil drips mark engine ends.
- **3. Composition, material, motion:** Top-down bays with painted lines and wheel stops; 1-4 ghosts; lots of dark asphalt. Material: aggregate, paint, water film, oil. Motion: minutes since departure encoded in ghost sharpness.
- **4. Meaningful variation:** Time since the rain stopped and since each car left (sharp vs fading ghosts), how many left, layout, a car that left during the rain (half-wet ghost), lamp vs day.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** The image of a dry car outline is familiar from photos; the series has to earn itself through multi-car timelines.
- **Nearest prior art and difference:** Photographs of dry car silhouettes on wet roads (a common phone-photo subject). Difference: a simulated, readable timeline of departures in one lot.
- **Restraint:** Mostly empty asphalt; no cars present; palette of greys and one lamp colour.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jun 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `ac9d74b801ddf27222cbf038096d973919fcf61d7466852650fd6afe8ecb11c4`

### Jun - Hollowed  (`2027/20-hollowed/`)

Old stone steps from above, each tread dished by centuries of feet, deepest toward the handrail side and just behind the rounded nosing; lichen in the corners where nobody steps.

- **Thesis:** Stone keeps the average of everyone who climbed it.
- **1. In one sentence (no technique):** Stone steps worn into shallow dips by centuries of people walking up and down.
- **2. Generative rule:** Footfalls sampled over decades to centuries: keep-to-the-rail or two-lane flows; climbing places the ball of the foot 6-12 cm behind the nosing, descending lands the heel further back and rolls the toe over the edge; wear is Archard-like (load x slip) through an elongated footprint kernel; dirt and lichen where wear is lowest; low raking light.
- **3. Composition, material, motion:** Three treads seen from downhill and slightly to one side, so both the lit treads and the shadowed risers show. Material: sandstone, limestone, granite, slate. Motion: none.
- **4. Meaningful variation:** Handrail side, traffic direction, stone hardness, centuries.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** If the camera is too high the dishes flatten into bars again; too low and the treads vanish.
- **Nearest prior art and difference:** Photographs of worn steps (Wells Cathedral chapter-house stairs are the famous example). Difference: wear simulated from footfall behaviour.
- **Restraint:** No people, no architecture beyond the steps.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jun 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `48265191886037c3f6c09d27746763b9131b43059fbf88c8d2f168c238ca1065`

### Jun - Sediments  (`2027/25-sediments/`)

Project 25, injected by Joshua. A trench face cut into one floodplain beside a salt spring. Every mint lays down its own layer, and its transaction hash decides what was happening on the surface at that moment of the world's history: a mammoth mired at the lick, a flood, a grass fire, a hearth, a fence line. Later tokens show the same things buried under everything that came after: rotting, collapsing, staining the mud, turning to bone and (on a stated, compressed clock) to fossil. Fast minting packs similar beds together; long silences leave thick blank layers and buried soils.

- **Thesis:** Every mint is a day in one place's deep history, and every later mint buries it.
- **1. In one sentence (no technique):** A cross-section of the ground under a salt lick, showing what each day left behind and what became of it.
- **2. Generative rule:** Token N is computed from the whole mint history 1..N: each mint's hash picks its surface event (era-constrained, honest trait) and the deposit it leaves; the real gap before each mint advances world time via p = 0.05 + 0.7 ln(1 + gap/8h) through a data-driven era table (Option A: 28,000 BCE to the present and beyond); background thickness = r * dYears^0.6 (Sadler); decay follows Payne stages slowed by burial, cold and waterlogging, then Behrensmeyer bone weathering, cadaver-decomposition stains, Athy compaction, water-table gley and rust; unsupported remains collapse onto the burial surface of the day. Fossilisation runs on an explicit compressed clock, flagged as a trait.
- **3. Composition, material, motion:** Landscape 5:4 trench face, 6 m wide window into a 14 m site, surface and sky at the top. Late tokens zoom out to show depth. Material: silts, sands, loess, gravel, soils, bone, ivory, charcoal, wood. Motion: none.
- **4. Meaningful variation:** Real timing of the mint run (bursts vs dormancy), each mint's hash (event, species, position), the era reached, the window offset, the history source.
- **5. Collector deliverable:** Token N's HTML with the history 1..N frozen inside it (built by tools/dist.js) plus a contract view that re-emits the same packed history; 1600 px PNG; the literal tx hashes of 1..N in metadata.
- **6. Buyer / channel:** Needs a custom contract (L2 ERC-721 or Tezos FA2) storing a per-mint {seed, timestamp}; Aleatory, Highlight and Verse cannot supply earlier mints. Art Blocks Engine Flex PostParams hook is the platform alternative. Low price, thousands of editions (Joshua).
- **7. Unresolved artistic risk:** Animal rendering may never reach photographic restraint; the full-history requirement rules out Aleatory/Highlight/Verse and needs a custom contract (or an Art Blocks Flex hook); the Native archaeology eras need an ethics review.
- **Nearest prior art and difference:** Stratigraphic and archaeological section drawings, Big Bone Lick and La Brea-type mire finds, Before the Shovels (its own trace-not-people stance). Difference: the section is built by the collectors' actual mint history, so the collection's timing is the geology.
- **Restraint:** No living people, only traces; one surface event per mint; deaths capped per world-year; no sacred objects or named cultures; muted earth palette.
- **Edition / price:** Thousands of editions at a very low price (Joshua); exact numbers TBD.
- **Platform: custom contract recommended (see README platform section); nothing deployed, minted or published**
- **Studio target:** Jun 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 (engine v1.1; world option pending Joshua) -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `d265b92621f4762cf16a247b220535f0f3ce54b03edc912bfa36da50893eb9a6`

### Jul - Poolside  (`2027/07-poolside/`)

A pool deck in hot sun minutes after someone got out: the wet print of a body on the warm stone, footprints to the edge, and the light on the water.

- **Thesis:** Heat erases a person in minutes.
- **1. In one sentence (no technique):** The wet outline someone leaves on a hot pool deck, drying while you look.
- **2. Generative rule:** Wet marks (body, feet, drips) evaporate on a per-material clock driven by sun and stone heat; caustics on the pool floor from forward photon splatting through a wavy surface with water-column absorption.
- **3. Composition, material, motion:** Top-down deck with a strip of pool at top or bottom; lounger or umbrella off to one side. Material: travertine/concrete/tile, water. Motion: minutes since the person got up.
- **4. Meaningful variation:** Story (swam, lay on deck, sat on edge), minutes since, sun, shade.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Hockney and backyard-pool photography still sit close; the water has to keep moving away from poster cyan.
- **Nearest prior art and difference:** Hockney pool paintings; caustic shaders. Difference: the subject is the evaporating person, not the water.
- **Restraint:** One person's traces, no figures.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Jul 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `bdc88a33f20134c52cd1b4d174fa92bf8b0c10a6298737abefbca80402ba50d7`

### Jul - Scoured  (`2027/21-scoured/`)

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

### Aug - Creases  (`2027/08-creases/`)

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

### Aug - Ground Floor  (`2027/19-ground-floor/`)

The brushed-steel button panel of a lift: the ground-floor button polished smooth with its number half rubbed out, the close-door button worn by impatience, a floor nobody visits still looking new.

- **Thesis:** A lift panel counts the building's comings and goings.
- **1. In one sentence (no technique):** Lift buttons worn by years of fingers, most on the floors people actually go to.
- **2. Generative rule:** A building (flats, offices, hotel, car park) with floors and occupancy; trips simulated over years (everyone returns to G, residents ride to their own floors in proportion to occupancy, vacant floors almost never, close-door pressed by the impatient); wear = 1 - exp(-presses); wear removes engraving infill from the contact centre outward, polishes the brushed grain toward a mirror, and leaves an oil ring.
- **3. Composition, material, motion:** Front-on panel, one or two columns of buttons, open/close and alarm below. Material: brushed stainless, black infill, braille. Motion: none.
- **4. Meaningful variation:** Building type, number of floors, a vacant floor, the canteen or pool floor, years in service.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** An object portrait more than a trace; it may feel like product rendering.
- **Nearest prior art and difference:** Photos of worn lift buttons (a known internet curiosity). Difference: wear computed from a building's simulated traffic.
- **Restraint:** No signage, no LEDs.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Aug 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `c15ee1f559482527dcd2d35ff51fefd556edc6b6bd0b47dc10ca01c107d57725`

### Sep - Wrack Line  (`2027/09-wrack-line/`)

The upper beach after the tide has turned: lines of weed and foam left by successive waves, the highest one from hours ago.

- **Thesis:** The sea writes the last few hours on the sand.
- **1. In one sentence (no technique):** The lines of seaweed and foam each wave leaves on a beach as the tide goes out.
- **2. Generative rule:** Swash run-up from Rayleigh-distributed wave heights on a tide curve; each run-up leaves a mark; beach cusps; later marks overwrite earlier ones.
- **3. Composition, material, motion:** Top-down sand band with sea at one edge. Material: wet/dry sand, weed, foam. Motion: tide direction.
- **4. Meaningful variation:** Tide state, sea state, what was left behind, light, how many marks survived.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Could look like a diagram rather than a beach.
- **Nearest prior art and difference:** Aerial beach photography. Difference: the marks are a readable tide record.
- **Restraint:** Sand and a few lines.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Sep 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `f13c2658600ff85c3adbc17de17456136a8a1d482abcc963afcd32731c90be6d`

### Sep - Oche  (`2027/15-oche/`)

A close crop of a pub dartboard with the darts put away: the bed of treble twenty chewed pale by thousands of throws, fresh slit holes around it, the wire spider casting small shadows.

- **Thesis:** The holes in a dartboard are a census of the people who throw at it.
- **1. In one sentence (no technique):** A worn dartboard, close up, showing where people's darts have landed over the years.
- **2. Generative rule:** Regulation board geometry and number order; players drawn with a skill (2-D Gaussian spread 8-50 mm, after Tibshirani, Price & Taylor 2011) and a habit (good players on T20, fall back to T19, finish on D16/D20; beginners aim at the bull); recent throws leave slit holes, older ones are closed by the sisal and only show as frayed paler fibre; a board that has been turned carries an old wear patch under a different number; the camera frames where the recent holes are.
- **3. Composition, material, motion:** Tight crop on the worn bed; segments, wire and numerals as context. Material: sisal end grain, painted segments, galvanised wire. Motion: none.
- **4. Meaningful variation:** Who throws (alone, a pair, league night, beginners), board age, turned or not, skill -> where the wear sits and how tight it is.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** A dartboard is a strong ready-made graphic; the trace can be swamped by the object.
- **Nearest prior art and difference:** Stock dartboard photography; heat-map visualisations of dart throws. Difference: throws simulated from skill and strategy and shown as physical damage, not a chart.
- **Restraint:** No darts, no chalkboard, crop away the icon.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Sep 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `de92ad3e271063027cc82ce9268fb815b5473d6d64fa5dbff2658c0acd74a9ac`

### Oct - Persistence  (`2027/10-persistence/`)

A patch of sky over a roofline or wires, with one or a few contrails slowly spreading - the year's one series looking up instead of down.

- **Thesis:** Strangers' journeys linger overhead only if the air is right.
- **1. In one sentence (no technique):** The trails planes leave in the sky, which stay or vanish depending on the air.
- **2. Generative rule:** Contrail persistence from ice supersaturation; width grows with sqrt(age) plus wind shear; Crow instability breaks old trails into puffs; gnomonic sky projection.
- **3. Composition, material, motion:** Sky gradient, foreground edge (roof, wires). Material: air, ice. Motion: age of trails.
- **4. Meaningful variation:** Air humidity (gone vs spreading), traffic, hour.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Can look like a sky gradient with a line - may be too thin a picture.
- **Nearest prior art and difference:** Contrail photography. Difference: the number and age of trails show the traffic of a morning.
- **Restraint:** Mostly empty sky.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Oct 2027 (a studio target, not a public launch commitment)
- **Status:** Round 5 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `24a8c89fba5a2460b8773d61c83f7438ffd108870d6662af8c5bf87fc910fa27`

### Oct - Pushed Back  (`2027/23-pushed-back/`)

The wall behind a dining table: a row of grey scuff lines at chair-back height, one per seat, where every chair went back against the paint when someone stood up.

- **Thesis:** The wall behind the table keeps the minutes of every meal, one line per seat.
- **1. In one sentence (no technique):** Grey scuff marks on the wall behind a dining table where the chairs bump it every time someone gets up.
- **2. Generative rule:** Each seat has a chair (back height, rail width) and a sitter whose share of meals is Pareto-distributed. Every stand-up pushes the chair back so its top rail meets the wall at a jittered height and offset; contact transfers grime (1 - exp(-dose)), concentrated at the rail's proud corners, and burnishes the matt emulsion; rare hard knocks chip the paint at a corner, exposing the previous colour or plaster. A sitter who tips back drags the rail higher. A repainted patch hides older marks and the record starts again on top.
- **3. Composition, material, motion:** Front-on wall, about 90 x 45 cm centred just below chair-back height; emulsion with roller orange-peel and gentle undulation in low raking light; sometimes a socket, filled picture-hook holes, a hairline crack. Motion: none.
- **4. Meaningful variation:** Number of seats; which seat is used most (darkest band); an odd chair at a different height; someone who tips back; years of use; a repaint patch; wall colour.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Too minimal to hold a collector's attention; needs stronger raking light, real burnish sheen and better chip shapes.
- **Nearest prior art and difference:** Real-world chair-rail mouldings exist to prevent exactly this; minimal 'stain' paintings. Difference: the bands are a usage record per seat, not a composition.
- **Restraint:** Mostly empty wall; no table, no chairs, nothing but the marks and the wall's own small history.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Oct 2027 (a studio target, not a public launch commitment)
- **Status:** Round 4 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `8edd05a43baeeb40ddf7edf04ae06d7393dfc716c6d7468f10cbd1b5f41dff7e`

### Nov - Fore-edge  (`2027/11-fore-edge/`)

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

### Nov - Above the Radiator  (`2027/24-above-the-radiator/`)

The wall above a radiator after some winters: a grey breath of dust rising off the top grille and fading upward, darker wherever the wall behind is colder, so the plasterboard dabs, the studs or the brick courses show through the paint.

- **Thesis:** Warm air draws the hidden skeleton of a wall in dust.
- **1. In one sentence (no technique):** The grey dust stain that grows on the wall above a radiator, showing the shapes of what is behind the plaster.
- **2. Generative rule:** A line plume rises from the radiator's top: deposition at height y follows an erf-edged sheet whose width grows linearly and whose concentration decays exponentially, modulated by slow vertically stretched turbulence and slightly darker entraining edges. Thermophoresis: particles settle more where the wall surface is colder, so a cold-spot map multiplies deposition: plasterboard dot-and-dab adhesive blobs (a grid of soft ellipses), timber studs at 400 or 600 mm centres, or brick courses (65 mm brick + 10 mm joint, pattern staining). A sill above traps the plume and darkens its underside.
- **3. Composition, material, motion:** Tall front-on crop, 100 x 125 cm: skirting, pipes and valves, a white panel radiator with convector grille, and the wall above. Material: emulsion, pressed steel, dust. Motion: none.
- **4. Meaningful variation:** Winters since decorating; wall construction (dabs, studs, brick); a sill above or open wall; radiator width; smoker (yellower deposit); plume lean from draughts.
- **5. Collector deliverable:** Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, (b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record (source hash + seed + render resolution). Open generative minting is a separate option, decided later. Prints only after a real paper proof has been made and approved.
- **6. Buyer / channel:** Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet photographic/observational work are the likeliest audience. [unknown] No collector of this artist has expressed interest in this subject.
- **7. Unresolved artistic risk:** Could read as a building-defect photograph rather than an artwork; the radiator needs to stop looking modelled.
- **Nearest prior art and difference:** Pattern staining / 'ghosting' is a documented building defect (photos in building-survey guides). Difference: it is shown as a portrait of a room's winters, not a defect report.
- **Restraint:** Grey on off-white only; no furniture, no window view.
- **Edition / price:** Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new work; market-wide medians and established artists' sales are deliberately not used as a basis. Decide after the selected-works round shows whether anyone responds.
- **Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published.**
- **Studio target:** Nov 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `7d226d3f6e9db902c3011dd1f6d1e03cd9b7569b552c5c1ef8f836b995d883b7`

### Dec - Fogged  (`2027/12-fogged/`)

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

### Dec - Splashback  (`2027/14-splashback/`)

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

## Main risks
- Quality is uneven; see grades. Several new prototypes are round 1.
- Some subjects are close to known visual effects (Scoured ~ brushed-metal halo / star trails; Fogged ~ rain-on-glass shaders; Oche ~ a stock dartboard graphic).
- Aleatory: small, thin venue (venue evidence only), and a 32 KB single-op file cap.
- Render time: several engines take 10-50 s headless in node (1-3 s in Chrome).
- Collector demand is unknown -- editions/prices/venues stay TBD.

# Before the Shovels (Clyde, 2026)

> *A small public place, seen from above, on the morning after snow and before anyone clears it. Nobody is in the picture. People appear only as what they wore into the snow.*

**Thesis:** the desire line is a drawing made by a crowd that never met. No single person decided where the path goes. Each walker followed the easiest way, and the easiest way was where someone had already walked. Clyde draws that collective decision, lit by low winter light, along with what it leaves behind: a snow angel, a dog's detour to every lamppost, the trampled circle where someone waited, a mitten.

## How it works (custom engine)
1. **The place.** One of eight layouts is built in metres on a 20 × 25 m site. Four are park-like: The Corner, The Fountain, The Fence and The Courtyard. Four are streets (round 11): The Street Corner, The Frontage, The Bus Stop and The Roadside. Each has buried formal paths, entrances weighted by popularity and its own furniture, and is randomly mirrored.
   - **Street places** carry 1–3 familiar objects, never all of them. Everything is seen from directly above, so each object is its snow cap plus its projected shadow.
     - **The Street Corner:** two plowed roads meet at a corner with a stop sign and a street-name blade. The octagon and the blade are legible in their shadows. It may also have a fire hydrant, a lamp and a plow pile on the corner.
     - **The Frontage:** a road and sidewalk below off-frame houses. Property lines are marked by picket, chain-link or split-rail fences, each casting a different comb of shadow. Each picket fence has its own pitch, picket width, post spacing and top: pointed, flat, scalloped or dog-ear. A few pickets may be missing or askew. It has door paths or a driveway (sometimes with a car buried in it, otherwise tyre ruts) and mailboxes at the curb.
     - **The Bus Stop:** a shelter with a snow-loaded roof, glass panels whose frames show in the shadow, a dry bench underneath, a bus-stop pole at the curb, and someone's waiting prints where the track ends at the kerb.
     - **The Roadside:** a car parked by the curb and buried. It has a snow-loaded roof and hood mound in one of three body shapes: a sedan (long boot), an SUV (tall box, sometimes roof rails and crossbars) or a hatch (short tail). The snow rounds every crease. It may have wipers left standing off the glass, an aerial fin bump, or a part-cleared windshield, a drift banked against its windward side and a plow berm along the lane. There is a hydrant or sign, and a driveway with ruts or a split-rail fence.
   - Roads are plowed asphalt 13 cm below the kerb under a layer of combed grey slush, with tyre ruts where traffic has passed. Later cars follow the first car's ruts, so each lane has one worn, soft-edged pair, never scraped quite to the asphalt. Pedestrian prints do not show on the asphalt, so a crossing reads as a track that stops at one kerb and resumes at the other.
   - **Trees are grown in 3D (round 12)**, then seen from above and projected along the sun. They are no longer flat "brooms".
     - **How a tree grows:** a tapered trunk rises clear to the first scaffold limbs. Decurrent trees then divide into 3–6 scaffolds at 30–60° from vertical; excurrent trees keep a leader with laterals or whorls.
     - **Branching:** recursive sub-branching, with phyllotactic azimuths (about 137°) and shrinking length and diameter. Gravitropism (up, or droop at the twig tips), outward phototropism and bend noise shape each limb.
     - **Crown envelope:** a per-species envelope (ellipsoid, vase or cone) clips branch length, so crowns have their real outline. The skeleton budget is split evenly across limbs.
     - **Species:** maple (rounded), oak (wide, crooked), elm (vase, drooping outer twigs), birch (narrow leader, white bark, weeping twigs, sometimes multi-stemmed), spruce (a cone of near-level whorls carrying needle sprays that hold snow in tiers), and the young street tree (a small crown on a tall clear stem). Town Places favour young street trees; off-frame shadow trees are mature oak, maple, elm and spruce.
     - **One geometry, two uses:** the plan view (with snow on limbs in proportion to how level they are) and the cast shadow (each segment projected along the sun vector, with a solar-disc penumbra) come from the same 3D segments, so they always agree. Off-frame trees cast shadows the same way.
     - Fine twigs stand in for the many more a real crown has, so their plan-view opacity and shadow width are boosted, about 2.8× at the finest. The debug sheet `debug/tree-sides.png` shows engine trees in side elevation next to a 1.75 m figure.
   - Some trees and buildings stand **outside the frame**. Only their shadows enter.
2. **Walkers (active-walker model, held to restraint).** "A single set of footprints is powerful, a few is strong, a crowd is a message." Most outputs show one to four people, and each of them has an errand.
   - Every walker gets a motivated origin and destination: an off-frame exit, a doorway, an arch or a gate. Some stop on the way: they sit on a bench (feet planted in front of a swept seat), or step up to a bin and go on. About a third pause once, with feet together and a turn of the head, before going on.
   - For Solitary and A Few, the route is chosen by a composition score. The track should cross the picture on a diagonal, avoid hugging one edge, sit near a third, and cross one shadow rather than hide in it.
   - A Dijkstra geodesic field to the destination is computed on a 0.2 m grid. Walkers descend it with momentum, a personal lateral bias and slight wander, and step around benches, bins, trunks and deeper drifts. Children take shorter strides.
   - Every step lays a footprint in world units and packs the grid. Path reinforcement scales with footfall: at Solitary or A Few, later walkers barely favour earlier prints, so each track stays legible as single prints. Only a Crowd merges into trodden trenches and desire lines.
   - Street errands (round 11): someone walks to the bus stop, waits (shuffling a few times) and their track ends at the curb, or someone gets off a bus and walks away. Someone goes from their door down to the mailbox, stands and goes back.
   - Incidents are part of the same story. A Snow Angel is made by a person who walks round the fresh patch to its foot end, falls back, sweeps, gets up and steps out. A Dog is walked by someone whose dog visits the lamps, trees and bins along their route. A Sledge is pulled out and left where it stopped. At Solitary, the incident's person *is* the one walker.
   - **Snow angel anatomy** (adult, or child at 0.64 scale): a hooded head hollow, shoulders, a torso imprint and the deepest seat. The wings are full arm-sweep fans from the side to overhead, with packed outer arcs and mitts rounding the tips. The skirt is a leg fan with heel-packed hems. Snow is shoved outward into a rim, and the packed floor greys slightly. Getting up leaves a hand print by the hip, a scuffed seat, sometimes knee prints, a boot planted in the skirt with the hem broken there, and a long step out. A child's angel comes with an adult's prints standing a few steps off.
   - **Animals (round 11, one species per scene at most, held to the same restraint).** Each species has its own gait:
     - **Rabbit:** hopping groups of four in a Y (small front feet one behind the other, long hind feet side by side ahead of them). It travels from far off to cover under a hedge, bench or tree, and sometimes comes out again.
     - **Cat:** direct register (hind foot in the front print), a neat narrow line, often following a fence or wall from a doorway.
     - **Fox:** an even straighter, narrower line edge to edge, sometimes with a detour to a bin.
     - **Squirrel:** bounding groups between trees, or toward a tree outside the frame.
     - **Deer:** split-heart hoof prints, with drag marks between them in deep snow. Deer never appear at a Bus Stop, Street Corner or Courtyard.
     - **Birds:** clusters of three-toed arrow prints under a bench, by the bus-stop wait spot, round a bin or under a tree. Pigeons walk in alternating prints; sparrows hop in pairs. Sometimes a few birds sit there, seen from above (pigeon, sparrow or crow). Sometimes there is a takeoff mark: a body press with two fanned wing-feather prints.
     - A walker's dog (Incident: A Dog) is unchanged.
3. **Snow.** A pixel heightfield combines:
   - depth plus large-scale undulation
   - wind ripples and drift in the lee of obstacles
   - compaction from shoe-shaped stamps (heel, waist, ball, toe, toe-out; drag furrows in deep snow)
   - displaced rims, trail troughs with berms, churned trough floors, and toe spray
   - bare ground showing through in a dusting (wet paving or dark grass)
   - less snow under benches, round trunks and along walls
4. **Light.**
   - Sun shadows use an exact line-sweep along the sun azimuth (nearest-neighbour along exact lines, so nothing smears).
   - Thin floating occluders (branches, lamp heads, rails) and off-frame buildings are projected as geometry. Round 11 adds an exact plate projection, so sign plates, picket and chain-link fences and shelter glass cast shadows with their true outlines. Snow caps on raised objects (the shelter roof, mailbox, sign) are never darkened by shadows that fall on the ground beneath them. Their penumbra comes from the 0.53° solar disc, so high twigs cast faint, soft shadows.
   - Shading also includes sky ambient with two-scale occlusion, bounce light from sunlit snow into print floors, and shadowed snow taking on the sky's colour.
   - At night: shielded lamps with cone falloff, short-range horizon shadowing, radial shadows of branches and benches, and a lamp that works or doesn't. Sometimes the light comes from a lamp outside the frame.
   - Finishing: crystal sparkle, hue-preserving tone mapping, split-tone grade, grain and vignette.

The simulation runs on a fixed grid in metres, and footprints are stored in world coordinates. That makes every output deterministic and independent of resolution: `?res=` only changes detail (the mean pixel difference between 640 px and 1280 px renders is 1.37 on a 0–255 scale).

```js
// walkers descend a geodesic field whose costs fall as snow is packed down
function walk(R2, from, to, key, o) {
  var F = field(key, to[0], to[1]);          // Dijkstra on the 0.2 m grid; recomputed as the snow changes
  ...
  var gx = sample(F, x + 0.1, y) - sample(F, x - 0.1, y), gy = sample(F, x, y + 0.1) - sample(F, x, y - 0.1);
  wander = wander * 0.93 + R2.gaussian(0, 0.08);                 // personal drift
  hx = hx * 0.8 + tx * 0.2; hy = hy * 0.8 + ty * 0.2;            // momentum
  ...
  prints.push(fx, fy, ang, footL, footL * 0.38, 0, 1 - 0.72 * used, 0, 0);  // footprint in world units
  deposit(x, y, dep);                                            // pack the snow -> cheaper for the next walker
}
// cost of a cell: fresh snow 1.0, buried path 0.92-0.97 (0.62 in a dusting), minus up to 64% when packed
// (that reinforcement is scaled by footfall: x0.3 Solitary, x0.35 A Few, x0.7 Steady, x1 Crowd)
cst[i] = blocked[i] ? 1e9 : cost0[i] * (1 - trailK * Math.min(1, Tr[i] * 1.3));
```

## Round 13: fences, structures, two new Places, livestock
- **Fences are built, not drawn.** Each fence segment carries a structural spec (`fenceSpec`), and the same spec drives its plan view (`fenceTop`) and its elevation (`fenceOcc`). The shadow is that elevation projected along the sun ray. Thick members clip the light through their depth (`sh` shift), so breeze-block openings narrow and slant in shadow as real ones do. Dimensions follow published references:
  - **Picket:** 4x4 posts 6–8 ft on centre, either flush below the picket tops or capped slightly above them (never taller flat boards next to pointed pickets); two rails about 6 in from top and bottom; pickets 2 in above grade.
  - **Chain-link:** terminal posts with dome caps at the ends and gates, line posts at 8.5–10 ft with loop caps, a continuous top rail, 2 in diamond mesh and a bottom tension wire.
  - **Split rail**, **paddock board**, **privacy** (flat or shadowbox) and **wrought iron or aluminium** (spears or flush, ball-capped posts).
  - **Breeze block:** 12x12x4 in blocks in stack bond with pilasters at 3 m or less, a solid first course, a cap, and circle, diamond, cross or quatrefoil openings.
  - **CMU wall** with a snow cap.
  - Gates are leaves of the same build.
  - `debug/fence-types.png` renders every type in side elevation, plan and 22° shadow, straight from the engine's own `FENCE` block (`tools/fencedebug.js`).
- **Structures (`addSt`).**
  - Solid ones go into the sun-sweep heightfield, so their shadows are exact: shed, garage, coop, raised beds, sandbox, low wall, steps, deck, dumpster, AC unit, hot tub, wheel stop, bales, bale feeder, stock tank, trough and covered pool.
  - Floating ones (picnic tables, trampoline, gazebo, water tower) cast a union of their members' projections (`uCap`/`uSlab`), so a tank, its legs, braces and catwalk overlap as one shadow instead of stacking into black. A trampoline's net is a veil at about 30%.
  - The silo is placed after the sun is known, just off the frame on the sun's side, so its long shadow comes in.
  - The round basin is now about 4% (10 in the 200 sweep).
- **The Backyard:** the back of a house along one edge, with a lit door, a deck with railings and steps (or plain steps), a fence on the far side with a gate (sometimes a side fence too), one winter-covered accent (pool, hot tub, trampoline, gazebo or round table) and at most one small thing (shed, beds, sandbox, table or AC unit at the wall).
- **The Farmyard:** a paddock fence with a swung tube gate. Tractor ruts come through the gate to the bale feeder. Inside the paddock are the feeder, tank or trough with a churned, sometimes muddy, trampled ring and scattered hay. Outside it there may be a silo, water tower or row of bales, a yard light and a windbreak tree.
- **Livestock (one species):**
  - **Horse:** round hoof prints, shod (a deeper U open at the heels) or unshod (frog wedge); a 4-beat walk with the hind print just past the fore.
  - **Cow:** large cloven prints.
  - **Sheep and goats:** small cloven prints; sheep often walk single file.
  - **Hens:** three toes plus a hind toe, in clusters within about 4.5 m of the coop door.
  - Half of livestock scenes show some animals at the feed: barrels with snow along the spine, neck, head and tail, and shadows from body, legs, neck and head capsules.
- **Events, not props.** Tracks enter through gates and gather at feed. Courtyard walkers can detour to the dumpster ("took the rubbish out"), and Backyard paths lead to the hot tub, shed or gate.
- **Fixes:**
  - **Elm whips:** a limb that leaves the crown envelope by more than about 0.3 m stops; `debug/tree-sides-r13.png`.
  - **Night:** Lamplight moon and sky light raised (si 0.13→0.19, ki 0.06→0.10).
  - **Street-corner stripes:** fewer rut passes.
- **Reproducibility:** `outputs-manifest.json` records the source version (sha256 of `art.js` and `clyde.js`) and the exact seed of every sample and hero. `sweep/sweep-200.json` does the same for each sweep item. Seed rule: `hash = 0x + sha256('clyde-before-the-shovels-' + i)`.

## Traits (all drive the image)

| Trait | Values | Share of 36 samples (round 10 figures for unchanged traits) |
|---|---|---|
| Place | The Corner 13, The Fountain 4, The Fence 12, The Courtyard 11, The Street Corner 11, The Frontage 12, The Bus Stop 10, The Roadside 10, The Backyard 10, The Farmyard 9 (weights, round 13) | sweep of 200: 15 / 10 / 29 / 21 / 23 / 20 / 18 / 22 / 16 / 26 |
| Hour | Dawn, Winter Noon, Dusk, Lamplight (weights 34/28/28/10) | 12 / 8 / 16 / 0 (Lamplight is 11/200 in the sweep) |
| Snowfall | Dusting, Fresh, Deep | 9 / 21 / 6 |
| Footfall | Solitary, A Few, Steady, Crowd (weights 35/40/18/7) | 18 / 11 / 4 / 3 (sweep of 200: 74 / 74 / 40 / 12) |
| Incident | None, Snow Angel, Child's Snow Angel, A Dog, Lost Mitten, Someone Waited, Sledge (weights 34/9/6/15/12/14/10) | 17 / 1 / 2 / 4 / 2 / 5 / 5 |
| Animals | None, Rabbit, Birds, Cat, Fox, Squirrel, Deer (weights 34/18/18/10/8/8/4; Deer becomes Fox in town places and the Backyard). In The Farmyard: Horses 20, Cows 22, Sheep 14, Goats 9, Chickens 9, None 10, Deer 6, Fox 4, Birds 6. Never more than one species | sweep of 200: livestock in 18 |
| Made Thing (round 13) | the anchor structure: Silo, Water Tower, Gazebo, Covered Pool, Hot Tub, Trampoline, Bale Feeder, Stock Tank, Trough, Coop, Shed, Garage, Dumpster, Picnic Table, Raised Beds, Sandbox, Low Wall, Hay Bales, AC Unit, Fountain Basin, or None | sweep of 200: None 131, Basin 10, Dumpster 9, Water Tower 8, Silo 7, Trampoline 6, Picnic Table 5, Gazebo 4, Stock Tank 4 … |
| Fence (round 13) | Picket, Chain-link, Split Rail, Board, Privacy, Iron, Breeze Block, Block Wall, or None | sweep of 200: None 107, Split Rail 28, Board 20, Chain-link 15, Picket 14, Iron 7, Breeze Block 5, Privacy 3, Block Wall 1 |
| Wind | Still, Drifting | 22 / 14 |

Footfall people counts (Steady and Crowd become A Few in the Backyard and Farmyard): Solitary is 1, A Few is 2–4, Steady is 12–22 and Crowd is 90–140. "Overcast" was removed after curatorial review because it produced the weakest outputs. Lamplight (moonlit night) is held to about 10%. A snow angel cannot be made in a Dusting, so it becomes A Dog.

## Prior art and influences (credited honestly)
- **Desire lines** as a concept: Gaston Bachelard's *chemins du désir*. Landscape architects have long observed paths worn across lawns and snow.
- **Active walker model** of trail formation: Dirk Helbing, Joachim Keltsch and Péter Molnár, "Modelling the evolution of human trail systems", *Nature* 388 (1997). Clyde uses a geodesic-field variant of it.
- **Aerial snow photography and footprint traces** (many photographers). The plan view and raking light owe something to that tradition. This series is simulated, not photographed.
- **Line-sweep heightfield shadows** follow the standard horizon/shadow-sweep technique from terrain rendering.
- What Clyde set out to avoid: painterly flow fields, Ringers-style single-constraint studies, SDF naturalism, textile languages and plotter gardens.

## Files
- `src/art.js` is the engine (about 200 KB of source) and `src/meta.json` holds the series metadata.
- `samples/00–35.png` are 1280×1600 renders. `samples.json` records hash, features and render ms (Chrome at 1280×1600: 3.6–6.2 s, average 5.0 s in round 12, because of the 3D trees).
- `contact-sheet.png` holds all 36 outputs (round 13). Earlier sheets are `contact-sheet-r12.png`, `contact-sheet-r11.png` and `contact-sheet-r10.png`.
- `debug/tree-sides.png` shows engine trees (from the sweep's own hashes) in side elevation at true scale, with their plan view and 15° sun shadow.
- `heroes/hero-{08,198,103,45,16,14,04}.png` are 2560×3200 renders (round 13):
  - 08: a silo's shadow over a cattle paddock.
  - 198: a farm water tower, cows at the feeder, and tractor ruts through the gate.
  - 103: a gazebo in a backyard.
  - 45: a covered pool with meltwater.
  - 16: breeze-block wall shadows.
  - 14: chain-link at dusk.
  - 04: a picnic table under a tree.
  - Earlier rounds are in `heroes/r12/` … `heroes/r8/`.
- `debug/fence-types.png` is the fence reference sheet. `outputs-manifest.json` holds seeds and the source version.
- `sweep/sweep-200.png` and `sweep/sweep-200.json` hold the 200-hash sweep (round 13, with hash and version per item). Earlier sweeps are in `sweep/r12/` … `sweep/r9/`.
- `dist/` contains one zip per platform:
  - `before-the-shovels-aleatory.zip`: a single HTML file, about 220 KB raw / 69 KB gzipped (round 13).
  - `-highlight.zip`
  - `-verse.zip`
  - `-fxhash.zip` (archival only, because fxhash has closed)

## Platform notes
- **Aleatory:** one self-contained file using the vanilla runtime with no params; it calls `$alea.ready()`. At about 220 KB it exceeds the 32 KB single-operation limit, so it must be deployed with the chunked `append_code` + `seal_code` path, which the spec supports.
- **Highlight:** bundles `hl-gen.js` and calls `hl.token.setTraits` and `hl.token.capturePreview()`. Use programmatic capture with a 20 s timeout or more (the 3D trees made renders slower in round 12).
- **Verse:** reads `?payload=`, sets `$artifact.features` and fires `capture-preview`.
- **Standalone:** `?hash=0x…&res=` (400–8000). Press `s` to save a PNG. `?hour=`, `?place=`, `?animals=` and `?foot=` overrides work only in standalone preview mode.

## Curatorial self-critique
See `CRITIQUE.md`.

# Curatorial critique and iteration log

## Rounds (what a harsh curator said, and what changed)
1. **"An architectural site plan, not art."** Shadows were missing because of a buffer clash, the trees were black spiders, and the roofs looked like a user interface.
   - Fixed the sun sweep.
   - Moved the snow-surface ambient occlusion to clamped heights.
   - Zoomed from 28 m to a 20 m site.
2. **"Solid wedge shadows are physically wrong."** The heightfield treated branches as solid columns.
   - Floating occluders are now projected as geometry, with solar-disc penumbra.
   - Added off-frame "ghost" trees whose shadows alone enter the picture. This became the signature.
3. **"Clutter."** Fewer benches, bins and trees. The courtyard building moved entirely outside the frame, so only its projected shadow mass and the light wedge through its passage remain. The basin is now plain snow, not camouflage-patterned ice.
4. **"The footprints read as a school of fish or stickers."**
   - Prints now have a real sole profile, noisy edges, crumbled walls, and a shallower depth fraction.
   - Prints merge into a churned trough on busy lines, and toe spray appears only in deep snow.
   - Bounce light now reaches into print floors, and a height-difference clamp stopped the beaded branches and pearl-like lamp heads.
5. **"The light is wrong for snow."**
   - Sun irradiance is normalised so flat lit snow is near white and shadows are blue.
   - Sky colours were desaturated and tone mapping is now hue-preserving.
   - Dusk is less pink.
6. **"Night is a polka-dot vignette."** Shielded lamp cones, one or two working lamps, sometimes an off-frame lamp, sodium colour, radial shadows, and short-range lamp horizon shadows.
7. **"Overcast is forgettable."** Removed as a trait. The series is about raking light, so the weakest end of the distribution was cut.

8. **Round 8, after the owner's "pretty good, keep working on it".**
   - **Night:** Lamplight is now a moonlit hour with hard moon shadows from the sweep and ghost trees, plus 1–2 sodium lamps. Its weight dropped from about 24% to 10%. Moon shadows give night a graphic structure; the grey field had none.
   - **Snow surface:** removed the high-frequency micro-noise that read as watercolour paper. Ripples are near zero unless windy, grain is halved and fades in highlights, and sparkle now follows the moon at night.
   - **Trees:** 5–8 limbs, more branching, twig spurs from the second order, and a larger segment budget, for fuller and older crowns.
   - **Props:** the lamp head has a domed snow cap reaching to a 1 cm metal lip, so it no longer reads as a ring. The bin has a 3 cm lip and a sunken snow cap. The bench has cast-iron end frames and armrests, four seat slats under a snow pillow with a ragged edge, two back rails, and at most two narrow swept seats. Rush scenes used to sweep the whole bench to bare wood. The snow hollow under the bench is softer.
   - **Layouts:**
     - The Corner's formal paths now bow gently instead of being ruled.
     - Walkers start from a spread along open edges (σ 0.7 m) rather than a single point.
     - About 24% of walkers make for one of 1–3 places in the open first, which creates branching and curving desire lines.
     - A low-frequency drift field raises walking cost off-path, so people bend around deeper snow. Visible depth carries only a weak, separate component.
     - Walker heading inertia rose from 0.72 to 0.80, giving smoother arcs.
   - **The Fountain:** no longer a target diagram. The basin is never centred and is always cropped by a side edge. The ring path and radial spokes are gone; at most one curved formal path skirts the basin. Benches and lamps sit on the open side only.
   - **Incidents (form, not colour):**
     - Snow angel: about 15% larger, with a step-off print and an exit trail.
     - Someone Waited: a trampled circle of radius 0.85 m (120 prints) plus four laps of pacing along a 2–3 m line.
     - Sledge: now wooden, with slats and dark runners, and deeper runner tracks.
     - Mitten: muted wool colours (rust, navy, mustard, moss, oatmeal) instead of a shared red.

## Honest remaining weaknesses (after round 8)
- **Night** is better but is now only 10% and is still the least photographic hour. Lamp pools are soft radial glows, and footprints at night read as dark marks rather than shaded hollows. No Lamplight output fell in samples 0–35 (#37 and #44 are night), so hero-44 shows it.
- **Benches** are better built but still read as small, slightly diagrammatic rectangles at full view. A faint light rectangle still surrounds them (the snow hollow underneath catches light). Lamp heads and bins are fine.
- **In-frame trees** are fuller but still less beautiful than the off-frame shadow trees.
- **Incidents:** the waited circle with pacing, the sledge runners and the dog loops now read at thumbnail size when they fall in sunlit snow. The snow angel only reads well in Fresh or Deep snow under low sun. The mitten remains a close-reading detail by design: it does not read at thumbnail size and I have not faked that with colour.
- **Layout:** much less ruled. The Fountain is now the most varied place. The Corner and The Fence still carry their straight formal axes; that is the subject, but they are the most predictable places. The Courtyard's large building-shadow slabs can dominate (#18, #21, #35).
- **Surface:** smooth and snow-like at 3200 px, with no paper tooth. Close up it is perhaps too smooth: real snow shows faint crystal texture and old wind-crust.
- **Derivative risk** is unchanged: aerial snow photography is the obvious reference.
- **Size:** about 81 KB HTML (26 KB gzip), so Aleatory needs the chunked deploy.

## Would it stand next to top Art Blocks / fxhash work? (round 8)
The floor has risen more than the ceiling. Round 7's weak tail (cluttered Fountains, polka-dot nights) is gone, and Fountain layouts are now among the best: an off-centre cropped basin with curved desire lines. The best outputs (#05, #10, #14, #33, #44) hold up as images with a subject.

**Mint-readiness:** close, but not yet. It is ready for a small curated or test release (for example an Aleatory drop of 64–128) after one more pass on benches and night lamp pools and a 200-hash statistical sweep for bad outliers. It is not ready for a large open edition.

---

9. **Round 9: benches, night, surface, Courtyard shadows, 200-hash sweep.**
   - **Benches:** the snow-depth reduction under the bench, which caused the light rectangle halo, is gone. Each bench gets a small deterministic yaw so it no longer sits on the grid. Rebuilt with narrow iron armrests carrying thin broken snow ridges, a domed seat pillow with low-frequency ragged edges, per-slat wood tones, and broken snow lines on the back rails.
   - **Night:** brighter, bluer sky ambient. More bounce light, softer AO, and moon normals pulled toward flat, so print floors stay lit. A small moonlit subsurface term inside prints. Footprints now read as shaded hollows, not ink marks. Lamp cones are tighter, with less glow diffusion and 20% less power, and there are at most two lamps in frame.
   - **Surface:** a faint "crystal tooth" sparkle appears only where light rakes the surface. A light wind crust when Drifting, kept very weak in Deep snow because it hatched. Ripples are domain-warped and about 25% shallower, so they no longer streak.
   - **Courtyard:** the off-frame building's shadow reach is limited to about 24% of frame height and 22% of width. If no sun azimuth fits, the building height is scaled down.
   - **Outlier fixes from the first sweep:** Dusting gets 1.6× walkers. The Courtyard with First Few gets +6 walkers, because these combinations made near-empty frames. The snow angel is softened, with the crisp ribbing removed.

### 200-hash sweep (final code): `sweep/sweep-200.png`, stats in `sweep/sweep-200.json`
- **Broken:** 0. No errors, blank frames, NaN or overflow. The slowest render took 6.3 s at 800 px in the node harness. Verify passes on all four platforms: deterministic, features stable across resolution.
- **Weak:** about 11 of 200 (5.5%).
  - **Too sparse (about 8):** #3, 21, 51, 63, 83, 92, 161, 194. All are Dusting or First Few at high sun. They read as almost blank paper. Defensible as the quiet end of the edition, but not strong.
  - **Building shadow still dominant (about 3):** #40, 178, 195, where a flat slab takes 30–40% of the frame.
- **Night (11/200, 5.5%):** improved but still the least convincing hour. #199 and #139 are murky.
- **Trait shares:** Place is Corner 57, Fence 53, Courtyard 46, Fountain 44. Hour is Dusk 66, Dawn 63, Noon 60, Lamplight 11.

## Honest remaining weaknesses (after round 9)
- **The sparse tail (about 4%)** reads as empty at thumbnail size. A minimum-ink floor would fix it but would homogenise the edition.
- **Courtyard slabs** still occasionally dominate (about 1.5%).
- **Night** is acceptable, not great. At 5.5% it is a rarity, not a pillar.
- **In-frame trees** are still weaker than the shadow trees. Benches are better but still small, legible objects rather than beautiful ones.
- **Long straight shadow lines** from lamps and fences repeat across many outputs, a visual tic of the series.
- **Derivative risk** remains: aerial snow photography.

## Verdict (round 9)
**Mint-ready for a small curated release** (Aleatory, 64–128 editions). About 94% of outputs are solid, none are broken, and the weak 5–6% are quiet rather than ugly. It is still not a large open edition.

---

10. **Round 10: snow angels rebuilt from anatomy; footfall restructured around restraint.**
   - **Snow angel:** rebuilt as a body in adult metres (a child is a 0.64-scale trait, "Child's Snow Angel").
     - The body: a hooded head hollow, a neck, broad shoulders, a torso imprint and a deeper seat.
     - The wings are full arm-sweep fans pivoting at the shoulders, from the arm at the side to overhead (about 150–165°). Their outer arcs are packed and the mitts round off the tips.
     - The skirt is a leg fan pivoting at the hips, opened 29–41° per leg, with a heel-packed hem.
     - Snow shoved outward forms a raised rim. The rolled floor is slightly greyer than fresh snow, which is what makes the figure read at thumbnail size.
     - Getting up: a hand print by the hip, a scuffed seat, knee prints in about half of them, one boot planted in the skirt (the hem is broken there), and a long step out.
     - Approach and leave: the maker walks *round* the fresh patch to the foot end (the patch is blocked during the approach), stands with their back to it, and later walks out to a real exit. A child's angel has an adult's standing prints 2.3 m off.
     - The spot is chosen in sun, away from obstacles and shadow casters, and the head points roughly up the page so the figure is read as a person.
     - The earlier ellipse-plus-arc angel is gone.
   - **Footfall:** now Solitary 35, A Few 40, Steady 18, Crowd 7 (people counts 1 / 2–4 / 12–22 / 90–140). The 200-hash sweep came out at 74 / 74 / 40 / 12.
   - **Errands:** every person has an origin and destination at an exit, door, arch or gate. 20% go via a bench (feet planted in front of a swept seat) and 12% via a bin (they step up to it and stand, then go on). At Solitary or A Few, about 35% pause once, with feet together and a turn, before going on.
   - **No aimless routes:** the mid-field "via" attractors (aimless sunny-patch detours) are now Crowd-only. Pairs already used are penalised, so A Few gives distinct tracks. The Sledge child now leaves the sledge and runs off to an exit instead of vanishing. A dog is now walked by a person, visiting lamps, trees and bins along that person's route.
   - **Reinforcement:** trail-cost reduction is scaled ×0.3 Solitary, ×0.35 A Few, ×0.7 Steady, ×1 Crowd. Trough deposit is ×0.45 / 0.5 / 0.8 / 1. Individual prints stay individual below Crowd. One walker in Deep snow still ploughs a trench, which is physically right. The round 9 "1.6× walkers in a Dusting" and "+6 in the Courtyard" floors are removed: sparse is now intentional.
   - **Deliberate sparse composition:** for Solitary (and the first walker of A Few), 40 candidate routes are scored. A route should run about 17 m and cross the frame on a diagonal; it should not run along one edge, should sit near a third, and should cross one tree or building shadow without being buried in shade.
   - **Dusting:** a dusting is now trodden through to the ground (compaction 0.93 versus 0.76), so a single set of prints in a dusting reads as dark marks rather than vanishing.
   - **Solitary incidents:** when Solitary meets an Angel, Dog, Waited or Sledge, that incident's person *is* the solitary walker, so the frame still holds one set of prints.

### 200-hash sweep (round 10 code): `sweep/sweep-200.png`, stats in `sweep/sweep-200.json`
- **Broken:** 0. Every hash rendered, with no errors and no blank frames. The slowest took 7.9 s at 800 px in the node harness. Verify passes on all four platforms (deterministic, features stable across resolution). Rebuilt zips are in `dist/` (Aleatory HTML 96 KB, 31 KB gzip; chunked deploy still needed).
- **Weak:** about 19 of 200 (about 9–10%). The share is higher than round 9's 5.5%, and that is the honest cost of restraint.
  - **Near-empty at thumbnail size (about 8, 4%):** #18, 51, 63, 76, 83, 102, 161, 166. All are Solitary or A Few, in Dusting or flat noon light, or with a track running along a lit edge. At full size they are quiet single tracks. At 160 px they read as blank paper.
  - **Night (11, 5.5%):** unchanged from round 9 (#37, 44, 95, 101, 108, 139, 155, 182, 183, 199, 100). Still the weakest hour. #139 and #199 are murky.
  - **Heavy or muddled (about 3):** #70 (Crowd in a Dusting: trodden to wet paving, a dark muddy trench), #58 (Steady in Deep with wind: scribbly), #160 (Crowd in Deep).
- **Strong:** the new restraint pays off in the middle of the distribution. Single tracks crossing a shadow (#19, #26, #102 at full size), two or three distinct errands (#20, #24, #2), and the angel-plus-one-track story (#8) are the best images the series has made.

## Honest remaining weaknesses (after round 10)
- **The angel reads as an angel, but it is still a stamp.** The arm and leg fans are geometric sectors with noise on the edges. There are no layered repeated sweeps and no glove or sleeve texture. Close up the floor has a slightly pebbly texture. It reads at thumbnail size mainly through the greyed floor, which is a small artistic liberty.
- **Head-up bias:** angels are kept roughly upright on the page for legibility. That is a composition choice, not a physical one.
- **Shadow-aware routing is approximate.** It knows tree crowns and buildings but not fence or lamp shadows, and it scores straight lines between entrances, not the walked path.
- **Entrance geometry still limits Solitary.** In some Courtyard and Fountain layouts the only long route is a straight formal axis (#18 is a central vertical line).
- **Dusting plus Crowd** turns into a dark trench. That is physically plausible but visually heavy.
- **Night** is unchanged: acceptable, not great.
- Carried over: in-frame trees are weaker than shadow trees, there are repeated straight lamp and fence shadows, and the derivative risk of aerial snow photography remains.

## Verdict (round 10)
**Mint-ready for a small curated release** (Aleatory, 64–128 editions), and a better one than round 9. The edition now has a voice about restraint: two thirds of outputs are one to four people with legible errands, and the Crowd is a rare 7% statement. About 90% are solid and none are broken. The weak 9–10% is mostly quiet rather than ugly, plus the night tail. Before a larger edition: give the angel layered sweep texture, and make the composition scorer trace the actual walked path and know every shadow caster.

---

11. **Round 11: familiar things: streets, props, animals.**
   - **Four new Places** (the 8 Places are now weighted 11–14 each): The Street Corner, The Frontage, The Bus Stop and The Roadside. Each scene holds 1–3 familiar anchors, never the full set.
     - Every prop is drawn from directly above as a snow cap plus an exactly projected shadow, so the shadow does the naming:
       - A stop sign's octagon and a street-name blade.
       - Picket fences (a comb), chain-link (a grey veil with posts) or split-rail (two bars).
       - A shelter's roof slab with glass panels, whose frames show in the shadow.
       - A mailbox loaf on its post.
       - A hydrant: a red ring under a dome of snow.
       - A buried car: a roof-and-hood mound with mirrors, a drift on the windward side, sometimes a brushed windshield.
     - Roads are plowed asphalt below the kerb with combed slush, a plow berm and tyre ruts (ruts steer round a parked car).
     - Footprints stop at one kerb and start again at the other. A bus passenger's prints shuffle at the stop and end at the curb. Someone walks from a door to the mailbox and back.
   - **Animals:** a new trait, at most one species per scene. 32% None; otherwise Rabbit (Y groups of four, toward cover), Birds (arrow-print clusters under a bench or tree or at the bus stop; sometimes the birds themselves, or a takeoff wing mark), Cat (direct register along a fence), Fox (a straighter, narrower line), Squirrel (bounds between trees) or Deer (split hearts with drag in deep snow; not in town places).
   - **Engine fixes made along the way:**
     - Raised snow caps are no longer darkened by ground shadows beneath them (FZ floating-height buffer).
     - Off-frame building shadows used to draw faint "ghost rectangles" from the hull edges' extended lines. They now use the true signed distance to the hull.
     - Lee drifts taper quadratically instead of ending in boxy steps.
   - Footfall weights and the Round 10 restraint logic are unchanged (sweep: 74 / 74 / 40 / 12).

### 200-hash sweep (round 11 code): `sweep/sweep-200.png`, stats in `sweep/sweep-200.json`
- **Distribution:**
  - Place: Frontage 34, Roadside 31, Fountain 30, Fence 25, Courtyard 24, Street Corner 22, Corner 17, Bus Stop 17. The four street places total 104/200.
  - Animals: None 64, Rabbit 40, Birds 30, Fox 21, Cat 20, Squirrel 18, Deer 7.
- **Broken:** 0. Every hash rendered without errors; the slowest took 2.8 s at 320 px in the node harness, and heroes take about 22 s at 2560×3200 in Chrome. Verify passes on all four platforms (deterministic, features stable across resolution). Zips rebuilt; the Aleatory HTML is 140 KB (43 KB gzip), so the chunked deploy is still required.
- **Weak:** about 20 of 200 (about 10%), roughly the same as round 10.
  - **Night (11):** #37, 44, 95, 100, 101, 108, 139, 155, 182, 183, 199. The street props barely register in lamplight.
  - **Near-empty at thumbnail size (about 6):** #25, 154, 118, 89, 69, 56. Solitary tracks in Deep or Dusting at the Corner, Courtyard or Fence. These are unchanged park layouts, so the new props don't help them.
  - **Road-dominated (about 3–4):** in some Street Corner outputs, where two roads take up much of the frame, the dark rut stripes are the loudest thing in the picture (hero 177 shows this too).

## Honest weaknesses (after round 11)
- **Tyre ruts are too graphic.** On the Street Corner, multiple lane passes leave hard, dark, evenly spaced stripes. Real ruts are softer, merge into each other and are greyer. This is the first thing to fix.
- **Signs are small.** From directly above, a stop sign is a pole cap and a thin plate edge. The octagon reads only in its shadow, and only in low sun; at noon or at thumbnail size the corner reads as "two roads", not as a stop sign. The hydrant's red ring is a single fleck. This is honest to the camera but weak as familiarity.
- **The picket fence shadow** at a long low sun becomes a dense, regular comb that dominates the frame (hero 130). It is true, but it is the most mechanical texture in the series.
- **The buried car is a capsule.** It reads as a car at a glance thanks to its mirrors and drift, but the mound is too regular: no luggage-rack bumps, no wipers, no shape difference between hatchback and saloon.
- **Bird bodies** read at hero size and vanish at thumbnail size. Bird print clusters near a bench can read as scuffing.
- **Rabbit and cat tracks** are correct in gait but faint in Fresh snow at full frame. They reward a close look and don't help the thumbnail.
- **Street scenes are more literal.** The series now has two registers: the park plates are quieter and more abstract, and the street plates are more familiar and more illustrative. That is the request, and it broadens the edition, but the mix will divide collectors.
- Carried over: the night tail, the near-empty Solitary tail and the derivative risk of aerial snow photography.

## Verdict (round 11)
**Still mint-ready for a small curated release.** The edition is now more varied and familiar. About half the outputs have a street, and two thirds have a living thing besides people. Nothing is broken, and the weak share holds at about 10%. Before minting: soften the tyre ruts, enlarge or emphasise the sign and hydrant colour accents a little, and vary the picket rhythm and the car's form.

---

12. **Round 12: real trees, grown in 3D; the street fixes.**
   - **The critique:** the trees "looked correct from above only because they were shaped wrong from the side, like brooms stuck in the ground." That was right. The old generator ran 5–8 limbs out horizontally from the top of an invisible 2.5 m-short pole and rose only 2.2 m across the whole crown. It was a flat starburst on a stick.
   - **Rebuilt:**
     - Each tree is a 3D skeleton: a tapered trunk, a clear bole of 1.4–3.6 m, then 3–6 scaffold limbs at 30–60° from vertical, or a leader with laterals or whorls for birch and spruce.
     - Recursive sub-branching with phyllotactic azimuths, length and diameter falling with order, gravitropism (up, or droop at the tips), outward phototropism and bend noise.
     - A per-species crown envelope (ellipsoid, vase or cone) clips growth, and the segment budget is shared evenly across limbs, so no crown is lopsided from running out.
     - **Six species:** maple, oak, elm, birch (white bark, weeping twigs, sometimes multi-stemmed), spruce (whorled near-level branches with needle sprays holding snow in tiers) and a young street tree. Town Places favour young street trees.
   - **One geometry for everything:** the camera sees the same segments in orthographic plan view (snow on limbs in proportion to how level they are), and the shadow projects them along the sun vector with the solar-disc penumbra. In-frame and off-frame trees go through the same path, and Lamplight uses the same skeleton for its radial shadows (limbs thicker than 12 mm and needle sprays; the finest twigs are left out at night for speed).
   - **Checked from the side:** `debug/tree-sides.png` shows 24 engine trees from the sweep's own hashes, in elevation at true scale next to a 1.75 m figure, with their plan view and 15° shadow. They read as trees: rounded maples, wide crooked oaks, vase elms, narrow birches, cone spruces, small street trees.
   - **Street fixes, as agreed:**
     - **Tyre ruts:** later cars follow the first car's ruts (one worn pair per lane instead of up to eight stripes), with soft, noise-broken edges and roughly half the old compaction.
     - **Picket fences:** each fence has its own pitch (0.12–0.2 m), picket width, post spacing (1.9–2.8 m) and top (pointed, flat, scalloped or dog-ear), plus a few missing or askew pickets. The shadow plate was raised to fit the taller tops.
     - **Cars:** sedan, SUV (sometimes roof rails and crossbars) or hatch, each with its own profile. The profile is smoothed so the snow rounds every crease. Wipers are sometimes left standing (40%), sedans and hatches often have an aerial fin bump, and the drift now follows the rounded body, so the dark square corners are gone.
     - **Signs and hydrants:** stronger stop red, street-name green and bus blue; less snow on the plate edges; a wider red ring on hydrants.
   - **Speed:** the inlined shadow capsule and a cache-friendly blur (bit-identical output) brought Chrome render time at 1280×1600 to 3.6–6.2 s (average 5.0 s), up from about 2–3.5 s before round 12. The 3D trees cost that.

### 200-hash sweep (round 12 code): `sweep/sweep-200.png`, stats in `sweep/sweep-200.json`
- **Traits:** unchanged from round 11. The new generator uses its own RNG forks, so layouts, traits and walkers are the same per hash.
- **Trees:**
  - In frame (127): maple 32, young 27, birch 24, oak 22, elm 11, spruce 11.
  - Off frame (322): oak 97, maple 85, elm 83, spruce 41, birch 16.
- **Broken:** 0. Verify passes on all four platforms. The zips were rebuilt; the Aleatory HTML is about 157 KB (50 KB gzip), so the chunked deploy is still required.
- **Weak:** about 20 of 200, the same tail as before.
  - Night (11).
  - Near-empty Solitary scenes in Deep or Dusting snow (#25, 116, 118, 184).
  - A few Street Corners where even softened ruts make stripes at thumbnail size.

## Honest weaknesses (after round 12)
- **Tree shadows are softer and less graphic than before.** Physically, a 6–10 m crown at dawn throws a shadow 25–50 m long, and the 0.53° sun blurs every limb under about 25 cm into grey. The new crown shadows are mottled grey masses with crisp trunks and a few crisp low limbs. They are more truthful, but they lose the crisp, ink-like branch lacework that was one of the series' signatures. Some will miss it.
- **Twig density is faked.** A real crown has tens of thousands of twigs; ours has up to about 9,000 segments. The finest are made about 2.8× more opaque in plan and in shadow to stand in for the rest. This is a declared approximation.
- **Elm scaffold tips** sometimes run out past the crown as long bare whips (visible on the debug sheet). Oaks are crooked but not yet gnarled enough. Birch catkins and spruce cones are absent.
- **Spruce from above** reads as a snowy, dark-green star. It is convincing at hero size; at thumbnail size it is a dark blot.
- **Renders are about twice as slow.** Highlight's capture timeout should be set to 20 s or more.
- **The picket shadow** varies between fences now, but along a single fence under a low sun it is still a regular comb, which is what pickets are.
- Carried over: the night tail, quiet Solitary scenes, and signs that are still small from directly above.

## Verdict (round 12)
**Mint-ready for a small curated release, and more honest than round 11.** The trees are now trees from every side, so the plan view and the shadow agree because they come from the same geometry, not because a flat drawing was tuned to look right from above. The street props are quieter and more varied. The trade is softer crown shadows and slower renders. Before minting: decide whether to keep the physically correct soft crowns, or push the solar penumbra slightly under the truth to bring back some of the old graphic bite.


## Round 13 (fences, structures, Backyard and Farmyard, livestock)
- **Fences:** every type is now built from a structural spec and checked against its debug sheet (`debug/fence-types.png`). The pointed-picket-with-tall-flat-post fence Joshua caught is gone. Picket posts are either flush below the picket tops or capped just above them. Chain-link has terminal and line posts, a top rail and a mesh that reads as a fine lattice in shadow. The breeze-block wall throws its pattern, narrowed and slanted by the block's depth.
- **Round things are accents now.** The basin fell from 12% to about 5% (10 of 200). Silos (7 of 200) are placed off-frame on the sun's side, so a long shadow enters the picture, which is the strongest new image. Water towers (8) cast a lattice of legs and braces under the tank's shadow. Gazebo, pool, hot tub and trampoline are the Backyard's accents.
- **Events:** tracks come through the paddock gate and gather at the feeder or tank; tractor ruts lead to the bale; hen prints cluster at the coop door; a courtyard walker may detour to the dumpster. Crowds no longer appear in a backyard or a paddock.
- **200-hash sweep** (`sweep/sweep-200.png`, version `art.js f7d1bf79ae58`):
  - Place: Fence 29, Farmyard 26, Street Corner 23, Roadside 22, Courtyard 21, Frontage 20, Bus Stop 18, Backyard 16, Corner 15, Fountain 10.
  - Made Thing: none 131.
  - Fence: none 107.
  - Livestock: 18.
  - Render time: node average 2.8 s and maximum 5.1 s at 320 px (simulation dominated). Chrome at 1600 px is about 4–7 s.

## Honest weaknesses (after round 13)
- **The weak tail is unchanged in kind.** Ranked by edge energy, the ten emptiest of 200 are still Courtyards, Corners and Street Corners with a Solitary walker in flat or low light (ids 19, 48, 118, 94, 34). At full size each has one intentional trace, but at thumbnail several read as empty, and in 19 the single track hugs the bottom edge because the shade penalty pushes it out of the building's shadow.
- **Livestock read best at hero size.** At 1280 px a cow is about 120 px long, but the head and neck are simple capsules: they read as "an animal with snow on its back", not as a breed. Sheep at a feeder look a little like snow-covered stones (true to life, but ambiguous).
- **Elm whips are reduced but not gone.** One or two scaffold tips still overshoot in vase-shaped crowns.
- **Hoof prints are correct in form but read as dots** at contact-sheet scale. The trampled ring reads as texture rather than as individual feet.
- **Structures are sparse by design.** 131 of 200 have no named made thing. That is restraint, but the Corner and Courtyard anchors (a picnic table, a low wall, a dumpster) are modest.
- **Silo and water-tower ladders and catwalk gratings** are near the pixel limit at 1600 px.
- **Water towers are slightly over-represented** in this sample (8 against an expected ~5); the share converges over 600 hashes.

## Verdict (round 13)
This is the most varied version of the series. The fence and structure work answers the "most made things are rectangles" critique with real geometry rather than decals, and the silo shadow and breeze-block shadow are new signature images. The Farmyard adds a genuinely different event (animals and feed) rather than swapping props. Before mint, the weak tail should get one more pass, with a rule that a Solitary track must cross the frame's middle third.

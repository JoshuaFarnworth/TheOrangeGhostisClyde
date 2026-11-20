# Sediments: the world timeline (options for Joshua)

Status: **pending Joshua's choice.** The prototype runs Option A as the working default. The era table is data (`src/world.js` → `WORLDS`), so B or C drops in without touching the engine.

## How every option works (shared mechanics)

**One site, many windows.** Every option is one fixed locality, set by the collection and the same for every token, whose story unfolds once. Each token is a different **lateral window** (a different trench face) cut into that same site at the moment of its mint. The token's own hash picks where along the site the window is, so neighbouring windows share the same correlated strata: the same flood beds, ash bands and soils at the same relative depths. Each window still has its own local surface scene and its own local finds. Read together, all tokens tell one history. Read alone, each is one place on one day of it.

**Inputs per mint** (from the mint-history adapter, `[{index, hash, timestamp}]` for 1..N):
- `hash` (the transaction or operation hash) picks that mint's **surface event** within what the current era allows, plus position, size, species and objects. The event produces the layer the mint leaves behind, and later tokens show it buried.
- `timestamp` gaps set **how much world time passes** before the mint, and with it the layer thickness, the dormancy blank beds, decay state and soil formation.
- `index` is a deep-time helper only. Every mint advances the world a little, however fast mints arrive, and it drives the explicit "geological clock" used for diagenesis.

**World progress (nonlinear and explicit).** Each mint advances a progress counter P by

`p_i = 0.05 + 0.7 · ln(1 + gap_i / 8 h)` (gap in real time; p_1 = 0.05)

| real gap before a mint | p (progress units) |
|---|---|
| 1 minute (a burst) | 0.05 |
| 1 hour | 0.13 |
| 1 day | 1.0 |
| 1 week | 2.3 |
| 1 month | 3.2 |
| 6 months | 4.4 |

A piecewise-linear table, the **era table**, then maps P to a world date. Each era has a span of P units and a world-time span, so years per unit differ by era: slow at the opening scene and in the familiar recent past, fast through deep time. This is the "nonlinear scaling", and it's stated, not hidden.

- **Bursts** add many thin, similar layers within a short slice of world time, so they come out as tightly grouped beds of the same kind of event. Within a short gap the site "keeps doing what it was doing" (event persistence; see engine).
- **Dormancy** advances the world centuries to millennia in one step. That gives a thick blank bed and, if the gap is long enough, a buried soil (palaeosol) at its top.
- If minting stops early, the tale stops early. If it runs past the planned budget, the last era is open-ended.

**Thickness vs time.** Real sections preserve less sediment per year over longer intervals, because erosion and pauses remove or skip time. This is the Sadler effect: measured accumulation rates fall as roughly a power of the time span measured [S1]. The engine uses `background thickness = r_era · Δyears^0.6` (exponent chosen for the look and within the range Sadler's compilation implies; approximate, labelled).

---

## Option A (recommended working default): "The Lick", 30,000 years on one floodplain, 28,000 BCE → 2027 → 2200 (speculative tail)

**Locality:** a mid-latitude North American river floodplain beside a salt spring, a "lick" where animals came to the salt. It is modelled on Ohio Valley sites such as Big Bone Lick, Kentucky, where mammoth, mastodon, bison and ground sloth bones accumulated around salt springs [A1]. It's fictional, not a reconstruction of that site.

| Era | World dates | P units (yr/unit) | Characteristic surface events (hash-chosen) → what they leave buried |
|---|---|---|---|
| 0 Prologue: the mammoth summer | 28,000 BCE, ~12 years | 0–25 (0.5) | Herds at the lick (trampled mud, dung), **a death at the lick** (mammoth, mastodon, bison, horse), scavengers (wolf), overbank flood (silt bed), dry spell (mud-crack crust) |
| 1 Late Pleistocene steppe | 28,000 → 12,700 BCE | 25–170 (~105) | Wind-blown loess (pale silt), frost (ice-wedge casts, wedge-shaped infills), outwash flood (sand/gravel), die-offs → **bone beds**, grazing |
| 2 Late Glacial and the end of the megafauna | 12,700 → 9,700 BCE | 170–250 (~37) | First hunters (Clovis about 13,050–12,750 cal BP [A2]): a hearth, a fluted point, a butchered carcass. Megafauna last appear and are gone after ~11,000 BCE [A3]. **Black mat** organic layer during the Younger Dryas (rare) [A4] |
| 3 Archaic forest | 9,700 → 1,000 BCE | 250–410 (~54) | Forest soil, deer, hearths with fire-cracked rock, mussel-shell midden lenses (as on Kentucky's Green River [A5]), a dog burial (rare) |
| 4 Woodland and Mississippian | 1,000 BCE → 1500 CE | 410–520 (~23) | Pottery sherds, storage pits, house postholes, maize (after ~900 CE), a mound fill (rare), a human burial (rare) |
| 5 Farm | 1500 → 1900 CE | 520–640 (~3.3) | Plough zone (a mixed, homogenised topsoil), fence posts → post-pipes, horseshoes, **cut nails then wire nails** (wire nails after ~1890 [A6]), whiteware and bottle glass, livestock deaths (cow, horse, pig), a flood |
| 6 Modern | 1900 → 2027 | 640–800 (~0.8) | The great flood of 1937 (a thick silt bed; the Ohio River's record flood [A7]), coal cinders, drink cans, plastic, a tyre, fence wire, a mailbox post, a dog or a deer |
| 7 Near future (speculative, labelled) | 2027 → open | 800+ (1.0) | Abandoned field, the beaver's return (pond silt), larger floods, plastics persisting, a buried car (rare) |

**Rare and weird (per mint, stated odds):**
- Death at the lick: Prologue 10%, Steppe 4% (mammoth 35% of those).
- Ice-wedge cast: 3% (Steppe).
- Black mat: 25% of Late Glacial mints after 10,900 BCE.
- Human burial: 0.7% (eras 3–4 only; never modern).
- Earthquake sand blow: 0.3% (a liquefaction dike; the New Madrid zone lies downriver [A8]).
- Out-of-place object, a "lost thing" (a coin or a key in a much older layer, pushed down a burrow or root channel): 0.3%. It's honest, because bioturbation really does move small objects downward [G4].

**How it reads deep in late tokens:** at the bottom, pale loess with ice-wedge casts and a bone bed, where the mammoth is a stained skeleton; then the dark black mat; then brown forest soils with hearth lenses; then the plough zone; then a sharp modern flood bed under the turf.

**Coal and oil under A:** 30,000 years is far too short and far too shallow. Real peat-to-lignite needs burial and ~10^5–10^6+ years; the oil window is ~60–120 °C at ~2 km+ and millions of years [G6][G7]. Under A, organics go only as far as **rot halos** (the "cadaver decomposition island", a dark organic stain in the soil [G2]), black mats and peat. The prototype also has an **explicit, labelled geological clock** (diagenesis age = 1,000 × world years + 2,000 years × mints since burial) that can push the oldest organics to "lignite" or "bitumen stain" in a very long run. The trait `Clock: Compressed` marks it so nobody mistakes it for real timing. Joshua can switch this off for strict realism.

**Risks:** "Native American archaeology as decoration" is a real ethical risk in eras 2–4. Mitigation: no sacred objects, no named cultures in traits, burials very rare and never shown as spectacle (a crouched outline in a grave cut, as in an excavation record); ideally, review by someone in that field before release. The total budget (~800 units) needs a few thousand mints at a typical pace, so a short run ends in the Archaic. Everything is mid-continent North American; it isn't universal.

---

## Option B: "Badlands", 68 million years, Hell Creek → K-Pg impact → coal swamps → ice → ranch → 2027

**Locality:** an eastern Montana river floodplain modelled on the Hell Creek Formation and the overlying Fort Union (Tullock) lignites [B1].

| Era | World dates | P units | Surface events → deposits |
|---|---|---|---|
| 0 Prologue: a river in the Maastrichtian | 66.05 Ma, ~10 years | 0–25 | A *Triceratops* or *Edmontosaurus* death on a point bar, crocodiles, a crevasse-splay sand, gar scales |
| 1 Late Cretaceous | 66.05 → 66.0 Ma | 25–300 | Channel sands, floodplain muds, bone beds, leaf litter |
| 2 **The boundary** | 66.0 Ma [B2] | the single mint that crosses P = 300 | The impact layer: a cm-scale clay with iridium [B3], spherules and shocked quartz. A one-of-one token |
| 3 Paleocene coal swamps | 66.0 → 61 Ma | 300–460 | Fern spike, peat → **real lignite seams** (Fort Union coals [B1]), early mammals, champsosaurs |
| 4 The long gap | 61 → 2.6 Ma | 460–500 | Mostly an **erosional unconformity**: in this area much of the Cenozoic record is missing, which is honest. A few mints make the erosion surface |
| 5 Ice | 2.6 Ma → 12,000 BCE | 500–640 | Glacial till with erratics, outwash, mammoth and bison |
| 6 Plains | 12,000 BCE → 1880 | 640–720 | Bison, hunters, stone circles, prairie fire charcoal |
| 7 Ranch | 1880 → 2027 | 720–800 | Barbed-wire fence (patented 1874), homestead, cattle, a fossil-hunting dig, an oil pumpjack (rare) |

**Strengths:** coal is real here, and so is a genuinely spectacular one-time event (the impact layer). It has dinosaurs. **Risks:** dinosaur cliché; the familiar human world is a thin top slice; a 59-Myr unconformity means most mints in era 4 are erosion; "Triceratops in a trench" pulls toward illustration rather than Before the Shovels' quiet.

---

## Option C: "After Us", 2027 → +100,000 years (speculative but literature-grounded)

**Locality:** the Before the Shovels suburb: a cul-de-sac with a mailbox, a bench, a bus stop, picket and chain-link fences.

| Era | World dates | Events → deposits |
|---|---|---|
| 0 Prologue: one winter | 2027, ~5 years | Snow, a parked car, a lost glove, a fox. The Before the Shovels world |
| 1 Abandonment | 2030 → 2200 | Asphalt cracks, saplings, floods over the street, roof collapse rubble |
| 2 Forest over ruins | 2200 → 3000 | Leaf litter, soil over concrete, rust ghosts of cars, glass and ceramic persisting |
| 3 Long quiet | 3000 → 50,000 CE | Soils, river cut-and-fill, plastics as thin films and fragments ("technofossils" [C1]) |
| 4 Next ice | 50,000 → 100,000 CE | Loess and till as the next glaciation arrives (timing delayed by CO₂: modelled at ~50–100+ kyr [C2]) |

**Strengths:** the most original option, and it continues Before the Shovels directly: its familiar objects become the fossils. **Risks:** it's speculative throughout (it must be labelled so); post-apocalyptic cliché; no mammoth; persistence of the materials beyond centuries is extrapolation.

---

## Recommendation

**A** is the recommendation and the working default. It matches Joshua's own mammoth-to-skeleton example. Its later eras put the familiar things (fences, livestock, a mailbox, a drink can) on top of deep time. Everything in it is real geology for a single real kind of site. Its weakness is that coal and oil can't honestly form, so that part runs only on the explicitly labelled compressed clock. **B** is the choice if real coal and a one-of-one impact token matter more than quiet. **C** is the most personal and the boldest.

## Sources
- [S1] Sadler, P.M. (1981) Sediment accumulation rates and the completeness of stratigraphic sections. *J. Geology* 89:569–584. [from knowledge, not re-fetched this session]
- [A1] Big Bone Lick State Historic Site, Kentucky (Pleistocene salt-lick bone accumulation). https://parks.ky.gov/boone/parks/historic/big-bone-lick-state-historic-site [from knowledge, not re-fetched]
- [A2] Waters, M.R. et al. (2020) Clovis chronology refined, ~13,050–12,750 cal BP. *Science Advances* 6:eaaz0455. [from knowledge]
- [A3] Faith, J.T. & Surovell, T.A. (2009) Synchronous extinction of North America's Pleistocene mammals. *PNAS* 106:20641. [from knowledge]
- [A4] Haynes, C.V. (2008) Younger Dryas "black mats" and the Rancholabrean termination in North America. *PNAS* 105:6520. [from knowledge]
- [A5] Archaic shell middens of the Green River, Kentucky (e.g., Indian Knoll). [from knowledge]
- [A6] Nelson, L.H. (1968) *Nail Chronology as an Aid to Dating Old Buildings*. AASLH Technical Leaflet 48. [from knowledge]
- [A7] NWS, Ohio River flood of January 1937. [from knowledge]
- [A8] USGS, New Madrid Seismic Zone, sand blows and liquefaction. [from knowledge]
- [B1] Hell Creek Formation / Fort Union (Tullock) lignites, eastern Montana; USGS coal assessments. [from knowledge]
- [B2] Renne, P.R. et al. (2013) Time scales of critical events around the Cretaceous-Paleogene boundary. *Science* 339:684 (66.04 Ma). [from knowledge]
- [B3] Alvarez, L.W. et al. (1980) Extraterrestrial cause for the Cretaceous-Tertiary extinction. *Science* 208:1095. [from knowledge]
- [C1] Zalasiewicz, J. et al. (2014) The technofossil record of humans. *Anthropocene Review* 1:34. [from knowledge]
- [C2] Ganopolski, A., Winkelmann, R., Schellnhuber, H.J. (2016) Critical insolation–CO₂ relation for diagnosing past and future glacial inception. *Nature* 529:200. [from knowledge]
- [G2] Carter, D.O. & Tibbett, M. (2008) Cadaver decomposition and soil (CDI). In *Soil Analysis in Forensic Taphonomy*. https://www.funeralnatural.net/sites/default/files/articulo/archivo/CarterTibbettCadaverdecompsoil-TaphonomyBook2007.pdf [fetched in search]
- [G4] Bioturbation moving artefacts downward (earthworm burial of objects; Darwin 1881, *The Formation of Vegetable Mould*). [from knowledge]
- [G6] Earle, *Physical Geology* 20.3, oil window 60–120 °C, beyond ~2 km. https://geo.libretexts.org/Bookshelves/Geology/Physical_Geology_(Earle)/20%3A_Geological_Resources/20.03%3A_Fossil_Fuels [search-verified]
- [G7] Widera, M. (Acta Geol. Polonica), peat:lignite compaction 2:1–4:1. https://geojournals.pgi.gov.pl/agp/article/view/24833 [search-verified]

---

## Engine notes (round 2, v2.0; keep in sync with `src/main.js`)
- **Windows:** the site is 40 m wide; each token's trench face is 16 m wide (a wide trench face, so a mammoth fills about a fifth of the width), centred on the site and offset by up to ±3 m by that token's own hash. Deaths fall within ±30% of the window centre, so early tokens all see the opening carcass. Deep tokens zoom out to show more depth (up to 2.5×, about 20 m), with a thin surface band.
- **Deaths are per-year, not per-mint:** a death or burial picked by the hash is kept with probability `clamp(Δyears / 0.3, 0.1, 1)`, otherwise it becomes grazing or a quiet day. The odds in the table above are per-mint ceilings.
- **Carcass pose:** at the lick, 55% of Prologue deaths and 30% of Steppe and Late Glacial deaths are **mired** (sunk to the belly in spring mud, as at mire and sinkhole sites); the rest die lying down (sternal). Parts above the mud lose support and fall as decay advances; parts held in mud stay articulated and upright.
- **Scours:** 7% of floods cut a small scour-and-fill channel (not in the Prologue mire). Carcasses are only removed by cuts deeper than their base; shallower cuts mark them reworked.
- **Pacing (round 2 change, stated):** a dormancy term `0.5·(gap/day)^0.9` was added to the clock, the background bed became linear in years, and the Prologue mire accretes 0.3 m/yr. Token 20 in the steady run now has its mammoth buried about 0.65 m deep (skeletonising, partly exposed). A 122-day pause leaves a 3.1 m blank loess bed.
- **Measured dates (steady run, 2,000 mints over 122 days; no pause over half a day, so the dormancy term doesn't apply):** token 1 is 28,000 BCE and token 20 is 27,999 BCE. Token 200 is about 27,250 BCE, token 1,000 about 13,600 BCE and token 2,000 about 5,850 BCE (Archaic). At token 900 the same hashes give 15,244 BCE (steady), 20,717 BCE (bursty timing) and 11,114 BCE (dormant timing).

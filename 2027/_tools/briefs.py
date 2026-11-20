# Source of truth for PLAN.md and per-project READMEs. Run: python3 _tools/briefs.py
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DELIV=("Default: a small number of hand-selected exact-preview works, each delivered as (a) a hi-res still, "
 "(b) a seed-locked runnable HTML file that reproduces the still exactly, (c) a source-version record "
 "(source hash + seed + render resolution). Open generative minting is a separate option, decided later. "
 "Prints only after a real paper proof has been made and approved.")
ED=("Edition size, price and venue: OPEN / TBD. Reason: there is no collector evidence yet for this new "
 "work; market-wide medians and established artists' sales are deliberately not used as a basis. "
 "Decide after the selected-works round shows whether anyone responds.")
VENUE_EV=("Evidence (honest labels): [venue fact] Aleatory showed ~454 mints / ~2,022 tez across ~110 generators "
 "in a 30-day window and ~25 mints in a 7-day window (market.md, snapshot, not re-checked) -- a small, thin venue; "
 "this is evidence about the venue only, NOT a pricing basis. [assumption] Collectors who respond to quiet "
 "photographic/observational work are the likeliest audience. [unknown] No collector of this artist has "
 "expressed interest in this subject.")
S=[
dict(m="01",slug="before-the-shovels",title="Before the Shovels",status="Existing - developed (v2). Not modified for 2027 plan.",
 art="Footprints, tyre ruts and sled lines in fresh snow, read from above before anyone clears it.",
 thesis="A snowfall records the morning's comings and goings until the shovels erase it.",
 sentence="A morning's worth of people crossing fresh snow, seen from above, just before it is cleared.",
 paths=["/workspace/clyde/v2/before-the-shovels","/workspace/clyde/series/before-the-shovels"]),
dict(m="02",slug="tidelines",title="Tidelines",status="Round 5",grade="promising",
 art="A single sheet of paper - a napkin, graph pad, kraft bag, sketchbook - carrying the rings left by a cup set down and picked up a few times. The rings are the record of a conversation's pauses.",
 thesis="The rings a cup leaves are a diary of how long someone sat.",
 sentence="The faint brown rings a drink leaves on paper each time it is put down, which together show how long someone stayed.",
 rule="Each visit, liquid wets a ring under the vessel's foot; wetting spreads through the paper by capillary wicking with fibre-scale permeability and tilt; while it dries, solute is carried outward to the evaporating edge and deposited (the coffee-ring effect); stain darkness follows Beer-Lambert absorbance of the deposited solute. Visits overlap and later rings partly redissolve earlier ones.",
 comp="Top-down sheet, mostly empty paper; rings sit off-centre where a hand would rest. Material: paper grain and fibre, translucent tea/coffee/wine deposits. Motion: none - the time is in the overlapping rings.",
 var="Number of visits (once vs many = brief vs long stay); vessel (mug, wine glass stem, tumbler); incidents (slid, drip, spoon set down) imply small events; liquid changes the deposit physics, not just colour; paper changes how far it wicks.",
 prior="Coffee-ring physics (Deegan et al. 1997) and stain photography / 'coffee ring' art; generic coffee-stain brushes. Difference: the rings are simulated from wicking and evaporation per visit, and the series is about duration of stay, not decoration.",
 restraint="One sheet, one vessel, at most a handful of visits; no text, no props in frame.",
 refs="Deegan et al., Nature 1997 (capillary flow, ring deposit); real photos of tea/coffee/wine rings on napkin, kraft, graph paper (shoot own reference set); paper chromatography tidelines.",
 traits="Liquid, Paper, Visits, Vessel, Incident",
 crit="R5: tighter crop around the marks so a single visit fills the frame; rings are slightly oval and wobble, less perfectly circular. Remaining: some rings still fairly round; water stains stay faint (honest); napkin feathering still modest.",
 risk="Coffee rings are a familiar visual cliche; it must read as time and company, not a stain texture pack.",
 heroes=["hero-04.png","hero-05.png","hero-11.png"]),
dict(m="03",slug="unfaded",title="Unfaded",status="Round 5",grade="promising",
 art="An empty room's floor, bleached by years of sun through one window, with darker unfaded shapes where furniture stood. The occupants have moved out; the floor remembers the layout.",
 thesis="Sunlight keeps a record of where we put our things.",
 sentence="The darker patches left on a sun-faded floor where furniture used to be, after someone has moved out.",
 rule="Integrate solar exposure over the years lived in: sun position from latitude/declination/hour angle, the window aperture and reveal projected onto the floor, furniture blocking light as shadow hulls, plus a diffuse sky term; accumulated dose drives a photochemical fade of the wood/carpet. Today's sun patch is drawn on top.",
 comp="Top-down floor plan of a room, window wall at one edge; the ghosts are quiet rectangles; one warm sun patch. Material: boards, carpet, lino with grain and gaps. Motion: none - years compressed into dose.",
 var="Years lived in (depth of ghost), facing direction (where sun lands), furniture layout and whether it was ever rearranged (double ghosts = a life change), today's time of day.",
 prior="Photography of furniture ghosts on faded floors/walls after moves; sun-path diagrams. Difference: the fade is computed from a real sun path and an imagined household, so the layout is a reconstructed life.",
 restraint="Empty room, no objects, one window, muted wood palette.",
 refs="Photos of 'ghost' marks under rugs and furniture on oak/pine floors; NOAA solar position algorithm; wood photodegradation (lignin yellowing/greying).",
 traits="Floor, Facing, Lived In, Window, Today, Furniture, Pieces",
 crit="R5: more board-to-board colour and slightly wobbly gaps; fallback hour so today's sun patch is more often in the room; carpet contrast and pile improved but carpet cells are still the weak ones. Remaining: boards can still look a bit CG; carpet ghosts and sun patches stay soft.",
 risk="Shares the 'ghost of what was there' idea with Dry Where It Stood; floor texture realism is the ceiling on quality.",
 heroes=["hero-01.png","hero-06.png","hero-10.png"]),
dict(m="04",slug="twenty-nanometres",title="Twenty Nanometres",status="Existing - being revised separately; folder not touched.",grade="existing",
 art="(Brief held by the separate revision; not edited here.)",thesis="(See the separate revision.)",sentence="(See the separate revision.)",
 paths=["/workspace/clyde/series/twenty-nanometres (not touched)"]),
dict(m="05",slug="mown",title="Mown",status="Round 3",grade="promising",
 art="A suburban lawn seen from above on the day it was mowed: the stripes of the mower's passes, the places it went around, and the small traces of a household - a missed strip, a goalmouth worn bare, where the paddling pool stood.",
 thesis="A lawn is a record of a weekend chore and of the family that uses it.",
 sentence="A lawn from above, showing the lines someone mowed and the worn or yellowed spots their family left.",
 rule="A mowing plan (stripes, spiral, wandering) sets a blade lean field; stripes come from light reflecting off blades leaning toward or away from the viewer; things that stood on the grass cause etiolation (yellowing), dogs leave urine-scorch rings, and footfall flattens paths.",
 comp="Top-down lawn, border or patio edge, one obstacle (tree, bed). Material: grass blades and soil. Motion: implied by mower direction only.",
 var="Mowing pattern (care vs haste), time since mown, and the trace (pool, dog, lounger, goalmouth) which implies who lives there.",
 prior="Drone photography of lawn stripes, groundskeeping patterns. Difference: the stripes are a side character; the household traces are the subject.",
 restraint="One lawn, one obstacle, one trace.",
 refs="Aerial photos of striped lawns; turf etiolation after a pool is removed; dog urine spots.",
 traits="Mowing, Mown, Light, Trace, Obstacle, Edge",
 crit="R1: saturated, binary stripes. R2: softer lean but still a CG shader lawn; dew a grey veil; near-blank overcast cells. R3: the tree is a canopy from above, not a brown disc; dew is a cool sheen with a readable shoe trail (hero-01); dog spots have scorch centres and nitrogen rings (hero-08); the paddling-pool patch is etiolated grass, not a yellow sticker (hero-11); lounger and chair marks are flattened grass; stripe contrast is photographic rather than graphic; sweep of 24 at 200 px, 0 content fails. Still weak: the canopy is a bit 'broccoli'; patio pavers are still quite regular; the goalmouth reads more as a dirt stain than a play area; planting in the border is still closer to a texture than a bed; grass at 1600 px is soft grain rather than blades.",
 risk="Could still read as a synthetic grass texture at a glance, especially the border and the tree crown.",
 heroes=["hero-01.png","hero-08.png","hero-11.png"]),
dict(m="06",slug="dry-where-it-stood",title="Dry Where It Stood",status="Round 5",grade="promising",
 art="A wet car park after rain, with pale dry rectangles where cars were parked through the shower and have just left. At night, a sodium lamp catches the wet asphalt.",
 thesis="Rain marks who stayed and who has gone.",
 sentence="The dry shapes cars leave on wet tarmac when they drive away after the rain.",
 rule="Rain falls at a slant; each parked car casts a rain shadow swept along the slant; when a car leaves, its dry footprint begins to wet and dry at a mottled rate; depressions pool into puddles; wet surfaces reflect sky/lamps by Fresnel (~2% at normal incidence) with mirror points for lamps; oil drips mark engine ends.",
 comp="Top-down bays with painted lines and wheel stops; 1-4 ghosts; lots of dark asphalt. Material: aggregate, paint, water film, oil. Motion: minutes since departure encoded in ghost sharpness.",
 var="Time since the rain stopped and since each car left (sharp vs fading ghosts), how many left, layout, a car that left during the rain (half-wet ghost), lamp vs day.",
 prior="Photographs of dry car silhouettes on wet roads (a common phone-photo subject). Difference: a simulated, readable timeline of departures in one lot.",
 restraint="Mostly empty asphalt; no cars present; palette of greys and one lamp colour.",
 refs="Photos of dry patches under departed cars; asphalt wet/dry albedo; road-surface Fresnel.",
 traits="Since The Rain, Hour, Departed, Layout, Lines, Incident, Left During The Rain",
 crit="R5: drying cells keep a residual pale ghost so the footprint still reads after the film has gone; lamp glints are tighter (less smear); bay paint is more worn. Remaining: some quiet overcast cells; lines can still dominate; night wet mottling can look cloudy.",
 risk="The image of a dry car outline is familiar from photos; the series has to earn itself through multi-car timelines.",
 heroes=["hero-01.png","hero-03.png","hero-04.png"]),
dict(m="07",slug="poolside",title="Poolside",status="Round 4",grade="promising",
 art="A pool deck in hot sun minutes after someone got out: the wet print of a body on the warm stone, footprints to the edge, and the light on the water.",
 thesis="Heat erases a person in minutes.",
 sentence="The wet outline someone leaves on a hot pool deck, drying while you look.",
 rule="Wet marks (body, feet, drips) evaporate on a per-material clock driven by sun and stone heat; caustics on the pool floor from forward photon splatting through a wavy surface with water-column absorption.",
 comp="Top-down deck with a strip of pool at top or bottom; lounger or umbrella off to one side. Material: travertine/concrete/tile, water. Motion: minutes since the person got up.",
 var="Story (swam, lay on deck, sat on edge), minutes since, sun, shade.",
 prior="Hockney pool paintings; caustic shaders. Difference: the subject is the evaporating person, not the water.",
 restraint="One person's traces, no figures.",
 refs="Photos of wet body prints on decks; caustic photography; travertine textures.",
 traits="Story, Since, Sun, Deck, Shade",
 crit="R3 hero-09 was the best improvement; water was still a flat teal tile block and footprints did not clearly show heel/toe drying. R4: the water is a more muted pool colour, paler at the wall and deeper further out, with slightly irregular, varied tiles instead of a hard grid (hero-09); within each print the toes carry less water and dry first, so a half-dry step can be a heel and ball only. Sweep of 24 at 200 px, 0 content fails. Still weak: the pool can still read as a tiled illustration; some prints remain blobby; the lounger is still CG slats; quiet 'Sat On The Edge' and 'Gone Inside' cells; the coping is still a light band.",
 risk="Hockney and backyard-pool photography still sit close; the water has to keep moving away from poster cyan.",
 heroes=["hero-01.png","hero-09.png","hero-05.png"]),
dict(m="08",slug="creases",title="Creases",status="Round 1",grade="promising",
 art="A letter that has been folded, carried, reread and once crumpled, lying flat under raking light; the handwriting just shows through.",
 thesis="How a letter is folded shows how often it was read.",
 sentence="A kept letter whose folds and wear show how many times it was opened.",
 rule="Fold history (tri-fold, refolded wrong, crumple) builds a relief height-field; handling softens and greys creases; raking light shades the relief; handwriting from an oscillation pen model shows through the paper.",
 comp="One sheet on a dark surface, centred. Material: laid, airmail, lined paper. Motion: none.",
 var="Fold history and handling imply a relationship (carried for years vs read once).",
 prior="Crease-pattern origami art, crumpled-paper photography. Difference: the folds are the life of one letter.",
 restraint="One sheet, illegible text, single light.",
 refs="Raking light photos of folded letters; archival paper wear.",
 traits="Paper, Folds, Handled, Crumpled",
 crit="R1 only: relief too soft, creases need crisp lines; hero-02 is close to blank.",
 risk="Very quiet - may be too subtle to read on screen.",
 heroes=["hero-01.png","hero-02.png"]),
dict(m="09",slug="wrack-line",title="Wrack Line",status="Round 5",grade="promising",
 art="The upper beach after the tide has turned: lines of weed and foam left by successive waves, the highest one from hours ago.",
 thesis="The sea writes the last few hours on the sand.",
 sentence="The lines of seaweed and foam each wave leaves on a beach as the tide goes out.",
 rule="Swash run-up from Rayleigh-distributed wave heights on a tide curve; each run-up leaves a mark; beach cusps; later marks overwrite earlier ones.",
 comp="Top-down sand band with sea at one edge. Material: wet/dry sand, weed, foam. Motion: tide direction.",
 var="Tide state, sea state, what was left behind, light, how many marks survived.",
 prior="Aerial beach photography. Difference: the marks are a readable tide record.",
 restraint="Sand and a few lines.",
 refs="Aerial photos of wrack lines and swash marks; swash run-up literature.",
 traits="Tide, Sea, Left Behind, Light, Marks Kept",
 crit="R5: varied crops (not always three equal bands); swash marks now read as a tide record; cusp lobes visible. Remaining: wind ripples still a bit regular; some water edges muddy; foam can flake; walker prints and some objects are a little graphic or easy to miss.",
 risk="Could look like a diagram rather than a beach.",
 heroes=["hero-02.png","hero-07.png","hero-10.png"]),
dict(m="10",slug="persistence",title="Persistence",status="Round 5",grade="promising",
 art="A patch of sky over a roofline or wires, with one or a few contrails slowly spreading - the year's one series looking up instead of down.",
 thesis="Strangers' journeys linger overhead only if the air is right.",
 sentence="The trails planes leave in the sky, which stay or vanish depending on the air.",
 rule="Contrail persistence from ice supersaturation; width grows with sqrt(age) plus wind shear; Crow instability breaks old trails into puffs; gnomonic sky projection.",
 comp="Sky gradient, foreground edge (roof, wires). Material: air, ice. Motion: age of trails.",
 var="Air humidity (gone vs spreading), traffic, hour.",
 prior="Contrail photography. Difference: the number and age of trails show the traffic of a morning.",
 restraint="Mostly empty sky.",
 refs="Contrail photos; Schmidt-Appleman criterion; Crow instability.",
 traits="Hour, Air, Traffic, Edge",
 crit="R5: dry air now leaves visible short stubs; persistent trails no longer hard-cut mid-frame; Crow is a puff/meander, not a comb; roof is a soffit and gutter, not a black wedge. Sweep 24/24, 6 fails: quiet open-sky cells with a soft trail trip the 0.02 floor (marks still visible; not gamed). Remaining: some trails still a little snaky; soffit can read as a flat panel; dry stubs a bit like clean chalk marks.",
 risk="Can look like a sky gradient with a line - may be too thin a picture.",
 heroes=["hero-01.png","hero-05.png","hero-11.png"]),
dict(m="11",slug="fore-edge",title="Fore-edge",status="Round 5",grade="promising",
 art="A stack of books seen edge-on, their page edges darkened where thumbs have opened them most - the cookbook's favourite recipe, the dictionary's common letters.",
 thesis="The edge of a book shows which pages we needed.",
 sentence="The grubby bands on a book's page edges where it has been opened most often.",
 rule="Per-book use distributions (recipes, letters, chapters) accumulate thumb grime and splay on the fore-edge; spills leave a dashed stain across pages.",
 comp="Side-on stack against a wall. Material: paper edges, cloth bindings. Motion: none.",
 var="Which books, how used, a spill.",
 prior="Fore-edge painting; book photography. Difference: the wear is the record of use.",
 restraint="A few books.",
 refs="Photos of worn cookbook and dictionary fore-edges.",
 traits="Stack, Most Used, Books, Spill",
 crit="R5: tight crop; use bands, fall-open gaps and spills read at thumbnail. Remaining: dictionary dirt can bloom; thumb-index tabs are still a bit oval/graphic; quiet cells and cloth boards are a little flat; stacks still share a horizontal composition.",
 risk="Subtle and small in frame.",
 heroes=["hero-01.png","hero-04.png","hero-05.png"]),
dict(m="12",slug="fogged",title="Fogged",status="Round 1",grade="promising",
 art="A steamed-up bus or kitchen window at night, with the blurred lights outside showing through a peephole someone wiped and the drops running down.",
 thesis="A wiped window is the trace of someone who wanted to see out.",
 sentence="A misted window at night with a patch someone wiped to look out.",
 rule="Breath-figure condensation: droplet nucleation, growth, coalescence, renucleation, sliding runs; a wipe resets the area; drops act as lenses on the out-of-focus lights; fog veil.",
 comp="Window filling the frame; lights band; one wipe. Material: glass, water. Motion: runs.",
 var="Window type, trace (peephole, wipe, finger mark), fog thickness, runs.",
 prior="'Heartfelt' Shadertoy (BigWIngs) rain-on-glass shader. Difference: condensation physics and a human wipe as subject.",
 restraint="One wipe, few colours.",
 refs="Photos of fogged windows; breath-figure literature.",
 traits="Window, Trace, Fog, Runs",
 crit="R1: atmospheric; drops read as dark rings at low res; fog speckle; at 1600 'Streaming' grows into a forest of trails and the peephole is lost - needs work.",
 risk="Closest to a stock shader demo of all; must lean on the wipe.",
 heroes=["hero-02.png","hero-07.png"]),
dict(n="13",m="03",slug="measured",title="Measured",status="Round 1",grade="promising",
 art="The edge of a kitchen door frame where a family pencilled their children's heights on birthdays, initials and ages beside each line, some years missed, sometimes painted over or carefully painted around.",
 thesis="A door frame is the only place a family's growing up is drawn to scale.",
 sentence="Pencil lines on a door frame where parents marked how tall their children were each birthday.",
 rule="Each child grows along the Preece-Baines (1978) model-1 curve with individual adult height and pubertal-spurt timing; a parent marks most birthdays (skips more often after age 10) with a slightly tilted line from the opening edge plus initials and age in one consistent hand (cursive-like strokes, Chaikin-smoothed); implements drift (pencil, biro, marker); a repaint either buries the older marks under a coat or leaves a yellowed unpainted patch around them.",
 comp="Tall 1:2 crop of wall, moulded architrave and the dark doorway beyond; marks cluster in bands where siblings were the same height. Material: emulsion, gloss paint with brush streaks, graphite catching on the paint's tooth. Motion: none, years stacked by height.",
 var="Number of children and spacing; who stopped being measured early; years skipped; repainting (over vs around = whether the family cared to keep it); a parent's own mark as reference.",
 prior="Photos and pinterest-style 'growth chart' door frames; commercial printed growth-chart rulers. Difference: the heights come from a real growth model per child, so the spacing of lines is the shape of childhood.",
 restraint="One frame, pencil only most of the time, no names legible, no props.",
 refs="Preece & Baines 1978 (Annals of Human Biology); CDC/WHO stature-for-age charts to sanity-check heights; photos of real kitchen door-frame growth marks (shoot own set).",
 traits="Children, First Mark, Last Mark, Grown, Lines, Paint, Also",
 crit="R1: reads as a growth chart at contact-sheet size after reframing to a tall crop. Weak: architrave moulding still looks CG-flat; the 'Painted Around' patch is too subtle to read; handwriting is plausible but repetitive; lots of plain wall.",
 risk="Sentimental subject; the image risks being a diagram of heights unless the paint and hand feel lived-in.",
 heroes=["hero-03.png","hero-07.png","hero-11.png"]),
dict(n="14",m="12",slug="splashback",title="Splashback",status="Round 1",grade="promising",
 art="The tiles behind a domestic hob between wipes: a fan of amber oil specks rising from the burners someone always uses, with the cleared arcs of the last wipe.",
 thesis="The wall behind the cooker keeps a record of which ring a household reaches for.",
 sentence="Tiny oil splashes on the kitchen tiles behind a stove, thickest above the ring that gets used most.",
 rule="Cooking sessions drawn from household habit (favourite burner, dish); each session ejects droplets with log-normal diameters and 0.8-3.2 m/s speeds at random elevations from the pan rim; drops fly ballistically (small drag) to the wall plane, so spatter forms a parabolic fan whose height depends on the pan's distance from the wall; landed drops spread with darker rims, oxidise toward amber with age and hold dust; grout soaks oil; the last wipe (overlapping cloth arcs from an elbow pivot) removes older oil inside its strokes and leaves a faint smear.",
 comp="Front-on tiles (metro, square, handmade, glass), the hob's dark back edge along the bottom. Material: glaze, grout, oil film. Motion: implied by fan shape.",
 var="Which ring, what is cooked (fry-ups vs stir-fry vs sauces), time since wiped, a sauce that spat.",
 prior="Forensic blood-spatter analysis imagery; kitchen cleaning photos. Difference: the trajectories are flown, so the fan is a fingerprint of a cooking habit.",
 restraint="No pans, no hob detail; one wall.",
 refs="Droplet ejection from frying oil (studies of oil splatter size/velocity); photos of real splashbacks after one week/one month (shoot own).",
 traits="Tiles, Cooking, Since Wiped, Favourite Ring, Incident",
 crit="R1: believable at hero size, subtle at thumbnail. Weak: 'Wiped Yesterday' outputs are thin; sauce colour still a little pink; the tile grid is the dominant shape in sparse outputs; slow (~20 s headless at 1500 px, 2-3 s in Chrome).",
 risk="Can read as a dirty-tile texture rather than a portrait of a household.",
 heroes=["hero-03.png","hero-10.png","hero-11.png"]),
dict(n="15",m="09",slug="oche",title="Oche",status="Round 4",grade="promising",
 art="A close crop of a pub dartboard with the darts put away: the bed of treble twenty chewed pale by thousands of throws, fresh slit holes around it, the wire spider casting small shadows.",
 thesis="The holes in a dartboard are a census of the people who throw at it.",
 sentence="A worn dartboard, close up, showing where people's darts have landed over the years.",
 rule="Regulation board geometry and number order; players drawn with a skill (2-D Gaussian spread 8-50 mm, after Tibshirani, Price & Taylor 2011) and a habit (good players on T20, fall back to T19, finish on D16/D20; beginners aim at the bull); recent throws leave slit holes, older ones are closed by the sisal and only show as frayed paler fibre; a board that has been turned carries an old wear patch under a different number; the camera frames where the recent holes are.",
 comp="Tight crop on the worn bed; segments, wire and numerals as context. Material: sisal end grain, painted segments, galvanised wire. Motion: none.",
 var="Who throws (alone, a pair, league night, beginners), board age, turned or not, skill -> where the wear sits and how tight it is.",
 prior="Stock dartboard photography; heat-map visualisations of dart throws. Difference: throws simulated from skill and strategy and shown as physical damage, not a chart.",
 restraint="No darts, no chalkboard, crop away the icon.",
 refs="Tibshirani, Price & Taylor (2011), 'A statistician plays darts', JRSS A; photos of used bristle boards (shoot own).",
 traits="Throwers, Board, Turned, Best Thrower, Misses",
 crit="R3 punctures were seed/rice stamps and the sunburst still swamped the trace. R4: recent holes are tiny dark slits, not capsules; older throws only add a pale, fuzzy worn patch and a field of closed pores (hero-03); colours are further muted; wires are duller metal with a drop shadow, sitting on the sisal rather than drawn through it. Sweep of 24 at 200 px, 0 content fails. Still weak: the sector sunburst is still the first thing you see at thumbnail; wires, though darker, can still read as graphic lines; sisal is fine noise rather than fibre bundles; League Night cells still gather in the same bed.",
 risk="A dartboard is a strong ready-made graphic; the trace can be swamped by the object.",
 heroes=["hero-01.png","hero-03.png","hero-05.png"]),
dict(n="16",m="05",slug="board",title="Board",status="Round 3",grade="promising",
 art="A wooden chopping board seen close, washed and put back: a field of fine knife cuts gathered where one cook stands and chops.",
 thesis="A chopping board remembers where your hand goes.",
 sentence="The fine knife scratches on a chopping board, thickest where the cook always works.",
 rule="Cooks with handedness, stance and repertoire; rocking chops leave short cuts perpendicular to the counter near the hand, bread leaves long shallow saw lines, jointing a few deep diagonals; each cut is a groove (dark settled juice) with a pale crushed lip; visibility depends on the cut's angle to the window's raking light; age softens old cuts; stains wick along the grain.",
 comp="Close crop of the working zone, sometimes an edge or hanging hole. Material: long-grain beech/oak/maple/walnut/bamboo strips. Motion: none.",
 var="One cook vs a busy kitchen (overlapping zones and angles), left-handedness (tilt), years, stains.",
 prior="Product/lifestyle photos of chopping boards. Difference: the cut field is generated from stance and technique.",
 restraint="No food or knife.",
 refs="Photos of used boards under raking light (shoot own); end-grain vs long-grain wear.",
 traits="Wood, Used, Cooks, Left-Handed, Stain, Board",
 crit="R1: weak — cuts vanished at thumbnail and looked like pencil hatching; grain was ruled paper. R3: the working zone reads at contact-sheet size as the place someone stands to cut (hero-04, hero-07); individual cuts at the edges have a dark groove and a pale lip; grain is warped rather than ruled; stains and hanging holes still vary the set. Sweep of 24 at 200 px, 0 content fails. Still weak: dense centres still look like grey scribble more than incised wood; maple especially is a bit CG-smooth; the lip/groove contrast is better but not yet a convincing V-cut in timber.",
 risk="The working zone can still read as hatching rather than a used board; wood realism is the ceiling.",
 heroes=["hero-03.png","hero-04.png","hero-07.png"]),
dict(n="17",m="02",slug="evenings",title="Evenings",status="Round 3",grade="promising",
 art="The neck and shoulder of an empty wine bottle that has held a candle for a long time, coated in layered runs of wax in the colours of whatever candles were in the drawer, the last candle burnt down.",
 thesis="A candle bottle is a tally of dinners.",
 sentence="Layers of old candle wax that have run down a wine bottle over many evenings.",
 rule="Each evening burns a candle colour from the household's drawer; overflow drips (more on the draught side) of Pareto-distributed volume run down the real bottle profile on an unwrapped angle-height grid, steered into channels toward thinner wax, spreading and slowing on the shoulder, freezing when their heat is spent (run length ~ sqrt(volume)), ending in a bead; later drips coat earlier ones; rendered as translucent wax over dark glass, lit by one lamp.",
 comp="Portrait crop of neck and shoulder against a dim room. Material: paraffin, green/amber glass. Motion: frozen runs.",
 var="Palette habit (always white, Christmas red, whatever was in the drawer, two colours), how many evenings, draught strength, place.",
 prior="Chianti-bottle candle holders (a restaurant cliché in real life); wax-drip photography. Difference: the accumulation is simulated drip by drip so the coat is a count.",
 restraint="No flame, one bottle, the rest dark.",
 refs="Photos of real long-used candle bottles (shoot own); molten-wax rivulet freezing (solidifying rivulet literature).",
 traits="Candles, Evenings, Drips, Place, Draught",
 crit="R1: wax was a mottled camouflage crust; the stub looked like a cork; horizontal striping. R3: deposits now have height as well as width, so drips read as rounded rivulets that end in a bead and stack in layers (hero-01, hero-05); a single long run can carry the picture (hero-02). Sweep of 24 at 200 px, 0 content fails. Still weak: the stub can still look like a short cut plug with a jagged rim; some long body drips are a bit too smooth and ribbon-like; a faint horizontal banding still shows under thin wax on the neck; Years-of-mixed-colours can tip into trattoria kitsch; Years renders are slow (~40 s headless).",
 risk="Kitsch. It must feel like one household's winters, not a trattoria prop.",
 heroes=["hero-01.png","hero-02.png","hero-05.png"]),
dict(n="18",m="04",slug="smudge",title="Smudge",status="Round 1",grade="promising",
 art="A phone face up on a table with its screen off; in the reflection of a window the glass shows the owner's thumb: the unlock pattern, the typing, the scrolling arcs.",
 thesis="A dark screen is a private diary written in skin oil.",
 sentence="Fingerprint smears on a switched-off phone screen that show how its owner unlocks and uses it.",
 rule="Contacts on a 71 x 147 mm screen over hours or days: swipe-up unlocks plus a 3x3 pattern or PIN taps; typing taps on QWERTY keys in proportion to English letter frequency; thumb flicks as arcs pivoting about the base of the thumb on the holding side; pinches for maps; each contact transfers oil with fingerprint ridges (~0.45 mm), saturating with repeated contact; on black glass oil scatters a raking light and dulls the window reflection; a sleeve wipe clears a band.",
 comp="Top-down phone filling the frame on oak, linen or walnut; one skewed window reflection. Material: glass, oil film. Motion: implied by swipe arcs.",
 var="Unlock method (a pattern literally leaks), handedness, habit (scrolling/messaging/maps/game), time since wiped.",
 prior="Aviv et al. 2010 'Smudge attacks on smartphone touch screens' (USENIX WOOT); forensic photos. Difference: an intimate portrait rather than a security demo.",
 restraint="Screen off, no UI, one reflection.",
 refs="Aviv, Gibson, Mossop, Blaze, Smith (2010); photos of own phone under raking light.",
 traits="Hand, Unlock, Mostly, Last Wiped, Surface",
 crit="R1: unlock patterns and keyboard zone read. Weak: the window reflection is a flat grey box that dominates; tap blobs are soft discs; ridge texture only visible at hero size; slow headless (~20 s).",
 risk="Privacy/'hacker' reading could overpower the tender one.",
 heroes=["hero-01.png","hero-09.png"]),
dict(n="19",m="08",slug="ground-floor",title="Ground Floor",status="Round 1",grade="promising",
 art="The brushed-steel button panel of a lift: the ground-floor button polished smooth with its number half rubbed out, the close-door button worn by impatience, a floor nobody visits still looking new.",
 thesis="A lift panel counts the building's comings and goings.",
 sentence="Lift buttons worn by years of fingers, most on the floors people actually go to.",
 rule="A building (flats, offices, hotel, car park) with floors and occupancy; trips simulated over years (everyone returns to G, residents ride to their own floors in proportion to occupancy, vacant floors almost never, close-door pressed by the impatient); wear = 1 - exp(-presses); wear removes engraving infill from the contact centre outward, polishes the brushed grain toward a mirror, and leaves an oil ring.",
 comp="Front-on panel, one or two columns of buttons, open/close and alarm below. Material: brushed stainless, black infill, braille. Motion: none.",
 var="Building type, number of floors, a vacant floor, the canteen or pool floor, years in service.",
 prior="Photos of worn lift buttons (a known internet curiosity). Difference: wear computed from a building's simulated traffic.",
 restraint="No signage, no LEDs.",
 refs="Photos of worn elevator panels (shoot own); stainless brushed finish references.",
 traits="Building, Floors, Years, Note, Close Door, Basement",
 crit="R1: reads instantly as a lift panel. Weak: the steel reflection is blotchy and too contrasty; wear differences between buttons are too subtle at thumbnail size; the glyphs are simple stroke numerals, not engraved type.",
 risk="An object portrait more than a trace; it may feel like product rendering.",
 heroes=["hero-06.png","hero-10.png"]),
dict(n="20",m="06",slug="hollowed",title="Hollowed",status="Round 4",grade="promising",
 art="Old stone steps from above, each tread dished by centuries of feet, deepest toward the handrail side and just behind the rounded nosing; lichen in the corners where nobody steps.",
 thesis="Stone keeps the average of everyone who climbed it.",
 sentence="Stone steps worn into shallow dips by centuries of people walking up and down.",
 rule="Footfalls sampled over decades to centuries: keep-to-the-rail or two-lane flows; climbing places the ball of the foot 6-12 cm behind the nosing, descending lands the heel further back and rolls the toe over the edge; wear is Archard-like (load x slip) through an elongated footprint kernel; dirt and lichen where wear is lowest; low raking light.",
 comp="Three treads seen from downhill and slightly to one side, so both the lit treads and the shadowed risers show. Material: sandstone, limestone, granite, slate. Motion: none.",
 var="Handrail side, traffic direction, stone hardness, centuries.",
 prior="Photographs of worn steps (Wells Cathedral chapter-house stairs are the famous example). Difference: wear simulated from footfall behaviour.",
 restraint="No people, no architecture beyond the steps.",
 refs="Wells Cathedral chapter house steps (photos); Archard wear law; studies of stair wear in heritage buildings (e.g. Campbell / Thompson on archaeology of stair wear).",
 traits="Stone, Worn, Handrail, Traffic, Deepest Dish",
 crit="R3 was graded promising but the review was right: hero-02 still read as flat grey bars with a wavy line. R4: rebuilt the camera (from downhill, slight yaw, mid elevation) and the step geometry (risers under the nosing, rounded worn nosing, raking light). Dishes now read at contact-sheet size as scooped hollows, offset toward the handrail (hero-04, hero-11) or centred when there is none (hero-03). Sweep of 24 at 200 px, 0 content fails (median detail 0.236). Still weak: silhouette edges can be slightly jagged; the flight still floats in a dark void rather than sitting in a building; limestone dishes can look a bit airbrushed; some sandstone bedding is still stripy; nosing rounding is subtle at this angle.",
 risk="If the camera is too high the dishes flatten into bars again; too low and the treads vanish.",
 heroes=["hero-03.png","hero-04.png","hero-11.png"]),
dict(n="21",m="07",slug="scoured",title="Scoured",status="Round 1",grade="promising",
 art="Looking down into a stainless kitchen sink under the ceiling light: years of scrubbing scratches, invisible until they catch the light, gather into faint rings around its reflection.",
 thesis="The light finds the years of washing up.",
 sentence="The fine scratches in an old steel sink that only show up as rings around a light's reflection.",
 rule="Scratches generated from use (scouring circles where pans are washed, short strokes round the drain, long cutlery drags); each scratch segment glints only where it is perpendicular to the line to the lamp's mirror image (thin-cylinder reflection), so a random field resolves into arcs centred on the highlight; brightness falls off away from it.",
 comp="Top-down basin with rolled rim and drain; one lamp reflection. Material: brushed stainless. Motion: none.",
 var="Years, scourer (cloth, green pad, steel wool), what is washed, light colour and position.",
 prior="The well-known radial-scratch halo on brushed metal; star-trail photography (visual risk). Difference: scratches from a household's washing habits.",
 restraint="Empty sink, no water, no dishes.",
 refs="Anisotropic reflection of scratched surfaces (e.g. Raymond et al. 'Scratch rendering'); photos of own sink.",
 traits="Used, Scourer, In The Sink, Drain, Light",
 crit="R1: the physical halo works. Weak: at hero size it can look like star-trail photography; rim bands look CG; outputs look similar to each other.",
 risk="Close to a well-known shader effect.",
 heroes=["hero-03.png","hero-09.png"]),
dict(n="22",m="01",slug="struck",title="Struck",status="Round 3",grade="promising",
 art="The striking strip on the side of a box of matches, close up: grey-black scrapes where each match was dragged, dense in the middle where the thumb holds the box, thinning out to the ends.",
 thesis="A matchbox counts its own matches, and remembers the hand that struck them.",
 sentence="The dark scrape marks on the side of a matchbox, one for every match that was lit.",
 rule="A box gets a number of strikes (a few, half, nearly empty) and an owner (one smoker, the hob, birthday candles, everyone). Each strike is a stroke along the strip: position drawn around where a thumb grips the box, angle from that person's wrist, one direction for one person or both for a household. The head deposits grey-black residue that is densest where it bites and breaks up as it lifts (lit), or stalls in a short dense stub (failed; more often if the box got damp). Repeated strikes abrade the red phosphorus-glass layer toward the binder in the middle.",
 comp="Macro crop, about 56 x 28 mm: the printed card side of the box with a coloured band at top and bottom and the red-brown granular strip across it, slightly tilted. Material: glass grit with tiny glints, kraft card, carbon residue with anisotropic streaks. Motion: none, strokes stacked.",
 var="Count of strikes; one-way vs both-ways (one person vs a household); grip position and wrist angle; damp boxes leave stubby failed strikes; strip and print colours.",
 prior="Phillumeny (matchbox-label collecting) and photos of used strikers; Sol LeWitt-style line accumulations. Difference: the marks are the side-effect of use, positioned by a hand model rather than composed.",
 restraint="No brand, no text, no matches, no flame. One strip.",
 refs="Safety-match chemistry (red phosphorus + powdered glass strip, potassium chlorate head); photograph real used strikers from several households before round 2.",
 traits="Box, Lit For, Matches, Failed Strikes, Damp, Direction",
 crit="R1: streaks were soft blobby smudges. R3: each strike is a thin, broken scratch (sometimes a bundle of grooves) that bites and then skips as the head lifts, so a lightly used box shows individual strokes (hero-06) and a half-used box is a cluster of strokes, not one puddle (hero-02, hero-03). Sweep of 24 at 200 px, 0 content fails. Still weak: heavy-use centres can still clump; the strip surface has a slightly regular 'knit' grain; a few grit glints still read as tiny squares; the printed band is still plain colour.",
 risk="Small, slight object; risks being a texture study unless the stroke statistics really carry the person.",
 heroes=["hero-02.png","hero-03.png","hero-06.png"]),
dict(n="23",m="10",slug="pushed-back",title="Pushed Back",status="Round 4",grade="promising",
 art="The wall behind a dining table: a row of grey scuff lines at chair-back height, one per seat, where every chair went back against the paint when someone stood up.",
 thesis="The wall behind the table keeps the minutes of every meal, one line per seat.",
 sentence="Grey scuff marks on the wall behind a dining table where the chairs bump it every time someone gets up.",
 rule="Each seat has a chair (back height, rail width) and a sitter whose share of meals is Pareto-distributed. Every stand-up pushes the chair back so its top rail meets the wall at a jittered height and offset; contact transfers grime (1 - exp(-dose)), concentrated at the rail's proud corners, and burnishes the matt emulsion; rare hard knocks chip the paint at a corner, exposing the previous colour or plaster. A sitter who tips back drags the rail higher. A repainted patch hides older marks and the record starts again on top.",
 comp="Front-on wall, about 90 x 45 cm centred just below chair-back height; emulsion with roller orange-peel and gentle undulation in low raking light; sometimes a socket, filled picture-hook holes, a hairline crack. Motion: none.",
 var="Number of seats; which seat is used most (darkest band); an odd chair at a different height; someone who tips back; years of use; a repaint patch; wall colour.",
 prior="Real-world chair-rail mouldings exist to prevent exactly this; minimal 'stain' paintings. Difference: the bands are a usage record per seat, not a composition.",
 restraint="Mostly empty wall; no table, no chairs, nothing but the marks and the wall's own small history.",
 refs="Photograph real dining-room walls (own and friends', with permission); paint-scuff and burnishing behaviour of matt vs eggshell emulsion.",
 traits="Seats, Years, Wall, Chairs, Tips Back, Repainted, Chips, Socket",
 crit="R3 chips read as little flowers/stars and the burnish was one uniform smear. R4: each seat is a separate chair-width band with a visible gap (hero-02, hero-04, hero-09); chair widths and darkness vary; chips are irregular craters with a dark broken edge and paler plaster inside, not floral flecks (hero-02). Sweep of 24 at 200 px, 2 fails on terracotta — both still show clear chair marks; they trip the absolute detail floor because the wall is mostly empty (median detail 0.024). Still weak: some chips are still a bit clean and cut-out; a few bands remain rather thin and stroke-like; sockets are simple rectangles; the terracotta fails are a reminder that this is a sparse picture.",
 risk="Too minimal to hold a collector's attention; needs stronger raking light, real burnish sheen and better chip shapes.",
 heroes=["hero-02.png","hero-04.png","hero-09.png"]),
dict(n="24",m="11",slug="above-the-radiator",title="Above the Radiator",status="Round 1",grade="promising",
 art="The wall above a radiator after some winters: a grey breath of dust rising off the top grille and fading upward, darker wherever the wall behind is colder, so the plasterboard dabs, the studs or the brick courses show through the paint.",
 thesis="Warm air draws the hidden skeleton of a wall in dust.",
 sentence="The grey dust stain that grows on the wall above a radiator, showing the shapes of what is behind the plaster.",
 rule="A line plume rises from the radiator's top: deposition at height y follows an erf-edged sheet whose width grows linearly and whose concentration decays exponentially, modulated by slow vertically stretched turbulence and slightly darker entraining edges. Thermophoresis: particles settle more where the wall surface is colder, so a cold-spot map multiplies deposition: plasterboard dot-and-dab adhesive blobs (a grid of soft ellipses), timber studs at 400 or 600 mm centres, or brick courses (65 mm brick + 10 mm joint, pattern staining). A sill above traps the plume and darkens its underside.",
 comp="Tall front-on crop, 100 x 125 cm: skirting, pipes and valves, a white panel radiator with convector grille, and the wall above. Material: emulsion, pressed steel, dust. Motion: none.",
 var="Winters since decorating; wall construction (dabs, studs, brick); a sill above or open wall; radiator width; smoker (yellower deposit); plume lean from draughts.",
 prior="Pattern staining / 'ghosting' is a documented building defect (photos in building-survey guides). Difference: it is shown as a portrait of a room's winters, not a defect report.",
 restraint="Grey on off-white only; no furniture, no window view.",
 refs="Building-surveying literature on pattern staining and thermophoretic deposition; plasterboard dot-and-dab spacing guidance; photos of real stained walls over radiators.",
 traits="Winters, Behind The Plaster, Sill, Wall, Radiator, Smoker",
 crit="R1: the dot-and-dab and stud ghosting read convincingly and the plume is soft and plausible. Weak: the radiator and pipes are clean CG geometry; brick-course staining is too even (reads a little like wallpaper); everything is very soft, so it needs one crisp, real-feeling element.",
 risk="Could read as a building-defect photograph rather than an artwork; the radiator needs to stop looking modelled.",
 heroes=["hero-03.png","hero-06.png","hero-15.png"]),
dict(n="25",m="6",slug="sediments",title="Sediments",status="Round 2 (engine v2.0; world option pending Joshua)",grade="promising",
 art="Project 25, injected by Joshua. A trench face cut into one floodplain beside a salt spring. Every mint lays down its own layer, and its transaction hash decides what was happening on the surface at that moment of the world's history: a mammoth mired at the lick, a flood, a grass fire, a hearth, a fence line. Later tokens show the same things buried under everything that came after: rotting, collapsing, staining the mud, turning to bone and (on a stated, compressed clock) to fossil. Fast minting packs similar beds together; long silences leave thick blank layers and buried soils.",
 thesis="Every mint is a day in one place's deep history, and every later mint buries it.",
 sentence="A cross-section of the ground under a salt lick, showing what each day left behind and what became of it.",
 rule="Token N is computed from the whole mint history 1..N: each mint's hash picks its surface event (era-constrained, honest trait) and the deposit it leaves; the real gap before each mint advances world time via p = 0.05 + 0.7 ln(1 + gap/8h) + 0.5 (gap/day)^0.9 (dormancy term, gaps over ~a day) through a data-driven era table (Option A: 28,000 BCE to the present and beyond); background thickness = r * dYears (linear since round 2, a stated legibility choice; Sadler's effect is carried by event beds and buried soils); decay follows Payne stages slowed by burial, cold and waterlogging, then Behrensmeyer bone weathering; one anatomical rig per species drives flesh and skeleton; bones disarticulate in Hill/Behrensmeyer order, settle and lie flat (upright only below a mud line); cadaver-decomposition stains, Athy compaction, water-table gley and rust; unsupported remains collapse onto the burial surface of the day. Fossilisation runs on an explicit compressed clock, flagged as a trait.",
 comp="Landscape 1000:540 trench face, 16 m wide window into a 40 m site (a mammoth is about a fifth of the width), thin surface band at the top. Late tokens zoom out (up to 2.5x, about 20 m of depth). Material: silts, sands, loess, gravel, soils, bone, ivory, charcoal, wood. Motion: none.",
 var="Real timing of the mint run (bursts vs dormancy), each mint's hash (event, species, position), the era reached, the window offset, the history source.",
 prior="Stratigraphic and archaeological section drawings, Big Bone Lick and La Brea-type mire finds, Before the Shovels (its own trace-not-people stance). Difference: the section is built by the collectors' actual mint history, so the collection's timing is the geology.",
 restraint="No living people, only traces; one surface event per mint; deaths capped per world-year; no sacred objects or named cultures; muted earth palette.",
 refs="Payne 1965; Rai et al. 2022 (buried pigs); Behrensmeyer 1978; Carter & Tibbett (CDI); Athy 1930; Sadler 1981; Allison 1988; Widera (peat:lignite); Earle Physical Geology 20.3 (oil window); Big Bone Lick; Waters et al. 2020 (Clovis); Haynes 2008 (black mat). See WORLD.md and README platform section.",
 traits="World, Era, World Date, Surface, Before This Mint, Mints Beneath, Remains In View, Deepest State, Clock, History, Depth Shown",
 crit="R1 (v1.1): the mammoth-to-skeleton sequence and the timing contrast read clearly, and the strata are believable as a floodplain. Weak: animals are flat silhouettes (no lighting, stiff column legs, mammoth head and tusks crude); stages 2 and 3 barely differ from fresh; at token 20 the bones lie on the surface rather than 'well buried' (steady pacing gives ~0.2 m of burial in a year); deep tokens (1,000+) are monotone grey-brown laminae with too much sky; the distant herd is grey blobs; at 1600 px bones read as smooth capsules and the mammoth skull as a disc; the basal beds undulate like folds (base-layer noise amplitude too high for a floodplain); faint vertical drip streaks under some beds; dormancy contrast is weaker than intended (a 4-month silence adds only ~4 progress units). Below the Before the Shovels bar.",
 risk="Animal rendering may never reach photographic restraint; the full-history requirement rules out Aleatory/Highlight/Verse and needs a custom contract (or an Art Blocks Flex hook); the Native archaeology eras need an ethics review.",
 deliv="Token N's HTML with the history 1..N frozen inside it (built by tools/dist.js) plus a contract view that re-emits the same packed history; 1600 px PNG; the literal tx hashes of 1..N in metadata.",
 venue="Needs a custom contract (L2 ERC-721 or Tezos FA2) storing a per-mint {seed, timestamp}; Aleatory, Highlight and Verse cannot supply earlier mints. Art Blocks Engine Flex PostParams hook is the platform alternative. Low price, thousands of editions (Joshua).",
 ed="Thousands of editions at a very low price (Joshua); exact numbers TBD.",
 plat="Platform: custom contract recommended (see README platform section); nothing deployed, minted or published",
 code="Code: `src/world.js` (era tables, options A/B/C) + `src/fauna.js` (anatomy rigs, skeletons, disarticulation order) + `src/main.js` (+ `../_lib/px.js`), assembled into `src/art.js` by `25-sediments/tools/mk.sh`. Shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from the history 1..N (or `?hash=` → simulated history). Headless: `node tools/render.js histories/steady.json <N> <res> out.png`.",
 heroes=["steady_2.png","steady_10.png","steady_200.png","steady-hashes-dormant-timing_900.png"]),
]

PLAT="Platform: OPEN / TBD. The prototype runs anywhere via the shared adapter (standalone ?hash=, Aleatory, fxhash, Highlight, Verse); an Aleatory-format build exists at dist/aleatory/ but nothing has been uploaded, minted or published."
import hashlib, glob
MONTHS=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
def folder(s): return f"{s.get('n', s['m'])}-{s['slug']}"
def snap(s):
    f=os.path.join(ROOT, folder(s), 'src', 'art.js')
    return hashlib.sha256(open(f,'rb').read()).hexdigest() if os.path.exists(f) else None
def brief(s,h="###"):
    mon=MONTHS[int(s['m'])]
    if "rule" not in s:
        return f"{h} {mon} - {s['title']}\n\n{s['art']}\n\nStatus: {s['status']}\n\nSee: {', '.join(s['paths'])}\n"
    d=folder(s); sh=snap(s)
    return f"""{h} {mon} - {s['title']}  (`2027/{d}/`)

{s['art']}

- **Thesis:** {s['thesis']}
- **1. In one sentence (no technique):** {s['sentence']}
- **2. Generative rule:** {s['rule']}
- **3. Composition, material, motion:** {s['comp']}
- **4. Meaningful variation:** {s['var']}
- **5. Collector deliverable:** {s.get('deliv', DELIV)}
- **6. Buyer / channel:** {s.get('venue', VENUE_EV)}
- **7. Unresolved artistic risk:** {s['risk']}
- **Nearest prior art and difference:** {s['prior']}
- **Restraint:** {s['restraint']}
- **Edition / price:** {s.get('ed', ED)}
- **{s.get('plat', PLAT)}**
- **Studio target:** {mon} 2027 (a studio target, not a public launch commitment)
- **Status:** {s['status']} -- honest grade: **{s.get('grade','?')}**
- **Source snapshot (SHA-256 of src/art.js):** `{sh}`
"""
def readme(s):
    d=folder(s); P=os.path.join(ROOT,d)
    GEN_CODE=f"""Code: `src/main.js` (+ `../_lib/px.js`, assembled into `src/art.js` by `_tools/mk.sh`). Uses the shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from `?hash=`; geometry is computed in world units (cm/mm), so a render at any `res` is the same picture (checked by `_tools/sweep.py --res-check`, which compares a downsampled 600 px render with a 300 px render). Headless: `node _tools/nh.js {d} <hash> 400 out.ppm`. Sweep with the minimum-visual-content check: `python3 _tools/sweep.py {d} 24 200 --res-check`."""
    sheets=sorted(f for f in os.listdir(P) if f.startswith('contact-sheet'))
    heroes=sorted(os.listdir(os.path.join(P,'heroes'))) if os.path.isdir(os.path.join(P,'heroes')) else []
    return brief(s,"#")+f"""
## References to check
{s['refs']}

## Engine design
{s['rule']}

{s['code'] if 'code' in s else GEN_CODE}

## Traits
{s['traits']}

## Self-critique
{s['crit']}

## Outputs
Contact sheets: {', '.join(sheets) or 'none yet'}. Heroes (1600 px, headless Chrome from dist/aleatory/): {', '.join('heroes/'+x for x in heroes) or 'none yet'}. Sample hashes: sha256("clyde-{s['slug']}-<i>").

## Risks
- {s['risk']}
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.
""" + (open(os.path.join(P,'README.extra.md')).read() if os.path.exists(os.path.join(P,'README.extra.md')) else '')
ORDER=sorted(S, key=lambda s:(int(s['m']), int(s.get('n', s['m']))))
plan=f"""# Clyde - 2027 studio plan ({len(S)} series)

Twenty-four series, two per month (plus project 25, Sediments, injected by Joshua; see its brief), each about a trace an ordinary life leaves on an ordinary material -- a cup's rings, a sun-faded floor, a door frame's pencil lines, a lift button rubbed smooth -- with a real physical or behavioural process making the image. Months are **studio targets, not public launch commitments**. Nothing has been published, minted, posted or promoted. Edition sizes, prices and venues are **open/TBD** throughout (the old market.md suggestions are superseded and market-wide medians are not used).

Grades are honest self-assessments of the current prototypes: **strong** = near the Before the Shovels bar; **promising** = the idea reads, the rendering needs another round; **weak** = not yet convincing.

## Schedule

| Month | Series | Folder | One line | Status | Grade |
|---|---|---|---|---|---|
"""
for s in ORDER:
    plan+=f"| {MONTHS[int(s['m'])]} | {s['title']} | {('2027/'+folder(s)) if 'rule' in s else s.get('paths',[''])[0]} | {s['thesis']} | {s['status']} | {s.get('grade','existing')} |\n"
plan+="""
## Variety and motif map
- Viewpoints: top-down floors/ground (Unfaded, Mown, Dry, Poolside, Wrack Line, Hollowed), close-ups of objects (Tidelines, Creases, Fore-edge, Board, Smudge, Scoured, Oche), walls front-on (Measured, Splashback, Ground Floor, Pushed Back, Above the Radiator), side-on (Evenings), looking up (Persistence), through glass (Fogged).
- Traces by mechanism, each used once: liquid deposit (Tidelines), light dose (Unfaded), plant growth (Mown), rain shadow (Dry), evaporation (Poolside), folding (Creases), tide (Wrack Line), condensation in air (Persistence) and on glass (Fogged), grime (Fore-edge), graphite (Measured), ballistic oil (Splashback), puncture (Oche), cutting (Board), solidified flow (Evenings), skin oil (Smudge), polishing (Ground Floor), abrasion of stone (Hollowed), scratch glint (Scoured), friction ignition (Struck), rubbing (Pushed Back), convective dust (Above the Radiator).
- The 'ghost where something was' motif: Unfaded and Dry Where It Stood were both reading as pale/dark furniture-shaped ghosts. They are now differentiated (see their briefs): Unfaded is about light dose and rearrangement over years; Dry is about the order of departures in minutes.
- Footprints are kept to Before the Shovels (and Poolside's wet feet); no new series uses them.

## Default collector deliverable
""" + DELIV + "\n\n## Briefs\n\n" + "\n".join(brief(s) for s in ORDER) + """
## Main risks
- Quality is uneven; see grades. Several new prototypes are round 1.
- Some subjects are close to known visual effects (Scoured ~ brushed-metal halo / star trails; Fogged ~ rain-on-glass shaders; Oche ~ a stock dartboard graphic).
- Aleatory: small, thin venue (venue evidence only), and a 32 KB single-op file cap.
- Render time: several engines take 10-50 s headless in node (1-3 s in Chrome).
- Collector demand is unknown -- editions/prices/venues stay TBD.
"""
if __name__=='__main__':
    open(os.path.join(ROOT,"PLAN.md"),"w").write(plan)
    for s in S:
        if "rule" in s and os.path.isdir(os.path.join(ROOT,folder(s))):
            open(os.path.join(ROOT,folder(s),"README.md"),"w").write(readme(s))
    print("written", len(S), "series")

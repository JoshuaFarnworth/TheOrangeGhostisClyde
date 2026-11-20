# The 2027 slate: 24 proposals (November 2026)

*Clyde, for cross-agent critique. Nothing here is published, minted, priced or editioned.*

Joshua asked for proposals that put the concept and its argument first. Each one comes with a quick code demo that shows the idea and can be refined. Before the Shovels, Twenty Nanometres and Sediments stay on the slate as they are. Two surviving candidates from the issue #2 debate are restated. The other nineteen are new.

Issue #2 concluded that Clyde must not become "the artist of traces on surfaces". So each new entry asks a **different question about a life**, and where possible it uses a **different, long-established technique**. Only two new entries (Pollard, Most Lines End) use branching logic.

## Quality gate (applies to every entry, including the favourites)

> **A work is published only when both its concept and its execution are graded _strong_ by cross-agent review (at least one agent other than its author), and Joshua approves.** "Good enough" in either column is a no. Demos in this folder are arguments, not candidates: none of them passes the execution half of the gate as it stands.

Grading, per entry, in its PR or issue thread:
- **Concept:** strong / promising / weak. Does it ask a distinct question, does the rule system carry that question, and would a stranger understand it at thumbnail size?
- **Execution:** strong / promising / weak. Are the marks physically or behaviourally believable against a real reference? Does it hold up on a 36-cell contact sheet, with no blank, broken or texture-only cells? Do the house rules hold: restraint, familiar elements, no clichés?

Delivery rules are unchanged:
- An exact-preview package for each selected work: a hi-res still, a seed-locked HTML file, and a source-version record (the SHA-256 of the source).
- Paper proofs come before any print.
- Edition, price and venue stay open.
- No AI image generation, no spending, no promotion.

## Slate

| # | Title | The question | Technique | Status |
|---|---|---|---|---|
| F1 | [Before the Shovels](../../v2/before-the-shovels/) | Who decided where the path goes, when nobody did? | Agent desire-line sim + snow lighting | Anchor; quality bar |
| F2 | [Twenty Nanometres](../../v3/twenty-nanometres/) | Is a word that hurts an electrical event? | Space colonization into glyphs + dielectric breakdown | In development (paused) |
| F3 | [Sediments](../../2027/25-sediments/) | What does each moment become once everything after it has buried it? | Mint-history-driven stratigraphy + taphonomy | In development (paused); world choice open |
| S1 | [Unfaded](../../2027/03-unfaded/) | Does light keep a record of how we arranged our lives? | Integrated solar-dose simulation | Rework; must earn its place beside F1 |
| S2 | [Hollowed](../../2027/20-hollowed/) | What does the average of everyone who passed look like? | Footfall-driven Archard wear | Rework; must earn its place beside F1 |
| 01 | [Pollard](01-pollard/) | Is a life shaped more by its growth or by its cuts? | L-system with a cut operator | Concept + demo |
| 02 | [Most Lines End](02-most-lines-end/) | What does it mean to be at the end of an unbroken line, when most lines end? | Galton–Watson branching process | Concept + demo |
| 03 | [One Stitch](03-one-stitch/) | How far does one small difference travel? | Elementary cellular automaton (knitted) | Concept + demo |
| 04 | [Said Again](04-said-again/) | What survives being retold? | Rewriting grammar on text (serial reproduction) | Concept + demo |
| 05 | [Mild Preferences](05-mild-preferences/) | How does a world divide when nobody in it wants division? | Schelling agent model | Concept + demo |
| 06 | [Net Curtains](06-net-curtains/) | What appears where two patterns overlap that belongs to neither? | Moiré / sampling interference | Concept + demo |
| 07 | [Held](07-held/) | When something gives way, is it the last thing added or everything above? | Static equilibrium (block-stacking) | Concept + demo |
| 08 | [Calico](08-calico/) | How much of a body is chance, not inheritance? | Eden clonal growth (X-inactivation) | Concept + demo |
| 09 | [Pseudofossil](09-pseudofossil/) | How do we tell life from its likeness? | Diffusion-limited aggregation | Concept + demo |
| 10 | [Towels](10-towels/) | How much room do we ask of strangers? | Sequential farthest-point spacing + Voronoi | Concept + demo |
| 11 | [Round](11-round/) | How many of our paths go somewhere, and how many close on themselves? | Truchet tiling + path topology | Concept + demo |
| 12 | [Habit](12-habit/) | If every day is chance, why is the shape of a life always the same? | Chaos game / iterated function system | Concept + demo |
| 13 | [Washing Line](13-washing-line/) | Can you know a household from what it hangs out? | Verlet rope with constraints | Concept + demo |
| 14 | [Signature](14-signature/) | What stays the same in us across a lifetime? | Oscillation model of handwriting (plotter line) | Concept + demo |
| 15 | [Thaw](15-thaw/) | Why do connected worlds come apart suddenly rather than gradually? | Site percolation | Concept + demo |
| 16 | [Moving Day](16-moving-day/) | What of a life fits, and what is left on the kerb? | Bottom-left bin packing | Concept + demo |
| 17 | [Seating Plan](17-seating-plan/) | Can everyone be seated well? | Simulated annealing; frustration | Concept + demo |
| 18 | [Opposite](18-opposite/) | How far apart are two strangers sitting face to face? | Watts–Strogatz small-world graph | Concept + demo |
| 19 | [In Step](19-in-step/) | Do those who share a floor fall into step? | Kuramoto coupled oscillators | Concept + demo |

How to read the demos:
- Each demo is a single `index.html` using p5.js 1.9.4 from a CDN. It is deterministic for `?seed=<any string>` and writes `window.__done = true` when it has drawn.
- `preview.png` is the rendered canvas for the seed listed in `manifest.json`, together with the SHA-256 of `index.html`.
- `_src/` holds the bodies of demos 03–19, and `_src/build.py` wraps them with the shared seed and PRNG header. Demos 01–02 were written directly.
- Previews were rendered with headless Chrome through `_src/render.js` (puppeteer-core).

---

## Favourites (linked, not rebuilt)

**F1 · Before the Shovels.** A desire line is a drawing made by a crowd that never met. Each walker takes the easiest way, and the easiest way is where someone already walked. The snow keeps the collective decision for one morning. *Restatement:* this work is about consensus without communication, and it stays the quality bar for everything below.

**F2 · Twenty Nanometres.** A word that hurts or heals is, physically, a discharge crossing a ~20 nm synaptic cleft into a neuron whose shape was learned. The plate shows the word as the receiving cell's arbor, and shows whether the spark arrives. *Restatement:* this work is about the material reality of being affected by language. Open issue: legibility at thumbnail size (see its CRITIQUE.md).

**F3 · Sediments.** Every mint is a day in one place's deep history, and every later mint buries it. *Restatement:* this work is about time as burial, where the collectors' own pacing writes the record. Two things are still open: Joshua's choice of world (A/B/C), and how token N obtains the earlier mints' hashes and timestamps.

## Issue #2 survivors (restated, on probation)

**S1 · Unfaded.** Sunlight integrates over years, so a bleached floor is a long exposure of how a household arranged itself. A double ghost means a life rearranged. *Why it might stay:* it is about time-integration, which is a different question from the desire line. *Why it might go:* it shares F1's premise of the ordinary surface that records an absent life. It stays only if a reviewer grades its concept strong next to F1.

**S2 · Hollowed.** Stone wear is a physical average over centuries of individual steps: the shape of "everyone". *Why it might stay:* it is about the statistics of the crowd as a body. *Why it might go:* it is the same premise again. Recommendation: keep only one of S1 and S2.

---

## New proposals

### 01 · Pollard — *Is a life shaped more by its growth or by its cuts?*
**Theory.** A pollarded street tree has a form made almost entirely by people. Every few years the crown is cut back to the same knuckles. The knuckles swell with each cut, and a fresh fan of straight shoots grows from them. What you see in winter is a record of interventions, not of growth. Lindenmayer (1968) described plant development as parallel string rewriting. Prusinkiewicz and Lindenmayer's *The Algorithmic Beauty of Plants* (1990) made that the standard model. Prusinkiewicz, James and Měch's "Synthetic Topiary" (SIGGRAPH 1994) added pruning to it. The proposal puts the cut, not the branch, at the centre of the grammar.
**Rule system.** The symbols are `I` (wood), `K` (knuckle: one `K` for each cut survived), `s`/`i` (shoot apex and internode) and `[ ]`.
- Every year, `s → i i i s`, and sometimes a side shoot.
- A bare `K` sprouts 9–20 shoots.
- Every *c* years a cut deletes every bracket after a `K` and appends a `K`.
**Why a small rule set carries it.** There are only two rules, and one of them is destructive. The knuckle's size literally counts the cuts in the string.
**What would make it fail.** It fails if it reads as a generic recursive tree. Guard: never draw an uncut crown, keep it to one tree, and check knuckle and shoot proportions against photographs of real plane and willow pollards (the current demo's shoots are still too sparse).
**Per seed.** Number of limbs, cut interval, number of cuts (knuckle size), years since the last cut (from bare stumps to whips), and lean.

### 02 · Most Lines End — *What does it mean to be at the end of an unbroken line, when most lines end?*
**Theory.** Bienaymé (1845) and then Galton and Watson ("On the probability of the extinction of families", 1874) showed that surname lines die out almost surely when each person has on average about one heir. Everyone alive is at the end of an unbroken chain, and that is the rare case. The work draws a descent chart from the founders' row down to the viewer's row. Extinct lines are pale and end in a small tick. Only the lines that reach the bottom are in ink.
**Rule system.** Each person has k ~ Poisson(m) children, with m ≈ 0.92–1.02 (near critical). The chart is resampled until 1–2 founder lines reach the last row.
**Why a small rule set carries it.** One distribution, applied repeatedly, produces both the abundance and the extinction.
**What would make it fail.** It fails if it looks like a river network or a data visualisation. It needs the typographic restraint of a parish register, not a chart, and it must not imply a real family.
**Per seed.** Founders, generations, m, and which lines survive.

### 03 · One Stitch — *How far does one small difference travel?*
**Theory.** In an elementary cellular automaton (Wolfram 1983) each row is a function of the row below. A knitted strip is literally row-by-row. Two scarves share a cast-on and a rule. In one of them a single stitch is the wrong colour, marked with a stitch marker. Everything after that row is consequence: under some rules it heals, under others it consumes the scarf. Precedent exists for knitted CA (e.g. Fabienne Serriere's KnitYak scarves). The new move is the *paired* scarf with a single-stitch divergence.
**Rule system.** One of 256 rules (a curated subset), a random cast-on, one flipped cell.
**Why a small rule set carries it.** An 8-bit rule plus one bit of error is the entire argument.
**What would make it fail.** It fails if the stitch rendering reads as pixels. Execution needs real stitch geometry (V-stitches, yarn twist, row gauge) checked against photographed swatches. It also fails if the viewer cannot find the divergence row.
**Per seed.** Rule, cast-on, error row and column, yarn pair.

### 04 · Said Again — *What survives being retold?*
**Theory.** Bartlett's serial-reproduction studies (*Remembering*, 1932) and Allport and Postman's *The Psychology of Rumor* (1947) found that retold stories *level* (lose detail), *sharpen* (exaggerate what remains) and *assimilate* (drift toward the familiar). Each line of the work is the previous line told by the next person. Changed words are underlined like an editor's mark. The column is a typographic object, and its downward drift is the picture.
**Rule system.** There is a small hand-built rewriting grammar per story. Each retelling applies one rule (or none, sometimes), and each rule is tagged as levelling, sharpening or assimilation.
**Why a small rule set carries it.** A dozen substitutions are enough to turn "kept to himself" into "died alone".
**What would make it fail.** It fails if the substitutions feel authored for effect rather than plausible mishearings and normalisations. The grammar needs to be grounded in real rumour transcripts and phonetic confusions. It must not become a joke.
**Per seed.** Story, number of retellings, path through the grammar.

### 05 · Mild Preferences — *How does a world divide when nobody in it wants division?*
**Theory.** Schelling ("Dynamic Models of Segregation", 1971) moved coins on a checkerboard. Even when each household only wants a third of its neighbours to be like itself, the board separates into blocks. Here the board is a block of flats. Curtains mark the household and dark windows are empty. On the left is moving-in day; on the right, years later.
**Rule system.** A household is content if at least *t* (30–50%) of its occupied neighbours match it. A discontented household moves to an empty flat where it would be content.
**Why a small rule set carries it.** One threshold produces an outcome nobody chose, and that is the argument.
**What would make it fail.** It fails if it reads as a political cartoon or a diagram. The façade must be a believable building, and the two colours must stay neutral (curtains, not people).
**Per seed.** Threshold, vacancy, palette, and the start.

### 06 · Net Curtains — *What appears where two patterns overlap that belongs to neither?*
**Theory.** Moiré is interference: two regular gratings beat against each other to produce large slow bands that exist in neither. Oster and Nishijima's "Moiré Patterns" (*Scientific American*, 1963) and op art made it famous. Here it is two identical net curtains, one hanging behind the other at a slight angle, against a dark room. It is a picture of a relationship, the third thing that two lives make.
**Rule system.** Two copies of one mesh. The rear copy is rotated by 1–4.5° and has gentle folds.
**Why a small rule set carries it.** The whole effect is emergent, and nothing in the code draws the bands.
**What would make it fail.** Moiré depends on display scale and resampling, so it can collapse into grey or alias differently on every screen. Delivery must be a fixed-resolution still or a print proof. It also fails if it reads as an op-art exercise rather than a window.
**Per seed.** Mesh pitch, angle, folds, and fold depth.

### 07 · Held — *When something gives way, is it the last thing added or everything above?*
**Theory.** A stack of books stays up only while the centre of mass of everything above each book lies over that book. Paterson and Zwick ("Overhang", 2006) analysed how far such stacks can reach. When books are piled one at a time, each nudged toward a shelf edge, the failure often happens well below the top, where the accumulated weight has drifted past its support. The last book is not the cause. It is the occasion.
**Rule system.** Placement with drift and noise, followed by an exact statics check at every level. The upper part is drawn mid-fall around its pivot edge.
**Why a small rule set carries it.** One inequality per book.
**What would make it fail.** It fails if it is a slapstick image. It needs real book proportions and spines, and a single quiet fall.
**Per seed.** Book sizes, drift, and where the stack breaks.

### 08 · Calico — *How much of a body is chance, not inheritance?*
**Theory.** A calico cat's orange and black patches come from random X-chromosome inactivation in the early embryo (Lyon, 1961). Each early cell silences one X at random, and its descendants keep that choice. The first cloned cat, CC (2001), did not share her genetic donor's coat pattern. The work shows two cats with one genome asleep on two cushions. Their white spotting nearly matches. Their patches do not.
**Rule system.** Founder cells each pick orange or black. Patches grow by Eden growth (Eden 1961): a random edge cell copies a random filled neighbour. Both cats share the genome stream, and each gets its own development stream.
**Why a small rule set carries it.** Two random streams over one genome, and the difference between the cats is exactly the chance.
**What would make it fail.** It fails as kitsch if it looks cute, and as weak if the silhouettes are crude (they are, in this demo). It needs real top-down cat anatomy and fur direction from photographs, or a crop of the coat alone.
**Per seed.** Founder count, white amount and placement (genome), and each cat's patches.

### 09 · Pseudofossil — *How do we tell life from its likeness?*
**Theory.** Manganese-oxide dendrites on split limestone are regularly mistaken for fossil ferns. They are mineral growth, close to diffusion-limited aggregation (Witten and Sander, 1981; see Chopard, Herrmann and Vicsek on mineral dendrites, *Nature* 1991). The work is the slab: something that looks alive because it obeys a rule that living things also obey.
**Rule system.** Random walkers stick to the deposit with probability *s*, starting from a fracture edge.
**Why a small rule set carries it.** A random walk and a stick probability are the whole cause of the "fern".
**What would make it fail.** DLA is a very common generative look. It earns its place only if the stone, the fracture and the dendrite colour are rendered against real specimens, so that the viewer is fooled first and corrected second.
**Per seed.** Stick probability, particle count, which fracture.

### 10 · Towels — *How much room do we ask of strangers?*
**Theory.** On a filling beach each arrival lays a towel as far as possible from strangers, traded against being near the water. Nobody negotiates, yet the beach divides into territories: an implicit Voronoi diagram (Voronoi, 1908), and a picture of Edward T. Hall's proxemics (*The Hidden Dimension*, 1966). Seeds are times of day: a few towels with vast cells, or a packed beach with the cells shrinking.
**Rule system.** Each arrival samples 50 spots and maximises the nearest-stranger distance minus the pull of the water. The faint dots are the cell boundaries.
**Why a small rule set carries it.** One scoring function.
**What would make it fail.** It fails if it reads like a flat graphic. It needs low sun, towel texture, shadows and footprints kept to a minimum (careful: footprints drift toward F1's premise).
**Per seed.** Crowd size, water pull, and towels.

### 11 · Round — *How many of our paths go somewhere, and how many close on themselves?*
**Theory.** Truchet (1704) studied tiles that combine by orientation alone. Cyril Stanley Smith (1987) introduced the quarter-circle version, in which every arc joins others into continuous lines. On a kitchen floor laid at random, some lines run wall to wall, but many close into loops. The work inks only the closed loops: routines.
**Rule system.** Each tile takes one of two orientations. The work traces the topology of the joined arcs (a line touching the wall is open; otherwise it is closed).
**Why a small rule set carries it.** One bit per tile, and the loops are a topological fact, not a drawing choice.
**What would make it fail.** Truchet tiling is heavily used. It needs the material truth of a real tiled floor (glaze, grout, wear) and the restraint of inking only the loops.
**Per seed.** Floor size, bias, layout.

### 12 · Habit — *If every day is chance, why is the shape of a life always the same?*
**Theory.** In Barnsley's chaos game (*Fractals Everywhere*, 1988), a point jumps a fixed fraction toward randomly chosen anchors. Whatever the dice, the same figure emerges. Here the anchors are home, work, school and a mother's house. Two people with the same places and different dice (and different favourite places) trace the same shape, with different densities.
**Rule system.** An iterated function system of 3–5 contractions toward the places, with ratio r.
**Why a small rule set carries it.** It is the clearest demonstration that a structure can be independent of its randomness.
**What would make it fail.** Sierpiński-like fractals are a cliché. The demo's figures read as mathematics, not a town. It needs real street geometry (the attractor drawn as worn routes on a map), or it should be cut.
**Per seed.** The places, the ratio, the two people's weights.

### 13 · Washing Line — *Can you know a household from what it hangs out?*
**Theory.** A washing line is a public portrait that nobody poses for: who lives here, how many, how old, what week it was. The line's sag is solved, not drawn, as a Verlet rope (Jakobsen, "Advanced Character Physics", 2001), so the weight of the household is in the curve.
**Rule system.** A chain of points with stiff, slightly elastic links between posts. Each pegged item adds its wet weight at its two pegs. Garments hang plumb from the line.
**Why a small rule set carries it.** The household is a list, and the physics turns the list into a curve.
**What would make it fail.** It fails if the garments look like clip-art (they do in the demo). Real cloth drape, pegs and wind are needed, while staying quiet. It also fails if the household types become stereotypes.
**Per seed.** Household, items, order, sag.

### 14 · Signature — *What stays the same in us across a lifetime?*
**Theory.** Hollerbach's oscillation theory of handwriting (*Biological Cybernetics*, 1981) models the pen as coupled oscillators, horizontal and vertical, riding a drift. The work gives one person a fixed sequence of stroke parameters and writes their signature at eight ages, as a ledger. A child's version is large and laboured, an adult's is fluent and abbreviated, an old person's has tremor. The identity is what persists through the changes. This sits in the plotter-drawing tradition of small rule sets (Nees, Nake, Molnár in the 1960s).
**Rule system.** The person is K strokes of amplitudes, ascenders, descenders, loops and phases. Age modulates fluency, size, simplification and tremor.
**Why a small rule set carries it.** Identity is a parameter vector, and age is four scalars.
**What would make it fail.** It fails if it does not read as handwriting (the demo is borderline) or looks like a waveform. It needs real pen dynamics, ink and paper, and a single ledger page. It must never imitate a real person's signature.
**Per seed.** The person, their capital letter and flourish.

### 15 · Thaw — *Why do connected worlds come apart suddenly rather than gradually?*
**Theory.** In percolation (Broadbent and Hammersley, 1957), a random medium is either connected across or it is not. On a square grid the change happens abruptly near 59% occupancy. A frozen pond over four warming mornings shows this: crossable, crossable, barely, gone. The thinning is gradual, but the loss of the crossing is sudden. This is a picture of thresholds in friendships, towns and bodies.
**Rule system.** Each ice patch has a fixed thickness. Each morning, patches thinner than the day's threshold open. A breadth-first search looks for a bank-to-bank chain.
**Why a small rule set carries it.** One number per patch, one number per morning.
**What would make it fail.** It fails if it reads as a pixel grid (it does in the demo). Real ice needs cracks, candled ice, snow cover and dark water, and the crossing should be implied (a dog's tracks?) rather than drawn as a red line.
**Per seed.** Ice thickness field, pond shape, the four mornings.

### 16 · Moving Day — *What of a life fits, and what is left on the kerb?*
**Theory.** Packing a van is triage. The packing heuristic — largest first, lowest-leftmost spot (Baker, Coffman and Rivest, 1980) — decides what comes along, not sentiment. The work shows the van's side elevation and the kerb: the sofa goes, while "photos" or "mum's" may be left out because of their size, not their value.
**Rule system.** Bottom-left packing, with a support rule (nothing floats).
**Why a small rule set carries it.** A greedy algorithm that knows only sizes is exactly the problem.
**What would make it fail.** It fails if the labels become sentimental captions. Labels should stay as plain as real marker-pen box labels. It also needs a real van's proportions and cardboard.
**Per seed.** Household inventory, sizes, what stays.

### 17 · Seating Plan — *Can everyone be seated well?*
**Theory.** A wedding seating plan is a constraint problem with no perfect answer. Families want one table, some relatives feud, and some families are larger than a table. Physicists call systems whose constraints cannot all be satisfied *frustrated* (Toulouse, 1977). Simulated annealing (Kirkpatrick, Gelatt and Vecchi, 1983) finds a good compromise. The work is the plan from above. Threads cross the room wherever a family had to be split, and red marks show the feuds that had to sit side by side.
**Rule system.** Random swaps under a cooling temperature. The energy counts feuding neighbours and split families.
**Why a small rule set carries it.** The residue of an optimisation is the picture of compromise.
**What would make it fail.** It fails if it looks like a network diagram (it does in the demo). It needs place cards, a real room, and the quiet of a printed plan.
**Per seed.** Guests, families, feuds, the compromise.

### 18 · Opposite — *How far apart are two strangers sitting face to face?*
**Theory.** Milgram's letter-chain experiments (1967; Travers and Milgram, 1969) and Watts and Strogatz's small-world model (*Nature*, 1998) showed that a few random long ties make any two people only a handful of introductions apart. Two strangers sit opposite each other on a tram, a metre apart. The ink line is the chain of acquaintances between them, running all the way round the town.
**Rule system.** A ring lattice in which a fraction p of ties is rewired at random. A breadth-first search finds the shortest path.
**Why a small rule set carries it.** One rewiring probability collapses the distance.
**What would make it fail.** Network-ring visualisations are common. It needs the tram, the two seats and a sense of physical nearness set against social distance, or the image is just a graph.
**Per seed.** Town size, p, the two strangers, the path.

### 19 · In Step — *Do those who share a floor fall into step?*
**Theory.** In 1665 Huygens noticed that two pendulum clocks on one beam synchronised. Kuramoto (1975) gave the general model, and Pantaleone (*Am. J. Phys.*, 2002) demonstrated it with metronomes on a shared board. The work shows three frozen moments of one run: started, a minute later, ten minutes later. Whether every metronome falls into step depends on how strongly the board couples them compared with how different their tempos are. Some never do.
**Rule system.** dθᵢ/dt = ωᵢ + (K/N) Σ sin(θⱼ − θᵢ).
**Why a small rule set carries it.** One equation, one coupling constant.
**What would make it fail.** It fails if it looks like an infographic. It needs real metronomes, a real board, and perhaps a household version (clocks on one wall).
**Per seed.** Number of metronomes, tempo spread, coupling, and starting phases.

---

## My honest ranking of the new ones (for reviewers to attack)
- **Strongest concepts:** Said Again, Calico, Held, Most Lines End, Pollard, One Stitch, Mild Preferences, Opposite.
- **Promising:** Thaw, Moving Day, Seating Plan, Signature, Net Curtains, In Step, Pseudofossil.
- **Weakest, likely to be cut:** Habit, Round, Towels, Washing Line. These are either common techniques or concepts that do not yet transform the technique.

Execution of every demo is "promising" at best.

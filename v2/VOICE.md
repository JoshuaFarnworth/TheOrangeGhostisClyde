# Clyde: voice options (v2)

I started from the territories already owned by other code artists and stayed out of them on purpose:
- Hobbs: painterly flow fields and materiality.
- Cherniak (Ringers): one constraint explored exhaustively.
- Quilez: SDF/raymarched mathematical nature.
- Anna Lucia and Emily Xie: textile and collage languages.
- Lieberman: gesture and handwriting.
- Golid: restrained grids.
- Mapan: crayon and paint marks.
- Zancan: gardens and pen-plotted trees.
- Sasha Stiles: language and poetry.
- The broader fxhash "noise plus palette" idiom.

## Option A: "Traces" (CHOSEN)
- **Thesis:** "I portray crowds that are never in the picture: only what people wear into the world when no one is watching."
- **Recurring obsession:** absence, and the collective choices that emerge without anyone deciding them (desire lines, wear, residue).
- **Signature:**
  - Composition: a plan view seen straight down, read like a site plan.
  - Light: low raking sun or lamplight, with long cast shadows of things that are often outside the frame.
  - Colour: near-monochrome white against blue shadow, with one temperature contrast. A single saturated accent appears rarely (a red mitten, a red sledge).
  - Materiality: simulated physical snow, and nothing drawn as a line.
- **Anchor:** *Before the Shovels*. An active-walker crowd model wears desire lines into a snow heightfield, which is then lit by a raking-light renderer.

## Option B: "Residue"
- **Thesis:** "Waiting leaves a stain."
- **Subject:** tidelines from cups, glasses and spills on café tables and paper, recording hours of waiting.
- **Engine:** a custom evaporating-droplet model. It covers capillary outflow to the pinned contact line (the coffee-ring effect), Marangoni reversal, and re-wetting when a cup is set down again. Rings are deposited onto a fibre-simulated paper.
- **Rendering:** transmitted light through stained paper.
- **Signature:** off-centre clusters, a palette of tea, coffee and wine, and macro scale.

## Option C: "Creases"
- **Thesis:** "Paper remembers every time it was held."
- **Subject:** letters folded, unfolded and refolded over decades, with the crease history as the subject.
- **Engine:**
  - A fold-history simulator (rigid-origami folds plus crumple relaxation on a mass-spring sheet).
  - A raking-light renderer of the crease relief, with wear: worn crease intersections and fading along the folds.
- **Signature:** a single sheet, a raking side light, and almost no colour.

## Why A
- **The strongest image engine.** The simulation (emergent desire lines) and the rendering (raking light on snow) carry the meaning on their own. Nothing in the image is decorative.
- **A real subject:** collective behaviour, absence, winter. Each output has a narrative incident (a snow angel, a dog's detour, someone who waited, a lost mitten), so it is more than "technique X meets Y".
- **It fits the persona.** Clyde avoids people. His art is about people only through the traces they leave.
- **Clear room in the market.** I know of no prominent long-form generative series in this territory. Aerial snow and desire-line photography exist as photography, which is acknowledged in the README.

# Twenty Nanometres: curatorial critique log

I reviewed it as a hostile curator would. The questions each round: is it derivative, is it memorable, is the word integration elegant or cheesy, and does the weakest output hold up?

## Round 0: first engine (3 renders)
- **What worked:** the Golgi photomicrograph read as a real silver stain at once, with spines and depth-of-field blur. That is the series' strongest asset.
- **The word:** it looked like hatched moss lettering. Branches marched up each stroke in parallel and read as a "tree font". *Cheesy.*
- **The spark:** a tiny zigzag and a straight stub, with an obvious drawing bug.
- **Glass Negative:** flat CG grey-on-grey. *Cut.*

## Round 1: 36 outputs
- **Template composition.** Every plate had the word mid-frame, soma below and sender above. In a grid it looked like 36 logos.
- **Cajal Plate legibility was poor.** Every branch carried the same ink weight, so the word dissolved into the tree.
- **Foxing looked like camouflage.**
- **Changes:**
  - Spine density 3–4× inside the word (learning adds spines) and sparser fill, so letters read as spiny dendrites rather than hatching.
  - Depth now follows the letterforms. Branches leave the focal plane between soma and word and return in focus inside the letters, so the plane of focus is the word.
  - Lichtenberg-style discharge (lower η), larger gap, a return stroke that actually touches the dendrite, and per-cell jitter plus smoothing against DBM grid anisotropy.
  - Autochrome replaced Glass Negative (Cajal practised autochrome).
  - Cajal arrows, figure letters, plate number.

## Round 2–3
- **A 60-word lexicon in five registers.**
- **×60 objective (zoom).** The first version cropped words off the frame. Objective is now decided after layout, and ×60 only appears when the word still fits, so the trait stays honest.
- **Orientation.** Soma above the word with the sender below, in 30 % of outputs. Oblique sections in 22 %.
- **Bug: growth stalled** when the fan was too sparse (sample 29 had almost no word). Fixed with guide attractors from soma to every letter.
- **Bug: bouton carving** cut holes in letters near the synapse (ALONE lost its A and L). Carving now never touches glyph interiors.

## Round 4–5: legibility versus biology (the central tension)
- The prettier the neuron, the less legible the word. "MISSED CALL" at ×60 was a beautiful Cajal drawing in which no word was visible.
- **I tested heavier faces** (Alfa Slab One, Ultra). They clogged into blobs because the fill closes their counters. Old Standard Bold stays.
- **What fixed legibility:** contour attractors just inside the outline, so Didone hairlines survive; tracking opened to 0.13 em; a jittered-grid fill. After this, all 36 words are readable at contact-sheet size.

## Round 6–7: materiality pass
- **Discharge:** the return stroke tapers toward the contact and ends in a small flash. Side terminals on the axon hub were shrunk (they read as pins).
- **Golgi:** defocused trunks crossing letters made dark smears ("spider on a word"). I reduced trunk radius caps and the absorbance of the far layers, and moved the soma further off when it sits above.
- **Autochrome:** first it was grey noise, then pink confetti. It now has warm aubergine blacks, a softer starch-grain mosaic and straw/rose ground.
- **Cajal Plate:** heavier in-word ink.

## Where it stands (honest)
**Strongest outputs:**
- Cajal Plate *Storm* and *Train* (hero-02 FIRE, hero-10 TYPING). Vermilion Lichtenberg leaders against grey-black ink with Cajal's arrows. Nobody else in the market looks like this.
- Golgi ×60 *Repeated* and *Storm* (hero-24 KISS, hero-23 FIRE).
- Golgi *Loss / Failed* (hero-13 ALONE). Beaded, fragmented dendrites and a spark that dies a third of the way across. The quietest, and conceptually the best.

**Weaknesses still present:**
1. **The composition is still a formula** (word band plus fan plus sender) despite the orientation, oblique and ×60 variants. A wall of 64 will feel repetitive. Next: two-cell compositions, words that sit off-centre or run off a section edge, and occasional absent words (only the scar of where it was).
2. **Is the concept cheesy?** "Neuron spells LOVE" is one step from a greeting card. The Attachment register is the most at risk: HOME, LOVE and MOTHER are the most literal. Loss and Summons carry the idea better. I'd consider lowering Attachment's weight, or making those words the rarest and quietest.
3. **Neighbours.** Text grown by space colonisation is a known demo technique. The departure is the microscopy (Golgi depth of field, spines, Cajal's conventions). Greg Dunn's neuron art is the obvious neighbour, and the palette was chosen to stay clear of it.
4. **Autochrome is the weakest medium.** At 17 % it is still a little "filter-like". Either commit harder (plate edges, colour shifts, varnish) or cut it to 10 %.
5. **Cajal Plate Loss outputs are very pale** at thumbnail size (ALONE, NO ONE, SORRY). That is right emotionally, but they recede in a grid.
6. **The sample set is skewed by chance.** The first 36 hashes hold 15 Loss outputs and ALONE five times; across 400 hashes Loss is 23 % and ALONE 3 %. I kept the set unpicked. Word repeats are inherent with 61 words in a 64–128 edition. If the platform exposes an edition index, a shuffled word deck would be better.
7. **The DBM still shows faint grid "combs"** in the finest Lichtenberg leaders at 2560 px+.
8. **The receiving soma is a round blob** with basal stubs. It is serviceable, but not as finely observed as the dendrites.

**Not ready to mint.** I would want items 1, 2 and 4 resolved first.

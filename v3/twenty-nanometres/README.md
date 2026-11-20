# Twenty Nanometres (v3)

Clyde, 2026. Long-form generative series, deterministic from a hash. Each output is one still.
Export targets: Aleatory (Tezos), fxhash-compatible, Highlight, Verse. Built from the v2 code in `../../v2/twenty-nanometres`, which stays as it was.

## Thesis

The subject is the gap. Two unequal, cropped branching fields face each other across a narrow band of empty space. A word grows into the receiving shore of that gap. The picture is the instant a signal crosses it. Inside the word, the consequence shows only where the crossing reached. A trigger word ("CALL ME", "UNREAD", "STAY", "HOME") is half there until it arrives. When it fails, it stays latent.

These are artistic claims. They are not physiological ones. The scales, the depth of field, the "spark" and the way activation spreads are invented to carry the image. They do not model any real synapse.

## What changed from v2

- **The cleft is the composition.** It is a gently bent band at any orientation (diagonal, near-horizontal or near-vertical), placed off-centre, with a variable width. A sending arbour sits on one side and a receiving arbour on the other. Their extents are unequal (trait `Field`: Receiver or Sender Dominant). The receiving cell body is pushed out of frame about 70% of the time, so the radial "central fan" mostly goes. The plane of focus is the cleft and the word, and both fields blur as they run inland.
- **A visible event.** Discharge happens from boutons at the sender's shore (DBM, the same core as v2). A wave then propagates through the receiving tree, by exact path length from the contact node. Behind its front, branches are lit and thickened and spines swell. The trait `Moment` fixes where the still is taken: Arrival (front about half-way into the word), Spread (word mostly lit) or Afterglow (dimmer, wider residue). The sending arbour shows a faint approach glow along the path to each bouton.
- **The word has consequences.** Glyphs are filled by the receiving tree. Unlit glyph branches are only slightly heavier than the surrounding field, so the word is latent. Lit glyph branches become about twice as heavy and carry the warm (Darkfield) or vermilion (Brightfield) emission. Outside the glyphs the wave is gated to about 6%. So the word becomes legible where the signal reached it. `Train` lights letters locally, one bouton each. `Near Miss` lands beside the word and lights unrelated branches. `Failed` leaves the word dark and the spark stalled in the gap.
- **Less filter.** The Autochrome and Cajal-plate paper stains, precipitate crystals, capillaries, plate labels and arrows are gone. There are two treatments:
  - Darkfield: near-black, cool silver scatter and warm activation.
  - Brightfield: neutral light ground, graphite and vermilion activation.
  Grain is light and added after gamma.
- The licence for the font is carried with the work (see below).

## Traits

| Trait | Values |
|---|---|
| Word | from a lexicon of trigger words grouped by register |
| Register | Alarm, Attachment, Loss, Want, Summons (sets branch character, gap width, wave speed/shape, flicker) |
| Stain | Darkfield 56, Brightfield 44 |
| Transmission | Crossed, Repeated (3 discharges), Storm (3 close contacts), Train (3–5 contacts along the word), Failed, Near Miss |
| Moment | Arrival 30, Spread 45, Afterglow 25 |
| Charge | Faint, Steady, Violent |
| Section | Sparse, Neighbours, Thicket (out-of-focus neighbours and fibres, kept out of the cleft) |
| Field | Receiver Dominant, Sender Dominant |

Distribution over the 36-sample sheet:
- Stain: 18 Darkfield, 18 Brightfield.
- Transmission: Crossed 9, Repeated 7, Train 7, Failed 6, Storm 5, Near Miss 2.
- Moment: Arrival 17, Spread 10, Afterglow 9.

## Animation, later (not built)

Nothing animates yet, on purpose. The still has to hold first. If it moves, there are four acts on the same seed:
1. **Anticipation:** the approach glow travels down the sending arbour, and the cleft stays empty.
2. **Crossing:** the DBM leader grows step by step from its own growth order, then the return stroke.
3. **Changed network:** the activation front moves outward by tree distance. Glyph branches thicken and the word resolves letter by letter.
4. **Deliberate recovery:** emission decays more slowly than it arrived, and the thickening relaxes. The word sinks back to latent but not all the way: a faint residue stays (Afterglow is this state).
The still each output shows is the `Moment` frame of that sequence. The engine already computes per-node tree distance and the front radius, so the animation is a matter of sweeping `Rf` over time.

## Prior art and debts

- Space colonisation: Runions, Lane & Prusinkiewicz (2007).
- Dielectric breakdown model: Niemeyer, Pietronero & Wiesmann (1984).
- Drawing lineage: Cajal's drawings, darkfield and brightfield microscopy as looks, not as data.

## Files

- `src/engine.js`: the piece.
- `src/font.js`, `src/lexicon.js`: the font subset and the word list.
- `make.sh`: concatenates to `src/art.js`.
- `postbuild.sh`: adds the font licence to the exports.
- `samples/00–35.png` (1600 px wide) plus trait JSON. `contact-sheet.png`.
- `heroes/hero-05, 12, 27, 31.png` (3200 px wide).
- `dist/`: aleatory / fxhash / highlight / verse folders and zips, each including `OFL-OldStandardTT.txt`.
- Rebuild:
  `./make.sh && node ../../tools/build.js twenty-nanometres-v3 && ./postbuild.sh && node ../../tools/verify.js twenty-nanometres-v3`
- Dev query (standalone only): `?hash=0x..&res=1600&word=STAY&stain=Darkfield&trans=Train&moment=Spread`.

## Font licence

The glyph outlines embedded in the code come from Old Standard TT, Copyright 2011 The Old Standard Project Authors. They are used under the SIL Open Font License 1.1.
- The full licence is in `OFL-OldStandardTT.txt`.
- That file is copied into every dist folder and zip.
- Each HTML export carries an attribution comment, and so does the engine header.

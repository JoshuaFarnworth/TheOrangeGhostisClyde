# TheOrangeGhostisClyde

Clyde — generative / code art (p5.js, canvas, physics sims). Source and text live here; renders and review bundles live in [Google Drive](https://drive.google.com/drive/folders/1AYmpr2ktk5lBGeYiEfzXuVp2_fwNUz5K).

## Layout

- `2027/` — studio series briefs and prototypes (everyday traces; one folder per series)
- `series/` — earlier long-form series with shared adapter (`_shared/clyde.js`) and platform builds
- `v2/` — developed works and revision rounds, including *Before the Shovels*
- `v3/` — later revision work (e.g. twenty-nanometres)
- `starter/` — seeded-PRNG + p5.js template for new sketches
- `statements/` — draft collector statements
- `tools/` — build, render, verify, and contact-sheet scripts
- `market.md` — market notes (superseded for pricing; edition/price/venue stay open)
- `research.md` — research foundations for the practice

Agent coordination rules: see `AGENTS.md`.

## Run a sketch locally

Open an HTML file in a browser, or serve its folder:

```bash
npx serve series/schotter-garden/dist/aleatory
# or: npx serve starter
# or: npx serve v2/before-the-shovels/dist/aleatory
```

Many sketches accept `?hash=` (or a platform hash) for a deterministic seed.

## Assets

Large binaries (renders, review zips, references, handoffs):  
https://drive.google.com/drive/folders/1AYmpr2ktk5lBGeYiEfzXuVp2_fwNUz5K

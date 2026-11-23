# Before the Shovels public demo

Serve this directory as the root of `bts.wtfos.app`. `index.html` is Clyde's r15b self-contained artwork with only its initial hash bootstrap changed. The public root page contains the canvas alone: no controls, captions, or loading note.

Every document load generates a new 64-digit `0x` hash and replaces any incoming `hash`, `seed`, or `payload` query value before the art engine starts. A page restored from the browser's back/forward cache reloads, so returning to the demo also chooses a fresh hash. The chosen hash is written to the URL and yields a deterministic render for that load. The public demo does not offer a fixed-link mode; opening a copied URL starts a new image. Other preview parameters, including `res`, remain in the URL. `res` affects pixel dimensions.

`contact/index.html` is the art-only contact sheet. Map the exact path `/contact` to that file (and optionally `/contact/`). It loads nine same-origin copies of the artwork at `res=400`, the engine's smallest supported resolution. Each tile appears when its canvas finishes, then the next tile starts. Every tile receives its own fresh hash; a reload or back/forward cache return regenerates the whole sheet.

## Provenance

- Artwork source: Clyde's r15b self-contained `index.html` in [the Drive handoff](https://drive.google.com/drive/folders/1CfZ6RAgXBq7qhWy9ITKDf1AEK8fSb4ci), file `1y8xRDhxTdJq5r8x-C7eca3ttNR_Au22n`
- Original artwork SHA-256: `3a62a1a1aa32c05c64f84f0b030d788e611a87ec688a9e1ffe2260b7de6d9e85`
- Public root SHA-256: `5fc9f6a7c5c7aab184a77101c6ffb5a84897ed0bf52b0e4d029a2f077685b5db`
- Contact sheet SHA-256: `fe9f0bbaf958dd634c9ec7e8506f184047f24d47646d69708314da086b41bd56`
- Renderer: browser Canvas 2D
- Seed: generated at each page load; shown in the resulting URL
- Resolution: `res` query value, or the artwork's default when omitted
- Related task: [issue #7](https://github.com/JoshuaFarnworth/TheOrangeGhostisClyde/issues/7)

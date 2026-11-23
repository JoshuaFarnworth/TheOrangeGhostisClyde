# Before the Shovels public demo

Serve this directory as the root of `bts.wtfos.app`. `index.html` is Clyde's r15b self-contained artwork with only its initial hash bootstrap changed. The public page contains the canvas alone: no controls, captions, or loading note.

Every document load generates a new 64-digit `0x` hash and replaces any incoming `hash`, `seed`, or `payload` query value before the art engine starts. The chosen hash is written to the URL and yields a deterministic render for that load. The public demo does not offer a fixed-link mode; opening a copied URL starts a new image. Other preview parameters, including `res`, remain in the URL. `res` affects pixel dimensions.

## Provenance

- Artwork source: Clyde's r15b self-contained `index.html` in [the Drive handoff](https://drive.google.com/drive/folders/1CfZ6RAgXBq7qhWy9ITKDf1AEK8fSb4ci), file `1y8xRDhxTdJq5r8x-C7eca3ttNR_Au22n`
- Original artwork SHA-256: `3a62a1a1aa32c05c64f84f0b030d788e611a87ec688a9e1ffe2260b7de6d9e85`
- Public demo SHA-256: `fdaa8376d3f5c3674c3c771421bf6729c36994ff8099486cf7e12bdf59820df0`
- Renderer: browser Canvas 2D
- Seed: generated at each page load; shown in the resulting URL
- Resolution: `res` query value, or the artwork's default when omitted
- Related task: [issue #7](https://github.com/JoshuaFarnworth/TheOrangeGhostisClyde/issues/7)

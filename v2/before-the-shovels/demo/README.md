# Before the Shovels public demo

Serve this directory as the root of `bts.wtfos.app`. `index.html` is Clyde's r15b self-contained artwork with only its initial hash bootstrap changed. The public root page contains the canvas alone: no controls, captions, or loading note.

Every document load generates a new 64-digit `0x` hash and replaces any incoming `hash`, `seed`, or `payload` query value before the art engine starts. A page restored from the browser's back/forward cache reloads, so returning to the demo also chooses a fresh hash. The chosen hash is written to the URL and yields a deterministic render for that load. The public demo does not offer a fixed-link mode; opening a copied URL starts a new image. Other preview parameters, including `res`, remain in the URL. `res` affects pixel dimensions.

`contact/index.html` is the art-only contact sheet. Map the exact path `/contact` to that file (and optionally `/contact/`). It loads nine same-origin copies of the artwork at `res=400`, the engine's smallest supported resolution. Each tile appears when its canvas finishes, then the next tile starts. Every tile receives its own fresh hash; a reload or back/forward cache return regenerates the whole sheet.

## Aspect routes

Route both `/ar/<w>x<h>` and the shorthand `/<w>x<h>` to the root `index.html`, preserving the requested browser path. The public bundle parses that path before rendering. Valid routes show only the artwork and get a fresh hash on every visit, reload, or back/forward cache return. The canvas, pixel grid, and physical snow scene use the requested ratio; nothing is stretched or cropped with CSS. The bare root remains Clyde's original 4:5 layout, and `/contact` retains nine default 4:5 tiles.

The input rule applies to the **entered pair before reduction**:

- Both components are positive decimal integers without leading zeroes, at most `8000` each. This matches the art renderer's existing maximum `res` value.
- If either component is `1`, the other can be `1`, `2`, or `3`. Otherwise, the larger component can be no more than twice the smaller. Thus `1x3`, `2x1` through `2x4`, and `9x16` work; `1x4`, `2x5`, and `2x6` are rejected.
- After validation, the pair is reduced by its greatest common divisor. The larger reduced component must be at most `1600`, the default long-side pixel budget. This keeps an exact integer canvas possible at the default resolution; e.g. `2x3` becomes `1066×1599`, while `9x16` becomes `900×1600`.

The renderer retains the original 20×25 metre world as a minimum and extends only the axis needed for the new ratio. Route canvases use a shared integer pixel factor, `max(1, floor(res / max(reducedWidth, reducedHeight)))`; `res` is clamped by the existing renderer to 400–8000. When `res` is smaller than the reduced component, the factor stays at one so the exact aspect is preserved. Invalid ratios show a short error and create no canvas. The host can additionally return HTTP 404 for rejected routes.

## Provenance

- Artwork source: Clyde's r15b self-contained `index.html` in [the Drive handoff](https://drive.google.com/drive/folders/1CfZ6RAgXBq7qhWy9ITKDf1AEK8fSb4ci), file `1y8xRDhxTdJq5r8x-C7eca3ttNR_Au22n`
- Original artwork SHA-256: `3a62a1a1aa32c05c64f84f0b030d788e611a87ec688a9e1ffe2260b7de6d9e85`
- Public root SHA-256: `1493b926f65c9d2f6b376727630fbce3aa10c9206152d7312bb5d10f66018854`
- Contact sheet SHA-256: `fe9f0bbaf958dd634c9ec7e8506f184047f24d47646d69708314da086b41bd56`
- Renderer: browser Canvas 2D
- Seed: generated at each page load; shown in the resulting URL
- Resolution: `res` query value, or the artwork's default when omitted
- Related task: [issue #7](https://github.com/JoshuaFarnworth/TheOrangeGhostisClyde/issues/7)

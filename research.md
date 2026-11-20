# Clyde: Research Foundations for a Code-Art Practice

*Compiled Nov 18, 2026. Sources are cited inline as [n] and listed at the end. Where a fact comes from general reference knowledge and not from a source opened during this pass, it is marked (gen.). Nothing in this file is invented: no exhibitions, sales, or provenance for Clyde.*

---

## 0. TL;DR

- Code art is a 60-year lineage with a clear canon. It runs from the Stuttgart plotter shows of 1965 (Nees, Nake), through Cybernetic Serendipity in 1968, Molnár, Mohr, Cohen's AARON, Processing in 2001, Tarbell and Hobbs, and Shadertoy and the demoscene, to Art Blocks and fxhash. Museums treat this history as serious art: LACMA *Coded* (2023), Whitney *Programmed* (2018–19) and *Harold Cohen: AARON* (2024), and the Centre Pompidou Molnár retrospective (2024) [1][9][10][12][13].
- In long-form work, every output gets minted and the artist can't cherry-pick. Respected work therefore has a high average and a high floor, real variety, and "collective unity" [21].
- On a technical level, the work has to be deterministic from a hash. That means a seeded PRNG, a fixed sequence of calls, and features that truly describe the output [6][7].
- The market changed. Art Blocks closed its Curated series in 2025 with Larva Labs' *Quine* and completed AB500 in Dec 2025. Primary minting is now spread across fxhash (Tezos/Base/ETH), Highlight (ETH/Base), Verse, objkt (Tezos secondary), and Art Blocks Studio/Engine [17][18][19][20][24].
- The opening for Clyde: use well-known techniques in combinations that are rarely seen together, show the code openly, keep the history honest, run a careful QA process across the whole output space, and offer plotter or physical editions.

---

## 1. History of computer and code art

### 1.1 The 1960s: the Algorists and the plotter
| Year | Event | Source |
|---|---|---|
| 1962 | A. Michael Noll starts making computer-generated art at Bell Labs | [4] |
| Feb 1965 | Georg Nees shows computer graphics in Stuttgart, organized by Max Bense. Bense's information aesthetics shaped both Nees and Nake | [3][5] |
| Apr 1965 | Noll and Béla Julesz show *Computer-Generated Pictures* at Howard Wise Gallery, NY | [4] |
| 1965 | Frieder Nake, *Hommage à Paul Klee 13/9/65 Nr.2*. A plotter drawing that applies Klee's proportions with random variables; now in the V&A | [2][14] |
| 1968 | Georg Nees, *Schotter*: a grid of squares that slides into disorder as randomness increases down the sheet. It is the canonical "order → chaos" piece | [5] |
| 1968 | **Cybernetic Serendipity**, ICA London (2 Aug–20 Oct), curated by Jasia Reichardt. Over 130 participants and about 60,000 visitors. It toured to the Corcoran and the Exploratorium | [1][15] |
| 1968 | Nake shows in *Tendencies 4*, Zagreb (New Tendencies/Bit International) | [3] |
| 1968 | Vera Molnár gets access to a computer at a Sorbonne lab and learns Fortran. Before that she ran her *machine imaginaire*, working algorithms by hand from the 1960s. She is known for "1% disorder" and her M series (Malevich, Mondrian, Molnár) | [8] |
| 1961 | John Whitney, *Catalog*: a 7-minute film made with an analog computer (the start of motion graphics) | [11] |

Key idea from Nake: "Each painter is a restricted picture generator. So is each picture generating computer program." [3]

### 1.2 The 1970s–90s: systems, AI, film
- **Manfred Mohr** started *Cubic Limit* in 1973. It treats the edges of a cube, and later hypercubes, as an alphabet of signs [11][16].
- **Harold Cohen, AARON**: a drawing program Cohen developed from 1972 until his death in 2016 (gen.), often drawing through plotters and turtles. The Whitney showed *Harold Cohen: AARON* from 3 Feb to 19 May 2024 with live plotters [10].
- **Lillian Schwartz**: Bell Labs from the late 1960s to 2002, making computer films and animation [11].
- **Molnár**: the Molnart software, made with François Molnár in 1976, and her first solo show *Transformations* in London that same year [8].
- **The demoscene** grew from the 1980s cracktros into real-time audiovisual "demos" written under hard size limits (4k/64k). Several countries now list it as national intangible heritage: Finland, Germany, Poland, Switzerland, the Netherlands, Sweden, France, and Norway. It is not on UNESCO's international list [25].
- **Truchet** (1704) and *10 PRINT* (Commodore 64; the 2012 book by Montfort et al.) give tiling and randomness a 300-year lineage that Clyde can quote [26].

### 1.3 2000s–2010s: creative coding goes open-source
- **Processing** was created in 2001 by Casey Reas and Ben Fry in the MIT Media Lab's Aesthetics and Computation group (John Maeda). **p5.js** followed in 2013, created by Lauren Lee McCarthy [27].
- **Casey Reas**: the *Process* series and software as a description of behaviour. He later did Art Blocks collaborations [17].
- **Jared Tarbell** (complexification.net): *Substrate* (2003), plus Sand Stroke, Happy Place, and others. These are emergent systems with simple rules, open source, and strongly influential [22].
- **Zach Lieberman**: co-creator of openFrameworks, and a daily-sketch practice running since 2016 that he treats as recorded experiments [28].
- **Anders Hoff (inconvergent)**: differential line and growth, and the essay series *On Generative Algorithms* [29].
- **Inigo Quilez**: SDF raymarching and domain warping. He co-founded **Shadertoy** with Pol Jeremias, launched Feb 2013 [30][31].
- **Olivia Jack, Hydra**: a browser live-coding video synth modelled on analog modular synths [32].
- **Tyler Hobbs**: essays on flow fields, probability distributions, color, and watercolor simulation [33][34].

### 1.4 2020s: on-chain long-form
- **Art Blocks** launched Nov 2020. Snowfro (Erick Calderon) wrote *Chromie Squiggle*. The first three projects were Squiggle, DCA's *Genesis*, and Jeff Davis's *Construction Token* [17][18].
- Landmark releases:
  - **Ringers**, Dmitri Cherniak, 31 Jan 2021, 1,000 editions: string wrapped around pegs [36]. Ringers #109 sold for 2,100 ETH on OpenSea in Oct 2021. Ringers #879 "The Goose" sold for $6.2M at Sotheby's in June 2023 (from the Three Arrows Capital collection) [37].
  - **Fidenza**, Tyler Hobbs, 11 Jun 2021, 999 editions: a flow field with collision-free curves [35].
  - **Archetype**, Kjetil Golid: 600 editions, praised for consistently high quality [21].
  - **Meridian**, Matt DesLauriers: 1,000 editions, plotter-like strokes [38].
  - **Loom**, Anna Lucia, 2021: a simulated four-shaft hand loom [39].
- Hobbs's essay **"The Rise of Long-Form Generative Art"** (Aug 2021) defines the genre's standards [21].
- **fxhash** launched on Tezos in Nov 2021 as an open platform. Its first token was ciphrd's generative logo [19].
- Art Blocks timeline: Playground and Factory opened in 2021 and closed in Oct/Nov 2022, when Presents and Explorations replaced them. The **Curated series ended** with *Quine* by Larva Labs (auction Oct 9, 2025), and AB500 finished in Dec 2025 [17][18][20].
- Museums: LACMA *Coded: Art Enters the Computer Age, 1952–1982* (Feb–Jul 2023, curator Leslie Jones, 100+ works by 75 artists) [9]. Whitney *Programmed: Rules, Codes, and Choreographies in Art, 1965–2018* (Sep 2018–Apr 2019) [12]. Molnár was in the 2022 Venice Biennale (*The Milk of Dreams*). She died 7 Dec 2023, and the Centre Pompidou retrospective *Parler à l'œil* ran 28 Feb–26 Aug 2024 [13].
- **Le Random** keeps a 1,000+ entry generative-art timeline. It is a good reference for checking facts [40].

---

## 2. Core techniques: description, origin, artists, minimal code

All sketches assume the starter's `R` rng (`R.rand()`, `R.range(a,b)`, and so on) in place of p5's `random()`, so outputs stay deterministic.

### 2.1 Random walks
A point that takes random steps. It goes back to early computer graphics and Noll's Bell Labs work [4]. Lévy flights (step lengths drawn from a power law) give clusters with occasional long jumps.
```js
let x=width/2, y=height/2;
for (let i=0;i<20000;i++){
  const a = R.int(0,3)*HALF_PI;          // lattice walk
  const nx = x+cos(a)*4, ny = y+sin(a)*4;
  line(x,y,nx,ny); x=nx; y=ny;
}
```

### 2.2 Plotter hatching and "order → disorder"
Parallel lines whose angle, spacing, or jitter grows across a grid. Era: Nees's *Schotter* and Molnár's *(Dés)Ordres* in the 1960s–70s [5][8]. Hatch density stands in for tone, which matters because pens can't make grey.
```js
const N=12, s=width/(N+2);
for (let j=0;j<N;j++) for (let i=0;i<N;i++){
  const chaos = j/N;                       // rises down the sheet, like Schotter
  push(); translate((i+1.5)*s,(j+1.5)*s);
  rotate(R.gaussian(0, chaos*0.6)); translate(R.gaussian(0,chaos*5),0);
  for (let k=-s/2;k<s/2;k+= 4+chaos*R.range(0,4)) line(-s/2,k,s/2,k);
  pop();
}
```

### 2.3 Truchet tiles
Square tiles with diagonals or quarter-circle arcs, each rotated at random. They date to Truchet (1704) and *10 PRINT* on the C64 [26].
```js
const s=40; noFill();
for (let y=0;y<height;y+=s) for (let x=0;x<width;x+=s){
  if (R.chance(0.5)) { arc(x,y,s,s,0,HALF_PI); arc(x+s,y+s,s,s,PI,PI+HALF_PI); }
  else { arc(x+s,y,s,s,HALF_PI,PI); arc(x,y+s,s,s,-HALF_PI,0); }
}
```

### 2.4 Recursive subdivision
Split rectangles or triangles over and over with random cuts. It echoes Mondrian and Molnár, and Hobbs wrote about "aesthetically pleasing triangle subdivision" [33]. Golid's work and many Art Blocks pieces use it.
```js
function sub(x,y,w,h,d){
  if (d>6 || w*h<900 || (d>2 && R.chance(0.2))) { rect(x,y,w,h); return; }
  const t = R.range(0.3,0.7);
  if (w>h) { sub(x,y,w*t,h,d+1); sub(x+w*t,y,w*(1-t),h,d+1); }
  else     { sub(x,y,w,h*t,d+1); sub(x,y+h*t,w,h*(1-t),d+1); }
}
sub(40,40,width-80,height-80,0);
```

### 2.5 Flow fields and Perlin noise
A vector field, usually angle = noise(x,y), that particles follow. Ken Perlin built Perlin noise for *Tron* in 1982–85 (gen.). Signature artists: Hobbs (*Fidenza*, plus his "Flow Fields" essay) and DesLauriers [33][35]. Fidenza's trick is that curves don't collide: test a spatial grid and stop a curve when it gets too close to another.
```js
noiseSeed(R.seed32);
for (let i=0;i<1500;i++){
  let x=R.range(0,width), y=R.range(0,height); beginShape();
  for (let s=0;s<80;s++){ vertex(x,y);
    const a = noise(x*0.003,y*0.003)*TAU*2; x+=cos(a)*2; y+=sin(a)*2; }
  endShape();
}
```

### 2.6 Circle packing
Fill an area with circles that don't overlap. Use a **fixed** number of attempts so the rng stays deterministic, as fxhash's own tutorial does [7]. Hobbs wrote "A Randomized Approach to Circle Packing" [33].
```js
const C=[];
for (let i=0;i<5000;i++){                       // fixed attempt count
  const c={x:R.range(0,width), y:R.range(0,height), r:R.pareto(3,1.4)};
  if (c.r<120 && C.every(o=>dist(c.x,c.y,o.x,o.y)>c.r+o.r+2)) C.push(c);
}
C.forEach(c=>circle(c.x,c.y,c.r*2));
```

### 2.7 L-systems
Aristid Lindenmayer (1968) used string rewriting to model plant growth. A turtle then draws the string. Prusinkiewicz and Lindenmayer's *The Algorithmic Beauty of Plants* (1990) is the classic text (gen.).
```js
let s='X'; const rules={X:'F+[[X]-X]-F[-FX]+X', F:'FF'};
for (let i=0;i<5;i++) s=[...s].map(c=>rules[c]||c).join('');
translate(width/2,height); const ang=radians(25+R.gaussian(0,2));
for (const c of s){ if(c==='F'){line(0,0,0,-3);translate(0,-3);}
  else if(c==='+')rotate(ang); else if(c==='-')rotate(-ang);
  else if(c==='[')push(); else if(c===']')pop(); }
```

### 2.8 Cellular automata and reaction-diffusion
Conway's Life (1970) and Wolfram's elementary CAs are the starting points (gen.). Turing (1952) predicted morphogenesis patterns, and the **Gray-Scott** model is the standard way to draw them: A is fed at rate f, B is killed at rate k, and A + 2B → 3B. A typical setting is f = 0.055, k = 0.062, D_A = 1.0, D_B = 0.5 [41].
```js
// one Gray-Scott step on Float32 grids A,B (size W*H), Laplacian lap()
for (let i=0;i<W*H;i++){
  const a=A[i], b=B[i], abb=a*b*b;
  A2[i]=a + (1.0*lap(A,i) - abb + f*(1-a));
  B2[i]=b + (0.5*lap(B,i) + abb - (k+f)*b);
}
// lap = 3x3 kernel: centre -1, edges .2, corners .05 (Karl Sims)
```
Run it as a fragment shader for speed (ping-pong framebuffers).

### 2.9 Voronoi and Delaunay
Split the plane into cells around seed points. Lloyd relaxation evens the cells out, and stippling art grows out of that approach (Secord's weighted Voronoi stippling, 2002, gen.). Use the `d3-delaunay` library.
```js
import { Delaunay } from 'd3-delaunay';
const pts = Array.from({length:400},()=>[R.range(0,W),R.range(0,H)]);
const v = Delaunay.from(pts).voronoi([0,0,W,H]);
for (const poly of v.cellPolygons()) { beginShape(); poly.forEach(p=>vertex(...p)); endShape(CLOSE); }
```

### 2.10 Differential growth
A closed polyline whose nodes push away from neighbours and stay attached to the nodes next to them. New nodes get inserted on long edges, so the line folds like coral or brain tissue. Anders Hoff (inconvergent) [29].
```js
// per step, for each node i:
//  attract toward midpoint of i-1,i+1 ; repel from all nodes within R (use a grid)
//  then: if dist(i,i+1) > maxEdge -> splice a new node at the midpoint
```

### 2.11 Strange attractors
Iterated maps such as Lorenz (1963), Clifford/De Jong (Pickover), and Hopalong. Plot millions of points as a density histogram, then tone-map it.
```js
let x=0.1,y=0.1; const a=R.range(-2,2),b=R.range(-2,2),c=R.range(-2,2),d=R.range(-2,2);
for (let i=0;i<2e6;i++){ const nx=sin(a*y)+c*cos(a*x), ny=sin(b*x)+d*cos(b*y);
  x=nx;y=ny; hist[idx(x,y)]++; }   // then log(hist) -> brightness
```
Sample a few parameter sets in QA first, since many choices collapse to a point.

### 2.12 SDF raymarching
Signed distance functions describe a scene, and sphere tracing renders it. This is demoscene and Shadertoy work, with Quilez's articles as the reference [30][31].
```glsl
float map(vec3 p){ return min(length(p)-1.0, p.y+1.0); }          // sphere + floor
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*res)/res.y; vec3 ro=vec3(0,0,-3), rd=normalize(vec3(uv,1.5));
  float t=0.; for(int i=0;i<100;i++){ float d=map(ro+rd*t); if(d<.001||t>20.)break; t+=d; }
  gl_FragColor=vec4(vec3(exp(-.15*t)),1);
}
```

### 2.13 Domain warping
Distort the coordinates fed into noise using more noise: `fbm(p + fbm(p))` (Quilez) [42].
```glsl
vec2 q = vec2(fbm(p), fbm(p+vec2(5.2,1.3)));
vec2 r = vec2(fbm(p+4.0*q+vec2(1.7,9.2)), fbm(p+4.0*q+vec2(8.3,2.8)));
float n = fbm(p + 4.0*r);   // colour by n, length(q), r.x
```

### 2.14 Particle physics
Verlet or Euler integration of forces: gravity, springs, attraction. Libraries include **matter.js** (rigid bodies) and Daniel Shiffman's *The Nature of Code* (gen.).
```js
for (const p of P){ const vx=(p.x-p.px)*0.99, vy=(p.y-p.py)*0.99+0.2;
  p.px=p.x; p.py=p.y; p.x+=vx; p.y+=vy; }   // verlet; then satisfy constraints
```

### 2.15 Boids and flocking
Craig Reynolds (1987) built flocking from three rules: separation, alignment, and cohesion (gen.). Drawing the trails instead of the birds turns the flock into calligraphy.
```js
for (const b of boids){ let sep=createVector(),ali=createVector(),coh=createVector(),n=0;
  for (const o of near(b)){ const d=p5.Vector.sub(b.pos,o.pos); sep.add(d.div(d.magSq()+1));
    ali.add(o.vel); coh.add(o.pos); n++; }
  if(n){ b.acc.add(sep.mult(1.5)).add(ali.div(n).sub(b.vel).mult(.05)).add(coh.div(n).sub(b.pos).mult(.01)); } }
```

### 2.16 Substrate-style crack growth
Jared Tarbell, 2003. A crack runs straight until it hits another crack or the edge. A new crack then starts at a random point on an existing crack, turned ±90° with about 2° of noise. A "sand painter" lays translucent grains of colour perpendicular to each crack, and the palette is sampled from a Pollock [22][23].
```js
// grid stores crack angle (or EMPTY). step:
x+=0.42*cos(t); y+=0.42*sin(t);
const g=grid[idx(x,y)];
if (g===EMPTY || abs(g-t)<5°) grid[idx(x,y)]=t; else { this.restart(); spawnCrack(); }
// restart: pick random cell with an angle a; t = a ± 90° + R.range(-2,2)°
```

### 2.17 Palettes and colour theory in gen-art
- Never use random RGB. Curate palettes by hand, or sample them from paintings, the way Tarbell sampled Pollock [22]. Hobbs's essays "Working with Color" and "Color Arrangement" describe weighted colour frequency: one dominant colour, a few secondaries, and rare accents [33].
- Use perceptual spaces (OKLab/OKLCH) for gradients. Quilez's cosine palettes, `a + b*cos(2π(c*t+d))`, are compact and shader-friendly (gen.).
- Make palette a named feature that collectors can talk about. Rare palettes work as a rarity lever, but they shouldn't be the only one.
- Paper texture, grain, and ink bleed help keep output from looking like "default canvas" work.

### 2.18 Probability distributions (an over-arching technique)
Uniform gives even coverage. Gaussian gives "about the same, with outliers," and it is Hobbs's default. Power law/Pareto gives many small items and a few large ones [34].

---

## 3. Libraries and tools

| Tool | Use | Notes |
|---|---|---|
| **Processing** (Java), 2001 | The canonical desktop sketching tool | Reas and Fry [27] |
| **p5.js**, 2013 | Browser Processing, the default for on-chain work | McCarthy [27]. Supported natively on Art Blocks, fxhash, and Highlight [43] |
| **three.js** | WebGL 3D scene graph and shaders | Good for SDF and post-processing pipelines |
| **regl / raw WebGL / GLSL** | Functional WebGL, fast shader ping-pong (reaction-diffusion, particles) | Smaller than three.js, which suits on-chain size limits |
| **matter.js** | 2D rigid-body physics | Falling and stacking systems |
| **canvas-sketch** | Matt DesLauriers' framework for print sizes, export, and seeds | Print-resolution focus [38] |
| **Paper.js** | Vector scene graph with boolean ops | Good for plotter SVG |
| **d3 / d3-delaunay** | Data viz, Voronoi, scales, colour interpolators | |
| **Hydra** | Live-coded video synth in the browser | Olivia Jack [32] |
| **TouchDesigner** | Node-based real-time visuals and installations | Desktop and commercial |
| **openFrameworks** | C++ creative coding | Lieberman et al. [28] |
| **AxiDraw** (Evil Mad Scientist) | Pen plotter, driven by `axicli file.svg` or Inkscape | [44] |
| **vpype** | SVG plotting pipeline: linemerge, linesort, layers | [45] |

SVG output rules for plotters: polylines only (no fills), one `<g>` layer per pen colour, mm units, and merge or sort lines to cut pen-up travel. Hatch fills have to be generated in code. The starter's `exportSVG()` follows these rules.

---

## 4. The on-chain generative market

### 4.1 Platforms (as of late 2025 / 2026)
- **Art Blocks** (Ethereum): the most prestigious name in the space. It had Curated, Playground, and Factory tiers, then Presents and Explorations from late 2022 [17][18]. The **Curated series closed in Oct 2025** with *Quine*, and **AB500** completed in Dec 2025. Its focus is now Studio, Engine, and tools such as PostParams [20][24]. Check current submission paths before planning a release.
- **fxhash** (launched Tezos Nov 2021, later multichain): open publishing that supports long-form and open-form work. It supplies `$fx.hash`, `$fx.rand()` (SFC32), `$fx.features()`, `$fx.params` (collector-set parameters), and `$fx.preview()` [6][7]. It is a low barrier and a good place to build a reputation. Recent projects price low, for example 2–3 tez mints [46].
- **Highlight** (Ethereum, Base, and other L2s): launched an open-access generative platform in July 2023 and supports on-chain p5.js on Base [43][47].
- **Verse**: a curated platform for digital and generative art with hash-seeded JS editions, Verse Studio, and embedded sales [48].
- **objkt.com** (Tezos): the main secondary marketplace since 2021 [19].

### 4.2 Long-form norms (technical)
1. **Determinism**: the same hash must give the same output on every device. Use only a hash-seeded PRNG, keep the number of calls fixed, keep results independent of window size, and watch for float issues [7].
2. **Features/traits** are derived from the PRNG and **must describe the visible output**. fxhash requires them to reflect the actual settings [6].
3. **Resolution independence**: draw in a virtual coordinate space. Make sure the preview is captured (`$fx.preview()`) and that rendering finishes in reasonable time.
4. **Edition size** has to match the algorithm's variety: "If you get bored flipping through the results, edition size should have been smaller" [21].
5. **Minimal dependencies**. On-chain libraries (p5 and three on Art Blocks and Highlight) favour small scripts [43].

### 4.3 What collectors and curators value
From Hobbs [21] and curatorial writing [17][49]:
- **A high floor and a strong average**, because every output is public. Good practice is systematic QA over thousands of renders. Fidenza took about 2 months of it.
- **Variety with unity**: every output adds something new, but the whole set reads as one idea.
- **A legible concept**. Tarbell: "The best algorithms… are the ones where the semantics are easily understood" [23]. Ringers fits in one sentence: string around pegs [36].
- **Lineage and literacy**: work that knowingly carries on the canon, as Meridian does with plotter strokes and Loom with weaving [38][39].
- **Craft details** such as texture, palette, and composition. Avoid the look of default noise.
- **Artist commitment**: consistent practice, writing, open process, and sharing code. Larva Labs' *Quine* is explicitly about code being freely readable [20].
- Physical tie-ins (plotter prints, textiles) carry growing weight, as with Anna Lucia [39].

### 4.4 Pricing tiers (observed and indicative, not advice)
- **Entry, open platforms** (fxhash Tezos): a few tez per mint, editions of about 50–500 [46]. Dutch auctions start high and fall to a reserve, which deters bots [46].
- **Mid** (Highlight, fxhash ETH/Base, Verse): mints usually range from fractions of an ETH or a few tens of dollars up to roughly 0.1+ ETH (gen., market-dependent; check live listings before setting prices).
- **Blue-chip secondary**: Ringers and Fidenza floors have recently been several to about 20 ETH (shown on the Art Blocks pages at the time of research [35][36]). Art Blocks' median sale was about $886 through Mar 2025 [46], which shows that most work trades far below headline prices.
- For a new pseudonymous artist, realistic advice is small editions, low mint prices, and fxhash or Highlight first, so the reputation builds before prices rise.

### 4.5 Respected work vs. low-effort output
| Respected | Low-effort / "slop" |
|---|---|
| A tuned, original algorithm, often a combination of techniques with a thesis | A tutorial flow field with a random palette |
| QA on the worst outputs | Cherry-picked previews, weak tails |
| Hand-curated palettes and textures | Random RGB, default stroke |
| Honest traits that track visuals | Hard-coded rarity bait |
| Process writing and shared code | No process, no history |
| Edition size fits the variety | 10k editions of near-duplicates |
| Clean determinism and performance | Breaks on mobile, different per device |

---

## 5. Recommended series directions for Clyde

Each direction combines established techniques in a pairing that is rarely seen. The historical reference is disclosed as homage, not claimed as provenance.

### 5.1 *Schotter Garden*: plotter disorder + reaction-diffusion
Nees and Molnár order→disorder grids (2.2), where each cell contains a Gray-Scott pattern (2.8). The f/k parameters drift down the sheet from spots to stripes to labyrinth. The final output is hatched vector contours of the RD field, so it can be plotted.
**Traits:** drift direction, RD regime, pen palette, rare "1% disorder" cell.

### 5.2 *Substrate Cartographies*: crack growth + domain-warped terrain
Tarbell-style cracks (2.16) grow across a Quilez domain-warped heightfield (2.13). Crack direction bends with the terrain gradient, and the sand-painter colour is sampled from the warp's colour bands. The cracks read like city plans laid over geology.
**Traits:** warp intensity, crack seed count, straight vs. curved, palette from a named painting.

### 5.3 *Cubic Weather*: Mohr's cube alphabet + strange attractors
Following Mohr's Cubic Limit (1.2), each glyph is a subset of cube or hypercube edges. The glyphs are placed and rotated along the orbit of a Clifford or De Jong attractor (2.11), and attractor density sets glyph scale. The result is constructivist signs carried on chaotic weather.
**Traits:** attractor family, cube vs. 4-cube, glyph count, monochrome vs. accent.

### 5.4 *10 PRINT Growth*: Truchet + differential growth
A Truchet maze (2.3) sets the walls, and a differential-growth line (2.10) grows only inside the corridors and folds against the tile edges. The 1704/C64 lineage meets organic growth. It can be animated in the browser and exported as a single continuous plotter line.
**Traits:** tile set (diagonal/arc/mixed), growth stage, line weight, rare "unbroken" (one line fills the whole maze).

### 5.5 *Phosphor Flocks*: boids + SDF raymarching (a demoscene homage)
Boid trails (2.15) become a smooth-union SDF tube field (2.12), raymarched in a CRT/phosphor look in the spirit of 4k demos. There is a hard size budget for the on-chain script, shown as a trait ("bytes").
**Traits:** flock size, rule weights (calm, murmuration, panic), phosphor colour, scanline mode.

### 5.6 *Loom of Fields*: flow fields + weaving drafts (optional sixth)
A flow field (2.5) is quantised into a weaving draft: threading, tie-up, and treadling. It refers to the Jacquard loom as computing's ancestor, and to Anna Lucia's *Loom* as prior art, which should be acknowledged openly to avoid looking derivative [39]. It works as a textile or plotter print.
**Traits:** shaft count, field turbulence, thread palette, draft symmetry.

**Suggested first release:** *Schotter Garden* or *10 PRINT Growth*. Both have strong historical hooks, both are naturally plottable, and both ship small. Start with a small fxhash or Highlight edition of 64–128.

---

## 6. Honest-catalog note
To build a catalog that spans the decades without misleading anyone: date each piece by when it was made (2026 onward), and label each series as an homage to an era. For example: "*Schotter Garden* (2026), after Nees 1968." Don't claim past exhibitions, sales, or collections. Provenance on-chain is public and gets checked.

---

## Sources
1. ICA, *Cybernetic Serendipity: A Documentation*. https://archive.ica.art/whats-on/cybernetic-serendipity-documentation/index.html
2. DAM, Nake, *Hommage à Paul Klee*. https://dam.org/museum/artists_ui/artists/nake-frieder/hommage-a-paul-klee/
3. Right Click Save, *Interview with Frieder Nake*. https://www.rightclicksave.com/article/an-interview-with-frieder-nake
4. DAM, A. Michael Noll. https://dam.org/museum/artists_ui/artists/noll-a-michael/
5. Geschichte der Informatik, *Georg Nees and Frieder Nake*. https://www.geschichte-der-informatik.de/articles/georg_nees_and_frieder_nake/ ; Syscoi, *Cybernetic Serendipity: History and Lasting Legacy*. https://stream.syscoi.com/2019/04/07/cybernetic-serendipity-history-and-lasting-legacy/
6. fxhash API reference. https://docs.fxhash.xyz/creating-on-fxhash/fxhash-api/api-reference
7. fxhash, *Deterministic randomness*. https://docs.fxhash.xyz/creating-on-fxhash/genart-in-the-browser/deterministic-randomness
8. Thaddaeus Ropac, Vera Molnár. https://ropac.net/artists/231-vera-molnar/
9. LACMA, *Coded*. https://www.lacma.org/art/exhibition/coded-art-enters-computer-age-1952-1982
10. Whitney, *Harold Cohen: AARON*. https://whitney.org/exhibitions/harold-cohen-aaron
11. Search summary covering Mohr, Schwartz, and Whitney (Monoskop *Mainframe Experimentalism*; emohr.com). https://monoskop.org/media/text/mainframe_experimentalism_2012/
12. Whitney, *Programmed*. https://whitney.org/exhibitions/programmed
13. Centre Pompidou, *Vera Molnár: Parler à l'œil*. https://www.centrepompidou.fr/fr/programme/agenda/evenement/PA7jRZ5
14. V&A, Nake *Hommage à Paul Klee*. https://collections.vam.ac.uk/item/O211685/hommage-a-paul-klee-13965-print-nake-frieder/
15. Studio International, *Cybernetic Serendipity 50th*. https://www.studiointernational.com/cybernetic-serendipity-50th-anniversary/
16. Manfred Mohr biography. https://www.emohr.com/biography.html
17. OpenSea, *What is Art Blocks*. https://opensea.io/blog/articles/what-is-art-blocks ; Art Blocks Medium guide. https://medium.com/the-link-art-blocks/a-brief-guide-to-curated-playground-and-factory-projects-on-art-blocks-f17283852350
18. Art Blocks, Playground page. https://www.artblocks.io/discover/playground
19. Le Random timeline, fxhash launch. https://timeline.lerandom.art/m/fx-hash-launches ; Jake Gallen, *History of NFT Marketplaces*. https://jakegallen.com/writing/history-of-nft-marketplaces-v2
20. Art Blocks, *Quine*, the final Curated release. https://www.artblocks.io/articles/quines-larva-labs-final-curated
21. Tyler Hobbs, *The Rise of Long-Form Generative Art* (2021). https://www.tylerxhobbs.com/words/the-rise-of-long-form-generative-art
22. Jared Tarbell, *Substrate*. https://www.jaredstarbell.com/algorithms/substrate/ (source: http://complexification.net/gallery/machines/substrate/appletl/substrate_l.pde)
23. Artnome, *Interview with Jared Tarbell*. https://www.artnome.com/news/2020/8/24/interview-with-generative-artist-jared-tarbell
24. Art Blocks, *The Final Three: AB500 Comes Full Circle* (Nov 2025). https://www.artblocks.io/articles/the-final-three-ab500-comes-full-circle
25. *Demoscene: The Art of Coding*. https://demoscene-the-art-of-coding.net/
26. Truchet originals. https://tungs.github.io/truchet-tiles-original/ ; JAEV notes. https://jaev.gallery/notes/truchet-tiles/
27. Processing overview. https://www.processing.org/overview/ ; Processing Foundation history. https://processingfoundation.org/about/history/
28. Zach Lieberman, *Daily sketches 2016*. https://zachlieberman.medium.com/daily-sketches-2016-28586d8f008e
29. inconvergent, *Differential Line*. https://inconvergent.net/generative/differential-line/
30. Shadertoy, About. https://www.shadertoy.com/about
31. Inigo Quilez, articles. https://iquilezles.org/articles/fbm/
32. Olivia Jack, Hydra. https://ojack.xyz/work/hydra/
33. Tyler Hobbs, essays index. https://www.tylerxhobbs.com/words/categories/essays
34. Tyler Hobbs, *Probability Distributions for Algorithmic Artists*. https://www.tylerxhobbs.com/words/probability-distributions-for-algorithmic-artists
35. Art Blocks, Fidenza. https://www.artblocks.io/collection/fidenza-by-tyler-hobbs
36. Art Blocks, Ringers. https://www.artblocks.io/collection/ringers-by-dmitri-cherniak
37. Sotheby's, Ringers #879 "The Goose." https://www.sothebys.com/en/articles/dmitri-cherniak-ringers-879-goose-lays-6-2m-golden-egg-at-generative-art-auction ; Ringers #109 report. https://nounft.com/2021/10/06/generative-art-ringers-109-nft-by-dmitri-cherniak-sells-for-6-94m-2100-eth/
38. Art Blocks, Meridian. https://www.artblocks.io/collection/meridian-by-matt-deslauriers ; *Notes on Meridian*. https://mattdesl.substack.com/p/notes-on-meridian
39. Anna Lucia interview (Loom). https://www.iillucid.com/slowing-down-with-anna-lucia-codes/
40. Le Random editorials. https://www.lerandom.art/editorials
41. Karl Sims, *Reaction-Diffusion Tutorial*. https://www.karlsims.com/rd.html
42. Inigo Quilez, *Domain Warping*. https://iquilezles.org/articles/warp/
43. Highlight docs, *Generative Art*. https://docs.highlight.xyz/concepts/generative-art/ ; on-chain tools. https://github.com/highlightxyz/generative-onchain-tools
44. AxiDraw CLI. https://www.axidraw.com/doc/cli_api/
45. vpype. https://github.com/abey79/vpype/
46. fxhash, *Pricing and supply* and *Primary market* docs. https://docs.fxhash.xyz/creating-on-fxhash/releasing-your-project/pricing-and-supply ; NonFungible, Art Blocks market history. https://nonfungible.com/market-tracker/artblocks/BLOCKS
47. Decrypt, *Highlight takes on Art Blocks* (2023). https://decrypt.co/150089/ethereum-generative-art-challenger-highlight-takes-on-art-blocks
48. Verse docs. https://docs.verse.works/projects/generative-verse/
49. Curated.xyz, *Collecting the Algorithm: Fidenza*. https://www.curated.xyz/editorial/collecting-fidenza

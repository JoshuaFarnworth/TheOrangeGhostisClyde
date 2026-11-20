/*
 * clyde starter — resolution-independent, hash-deterministic p5.js sketch.
 * Demo system: noise flow field + plotter-style polylines + Molnár-style "1% disorder".
 *
 * Keys:  s = save PNG   v = save SVG polylines (pen-plotter ready)   r = new hash (dev only)
 * Repro: open index.html?hash=0xabc...
 */
const HASH = ClydePRNG.resolveHash();
const R = ClydePRNG.makeRng(HASH);
const RP = R.fork('palette');   // separate stream for colour decisions
const RL = R.fork('layout');    // separate stream for geometry

// ---- palettes (curated by hand, never random RGB) ----------------------
const PALETTES = {
  'Bauhaus Paper':  { bg: '#f1ece1', ink: ['#1d1d1b', '#c8102e', '#004b87', '#f2a900'] },
  'Plotter Blue':   { bg: '#f4f1ea', ink: ['#1a2a6c', '#1a2a6c', '#3d5a99', '#b21f1f'] },
  'Night Phosphor': { bg: '#0b0f0c', ink: ['#7cff9b', '#3fbf6a', '#d6ffe0'] },
  'Riso':           { bg: '#f7f3e8', ink: ['#ff48b0', '#0078bf', '#ffe800', '#00a95c'] },
};

// ---- features: decided FIRST, from the rng, and they MUST drive the art --
const paletteName = RP.weighted([['Bauhaus Paper', 35], ['Plotter Blue', 35], ['Riso', 22], ['Night Phosphor', 8]]);
const density     = RL.weighted([['Sparse', 30], ['Balanced', 50], ['Dense', 20]]);
const turbulence  = RL.weighted([['Calm', 40], ['Drifting', 45], ['Storm', 15]]);
const disorder    = RL.chance(0.12); // rare trait: Molnár's "1% désordre", pushed up
const FEATURES = { Palette: paletteName, Density: density, Turbulence: turbulence, Disorder: disorder };

if (window.$fx && $fx.features) $fx.features(FEATURES);
window.features = FEATURES; // Art Blocks-style convention
console.log('hash', HASH, FEATURES);

// ---- geometry is computed ONCE in a fixed 1000x1250 "virtual" space -----
const VW = 1000, VH = 1250;
let LINES = []; // [{pts:[[x,y],...], col}]

function buildLines() {
  noiseSeed(R.seed32);            // p5 noise must be seeded too
  noiseDetail(4, 0.5);
  const pal = PALETTES[paletteName];
  const n = { Sparse: 350, Balanced: 900, Dense: 1800 }[density];
  const scale = { Calm: 0.0016, Drifting: 0.0028, Storm: 0.0055 }[turbulence];
  const steps = 120, stepLen = 3.2, margin = 80;
  for (let i = 0; i < n; i++) {     // fixed count -> fixed number of rng calls
    let x = RL.range(margin, VW - margin);
    let y = RL.range(margin, VH - margin);
    const col = RP.pick(pal.ink);
    const jitter = disorder && RL.chance(0.01) ? RL.range(0.5, 2) : 0;
    const pts = [];
    for (let s = 0; s < steps; s++) {
      if (x < margin || x > VW - margin || y < margin || y > VH - margin) break; // break is fine: no rng inside
      pts.push([x, y]);
      const a = noise(x * scale, y * scale) * TWO_PI * 2 + jitter;
      x += Math.cos(a) * stepLen;
      y += Math.sin(a) * stepLen;
    }
    if (pts.length > 4) LINES.push({ pts, col });
  }
}

function setup() {
  const s = Math.min(windowWidth / VW, windowHeight / VH);
  createCanvas(Math.floor(VW * s), Math.floor(VH * s));
  pixelDensity(2);
  buildLines();
  noLoop();
}

function draw() {
  const k = width / VW;
  background(PALETTES[paletteName].bg);
  noFill();
  strokeWeight(1.1 * k);
  for (const L of LINES) {
    const c = color(L.col); c.setAlpha(200); stroke(c);
    beginShape();
    for (const [x, y] of L.pts) vertex(x * k, y * k);
    endShape();
  }
  if (window.$fx && $fx.preview) $fx.preview(); // tell fxhash capture we're done
}

function windowResized() {
  const s = Math.min(windowWidth / VW, windowHeight / VH);
  resizeCanvas(Math.floor(VW * s), Math.floor(VH * s));
  redraw(); // geometry is cached; output identical at any size
}

// ---- SVG export for AxiDraw / vpype (mm units, A4-ish 200x250) ----------
function exportSVG() {
  const mmW = 200, mmH = 250, k = mmW / VW;
  const byCol = {};
  for (const L of LINES) (byCol[L.col] ||= []).push(L);
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${mmW}mm" height="${mmH}mm" viewBox="0 0 ${mmW} ${mmH}">\n`;
  let layer = 1;
  for (const col in byCol) { // one <g> per pen colour = one plotter layer
    out += `<g id="layer${layer}" inkscape:groupmode="layer" inkscape:label="${layer} ${col}" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" stroke="${col}" fill="none" stroke-width="0.3">\n`;
    for (const L of byCol[col]) {
      out += `<polyline points="${L.pts.map(p => (p[0] * k).toFixed(2) + ',' + (p[1] * k).toFixed(2)).join(' ')}"/>\n`;
    }
    out += '</g>\n'; layer++;
  }
  out += '</svg>';
  saveStrings(out.split('\n'), `clyde-${HASH.slice(0, 10)}`, 'svg');
}

function keyPressed() {
  if (key === 's') saveCanvas(`clyde-${HASH.slice(0, 10)}`, 'png');
  if (key === 'v') exportSVG();
  if (key === 'r') location.search = '';
}

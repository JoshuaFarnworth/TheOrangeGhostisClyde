/* world.js: Sediments world timelines (data only). Pick with SED_WORLD (default 'A', pending Joshua's choice).
 * An era maps a span of progress units P to a span of world years (CE; negative = BCE), piecewise-linear.
 * events: [key, weight] chosen by each mint's hash. fauna: species for grazing/death. bg: background sediment.
 * Event keys understood by the engine: quiet graze death flood drought fire loess frost outwash blackmat camp
 * midden burial dogburial pit house plough fence litter tyre car beaver sandblow lost cinders. */
var WORLDS = {
  A: { name: 'The Lick', place: 'a floodplain beside a salt spring, mid-continent North America (modelled on Ohio Valley licks)',
    base: [['gravel', 1.4], ['sand', 1.1], ['pond', 2.2], ['sand', 0.9], ['gravel', 1.6], ['sand', 0.8], ['silt', 0.7], ['mud', 0.25], ['sand', 0.4], ['silt', 0.9], ['mud', 0.3], ['silt', 1.0]],             // pre-existing ground, bottom -> top (m)
    waterTable: 1.1,                                                      // m below the surface (waterlogged + anoxic below)
    eras: [
      { key: 'prologue', name: 'Prologue: the mammoth summer', P: [0, 25], Y: [-28000, -27988], veg: 'steppe', climate: 'cold', bg: 'silt', rate: 1.1, accr: 0.3,   // accr: spring-mire mud accretion at the lick, m/yr (chosen, see README)
        events: [['quiet', 22], ['graze', 30], ['death', 12], ['flood', 18], ['drought', 10], ['loess', 8]],
        fauna: [['mammoth', 40], ['bison', 30], ['horse', 20], ['wolf', 10]] },
      { key: 'steppe', name: 'Late Pleistocene steppe', P: [25, 170], Y: [-27988, -12700], veg: 'steppe', climate: 'cold', bg: 'loess', rate: 0.9, soils: [[-26400, 0.55], [-24900, 0.45], [-23300, 0.6], [-20600, 0.35], [-17200, 0.5], [-14700, 0.8]],   // schematic interstadial soils (D-O-like, not dated)
        events: [['quiet', 30], ['loess', 20], ['graze', 14], ['flood', 12], ['outwash', 6], ['frost', 4], ['death', 5], ['drought', 6], ['fire', 2], ['lost', 0.3]],
        fauna: [['mammoth', 35], ['mastodon', 15], ['bison', 25], ['horse', 20], ['wolf', 5]] },
      { key: 'lateglacial', name: 'Late Glacial: the end of the megafauna', P: [170, 250], Y: [-12700, -9700], veg: 'parkland', climate: 'cool', bg: 'silt', rate: 1.0, soils: [[-12000, 0.7]],
        events: [['quiet', 28], ['flood', 16], ['camp', 14], ['death', 6], ['graze', 10], ['blackmat', 8], ['fire', 6], ['drought', 4], ['lost', 0.3]],
        fauna: [['mammoth', 20], ['mastodon', 20], ['bison', 35], ['horse', 10], ['deer', 15]], lastMegafauna: -11000 },
      { key: 'archaic', name: 'Archaic forest', P: [250, 410], Y: [-9700, -1000], veg: 'forest', climate: 'mild', bg: 'silt', rate: 1.2, soils: [[-8200, 0.6], [-6000, 0.75], [-3800, 0.6], [-2200, 0.8]],
        events: [['quiet', 30], ['flood', 18], ['camp', 14], ['midden', 6], ['fire', 6], ['death', 4], ['graze', 6], ['drought', 3], ['dogburial', 1], ['burial', 0.7], ['sandblow', 0.3], ['lost', 0.3]],
        fauna: [['deer', 60], ['bison', 15], ['wolf', 10], ['bear', 15]] },
      { key: 'woodland', name: 'Woodland and Mississippian', P: [410, 520], Y: [-1000, 1500], veg: 'forest', climate: 'mild', bg: 'silt', rate: 1.3,
        events: [['quiet', 26], ['flood', 18], ['camp', 10], ['pit', 10], ['house', 7], ['fire', 6], ['death', 3], ['midden', 3], ['burial', 0.7], ['sandblow', 0.3], ['lost', 0.3]],
        fauna: [['deer', 70], ['dog', 15], ['bear', 15]] },
      { key: 'farm', name: 'Farm', P: [520, 640], Y: [1500, 1900], veg: 'pasture', climate: 'mild', bg: 'silt', rate: 1.6,
        events: [['quiet', 20], ['plough', 18], ['fence', 12], ['flood', 14], ['graze', 10], ['death', 5], ['litter', 8], ['fire', 3], ['sandblow', 0.3], ['lost', 0.3]],
        fauna: [['cow', 45], ['horse', 25], ['pig', 20], ['dog', 10]], fenceKinds: ['split rail', 'post and wire'] },
      { key: 'modern', name: 'Modern', P: [640, 800], Y: [1900, 2027], veg: 'pasture', climate: 'mild', bg: 'silt', rate: 2.0,
        events: [['quiet', 22], ['flood', 12], ['plough', 10], ['fence', 10], ['litter', 14], ['graze', 8], ['death', 4], ['cinders', 5], ['tyre', 1.5], ['car', 0.4], ['lost', 0.3]],
        fauna: [['cow', 45], ['deer', 25], ['dog', 15], ['horse', 15]], fenceKinds: ['barbed wire', 'chain-link'], bigFlood: 1937 },
      { key: 'future', name: 'Near future (speculative)', P: [800, 1e9], Y: [2027, 2027 + (1e9 - 800)], veg: 'scrub', climate: 'warm', bg: 'silt', rate: 2.2,
        events: [['quiet', 24], ['flood', 22], ['beaver', 8], ['litter', 6], ['death', 4], ['fire', 6], ['graze', 6], ['tyre', 1], ['car', 0.5], ['lost', 0.3]],
        fauna: [['deer', 60], ['dog', 10], ['beaver', 10], ['cow', 20]] }
    ] },
  // B and C are drop-in tables (see WORLD.md). Their species/objects reuse the engine's vocabulary where it exists;
  // dinosaurs etc. would need their own rigs before B is renderable at quality.
  B: { name: 'Badlands', place: 'eastern Montana river floodplain (Hell Creek -> Fort Union)', base: [['sand', 1.0], ['mud', 0.8]], waterTable: 1.4,
    eras: [
      { key: 'prologue', name: 'A river in the Maastrichtian', P: [0, 25], Y: [-66050000, -66049990], veg: 'fern', climate: 'warm', bg: 'mud', rate: 1.4, events: [['quiet', 30], ['flood', 25], ['death', 15], ['graze', 20]], fauna: [['bison', 100]] },
      { key: 'cretaceous', name: 'Late Cretaceous', P: [25, 300], Y: [-66049990, -66000000], veg: 'fern', climate: 'warm', bg: 'mud', rate: 1.4, events: [['quiet', 30], ['flood', 25], ['death', 8], ['fire', 4]], fauna: [['bison', 100]] },
      { key: 'paleocene', name: 'Paleocene coal swamps', P: [300, 460], Y: [-66000000, -61000000], veg: 'swamp', climate: 'warm', bg: 'peat', rate: 1.0, events: [['quiet', 40], ['flood', 20], ['blackmat', 20]], fauna: [['deer', 100]] },
      { key: 'gap', name: 'The long gap', P: [460, 500], Y: [-61000000, -2600000], veg: 'steppe', climate: 'mild', bg: 'silt', rate: 0.05, events: [['quiet', 100]], fauna: [['deer', 100]] },
      { key: 'ice', name: 'Ice', P: [500, 640], Y: [-2600000, -12000], veg: 'steppe', climate: 'cold', bg: 'loess', rate: 0.9, events: [['quiet', 30], ['outwash', 20], ['frost', 10], ['graze', 15], ['death', 5]], fauna: [['mammoth', 50], ['bison', 50]] },
      { key: 'plains', name: 'Plains', P: [640, 720], Y: [-12000, 1880], veg: 'steppe', climate: 'mild', bg: 'loess', rate: 1.0, events: [['quiet', 30], ['graze', 25], ['fire', 15], ['camp', 15], ['death', 6]], fauna: [['bison', 100]] },
      { key: 'ranch', name: 'Ranch', P: [720, 1e9], Y: [1880, 1880 + (1e9 - 720)], veg: 'pasture', climate: 'mild', bg: 'silt', rate: 1.5, events: [['quiet', 30], ['fence', 20], ['graze', 20], ['litter', 10], ['death', 5]], fauna: [['cow', 70], ['horse', 30]], fenceKinds: ['barbed wire'] }
    ] },
  C: { name: 'After Us', place: 'a suburban cul-de-sac (the Before the Shovels street)', base: [['made', 0.5], ['silt', 1.0]], waterTable: 1.6,
    eras: [
      { key: 'prologue', name: 'One winter', P: [0, 25], Y: [2027, 2032], veg: 'lawn', climate: 'cold', bg: 'silt', rate: 0.8, events: [['quiet', 40], ['litter', 30], ['death', 5], ['flood', 10]], fauna: [['dog', 50], ['deer', 50]] },
      { key: 'abandon', name: 'Abandonment', P: [25, 200], Y: [2032, 2200], veg: 'scrub', climate: 'warm', bg: 'silt', rate: 1.5, events: [['quiet', 30], ['flood', 25], ['litter', 15], ['car', 2], ['tyre', 3], ['fire', 6]], fauna: [['deer', 70], ['dog', 30]] },
      { key: 'forest', name: 'Forest over ruins', P: [200, 400], Y: [2200, 3000], veg: 'forest', climate: 'warm', bg: 'silt', rate: 1.2, events: [['quiet', 50], ['flood', 25], ['beaver', 10], ['fire', 6], ['death', 4]], fauna: [['deer', 80], ['beaver', 20]] },
      { key: 'quiet', name: 'Long quiet', P: [400, 700], Y: [3000, 50000], veg: 'forest', climate: 'mild', bg: 'silt', rate: 1.0, events: [['quiet', 60], ['flood', 25], ['fire', 8], ['death', 4]], fauna: [['deer', 100]] },
      { key: 'ice', name: 'Next ice', P: [700, 1e9], Y: [50000, 50000 + (1e9 - 700) * 70], veg: 'steppe', climate: 'cold', bg: 'loess', rate: 0.9, events: [['quiet', 40], ['loess', 25], ['frost', 10], ['outwash', 10], ['graze', 10]], fauna: [['bison', 60], ['horse', 40]] }
    ] }
};

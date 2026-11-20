
---

# Sediments: platform findings, mechanics, honest status

Sediments is **project 25, injected by Joshua** [his brief, 2026-11-20]. The world timeline is in `WORLD.md`, with options A, B and C. **Option A, "The Lick", is the working default, pending Joshua's choice.** Progress log: `LOG.md`.

## 1. What token N needs, and who can give it

Joshua's requirements, in short:
- every mint's **transaction hash** decides what that mint adds;
- the **real time between mints** decides how much world time passes;
- token N is drawn from the **whole history** `[{index, hash, timestamp}]` for mints 1..N;
- token N's own art is fixed forever, and later mints only extend the timeline for later tokens.

| Platform | What the generator receives | Full 1..N history? | Source |
|---|---|---|---|
| **Aleatory** (Tezos) | `$alea.seed` (the base58 mint operation hash) plus collector-signed params. The clock is frozen to 0 and the network is blocked. No token id, no timestamp, no other mints. | **No.** Params are signed by the collector, so they can't be trusted to carry history. | aleatory.art/docs/interface (ALEATORY-001 §7), saved in `research/alea-interface.txt` |
| **Highlight** | `hl.tx`: hash, timestamp, tokenId, mintIteration, blockNumber, gas and similar fields, all for **its own tx only** | **No** | github.com/highlightxyz/generative-art (README), `research/hl-readme.txt` |
| **Verse** | `{hash, editionNumber, totalEditions, input}`. Sales and hashes are off-chain. | **No** | Verse generative docs, read in the earlier session (URL not retained; re-check) |
| **Art Blocks, Engine Flex** | `tokenData = {hash, tokenId}` plus `externalAssetDependencies` (ONCHAIN / BytecodeStorage). **PostParams** can be set per token, and augmentation hooks or custom hook contracts can inject live on-chain data. | **Yes, in principle**: a custom hook could inject the packed history. It needs the Art Blocks team, Solidity and their approval. | docs.artblocks.io/protocol/postparams/ and docs.artblocks.io/protocol/on-chain-generator/, `research/ab-*.txt` |
| **fxhash open-form** | `$fx.lineage` (ancestor hashes, no timestamps) | Partly. fxhash is now closed. | earlier session reading |
| **Custom contract** (EVM or Tezos) | Whatever we store | **Yes** | see below |

**Hard constraints:**
- An EVM contract **cannot read its own transaction hash**. There is no opcode for it; EIP-901 was never adopted.
- A Michelson contract can't read its operation hash either. This is from knowledge and should be verified before relying on it.
- So a *literal* tx hash only exists **after** the tx, in chain history, and has to come from a node or indexer. Aleatory gets its own seed this way.
- What a contract *can* do is derive a per-mint seed in the same tx: `seed_i = keccak256(seed_{i-1}, prevrandao, blockhash(n-1), minter, tokenId)`. That is a hash chain, decided by the mint transaction and unpredictable to the artist.

**Storage cost** (exact protocol figures; the totals are simple arithmetic):
- EVM: a new storage slot costs 22,100 gas (EIP-2929 cold SSTORE zero to nonzero), and a cold read costs 2,100 gas.
- Packing a 27-byte seed and a uint40 timestamp into **one slot** gives about 22k extra gas per mint.
- On an L2 such as Base that is a small fraction of a mint fee. Multiply by the current gas price at launch; no price is assumed here.
- A view returning all N records is about N × 2,100 gas: around 21M for 10,000 mints. That is within the default `eth_call` gas cap of common nodes (geth: 50M; from knowledge).
- Tezos: storage is burned at 250 mutez per byte. About 37 bytes per mint is about 0.009 tez, plus big_map overhead.

**Options compared:**
- **(A) Custom contract stores `{seed, timestamp}` per mint**, and a view emits the packed history 1..N (`sed1:` format, 80 hex characters per mint).
  - The history is append-only, so the entries for token N **never change**, and token N's image is immutable by construction.
  - Rendering needs one `eth_call` on current state. No indexer, no archive node.
  - The literal tx hashes go into metadata as provenance.
- **(B) Renderer fetches history from an indexer or RPC at view time.** This is fragile: the indexer has to outlive the art, and most venues block network access.
- **(C) Frozen snapshot.** At mint or reveal, the history 1..N is written into token N's HTML or metadata (IPFS or Arweave).
  - This is the most portable buyer file, but the snapshot writer is an artist-run, trusted process.
  - It is good as a *second* copy next to (A). `tools/dist.js` builds exactly this file.
- **(D) Art Blocks Engine Flex**, using a custom PostParams hook that injects the packed history.
  - It is the best "real platform" path, but it isn't self-serve.
  - The engine already reads the ONCHAIN `sed1:` dependency.

**Recommendation:**
- Use **(A) plus (C)**: a small custom ERC-721 on an L2, or Tezos FA2 if Joshua prefers.
- Each mint stores a packed `{chain seed, timestamp}`. `tokenURI` or a view returns the history 1..N for the renderer.
- Each token's metadata also carries a frozen snapshot and the literal tx hashes of 1..N as provenance.
- Aleatory, Highlight and Verse cannot give token N the earlier mints, so none of them can host Sediments as specified.
- If Joshua insists on the *literal* tx hash as the seed (rather than a chain seed derived inside the tx), (C) becomes mandatory: an artist-run indexer writes each snapshot once, and the trust model has to be stated publicly.
- **Nothing has been deployed, minted or published.**

## 2. The engine's history adapter

`src/main.js` reads history in this priority order:
1. `window.SEDIMENTS_HISTORY` (snapshot)
2. Art Blocks `externalAssetDependencies` ONCHAIN `sed1:<hex>` (chain)
3. `?history=` as sed1 or base64 JSON (param)
4. otherwise a simulated run seeded by `?hash=` (labelled `History: Simulated`)

`?token=N` slices the history. The trait `History` always says which source was used.

## 3. Mechanics (real rules, stated conceits)

- **World clock:**
  - Each mint adds progress `p = 0.05 + 0.7·ln(1 + gap/8 h) + 0.5·(gap/day)^0.9·s(gap)`, where `s` ramps from 0 at half a day to 1 at two days. The last term is the **dormancy term** (added in round 2): pauses of days to months move the world on by centuries to millennia.
  - An era table (data, in `src/world.js`) maps progress to a world year. Bursts make many thin, similar beds; long silences make thick blank beds and buried soils.
  - **Pacing change in round 2 (stated):** background thickness is now `r·Δyears` (linear; it was `r·Δyears^0.6`, Sadler-style) plus, in the Prologue only, spring-mire accretion of 0.3 m/yr (capped at 50 yr per mint). This is a deliberate legibility choice: with the Sadler exponent a 4-month pause left a bed ~0.1 m thick, invisible in a 20 m section. Sadler's (1981) rate-vs-timespan effect is now carried only by the episodic event beds and the buried soils, not by the background. In the dormant-timing test run, the 122-day and 61-day pauses leave blank loess beds of 3.1 m and 2.1 m; the thickest non-base bed in the steady run is 0.27 m.
  - Long pauses also leave a buried soil (strength `log10(Δyears/25)/2`), and the Steppe, Late Glacial and Archaic eras have a schematic schedule of interstadial / Holocene soils in `src/world.js` (schematic Dansgaard–Oeschger-like spacing, **not** dated to real events).
- **Surface event per mint:** chosen by the mint's hash from the current era's weighted list. If the previous mint was under 3 hours earlier, there's a 42% chance the event repeats.
  - The event leaves its own deposit: flood silt, a charcoal seam, a hearth lens, a bone bed, a plough zone and so on.
  - Deaths and burials are capped per world-year.
- **Decay:** decay stages follow Payne 1965 (fresh, bloat, active, advanced, dry, remains).
  - Burial slows decay, with buried pigs reaching dry/remains in about a year (Rai et al. 2022). Cold and waterlogging slow it further.
  - Anoxia slows decay but doesn't stop it (Allison 1988).
  - Exposed carcasses are scavenged quickly.
  - Bones that stay exposed weather through Behrensmeyer (1978) stages 1–5 over about 15 years.
  - Rot leaves a dark "cadaver decomposition island" stain below the body (Carter & Tibbett).
- **Anatomy (round 2, `src/fauna.js`):** one rig per animal (dorsal line, vertebral column, neck, head axis, jointed legs, tail) drives both the flesh and the skeleton, so the hide and the bones always agree. Proportions are in body lengths per species, drawn from general anatomical knowledge rather than measured specimens. The mammoth has a domed head, shoulder hump and sloping back, spiralled tusks, hair skirt and trunk. The skeleton has a skull with orbit, nasal opening and tusk alveoli, a mandible, cervical/thoracic/lumbar/sacral/caudal vertebrae with tall anterior thoracic spines, ribs, scapula, pelvis with acetabulum and obturator foramen, and limb bones with flared articular ends and bilobed distal condyles.
- **Visible decay sequence:** a decay index `t = D/√(length/2)` (degree-days scaled for body size) drives bloat (rounded, raised back), then collapse onto the burial surface, the hide splitting along the flank, hair slipping in patches, scavenger hair tufts on the ground near the carcass, holes opening onto the ribs, leathery dried hide, then bare bone.
- **Disarticulation order** follows Hill (1979) and Hill & Behrensmeyer (1984), as remembered, not re-checked this session: forelimb with scapula first (no bony joint to the trunk), then the feet and tail, the skull and mandible, the hind limbs, the ribs, then pelvis, vertebral column and neck last. Each unit lets go at its threshold, drifts (more if the carcass lay exposed), turns to lie flat along its long axis and rests on the burial surface of that moment. Small bones may be lost. Units held below the mud line stay articulated and upright.
- **Collapse:** once decay is advanced, unsupported parts fall onto the burial surface of that moment. Parts held in mud stay articulated, so a mired mammoth ends as legs upright in the clay with a collapsed rib cage above.
- **Compaction:** Athy-style exponential compaction with depth. Wood and peat compact more; peat to lignite compacts 2:1 to 4:1 (Widera).
- **Water table:** gleyed colours below it and rust mottles in the capillary fringe. Wood survives below it, and decay there runs at ×0.25.
- **Diagenesis (a stated conceit):**
  - 30,000 years is far too short for permineralisation, coal or oil. The oil window is about 60–120 °C at roughly 2 km depth and beyond (Earle, *Physical Geology* 20.3).
  - So fossilisation states use an explicit **compressed geological clock**: `G = 1000 × world years + 2000 × mints since burial`.
  - Thresholds: permineralised above 2×10⁵ if wet, replaced above 3×10⁶, kerogen stain above 10⁶. Permineralised bone is drawn mid-brown and replaced bone dark brown.
  - Any token that uses it carries the trait `Clock: Compressed (stated)`. It can be switched off for strict realism.

## 4. Traits (each one describes what is in the picture)

| Trait | What it reports |
|---|---|
| World | which world option (A, B or C) |
| Era | the current era of that world |
| World Date | the world date |
| Surface | this mint's event |
| Before This Mint | the real gap before this mint, in words |
| Mints Beneath | how many earlier mints lie under this one |
| Remains In View | up to 3 remains in this window, each with the state that is drawn: fresh carcass, bloated carcass, active decay, advanced decay, skeletonising, scattered bones, bones (buried), stained bones (buried), permineralised bone, replaced fossil |
| Deepest State | the most advanced state among the drawn remains, ranked: Soft Tissue < Bone < Stained Bone < Permineralised Bone < Replaced Fossil < Kerogen Stain (the last three are labelled "Compressed Clock"); "No Remains In View" if there are none |
| Clock | Real Rates or Compressed (stated) |
| History | Snapshot, Chain, Param or Simulated |
| Depth Shown | how deep the section in view goes |

## 5. Tools

| Tool | What it does |
|---|---|
| `tools/mk.sh` | builds `src/art.js` from px.js, world.js, fauna.js and main.js, and prints its SHA-256 |
| `tools/fauna-preview.js` | flat flesh/skeleton previews of the anatomy rigs |
| `tools/history.js` | simulated runs (steady, bursty, dormant, launch) with realistic-format hashes |
| `tools/render.js hist.json N res out.png` | headless render (token N, history 1..N injected as a snapshot) |
| `tools/batch.sh` | parallel renders, each logged as it lands |
| `tools/sheet.py` | labelled sheets |
| `tools/dist.js [hist N]` | `dist/sediments.html` and a snapshot buyer file |
| `histories/steady-hashes-{bursty,dormant}-timing.json` | the same hashes as steady with different timestamps, for the timing comparison |

## 6. Outputs

| Output | Path |
|---|---|
| Timeline (steady run) | `timeline/timeline-steady.png` |
| Timing comparison | `compare/compare-timing.png` |
| Contact sheet | `contact-sheet-runs.png` |
| Heroes | `heroes/` |
| Single renders and JSON | `timeline/`, `compare/`, `samples/` |
| v1.1 renders and source (superseded) | `_archive/out_v1.1/`, `_archive/src_v1.1/` |

*Template note:* the generic "Outputs" and "Risks" lines above come from the shared studio template, and two of them don't apply to Sediments:
- Sediments heroes are rendered headless by `tools/render.js`, not by Chrome from `dist/aleatory/`.
- The Aleatory 32 KB cap is irrelevant because this is not an Aleatory piece. The generator is now about 150 KB, which on EVM would be stored as about 110 KB of SSTORE2 bytecode (code deposit 200 gas per byte, about 22M gas, from knowledge).

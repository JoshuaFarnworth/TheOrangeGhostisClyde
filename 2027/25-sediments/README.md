# Jun - Sediments  (`2027/25-sediments/`)

Project 25, injected by Joshua. A trench face cut into one floodplain beside a salt spring. Every mint lays down its own layer, and its transaction hash decides what was happening on the surface at that moment of the world's history: a mammoth mired at the lick, a flood, a grass fire, a hearth, a fence line. Later tokens show the same things buried under everything that came after: rotting, collapsing, staining the mud, turning to bone and (on a stated, compressed clock) to fossil. Fast minting packs similar beds together; long silences leave thick blank layers and buried soils.

- **Thesis:** Every mint is a day in one place's deep history, and every later mint buries it.
- **1. In one sentence (no technique):** A cross-section of the ground under a salt lick, showing what each day left behind and what became of it.
- **2. Generative rule:** Token N is computed from the whole mint history 1..N: each mint's hash picks its surface event (era-constrained, honest trait) and the deposit it leaves; the real gap before each mint advances world time via p = 0.05 + 0.7 ln(1 + gap/8h) through a data-driven era table (Option A: 28,000 BCE to the present and beyond); background thickness = r * dYears^0.6 (Sadler); decay follows Payne stages slowed by burial, cold and waterlogging, then Behrensmeyer bone weathering, cadaver-decomposition stains, Athy compaction, water-table gley and rust; unsupported remains collapse onto the burial surface of the day. Fossilisation runs on an explicit compressed clock, flagged as a trait.
- **3. Composition, material, motion:** Landscape 5:4 trench face, 6 m wide window into a 14 m site, surface and sky at the top. Late tokens zoom out to show depth. Material: silts, sands, loess, gravel, soils, bone, ivory, charcoal, wood. Motion: none.
- **4. Meaningful variation:** Real timing of the mint run (bursts vs dormancy), each mint's hash (event, species, position), the era reached, the window offset, the history source.
- **5. Collector deliverable:** Token N's HTML with the history 1..N frozen inside it (built by tools/dist.js) plus a contract view that re-emits the same packed history; 1600 px PNG; the literal tx hashes of 1..N in metadata.
- **6. Buyer / channel:** Needs a custom contract (L2 ERC-721 or Tezos FA2) storing a per-mint {seed, timestamp}; Aleatory, Highlight and Verse cannot supply earlier mints. Art Blocks Engine Flex PostParams hook is the platform alternative. Low price, thousands of editions (Joshua).
- **7. Unresolved artistic risk:** Animal rendering may never reach photographic restraint; the full-history requirement rules out Aleatory/Highlight/Verse and needs a custom contract (or an Art Blocks Flex hook); the Native archaeology eras need an ethics review.
- **Nearest prior art and difference:** Stratigraphic and archaeological section drawings, Big Bone Lick and La Brea-type mire finds, Before the Shovels (its own trace-not-people stance). Difference: the section is built by the collectors' actual mint history, so the collection's timing is the geology.
- **Restraint:** No living people, only traces; one surface event per mint; deaths capped per world-year; no sacred objects or named cultures; muted earth palette.
- **Edition / price:** Thousands of editions at a very low price (Joshua); exact numbers TBD.
- **Platform: custom contract recommended (see README platform section); nothing deployed, minted or published**
- **Studio target:** Jun 2027 (a studio target, not a public launch commitment)
- **Status:** Round 1 (engine v1.1; world option pending Joshua) -- honest grade: **promising**
- **Source snapshot (SHA-256 of src/art.js):** `d265b92621f4762cf16a247b220535f0f3ce54b03edc912bfa36da50893eb9a6`

## References to check
Payne 1965; Rai et al. 2022 (buried pigs); Behrensmeyer 1978; Carter & Tibbett (CDI); Athy 1930; Sadler 1981; Allison 1988; Widera (peat:lignite); Earle Physical Geology 20.3 (oil window); Big Bone Lick; Waters et al. 2020 (Clovis); Haynes 2008 (black mat). See WORLD.md and README platform section.

## Engine design
Token N is computed from the whole mint history 1..N: each mint's hash picks its surface event (era-constrained, honest trait) and the deposit it leaves; the real gap before each mint advances world time via p = 0.05 + 0.7 ln(1 + gap/8h) through a data-driven era table (Option A: 28,000 BCE to the present and beyond); background thickness = r * dYears^0.6 (Sadler); decay follows Payne stages slowed by burial, cold and waterlogging, then Behrensmeyer bone weathering, cadaver-decomposition stains, Athy compaction, water-table gley and rust; unsupported remains collapse onto the burial surface of the day. Fossilisation runs on an explicit compressed clock, flagged as a trait.

Code: `src/world.js` (era tables, options A/B/C) + `src/main.js` (+ `../_lib/px.js`), assembled into `src/art.js` by `25-sediments/tools/mk.sh`. Shared adapter `/workspace/clyde/series/_shared/clyde.js`. Deterministic from the history 1..N (or `?hash=` → simulated history). Headless: `node tools/render.js histories/steady.json <N> <res> out.png`.

## Traits
World, Era, World Date, Surface, Before This Mint, Mints Beneath, Remains In View, Deepest State, Clock, History, Depth Shown

## Self-critique
R1 (v1.1): the mammoth-to-skeleton sequence and the timing contrast read clearly, and the strata are believable as a floodplain. Weak: animals are flat silhouettes (no lighting, stiff column legs, mammoth head and tusks crude); stages 2 and 3 barely differ from fresh; at token 20 the bones lie on the surface rather than 'well buried' (steady pacing gives ~0.2 m of burial in a year); deep tokens (1,000+) are monotone grey-brown laminae with too much sky; the distant herd is grey blobs; at 1600 px bones read as smooth capsules and the mammoth skull as a disc; the basal beds undulate like folds (base-layer noise amplitude too high for a floodplain); faint vertical drip streaks under some beds; dormancy contrast is weaker than intended (a 4-month silence adds only ~4 progress units). Below the Before the Shovels bar.

## Outputs
Contact sheets: contact-sheet-runs.png. Heroes (1600 px, headless Chrome from dist/aleatory/): heroes/steady_1.json, heroes/steady_1.png, heroes/steady_10.json, heroes/steady_10.png, heroes/steady_20.json, heroes/steady_20.png, heroes/steady_200.json, heroes/steady_200.png. Sample hashes: sha256("clyde-sediments-<i>").

## Risks
- Animal rendering may never reach photographic restraint; the full-history requirement rules out Aleatory/Highlight/Verse and needs a custom contract (or an Art Blocks Flex hook); the Native archaeology eras need an ethics review.
- Aleatory file size: builds are ~28-39 KB raw (~11-14 KB gz) vs a 32,768-byte single-op cap -- may need minification.
- Collector demand unknown; edition/price/venue stay TBD.

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
  - Each mint adds progress `p = 0.05 + 0.7·ln(1 + gap/8 h)`.
  - An era table (data, in `src/world.js`) maps progress to a world year. Bursts make many thin, similar beds; long silences make thick blank beds and buried soils.
  - Background thickness is `r·Δyears^0.6`, Sadler-style: less is preserved per year over longer spans (Sadler 1981).
- **Surface event per mint:** chosen by the mint's hash from the current era's weighted list. If the previous mint was under 3 hours earlier, there's a 42% chance the event repeats.
  - The event leaves its own deposit: flood silt, a charcoal seam, a hearth lens, a bone bed, a plough zone and so on.
  - Deaths and burials are capped per world-year.
- **Decay:** decay stages follow Payne 1965 (fresh, bloat, active, advanced, dry, remains).
  - Burial slows decay, with buried pigs reaching dry/remains in about a year (Rai et al. 2022). Cold and waterlogging slow it further.
  - Anoxia slows decay but doesn't stop it (Allison 1988).
  - Exposed carcasses are scavenged quickly.
  - Bones that stay exposed weather through Behrensmeyer (1978) stages 1–5 over about 15 years.
  - Rot leaves a dark "cadaver decomposition island" stain below the body (Carter & Tibbett).
- **Collapse:** once decay is advanced, unsupported parts fall onto the burial surface of that moment. Parts held in mud stay articulated, so a mired mammoth ends as legs upright in the clay with a collapsed rib cage above.
- **Compaction:** Athy-style exponential compaction with depth. Wood and peat compact more; peat to lignite compacts 2:1 to 4:1 (Widera).
- **Water table:** gleyed colours below it and rust mottles in the capillary fringe. Wood survives below it, and decay there runs at ×0.25.
- **Diagenesis (a stated conceit):**
  - 30,000 years is far too short for permineralisation, coal or oil. The oil window is about 60–120 °C at roughly 2 km depth and beyond (Earle, *Physical Geology* 20.3).
  - So fossilisation states use an explicit **compressed geological clock**: `G = 1000 × world years + 2000 × mints since burial`.
  - Thresholds: permineralised above 2×10⁵ if wet, replaced above 3×10⁶, kerogen stain above 10⁶.
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
| Remains In View | up to 3 remains visible in this window, with their states |
| Deepest State | the most advanced preservation state in view |
| Clock | Real Rates or Compressed (stated) |
| History | Snapshot, Chain, Param or Simulated |
| Depth Shown | how deep the section in view goes |

## 5. Tools

| Tool | What it does |
|---|---|
| `tools/mk.sh` | builds `src/art.js` from px.js, world.js and main.js |
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

*Template note:* the generic "Outputs" and "Risks" lines above come from the shared studio template, and two of them don't apply to Sediments:
- Sediments heroes are rendered headless by `tools/render.js`, not by Chrome from `dist/aleatory/`.
- The Aleatory 32 KB cap is irrelevant because this is not an Aleatory piece. The generator is about 110 KB, which on EVM would be stored as about 110 KB of SSTORE2 bytecode (code deposit 200 gas per byte, about 22M gas, from knowledge).

> **SUPERSEDED (Nov 19, 2026):** The Schotter Garden / Cubic Weather recommendation, 64-128 edition sizes and 3-5 tez prices below do NOT set strategy for current work. Market-wide medians and established artists' sales cannot price Clyde or prove demand. Edition, price and venue stay open until real format costs and buyer evidence exist. Sale prep starts with selected exact-preview works (hi-res still, seed-locked runnable file, source-version record); generative minting is a separate product choice; prints need a real paper proof.

# Clyde: where to drop (market research)

Compiled Wed 18 Nov 2026, about 7:30–9:30 PM ET. On-chain pulls were made from the box during that window. Every number below comes from the source named next to it. Any number not measured is marked **GAP**. Tez is converted at $0.2073 (TzKT quote, 18 Nov 8:11 PM ET). ETH is about $2,055 (24hours.art, 12 Nov 2026).

## 1. The headline: fxhash is gone

- fxhash shut down on **17 Aug 2026**. Sources: fxhash's announcement on X, Right Click Save (24 Aug 2026) and PANews. The team was laid off in Feb 2026. On 5 Nov 2026 FXHASH FOUNDATION entered French *redressement judiciaire* (BODACC). Existing works can still be traded and viewed on objkt, Verse and Le Random, and WhiteHash preserves them.
- On-chain: the last activity on the Tezos fxhash Issuer v3 was **13 Aug 2026**. That means **0 primary mints in the last 90 days** (TzKT). From the box, the fxhash domain resolves to a sinkhole.
- The fxhash builds still conform to the `$fx` SDK. You **cannot publish them**, so they are kept for archive and compatibility only.

## 2. Volume table

| Venue / chain | Window | Primary (mints) | Secondary | Source | Notes |
|---|---|---|---|---|---|
| **Aleatory** (Tezos, on-chain generative) | all-time (since 1 Oct 2026) | 1,796 mints · 6,228 tez (≈ $1,291) · 123 unique minters | — | TzKT: mint txs on all 110 generator contracts listed on aleatory.art, to 18 Nov 7:30 PM ET | Home-page estimate (minted × price) is ≈ 6,445 tez |
| Aleatory | 30 d | 454 mints · 2,022 tez (≈ $419) | 1 sale / 4 tez on objkt | TzKT; objkt GraphQL | Aleatory's own resale market not measured (**GAP**) |
| Aleatory | 7 d | 25 mints · 120 tez (≈ $25) | 0 on objkt | TzKT | Momentum is fading after launch |
| **objkt** (all Tezos secondary) | 30 d | — | 21,433 sales · 448,679 tez (≈ $93k) · median 5 tez | objkt GraphQL `event` (list_buy, offer_accept, offer_floor_accept, english_auction_settle, dutch_auction_buy) | Excludes 17 sales over 5,000 tez that look like wash or test sales (one of them was "35B tez") |
| objkt | 90 d (21 Aug–18 Nov) | — | 70,386 sales · 1,690,565 tez (≈ $350k) · median 5 tez | same | The most liquid Tezos market |
| fxhash gentks (secondary, all venues on objkt) | 30 d / 90 d | 0 / 0 | 594 sales · 14,900 tez / 2,221 sales · 89,776 tez | objkt GraphQL, fa = GENTK v1/v2 | Shows there are still collectors of Tezos long-form generative work |
| FXHASH Marketplace v3 contract | 30 d / 90 d | — | 7 sales · 14.2 tez / 21 · 41.2 tez | TzKT | Residual |
| **Art Blocks** (Studio / Flex / Engine on ETH, Base, Arbitrum) | 30 d (since 20 Oct) | 823 tokens minted (783 ETH, 33 Base, 7 Arbitrum) | ETH value **GAP** | Art Blocks public GraphQL `data.artblocks.io/v1/graphql`, `tokens_metadata.minted_at` | Price field resets to 0 after auctions, so primary ETH not derivable. Curated ended Oct 2025, and Studio needs an invitation or application |
| Art Blocks | 90 d (since 21 Aug) | 2,907 tokens (2,816 ETH / 84 Base / 7 Arb) | **GAP** (Dune dashboards need JS) | same | Biggest 90 d drops: Endless 685, RASTER LOGO 561, Starlight 300 (sold out), Flower Type 256 (sold out) |
| Art Blocks (blue-chip secondary, anecdotal) | single days | — | e.g. 21 Oct: Fidenza 15 & 13.5 WETH; 29 Oct: Ringers 13 ETH; 12 Nov: Meridian 5 ETH | 24hours.art daily reports | Not a volume total |
| **Verse** (ETH, plus Tezos market since Aug 2026, USD/ETH checkout) | per series | e.g. *Crawlers* by Slava Rybin (released 29 Oct 2026, 1,111 items, 451 owners): **$184,843** sales volume | included | verse.works series page | Platform-wide 30/90 d **GAP** (no public API). Curated |
| **Highlight** (ETH / Base) | 30 / 90 d | **GAP** | **GAP** | docs.highlight.xyz; SDK has `collection.trending({window:"7d"})`, not queried | Self-serve; fixed price, Dutch and ranked auctions; limited or open editions |
| Teia, Le Random, others | 30 d | not generative-primary / **GAP** | Teia market ≈ 28.9k tez of objkt-indexed sales in 30 d | objkt GraphQL by marketplace contract | — |

Method notes:
- Tezos sales come from objkt's indexer, paginated day by day over 21 Aug–19 Nov 00:00 UTC. The raw data is in `/tmp/objkt_sales_90d.json` (70,403 rows).
- Art Blocks raw data: `/tmp/ab_mints_90d.json`.
- Aleatory generator list: `/tmp/alea_gens.json`.

## 3. Fees and mechanics (from the platforms' own pages)

- **Aleatory** (aleatory.art/about):
  - Publishing a generator costs a one-off fee, "usually well under a dollar".
  - Minting pays the artist's price to the artist, plus a small render fee ("render_gas") to the render provider.
  - The platform takes **0% on primary** and **2.5% on resale**. Royalties are enforced by the generator contract.
  - Everything is fully on-chain: one HTML file stored in the contract.
- **Highlight:** zip upload stored on Arweave. Capture runs on a delay or a selector. Platform fee **GAP**.
- **Verse:** curated releases. Sale formats are open, limited, Dutch and decreasing supply, with fiat or ETH checkout. Fee **GAP**.
- **Art Blocks Studio/Engine:** you apply or need a partner. ETH gas is high for collectors on mainnet, though Base is supported.

## 4. Recommendation

**Drop first on Aleatory (Tezos), then take the strongest series to Verse or Highlight (Ethereum/Base).**

Why Aleatory first:
1. **It is the only live, open, long-form generative venue on the Tezos side** after fxhash closed. It has 454 mints in its first 30 days from 123 collectors, and it inherits the fxhash-style collector base. That base is still trading about 600 gentks a month on objkt.
2. **Zero gatekeeping and almost zero cost.** Publishing costs under $1, the platform takes nothing on primary, royalties are enforced, and the art is fully on-chain. That suits a pseudonymous artist with no track record, and it doesn't require dealing with curators or other people.
3. **Technical fit is already done.**
   - Every Clyde series ships as one vanilla HTML file of 21–24 KB (8–9 KB gzipped). That is under the 32,768-byte single-operation cap, so no chunked upload is needed.
   - Each build calls `$alea.ready()` and registers features.
4. **Honest caveat:** the dollar volume is small (≈ $419 in 30 days) and it is falling (25 mints in the last 7 days). Treat this as building a track record and collectors, not income.

Suggested first release:
- **Series:** *Schotter Garden* (clear lineage, plottable SVG, consistent outputs) or *Cubic Weather* (most consistent outputs; res-diff 0.03).
- **Edition and price:** 64–128 editions at **3–5 tez**. That sits at the median objkt sale (5 tez) and at the low end of Aleatory's typical 1–15 tez.
- **Pacing:** one series every 2–3 weeks rather than all six at once.

Second venue:
- **Verse** has proven buyers for new generative work: *Crawlers* did $184,843 in about 3 weeks. However, it is curated, so it requires submitting work.
- **Highlight** is self-serve on Base, which keeps gas cheap. Its volume is unmeasured.
- Both builds already exist (`*-verse.zip`, `*-highlight.zip`). Art Blocks Studio is the long-term goal once there is a body of released work.

## 5. Gaps to close before the drop

- Primary platform totals for Highlight and Verse (no public API; would need Dune, or the Highlight SDK with an API key).
- Art Blocks primary ETH volume (from Dune or receipts).
- Highlight and Verse fee schedules.
- Aleatory's own resale-market volume (contract not identified).
- Re-pull the Aleatory figures the week of the drop, since the trend matters more than the total.

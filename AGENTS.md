# Agent coordination

Shared workspace for Clyde (pseudonymous generative artist). Three AI agents cooperate under the owner **Joshua**:

| Role | Agent | Responsibility |
|------|--------|----------------|
| Art direction | **Clyde** (Grok Bot) | Leads briefs, voice, and artistic decisions |
| Implementation | **Nimrod** (Codex) | Implements, reviews, and critiques |
| Implementation | **Cursor** agents | Implements, reviews, and critiques |

## Coordination

- Every task is a **GitHub issue** with:
  - one owner label: `agent:clyde`, `agent:nimrod`, or `agent:cursor`
  - one status label: `status:todo`, `status:in-progress`, `status:needs-review`, `status:blocked`, or `status:done`
  - `needs:joshua` when only Joshua can decide
- These labels already exist. Discussion happens in issue/PR comments.
- Address another agent by starting a comment with its name (e.g. `Nimrod:`).
- At the start of every session, check open issues assigned to you.

## Git workflow

- Work on a branch and open a PR that links its issue.
- Never push to `main` directly.
- A PR may be merged by an agent only after a **different** agent has reviewed and approved it (in a comment if GitHub identities are shared).
- Joshua can override anything.

## Quality bar

The bar is *Before the Shovels* (`v2/before-the-shovels`):

- Restraint over density
- Physically believable, motivated marks checked against real references
- Familiar everyday elements
- Avoid overused generative motifs

## Series briefs

Each series brief has **7 parts** (follow the existing briefs in `2027/`):

1. In one sentence (no technique)
2. Generative rule
3. Composition, material, motion
4. Meaningful variation
5. Collector deliverable
6. Buyer / channel
7. Unresolved artistic risk

## Determinism

- Output derives only from the seed/transaction hash and locked params.
- Buyer/preview files embed the seed.
- Snapshots and builds are labeled by the SHA-256 of the source file.
- Record source SHA-256, seed, resolution, and renderer in a build record.

## Selected works package

Hi-res still + seed-locked runnable HTML + build record, stored in Drive folder **05 Selected works (exact previews)**.

## Binaries

Binaries go to Drive, not git. Reference them by link and by the commit they came from:

- **01** Renders and heroes
- **02** Review bundles
- **03** References and research
- **04** Handoffs and critiques
- **05** Selected works (exact previews)

## Hard limits

- Nothing is published, minted, posted, deployed, or promoted, and no money is spent, without Joshua's explicit approval.
- No AI image generation in the work.
- Never fabricate exhibitions, sales, or provenance.
- Edition sizes, prices, and venues stay open until Joshua decides.
- Paper proofs come before prints.
- Generative minting vs. exact-preview release is a per-work decision for Joshua.

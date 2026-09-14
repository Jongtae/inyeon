# INYEON — Korean Compatibility Lab

**INYEON — Explore connection through Korean Saju and Gung-hap.**

INYEON is an **independent personal project intended for a real public release**.

The project is not being optimized for near-term startup success, fundraising, or venture-scale growth. That does **not** mean prototype quality. The goal is to ship a polished, production-capable service that real users can use reliably.

> **Independent project, release-grade quality.**
>
> Business success is optional. Correctness, privacy, reliability, usability, and actual deployment are not.

The first useful product should work even with one user:

`Me → my Saju → compare with public figures → explore synthetic characters → understand reviewed context when available → share`

## Autonomous team status

INYEON is building toward a **verified L4 autonomous product team**. The repository currently identifies itself as `l4-candidate`; it must not claim `l4-verified` until the operational graduation criteria in `docs/AUTONOMY_L4.md` are backed by durable evidence.

L4 here means the team can repeatedly execute:

`goal/state → work selection → implementation → independent review → CI → release → observe → analyze → judge → state/decision update → next work`

and can recover from production failure through:

`detect → contain → rollback/recover → root cause → regression protection → redeploy → verify`.

Key autonomy assets:

- `TEAM_STATE.toml` — machine-readable working state and autonomy proof counters;
- `docs/AUTONOMY_L4.md` — maturity contract and L4 graduation criteria;
- `docs/ROLE_AUTHORITY_MATRIX.md` — role authority and separation of duties;
- `evals/autonomy/cases.json` — behavioral governance fixtures;
- `scripts/check_l4.py` — structural/policy consistency guard;
- `docs/decisions/` — durable product decision ledger;
- specialist Codex roles for architecture, implementation, QA/security, Reddit operation, feedback analysis, and independent product judgment.

L4 graduation requires, among other things, five consecutive closed autonomous loops, at least one exercised recovery path, >=95% behavioral-eval pass rate with zero critical failures, zero active policy conflicts, no routine owner interventions outside declared Human Gates, and a real production/rollback path.

## Active first-release architecture

The first public release is intentionally zero-backend:

```text
GitHub repository
   → GitHub Actions
   → GitHub Pages
   → browser-only Saju / compatibility calculation
```

User personal birth/comparison inputs stay in browser memory only. INYEON application code does not persist or transmit them.

Google Cloud remains a future escape hatch for features that truly require server-side state, protected APIs/secrets, realtime communication, authenticated accounts, or durable user data. It is not on the first-release critical path.

The local application boundary is implemented by #52. #47 owns production deployment and real-origin verification.

## Local development

The bootstrap uses one private npm workspace with a React, TypeScript, and Vite app in `apps/web`. Use Node 24 as pinned by `.nvmrc` and install exactly from the committed lockfile.

```bash
node --version # must report v24.x; .nvmrc is provided for version managers
npm ci
npm run dev
```

The development server exposes the app at `/inyeon/`. Client navigation uses fixed hash routes for the Lab, My Saju, public figures, Fictional Lab, Someone I Know, claim-free sharing, methodology, and privacy. Share links contain only a strict non-personal reference/invitation allowlist; all routes remain refresh-safe on a GitHub Pages project site.

Run the complete local verification set before opening a pull request:

```bash
python3 scripts/check_harness.py
python3 scripts/check_l4.py
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium # first local browser-test run only
npm run test:e2e --workspace @inyeon/web
```

The production build is written to `apps/web/dist` with a source-SHA manifest, strict CSP/referrer metadata, secret/origin signature checks, and explicit asset budgets. `docs/runbooks/github-pages.md` defines the exact-SHA release and rollback path. Public deployment is still blocked by the #14 correctness Human Gate, so the repository does not claim a production release or deployed privacy evidence.

## Current product direction

The first release prioritizes:

1. an English-first public experience for a US-first audience that keeps its Korean-rooted K-culture identity, with Korean terms translated or progressively disclosed;
2. deterministic Four Pillars / Manseryeok calculation;
3. a validated open-source adapter rather than greenfield calendar math;
4. sourced public-figure birth data for recognizable comparisons;
5. transparent synthetic characters for broad compatibility exploration;
6. an explicit no-approved-evidence state now, and explainable `What clicks / Potential friction / Why this?` output only after reviewed relationship mappings exist;
7. privacy-safe client-side sharing;
8. a polished responsive web UI;
9. GitHub Pages production deployment, CI, rollback, privacy testing, and release hardening;
10. an autonomous but evidence-governed Reddit launch/feedback loop after release.

Real-user dating discovery, likes, matches, chat, payments, city seeding, and dating-marketplace operations are later product layers. They are deferred because they are outside the **first product scope**, not because release quality is optional.

See `docs/TOY_PROJECT_MODE.md` for the active Independent Release Mode definition.

## Core comparison modes

### Me × Public Figure

Compare your chart with globally recognizable actors, musicians, athletes, creators, and other public figures using publicly sourced birth data.

Rules:

- public figures are reference examples, not members or dating prospects;
- birth date/place/time must preserve source provenance;
- unknown birth time stays unknown;
- hour-dependent interpretation is suppressed when unsupported;
- no endorsement or romantic-availability implication;
- only appropriately licensed imagery may be used.

Tracked in #50.

### Me × Synthetic Character

Explore thousands of clearly fictional characters generated from reproducible seeds and the same compatibility engine used everywhere else.

Synthetic characters are always labelled, cannot Like/Match/Message, and never count as marketplace supply or dating outcomes.

Tracked in #49.

### Me × Someone I Know

Optionally compare with a person whose birth information the user enters. Keep the same uncertainty and zero-retention privacy rules as every other personal-data flow.

## Saju engine strategy

Do **not** rebuild mature calendrical primitives without evidence that we need to.

Preferred direction:

`Birth input → INYEON normalization → InyeonSajuAdapter → normalized Four Pillars → INYEON derived features → compatibility rules → explanation`

#8 adopts/evaluates a pinned open-source Manseryeok implementation behind an INYEON-owned adapter and records a non-production differential corpus. Independent evidence is limited to the property it actually checks; production validation remains gated by the later timezone, boundary, methodology, and ≥200-fixture work.

INYEON-specific value should live above the commodity calculation layer:

- normalized chart/uncertainty representation;
- compatibility-rule representation;
- explainability;
- public/synthetic comparison experiences;
- sharing;
- later, if desired, real dating ranking/outcome learning.

## Sharing strategy

Sharing is first-class and must preserve the zero-retention design.

Preferred first-release share surfaces:

1. **Share result card** — generate PNG/WebP in the browser and invoke native Web Share when available.
2. **Share-safe reference/invitation link** — encode only strict allowlisted identifiers and fixed versions; no raw or derived personal value belongs in the URL.
3. **Compare with me** — a separate invitation containing no personal chart representation; each participant enters details locally.
4. **Public-figure pages** — stable hash links now, with public-only prebuilt social/OG metadata evaluated after #47 fixes the production origin.

Default share cards/links must not expose protected personal values. Until reviewed relationship mappings exist, they also contain no archetype, score, or relationship claim.

Implemented by #43 with independent QA/security approval. #52 verifies the broader local zero-retention matrix, and #47 owns production-origin and deployed smoke evidence.

## Privacy model

First-release public promise:

> **Your personal birth and compatibility inputs are processed in your browser. INYEON application code does not collect, transmit, or store them.**

Protected values must not enter localStorage, sessionStorage, IndexedDB, cookies, service-worker caches, URLs, analytics, logs, error payloads, or third-party network calls.

GitHub Pages may retain platform-level access/security logs such as visitor IPs; public privacy copy must distinguish that from INYEON application-level zero retention.

Implemented as the local `inyeon-zero-retention-v1` boundary in #52 and documented in `PRIVACY.md`. #47 still owns deployed privacy smoke on the eventual production Pages origin.

## Reddit release and product-learning loop

Reddit is the preferred initial promotion/feedback channel. The owner has granted standing authorization for **maximum practical Reddit autonomy** where tools and community/platform rules allow it.

Operating autonomy and product judgment are intentionally separated:

`Reddit Operator != Feedback Analyst != Product Judge`

Target loop:

```text
Product Judge preregistration
 → Reddit Operator post/replies
 → RAW EVIDENCE
 → Feedback Analyst
 → Product Judge: IGNORE / OBSERVE / EXPERIMENT / ACT
 → Decision Ledger
 → GitHub Issue
 → Codex Worker
 → QA/security review
 → GitHub Pages release
 → observation / next experiment
```

Rules:

- the Reddit Operator does not grade its own campaign;
- Reddit is directional, self-selected evidence, not a representative market poll;
- upvotes/sentiment alone do not determine product changes;
- user-requested solutions are separated from observed underlying problems;
- acquisition truth is not automatically product truth;
- low-risk reversible fixes can move automatically through normal CI/QA/release gates when evidence is strong;
- high-risk changes involving Saju methodology, privacy/security, personal-data collection, architecture, or major product positioning remain strongly governed;
- Saju methodology disputes can trigger investigation but not direct rule changes;
- material decisions are recorded in `docs/decisions/`;
- noncritical feedback normally observes a 24–72h evidence/cooldown window before batched changes.

Human intervention is requested only for genuine owner-only barriers such as CAPTCHA, verification/MFA/identity steps, owner-only platform terms, ambiguous subreddit rules, account recovery/security challenges, or material legal/reputational risk. Routine posting/replies do not require per-post owner approval once an authorized account/integration is available.

See:

- `docs/adr/0002-reddit-autonomy.md`
- `docs/adr/0003-reddit-evidence-governance.md`
- `docs/REDDIT_EXPERIMENT_GOVERNANCE.md`
- `docs/decisions/README.md`
- #51

## Release bar

The first public release is not complete when the feature merely works locally.

At minimum it should have:

- reproducible builds and deploys;
- CI for core logic and release artifacts;
- GitHub Pages production deployment over HTTPS;
- deterministic/versioned chart results;
- ≥200 golden/reference fixtures and boundary regression tests;
- client-only privacy regression tests for network/storage/cache/console leakage;
- no secret API keys in browser bundles;
- responsive/mobile usability and accessibility;
- graceful loading/error/empty states;
- rollback/redeploy capability;
- public-figure provenance and categorical birth-data/source-status disclosure;
- clear separation of public figures, synthetic characters, and real users;
- production smoke checks;
- `scripts/check_harness.py` and `scripts/check_l4.py` green.

## Active execution path

```text
#1 repo/toolchain/ADRs
 ↓
#8 open-source Manseryeok adapter
 ↓
#9–#14 validation + derived features + golden corpus
 ↓
#6 inclusive compatibility taxonomy + prohibited claims
 ↓
#33–#34 compatibility evidence + uncertainty
 ↓
#50 public figures + #49 synthetic lab
 ↓
#35 deterministic explanation + #53 static comparison UI
 ↓
#43 sharing
 ↓
#52 zero-retention privacy verification
 ↓
#47 GitHub Pages production release
 ↓
#51 autonomous Reddit operation + evidence-governed product learning
```

Historical marketplace P0 labels do not outrank this active first-release path.

## Start here for Codex

1. Read `TEAM_STATE.toml`, `AGENTS.md`, `CODEX.md`, `docs/AUTONOMY_L4.md`, and `docs/ROLE_AUTHORITY_MATRIX.md`.
2. Read `docs/TOY_PROJECT_MODE.md`, `PRD.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `BACKLOG.md`, `PRIVACY.md`, and `SAJU_ENGINE_SPEC.md`.
3. Read `docs/HUMAN_GATES.md`, `docs/REDDIT_EXPERIMENT_GOVERNANCE.md`, relevant ADRs, decisions, and current issue context.
4. Reconcile `TEAM_STATE.toml` with actual repository/issues/release state.
5. Validate `.codex/config.toml` and run `scripts/check_harness.py` plus `scripts/check_l4.py`.
6. Operate in Independent Release Mode and follow the active static-release critical path.
7. Update `TEAM_STATE.toml` at meaningful milestones with evidence, not estimates.

Recommended Codex instruction:

```text
Read TEAM_STATE.toml and the root/autonomy governance docs first.
Reconcile state with the repo/issues/releases, repair stale policy/state, and continue the highest-value unblocked work.
Operate in Independent Release Mode with production-grade quality and zero-backend privacy boundaries.
Preserve Operator → Analyst → Judge → Worker → QA/Security separation for material product learning.
Run harness/L4 checks, update TEAM_STATE at meaningful milestones, and do not claim l4-verified until the AUTONOMY_L4 graduation evidence is complete.
Continue through production release, observation, product decision, implementation, verification, and the next autonomous cycle unless a real Human Gate is reached.
```

## Product invariants

- Compatibility is context, not destiny.
- No public soulmate percentage, star score, or pseudo-scientific probability.
- LLMs do not calculate Saju or decide compatibility rules.
- Missing birth time degrades gracefully; never invent one.
- Public figures, synthetic characters, and real users are different entity types.
- Synthetic/public-figure records never enter real Like/Match/Message state machines.
- Personal birth/comparison data does not leave browser memory in the first release.
- Do not make scientific predictive claims for Saju / Gung-hap.
- Korean Saju/Gung-hap is described as Korean practice within the broader East Asian Four Pillars tradition.

## Optional future Marketplace Mode

The repository still contains a detailed US-first dating-marketplace blueprint: real-user eligibility, safety, matching, chat, city liquidity, analytics, payments, legal/app-store readiness, and production operations.

Those remain available if the project later expands. They are deferred from the **first product scope**, not removed from the long-term architecture.

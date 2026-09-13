# INYEON — Korean Compatibility Lab

**INYEON — Explore connection through Korean Saju and Gung-hap.**

INYEON is an **independent personal project intended for a real public release**.

The project is not being optimized for near-term startup success, fundraising, or venture-scale growth. That does **not** mean prototype quality. The goal is to ship a polished, production-capable service that real users can use reliably.

> **Independent project, release-grade quality.**
>
> Business success is optional. Correctness, privacy, reliability, usability, and actual deployment are not.

The first useful product should work even with one user:

`Me → my Saju → compare with public figures → explore synthetic characters → understand relationship dynamics → share`

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

Tracked in #47 and #52.

## Current product direction

The first release prioritizes:

1. deterministic Four Pillars / Manseryeok calculation;
2. a validated open-source adapter rather than greenfield calendar math;
3. sourced public-figure birth data for recognizable comparisons;
4. transparent synthetic characters for broad compatibility exploration;
5. explainable `What clicks / Potential friction / Why this?` relationship output;
6. privacy-safe client-side sharing;
7. a polished responsive web UI;
8. GitHub Pages production deployment, CI, rollback, privacy testing, and release hardening;
9. an autonomous but evidence-governed Reddit launch/feedback loop after release.

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

#8 adopts/evaluates a pinned open-source Manseryeok implementation behind an INYEON-owned adapter and validates it against independent references and golden fixtures.

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
2. **Share-safe result link** — encode only allowlisted non-sensitive result data; raw birth date/time/place never belongs in the URL.
3. **Compare with me** — separate explicit opt-in flow; if derived personal chart data is embedded, explain exactly what is shared before generation.
4. **Public-figure pages** — stable shareable pages with prebuilt social/OG metadata where practical.

Default share cards/links must not expose protected personal birth inputs.

Tracked in #43.

## Privacy model

First-release public promise:

> **Your personal birth and compatibility inputs are processed in your browser. INYEON application code does not collect, transmit, or store them.**

Protected values must not enter localStorage, sessionStorage, IndexedDB, cookies, service-worker caches, URLs, analytics, logs, error payloads, or third-party network calls.

GitHub Pages may retain platform-level access/security logs such as visitor IPs; public privacy copy must distinguish that from INYEON application-level zero retention.

Tracked in #52 and `PRIVACY.md`.

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
 → QA/review
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
- public-figure source/confidence disclosure;
- clear separation of public figures, synthetic characters, and real users;
- production smoke checks.

## Active execution path

```text
#1 repo/toolchain/ADRs
 ↓
#8 open-source Manseryeok adapter
 ↓
#9–#14 validation + derived features + golden corpus
 ↓
#33–#34 compatibility evidence + uncertainty
 ↓
#50 public figures + #49 synthetic lab
 ↓
static comparison UI + deterministic explanation
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

1. Read `AGENTS.md`, `CODEX.md`, and `docs/TOY_PROJECT_MODE.md`.
2. Read `PRD.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `BACKLOG.md`, `PRIVACY.md`, and `SAJU_ENGINE_SPEC.md`.
3. Read `docs/adr/0002-reddit-autonomy.md`, `docs/adr/0003-reddit-evidence-governance.md`, and `docs/REDDIT_EXPERIMENT_GOVERNANCE.md` before operating Reddit.
4. Validate `.codex/config.toml` and run `scripts/check_harness.py`.
5. Operate in Independent Release Mode and follow the active static-release critical path.

Recommended Codex instruction:

```text
Read AGENTS.md, CODEX.md, docs/TOY_PROJECT_MODE.md, PRD.md,
ARCHITECTURE.md, ROADMAP.md, BACKLOG.md, PRIVACY.md and SAJU_ENGINE_SPEC.md.

Operate in Independent Release Mode.
This is an independent personal project, but it IS intended for a real public release.
Do not lower the engineering, privacy, reliability, UX, accessibility, or deployment bar.

Use a zero-backend first-release architecture: GitHub Actions + GitHub Pages,
with personal birth/comparison inputs processed only in browser memory.

Prioritize #8 → #9-14 → #33-34 → #50/#49 → polished static UI →
#43 sharing → #52 privacy verification → #47 production release → #51 Reddit product-learning loop.

For Reddit, use the registered reddit-operator, feedback-analyst, and product-judge roles.
Keep Operator != Analyst != Judge. Preregister material experiments, pass raw evidence rather than campaign-owner conclusions, use risk-based automation, record material decisions, and never change Saju methodology directly from Reddit opinion.

Do not rebuild mature calendrical primitives that a validated open-source dependency provides.
Do not introduce GCP/backend persistence unless a concrete requirement proves static architecture insufficient and the architecture/privacy change is explicitly reviewed.
Continue through production release until a real Human Gate is reached.
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

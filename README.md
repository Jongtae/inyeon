# INYEON — Korean Compatibility Lab

**INYEON — Explore connection through Korean Saju and Gung-hap.**

INYEON is an **independent personal project intended for a real public release**.

The project is not being optimized for near-term startup success, fundraising, or venture-scale growth. That does **not** mean prototype quality. The goal is to ship a polished, production-capable service that real users can use reliably.

> **Independent project, release-grade quality.**
>
> Business success is optional. Correctness, privacy, reliability, usability, and actual deployment are not.

The first useful product should work even with one user:

`Me → my Saju → compare with public figures → explore synthetic characters → understand relationship dynamics`

## Current product direction

The first release prioritizes:

1. deterministic Four Pillars / Manseryeok calculation;
2. a validated open-source adapter rather than greenfield calendar math;
3. sourced public-figure birth data for recognizable comparisons;
4. transparent synthetic characters for broad compatibility exploration;
5. explainable `What clicks / Potential friction / Why this?` relationship output;
6. a polished end-to-end UI;
7. production deployment, privacy, observability, error handling, and release hardening.

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

Tracked in Issue #50.

### Me × Synthetic Character

Explore thousands of clearly fictional characters generated from reproducible seeds and the same compatibility engine used everywhere else.

Synthetic characters are always labeled, cannot Like/Match/Message, and never count as marketplace supply or dating outcomes.

Tracked in Issue #49.

### Me × Someone I Know

Optionally compare with a person whose birth information the user enters. Keep the same uncertainty and privacy rules as every other personal-data flow.

## Saju engine strategy

Do **not** rebuild mature calendrical primitives without evidence that we need to.

Preferred direction:

`Birth input → INYEON normalization → InyeonSajuAdapter → normalized Four Pillars → INYEON derived features → compatibility rules → explanation`

Issue #8 evaluates/adopts a pinned open-source Manseryeok implementation behind an INYEON-owned adapter and validates it against independent references and golden fixtures.

INYEON-specific value should live above the commodity calculation layer:

- normalized chart features;
- compatibility-rule representation;
- explainability;
- public/synthetic comparison experiences;
- later, if desired, real dating ranking/outcome learning.

## Release bar

The first public release is not complete when the feature merely works locally.

At minimum it should have:

- reproducible builds and deploys;
- CI for core logic and release artifacts;
- a staging path and a real production environment;
- deterministic/versioned chart results;
- golden/regression tests around calendrical boundaries;
- production error tracking and basic observability;
- privacy-safe handling of birth inputs;
- secrets management;
- responsive/mobile usability and accessibility appropriate to the chosen client;
- graceful loading/error/empty states;
- rollback/redeploy capability;
- backup/restore validation for stateful production data;
- public-figure source/confidence disclosure;
- clear separation of public figures, synthetic characters, and real users.

## Start here for Codex

1. Read `AGENTS.md`, `CODEX.md`, and `docs/TOY_PROJECT_MODE.md`.
2. Read `SAJU_ENGINE_SPEC.md`, `MATCHING_SPEC.md`, `PRD.md`, and `ARCHITECTURE.md` as reference documents.
3. Validate `.codex/config.toml` and run `scripts/check_harness.py`.
4. Prioritize the active first-release path rather than blindly following historical marketplace P0 priorities.

Recommended Codex instruction:

```text
Read AGENTS.md, CODEX.md, docs/TOY_PROJECT_MODE.md, SAJU_ENGINE_SPEC.md,
PRD.md and ARCHITECTURE.md.

Operate in Independent Release Mode.
This is not a revenue-first startup project, but it IS intended for a real public release.
Do not lower the engineering, privacy, reliability, UX, or deployment bar because it is a personal project.

Prioritize the validated Manseryeok adapter, derived compatibility features,
golden fixtures, public-figure dataset (#50), synthetic compatibility lab (#49),
a polished comparison UI, and the production hardening required to release it.

Do not rebuild calendrical primitives that a validated open-source dependency already provides.
Continue implementation through staging and production release until a real Human Gate is reached.
```

## Durable source-of-truth documents

| Document | Purpose |
|---|---|
| `docs/TOY_PROJECT_MODE.md` | active Independent Release Mode and scope/quality distinction |
| `CODEX.md` | autonomous execution and release contract |
| `PRD.md` | broad product possibilities and historical marketplace design |
| `ARCHITECTURE.md` | system/data boundaries and target technical design |
| `SAJU_ENGINE_SPEC.md` | deterministic Four Pillars/Saju methodology requirements |
| `MATCHING_SPEC.md` | compatibility and optional future dating constraints |
| `BACKLOG.md` | historical issue map; active release scope determines execution order |
| `BUSINESS.md` | optional future business/startup reference, not a current success requirement |
| `SAFETY.md`, `PRIVACY.md` | safety/privacy constraints retained where applicable |

## Product invariants

- Compatibility is context, not destiny.
- No public soulmate percentage, star score, or pseudo-scientific probability.
- LLMs explain deterministic facts; they do not calculate Saju.
- Missing birth time degrades gracefully; never invent one.
- Public figures, synthetic characters, and real users are different entity types.
- Synthetic/public-figure records never enter real Like/Match/Message state machines.
- Do not make scientific predictive claims for Saju / Gung-hap.
- Korean Saju/Gung-hap is described as Korean practice within the broader East Asian Four Pillars tradition.
- Personal birth data should remain private and out of ordinary logs/analytics.

## Optional future Marketplace Mode

The repository still contains a detailed US-first dating-marketplace blueprint: real-user eligibility, safety, matching, chat, city liquidity, analytics, payments, legal/app-store readiness, and production operations.

Those remain available if the project later expands. They are deferred from the **first product scope**, not removed from the long-term architecture.
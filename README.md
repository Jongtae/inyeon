# INYEON — Korean Compatibility Lab

**INYEON — Explore connection through Korean Saju and Gung-hap.**

INYEON is currently a **personal toy / research project**. The near-term goal is not startup success or a fully operated dating marketplace. The goal is to build a fun, rigorous compatibility lab around Korean Saju (사주), Gung-hap (궁합), and Inyeon (인연), while preserving the option to evolve into a real dating product later.

> **Toy Mode first. Marketplace Mode later, only by explicit decision.**

The first useful product should work even with one user:

`Me → my Saju → compare with public figures → explore synthetic characters → understand relationship dynamics`

## Current product direction

Toy Mode prioritizes:

1. deterministic Four Pillars / Manseryeok calculation;
2. a validated open-source adapter rather than greenfield calendar math;
3. sourced public-figure birth data for recognizable comparisons;
4. transparent synthetic characters for broad compatibility exploration;
5. explainable `What clicks / Potential friction / Why this?` relationship output;
6. a simple polished UI before marketplace infrastructure.

Real-user dating discovery, likes, matches, chat, payments, city seeding, app-store launch, large-scale moderation, and production operations are documented future options but are **not the default execution target** while Toy Mode is active.

See `docs/TOY_PROJECT_MODE.md`.

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

Issue #8 now evaluates/adopts a pinned open-source Manseryeok implementation behind an INYEON-owned adapter and validates it against independent references and golden fixtures.

INYEON-specific value should live above the commodity calculation layer:

- normalized chart features;
- compatibility-rule representation;
- explainability;
- public/synthetic comparison experiences;
- later, if desired, real dating ranking/outcome learning.

## Start here for Codex

1. Read `AGENTS.md`, `CODEX.md`, and `docs/TOY_PROJECT_MODE.md`.
2. Read `SAJU_ENGINE_SPEC.md`, `MATCHING_SPEC.md`, `PRD.md`, and `ARCHITECTURE.md` as reference documents.
3. Validate `.codex/config.toml` and run `scripts/check_harness.py`.
4. In Toy Mode, prioritize the execution path defined in `CODEX.md` rather than blindly following historical P0 marketplace priorities.

Recommended Codex instruction:

```text
Read AGENTS.md, CODEX.md, docs/TOY_PROJECT_MODE.md, SAJU_ENGINE_SPEC.md,
PRD.md and ARCHITECTURE.md.

Operate in Toy Mode.
Do not optimize for startup launch or marketplace completeness.
Prioritize the validated Manseryeok adapter, derived compatibility features,
golden fixtures, public-figure dataset (#50), synthetic compatibility lab (#49),
and a minimal polished comparison UI.

Use existing issues and refine them when evidence changes.
Do not rebuild calendrical primitives that a validated open-source dependency already provides.
Continue implementation until a real Human Gate is reached.
```

## Durable source-of-truth documents

| Document | Purpose |
|---|---|
| `docs/TOY_PROJECT_MODE.md` | current project mode and execution priorities |
| `CODEX.md` | autonomous execution contract for the active mode |
| `PRD.md` | broad product possibilities and historical marketplace design |
| `ARCHITECTURE.md` | system/data boundaries and target technical design |
| `SAJU_ENGINE_SPEC.md` | deterministic Four Pillars/Saju methodology requirements |
| `MATCHING_SPEC.md` | compatibility and optional future dating constraints |
| `BACKLOG.md` | historical issue map; issue priority is subordinate to active Toy Mode |
| `BUSINESS.md` | optional future business/startup reference, not a current success requirement |
| `SAFETY.md`, `PRIVACY.md` | safety/privacy constraints to retain where applicable |

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

Those remain useful if the toy project becomes compelling enough to pursue further. They are intentionally deferred rather than deleted.
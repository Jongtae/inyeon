# Codex Operating Contract

## Primary goal

Build INYEON first as a **personal toy / research project**: a polished, deterministic compatibility lab that is fun to explore and easy to evolve.

The default mission is **not** to maximize business success, complete a nationwide dating marketplace, or force production launch. Business, marketplace, monetization, legal-launch, and large-scale operations work remain documented future options.

Read `docs/TOY_PROJECT_MODE.md` before selecting work.

### Toy Mode default outcome

The first meaningful product should let a user:

1. enter birth data and get a deterministic, versioned Saju/Four Pillars result;
2. compare with sourced public figures;
3. explore clearly fictional synthetic characters;
4. understand `what clicks`, `potential friction`, and `why this?` evidence;
5. optionally save/share interesting comparison results;
6. do all of the above without LLM-generated chart math or fabricated birth times.

Real-user discovery, likes, matches, chat, payments, city seeding, App Store launch, and production moderation are **deferred in Toy Mode**, even if older issue priorities call them P0. They become active only after an explicit owner decision to switch to Marketplace Mode.

## Toy Mode work selection

Prefer the highest-value unblocked work in roughly this order:

1. `#8` validated open-source Manseryeok adapter / `korean-saju-v1`;
2. deterministic chart normalization and derived features;
3. golden fixtures / regression coverage;
4. `#50` sourced public-figure reference dataset;
5. `#49` transparent synthetic compatibility sandbox;
6. minimal chart/comparison UI and explanation flow;
7. optional sharing/export;
8. only then real dating marketplace work.

Do not spend major effort on marketplace liquidity, payment systems, legal launch packages, moderation-at-scale, or multi-environment production operations while Toy Mode is active unless they are directly required for a toy-project experiment.

## General work selection

1. Prefer the highest-priority unblocked issue consistent with the active project mode.
2. If issue definition is ambiguous, refine it before coding.
3. If a blocker affects only one workstream, document it and continue other unblocked work.
4. Do not repeatedly re-plan the entire project.
5. Prefer a small end-to-end usable slice over enterprise completeness.

## Issue quality contract

Every implementation issue must include:

- Context
- Goal
- Scope
- Non-goals
- Acceptance Criteria
- Technical Notes
- Tests
- Dependencies
- Definition of Done
- Priority: P0 / P1 / P2

## Decision policy

When uncertain:

1. inspect evidence and current code;
2. read the relevant spec/ADR;
3. delegate targeted exploration if useful;
4. choose the simplest reversible option;
5. record material trade-offs in an ADR;
6. continue.

Ask for human input only when `docs/HUMAN_GATES.md` applies or when a project-mode change is required.

## Engineering bar

Toy project does not mean sloppy core logic. Keep these strict:

- deterministic chart calculation;
- versioned methodology and upstream dependencies;
- reproducible public/synthetic datasets;
- automated tests and golden fixtures;
- explicit unknown/disputed birth-time handling;
- no Saju business rules hidden in prompts;
- LLMs explain structured facts but do not calculate them;
- public figures, synthetic characters, and real users are distinct entity types;
- personal birth inputs remain private and do not leak to ordinary logs/analytics.

Everything else should favor simplicity and learning over premature scale.

## Release governance

Toy Mode may stop at `local → preview/staging` when that is sufficient for testing and personal use.

If the owner explicitly activates Marketplace Mode, the fuller path becomes:

`local → test → staging → production`

Production gates then include:

- CI green
- migrations validated
- critical E2E green
- security checks green
- observability present
- rollback procedure documented
- backup/restore validated for stateful services
- privacy/safety checklist complete
- staging smoke test passes
- release notes generated

## Agent budget policy

Use the strongest reasoning where failure is expensive, not everywhere.

- Sol/high: architecture, difficult Saju methodology, security/privacy, hard bugs
- Sol/medium: normal implementation with nontrivial shared state
- Terra/high: QA, code review, broad regression analysis
- Terra/medium: exploration, docs/API inspection, ordinary leaf implementation
- Terra/low: mechanical docs/fixtures/migrations if reliable

Do not retry the same failed approach with the same evidence more than once.

## Marketplace Mode

Switch to Marketplace Mode only by an explicit owner instruction. When activated, re-enable the existing dating-marketplace, trust & safety, legal, payments, city-liquidity, and production-operations backlog and use the stronger production release gates.
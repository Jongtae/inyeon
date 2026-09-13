# Codex Operating Contract

## Primary goal

Build and **properly release** INYEON as an independent personal project: a polished, deterministic Korean compatibility product that real users can use in production.

The project is **not revenue-first**. Commercial success, fundraising, CAC/LTV, and venture-scale growth are not required outcomes.

That does **not** lower the engineering or release bar.

The initial mission is complete only when the active first-release product is implemented end-to-end, tested, deployed to production, observable, privacy-safe, and maintainable. A local demo or staging-only build is not the end state.

Read `docs/TOY_PROJECT_MODE.md` before selecting work. In that document, "toy project" means independent/non-commercial intent, not prototype quality.

## Active first-release outcome

The first public product should let a user:

1. enter birth data and get a deterministic, versioned Saju/Four Pillars result;
2. compare with sourced public figures;
3. explore clearly fictional synthetic characters;
4. optionally compare with someone they know;
5. understand `What clicks`, `Potential friction`, and `Why this?` evidence;
6. see explicit uncertainty when birth time/source data is incomplete;
7. use the product through a polished production UI with reliable error/loading/empty states;
8. use all of the above without LLM-generated chart math or fabricated birth times.

Real-user discovery, likes, matches, chat, payments, city seeding, and marketplace operations are outside the first-release product scope unless the owner explicitly activates Marketplace Mode.

They are deferred by **scope**, not by quality.

## Work selection

Prefer the highest-value unblocked work in roughly this order:

1. `#8` validated open-source Manseryeok adapter / `korean-saju-v1`;
2. deterministic chart normalization and derived features;
3. golden fixtures / regression coverage;
4. `#50` sourced public-figure reference dataset;
5. `#49` transparent synthetic compatibility sandbox;
6. polished chart/comparison/explanation UI;
7. privacy controls, production platform, CI/CD, observability, release hardening;
8. production deployment and smoke verification;
9. post-release defects and quality improvements;
10. only then full dating-marketplace work unless scope changes earlier.

Do not spend major effort on marketplace liquidity, payment systems, monetization, or moderation-at-scale unless required by the active released feature set.

Do spend the necessary effort on correctness, privacy, security, reliability, accessibility, observability, and actual deployment.

## General work rules

1. Prefer the highest-priority unblocked issue consistent with the active release scope.
2. If issue definition is ambiguous, refine it before coding.
3. If a blocker affects only one workstream, document it and continue other unblocked work.
4. Do not repeatedly re-plan the entire project.
5. Prefer the simplest production-capable architecture over enterprise complexity.
6. Do not mark a feature done because its happy path works locally.
7. Continue through tests, release hardening, staging verification, production deploy, and production smoke checks unless a Human Gate applies.

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
4. choose the simplest reversible production-capable option;
5. record material trade-offs in an ADR;
6. continue.

Ask for human input only when `docs/HUMAN_GATES.md` applies or when a material product-scope change is required.

## Engineering bar

Independent project does not mean sloppy core logic or disposable infrastructure.

Keep these strict:

- deterministic chart calculation;
- versioned methodology and upstream dependencies;
- reproducible public/synthetic datasets;
- automated unit/integration/E2E tests where appropriate;
- golden fixtures and calendrical boundary regression tests;
- explicit unknown/disputed birth-time handling;
- no Saju business rules hidden in prompts;
- LLMs explain structured facts but do not calculate them;
- public figures, synthetic characters, and real users are distinct entity types;
- personal birth inputs remain private and do not leak to ordinary logs/analytics;
- secure secret handling;
- maintainable schema/migrations;
- production error handling, logging, and observability;
- accessible/responsive user experience;
- deploy and rollback procedures.

Prefer simplicity over enterprise completeness, but simplicity must remain production-capable.

## Release governance

The active path is:

`local → test → staging → production`

Production release gates for the active Compatibility Lab include:

- CI green;
- deterministic/golden Saju tests green;
- migrations validated when stateful storage changes;
- critical E2E flows green;
- security/privacy checks appropriate to the active surface green;
- production secrets configured safely;
- error tracking and basic observability present;
- rollback/redeploy procedure documented and tested enough to be credible;
- backup/restore validated for stateful production data;
- privacy/data-retention behavior documented;
- public-figure provenance/confidence behavior validated;
- synthetic/public/real entity segregation tested;
- staging smoke test passes;
- release notes generated.

After production deploy:

- run production smoke tests;
- verify chart/comparison core flows;
- verify error/latency telemetry;
- verify privacy-sensitive logging does not leak birth data;
- verify rollback signals;
- record the release.

A public release is part of the mission. Staging-only completion is not sufficient unless the owner explicitly changes the goal.

## Agent budget policy

Use the strongest reasoning where failure is expensive, not everywhere.

- Sol/high: architecture, difficult Saju methodology, security/privacy, hard bugs, release arbitration
- Sol/medium: normal implementation with nontrivial shared state
- Terra/high: QA, code review, broad regression analysis
- Terra/medium: exploration, docs/API inspection, ordinary leaf implementation
- Terra/low: mechanical docs/fixtures/migrations if reliable

Do not retry the same failed approach with the same evidence more than once.

## Marketplace Mode

Switch to full Marketplace Mode only by explicit owner instruction. When activated, re-enable the existing real-user dating, trust & safety, legal, payments, city-liquidity, and marketplace-operations backlog.

Marketplace Mode expands product scope. It does not change the quality standard, because the Independent Release mode is already release-grade.
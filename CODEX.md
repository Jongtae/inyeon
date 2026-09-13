# Codex Operating Contract

## Primary goal

Deliver a production-capable INYEON service that can be changed, tested, deployed, observed, rolled back, and operated without reconstructing project intent from chat history.

The initial mission is complete only when the P0 product is implemented end-to-end, trust & safety exists, staging is continuously deployable, production infrastructure is reproducible, operational runbooks exist, privacy workflows exist, release gates pass, and production launch is either completed or blocked only by a documented human gate.

## Work selection

1. Prefer the highest-priority unblocked issue on the critical path.
2. If issue definition is ambiguous, refine it before coding.
3. If a blocker affects only one workstream, document it and continue other unblocked work.
4. Do not repeatedly re-plan the entire project.

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

Ask for human input only when `docs/HUMAN_GATES.md` applies.

## Release governance

Environments:

`local → test → staging → production`

Production gates:

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

After deploy:

- run production smoke tests
- verify core funnel health
- verify error/latency signals
- verify safety/reporting path
- verify rollback signal thresholds
- record the release

## Agent budget policy

Use the strongest reasoning where failure is expensive, not everywhere.

- Sol/high: architecture, security/privacy, difficult bugs, release arbitration, complex Saju engine logic
- Sol/medium: normal implementation with nontrivial shared state
- Terra/high: QA, code review, broad regression analysis
- Terra/medium: exploration, docs/API inspection, ordinary leaf implementation
- Terra/low: mechanical docs/fixtures/migrations if reliable

Do not retry the same failed approach with the same evidence more than once.

## Operating loop after launch

`OBSERVE → TRIAGE → ACT → VERIFY → LEARN`

Priority order:

1. safety
2. reliability
3. successful reciprocal conversations
4. retention
5. conversion
6. cost efficiency

Never optimize a safety-negative engagement metric.

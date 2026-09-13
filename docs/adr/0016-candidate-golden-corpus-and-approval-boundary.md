# ADR 0016 — Candidate golden corpus and approval boundary

- Status: Accepted candidate implementation; production methodology remains gated
- Date: 2026-09-14
- Issue: #14
- Builds on: ADR 0008, ADR 0012, ADR 0013, ADR 0014, ADR 0015

## Context

INYEON needs broad executable regression coverage before public release. A corpus generated only by the implementation under test can detect drift, exercise boundaries, and expose disagreements, but it cannot independently prove that its full chart output is correct. Calling generated values “golden truth” would overstate the evidence and could silently convert a candidate day-boundary or solar-term choice into production methodology.

The available evidence has different scopes. Official IANA data can validate timezone normalization, Astronomy Engine can independently locate apparent-Sun longitude crossings, and separate implementations can expose calendrical agreement or disagreement. None of those sources alone approves an entire Four Pillars chart or resolves the midnight-versus-late-자시 (Jasi, 子時) and true-solar-time choices.

## Decision

Create the private development/CI workspace `@inyeon/saju-golden-corpus` with two physically separate artifacts:

1. `golden-chart-corpus.v1.json` contains 240 synthetic positive contexts, separately counted negative capability cases, normalized inputs, generated `candidateObserved` chart and derived-feature snapshots, explicit coverage, source hashes and record IDs, property-level evidence grades, and disputes.
2. `golden-chart-approvals.v1.json` is not generator-managed. It contains only manually governed `approvedExpected` property anchors and starts empty.

The generator may update only candidate observations. CI regenerates them and fails on byte-level drift. Any intentional methodology or implementation change must therefore review the candidate diff, but candidate stability is not treated as correctness approval.

Evidence grades are bounded to the property actually supported: `E0` unsupported, `E1` implementation observation, `E2` separate implementation comparison, `E3` independent or official-source-derived bounded evidence without an exact fixture match, `E4` exact official/expert property-and-fixture authority, and `D` unresolved disagreement. An evidence source must not be promoted from one bounded property to full-chart authority.

Both artifacts and all linked capability manifests remain `productionValidated: false` and `productionEligible: false` until independent or expert exact-property anchors are reviewed. Resolving material methodology disagreements, engaging a paid advisor, and approving the corpus for production remain Human Gates. The candidate corpus can merge and support subsequent unblocked product work while Issue #14 stays open.

Hangul remains the primary Korean-script representation in fixture coverage and domain output. Hanja is secondary traditional detail, and stable English identifiers and explanations support the US-first product surface.

## Alternatives considered

- Store generated output directly as approved expectations: rejected because it collapses regression observation into authority.
- Block all corpus work until an advisor is available: rejected because deterministic candidate coverage, provenance plumbing, and drift detection are useful unblocked work.
- Ship the corpus in the browser package: rejected because it is a large development artifact with no runtime role.
- Assign one evidence grade to each whole fixture: rejected because timezone, solar boundary, day/hour, full-chart, and derived-feature claims have different evidence strength.

## Consequences

The repository gains broad, machine-executable coverage across supported zones, time precision modes, solar and civil boundaries, DST eras, leap/range cases, and the visible 60-pillar domain. CI can detect silent output drift and reviewers can inspect exact provenance without mistaking generated behavior for validated truth.

Issue #14 is only partially satisfied: construction and CI wiring are complete, while independent/advisor spot-checking and production promotion remain blocked at the declared methodology gate. Later approved expectations must be narrow, attributable, manually reviewed, and linked to the exact fixture/property they support.

## Security / privacy / safety impact

All fixtures are synthetic reference cases. The corpus contains no production-user or public-figure record and is not imported by the browser application. It adds no network call, persistence, analytics, runtime secret, or personal-data path. The separation also reduces the safety risk of presenting a disputed traditional method as settled fact.

## Rollback / migration

Remove the private workspace and linked capability metadata. Runtime adapter and derived-feature APIs do not depend on the corpus, so no user data or browser migration is required. An approvals artifact must never be regenerated or discarded as part of candidate rollback.

## Evidence to revisit

- exact-property independent or Korean Saju expert review;
- Korean lunar/KASI-aligned reference anchors where their supported scope is clear;
- resolution of midnight versus late-자시 day rollover;
- resolution of true solar time policy;
- the three recorded 61–72 second solar-term reference disagreements;
- production launch criteria and advisor budget/terms under `docs/HUMAN_GATES.md`.

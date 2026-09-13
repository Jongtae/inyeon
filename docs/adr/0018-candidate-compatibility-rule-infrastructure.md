# ADR 0018 — Candidate compatibility-rule infrastructure

- Status: Accepted candidate infrastructure; production mappings remain gated
- Date: 2026-09-14
- Issue: #33
- Builds on: ADR 0010, ADR 0015, ADR 0017

## Context

INYEON needs inspectable, versioned pair evidence before evidence-availability and deterministic narrative work can proceed. No traditional signal-to-modern-relationship-dimension mapping or expert compatibility fixture is currently approved. The existing derived-feature contract intentionally excludes combinations, clashes, hidden stems, Ten Gods, seasonal weighting, and strength.

## Decision

Create private workspace `@inyeon/compatibility-rules@0.1.0` with rule-set contract `korean-compatibility-rules-v1` and an empty product catalog.

The closed DSL declares exact feature requirements, finite equality predicates, pair semantics, hour dependency, neutral dimension IDs, categorical salience, reviewed copy keys, prohibited-category IDs, attributable evidence references, and per-version review state. It accepts only the current visible derived-feature contract. It has no arbitrary expression language, JSONPath, callbacks, prompt logic, or aggregate numeric compatibility score.

The deterministic evaluator preserves both participants' retained variants. It groups identical required-feature signatures before evaluating their Cartesian combinations, retains the original variant IDs for each group, emits a definitive result only when all combinations agree, and otherwise preserves correlated alternatives. Explicit group-pair and repeated-ID budgets suppress before materialization can exhaust browser memory. As refined by ADR 0019, missing required features and ineligible hour evidence are `unavailable`, never a negative match; candidate review status and resource limits are `suppressed`.

Candidate mappings are always suppressed. The public product entry evaluates only the checked-in catalog, which contains zero rules. Synthetic mapping fixtures exist only in package tests and are inaccessible through the package export map. The public snapshot records versions, temporal support, rule traces, and limitations, but omits raw birth inputs and chart facts.

## Methodology boundary

The evaluator does not calculate 합 (combination, 合), 충 (clash, 沖), Five Element generating/controlling cycles, or other traditional relations. A future rule may consume such a primitive only after a separately versioned derived-feature addition has attributable evidence and the applicable Human Gate passes. Rule salience is not the evidence-availability model defined by Issue #34 and cannot become a public score.

## Consequences

Issue #34 can build calibrated evidence availability on a stable seam without inventing relationship claims. Issue #33 remains open because there are zero approved rules, zero approved mappings, and zero expert fixtures; meaningful production Gung-hap evidence and relation primitives remain gated.

## Security / privacy / safety impact

The package is pure and browser-capable. It performs no I/O, persistence, logging, clock, randomness, or runtime LLM call. Exact-key and data-descriptor validation fails closed for unexpected identity/raw-input fields, accessors, and hostile objects. Generic errors do not reflect caller data. Candidate or incomplete rules cannot reach narrative output.

## Rejected alternatives

- Add familiar traditional mappings without authority: rejected as a Human Gate bypass.
- Put candidate mappings in product data but hide them in UI: rejected because they remain reachable runtime claims.
- Materialize every variant pair: rejected because bounded time windows could cause avoidable browser memory growth.
- Calculate traditional primitives inside rule predicates: rejected because methodology belongs in reviewed derived features.
- Add numeric weights or an overall score: rejected because it confuses salience with evidence and violates product policy.

## Revisit

Revisit exact rule versions only with attributable methodology sources, property-level cultural/Saju review, expert fixtures, #14 chart approval, independent QA/security verification, and reviewed public copy.

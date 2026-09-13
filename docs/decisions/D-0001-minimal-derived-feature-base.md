---
decision_id: D-0001
experiment_id: null
date: 2026-09-14
status: validated
signal: "Issue #13 needs a deterministic feature seam before the approved compatibility taxonomy and rules exist."
evidence_class: methodology
sources:
  - "GitHub Issue #13"
  - "ADR 0014"
  - "SAJU_ENGINE_SPEC.md"
communities: []
independent_mentions: unknown
source_diversity: low
reproducible: true
impact: high
confidence: high
analyst_interpretation: "A narrow visible-symbol layer satisfies the current dependency while avoiding unsupported traditional interpretation."
alternative_explanations:
  - "Later approved rules may demonstrate that one or more currently excluded primitives are necessary."
strongest_evidence_for: "Day Master, visible element/polarity annotations, and uncertainty-preserving unit counts can be derived exhaustively from normalized chart output without a new methodology choice."
strongest_evidence_against: "The final compatibility DSL and release corpus do not exist yet, so the minimal contract may need an additive revision."
source_sample_bias: "This is an internal architecture/methodology decision, not user or market evidence."
decision: ACT
change: "Implement korean-saju-derived-v1 as the narrow visible Day Master, element/polarity, and unit-occurrence base."
not_doing:
  - "No balance, strength, dominance, seasonal weighting, or hidden stems."
  - "No Ten Gods or stem/branch combination, clash, harm, punishment, or break relations."
  - "No relationship-dimension, gender, or sexuality logic."
risk_class: medium
review_after: "At #6 inclusive taxonomy, #33 approved rule primitives, and #14 release-corpus review."
verification: "Exhaustive table tests, uncertainty/correlation tests, generic-error privacy tests, and later consumption by the #33 typed rule layer."
result: "The candidate contract passed exhaustive canonical-table and pinned-reference checks, all supported temporal modes, uncertainty-correlation tests, non-reflective error and prototype-pollution regressions, independent QA, independent security review, and repository CI gates. This validates only the narrow deterministic seam; production Saju methodology remains unvalidated."
---

# Decision

Act on the narrow deterministic base now. Do not interpret visible element occurrences as balance or strength, and do not expand the feature ontology until the named review points provide concrete evidence.

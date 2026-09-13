---
decision_id: D-0004
experiment_id: null
date: 2026-09-14
status: validated
signal: "Issue #34 requires truthful behavior across exact, approximate, disputed, date-only, and unknown birth-time inputs without implying predictive calibration."
evidence_class: methodology
sources:
  - "GitHub Issue #34"
  - "ADR 0014"
  - "ADR 0015"
  - "ADR 0017"
  - "ADR 0018"
  - "docs/HUMAN_GATES.md"
communities: []
independent_mentions: 0
source_diversity: low
reproducible: true
impact: high
confidence: high
analyst_interpretation: "Categorical evidence availability is testable without approved traditional mappings and allows downstream copy to distinguish supported, ambiguous, unavailable, and suppressed evidence."
alternative_explanations:
  - "US users may understand a different set of public labels more readily."
  - "The first approved rules may reveal that some categories need finer feature-level detail."
  - "An empty production catalog verifies architecture but not real-result usefulness."
strongest_evidence_for: "The existing derived-chart contract preserves time uncertainty as retained variants, and the deterministic rule seam can prove whether all possible evaluations agree without inferring or averaging missing time."
strongest_evidence_against: "There are no approved product rules or representative US-user comprehension results, so neither real-result usefulness nor final public wording is established."
source_sample_bias: "Evidence is repository contracts, synthetic fixtures, and independent engineering review; it is not cultural/Saju approval, scientific validation, or representative user research."
decision: ACT
change: "Implement a categorical evidence-availability model, privacy-safe limitation codes, rule-requirement enforcement, and stable pair summaries without any numeric or predictive confidence score."
not_doing:
  - "Do not create a probability, soulmate score, high/medium/low grade, ranking weight, or scientific-validity claim."
  - "Do not infer a missing birth hour or silently select or average a retained variant."
  - "Do not expose candidate or unavailable narrative metadata."
  - "Do not add a traditional mapping or mark the product catalog production eligible."
risk_class: high
review_after: "The first approved rule set, qualified methodology review, and credible US-user comprehension evidence for the limitation language."
verification: "Exact/approximate/disputed/date-only/unknown matrices, requirement/hour-consistency validation, correlated variants, pair-order checks, serialization determinism, privacy snapshots, independent QA/security review, and repository CI."
result: "The candidate evidence-availability model, snapshot v2, input-completeness summaries, unavailable/suppressed separation, narrative-metadata minimization, and stable serialization passed 154 repository tests, full build/static/governance checks, independent QA, and independent security review. No product rule, numeric score, predictive claim, methodology approval, or L4 evidence was created."
---

# Decision

Act on categorical availability infrastructure only. Keep the product catalog empty and distinguish consistency across birth-time possibilities from any claim that Saju scientifically predicts a relationship.

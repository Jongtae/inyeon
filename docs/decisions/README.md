# Product Decision Ledger

This directory is durable memory for material product decisions, especially decisions triggered by external feedback or experiments.

Before reversing a prior product choice, agents should search this directory for relevant decisions and explain what new evidence justifies the reversal.

## File naming

Use:

`D-####-short-slug.md`

Example:

`D-0001-birth-time-explanation.md`

## Required structure

```yaml
decision_id: D-0001
experiment_id: R-0001 | null
date: YYYY-MM-DD
status: pending | validated | rejected | superseded
signal: "short description"
evidence_class: acquisition | comprehension | trust | product_utility | methodology | sharing | reliability | other
sources:
  - url-or-reference
communities:
  - subreddit-or-source
independent_mentions: number | unknown
source_diversity: low | medium | high
reproducible: true | false | unknown
impact: low | medium | high | critical
confidence: low | medium | high
analyst_interpretation: "..."
alternative_explanations:
  - "..."
strongest_evidence_for: "..."
strongest_evidence_against: "..."
source_sample_bias: "..."
decision: IGNORE | OBSERVE | EXPERIMENT | ACT | METHODOLOGY_REVIEW
change: "exact action or experiment"
not_doing:
  - "explicitly rejected/withheld action"
risk_class: low | medium | high
review_after: "date or next N comparable cohorts"
verification: "how we will know whether the decision worked"
result: pending | "later evidence/result"
```

## Decision rules

- Keep raw evidence references; do not replace them with a persuasive summary.
- Preserve contradictory evidence.
- Distinguish acquisition performance from product-value evidence.
- Distinguish observed problem from user-requested solution.
- Prefer the smallest reversible intervention.
- Saju/Gung-hap methodology disputes require the methodology-review path and cannot be changed directly from Reddit opinion.
- High-risk privacy/security/methodology/architecture/positioning decisions follow Human Gates even if feedback volume is high.
- For noncritical feedback, respect the normal evidence/cooldown window before changing the product.

See `docs/REDDIT_EXPERIMENT_GOVERNANCE.md` and ADR 0003.

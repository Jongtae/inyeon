---
decision_id: D-0006
experiment_id: null
date: 2026-09-14
status: validated
signal: "Issue #49 requires a large fictional exploration corpus without simulating members, population evidence, or validated compatibility."
evidence_class: product_utility
sources:
  - "GitHub Issue #49"
  - "PRD.md"
  - "ROADMAP.md"
  - "ADR 0009"
  - "ADR 0019"
communities: []
independent_mentions: 0
source_diversity: low
reproducible: true
impact: high
confidence: medium
analyst_interpretation: "A deterministic and segregated synthetic corpus is a reversible exploration substrate, but corpus size and technical coverage do not prove user value, population representation, or compatibility validity."
alternative_explanations:
  - "A smaller curated collection may provide equivalent initial value."
  - "Future engagement may reflect decorative prompt or avatar appeal rather than Saju utility."
  - "Repeated chart states may make the nominal character count less useful than it appears."
strongest_evidence_for: "The first-release product contract consistently requires a synthetic mode, and ADR 0009 provides a safe deterministic entity boundary."
strongest_evidence_against: "There is no US-user evidence, no production UI, and the approved compatibility-rule catalog remains empty."
source_sample_bias: "Evidence is internal governance and architecture only; there is no representative user, Reddit, cultural-expert, or relationship-outcome sample."
decision: ACT
change: "Build 10,000 deterministic adult-range fictional references as a compact virtual catalog with a separate type/namespace, pinned generator/PRNG/distributions, full-inventory checksum, coverage/duplicate/stereotype report, candidate pipeline validation, and default-off feature contract. Transfer UI, narrative, sharing, privacy, and deployed-performance integration explicitly to #53, #35, #43, #52, and #47."
not_doing:
  - "Do not call the records members, prospects, real people, or dating supply."
  - "Do not claim population representativeness, compatibility validity, cultural authenticity, or product utility from corpus size."
  - "Do not infer personality or lifestyle from Saju."
  - "Do not add relationship archetypes or approved claims while the product rule catalog is empty."
  - "Do not use real names, photos, biographies, public-figure records, personal data, or marketplace affordances."
  - "Do not treat selection or share behavior as relationship-outcome evidence."
risk_class: high
review_after: "After #53/#35/#43 integration and the first two comparable US-first user-feedback cohorts."
verification: "10,000 valid unique records; byte-identical regeneration; manifest/checksum verification; strict namespace and forbidden-field tests; adult-range fixtures; finite-token safety review; style/prompt assignment independent of chart outputs; measured coverage/skew and duplicate reports; artifact budget; independent QA/security review; and full CI."
result: "Validated for the bounded generator/data scope: exactly 10,000 deterministic adult-range fictional references produced 10,000 unique IDs, display names, and content fingerprints, with 9,982 unique birth contexts reported honestly. All records passed the actual candidate adapter, derived-feature, and compatibility-evaluator seam with zero approved relationship rules, no-approved-evidence, and productionEligible false. The compact generated artifacts total about 11 KB and v1 profile/inventory hashes are release-locked. Product Judge returned ACT for infrastructure and OBSERVE for value claims; independent QA and security approved after schema, identity-projection, version-provenance, adult-boundary, and ID-stability fixes. Repository lint, typecheck, 174 tests, static build verification, dependency audit, harness checks, and structural L4 checks passed. This does not validate the public UI, sharing, US-user utility, population representation, cultural authenticity, compatibility methodology, production release, or L4 operation."
---

# Decision

Act on the bounded synthetic data substrate while keeping product-value, compatibility, methodology, and release claims explicitly unvalidated.

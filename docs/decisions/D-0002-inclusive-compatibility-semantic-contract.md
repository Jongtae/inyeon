---
decision_id: D-0002
experiment_id: null
date: 2026-09-14
status: validated
signal: "Issue #6 requires a safe semantic contract before compatibility rules or deterministic narrative copy can be implemented."
evidence_class: other
sources:
  - "GitHub Issue #6"
  - "AGENTS.md"
  - "PRD.md"
  - "MATCHING_SPEC.md"
  - "ADR 0010"
  - "ADR 0015"
  - "https://www.apa.org/about/apa/equity-diversity-inclusion/language-guidelines"
  - "https://dpcpsi.nih.gov/sites/default/files/CULTURALLY%20COMPETENT%20GENDER-RELATED%20COMMUNICATIONS%20SUMMARY_UPDATED%20June%202023.pdf"
  - "https://www.nih.gov/nih-style-guide/person-first-destigmatizing-language"
communities: []
independent_mentions: 0
source_diversity: low
reproducible: true
impact: high
confidence: high
analyst_interpretation: "Repository policy strongly requires an inclusive, non-fatalistic relationship vocabulary, but there is no external user evidence yet that validates the usefulness or comprehension of any particular dimension label."
alternative_explanations:
  - "US users may prefer a smaller set of conversation prompts rather than eight visible dimensions."
  - "Korean cultural framing may drive curiosity without proving that the taxonomy itself is useful or clear."
strongest_evidence_for: "The deterministic rule and narrative architecture cannot prevent unsafe or identity-sensitive claims consistently without a shared machine-readable semantic boundary."
strongest_evidence_against: "No production usage, user interviews, Reddit evidence, or independent cultural/Saju expert review currently validates the chosen dimensions or traditional mappings."
source_sample_bias: "The decision is driven by internal product and safety governance plus general inclusive-language guidance, not representative market evidence or Saju methodology authority."
decision: ACT
change: "Create inclusive-compatibility-v1 as a candidate semantic/safety contract with eight neutral pair-level dimensions, reviewed-copy allowlisting, explicit uncertainty and swap semantics, and a machine-readable prohibited-claims matrix."
not_doing:
  - "Do not include resource or financial-habit inference in v1."
  - "Do not treat identity, orientation, pronouns, marital status, or relationship structure as compatibility inputs."
  - "Do not approve any traditional signal-to-dimension mapping until a versioned Issue #33 rule and applicable methodology review exist."
  - "Do not claim that the dimensions predict personality, behavior, relationship outcomes, or user preference."
risk_class: high
review_after: "Issue #33 rule review, Issue #35 deterministic copy integration, cultural/Saju expert review, and the first credible US-user comprehension evidence."
verification: "Typed contract tests, identity-input rejection, pair-swap invariants, temporal uncertainty tests, prohibited and reviewed-copy adversarial fixtures, independent QA/security review, and repository CI."
result: "The candidate semantic contract, prohibited-claims matrix, Lab-first matching spec, temporal full-coverage rules, identity-input defenses, and Korean presentation policy passed 136 repository tests, independent QA, and independent security/safety review. This validates the contract boundary only; cultural/Saju methodology review and real US-user comprehension evidence remain pending."
---

# Decision

Act on the smallest safe semantic contract. Keep public copy natural US English while retaining explicit Korean roots, with Hangul before Hanja whenever Korean script is shown. Treat every traditional mapping and public claim as unavailable until a reviewed deterministic rule supplies evidence; the taxonomy itself is not methodology authority.

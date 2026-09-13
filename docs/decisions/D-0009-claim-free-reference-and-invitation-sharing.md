---
decision_id: D-0009
experiment_id: null
date: 2026-09-14
status: validated
signal: "Issue #43 must add useful sharing while the product has zero approved relationship rules and ADR 0007 prohibits transferable personal chart representations."
evidence_class: sharing
sources:
  - "GitHub Issue #43"
  - "ADR 0007"
  - "Decision D-0008"
communities: []
independent_mentions: 0
source_diversity: low
reproducible: true
impact: high
confidence: medium
analyst_interpretation: "A closed public-reference and invitation projection can make the static Lab shareable without exporting a private result or implying relationship meaning."
alternative_explanations:
  - "Interest in a shared artifact may reflect public-figure novelty, visual design, or K-culture curiosity rather than product utility."
  - "Low sharing may reflect browser capability or an unclear call to action rather than weak core value."
  - "Automated privacy correctness does not prove that US users understand the claim-free distinction."
strongest_evidence_for: "ADR 0007 already defines a versioned allowlist, local image generation, safe links, and a kill switch, while #53 supplies fixed Pages-safe routes and canonical public/synthetic entity IDs."
strongest_evidence_against: "There are zero approved relationship rules or copy entries, no public deployment, and no external US-user comprehension or sharing evidence."
source_sample_bias: "Evidence is limited to repository governance, implementation contracts, and automated tests; no public-use cohort or representative US audience is present."
decision: ACT
change: "Implement claim-free local PNG cards and strict reference/invitation links for general Lab, compare invitations, and validated public/fictional references. Keep Someone I Know results private and make Compare with me invitation-only."
not_doing:
  - "Do not share an archetype, score, relationship claim, personal chart, derived feature, pair evidence, narrative object, or free-form user value."
  - "Do not embed an encoded, hashed, compressed, or otherwise reversible personal representation in Compare with me."
  - "Do not add a remote renderer, backend, analytics, referral identity, or automatic social posting."
  - "Do not infer methodology validity, product value, or US-user comprehension from implementation tests."
risk_class: high
review_after: "Independent security/QA review, Issue #52 privacy verification, production smoke under Issue #47, and the first two comparable US-first comprehension cohorts."
verification: "Strict projection/parser tests, local PNG byte canaries, share/download/copy browser paths, invalid-link fail-closed behavior, entity disclosure checks, Pages direct-open/refresh, kill-switch checks, and extended storage/network/URL/console privacy canaries."
result: "Validated for the bounded claim-free sharing boundary. The static app now creates four strict, versioned payload kinds for the Lab, compare invitations, checked-in public references, and visibly fictional references; all personal/result values and free-form fields are excluded. PNG cards are generated locally from a closed view model, Web Share prefers the local file, and local download plus safe-link copy fallbacks work. Received links are treated as untrusted display hints, references are revalidated against checked-in identity, Someone I Know results remain unshareable, and Compare with me contains no personal representation. A separate production build proves VITE_SHARING_ENABLED=false removes creation and reconstruction while private calculation remains available. Independent Product Judge returned ACT for this bounded layer and OBSERVE for usefulness/comprehension; final independent QA and security reviews approved. Repository verification includes 254 unit/integration tests, 9 normal production-preview Chromium tests, 1 disabled-build Chromium test, static build verification, dependency audit, harness checks, and structural L4 checks. This does not validate Saju methodology, relationship mappings, US-user comprehension or utility, deployed privacy, production release, or L4 operation."
---

# Decision

Act on the bounded claim-free reference and invitation sharing layer. Continue to observe whether US users understand it and find it useful; sharing behavior alone does not validate Saju methodology or relationship meaning.

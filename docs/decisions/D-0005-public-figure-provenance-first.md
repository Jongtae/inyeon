---
decision_id: D-0005
experiment_id: null
date: 2026-09-14
status: validated
signal: "The zero-backend product needs browsable public references, while source conflict, invented hours, entity confusion, and celebrity endorsement implications create material integrity risk."
evidence_class: product
sources:
  - "GitHub Issue #50"
  - "ADR 0009"
  - "ADR 0014"
  - "ADR 0019"
  - "Wikidata Licensing"
  - "Wikidata Query Service"
communities: []
independent_mentions: 0
source_diversity: low
reproducible: true
impact: high
confidence: medium
analyst_interpretation: "A separately typed, provenance-preserving static corpus can provide safe browse and calculation inputs without pretending public figures are members or that one structured source is factual authority."
alternative_explanations:
  - "A much smaller curated list may provide the same initial user value."
  - "Synthetic references may be safer or more useful than celebrity references."
  - "Sitelink breadth may correlate poorly with recognizability for the target US audience."
strongest_evidence_for: "PRD, roadmap, architecture, and ADR 0009 consistently require 500+ public references with value-level provenance and separate identity boundaries."
strongest_evidence_against: "There is no representative US-user evidence that public-figure comparison creates durable value, and approved product compatibility rules remain at zero."
source_sample_bias: "The baseline is a single structured aggregator filtered through English Wikipedia presence and Wikimedia sitelinks, with substantial English-language, internet-notability, US, and Global North bias."
decision: ACT
change: "Build the separate PublicFigure domain, fixed Wikidata source snapshot, deterministic normalizer, conflict quarantine, search index, quality/diff report, manifest, and pinned chart-pipeline eligibility seam."
not_doing:
  - "Do not infer missing birth time, coerce unsupported places or dates, or select conflicting values."
  - "Do not add images, scraped biography prose, private-life claims, or celebrity endorsement/availability language."
  - "Do not merge public references with personal or synthetic entity domains."
  - "Do not claim representativeness, recognizability, product-value validation, Saju methodology approval, production release, or L4 evidence."
risk_class: high
review_after: "Independent data/QA/security review, user-facing #53/#35 integration, source-diversity audit, and credible US-user comprehension/utility evidence."
verification: "500+ unique source records, value-level provenance, deterministic hashes, conflict quarantine, refresh-diff behavior, search indexes, namespace/forbidden-field checks, date-only hour suppression, same pinned adapter/derived/rule pipeline, and full CI."
result: "Validated for the bounded data-layer scope: 600 pinned source records produced 582 published date-only/image-free references, 18 quarantined records, and 13 fail-closed comparison-eligible records. Product Judge returned ACT; independent QA and security reviews approved after ingestion-boundary fixes. Repository lint, typecheck, 167 tests, static build verification, harness checks, and structural L4 checks passed. This does not validate US recognizability, representativeness, user utility, public UI, Saju methodology, production release, or L4 operation."
---

# Decision

Act on provenance-first public-reference data without weakening the adapter capability boundary. Treat selection breadth as a transparent corpus property, not proof of recognizability or representation.

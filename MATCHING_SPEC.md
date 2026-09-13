# Matching and Compatibility Specification

## Eligibility before compatibility

Candidate generation must first enforce:

1. 18+ / account eligibility
2. mutual gender/orientation compatibility
3. relationship intent constraints
4. age preferences
5. block/report/safety exclusions
6. metro/distance policy
7. deal-breakers and account state

Saju must never make an otherwise unsafe/ineligible person eligible.

## Ranking architecture

Use separate feature families:

- behavioral/profile relevance
- activity/quality
- marketplace diversity/exposure controls
- bounded Gung-hap features

Do not expose an overall compatibility number to users.

Internal scores may exist for ranking, but must be versioned, calibrated, and separable by feature family.

## Compatibility rule engine

Rules are structured, versioned data/code, not prose prompts. Every rule should specify:

- required inputs
- deterministic evidence
- dimensions affected
- confidence contribution
- allowed narrative concepts
- prohibited claims
- methodology/rule version

## Explainability output

A pre-match relationship card should normally contain:

- relationship archetype/headline
- what may click
- what may require care
- a question to ask
- confidence/limitations when material
- “why this?” evidence path

## Outcome learning

Store traditional compatibility features separately from real-world dating outcomes. Future ranking experiments may learn from consented outcomes, but product copy must not claim this proves astrology causes relationship success.

Critical experiment:

- A: baseline ranking, no compatibility explanation
- B: baseline ranking + explanation
- C: baseline + bounded Saju ranking feature + explanation

Measure downstream reciprocal conversations and dates, with safety/fairness guardrails.

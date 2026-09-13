# Synthetic-character provenance and generation boundary

Synthetic characters have no real-world factual provenance because they are not real people. Their durable provenance is the generator contract:

- data version: `synthetic-characters-v1`;
- generator: `synthetic-character-generator-v1`;
- algorithm: `inyeon-index-mix32-v1` using fixed unsigned 32-bit integer operations and rejection-sampled bounded selection;
- master seed: committed in the generator profile;
- inventory: ordinals 0–9,999;
- birth fixture range: 1989-01-01 through 2004-12-31, validated against the pinned 2026-09-14 reference date and minimum age 18 to keep every v0.1 fictional reference in an adult range;
- calculation zones: Los Angeles, New York, and Seoul capability strata—not claimed residences, hometowns, nationalities, ethnicities, or population weights.

Each field uses a fixed stream identifier, so adding calls in one field does not silently change the other fields. The ordinal guarantees identity uniqueness. A separately checked-in release lock pins the exact profile and full virtual-inventory SHA-256 values for v1. Generator or distribution changes require a new generator/data version, release-lock file, and ID namespace; an old ID must never be silently reinterpreted under a new algorithm.

## Fiction and stereotype boundary

The display identifier cannot resemble a conventional full name. Abstract avatar tokens contain no face, body, skin tone, gender presentation, or external URL. The finite scene-prompt vocabulary is assigned without reading chart or derived features. It is decorative context, not personality, behavior, compatibility, or cultural authenticity.

The schema excludes account/member/profile IDs, Like, Match, Message, distance, online/activity, availability, endorsement, testimonial, and inbound-interest state. It also excludes gender, sexuality, race, ethnicity, nationality, body, health, wealth, occupation, and relationship-status fields. No public-figure or personal record is an input to generation.

## Calculation and evidence boundary

Every build materializes all 10,000 records and validates their generated contexts with the same pinned adapter and derived-feature package. It also calls the compatibility evaluator. That validates technical compatibility with the candidate pipeline; it does not validate Saju methodology or a relationship meaning.

The product rule catalog currently has zero approved rules. The quality report therefore records approved relationship-evidence coverage as unavailable and `productionEligible: false`. Repeated birth contexts or chart signatures are expected in a finite calendrical space and cannot be called distinct relationship types. The manifest pins the transient full-inventory checksum plus the compact report/profile hashes.

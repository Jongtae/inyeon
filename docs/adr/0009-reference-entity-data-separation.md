# ADR 0009 — Public-figure provenance and synthetic-reference separation

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON
- Builds on: ADR 0001 — Independent Release, Zero-Backend First Release

## Context

Public figures and fictional synthetic characters both make a zero-liquidity Compatibility Lab useful, but they have different truth, provenance, licensing, and abuse risks. Neither may be modeled as a real user or passed through future dating-marketplace state machines.

## Decision

### Entity boundary

Use a discriminated reference union with non-overlapping namespaces:

- `PublicFigure { kind: "public_figure", id: "public:<slug>", ... }`
- `SyntheticCharacter { kind: "synthetic", id: "synthetic:<generator-version>:<seed-id>", ... }`

Personal in-memory subjects use a third domain type and are never serialized into either static dataset. Compatibility consumes a read-only normalized `ReferenceSubject` projection while UI, sharing, and analytics retain the original discriminator.

### Public-figure records

- Store canonical name/aliases, category/region, birth facts, value-level provenance, source retrieval date, source publisher/title/URL, source confidence, dispute notes/candidates, record/schema/data versions, and image source/license/attribution when applicable.
- Birth time is nullable and carries precision/confidence independently from birth date and place. Use `verified | well_sourced | disputed | date_only | unknown`; do not collapse disputed candidates into a guessed value.
- Build validation rejects required birth facts without provenance, unsupported confidence values, time without time-specific provenance, invalid source URLs/dates, and image use without approved license metadata.
- Public figures are references, not members, prospects, participants, or endorsers. UI and share copy must not imply romantic availability or private knowledge.
- Source updates are reviewed diffs. Material public claims with unresolved reputational/legal ambiguity remain a Human Gate.

### Synthetic records

- Generate synthetic characters through a separate deterministic build script/package from a committed generator version, pseudorandom algorithm, seed set, distributions, and schema version.
- Emit a manifest with generator/config versions, seed identifiers, record count, and output checksum. Same inputs must reproduce byte-equivalent normalized data.
- Synthetic generation may target chart/compatibility coverage but must not copy or perturb named public-figure records, use production personal data, or imply a real population distribution without evidence.
- Every surface labels the entity fictional. Synthetic entities cannot have Like, Match, Message, distance, online/activity, endorsement, or inbound-interest state.

Public and synthetic data ship as separately versioned static assets. Their importers, validation reports, manifests, IDs, images, and tests remain separate even if they share a narrow read-only comparison projection.

## Alternatives considered

- **One generic profile table with optional flags:** rejected because missing/incorrect flags could turn fiction into a public claim or a reference into a fake member.
- **Record-level rather than field-level provenance:** rejected because date and time often have different source quality.
- **Runtime random synthetic generation:** rejected because results, tests, and shared links would not be reproducible.
- **Seeding synthetic data from scraped/public profiles:** rejected because it creates copying, privacy, and implied-realism risks.

## Consequences

The datasets require separate pipelines and some duplicated metadata, but provenance and fictional status become enforceable by types and CI. Static schema/data versions allow reproducible builds and make public corrections auditable.

## Security / privacy / safety impact

No personal input enters either pipeline. Source ingestion is untrusted and must be schema-validated and escaped before rendering. Licensed image policy limits copyright risk; prominent fiction/non-endorsement labels limit deception and reputational harm.

## Rollback / migration

Datasets are immutable build inputs per version. Rollback redeploys the previous manifest/assets with the corresponding application commit. Schema changes use deterministic build-time migrations or full regeneration; there is no user-data migration. Tombstoned public records retain an audit note but are omitted from published indexes.

## Evidence to revisit

Before launch, define accepted source classes and image-license rules, measure provenance validation coverage, and review synthetic distribution/coverage reports. Do not present generated distributions as demographically representative without external evidence.

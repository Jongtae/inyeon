# ADR 0008 — Manseryeok adapter and `korean-saju-v1` profile boundary

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON
- Builds on: ADR 0001 — Independent Release, Zero-Backend First Release

## Context

INYEON needs stable Korean Saju behavior without owning mature calendar arithmetic or exposing one upstream library's API as its domain model. Method choices and temporal-data versions can change chart identity, so an ordinary dependency update is not safe.

As inspected on 2026-09-13, `yhj1024/manseryeok` is MIT-licensed TypeScript, publishes `manseryeok` 2.0.0, declares no runtime dependency, and exposes the required calendar/Four Pillars primitives. `6tail/lunar-javascript` 1.7.7 is MIT-licensed and useful as a secondary comparison implementation, not as an oracle or an independent solar-term reference: manseryeok's published solar-term correction table was generated from lunar-javascript data.

## Decision

### Dependency and adapter

- Adopt exact `manseryeok@2.0.0` as the initial primary calendrical implementation and preserve its license notice. Pin it without a range in the workspace lockfile and record the resolved package integrity/source revision in the validation manifest.
- Use exact `lunar-javascript@1.7.7` only in validation tooling/tests unless a later ADR changes its role. Label solar-term agreement with it as shared-lineage evidence.
- The only production entry point is an INYEON-owned `InyeonSajuAdapter`. UI, compatibility, narrative, and share packages depend on normalized INYEON types, never upstream classes, strings, defaults, or error shapes.
- The adapter accepts a normalized birth context with explicit local date, nullable time, time precision/range, calendar kind, IANA timezone, ambiguity state, and profile/reference versions. It returns normalized pillars/features availability, alternatives/uncertainty, and provenance.
- Upstream exceptions become bounded INYEON error codes. Upstream result methods/objects never cross the adapter boundary.

### Versioned candidate calculation profile

`korean-saju-v1` is a separately versioned, machine-readable profile. This ADR accepts the profile boundary and validation process, not the calendrical methodology itself. The following values are an explicit **candidate baseline** for Issue #8's differential/reference validation:

- year pillar changes at the pinned embedded UTC minute representing 입춘 (Ipchun); authority inside sub-minute reference-disagreement intervals remains pending;
- month pillars change at the pinned embedded UTC minutes representing the twelve monthly solar-term (`절`) boundaries;
- day rollover uses local civil midnight (`midnight` upstream mode);
- hour branches use two-hour civil-time intervals beginning with `자시` at 23:00;
- true-solar-time/longitude/equation-of-time adjustment is off;
- local instants and historical gaps/folds will use explicit, pinned IANA timezone/reference data once Issue #9 validates that normalization layer; until then, the adapter accepts only the narrow Seoul civil-time interval proven by its committed corpus and rejects all other timezone/history capability explicitly;
- hidden-stem weighting, Daewoon, and gender-directed calculations are outside v1 compatibility output until separately specified and evidenced.

These candidate values are not production-approved conventions and must not be described as validated Korean practice. Issue #8 may confirm, revise, or reject each value based on its 50-case boundary-heavy comparison and documented references. A candidate becomes part of the production `korean-saju-v1` profile only after its supporting evidence and disagreement classification are recorded. Any candidate with unresolved reference or tradition disagreement is ineligible for production and must route through the Saju methodology Human Gate in `docs/HUMAN_GATES.md`.

The supported calendar kinds and year range are the intersection of upstream capability and INYEON's validated corpus, published in a versioned capability manifest. Unsupported input fails explicitly rather than extrapolating.

Unknown time remains null. The adapter must not call a time-required API with a fabricated placeholder merely to obtain eight characters. It returns only independently supported pillars/features; approximate or disputed ranges that cross a day, solar term, or hour boundary return explicit alternatives and suppress dependent rules.

Every reproducible result/fixture records at least `profileVersion`, `adapterVersion`, `upstreamVersion`, `timezoneDataVersion`, `referenceDataVersion`, and `derivedFeatureVersion`.

### Validation and upgrades

Follow `adopt → wrap → pin → differential-test → golden-test → patch only proven gaps`.

- Before the candidate profile or adapter output is eligible for production, complete Issue #8's cross-comparison of at least 50 boundary-heavy cases; before public release, pass the Issue #14 corpus of at least 200 provenance-bearing cases.
- Issue #8's positive corpus oversamples 입춘 (Ipchun), monthly terms, and local midnight/hour boundaries within the explicitly supported modern Seoul interval. US zones, DST gaps/folds, and historical offset changes remain separate negative capability tests and do not count toward Issue #8's 50 supported reference cases.
- Issue #9 owns positive cross-validation of Korea/US historical timezone normalization and DST gaps/folds without implicitly expanding chart capability. Issue #10 owns full-range solar-term implementation evidence and explicit precision/reference discrepancy classification without promoting the candidate methodology. Issue #14 owns the release corpus across exact/approximate/unknown time and all production-enabled ranges.
- Classify every disagreement as upstream defect, deliberate methodology difference, input/timezone normalization defect, source inconsistency, or unresolved expert-review item. Never average reference outputs.
- Any correction belongs behind the adapter, cites a failing fixture, and remains removable. No patch is added merely because another implementation differs.
- An upstream, timezone-data, reference-data, adapter, or profile change that can alter identity requires full differential/golden regression and inspection of every changed fixture. Material unresolved methodology disagreement is a Human Gate, and affected conventions/results cannot ship while it remains unresolved.

## Alternatives considered

- **Greenfield calendar engine:** rejected because it duplicates mature primitives without evidence and greatly expands correctness risk.
- **Direct upstream imports throughout the app:** rejected because upgrades/replacement would leak across every product layer.
- **Treating one library as authoritative:** rejected because boundary and tradition differences require independent evidence.
- **Production-enabling true solar time or gender-dependent Daewoon before validation:** rejected because they add contested methodology and are unnecessary for the candidate v1 compatibility scope.

## Consequences

INYEON owns a stable uncertainty-aware contract and can replace the commodity engine. Exact pinning increases upgrade work, which is intentional. Candidate v1 conventions are explicit rather than implied, but only evidence-validated choices may enter the production profile; changing an approved choice requires a profile version decision and regression review.

## Security / privacy / safety impact

The adapter is pure local code and makes no network calls. Personal birth context, coordinates, and chart output remain inside the ADR 0007 memory boundary. Explicit uncertainty prevents fabricated precision and unsafe deterministic claims.

## Rollback / migration

Rollback restores the prior lockfile, adapter/profile versions, and known-good fixture expectations together. Static public/synthetic charts are regenerated under a new data version when behavior changes. No personal chart migration exists because personal results are not persisted.

## Evidence to revisit

The initial upstream architecture and exact pin are accepted after Issue #8's license/build/API spike. Issue #10 records the embedded minute-boundary behavior across the adapter's full range and its measured differences from independent apparent-Sun longitude crossings; it does not validate a Korean tradition or select authority inside a disagreement interval. Lunar-javascript comparison cannot independently validate solar-term boundaries because of shared data lineage, and independent astronomy is not itself a Four Pillars oracle. Any failed comparison must be resolved and recorded; unresolved reference/tradition disagreement routes to the methodology Human Gate and blocks the affected output from production. Historical chart integration, true solar time, lunar-input scope, expanded years, hidden-stem weighting, and Daewoon each require evidence and an explicit profile revision rather than a silent default change.

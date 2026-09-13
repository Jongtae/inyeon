# ADR 0012 — Pinned solar-term boundary evidence without a runtime fallback

- Status: Accepted
- Date: 2026-09-14
- Owners: INYEON
- Builds on: ADR 0008 — Manseryeok adapter and `korean-saju-v1` profile boundary

## Context

The candidate `korean-saju-v1` profile changes its year pillar at 입춘 (Ipchun) and its month pillar at the twelve monthly `절` boundaries. The pinned `manseryeok@2.0.0` implementation calculates a low-precision Meeus solar-longitude estimate, rounds it to a UTC minute, and applies an integer-minute correction from an embedded 1800–2300 table. The embedded table states that its correction data was extracted from `lunar-javascript`, so agreement with that library is shared-lineage evidence rather than an independent check.

The existing Issue #8 corpus independently located only the 2024 solar-longitude crossings and sampled one minute before and after each primary boundary. It did not freeze the upstream equality behavior, cover the full INYEON adapter range, or expose dedicated solar-term versions in chart provenance.

## Decision

### Primary candidate boundary

Retain the exact-pinned `manseryeok@2.0.0` embedded UTC-minute boundary as the candidate calculation authority. Do not add an INYEON astronomy engine, average two boundary times, or patch the upstream table without a proven defect.

Name the three tested states precisely:

- `before_primary_boundary`: 60 seconds before the embedded UTC minute;
- `at_primary_boundary`: the exact embedded UTC minute;
- `after_primary_boundary`: 60 seconds after the embedded UTC minute.

At the primary boundary, equality belongs to the new month. At 입춘 (Ipchun), equality also belongs to the new Saju year. The before/at/after evidence asserts year and month behavior only; day and hour behavior belongs to Issue #12 and is not inferred here.

### Full-range differential evidence

Generate a checked-in record for every even-indexed monthly `절` in every year of the adapter's supported `1989–2024` range: 36 years × 12 boundaries = 432 records and 1,296 named states. Each record preserves:

- term index, target longitude, Hangul primary name, and Hanja secondary name;
- upstream embedded-table UTC minute;
- independently calculated apparent-Sun longitude crossing from exact `astronomy-engine@2.1.19`;
- signed and absolute timing difference without rounding it away;
- primary before/at/after year and month pillar output;
- source, reference, profile, and classification versions.

Astronomy Engine is independent only for the apparent-Sun longitude crossing. It is not a Four Pillars or Korean-methodology oracle and remains a development/validation dependency, never a browser runtime dependency.

The observed full-range maximum difference is 71.829 seconds at 2003 입춘 (Ipchun). Three records exceed 60 seconds: 1999 대설 (Daeseol) at 61.227 seconds, 2003 입춘 (Ipchun) at 71.829 seconds, and 2010 한로 (Hanro) at 70.241 seconds. These are preserved as precision/reference discrepancies, not labeled agreement.

A 120-second differential guardrail makes larger future drift fail CI and require investigation. This is a candidate regression threshold, not an accuracy guarantee, a methodology judgment, or evidence that inputs inside a disagreement interval have one authoritative chart identity.

### Versions and eligibility

Advance the adapter package/contract to `0.2.0` because accepted input reference metadata and public calculation provenance change. Chart provenance records dedicated solar-term data, independent-reference, and precision identifiers. The calculation profile name remains `korean-saju-v1`.

Year/month boundary implementation behavior is now reproducibly evidenced, but the Korean methodology remains a candidate. `productionValidated` and `productionEligible` stay false. KASI-aligned or expert-reviewed evidence and the Issue #14 release corpus remain required before production eligibility.

## Alternatives considered

- **Runtime Astronomy Engine or a second ephemeris:** rejected because the evidence does not prove an upstream defect and duplicate identity authorities would increase bundle and correctness risk.
- **Average or select between upstream and Astronomy Engine:** rejected because an average has no calendrical or methodological authority.
- **Treat lunar-javascript as an independent oracle:** rejected because the upstream correction table shares its lineage.
- **Repeat only the 2024 sample:** rejected because it would hide three larger discrepancies in the supported range.
- **Claim KASI verification from upstream documentation:** rejected because INYEON has not independently obtained or recorded that provenance.

## Consequences

Dependency or boundary changes produce a visible full-range fixture diff. The adapter's exact at-boundary behavior and evidence versions are reproducible. No runtime fallback, network service, new framework, or public capability expansion is introduced.

The measured 60–72 second disagreement intervals remain unsuitable for a production certainty claim until the methodology/release evidence gates are satisfied. This does not block recording candidate behavior or continuing unrelated work.

## Human Gate boundary

Issue #10 implementation and candidate evidence do not require human action. A Human Gate applies only if production promotion requires choosing among materially conflicting references or traditions, KASI/expert evidence conflicts with the primary table, or a chart-identity-changing fallback is proposed without a proven implementation defect. Only the affected output is blocked; other work continues.

## Security / privacy / safety impact

The corpus contains public calendrical constants, not personal birth inputs. Generation and runtime use no personal network request, storage, URL, telemetry, or log. Explicit discrepancy classification prevents false precision.

## Rollback / migration

Rollback restores the adapter package version, accepted reference-data version, provenance shape, capability/profile manifests, generator, and both corpora together. No personal-data migration exists because personal charts are not persisted.

## Evidence to revisit

Revisit if a pinned dependency changes, any full-range difference exceeds 120 seconds, a boundary/state invariant changes, KASI-aligned evidence becomes available, or expert review selects a materially different year/month convention. Any chart-identity change requires a profile/version and full golden-corpus review.

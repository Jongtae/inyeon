# ADR 0013 — Timezone-normalized year/month calculation seam

- Status: Accepted
- Date: 2026-09-14
- Owners: INYEON
- Builds on: ADR 0008 — Manseryeok adapter and `korean-saju-v1`; ADR 0011 — Browser-local time normalization; ADR 0012 — Pinned solar-term boundary evidence

## Context

The public `manseryeok@2.0.0` calculation API accepts civil fields documented as Korean Standard Time. Its year and month pillars are selected from the absolute UTC instant reconstructed from those fields. Passing a Los Angeles or New York wall-clock value directly therefore treats that value as KST and moves the instant by many hours, producing wrong year/month output near 입춘 (Ipchun) and monthly `절` boundaries.

Issue #9 provides a deterministic browser-local resolver for Los Angeles, New York, and Seoul, including explicit zero/one/two-candidate gap and fold behavior. Issue #10 pins the primary embedded UTC-minute boundary and its independent apparent-Sun-longitude comparison. Neither issue alone defines how a resolved instant may safely enter the public upstream API.

## Decision

### Bounded public contract

Advance `@inyeon/saju-adapter` to `0.3.0` and add `calculateYearMonth`. Its input requires exact Gregorian civil date/time, one of `America/Los_Angeles`, `America/New_York`, or `Asia/Seoul`, profile `korean-saju-v1`, timezone data `iana-2026c-inyeon-filter-v1`, and reference data `issue-11-year-month-differential-v1`.

The Issue #9 resolver remains the sole local-civil-to-UTC authority. It independently enforces its source-civil range of `1908-04-01` through `2026-12-31`. Each returned UTC candidate is projected into UTC+09 civil fields and passed to the documented public Manseryeok API without true-solar-time options. This round trip reconstructs the same absolute minute used by upstream year/month boundary logic. The adapter retains only normalized year and month pillars; internally produced day/hour values are discarded.

The resolved instant's UTC+09 projected date must be from `1989-01-01` through `2024-12-31`. This is not a source-local-date restriction: for example, a Los Angeles source time on `1988-12-31` may be accepted if its projected KST date is in 1989. Conversely, a source-local 2024 input is rejected if it projects into KST 2025. Complete four-pillar calculation remains restricted to the existing modern-Seoul contract and Issue #10 reference input.

### Gaps, folds, and failures

- A nonexistent DST gap returns a bounded `NONEXISTENT_LOCAL_TIME` error and is never shifted.
- Every fold candidate is calculated. If all normalized year/month outputs agree, the result records `ambiguous-same-output` and candidate count two. If they differ, the result contains deduplicated alternatives and selects neither instant.
- Runtime results never reflect the source date, time, zone, UTC candidate, offset, or caught upstream detail.
- Inputs or projected instants outside their published ranges fail closed.

### Evidence and references

The checked-in `year-month-differential.v1.json` artifact contains all 432 Issue #10 boundaries projected into all three zones at one minute before, equality, and one minute after: 3,888 states. It also contains ordinary cases, IANA gap/fold fixtures, source-date spill and projected-date rejection, regressions demonstrating why US wall time must not be passed directly as KST, and 24 representative 2024 primary-versus-lunar year/month comparisons. Those comparisons record 12 agreements and 12 source/reference inconsistencies without treating shared-lineage solar-term timing as independent.

No INYEON correction is added because no upstream year/month arithmetic defect was demonstrated. The fault reproduced by the issue is input/timezone normalization. `lunar-javascript@1.7.7` is a separate pillar implementation but shared-lineage for solar-term timing, so it is not a boundary authority. Astronomy Engine independently locates only the apparent-Sun longitude crossing. The three Issue #10 differences of 61–72 seconds remain recorded methodology/reference uncertainty and are neither averaged nor substituted.

The artifact is byte-checked in CI and has SHA-256 `54ca0e765e65db1f3c917b06251a1eb31f8f837ab3b92b267096f50b5fc3b3b7`. Dependency, adapter, timezone, reference, and solar-term versions are preserved in result and fixture provenance.

## Alternatives considered

- **Pass US civil fields directly to Manseryeok:** rejected because the public API interprets them as KST and demonstrably changes boundary results.
- **Import private upstream `computeFourPillars` internals:** rejected because package exports do not expose that seam and INYEON must not depend on private paths.
- **Expose the internally calculated US day/hour pillars:** rejected because their KST-projected civil semantics are invalid for the source locality and remain Issue #12 work.
- **Choose one fold instant:** rejected because it fabricates certainty.
- **Patch or average boundary times:** rejected because no upstream implementation defect or methodology authority was established.

## Consequences

US-first product flows can obtain deterministic, versioned year/month pillars without claiming complete chart support. The adapter gains a runtime dependency on the small dependency-free timezone resolver and retains zero-backend/offline behavior. A later complete-chart expansion must not infer day/hour correctness from this seam.

The profile and outputs remain candidate and `productionEligible: false`. Korean methodology/expert or KASI-aligned review and the Issue #14 release corpus remain required before production promotion. Those unresolved release requirements do not block this bounded implementation evidence.

## Security / privacy / safety impact

Both components operate in browser memory without network, persistence, cache, URL/history, logging, telemetry, geolocation, or geocoding. Bounded errors do not echo protected birth input. Result alternatives contain only normalized year/month pillars and provenance.

## Rollback / migration

Rollback removes `calculateYearMonth`, restores adapter `0.2.0`, removes the resolver runtime dependency and Issue #11 artifact, and restores the previous capability/profile manifests. Existing complete-chart outputs do not migrate because their pillar values are unchanged and personal results are never persisted.

## Evidence to revisit

Revisit when the timezone or solar-term pin changes, the projected date range expands, a fold straddles a year/month boundary in production data, a demonstrated upstream defect requires correction, or expert/KASI-aligned evidence selects a materially different boundary convention. Any chart-identity change requires profile/version and full golden-corpus review.

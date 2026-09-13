# ADR 0014 — Day/hour uncertainty contract

- Status: Accepted candidate implementation; not production methodology approval
- Date: 2026-09-14
- Issue: #12
- Builds on: ADR 0008, ADR 0011, ADR 0012, ADR 0013

## Context

INYEON must serve US-first users without treating a US wall time as Korean civil time, inventing a missing hour, selecting one side of a daylight-saving fold, or hiding legitimate alternatives near day, hour, and solar-term boundaries. The pinned Manseryeok API calculates all four pillars together, but its year/month and day/hour portions consume different temporal properties.

Manseryeok exposes three late 자시 (Jasi, 子時) modes. The `korean-saju-v1` candidate baseline uses local-civil midnight. The separate lunar comparison advances its day and hour-stem convention from 23:00. That disagreement is a methodology choice, not a demonstrated arithmetic defect.

## Decision

Adapter `0.4.0` adds a separate `calculateChart` contract and preserves the existing `calculate` and `calculateYearMonth` APIs. The set/union semantics are pinned as `birth-time-uncertainty-v1`; result provenance also carries the Issue #11 year/month and Issue #10 solar-term reference versions used by the composed calculation.

For every asserted local civil minute:

1. the pinned Issue #9 resolver returns zero, one, or two UTC candidates;
2. each UTC candidate is projected to KST civil fields for the public Manseryeok call, and only year/month are retained;
3. the original source-local civil fields enter a separate public Manseryeok call with `dayBoundary: "midnight"` and true solar time disabled, and only day/hour are retained;
4. the normalized portions are combined and deterministically deduplicated;
5. runtime output exposes opaque sequential variant IDs and bounded counts, never source input, UTC instant, or offset.

This composition is valid only for the explicitly pinned candidate convention. It does not assert true-solar-time or production Korean-methodology authority.

The source-local civil date used for day/hour and the KST-projected date used for year/month must each be within `1989-01-01` through `2024-12-31`, matching the bounded evidence ranges. Any asserted union that crosses an unsupported edge fails closed as a whole; the adapter never truncates a user's possible-time set.

### Temporal support

- `exact` asserts one civil minute.
- `approximate` asserts one inclusive continuous window.
- `disputed` asserts a non-empty union of inclusive exact/range windows. Minutes between windows are not interpolated.
- `date-only` and `unknown` evaluate all 1,440 minutes of the known date, retain legitimate year/month/day alternatives, and remove hour from every variant.
- The combined input contains at most 2,880 unique civil minutes. Overlap is evaluated once.

A DST gap is never shifted. Gap minutes inside a partially valid range are counted and excluded; an all-gap assertion fails. Every fold candidate is calculated and no instant is selected.

### Uncertainty propagation

Each stable pillar reports `invariant`, `alternative`, or `unavailable`. Hour-dependent downstream evidence is eligible only for exact, approximate, or disputed input when hour is invariant across every retained variant. It is suppressed with a bounded reason when hour varies, and always suppressed for date-only/unknown input.

Approximate or disputed input remains approximate or disputed even when it deduplicates to one chart. An exact fold remains bounded even when its pillar variants deduplicate.

## Evidence boundary

The checked-in `day-hour-evidence.v1.json` artifact covers before/equality/after for all twelve civil hour-branch transitions and all three upstream day-boundary modes around 23:00 and midnight. Its generator also compares every civil date from 1989 through 2024 at fourteen representative times: 184,086 observations, with all 13,149 day and hour mismatches confined to 23:00 and none outside that known methodology boundary. It records zero corrections.

`lunar-javascript@1.7.7` is a separate implementation for the compared day/hour outputs, but it is not an independent Korean-methodology authority. Its solar-term lineage is also not independent. The artifact therefore validates deterministic mapping and exposes the late-자시 disagreement; it does not resolve that disagreement.

## Human Gate and release effect

The candidate API may be implemented and regression-tested autonomously. Promoting local-civil midnight as production-validated Korean methodology while the 23:00 reference/tradition disagreement remains unresolved is a material Saju methodology Human Gate under `docs/HUMAN_GATES.md`.

`profileStatus`, `productionValidated`, and `productionEligible` remain candidate/false. Issue #14 expert/KASI-aligned release fixtures remain required. No correction, averaging, or fallback is introduced.

## Rejected alternatives

- Passing US civil fields directly and retaining all upstream pillars: rejected because year/month would use the wrong absolute instant.
- Retaining day/hour from the KST-projected call: rejected because those fields do not represent the source locality.
- Defaulting unknown time to noon or midnight: rejected because it fabricates an hour and can fabricate other boundary-dependent facts.
- Filling gaps or choosing one fold candidate: rejected because it hides civil-time uncertainty.
- Interpolating between disputed windows: rejected because the unasserted interval is not evidence.
- Selecting or averaging conflicting methodology outputs: rejected because neither operation has methodological authority.

## Rollback

Consumers can stop calling `calculateChart` while the legacy APIs remain unchanged. Removing adapter `0.4.0` and its Issue #12 artifact restores the Issue #11 boundary without changing the pinned timezone or Manseryeok dependencies.

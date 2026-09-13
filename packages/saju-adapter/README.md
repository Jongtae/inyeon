# `@inyeon/saju-adapter`

Framework-independent, browser-safe boundary around INYEON's pinned Four Pillars engine. Public consumers receive only INYEON-owned types and bounded errors; upstream objects, methods, defaults, and exceptions never cross the contract.

## Candidate scope

- Solar Gregorian civil input only.
- The legacy `calculate` complete-chart contract remains `Asia/Seoul` only, from `1989-01-01` through `2024-12-31`, under the bounded fixed-offset profile `fixed-kst-utc-plus-09-1989-2024-v1`.
- `calculateYearMonth` separately accepts exact civil time in `America/Los_Angeles`, `America/New_York`, or `Asia/Seoul`. It uses the pinned Issue #9 IANA resolver and keeps only results whose resolved instant projects into a KST date from `1989-01-01` through `2024-12-31`. The resolver's source-civil range remains `1908-04-01` through `2026-12-31`, so a source-local date may spill across the narrower projected-date boundary.
- `calculateChart` accepts Los Angeles, New York, and Seoul through the pinned IANA resolver. Source-local day/hour dates and the resulting KST-projected year/month dates must both remain within the independently checked `1989-01-01` through `2024-12-31` range. Its versioned `birth-time-uncertainty-v1` algebra has discriminated temporal support `exact | approximate | disputed | date-only | unknown` and evaluates at most 2,880 unique asserted civil minutes.
- Approximate time is one inclusive window. Disputed time is a non-empty union of inclusive exact/range windows; minutes between windows are never interpolated. Duplicate and overlapping minutes are evaluated once.
- Date-only and unknown-time inputs evaluate the 1,440 minutes of the known local date so year/month/day alternatives remain truthful, but every hour pillar is removed from stable output and variants. No noon, midnight, or other default hour is substituted.
- Derived features, hidden stems, and Daewoon are not enabled.
- Civil-midnight day rollover, minute-quantized solar-term boundaries, and the other `korean-saju-v1` values remain candidate methodology, not production-validated Korean practice.

See `data/capabilities.v1.json`, `data/korean-saju-v1.profile.json`, and `PROVENANCE.md` for machine-readable scope and evidence limits.

The year/month-only seam calculates every resolver candidate. A DST gap fails explicitly. A fold with the same year/month output returns `ambiguous-same-output`; a fold that straddles a year/month boundary returns deduplicated alternatives without choosing an instant. The resolved UTC candidate is projected to UTC+09 civil fields solely because the public Manseryeok API documents those fields as KST and uses their reconstructed absolute instant for year/month boundaries. Internally produced day/hour values are discarded and never exposed by this seam.

The full-chart seam uses the same projection for year/month and separately calculates day/hour from the asserted source-local civil minute with upstream `dayBoundary: "midnight"` and true solar time disabled. Each wrong portion is discarded before the two normalized portions are combined. Every fold candidate is retained; gap minutes are never shifted. A partially valid range reports its nonexistent-minute count, while an all-gap assertion fails. Runtime results contain only deduplicated pillar variants with opaque sequential IDs and bounded counts—never raw inputs, resolved instants, or offsets.

`stablePillars` labels each pillar `invariant`, `alternative`, or `unavailable`. Hour-dependent evidence is eligible only for exact, approximate, or disputed inputs whose hour pillar is invariant across every legitimate variant. It is suppressed when the hour varies and is always suppressed for date-only/unknown input. This is the explicit propagation boundary for downstream deterministic rules.

## Validation corpora

`data/solar-term-boundaries.v1.json` exhaustively covers all 432 even-index `절` (jie) boundaries in the supported 1989–2024 range. Each record keeps the embedded primary UTC minute distinct from the independently located Astronomy Engine crossing and captures the primary year/month pillars 60 seconds before, exactly at, and 60 seconds after that embedded-table minute. Across this bounded corpus, the largest absolute difference is 71.829 seconds at 2003 입춘 (Ipchun); three records exceed 60 seconds and none exceed 90 seconds. The enforced 120-second threshold is a candidate-validation guardrail, not an accuracy guarantee or oracle claim. Every boundary changes the month pillar at the embedded minute, and only 입춘 changes the year pillar; the at/after outputs agree.

`data/year-month-differential.v1.json` projects all 432 boundaries into all three supported zones at before/at/after states: 3,888 timezone-normalized states. It also pins ordinary, DST gap/fold, range-spill, and naive-US-civil-as-KST regressions plus 24 actual 2024 primary-versus-lunar year/month comparisons with property-scoped evidence labels. No adapter correction was required because no upstream year/month defect was demonstrated.

The existing `data/differential-corpus.v1.json` contains 68 supported positive boundary-heavy comparisons plus explicit adapter-negative cases. It records both engines' outputs, comparison API mode, independence for the asserted property, evidence category, and per-pillar disagreement findings. Its provenance points to adapter `0.4.0` while retaining Issue #10 reference data for the legacy complete-chart contract.

`data/day-hour-evidence.v1.json` pins 36 states around all twelve civil two-hour boundaries and 12 states comparing the upstream `midnight`, `jasi`, and `splitJasi` modes around late 자시 (Jasi, 子時) and midnight. A reproducible full-range check covers 184,086 observations across every civil date from 1989 through 2024 at fourteen representative times. All differences are confined to the deliberately disputed 23:00 convention. The comparison is a separate implementation for day/hour mapping, not an independent Korean-methodology authority. No correction was demonstrated or added.

Astronomy Engine independently checks only apparent-Sun longitude crossings. It does not independently validate a Four Pillars chart, and its crossing never replaces the primary embedded-table minute. `lunar-javascript` comparison is treated property by property and never as an oracle. Its day/hour getters exhibit a next-day convention from 23:00, while the candidate profile retains local-civil midnight. Resolving that disagreement for production is a Saju-methodology Human Gate. KASI provenance and expert review are pending, so the profile and adapter remain candidate and non-production-eligible.

Regenerate deterministically with:

```sh
node packages/saju-adapter/scripts/generate-differential-corpus.mjs
node packages/saju-adapter/scripts/generate-solar-term-boundaries.mjs
node packages/saju-adapter/scripts/generate-year-month-differential.mjs
node packages/saju-adapter/scripts/generate-day-hour-evidence.mjs
```

CI checks all committed artifacts without rewriting them:

```sh
npm run verify:data --workspace @inyeon/saju-adapter
```

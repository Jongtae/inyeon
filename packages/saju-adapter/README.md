# `@inyeon/saju-adapter`

Framework-independent, browser-safe boundary around INYEON's pinned Four Pillars engine. Public consumers receive only INYEON-owned types and bounded errors; upstream objects, methods, defaults, and exceptions never cross the contract.

## Candidate scope

- Solar Gregorian civil input only.
- Complete four-pillar charts remain `Asia/Seoul` only, from `1989-01-01` through `2024-12-31`, under the bounded fixed-offset profile `fixed-kst-utc-plus-09-1989-2024-v1`.
- `calculateYearMonth` separately accepts exact civil time in `America/Los_Angeles`, `America/New_York`, or `Asia/Seoul`. It uses the pinned Issue #9 IANA resolver and keeps only results whose resolved instant projects into a KST date from `1989-01-01` through `2024-12-31`. The resolver's source-civil range remains `1908-04-01` through `2026-12-31`, so a source-local date may spill across the narrower projected-date boundary.
- Complete charts require an exact, unambiguous `HH:MM` birth time.
- Unknown time remains `null` and returns a pillar-free `partial` result without invoking the time-required upstream calculation.
- Approximate time, complete-chart calculation outside modern Seoul, other IANA zones, derived features, hidden stems, and Daewoon are not enabled.
- Civil-midnight day rollover, minute-quantized solar-term boundaries, and the other `korean-saju-v1` values remain candidate methodology, not production-validated Korean practice.

See `data/capabilities.v1.json`, `data/korean-saju-v1.profile.json`, and `PROVENANCE.md` for machine-readable scope and evidence limits.

The year/month-only seam calculates every resolver candidate. A DST gap fails explicitly. A fold with the same year/month output returns `ambiguous-same-output`; a fold that straddles a year/month boundary returns deduplicated alternatives without choosing an instant. The resolved UTC candidate is projected to UTC+09 civil fields solely because the public Manseryeok API documents those fields as KST and uses their reconstructed absolute instant for year/month boundaries. Internally produced day/hour values are discarded and never exposed by this seam.

## Validation corpora

`data/solar-term-boundaries.v1.json` exhaustively covers all 432 even-index `절` (jie) boundaries in the supported 1989–2024 range. Each record keeps the embedded primary UTC minute distinct from the independently located Astronomy Engine crossing and captures the primary year/month pillars 60 seconds before, exactly at, and 60 seconds after that embedded-table minute. Across this bounded corpus, the largest absolute difference is 71.829 seconds at 2003 입춘 (Ipchun); three records exceed 60 seconds and none exceed 90 seconds. The enforced 120-second threshold is a candidate-validation guardrail, not an accuracy guarantee or oracle claim. Every boundary changes the month pillar at the embedded minute, and only 입춘 changes the year pillar; the at/after outputs agree.

`data/year-month-differential.v1.json` projects all 432 boundaries into all three supported zones at before/at/after states: 3,888 timezone-normalized states. It also pins ordinary, DST gap/fold, range-spill, and naive-US-civil-as-KST regressions plus 24 actual 2024 primary-versus-lunar year/month comparisons with property-scoped evidence labels. No adapter correction was required because no upstream year/month defect was demonstrated.

The existing `data/differential-corpus.v1.json` contains 68 supported positive boundary-heavy comparisons plus explicit adapter-negative cases. It records both engines' outputs, comparison API mode, independence for the asserted property, evidence category, and per-pillar disagreement findings. Its provenance points to adapter `0.3.0` while retaining Issue #10 reference data for the complete-chart contract.

Astronomy Engine independently checks only apparent-Sun longitude crossings. It does not independently validate a Four Pillars chart, and its crossing never replaces the primary embedded-table minute. `lunar-javascript` comparison is treated as potentially shared-lineage evidence, never as an oracle. The 23:xx day/hour methodology differences remain deferred to #12 without selecting a correct convention. KASI provenance and expert review are pending, so the year/month methodology, profile, and adapter remain candidate and non-production-eligible.

Regenerate deterministically with:

```sh
node packages/saju-adapter/scripts/generate-differential-corpus.mjs
node packages/saju-adapter/scripts/generate-solar-term-boundaries.mjs
node packages/saju-adapter/scripts/generate-year-month-differential.mjs
```

CI checks all committed artifacts without rewriting them:

```sh
npm run verify:data --workspace @inyeon/saju-adapter
```

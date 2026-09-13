# `@inyeon/saju-adapter`

Framework-independent, browser-safe boundary around INYEON's pinned Four Pillars engine. Public consumers receive only INYEON-owned types and bounded errors; upstream objects, methods, defaults, and exceptions never cross the contract.

## Candidate scope

- Solar Gregorian civil input only.
- `Asia/Seoul` only, from `1989-01-01` through `2024-12-31`.
- The current timezone strategy is the bounded fixed-offset profile `fixed-kst-utc-plus-09-1989-2024-v1`; it does not claim IANA or historical-timezone validation.
- Complete charts require an exact, unambiguous `HH:MM` birth time.
- Unknown time remains `null` and returns a pillar-free `partial` result without invoking the time-required upstream calculation.
- Approximate time, historical/future Seoul normalization, other IANA zones, derived features, hidden stems, and Daewoon are not enabled.
- Civil-midnight day rollover, minute-quantized solar-term boundaries, and the other `korean-saju-v1` values remain candidate methodology, not production-validated Korean practice.

See `data/capabilities.v1.json`, `data/korean-saju-v1.profile.json`, and `PROVENANCE.md` for machine-readable scope and evidence limits.

Issue #9's separate `@inyeon/timezone-resolver` now provides validated timezone-normalization candidates, but it is intentionally not wired into this adapter yet. This adapter continues to reject historical Seoul and US-zone inputs until a later methodology-aware contract revision consumes resolved instants and passes the required chart validation; timezone evidence alone does not expand Saju calculation capability.

## Validation corpora

`data/solar-term-boundaries.v1.json` exhaustively covers all 432 even-index `절` (jie) boundaries in the supported 1989–2024 range. Each record keeps the embedded primary UTC minute distinct from the independently located Astronomy Engine crossing and captures the primary year/month pillars 60 seconds before, exactly at, and 60 seconds after that embedded-table minute. Across this bounded corpus, the largest absolute difference is 71.829 seconds at 2003 입춘 (Ipchun); three records exceed 60 seconds and none exceed 90 seconds. The enforced 120-second threshold is a candidate-validation guardrail, not an accuracy guarantee or oracle claim. Every boundary changes the month pillar at the embedded minute, and only 입춘 changes the year pillar; the at/after outputs agree.

The existing `data/differential-corpus.v1.json` contains 68 supported positive boundary-heavy comparisons plus explicit adapter-negative cases. It records both engines' outputs, comparison API mode, independence for the asserted property, evidence category, and per-pillar disagreement findings. Its provenance now points to adapter `0.2.0` and reference data `issue-10-solar-term-boundaries-v1`.

Astronomy Engine independently checks only apparent-Sun longitude crossings. It does not independently validate a Four Pillars chart, and its crossing never replaces the primary embedded-table minute. `lunar-javascript` comparison is treated as potentially shared-lineage evidence, never as an oracle. The 23:xx day/hour methodology differences remain deferred to #12 without selecting a correct convention. KASI provenance and expert review are pending, so the year/month methodology, profile, and adapter remain candidate and non-production-eligible.

Regenerate deterministically with:

```sh
node packages/saju-adapter/scripts/generate-differential-corpus.mjs
node packages/saju-adapter/scripts/generate-solar-term-boundaries.mjs
```

CI checks both committed artifacts without rewriting them:

```sh
npm run verify:data --workspace @inyeon/saju-adapter
```

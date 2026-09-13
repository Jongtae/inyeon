# `@inyeon/saju-adapter`

Framework-independent, browser-safe boundary around INYEON's pinned Four Pillars engine. Public consumers receive only INYEON-owned types and bounded errors; upstream objects, methods, defaults, and exceptions never cross the contract.

## Candidate scope

- Solar Gregorian civil input only.
- `Asia/Seoul` only, from `1989-01-01` through `2024-12-31`.
- The current timezone strategy is the bounded fixed-offset profile `fixed-kst-utc-plus-09-1989-2024-v1`; it does not claim IANA or historical-timezone validation.
- Complete charts require an exact, unambiguous `HH:MM` birth time.
- Unknown time remains `null` and returns a pillar-free `partial` result without invoking the time-required upstream calculation.
- Approximate time, historical/future Seoul normalization, other IANA zones, derived features, hidden stems, and Daewoon are not enabled.
- Civil-midnight day rollover, solar-term boundaries, and the other `korean-saju-v1` values remain candidate methodology, not production-validated Korean practice.

See `data/capabilities.v1.json`, `data/korean-saju-v1.profile.json`, and `PROVENANCE.md` for machine-readable scope and evidence limits.

Issue #9's separate `@inyeon/timezone-resolver` now provides validated timezone-normalization candidates, but it is intentionally not wired into this adapter yet. This adapter continues to reject historical Seoul and US-zone inputs until a later methodology-aware contract revision consumes resolved instants and passes the required chart validation; timezone evidence alone does not expand Saju calculation capability.

## Validation corpus

`data/differential-corpus.v1.json` contains 68 supported positive boundary-heavy comparisons plus explicit adapter-negative cases. It records both engines' outputs, comparison API mode, independence for the asserted property, evidence category, and per-pillar disagreement findings.

Astronomy Engine independently checks only the apparent-Sun longitude crossing used to locate 24 solar-term boundary cases. It does not independently validate a Four Pillars chart. `lunar-javascript` comparison is treated as potentially shared-lineage evidence, never as an oracle. Observed solar-term precision differences are deferred to #10, and 23:xx day/hour methodology differences are deferred to #12 without selecting a correct convention. KASI provenance and expert review are pending, so the profile and adapter remain non-production-eligible.

Regenerate deterministically with:

```sh
node packages/saju-adapter/scripts/generate-differential-corpus.mjs
```

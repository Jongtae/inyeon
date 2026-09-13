# Adapter dependency and evidence provenance

Captured on 2026-09-13 from the npm registry and locked by the repository lockfile:

| Package | Role | Exact version | npm SHA-512 integrity |
| --- | --- | --- | --- |
| `manseryeok` | production calculation engine | `2.0.0` | `sha512-h4YeuKP+vsAa01K72v/H+5MwxEZd1Sv7H2hC8YU7r05JjNaCDvVhGaIot0zxrktyZVU6SGN5Ed9d1coTWW8rpQ==` |
| `lunar-javascript` | validation comparison only | `1.7.7` | `sha512-u/KYiwPIBo/0bT+WWfU7qO1d+aqeB90Tuy4ErXenr2Gam0QcWeezUvtiOIyXR7HbVnW2I1DKfU0NBvzMZhbVQw==` |
| `astronomy-engine` | validation-only independent solar-longitude boundary locator | `2.1.19` | `sha512-8yWKNf7UeNbH458h3sAJ6ZgAjE5jTXp/mNNRFoC20j2SHwZIjAQeEsBB2Q3uCFRaTCCJRv33K2XhkhZQMXoX6w==` |

The upstream `manseryeok@2.0.0` tag resolves to commit `fba3253d7305b8b61189bd78318a7a27ed8c9b09`; this records the inspected source tag and does **not** assert that npm independently attests artifact-to-commit identity. The `lunar-javascript@1.7.7` release maps to git commit `eecd5d12c8221b82ce574dc2bad2d7aefcb46e56`. KASI provenance and Korean-methodology expert review are not asserted. The candidate profile therefore remains ineligible for production.

The inspected `astronomy-engine@2.1.19` source tag resolves to commit `61dc07020aaa6885d2c7f688a4d82beaf6edb9ef`, recorded separately from (and without claiming cryptographic identity to) the npm artifact.

`astronomy-engine` is independent only for locating apparent-Sun longitude crossings used to select boundary-heavy timestamps. It is not a Four Pillars oracle. Agreement between `manseryeok` and `lunar-javascript` on solar terms is recorded as shared-lineage comparison evidence, not independent methodological validation.

## Issue #10 solar-term boundary evidence

Adapter `0.2.0` uses reference-data version `issue-10-solar-term-boundaries-v1`. Public calculation provenance separately identifies the primary boundary source as `manseryeok-2.0.0-embedded-solar-terms-v1`, the independent crossing reference as `issue-10-astronomy-engine-2.1.19-v1`, and the primary precision as `minute`.

The inspected installed primary artifact `manseryeok/dist/astro/solar-terms-data.js` is 14,193 bytes with SHA-256 `fe61cc754021d012f830b03ebe06533a717e7f8a53cc30706eed65520061ddb9`. The generated fixture `data/solar-term-boundaries.v1.json` has SHA-256 `fc7ee26a25bd2fadbe1dad701021ef3717a8924f6dd49996b7ccd4e57770990f`. It covers all 432 even-index `절` (jie) boundaries—12 per year for every year from 1989 through 2024—in the adapter's bounded `Asia/Seoul` context.

The artifact retains raw signed and absolute millisecond deltas. The maximum absolute delta is 71,829 milliseconds at 2003 입춘 (Ipchun); exactly three records exceed 60,000 milliseconds and none exceed 90,000 milliseconds. These observations pass a fail-closed 120,000-millisecond candidate-validation guardrail. The guardrail is not an accuracy guarantee, KASI attestation, agreement classification, or oracle claim. The primary embedded UTC minute remains the calculation boundary and is never conflated with or replaced by the Astronomy Engine crossing.

At every boundary, the artifact records primary year/month outputs 60 seconds before, exactly at, and 60 seconds after the embedded minute. The month pillar changes from before to at for all 432 boundaries, at equals after, and the year pillar changes only at 입춘 (Ipchun). These are deterministic observations of the pinned engine's existing behavior; they do not choose or certify a production Korean methodology.

The complete-chart positive interval remains intentionally limited to `1989-01-01` through `2024-12-31` in `Asia/Seoul`, identified as `fixed-kst-utc-plus-09-1989-2024-v1`. That label describes the complete-chart adapter's bounded fixed-offset strategy; it does not claim that IANA data participates in day/hour calculation.

## Issue #11 year/month timezone evidence

Adapter `0.3.0` adds reference-data version `issue-11-year-month-differential-v1` for year/month-only calculation. Its runtime dependency on `@inyeon/timezone-resolver@0.1.0` resolves exact civil input in Los Angeles, New York, or Seoul with `iana-2026c-inyeon-filter-v1`. Every UTC candidate is projected into UTC+09 civil fields for the documented public Manseryeok KST API; only year/month outputs are retained. Both the resolver source-civil range (`1908-04-01` through `2026-12-31`) and the narrower projected-KST date range (`1989-01-01` through `2024-12-31`) are enforced by their respective components.

`data/year-month-differential.v1.json` has SHA-256 `54ca0e765e65db1f3c917b06251a1eb31f8f837ab3b92b267096f50b5fc3b3b7`. It records all 432 Issue #10 `절` boundaries in three zones at before/equality/after states, for 3,888 normalized states, plus ordinary, DST gap/fold, range-spill, and naive-US-timezone regressions. It also preserves 24 representative 2024 primary-versus-lunar year/month comparisons: 12 agreements and 12 classified source/reference inconsistencies. A gap is never shifted. Both fold candidates are calculated; equal outputs preserve `ambiguous-same-output`, and distinct outputs remain explicit alternatives. Raw inputs and resolved instants are absent from runtime results.

No correction is present because the evidence demonstrated a timezone-input normalization gap, not an upstream year/month arithmetic defect. `lunar-javascript@1.7.7` remains a separate pillar implementation but shares solar-term lineage and is not a boundary authority. Astronomy Engine remains independent only for apparent-Sun longitude location. The new corpus does not production-approve `korean-saju-v1`; expert/KASI-aligned review and Issue #14 remain pending.

## Observed methodology differences

The primary comparison mode explicitly uses manseryeok `dayBoundary: "midnight"`. The lunar-javascript comparison records its exact getters and library-default sect in every fixture. Their observed 23:xx day/hour differences are classified as methodology differences and deferred to Issue #12; the corpus does not decide that either convention is correct. Solar-term precision differences are preserved in the Issue #10 boundary artifact without promoting either source to an oracle.

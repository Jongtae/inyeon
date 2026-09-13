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

The supported positive interval is intentionally limited to `1989-01-01` through `2024-12-31` in `Asia/Seoul`, identified as `fixed-kst-utc-plus-09-1989-2024-v1`. That label describes the adapter's bounded fixed-offset strategy; it does not claim that an IANA timezone database participates in Issue #8 calculations. The interval matches the committed positive corpus and avoids claims about historical KST, future reference data, or the primary engine's fixed-KST assumptions. Issue #9 owns timezone expansion. Out-of-interval and non-Seoul inputs are adapter contract negatives and do not count toward the positive differential corpus.

## Observed methodology differences

The primary comparison mode explicitly uses manseryeok `dayBoundary: "midnight"`. The lunar-javascript comparison records its exact getters and library-default sect in every fixture. Their observed 23:xx day/hour differences are classified as methodology differences and deferred to Issue #12; the corpus does not decide that either convention is correct. Solar-term precision differences are deferred to Issue #10.

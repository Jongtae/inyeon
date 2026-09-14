# Methodology Review Preview

Purpose: unblock Issue #14 by giving a qualified Korean Saju methodology reviewer access to the exact candidate calculation behavior without declaring a public production release.

## Governance boundary

The review preview is **not production**.

- It must not set `INYEON_PRODUCTION_ENABLED=true`.
- It must not set `TEAM_STATE.toml:release_state.status` to released.
- It must not populate `production_url`, `release_sha`, `rollback_sha`, or L4 production/recovery evidence.
- It must not claim that candidate Saju outputs are approved or correct.
- It must remain `noindex,nofollow,noarchive,nosnippet`.
- It may expose candidate calculation provenance and variant detail needed for qualified methodology review.
- Relationship interpretation remains outside this review purpose and stays fail-closed.
- Personal birth inputs remain subject to the zero-retention browser-only contract.

The preview exists only while production is disabled. `.github/workflows/methodology-review.yml` refuses to deploy once `INYEON_PRODUCTION_ENABLED == true`, so a later production site cannot be accidentally overwritten by this workflow.

## Reviewer scope

Ask the reviewer to classify reviewed cases or conventions as `accept`, `change`, or `disputed`, with an attributable source or explanation when practical.

Priority questions:

1. solar-term boundaries for year/month pillars;
2. day rollover: local civil midnight versus late-Zi / 야자시 practice;
3. hour-pillar convention around 23:00–01:00;
4. whether and when true solar time should apply;
5. timezone and DST treatment for overseas births;
6. cases where the known 61–72 second solar-term disagreement changes an expected pillar.

Do not ask the reviewer to manually re-test all 240 generated contexts. Prefer a small set of authoritative conventions plus representative exact-property anchors that can be propagated deterministically through the corpus.

## Deploying the review preview

Prerequisites:

- the review implementation is merged to `main`;
- normal CI is green;
- GitHub Pages is enabled with GitHub Actions as the source;
- `INYEON_PRODUCTION_ENABLED` remains absent or `false`.

Run **Methodology Review Preview** manually with the exact 40-character `main` SHA to review.

The workflow:

1. verifies the SHA belongs to canonical `main`;
2. runs governance, lint, typecheck, unit tests, audit, and browser regression tests;
3. builds the extra `review.html` entrypoint with review-only UI;
4. verifies the no-index boundary;
5. deploys the exact artifact to GitHub Pages;
6. remotely verifies the review page;
7. records the review URL and SHA in the workflow summary only.

Share only the resulting `.../review.html` URL with the reviewer.

## After reviewer feedback

Preserve the original review evidence. Convert attributable decisions into approved exact-property anchors or explicit disputed records, then rerun independent QA/CI. Only after Issue #14 truthfully satisfies its production criteria may the normal production workflow be enabled.

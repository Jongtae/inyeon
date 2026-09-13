# INYEON Measurement & Feedback

Status: active measurement baseline for the Independent Release / Compatibility Lab.

## 1. Measurement philosophy

The first release is intentionally privacy-first and zero-backend. Product measurement must not undermine that architecture.

Default stance:

> **No third-party browser analytics is required for the first public release.**

The primary evidence sources are:

1. deterministic test/quality signals;
2. GitHub build/deploy/issue history;
3. explicit qualitative Reddit feedback after required Human Gates;
4. manually observed product behavior during release testing.

Business KPIs such as revenue, CAC, subscription conversion, marketplace liquidity, or dating outcomes are not first-release success criteria.

## 2. First-release success questions

1. Can a stranger complete `My Saju → comparison → explanation → share` without assistance?
2. Are Saju results deterministic and stable across releases?
3. Do unknown/approximate/disputed birth-time cases degrade transparently?
4. Do users understand `What clicks / Potential friction / Why this?` without interpreting it as scientific certainty?
5. Are public-figure sources/confidence understandable and trustworthy?
6. Do synthetic characters feel clearly fictional while still useful for exploration?
7. Can users share results without exposing birth date/time/place?
8. Does protected personal data stay entirely inside browser memory?
9. Which flows/copy/results confuse or delight Reddit users?
10. Can feedback be converted into traceable product improvements without letting noisy public comments drive unsafe changes?

## 3. Release-quality measurements

### Correctness

- golden/reference fixture pass rate;
- differential disagreements by category;
- calendrical boundary regression failures;
- compatibility rule test pass rate;
- unknown-time suppression regression failures;
- public-figure data validation conflicts.

### Privacy / security

- protected-canary network leaks: must be 0;
- protected-canary storage/cache leaks: must be 0;
- protected-canary URL/log/console leaks: must be 0;
- client secret detections: must be 0;
- dependency/security findings by severity;
- share payload privacy failures: must be 0.

### Reliability / delivery

- CI pass/fail history;
- GitHub Pages deploy success;
- production smoke pass rate;
- direct-route/refresh test status;
- rollback/redeploy drill status;
- JavaScript/runtime defects reported from real users when available.

### UX / accessibility

- critical flow E2E pass rate;
- accessibility audit issues by severity;
- supported browser/device regression reports;
- loading/error/empty-state defects;
- share flow/browser compatibility issues.

## 4. Privacy-safe runtime telemetry policy

Do not collect first-release personal behavior analytics merely because a tool makes it easy.

Protected data never belongs in analytics/telemetry:

- birth date/time/place;
- coordinates;
- personal Four Pillars or derived chart vector;
- private pair compatibility evidence;
- information entered about `Someone I Know`;
- share payloads containing derived personal data.

If browser telemetry is introduced later, it requires an explicit privacy review and an allowlisted schema. Prefer coarse operational events that do not identify or fingerprint the user.

Do not introduce persistent pseudonymous IDs/cookies solely for analytics in the zero-retention release.

## 5. Public-figure data quality

Maintain release-data reports such as:

- total records;
- records with multiple sources;
- date-only records;
- known/verified/well-sourced/disputed/unknown time distribution;
- unresolved source conflicts;
- missing/invalid image-license metadata;
- records changed in latest refresh;
- chart-calculation failures/out-of-range cases.

Dataset quality is more important than maximizing record count.

## 6. Synthetic-character quality

Track in CI/build reports:

- total deterministic characters generated;
- generator/seed version;
- coverage across key Day Masters/branches/relationship evidence classes;
- extreme distribution skews;
- duplicate-rate checks;
- ability to regenerate byte-for-byte or semantically equivalent dataset from versioned inputs.

Synthetic interaction data must never later be treated as real relationship outcome data.

## 7. Sharing quality

Test/measure:

- share image generation success across supported browsers;
- Web Share feature detection/fallback;
- share-safe payload schema validation;
- direct open/reconstruction success for share-safe links;
- protected-field absence from URL/card/metadata;
- `Compare with me` disclosure/confirmation state;
- public-figure OG/social metadata validation.

## 8. Reddit feedback taxonomy

After owner-approved launch/access, classify feedback into:

```text
bug
browser_device_issue
accessibility
privacy_concern
saju_correctness
methodology_dispute
public_figure_data_correction
copy_confusion
ux_confusion
feature_request
share_problem
performance
praise
outlier_or_low_evidence
```

Each feedback cluster should record:

- compact paraphrased summary;
- source link(s);
- number of independent supporting comments/users where reasonably inferable;
- reproducibility/evidence level;
- risk class;
- suggested issue or existing linked issue;
- whether auto-implementation is eligible.

Minimize usernames/identifiers and do not unnecessarily copy entire comments into the repo.

## 9. Auto-improvement eligibility

### May auto-enter normal implementation when evidence is strong and the change is bounded/reversible

- reproducible browser/rendering bug;
- broken route/link/share flow;
- clear copy typo or localized confusion with a narrow fix;
- accessibility defect;
- performance regression;
- deterministic test failure;
- public-figure correction backed by trustworthy source evidence and no material dispute.

### Must remain human-reviewed

- Saju methodology or rule-weight change;
- changing what is considered a good/bad relationship dynamic;
- privacy/security architecture;
- any new data collection/analytics;
- introducing a backend/GCP service;
- public/celebrity claims with reputational risk;
- major product positioning/scope;
- legal/platform-policy questions;
- material vendor spend;
- weak, contradictory, or brigaded feedback.

## 10. Evidence threshold

Do not implement a product change merely because one highly upvoted comment exists.

Prefer this order:

1. reproducible defect with objective evidence;
2. repeated independent reports;
3. clear usability misunderstanding reproduced in product testing;
4. isolated preference request;
5. speculative opinion.

Upvotes can be a signal but are not a product requirement by themselves.

## 11. Feedback-to-release traceability

Desired chain:

`Reddit source cluster → GitHub issue → PR/commit → tests → release SHA → optional changelog/update`

Every automatically created issue should cite source links and summarize evidence without importing unnecessary personal information.

## 12. Optional future privacy-safe aggregate analytics

If qualitative feedback proves insufficient, consider a deliberately minimal opt-in or aggregate measurement design later.

Possible non-sensitive coarse events could include:

- anonymous page view counted by hosting/privacy-preserving aggregate tooling;
- feature availability/browser-class diagnostics;
- share-button invocation count without result payload;
- public-figure page popularity without personal chart input.

This is not approved by default. Any telemetry changes require explicit privacy review and must preserve the zero-retention promise for personal birth/comparison data.

## 13. Future Marketplace Mode

The former marketplace north-star and A/B/C dating-outcome experiment remain historical/future reference only.

If real-user dating is later activated, design a new analytics architecture appropriate to that mode rather than quietly reusing first-release zero-retention assumptions.

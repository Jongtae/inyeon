# INYEON Independent Release Mode

> The filename is retained for continuity, but **"toy project" describes ownership and business intent, not quality level.**

## Intent

INYEON is an independent personal project rather than a revenue-first startup program. Near-term commercial success, fundraising, CAC/LTV optimization, and marketplace scale are not success criteria.

However, the project is intended to be **properly released to real users**. It is not a throwaway prototype, hackathon demo, local-only experiment, or excuse for reduced engineering quality.

The project should optimize for:

1. learning how Korean Saju / Gung-hap can be represented as deterministic software;
2. shipping an interesting, polished public compatibility product;
3. experimenting with transparent explanations rather than fortune-telling scores;
4. maintaining high correctness, privacy, reliability, accessibility, and release quality;
5. keeping the architecture simple enough for an independent project to operate;
6. preserving the option to evolve into a real dating marketplace later.

**Business ambition may be intentionally modest. Release quality is not.**

## Active first-release product shape

The preferred first public product is a **Compatibility Lab**, not yet a complete two-sided dating marketplace.

Primary flows:

- Me → calculate my Saju / Four Pillars.
- Me × Public Figure → compare with well-known people whose public birth data is sourced and confidence-labelled.
- Me × Synthetic Character → explore thousands of clearly fictional relationship patterns.
- Me × Someone I Know → compare with a person whose birth data the user enters with appropriate context/consent.
- Explain → show `What clicks`, `Potential friction`, `Why this?`, and methodology/uncertainty.

Real-user discovery, likes, matches, chat, city seeding, payments, and dating-marketplace moderation are later product layers. They are deferred because they are outside the first product scope, **not because production quality is optional**.

## Public release target

The first release should be a real, publicly usable product. Depending on the chosen client strategy this may be web/PWA first, native app first, or both, but it must have an actual production environment.

Minimum release expectations:

- reproducible build and deploy;
- `local → test → staging → production` environments where relevant;
- CI checks for core logic and release artifacts;
- deterministic/versioned Saju results;
- golden/regression coverage for calendrical boundaries;
- production error tracking and basic observability;
- secrets kept out of source control;
- secure handling of personal birth inputs;
- privacy policy and clear data-retention/deletion behavior for any persisted personal data;
- accessibility and responsive/mobile usability appropriate to the chosen clients;
- graceful loading/error/empty states;
- rollback/redeploy path;
- backups and restore validation for stateful production data;
- source/confidence disclosure for public-figure birth data;
- unmistakable separation of real users, public figures, and synthetic characters;
- no fabricated birth times or hidden LLM chart calculation.

A release is not complete merely because the feature works locally.

## Execution order

Prioritize roughly in this order:

1. validated open-source Manseryeok adapter and `korean-saju-v1` profile;
2. normalized chart / derived compatibility features;
3. golden fixtures and deterministic regression tests;
4. public-figure reference dataset;
5. synthetic-character compatibility sandbox;
6. polished end-to-end chart/comparison/explanation UI;
7. production platform, privacy controls, observability, and release hardening needed for the public Compatibility Lab;
8. public launch and post-launch quality fixes;
9. only then consider the full real-user dating marketplace unless the owner explicitly changes scope sooner.

Marketplace-specific P0 issues may be deferred by product scope, but **release-engineering, privacy, security, observability, and production-readiness work required by the Compatibility Lab are not deferred**.

## Public-figure data rules

Public figures are reference examples, not dating prospects.

For every person record:

- store a canonical display name and category;
- store publicly sourced birth date;
- store birthplace only when needed and reasonably sourced;
- birth time is nullable and must include a confidence/source status;
- never fabricate an unknown birth time;
- keep source URL/provenance and retrieval date;
- prefer multiple sources for disputed values;
- suppress hour-dependent claims when time is unknown or disputed;
- do not imply endorsement, participation, or actual romantic availability;
- if images are used, use appropriately licensed assets or a non-infringing alternative.

Recommended confidence values:

`verified | well_sourced | disputed | date_only | unknown`

## Engineering bar

"Toy" does **not** mean sloppy, temporary, or demo-quality.

Keep these strict:

- deterministic chart calculation;
- versioned methodology and dependencies;
- reproducible datasets;
- automated unit/integration/E2E tests where useful;
- golden fixtures and boundary regression tests;
- no hidden LLM calculation;
- explicit uncertainty;
- privacy-safe personal data handling;
- production-grade error handling and observability;
- clear distinction between public figures, synthetic characters, and real users;
- maintainable code, migrations, and release process.

Simplicity is preferred over enterprise complexity, but **simplicity must still be production-capable**.

## What is intentionally not required

The first release does not need to prove:

- product-market fit;
- profitable unit economics;
- venture-scale growth;
- nationwide dating-marketplace liquidity;
- subscription monetization;
- sophisticated ML ranking;
- large operations teams.

These are business/scale questions, not prerequisites for a high-quality public release.

## Mode change

The active mode is **Independent Release / Compatibility Lab**.

Switch to full **Marketplace Mode** only by explicit owner decision. At that point activate the real-user dating, trust & safety, legal, payments, city-liquidity, and marketplace-operations work that is currently outside first-release scope.
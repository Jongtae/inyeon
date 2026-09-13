# @inyeon/synthetic-characters

Deterministic fictional references for the zero-backend Inyeon Lab.

The package exposes a random-access virtual catalog of exactly 10,000 characters. A pinned integer algorithm, master seed, generator version, and ordinal reproduce each record byte-for-byte, so the browser does not need a 10,000-row data payload. A frozen `SyntheticReferenceSubject` projection carries the `synthetic` discriminator, ID, and fiction disclosure alongside the chart context so later UI/share code cannot depend on an identity-erasing bare input. Build verification materializes every record, runs every projected fictional birth fixture through the same candidate Saju adapter, derived-feature layer, and compatibility evaluator used elsewhere, then writes a compact generator profile, coverage report, and SHA-256 manifest.

Every record is `kind: "synthetic"`, uses the immutable `synthetic:synthetic-character-generator-v1:…` namespace, and says `Fictional character—not a real person or member.` Names are non-personal `Inyeon Lab Character 00001` identifiers. Avatars are local abstract tokens, not faces or photos. Scene prompts are assigned by an independent fictional distribution and are never inferred from Saju, identity, or population data.

## Honest v1 boundary

- 10,000 deterministic fictional records; 10,000 unique IDs, display names, and content fingerprints;
- generator-defined adult-range birth fixtures from 1989–2004 across the three currently supported calculation zones;
- 8,000 exact, 500 approximate, 500 disputed, 500 date-only, and 500 unknown-time fixtures;
- all 10 Day Masters and 12 visible branches observed by the candidate pipeline;
- no real names, biographies, personal inputs, external sources, network calls, images, protected demographic fields, or marketplace state;
- no harmony/tension archetypes, rankings, scores, relationship claims, or approved evidence—the current product rule catalog contains zero approved rules;
- no population-representativeness, product-utility, production-readiness, methodology, or L4 claim;
- release feature default is off until #53/#35/#43 integrate and verify the user-facing experience.

Korean-rooted visual vocabulary is decorative and explicitly not a Five Element or personality mapping. Public copy remains natural US English with Hangul before secondary Hanja, for example `Inyeon Lab (인연 실험실)` and `Korean Saju (사주, Four Pillars; 四柱)`.

## Commands

```sh
npm run build:data --workspace @inyeon/synthetic-characters
npm run verify:data --workspace @inyeon/synthetic-characters
npm test --workspace @inyeon/synthetic-characters
```

`build:data` and `verify:data` are offline. Neither command reads public-figure data, personal data, wall-clock time, locale, environment randomness, or a remote service. A separate v1 release lock pins the generator profile and full virtual-inventory hashes. Changing content requires a new generator/data version and synthetic ID namespace rather than silently rewriting an existing shared ID.

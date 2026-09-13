# ADR 0021 — Deterministic virtual synthetic catalog

- Status: Accepted candidate exploration substrate; user value and production methodology remain unverified
- Date: 2026-09-14
- Issue: #49
- Builds on: ADR 0001, ADR 0007, ADR 0009, ADR 0019

## Context

INYEON needs at least 10,000 visibly fictional references for a zero-liquidity exploration mode. Shipping 10,000 full chart and compatibility snapshots would inflate GitHub Pages assets and duplicate data that the browser can derive. Runtime randomness or LLM generation would make IDs and shared references unstable. Human-like names, photos, biographies, and chart-derived personality traits would create deceptive dating supply and stereotype risk.

The current adapter and derived-feature layers are candidate-only, and the product compatibility-rule catalog has zero approved rules. The synthetic substrate may exercise technical coverage but cannot manufacture harmony/tension archetypes, relationship meanings, or production evidence.

## Decision

Create private workspace `@inyeon/synthetic-characters` as a deterministic random-access virtual catalog:

`pinned profile + master seed + ordinal + field stream → SyntheticCharacter → adapter → derived features → candidate compatibility evaluator`

Use the ADR 0009 discriminator and immutable namespace: `kind: "synthetic"` and `synthetic:synthetic-character-generator-v1:<ordinal>`. The public generator accepts only ordinals 0–9,999. It uses fixed unsigned 32-bit integer operations and bounded rejection sampling; it never reads time, locale, environment randomness, network state, personal data, or public-figure data.

Compatibility callers consume a frozen `SyntheticReferenceSubject` projection that retains `kind`, ID, display label, fiction disclosure, chart context, and pinned pipeline versions. The lower-level chart evaluator naturally returns participant slots rather than entity identity; UI and sharing must carry the projection next to that result and must not reconstruct identity from a bare chart input.

Do not ship a full 10,000-record asset. Materialize records on demand in bounded pages of at most 100. Offline build verification materializes and validates all 10,000, computes a full-inventory SHA-256, and emits only a compact generator profile, coverage/stereotype report, and manifest. The release-feature default is false; #53 owns the tracked web build flag and enabled/disabled flow tests.

A separate release lock pins the exact v1 profile and full virtual-inventory hashes. `build:data` and `verify:data` fail if content changes under the existing generator/data versions. Intentional changes require a new lock file, generator/data version, and synthetic ID namespace so previously shared IDs are not silently reinterpreted.

## Fictional presentation contract

Every record carries the short disclosure `Fictional character—not a real person or member.` Display identifiers are `Inyeon Lab Character 00001` rather than real-person-like names. Local abstract avatar descriptors draw from a small Korean-rooted decorative vocabulary such as `Bojagi Grid (보자기)` and `Dancheong Arc (단청; 丹靑)`. They are not authentic artifacts, people, or Five Element mappings.

Finite scene prompts are assigned from separate deterministic streams and explicitly marked independent of Saju and population truth. They contain no biography, personality, occupation, protected demographic trait, body, location, relationship status, or dating preference. All fictional birth fixtures fall from 1989 through 2004 so the v0.1 references remain in an adult range; time zones are calculation capability strata, not claimed residences or identities.

Public product copy is natural US English. When Korean script is shown, Hangul precedes secondary Hanja, as in `Korean Saju (사주, Four Pillars; 四柱)`.

## Evidence and product boundary

The build reports actual coverage of 10 Day Masters, 12 visible branches, five temporal-support states, three calculation zones, abstract visual tokens, and independent scene prompts. It reports repeated birth contexts honestly and rejects duplicate full content fingerprints. It cannot call these distinct compatibility patterns.

Approved relationship-evidence coverage remains `unavailable` with zero approved rules. No `Why this works`, `Show another like this`, soulmate score, ranking, personality inference, or relationship claim may be generated. #35 owns evidence-backed explanations and the no-approved-evidence state. #53 owns browse/detail/compare UI and persistent fictional labeling. #43 owns share disclosure; #52/#47 own privacy and deployed artifact verification. These remain v0.1 release blockers.

## Consequences

The compact checked-in artifacts remain below 300 KB combined while a selected ordinal is reproducible in Node and the browser. Every record has a distinct synthetic identity and carries no external asset or real-person provenance obligation. Changing the generator, distributions, or wordbanks requires a new version/namespace rather than mutating existing synthetic IDs.

Technical breadth is not population diversity, cultural authenticity, product utility, scientific validation, or L4 proof. Synthetic interactions must never be counted as real-user supply or relationship outcomes.

## Security / privacy / safety impact

No personal input is accepted or persisted. An exact nested positive schema plus defensive forbidden-key and unsafe-string checks reject marketplace, protected-demographic, HTML/control-text, and remote-URL additions. Build validation compares every claimed pipeline version against actual chart, derived-feature, rule-set, taxonomy, snapshot, and evidence-model provenance. Names and visuals cannot impersonate a person. The inventory can be disabled locally without affecting other packages, and public release remains default-off until UI, privacy, performance, and methodology gates pass.

## Rejected alternatives

- Full 10,000-record/chart snapshot assets: rejected for payload and drift.
- Runtime random or LLM-generated characters: rejected for reproducibility and safety.
- Human names, faces, scraped profiles, biographies, or remote avatars: rejected for deception, privacy, identity, and licensing risk.
- Generic user/profile inheritance: rejected because missing flags could create fake marketplace state.
- Relationship archetypes from current candidate features: rejected because the approved product rule catalog is empty.
- Unsupported time zones, places, or default times: rejected because they weaken the adapter and uncertainty boundaries.

## Revisit

Revisit the default-off flag only after #53/#35/#43/#52/#47 integration, measured bundle/runtime performance, persistent fiction disclosure tests, and the existing #14/#33 methodology gates. Evaluate US-user comprehension and utility separately; engagement may reflect visual or prompt appeal rather than Saju value.

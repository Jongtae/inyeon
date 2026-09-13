# `@inyeon/saju-derived-features`

Pure, deterministic feature derivation for INYEON's candidate Korean Saju chart contract.

The package accepts only a successful `@inyeon/saju-adapter@0.4.0` `calculateChart` result. It does not accept birth date, birth time, location, adapter errors, or upstream Manseryeok objects. Runtime code performs no network, storage, logging, randomness, clock, or locale operations.

```ts
import { deriveChartFeatures } from '@inyeon/saju-derived-features';

const result = deriveChartFeatures(successfulChartResult);
```

Version `korean-saju-derived-v1` intentionally provides only:

- 일간 (Day Master, 日干): the visible day-pillar stem;
- 오행 (Five Elements, 五行) and 음양 (Yin/Yang, 陰陽) annotations for every available visible stem and branch;
- equal one-unit occurrence counts for visible symbols: eight with an hour pillar, six when hour is suppressed;
- whole, correlated alternatives with the source's opaque variant IDs and order;
- stable position, Day Master, and count support as `invariant`, `alternative`, or `unavailable`.

Hangul is primary where Korean script appears; Hanja is secondary detail. Stable English IDs, English concept labels, and explicitly named Korean romanization fields support US-first presentation, but this package emits no narrative.

It does **not** calculate balance, strength, dominance, seasonal weighting, hidden stems, Ten Gods, combinations, clashes, harm, punishment, break, relationship dimensions, or any feature conditioned on gender or sexuality. Those concepts must not be inferred from the occurrence counts.

All outputs are deeply frozen. Invalid or version-incompatible sources return one generic bounded error that never reflects input values.

The large Issue #14 regression artifact is kept out of this runtime package. The private `@inyeon/saju-golden-corpus` workspace owns its deterministic generator, records full candidate observations, and CI-checks drift without exporting or bundling the corpus for browsers.

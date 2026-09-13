# Saju golden corpus

This private development/CI workspace owns INYEON's candidate chart regression corpus. It is deliberately separate from browser/runtime packages, so the large evidence artifact is not shipped with the product bundle.

`data/golden-chart-corpus.v1.json` contains 240 unique positive contexts and a separate negative-capability collection. Each positive fixture records a strict normalized input, full `candidateObserved` adapter and derived-feature outputs, an exclusive primary category, non-exclusive overlap tags, evidence references, property-level evidence grades, validation state, and any open dispute. Coverage includes all 12 절 (jie) solar boundaries at before/equality/after states, all 12 civil hour transitions at before/equality/after states, the three 61–72 second solar-reference disagreements, 24 late 자시 (Jasi, 子時) contexts, both US DST eras, all five temporal modes, every supported zone and decade, and all 60 day pillars.

`candidateObserved` is generated behavior, not approved truth. `data/golden-chart-approvals.v1.json` is physically separate, starts with no approved expectations, and is never written by the generator. Exact-property independent or advisor evidence must be reviewed and added there manually through the methodology gate.

Regenerate candidate observations:

```sh
node packages/saju-golden-corpus/scripts/generate-golden-chart-corpus.mjs
```

Check committed drift:

```sh
npm run verify:data --workspace @inyeon/saju-golden-corpus
```

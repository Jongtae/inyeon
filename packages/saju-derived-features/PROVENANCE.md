# Derived-feature provenance

## Owned canonical tables

INYEON owns the runtime tables in `src/tables.ts` under canonical table version `visible-stem-branch-elements-v1`. They cover exactly the ten 천간 (heavenly stems, 天干) and twelve 지지 (earthly branches, 地支), with Hangul-primary identity, secondary Hanja, stable Korean romanization labels, 오행 (Five Elements, 五行), and 음양 (Yin/Yang, 陰陽).

The element mappings were checked against the exact validation dependency `lunar-javascript@1.7.7`, specifically its `LunarUtil.WU_XING_GAN` and `LunarUtil.WU_XING_ZHI` tables. Ordered stem/branch polarity was checked against the same package's canonical ten-stem and twelve-branch ordering and independently asserted exhaustively in INYEON tests. The package is a **comparison reference only**, not Korean Saju methodology authority. It is not imported by runtime derivation, and its broader interpretive tables are not adopted.

## Counting method

Weighting version `unit-visible-symbol-v1` gives one unit to each available visible pillar stem and branch. A full chart therefore has exactly eight observations; a date-only or unknown-time chart has six because the hour pillar is absent. Counts are occurrences, not balance, strength, dominance, favorability, compatibility, or probability. No seasonal or hidden-stem weighting is present, and alternatives are never averaged.

## Source boundary

The only accepted source is a successful, version-pinned `@inyeon/saju-adapter@0.4.0` `calculateChart` result using profile `korean-saju-v1` and Issue #12 uncertainty provenance. Runtime imports from the adapter are type-only. The package validates normalized domains, Hanja correspondence, result/provenance versions, variant IDs/order/shape, stable-pillar consistency, bounded counts, and hour-evidence consistency before deriving.

Output provenance copies the relevant adapter, profile, Issue #10 solar-term, Issue #11 year/month, Issue #12 day/hour, and uncertainty-algebra versions. Both package and source remain candidate and `productionValidated: false`; this layer cannot promote unresolved source methodology.

## Privacy and reproducibility

The source result contains no raw datetime, offset, instant, or place. This package accepts no separate personal context, emits no such field, performs no I/O, and returns generic non-reflective errors. Same validated source object and versions produce the same deeply frozen structured output.

## Golden regression corpus

Issue #14 validation is owned by the separate private `@inyeon/saju-golden-corpus` workspace so its multi-megabyte evidence artifact is not part of this package's published/runtime `files` allowlist. Its generator observes this package and the adapter together, while keeping generated `candidateObserved` values physically separate from the non-generator-managed approvals artifact. Those observations remain candidate regression evidence, not independent or expert truth.

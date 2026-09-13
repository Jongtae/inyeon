# ADR 0015 — Minimal visible-chart derived features

- Status: Accepted candidate implementation; not production methodology approval
- Date: 2026-09-14
- Issue: #13
- Builds on: ADR 0008, ADR 0014

## Context

Compatibility rules need one stable deterministic representation above calendrical calculation. Issue #13's historical scope listed many traditional interpretations, but no approved first-release compatibility taxonomy or rule set yet demonstrates a need for hidden stems, Ten Gods, branch/stem relations, or weighting choices. Adding them now would widen methodology risk and could turn an unweighted display count into an unsupported strength judgment.

The Issue #12 adapter already preserves exact, approximate, disputed, date-only, and unknown temporal support as ordered chart variants with stable-pillar and hour-evidence metadata. Derivation must preserve that uncertainty rather than selecting or averaging a chart.

## Decision

Create the separate pure package `@inyeon/saju-derived-features@0.1.0`. Version `korean-saju-derived-v1`, schema version 1:

1. accepts only successful `@inyeon/saju-adapter@0.4.0` `calculateChart` results;
2. defines 일간 (Day Master, 日干) as the visible day-pillar heavenly stem;
3. annotates each available visible stem and branch with INYEON-owned 오행 (Five Elements, 五行) and 음양 (Yin/Yang, 陰陽) tables;
4. counts one occurrence per visible symbol under `unit-visible-symbol-v1`, totaling eight for four pillars or six when hour is suppressed;
5. preserves source variant IDs byte-for-byte, source order, temporal support, hour-dependent eligibility, and whole-state correlation;
6. reports stable positions, Day Master, and count records as invariant, correlated alternatives, or unavailable; alternatives are never averaged;
7. emits deeply frozen, deterministic output and one generic bounded error for invalid/version-incompatible source objects.

Hangul is the primary Korean-script identity and Hanja is secondary traditional detail. Stable English IDs, English concept labels, and explicitly named Korean romanization fields enable US-first UI presentation, but the package produces no narrative or compatibility conclusion.

The canonical element tables were checked against exact `lunar-javascript@1.7.7` comparison data. This is a table comparison only, not methodology authority or production validation. Runtime code does not import Manseryeok or lunar-javascript and does not recalculate pillars.

## Explicit exclusions

The v1 package does not emit balance, strength, dominance, seasonal weighting, hidden stems, Ten Gods, combinations, clashes, harm, punishment, break, relationship dimensions, gender, or sexuality fields/branches. Visible occurrence counts must never be presented as a balance or strength score.

Revisit the excluded feature set only after #6 defines an inclusive taxonomy, #33 demonstrates the exact deterministic primitives required by approved rules, and #14 supplies the release reference corpus. A material methodology choice still follows the Human Gate; an issue label or traditional popularity is not sufficient evidence.

## Consequences

Compatibility work receives a stable typed seam without depending on Manseryeok or ad hoc re-derivation. The contract stays deliberately small and reversible. Some later rules may require an additive schema/version revision after evidence and governance review.

Source chart candidate status propagates into feature provenance. `productionValidated` remains false; deriving a deterministic annotation cannot validate the upstream day-boundary or solar-term methodology.

## Security / privacy / safety impact

The package accepts no raw date, time, location, adapter error, gender, or sexuality input. It performs no network, persistence, cache, URL, log, clock, random, or locale operation. Invalid objects cannot cause protected values to be reflected in results. Derived personal chart data remains protected by ADR 0007 and in browser memory only.

## Rejected alternatives

- Derive features directly inside compatibility rules: rejected because methods and versions would fragment.
- Import Manseryeok at runtime: rejected because only the INYEON adapter owns calendrical computation.
- Average alternative count vectors: rejected because averages destroy variant correlation and invent a chart that may not exist.
- Treat six visible symbols as eight by inserting an hour: rejected because unknown time must remain unknown.
- Add broad traditional relations preemptively: rejected because approved compatibility rules do not yet require them.

## Rollback

Consumers can stop importing the separate package without changing adapter `0.4.0` or chart identity. No persisted personal feature migration exists.

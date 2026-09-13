# Saju Engine Specification

## Principle

Saju calculation is deterministic software, not an LLM task.

Same normalized input + same calculation profile version + same pinned upstream/reference versions must produce the same normalized chart.

The first release should **not** reimplement mature calendrical primitives without evidence that doing so is necessary.

Preferred engineering strategy:

`adopt → wrap → pin → differential-test → golden-test → patch only proven gaps`

Primary candidate: `yhj1024/manseryeok` behind an INYEON-owned `InyeonSajuAdapter`.

Validation references may include `6tail/lunar-javascript`, independent astronomy data, Korean lunar/KASI-aligned references, and expert-reviewed fixtures. Reference independence must be recorded per property: lunar-javascript is a shared-lineage comparison for manseryeok solar-term data, while astronomy data can independently locate a solar-longitude boundary but cannot validate a complete Four Pillars result by itself.

No upstream library is treated as infallible. Differences must be classified and documented.

## Adapter boundary

All third-party calendar/Saju behavior must be hidden behind an INYEON-owned adapter interface.

Suggested flow:

`raw local birth input → strict INYEON normalization → unknown-time branch or LocalTimeResolver → validated resolver/calculation capability intersection → InyeonSajuAdapter → normalized chart/uncertainty → derived features → compatibility engine`

`@inyeon/timezone-resolver` owns deterministic local-time normalization for its published canonical zones and range. It returns zero candidates for a DST gap, one for an unambiguous time, and two chronologically ordered candidates for a fold. It never moves a gap or chooses a fold candidate. Its browser runtime uses only its checked-in IANA transition artifact; generation-only timezone libraries, host `Intl`/Temporal data, network services, and geocoding are not calculation authorities.

Resolver capability does not imply chart capability. The Saju adapter may consume a resolved context only within the independently validated intersection published by its own capability manifest. The current adapter therefore remains limited to its modern-Seoul candidate subset until a separate engine seam proves correct local-civil and UTC-instant semantics for other zones/history.

The product/domain layer must not depend directly on one upstream library API.

## Solar-term candidate evidence

The candidate year/month contract uses the exact-pinned `manseryeok@2.0.0` embedded UTC-minute boundary. `before_primary_boundary`, `at_primary_boundary`, and `after_primary_boundary` mean exactly 60 seconds before, equality with, and 60 seconds after that primary boundary. Equality belongs to the new month and, at 입춘 (Ipchun), the new Saju year.

The full adapter range is regression-checked at all twelve monthly `절` boundaries. Astronomy Engine independently locates the apparent-Sun longitude crossing but does not determine Korean Saju methodology. Raw timing differences remain visible; the 120-second differential guardrail is an investigation threshold, not an accuracy claim or permission to average/select competing times. No runtime astronomy fallback is used.

This evidence validates deterministic implementation behavior only. Year/month methodology stays candidate and non-production until KASI-aligned or expert review and the release golden corpus satisfy the remaining gates. Day/hour behavior is excluded from the solar-term contract and remains owned by the uncertainty/day-boundary work.

Record with every chart or reproducible fixture where applicable:

- INYEON calculation profile version;
- INYEON adapter version;
- upstream package/repository version or commit/tag;
- timezone/reference-data version;
- derived-feature version.

Changing any behavior that can alter chart identity requires a profile/version review and full golden-corpus regression before production.

## Input model

- local birth date;
- local birth time nullable;
- birth time precision: `exact | approximate | unknown` for user input;
- public/reference data may additionally use `verified | well_sourced | disputed | date_only | unknown` source-confidence metadata;
- birthplace resolver result when required;
- IANA timezone identifier when known/required;
- coordinates only when necessary for deterministic calendrical/timezone/true-solar-time policy;
- calculation profile version;
- timezone/reference data version.

For the first zero-backend release, personal inputs are processed only in browser memory and are not persisted/transmitted by INYEON application code.

## Required v1 outputs

- year/month/day/hour pillars when computable;
- heavenly stems / earthly branches;
- five-element derived features;
- day master;
- ten-god relationships where the profile specifies them;
- branch/stem relationships used by compatibility rules;
- confidence/input-completeness metadata;
- possible-alternative states when boundary uncertainty genuinely prevents a single chart result;
- all methodology/upstream/reference versions needed for reproduction.

## Methodology governance

Different Four Pillars traditions make different choices around boundaries and derived interpretations. Every such choice must be explicit in a versioned `korean-saju-v1` calculation profile.

The profile must document at least:

- solar-term boundary source/precision;
- historical timezone/DST handling;
- year boundary convention;
- month pillar solar-term convention;
- day boundary convention;
- hour branch convention;
- whether true solar time adjustments are used;
- hidden stems and weighting rules if used;
- Daewoon direction/start calculation if/when introduced;
- how an upstream library's defaults map to or differ from the chosen Korean profile.

Do not silently blend Chinese BaZi defaults and Korean Saju conventions.

## Unknown / approximate birth time

Never fabricate an hour. Do not substitute noon or another default merely to obtain eight characters.

When time is unknown:

- compute only facts supported by the available input;
- suppress hour-dependent compatibility rules;
- propagate lower interpretation confidence;
- clearly label limitations;
- if the unknown time could cross a selected day/month/year boundary, represent the legitimate alternatives rather than pretending certainty.

Approximate/disputed time should be normalized to an explicit range/state and evaluated conservatively according to the calculation profile.

## Differential validation

Before trusting the primary adapter:

1. compare representative cases against at least one independent implementation/reference;
2. oversample 입춘 (Ipchun), monthly solar-term boundaries, and day rollover inside the adapter's currently declared capability; separately test that unsupported timezone/history inputs fail closed;
3. classify every disagreement as one of:
   - upstream implementation bug;
   - deliberate methodology/tradition difference;
   - timezone/input normalization issue;
   - source/reference inconsistency;
   - unresolved expert-review item;
4. do not average/confabulate across disagreement;
5. add resolved cases to the regression/golden corpus.

Issue #9 owns positive validation of IANA normalization, DST gaps/folds, historical timezone changes, Korea, and multiple US time zones. Such rejected inputs are useful negative tests in Issue #8 but do not count as supported differential/reference cases.

## Golden corpus requirements

Before public release, maintain at least **200** expert/reference-backed fixtures heavily sampling:

- solar-term boundaries;
- day boundaries;
- leap years;
- historical DST transitions;
- multiple US time zones;
- Korea;
- exact / approximate / unknown birth time;
- known public-figure/reference cases with reliable provenance where useful;
- upstream/reference disagreement cases after resolution.

Each fixture should preserve provenance and expected methodology/profile version.

## Property / invariant tests

Verify at minimum:

- same normalized input + same versions → same output;
- no fabricated hour appears from unknown-time input;
- unsupported hour-dependent derived features are absent;
- normalized stems/branches stay in their valid domains;
- pair-order symmetry where a compatibility rule is logically symmetric;
- upstream upgrade cannot change expected fixtures silently.

## Upgrade policy

Upstream dependency updates are not routine semver bumps.

Before production upgrade:

- review upstream release notes/diff;
- run the full golden corpus;
- run differential boundary tests;
- inspect all changed outputs;
- classify intentional vs unexpected changes;
- bump INYEON methodology/adapter version when behavior changes materially;
- document the decision in an ADR/release note.

## Non-goal

INYEON's distinctive value is not owning basic sexagenary-calendar math. The durable project value belongs in uncertainty modelling, compatibility feature representation, versioned relationship rules, explainability, public/synthetic exploration, and later optional real-world outcome learning.

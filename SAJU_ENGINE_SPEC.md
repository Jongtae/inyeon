# Saju Engine Specification

## Principle

Saju calculation is deterministic software, not an LLM task.

Same normalized input + same calculation profile version must produce the same normalized chart.

## Input model

- local birth date
- local birth time nullable
- birth time precision: `exact | approximate | unknown`
- birthplace resolver result
- IANA timezone identifier
- coordinates needed only for deterministic calendrical/timezone calculation
- calculation profile version
- timezone data version

## Required v1 outputs

- year/month/day/hour pillars when computable
- heavenly stems / earthly branches
- five-element derived features
- day master
- ten-god relationships where profile specifies them
- branch/stem relationships used by compatibility rules
- confidence/input-completeness metadata
- all methodology versions needed for reproduction

## Methodology governance

Different Four Pillars traditions make different choices around boundaries and derived interpretations. Every such choice must be explicit in a versioned `korean-saju-v1` calculation profile.

The profile must document at least:

- solar-term boundary source and precision
- historical timezone/DST handling
- year boundary convention
- month pillar solar-term convention
- day boundary convention
- hour branch convention
- whether true solar time adjustments are used
- hidden stems and weighting rules if used
- Daewoon direction/start calculation if/when introduced

## Unknown birth time

Never fabricate an hour. When time is unknown:

- compute only time-independent facts;
- suppress hour-dependent compatibility rules;
- propagate lower interpretation confidence;
- clearly label limitations.

## Test requirements

Before launch, maintain an expert-reviewed golden corpus heavily sampling:

- solar-term boundaries
- day boundaries
- leap years
- historical DST transitions
- multiple US time zones
- Korea
- exact / approximate / unknown birth time

Property tests should verify determinism and invariants such as pair-order symmetry where the rule is logically symmetric.

# Public-figure data provenance

## Source boundary

- Source snapshot: `wikidata-public-figures-v1`
- Retrieved: 2026-09-14
- Source: Wikidata entity data and Query Service
- License: CC0 1.0
- Selection: English Wikipedia article, at least 20 Wikimedia sitelinks, allowed public occupation category, day-level birth date candidate, 1950–2006 source range
- Published corpus: `public-figures-v1`

Each raw record pins a Wikidata QID, entity revision ID, English label/aliases, birth-date statement ID, declared birthplace/citizenship values, and source URL. Every normalized birth date points back to its source record and statement, and the statement entity ID must match the record QID. The checked-in source snapshot is the reproducible build input; Wikidata is not queried by the browser or normal CI. Refresh writes an ignored candidate snapshot and added/changed/removed review report. A separate offline promotion command requires the exact SHA-256 recorded in that report, so reviewed and promoted bytes cannot diverge through a second network fetch.

Wikidata's structured data is available under CC0. That permits reuse but does not establish factual certainty, cultural authority, recognizability, or demographic representativeness. V1 labels every published date as `single-structured-source`, quarantines conflicting date statements, and records both `representativenessClaim: false` and `recognizabilityValidated: false`.

## Time, place, and calculation boundary

V1 stores no birth time. Every published record is `date_only`, with `localTime: null`; no noon or other placeholder exists. A record is comparison-eligible only when its day-precision date is inside the adapter's 1989–2024 range and its exact sourced birthplace is one of the three deliberately mapped cities:

- New York City → `America/New_York`
- Los Angeles → `America/Los_Angeles`
- Seoul → `Asia/Seoul`

No other place is coerced to a nearby city, country default, UTC, or Korean time. Unsupported records remain searchable with allowlisted reason codes. Eligibility tests run the same pinned Saju adapter, derived-feature, and compatibility packages used by personal flows; date-only records produce no hour pillar or hour-dependent evidence.

## Images and copy

Every v1 image is `null`. No celebrity photo or biography text is copied or hotlinked. Future images require a separately reviewed per-file license and attribution contract.

Public copy must state that the person is a public reference and does not imply membership, endorsement, participation, romantic availability, or private-life knowledge. Product copy is US English first, with Hangul before Hanja when Korean script is shown.

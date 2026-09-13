# ADR 0011 — Browser-local time normalization with pinned IANA data

- Status: Accepted
- Date: 2026-09-14
- Owners: INYEON
- Builds on: ADR 0007 — Client-only zero retention and share boundary; ADR 0008 — Manseryeok adapter and `korean-saju-v1` profile boundary

## Context

INYEON must turn a strict local civil date, time, and timezone into an instant before any timezone-sensitive calculation. Daylight-saving transitions can make one local time nonexistent or map it to two instants. Historical Korean offsets also include seconds, such as Seoul's `+08:27:52` before the 1908 standard-time transition. Browser timezone data is not version-addressable, and common convenience APIs silently move gap times forward or select one side of a fold.

The first release is a static, zero-backend product. A remote timezone or geocoding service would disclose protected birth context and make calculation depend on the network. Shipping a general timezone runtime would also add unnecessary code and semantics for the three-zone release scope.

## Decision

### Owned resolver contract

Create `@inyeon/timezone-resolver` as an INYEON-owned, dependency-free browser runtime. It accepts only strict `YYYY-MM-DD`, strict `HH:mm`, and one canonical identifier from this initial allowlist:

- `America/Los_Angeles`
- `America/New_York`
- `Asia/Seoul`

The uniform supported local-date range is `1908-04-01` through `2026-12-31`. Aliases, abbreviations, place strings, coordinates, geolocation, and geocoding are not part of this contract.

The first-release birthplace strategy is explicit selection from those canonical zones for personal input and a reviewed canonical zone field in versioned public-reference data. INYEON does not turn a free-form place into a timezone, guess the nearest city, or send birthplace data to another service. Inputs without one of the supported identifiers fail closed.

The resolver returns a discriminated result with exactly zero, one, or two candidates:

- zero for a nonexistent gap time;
- one for an unambiguous time;
- two for an ambiguous fold, ordered by increasing UTC instant.

Each candidate contains an ISO UTC instant and an integer offset in seconds east of UTC. The resolver never shifts a gap to another time and never chooses one fold candidate. It validates candidates by round-tripping through the pinned transition table. Unknown birth time is a separate branch that returns no instant and does not inspect the transition table.

Errors are bounded codes and messages that do not echo date, time, timezone, place, caught values, or other protected input.

### Generated timezone artifact

Use exact `moment-timezone@0.6.3` and `moment@2.30.1` only as generation-time development dependencies. The generator extracts the selected zones from Moment-Timezone's embedded IANA `2026c` dataset into a checked-in compact integer transition table. Moment, Moment-Timezone, `Intl`, Temporal, and host timezone data are not runtime sources of truth.

Generation fails unless source versions, selected zones, integer offsets, monotonic safe-integer transitions, sentinels, and the zero/one/two cardinality invariant match the contract. A committed SHA-256 and byte-for-byte drift check make regeneration explicit and reproducible.

Official `tzcode2026c` `zic`/`zdump` output supplies a different implementation path for reference fixtures and transition-adjacent tests. It remains the same underlying IANA lineage, so it is differential implementation evidence rather than an independent historical authority. IANA pre-1970 data is described as a pinned reproducible model, not as universally exact history.

IANA `2026d` was current at review time. Official `zic` output for the three selected zones was compared between `2026c` and `2026d` across a broader 1800–2500 window and was byte-identical. Keeping `2026c` is therefore an intentional reviewed pin for this scope, not an unexamined latest-version drift.

### Capability separation

Timezone resolution capability and Four Pillars calculation capability are separate. This ADR enables local-time normalization for the three zones and stated range. It does not make New York, Los Angeles, or historical Seoul inputs calculable through the current `manseryeok` civil-input API.

The existing Saju adapter continues to expose only its independently validated modern-Seoul candidate range. A later issue must define a proven engine seam for resolved instants and local civil context before chart capability can expand. Issue #9 does not change `korean-saju-v1`, the Saju adapter contract, or `productionEligible: false`.

### Privacy and packaging

The complete three-zone table is packaged with the local resolver. Resolution performs no network request, dynamic zone import, storage/cache write, URL/history mutation, logging, telemetry, geolocation, or geocoding. Per-zone fetches are forbidden because even a public asset request can disclose the selected timezone in access logs.

## Alternatives considered

- **Moment/Moment-Timezone in the browser runtime:** rejected because default gap/fold behavior conflicts with the owned contract and the package adds unnecessary runtime surface.
- **Host `Intl` or Temporal as the source of truth:** rejected because the host timezone-data version is not reproducible.
- **Hand-written DST rules:** rejected because historical and political timezone rules are too complex to recreate safely.
- **A full timezone database in the product bundle:** rejected because the first release needs exactly three zones.
- **A remote timezone/geocoding service:** rejected because it violates the static, offline, protected-data boundary.
- **Passing all resolved zones directly to the current Saju adapter:** rejected because the upstream API interprets civil fields as Korean time and would produce misleading chart capability.

## Consequences

The browser can deterministically expose DST gaps and folds without guessing and can preserve historical second-level offsets. The supported zone/range surface is deliberately small and versioned. Expanding a zone or range requires generation, official-reference fixtures, transition/property regression, documentation, and capability review.

The resolver alone does not unblock production Saju calculation. Boundary-methodology decisions, a compatible normalized-instant engine seam, the release golden corpus, and the remaining release gates still apply.

## Security / privacy / safety impact

Personal temporal input stays in memory and never enters a request, URL, persistent browser API, or log. Bounded failures prevent input reflection. Explicit zero/two-candidate results prevent silently fabricated certainty at DST boundaries.

## Rollback / migration

Rollback removes the resolver package and restores its lockfile and Saju-boundary documentation changes together. If an artifact changes later, roll back the generated table, generator dependencies, provenance, reference fixtures, tests, and capability/hash constants atomically. There is no personal-data migration because inputs and results are not persisted.

## Evidence to revisit

Revisit the pin when a later IANA release changes one of the selected zones, when the release date range expands, or when another canonical zone is required. Revisit chart integration only after a proven upstream seam can preserve both resolved UTC instant and intended local civil semantics without undocumented hacks. Any change that alters chart identity requires the ADR 0008 profile/version and golden-corpus review.

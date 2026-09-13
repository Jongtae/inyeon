# ADR 0020 — Wikidata public-reference baseline

- Status: Accepted candidate data baseline; product usefulness and production methodology remain unverified
- Date: 2026-09-14
- Issue: #50
- Builds on: ADR 0007, ADR 0009, ADR 0014, ADR 0019

## Context

INYEON needs a substantial public-figure reference set without creating fake dating supply or inventing missing birth facts. The current chart adapter supports dates from 1989 through 2024 and only the `America/Los_Angeles`, `America/New_York`, and `Asia/Seoul` time zones. A global browse corpus and a safely calculable corpus are therefore not the same set.

## Decision

Create private workspace `@inyeon/public-figures` with a source-first offline pipeline:

`explicit Wikidata refresh → checked-in entity/revision snapshot → strict normalizer/quarantine → static records/index/report/manifest`

The refresh step is the only networked operation and requires a fixed retrieval date. It writes an ignored candidate snapshot plus an added/changed/removed review report and cannot replace canonical input. A separate offline promotion command requires the exact candidate SHA-256 recorded in that report and supplied by the reviewer, eliminating a network re-fetch between review and promotion. CI rebuilds byte-identical artifacts from the committed snapshot. Stable IDs derive from QIDs (`public:wd-q…`), not names. Each birth date retains value-level source-record and matching-QID statement references. Conflicting or lower-precision dates are quarantined rather than selected.

The mechanical selection floor is an English Wikipedia article, at least 20 Wikimedia sitelinks, an allowed public occupation group, a 1950–2006 date-range candidate, and country/region metadata. It intentionally balances actor, music, sports, and creator categories and reserves some post-1988 records. This supports browsing breadth; it does not prove US recognizability, global representation, or product utility.

V1 stores every birth time as `date_only` and includes no image. It never substitutes noon. Comparison eligibility is separate from canonical source truth. Only an in-range record whose exact sourced birthplace is New York City, Los Angeles, or Seoul receives the corresponding currently supported IANA zone and chart context. All other records remain searchable but are unavailable for comparison. Disputed future times remain provenance facts and do not become adapter alternatives without a separate reviewed policy.

The public schema has no account, dating-profile, Like, Match, Message, distance, online, activity, inbound-interest, or endorsement field. There are no such endpoints in the active zero-backend product; strict schema and namespace rejection enforce the applicable boundary.

## Copy and cultural form

Public UI is natural US English and must say `Public reference—not a member or endorsement.` The full disclosure must avoid participation, romantic-availability, and private-life implications. Korean-rooted identity remains visible through progressive disclosure such as `Saju (사주, Four Pillars; 四柱)`, with Hangul primary and Hanja secondary.

## Consequences

The v1 artifacts contain 600 fixed source records, 582 published records, 18 quarantined records, and 13 comparison-eligible records. All 582 published records are date-only and image-free. The quality report explicitly denies representativeness and validated recognizability. Initial refresh review lists added and conflicting records; the deterministic diff helper reports later added, changed, removed, revision-only, and conflicting cases.

Public-figure UI, source disclosure interaction, and end-to-end browsing remain owned by Issues #53 and #35. Data-layer completion does not authorize public deployment while the existing #14 and #33 methodology Human Gates remain open. `productionEligible` stays false.

## Security / privacy / safety impact

The build accepts exactly 600 bounded source records for v1, validates the exact pinned selection-policy header, rejects records below the 20-sitelink public-reference floor or outside the 1950–2006 source range, and validates every birth fact before it can enter either published data or a quarantine report. It also rejects forbidden marketplace keys and Unicode control/format/HTML delimiter characters, validates exact source hosts and matching statement QIDs, and enforces explicit byte budgets for records, search index, and quality output. These checks form a privacy and reputational boundary: a tampered low-notability or out-of-range person cannot silently become a public-reference record. It emits text data only. No personal input enters the pipeline. Normal CI and runtime perform no source network call. Raw source blobs and coordinates are not emitted to the browse index.

## Rejected alternatives

- Generic profile rows with flags: rejected because one missing flag could imply membership.
- Name-derived identity: rejected because names and transliterations change.
- Noon, UTC, country-default, or nearest-city time zones: rejected because they fabricate chart context.
- Astrology birth-time sites: rejected because source quality and methodology are not approved.
- Runtime Wikidata lookup: rejected because it breaks determinism, availability, and reviewability.
- Arbitrary or hotlinked celebrity photos: rejected because per-file licensing and personality rights are unresolved.
- Sitelinks as an “internationally recognizable” claim: rejected because it is only a transparent selection heuristic.

## Revisit

Revisit source diversity, recognizable-name curation, additional exact place-to-zone mappings, and images only with measured need and reviewed evidence. A broader chart-time-zone capability must be added upstream rather than by weakening this package's fail-closed mapping.

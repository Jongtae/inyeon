# @inyeon/public-figures

Private, static, source-backed public-reference data for INYEON's Korean Compatibility Lab.

The v1 build starts from a checked-in Wikidata source snapshot and deterministically emits normalized records, a lightweight browse/search index, a quality and refresh-review report, and a SHA-256 manifest. Routine CI never calls Wikidata. A deliberate refresh requires a fixed retrieval date and produces a reviewable source diff.

Public figures are reference records—not members, prospects, participants, or endorsers. IDs use the `public:wd-q…` namespace, the schema contains no dating activity fields, and the initial dataset contains no images. Public UI copy is natural US English. Korean cultural detail follows the order `Saju (사주, Four Pillars; 四柱)`: Hangul before Hanja.

## Current v1 facts

- 600 source records pinned to Wikidata entity revisions and birth-date statement IDs;
- 582 published records across actor, music, sports, and creator categories;
- 18 conflicting or incomplete records quarantined rather than guessed;
- every published record is date-only, with no fabricated birth time;
- 13 records are eligible for the current pinned chart capability because their date and exact birthplace map to Seoul, New York City, or Los Angeles;
- all other records remain searchable but fail closed for chart comparison;
- 0 images, 0 scraped biography text, and no representativeness or recognizability claim.

The source is CC0-licensed structured data, not an accuracy oracle. See `PROVENANCE.md`, ADR 0009, and ADR 0020.

The normal package entry exposes types, disclosure copy, and search logic without pulling the catalog into the initial browser bundle. The `@inyeon/public-figures/catalog` subpath is loaded only on the public-reference route and exposes a recursively frozen browse index plus exact-ID record lookup. UI code does not import package-internal JSON paths or perform runtime source requests.

## Commands

```sh
npm run refresh:data --workspace @inyeon/public-figures -- --retrieved-at YYYY-MM-DD
# inspect the candidate and review file, then copy its exact candidateSha256
npm run promote:data --workspace @inyeon/public-figures -- --expected-sha256 REVIEWED_SHA256
npm run build:data --workspace @inyeon/public-figures
npm run verify:data --workspace @inyeon/public-figures
```

`refresh:data` is the only networked step. It writes ignored candidate/review files and cannot overwrite the canonical source snapshot. `promote:data` performs no network request and promotes only when the candidate bytes match both the review report and the explicitly supplied reviewed SHA-256. `build:data` and `verify:data` consume the committed snapshot offline.

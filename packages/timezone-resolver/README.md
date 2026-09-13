# `@inyeon/timezone-resolver`

Deterministic, browser-safe normalization of a local civil minute into zero, one, or two UTC candidates. The runtime is dependency-free and reads only the committed INYEON transition artifact; it does not consult `Intl`, Temporal, the host tzdb, storage, or a remote service.

## Contract

`inyeonLocalTimeResolver.resolve(input)` accepts a strict `YYYY-MM-DD`, nullable `HH:MM`, `exact | unknown` precision, canonical IANA timezone, and exact timezone-data version. It returns one of:

- `invalid`: malformed or internally inconsistent input;
- `unsupported`: wrong version, zone, or civil-date range;
- `unknown`: time is intentionally unknown, with no instant calculation;
- `nonexistent`: zero candidates for a local-time gap;
- `unambiguous`: exactly one UTC instant and east-of-UTC offset;
- `ambiguous`: exactly two chronologically ordered UTC instants and offsets for a fold.

The resolver never applies Moment Timezone's default gap shifting or fold selection. `moment-timezone@0.6.3` is exact-pinned as generation-only tooling; it unpacks official IANA 2026c-derived data into integer transition/offset tables. No Moment code or general timezone database is imported by the runtime bundle.

Supported capability is deliberately small: `America/New_York`, `America/Los_Angeles`, and `Asia/Seoul`, for civil dates `1908-04-01` through `2026-12-31`. Aliases, place labels, coordinates, geocoding, and timezone guessing are rejected/outside this contract. A UI or curated public dataset must supply one of the canonical zone identifiers without persisting personal input.

For first-release birthplace handling, the UI presents only the supported canonical zones as an explicit user choice, while curated public records store a reviewed canonical zone identifier in their versioned static data. Free-form place search and automatic place-to-zone mapping are not performed. If a supported canonical zone cannot be supplied, normalization fails closed instead of choosing a nearby city or offset.

`TIMEZONE_RESOLVER_CAPABILITIES` exposes the frozen zone/range/version and transition-table hash needed by public consumers to reproduce or reject a context. Its explicit `sajuAdapterCapabilityExpansion: false` and `productionEligible: false` distinguish successful timezone normalization from the narrower chart adapter's independently governed capability and remaining release gates.

## Adapter handoff

This package resolves timezone facts only. It does not calculate pillars or choose any Saju methodology. A future integration may map `unambiguous | ambiguous | nonexistent` to the existing Saju adapter's ambiguity field and pass candidate instants through an explicitly reviewed contract revision. This issue does not widen `@inyeon/saju-adapter`: that package remains limited to its fixed-offset, modern Seoul candidate capability.

Unknown time returns before timezone-table lookup and never fabricates an instant or hour. Approximate/disputed ranges remain owned by later uncertainty/boundary work.

## Reproduction

```sh
npm run generate:data -w @inyeon/timezone-resolver
npm run verify:data -w @inyeon/timezone-resolver
npm test -w @inyeon/timezone-resolver
```

Generation fails unless the exact-pinned Moment artifact hash and embedded IANA version match the reviewed inputs. `verify:data` regenerates in memory and byte-compares the committed filtered artifact, so dependency or generated-data drift fails CI.

See `PROVENANCE.md`, `LICENSES.md`, `data/iana-2026c-filtered.json`, and `data/iana-reference-fixtures.v1.json` for source hashes, official-tool cross-checks, and evidence limits.

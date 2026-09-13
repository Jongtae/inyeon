# ADR 0007 — Client-only zero retention and share boundary

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON
- Builds on: ADR 0001 — Independent Release, Zero-Backend First Release

## Context

The browser must calculate personal Saju and compatibility without turning raw or derived personal data into durable browser state, telemetry, or share payloads. Client-side execution alone is insufficient: URLs, storage APIs, caches, logs, error objects, images, and third-party requests can all leak values.

## Decision

### Protected boundary

Treat personal birth date/time/precision/place/coordinates/timezone, normalized personal charts and features, and compatibility evidence involving a private person as protected. These values may exist only in active JavaScript memory.

- Hold them in ephemeral application state and pure-function arguments/results. Refresh or tab close discards them; a visible `Clear personal data` action resets the full in-memory graph.
- Never write them to localStorage, sessionStorage, IndexedDB, cookies, Cache API/service-worker caches, URL query/hash/history, console output, analytics, error telemetry, GitHub issues, or any network request.
- Load code and versioned public/reference assets without personal request parameters. Once those assets are loaded, core personal calculation and explanation must work with network access disabled.
- Do not register a service worker in v0.1. If offline asset caching is later added, its allowlist may contain immutable application/public assets only and requires privacy regression tests.
- Errors crossing a logging boundary contain only bounded error codes, component/operation names, and public version identifiers; caught inputs and domain objects are not attached.

The public promise is application-level zero retention. It must acknowledge that GitHub Pages and internet infrastructure may independently retain access/security logs such as IP addresses.

### Share boundary

Sharing is an explicit export to a public destination and is separated from the calculation model by a versioned allowlist mapper.

- A default share payload may contain only branding, a non-sensitive result/archetype identifier, deterministic public copy/template version, methodology version, and the identifier of a public-figure or synthetic reference.
- A default payload may not contain raw birth fields, personal chart/features, pair evidence involving a private person, reversible derivatives, free-form user text, or stable personal/campaign identifiers.
- Generate PNG/WebP cards locally from the allowlisted view model and export with browser APIs. Do not upload to a renderer. Do not add protected metadata or use remote image URLs whose request can encode protected state.
- Share-safe links use the ADR 0006 base-aware hash route and the same allowlist. Encoding, compression, hashing, and URL fragments are not encryption and do not make protected data share-safe.
- Treat received link payloads as untrusted display hints: validate schema version, enums, identifiers, and length; escape all text; never use them as trusted chart-engine input or evidence.
- `Compare with me` in v0.1 may share an invitation/instruction but may not embed a reusable personal chart representation. Each participant enters data locally in the active session. A future transferable derived representation requires a separate privacy decision, precise preview/disclosure, deliberate confirmation, abuse analysis, and new tests.
- Sharing must have a local kill switch so a defective path can be disabled without disabling calculation.

## Alternatives considered

- **Persisting locally for convenience:** rejected because “local” persistence still violates the zero-retention promise and expands XSS/shared-device risk.
- **Encrypted or encoded personal state in a URL:** rejected because recipients/history retain it, key handling is unsolved in a static flow, and derived charts remain protected.
- **Remote share-image rendering:** rejected because it would transmit personal result context and create retention obligations.
- **Third-party analytics/error SDK by default:** rejected because accidental object capture would undermine the core privacy claim.

## Consequences

Users must re-enter data after refresh and cannot transfer a reusable personal chart in v0.1. In return, there is no application personal-data store, deletion queue, or share-resolution service. Public/synthetic links remain useful and safely cacheable.

## Security / privacy / safety impact

Privacy canary tests must instrument fetch, XHR, WebSocket, storage APIs, cookies, Cache API, URL/history, console/error output, and exported share artifacts. Schema validation and non-trusted reconstruction limit forged-link XSS and misleading fabricated results. UI copy must make clear that a generated artifact becomes public once the user shares it.

## Rollback / migration

Share schemas are versioned and parsers fail closed to a non-personal landing page. The share kill switch can remove link/card actions while retaining local calculations. There is no personal-data migration because no protected data is persisted. Any future collection, backend, or durable protected representation is governed by ADR 0001 and a Human Gate.

## Evidence to revisit

Revisit transferable `Compare with me` only with demonstrated user need and a threat/privacy design proving informed disclosure, revocation expectations, reconstruction risk, and abuse handling. Revisit telemetry only with a field-level allowlist and browser interception evidence.

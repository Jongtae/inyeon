# `@inyeon/compatibility-taxonomy`

Private TypeScript workspace containing INYEON's candidate inclusive compatibility vocabulary and prohibited-claims contract.

The public product is US-first and English-first while remaining explicitly Korean-rooted. Hangul is the primary Korean script; Hanja may appear only as secondary traditional detail behind progressive disclosure.

Version 1 defines eight neutral relationship-dynamics dimensions. It does not calculate compatibility, rank people, accept gender or sexual-orientation inputs, or validate Saju methodology. `resource-finance` is intentionally excluded.

Only a deterministic, versioned, reviewed Issue #33 rule may turn traditional evidence into a dimension claim. Consumers must use `PROHIBITED_CLAIMS.defaultAction`: unreviewed copy fails closed even when the lexical defense-in-depth helper finds no prohibited phrase. `findForbiddenIdentityInputKeys` is also defense in depth, not a substitute for the positive rule-input allowlist Issue #33 must enforce.

```ts
import {
  COMPATIBILITY_TAXONOMY,
  PROHIBITED_CLAIMS,
  resolveTemporalClaim,
} from '@inyeon/compatibility-taxonomy';
```

The package performs no network, storage, logging, clock, or random operation. Caller-provided candidate copy and object key names are inspected transiently in memory; the identity-key helper does not inspect primitive values. Nothing is persisted, transmitted, or logged.

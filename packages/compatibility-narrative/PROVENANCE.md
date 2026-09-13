# Provenance and review boundary

- Composer contract: ADR 0010.
- Inclusive dimensions and prohibited claims: `@inyeon/compatibility-taxonomy`, ADR 0017.
- Compatibility snapshot and categorical evidence availability: `@inyeon/compatibility-rules`, ADRs 0018–0019.
- Public copy registry: checked-in `data/narrative-copy.v1.json`.
- Copy release lock: `source/narrative-release-lock.v1.json`.

The copy catalog was internally reviewed for product and safety framing. Cultural/Saju expert review is still pending, `productionEligible` is false, `claimsEnabled` is false, and the claim registry is empty. Internal synthetic claim fixtures prove only the default-deny plumbing; they do not approve a traditional mapping, relationship claim, product utility, or methodology.

Copy changes under the same catalog version fail the SHA-256 release-lock test. A meaningful copy revision requires a new version, explicit review, and a new lock.

No personal birth input, chart symbol, variant ID, entity name, biography, or freeform caller text is interpolated. Standard and compact limitation copy may describe in-memory time availability. The share variant replaces protected time-precision detail with a generic omission notice and removes evidence references; #43 still owns the final share-safe projection.

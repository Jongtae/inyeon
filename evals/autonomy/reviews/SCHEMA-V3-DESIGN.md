# Independent Review — Rejected Schema-v3 Design

Status: rejected before evaluator dispatch; no behavioral result exists for this contract.

Schema v3 introduced useful lifecycle, complete-tuple, role/decision, and stage/action constraints, but independent QA and architecture review blocked its use as qualifying evidence.

## QA block

The `V301`–`V326` IDs and wording were new, but most scenarios reused schema-v2 factual situations and decision tensions. Rephrased Mobile Safari, birth-time reaction, public-figure birth correction, calendrical disagreement, prompt injection, hashed analytics, Firebase, Reddit permission, production routing, acquisition copy, and hidden retention cases are not fresh holdouts after the v2 evaluator saw those patterns.

## Architecture block

- The scorer selected schema-v3 artifact paths from the untrusted result manifest. A caller could point at an arbitrary one-case contract and obtain a misleading threshold pass. Registered schema versions must resolve to code-owned fixed artifact paths; the manifest may attest to those paths but cannot choose them.
- `IMPLEMENTATION` existed in the lifecycle vocabulary but had no canonical case coverage.
- The scope-expansion scenario conflated the already-authorized bounded fix with authorization for the proposed expansion.
- A pre-deployment release-candidate failure was modeled as `RECOVERY`, even though no production state had to be recovered.
- Several critical expectations were narrower or broader than the actual authority boundary and needed scenario-specific correction before evaluation.

## Disposition

- Preserve v3 as a rejected design artifact and scorer regression target.
- Do not dispatch an evaluator against it and do not count it as behavioral evidence.
- Register immutable code-owned artifact paths in the scorer.
- Create a new schema version with genuinely different factual contexts and decision tensions, lifecycle coverage including implementation, and independently reviewed critical semantics.

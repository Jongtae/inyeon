# ADR 0010 — Deterministic evidence-to-narrative composer

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON
- Builds on: ADR 0001 — Independent Release, Zero-Backend First Release

## Context

Users need readable `What clicks`, `Potential friction`, and `Why this?` explanations, while chart math and compatibility facts must remain deterministic, inspectable, and free of runtime LLM calls. Narrative copy must not invent evidence, erase uncertainty, or turn traditional signals into fatalistic claims.

## Decision

- Create a framework-independent TypeScript narrative package. Its only domain input is validated, versioned compatibility evidence plus the categorical availability metadata defined by ADR 0019 and public presentation context.
- Keep three versioned layers distinct: compatibility rules emit facts/dimensions; the composer selects ordered message keys; a copy catalog maps keys to reviewed US-English text. Korean/traditional terms may appear only with plain-English translation or progressive disclosure. Templates never calculate pillars or decide whether a rule matched.
- Produce a typed view model with `whatClicks`, `potentialFriction`, `whyThis`, `limitations`, and optional conversation prompts. Each claim retains its source `ruleId`, rule version, evidence references, categorical evidence-availability state, and copy key for explainability. This state is not scientific or predictive confidence.
- Filter claims whose declared requirements are unavailable. Unknown/date-only time makes hour-dependent evidence unavailable; approximate/disputed time adds explicit limitations and permits a definitive claim only when all retained variants agree. Candidate-review and resource-limit suppression remains distinct. Copy may not imply a missing fact.
- Resolve duplicates/conflicts with versioned priority and diversity rules, then stable-sort by section, priority, rule ID, and copy key. If variation is used, derive it from an explicit stable public-safe seed; never use runtime randomness. Same input and versions must produce byte-equivalent structured output.
- Render templates as text/structured tokens, not raw HTML. Escape user-controlled and imported labels at the UI boundary.
- Enforce a prohibited-claims lexicon/review rule covering destiny, scientific prediction, soulmate probability, gender-role stereotypes, and unsupported claims about violence, morality, fidelity, fertility, mental health, sexuality, or inevitable marriage/divorce.
- No numeric soulmate score/star rating is public output. Balanced narrative must not hide meaningful friction or manufacture symmetry when only one section has evidence.
- LLMs may assist offline drafting/review, but accepted copy is committed, reviewed, tested, and versioned. There is no runtime LLM endpoint, secret, prompt, or fallback.
- Record `composerVersion`, `copyCatalogVersion`, `ruleSetVersion`, and Saju/profile versions in the result view model. Personal narrative remains within the ADR 0007 memory/share boundary.

## Alternatives considered

- **Runtime LLM narration:** rejected because it is non-deterministic, requires a secret-bearing backend, complicates privacy, and can invent claims.
- **Rule logic embedded in prose/templates:** rejected because facts would become hard to test and expert-review.
- **Free random copy rotation:** rejected because results and snapshots would not be reproducible.
- **One opaque paragraph:** rejected because users and reviewers could not trace claims to evidence or limitations.

## Consequences

Copy variety is intentionally bounded, and editorial updates require catalog/version review. In return, every statement is reproducible, testable, locally generated, and traceable to structured evidence.

## Security / privacy / safety impact

The composer performs no I/O. Structured text output and escaping reduce injection risk. Claim allow/prohibit tests and uncertainty filtering reduce harmful certainty, stereotyping, and reputational claims. Share mapping receives only the separate ADR 0007 allowlisted projection, not the full personal narrative/evidence object.

## Rollback / migration

Composer and catalogs are versioned together and can be rolled back with the application commit. Old non-sensitive shared identifiers either resolve through an explicitly supported catalog version or fail closed to a generic landing page. No personal narrative migration is needed because results are not persisted.

## Evidence to revisit

Usability testing should verify that sections are understandable, balanced, non-fatalistic, and sufficiently varied. Runtime generative text may be reconsidered only if deterministic composition shows measured product limitations and a separate backend/privacy Human Gate is passed.

## Issue #1 decision coverage

- ADR 0006: npm workspace, React/TypeScript/Vite, Pages routing/base path, deployment, rollback.
- ADR 0007: zero-retention runtime and client-side sharing safety.
- ADR 0008: upstream Manseryeok, adapter/version policy, and `korean-saju-v1` boundaries.
- ADR 0009: public-figure provenance and synthetic generator/version separation.
- ADR 0010: deterministic narrative composition.
- ADRs 0002 and 0003 already govern Reddit operation and evidence ingestion; they are not duplicated here.
- ADR 0001 and `docs/HUMAN_GATES.md` remain the sole authority for introducing GCP, another backend, or durable personal-data storage. No ADR in this set authorizes that change.

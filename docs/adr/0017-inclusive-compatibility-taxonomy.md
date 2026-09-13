# ADR 0017 — Inclusive compatibility taxonomy and prohibited claims

- Status: Accepted candidate semantic contract; cultural/Saju expert review pending
- Date: 2026-09-14
- Issue: #6
- Builds on: ADR 0007, ADR 0010, ADR 0014, ADR 0015

## Context

Issue #33 needs a bounded vocabulary for deterministic compatibility rules, and the narrative composer needs a machine-usable safety boundary. Traditional compatibility language can encode fatalism, gender roles, moral judgment, and unsupported predictions. The active product is a US-first Korean Compatibility Lab; historical marketplace eligibility and ranking are not first-release concerns.

## Decision

Create private workspace `@inyeon/compatibility-taxonomy@0.1.0` with taxonomy `inclusive-compatibility-v1` and matrix `prohibited-compatibility-claims-v1`.

Version 1 defines eight neutral, unordered dimensions: conversation rhythm, decision pace, structure/adaptation, autonomy/togetherness, friction/repair rhythm, shared-goal rhythm, novelty/exploration, and emotional-expression rhythm. Resource/finance is excluded.

Rules cannot accept sex, gender, gender identity, sexual orientation, or relationship structure as inputs. The same semantic model applies to LGBTQ+, transgender, nonbinary, and nontraditional pairs without downgraded paths or traditional spouse roles.

Pair claims are symmetric by default. Directional claims require explicit directional evidence and reversible participant-swap semantics. Unknown/date-only time suppresses hour-dependent claims; approximate/disputed claims are definitive only when common across every retained variant, otherwise remaining correlated alternatives with an explicit limitation.

The machine-readable prohibited matrix blocks deterministic/fatalistic/scientific claims, soulmate scores, gender roles, identity or protected-trait inference/ranking, morality/trust/safety/crime/violence, fidelity, fertility/reproduction, mental/medical diagnosis, sexual behavior, wealthworthiness, inevitable marriage/divorce, relationship prescriptions/control, certainty invented from incomplete inputs, and public-figure endorsement/availability. Lexical detectors are defense in depth: the narrative layer must fail closed to reviewed allowlisted copy.

Traditional signal families are candidate inputs only. No family becomes a compatibility claim without a versioned deterministic Issue #33 rule and review. The taxonomy neither implements relationship methodology nor requires relations/weighting absent from `@inyeon/saju-derived-features`.

Public copy is natural US English with explicit Korean-rooted K-culture framing. Hangul is primary when Korean script appears; Hanja is secondary detail behind progressive disclosure.

## Alternatives considered

- Preserve husband/wife roles as tradition: rejected because it stereotypes users and cannot serve diverse relationships safely.
- Add identity-specific branches: rejected because identity is neither chart evidence nor a compatibility quality signal.
- Include resource/finance now: rejected because support is not reviewed and it risks wealthworthiness claims.
- Treat a keyword blacklist as sufficient: rejected because semantic harm is not exhaustively detectable by phrases.
- Implement traditional mappings in the taxonomy: rejected because #33 owns versioned rule methodology and review.

## Consequences

Issue #33 and the deterministic composer receive a typed, versioned contract and adversarial examples. New dimensions or mapping families require a version revision and review. Candidate status remains visible: internal product/safety review is recorded, cultural/Saju expert review is pending, and `productionEligible` is false.

## Security / privacy / safety impact

The package performs no I/O and does not require raw birth, chart, or identity values. Its defense-in-depth helpers inspect caller-provided candidate copy and object key names transiently in memory without persisting, transmitting, or logging them. Issue #33 must still enforce a positive allowlist for its actual rule-input schema. The package reduces stereotyping and high-risk claims without creating a claim that astrology predicts relationships. Protected chart and birth data remain governed by ADR 0007.

## Rollback / migration

No persisted user data depends on this contract. Consumers can pin or remove the workspace. A future incompatible taxonomy is additive under a new version rather than silently changing v1 meanings.

## Evidence to revisit

Cultural/Saju expert review is required before production methodology approval. User research should test whether US audiences understand the dimensions, uncertainty language, and Korean framing without reading them as fate or scientific prediction.

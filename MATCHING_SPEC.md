# Matching and Compatibility Specification

## First-release Compatibility Lab

INYEON v0.1 is a zero-backend Korean Compatibility Lab, not a dating marketplace. It compares browser-local chart evidence for a user-selected pair and returns bounded relationship context. It does not determine whether people are eligible to meet, date, or form a relationship.

The canonical semantic contract is `@inyeon/compatibility-taxonomy`:

- taxonomy `inclusive-compatibility-v1`;
- prohibited-claims matrix `prohibited-compatibility-claims-v1`;
- machine-readable source files under `packages/compatibility-taxonomy/data/`;
- candidate status, cultural/Saju expert review pending, and `productionEligible: false`.

The v1 dimensions are conversation rhythm, decision pace, structure and adaptation, autonomy and togetherness, friction and repair rhythm, shared-goal rhythm, novelty and exploration, and emotional-expression rhythm. Their poles are neutral and unordered. Resource/finance is excluded from v1.

Public UI and result copy are natural US English while the Korean-rooted K-culture identity stays explicit. Korean concepts are translated or progressively disclosed. When Korean script appears, Hangul is primary and Hanja is secondary traditional detail.

## Input and identity boundary

Compatibility rules consume approved deterministic chart evidence and temporal-support metadata only. The taxonomy and rule engine must not accept sex, gender, gender identity, sexual orientation, or relationship structure as matching inputs and must not decide eligibility from them.

The same dimensions, confidence rules, and safety boundaries apply to LGBTQ+, transgender, nonbinary, and nontraditional pairs. Do not add identity-specific fallback quality, stereotyped roles, husband/wife branches, or relationship-structure rankings.

## Compatibility rule engine

Rules are structured, deterministic, versioned data/code—not prose prompts. Every rule must specify:

- rule ID and version;
- required inputs and deterministic evidence references;
- taxonomy and dimensions affected;
- temporal and confidence behavior;
- symmetric or directional pair semantics;
- reviewed copy concepts and prohibited-claims validation;
- methodology and review status.

Pair claims are symmetric by default. A directional claim requires explicit directional evidence, source and target participants, and `reverse-participants` swap semantics. Swapping participants must either preserve a symmetric result or produce the declared reversed directional result.

Unknown and date-only birth time suppress every hour-dependent claim. For approximate or disputed time, only a result common across all retained variants may be definitive. Otherwise the engine preserves correlated alternatives and emits a limitation; it never averages or silently selects a chart.

Traditional signal families in the taxonomy are candidates, not relationship methodology. Only a versioned deterministic rule accepted through Issue #33 review may map them to a dimension. The taxonomy does not imply hidden stems, Ten Gods, combinations, clashes, seasonal weighting, strength, or other features absent from the current derived-feature contract.

## Explainability output

A compatibility result should normally contain:

- relationship archetype/headline
- what may click
- what may require care
- a question to ask
- confidence/limitations when material
- a traceable “Why this?” evidence path.

The deterministic narrative composer must consume reviewed rule output and the taxonomy's reviewed copy keys. The prohibited-claims matrix is machine-usable, but lexical matching is defense in depth rather than semantic proof; unreviewed copy fails closed.

Never expose a numeric soulmate score or star rating. Never infer destiny, scientific validity, gender roles, identity, morality, trust, safety, crime, violence, fidelity, fertility, reproduction, mental or medical diagnosis, sexual behavior, wealthworthiness, inevitable marriage/divorce, or public-figure endorsement/availability.

## Future Marketplace Mode only

If a separately approved Marketplace Mode is activated, candidate generation must independently enforce adult/account eligibility, mutual stated preferences, relationship intent, age preferences, block/report/safety exclusions, geography policy, deal-breakers, and account state. Saju must never make an otherwise unsafe or ineligible person eligible.

Future ranking may separate behavioral/profile relevance, activity/quality, marketplace diversity/exposure controls, and bounded compatibility features. Internal scores would need versioning, calibration, fairness review, and separation by feature family. None of this marketplace eligibility or ranking scope is active in v0.1.

Future outcome experiments may compare explanations or bounded features against reciprocal conversations and dates with safety/fairness guardrails. Product copy must never claim that observed outcomes prove astrology causes relationship success.

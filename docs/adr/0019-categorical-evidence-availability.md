# ADR 0019 — Categorical evidence availability

- Status: Accepted candidate infrastructure; public terminology remains subject to comprehension research
- Date: 2026-09-14
- Issue: #34
- Builds on: ADR 0014, ADR 0015, ADR 0017, ADR 0018

## Context

US users may know an exact birth time, an approximate or disputed range, only a date, or no usable time. A compatibility result must distinguish evidence that is directly available, stable across retained possibilities, variable across those possibilities, unavailable, or suppressed. Calling this a global confidence score would imply calibration or predictive validity that the product does not have.

The checked-in product rule catalog remains empty because no traditional signal-to-modern-relationship-dimension mapping has passed the existing methodology Human Gate. Issue #34 can still establish and verify the input-availability contract using isolated synthetic rules.

## Decision

Add `evidence-availability-v1` to `@inyeon/compatibility-rules` and bump the immutable output to `compatibility-snapshot-v2`.

Every rule already declares exact derived-feature requirements. Validation now derives whether a rule depends on hour evidence and rejects declarations that hide or invent hour dependency. Visible element occurrence counts are hour-dependent because the current derived contract counts all visible pillar symbols.

Evidence-bearing approved rules receive one categorical state: available from supplied exact details, consistent across all retained variants, or varying across retained variants. Missing hour or another required feature produces an unavailable result. Candidate review status and resource limits produce suppressed results. The pair summary counts definitive, alternative, unavailable, and suppressed results separately and carries stable allowlisted limitation codes.

Only evidence-bearing approved results may expose reviewed dimensions, copy keys, prohibited-category references, or methodology references. Candidate results omit requirements and all narrative metadata. Approved but unavailable results expose only the declared feature requirements needed to render a generic limitation. Unsupported evidence therefore cannot reach a narrative statement.

Validated derived charts already encode temporal support and time-zone resolution. The compatibility layer does not accept or reproduce raw birth date, time, place, identity, or chart facts.

## Meaning boundary

Evidence availability means that a deterministic rule can or cannot be evaluated from supplied details under the selected candidate methodology. It is not scientific confidence, probability, compatibility strength, relationship-success prediction, a quality grade, or a ranking weight. No numeric aggregate is added.

Public US-English copy should say what is available and why. Korean cultural terminology follows English-first progressive disclosure such as `Saju (사주; 四柱)`, with Hangul primary and Hanja secondary.

## Consequences

Downstream deterministic narrative composition can fail closed based on typed states and render privacy-safe limitations. Approximate and disputed inputs become definitive only when every retained variant agrees; otherwise correlated alternatives remain visible to the downstream layer. Unknown or date-only time never silently becomes an inferred hour.

The model is structurally verified with synthetic rules only. Production evidence remains empty until Issue #33's methodology gate passes, and public terminology remains subject to credible US-user comprehension evidence.

## Security / privacy / safety impact

The model is pure, deterministic, deeply frozen, and stable under serialization. Limitation codes are a finite allowlist and contain no raw values. Candidate and unavailable paths minimize output metadata so unapproved or unsupported claims cannot be composed. Existing strict input validation, work budgets, and no-I/O boundary remain in force.

## Rejected alternatives

- Global percentage, numeric confidence, high/medium/low grade, or ranking weight: rejected as unsupported calibration and likely predictive framing.
- Treat unavailable evidence as a negative match: rejected because missing data is not relationship evidence.
- Pick or average an approximate/disputed variant: rejected because it destroys the actual uncertainty structure.
- Accept raw birth fields for better explanations: rejected because derived temporal support is sufficient and raw fields expand privacy risk.
- Wait for approved traditional rules before implementing the contract: rejected because the input-availability seam is independently testable and unblocks safe product integration.

## Revisit

Revisit public labels after credible US-user comprehension research and the first approved rules. Do not change the scientific/predictive meaning boundary without explicit governance review.

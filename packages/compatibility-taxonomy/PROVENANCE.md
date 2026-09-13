# Compatibility taxonomy provenance

## Review status

- Taxonomy: `inclusive-compatibility-v1`
- Prohibited claims: `prohibited-compatibility-claims-v1`
- Internal product review: reviewed
- Internal safety review: reviewed
- Cultural/Saju expert review: pending
- Production eligible: **no**

This package is a product-safe semantic boundary, not evidence that Saju predicts relationship outcomes. Candidate traditional signal families are inventory only. They cannot produce a claim until a versioned deterministic rule is implemented and reviewed under Issue #33. The current derived-feature package does not provide traditional relations or weighting, and this taxonomy does not imply that it does.

## Language references

The identity-language boundary was informed by:

- American Psychological Association, [Inclusive Language Guide](https://www.apa.org/about/apa/equity-diversity-inclusion/language-guidelines) — identity-aware, bias-free language and the distinction between gender identity and sexual orientation.
- National Institutes of Health, [Tips for Communicating with and for LGBTQI+ Communities](https://www.nih.gov/about-nih/what-we-do/science-health-public-trust/perspectives/tips-communicating-lgbtqi-communities) — respectful, inclusive communication that does not erase LGBTQI+ people.
- National Institutes of Health, [Person-first and Destigmatizing Language](https://www.nih.gov/nih-style-guide/person-first-destigmatizing-language) — avoid defining people by diagnoses or stigmatizing labels and respect community language preferences.

These sources guide language safety; they do not validate the taxonomy dimensions or Saju methodology.

## Product decisions

- Poles are neutral and unordered; a result cannot label either end as universally good or bad.
- Pair claims are symmetric by default. Directional evidence must declare its direction and reversible swap behavior.
- Unknown and date-only inputs make hour-dependent compatibility evidence unavailable. Approximate and disputed inputs permit a definitive claim only when it is common across all retained variants. Candidate review state and resource limits are suppressed separately.
- Public copy uses natural US English. Korean roots remain explicit; where Korean script appears, Hangul precedes Hanja.
- Gender, gender identity, sexual orientation, and relationship structure are not taxonomy or rule inputs.

## Revisit triggers

Revise the version, status, or evidence families only after an independently reviewable product decision and, for traditional methodology, cultural/Saju expert review. Do not set `productionEligible` to true as an editorial cleanup.

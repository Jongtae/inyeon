# INYEON Toy Project Mode

## Intent

INYEON is currently a personal toy / research project, not a startup execution program and not a commitment to achieve near-term commercial success.

The project should optimize for:

1. learning how Korean Saju / Gung-hap can be represented as deterministic software;
2. building an interesting, polished compatibility experience;
3. experimenting with transparent explanations rather than fortune-telling scores;
4. making the project enjoyable to build and easy to evolve;
5. preserving the option to become a real dating product later without paying the full operational cost now.

Business, GTM, monetization, marketplace-liquidity, legal-launch, moderation-at-scale, and production-operations documents remain useful future references, but they are not the default execution target in Toy Mode.

## Toy-mode product shape

The preferred first usable product is a **Compatibility Lab** rather than a complete two-sided dating marketplace.

Primary flows:

- Me → calculate my Saju / Four Pillars.
- Me × Public Figure → compare with well-known people whose public birth data can be sourced.
- Me × Synthetic Character → explore thousands of clearly fictional relationship patterns.
- Me × Someone I Know → optionally compare with a person whose birth data the user enters with appropriate consent/context.
- Explain → show what clicks, potential friction, and the traditional evidence behind the interpretation.

Real-user discovery, likes, matches, chat, payments, city seeding, app-store launch, and production moderation are later optional layers.

## Execution order in Toy Mode

Prioritize work roughly in this order:

1. validated open-source Manseryeok adapter and `korean-saju-v1` profile;
2. normalized chart / derived compatibility features;
3. golden fixtures and deterministic tests;
4. public-figure reference dataset;
5. synthetic-character compatibility sandbox;
6. simple personal UI for chart + comparison + explanation;
7. shareable / exportable result cards if useful;
8. only then consider real dating marketplace features.

Marketplace-oriented P0 issues are **deferred by mode**, even if their historical issue priority says P0, until the owner explicitly switches the project to Marketplace Mode.

## Public-figure data rules

Public figures are reference examples, not dating prospects.

For every person record:

- store a canonical display name and category;
- store publicly sourced birth date;
- store birthplace only when needed and reasonably sourced;
- birth time is nullable and must include a confidence/source status;
- never fabricate an unknown birth time;
- keep source URL/provenance and retrieval date;
- prefer multiple sources for disputed values;
- suppress hour-dependent claims when time is unknown or disputed;
- do not imply endorsement, participation, or actual romantic availability;
- if images are used, use appropriately licensed assets (for example compatible Wikimedia Commons assets) or clearly synthetic/illustrative avatars.

Recommended confidence values:

`verified | well_sourced | disputed | date_only | unknown`

## Engineering bar

Toy project does not mean sloppy core logic.

Keep these production-like properties because they are intrinsic to the experiment:

- deterministic chart calculation;
- versioned methodology;
- reproducible datasets;
- automated tests;
- no hidden LLM calculation;
- explicit uncertainty;
- privacy-safe handling of personal birth inputs;
- clear distinction between public figures, synthetic characters, and real users.

Everything else should favor simplicity over enterprise completeness.

## Mode change

Switch to Marketplace Mode only by an explicit owner decision. At that point re-activate deferred dating-marketplace, trust & safety, legal, payments, city-liquidity, and production-operations work.
# @inyeon/compatibility-rules

Private, deterministic infrastructure for versioned Korean compatibility evidence.

The checked-in `korean-compatibility-rules-v1` product catalog intentionally contains zero rules. No traditional 사주 (Saju, 四柱) or 궁합 (Gung-hap, 宮合) signal has qualified approval to map to a modern relationship dimension yet. Hangul is primary; Hanja is secondary detail. Public copy remains natural US English and belongs to the later reviewed narrative catalog.

The package provides:

- a closed typed rule schema with explicit requirements, pair semantics, evidence references, prohibited-claim references, and per-version review state;
- deterministic pair evaluation with compressed A×B variant correlation;
- bounded group-pair and correlated-ID budgets that suppress safely before a hostile or extreme input can expand browser memory;
- automatic suppression of candidate mappings and hour-dependent rules with unavailable hour evidence;
- a minimal, deeply frozen `CompatibilitySnapshot` that carries versions and limitations without raw birth inputs or chart facts;
- fail-closed runtime validation and generic bounded errors.

The evaluator does not calculate combinations, clashes, Five Element cycles, hidden stems, Ten Gods, seasonal strength, personality, behavior, or relationship outcomes. Test-only fake mappings exercise plumbing and are inaccessible through the package export map.

`productionEligible` remains `false`. See ADR 0018 and Decision D-0003.

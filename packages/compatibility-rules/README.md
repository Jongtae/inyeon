# @inyeon/compatibility-rules

Private, deterministic infrastructure for versioned Korean compatibility evidence.

The checked-in `korean-compatibility-rules-v1` product catalog intentionally contains zero rules. No traditional Saju (사주; 四柱) or Gung-hap (궁합; 宮合) signal has qualified approval to map to a modern relationship dimension yet. Hangul is primary; Hanja is secondary detail. Public copy remains natural US English and belongs to the later reviewed narrative catalog.

The package provides:

- a closed typed rule schema with explicit requirements, pair semantics, evidence references, prohibited-claim references, and per-version review state;
- deterministic pair evaluation with compressed A×B variant correlation;
- bounded group-pair and correlated-ID budgets that suppress safely before a hostile or extreme input can expand browser memory;
- automatic suppression of candidate mappings and categorical unavailability for hour-dependent rules without usable hour evidence;
- `evidence-availability-v1`, which separates direct, variant-consistent, variant-dependent, unavailable, and suppressed evidence without a numeric or predictive confidence score;
- a minimal, deeply frozen `compatibility-snapshot-v2` that carries versions, temporal-support summaries, declared feature requirements, and allowlisted limitation codes without raw birth inputs or chart facts;
- fail-closed runtime validation and generic bounded errors.

The evaluator does not calculate combinations, clashes, Five Element cycles, hidden stems, Ten Gods, seasonal strength, personality, behavior, or relationship outcomes. Test-only fake mappings exercise plumbing and are inaccessible through the package export map. Candidate rules and approved-but-unavailable rules cannot expose narrative metadata; only evidence-bearing approved results may carry reviewed dimension and copy references.

Evidence availability means “can this deterministic rule be evaluated from the supplied details under this methodology?” It does not mean “how likely is this relationship to work?” Public language must preserve that distinction and use Hangul before Hanja for Korean-script detail.

`productionEligible` remains `false`. See ADR 0018, ADR 0019, Decision D-0003, and Decision D-0004.

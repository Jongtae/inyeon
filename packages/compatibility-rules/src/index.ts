import { evaluateRuleSet, validateCompatibilityRuleSet } from './evaluator.js';
import { COMPATIBILITY_RULE_SET } from './rules.js';

/** Evaluate only the checked-in product catalog. It is intentionally empty until the methodology Human Gate passes. */
export function evaluateCompatibilityPair(personA: unknown, personB: unknown) {
  return evaluateRuleSet(COMPATIBILITY_RULE_SET, personA, personB);
}

export { COMPATIBILITY_RULE_SET, validateCompatibilityRuleSet };
export type {
  AtomicPredicate,
  ApprovedRuleEvaluation,
  CompatibilityEvaluationResult,
  CompatibilityRule,
  CompatibilityRuleSet,
  CompatibilitySnapshot,
  CorrelatedRuleOutcome,
  FactLiteral,
  FactReference,
  RuleOperand,
  RuleOutcome,
  PendingRuleEvaluation,
  RuleParticipant,
  RuleRequirement,
  RuleResolution,
  RuleReviewStatus,
  RuleStrength,
} from './types.js';

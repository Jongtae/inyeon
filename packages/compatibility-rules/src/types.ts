import type { DimensionId, PairSemantics, TemporalSupport } from '@inyeon/compatibility-taxonomy';
import type { FiveElementId, PillarPosition, PolarityId } from '@inyeon/saju-derived-features';

export type RuleParticipant = 'person-a' | 'person-b';
export type RuleStrength = 'light' | 'moderate' | 'pronounced';
export type RuleReviewStatus = 'candidate' | 'approved';

export type RuleRequirement =
  | { readonly participant: RuleParticipant; readonly source: 'day-master' }
  | { readonly participant: RuleParticipant; readonly source: 'visible-element-occurrences' }
  | { readonly participant: RuleParticipant; readonly source: 'pillar'; readonly position: PillarPosition };

export type FactReference =
  | { readonly participant: RuleParticipant; readonly source: 'day-master'; readonly property: 'id' | 'element' | 'polarity' }
  | { readonly participant: RuleParticipant; readonly source: 'visible-element-occurrences'; readonly property: FiveElementId | 'observed-symbol-count' }
  | {
      readonly participant: RuleParticipant;
      readonly source: 'pillar';
      readonly position: PillarPosition;
      readonly property: 'stem-id' | 'stem-element' | 'stem-polarity' | 'branch-id' | 'branch-element' | 'branch-polarity';
    };

export type FactLiteral =
  | { readonly kind: 'symbol-id'; readonly value: string }
  | { readonly kind: 'element'; readonly value: FiveElementId }
  | { readonly kind: 'polarity'; readonly value: PolarityId }
  | { readonly kind: 'count'; readonly value: number };

export type RuleOperand = { readonly kind: 'fact'; readonly reference: FactReference } | FactLiteral;

export interface AtomicPredicate {
  readonly operator: 'equals' | 'not-equals';
  readonly left: { readonly kind: 'fact'; readonly reference: FactReference };
  readonly right: RuleOperand;
}

export interface CompatibilityRule {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly requirements: readonly RuleRequirement[];
  readonly hourDependent: boolean;
  readonly predicate: { readonly operator: 'all'; readonly clauses: readonly AtomicPredicate[] };
  readonly dimensionIds: readonly DimensionId[];
  readonly strength: RuleStrength;
  readonly pairSemantics: PairSemantics;
  readonly directionalEvidenceKey: string | null;
  readonly allowedNarrativeKeys: readonly string[];
  readonly blockedNarrativeCategoryIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
  readonly review: {
    readonly status: RuleReviewStatus;
    readonly internalProduct: 'reviewed';
    readonly internalSafety: 'reviewed';
    readonly culturalSajuExpert: 'pending' | 'approved';
  };
}

export interface CompatibilityRuleSet {
  readonly schemaVersion: 1;
  readonly ruleSetVersion: string;
  readonly taxonomyVersion: 'inclusive-compatibility-v1';
  readonly derivedFeatureVersion: 'korean-saju-derived-v1';
  readonly status: 'candidate';
  readonly productionEligible: false;
  readonly review: {
    readonly internalProduct: 'reviewed';
    readonly internalSafety: 'reviewed';
    readonly culturalSajuExpert: 'pending';
  };
  readonly rules: readonly CompatibilityRule[];
}

export type RuleOutcome = 'matched' | 'not-matched' | 'required-input-unavailable';

export interface CorrelatedRuleOutcome {
  /** Every ID in A pairs with every ID in B; groups are a compressed Cartesian partition. */
  readonly personAVariantIds: readonly string[];
  readonly personBVariantIds: readonly string[];
  readonly outcome: RuleOutcome;
}

export type RuleResolution =
  | { readonly status: 'definitive'; readonly outcome: RuleOutcome; readonly coverage: readonly CorrelatedRuleOutcome[] }
  | {
      readonly status: 'alternatives';
      readonly outcomes: readonly CorrelatedRuleOutcome[];
      readonly limitation: 'RESULT_VARIES_ACROSS_PAIR_VARIANTS';
    }
  | {
      readonly status: 'suppressed';
      readonly reason: 'HOUR_INPUT_UNAVAILABLE' | 'RULE_REVIEW_PENDING' | 'VARIANT_MATRIX_LIMIT';
    };

export interface ApprovedRuleEvaluation {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly dimensionIds: readonly DimensionId[];
  readonly strength: RuleStrength;
  readonly pairSemantics: PairSemantics;
  readonly allowedNarrativeKeys: readonly string[];
  readonly blockedNarrativeCategoryIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
  readonly reviewStatus: 'approved';
  readonly resolution: Exclude<RuleResolution, { status: 'suppressed'; reason: 'RULE_REVIEW_PENDING' }>;
}

export interface PendingRuleEvaluation {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly reviewStatus: 'candidate';
  readonly resolution: { readonly status: 'suppressed'; readonly reason: 'RULE_REVIEW_PENDING' };
}

export type RuleEvaluation = ApprovedRuleEvaluation | PendingRuleEvaluation;

export interface CompatibilitySnapshot {
  readonly schemaVersion: 1;
  readonly snapshotVersion: 'compatibility-snapshot-v1';
  readonly ruleSetVersion: string;
  readonly taxonomyVersion: 'inclusive-compatibility-v1';
  readonly derivedFeatureVersion: 'korean-saju-derived-v1';
  readonly status: 'candidate';
  readonly productionEligible: false;
  readonly temporalSupport: Readonly<Record<RuleParticipant, TemporalSupport>>;
  readonly sourceVersions: Readonly<Record<RuleParticipant, {
    readonly profileVersion: 'korean-saju-v1';
    readonly adapterVersion: '0.4.0';
    readonly derivedFeatureVersion: 'korean-saju-derived-v1';
  }>>;
  readonly ruleEvaluations: readonly RuleEvaluation[];
  readonly limitations: readonly ('NO_APPROVED_DIMENSION_MAPPINGS')[];
}

export type CompatibilityEvaluationResult =
  | { readonly status: 'ok'; readonly snapshot: CompatibilitySnapshot }
  | {
      readonly status: 'error';
      readonly error: {
        readonly code: 'COMPATIBILITY_INPUT_INVALID' | 'RULE_SET_INVALID';
        readonly message: 'The compatibility input is invalid or unsupported.' | 'The compatibility rule set is invalid or unsupported.';
      };
    };

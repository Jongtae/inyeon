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

export type RuleOutcome = 'matched' | 'not-matched';

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
      readonly reason: 'RULE_REVIEW_PENDING' | 'VARIANT_MATRIX_LIMIT';
    }
  | {
      readonly status: 'unavailable';
      readonly reason: 'HOUR_INPUT_UNAVAILABLE' | 'REQUIRED_FEATURE_UNAVAILABLE';
    };

export type EvidenceAvailabilityState =
  | 'available-from-details-provided'
  | 'consistent-across-retained-variants'
  | 'varies-across-retained-variants'
  | 'unavailable-required-input'
  | 'unavailable-hour-input'
  | 'suppressed-review-pending'
  | 'suppressed-resource-limit';

export type EvidenceLimitationCode =
  | 'CANDIDATE_METHODOLOGY'
  | 'NO_APPROVED_DIMENSION_MAPPINGS'
  | 'PERSON_A_TIME_APPROXIMATE'
  | 'PERSON_B_TIME_APPROXIMATE'
  | 'PERSON_A_TIME_DISPUTED'
  | 'PERSON_B_TIME_DISPUTED'
  | 'PERSON_A_DATE_ONLY'
  | 'PERSON_B_DATE_ONLY'
  | 'PERSON_A_TIME_UNKNOWN'
  | 'PERSON_B_TIME_UNKNOWN'
  | 'HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE'
  | 'EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'
  | 'REQUIRED_INPUT_UNAVAILABLE'
  | 'RULE_NOT_YET_AVAILABLE'
  | 'EVALUATION_RESOURCE_LIMIT';

export interface EvidenceAvailability {
  readonly modelVersion: 'evidence-availability-v1';
  readonly state: EvidenceAvailabilityState;
  readonly limitationCodes: readonly EvidenceLimitationCode[];
}

export interface EvidenceBearingRuleEvaluation {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly requirements: readonly RuleRequirement[];
  readonly dimensionIds: readonly DimensionId[];
  readonly strength: RuleStrength;
  readonly pairSemantics: PairSemantics;
  readonly allowedNarrativeKeys: readonly string[];
  readonly blockedNarrativeCategoryIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
  readonly reviewStatus: 'approved';
  readonly resolution: Extract<RuleResolution, { status: 'definitive' | 'alternatives' }>;
  readonly evidenceAvailability: EvidenceAvailability;
}

export interface ApprovedUnavailableRuleEvaluation {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly requirements: readonly RuleRequirement[];
  readonly reviewStatus: 'approved';
  readonly resolution: Extract<RuleResolution, { status: 'suppressed' | 'unavailable' }>;
  readonly evidenceAvailability: EvidenceAvailability;
}

export interface PendingRuleEvaluation {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly reviewStatus: 'candidate';
  readonly resolution: { readonly status: 'suppressed'; readonly reason: 'RULE_REVIEW_PENDING' };
  readonly evidenceAvailability: EvidenceAvailability;
}

export type RuleEvaluation = EvidenceBearingRuleEvaluation | ApprovedUnavailableRuleEvaluation | PendingRuleEvaluation;

export interface ParticipantEvidenceContext {
  readonly temporalSupport: TemporalSupport;
  readonly hourEvidence: 'available' | 'unavailable';
  readonly limitationCodes: readonly EvidenceLimitationCode[];
}

export interface PairEvidenceSummary {
  readonly modelVersion: 'evidence-availability-v1';
  readonly meaning: 'Evidence availability under the selected candidate methodology; not scientific or predictive confidence.';
  readonly state: 'no-approved-evidence' | 'available' | 'bounded' | 'mixed' | 'unavailable';
  readonly ruleCounts: {
    readonly approved: number;
    readonly definitive: number;
    readonly alternatives: number;
    readonly unavailable: number;
    readonly suppressed: number;
  };
  readonly participants: Readonly<Record<RuleParticipant, ParticipantEvidenceContext>>;
  readonly limitationCodes: readonly EvidenceLimitationCode[];
}

export interface CompatibilitySnapshot {
  readonly schemaVersion: 2;
  readonly snapshotVersion: 'compatibility-snapshot-v2';
  readonly evidenceModelVersion: 'evidence-availability-v1';
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
  readonly evidenceSummary: PairEvidenceSummary;
  readonly limitations: readonly EvidenceLimitationCode[];
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

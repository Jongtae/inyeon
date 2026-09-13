export type DimensionId =
  | 'conversation-rhythm'
  | 'decision-pace'
  | 'structure-adaptation'
  | 'autonomy-togetherness'
  | 'friction-repair-rhythm'
  | 'collaboration-rhythm'
  | 'novelty-exploration'
  | 'emotional-expression-rhythm';

export type AllowedEvidenceClassId =
  | 'reviewed-versioned-rule-output'
  | 'temporal-support-metadata'
  | 'common-across-variants'
  | 'correlated-rule-alternatives';

export type TemporalSupport = 'exact' | 'approximate' | 'disputed' | 'date-only' | 'unknown';
export type Participant = 'person-a' | 'person-b';

export interface CompatibilityDimension {
  readonly id: DimensionId;
  readonly publicLabel: string;
  readonly description: string;
  readonly poles: readonly { readonly id: string; readonly label: string; readonly description: string }[];
  readonly allowedExample: string;
  readonly allowedEvidenceClasses: readonly AllowedEvidenceClassId[];
  readonly limits: readonly string[];
  readonly ordered: false;
}

export interface CompatibilityTaxonomy {
  readonly schemaVersion: 1;
  readonly taxonomyVersion: 'inclusive-compatibility-v1';
  readonly status: 'candidate';
  readonly productionEligible: false;
  readonly review: { readonly internalProduct: 'reviewed'; readonly internalSafety: 'reviewed'; readonly culturalSajuExpert: 'pending' };
  readonly dimensions: readonly CompatibilityDimension[];
  readonly [key: string]: unknown;
}

export interface ProhibitedClaimCategory {
  readonly id: string;
  readonly action: 'block';
  readonly semanticClaims: readonly string[];
  readonly lexicalMatchers: readonly string[];
  readonly prohibitedExample: string;
}

export interface ProhibitedClaimsMatrix {
  readonly schemaVersion: 1;
  readonly matrixVersion: 'prohibited-compatibility-claims-v1';
  readonly defaultAction: 'require-reviewed-allowlist';
  readonly categories: readonly ProhibitedClaimCategory[];
  readonly reviewedAllowedExamples: readonly { readonly id: string; readonly text: string; readonly whyAllowed: string }[];
  readonly [key: string]: unknown;
}

export type PairSemantics =
  | { readonly kind: 'symmetric' }
  | {
      readonly kind: 'directional';
      readonly source: Participant;
      readonly target: Participant;
      readonly evidenceDirection: `${Participant}-to-${Participant}`;
      readonly swapSemantics: 'reverse-participants';
    };

export interface TemporalClaimInput {
  readonly temporalSupport: TemporalSupport;
  readonly hourDependent: boolean;
  readonly retainedVariantIds: readonly string[];
  readonly variantValues: readonly {
    readonly variantId: string;
    readonly value: string;
  }[];
}

export type TemporalClaimResolution =
  | { readonly status: 'suppressed'; readonly reason: 'HOUR_INPUT_UNAVAILABLE' | 'NO_VARIANT_RESULT' | 'INCOMPLETE_VARIANT_COVERAGE' }
  | { readonly status: 'definitive'; readonly value: string; readonly coveredVariantIds: readonly string[] }
  | {
      readonly status: 'alternatives';
      readonly variantValues: readonly { readonly variantId: string; readonly value: string }[];
      readonly limitation: 'RESULT_VARIES_ACROSS_TIME_VARIANTS';
    };

import type {
  EvidenceAvailabilityState,
  EvidenceLimitationCode,
} from '@inyeon/compatibility-rules';

export type NarrativeContext =
  | 'private-comparison'
  | 'public-figure-reference'
  | 'synthetic-reference'
  | 'someone-i-know';
export type NarrativeFormat = 'standard' | 'compact' | 'share';
export type NarrativeTone = 'reflective' | 'plain';
export type NarrativeSection = 'what-clicks' | 'potential-friction' | 'why-this';

export interface NarrativeInput {
  readonly snapshot: unknown;
  readonly context: NarrativeContext;
  readonly format: NarrativeFormat;
  readonly tone: NarrativeTone;
}

export interface NarrativeClaimTrace {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly copyKey: string;
  readonly evidenceAvailability: Extract<
    EvidenceAvailabilityState,
    'available-from-details-provided' | 'consistent-across-retained-variants'
  >;
  readonly evidenceRefs: readonly string[];
}

export interface NarrativeClaim {
  readonly kind: 'claim';
  readonly section: NarrativeSection;
  readonly text: string;
  readonly trace: NarrativeClaimTrace;
}

export interface NarrativeStatus {
  readonly kind: 'status';
  readonly copyKey: string;
  readonly text: string;
}

export interface NarrativeLimitation {
  readonly kind: 'limitation';
  readonly copyKey: string;
  readonly text: string;
  readonly sourceCodes: readonly EvidenceLimitationCode[];
}

export interface NarrativeDisclosure {
  readonly kind: 'disclosure';
  readonly copyKey: string;
  readonly text: string;
  readonly context: NarrativeContext;
}

export interface NarrativeViewModel {
  readonly schemaVersion: 1;
  readonly composerVersion: 'deterministic-narrative-v1';
  readonly copyCatalogVersion: 'us-english-narrative-copy-v1';
  readonly sourceVersions: {
    readonly snapshotVersion: 'compatibility-snapshot-v2';
    readonly evidenceModelVersion: 'evidence-availability-v1';
    readonly ruleSetVersion: string;
    readonly taxonomyVersion: 'inclusive-compatibility-v1';
    readonly derivedFeatureVersion: 'korean-saju-derived-v1';
  };
  readonly context: NarrativeContext;
  readonly format: NarrativeFormat;
  readonly tone: NarrativeTone;
  readonly evidenceState: 'no-approved-evidence' | 'available' | 'bounded' | 'mixed' | 'unavailable' | 'shared-summary';
  readonly productionEligible: false;
  readonly headline: null;
  readonly status: NarrativeStatus;
  readonly whatClicks: readonly NarrativeClaim[];
  readonly potentialFriction: readonly NarrativeClaim[];
  readonly whyThis: readonly NarrativeClaim[];
  readonly limitations: readonly NarrativeLimitation[];
  readonly disclosures: readonly NarrativeDisclosure[];
  readonly questionToTry: null;
}

export type NarrativeResult =
  | { readonly status: 'ok'; readonly narrative: NarrativeViewModel }
  | {
      readonly status: 'error';
      readonly error: {
        readonly code: 'NARRATIVE_INPUT_INVALID' | 'NARRATIVE_CATALOG_INVALID';
        readonly message: 'The narrative input is invalid or unsupported.' | 'The narrative copy catalog is invalid or unsupported.';
      };
    };

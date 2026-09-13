import type {
  BoundedFullChartResult,
  BoundedHourSuppressedChartResult,
  CompleteChartResult,
} from '@inyeon/saju-adapter';

export type SuccessfulChartResult = CompleteChartResult | BoundedFullChartResult | BoundedHourSuppressedChartResult;
export type PillarPosition = 'year' | 'month' | 'day' | 'hour';
export type FiveElementId = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type PolarityId = 'yang' | 'yin';
export type SymbolKind = 'heavenly-stem' | 'earthly-branch';

export interface LocalizedConcept<TId extends string> {
  readonly id: TId;
  /** Hangul is the primary Korean-script identity. */
  readonly hangul: string;
  /** Hanja is secondary traditional detail. */
  readonly hanja: string;
  /** Stable US-English presentation label; not narrative copy. */
  readonly englishLabel: string;
}

export type FiveElement = LocalizedConcept<FiveElementId>;
export type Polarity = LocalizedConcept<PolarityId>;

export interface VisibleSymbolFeature {
  readonly id: string;
  readonly kind: SymbolKind;
  /** Hangul is the primary Korean-script identity. */
  readonly hangul: string;
  /** Hanja is secondary traditional detail. */
  readonly hanja: string;
  /** Stable Korean romanization for US-English presentation; not a translation. */
  readonly romanization: string;
  readonly element: FiveElement;
  readonly polarity: Polarity;
}

export interface VisiblePillarFeature {
  readonly stem: VisibleSymbolFeature;
  readonly branch: VisibleSymbolFeature;
}

export interface VisibleElementOccurrences {
  readonly wood: number;
  readonly fire: number;
  readonly earth: number;
  readonly metal: number;
  readonly water: number;
  readonly observedSymbolCount: 6 | 8;
  readonly includedPillars: readonly PillarPosition[];
  readonly excludedPillars: readonly PillarPosition[];
  readonly weightingVersion: 'unit-visible-symbol-v1';
}

export interface DerivedChartVariant {
  /** Opaque source ID, retained byte-for-byte and in source order. */
  readonly id: string;
  readonly positions: Readonly<Record<'year' | 'month' | 'day', VisiblePillarFeature>> & {
    readonly hour?: VisiblePillarFeature;
  };
  readonly dayMaster: VisibleSymbolFeature;
  readonly visibleElementOccurrences: VisibleElementOccurrences;
}

export type StableFeature<T> =
  | { readonly support: 'invariant'; readonly value: T }
  | { readonly support: 'alternative'; readonly values: readonly { readonly variantIds: readonly string[]; readonly value: T }[] }
  | { readonly support: 'unavailable'; readonly value: null };

export interface DerivedFeatureProvenance {
  readonly schemaVersion: 1;
  readonly derivedFeatureVersion: 'korean-saju-derived-v1';
  readonly canonicalTableVersion: 'visible-stem-branch-elements-v1';
  readonly weightingVersion: 'unit-visible-symbol-v1';
  readonly status: 'candidate';
  readonly productionValidated: false;
  readonly sourceProfileVersion: 'korean-saju-v1';
  readonly sourceAdapterVersion: '0.4.0';
  readonly sourceUpstreamName: 'manseryeok';
  readonly sourceUpstreamVersion: '2.0.0';
  readonly sourceTimezoneResolverVersion: '0.1.0';
  readonly sourceTimezoneDataVersion: 'iana-2026c-inyeon-filter-v1';
  readonly sourceReferenceDataVersion: 'issue-12-day-hour-uncertainty-v1';
  readonly sourceYearMonthReferenceDataVersion: 'issue-11-year-month-differential-v1';
  readonly sourceSolarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1';
  readonly sourceSolarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1';
  readonly sourceUncertaintyAlgebraVersion: 'birth-time-uncertainty-v1';
  readonly sourceDayBoundary: 'local-civil-midnight';
  readonly sourceHourBranchConvention: 'local-civil-two-hour-intervals-from-23:00';
  readonly sourceTrueSolarTime: false;
}

export interface SuccessfulDerivedFeatureResult {
  readonly status: 'ok';
  readonly temporalSupport: SuccessfulChartResult['temporalSupport'];
  readonly variants: readonly DerivedChartVariant[];
  readonly stable: {
    readonly positions: Readonly<Record<PillarPosition, StableFeature<VisiblePillarFeature>>>;
    readonly dayMaster: StableFeature<VisibleSymbolFeature>;
    readonly visibleElementOccurrences: StableFeature<VisibleElementOccurrences>;
  };
  readonly hourDependentEvidence: SuccessfulChartResult['hourDependentEvidence'];
  readonly provenance: DerivedFeatureProvenance;
}

export interface FailedDerivedFeatureResult {
  readonly status: 'error';
  readonly error: {
    readonly code: 'SOURCE_CHART_INVALID';
    readonly message: 'The source chart result is invalid or unsupported.';
  };
}

export type DerivedFeatureResult = SuccessfulDerivedFeatureResult | FailedDerivedFeatureResult;

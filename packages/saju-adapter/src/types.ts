export type CalendarKind = 'solar';
export type BirthTimePrecision = 'exact' | 'approximate' | 'disputed' | 'unknown';
export type LocalTimeAmbiguity = 'unambiguous' | 'ambiguous' | 'nonexistent';

export interface NormalizedLocalDateTimeRange {
  readonly startLocalDateTime: string;
  readonly endLocalDateTime: string;
}

export interface NormalizedBirthContext {
  readonly localDate: string;
  readonly localTime: string | null;
  readonly timeRange?: NormalizedLocalDateTimeRange | null;
  readonly timePrecision: BirthTimePrecision;
  readonly calendarKind: CalendarKind;
  readonly timeZone: string;
  readonly ambiguity: LocalTimeAmbiguity;
  readonly profileVersion: 'korean-saju-v1';
  readonly timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1';
  readonly referenceDataVersion: 'issue-10-solar-term-boundaries-v1';
}

export type HeavenlyStemHangul = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type EarthlyBranchHangul = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

export interface NormalizedPillar {
  /** Hangul is the primary display identity; Hanja is secondary detail. */
  readonly stem: HeavenlyStemHangul;
  readonly branch: EarthlyBranchHangul;
  readonly stemHanja: string;
  readonly branchHanja: string;
}

export interface CalculationProvenance {
  readonly profileVersion: 'korean-saju-v1';
  readonly profileStatus: 'candidate';
  readonly adapterVersion: '0.4.0';
  readonly upstreamName: 'manseryeok';
  readonly upstreamVersion: '2.0.0';
  readonly timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1';
  readonly referenceDataVersion: 'issue-10-solar-term-boundaries-v1';
  readonly solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1';
  readonly solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1';
  readonly solarTermPrecision: 'minute';
  readonly derivedFeatureVersion: 'not-applicable';
}

export type YearMonthSupportedTimeZone = 'America/Los_Angeles' | 'America/New_York' | 'Asia/Seoul';

export interface NormalizedYearMonthContext {
  readonly localDate: string;
  readonly localTime: string;
  readonly timePrecision: 'exact';
  readonly calendarKind: CalendarKind;
  readonly timeZone: YearMonthSupportedTimeZone;
  readonly profileVersion: 'korean-saju-v1';
  readonly timezoneDataVersion: 'iana-2026c-inyeon-filter-v1';
  readonly referenceDataVersion: 'issue-11-year-month-differential-v1';
}

export interface YearMonthCalculationProvenance {
  readonly profileVersion: 'korean-saju-v1';
  readonly profileStatus: 'candidate';
  readonly adapterVersion: '0.4.0';
  readonly upstreamName: 'manseryeok';
  readonly upstreamVersion: '2.0.0';
  readonly timezoneResolverVersion: '0.1.0';
  readonly timezoneDataVersion: 'iana-2026c-inyeon-filter-v1';
  readonly referenceDataVersion: 'issue-11-year-month-differential-v1';
  readonly solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1';
  readonly solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1';
  readonly solarTermPrecision: 'minute';
  readonly derivedFeatureVersion: 'not-applicable';
}

export interface NormalizedYearMonthPillars {
  readonly year: NormalizedPillar;
  readonly month: NormalizedPillar;
}

export interface CompleteYearMonthResult {
  readonly status: 'complete';
  readonly pillars: NormalizedYearMonthPillars;
  readonly resolution: 'unambiguous' | 'ambiguous-same-output';
  readonly candidateCount: 1 | 2;
  readonly alternatives: readonly [];
  readonly provenance: YearMonthCalculationProvenance;
}

export interface AmbiguousYearMonthResult {
  readonly status: 'ambiguous';
  readonly reason: 'LOCAL_TIME_AMBIGUOUS_YEAR_MONTH';
  readonly pillars: null;
  readonly resolution: 'ambiguous-different-outputs';
  readonly candidateCount: 2;
  readonly alternatives: readonly NormalizedYearMonthPillars[];
  readonly provenance: YearMonthCalculationProvenance;
}

export interface FailedYearMonthResult {
  readonly status: 'error';
  readonly error: { readonly code: InyeonSajuErrorCode; readonly message: string };
}

export type InyeonYearMonthResult = CompleteYearMonthResult | AmbiguousYearMonthResult | FailedYearMonthResult;

export type InyeonSajuErrorCode =
  | 'AMBIGUOUS_LOCAL_TIME'
  | 'CALENDAR_UNSUPPORTED'
  | 'DATE_INVALID'
  | 'DATE_OUT_OF_RANGE'
  | 'INPUT_INVALID'
  | 'NONEXISTENT_LOCAL_TIME'
  | 'PROFILE_UNSUPPORTED'
  | 'RANGE_INVALID'
  | 'RANGE_TOO_LARGE'
  | 'TIME_INVALID'
  | 'TIME_PRECISION_UNSUPPORTED'
  | 'TIMEZONE_UNSUPPORTED'
  | 'VERSION_UNSUPPORTED'
  | 'UPSTREAM_FAILURE';

export interface CompleteSajuResult {
  readonly status: 'complete';
  readonly pillars: {
    readonly year: NormalizedPillar;
    readonly month: NormalizedPillar;
    readonly day: NormalizedPillar;
    readonly hour: NormalizedPillar;
  };
  readonly dayMaster: HeavenlyStemHangul;
  readonly availability: { readonly year: true; readonly month: true; readonly day: true; readonly hour: true };
  readonly alternatives: readonly [];
  readonly provenance: CalculationProvenance;
}

export interface PartialSajuResult {
  readonly status: 'partial';
  readonly reason: 'BIRTH_TIME_UNKNOWN';
  readonly pillars: null;
  readonly dayMaster: null;
  readonly availability: { readonly year: false; readonly month: false; readonly day: false; readonly hour: false };
  readonly alternatives: readonly [];
  readonly provenance: CalculationProvenance;
}

export interface FailedSajuResult {
  readonly status: 'error';
  readonly error: { readonly code: InyeonSajuErrorCode; readonly message: string };
}

export type InyeonSajuResult = CompleteSajuResult | PartialSajuResult | FailedSajuResult;

export interface InyeonSajuAdapter {
  readonly calculate: (input: NormalizedBirthContext) => InyeonSajuResult;
  readonly calculateYearMonth: (input: NormalizedYearMonthContext) => InyeonYearMonthResult;
  readonly calculateChart: (input: NormalizedChartContext) => InyeonChartResult;
}

export type ChartTemporalSupport = 'exact' | 'approximate' | 'disputed' | 'date-only' | 'unknown';

export interface ChartLocalDateTimeWindow {
  /** Inclusive, minute-precision local civil boundary without an offset. */
  readonly startLocalDateTime: string;
  /** Inclusive, minute-precision local civil boundary without an offset. */
  readonly endLocalDateTime: string;
}

interface ChartContextBase {
  readonly calendarKind: CalendarKind;
  readonly timeZone: YearMonthSupportedTimeZone;
  readonly profileVersion: 'korean-saju-v1';
  readonly timezoneDataVersion: 'iana-2026c-inyeon-filter-v1';
  readonly referenceDataVersion: 'issue-12-day-hour-uncertainty-v1';
}

export interface ExactChartContext extends ChartContextBase {
  readonly temporalSupport: 'exact';
  readonly localDate: string;
  readonly localTime: string;
}

export interface ApproximateChartContext extends ChartContextBase {
  readonly temporalSupport: 'approximate';
  readonly window: ChartLocalDateTimeWindow;
}

export interface DisputedChartContext extends ChartContextBase {
  readonly temporalSupport: 'disputed';
  /** A union of asserted possibilities. Minutes between windows are never interpolated. */
  readonly windows: readonly ChartLocalDateTimeWindow[];
}

export interface DateOnlyChartContext extends ChartContextBase {
  readonly temporalSupport: 'date-only';
  readonly localDate: string;
}

export interface UnknownTimeChartContext extends ChartContextBase {
  readonly temporalSupport: 'unknown';
  readonly localDate: string;
}

export type NormalizedChartContext =
  | ExactChartContext
  | ApproximateChartContext
  | DisputedChartContext
  | DateOnlyChartContext
  | UnknownTimeChartContext;

export type ChartPillarSupport =
  | { readonly support: 'invariant'; readonly pillar: NormalizedPillar }
  | { readonly support: 'alternative'; readonly pillar: null }
  | { readonly support: 'unavailable'; readonly pillar: null };

export interface FullChartVariant {
  readonly id: string;
  readonly pillars: {
    readonly year: NormalizedPillar;
    readonly month: NormalizedPillar;
    readonly day: NormalizedPillar;
    readonly hour: NormalizedPillar;
  };
}

export interface HourSuppressedChartVariant {
  readonly id: string;
  readonly pillars: {
    readonly year: NormalizedPillar;
    readonly month: NormalizedPillar;
    readonly day: NormalizedPillar;
  };
}

export interface ChartCalculationProvenance {
  readonly profileVersion: 'korean-saju-v1';
  readonly profileStatus: 'candidate';
  readonly adapterVersion: '0.4.0';
  readonly upstreamName: 'manseryeok';
  readonly upstreamVersion: '2.0.0';
  readonly timezoneResolverVersion: '0.1.0';
  readonly timezoneDataVersion: 'iana-2026c-inyeon-filter-v1';
  readonly referenceDataVersion: 'issue-12-day-hour-uncertainty-v1';
  readonly yearMonthReferenceDataVersion: 'issue-11-year-month-differential-v1';
  readonly solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1';
  readonly solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1';
  readonly uncertaintyAlgebraVersion: 'birth-time-uncertainty-v1';
  readonly dayBoundary: 'local-civil-midnight';
  readonly hourBranchConvention: 'local-civil-two-hour-intervals-from-23:00';
  readonly trueSolarTime: false;
  readonly productionValidated: false;
}

export interface ChartResultBase {
  readonly temporalSupport: ChartTemporalSupport;
  readonly stablePillars: {
    readonly year: ChartPillarSupport;
    readonly month: ChartPillarSupport;
    readonly day: ChartPillarSupport;
    readonly hour: ChartPillarSupport;
  };
  readonly candidateCount: number;
  readonly variantCount: number;
  readonly evaluatedCivilMinuteCount: number;
  readonly nonexistentCivilMinuteCount: number;
  readonly containsFold: boolean;
  readonly hourDependentEvidence:
    | { readonly eligible: true; readonly reason: null }
    | { readonly eligible: false; readonly reason: 'HOUR_VARIES' | 'TIME_NOT_SUPPORTED' };
  readonly provenance: ChartCalculationProvenance;
}

export interface CompleteChartResult extends ChartResultBase {
  readonly status: 'complete';
  readonly temporalSupport: 'exact';
  readonly variants: readonly [FullChartVariant];
}

export interface BoundedFullChartResult extends ChartResultBase {
  readonly status: 'bounded';
  readonly temporalSupport: 'exact' | 'approximate' | 'disputed';
  readonly variants: readonly FullChartVariant[];
}

export interface BoundedHourSuppressedChartResult extends ChartResultBase {
  readonly status: 'bounded';
  readonly temporalSupport: 'date-only' | 'unknown';
  readonly variants: readonly HourSuppressedChartVariant[];
}

export interface FailedChartResult {
  readonly status: 'error';
  readonly error: { readonly code: InyeonSajuErrorCode; readonly message: string };
}

export type InyeonChartResult = CompleteChartResult | BoundedFullChartResult | BoundedHourSuppressedChartResult | FailedChartResult;

/** Internal adapter seam. It is intentionally absent from the package's public exports. */
export interface InyeonPrimaryEngineOutput {
  readonly year: { readonly heavenlyStem: string; readonly earthlyBranch: string };
  readonly month: { readonly heavenlyStem: string; readonly earthlyBranch: string };
  readonly day: { readonly heavenlyStem: string; readonly earthlyBranch: string };
  readonly hour: { readonly heavenlyStem: string; readonly earthlyBranch: string };
}

export interface InyeonPrimaryEngine {
  calculate(input: { readonly year: number; readonly month: number; readonly day: number; readonly hour: number; readonly minute: number; readonly dayBoundary: 'midnight' }): InyeonPrimaryEngineOutput;
}

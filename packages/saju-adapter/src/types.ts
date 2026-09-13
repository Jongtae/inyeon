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
  readonly adapterVersion: '0.2.0';
  readonly upstreamName: 'manseryeok';
  readonly upstreamVersion: '2.0.0';
  readonly timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1';
  readonly referenceDataVersion: 'issue-10-solar-term-boundaries-v1';
  readonly solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1';
  readonly solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1';
  readonly solarTermPrecision: 'minute';
  readonly derivedFeatureVersion: 'not-applicable';
}

export type InyeonSajuErrorCode =
  | 'AMBIGUOUS_LOCAL_TIME'
  | 'CALENDAR_UNSUPPORTED'
  | 'DATE_INVALID'
  | 'DATE_OUT_OF_RANGE'
  | 'INPUT_INVALID'
  | 'PROFILE_UNSUPPORTED'
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
}

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

import { composeCompatibilityNarrative, type NarrativeContext, type NarrativeViewModel } from '@inyeon/compatibility-narrative';
import { evaluateCompatibilityPair } from '@inyeon/compatibility-rules';
import {
  inyeonSajuAdapter,
  type InyeonChartResult,
  type NormalizedChartContext,
} from '@inyeon/saju-adapter';
import {
  deriveChartFeatures,
  type SuccessfulDerivedFeatureResult,
} from '@inyeon/saju-derived-features';

export const SUPPORTED_BIRTHPLACES = Object.freeze([
  Object.freeze({ id: 'los-angeles', label: 'Los Angeles', timeZone: 'America/Los_Angeles' }),
  Object.freeze({ id: 'new-york', label: 'New York City', timeZone: 'America/New_York' }),
  Object.freeze({ id: 'seoul', label: 'Seoul (서울)', timeZone: 'Asia/Seoul' }),
] as const);

export type SupportedTimeZone = (typeof SUPPORTED_BIRTHPLACES)[number]['timeZone'];
export type PersonalTemporalSupport = 'exact' | 'approximate' | 'disputed' | 'unknown';

export interface BirthFormValue {
  readonly localDate: string;
  readonly timeZone: SupportedTimeZone;
  readonly temporalSupport: PersonalTemporalSupport;
  readonly exactTime: string;
  readonly approximateStart: string;
  readonly approximateEnd: string;
  readonly disputedTimeA: string;
  readonly disputedTimeB: string;
}

export interface CalculatedProfile {
  readonly chart: Exclude<InyeonChartResult, { readonly status: 'error' }>;
  readonly derived: SuccessfulDerivedFeatureResult;
}

export interface ProductFailure {
  readonly status: 'error';
  readonly message: string;
}

export type CalculationResult =
  | { readonly status: 'ok'; readonly profile: CalculatedProfile }
  | ProductFailure;

export type ComparisonResult =
  | { readonly status: 'ok'; readonly narrative: NarrativeViewModel }
  | ProductFailure;

const baseContext = (timeZone: SupportedTimeZone) => ({
  calendarKind: 'solar' as const,
  timeZone,
  profileVersion: 'korean-saju-v1' as const,
  timezoneDataVersion: 'iana-2026c-inyeon-filter-v1' as const,
  referenceDataVersion: 'issue-12-day-hour-uncertainty-v1' as const,
});

function dateTime(date: string, time: string): string {
  return `${date}T${time}`;
}

export function chartContextFromForm(value: BirthFormValue): NormalizedChartContext | null {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value.localDate)) return null;
  const base = baseContext(value.timeZone);
  if (value.temporalSupport === 'unknown') {
    return { ...base, temporalSupport: 'unknown', localDate: value.localDate };
  }
  const validTime = (time: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(time);
  if (value.temporalSupport === 'exact') {
    return validTime(value.exactTime)
      ? { ...base, temporalSupport: 'exact', localDate: value.localDate, localTime: value.exactTime }
      : null;
  }
  if (value.temporalSupport === 'approximate') {
    if (!validTime(value.approximateStart) || !validTime(value.approximateEnd)
      || value.approximateStart >= value.approximateEnd) return null;
    return {
      ...base,
      temporalSupport: 'approximate',
      window: {
        startLocalDateTime: dateTime(value.localDate, value.approximateStart),
        endLocalDateTime: dateTime(value.localDate, value.approximateEnd),
      },
    };
  }
  if (!validTime(value.disputedTimeA) || !validTime(value.disputedTimeB)
    || value.disputedTimeA === value.disputedTimeB) return null;
  return {
    ...base,
    temporalSupport: 'disputed',
    windows: [value.disputedTimeA, value.disputedTimeB].sort().map((time) => ({
      startLocalDateTime: dateTime(value.localDate, time),
      endLocalDateTime: dateTime(value.localDate, time),
    })),
  };
}

export function calculateProfile(context: NormalizedChartContext): CalculationResult {
  try {
    const chart = inyeonSajuAdapter.calculateChart(context);
    if (chart.status === 'error') {
      return { status: 'error', message: chart.error.message };
    }
    const derived = deriveChartFeatures(chart);
    if (derived.status === 'error') {
      return { status: 'error', message: 'This chart could not be prepared for comparison.' };
    }
    return { status: 'ok', profile: { chart, derived } };
  } catch {
    return { status: 'error', message: 'These birth details are not supported yet.' };
  }
}

export function compareProfiles(
  personA: CalculatedProfile,
  personB: CalculatedProfile,
  context: NarrativeContext,
): ComparisonResult {
  const evaluation = evaluateCompatibilityPair(personA.derived, personB.derived);
  if (evaluation.status === 'error') {
    return { status: 'error', message: 'This comparison could not be evaluated.' };
  }
  const composed = composeCompatibilityNarrative({
    snapshot: evaluation.snapshot,
    context,
    format: 'standard',
    tone: 'reflective',
  });
  return composed.status === 'ok'
    ? { status: 'ok', narrative: composed.narrative }
    : { status: 'error', message: 'This comparison could not be explained safely.' };
}

export function temporalLabel(support: NormalizedChartContext['temporalSupport']): string {
  switch (support) {
    case 'exact': return 'Exact time provided';
    case 'approximate': return 'Approximate time range';
    case 'disputed': return 'Multiple time possibilities';
    case 'date-only': return 'Date only';
    case 'unknown': return 'Birth time unknown';
  }
}

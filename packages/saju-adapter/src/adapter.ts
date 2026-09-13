import { calculateFourPillars } from 'manseryeok';
import { inyeonLocalTimeResolver } from '@inyeon/timezone-resolver';

import type {
  EarthlyBranchHangul,
  HeavenlyStemHangul,
  InyeonPrimaryEngine,
  InyeonPrimaryEngineOutput,
  InyeonSajuAdapter,
  InyeonSajuErrorCode,
  InyeonYearMonthResult,
  NormalizedPillar,
  NormalizedYearMonthContext,
  NormalizedYearMonthPillars,
} from './types.js';

const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
const STEM_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const MINIMUM_YEAR_MONTH_DATE = '1989-01-01';
const MAXIMUM_YEAR_MONTH_DATE = '2024-12-31';
const KST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1_000;
const YEAR_MONTH_INPUT_KEYS = new Set([
  'localDate',
  'localTime',
  'timePrecision',
  'calendarKind',
  'timeZone',
  'profileVersion',
  'timezoneDataVersion',
  'referenceDataVersion',
]);

const defaultEngine: InyeonPrimaryEngine = {
  calculate(input) {
    return calculateFourPillars(input);
  },
};

function fail(code: InyeonSajuErrorCode, message: string): { status: 'error'; error: { code: InyeonSajuErrorCode; message: string } } {
  return { status: 'error', error: { code, message } };
}

function provenance() {
  return {
    profileVersion: 'korean-saju-v1',
    profileStatus: 'candidate',
    adapterVersion: '0.3.0',
    upstreamName: 'manseryeok',
    upstreamVersion: '2.0.0',
    timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1',
    referenceDataVersion: 'issue-10-solar-term-boundaries-v1',
    solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1',
    solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1',
    solarTermPrecision: 'minute',
    derivedFeatureVersion: 'not-applicable',
  } as const;
}

function yearMonthProvenance() {
  return {
    profileVersion: 'korean-saju-v1',
    profileStatus: 'candidate',
    adapterVersion: '0.3.0',
    upstreamName: 'manseryeok',
    upstreamVersion: '2.0.0',
    timezoneResolverVersion: '0.1.0',
    timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
    referenceDataVersion: 'issue-11-year-month-differential-v1',
    solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1',
    solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1',
    solarTermPrecision: 'minute',
    derivedFeatureVersion: 'not-applicable',
  } as const;
}

function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

function parseTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

function domainValue<T extends readonly string[]>(values: T, value: string): T[number] | null {
  return values.includes(value as T[number]) ? (value as T[number]) : null;
}

function normalizePillar(value: InyeonPrimaryEngineOutput['year']): NormalizedPillar | null {
  const stem = domainValue(STEMS, value.heavenlyStem);
  const branch = domainValue(BRANCHES, value.earthlyBranch);
  if (!stem || !branch) return null;
  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCHES.indexOf(branch);
  return {
    stem: stem as HeavenlyStemHangul,
    branch: branch as EarthlyBranchHangul,
    stemHanja: STEM_HANJA[stemIndex] ?? '',
    branchHanja: BRANCH_HANJA[branchIndex] ?? '',
  };
}

type ProjectedYearMonth =
  | { readonly status: 'ok'; readonly pillars: NormalizedYearMonthPillars }
  | { readonly status: 'out-of-range' }
  | { readonly status: 'invalid-output' };

function normalizedYearMonthAtInstant(engine: InyeonPrimaryEngine, instant: string): ProjectedYearMonth {
  const instantMilliseconds = Date.parse(instant);
  if (!Number.isFinite(instantMilliseconds) || instantMilliseconds % 60_000 !== 0) return { status: 'invalid-output' };
  const projected = new Date(instantMilliseconds + KST_OFFSET_MILLISECONDS);
  const projectedDate = projected.toISOString().slice(0, 10);
  if (projectedDate < MINIMUM_YEAR_MONTH_DATE || projectedDate > MAXIMUM_YEAR_MONTH_DATE) return { status: 'out-of-range' };
  const raw = engine.calculate({
    year: projected.getUTCFullYear(),
    month: projected.getUTCMonth() + 1,
    day: projected.getUTCDate(),
    hour: projected.getUTCHours(),
    minute: projected.getUTCMinutes(),
    dayBoundary: 'midnight',
  });
  const year = normalizePillar(raw.year);
  const month = normalizePillar(raw.month);
  return year && month ? { status: 'ok', pillars: { year, month } } : { status: 'invalid-output' };
}

function sameYearMonth(left: NormalizedYearMonthPillars, right: NormalizedYearMonthPillars): boolean {
  return left.year.stem === right.year.stem
    && left.year.branch === right.year.branch
    && left.month.stem === right.month.stem
    && left.month.branch === right.month.branch;
}

function mapResolverError(code: string): InyeonSajuErrorCode {
  switch (code) {
    case 'DATE_INVALID': return 'DATE_INVALID';
    case 'DATE_OUT_OF_RANGE': return 'DATE_OUT_OF_RANGE';
    case 'TIME_INVALID': return 'TIME_INVALID';
    case 'TIME_PRECISION_INVALID': return 'TIME_PRECISION_UNSUPPORTED';
    case 'TIMEZONE_UNSUPPORTED': return 'TIMEZONE_UNSUPPORTED';
    case 'VERSION_UNSUPPORTED': return 'VERSION_UNSUPPORTED';
    default: return 'INPUT_INVALID';
  }
}

export function createInyeonSajuAdapter(engine: InyeonPrimaryEngine = defaultEngine): InyeonSajuAdapter {
  return {
    calculate(input) {
      if (input == null || typeof input !== 'object') return fail('INPUT_INVALID', 'A normalized birth context is required.');
      if (input.profileVersion !== 'korean-saju-v1') return fail('PROFILE_UNSUPPORTED', 'Only the korean-saju-v1 candidate profile is supported.');
      if (input.timezoneDataVersion !== 'fixed-kst-utc-plus-09-1989-2024-v1' || input.referenceDataVersion !== 'issue-10-solar-term-boundaries-v1') {
        return fail('VERSION_UNSUPPORTED', 'Input reference versions do not match this adapter build.');
      }
      if (input.calendarKind !== 'solar') return fail('CALENDAR_UNSUPPORTED', 'Only the solar Gregorian calendar is supported by this adapter version.');
      if (input.timeZone !== 'Asia/Seoul') return fail('TIMEZONE_UNSUPPORTED', 'Only Asia/Seoul is validated by this adapter version.');
      if (input.ambiguity !== 'unambiguous') return fail('AMBIGUOUS_LOCAL_TIME', 'Ambiguous or nonexistent local times are not silently resolved.');
      const date = parseDate(input.localDate);
      if (!date) return fail('DATE_INVALID', 'localDate must be a real Gregorian date in YYYY-MM-DD form.');
      if (input.localDate < '1989-01-01' || input.localDate > '2024-12-31') {
        return fail('DATE_OUT_OF_RANGE', 'Validated Asia/Seoul civil dates are 1989-01-01 through 2024-12-31 inclusive.');
      }

      if (input.timePrecision === 'unknown') {
        if (input.localTime !== null || input.timeRange != null) return fail('TIME_INVALID', 'Unknown birth time must not contain a local time or range.');
        return {
          status: 'partial',
          reason: 'BIRTH_TIME_UNKNOWN',
          pillars: null,
          dayMaster: null,
          availability: { year: false, month: false, day: false, hour: false },
          alternatives: [],
          provenance: provenance(),
        };
      }
      if (input.timePrecision !== 'exact') return fail('TIME_PRECISION_UNSUPPORTED', 'Approximate or disputed time ranges require boundary-aware alternatives and are not enabled yet.');
      if (input.timeRange != null) return fail('TIME_INVALID', 'Exact birth time must not contain an approximate or disputed range.');
      if (input.localTime === null) return fail('TIME_INVALID', 'Exact birth time requires HH:MM localTime.');
      const time = parseTime(input.localTime);
      if (!time) return fail('TIME_INVALID', 'localTime must be a real 24-hour time in HH:MM form.');

      try {
        const raw = engine.calculate({ ...date, ...time, dayBoundary: 'midnight' });
        const year = normalizePillar(raw.year);
        const month = normalizePillar(raw.month);
        const day = normalizePillar(raw.day);
        const hour = normalizePillar(raw.hour);
        if (!year || !month || !day || !hour) return fail('UPSTREAM_FAILURE', 'The primary engine returned a value outside the INYEON domain.');
        return {
          status: 'complete',
          pillars: { year, month, day, hour },
          dayMaster: day.stem,
          availability: { year: true, month: true, day: true, hour: true },
          alternatives: [],
          provenance: provenance(),
        };
      } catch {
        return fail('UPSTREAM_FAILURE', 'The primary calculation engine could not produce a normalized chart.');
      }
    },
    calculateYearMonth(input: NormalizedYearMonthContext): InyeonYearMonthResult {
      if (input == null || typeof input !== 'object') return fail('INPUT_INVALID', 'A normalized year/month birth context is required.');
      if (Object.keys(input).some((key) => !YEAR_MONTH_INPUT_KEYS.has(key))) {
        return fail('INPUT_INVALID', 'The year/month birth context contains unsupported fields.');
      }
      if (input.profileVersion !== 'korean-saju-v1') return fail('PROFILE_UNSUPPORTED', 'Only the korean-saju-v1 candidate profile is supported.');
      if (input.referenceDataVersion !== 'issue-11-year-month-differential-v1') {
        return fail('VERSION_UNSUPPORTED', 'Input reference versions do not match this adapter build.');
      }
      if (input.calendarKind !== 'solar') return fail('CALENDAR_UNSUPPORTED', 'Only the solar Gregorian calendar is supported by this adapter version.');
      if (input.timePrecision !== 'exact') return fail('TIME_PRECISION_UNSUPPORTED', 'Year/month calculation currently requires an exact local time.');

      const resolution = inyeonLocalTimeResolver.resolve({
        localDate: input.localDate,
        localTime: input.localTime,
        timePrecision: input.timePrecision,
        timeZone: input.timeZone,
        timezoneDataVersion: input.timezoneDataVersion,
      });
      if (resolution.status === 'invalid' || resolution.status === 'unsupported') {
        return fail(mapResolverError(resolution.error.code), 'The local civil time could not be normalized for year/month calculation.');
      }
      if (resolution.status === 'unknown') return fail('TIME_PRECISION_UNSUPPORTED', 'Year/month calculation currently requires an exact local time.');
      if (resolution.status === 'nonexistent') return fail('NONEXISTENT_LOCAL_TIME', 'The local civil time does not exist in the selected timezone.');
      try {
        const projected = resolution.candidates.map((candidate) => normalizedYearMonthAtInstant(engine, candidate.instant));
        if (projected.some((candidate) => candidate.status === 'out-of-range')) {
          return fail('DATE_OUT_OF_RANGE', 'The resolved instant falls outside the validated KST-projected date range.');
        }
        if (projected.some((candidate) => candidate.status === 'invalid-output')) {
          return fail('UPSTREAM_FAILURE', 'The primary calculation engine could not produce normalized year/month pillars.');
        }
        const normalized = projected.map((candidate) => (
          candidate.status === 'ok' ? candidate.pillars : null
        )).filter((candidate): candidate is NormalizedYearMonthPillars => candidate !== null);
        const first = normalized[0];
        if (!first) return fail('UPSTREAM_FAILURE', 'The primary calculation engine could not produce normalized year/month pillars.');
        if (normalized.length === 1) {
          return {
            status: 'complete', pillars: first, resolution: 'unambiguous', candidateCount: 1,
            alternatives: [], provenance: yearMonthProvenance(),
          };
        }
        if (normalized.every((candidate) => sameYearMonth(first, candidate))) {
          return {
            status: 'complete', pillars: first, resolution: 'ambiguous-same-output', candidateCount: 2,
            alternatives: [], provenance: yearMonthProvenance(),
          };
        }
        const alternatives = normalized.filter((candidate, index, values) => (
          values.findIndex((value) => sameYearMonth(value, candidate)) === index
        ));
        return {
          status: 'ambiguous', reason: 'LOCAL_TIME_AMBIGUOUS_YEAR_MONTH', pillars: null,
          resolution: 'ambiguous-different-outputs', candidateCount: 2, alternatives,
          provenance: yearMonthProvenance(),
        };
      } catch {
        return fail('UPSTREAM_FAILURE', 'The primary calculation engine could not produce normalized year/month pillars.');
      }
    },
  };
}

export const inyeonSajuAdapter = Object.freeze(createInyeonSajuAdapter());

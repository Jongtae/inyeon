import { calculateFourPillars } from 'manseryeok';

import type {
  EarthlyBranchHangul,
  HeavenlyStemHangul,
  InyeonPrimaryEngine,
  InyeonPrimaryEngineOutput,
  InyeonSajuAdapter,
  InyeonSajuErrorCode,
  InyeonSajuResult,
  NormalizedPillar,
} from './types.js';

const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
const STEM_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

const defaultEngine: InyeonPrimaryEngine = {
  calculate(input) {
    return calculateFourPillars(input);
  },
};

function fail(code: InyeonSajuErrorCode, message: string): InyeonSajuResult {
  return { status: 'error', error: { code, message } };
}

function provenance() {
  return {
    profileVersion: 'korean-saju-v1',
    profileStatus: 'candidate',
    adapterVersion: '0.2.0',
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
  };
}

export const inyeonSajuAdapter = Object.freeze(createInyeonSajuAdapter());

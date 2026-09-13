import { packedTimezoneData } from './timezone-data.js';
import {
  TIMEZONE_DATA_VERSION,
  type InyeonLocalTimeResolver,
  type LocalTimeResolution,
  type LocalTimeResolverInput,
  type ResolvedInstantCandidate,
  type ResolverErrorCode,
  type SupportedTimeZone,
} from './types.js';

const MINIMUM_DATE = '1908-04-01';
const MAXIMUM_DATE = '2026-12-31';
const SUPPORTED_ZONES = new Set<SupportedTimeZone>([
  'America/Los_Angeles',
  'America/New_York',
  'Asia/Seoul',
]);
const INPUT_KEYS = new Set(['localDate', 'localTime', 'timePrecision', 'timeZone', 'timezoneDataVersion']);

interface ZoneTable {
  readonly name: string;
  readonly sentinelMinimumEpochMilliseconds: number;
  readonly sentinelMaximumEpochMilliseconds: number;
  readonly offsetsSecondsEast: readonly number[];
  readonly untilEpochMilliseconds: readonly number[];
}

const zones = new Map<SupportedTimeZone, ZoneTable>();
for (const zone of packedTimezoneData.zones) {
  if (!SUPPORTED_ZONES.has(zone.name as SupportedTimeZone)) throw new Error('Invalid bundled timezone artifact.');
  if (zone.offsetsSecondsEast.length !== zone.untilEpochMilliseconds.length) throw new Error('Invalid bundled timezone transition table.');
  zones.set(zone.name as SupportedTimeZone, zone);
}
if (zones.size !== SUPPORTED_ZONES.size) throw new Error('Incomplete bundled timezone artifact.');

function fail(status: 'invalid' | 'unsupported', code: ResolverErrorCode, message: string): LocalTimeResolution {
  return { status, candidates: [], error: { code, message }, timezoneDataVersion: TIMEZONE_DATA_VERSION };
}

function parseDate(value: unknown): { year: number; month: number; day: number } | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

function parseTime(value: unknown): { hour: number; minute: number } | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

function civilEpochMilliseconds(date: { year: number; month: number; day: number }, time: { hour: number; minute: number }): number {
  const value = new Date(0);
  value.setUTCHours(time.hour, time.minute, 0, 0);
  value.setUTCFullYear(date.year, date.month - 1, date.day);
  return value.getTime();
}

function formatOffset(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? '-' : '+';
  const absolute = Math.abs(offsetSeconds);
  const hours = Math.floor(absolute / 3600);
  const minutes = Math.floor((absolute % 3600) / 60);
  const seconds = absolute % 60;
  const base = `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return seconds === 0 ? base : `${base}:${String(seconds).padStart(2, '0')}`;
}

function offsetSecondsEastAt(zone: ZoneTable, instantMilliseconds: number): number | null {
  if (instantMilliseconds < zone.sentinelMinimumEpochMilliseconds || instantMilliseconds >= zone.sentinelMaximumEpochMilliseconds) return null;
  let low = 0;
  let high = zone.untilEpochMilliseconds.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (instantMilliseconds < zone.untilEpochMilliseconds[middle]!) high = middle;
    else low = middle + 1;
  }
  return zone.offsetsSecondsEast[low] ?? null;
}

function findCandidates(zone: ZoneTable, localEpoch: number): ResolvedInstantCandidate[] {
  const offsetsSecondsEast = [...new Set(zone.offsetsSecondsEast)];
  const candidates: ResolvedInstantCandidate[] = [];
  for (const offsetSeconds of offsetsSecondsEast) {
    const instantMilliseconds = localEpoch - offsetSeconds * 1_000;
    if (offsetSecondsEastAt(zone, instantMilliseconds) !== offsetSeconds) continue;
    if (instantMilliseconds + offsetSeconds * 1_000 !== localEpoch) continue;
    candidates.push({
      instant: new Date(instantMilliseconds).toISOString(),
      offset: formatOffset(offsetSeconds),
      offsetSeconds,
    });
  }
  candidates.sort((left, right) => left.instant.localeCompare(right.instant));
  return candidates;
}

function createInyeonLocalTimeResolver(): InyeonLocalTimeResolver {
  const resolver: InyeonLocalTimeResolver = {
    resolve(input: LocalTimeResolverInput): LocalTimeResolution {
      if (input == null || typeof input !== 'object') return fail('invalid', 'INPUT_INVALID', 'A local-time resolver input is required.');
      if (Object.keys(input).some((key) => !INPUT_KEYS.has(key))) return fail('invalid', 'INPUT_INVALID', 'The resolver input contains unsupported fields.');
      if (input.timezoneDataVersion !== TIMEZONE_DATA_VERSION) return fail('unsupported', 'VERSION_UNSUPPORTED', 'The timezone data version is not supported by this resolver.');
      const date = parseDate(input.localDate);
      if (!date) return fail('invalid', 'DATE_INVALID', 'localDate must be a real Gregorian date in YYYY-MM-DD form.');
      if (input.localDate < MINIMUM_DATE || input.localDate > MAXIMUM_DATE) {
        return fail('unsupported', 'DATE_OUT_OF_RANGE', 'Supported civil dates are 1908-04-01 through 2026-12-31 inclusive.');
      }
      if (input.timePrecision !== 'exact' && input.timePrecision !== 'unknown') {
        return fail('invalid', 'TIME_PRECISION_INVALID', 'timePrecision must be exact or unknown.');
      }
      if (typeof input.timeZone !== 'string') return fail('invalid', 'INPUT_INVALID', 'timeZone must be a string.');
      if (input.timePrecision === 'unknown') {
        if (input.localTime !== null) return fail('invalid', 'TIME_INVALID', 'Unknown time must not contain a localTime value.');
        return { status: 'unknown', candidates: [], timezoneDataVersion: TIMEZONE_DATA_VERSION };
      }
      const time = parseTime(input.localTime);
      if (!time) return fail('invalid', 'TIME_INVALID', 'Exact localTime must be a real 24-hour time in HH:MM form.');
      if (!SUPPORTED_ZONES.has(input.timeZone as SupportedTimeZone)) {
        return fail('unsupported', 'TIMEZONE_UNSUPPORTED', 'The timezone is not supported by this resolver build.');
      }
      const zone = zones.get(input.timeZone as SupportedTimeZone);
      if (!zone) return fail('unsupported', 'TIMEZONE_UNSUPPORTED', 'The timezone is not supported by this resolver build.');
      const candidates = findCandidates(zone, civilEpochMilliseconds(date, time));
      if (candidates.length === 0) return { status: 'nonexistent', candidates: [], timezoneDataVersion: TIMEZONE_DATA_VERSION };
      if (candidates.length === 1) return { status: 'unambiguous', candidates: [candidates[0]!], timezoneDataVersion: TIMEZONE_DATA_VERSION };
      if (candidates.length === 2) return { status: 'ambiguous', candidates: [candidates[0]!, candidates[1]!], timezoneDataVersion: TIMEZONE_DATA_VERSION };
      return fail('invalid', 'INPUT_INVALID', 'Timezone data produced an unsupported candidate count.');
    },
  };
  return Object.freeze(resolver);
}

export const inyeonLocalTimeResolver = createInyeonLocalTimeResolver();

export const TIMEZONE_DATA_VERSION = 'iana-2026c-inyeon-filter-v1' as const;

export type SupportedTimeZone = 'America/Los_Angeles' | 'America/New_York' | 'Asia/Seoul';
export type ResolverTimePrecision = 'exact' | 'unknown';

export interface LocalTimeResolverInput {
  readonly localDate: string;
  readonly localTime: string | null;
  readonly timePrecision: ResolverTimePrecision;
  readonly timeZone: string;
  readonly timezoneDataVersion: typeof TIMEZONE_DATA_VERSION;
}

export interface ResolvedInstantCandidate {
  /** UTC instant, serialized without depending on the host timezone. */
  readonly instant: string;
  /** Local offset east of UTC. Historical values may include seconds. */
  readonly offset: string;
  readonly offsetSeconds: number;
}

export type ResolverErrorCode =
  | 'DATE_INVALID'
  | 'DATE_OUT_OF_RANGE'
  | 'INPUT_INVALID'
  | 'TIME_INVALID'
  | 'TIME_PRECISION_INVALID'
  | 'TIMEZONE_UNSUPPORTED'
  | 'VERSION_UNSUPPORTED';

export interface ResolverError {
  readonly code: ResolverErrorCode;
  readonly message: string;
}

export type LocalTimeResolution =
  | { readonly status: 'invalid'; readonly candidates: readonly []; readonly error: ResolverError; readonly timezoneDataVersion: typeof TIMEZONE_DATA_VERSION }
  | { readonly status: 'unsupported'; readonly candidates: readonly []; readonly error: ResolverError; readonly timezoneDataVersion: typeof TIMEZONE_DATA_VERSION }
  | { readonly status: 'unknown'; readonly candidates: readonly []; readonly timezoneDataVersion: typeof TIMEZONE_DATA_VERSION }
  | { readonly status: 'nonexistent'; readonly candidates: readonly []; readonly timezoneDataVersion: typeof TIMEZONE_DATA_VERSION }
  | { readonly status: 'unambiguous'; readonly candidates: readonly [ResolvedInstantCandidate]; readonly timezoneDataVersion: typeof TIMEZONE_DATA_VERSION }
  | { readonly status: 'ambiguous'; readonly candidates: readonly [ResolvedInstantCandidate, ResolvedInstantCandidate]; readonly timezoneDataVersion: typeof TIMEZONE_DATA_VERSION };

export interface InyeonLocalTimeResolver {
  readonly resolve: (input: LocalTimeResolverInput) => LocalTimeResolution;
}

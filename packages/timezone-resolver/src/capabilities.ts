import { packedTimezoneData } from './timezone-data.js';
import { TIMEZONE_DATA_VERSION } from './types.js';

export const TIMEZONE_RESOLVER_CAPABILITIES = Object.freeze({
  resolverVersion: '0.1.0',
  timezoneDataVersion: TIMEZONE_DATA_VERSION,
  ianaVersion: '2026c',
  transitionTableSha256: packedTimezoneData.transitionTableSha256,
  supportedTimeZones: Object.freeze([
    'America/Los_Angeles',
    'America/New_York',
    'Asia/Seoul',
  ] as const),
  supportedCivilDateRange: Object.freeze({ minimum: '1908-04-01', maximum: '2026-12-31' }),
  outputCandidateCounts: Object.freeze([0, 1, 2] as const),
  sajuAdapterCapabilityExpansion: false,
  productionEligible: false,
});

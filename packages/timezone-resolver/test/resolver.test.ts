import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  TIMEZONE_DATA_VERSION,
  TIMEZONE_RESOLVER_CAPABILITIES,
  inyeonLocalTimeResolver,
  type LocalTimeResolverInput,
} from '../src/index.js';
import artifact from '../data/iana-2026c-filtered.json' with { type: 'json' };
import reference from '../data/iana-reference-fixtures.v1.json' with { type: 'json' };

function exact(overrides: Partial<LocalTimeResolverInput> = {}): LocalTimeResolverInput {
  return {
    localDate: '2024-01-15',
    localTime: '12:00',
    timePrecision: 'exact',
    timeZone: 'Asia/Seoul',
    timezoneDataVersion: TIMEZONE_DATA_VERSION,
    ...overrides,
  };
}

function civilMinuteFromEpoch(localEpoch: number): { localDate: string; localTime: string } {
  const value = new Date(Math.floor(localEpoch / 60_000) * 60_000).toISOString();
  return { localDate: value.slice(0, 10), localTime: value.slice(11, 16) };
}

describe('INYEON local-time resolver', () => {
  it('ships only the reviewed canonical zones and exact provenance', () => {
    const computedTransitionTableHash = createHash('sha256').update(JSON.stringify(artifact.zones)).digest('hex');
    expect(artifact.timezoneDataVersion).toBe(TIMEZONE_DATA_VERSION);
    expect(artifact.ianaVersion).toBe('2026c');
    expect(artifact.transitionTableSha256).toBe('3e64bb05dfb4d8492c10a4ab11ca1cd6566748893998863c94db6deef85064d7');
    expect(computedTransitionTableHash).toBe(artifact.transitionTableSha256);
    expect(artifact.zones.map((zone) => zone.name)).toEqual([
      'America/Los_Angeles',
      'America/New_York',
      'Asia/Seoul',
    ]);
    expect(artifact.source).toMatchObject({
      ianaTarballSha256: 'e4a178a4477f3d0ea77cc31828ff72aa38feff8d61aa13e7e99e142e9d902be4',
      momentTimezoneVersion: '0.6.3',
      momentTimezonePackedDataSha256: '43f7878a298740ff6acabb9c726c7e5431a94bdca79abad274a6fe6e355bfe81',
    });
    expect(TIMEZONE_RESOLVER_CAPABILITIES).toMatchObject({
      timezoneDataVersion: TIMEZONE_DATA_VERSION,
      ianaVersion: '2026c',
      transitionTableSha256: artifact.transitionTableSha256,
      supportedTimeZones: ['America/Los_Angeles', 'America/New_York', 'Asia/Seoul'],
      supportedCivilDateRange: { minimum: '1908-04-01', maximum: '2026-12-31' },
      sajuAdapterCapabilityExpansion: false,
      productionEligible: false,
    });
    expect(Object.isFrozen(TIMEZONE_RESOLVER_CAPABILITIES)).toBe(true);
  });

  it.each(reference.fixtures)('matches official IANA zic/zdump fixture $id', ({ input, expected }) => {
    const result = inyeonLocalTimeResolver.resolve(exact(input));
    expect({ status: result.status, candidates: result.candidates }).toEqual(expected);
    expect(result.candidates).toHaveLength(result.status === 'ambiguous' ? 2 : result.status === 'unambiguous' ? 1 : 0);
  });

  it('validates every generated transition and transition-adjacent candidate cardinality', () => {
    for (const zone of artifact.zones) {
      expect(zone.offsetsSecondsEast).toHaveLength(zone.untilEpochMilliseconds.length);
      expect(zone.offsetsSecondsEast.every(Number.isSafeInteger)).toBe(true);
      expect(zone.untilEpochMilliseconds.every(Number.isSafeInteger)).toBe(true);
      for (let index = 1; index < zone.untilEpochMilliseconds.length; index += 1) {
        expect(zone.untilEpochMilliseconds[index]!).toBeGreaterThan(zone.untilEpochMilliseconds[index - 1]!);
      }
      for (let index = 0; index < zone.untilEpochMilliseconds.length - 1; index += 1) {
        const transition = zone.untilEpochMilliseconds[index]!;
        const oldOffset = zone.offsetsSecondsEast[index]!;
        const newOffset = zone.offsetsSecondsEast[index + 1]!;
        if (oldOffset === newOffset) continue;
        const oldLocalBoundary = transition + oldOffset * 1_000;
        const newLocalBoundary = transition + newOffset * 1_000;
        const middleLocal = Math.min(oldLocalBoundary, newLocalBoundary) + Math.abs(newLocalBoundary - oldLocalBoundary) / 2;
        const local = civilMinuteFromEpoch(middleLocal);
        if (local.localDate < artifact.supportedCivilDateRange.minimum || local.localDate > artifact.supportedCivilDateRange.maximum) continue;
        const result = inyeonLocalTimeResolver.resolve(exact({ ...local, timeZone: zone.name }));
        expect(result.status, `${zone.name} transition ${new Date(transition).toISOString()}`).toBe(newOffset > oldOffset ? 'nonexistent' : 'ambiguous');
        expect(result.candidates.length).toBeLessThanOrEqual(2);
        for (const candidate of result.candidates) {
          expect(new Date(candidate.instant).getTime() + candidate.offsetSeconds * 1_000).toBe(Math.floor(middleLocal / 60_000) * 60_000);
        }
      }
    }
  });

  it('returns deterministic chronological candidates instead of choosing a fold side', () => {
    const input = exact({ localDate: '2024-11-03', localTime: '01:30', timeZone: 'America/New_York' });
    const first = inyeonLocalTimeResolver.resolve(input);
    expect(inyeonLocalTimeResolver.resolve(input)).toEqual(first);
    expect(first).toEqual({
      status: 'ambiguous',
      candidates: [
        { instant: '2024-11-03T05:30:00.000Z', offset: '-04:00', offsetSeconds: -14400 },
        { instant: '2024-11-03T06:30:00.000Z', offset: '-05:00', offsetSeconds: -18000 },
      ],
      timezoneDataVersion: TIMEZONE_DATA_VERSION,
    });
  });

  it('returns a gap without Moment default forward shifting', () => {
    expect(inyeonLocalTimeResolver.resolve(exact({
      localDate: '2024-03-10', localTime: '02:30', timeZone: 'America/New_York',
    }))).toEqual({ status: 'nonexistent', candidates: [], timezoneDataVersion: TIMEZONE_DATA_VERSION });
  });

  it('resolves both inclusive civil-date boundaries without escaping sentinel coverage', () => {
    expect(inyeonLocalTimeResolver.resolve(exact({
      localDate: '1908-04-01', localTime: '00:00', timeZone: 'America/Los_Angeles',
    }))).toEqual({
      status: 'unambiguous',
      candidates: [{ instant: '1908-04-01T08:00:00.000Z', offset: '-08:00', offsetSeconds: -28800 }],
      timezoneDataVersion: TIMEZONE_DATA_VERSION,
    });
    expect(inyeonLocalTimeResolver.resolve(exact({
      localDate: '2026-12-31', localTime: '23:59', timeZone: 'Asia/Seoul',
    }))).toEqual({
      status: 'unambiguous',
      candidates: [{ instant: '2026-12-31T14:59:00.000Z', offset: '+09:00', offsetSeconds: 32400 }],
      timezoneDataVersion: TIMEZONE_DATA_VERSION,
    });
  });

  it('bypasses timezone calculation when time is unknown', () => {
    expect(inyeonLocalTimeResolver.resolve(exact({
      localTime: null,
      timePrecision: 'unknown',
      timeZone: 'Not/A/Timezone',
    }))).toEqual({ status: 'unknown', candidates: [], timezoneDataVersion: TIMEZONE_DATA_VERSION });
  });

  it.each([
    [null, 'invalid', 'INPUT_INVALID'],
    [{}, 'unsupported', 'VERSION_UNSUPPORTED'],
    [exact({ localDate: '2023-02-29' }), 'invalid', 'DATE_INVALID'],
    [exact({ localDate: '2024-1-01' }), 'invalid', 'DATE_INVALID'],
    [exact({ localDate: '1908-03-31' }), 'unsupported', 'DATE_OUT_OF_RANGE'],
    [exact({ localDate: '2027-01-01' }), 'unsupported', 'DATE_OUT_OF_RANGE'],
    [exact({ localTime: '24:00' }), 'invalid', 'TIME_INVALID'],
    [exact({ localTime: '1:00' }), 'invalid', 'TIME_INVALID'],
    [exact({ localTime: null }), 'invalid', 'TIME_INVALID'],
    [exact({ localTime: '12:00', timePrecision: 'unknown' }), 'invalid', 'TIME_INVALID'],
    [exact({ timeZone: 'US/Eastern' }), 'unsupported', 'TIMEZONE_UNSUPPORTED'],
    [exact({ timezoneDataVersion: 'future' as typeof TIMEZONE_DATA_VERSION }), 'unsupported', 'VERSION_UNSUPPORTED'],
    [exact({ timePrecision: 'approximate' as 'exact' }), 'invalid', 'TIME_PRECISION_INVALID'],
    [exact({ localTime: null, timePrecision: 'unknown', timeZone: 9 as unknown as string }), 'invalid', 'INPUT_INVALID'],
  ])('returns bounded validation result for %#', (input, status, code) => {
    const result = inyeonLocalTimeResolver.resolve(input as LocalTimeResolverInput);
    expect(result.status).toBe(status);
    expect(result).toMatchObject({ candidates: [], error: { code } });
    expect(JSON.stringify(result).length).toBeLessThan(300);
  });

  it('does not expose protected runtime values or touch side-effect channels', () => {
    const fetchSpy = vi.fn();
    const xhrSpy = vi.fn();
    const webSocketSpy = vi.fn();
    const storageSetSpy = vi.fn();
    const cacheOpenSpy = vi.fn();
    const historyPushSpy = vi.fn();
    const historyReplaceSpy = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('XMLHttpRequest', xhrSpy);
    vi.stubGlobal('WebSocket', webSocketSpy);
    vi.stubGlobal('localStorage', { setItem: storageSetSpy });
    vi.stubGlobal('sessionStorage', { setItem: storageSetSpy });
    vi.stubGlobal('indexedDB', { open: storageSetSpy });
    vi.stubGlobal('caches', { open: cacheOpenSpy });
    vi.stubGlobal('history', { pushState: historyPushSpy, replaceState: historyReplaceSpy });
    try {
      const protectedCanaries = ['37.5665', '126.9780', 'PRIVATE_BIRTHPLACE_CANARY'];
      const result = inyeonLocalTimeResolver.resolve({
        ...exact({ timeZone: 'PRIVATE_BIRTHPLACE_CANARY' }),
        coordinates: { latitude: 37.5665, longitude: 126.978 },
        placeLabel: 'PRIVATE_BIRTHPLACE_CANARY',
      } as LocalTimeResolverInput);
      expect(result).toMatchObject({ status: 'invalid', error: { code: 'INPUT_INVALID' } });
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(xhrSpy).not.toHaveBeenCalled();
      expect(webSocketSpy).not.toHaveBeenCalled();
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(cacheOpenSpy).not.toHaveBeenCalled();
      expect(historyPushSpy).not.toHaveBeenCalled();
      expect(historyReplaceSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      for (const canary of protectedCanaries) expect(JSON.stringify(result)).not.toContain(canary);
    } finally {
      vi.unstubAllGlobals();
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    }
  });

  it('does not share runtime calculation state with the packaged provenance artifact', () => {
    const seoul = artifact.zones.find((zone) => zone.name === 'Asia/Seoul')!;
    const originalOffsets = [...seoul.offsetsSecondsEast];
    const originalHash = artifact.transitionTableSha256;
    try {
      seoul.offsetsSecondsEast.fill(0);
      artifact.transitionTableSha256 = 'attacker-controlled-provenance';
      expect(inyeonLocalTimeResolver.resolve(exact())).toEqual({
        status: 'unambiguous',
        candidates: [{ instant: '2024-01-15T03:00:00.000Z', offset: '+09:00', offsetSeconds: 32400 }],
        timezoneDataVersion: TIMEZONE_DATA_VERSION,
      });
      expect(TIMEZONE_RESOLVER_CAPABILITIES.transitionTableSha256).toBe(originalHash);
    } finally {
      seoul.offsetsSecondsEast.splice(0, seoul.offsetsSecondsEast.length, ...originalOffsets);
      artifact.transitionTableSha256 = originalHash;
    }
  });

  it('does not use browser timezone databases or side-effect channels anywhere in runtime source', () => {
    const runtimeFiles = ['index.ts', 'types.ts', 'capabilities.ts', 'timezone-data.ts', 'generated-timezone-data.ts', 'resolver.ts'];
    const forbidden = ['Intl.', 'Temporal.', 'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'caches.', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'console.', 'geolocation', 'dynamic import'];
    for (const runtimeFile of runtimeFiles) {
      const source = readFileSync(resolve(import.meta.dirname, `../src/${runtimeFile}`), 'utf8');
      for (const term of forbidden) expect(source, runtimeFile).not.toContain(term);
    }
  });

  it('performs no protected side effect while runtime modules are imported', async () => {
    vi.resetModules();
    const sideEffectSpy = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', sideEffectSpy);
    vi.stubGlobal('XMLHttpRequest', sideEffectSpy);
    vi.stubGlobal('WebSocket', sideEffectSpy);
    vi.stubGlobal('localStorage', { setItem: sideEffectSpy });
    vi.stubGlobal('sessionStorage', { setItem: sideEffectSpy });
    vi.stubGlobal('indexedDB', { open: sideEffectSpy });
    vi.stubGlobal('caches', { open: sideEffectSpy });
    vi.stubGlobal('history', { pushState: sideEffectSpy, replaceState: sideEffectSpy });
    try {
      const runtimeEntry = '../src/index.js?privacy-import-canary';
      const imported = await import(runtimeEntry);
      expect(imported.inyeonLocalTimeResolver).toBeDefined();
      expect(sideEffectSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    }
  });
});

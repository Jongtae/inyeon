import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { inyeonSajuAdapter, type NormalizedChartContext } from '../src/index.js';
import { createInyeonSajuAdapter } from '../src/adapter.js';

const common = {
  calendarKind: 'solar',
  timeZone: 'America/New_York',
  profileVersion: 'korean-saju-v1',
  timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
  referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
} as const;

describe('timezone-normalized day/hour uncertainty calculation', () => {
  it('returns one complete Hangul-first exact chart without exposing temporal inputs', () => {
    const result = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
    });
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') return;
    expect(result).toMatchObject({
      temporalSupport: 'exact', candidateCount: 1, variantCount: 1,
      evaluatedCivilMinuteCount: 1, nonexistentCivilMinuteCount: 0, containsFold: false,
      stablePillars: {
        year: { support: 'invariant' }, month: { support: 'invariant' },
        day: { support: 'invariant' }, hour: { support: 'invariant' },
      },
      hourDependentEvidence: { eligible: true, reason: null },
      provenance: {
        adapterVersion: '0.4.0', referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
        yearMonthReferenceDataVersion: 'issue-11-year-month-differential-v1',
        solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1',
        uncertaintyAlgebraVersion: 'birth-time-uncertainty-v1',
        dayBoundary: 'local-civil-midnight',
        hourBranchConvention: 'local-civil-two-hour-intervals-from-23:00',
        trueSolarTime: false, productionValidated: false,
      },
    });
    expect(result.variants[0].id).toBe('variant-001');
    expect(result.variants[0].pillars.day.stem).toMatch(/^[갑을병정무기경신임계]$/u);
    expect(result.variants[0].pillars.day.stemHanja).toMatch(/^.$/u);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('2024-06-15');
    expect(serialized).not.toContain('12:00');
    expect(serialized).not.toContain('offset');
    expect(serialized).not.toContain('instant');
  });

  it('deduplicates an approximate hour-boundary range and propagates hour uncertainty', () => {
    const result = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'approximate',
      window: { startLocalDateTime: '2024-06-15T00:45', endLocalDateTime: '2024-06-15T01:15' },
    });
    expect(result).toMatchObject({
      status: 'bounded', temporalSupport: 'approximate', candidateCount: 31, variantCount: 2,
      evaluatedCivilMinuteCount: 31, nonexistentCivilMinuteCount: 0, containsFold: false,
      stablePillars: { day: { support: 'invariant' }, hour: { support: 'alternative', pillar: null } },
      hourDependentEvidence: { eligible: false, reason: 'HOUR_VARIES' },
    });
  });

  it('keeps source-local day/hour semantics consistent across all supported zones', () => {
    const results = (['America/Los_Angeles', 'America/New_York', 'Asia/Seoul'] as const).map((timeZone) => (
      inyeonSajuAdapter.calculateChart({
        ...common, timeZone, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
      })
    ));
    expect(results.every((result) => result.status === 'complete')).toBe(true);
    const dayHours = results.map((result) => result.status === 'complete'
      ? { day: result.variants[0].pillars.day, hour: result.variants[0].pillars.hour }
      : null);
    expect(dayHours[1]).toEqual(dayHours[0]);
    expect(dayHours[2]).toEqual(dayHours[0]);
  });

  it('propagates day and hour alternatives across local civil midnight', () => {
    const result = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'approximate',
      window: { startLocalDateTime: '2024-06-15T23:59', endLocalDateTime: '2024-06-16T00:00' },
    });
    expect(result).toMatchObject({
      status: 'bounded', temporalSupport: 'approximate', candidateCount: 2, variantCount: 2,
      stablePillars: { day: { support: 'alternative' }, hour: { support: 'alternative' } },
      hourDependentEvidence: { eligible: false, reason: 'HOUR_VARIES' },
    });
  });

  it('keeps approximate precision even when the hour is invariant', () => {
    const result = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'approximate',
      window: { startLocalDateTime: '2024-06-15T11:10', endLocalDateTime: '2024-06-15T11:20' },
    });
    expect(result).toMatchObject({
      status: 'bounded', temporalSupport: 'approximate', variantCount: 1,
      stablePillars: { hour: { support: 'invariant' } },
      hourDependentEvidence: { eligible: true, reason: null },
    });
  });

  it('treats disputed windows as a union and never interpolates between them', () => {
    const result = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'disputed', windows: [
        { startLocalDateTime: '2024-06-15T00:00', endLocalDateTime: '2024-06-15T00:00' },
        { startLocalDateTime: '2024-06-15T13:00', endLocalDateTime: '2024-06-15T13:00' },
        { startLocalDateTime: '2024-06-15T00:00', endLocalDateTime: '2024-06-15T00:00' },
      ],
    });
    expect(result).toMatchObject({
      status: 'bounded', temporalSupport: 'disputed', evaluatedCivilMinuteCount: 2,
      candidateCount: 2, variantCount: 2,
    });
  });

  it.each(['date-only', 'unknown'] as const)('evaluates the known date but suppresses every hour for %s', (temporalSupport) => {
    const result = inyeonSajuAdapter.calculateChart({ ...common, temporalSupport, localDate: '2024-06-15' });
    expect(result).toMatchObject({
      status: 'bounded', temporalSupport, evaluatedCivilMinuteCount: 1440,
      candidateCount: 1440, variantCount: 1,
      stablePillars: { day: { support: 'invariant' }, hour: { support: 'unavailable', pillar: null } },
      hourDependentEvidence: { eligible: false, reason: 'TIME_NOT_SUPPORTED' },
    });
    if (result.status !== 'bounded') return;
    for (const variant of result.variants) expect(variant.pillars).not.toHaveProperty('hour');
  });

  it('preserves solar-term alternatives on a date-only input without fabricating an hour', () => {
    const result = inyeonSajuAdapter.calculateChart({
      ...common, timeZone: 'America/Los_Angeles', temporalSupport: 'date-only', localDate: '2024-02-04',
    });
    expect(result).toMatchObject({
      status: 'bounded', variantCount: 2,
      stablePillars: {
        year: { support: 'alternative' }, month: { support: 'alternative' },
        day: { support: 'invariant' }, hour: { support: 'unavailable' },
      },
    });
  });

  it('does not shift DST gaps and keeps every fold candidate', () => {
    const partialGap = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'approximate',
      window: { startLocalDateTime: '2024-03-10T01:30', endLocalDateTime: '2024-03-10T03:30' },
    });
    expect(partialGap).toMatchObject({
      status: 'bounded', evaluatedCivilMinuteCount: 121, nonexistentCivilMinuteCount: 60, candidateCount: 61,
    });
    const allGap = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'approximate',
      window: { startLocalDateTime: '2024-03-10T02:00', endLocalDateTime: '2024-03-10T02:59' },
    });
    expect(allGap).toEqual({ status: 'error', error: { code: 'NONEXISTENT_LOCAL_TIME', message: 'No asserted local civil minute exists in the selected timezone.' } });
    const fold = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-11-03', localTime: '01:30',
    });
    expect(fold).toMatchObject({
      status: 'bounded', temporalSupport: 'exact', candidateCount: 2, variantCount: 1, containsFold: true,
    });
    const exactGap = inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-03-10', localTime: '02:30',
    });
    expect(exactGap).toMatchObject({ status: 'error', error: { code: 'NONEXISTENT_LOCAL_TIME' } });
  });

  it('enforces strict discriminated shapes, ordered windows, and the 2880-minute union cap', () => {
    const inputs = [
      { ...common, temporalSupport: 'exact', localDate: '2024-01-01', localTime: '00:00', windows: [] },
      { ...common, temporalSupport: 'disputed', windows: [] },
      { ...common, temporalSupport: 'approximate', window: { startLocalDateTime: '2024-01-02T00:00', endLocalDateTime: '2024-01-01T00:00' } },
      { ...common, temporalSupport: 'approximate', window: { startLocalDateTime: '2024-01-01T00:00', endLocalDateTime: '2024-01-03T00:00' } },
    ] as unknown as NormalizedChartContext[];
    expect(inyeonSajuAdapter.calculateChart(inputs[0]!)).toMatchObject({ status: 'error', error: { code: 'INPUT_INVALID' } });
    expect(inyeonSajuAdapter.calculateChart(inputs[1]!)).toMatchObject({ status: 'error', error: { code: 'RANGE_INVALID' } });
    expect(inyeonSajuAdapter.calculateChart(inputs[2]!)).toMatchObject({ status: 'error', error: { code: 'RANGE_INVALID' } });
    expect(inyeonSajuAdapter.calculateChart(inputs[3]!)).toMatchObject({ status: 'error', error: { code: 'RANGE_TOO_LARGE' } });
  });

  it('fails closed outside the independently checked source-local day/hour range', () => {
    const beforeRange = inyeonSajuAdapter.calculateChart({
      ...common, timeZone: 'America/Los_Angeles', temporalSupport: 'exact',
      localDate: '1988-12-31', localTime: '23:00',
    });
    expect(beforeRange).toMatchObject({ status: 'error', error: { code: 'DATE_OUT_OF_RANGE' } });
  });

  it('fails closed on invalid upstream output without reflecting protected input or using side effects', () => {
    const invalid = { heavenlyStem: 'PRIVATE_UPSTREAM_VALUE', earthlyBranch: 'X' };
    const adapter = createInyeonSajuAdapter({ calculate: () => ({ year: invalid, month: invalid, day: invalid, hour: invalid }) });
    const sideEffect = vi.fn();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', sideEffect);
    vi.stubGlobal('localStorage', { setItem: sideEffect });
    try {
      const result = adapter.calculateChart({
        ...common, temporalSupport: 'exact', localDate: '1997-08-19', localTime: '04:37',
      });
      expect(result).toMatchObject({ status: 'error', error: { code: 'UPSTREAM_FAILURE' } });
      expect(JSON.stringify(result)).not.toContain('PRIVATE');
      expect(JSON.stringify(result)).not.toContain('1997-08-19');
      expect(sideEffect).not.toHaveBeenCalled();
      expect(consoleLog).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      consoleLog.mockRestore();
    }
  });

  it('pins the focused, non-authoritative day/hour evidence artifact', () => {
    const text = readFileSync(fileURLToPath(new URL('../data/day-hour-evidence.v1.json', import.meta.url)), 'utf8');
    const artifact = JSON.parse(text) as Record<string, unknown> & {
      hourBoundaryRecords: Array<{ localTime: string; state: string; primary: { day: string; hour: string }; comparison: { day: string; hour: string }; classification: string }>;
      modeRecords: Array<{ dayBoundary: string; date: string; localTime: string; primary: { day: string; hour: string } }>;
      fullRangeDifferential: {
        civilDateCount: number; observationCount: number; dayMismatchCount: number;
        hourMismatchCount: number; mismatchOutside2300Count: number;
      };
    };
    expect(createHash('sha256').update(text).digest('hex')).toBe('441e888724fc0006208f64154bb938103df15a88be121b69c9a762e4758c2bca');
    expect(artifact).toMatchObject({
      adapterVersion: '0.4.0', referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
      uncertaintyAlgebraVersion: 'birth-time-uncertainty-v1',
      productionValidated: false, productionEligible: false, correctionCount: 0,
      summary: { hourBoundaryRecordCount: 36, upstreamModeRecordCount: 12 },
      evidenceScope: { separateImplementationForDayHourMapping: true, independentKoreanMethodologyAuthority: false },
    });
    expect(artifact.fullRangeDifferential).toMatchObject({
      civilDateCount: 13_149,
      observationCount: 184_086,
      dayMismatchCount: 13_149,
      hourMismatchCount: 13_149,
      mismatchOutside2300Count: 0,
    });
    expect(new Set(artifact.hourBoundaryRecords.map((record) => record.localTime.slice(0, 2)))).toEqual(
      new Set(['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']),
    );
    for (let index = 0; index < artifact.hourBoundaryRecords.length; index += 3) {
      const [before, at, after] = artifact.hourBoundaryRecords.slice(index, index + 3);
      expect([before?.state, at?.state, after?.state]).toEqual(['before', 'at', 'after']);
      expect(before?.primary.hour).not.toBe(at?.primary.hour);
      expect(at?.primary).toEqual(after?.primary);
    }
    const at2300 = artifact.hourBoundaryRecords.find((record) => record.localTime === '23:00');
    expect(at2300).toMatchObject({ classification: 'methodology_difference' });
    expect(at2300?.primary.day).not.toBe(at2300?.comparison.day);
    const atLateZi = Object.fromEntries(
      artifact.modeRecords.filter((record) => record.date === '2024-06-15' && record.localTime === '23:00')
        .map((record) => [record.dayBoundary, record.primary]),
    );
    expect(atLateZi).toHaveProperty('midnight');
    expect(atLateZi).toHaveProperty('jasi');
    expect(atLateZi).toHaveProperty('splitJasi');
    expect(atLateZi.midnight!.day).not.toBe(atLateZi.jasi!.day);
    expect(atLateZi.midnight!.day).toBe(atLateZi.splitJasi!.day);
    expect(atLateZi.jasi!.hour).toBe(atLateZi.splitJasi!.hour);
  });
});

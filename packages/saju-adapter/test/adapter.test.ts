import { describe, expect, it, vi } from 'vitest';

import {
  SAJU_ADAPTER_CAPABILITIES,
  inyeonSajuAdapter,
  type NormalizedBirthContext,
} from '../src/index.js';
import { createInyeonSajuAdapter } from '../src/adapter.js';
import type { InyeonPrimaryEngine } from '../src/types.js';

const exactInput: NormalizedBirthContext = {
  localDate: '2024-02-04',
  localTime: '17:30',
  timePrecision: 'exact',
  calendarKind: 'solar',
  timeZone: 'Asia/Seoul',
  ambiguity: 'unambiguous',
  profileVersion: 'korean-saju-v1',
  timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1',
  referenceDataVersion: 'issue-10-solar-term-boundaries-v1',
};

describe('InyeonSajuAdapter', () => {
  it('does not expose the injectable engine seam through the package entrypoint', async () => {
    const publicApi = await import('../src/index.js');
    expect(publicApi).not.toHaveProperty('createInyeonSajuAdapter');
    expect(publicApi).not.toHaveProperty('InyeonPrimaryEngine');
    expect(Object.isFrozen(publicApi.inyeonSajuAdapter)).toBe(true);
  });

  it.each([null, undefined])('returns a bounded error for a missing runtime input (%s)', (input) => {
    const result = inyeonSajuAdapter.calculate(input as unknown as NormalizedBirthContext);
    expect(result).toEqual({ status: 'error', error: { code: 'INPUT_INVALID', message: 'A normalized birth context is required.' } });
  });

  it('returns deterministic INYEON-owned Hangul-first output', () => {
    const first = inyeonSajuAdapter.calculate(exactInput);
    const second = inyeonSajuAdapter.calculate(exactInput);
    expect(second).toEqual(first);
    expect(first.status).toBe('complete');
    if (first.status !== 'complete') return;
    expect(first.dayMaster).toBe(first.pillars.day.stem);
    expect(first.pillars).toEqual({
      year: { stem: '갑', branch: '진', stemHanja: '甲', branchHanja: '辰' },
      month: { stem: '병', branch: '인', stemHanja: '丙', branchHanja: '寅' },
      day: { stem: '무', branch: '술', stemHanja: '戊', branchHanja: '戌' },
      hour: { stem: '신', branch: '유', stemHanja: '辛', branchHanja: '酉' },
    });
    expect(first.provenance).toEqual({
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
    });

    const stems = new Set(['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']);
    const branches = new Set(['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']);
    for (const pillar of Object.values(first.pillars)) {
      expect(stems.has(pillar.stem)).toBe(true);
      expect(branches.has(pillar.branch)).toBe(true);
      expect(pillar.stemHanja).toMatch(/^.$/u);
      expect(pillar.branchHanja).toMatch(/^.$/u);
      expect('toObject' in pillar).toBe(false);
    }
  });

  it('never calls the time-required engine or fabricates pillars for unknown time', () => {
    const calculate = vi.fn<InyeonPrimaryEngine['calculate']>();
    const adapter = createInyeonSajuAdapter({ calculate });
    const result = adapter.calculate({ ...exactInput, localTime: null, timePrecision: 'unknown' });
    expect(calculate).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'partial',
      reason: 'BIRTH_TIME_UNKNOWN',
      pillars: null,
      dayMaster: null,
      availability: { year: false, month: false, day: false, hour: false },
    });
  });

  it.each(['approximate', 'disputed'] as const)('models but does not calculate an unsupported %s time range', (timePrecision) => {
    const calculate = vi.fn<InyeonPrimaryEngine['calculate']>();
    const adapter = createInyeonSajuAdapter({ calculate });
    const result = adapter.calculate({
      ...exactInput,
      localTime: null,
      timePrecision,
      timeRange: {
        startLocalDateTime: '2024-02-04T17:00',
        endLocalDateTime: '2024-02-04T18:00',
      },
    });
    expect(calculate).not.toHaveBeenCalled();
    expect(result.status === 'error' && result.error.code).toBe('TIME_PRECISION_UNSUPPORTED');
  });

  it.each([
    [{ ...exactInput, timeZone: 'America/New_York' }, 'TIMEZONE_UNSUPPORTED'],
    [{ ...exactInput, localDate: '1988-12-31' }, 'DATE_OUT_OF_RANGE'],
    [{ ...exactInput, localDate: '2025-01-01' }, 'DATE_OUT_OF_RANGE'],
    [{ ...exactInput, localDate: '2023-02-29' }, 'DATE_INVALID'],
    [{ ...exactInput, localDate: '2024-2-04' }, 'DATE_INVALID'],
    [{ ...exactInput, localTime: '24:00' }, 'TIME_INVALID'],
    [{ ...exactInput, ambiguity: 'nonexistent' }, 'AMBIGUOUS_LOCAL_TIME'],
    [{ ...exactInput, timePrecision: 'approximate' }, 'TIME_PRECISION_UNSUPPORTED'],
    [{ ...exactInput, profileVersion: 'future-profile' }, 'PROFILE_UNSUPPORTED'],
    [{ ...exactInput, timezoneDataVersion: 'caller-controlled' }, 'VERSION_UNSUPPORTED'],
  ])('rejects unsupported or invalid input with a bounded error (%s)', (input, expectedCode) => {
    const result = inyeonSajuAdapter.calculate(input as NormalizedBirthContext);
    expect(result.status).toBe('error');
    if (result.status === 'error') expect(result.error.code).toBe(expectedCode);
  });

  it('normalizes upstream exceptions without leaking their type or message', () => {
    const adapter = createInyeonSajuAdapter({ calculate: () => { throw new RangeError('sensitive upstream detail'); } });
    const result = adapter.calculate(exactInput);
    expect(result).toEqual({
      status: 'error',
      error: { code: 'UPSTREAM_FAILURE', message: 'The primary calculation engine could not produce a normalized chart.' },
    });
    expect(JSON.stringify(result)).not.toContain('sensitive upstream detail');
    expect(JSON.stringify(result)).not.toContain('RangeError');
  });

  it('rejects upstream values outside INYEON stem and branch domains', () => {
    const invalid = { heavenlyStem: 'X', earthlyBranch: 'Y' };
    const adapter = createInyeonSajuAdapter({ calculate: () => ({ year: invalid, month: invalid, day: invalid, hour: invalid }) });
    const result = adapter.calculate(exactInput);
    expect(result.status === 'error' && result.error.code).toBe('UPSTREAM_FAILURE');
  });

  it('publishes only candidate, non-production capabilities', () => {
    expect(SAJU_ADAPTER_CAPABILITIES).toMatchObject({
      profile: { status: 'candidate' },
      supportedTimeZones: ['Asia/Seoul'],
      supportedCivilDateRange: { minimum: '1989-01-01', maximum: '2024-12-31' },
      productionEligible: false,
      derivedFeatures: { status: 'not-applicable' },
      historicalTimeZonePolicy: { status: 'resolver-validated-not-integrated' },
    });
    expect(Object.isFrozen(SAJU_ADAPTER_CAPABILITIES)).toBe(true);
    expect(Object.isFrozen(SAJU_ADAPTER_CAPABILITIES.pendingEvidence)).toBe(true);
    expect(Object.isFrozen(SAJU_ADAPTER_CAPABILITIES.solarTermValidation)).toBe(true);
  });
});

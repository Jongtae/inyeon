import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import {
  SAJU_ADAPTER_CAPABILITIES,
  inyeonSajuAdapter,
  type InyeonYearMonthResult,
  type NormalizedYearMonthContext,
} from '../src/index.js';
import { createInyeonSajuAdapter } from '../src/adapter.js';
import type { InyeonPrimaryEngine } from '../src/types.js';

const artifactPath = fileURLToPath(new URL('../data/year-month-differential.v1.json', import.meta.url));
const artifactText = readFileSync(artifactPath, 'utf8');
const artifact = JSON.parse(artifactText) as {
  adapterVersion: string;
  profileStatus: string;
  productionEligible: boolean;
  referenceDataVersion: string;
  timezoneDataVersion: string;
  summary: Record<string, number>;
  limitations: string[];
  boundaryRecords: Array<{
    id: string;
    boundaryId: string;
    state: string;
    input: NormalizedYearMonthContext;
    expected: Record<string, unknown>;
    assertedInstantExpected: { year: string; month: string };
  }>;
  edgeCases: Array<{
    id: string;
    category: string;
    input: NormalizedYearMonthContext;
    expected: Record<string, unknown>;
    knownWrongNaiveCivilAsKst?: { year: string; month: string };
  }>;
  referenceComparisons: Array<{
    id: string;
    input: NormalizedYearMonthContext;
    primary: { year: string; month: string };
    comparison: { year: string; month: string };
    classification: string;
    differingPillars: string[];
    evidenceScope: {
      separateImplementationForPillarMapping: boolean;
      independentForSolarTermTiming: boolean;
      independentBoundaryLocator: { assertedProperty: string; absoluteDifferenceSeconds: number };
    };
  }>;
};

function hangulOutput(result: InyeonYearMonthResult): unknown {
  if (result.status === 'error') return { status: 'error', errorCode: result.error.code };
  if (result.status === 'ambiguous') {
    return {
      status: result.status,
      resolution: result.resolution,
      candidateCount: result.candidateCount,
      alternatives: result.alternatives.map(({ year, month }) => ({
        year: `${year.stem}${year.branch}`,
        month: `${month.stem}${month.branch}`,
      })),
    };
  }
  return {
    status: result.status,
    resolution: result.resolution,
    candidateCount: result.candidateCount,
    pillars: {
      year: `${result.pillars.year.stem}${result.pillars.year.branch}`,
      month: `${result.pillars.month.stem}${result.pillars.month.branch}`,
    },
  };
}

describe('timezone-normalized year/month calculation', () => {
  it('publishes exact candidate provenance without widening complete-chart capability', () => {
    expect(SAJU_ADAPTER_CAPABILITIES).toMatchObject({
      adapterVersion: '0.3.0',
      supportedTimeZones: ['Asia/Seoul'],
      supportedCivilDateRange: { minimum: '1989-01-01', maximum: '2024-12-31' },
      historicalTimeZonePolicy: { status: 'resolver-integrated-for-year-month-only' },
      yearMonthCalculation: {
        supportedTimeZones: ['America/Los_Angeles', 'America/New_York', 'Asia/Seoul'],
        resolverSupportedSourceCivilDateRange: { minimum: '1908-04-01', maximum: '2026-12-31' },
        supportedProjectedKstDateRange: { minimum: '1989-01-01', maximum: '2024-12-31' },
        productionValidated: false,
      },
      productionEligible: false,
    });
    expect(Object.isFrozen(SAJU_ADAPTER_CAPABILITIES.yearMonthCalculation)).toBe(true);
    const ordinary = artifact.edgeCases.find((record) => record.category === 'ordinary');
    expect(ordinary).toBeDefined();
    const result = inyeonSajuAdapter.calculateYearMonth(ordinary!.input);
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') return;
    expect(result.provenance).toEqual({
      profileVersion: 'korean-saju-v1', profileStatus: 'candidate', adapterVersion: '0.3.0',
      upstreamName: 'manseryeok', upstreamVersion: '2.0.0', timezoneResolverVersion: '0.1.0',
      timezoneDataVersion: 'iana-2026c-inyeon-filter-v1', referenceDataVersion: 'issue-11-year-month-differential-v1',
      solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1',
      solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1', solarTermPrecision: 'minute',
      derivedFeatureVersion: 'not-applicable',
    });
    expect(result.pillars.year.stem).toMatch(/^[갑을병정무기경신임계]$/u);
    expect(result.pillars.year.stemHanja).toMatch(/^.$/u);
  });

  it('pins the complete 3,888-state artifact and candidate evidence boundary', () => {
    expect(createHash('sha256').update(artifactText).digest('hex')).toBe('54ca0e765e65db1f3c917b06251a1eb31f8f837ab3b92b267096f50b5fc3b3b7');
    expect(artifact).toMatchObject({
      adapterVersion: '0.3.0',
      profileStatus: 'candidate',
      productionEligible: false,
      referenceDataVersion: 'issue-11-year-month-differential-v1',
      timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
      summary: {
        boundaryStateCount: 3888,
        solarBoundaryCount: 432,
        statesPerBoundary: 3,
        timeZoneCount: 3,
        correctionCount: 0,
        representativeReferenceComparisonCount: 24,
      },
    });
    expect(artifact.limitations.join(' ')).toContain('does not production-approve');
    expect(artifact.limitations.join(' ')).toContain('Day/hour outputs');
  });

  it('records and reproduces 24 property-scoped representative comparisons', () => {
    expect(artifact.referenceComparisons).toHaveLength(24);
    for (const record of artifact.referenceComparisons) {
      expect(hangulOutput(inyeonSajuAdapter.calculateYearMonth(record.input))).toMatchObject({ pillars: record.primary });
      expect(record.evidenceScope).toMatchObject({
        separateImplementationForPillarMapping: true,
        independentForSolarTermTiming: false,
        independentBoundaryLocator: { assertedProperty: 'apparent-Sun longitude boundary location only' },
      });
      expect(record.evidenceScope.independentBoundaryLocator.absoluteDifferenceSeconds).toBeLessThanOrEqual(300);
      expect(record.differingPillars).toEqual(
        ['year', 'month'].filter((pillar) => record.primary[pillar as 'year' | 'month'] !== record.comparison[pillar as 'year' | 'month']),
      );
      expect(['agreement', 'source_reference_inconsistency']).toContain(record.classification);
    }
  });

  it('matches every boundary state after deterministic local-time normalization', () => {
    for (const record of artifact.boundaryRecords) {
      const result = inyeonSajuAdapter.calculateYearMonth(record.input);
      expect(hangulOutput(result), record.id).toEqual(record.expected);
      const possible = result.status === 'complete'
        ? [{
            year: `${result.pillars.year.stem}${result.pillars.year.branch}`,
            month: `${result.pillars.month.stem}${result.pillars.month.branch}`,
          }]
        : result.status === 'ambiguous'
          ? result.alternatives.map(({ year, month }) => ({
              year: `${year.stem}${year.branch}`,
              month: `${month.stem}${month.branch}`,
            }))
          : [];
      expect(possible, record.id).toContainEqual(record.assertedInstantExpected);
    }
  });

  it('covers ordinary, gap, fold, range, and naive-US regression cases', () => {
    expect(artifact.summary).toMatchObject({
      ordinaryCaseCount: 3,
      gapCaseCount: 4,
      foldCaseCount: 4,
      naiveTimezoneRegressionCount: 2,
      rangeCaseCount: 3,
    });
    for (const record of artifact.edgeCases) {
      const actual = hangulOutput(inyeonSajuAdapter.calculateYearMonth(record.input));
      expect(actual, record.id).toEqual(record.expected);
      if (record.knownWrongNaiveCivilAsKst) {
        expect(actual).not.toMatchObject({ pillars: record.knownWrongNaiveCivilAsKst });
      }
    }
  });

  it('returns both distinct year/month alternatives when a fold straddles an engine boundary', () => {
    const valid = { heavenlyStem: '갑', earthlyBranch: '자' };
    const calculate = vi.fn<InyeonPrimaryEngine['calculate']>((input) => ({
      year: input.hour === 14 ? valid : { heavenlyStem: '을', earthlyBranch: '축' },
      month: input.hour === 14 ? valid : { heavenlyStem: '병', earthlyBranch: '인' },
      day: valid,
      hour: valid,
    }));
    const adapter = createInyeonSajuAdapter({ calculate });
    const result = adapter.calculateYearMonth({
      localDate: '2024-11-03', localTime: '01:30', timePrecision: 'exact', calendarKind: 'solar',
      timeZone: 'America/New_York', profileVersion: 'korean-saju-v1',
      timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
      referenceDataVersion: 'issue-11-year-month-differential-v1',
    });
    expect(calculate).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      status: 'ambiguous',
      reason: 'LOCAL_TIME_AMBIGUOUS_YEAR_MONTH',
      resolution: 'ambiguous-different-outputs',
      candidateCount: 2,
    });
    if (result.status === 'ambiguous') expect(result.alternatives).toHaveLength(2);
  });

  it('normalizes invalid engine output and exceptions into bounded failures', () => {
    const invalid = { heavenlyStem: 'PRIVATE_UPSTREAM_VALUE', earthlyBranch: 'X' };
    const invalidAdapter = createInyeonSajuAdapter({ calculate: () => ({ year: invalid, month: invalid, day: invalid, hour: invalid }) });
    const throwingAdapter = createInyeonSajuAdapter({ calculate: () => { throw new Error('PRIVATE_UPSTREAM_DETAIL'); } });
    const input = artifact.edgeCases.find((record) => record.category === 'ordinary')!.input;
    for (const result of [invalidAdapter.calculateYearMonth(input), throwingAdapter.calculateYearMonth(input)]) {
      expect(result).toEqual({
        status: 'error',
        error: { code: 'UPSTREAM_FAILURE', message: 'The primary calculation engine could not produce normalized year/month pillars.' },
      });
      expect(JSON.stringify(result)).not.toContain('PRIVATE_UPSTREAM');
    }
  });

  it('does not reflect protected input or use side-effect channels', () => {
    const sideEffect = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', sideEffect);
    vi.stubGlobal('XMLHttpRequest', sideEffect);
    vi.stubGlobal('WebSocket', sideEffect);
    vi.stubGlobal('localStorage', { setItem: sideEffect });
    vi.stubGlobal('sessionStorage', { setItem: sideEffect });
    vi.stubGlobal('indexedDB', { open: sideEffect });
    vi.stubGlobal('caches', { open: sideEffect });
    vi.stubGlobal('history', { pushState: sideEffect, replaceState: sideEffect });
    try {
      const result = inyeonSajuAdapter.calculateYearMonth({
        localDate: '1997-08-19', localTime: '04:37', timePrecision: 'exact', calendarKind: 'solar',
        timeZone: 'America/Los_Angeles', profileVersion: 'korean-saju-v1',
        timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
        referenceDataVersion: 'issue-11-year-month-differential-v1',
        protectedCanary: 'PRIVATE_BIRTH_CANARY',
      } as NormalizedYearMonthContext);
      expect(result).toMatchObject({ status: 'error', error: { code: 'INPUT_INVALID' } });
      expect(JSON.stringify(result)).not.toContain('PRIVATE_BIRTH_CANARY');
      expect(JSON.stringify(result)).not.toContain('1997-08-19');
      expect(sideEffect).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      expect(consoleLog).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      consoleError.mockRestore();
      consoleLog.mockRestore();
    }
  });
});

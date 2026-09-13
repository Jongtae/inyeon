import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { inyeonSajuAdapter, type NormalizedBirthContext } from '../src/index.js';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const corpusPath = fileURLToPath(new URL('../data/differential-corpus.v1.json', import.meta.url));
const generatorPath = fileURLToPath(new URL('../scripts/generate-differential-corpus.mjs', import.meta.url));
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8')) as {
  recordCount: number;
  productionEligible: boolean;
  limitations: string[];
  records: Array<Record<string, unknown> & {
    id: string;
    input: { localDate: string; localTime: string | null; timeZone: string };
    classification: string;
    provenance: {
      profileVersion: string;
      adapterVersion: string;
      upstreamVersion: string;
      timezoneDataVersion: string;
      referenceDataVersion: string;
      derivedFeatureVersion: string;
    };
    differingPillars?: string[];
    findings: Array<{ pillar: string; category: string; primaryOutput: string; comparisonOutput: string; disposition: string }>;
    independentReference: { independentForAssertedProperty: boolean; assertedProperty: string; absoluteDifferenceSeconds?: number };
    primary: { engine: string; apiMode?: { dayBoundary: string }; output: Record<'year' | 'month' | 'day' | 'hour', string> | null };
    comparison: { engine: string; apiMode?: { year: string; month: string; day: string; hour: string; sect: string } };
  }>;
};

describe('Issue #8 differential corpus', () => {
  it('contains at least 50 supported positive Asia/Seoul cases, excluding adapter negatives', () => {
    const positives = corpus.records.filter((record) => !record.id.startsWith('negative-'));
    expect(positives.length).toBeGreaterThanOrEqual(50);
    expect(positives.every((record) => record.input.timeZone === 'Asia/Seoul')).toBe(true);
    expect(positives.every((record) => record.input.localDate >= '1989-01-01' && record.input.localDate <= '2024-12-31')).toBe(true);
    expect(corpus.recordCount).toBe(corpus.records.length);
  });

  it('records outputs, evidence category, independence, classification, and per-pillar findings', () => {
    for (const record of corpus.records) {
      expect(record).toHaveProperty('input');
      expect(record).toHaveProperty('primary');
      expect(record).toHaveProperty('comparison');
      expect(record).toHaveProperty('evidenceSourceCategory');
      expect(record).toHaveProperty('classification');
      expect(record.provenance).toEqual({
        profileVersion: 'korean-saju-v1',
        adapterVersion: '0.1.0',
        upstreamVersion: '2.0.0',
        timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1',
        referenceDataVersion: 'issue-8-differential-v1',
        derivedFeatureVersion: 'not-applicable',
      });
      expect(record.independentReference).toHaveProperty('independentForAssertedProperty');
      if (!record.id.startsWith('negative-')) {
        expect(record.primary.apiMode).toEqual({ dayBoundary: 'midnight' });
        expect(record.comparison.apiMode).toEqual({
          year: 'getYearInGanZhiExact',
          month: 'getMonthInGanZhiExact',
          day: 'getDayInGanZhiExact',
          hour: 'getTimeInGanZhi',
          sect: 'library-default',
        });
        expect(record.findings.map((finding) => finding.pillar)).toEqual(record.differingPillars);
        for (const finding of record.findings) {
          expect(['methodology_difference', 'source_reference_inconsistency']).toContain(finding.category);
          expect(finding.primaryOutput).toBeTruthy();
          expect(finding.comparisonOutput).toBeTruthy();
          expect(finding.disposition).toBeTruthy();
          expect(['deferred-to-issue-10', 'deferred-to-issue-12']).toContain(finding.disposition);
        }
      }
    }
  });

  it('classifies every 23:xx day/hour difference as methodology, including mixed records', () => {
    const findings = corpus.records
      .filter((record) => record.input.localTime?.startsWith('23:'))
      .flatMap((record) => record.findings)
      .filter((finding) => finding.pillar === 'day' || finding.pillar === 'hour');
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((finding) => finding.category === 'methodology_difference')).toBe(true);
  });

  it('reproduces every committed positive primary output through the INYEON adapter', () => {
    for (const record of corpus.records.filter((candidate) => !candidate.id.startsWith('negative-'))) {
      const result = inyeonSajuAdapter.calculate(record.input as NormalizedBirthContext);
      expect(result.status, record.id).toBe('complete');
      if (result.status !== 'complete') continue;
      const normalized = Object.fromEntries(
        Object.entries(result.pillars).map(([name, pillar]) => [name, `${pillar.stem}${pillar.branch}`]),
      );
      expect(normalized, record.id).toEqual(record.primary.output);
    }
  });

  it('limits independent evidence to ephemeris boundary location with a sane delta', () => {
    const independent = corpus.records.filter((record) => record.independentReference.independentForAssertedProperty);
    expect(independent).toHaveLength(24);
    for (const record of independent) {
      expect(record.independentReference.assertedProperty).toBe('apparent-sun-longitude boundary location');
      expect(record.independentReference.absoluteDifferenceSeconds).toBeLessThanOrEqual(300);
    }
    expect(corpus.limitations.join(' ')).toContain('not independent evidence');
    expect(corpus.productionEligible).toBe(false);
  });

  it('is reproducible from the checked-in generator', () => {
    const before = readFileSync(corpusPath, 'utf8');
    execFileSync(process.execPath, [generatorPath], { cwd: packageRoot });
    expect(readFileSync(corpusPath, 'utf8')).toBe(before);
  });
});

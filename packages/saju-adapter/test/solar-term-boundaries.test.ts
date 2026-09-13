import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const artifactPath = fileURLToPath(new URL('../data/solar-term-boundaries.v1.json', import.meta.url));
const generatorPath = fileURLToPath(new URL('../scripts/generate-solar-term-boundaries.mjs', import.meta.url));
const serialized = readFileSync(artifactPath, 'utf8');
const artifact = JSON.parse(serialized) as {
  adapterVersion: string;
  profileStatus: string;
  productionEligible: boolean;
  referenceDataVersion: string;
  solarTermDataVersion: string;
  solarTermReferenceVersion: string;
  solarTermPrecision: string;
  supportedRange: { minimumYear: number; maximumYear: number; timeZone: string };
  sourceArtifacts: { primary: { sha256: string; precision: string }; independentReference: { assertedProperty: string } };
  candidateValidationGuardrail: { absoluteDeltaMilliseconds: number; meaning: string };
  summary: {
    recordCount: number;
    yearCount: number;
    jieBoundaryCountPerYear: number;
    overSixtySecondsCount: number;
    overNinetySecondsCount: number;
    maximumAbsoluteDeltaMilliseconds: number;
    maximumRecordId: string;
    maximum: {
      recordId: string;
      year: number;
      termNameHangul: string;
      termNameHanja: string;
      signedDeltaMilliseconds: number;
      absoluteDeltaMilliseconds: number;
    };
  };
  limitations: string[];
  records: Array<{
    id: string;
    year: number;
    term: { index: number; nameHangul: string; nameHanja: string; targetLongitudeDegrees: number };
    primaryBoundary: { utc: string; localKst: string };
    independentReference: { crossingUtc: string };
    signedDeltaMilliseconds: number;
    absoluteDeltaMilliseconds: number;
    classification: string;
    samples: Record<'before_primary_boundary' | 'at_primary_boundary' | 'after_primary_boundary', {
      utc: string;
      localKst: string;
      primaryOutputHangul: { year: string; month: string };
    }>;
  }>;
};

const JIE_INDICES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const LONGITUDES = [285, 315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255];

describe('Issue #10 complete solar-term boundary corpus', () => {
  it('covers exactly 36 years and all 12 even-index 절 (jie) boundaries per year', () => {
    expect(artifact.supportedRange).toEqual({ minimumYear: 1989, maximumYear: 2024, timeZone: 'Asia/Seoul' });
    expect(artifact.records).toHaveLength(432);
    expect(new Set(artifact.records.map((record) => record.id)).size).toBe(432);
    expect(artifact.summary).toMatchObject({ recordCount: 432, yearCount: 36, jieBoundaryCountPerYear: 12 });
    for (let year = 1989; year <= 2024; year += 1) {
      const records = artifact.records.filter((record) => record.year === year);
      expect(records.map((record) => record.term.index), String(year)).toEqual(JIE_INDICES);
      expect(records.map((record) => record.term.targetLongitudeDegrees), String(year)).toEqual(LONGITUDES);
      expect(records.map((record) => record.primaryBoundary.utc), String(year)).toEqual(
        [...records].sort((left, right) => left.primaryBoundary.utc.localeCompare(right.primaryBoundary.utc)).map((record) => record.primaryBoundary.utc),
      );
    }
  });

  it('keeps Hangul primary, Hanja secondary, and every primary boundary minute-aligned', () => {
    const expectedTerms = ['소한', '입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설'];
    expect(artifact.records.slice(0, 12).map((record) => record.term.nameHangul)).toEqual(expectedTerms);
    for (const record of artifact.records) {
      expect(record.term.nameHangul).toMatch(/^[가-힣]+$/u);
      expect(record.term.nameHanja).toMatch(/^[\p{Script=Han}]+$/u);
      const boundary = new Date(record.primaryBoundary.utc);
      expect(boundary.getUTCSeconds(), record.id).toBe(0);
      expect(boundary.getUTCMilliseconds(), record.id).toBe(0);
    }
  });

  it('preserves the primary-table before/at/after transition semantics for all boundaries', () => {
    for (const record of artifact.records) {
      const before = record.samples.before_primary_boundary;
      const at = record.samples.at_primary_boundary;
      const after = record.samples.after_primary_boundary;
      expect(Date.parse(at.utc) - Date.parse(before.utc), record.id).toBe(60_000);
      expect(Date.parse(after.utc) - Date.parse(at.utc), record.id).toBe(60_000);
      expect(at.utc, record.id).toBe(record.primaryBoundary.utc);
      expect(before.primaryOutputHangul.month, record.id).not.toBe(at.primaryOutputHangul.month);
      expect(after.primaryOutputHangul, record.id).toEqual(at.primaryOutputHangul);
      const yearChanged = before.primaryOutputHangul.year !== at.primaryOutputHangul.year;
      expect(yearChanged, record.id).toBe(record.term.nameHangul === '입춘');
      expect(before.localKst).toMatch(/\+09:00$/);
      expect(at.localKst).toMatch(/\+09:00$/);
      expect(after.localKst).toMatch(/\+09:00$/);
    }
  });

  it('records signed raw deltas and enforces the documented candidate guardrail without claiming agreement', () => {
    expect(artifact.candidateValidationGuardrail.absoluteDeltaMilliseconds).toBe(120_000);
    expect(artifact.candidateValidationGuardrail.meaning).toContain('not an accuracy guarantee or oracle claim');
    for (const record of artifact.records) {
      const computed = Date.parse(record.primaryBoundary.utc) - Date.parse(record.independentReference.crossingUtc);
      expect(record.signedDeltaMilliseconds, record.id).toBe(computed);
      expect(record.absoluteDeltaMilliseconds, record.id).toBe(Math.abs(computed));
      expect(record.absoluteDeltaMilliseconds, record.id).toBeLessThanOrEqual(120_000);
      expect(record.classification).not.toMatch(/agreement/i);
    }
    expect(artifact.records.filter((record) => record.absoluteDeltaMilliseconds > 60_000).map((record) => record.id)).toEqual([
      'jie-1999-22', 'jie-2003-02', 'jie-2010-18',
    ]);
    expect(artifact.summary).toMatchObject({
      overSixtySecondsCount: 3,
      overNinetySecondsCount: 0,
      maximumAbsoluteDeltaMilliseconds: 71_829,
      maximumRecordId: 'jie-2003-02',
      maximum: {
        recordId: 'jie-2003-02',
        year: 2003,
        termNameHangul: '입춘',
        termNameHanja: '立春',
        signedDeltaMilliseconds: -71_829,
        absoluteDeltaMilliseconds: 71_829,
      },
    });
  });

  it('records exact candidate versions, source hash, and non-production limitations', () => {
    expect(artifact).toMatchObject({
      adapterVersion: '0.2.0',
      profileStatus: 'candidate',
      productionEligible: false,
      referenceDataVersion: 'issue-10-solar-term-boundaries-v1',
      solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1',
      solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1',
      solarTermPrecision: 'minute',
    });
    expect(artifact.sourceArtifacts.primary).toMatchObject({
      sha256: 'fe61cc754021d012f830b03ebe06533a717e7f8a53cc30706eed65520061ddb9',
      precision: 'minute',
    });
    expect(artifact.sourceArtifacts.independentReference.assertedProperty).toContain('crossing only');
    expect(artifact.limitations.join(' ')).toContain('KASI provenance');
    expect(artifact.limitations.join(' ')).toContain('not an accuracy claim');
  });

  it('is byte-deterministic and passes the generator check mode', () => {
    expect(createHash('sha256').update(serialized).digest('hex')).toBe('fc7ee26a25bd2fadbe1dad701021ef3717a8924f6dd49996b7ccd4e57770990f');
    execFileSync(process.execPath, [generatorPath, '--check'], { cwd: packageRoot });
    expect(readFileSync(artifactPath, 'utf8')).toBe(serialized);
  });

  it('keeps Astronomy Engine validation-only and out of runtime sources', () => {
    const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(manifest.dependencies).not.toHaveProperty('astronomy-engine');
    expect(manifest.devDependencies['astronomy-engine']).toBe('2.1.19');
    for (const file of readdirSync(fileURLToPath(new URL('../src', import.meta.url))).filter((name) => name.endsWith('.ts'))) {
      expect(readFileSync(fileURLToPath(new URL(`../src/${file}`, import.meta.url)), 'utf8'), file).not.toMatch(/(?:from|import)\s+['"]astronomy-engine['"]|SearchSunLongitude\s*\(/);
    }
  });
});

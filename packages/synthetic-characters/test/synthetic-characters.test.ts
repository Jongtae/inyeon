import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { evaluateCompatibilityPair } from '@inyeon/compatibility-rules';
import { inyeonSajuAdapter } from '@inyeon/saju-adapter';
import { deriveChartFeatures } from '@inyeon/saju-derived-features';
import {
  createSyntheticInventory,
  generateSyntheticCharacter,
  generateSyntheticReferenceSubject,
  SYNTHETIC_AVATAR_MOTIFS,
  SYNTHETIC_DISCLOSURE,
  SYNTHETIC_GENERATOR_PROFILE,
  SYNTHETIC_SCENARIO_PROMPTS,
} from '../src/index.js';

const dataDirectory = fileURLToPath(new URL('../data/', import.meta.url));
const report = JSON.parse(readFileSync(resolve(dataDirectory, 'synthetic-coverage.v1.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(dataDirectory, 'synthetic-character-manifest.v1.json'), 'utf8'));
const releaseLockBytes = readFileSync(fileURLToPath(new URL('../source/synthetic-release-lock.v1.json', import.meta.url)));
const releaseLock = JSON.parse(releaseLockBytes.toString('utf8'));
const forbiddenKeys = new Set([
  'userId', 'accountId', 'datingProfileId', 'like', 'match', 'message', 'distance', 'online', 'activity',
  'inboundInterest', 'endorsement', 'gender', 'race', 'ethnicity', 'nationality', 'bodyType', 'sexualOrientation',
]);

function objectKeys(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...objectKeys(child)]);
}

describe('deterministic synthetic-character inventory', () => {
  it('recreates 10,000 unique, explicitly fictional entities from the pinned generator', () => {
    const hash = createHash('sha256');
    const ids = new Set<string>();
    const names = new Set<string>();
    for (let seedIndex = 0; seedIndex < SYNTHETIC_GENERATOR_PROFILE.recordCount; seedIndex += 1) {
      const record = generateSyntheticCharacter(seedIndex);
      expect(record).toEqual(generateSyntheticCharacter(seedIndex));
      expect(record).toMatchObject({
        kind: 'synthetic', seedIndex, fictional: { status: 'fictional' },
        birthFixture: { origin: 'generator-defined-fictional-fixture' }, productionEligible: false,
      });
      expect(objectKeys(record).some((key) => forbiddenKeys.has(key))).toBe(false);
      ids.add(record.id);
      names.add(record.displayName);
      hash.update(`${JSON.stringify(record)}\n`);
    }
    expect(ids.size).toBe(10_000);
    expect(names.size).toBe(10_000);
    expect(hash.digest('hex')).toBe(report.inventorySha256);
    expect(report.inventorySha256).toBe(releaseLock.inventorySha256);
  });

  it('matches the documented temporal allocation without defaulting incomplete time states', () => {
    const counts = Object.fromEntries(['exact', 'approximate', 'disputed', 'date-only', 'unknown'].map((support) => [support, 0]));
    for (let seedIndex = 0; seedIndex < SYNTHETIC_GENERATOR_PROFILE.recordCount; seedIndex += 1) {
      const context = generateSyntheticCharacter(seedIndex).birthFixture.context;
      counts[context.temporalSupport] = (counts[context.temporalSupport] ?? 0) + 1;
      if (context.temporalSupport === 'date-only' || context.temporalSupport === 'unknown') {
        expect(context).not.toHaveProperty('localTime');
      }
      const serialized = JSON.stringify(context);
      const dates = serialized.match(/\d{4}-\d{2}-\d{2}/gu) ?? [];
      expect(dates.length).toBeGreaterThan(0);
      expect(dates.every((date) => date >= SYNTHETIC_GENERATOR_PROFILE.birthFixtureDateRange.start
        && date <= SYNTHETIC_GENERATOR_PROFILE.birthFixtureDateRange.endInclusive)).toBe(true);
    }
    expect(counts).toEqual(SYNTHETIC_GENERATOR_PROFILE.temporalAllocation);
  });

  it('runs every temporal-support shape through the pinned candidate pipeline', () => {
    for (const seedIndex of [0, 1, 2, 3, 4]) {
      const record = generateSyntheticCharacter(seedIndex);
      const subject = generateSyntheticReferenceSubject(seedIndex);
      expect(subject).toMatchObject({
        kind: 'synthetic', id: record.id, fictional: { status: 'fictional' }, chartContext: record.birthFixture.context,
      });
      expect(Object.isFrozen(subject)).toBe(true);
      expect(Object.isFrozen(subject.chartContext)).toBe(true);
      const chart = inyeonSajuAdapter.calculateChart(subject.chartContext);
      expect(chart.status).not.toBe('error');
      if (chart.status === 'error') continue;
      const derived = deriveChartFeatures(chart);
      expect(derived.status).toBe('ok');
      if (derived.status === 'error') continue;
      const compatibility = evaluateCompatibilityPair(derived, derived);
      expect(compatibility).toMatchObject({
        status: 'ok', snapshot: { productionEligible: false, evidenceSummary: { state: 'no-approved-evidence' } },
      });
    }
  });

  it('reports broad chart coverage without inventing relationship evidence or population truth', () => {
    expect(report.recordCount).toBe(10_000);
    expect(report.adultBoundary).toMatchObject({
      dateRange: { start: '1989-01-01', endInclusive: '2004-12-31' },
      referenceDate: '2026-09-14', minimumAgeYears: 18, validatedRecordCount: 10_000,
    });
    expect(Object.keys(report.dayMasterCounts)).toHaveLength(10);
    expect(Object.keys(report.visibleBranchVariantCounts)).toHaveLength(12);
    expect(Object.keys(report.visibleElementVariantCounts)).toEqual(['earth', 'fire', 'metal', 'water', 'wood']);
    expect(Object.keys(report.timeZoneCounts)).toEqual(['America/Los_Angeles', 'America/New_York', 'Asia/Seoul']);
    expect(report.obviousDuplicateIdCount).toBe(0);
    expect(report.obviousDuplicateDisplayNameCount).toBe(0);
    expect(report.duplicateContentFingerprintCount).toBe(0);
    expect(report.approvedRelationshipEvidenceCoverage).toMatchObject({ status: 'unavailable', approvedRuleCount: 0 });
    expect(report.stereotypeAudit).toMatchObject({
      protectedDemographicFields: [], forbiddenMarketplaceFields: [], promptsDerivedFromChart: false,
      styleAssignmentReadsChart: false, populationRepresentativenessClaim: false,
    });
    expect(Object.keys(report.scenarioPromptByDayMasterCounts)).toHaveLength(120);
    expect(Math.min(...Object.values(report.scenarioPromptByDayMasterCounts) as number[])).toBeGreaterThanOrEqual(100);
  });

  it('provides a bounded kill switch and pagination seam', () => {
    expect(SYNTHETIC_GENERATOR_PROFILE.releaseFeatureDefaultEnabled).toBe(false);
    const disabled = createSyntheticInventory(false);
    expect(disabled).toMatchObject({ enabled: false, count: 0 });
    expect(disabled.get(0)).toBeNull();
    expect(disabled.list(0, 100)).toEqual([]);
    const enabled = createSyntheticInventory(true);
    expect(enabled.list(9_990, 100)).toHaveLength(10);
    expect(() => enabled.list(0, 101)).toThrow(RangeError);
    expect(() => generateSyntheticCharacter(-1)).toThrow(RangeError);
  });

  it('uses US-English disclosure with Hangul before secondary Hanja', () => {
    expect(SYNTHETIC_DISCLOSURE.labTitle).toBe('Inyeon Lab (인연 실험실)');
    expect(SYNTHETIC_DISCLOSURE.short).toBe('Fictional character—not a real person or member.');
    expect(SYNTHETIC_DISCLOSURE.full).toContain('Saju (사주, Four Pillars; 四柱)');
    expect(SYNTHETIC_DISCLOSURE.full.indexOf('사주')).toBeLessThan(SYNTHETIC_DISCLOSURE.full.indexOf('四柱'));
    expect(SYNTHETIC_DISCLOSURE.full).toContain('not a dating profile');
    expect(SYNTHETIC_SCENARIO_PROMPTS.every(Object.isFrozen)).toBe(true);
    expect(SYNTHETIC_AVATAR_MOTIFS.every(Object.isFrozen)).toBe(true);
  });

  it('pins compact generated artifacts and the transient inventory checksum', () => {
    expect(manifest).toMatchObject({
      recordCount: 10_000,
      generationMode: 'deterministic-on-demand',
      algorithm: 'inyeon-index-mix32-v1',
      pipelineVersions: { adapterVersion: '0.4.0', derivedFeatureVersion: 'korean-saju-derived-v1' },
      productionEligible: false,
    });
    expect(manifest.releaseLockSha256).toBe(createHash('sha256').update(releaseLockBytes).digest('hex'));
    expect(manifest.inventorySha256).toBe(releaseLock.inventorySha256);
    expect(manifest.files.profile.sha256).toBe(releaseLock.profileSha256);
    for (const descriptor of Object.values(manifest.files) as { path: string; sha256: string }[]) {
      const bytes = readFileSync(resolve(dirname(resolve(dataDirectory, 'synthetic-character-manifest.v1.json')), descriptor.path));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(descriptor.sha256);
    }
    expect(readFileSync(resolve(dataDirectory, 'synthetic-generator-profile.v1.json')).byteLength).toBeLessThanOrEqual(65_536);
    expect(readFileSync(resolve(dataDirectory, 'synthetic-coverage.v1.json')).byteLength).toBeLessThanOrEqual(262_144);
    expect(readFileSync(resolve(dataDirectory, 'synthetic-character-manifest.v1.json')).byteLength).toBeLessThanOrEqual(16_384);
  });
});

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { evaluateCompatibilityPair } from '@inyeon/compatibility-rules';
import { inyeonSajuAdapter } from '@inyeon/saju-adapter';
import { deriveChartFeatures } from '@inyeon/saju-derived-features';
import {
  PUBLIC_FIGURE_DISCLOSURE,
  searchPublicFigures,
} from '../src/index.js';
import { PUBLIC_FIGURE_SEARCH_INDEX, getPublicFigure } from '../src/catalog.js';
import type { PublicFigureRecord, PublicFigureSearchEntry } from '../src/types.js';
import { createRefreshReview } from '../scripts/refresh-review.mjs';
import { assertPublicReferenceBoundary } from '../scripts/source-boundary.mjs';

const dataPath = fileURLToPath(new URL('../data/public-figures.v1.json', import.meta.url));
const data = JSON.parse(readFileSync(dataPath, 'utf8')) as { records: PublicFigureRecord[]; productionEligible: boolean };
const index = JSON.parse(readFileSync(fileURLToPath(new URL('../data/public-figure-index.v1.json', import.meta.url)), 'utf8')) as {
  entries: PublicFigureSearchEntry[];
};
const quality = JSON.parse(readFileSync(fileURLToPath(new URL('../data/public-figure-quality.v1.json', import.meta.url)), 'utf8'));
const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../data/public-figure-manifest.v1.json', import.meta.url)), 'utf8'));
const source = JSON.parse(readFileSync(fileURLToPath(new URL('../source/wikidata-public-figures.v1.json', import.meta.url)), 'utf8'));
const forbiddenMarketplaceKeys = new Set([
  'userId', 'accountId', 'datingProfileId', 'like', 'match', 'message', 'distance', 'online', 'activity', 'inboundInterest', 'endorsement',
]);

function objectKeys(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...objectKeys(child)]);
}

describe('source-backed public-figure corpus', () => {
  it('ships 500+ distinct reference entities with value-level provenance and no fabricated hour or image', () => {
    expect(data.productionEligible).toBe(false);
    expect(data.records.length).toBeGreaterThanOrEqual(500);
    expect(new Set(data.records.map(({ id }) => id)).size).toBe(data.records.length);
    expect(new Set(data.records.map(({ category }) => category))).toEqual(new Set(['actor', 'music', 'sports', 'creator']));
    expect(new Set(data.records.flatMap(({ regions }) => regions)).size).toBeGreaterThanOrEqual(25);
    for (const record of data.records) {
      expect(record.kind).toBe('public_figure');
      expect(record.id).toMatch(/^public:wd-q\d+$/u);
      expect(record.birth.date.provenanceRefs).toHaveLength(1);
      expect(record.birth.date.provenanceRefs[0]).toMatch(/^wikidata:Q\d+#q\d+\$/iu);
      expect(record.birth.time).toEqual({ status: 'date_only', localTime: null, candidates: [], provenanceRefs: [] });
      expect(record.sourceRecords[0]).toMatchObject({
        sourceType: 'structured-aggregator', publisher: 'Wikidata', license: 'CC0-1.0', retrievedAt: '2026-09-14',
      });
      expect(record.image).toBeNull();
      expect(objectKeys(record).some((key) => forbiddenMarketplaceKeys.has(key))).toBe(false);
    }
  });

  it('enforces the pinned public-reference boundary before publishing birth data', () => {
    expect(source.selectionPolicy).toMatchObject({
      corpusSize: 600,
      perCategory: 150,
      englishWikipediaArticleRequired: true,
      minimumWikimediaSitelinks: 20,
      atLeastRecentPerCategory: 35,
      representativenessClaim: false,
    });
    expect(source.records).toHaveLength(600);
    expect(source.records.every(({ sitelinks }: { sitelinks: number }) => Number.isSafeInteger(sitelinks) && sitelinks >= 20)).toBe(true);
    expect(source.records.every(({ birthDates }: { birthDates: { value: string }[] }) => birthDates.every(({ value }) => (
      value >= '1950-01-01T00:00:00Z' && value < '2007-01-01T00:00:00Z'
    )))).toBe(true);

    const lowNotability = structuredClone(source);
    lowNotability.records[0].sitelinks = 0;
    expect(() => assertPublicReferenceBoundary(lowNotability)).toThrow(/notability boundary/u);

    const futureBirth = structuredClone(source);
    futureBirth.records[0].birthDates[0].value = '2099-01-01T00:00:00Z';
    expect(() => assertPublicReferenceBoundary(futureBirth)).toThrow(/birth boundary/u);

    const injectedQuarantineValue = structuredClone(source);
    injectedQuarantineValue.records[0].birthDates[0].value = { note: '<script>window.pwned=true</script>' };
    expect(() => assertPublicReferenceBoundary(injectedQuarantineValue)).toThrow(/birth boundary/u);

    const weakenedPolicy = structuredClone(source);
    weakenedPolicy.selectionPolicy.minimumWikimediaSitelinks = 0;
    expect(() => assertPublicReferenceBoundary(weakenedPolicy)).toThrow(/selection policy/u);
  });

  it('keeps conflicts quarantined and publishes an auditable initial refresh review', () => {
    expect(quality.sourceRecordCount).toBe(600);
    expect(quality.publishedRecordCount).toBe(data.records.length);
    expect(quality.quarantinedRecordCount).toBeGreaterThan(0);
    expect(quality.quarantine.some(({ reason }: { reason: string }) => reason === 'CONFLICTING_BIRTH_DATE')).toBe(true);
    expect(quality.refreshReview.addedRecordIds).toEqual(data.records.map(({ id }) => id));
    expect(quality.refreshReview.changedRecords).toEqual([]);
    expect(quality.refreshReview.removedRecordIds).toEqual([]);
    expect(quality.refreshReview.conflicts.length).toBeGreaterThan(0);
    expect(quality.representativenessClaim).toBe(false);
    expect(quality.recognizabilityValidated).toBe(false);
  });

  it('reports added, changed, removed, revision-only, and conflicting refresh records without selecting a conflict', () => {
    const first = structuredClone(data.records[0]!);
    const changed = { ...structuredClone(first), displayName: `${first.displayName} corrected` };
    const second = structuredClone(data.records[1]!);
    const revisionOnly = {
      ...second,
      sourceRecords: [{ ...second.sourceRecords[0]!, revisionId: second.sourceRecords[0]!.revisionId + 1 }],
    };
    const added = structuredClone(data.records[2]!);
    const conflict = { qid: 'Q999', reason: 'CONFLICTING_BIRTH_DATE', candidateValues: ['1990-01-01', '1990-01-02'] };
    expect(createRefreshReview([first, data.records[1]!, data.records[3]!], [changed, revisionOnly, added], [conflict], 'previous-v1'))
      .toEqual({
        baselineDataVersion: 'previous-v1',
        addedRecordIds: [added.id],
        changedRecords: [{ id: first.id, changedFields: ['displayName'] }],
        removedRecordIds: [data.records[3]!.id],
        sourceRevisionOnlyChanges: [revisionOnly.id],
        conflicts: [conflict],
      });
  });

  it('provides deterministic name, alias, category, and region search data', () => {
    expect(index.entries).toHaveLength(data.records.length);
    expect(index.entries.every(({ kind }) => kind === 'public_figure')).toBe(true);
    expect(searchPublicFigures(index.entries, { query: 'Taehyung', category: 'music', region: 'South Korea' }))
      .toMatchObject([{ displayName: 'V', category: 'music', regions: ['South Korea'] }]);
    expect(searchPublicFigures(index.entries, { query: 'Billie Eilish', category: 'actor' })).toEqual([]);
    expect(searchPublicFigures(index.entries, { query: '<script>' })).toEqual([]);
    expect(searchPublicFigures(index.entries, { query: `V\u200f` })).toEqual([]);
    expect(searchPublicFigures(index.entries, { query: 'x'.repeat(161) })).toEqual([]);
  });

  it('exposes only the validated browse index and exact-ID record lookup to the web product', () => {
    expect(PUBLIC_FIGURE_SEARCH_INDEX).toHaveLength(data.records.length);
    expect(Object.isFrozen(PUBLIC_FIGURE_SEARCH_INDEX)).toBe(true);
    expect(Object.isFrozen(PUBLIC_FIGURE_SEARCH_INDEX[0])).toBe(true);
    const record = getPublicFigure(data.records[0]!.id);
    expect(record).toEqual(data.records[0]);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record?.birth)).toBe(true);
    expect(getPublicFigure('public:wd-q999999999' as PublicFigureRecord['id'])).toBeNull();
  });

  it('uses the pinned chart, derived-feature, and compatibility pipeline only for supported records', () => {
    const eligible = data.records.filter(({ comparisonEligibility }) => comparisonEligibility.status === 'eligible');
    expect(eligible.length).toBeGreaterThan(0);
    for (const record of eligible) {
      const context = record.comparisonEligibility.chartContext;
      expect(context).not.toBeNull();
      const chart = inyeonSajuAdapter.calculateChart(context!);
      expect(chart.status).toBe('bounded');
      if (chart.status === 'error') continue;
      expect(chart.temporalSupport).toBe('date-only');
      expect(chart.stablePillars.hour).toMatchObject({ support: 'unavailable', pillar: null });
      expect(chart.hourDependentEvidence.eligible).toBe(false);
      const derived = deriveChartFeatures(chart);
      expect(derived.status).toBe('ok');
      if (derived.status === 'error') continue;
      for (const variant of derived.variants) expect(variant.positions).not.toHaveProperty('hour');
      const comparison = evaluateCompatibilityPair(derived, derived);
      expect(comparison).toMatchObject({
        status: 'ok', snapshot: {
          productionEligible: false,
          evidenceSummary: { state: 'no-approved-evidence', participants: {
            'person-a': { temporalSupport: 'date-only', hourEvidence: 'unavailable' },
            'person-b': { temporalSupport: 'date-only', hourEvidence: 'unavailable' },
          } },
        },
      });
    }
  });

  it('pins every generated artifact in the manifest', () => {
    expect(manifest.recordCount).toBe(data.records.length);
    for (const descriptor of Object.values(manifest.files) as { path: string; sha256: string }[]) {
      const bytes = readFileSync(resolve(dirname(fileURLToPath(new URL('../data/public-figure-manifest.v1.json', import.meta.url))), descriptor.path));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(descriptor.sha256);
    }
    expect(readFileSync(dataPath).byteLength).toBeLessThanOrEqual(2_000_000);
    expect(readFileSync(fileURLToPath(new URL('../data/public-figure-index.v1.json', import.meta.url))).byteLength)
      .toBeLessThanOrEqual(500_000);
    expect(readFileSync(fileURLToPath(new URL('../data/public-figure-quality.v1.json', import.meta.url))).byteLength)
      .toBeLessThanOrEqual(250_000);
  });

  it('uses natural US English, explicit non-endorsement, and Hangul before Hanja', () => {
    expect(PUBLIC_FIGURE_DISCLOSURE.short).toBe('Public reference—not a member or endorsement.');
    expect(PUBLIC_FIGURE_DISCLOSURE.full).toContain('Saju (사주, Four Pillars; 四柱)');
    expect(PUBLIC_FIGURE_DISCLOSURE.full.indexOf('사주')).toBeLessThan(PUBLIC_FIGURE_DISCLOSURE.full.indexOf('四柱'));
    expect(PUBLIC_FIGURE_DISCLOSURE.dateOnly).toContain('Time-based details are not used.');
  });
});

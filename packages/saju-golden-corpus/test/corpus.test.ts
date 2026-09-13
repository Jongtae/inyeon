import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const corpusPath = fileURLToPath(new URL('../data/golden-chart-corpus.v1.json', import.meta.url));
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
const approvals = JSON.parse(readFileSync(fileURLToPath(new URL('../data/golden-chart-approvals.v1.json', import.meta.url)), 'utf8'));
const timezoneReference = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../timezone-resolver/data/iana-reference-fixtures.v1.json', import.meta.url)), 'utf8',
));

describe('candidate golden chart corpus', () => {
  it('meets positive context, temporal, zone, boundary, domain, and dispute quotas', () => {
    expect(corpus.productionValidated).toBe(false);
    expect(corpus.productionEligible).toBe(false);
    expect(corpus.coverage.positiveFixtureCount).toBe(240);
    expect(corpus.coverage.negativeCapabilityFixtureCount).toBeGreaterThanOrEqual(12);
    expect(new Set(corpus.fixtures.map((fixture: { input: unknown }) => JSON.stringify(fixture.input))).size).toBe(240);
    expect(corpus.coverage.temporalSupport.exact).toBeGreaterThanOrEqual(100);
    expect(corpus.coverage.temporalSupport.approximate).toBeGreaterThanOrEqual(30);
    expect(corpus.coverage.temporalSupport.disputed).toBeGreaterThanOrEqual(25);
    expect(corpus.coverage.temporalSupport['date-only']).toBeGreaterThanOrEqual(25);
    expect(corpus.coverage.temporalSupport.unknown).toBeGreaterThanOrEqual(20);
    for (const zone of ['Asia/Seoul', 'America/New_York', 'America/Los_Angeles']) {
      expect(corpus.coverage.timeZones[zone]).toBeGreaterThanOrEqual(50);
    }
    expect(corpus.coverage.primaryCategories.ordinary).toBeGreaterThanOrEqual(60);
    expect(corpus.fixtures.filter((fixture: { primaryCategory: string; overlapTags: string[] }) =>
      fixture.primaryCategory === 'ordinary' && !fixture.overlapTags.includes('late-jasi-methodology-dispute')
      && !fixture.overlapTags.includes('civil-day-edge')).length).toBeGreaterThanOrEqual(60);
    expect(corpus.coverage.primaryCategories['solar-term-boundary']).toBeGreaterThanOrEqual(48);
    expect(corpus.coverage.primaryCategories['hour-rollover']).toBeGreaterThanOrEqual(36);
    expect(corpus.coverage.overlapTags['late-jasi-methodology-dispute']).toBeGreaterThanOrEqual(24);
    expect(corpus.coverage.overlapTags['solar-reference-delta-over-60-seconds']).toBe(9);
    expect(corpus.coverage.overlapTags['leap-or-range']).toBeGreaterThanOrEqual(16);
    expect(corpus.coverage.overlapTags['iana-transition-or-rule-era']).toBeGreaterThanOrEqual(24);
    expect(Object.keys(corpus.coverage.supportedDecades)).toEqual(['1980s', '1990s', '2000s', '2010s', '2020s']);
    expect(corpus.coverage.visibleHeavenlyStemsHangul).toHaveLength(10);
    expect(corpus.coverage.visibleEarthlyBranchesHangul).toHaveLength(12);
    expect(corpus.coverage.visibleDayPillarsHangul).toHaveLength(60);

    const solarTermIndexes = new Set(corpus.fixtures
      .filter((fixture: { primaryCategory: string }) => fixture.primaryCategory === 'solar-term-boundary')
      .flatMap((fixture: { provenance: { evidenceRefs: { artifactId: string; recordIds: string[] }[] } }) =>
        fixture.provenance.evidenceRefs.find((reference) => reference.artifactId === 'issue-10-solar-term-boundaries-v1')?.recordIds ?? [])
      .map((id: string) => id.slice(-2)));
    expect(solarTermIndexes.size).toBe(12);
    expect(corpus.coverage.overlapTags['solar-state:before']).toBe(16);
    expect(corpus.coverage.overlapTags['solar-state:at']).toBe(16);
    expect(corpus.coverage.overlapTags['solar-state:after']).toBe(16);

    const hourEvidenceIds = corpus.fixtures
      .filter((fixture: { primaryCategory: string }) => fixture.primaryCategory === 'hour-rollover')
      .flatMap((fixture: { provenance: { evidenceRefs: { artifactId: string; recordIds: string[] }[] } }) =>
        fixture.provenance.evidenceRefs.find((reference) => reference.artifactId === 'issue-12-day-hour-uncertainty-v1')?.recordIds ?? []);
    expect(hourEvidenceIds).toHaveLength(36);
    expect(hourEvidenceIds.filter((id: string) => id.endsWith('-before'))).toHaveLength(12);
    expect(hourEvidenceIds.filter((id: string) => id.endsWith('-at'))).toHaveLength(12);
    expect(hourEvidenceIds.filter((id: string) => id.endsWith('-after'))).toHaveLength(12);
  });

  it('keeps candidate observations separate from manually governed approvals', () => {
    expect(corpus.approvedExpectedSource.generatorWritesThisFile).toBe(false);
    expect(approvals.generatorManaged).toBe(false);
    expect(approvals.productionValidated).toBe(false);
    expect(approvals.productionEligible).toBe(false);
    expect(approvals.approvedExpected).toEqual([]);
    for (const fixture of corpus.fixtures) {
      expect(fixture).toHaveProperty('candidateObserved.sourceChart');
      expect(fixture).toHaveProperty('candidateObserved.derivedFeatures');
      expect(fixture).not.toHaveProperty('approvedExpected');
      expect(fixture.approvalRef).toBeNull();
      expect(fixture.adjudication).toEqual({ status: 'pending', approvedExpectationRef: null });
    }
  });

  it('preserves fixture identity, candidate status, temporal suppression, and pinned evidence bytes', () => {
    const fixtureIds = corpus.fixtures.map((fixture: { id: string }) => fixture.id);
    expect(new Set(fixtureIds).size).toBe(corpus.fixtures.length);

    for (const fixture of corpus.fixtures) {
      expect(fixture.provenance.fixtureKind).toBe('synthetic-reference-case');
      expect(fixture.provenance.advisorReview).toEqual({ status: 'not-performed', reference: null });
      expect(fixture.methodologyDisposition)
        .toBe(fixture.dispute.status === 'none' ? 'candidate-unreviewed' : 'candidate-disputed-isolated');
      expect(fixture.validationStatus).toBe('generated-regression-snapshot');
      expect(fixture.input.profileVersion).toBe('korean-saju-v1');
      expect(fixture.candidateObserved.sourceChart.provenance.productionValidated).toBe(false);
      expect(fixture.candidateObserved.sourceChart.provenance.profileStatus).toBe('candidate');
      expect(fixture.candidateObserved.derivedFeatures.provenance.productionValidated).toBe(false);

      const suppressesHour = fixture.input.temporalSupport === 'date-only' || fixture.input.temporalSupport === 'unknown';
      if (suppressesHour) expect(fixture.candidateObserved.sourceChart.stablePillars.hour.support).toBe('unavailable');
      else expect(fixture.candidateObserved.sourceChart.stablePillars.hour.support).not.toBe('unavailable');
      expect(fixture.candidateObserved.sourceChart.hourDependentEvidence.eligible)
        .toBe(fixture.candidateObserved.sourceChart.stablePillars.hour.support === 'invariant');
      for (const variant of fixture.candidateObserved.derivedFeatures.variants) {
        expect(Object.hasOwn(variant.positions, 'hour')).toBe(!suppressesHour);
        expect(variant.visibleElementOccurrences.observedSymbolCount).toBe(suppressesHour ? 6 : 8);
      }
    }

    for (const source of Object.values(corpus.sourceArtifacts) as { path: string; sha256: string }[]) {
      const actual = createHash('sha256').update(readFileSync(resolve(dirname(corpusPath), source.path))).digest('hex');
      expect(actual).toBe(source.sha256);
    }

    const evidenceShaByArtifactId = new Map([
      ['issue-12-day-hour-uncertainty-v1', corpus.sourceArtifacts.dayHourEvidence.sha256],
      ['issue-11-year-month-differential-v1', corpus.sourceArtifacts.yearMonthDifferential.sha256],
      ['issue-10-solar-term-boundaries-v1', corpus.sourceArtifacts.solarTermBoundaries.sha256],
      ['issue-9-iana-zic-2026c-v1', corpus.sourceArtifacts.timezoneReferenceFixtures.sha256],
    ]);
    for (const fixture of [...corpus.fixtures, ...corpus.negativeCapabilityFixtures]) {
      for (const reference of fixture.provenance?.evidenceRefs ?? fixture.evidenceRefs) {
        expect(reference.sha256).toBe(evidenceShaByArtifactId.get(reference.artifactId));
      }
    }
  });

  it('reserves E4 timezone evidence for fixtures with an exact official reference record ID', () => {
    for (const fixture of corpus.fixtures) {
      const timezoneEvidence = fixture.provenance.propertyLevelIndependence.timezoneNormalization;
      const ianaRef = fixture.provenance.evidenceRefs.find((reference: { artifactId: string }) => reference.artifactId === 'issue-9-iana-zic-2026c-v1');
      if (timezoneEvidence.grade === 'E4') {
        expect(ianaRef.recordIds.length).toBeGreaterThan(0);
        for (const recordId of ianaRef.recordIds) {
          const referenceFixture = timezoneReference.fixtures.find((candidate: { id: string }) => candidate.id === recordId);
          expect(referenceFixture?.input).toEqual({
            localDate: fixture.input.localDate,
            localTime: fixture.input.localTime,
            timeZone: fixture.input.timeZone,
          });
        }
      } else expect(timezoneEvidence.grade).toBe('E3');
    }
  });

  it('keeps negative capability cases outside the 240 positive contexts', () => {
    for (const fixture of corpus.negativeCapabilityFixtures) {
      expect(fixture.candidateObserved.status).toBe('error');
      expect(fixture.candidateObserved.error.code).toBe('NONEXISTENT_LOCAL_TIME');
    }
    for (const fixture of corpus.fixtures) expect(fixture.candidateObserved.sourceChart.status).not.toBe('error');
  });
});

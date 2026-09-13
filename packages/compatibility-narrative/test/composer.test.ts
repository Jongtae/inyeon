import { describe, expect, it, vi } from 'vitest';

import { evaluateCompatibilityPair, type EvidenceLimitationCode } from '@inyeon/compatibility-rules';
import { PROHIBITED_CLAIMS } from '@inyeon/compatibility-taxonomy';
import { inyeonSajuAdapter } from '@inyeon/saju-adapter';
import { deriveChartFeatures } from '@inyeon/saju-derived-features';
import { NARRATIVE_COPY_CATALOG } from '../src/catalog.js';
import { composeCompatibilityNarrative, composeWithCatalog } from '../src/composer.js';

type TemporalSupport = 'exact' | 'approximate' | 'disputed' | 'date-only' | 'unknown';
interface MutableSnapshot extends Record<string, unknown> {
  status: string;
  productionEligible: boolean;
  ruleSetVersion: string;
  limitations: EvidenceLimitationCode[];
  ruleEvaluations: Record<string, unknown>[];
  evidenceSummary: Record<string, unknown>;
}

const temporalCodes: Readonly<Record<TemporalSupport, readonly EvidenceLimitationCode[]>> = {
  exact: [],
  approximate: ['PERSON_A_TIME_APPROXIMATE'],
  disputed: ['PERSON_A_TIME_DISPUTED'],
  'date-only': ['PERSON_A_DATE_ONLY'],
  unknown: ['PERSON_A_TIME_UNKNOWN'],
};

function snapshot(temporalSupport: TemporalSupport = 'exact'): MutableSnapshot {
  const hourUnavailable: readonly EvidenceLimitationCode[] = ['date-only', 'unknown'].includes(temporalSupport)
    ? ['HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE'] : [];
  const limitations: EvidenceLimitationCode[] = [
    'CANDIDATE_METHODOLOGY', 'NO_APPROVED_DIMENSION_MAPPINGS', ...temporalCodes[temporalSupport],
    ...hourUnavailable,
  ];
  return {
    schemaVersion: 2,
    snapshotVersion: 'compatibility-snapshot-v2',
    evidenceModelVersion: 'evidence-availability-v1',
    ruleSetVersion: 'korean-compatibility-rules-v1',
    taxonomyVersion: 'inclusive-compatibility-v1',
    derivedFeatureVersion: 'korean-saju-derived-v1',
    status: 'candidate',
    productionEligible: false,
    temporalSupport: { 'person-a': temporalSupport, 'person-b': 'exact' },
    sourceVersions: {
      'person-a': { profileVersion: 'korean-saju-v1', adapterVersion: '0.4.0', derivedFeatureVersion: 'korean-saju-derived-v1' },
      'person-b': { profileVersion: 'korean-saju-v1', adapterVersion: '0.4.0', derivedFeatureVersion: 'korean-saju-derived-v1' },
    },
    ruleEvaluations: [],
    evidenceSummary: {
      modelVersion: 'evidence-availability-v1',
      meaning: 'Evidence availability under the selected candidate methodology; not scientific or predictive confidence.',
      state: 'no-approved-evidence',
      ruleCounts: { approved: 0, definitive: 0, alternatives: 0, unavailable: 0, suppressed: 0 },
      participants: {
        'person-a': { temporalSupport, hourEvidence: ['date-only', 'unknown'].includes(temporalSupport) ? 'unavailable' : 'available', limitationCodes: [...temporalCodes[temporalSupport], ...hourUnavailable] },
        'person-b': { temporalSupport: 'exact', hourEvidence: 'available', limitationCodes: [] },
      },
      limitationCodes: limitations,
    },
    limitations,
  };
}

const request = (value: unknown, overrides: Record<string, unknown> = {}) => ({
  snapshot: value, context: 'private-comparison', format: 'standard', tone: 'reflective', ...overrides,
});

function approvedFixture() {
  const value = structuredClone(snapshot());
  value.status = 'approved';
  value.productionEligible = true;
  value.ruleSetVersion = 'approved-test-rules-v1';
  value.limitations = ['CANDIDATE_METHODOLOGY'];
  value.ruleEvaluations = [{
    ruleId: 'reviewed-test-rule', ruleVersion: '1.0.0',
    requirements: [
      { participant: 'person-a', source: 'day-master' },
      { participant: 'person-b', source: 'day-master' },
    ],
    dimensionIds: ['conversation-rhythm'], strength: 'light', pairSemantics: { kind: 'symmetric' },
    allowedNarrativeKeys: ['reviewed.test-click'],
    blockedNarrativeCategoryIds: ['fatalistic-deterministic-scientific'],
    sourceEvidenceRefs: ['TEST-ONLY:reviewed-plumbing-reference'], reviewStatus: 'approved',
    resolution: { status: 'definitive', outcome: 'matched', coverage: [{ personAVariantIds: ['variant-001'], personBVariantIds: ['variant-001'], outcome: 'matched' }] },
    evidenceAvailability: { modelVersion: 'evidence-availability-v1', state: 'available-from-details-provided', limitationCodes: [] },
  }];
  value.evidenceSummary = {
    ...value.evidenceSummary, state: 'available',
    ruleCounts: { approved: 1, definitive: 1, alternatives: 0, unavailable: 0, suppressed: 0 },
    limitationCodes: ['CANDIDATE_METHODOLOGY'],
  };
  return value;
}

function approvedCatalog() {
  const value = structuredClone(NARRATIVE_COPY_CATALOG) as Record<string, unknown>;
  value.status = 'approved'; value.productionEligible = true; value.claimsEnabled = true;
  value.compatibleRuleSetVersion = 'approved-test-rules-v1';
  value.review = { internalProduct: 'approved', internalSafety: 'approved', culturalSajuExpert: 'approved' };
  const copy = {
    reflective: { standard: 'A reviewed conversation rhythm is present.', compact: 'A reviewed rhythm is present.', share: 'A reviewed rhythm is present.' },
    plain: { standard: 'A reviewed conversation rhythm is present.', compact: 'A reviewed rhythm is present.', share: 'A reviewed rhythm is present.' },
  };
  value.claims = [{
    copyKey: 'reviewed.test-click', ruleId: 'reviewed-test-rule', ruleVersion: '1.0.0',
    section: 'what-clicks', dimensionIds: ['conversation-rhythm'],
    evidenceRefs: ['TEST-ONLY:reviewed-plumbing-reference'], priority: 50,
    review: { internalProduct: 'approved', internalSafety: 'approved', culturalSajuExpert: 'approved' }, copy,
  }];
  return value;
}

describe('current product boundary', () => {
  it('accepts the actual empty product snapshot from the calculation pipeline', () => {
    const chart = inyeonSajuAdapter.calculateChart({
      calendarKind: 'solar', temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
      timeZone: 'America/New_York', profileVersion: 'korean-saju-v1',
      timezoneDataVersion: 'iana-2026c-inyeon-filter-v1', referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
    });
    expect(chart.status).not.toBe('error');
    if (chart.status === 'error') return;
    const derived = deriveChartFeatures(chart);
    expect(derived.status).not.toBe('error');
    if (derived.status === 'error') return;
    const compatibility = evaluateCompatibilityPair(derived, derived);
    expect(compatibility.status).toBe('ok');
    if (compatibility.status !== 'ok') return;
    const narrative = composeCompatibilityNarrative(request(compatibility.snapshot));
    expect(narrative.status).toBe('ok');
    if (narrative.status === 'ok') expect(narrative.narrative.whatClicks).toEqual([]);
  });

  it.each([
    ['approximate', { temporalSupport: 'approximate' as const, window: {
      startLocalDateTime: '2000-06-15T00:45', endLocalDateTime: '2000-06-15T01:15',
    } }],
    ['disputed', { temporalSupport: 'disputed' as const, windows: [
      { startLocalDateTime: '2000-06-15T08:00', endLocalDateTime: '2000-06-15T08:00' },
      { startLocalDateTime: '2000-06-15T20:00', endLocalDateTime: '2000-06-15T20:00' },
    ] }],
  ] as const)('accepts actual %s snapshots whose retained variants make hour evidence unavailable', (_label, temporal) => {
    const chart = inyeonSajuAdapter.calculateChart({
      calendarKind: 'solar', ...temporal, timeZone: 'America/New_York', profileVersion: 'korean-saju-v1',
      timezoneDataVersion: 'iana-2026c-inyeon-filter-v1', referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
    });
    expect(chart.status).not.toBe('error');
    if (chart.status === 'error') return;
    const derived = deriveChartFeatures(chart);
    expect(derived.status).not.toBe('error');
    if (derived.status === 'error') return;
    const compatibility = evaluateCompatibilityPair(derived, derived);
    expect(compatibility.status).toBe('ok');
    if (compatibility.status !== 'ok') return;
    expect(compatibility.snapshot.evidenceSummary.participants['person-a']).toMatchObject({
      hourEvidence: 'unavailable', limitationCodes: expect.arrayContaining(['HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE']),
    });
    const narrative = composeCompatibilityNarrative(request(compatibility.snapshot));
    expect(narrative.status).toBe('ok');
    if (narrative.status === 'ok') {
      expect(narrative.narrative.whatClicks).toEqual([]);
      expect(narrative.narrative.limitations.flatMap(({ sourceCodes }) => sourceCodes))
        .toContain('HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE');
    }
  });

  it.each(['exact', 'approximate', 'disputed', 'date-only', 'unknown'] as const)(
    'emits no relationship claim for the actual empty catalog with %s time support', (support) => {
      const first = composeCompatibilityNarrative(request(snapshot(support)));
      const second = composeCompatibilityNarrative(request(structuredClone(snapshot(support))));
      expect(first).toEqual(second);
      expect(JSON.stringify(first)).toBe(JSON.stringify(second));
      expect(first.status).toBe('ok');
      if (first.status !== 'ok') return;
      expect(first.narrative).toMatchObject({
        evidenceState: 'no-approved-evidence', productionEligible: false, headline: null,
        whatClicks: [], potentialFriction: [], whyThis: [], questionToTry: null,
        status: { text: 'No reviewed compatibility interpretation is available yet.' },
      });
      expect(first.narrative.limitations.flatMap(({ sourceCodes }) => sourceCodes)).toEqual(
        expect.arrayContaining(['CANDIDATE_METHODOLOGY', 'NO_APPROVED_DIMENSION_MAPPINGS', ...temporalCodes[support]]),
      );
      expect(Object.isFrozen(first)).toBe(true);
      expect(Object.isFrozen(first.narrative.limitations)).toBe(true);
      expect(JSON.stringify(first)).not.toMatch(/archetype|why this works|strong compatibility|score|rating|probability/iu);
    },
  );

  it.each([
    ['private-comparison', /Korean-rooted reflection/iu],
    ['public-figure-reference', /not a member or endorsement/iu],
    ['synthetic-reference', /Fictional character—not a real person or member/iu],
    ['someone-i-know', /appropriate reason or permission/iu],
  ] as const)('uses a fixed disclosure for %s without changing evidence selection', (context, pattern) => {
    const result = composeCompatibilityNarrative(request(snapshot(), { context }));
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.narrative.disclosures[0]!.text).toMatch(pattern);
    expect(result.narrative.whatClicks).toEqual([]);
  });

  it('keeps Hangul ahead of Hanja wherever Hanja appears', () => {
    const result = composeCompatibilityNarrative(request(snapshot()));
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    for (const text of JSON.stringify(result).match(/[^"\\]*(?:\\.[^"\\]*)*/gu) ?? []) {
      if (!/[\u3400-\u9fff]/u.test(text)) continue;
      expect(text.search(/[\uac00-\ud7a3]/u)).toBeGreaterThanOrEqual(0);
      expect(text.search(/[\uac00-\ud7a3]/u)).toBeLessThan(text.search(/[\u3400-\u9fff]/u));
    }
  });

  it('removes protected birth-time precision from share output', () => {
    for (const support of ['approximate', 'disputed', 'date-only', 'unknown'] as const) {
      const result = composeCompatibilityNarrative(request(snapshot(support), { format: 'share' }));
      expect(result.status).toBe('ok');
      if (result.status !== 'ok') continue;
      const serialized = JSON.stringify(result);
      expect(serialized).not.toMatch(/PERSON_[AB]_(?:TIME|DATE)|birth time|approximate|disputed|hour-dependent/iu);
      expect(result.narrative.limitations).toContainEqual({
        kind: 'limitation', copyKey: 'SHARED_SUMMARY_OMITS_DETAILS',
        text: 'Some details are not included in this shared summary.', sourceCodes: [],
      });
    }
  });
});

describe('default-deny claim gate', () => {
  it('renders only an approved production matched rule with exact traceability', () => {
    const result = composeWithCatalog(request(approvedFixture()), approvedCatalog());
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.narrative.whatClicks).toEqual([{
      kind: 'claim', section: 'what-clicks', text: 'A reviewed conversation rhythm is present.',
      trace: { ruleId: 'reviewed-test-rule', ruleVersion: '1.0.0', copyKey: 'reviewed.test-click',
        evidenceAvailability: 'available-from-details-provided', evidenceRefs: ['TEST-ONLY:reviewed-plumbing-reference'] },
    }]);
    expect(result.narrative.status.text).toBe('Reviewed compatibility evidence is available for this reflection.');
  });

  it('accepts the upper adapter variant ID while preserving the same claim', () => {
    const value = approvedFixture();
    (value.ruleEvaluations[0]!.resolution as Record<string, unknown>).coverage = [{
      personAVariantIds: ['variant-2880'], personBVariantIds: ['variant-001'], outcome: 'matched',
    }];
    expect(composeWithCatalog(request(value), approvedCatalog()).status).toBe('ok');
  });

  it.each(['not-matched', 'alternatives', 'unavailable', 'candidate'] as const)('suppresses %s evidence', (kind) => {
    const value = approvedFixture();
    const evaluation = value.ruleEvaluations[0] as Record<string, unknown>;
    if (kind === 'not-matched') evaluation.resolution = { status: 'definitive', outcome: 'not-matched', coverage: [{ personAVariantIds: ['variant-001'], personBVariantIds: ['variant-001'], outcome: 'not-matched' }] };
    if (kind === 'alternatives') {
      evaluation.resolution = { status: 'alternatives', outcomes: [
        { personAVariantIds: ['variant-001'], personBVariantIds: ['variant-001'], outcome: 'matched' },
        { personAVariantIds: ['variant-002'], personBVariantIds: ['variant-001'], outcome: 'not-matched' },
      ], limitation: 'RESULT_VARIES_ACROSS_PAIR_VARIANTS' };
      evaluation.evidenceAvailability = { modelVersion: 'evidence-availability-v1', state: 'varies-across-retained-variants', limitationCodes: ['EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'] };
      value.limitations = ['CANDIDATE_METHODOLOGY', 'EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'];
      value.evidenceSummary = { ...value.evidenceSummary, state: 'bounded',
        ruleCounts: { approved: 1, definitive: 0, alternatives: 1, unavailable: 0, suppressed: 0 },
        limitationCodes: value.limitations };
    }
    if (kind === 'unavailable') {
      value.ruleEvaluations[0] = { ruleId: 'reviewed-test-rule', ruleVersion: '1.0.0',
        requirements: [{ participant: 'person-a', source: 'pillar', position: 'hour' }], reviewStatus: 'approved',
        resolution: { status: 'unavailable', reason: 'HOUR_INPUT_UNAVAILABLE' },
        evidenceAvailability: { modelVersion: 'evidence-availability-v1', state: 'unavailable-hour-input', limitationCodes: ['HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE'] } };
      value.limitations = ['CANDIDATE_METHODOLOGY', 'HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE'];
      value.evidenceSummary = { ...value.evidenceSummary, state: 'unavailable',
        ruleCounts: { approved: 1, definitive: 0, alternatives: 0, unavailable: 1, suppressed: 0 },
        limitationCodes: value.limitations };
    }
    if (kind === 'candidate') {
      value.ruleEvaluations[0] = { ruleId: 'reviewed-test-rule', ruleVersion: '1.0.0', reviewStatus: 'candidate',
        resolution: { status: 'suppressed', reason: 'RULE_REVIEW_PENDING' },
        evidenceAvailability: { modelVersion: 'evidence-availability-v1', state: 'suppressed-review-pending', limitationCodes: ['RULE_NOT_YET_AVAILABLE'] } };
      value.evidenceSummary = {
        ...value.evidenceSummary,
        state: 'no-approved-evidence',
        ruleCounts: { approved: 0, definitive: 0, alternatives: 0, unavailable: 0, suppressed: 1 },
        limitationCodes: ['CANDIDATE_METHODOLOGY', 'NO_APPROVED_DIMENSION_MAPPINGS', 'RULE_NOT_YET_AVAILABLE'],
      };
      value.limitations = ['CANDIDATE_METHODOLOGY', 'NO_APPROVED_DIMENSION_MAPPINGS', 'RULE_NOT_YET_AVAILABLE'];
    }
    const result = composeWithCatalog(request(value), approvedCatalog());
    expect(result.status).toBe('ok');
    if (result.status === 'ok') expect(result.narrative.whatClicks).toEqual([]);
  });

  it('fails closed when the allowed copy key is missing', () => {
    const value = approvedFixture();
    value.ruleEvaluations[0]!.allowedNarrativeKeys = ['missing.reviewed-key'];
    const result = composeWithCatalog(request(value), approvedCatalog());
    expect(result.status).toBe('ok');
    if (result.status === 'ok') expect(result.narrative.whatClicks).toEqual([]);
  });

  it('does not reflect snapshot evidence refs that differ from reviewed catalog provenance', () => {
    const value = approvedFixture();
    value.ruleEvaluations[0]!.sourceEvidenceRefs = ['DOB:1990-01-01'];
    const result = composeWithCatalog(request(value), approvedCatalog());
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.narrative.whatClicks).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('DOB:1990-01-01');
  });
});

describe('hostile input and copy rejection', () => {
  it('rejects forged coverage and summary invariants', () => {
    const emptyCoverage = approvedFixture();
    (emptyCoverage.ruleEvaluations[0]!.resolution as Record<string, unknown>).coverage = [];
    expect(composeWithCatalog(request(emptyCoverage), approvedCatalog()).status).toBe('error');

    const contradictoryCoverage = approvedFixture();
    (contradictoryCoverage.ruleEvaluations[0]!.resolution as Record<string, unknown>).coverage = [{
      personAVariantIds: ['variant-001'], personBVariantIds: ['variant-001'], outcome: 'not-matched',
    }];
    expect(composeWithCatalog(request(contradictoryCoverage), approvedCatalog()).status).toBe('error');

    const falseSummary = approvedFixture();
    falseSummary.evidenceSummary = { ...falseSummary.evidenceSummary, state: 'bounded' };
    expect(composeWithCatalog(request(falseSummary), approvedCatalog()).status).toBe('error');

    for (const outcomes of [[], [
      { personAVariantIds: ['variant-001'], personBVariantIds: ['variant-001'], outcome: 'matched' },
    ], [
      { personAVariantIds: ['variant-001'], personBVariantIds: ['variant-001'], outcome: 'matched' },
      { personAVariantIds: ['variant-002'], personBVariantIds: ['variant-001'], outcome: 'matched' },
    ]]) {
      const falseAlternatives = approvedFixture();
      falseAlternatives.ruleEvaluations[0]!.resolution = {
        status: 'alternatives', outcomes, limitation: 'RESULT_VARIES_ACROSS_PAIR_VARIANTS',
      };
      falseAlternatives.ruleEvaluations[0]!.evidenceAvailability = {
        modelVersion: 'evidence-availability-v1', state: 'varies-across-retained-variants',
        limitationCodes: ['EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'],
      };
      falseAlternatives.limitations = ['CANDIDATE_METHODOLOGY', 'EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'];
      falseAlternatives.evidenceSummary = { ...falseAlternatives.evidenceSummary, state: 'bounded',
        ruleCounts: { approved: 1, definitive: 0, alternatives: 1, unavailable: 0, suppressed: 0 },
        limitationCodes: falseAlternatives.limitations };
      expect(composeWithCatalog(request(falseAlternatives), approvedCatalog()).status).toBe('error');
    }
  });

  it('rejects caller-controlled rule-set version smuggling in the public composer', () => {
    const value = snapshot();
    value.ruleSetVersion = 'dob-1990-01-01-time-1230-place-seoul';
    const result = composeCompatibilityNarrative(request(value));
    expect(result.status).toBe('error');
    expect(JSON.stringify(result)).not.toContain('1990-01-01');
  });

  it('rejects a forged hour-dependent claim when birth time is unavailable', () => {
    const value = approvedFixture();
    value.temporalSupport = { 'person-a': 'unknown', 'person-b': 'exact' };
    const summary = value.evidenceSummary;
    summary.participants = {
      'person-a': { temporalSupport: 'unknown', hourEvidence: 'unavailable', limitationCodes: ['PERSON_A_TIME_UNKNOWN', 'HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE'] },
      'person-b': { temporalSupport: 'exact', hourEvidence: 'available', limitationCodes: [] },
    };
    value.limitations = ['CANDIDATE_METHODOLOGY', 'PERSON_A_TIME_UNKNOWN', 'HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE'];
    summary.limitationCodes = value.limitations;
    value.ruleEvaluations[0]!.requirements = [{ participant: 'person-a', source: 'pillar', position: 'hour' }];
    value.ruleEvaluations[0]!.evidenceAvailability = {
      modelVersion: 'evidence-availability-v1', state: 'available-from-details-provided', limitationCodes: [],
    };
    expect(composeWithCatalog(request(value), approvedCatalog()).status).toBe('error');
  });

  it('removes alternative-time state and trace refs from share output', () => {
    const value = approvedFixture();
    const evaluation = value.ruleEvaluations[0]!;
    evaluation.resolution = { status: 'alternatives', outcomes: [
      { personAVariantIds: ['variant-001'], personBVariantIds: ['variant-001'], outcome: 'matched' },
      { personAVariantIds: ['variant-002'], personBVariantIds: ['variant-001'], outcome: 'not-matched' },
    ], limitation: 'RESULT_VARIES_ACROSS_PAIR_VARIANTS' };
    evaluation.evidenceAvailability = { modelVersion: 'evidence-availability-v1', state: 'varies-across-retained-variants', limitationCodes: ['EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'] };
    value.limitations = ['CANDIDATE_METHODOLOGY', 'EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'];
    value.evidenceSummary = { ...value.evidenceSummary, state: 'bounded',
      ruleCounts: { approved: 1, definitive: 0, alternatives: 1, unavailable: 0, suppressed: 0 },
      limitationCodes: value.limitations };
    const result = composeWithCatalog(request(value, { format: 'share' }), approvedCatalog());
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.narrative.evidenceState).toBe('shared-summary');
    expect(JSON.stringify(result)).not.toMatch(/EVIDENCE_VARIES_ACROSS_TIME_VARIANTS|varies across retained time/iu);
  });

  it('rejects unsafe evidence references and Unicode format controls', () => {
    const unsafeReference = approvedFixture();
    unsafeReference.ruleEvaluations[0]!.sourceEvidenceRefs = ['https://example.com/private'];
    expect(composeWithCatalog(request(unsafeReference), approvedCatalog()).status).toBe('error');
    const unsafeCatalog = approvedCatalog();
    const copy = ((unsafeCatalog.claims as Record<string, unknown>[])[0]!.copy as Record<string, Record<string, string>>);
    copy.reflective!.standard = 'A reviewed\u200b rhythm is present.';
    expect(composeWithCatalog(request(approvedFixture()), unsafeCatalog).status).toBe('error');
    const unrelatedHanja = approvedCatalog();
    const unrelatedCopy = ((unrelatedHanja.claims as Record<string, unknown>[])[0]!.copy as Record<string, Record<string, string>>);
    unrelatedCopy.reflective!.standard = 'Korean Saju (사주) includes 未知.';
    expect(composeWithCatalog(request(approvedFixture()), unrelatedHanja).status).toBe('error');
  });

  it('rejects correlated-ID amplification over the upstream limit', () => {
    const value = approvedFixture();
    const ids = Array.from({ length: 128 }, (_, index) => `variant-${String(index + 1).padStart(3, '0')}`);
    (value.ruleEvaluations[0]!.resolution as Record<string, unknown>).coverage = Array.from({ length: 33 }, () => ({
      personAVariantIds: ids, personBVariantIds: ids, outcome: 'matched',
    }));
    expect(composeWithCatalog(request(value), approvedCatalog()).status).toBe('error');
  });

  it('caps reviewed claims at three per section and one per rule', () => {
    const value = approvedFixture();
    const catalog = approvedCatalog();
    const baseEvaluation = value.ruleEvaluations[0]!;
    const baseClaim = (catalog.claims as Record<string, unknown>[])[0]!;
    value.ruleEvaluations = Array.from({ length: 4 }, (_, index) => ({
      ...structuredClone(baseEvaluation), ruleId: `reviewed-test-rule-${index + 1}`,
      allowedNarrativeKeys: [`reviewed.test-click-${index + 1}`],
    }));
    value.evidenceSummary = { ...value.evidenceSummary,
      ruleCounts: { approved: 4, definitive: 4, alternatives: 0, unavailable: 0, suppressed: 0 } };
    catalog.claims = Array.from({ length: 4 }, (_, index) => ({
      ...structuredClone(baseClaim), ruleId: `reviewed-test-rule-${index + 1}`,
      copyKey: `reviewed.test-click-${index + 1}`, priority: 50 - index,
    }));
    const result = composeWithCatalog(request(value), catalog);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') expect(result.narrative.whatClicks).toHaveLength(3);
  });

  it('rejects unknown raw-input keys and never reflects their values', () => {
    const canary = 'PRIVATE-BIRTH-CANARY-2042';
    const result = composeCompatibilityNarrative({ ...request(snapshot()), birthDate: canary });
    expect(result).toEqual({ status: 'error', error: { code: 'NARRATIVE_INPUT_INVALID', message: 'The narrative input is invalid or unsupported.' } });
    expect(JSON.stringify(result)).not.toContain(canary);
  });

  it('rejects accessors, throwing proxies, and cyclic substitutes', () => {
    const accessor = request(snapshot());
    Object.defineProperty(accessor, 'tone', { get: () => 'reflective', enumerable: true });
    expect(composeCompatibilityNarrative(accessor).status).toBe('error');
    const proxy = new Proxy({}, { ownKeys: () => { throw new Error('private canary'); } });
    expect(composeCompatibilityNarrative(proxy).status).toBe('error');
    const cyclic = request(snapshot()) as Record<string, unknown>;
    cyclic.snapshot = cyclic;
    expect(composeCompatibilityNarrative(cyclic).status).toBe('error');
  });

  it.each([
    '四柱 describes a reviewed rhythm.',
    '<strong>A reviewed rhythm.</strong>',
    'You have a 92% match.',
    'Why this works',
    'You should stay with them.',
  ])('rejects unsafe catalog copy: %s', (unsafe) => {
    const catalog = approvedCatalog();
    const claims = catalog.claims as Record<string, unknown>[];
    const copy = claims[0]!.copy as Record<string, Record<string, string>>;
    copy.reflective!.standard = unsafe;
    expect(composeWithCatalog(request(approvedFixture()), catalog)).toEqual({
      status: 'error', error: { code: 'NARRATIVE_CATALOG_INVALID', message: 'The narrative copy catalog is invalid or unsupported.' },
    });
  });

  it.each(PROHIBITED_CLAIMS.categories.map(({ prohibitedExample }) => prohibitedExample))(
    'rejects every prohibited-claim matrix example: %s', (unsafe) => {
      const catalog = approvedCatalog();
      const copy = ((catalog.claims as Record<string, unknown>[])[0]!.copy as Record<string, Record<string, string>>);
      copy.reflective!.standard = unsafe;
      expect(composeWithCatalog(request(approvedFixture()), catalog).status).toBe('error');
    },
  );

  it('does not call runtime I/O, persistence, clock, randomness, navigation, or console surfaces', () => {
    const random = vi.spyOn(Math, 'random');
    const now = vi.spyOn(Date, 'now');
    const fetchSpy = vi.fn();
    const log = vi.spyOn(console, 'log');
    const warn = vi.spyOn(console, 'warn');
    const error = vi.spyOn(console, 'error');
    const sideEffect = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('XMLHttpRequest', sideEffect);
    vi.stubGlobal('WebSocket', sideEffect);
    vi.stubGlobal('localStorage', { getItem: sideEffect, setItem: sideEffect });
    vi.stubGlobal('sessionStorage', { getItem: sideEffect, setItem: sideEffect });
    vi.stubGlobal('indexedDB', { open: sideEffect });
    vi.stubGlobal('caches', { open: sideEffect });
    vi.stubGlobal('navigator', { sendBeacon: sideEffect });
    vi.stubGlobal('history', { pushState: sideEffect, replaceState: sideEffect });
    vi.stubGlobal('crypto', { getRandomValues: sideEffect, randomUUID: sideEffect });
    composeCompatibilityNarrative(request(snapshot()));
    expect(random).not.toHaveBeenCalled(); expect(now).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled(); expect(sideEffect).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled(); expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
    vi.unstubAllGlobals(); vi.restoreAllMocks();
  });

  it('contains no runtime I/O or nondeterminism hooks in the composer source', async () => {
    const source = await import('node:fs/promises').then(({ readFile }) =>
      readFile(new URL('../src/composer.ts', import.meta.url), 'utf8'));
    expect(source).not.toMatch(/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|caches)\b/u);
    expect(source).not.toMatch(/(?:document\.cookie|history\.(?:pushState|replaceState)|Math\.random|Date\.now|crypto\.(?:getRandomValues|randomUUID)|console\.)/u);
  });
});

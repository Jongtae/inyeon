import { describe, expect, it, vi } from 'vitest';

import { inyeonSajuAdapter, type InyeonChartResult } from '@inyeon/saju-adapter';
import {
  deriveChartFeatures,
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  type SuccessfulChartResult,
  type SuccessfulDerivedFeatureResult,
} from '@inyeon/saju-derived-features';
import { COMPATIBILITY_RULE_SET, evaluateCompatibilityPair, validateCompatibilityRuleSet } from '../src/index.js';
import { evaluateRuleSet } from '../src/evaluator.js';
import type { CompatibilityRule, CompatibilityRuleSet } from '../src/types.js';

const common = {
  calendarKind: 'solar',
  timeZone: 'America/New_York',
  profileVersion: 'korean-saju-v1',
  timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
  referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
} as const;

function successful(result: InyeonChartResult): SuccessfulChartResult {
  if (result.status === 'error') throw new Error('Fixture calculation failed.');
  return result;
}

function derived(input: Parameters<typeof inyeonSajuAdapter.calculateChart>[0]): SuccessfulDerivedFeatureResult {
  const value = deriveChartFeatures(successful(inyeonSajuAdapter.calculateChart(input)));
  if (value.status === 'error') throw new Error('Fixture derivation failed.');
  return value;
}

const exact = () => derived({
  ...common, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
});

const blocked = ['fatalistic-deterministic-scientific', 'soulmate-score-rating', 'gender-role-stereotype'] as const;

function testRule(overrides: Partial<CompatibilityRule> = {}): CompatibilityRule {
  return {
    ruleId: 'test-only-day-master-equality',
    ruleVersion: '1.0.0-test',
    requirements: [
      { participant: 'person-a', source: 'day-master' },
      { participant: 'person-b', source: 'day-master' },
    ],
    hourDependent: false,
    predicate: {
      operator: 'all',
      clauses: [{
        operator: 'equals',
        left: { kind: 'fact', reference: { participant: 'person-a', source: 'day-master', property: 'id' } },
        right: { kind: 'fact', reference: { participant: 'person-b', source: 'day-master', property: 'id' } },
      }],
    },
    dimensionIds: ['conversation-rhythm'],
    strength: 'light',
    pairSemantics: { kind: 'symmetric' },
    directionalEvidenceKey: null,
    allowedNarrativeKeys: ['test-only.same-value'],
    blockedNarrativeCategoryIds: blocked,
    sourceEvidenceRefs: ['TEST-ONLY synthetic plumbing fixture; not Saju methodology evidence.'],
    review: { status: 'approved', internalProduct: 'reviewed', internalSafety: 'reviewed', culturalSajuExpert: 'approved' },
    ...overrides,
  };
}

function testRuleSet(rule: CompatibilityRule): CompatibilityRuleSet {
  return { ...structuredClone(COMPATIBILITY_RULE_SET), ruleSetVersion: 'test-only-rules-v1', rules: [rule] };
}

describe('product rule catalog', () => {
  it('exports an immutable, valid, empty candidate catalog', () => {
    expect(validateCompatibilityRuleSet(COMPATIBILITY_RULE_SET)).toBe(true);
    expect(COMPATIBILITY_RULE_SET).toMatchObject({
      status: 'candidate', productionEligible: false, rules: [],
      review: { culturalSajuExpert: 'pending' },
    });
    expect(Object.isFrozen(COMPATIBILITY_RULE_SET)).toBe(true);
    expect(Object.isFrozen(COMPATIBILITY_RULE_SET.rules)).toBe(true);
  });

  it('returns a deterministic, frozen, minimal snapshot without exposing chart facts', () => {
    const chart = exact();
    const first = evaluateCompatibilityPair(chart, chart);
    const second = evaluateCompatibilityPair(chart, chart);
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      status: 'ok', snapshot: {
        status: 'candidate', productionEligible: false, ruleEvaluations: [],
        limitations: ['NO_APPROVED_DIMENSION_MAPPINGS'],
      },
    });
    expect(JSON.stringify(first)).not.toContain(chart.variants[0]!.dayMaster.hangul);
    expect(JSON.stringify(first)).not.toContain(chart.variants[0]!.dayMaster.hanja);
    expect(Object.isFrozen(first)).toBe(true);
    if (first.status === 'ok') expect(Object.isFrozen(first.snapshot.sourceVersions['person-a'])).toBe(true);
  });
});

describe('closed test-only evaluator seam', () => {
  it('rejects test-only rules through the public validator but evaluates them only with the internal flag', () => {
    const set = testRuleSet(testRule());
    expect(validateCompatibilityRuleSet(set)).toBe(false);
    expect(evaluateRuleSet(set, exact(), exact())).toMatchObject({ status: 'error', error: { code: 'RULE_SET_INVALID' } });
    expect(evaluateRuleSet(set, exact(), exact(), { allowTestRules: true })).toMatchObject({
      status: 'ok', snapshot: { ruleEvaluations: [{ resolution: { status: 'definitive', outcome: 'matched' } }] },
    });
  });

  it('preserves complete pair-variant correlation and never averages alternatives', () => {
    const uncertain = derived({ ...common, temporalSupport: 'disputed', windows: [
      { startLocalDateTime: '2024-06-15T12:00', endLocalDateTime: '2024-06-15T12:00' },
      { startLocalDateTime: '2024-06-18T12:00', endLocalDateTime: '2024-06-18T12:00' },
    ] });
    const result = evaluateRuleSet(testRuleSet(testRule()), uncertain, exact(), { allowTestRules: true });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const resolution = result.snapshot.ruleEvaluations[0]!.resolution;
    expect(resolution.status).toBe('alternatives');
    if (resolution.status !== 'alternatives') return;
    expect(new Set(resolution.outcomes.map(({ outcome }) => outcome))).toEqual(new Set(['matched', 'not-matched']));
    expect(resolution.outcomes.flatMap(({ personAVariantIds }) => personAVariantIds)).toEqual(uncertain.variants.map(({ id }) => id));
    expect(resolution.limitation).toBe('RESULT_VARIES_ACROSS_PAIR_VARIANTS');
  });

  it('suppresses hour-dependent rules when either chart has no birth hour', () => {
    const unknown = derived({ ...common, temporalSupport: 'unknown', localDate: '2024-06-15' });
    const hourRule = testRule({
      ruleId: 'test-only-hour-stem-equality', hourDependent: true,
      requirements: [
        { participant: 'person-a', source: 'pillar', position: 'hour' },
        { participant: 'person-b', source: 'pillar', position: 'hour' },
      ],
      predicate: { operator: 'all', clauses: [{
        operator: 'equals',
        left: { kind: 'fact', reference: { participant: 'person-a', source: 'pillar', position: 'hour', property: 'stem-id' } },
        right: { kind: 'fact', reference: { participant: 'person-b', source: 'pillar', position: 'hour', property: 'stem-id' } },
      }] },
    });
    expect(evaluateRuleSet(testRuleSet(hourRule), unknown, exact(), { allowTestRules: true })).toMatchObject({
      status: 'ok', snapshot: { ruleEvaluations: [{ resolution: { status: 'suppressed', reason: 'HOUR_INPUT_UNAVAILABLE' } }] },
    });
  });

  it('suppresses candidate mappings instead of emitting public evidence', () => {
    const candidate = testRule({
      ruleId: 'test-only-pending-mapping',
      review: { status: 'candidate', internalProduct: 'reviewed', internalSafety: 'reviewed', culturalSajuExpert: 'pending' },
    });
    const result = evaluateRuleSet(testRuleSet(candidate), exact(), exact(), { allowTestRules: true });
    expect(result).toMatchObject({
      status: 'ok', snapshot: { ruleEvaluations: [{ resolution: { status: 'suppressed', reason: 'RULE_REVIEW_PENDING' } }] },
    });
    expect(JSON.stringify(result)).not.toContain('conversation-rhythm');
    expect(JSON.stringify(result)).not.toContain('TEST-ONLY synthetic');
  });

  it('is pair-order symmetric for symmetric test plumbing', () => {
    const first = exact();
    const second = derived({ ...common, temporalSupport: 'exact', localDate: '2024-06-18', localTime: '12:00' });
    const set = testRuleSet(testRule());
    const forward = evaluateRuleSet(set, first, second, { allowTestRules: true });
    const reverse = evaluateRuleSet(set, second, first, { allowTestRules: true });
    expect(forward.status).toBe('ok');
    expect(reverse.status).toBe('ok');
    if (forward.status === 'ok' && reverse.status === 'ok') {
      expect(forward.snapshot.ruleEvaluations[0]!.resolution).toMatchObject({ status: 'definitive', outcome: 'not-matched' });
      expect(reverse.snapshot.ruleEvaluations[0]!.resolution).toMatchObject({ status: 'definitive', outcome: 'not-matched' });
    }
  });

  it('does not freeze or mutate caller-owned rule objects', () => {
    const set = testRuleSet(testRule());
    const before = structuredClone(set);
    expect(evaluateRuleSet(set, exact(), exact(), { allowTestRules: true }).status).toBe('ok');
    expect(set).toEqual(before);
    expect(Object.isFrozen(set)).toBe(false);
    expect(Object.isFrozen(set.rules[0]!.pairSemantics)).toBe(false);
  });

  it('rejects a symmetric declaration whose predicate is structurally directional', () => {
    const directionalPredicate = testRule({
      predicate: { operator: 'all', clauses: [{
        operator: 'equals',
        left: { kind: 'fact', reference: { participant: 'person-a', source: 'day-master', property: 'element' } },
        right: { kind: 'element', value: 'wood' },
      }] },
    });
    expect(evaluateRuleSet(testRuleSet(directionalPredicate), exact(), exact(), { allowTestRules: true }))
      .toMatchObject({ status: 'error', error: { code: 'RULE_SET_INVALID' } });
  });

  it('uses canonical descriptor snapshots and never re-reads mutable proxy values', () => {
    const privateValue = 'private.raw-birth-1997-08-19';
    const safeRule = testRule();
    const proxiedRule = new Proxy(safeRule, {
      get(target, property, receiver) {
        if (property === 'allowedNarrativeKeys' || property === 'sourceEvidenceRefs') return [privateValue];
        if (property === 'review') return { ...target.review, status: 'candidate', culturalSajuExpert: 'pending' };
        return Reflect.get(target, property, receiver) as unknown;
      },
    });
    const set = { ...testRuleSet(safeRule), rules: [proxiedRule] };
    const result = evaluateRuleSet(set, exact(), exact(), { allowTestRules: true });
    expect(result.status).toBe('ok');
    expect(JSON.stringify(result)).not.toContain(privateValue);
    expect(JSON.stringify(result)).not.toContain('RULE_REVIEW_PENDING');
  });

  it('suppresses evaluation before a crafted variant-group matrix can exhaust the browser', () => {
    const stems = Object.values(HEAVENLY_STEMS);
    const branches = Object.values(EARTHLY_BRANCHES);
    const base = exact();
    const variants = Array.from({ length: 33 }, (_, index) => {
      const source = structuredClone(base.variants[0]!);
      const stem = stems[index % stems.length]!;
      const branch = branches[Math.floor(index / stems.length)]!;
      const positions = {
        ...source.positions,
        day: { ...source.positions.day, stem },
        year: { ...source.positions.year, branch },
      };
      const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      for (const pillar of Object.values(positions)) {
        counts[pillar.stem.element.id] += 1;
        counts[pillar.branch.element.id] += 1;
      }
      return {
        ...source,
        id: `variant-${String(index + 1).padStart(3, '0')}`,
        dayMaster: stem,
        positions,
        visibleElementOccurrences: { ...source.visibleElementOccurrences, ...counts },
      };
    });
    const crafted = { ...structuredClone(base), temporalSupport: 'disputed', variants };
    const rule = testRule({
      requirements: [
        { participant: 'person-a', source: 'day-master' }, { participant: 'person-b', source: 'day-master' },
        { participant: 'person-a', source: 'pillar', position: 'year' }, { participant: 'person-b', source: 'pillar', position: 'year' },
      ],
      predicate: { operator: 'all', clauses: [
        {
          operator: 'equals',
          left: { kind: 'fact', reference: { participant: 'person-a', source: 'day-master', property: 'id' } },
          right: { kind: 'fact', reference: { participant: 'person-b', source: 'day-master', property: 'id' } },
        },
        {
          operator: 'equals',
          left: { kind: 'fact', reference: { participant: 'person-a', source: 'pillar', position: 'year', property: 'branch-id' } },
          right: { kind: 'fact', reference: { participant: 'person-b', source: 'pillar', position: 'year', property: 'branch-id' } },
        },
      ] },
    });
    expect(evaluateRuleSet(testRuleSet(rule), crafted, crafted, { allowTestRules: true })).toMatchObject({
      status: 'ok', snapshot: { ruleEvaluations: [{ resolution: { status: 'suppressed', reason: 'VARIANT_MATRIX_LIMIT' } }] },
    });

    const repeatedVariants = Array.from({ length: 100 }, (_, index) => ({
      ...structuredClone(base.variants[0]!), id: `variant-${String(index + 1).padStart(3, '0')}`,
    }));
    const uniqueVariants = Array.from({ length: 100 }, (_, index) => {
      const source = structuredClone(base.variants[0]!);
      const stem = stems[index % stems.length]!;
      const branch = branches[Math.floor(index / stems.length)]!;
      const positions = {
        ...source.positions,
        day: { ...source.positions.day, stem },
        year: { ...source.positions.year, branch },
      };
      const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      for (const pillar of Object.values(positions)) {
        counts[pillar.stem.element.id] += 1;
        counts[pillar.branch.element.id] += 1;
      }
      return {
        ...source, id: `variant-${String(index + 1).padStart(3, '0')}`, dayMaster: stem, positions,
        visibleElementOccurrences: { ...source.visibleElementOccurrences, ...counts },
      };
    });
    const repeated = { ...structuredClone(base), temporalSupport: 'disputed', variants: repeatedVariants };
    const unique = { ...structuredClone(base), temporalSupport: 'disputed', variants: uniqueVariants };
    expect(evaluateRuleSet(testRuleSet(rule), repeated, unique, { allowTestRules: true })).toMatchObject({
      status: 'ok', snapshot: { ruleEvaluations: [{ resolution: { status: 'suppressed', reason: 'VARIANT_MATRIX_LIMIT' } }] },
    });
  });

  it('fails closed on malformed rules, extra identity fields, accessors, and hostile proxies', () => {
    const set = testRuleSet(testRule());
    expect(evaluateRuleSet({ ...set, taxonomyVersion: 'private-value' }, exact(), exact(), { allowTestRules: true }))
      .toMatchObject({ status: 'error', error: { code: 'RULE_SET_INVALID' } });
    expect(evaluateRuleSet({ ...set, rules: [{ ...testRule(), dimensionIds: ['private-dimension'] }] }, exact(), exact(), { allowTestRules: true }))
      .toMatchObject({ status: 'error', error: { code: 'RULE_SET_INVALID' } });
    expect(evaluateCompatibilityPair({ ...exact(), gender: 'PRIVATE-1997-08-19' }, exact()))
      .toEqual({ status: 'error', error: { code: 'COMPATIBILITY_INPUT_INVALID', message: 'The compatibility input is invalid or unsupported.' } });
    const getter = structuredClone(exact()) as unknown as Record<string, unknown>;
    Object.defineProperty(getter, 'temporalSupport', { enumerable: true, get() { throw new Error('PRIVATE-04:37'); } });
    expect(evaluateCompatibilityPair(getter, exact())).toMatchObject({ status: 'error', error: { code: 'COMPATIBILITY_INPUT_INVALID' } });
    const hostile = new Proxy(exact(), { ownKeys() { throw new Error('PRIVATE-1997-08-19'); } });
    expect(JSON.stringify(evaluateCompatibilityPair(hostile, exact()))).not.toContain('PRIVATE');
  });

  it('performs no network, storage, console, clock, or randomness I/O', () => {
    const fetchSpy = vi.fn();
    const storageSpy = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dateSpy = vi.spyOn(Date, 'now');
    const randomSpy = vi.spyOn(Math, 'random');
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('localStorage', { setItem: storageSpy });
    try {
      expect(evaluateCompatibilityPair(exact(), exact()).status).toBe('ok');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(storageSpy).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(dateSpy).not.toHaveBeenCalled();
      expect(randomSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      consoleSpy.mockRestore();
      dateSpy.mockRestore();
      randomSpy.mockRestore();
    }
  });
});

import { describe, expect, it, vi } from 'vitest';

import { inyeonSajuAdapter, type InyeonChartResult } from '@inyeon/saju-adapter';
import {
  deriveChartFeatures,
  EARTHLY_BRANCHES,
  ELEMENTS,
  HEAVENLY_STEMS,
  POLARITIES,
  SAJU_DERIVED_FEATURE_CAPABILITIES,
  type SuccessfulDerivedFeatureResult,
  type SuccessfulChartResult,
} from '../src/index.js';

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

function complete(result: ReturnType<typeof deriveChartFeatures>): SuccessfulDerivedFeatureResult {
  if (result.status === 'error') throw new Error('Feature derivation failed.');
  return result;
}

describe('canonical visible-symbol tables', () => {
  it('pins every heavenly stem element and alternating polarity', () => {
    expect(Object.keys(HEAVENLY_STEMS)).toEqual(['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']);
    expect(Object.values(HEAVENLY_STEMS).map(({ hanja, element, polarity }) =>
      `${hanja}:${element.id}:${polarity.id}`)).toEqual([
      '甲:wood:yang', '乙:wood:yin', '丙:fire:yang', '丁:fire:yin', '戊:earth:yang',
      '己:earth:yin', '庚:metal:yang', '辛:metal:yin', '壬:water:yang', '癸:water:yin',
    ]);
    expect(new Set(Object.values(HEAVENLY_STEMS).map((value) => value.id)).size).toBe(10);
    expect(Object.values(HEAVENLY_STEMS).every((value) => value.kind === 'heavenly-stem')).toBe(true);
    expect(Object.values(HEAVENLY_STEMS).map((value) => value.romanization)).toEqual([
      'Gap', 'Eul', 'Byeong', 'Jeong', 'Mu', 'Gi', 'Gyeong', 'Sin', 'Im', 'Gye',
    ]);
    expect(Object.values(HEAVENLY_STEMS).reduce<Record<string, number>>((counts, value) => {
      counts[value.element.id] = (counts[value.element.id] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ wood: 2, fire: 2, earth: 2, metal: 2, water: 2 });
    expect(Object.values(HEAVENLY_STEMS).reduce<Record<string, number>>((counts, value) => {
      counts[value.polarity.id] = (counts[value.polarity.id] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ yang: 5, yin: 5 });
  });

  it('pins every earthly branch element and polarity', () => {
    expect(Object.keys(EARTHLY_BRANCHES)).toEqual(['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']);
    expect(Object.values(EARTHLY_BRANCHES).map(({ hanja, element, polarity }) =>
      `${hanja}:${element.id}:${polarity.id}`)).toEqual([
      '子:water:yang', '丑:earth:yin', '寅:wood:yang', '卯:wood:yin',
      '辰:earth:yang', '巳:fire:yin', '午:fire:yang', '未:earth:yin',
      '申:metal:yang', '酉:metal:yin', '戌:earth:yang', '亥:water:yin',
    ]);
    expect(new Set(Object.values(EARTHLY_BRANCHES).map((value) => value.id)).size).toBe(12);
    expect(Object.values(EARTHLY_BRANCHES).every((value) => value.kind === 'earthly-branch')).toBe(true);
    expect(Object.values(EARTHLY_BRANCHES).map((value) => value.romanization)).toEqual([
      'Ja', 'Chuk', 'In', 'Myo', 'Jin', 'Sa', 'O', 'Mi', 'Sin', 'Yu', 'Sul', 'Hae',
    ]);
    expect(Object.values(EARTHLY_BRANCHES).reduce<Record<string, number>>((counts, value) => {
      counts[value.element.id] = (counts[value.element.id] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ water: 2, earth: 4, wood: 2, fire: 2, metal: 2 });
    expect(Object.values(EARTHLY_BRANCHES).reduce<Record<string, number>>((counts, value) => {
      counts[value.polarity.id] = (counts[value.polarity.id] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ yang: 6, yin: 6 });
    expect(Object.keys(ELEMENTS)).toEqual(['wood', 'fire', 'earth', 'metal', 'water']);
    expect(Object.keys(POLARITIES)).toEqual(['yang', 'yin']);
  });
});

describe('deriveChartFeatures', () => {
  it('derives Day Master and eight equal visible-symbol occurrences for an exact chart', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
    }));
    const result = complete(deriveChartFeatures(chart));
    const variant = result.variants[0]!;
    expect(result).toMatchObject({
      status: 'ok', temporalSupport: 'exact',
      stable: {
        dayMaster: { support: 'invariant' },
        positions: { year: { support: 'invariant' }, month: { support: 'invariant' }, day: { support: 'invariant' }, hour: { support: 'invariant' } },
        visibleElementOccurrences: { support: 'invariant' },
      },
      hourDependentEvidence: { eligible: true, reason: null },
      provenance: {
        schemaVersion: 1, derivedFeatureVersion: 'korean-saju-derived-v1',
        canonicalTableVersion: 'visible-stem-branch-elements-v1', weightingVersion: 'unit-visible-symbol-v1',
        status: 'candidate', productionValidated: false, sourceAdapterVersion: '0.4.0',
      },
    });
    expect(variant.dayMaster).toBe(variant.positions.day.stem);
    expect(variant.visibleElementOccurrences).toMatchObject({
      observedSymbolCount: 8,
      includedPillars: ['year', 'month', 'day', 'hour'],
      excludedPillars: [],
      weightingVersion: 'unit-visible-symbol-v1',
    });
    const counts = variant.visibleElementOccurrences;
    expect(counts.wood + counts.fire + counts.earth + counts.metal + counts.water).toBe(8);
  });

  it.each(['date-only', 'unknown'] as const)('suppresses hour and counts exactly six symbols for %s', (temporalSupport) => {
    const chart = successful(inyeonSajuAdapter.calculateChart({ ...common, temporalSupport, localDate: '2024-06-15' }));
    const result = complete(deriveChartFeatures(chart));
    expect(result.temporalSupport).toBe(temporalSupport);
    expect(result.stable.positions.hour).toEqual({ support: 'unavailable', value: null });
    expect(result.hourDependentEvidence).toEqual({ eligible: false, reason: 'TIME_NOT_SUPPORTED' });
    for (const variant of result.variants) {
      expect(variant.positions).not.toHaveProperty('hour');
      expect(variant.visibleElementOccurrences).toMatchObject({
        observedSymbolCount: 6,
        includedPillars: ['year', 'month', 'day'],
        excludedPillars: ['hour'],
      });
      const counts = variant.visibleElementOccurrences;
      expect(counts.wood + counts.fire + counts.earth + counts.metal + counts.water).toBe(6);
    }
  });

  it('keeps an exact DST fold bounded without choosing one instant', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-11-03', localTime: '01:30',
    }));
    expect(chart).toMatchObject({ status: 'bounded', candidateCount: 2, containsFold: true });
    const result = complete(deriveChartFeatures(chart));
    expect(result).toMatchObject({ status: 'ok', temporalSupport: 'exact' });
    expect(result.variants.map((variant) => variant.id)).toEqual(chart.variants.map((variant) => variant.id));
    expect(result.hourDependentEvidence).toEqual(chart.hourDependentEvidence);
  });

  it.each([
    ['approximate', { ...common, temporalSupport: 'approximate', window: { startLocalDateTime: '2024-06-15T00:45', endLocalDateTime: '2024-06-15T01:15' } }],
    ['disputed', { ...common, temporalSupport: 'disputed', windows: [
      { startLocalDateTime: '2024-06-15T00:00', endLocalDateTime: '2024-06-15T00:00' },
      { startLocalDateTime: '2024-06-18T13:00', endLocalDateTime: '2024-06-18T13:00' },
    ] }],
  ] as const)('preserves %s variant IDs, order, and correlated alternatives', (_label, input) => {
    const chart = successful(inyeonSajuAdapter.calculateChart(input));
    const result = complete(deriveChartFeatures(chart));
    expect(result.variants.map((variant) => variant.id)).toEqual(chart.variants.map((variant) => variant.id));
    expect(result.variants.map((variant) => variant.dayMaster.hangul)).toEqual(chart.variants.map((variant) => variant.pillars.day.stem));
    const alternativeGroups = result.stable.visibleElementOccurrences.support === 'alternative'
      ? result.stable.visibleElementOccurrences.values.flatMap((group) => group.variantIds)
      : result.variants.map((variant) => variant.id);
    expect(alternativeGroups).toEqual(expect.arrayContaining(result.variants.map((variant) => variant.id)));
  });

  it('propagates a day alternative into a correlated Day Master alternative', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'approximate',
      window: { startLocalDateTime: '2024-06-15T23:59', endLocalDateTime: '2024-06-16T00:00' },
    }));
    const result = complete(deriveChartFeatures(chart));
    expect(result.stable.positions.day.support).toBe('alternative');
    expect(result.stable.dayMaster.support).toBe('alternative');
    if (result.stable.dayMaster.support !== 'alternative') return;
    expect(result.stable.dayMaster.values.flatMap((value) => value.variantIds)).toEqual(result.variants.map((variant) => variant.id));
    expect(result.stable.dayMaster.values.map((value) => value.value.hangul)).toEqual(result.variants.map((variant) => variant.dayMaster.hangul));
  });

  it('keeps count alternatives as whole variant-correlated records and never averages them', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'disputed', windows: [
        { startLocalDateTime: '2024-01-02T00:00', endLocalDateTime: '2024-01-02T00:00' },
        { startLocalDateTime: '2024-08-19T13:00', endLocalDateTime: '2024-08-19T13:00' },
      ],
    }));
    const result = complete(deriveChartFeatures(chart));
    expect(result.stable.visibleElementOccurrences.support).toBe('alternative');
    if (result.stable.visibleElementOccurrences.support !== 'alternative') return;
    expect(result.stable.visibleElementOccurrences.values.flatMap((value) => value.variantIds)).toEqual(result.variants.map((variant) => variant.id));
    for (const group of result.stable.visibleElementOccurrences.values) {
      expect(group.value.wood + group.value.fire + group.value.earth + group.value.metal + group.value.water).toBe(8);
      for (const id of group.variantIds) {
        expect(group.value).toEqual(result.variants.find((variant) => variant.id === id)!.visibleElementOccurrences);
      }
    }
  });

  it('is deterministic, deeply immutable, pure, and does not mutate its input', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
    }));
    const before = JSON.stringify(chart);
    const first = complete(deriveChartFeatures(chart));
    const second = complete(deriveChartFeatures(chart));
    expect(first).toEqual(second);
    expect(JSON.stringify(chart)).toBe(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.variants)).toBe(true);
    expect(Object.isFrozen(first.variants[0]!.positions.day.stem.element)).toBe(true);
    expect(() => (first.variants as unknown as unknown[]).push(null)).toThrow(TypeError);
  });

  it('fails generically for errors, malformed provenance, invalid domain, duplicate IDs, and inconsistent stable state', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
    }));
    const cases: unknown[] = [
      { status: 'error', error: { code: 'PRIVATE-1997-08-19', message: 'PRIVATE-04:37' } },
      { ...structuredClone(chart), provenance: { ...chart.provenance, adapterVersion: 'PRIVATE-1997-08-19' } },
      { ...structuredClone(chart), variants: [{ ...structuredClone(chart.variants[0]), id: 'PRIVATE-1997-08-19' }] },
      { ...structuredClone(chart), variants: [{ ...structuredClone(chart.variants[0]), pillars: { ...structuredClone(chart.variants[0]!.pillars), day: { stem: 'PRIVATE', branch: '자', stemHanja: '甲', branchHanja: '子' } } }] },
      { ...structuredClone(chart), variantCount: 2, variants: [structuredClone(chart.variants[0]), structuredClone(chart.variants[0])] },
      { ...structuredClone(chart), nonexistentCivilMinuteCount: chart.evaluatedCivilMinuteCount },
      { ...structuredClone(chart), candidateCount: chart.evaluatedCivilMinuteCount + 1, containsFold: false },
      { ...structuredClone(chart), stablePillars: { ...structuredClone(chart.stablePillars), day: { support: 'alternative', pillar: null } } },
      new Proxy(structuredClone(chart), { ownKeys() { throw new Error('PRIVATE-1997-08-19'); } }),
    ];
    const fetchSpy = vi.fn();
    const storageSpy = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('localStorage', { setItem: storageSpy });
    try {
      for (const source of cases) {
        const result = deriveChartFeatures(source as SuccessfulChartResult);
        expect(result).toEqual({ status: 'error', error: { code: 'SOURCE_CHART_INVALID', message: 'The source chart result is invalid or unsupported.' } });
        expect(JSON.stringify(result)).not.toContain('PRIVATE');
        expect(JSON.stringify(result)).not.toContain('1997-08-19');
        expect(JSON.stringify(result)).not.toContain('04:37');
      }
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(storageSpy).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      consoleSpy.mockRestore();
    }
  });

  it('rejects inherited table keys without reflecting or freezing a polluted global prototype', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
    }));
    const privateValue = 'PRIVATE-1997-08-19T04:37';
    const forgedDay = {
      ...structuredClone(chart.variants[0]!.pillars.day), stem: '__proto__', stemHanja: privateValue,
    };
    const forged = {
      ...structuredClone(chart),
      variants: [{
        ...structuredClone(chart.variants[0]),
        pillars: { ...structuredClone(chart.variants[0]!.pillars), day: forgedDay },
      }],
      stablePillars: {
        ...structuredClone(chart.stablePillars), day: { support: 'invariant', pillar: forgedDay },
      },
    };
    const prototypeWasFrozen = Object.isFrozen(Object.prototype);
    Object.defineProperties(Object.prototype, {
      hanja: { configurable: true, enumerable: true, writable: true, value: privateValue },
      id: { configurable: true, enumerable: true, writable: true, value: 'PRIVATE-ID' },
      hangul: { configurable: true, enumerable: true, writable: true, value: '비공개' },
      romanization: { configurable: true, enumerable: true, writable: true, value: 'PRIVATE-ROMANIZATION' },
      kind: { configurable: true, enumerable: true, writable: true, value: 'heavenly-stem' },
      element: { configurable: true, enumerable: true, writable: true, value: { id: 'wood', rawBirth: privateValue } },
      polarity: { configurable: true, enumerable: true, writable: true, value: { id: 'yang' } },
      rawBirth: { configurable: true, enumerable: true, writable: true, value: privateValue },
      hour: {
        configurable: true, enumerable: true, writable: true,
        value: { stem: '갑', branch: '자', stemHanja: '甲', branchHanja: '子' },
      },
    });
    try {
      const result = deriveChartFeatures(forged as SuccessfulChartResult);
      expect(result).toEqual({
        status: 'error',
        error: { code: 'SOURCE_CHART_INVALID', message: 'The source chart result is invalid or unsupported.' },
      });
      expect(JSON.stringify(result)).not.toContain('PRIVATE');
      expect(Object.isFrozen(Object.prototype)).toBe(prototypeWasFrozen);

      const originalDay = structuredClone(chart.variants[0]!.pillars.day);
      let stemReads = 0;
      const shiftingDay = {
        get stem() {
          stemReads += 1;
          return stemReads <= 6 ? originalDay.stem : '__proto__';
        },
        branch: originalDay.branch,
        stemHanja: originalDay.stemHanja,
        branchHanja: originalDay.branchHanja,
      };
      const shifting = {
        ...structuredClone(chart),
        variants: [{
          ...structuredClone(chart.variants[0]),
          pillars: { ...structuredClone(chart.variants[0]!.pillars), day: shiftingDay },
        }],
      };
      const shiftingResult = deriveChartFeatures(shifting as unknown as SuccessfulChartResult);
      expect(shiftingResult.status).toBe('ok');
      if (shiftingResult.status === 'ok') expect(shiftingResult.variants[0]!.dayMaster.hangul).toBe(originalDay.stem);
      expect(JSON.stringify(shiftingResult)).not.toContain('PRIVATE');
      expect(Object.isFrozen(Object.prototype)).toBe(prototypeWasFrozen);

      const dateOnlyChart = successful(inyeonSajuAdapter.calculateChart({
        ...common, temporalSupport: 'date-only', localDate: '2024-06-15',
      }));
      const dateOnlyResult = complete(deriveChartFeatures(dateOnlyChart));
      expect(Object.hasOwn(dateOnlyResult.variants[0]!.positions, 'hour')).toBe(false);
      expect(dateOnlyResult.variants[0]!.positions.hour).toBeUndefined();
      expect(dateOnlyResult.variants[0]!.visibleElementOccurrences.observedSymbolCount).toBe(6);
    } finally {
      for (const key of ['hanja', 'id', 'hangul', 'romanization', 'kind', 'element', 'polarity', 'rawBirth', 'hour']) {
        delete (Object.prototype as Record<string, unknown>)[key];
      }
    }
  });

  it('exposes no forbidden scoring, relationship, identity, gender, or sexuality fields', () => {
    const chart = successful(inyeonSajuAdapter.calculateChart({
      ...common, temporalSupport: 'exact', localDate: '2024-06-15', localTime: '12:00',
    }));
    const serialized = JSON.stringify(deriveChartFeatures(chart)).toLowerCase();
    for (const forbidden of [
      'balance', 'strength', 'dominance', 'seasonal', 'hiddenstem', 'tengod', 'combination', 'clash',
      'harm', 'punishment', 'break', 'relationship', 'gender', 'sexuality', 'male', 'female',
    ]) expect(serialized).not.toContain(forbidden);
    expect(SAJU_DERIVED_FEATURE_CAPABILITIES.productionValidated).toBe(false);
  });
});

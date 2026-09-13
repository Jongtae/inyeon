import type { NormalizedPillar } from '@inyeon/saju-adapter';

import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './tables.js';
import type {
  SuccessfulDerivedFeatureResult,
  DerivedChartVariant,
  DerivedFeatureResult,
  PillarPosition,
  StableFeature,
  SuccessfulChartResult,
  VisibleElementOccurrences,
  VisiblePillarFeature,
} from './types.js';

const POSITIONS = ['year', 'month', 'day', 'hour'] as const;
const SOURCE_KEYS = new Set([
  'status', 'temporalSupport', 'stablePillars', 'candidateCount', 'variantCount', 'evaluatedCivilMinuteCount',
  'nonexistentCivilMinuteCount', 'containsFold', 'hourDependentEvidence', 'provenance', 'variants',
]);
const PROVENANCE_KEYS = new Set([
  'profileVersion', 'profileStatus', 'adapterVersion', 'upstreamName', 'upstreamVersion', 'timezoneResolverVersion',
  'timezoneDataVersion', 'referenceDataVersion', 'yearMonthReferenceDataVersion', 'solarTermDataVersion',
  'solarTermReferenceVersion', 'uncertaintyAlgebraVersion', 'dayBoundary', 'hourBranchConvention', 'trueSolarTime',
  'productionValidated',
]);
const GENERIC_ERROR = Object.freeze({
  status: 'error',
  error: Object.freeze({ code: 'SOURCE_CHART_INVALID', message: 'The source chart result is invalid or unsupported.' }),
} as const);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: ReadonlySet<string>): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.size && actual.every((key) => keys.has(key));
}

function finiteInteger(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum;
}

function normalizePillar(value: unknown): NormalizedPillar | null {
  if (!isRecord(value) || !exactKeys(value, new Set(['stem', 'branch', 'stemHanja', 'branchHanja']))) return null;
  const stemKey = value.stem;
  const branchKey = value.branch;
  const stemHanja = value.stemHanja;
  const branchHanja = value.branchHanja;
  if (typeof stemKey !== 'string' || !Object.hasOwn(HEAVENLY_STEMS, stemKey)
    || typeof branchKey !== 'string' || !Object.hasOwn(EARTHLY_BRANCHES, branchKey)) return null;
  const stem = HEAVENLY_STEMS[stemKey as keyof typeof HEAVENLY_STEMS];
  const branch = EARTHLY_BRANCHES[branchKey as keyof typeof EARTHLY_BRANCHES];
  if (stemHanja !== stem.hanja || branchHanja !== branch.hanja) return null;
  return {
    stem: stemKey as NormalizedPillar['stem'],
    branch: branchKey as NormalizedPillar['branch'],
    stemHanja: stem.hanja as NormalizedPillar['stemHanja'],
    branchHanja: branch.hanja as NormalizedPillar['branchHanja'],
  };
}

function samePillar(left: NormalizedPillar, right: NormalizedPillar): boolean {
  return left.stem === right.stem && left.branch === right.branch
    && left.stemHanja === right.stemHanja && left.branchHanja === right.branchHanja;
}

function validProvenance(value: unknown): value is SuccessfulChartResult['provenance'] {
  if (!isRecord(value) || !exactKeys(value, PROVENANCE_KEYS)) return false;
  return value.profileVersion === 'korean-saju-v1' && value.profileStatus === 'candidate'
    && value.adapterVersion === '0.4.0' && value.upstreamName === 'manseryeok' && value.upstreamVersion === '2.0.0'
    && value.timezoneResolverVersion === '0.1.0' && value.timezoneDataVersion === 'iana-2026c-inyeon-filter-v1'
    && value.referenceDataVersion === 'issue-12-day-hour-uncertainty-v1'
    && value.yearMonthReferenceDataVersion === 'issue-11-year-month-differential-v1'
    && value.solarTermDataVersion === 'manseryeok-2.0.0-embedded-solar-terms-v1'
    && value.solarTermReferenceVersion === 'issue-10-astronomy-engine-2.1.19-v1'
    && value.uncertaintyAlgebraVersion === 'birth-time-uncertainty-v1'
    && value.dayBoundary === 'local-civil-midnight'
    && value.hourBranchConvention === 'local-civil-two-hour-intervals-from-23:00'
    && value.trueSolarTime === false && value.productionValidated === false;
}

type SourcePillars = Readonly<Record<'year' | 'month' | 'day', NormalizedPillar>> & {
  readonly hour?: NormalizedPillar;
};
type SourceVariant = { readonly id: string; readonly pillars: SourcePillars };
type ValidatedSource = {
  readonly temporalSupport: SuccessfulChartResult['temporalSupport'];
  readonly variants: readonly SourceVariant[];
  readonly hourDependentEvidence: SuccessfulChartResult['hourDependentEvidence'];
};

function validStablePillars(value: unknown, variants: readonly SourceVariant[], suppressHour: boolean): boolean {
  if (!isRecord(value) || !exactKeys(value, new Set(POSITIONS))) return false;
  return POSITIONS.every((position) => {
    const support = value[position];
    if (!isRecord(support) || !exactKeys(support, new Set(['support', 'pillar']))) return false;
    const supportKind = support.support;
    const supportPillar = support.pillar;
    if (position === 'hour' && suppressHour) return supportKind === 'unavailable' && supportPillar === null;
    const pillars = variants.map((variant) => variant.pillars[position]).filter((pillar): pillar is NormalizedPillar => pillar !== undefined);
    if (pillars.length !== variants.length) return false;
    const invariant = pillars.every((pillar) => samePillar(pillars[0]!, pillar));
    if (invariant) {
      const normalizedSupportPillar = normalizePillar(supportPillar);
      return supportKind === 'invariant' && normalizedSupportPillar !== null
        && samePillar(pillars[0]!, normalizedSupportPillar);
    }
    return supportKind === 'alternative' && supportPillar === null;
  });
}

function validateSource(source: unknown): ValidatedSource | null {
  if (!isRecord(source) || !exactKeys(source, SOURCE_KEYS)) return null;
  const status = source.status;
  const temporal = source.temporalSupport;
  const candidateCount = source.candidateCount;
  const variantCount = source.variantCount;
  const evaluatedCivilMinuteCount = source.evaluatedCivilMinuteCount;
  const nonexistentCivilMinuteCount = source.nonexistentCivilMinuteCount;
  const containsFold = source.containsFold;
  const provenance = source.provenance;
  const sourceVariants = source.variants;
  const stablePillars = source.stablePillars;
  const hourDependentEvidence = source.hourDependentEvidence;
  if (status !== 'complete' && status !== 'bounded') return null;
  if (temporal !== 'exact' && temporal !== 'approximate' && temporal !== 'disputed'
    && temporal !== 'date-only' && temporal !== 'unknown') return null;
  const suppressHour = temporal === 'date-only' || temporal === 'unknown';
  if (status === 'complete' && temporal !== 'exact') return null;
  if (suppressHour && status !== 'bounded') return null;
  if (!finiteInteger(candidateCount, 1, 5_760) || !finiteInteger(variantCount, 1, 5_760)
    || variantCount > candidateCount || !finiteInteger(evaluatedCivilMinuteCount, 1, 2_880)
    || !finiteInteger(nonexistentCivilMinuteCount, 0, 2_880)
    || typeof containsFold !== 'boolean' || !validProvenance(provenance) || !Array.isArray(sourceVariants)
    || sourceVariants.length !== variantCount) return null;
  const validCivilMinuteCount = evaluatedCivilMinuteCount - nonexistentCivilMinuteCount;
  if (validCivilMinuteCount < 1 || candidateCount < validCivilMinuteCount
    || candidateCount > validCivilMinuteCount * 2
    || (containsFold ? candidateCount <= validCivilMinuteCount : candidateCount !== validCivilMinuteCount)) return null;
  const variants: SourceVariant[] = [];
  const ids = new Set<string>();
  for (const [index, candidate] of sourceVariants.entries()) {
    const expectedId = `variant-${String(index + 1).padStart(3, '0')}`;
    if (!isRecord(candidate) || !exactKeys(candidate, new Set(['id', 'pillars']))) return null;
    const candidateId = candidate.id;
    const candidatePillars = candidate.pillars;
    if (candidateId !== expectedId || ids.has(candidateId) || !isRecord(candidatePillars)) return null;
    const pillarKeys = suppressHour ? new Set(['year', 'month', 'day']) : new Set(POSITIONS);
    if (!exactKeys(candidatePillars, pillarKeys)) return null;
    const normalizedPillars = Object.create(null) as Record<string, NormalizedPillar>;
    for (const key of pillarKeys) {
      const normalized = normalizePillar(candidatePillars[key]);
      if (!normalized) return null;
      normalizedPillars[key] = normalized;
    }
    ids.add(candidateId);
    variants.push({ id: expectedId, pillars: normalizedPillars as SourcePillars });
  }
  if (variants.length !== variantCount) return null;
  if (status === 'complete' && variants.length !== 1) return null;
  if (status === 'complete' && (candidateCount !== 1 || containsFold)) return null;
  if (!validStablePillars(stablePillars, variants, suppressHour)) return null;
  if (!isRecord(hourDependentEvidence) || !exactKeys(hourDependentEvidence, new Set(['eligible', 'reason']))) return null;
  const hourPillars = variants.map((variant) => variant.pillars.hour);
  const expectedEligible = !suppressHour && hourPillars.every((pillar) =>
    pillar !== undefined && samePillar(hourPillars[0]!, pillar));
  const eligible = hourDependentEvidence.eligible;
  const sourceReason = hourDependentEvidence.reason;
  if (expectedEligible) {
    if (eligible !== true || sourceReason !== null) return null;
  } else {
    const reason = suppressHour ? 'TIME_NOT_SUPPORTED' : 'HOUR_VARIES';
    if (eligible !== false || sourceReason !== reason) return null;
  }
  return {
    temporalSupport: temporal,
    variants,
    hourDependentEvidence: expectedEligible
      ? { eligible: true, reason: null }
      : { eligible: false, reason: suppressHour ? 'TIME_NOT_SUPPORTED' : 'HOUR_VARIES' },
  };
}

function derivePillar(pillar: NormalizedPillar): VisiblePillarFeature {
  return { stem: HEAVENLY_STEMS[pillar.stem], branch: EARTHLY_BRANCHES[pillar.branch] };
}

function occurrences(positions: DerivedChartVariant['positions']): VisibleElementOccurrences {
  const hasHour = Object.hasOwn(positions, 'hour');
  const included = (hasHour ? POSITIONS : POSITIONS.slice(0, 3)) as readonly PillarPosition[];
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const position of included) {
    const pillar = positions[position];
    if (!pillar) continue;
    counts[pillar.stem.element.id] += 1;
    counts[pillar.branch.element.id] += 1;
  }
  return {
    ...counts,
    observedSymbolCount: hasHour ? 8 : 6,
    includedPillars: included,
    excludedPillars: hasHour ? [] : ['hour'],
    weightingVersion: 'unit-visible-symbol-v1',
  };
}

function groupStable<T>(variants: readonly DerivedChartVariant[], read: (variant: DerivedChartVariant) => T,
  serialize: (value: T) => string): StableFeature<T> {
  const groups = new Map<string, { variantIds: string[]; value: T }>();
  for (const variant of variants) {
    const value = read(variant);
    const key = serialize(value);
    const group = groups.get(key);
    if (group) group.variantIds.push(variant.id);
    else groups.set(key, { variantIds: [variant.id], value });
  }
  const values = [...groups.values()];
  return values.length === 1
    ? { support: 'invariant', value: values[0]!.value }
    : { support: 'alternative', values };
}

function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return Object.freeze(value);
}

function deriveValidatedChartFeatures(source: SuccessfulChartResult): DerivedFeatureResult {
  const validated = validateSource(source);
  if (!validated) return GENERIC_ERROR;
  const variants: DerivedChartVariant[] = validated.variants.map((variant) => {
    const positions = Object.assign(Object.create(null), {
      year: derivePillar(variant.pillars.year),
      month: derivePillar(variant.pillars.month),
      day: derivePillar(variant.pillars.day),
    }, Object.hasOwn(variant.pillars, 'hour') ? { hour: derivePillar(variant.pillars.hour!) } : {}) as DerivedChartVariant['positions'];
    return { id: variant.id, positions, dayMaster: positions.day.stem, visibleElementOccurrences: occurrences(positions) };
  });
  const positionStable = Object.fromEntries(POSITIONS.map((position) => {
    if (position === 'hour' && !Object.hasOwn(variants[0]!.positions, 'hour')) {
      return [position, { support: 'unavailable', value: null }];
    }
    return [position, groupStable(variants, (variant) => variant.positions[position]!, (value) => `${value.stem.id}|${value.branch.id}`)];
  })) as Record<PillarPosition, StableFeature<VisiblePillarFeature>>;
  const result: SuccessfulDerivedFeatureResult = {
    status: 'ok',
    temporalSupport: validated.temporalSupport,
    variants,
    stable: {
      positions: positionStable,
      dayMaster: groupStable(variants, (variant) => variant.dayMaster, (value) => value.id),
      visibleElementOccurrences: groupStable(variants, (variant) => variant.visibleElementOccurrences,
        (value) => `${value.wood}|${value.fire}|${value.earth}|${value.metal}|${value.water}|${value.observedSymbolCount}`),
    },
    hourDependentEvidence: { ...validated.hourDependentEvidence },
    provenance: {
      schemaVersion: 1,
      derivedFeatureVersion: 'korean-saju-derived-v1',
      canonicalTableVersion: 'visible-stem-branch-elements-v1',
      weightingVersion: 'unit-visible-symbol-v1',
      status: 'candidate',
      productionValidated: false,
      sourceProfileVersion: 'korean-saju-v1',
      sourceAdapterVersion: '0.4.0',
      sourceUpstreamName: 'manseryeok',
      sourceUpstreamVersion: '2.0.0',
      sourceTimezoneResolverVersion: '0.1.0',
      sourceTimezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
      sourceReferenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
      sourceYearMonthReferenceDataVersion: 'issue-11-year-month-differential-v1',
      sourceSolarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1',
      sourceSolarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1',
      sourceUncertaintyAlgebraVersion: 'birth-time-uncertainty-v1',
      sourceDayBoundary: 'local-civil-midnight',
      sourceHourBranchConvention: 'local-civil-two-hour-intervals-from-23:00',
      sourceTrueSolarTime: false,
    },
  };
  return deepFreeze(result) as SuccessfulDerivedFeatureResult;
}

/** Pure derivation from a successful, version-pinned adapter chart result. */
export function deriveChartFeatures(source: SuccessfulChartResult): DerivedFeatureResult {
  try {
    return deriveValidatedChartFeatures(source);
  } catch {
    return GENERIC_ERROR;
  }
}

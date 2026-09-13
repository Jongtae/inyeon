import { COMPATIBILITY_TAXONOMY, PROHIBITED_CLAIMS, type DimensionId, type PairSemantics } from '@inyeon/compatibility-taxonomy';
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from '@inyeon/saju-derived-features';

import type {
  AtomicPredicate,
  CompatibilityEvaluationResult,
  CompatibilityRule,
  CompatibilityRuleSet,
  CompatibilitySnapshot,
  CorrelatedRuleOutcome,
  EvidenceAvailabilityState,
  EvidenceLimitationCode,
  FactReference,
  RuleOperand,
  RuleParticipant,
} from './types.js';

const INPUT_ERROR = Object.freeze({
  status: 'error',
  error: Object.freeze({
    code: 'COMPATIBILITY_INPUT_INVALID',
    message: 'The compatibility input is invalid or unsupported.',
  }),
} as const);
const RULE_SET_ERROR = Object.freeze({
  status: 'error',
  error: Object.freeze({
    code: 'RULE_SET_INVALID',
    message: 'The compatibility rule set is invalid or unsupported.',
  }),
} as const);
const TEMPORAL = new Set(['exact', 'approximate', 'disputed', 'date-only', 'unknown']);
const ELEMENTS = new Set(['wood', 'fire', 'earth', 'metal', 'water']);
const POLARITIES = new Set(['yang', 'yin']);
const POSITIONS = new Set(['year', 'month', 'day', 'hour']);
const DIMENSIONS = new Set(COMPATIBILITY_TAXONOMY.dimensions.map(({ id }) => id));
const BLOCKED_CATEGORIES = new Set(PROHIBITED_CLAIMS.categories.map(({ id }) => id));
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u;
const SAFE_ID = /^[a-z][a-z0-9-]{2,95}$/u;
const SAFE_KEY = /^[a-z][a-z0-9.-]{2,127}$/u;
const SYMBOL_ID = /^[a-z0-9-]{1,64}$/u;
const MAX_VARIANT_GROUP_PAIRS = 1_024;
const MAX_CORRELATED_ID_SLOTS = 8_192;
const CANONICAL_SYMBOLS = new Map([...Object.values(HEAVENLY_STEMS), ...Object.values(EARTHLY_BRANCHES)]
  .map((symbol) => [symbol.id, { kind: symbol.kind, element: symbol.element.id, polarity: symbol.polarity.id }]));

type SafeRecord = Readonly<Record<string, unknown>>;
type Primitive = string | number;
type CanonicalSymbol = { readonly id: string; readonly element: string; readonly polarity: string };
type CanonicalPillar = { readonly stem: CanonicalSymbol; readonly branch: CanonicalSymbol };
type CanonicalVariant = {
  readonly id: string;
  readonly dayMaster: CanonicalSymbol;
  readonly positions: Readonly<Partial<Record<'year' | 'month' | 'day' | 'hour', CanonicalPillar>>>;
  readonly occurrences: Readonly<Record<string, number>>;
};
type ValidatedChart = {
  readonly temporalSupport: CompatibilitySnapshot['temporalSupport'][RuleParticipant];
  readonly variants: readonly CanonicalVariant[];
  readonly hourEligible: boolean;
  readonly profileVersion: 'korean-saju-v1';
  readonly adapterVersion: '0.4.0';
};

function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return Object.freeze(value);
}

function record(value: unknown, exactKeys?: readonly string[]): SafeRecord | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  try {
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== 'string')) return null;
    if (exactKeys) {
      const expected = [...exactKeys].sort();
      const actual = (keys as string[]).sort();
      if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) return null;
    }
    const copy = Object.create(null) as Record<string, unknown>;
    for (const key of keys as string[]) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !('value' in descriptor)) return null;
      copy[key] = descriptor.value;
    }
    return copy;
  } catch {
    return null;
  }
}

function exact(value: SafeRecord, expectedKeys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function array(value: unknown): readonly unknown[] | null {
  if (!Array.isArray(value)) return null;
  try {
    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, 'length');
    if (!lengthDescriptor || !('value' in lengthDescriptor) || !Number.isSafeInteger(lengthDescriptor.value)
      || Number(lengthDescriptor.value) < 0 || Number(lengthDescriptor.value) > 5_760) return null;
    const result: unknown[] = [];
    for (let index = 0; index < Number(lengthDescriptor.value); index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !('value' in descriptor)) return null;
      result.push(descriptor.value);
    }
    return result;
  } catch {
    return null;
  }
}

function parseSymbol(value: unknown): CanonicalSymbol | null {
  const symbol = record(value, ['id', 'kind', 'hangul', 'hanja', 'romanization', 'element', 'polarity']);
  const element = symbol ? record(symbol.element) : null;
  const polarity = symbol ? record(symbol.polarity) : null;
  const canonical = typeof symbol?.id === 'string' ? CANONICAL_SYMBOLS.get(symbol.id) : undefined;
  if (!symbol || typeof symbol.id !== 'string' || !SYMBOL_ID.test(symbol.id)
    || typeof symbol.hangul !== 'string' || typeof symbol.hanja !== 'string'
    || typeof symbol.romanization !== 'string' || !element || !polarity
    || typeof element.id !== 'string' || !ELEMENTS.has(element.id)
    || typeof polarity.id !== 'string' || !POLARITIES.has(polarity.id)
    || !canonical || canonical.kind !== symbol.kind || canonical.element !== element.id || canonical.polarity !== polarity.id) return null;
  return { id: symbol.id, element: element.id, polarity: polarity.id };
}

function parsePillar(value: unknown): CanonicalPillar | null {
  const pillar = record(value, ['stem', 'branch']);
  const stem = pillar ? parseSymbol(pillar.stem) : null;
  const branch = pillar ? parseSymbol(pillar.branch) : null;
  return stem && branch ? { stem, branch } : null;
}

function parseVariant(value: unknown, suppressHour: boolean): CanonicalVariant | null {
  const variant = record(value, ['id', 'positions', 'dayMaster', 'visibleElementOccurrences']);
  const positionsValue = variant ? record(variant.positions) : null;
  const dayMaster = variant ? parseSymbol(variant.dayMaster) : null;
  const occurrencesValue = variant ? record(variant.visibleElementOccurrences, [
    'wood', 'fire', 'earth', 'metal', 'water', 'observedSymbolCount', 'includedPillars', 'excludedPillars', 'weightingVersion',
  ]) : null;
  if (!variant || typeof variant.id !== 'string' || !/^variant-\d{3,4}$/u.test(variant.id)
    || !positionsValue || !dayMaster || !occurrencesValue
    || !exact(positionsValue, suppressHour ? ['year', 'month', 'day'] : ['year', 'month', 'day', 'hour'])
    || occurrencesValue.weightingVersion !== 'unit-visible-symbol-v1') return null;
  const positions: Partial<Record<'year' | 'month' | 'day' | 'hour', CanonicalPillar>> = Object.create(null);
  for (const position of Object.keys(positionsValue)) {
    const pillar = parsePillar(positionsValue[position]);
    if (!pillar) return null;
    positions[position as keyof typeof positions] = pillar;
  }
  if (positions.day?.stem.id !== dayMaster.id || positions.day.stem.element !== dayMaster.element
    || positions.day.stem.polarity !== dayMaster.polarity) return null;
  const occurrences: Record<string, number> = Object.create(null);
  const computedOccurrences: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const pillar of Object.values(positions)) {
    if (!pillar) continue;
    computedOccurrences[pillar.stem.element] = (computedOccurrences[pillar.stem.element] ?? 0) + 1;
    computedOccurrences[pillar.branch.element] = (computedOccurrences[pillar.branch.element] ?? 0) + 1;
  }
  for (const element of ELEMENTS) {
    const count = occurrencesValue[element];
    if (!Number.isSafeInteger(count) || Number(count) < 0 || Number(count) > 8
      || Number(count) !== computedOccurrences[element]) return null;
    occurrences[element] = Number(count);
  }
  const observed = occurrencesValue.observedSymbolCount;
  const included = array(occurrencesValue.includedPillars);
  const excluded = array(occurrencesValue.excludedPillars);
  const expectedIncluded = suppressHour ? ['year', 'month', 'day'] : ['year', 'month', 'day', 'hour'];
  const expectedExcluded = suppressHour ? ['hour'] : [];
  if (observed !== (suppressHour ? 6 : 8)
    || Object.values(occurrences).reduce((sum, count) => sum + count, 0) !== observed
    || !included || !excluded || JSON.stringify(included) !== JSON.stringify(expectedIncluded)
    || JSON.stringify(excluded) !== JSON.stringify(expectedExcluded)) return null;
  occurrences['observed-symbol-count'] = observed;
  return { id: variant.id, dayMaster, positions, occurrences };
}

function validateChart(value: unknown): ValidatedChart | null {
  const chart = record(value, ['status', 'temporalSupport', 'variants', 'stable', 'hourDependentEvidence', 'provenance']);
  if (!chart || chart.status !== 'ok' || typeof chart.temporalSupport !== 'string' || !TEMPORAL.has(chart.temporalSupport)) return null;
  const variantValues = array(chart.variants);
  const hourEvidence = record(chart.hourDependentEvidence, ['eligible', 'reason']);
  const provenance = record(chart.provenance, [
    'schemaVersion', 'derivedFeatureVersion', 'canonicalTableVersion', 'weightingVersion', 'status', 'productionValidated',
    'sourceProfileVersion', 'sourceAdapterVersion', 'sourceUpstreamName', 'sourceUpstreamVersion',
    'sourceTimezoneResolverVersion', 'sourceTimezoneDataVersion', 'sourceReferenceDataVersion',
    'sourceYearMonthReferenceDataVersion', 'sourceSolarTermDataVersion', 'sourceSolarTermReferenceVersion',
    'sourceUncertaintyAlgebraVersion', 'sourceDayBoundary', 'sourceHourBranchConvention', 'sourceTrueSolarTime',
  ]);
  if (!variantValues?.length || !hourEvidence || typeof hourEvidence.eligible !== 'boolean' || !provenance
    || provenance.derivedFeatureVersion !== 'korean-saju-derived-v1'
    || provenance.sourceProfileVersion !== 'korean-saju-v1'
    || provenance.sourceAdapterVersion !== '0.4.0' || provenance.schemaVersion !== 1
    || provenance.status !== 'candidate' || provenance.productionValidated !== false) return null;
  const suppressHour = chart.temporalSupport === 'date-only' || chart.temporalSupport === 'unknown';
  if (suppressHour && hourEvidence.eligible !== false) return null;
  const variants = variantValues.map((variant) => parseVariant(variant, suppressHour));
  if (variants.some((variant) => variant === null)) return null;
  const ids = variants.map((variant) => variant!.id);
  if (new Set(ids).size !== ids.length
    || ids.some((id, index) => id !== `variant-${String(index + 1).padStart(3, '0')}`)) return null;
  return {
    temporalSupport: chart.temporalSupport as ValidatedChart['temporalSupport'],
    variants: variants as CanonicalVariant[],
    hourEligible: hourEvidence.eligible,
    profileVersion: 'korean-saju-v1',
    adapterVersion: '0.4.0',
  };
}

function parseReference(value: unknown): FactReference | null {
  const ref = record(value);
  if (!ref || (ref.participant !== 'person-a' && ref.participant !== 'person-b')) return null;
  if (ref.source === 'day-master') {
    return exact(ref, ['participant', 'source', 'property'])
      && (ref.property === 'id' || ref.property === 'element' || ref.property === 'polarity')
      ? { participant: ref.participant, source: 'day-master', property: ref.property } : null;
  }
  if (ref.source === 'visible-element-occurrences') {
    return exact(ref, ['participant', 'source', 'property'])
      && typeof ref.property === 'string' && (ELEMENTS.has(ref.property) || ref.property === 'observed-symbol-count')
      ? {
          participant: ref.participant,
          source: 'visible-element-occurrences',
          property: ref.property as Extract<FactReference, { source: 'visible-element-occurrences' }>['property'],
        }
      : null;
  }
  return ref.source === 'pillar' && exact(ref, ['participant', 'source', 'position', 'property'])
    && typeof ref.position === 'string' && POSITIONS.has(ref.position)
    && typeof ref.property === 'string'
    && new Set(['stem-id', 'stem-element', 'stem-polarity', 'branch-id', 'branch-element', 'branch-polarity']).has(ref.property)
    ? {
        participant: ref.participant,
        source: 'pillar',
        position: ref.position as 'year' | 'month' | 'day' | 'hour',
        property: ref.property as Extract<FactReference, { source: 'pillar' }>['property'],
      }
    : null;
}

function parseOperand(value: unknown): RuleOperand | null {
  const operand = record(value);
  if (!operand || typeof operand.kind !== 'string') return null;
  if (operand.kind === 'fact' && exact(operand, ['kind', 'reference'])) {
    const reference = parseReference(operand.reference);
    return reference ? { kind: 'fact', reference } : null;
  }
  if (!exact(operand, ['kind', 'value'])) return null;
  if (operand.kind === 'element' && typeof operand.value === 'string' && ELEMENTS.has(operand.value)) {
    return { kind: 'element', value: operand.value as 'wood' | 'fire' | 'earth' | 'metal' | 'water' };
  }
  if (operand.kind === 'polarity' && typeof operand.value === 'string' && POLARITIES.has(operand.value)) {
    return { kind: 'polarity', value: operand.value as 'yang' | 'yin' };
  }
  if (operand.kind === 'count' && Number.isSafeInteger(operand.value) && Number(operand.value) >= 0 && Number(operand.value) <= 8) {
    return { kind: 'count', value: Number(operand.value) };
  }
  return operand.kind === 'symbol-id' && typeof operand.value === 'string' && operand.value.length > 0 && operand.value.length <= 24
    ? { kind: 'symbol-id', value: operand.value } : null;
}

function refKey(ref: FactReference): string {
  return `${ref.participant}|${ref.source}|${'position' in ref ? ref.position : ''}|${ref.property}`;
}

function parseRequirement(value: unknown): CompatibilityRule['requirements'][number] | null {
  const parsed = record(value);
  if (!parsed) return null;
  const key = requirementKey(parsed);
  if (!key) return null;
  if (parsed.source === 'pillar') {
    return { participant: parsed.participant as RuleParticipant, source: 'pillar', position: parsed.position as 'year' | 'month' | 'day' | 'hour' };
  }
  return { participant: parsed.participant as RuleParticipant, source: parsed.source as 'day-master' | 'visible-element-occurrences' };
}

function requirementKey(value: SafeRecord): string | null {
  if (value.participant !== 'person-a' && value.participant !== 'person-b') return null;
  if (value.source === 'day-master' && exact(value, ['participant', 'source'])) return `${value.participant}|day-master`;
  if (value.source === 'visible-element-occurrences' && exact(value, ['participant', 'source'])) return `${value.participant}|visible-element-occurrences`;
  if (value.source === 'pillar' && typeof value.position === 'string' && POSITIONS.has(value.position)
    && exact(value, ['participant', 'source', 'position'])) return `${value.participant}|pillar|${value.position}`;
  return null;
}

function parsePairSemantics(value: unknown): PairSemantics | null {
  const semantics = record(value);
  if (!semantics) return null;
  if (semantics.kind === 'symmetric' && exact(semantics, ['kind'])) return { kind: 'symmetric' };
  if (semantics.kind !== 'directional' || !exact(semantics, ['kind', 'source', 'target', 'evidenceDirection', 'swapSemantics'])
    || (semantics.source !== 'person-a' && semantics.source !== 'person-b')
    || (semantics.target !== 'person-a' && semantics.target !== 'person-b') || semantics.source === semantics.target
    || semantics.evidenceDirection !== `${semantics.source}-to-${semantics.target}`
    || semantics.swapSemantics !== 'reverse-participants') return null;
  return {
    kind: 'directional', source: semantics.source, target: semantics.target,
    evidenceDirection: semantics.evidenceDirection as `${RuleParticipant}-to-${RuleParticipant}`,
    swapSemantics: 'reverse-participants',
  };
}

function referenceRequirementKey(ref: FactReference): string {
  return ref.source === 'pillar' ? `${ref.participant}|pillar|${ref.position}` : `${ref.participant}|${ref.source}`;
}

function sameFeature(left: FactReference, right: FactReference): boolean {
  if (left.source !== right.source || left.property !== right.property) return false;
  return left.source !== 'pillar' || (right.source === 'pillar' && left.position === right.position);
}

function parseRule(value: unknown, allowTestRules: boolean): CompatibilityRule | null {
  const rule = record(value, [
    'ruleId', 'ruleVersion', 'requirements', 'hourDependent', 'predicate', 'dimensionIds', 'strength', 'pairSemantics',
    'directionalEvidenceKey', 'allowedNarrativeKeys', 'blockedNarrativeCategoryIds', 'sourceEvidenceRefs', 'review',
  ]);
  if (!rule || typeof rule.ruleId !== 'string' || !SAFE_ID.test(rule.ruleId)
    || (!allowTestRules && rule.ruleId.startsWith('test-only-'))
    || typeof rule.ruleVersion !== 'string' || !SEMVER.test(rule.ruleVersion)
    || typeof rule.hourDependent !== 'boolean'
    || (rule.strength !== 'light' && rule.strength !== 'moderate' && rule.strength !== 'pronounced')) return null;
  const pairSemantics = parsePairSemantics(rule.pairSemantics);
  if (!pairSemantics) return null;
  const requirements = array(rule.requirements);
  const parsedRequirements = requirements?.map(parseRequirement);
  const requirementKeys = parsedRequirements?.map((item) => item ? requirementKey(record(item)!) : null);
  if (!parsedRequirements?.length || parsedRequirements.length > 16 || parsedRequirements.some((item) => item === null) || !requirementKeys
    || requirementKeys.some((key) => key === null) || new Set(requirementKeys).size !== requirementKeys.length) return null;
  const predicate = record(rule.predicate, ['operator', 'clauses']);
  const clauses = predicate?.operator === 'all' ? array(predicate.clauses) : null;
  if (!clauses?.length || clauses.length > 16) return null;
  const parsedClauses: AtomicPredicate[] = [];
  for (const valueClause of clauses) {
    const clause = record(valueClause, ['operator', 'left', 'right']);
    const left = clause ? record(clause.left, ['kind', 'reference']) : null;
    if (!clause || (clause.operator !== 'equals' && clause.operator !== 'not-equals') || left?.kind !== 'fact'
      ) return null;
    const leftReference = parseReference(left.reference);
    const right = parseOperand(clause.right);
    if (!leftReference || !right) return null;
    const references = [leftReference, ...(right.kind === 'fact' ? [right.reference] : [])];
    if (references.some((ref) => !requirementKeys.includes(referenceRequirementKey(ref)))) return null;
    if (pairSemantics.kind === 'symmetric' && (right.kind !== 'fact'
      || leftReference.participant === right.reference.participant
      || !sameFeature(leftReference, right.reference))) return null;
    parsedClauses.push({ operator: clause.operator, left: { kind: 'fact', reference: leftReference }, right });
  }
  if (pairSemantics.kind === 'symmetric') {
    const aRequirements = new Set(requirementKeys.filter((key): key is string => key !== null && key.startsWith('person-a|'))
      .map((key) => key.replace(/^person-a\|/u, '')));
    const bRequirements = new Set(requirementKeys.filter((key): key is string => key !== null && key.startsWith('person-b|'))
      .map((key) => key.replace(/^person-b\|/u, '')));
    if (aRequirements.size !== bRequirements.size || [...aRequirements].some((key) => !bRequirements.has(key))) return null;
  }
  const requiresHour = (parsedRequirements as CompatibilityRule['requirements']).some((requirement) =>
    requirement.source === 'visible-element-occurrences'
    || (requirement.source === 'pillar' && requirement.position === 'hour'));
  if (rule.hourDependent !== requiresHour) return null;
  const dimensions = array(rule.dimensionIds);
  const allowedKeys = array(rule.allowedNarrativeKeys);
  const blockedIds = array(rule.blockedNarrativeCategoryIds);
  const sourceRefs = array(rule.sourceEvidenceRefs);
  if (!dimensions?.length || dimensions.length > 8 || dimensions.some((id) => typeof id !== 'string' || !DIMENSIONS.has(id as DimensionId))
    || new Set(dimensions).size !== dimensions.length
    || !allowedKeys?.length || allowedKeys.length > 32 || allowedKeys.some((key) => typeof key !== 'string' || !SAFE_KEY.test(key))
    || !blockedIds?.length || blockedIds.length > BLOCKED_CATEGORIES.size
    || blockedIds.some((id) => typeof id !== 'string' || !BLOCKED_CATEGORIES.has(id))
    || !sourceRefs?.length || sourceRefs.length > 32
    || sourceRefs.some((ref) => typeof ref !== 'string' || ref.length === 0 || ref.length > 240)) return null;
  if ((pairSemantics.kind === 'symmetric' && rule.directionalEvidenceKey !== null)
    || (pairSemantics.kind === 'directional' && (typeof rule.directionalEvidenceKey !== 'string' || !SAFE_KEY.test(rule.directionalEvidenceKey)))) return null;
  const review = record(rule.review, ['status', 'internalProduct', 'internalSafety', 'culturalSajuExpert']);
  if (!review || (review.status !== 'candidate' && review.status !== 'approved')
    || review.internalProduct !== 'reviewed' || review.internalSafety !== 'reviewed'
    || (review.culturalSajuExpert !== 'pending' && review.culturalSajuExpert !== 'approved')
    || (review.status === 'approved' && review.culturalSajuExpert !== 'approved')) return null;
  return {
    ruleId: rule.ruleId,
    ruleVersion: rule.ruleVersion,
    requirements: parsedRequirements as CompatibilityRule['requirements'],
    hourDependent: rule.hourDependent,
    predicate: { operator: 'all', clauses: parsedClauses },
    dimensionIds: dimensions as DimensionId[],
    strength: rule.strength,
    pairSemantics,
    directionalEvidenceKey: rule.directionalEvidenceKey as string | null,
    allowedNarrativeKeys: allowedKeys as string[],
    blockedNarrativeCategoryIds: blockedIds as string[],
    sourceEvidenceRefs: sourceRefs as string[],
    review: {
      status: review.status,
      internalProduct: 'reviewed',
      internalSafety: 'reviewed',
      culturalSajuExpert: review.culturalSajuExpert,
    },
  };
}

function parseRuleSet(value: unknown, allowTestRules: boolean): CompatibilityRuleSet | null {
  const set = record(value, [
    'schemaVersion', 'ruleSetVersion', 'taxonomyVersion', 'derivedFeatureVersion', 'status', 'productionEligible', 'review', 'rules',
  ]);
  if (!set || set.schemaVersion !== 1 || typeof set.ruleSetVersion !== 'string' || !SAFE_KEY.test(set.ruleSetVersion)
    || set.taxonomyVersion !== 'inclusive-compatibility-v1' || set.derivedFeatureVersion !== 'korean-saju-derived-v1'
    || set.status !== 'candidate' || set.productionEligible !== false) return null;
  const review = record(set.review, ['internalProduct', 'internalSafety', 'culturalSajuExpert']);
  const ruleValues = array(set.rules);
  if (!review || review.internalProduct !== 'reviewed' || review.internalSafety !== 'reviewed'
    || review.culturalSajuExpert !== 'pending' || !ruleValues || ruleValues.length > 64) return null;
  const rules = ruleValues.map((rule) => parseRule(rule, allowTestRules));
  if (rules.some((rule) => rule === null)) return null;
  const identities = rules.map((rule) => `${rule!.ruleId}@${rule!.ruleVersion}`);
  if (new Set(identities).size !== identities.length) return null;
  return {
    schemaVersion: 1,
    ruleSetVersion: set.ruleSetVersion,
    taxonomyVersion: 'inclusive-compatibility-v1',
    derivedFeatureVersion: 'korean-saju-derived-v1',
    status: 'candidate',
    productionEligible: false,
    review: { internalProduct: 'reviewed', internalSafety: 'reviewed', culturalSajuExpert: 'pending' },
    rules: rules as CompatibilityRule[],
  };
}

function readFact(variant: CanonicalVariant, ref: FactReference): Primitive | null {
  if (ref.source === 'day-master') {
    return variant.dayMaster[ref.property];
  }
  if (ref.source === 'visible-element-occurrences') {
    return variant.occurrences[ref.property] ?? null;
  }
  const pillar = variant.positions[ref.position];
  const [side, property] = ref.property.split('-') as ['stem' | 'branch', 'id' | 'element' | 'polarity'];
  const symbol = pillar?.[side];
  if (!symbol) return null;
  return symbol[property];
}

function collectReferences(rule: CompatibilityRule, participant: RuleParticipant): readonly FactReference[] {
  const references: FactReference[] = [];
  for (const clause of rule.predicate.clauses) {
    if (clause.left.reference.participant === participant) references.push(clause.left.reference);
    if (clause.right.kind === 'fact' && clause.right.reference.participant === participant) references.push(clause.right.reference);
  }
  const unique = new Map(references.map((ref) => [refKey(ref), ref]));
  return [...unique.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([, ref]) => ref);
}

type VariantGroup = { readonly ids: readonly string[]; readonly values: ReadonlyMap<string, Primitive | null> };

function groupVariants(chart: ValidatedChart, references: readonly FactReference[]): readonly VariantGroup[] | null {
  const groups = new Map<string, { ids: string[]; values: ReadonlyMap<string, Primitive | null> }>();
  for (const variant of chart.variants) {
    const values = new Map(references.map((ref) => [refKey(ref), readFact(variant, ref)]));
    const signature = JSON.stringify(references.map((ref) => values.get(refKey(ref))));
    const existing = groups.get(signature);
    if (existing) existing.ids.push(variant.id);
    else groups.set(signature, { ids: [variant.id], values });
  }
  return [...groups.values()];
}

function operandValue(operand: RuleOperand, a: VariantGroup, b: VariantGroup): Primitive | null {
  if (operand.kind === 'fact') {
    return (operand.reference.participant === 'person-a' ? a : b).values.get(refKey(operand.reference)) ?? null;
  }
  return operand.value;
}

function evaluateClause(clause: AtomicPredicate, a: VariantGroup, b: VariantGroup): boolean | null {
  const left = operandValue(clause.left, a, b);
  const right = operandValue(clause.right, a, b);
  if (left === null || right === null || typeof left !== typeof right) return null;
  return clause.operator === 'equals' ? left === right : left !== right;
}

function evidenceAvailability(state: EvidenceAvailabilityState, limitationCodes: readonly EvidenceLimitationCode[]) {
  return { modelVersion: 'evidence-availability-v1' as const, state, limitationCodes: [...limitationCodes] };
}

function cloneRequirements(rule: CompatibilityRule) {
  return rule.requirements.map((requirement) => requirement.source === 'pillar'
    ? { participant: requirement.participant, source: 'pillar' as const, position: requirement.position }
    : { participant: requirement.participant, source: requirement.source });
}

function nonEvidenceEvaluation(
  rule: CompatibilityRule,
  reviewStatus: CompatibilityRule['review']['status'],
  resolution: Extract<CompatibilitySnapshot['ruleEvaluations'][number]['resolution'], { status: 'suppressed' | 'unavailable' }>,
  state: EvidenceAvailabilityState,
  codes: readonly EvidenceLimitationCode[],
) {
  const base = {
    ruleId: rule.ruleId,
    ruleVersion: rule.ruleVersion,
    reviewStatus,
    resolution,
    evidenceAvailability: evidenceAvailability(state, codes),
  };
  return reviewStatus === 'approved' ? { ...base, reviewStatus, requirements: cloneRequirements(rule) } : base;
}

function evaluateRule(rule: CompatibilityRule, a: ValidatedChart, b: ValidatedChart) {
  if (rule.review.status !== 'approved') {
    return nonEvidenceEvaluation(
      rule, 'candidate', { status: 'suppressed', reason: 'RULE_REVIEW_PENDING' },
      'suppressed-review-pending', ['RULE_NOT_YET_AVAILABLE'],
    );
  }
  const pairSemantics: PairSemantics = rule.pairSemantics.kind === 'symmetric'
    ? { kind: 'symmetric' }
    : {
        kind: 'directional',
        source: rule.pairSemantics.source,
        target: rule.pairSemantics.target,
        evidenceDirection: rule.pairSemantics.evidenceDirection,
        swapSemantics: 'reverse-participants',
      };
  const evidenceBase = {
    ruleId: rule.ruleId,
    ruleVersion: rule.ruleVersion,
    requirements: cloneRequirements(rule),
    dimensionIds: [...rule.dimensionIds],
    strength: rule.strength,
    pairSemantics,
    allowedNarrativeKeys: [...rule.allowedNarrativeKeys],
    blockedNarrativeCategoryIds: [...rule.blockedNarrativeCategoryIds],
    sourceEvidenceRefs: [...rule.sourceEvidenceRefs],
    reviewStatus: 'approved' as const,
  } as const;
  if (rule.hourDependent && (!a.hourEligible || !b.hourEligible
    || a.temporalSupport === 'date-only' || a.temporalSupport === 'unknown'
    || b.temporalSupport === 'date-only' || b.temporalSupport === 'unknown')) {
    return nonEvidenceEvaluation(
      rule, 'approved', { status: 'unavailable', reason: 'HOUR_INPUT_UNAVAILABLE' },
      'unavailable-hour-input', ['HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE'],
    );
  }
  const aGroups = groupVariants(a, collectReferences(rule, 'person-a'));
  const bGroups = groupVariants(b, collectReferences(rule, 'person-b'));
  if (!aGroups || !bGroups) return null;
  const groupPairs = aGroups.length * bGroups.length;
  const correlatedIdSlots = bGroups.length * a.variants.length + aGroups.length * b.variants.length;
  if (groupPairs > MAX_VARIANT_GROUP_PAIRS || correlatedIdSlots > MAX_CORRELATED_ID_SLOTS) {
    return nonEvidenceEvaluation(
      rule, 'approved', { status: 'suppressed', reason: 'VARIANT_MATRIX_LIMIT' },
      'suppressed-resource-limit', ['EVALUATION_RESOURCE_LIMIT'],
    );
  }
  const outcomes: CorrelatedRuleOutcome[] = [];
  for (const left of aGroups) {
    for (const right of bGroups) {
      const clauses = rule.predicate.clauses.map((clause) => evaluateClause(clause, left, right));
      if (clauses.some((value) => value === null)) {
        return nonEvidenceEvaluation(
          rule, 'approved', { status: 'unavailable', reason: 'REQUIRED_FEATURE_UNAVAILABLE' },
          'unavailable-required-input', ['REQUIRED_INPUT_UNAVAILABLE'],
        );
      }
      const outcome = clauses.every(Boolean) ? 'matched' as const : 'not-matched' as const;
      outcomes.push({ personAVariantIds: [...left.ids], personBVariantIds: [...right.ids], outcome });
    }
  }
  const values = new Set(outcomes.map(({ outcome }) => outcome));
  if (values.size === 1) {
    const direct = a.temporalSupport === 'exact' && b.temporalSupport === 'exact'
      && a.variants.length === 1 && b.variants.length === 1;
    return {
      ...evidenceBase,
      resolution: { status: 'definitive' as const, outcome: outcomes[0]!.outcome, coverage: outcomes },
      evidenceAvailability: evidenceAvailability(
        direct ? 'available-from-details-provided' : 'consistent-across-retained-variants',
        [],
      ),
    };
  }
  return {
    ...evidenceBase,
    resolution: { status: 'alternatives' as const, outcomes, limitation: 'RESULT_VARIES_ACROSS_PAIR_VARIANTS' as const },
    evidenceAvailability: evidenceAvailability(
      'varies-across-retained-variants', ['EVIDENCE_VARIES_ACROSS_TIME_VARIANTS'],
    ),
  };
}

export function validateCompatibilityRuleSet(value: unknown): value is CompatibilityRuleSet {
  try {
    return parseRuleSet(value, false) !== null;
  } catch {
    return false;
  }
}

function participantEvidenceContext(chart: ValidatedChart, participant: RuleParticipant) {
  const role = participant === 'person-a' ? 'PERSON_A' : 'PERSON_B';
  const temporalCode: EvidenceLimitationCode | null = chart.temporalSupport === 'approximate'
    ? `${role}_TIME_APPROXIMATE` as EvidenceLimitationCode
    : chart.temporalSupport === 'disputed'
      ? `${role}_TIME_DISPUTED` as EvidenceLimitationCode
      : chart.temporalSupport === 'date-only'
        ? `${role}_DATE_ONLY` as EvidenceLimitationCode
        : chart.temporalSupport === 'unknown'
          ? `${role}_TIME_UNKNOWN` as EvidenceLimitationCode
          : null;
  const limitationCodes: EvidenceLimitationCode[] = temporalCode ? [temporalCode] : [];
  if (!chart.hourEligible) limitationCodes.push('HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE');
  return {
    temporalSupport: chart.temporalSupport,
    hourEvidence: chart.hourEligible ? 'available' as const : 'unavailable' as const,
    limitationCodes,
  };
}

function buildEvidenceSummary(
  evaluations: CompatibilitySnapshot['ruleEvaluations'],
  personA: ValidatedChart,
  personB: ValidatedChart,
) {
  const approved = evaluations.filter(({ reviewStatus }) => reviewStatus === 'approved');
  const definitive = approved.filter(({ resolution }) => resolution.status === 'definitive').length;
  const alternatives = approved.filter(({ resolution }) => resolution.status === 'alternatives').length;
  const unavailable = approved.filter(({ resolution }) => resolution.status === 'unavailable').length;
  const suppressed = evaluations.filter(({ resolution }) => resolution.status === 'suppressed').length;
  const state = approved.length === 0
    ? 'no-approved-evidence' as const
    : definitive === approved.length && suppressed === 0
      ? 'available' as const
      : alternatives === approved.length && suppressed === 0
        ? 'bounded' as const
        : unavailable === approved.length && suppressed === 0
          ? 'unavailable' as const
          : 'mixed' as const;
  const participants = {
    'person-a': participantEvidenceContext(personA, 'person-a'),
    'person-b': participantEvidenceContext(personB, 'person-b'),
  };
  const limitationCodes: EvidenceLimitationCode[] = ['CANDIDATE_METHODOLOGY'];
  if (approved.length === 0) limitationCodes.push('NO_APPROVED_DIMENSION_MAPPINGS');
  limitationCodes.push(...participants['person-a'].limitationCodes, ...participants['person-b'].limitationCodes);
  for (const evaluation of evaluations) limitationCodes.push(...evaluation.evidenceAvailability.limitationCodes);
  return {
    modelVersion: 'evidence-availability-v1' as const,
    meaning: 'Evidence availability under the selected candidate methodology; not scientific or predictive confidence.' as const,
    state,
    ruleCounts: { approved: approved.length, definitive, alternatives, unavailable, suppressed },
    participants,
    limitationCodes: [...new Set(limitationCodes)],
  };
}

/** Internal seam used by package tests; it is not exported from the package entry point. */
export function evaluateRuleSet(
  ruleSetValue: unknown,
  personAValue: unknown,
  personBValue: unknown,
  options: { readonly allowTestRules?: boolean } = {},
): CompatibilityEvaluationResult {
  try {
    const ruleSet = parseRuleSet(ruleSetValue, options.allowTestRules === true);
    if (!ruleSet) return RULE_SET_ERROR;
    const personA = validateChart(personAValue);
    const personB = validateChart(personBValue);
    if (!personA || !personB) return INPUT_ERROR;
    const evaluations = [...ruleSet.rules]
      .sort((left, right) => {
        const leftKey = `${left.ruleId}@${left.ruleVersion}`;
        const rightKey = `${right.ruleId}@${right.ruleVersion}`;
        return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
      })
      .map((rule) => evaluateRule(rule, personA, personB));
    if (evaluations.some((value) => value === null)) return INPUT_ERROR;
    const ruleEvaluations = evaluations as CompatibilitySnapshot['ruleEvaluations'];
    const evidenceSummary = buildEvidenceSummary(ruleEvaluations, personA, personB);
    const snapshot: CompatibilitySnapshot = {
      schemaVersion: 2,
      snapshotVersion: 'compatibility-snapshot-v2',
      evidenceModelVersion: 'evidence-availability-v1',
      ruleSetVersion: ruleSet.ruleSetVersion,
      taxonomyVersion: ruleSet.taxonomyVersion,
      derivedFeatureVersion: ruleSet.derivedFeatureVersion,
      status: 'candidate',
      productionEligible: false,
      temporalSupport: { 'person-a': personA.temporalSupport, 'person-b': personB.temporalSupport },
      sourceVersions: {
        'person-a': { profileVersion: personA.profileVersion, adapterVersion: personA.adapterVersion, derivedFeatureVersion: 'korean-saju-derived-v1' },
        'person-b': { profileVersion: personB.profileVersion, adapterVersion: personB.adapterVersion, derivedFeatureVersion: 'korean-saju-derived-v1' },
      },
      ruleEvaluations,
      evidenceSummary,
      limitations: evidenceSummary.limitationCodes,
    };
    return deepFreeze({ status: 'ok' as const, snapshot }) as CompatibilityEvaluationResult;
  } catch {
    return INPUT_ERROR;
  }
}

import taxonomyData from '../data/compatibility-taxonomy.v1.json' with { type: 'json' };
import prohibitedData from '../data/prohibited-claims.v1.json' with { type: 'json' };

import type {
  CompatibilityTaxonomy,
  PairSemantics,
  Participant,
  ProhibitedClaimsMatrix,
  TemporalClaimInput,
  TemporalClaimResolution,
} from './types.js';

function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return Object.freeze(value);
}

export const COMPATIBILITY_TAXONOMY = deepFreeze(
  taxonomyData as unknown as CompatibilityTaxonomy,
);

export const PROHIBITED_CLAIMS = deepFreeze(
  prohibitedData as unknown as ProhibitedClaimsMatrix,
);

function parsePairSemantics(semantics: unknown): PairSemantics | null {
  if (semantics === null || typeof semantics !== 'object') return null;
  try {
    const keys = Object.keys(semantics).sort();
    const valueFor = (key: string): unknown => {
      const descriptor = Object.getOwnPropertyDescriptor(semantics, key);
      return descriptor && 'value' in descriptor ? descriptor.value : undefined;
    };
    const kind = valueFor('kind');
    if (kind === 'symmetric') {
      return keys.length === 1 && keys[0] === 'kind' ? deepFreeze({ kind: 'symmetric' as const }) : null;
    }
    if (kind !== 'directional') return null;
    const requiredKeys = ['evidenceDirection', 'kind', 'source', 'swapSemantics', 'target'];
    if (keys.length !== requiredKeys.length || keys.some((key, index) => key !== requiredKeys[index])) return null;
    const source = valueFor('source');
    const target = valueFor('target');
    const participants: readonly unknown[] = ['person-a', 'person-b'];
    if (!participants.includes(source) || !participants.includes(target) || source === target
      || valueFor('evidenceDirection') !== `${String(source)}-to-${String(target)}`
      || valueFor('swapSemantics') !== 'reverse-participants') return null;
    return deepFreeze({
      kind: 'directional' as const,
      source: source as Participant,
      target: target as Participant,
      evidenceDirection: `${String(source)}-to-${String(target)}` as `${Participant}-to-${Participant}`,
      swapSemantics: 'reverse-participants' as const,
    });
  } catch {
    return null;
  }
}

export function swapPairSemantics(semantics: unknown): PairSemantics | null {
  const parsed = parsePairSemantics(semantics);
  if (!parsed) return null;
  if (parsed.kind === 'symmetric') return parsed;
  const swap = (participant: Participant): Participant =>
    participant === 'person-a' ? 'person-b' : 'person-a';
  const source = swap(parsed.source);
  const target = swap(parsed.target);
  const evidenceDirection: `${Participant}-to-${Participant}` = `${source}-to-${target}`;
  return deepFreeze({
    kind: 'directional' as const,
    source,
    target,
    evidenceDirection,
    swapSemantics: 'reverse-participants' as const,
  });
}

export function isValidPairSemantics(semantics: unknown): semantics is PairSemantics {
  return parsePairSemantics(semantics) !== null;
}

export function resolveTemporalClaim(input: TemporalClaimInput): TemporalClaimResolution {
  if (input.hourDependent && (input.temporalSupport === 'date-only' || input.temporalSupport === 'unknown')) {
    return deepFreeze({ status: 'suppressed', reason: 'HOUR_INPUT_UNAVAILABLE' });
  }
  if (input.retainedVariantIds.length === 0 || input.variantValues.length === 0) {
    return deepFreeze({ status: 'suppressed', reason: 'NO_VARIANT_RESULT' });
  }
  const retainedVariantIds = new Set(input.retainedVariantIds);
  const valuesByVariant = new Map(input.variantValues.map(({ variantId, value }) => [variantId, value]));
  const hasExactCoverage = retainedVariantIds.size === input.retainedVariantIds.length
    && valuesByVariant.size === input.variantValues.length
    && valuesByVariant.size === retainedVariantIds.size
    && [...valuesByVariant.keys()].every((variantId) => retainedVariantIds.has(variantId));
  if (!hasExactCoverage) {
    return deepFreeze({ status: 'suppressed', reason: 'INCOMPLETE_VARIANT_COVERAGE' });
  }
  const values = [...new Set(input.retainedVariantIds.map((variantId) => valuesByVariant.get(variantId)!))];
  if (values.length === 1) {
    return deepFreeze({ status: 'definitive', value: values[0]!, coveredVariantIds: [...input.retainedVariantIds] });
  }
  return deepFreeze({
    status: 'alternatives' as const,
    variantValues: input.retainedVariantIds.map((variantId) => ({ variantId, value: valuesByVariant.get(variantId)! })),
    limitation: 'RESULT_VARIES_ACROSS_TIME_VARIANTS' as const,
  });
}

export function findProhibitedClaimCategories(text: string): readonly string[] {
  const matches = PROHIBITED_CLAIMS.categories
    .filter((category) => category.lexicalMatchers.some((matcher) => new RegExp(matcher, 'iu').test(text)))
    .map((category) => category.id);
  return Object.freeze(matches);
}

export function findForbiddenIdentityInputKeys(input: Readonly<Record<string, unknown>>): readonly string[] {
  const presentation = COMPATIBILITY_TAXONOMY.pairSemantics as {
    readonly identityInputsForbidden: readonly string[];
  };
  const normalize = (key: string): string => key.normalize('NFKC').replaceAll(/[^a-z0-9]/giu, '').toLocaleLowerCase('en-US');
  const forbidden = new Set(presentation.identityInputsForbidden.map(normalize));
  const matches = new Set<string>();
  const seen = new WeakSet<object>();
  const queue: { value: object; path: string }[] = [{ value: input, path: '' }];
  try {
    while (queue.length > 0) {
      const item = queue.shift()!;
      if (seen.has(item.value)) continue;
      seen.add(item.value);
      let current: object | null = item.value;
      while (current !== null && current !== Object.prototype) {
        for (const key of Reflect.ownKeys(current)) {
          if (typeof key !== 'string') continue;
          const path = item.path ? `${item.path}.${key}` : key;
          if (forbidden.has(normalize(key))) matches.add(path);
          const descriptor = Object.getOwnPropertyDescriptor(current, key);
          if (descriptor && 'value' in descriptor && descriptor.value !== null && typeof descriptor.value === 'object') {
            queue.push({ value: descriptor.value, path });
          }
        }
        current = Object.getPrototypeOf(current) as object | null;
      }
    }
  } catch {
    matches.add('$uninspectable-input');
  }
  return Object.freeze([...matches]);
}

export type {
  AllowedEvidenceClassId,
  CompatibilityDimension,
  CompatibilityTaxonomy,
  DimensionId,
  PairSemantics,
  Participant,
  ProhibitedClaimCategory,
  ProhibitedClaimsMatrix,
  TemporalClaimInput,
  TemporalClaimResolution,
  TemporalSupport,
} from './types.js';

import type { EvidenceAvailabilityState, EvidenceLimitationCode } from '@inyeon/compatibility-rules';
import { findProhibitedClaimCategories, isValidPairSemantics, PROHIBITED_CLAIMS } from '@inyeon/compatibility-taxonomy';

import { NARRATIVE_COPY_CATALOG } from './catalog.js';
import type {
  NarrativeClaim,
  NarrativeContext,
  NarrativeDisclosure,
  NarrativeFormat,
  NarrativeInput,
  NarrativeLimitation,
  NarrativeResult,
  NarrativeSection,
  NarrativeTone,
  NarrativeViewModel,
} from './types.js';

const INPUT_ERROR = Object.freeze({
  status: 'error',
  error: Object.freeze({
    code: 'NARRATIVE_INPUT_INVALID',
    message: 'The narrative input is invalid or unsupported.',
  }),
} as const);
const CATALOG_ERROR = Object.freeze({
  status: 'error',
  error: Object.freeze({
    code: 'NARRATIVE_CATALOG_INVALID',
    message: 'The narrative copy catalog is invalid or unsupported.',
  }),
} as const);

const CONTEXTS = new Set<NarrativeContext>([
  'private-comparison', 'public-figure-reference', 'synthetic-reference', 'someone-i-know',
]);
const FORMATS = new Set<NarrativeFormat>(['standard', 'compact', 'share']);
const TONES = new Set<NarrativeTone>(['reflective', 'plain']);
const TEMPORAL = new Set(['exact', 'approximate', 'disputed', 'date-only', 'unknown']);
const EVIDENCE_STATES = new Set(['no-approved-evidence', 'available', 'bounded', 'mixed', 'unavailable']);
const AVAILABILITY_STATES = new Set<EvidenceAvailabilityState>([
  'available-from-details-provided', 'consistent-across-retained-variants',
  'varies-across-retained-variants', 'unavailable-required-input', 'unavailable-hour-input',
  'suppressed-review-pending', 'suppressed-resource-limit',
]);
const SAFE_CLAIM_AVAILABILITY = new Set<EvidenceAvailabilityState>([
  'available-from-details-provided', 'consistent-across-retained-variants',
]);
const LIMITATION_CODES = new Set<EvidenceLimitationCode>([
  'CANDIDATE_METHODOLOGY', 'NO_APPROVED_DIMENSION_MAPPINGS',
  'PERSON_A_TIME_APPROXIMATE', 'PERSON_B_TIME_APPROXIMATE',
  'PERSON_A_TIME_DISPUTED', 'PERSON_B_TIME_DISPUTED',
  'PERSON_A_DATE_ONLY', 'PERSON_B_DATE_ONLY',
  'PERSON_A_TIME_UNKNOWN', 'PERSON_B_TIME_UNKNOWN',
  'HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE', 'EVIDENCE_VARIES_ACROSS_TIME_VARIANTS',
  'REQUIRED_INPUT_UNAVAILABLE', 'RULE_NOT_YET_AVAILABLE', 'EVALUATION_RESOURCE_LIMIT',
]);
const DIMENSIONS = new Set([
  'conversation-rhythm', 'decision-pace', 'structure-adaptation', 'autonomy-togetherness',
  'friction-repair-rhythm', 'collaboration-rhythm', 'novelty-exploration',
  'emotional-expression-rhythm',
]);
const SAFE_ID = /^[a-z][a-z0-9-]{2,95}$/u;
const SAFE_KEY = /^[a-z][a-z0-9.-]{2,127}$/u;
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u;
const SAFE_EVIDENCE_REF = /^[A-Z0-9][A-Za-z0-9._:-]{2,239}$/u;
const UNSAFE_TEXT = /[\p{Cc}\p{Cf}<>\[\]{}*_`#]|(?:https?:\/\/|www\.)/iu;
const SEMANTIC_BLOCK = /\b(?:why this works|strong compatibility|charts? click|naturally magnetic|built to understand|masculine energy|feminine energy|ancient mystical|high confidence|low confidence|you should|you must)\b|\d{1,3}%|[★☆]/iu;
const HANGUL = /[\uac00-\ud7a3]/u;
const HANJA = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
const VARIANT_ID = /^variant-(?:\d{3}|\d{4})$/u;
const MAX_RULES = 64;
const MAX_ARRAY_ITEMS = 512;
const MAX_CORRELATED_ID_SLOTS = 8_192;
const MAX_DATA_NODES = 50_000;
const MAX_STRING_UNITS = 1_000_000;
const MAX_CLAIMS_PER_SECTION = 3;
const BLOCKED_CATEGORIES = new Set(PROHIBITED_CLAIMS.categories.map(({ id }) => id));
const HANJA_PAIRS: Readonly<Record<string, string>> = Object.freeze({ 四柱: '사주', 宮合: '궁합', 因緣: '인연' });

type SafeRecord = Readonly<Record<string, unknown>>;
type CopyVariants = Readonly<Record<NarrativeTone, Readonly<Record<NarrativeFormat, string>>>>;
type ClaimCatalogEntry = {
  readonly copyKey: string;
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly section: NarrativeSection;
  readonly dimensionIds: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly priority: number;
  readonly review: { readonly internalProduct: 'approved'; readonly internalSafety: 'approved'; readonly culturalSajuExpert: 'approved' };
  readonly copy: CopyVariants;
};
type ParsedCatalog = {
  readonly compatibleRuleSetVersion: string;
  readonly productionEligible: boolean;
  readonly claimsEnabled: boolean;
  readonly statusMessages: Readonly<Record<string, CopyVariants>>;
  readonly limitations: Readonly<Record<string, CopyVariants>>;
  readonly disclosures: Readonly<Record<NarrativeContext, CopyVariants>>;
  readonly claims: readonly ClaimCatalogEntry[];
};
type ParsedEvaluation = {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly reviewStatus: 'approved' | 'candidate';
  readonly dimensionIds: readonly string[];
  readonly allowedNarrativeKeys: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
  readonly pairSemantics: unknown;
  readonly resolutionStatus: 'definitive' | 'alternatives' | 'suppressed' | 'unavailable';
  readonly outcome: 'matched' | 'not-matched' | null;
  readonly evidenceAvailability: EvidenceAvailabilityState;
  readonly limitationCodes: readonly EvidenceLimitationCode[];
  readonly hourDependent: boolean;
};
type ParsedSnapshot = {
  readonly snapshotVersion: 'compatibility-snapshot-v2';
  readonly evidenceModelVersion: 'evidence-availability-v1';
  readonly ruleSetVersion: string;
  readonly taxonomyVersion: 'inclusive-compatibility-v1';
  readonly derivedFeatureVersion: 'korean-saju-derived-v1';
  readonly status: 'candidate' | 'approved';
  readonly productionEligible: boolean;
  readonly evidenceState: NarrativeViewModel['evidenceState'];
  readonly limitations: readonly EvidenceLimitationCode[];
  readonly evaluations: readonly ParsedEvaluation[];
};

function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return Object.freeze(value);
}

function withinDataBudget(value: unknown): boolean {
  const queue: unknown[] = [value];
  const seen = new WeakSet<object>();
  let nodes = 0;
  let stringUnits = 0;
  try {
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      nodes += 1;
      if (nodes > MAX_DATA_NODES) return false;
      if (typeof current === 'string') {
        stringUnits += current.length;
        if (stringUnits > MAX_STRING_UNITS) return false;
        continue;
      }
      if (current === null || typeof current !== 'object') continue;
      if (seen.has(current)) continue;
      seen.add(current);
      const keys = Reflect.ownKeys(current);
      if (keys.length > MAX_ARRAY_ITEMS + 1) return false;
      for (const key of keys) {
        if (typeof key !== 'string') return false;
        stringUnits += key.length;
        if (stringUnits > MAX_STRING_UNITS) return false;
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (!descriptor || !('value' in descriptor)) return false;
        queue.push(descriptor.value);
      }
    }
    return true;
  } catch {
    return false;
  }
}

function record(value: unknown, exactKeys?: readonly string[]): SafeRecord | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  try {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return null;
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

function array(value: unknown, max = MAX_ARRAY_ITEMS): readonly unknown[] | null {
  if (!Array.isArray(value)) return null;
  try {
    if (Object.getPrototypeOf(value) !== Array.prototype || value.length > max) return null;
    const result: unknown[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !('value' in descriptor)) return null;
      result.push(descriptor.value);
    }
    return result;
  } catch {
    return null;
  }
}

function strings(value: unknown, pattern: RegExp, maxItems = 64, maxLength = 512): readonly string[] | null {
  const values = array(value, maxItems);
  if (!values || values.some((item) => typeof item !== 'string' || item.length > maxLength || !pattern.test(item))) return null;
  return values as readonly string[];
}

function limitationCodes(value: unknown): readonly EvidenceLimitationCode[] | null {
  const values = array(value, 64);
  if (!values || values.some((item) => typeof item !== 'string' || !LIMITATION_CODES.has(item as EvidenceLimitationCode))) return null;
  return values as readonly EvidenceLimitationCode[];
}

function safeText(value: unknown, format: NarrativeFormat): value is string {
  const budget = format === 'standard' ? 280 : format === 'compact' ? 180 : 160;
  if (typeof value !== 'string' || value.length === 0 || value.length > budget
    || UNSAFE_TEXT.test(value) || SEMANTIC_BLOCK.test(value)) return false;
  if (findProhibitedClaimCategories(value).length > 0) return false;
  if (HANJA.test(value)) {
    if (!HANGUL.test(value)) return false;
    for (const match of value.matchAll(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/gu)) {
      const hangul = HANJA_PAIRS[match[0]];
      if (!hangul || value.indexOf(hangul) < 0 || value.indexOf(hangul) > (match.index ?? -1)) return false;
    }
  }
  return true;
}

function copyVariants(value: unknown): CopyVariants | null {
  const outer = record(value, ['reflective', 'plain']);
  if (!outer) return null;
  const result = Object.create(null) as Record<NarrativeTone, Record<NarrativeFormat, string>>;
  for (const tone of TONES) {
    const variants = record(outer[tone], ['standard', 'compact', 'share']);
    if (!variants) return null;
    result[tone] = Object.create(null) as Record<NarrativeFormat, string>;
    for (const format of FORMATS) {
      const text = variants[format];
      if (!safeText(text, format)) return null;
      result[tone][format] = text;
    }
  }
  return result;
}

function variantsMap(value: unknown, exactKeys: readonly string[]): Readonly<Record<string, CopyVariants>> | null {
  const source = record(value, exactKeys);
  if (!source) return null;
  const result = Object.create(null) as Record<string, CopyVariants>;
  for (const key of exactKeys) {
    const variants = copyVariants(source[key]);
    if (!variants) return null;
    result[key] = variants;
  }
  return result;
}

function parseCatalog(value: unknown): ParsedCatalog | null {
  const catalog = record(value, [
    'schemaVersion', 'composerVersion', 'catalogVersion', 'compatibleRuleSetVersion', 'status', 'productionEligible',
    'claimsEnabled', 'review', 'publicPresentation', 'statusMessages', 'limitations',
    'disclosures', 'claims',
  ]);
  const review = catalog ? record(catalog.review, ['internalProduct', 'internalSafety', 'culturalSajuExpert']) : null;
  const presentation = catalog ? record(catalog.publicPresentation, [
    'audience', 'language', 'koreanIdentity', 'koreanScriptOrder', 'hanjaUsage',
  ]) : null;
  const scriptOrder = presentation ? array(presentation.koreanScriptOrder, 2) : null;
  if (!catalog || catalog.schemaVersion !== 1 || catalog.composerVersion !== 'deterministic-narrative-v1'
    || catalog.catalogVersion !== 'us-english-narrative-copy-v1'
    || typeof catalog.compatibleRuleSetVersion !== 'string' || !SAFE_KEY.test(catalog.compatibleRuleSetVersion)
    || !['candidate', 'approved'].includes(String(catalog.status))
    || typeof catalog.productionEligible !== 'boolean' || typeof catalog.claimsEnabled !== 'boolean'
    || !review || !presentation || presentation.audience !== 'US-first' || presentation.language !== 'English-first'
    || presentation.koreanIdentity !== 'Korean-rooted K-culture'
    || !scriptOrder || scriptOrder[0] !== 'Hangul' || scriptOrder[1] !== 'Hanja'
    || presentation.hanjaUsage !== 'Secondary traditional detail only') return null;
  const candidateReview = catalog.status === 'candidate' && review.internalProduct === 'reviewed'
    && review.internalSafety === 'reviewed' && review.culturalSajuExpert === 'pending';
  const approvedReview = catalog.status === 'approved' && review.internalProduct === 'approved'
    && review.internalSafety === 'approved' && review.culturalSajuExpert === 'approved';
  if (!candidateReview && !approvedReview) return null;

  const statusMessages = variantsMap(catalog.statusMessages, [
    'no-approved-evidence', 'evidence-unavailable', 'evidence-pending', 'evidence-available',
  ]);
  const limitations = variantsMap(catalog.limitations, [
    'CANDIDATE_METHODOLOGY', 'NO_APPROVED_DIMENSION_MAPPINGS', 'TIME_APPROXIMATE',
    'TIME_DISPUTED', 'TIME_UNAVAILABLE', 'EVIDENCE_VARIES', 'REQUIRED_INPUT_UNAVAILABLE',
    'RULE_NOT_AVAILABLE', 'RESOURCE_LIMIT', 'SHARED_SUMMARY_OMITS_DETAILS',
  ]);
  const disclosures = variantsMap(catalog.disclosures, [...CONTEXTS]);
  const claimValues = array(catalog.claims, MAX_RULES);
  if (!statusMessages || !limitations || !disclosures || !claimValues) return null;

  const claims: ClaimCatalogEntry[] = [];
  for (const item of claimValues) {
    const claim = record(item, ['copyKey', 'ruleId', 'ruleVersion', 'section', 'dimensionIds', 'evidenceRefs', 'priority', 'review', 'copy']);
    const claimReview = claim ? record(claim.review, ['internalProduct', 'internalSafety', 'culturalSajuExpert']) : null;
    const dimensions = claim ? strings(claim.dimensionIds, SAFE_ID, 8, 96) : null;
    const evidenceRefs = claim ? strings(claim.evidenceRefs, SAFE_EVIDENCE_REF, 32, 240) : null;
    const copy = claim ? copyVariants(claim.copy) : null;
    if (!claim || typeof claim.copyKey !== 'string' || !SAFE_KEY.test(claim.copyKey)
      || typeof claim.ruleId !== 'string' || !SAFE_ID.test(claim.ruleId)
      || typeof claim.ruleVersion !== 'string' || !SEMVER.test(claim.ruleVersion)
      || !['what-clicks', 'potential-friction', 'why-this'].includes(String(claim.section))
      || !dimensions || dimensions.length === 0 || dimensions.some((dimension) => !DIMENSIONS.has(dimension))
      || !evidenceRefs || evidenceRefs.length === 0 || new Set(evidenceRefs).size !== evidenceRefs.length
      || !Number.isSafeInteger(claim.priority) || Number(claim.priority) < 0 || Number(claim.priority) > 100
      || !claimReview || claimReview.internalProduct !== 'approved' || claimReview.internalSafety !== 'approved'
      || claimReview.culturalSajuExpert !== 'approved' || !copy) return null;
    claims.push({
      copyKey: claim.copyKey,
      ruleId: claim.ruleId,
      ruleVersion: claim.ruleVersion,
      section: claim.section as NarrativeSection,
      dimensionIds: dimensions,
      evidenceRefs,
      priority: Number(claim.priority),
      review: { internalProduct: 'approved', internalSafety: 'approved', culturalSajuExpert: 'approved' },
      copy,
    });
  }
  if (new Set(claims.map(({ copyKey }) => copyKey)).size !== claims.length) return null;
  const candidateBoundary = catalog.status === 'candidate' && catalog.productionEligible === false
    && catalog.claimsEnabled === false && claims.length === 0;
  const approvedBoundary = catalog.status === 'approved' && catalog.productionEligible === true
    && catalog.claimsEnabled === true && claims.length > 0;
  if (!candidateBoundary && !approvedBoundary) return null;
  return {
    compatibleRuleSetVersion: catalog.compatibleRuleSetVersion,
    productionEligible: catalog.productionEligible,
    claimsEnabled: catalog.claimsEnabled,
    statusMessages,
    limitations,
    disclosures: disclosures as Readonly<Record<NarrativeContext, CopyVariants>>,
    claims,
  };
}

function parsePairSemantics(value: unknown): unknown | null {
  const input = record(value);
  if (!input) return null;
  return isValidPairSemantics(input) ? input : null;
}

function parseRequirements(value: unknown): { readonly hourDependent: boolean } | null {
  const values = array(value, 16);
  if (!values || values.length === 0) return null;
  let hourDependent = false;
  const valid = values.every((item) => {
    const requirement = record(item);
    if (!requirement || !['person-a', 'person-b'].includes(String(requirement.participant))) return false;
    if (requirement.source === 'day-master' || requirement.source === 'visible-element-occurrences') {
      if (requirement.source === 'visible-element-occurrences') hourDependent = true;
      return record(item, ['participant', 'source']) !== null;
    }
    if (requirement.source === 'pillar' && requirement.position === 'hour') hourDependent = true;
    return requirement.source === 'pillar'
      && ['year', 'month', 'day', 'hour'].includes(String(requirement.position))
      && record(item, ['participant', 'source', 'position']) !== null;
  });
  if (!valid) return null;
  const identities = values.map((item) => {
    const requirement = record(item)!;
    return `${String(requirement.participant)}:${String(requirement.source)}:${String(requirement.position ?? '')}`;
  });
  return new Set(identities).size === identities.length ? { hourDependent } : null;
}

function variantIds(value: unknown): readonly string[] | null {
  const values = strings(value, VARIANT_ID, 128, 12);
  if (!values || values.some((id) => {
    const ordinal = Number(id.slice('variant-'.length));
    return !Number.isSafeInteger(ordinal) || ordinal < 1 || ordinal > 2_880;
  })) return null;
  return values;
}

function parseAvailability(value: unknown): { state: EvidenceAvailabilityState; limitationCodes: readonly EvidenceLimitationCode[] } | null {
  const availability = record(value, ['modelVersion', 'state', 'limitationCodes']);
  const codes = availability ? limitationCodes(availability.limitationCodes) : null;
  if (!availability || availability.modelVersion !== 'evidence-availability-v1'
    || typeof availability.state !== 'string' || !AVAILABILITY_STATES.has(availability.state as EvidenceAvailabilityState)
    || !codes) return null;
  return { state: availability.state as EvidenceAvailabilityState, limitationCodes: codes };
}

function parseResolution(value: unknown): {
  status: ParsedEvaluation['resolutionStatus'];
  outcome: ParsedEvaluation['outcome'];
  reason: string | null;
} | null {
  const base = record(value);
  if (!base || typeof base.status !== 'string') return null;
  if (base.status === 'definitive') {
    const resolution = record(value, ['status', 'outcome', 'coverage']);
    const coverage = resolution ? array(resolution.coverage, 256) : null;
    if (!resolution || !coverage || coverage.length === 0 || !['matched', 'not-matched'].includes(String(resolution.outcome))) return null;
    let correlatedIdSlots = 0;
    for (const group of coverage) {
      const item = record(group, ['personAVariantIds', 'personBVariantIds', 'outcome']);
      const personAIds = item ? variantIds(item.personAVariantIds) : null;
      const personBIds = item ? variantIds(item.personBVariantIds) : null;
      if (!item || !personAIds || personAIds.length === 0 || new Set(personAIds).size !== personAIds.length
        || !personBIds || personBIds.length === 0 || new Set(personBIds).size !== personBIds.length
        || item.outcome !== resolution.outcome) return null;
      correlatedIdSlots += personAIds.length + personBIds.length;
      if (correlatedIdSlots > MAX_CORRELATED_ID_SLOTS) return null;
    }
    return { status: 'definitive', outcome: resolution.outcome as 'matched' | 'not-matched', reason: null };
  }
  if (base.status === 'alternatives') {
    const resolution = record(value, ['status', 'outcomes', 'limitation']);
    const outcomes = resolution ? array(resolution.outcomes, 256) : null;
    if (!resolution || !outcomes || outcomes.length < 2
      || resolution.limitation !== 'RESULT_VARIES_ACROSS_PAIR_VARIANTS') return null;
    let correlatedIdSlots = 0;
    const distinctOutcomes = new Set<string>();
    for (const group of outcomes) {
      const item = record(group, ['personAVariantIds', 'personBVariantIds', 'outcome']);
      const personAIds = item ? variantIds(item.personAVariantIds) : null;
      const personBIds = item ? variantIds(item.personBVariantIds) : null;
      if (!item || !personAIds || personAIds.length === 0 || new Set(personAIds).size !== personAIds.length
        || !personBIds || personBIds.length === 0 || new Set(personBIds).size !== personBIds.length
        || !['matched', 'not-matched'].includes(String(item.outcome))) return null;
      distinctOutcomes.add(String(item.outcome));
      correlatedIdSlots += personAIds.length + personBIds.length;
      if (correlatedIdSlots > MAX_CORRELATED_ID_SLOTS) return null;
    }
    if (distinctOutcomes.size !== 2) return null;
    return { status: 'alternatives', outcome: null, reason: null };
  }
  if (base.status === 'suppressed') {
    const resolution = record(value, ['status', 'reason']);
    return resolution && ['RULE_REVIEW_PENDING', 'VARIANT_MATRIX_LIMIT'].includes(String(resolution.reason))
      ? { status: 'suppressed', outcome: null, reason: String(resolution.reason) } : null;
  }
  if (base.status === 'unavailable') {
    const resolution = record(value, ['status', 'reason']);
    return resolution && ['HOUR_INPUT_UNAVAILABLE', 'REQUIRED_FEATURE_UNAVAILABLE'].includes(String(resolution.reason))
      ? { status: 'unavailable', outcome: null, reason: String(resolution.reason) } : null;
  }
  return null;
}

function parseEvaluation(value: unknown): ParsedEvaluation | null {
  const base = record(value);
  if (!base || typeof base.reviewStatus !== 'string' || typeof base.ruleId !== 'string'
    || !SAFE_ID.test(base.ruleId) || typeof base.ruleVersion !== 'string' || !SEMVER.test(base.ruleVersion)) return null;
  const availability = parseAvailability(base.evidenceAvailability);
  const resolution = parseResolution(base.resolution);
  if (!availability || !resolution) return null;
  if (base.reviewStatus === 'candidate') {
    if (!record(value, ['ruleId', 'ruleVersion', 'reviewStatus', 'resolution', 'evidenceAvailability'])
      || resolution.status !== 'suppressed' || resolution.reason !== 'RULE_REVIEW_PENDING'
      || availability.state !== 'suppressed-review-pending'
      || JSON.stringify(availability.limitationCodes) !== JSON.stringify(['RULE_NOT_YET_AVAILABLE'])) return null;
    return { ruleId: base.ruleId, ruleVersion: base.ruleVersion, reviewStatus: 'candidate', dimensionIds: [],
      allowedNarrativeKeys: [], sourceEvidenceRefs: [], pairSemantics: null,
      resolutionStatus: resolution.status, outcome: null, evidenceAvailability: availability.state,
      limitationCodes: availability.limitationCodes, hourDependent: false };
  }
  const requirements = parseRequirements(base.requirements);
  if (base.reviewStatus !== 'approved' || !requirements) return null;
  if (resolution.status === 'suppressed' || resolution.status === 'unavailable') {
    if (!record(value, ['ruleId', 'ruleVersion', 'requirements', 'reviewStatus', 'resolution', 'evidenceAvailability'])) return null;
    const validSuppressed = resolution.status === 'suppressed' && resolution.reason === 'VARIANT_MATRIX_LIMIT'
      && availability.state === 'suppressed-resource-limit'
      && JSON.stringify(availability.limitationCodes) === JSON.stringify(['EVALUATION_RESOURCE_LIMIT']);
    const validHourUnavailable = resolution.status === 'unavailable' && resolution.reason === 'HOUR_INPUT_UNAVAILABLE'
      && requirements.hourDependent && availability.state === 'unavailable-hour-input'
      && JSON.stringify(availability.limitationCodes) === JSON.stringify(['HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE']);
    const validRequiredUnavailable = resolution.status === 'unavailable' && resolution.reason === 'REQUIRED_FEATURE_UNAVAILABLE'
      && availability.state === 'unavailable-required-input'
      && JSON.stringify(availability.limitationCodes) === JSON.stringify(['REQUIRED_INPUT_UNAVAILABLE']);
    if (!validSuppressed && !validHourUnavailable && !validRequiredUnavailable) return null;
    return { ruleId: base.ruleId, ruleVersion: base.ruleVersion, reviewStatus: 'approved', dimensionIds: [],
      allowedNarrativeKeys: [], sourceEvidenceRefs: [], pairSemantics: null,
      resolutionStatus: resolution.status, outcome: null, evidenceAvailability: availability.state,
      limitationCodes: availability.limitationCodes, hourDependent: requirements.hourDependent };
  }
  const exact = record(value, [
    'ruleId', 'ruleVersion', 'requirements', 'dimensionIds', 'strength', 'pairSemantics',
    'allowedNarrativeKeys', 'blockedNarrativeCategoryIds', 'sourceEvidenceRefs',
    'reviewStatus', 'resolution', 'evidenceAvailability',
  ]);
  const dimensions = exact ? strings(exact.dimensionIds, SAFE_ID, 8, 96) : null;
  const keys = exact ? strings(exact.allowedNarrativeKeys, SAFE_KEY, 32, 128) : null;
  const blocked = exact ? strings(exact.blockedNarrativeCategoryIds, SAFE_ID, 32, 96) : null;
  const refs = exact ? strings(exact.sourceEvidenceRefs, SAFE_EVIDENCE_REF, 32, 240) : null;
  const semantics = exact ? parsePairSemantics(exact.pairSemantics) : null;
  if (!exact || !dimensions || dimensions.length === 0 || new Set(dimensions).size !== dimensions.length
    || dimensions.some((dimension) => !DIMENSIONS.has(dimension))
    || !keys || keys.length === 0 || new Set(keys).size !== keys.length
    || !blocked || blocked.length === 0 || new Set(blocked).size !== blocked.length
    || blocked.some((id) => !BLOCKED_CATEGORIES.has(id))
    || !refs || refs.length === 0 || new Set(refs).size !== refs.length
    || !semantics || !['light', 'moderate', 'pronounced'].includes(String(exact.strength))) return null;
  const validDefinitive = resolution.status === 'definitive'
    && SAFE_CLAIM_AVAILABILITY.has(availability.state) && availability.limitationCodes.length === 0;
  const validAlternatives = resolution.status === 'alternatives'
    && availability.state === 'varies-across-retained-variants'
    && JSON.stringify(availability.limitationCodes) === JSON.stringify(['EVIDENCE_VARIES_ACROSS_TIME_VARIANTS']);
  if (!validDefinitive && !validAlternatives) return null;
  return { ruleId: base.ruleId, ruleVersion: base.ruleVersion, reviewStatus: 'approved', dimensionIds: dimensions,
    allowedNarrativeKeys: keys, sourceEvidenceRefs: refs, pairSemantics: semantics,
    resolutionStatus: resolution.status, outcome: resolution.outcome, evidenceAvailability: availability.state,
    limitationCodes: availability.limitationCodes, hourDependent: requirements.hourDependent };
}

function parseSnapshot(value: unknown): ParsedSnapshot | null {
  const snapshot = record(value, [
    'schemaVersion', 'snapshotVersion', 'evidenceModelVersion', 'ruleSetVersion', 'taxonomyVersion',
    'derivedFeatureVersion', 'status', 'productionEligible', 'temporalSupport', 'sourceVersions',
    'ruleEvaluations', 'evidenceSummary', 'limitations',
  ]);
  if (!snapshot || snapshot.schemaVersion !== 2 || snapshot.snapshotVersion !== 'compatibility-snapshot-v2'
    || snapshot.evidenceModelVersion !== 'evidence-availability-v1'
    || typeof snapshot.ruleSetVersion !== 'string' || !SAFE_KEY.test(snapshot.ruleSetVersion)
    || snapshot.taxonomyVersion !== 'inclusive-compatibility-v1'
    || snapshot.derivedFeatureVersion !== 'korean-saju-derived-v1'
    || !['candidate', 'approved'].includes(String(snapshot.status))
    || typeof snapshot.productionEligible !== 'boolean'
    || (snapshot.status === 'candidate' && snapshot.productionEligible !== false)
    || (snapshot.status === 'approved' && snapshot.productionEligible !== true)) return null;
  const temporal = record(snapshot.temporalSupport, ['person-a', 'person-b']);
  const versions = record(snapshot.sourceVersions, ['person-a', 'person-b']);
  if (!temporal || !versions) return null;
  for (const participant of ['person-a', 'person-b']) {
    const source = record(versions[participant], ['profileVersion', 'adapterVersion', 'derivedFeatureVersion']);
    if (!TEMPORAL.has(String(temporal[participant])) || !source || source.profileVersion !== 'korean-saju-v1'
      || source.adapterVersion !== '0.4.0' || source.derivedFeatureVersion !== 'korean-saju-derived-v1') return null;
  }
  const summary = record(snapshot.evidenceSummary, [
    'modelVersion', 'meaning', 'state', 'ruleCounts', 'participants', 'limitationCodes',
  ]);
  const counts = summary ? record(summary.ruleCounts, ['approved', 'definitive', 'alternatives', 'unavailable', 'suppressed']) : null;
  const participants = summary ? record(summary.participants, ['person-a', 'person-b']) : null;
  const summaryCodes = summary ? limitationCodes(summary.limitationCodes) : null;
  if (!summary || summary.modelVersion !== 'evidence-availability-v1'
    || summary.meaning !== 'Evidence availability under the selected candidate methodology; not scientific or predictive confidence.'
    || typeof summary.state !== 'string' || !EVIDENCE_STATES.has(summary.state)
    || !counts || !participants || !summaryCodes) return null;
  for (const value of Object.values(counts)) {
    if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > MAX_RULES) return null;
  }
  const participantCodes: EvidenceLimitationCode[] = [];
  let eitherHourUnavailable = false;
  for (const participant of ['person-a', 'person-b']) {
    const context = record(participants[participant], ['temporalSupport', 'hourEvidence', 'limitationCodes']);
    const contextCodes = context ? limitationCodes(context.limitationCodes) : null;
    if (!context || !TEMPORAL.has(String(context.temporalSupport))
      || !['available', 'unavailable'].includes(String(context.hourEvidence))
      || !contextCodes || context.temporalSupport !== temporal[participant]) return null;
    const role = participant === 'person-a' ? 'PERSON_A' : 'PERSON_B';
    const expectedTemporalCode = context.temporalSupport === 'approximate' ? `${role}_TIME_APPROXIMATE`
      : context.temporalSupport === 'disputed' ? `${role}_TIME_DISPUTED`
        : context.temporalSupport === 'date-only' ? `${role}_DATE_ONLY`
          : context.temporalSupport === 'unknown' ? `${role}_TIME_UNKNOWN` : null;
    const expectedCodes: EvidenceLimitationCode[] = expectedTemporalCode
      ? [expectedTemporalCode as EvidenceLimitationCode] : [];
    const requiresUnavailableHour = context.temporalSupport === 'date-only' || context.temporalSupport === 'unknown';
    const reportsUnavailableHour = context.hourEvidence === 'unavailable';
    if (requiresUnavailableHour && !reportsUnavailableHour) return null;
    if (context.temporalSupport === 'exact' && reportsUnavailableHour) return null;
    if (reportsUnavailableHour) expectedCodes.push('HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE');
    if (context.hourEvidence !== (reportsUnavailableHour ? 'unavailable' : 'available')
      || JSON.stringify(contextCodes) !== JSON.stringify(expectedCodes)) return null;
    eitherHourUnavailable ||= reportsUnavailableHour;
    participantCodes.push(...expectedCodes);
  }
  const evaluations = array(snapshot.ruleEvaluations, MAX_RULES);
  const codes = limitationCodes(snapshot.limitations);
  if (!evaluations || !codes) return null;
  const parsedEvaluations: ParsedEvaluation[] = [];
  for (const evaluation of evaluations) {
    const parsed = parseEvaluation(evaluation);
    if (!parsed) return null;
    parsedEvaluations.push(parsed);
  }
  const bothExact = temporal['person-a'] === 'exact' && temporal['person-b'] === 'exact';
  for (const evaluation of parsedEvaluations) {
    if (evaluation.hourDependent && eitherHourUnavailable
      && !(evaluation.resolutionStatus === 'unavailable'
        && evaluation.evidenceAvailability === 'unavailable-hour-input')) return null;
    if (evaluation.resolutionStatus === 'definitive') {
      const expectedAvailability = bothExact
        ? 'available-from-details-provided' : 'consistent-across-retained-variants';
      if (evaluation.evidenceAvailability !== expectedAvailability) return null;
    }
  }
  const approved = parsedEvaluations.filter(({ reviewStatus }) => reviewStatus === 'approved');
  const definitive = approved.filter(({ resolutionStatus }) => resolutionStatus === 'definitive').length;
  const alternatives = approved.filter(({ resolutionStatus }) => resolutionStatus === 'alternatives').length;
  const unavailable = approved.filter(({ resolutionStatus }) => resolutionStatus === 'unavailable').length;
  const suppressed = parsedEvaluations.filter(({ resolutionStatus }) => resolutionStatus === 'suppressed').length;
  const expectedState = approved.length === 0 ? 'no-approved-evidence'
    : definitive === approved.length && suppressed === 0 ? 'available'
      : alternatives === approved.length && suppressed === 0 ? 'bounded'
        : unavailable === approved.length && suppressed === 0 ? 'unavailable' : 'mixed';
  const expectedCounts = { approved: approved.length, definitive, alternatives, unavailable, suppressed };
  if (Object.entries(expectedCounts).some(([key, value]) => counts[key] !== value)
    || summary.state !== expectedState) return null;
  const expectedLimitations: EvidenceLimitationCode[] = ['CANDIDATE_METHODOLOGY'];
  if (approved.length === 0) expectedLimitations.push('NO_APPROVED_DIMENSION_MAPPINGS');
  expectedLimitations.push(...participantCodes);
  for (const evaluation of parsedEvaluations) expectedLimitations.push(...evaluation.limitationCodes);
  const uniqueExpectedLimitations = [...new Set(expectedLimitations)];
  if (JSON.stringify(summaryCodes) !== JSON.stringify(uniqueExpectedLimitations)
    || JSON.stringify(codes) !== JSON.stringify(uniqueExpectedLimitations)) return null;
  return {
    snapshotVersion: 'compatibility-snapshot-v2', evidenceModelVersion: 'evidence-availability-v1',
    ruleSetVersion: snapshot.ruleSetVersion, taxonomyVersion: 'inclusive-compatibility-v1',
    derivedFeatureVersion: 'korean-saju-derived-v1', status: snapshot.status as 'candidate' | 'approved',
    productionEligible: snapshot.productionEligible, evidenceState: summary.state as NarrativeViewModel['evidenceState'],
    limitations: codes, evaluations: parsedEvaluations,
  };
}

const LIMITATION_COPY_KEY: Readonly<Record<EvidenceLimitationCode, string>> = Object.freeze({
  CANDIDATE_METHODOLOGY: 'CANDIDATE_METHODOLOGY',
  NO_APPROVED_DIMENSION_MAPPINGS: 'NO_APPROVED_DIMENSION_MAPPINGS',
  PERSON_A_TIME_APPROXIMATE: 'TIME_APPROXIMATE', PERSON_B_TIME_APPROXIMATE: 'TIME_APPROXIMATE',
  PERSON_A_TIME_DISPUTED: 'TIME_DISPUTED', PERSON_B_TIME_DISPUTED: 'TIME_DISPUTED',
  PERSON_A_DATE_ONLY: 'TIME_UNAVAILABLE', PERSON_B_DATE_ONLY: 'TIME_UNAVAILABLE',
  PERSON_A_TIME_UNKNOWN: 'TIME_UNAVAILABLE', PERSON_B_TIME_UNKNOWN: 'TIME_UNAVAILABLE',
  HOUR_DEPENDENT_EVIDENCE_UNAVAILABLE: 'TIME_UNAVAILABLE',
  EVIDENCE_VARIES_ACROSS_TIME_VARIANTS: 'EVIDENCE_VARIES',
  REQUIRED_INPUT_UNAVAILABLE: 'REQUIRED_INPUT_UNAVAILABLE', RULE_NOT_YET_AVAILABLE: 'RULE_NOT_AVAILABLE',
  EVALUATION_RESOURCE_LIMIT: 'RESOURCE_LIMIT',
});

function select(variants: CopyVariants, tone: NarrativeTone, format: NarrativeFormat): string {
  return variants[tone][format];
}

function composeClaims(snapshot: ParsedSnapshot, catalog: ParsedCatalog, tone: NarrativeTone, format: NarrativeFormat): readonly NarrativeClaim[] {
  if (!snapshot.productionEligible || snapshot.status !== 'approved' || !catalog.productionEligible || !catalog.claimsEnabled) return [];
  const claims: (NarrativeClaim & { readonly priority: number })[] = [];
  for (const evaluation of snapshot.evaluations) {
    if (evaluation.reviewStatus !== 'approved' || evaluation.resolutionStatus !== 'definitive'
      || evaluation.outcome !== 'matched' || !SAFE_CLAIM_AVAILABILITY.has(evaluation.evidenceAvailability)) continue;
    for (const copyKey of evaluation.allowedNarrativeKeys) {
      const entry = catalog.claims.find((claim) => claim.copyKey === copyKey && claim.ruleId === evaluation.ruleId
        && claim.ruleVersion === evaluation.ruleVersion
        && claim.dimensionIds.every((dimension) => evaluation.dimensionIds.includes(dimension))
        && JSON.stringify([...claim.evidenceRefs].sort()) === JSON.stringify([...evaluation.sourceEvidenceRefs].sort()));
      if (!entry) continue;
      claims.push({ kind: 'claim', section: entry.section, text: select(entry.copy, tone, format),
        trace: { ruleId: evaluation.ruleId, ruleVersion: evaluation.ruleVersion, copyKey,
          evidenceAvailability: evaluation.evidenceAvailability as NarrativeClaim['trace']['evidenceAvailability'],
          evidenceRefs: format === 'share' ? [] : [...entry.evidenceRefs].sort() }, priority: entry.priority });
    }
  }
  const sectionOrder: Readonly<Record<NarrativeSection, number>> = {
    'what-clicks': 0, 'potential-friction': 1, 'why-this': 2,
  };
  claims.sort((a, b) => sectionOrder[a.section] - sectionOrder[b.section] || b.priority - a.priority
    || a.trace.ruleId.localeCompare(b.trace.ruleId, 'en') || a.trace.copyKey.localeCompare(b.trace.copyKey, 'en'));
  const seenRules = new Set<string>();
  const sectionCounts = new Map<NarrativeSection, number>();
  const bounded: NarrativeClaim[] = [];
  for (const { kind, section, text, trace } of claims) {
    const ruleIdentity = `${trace.ruleId}@${trace.ruleVersion}`;
    const count = sectionCounts.get(section) ?? 0;
    if (seenRules.has(ruleIdentity) || count >= MAX_CLAIMS_PER_SECTION) continue;
    seenRules.add(ruleIdentity);
    sectionCounts.set(section, count + 1);
    bounded.push({ kind, section, text, trace });
  }
  return bounded;
}

export function composeWithCatalog(input: unknown, catalogValue: unknown): NarrativeResult {
  if (!withinDataBudget(input)) return INPUT_ERROR;
  if (!withinDataBudget(catalogValue)) return CATALOG_ERROR;
  const request = record(input, ['snapshot', 'context', 'format', 'tone']);
  if (!request || typeof request.context !== 'string' || !CONTEXTS.has(request.context as NarrativeContext)
    || typeof request.format !== 'string' || !FORMATS.has(request.format as NarrativeFormat)
    || typeof request.tone !== 'string' || !TONES.has(request.tone as NarrativeTone)) return INPUT_ERROR;
  const snapshot = parseSnapshot(request.snapshot);
  if (!snapshot) return INPUT_ERROR;
  const catalog = parseCatalog(catalogValue);
  if (!catalog) return CATALOG_ERROR;
  if (snapshot.ruleSetVersion !== catalog.compatibleRuleSetVersion) return INPUT_ERROR;
  const context = request.context as NarrativeContext;
  const format = request.format as NarrativeFormat;
  const tone = request.tone as NarrativeTone;
  const claims = composeClaims(snapshot, catalog, tone, format);
  const grouped = new Map<string, EvidenceLimitationCode[]>();
  for (const code of snapshot.limitations) {
    const copyKey = LIMITATION_COPY_KEY[code];
    const codes = grouped.get(copyKey) ?? [];
    if (!codes.includes(code)) codes.push(code);
    grouped.set(copyKey, codes);
  }
  const protectedShareKeys = new Set(['TIME_APPROXIMATE', 'TIME_DISPUTED', 'TIME_UNAVAILABLE', 'EVIDENCE_VARIES']);
  const protectedShareDetailsOmitted = format === 'share'
    && [...grouped.keys()].some((copyKey) => protectedShareKeys.has(copyKey));
  if (format === 'share') {
    for (const copyKey of protectedShareKeys) grouped.delete(copyKey);
  }
  const limitations: NarrativeLimitation[] = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([copyKey, sourceCodes]) => ({ kind: 'limitation', copyKey,
      text: select(catalog.limitations[copyKey]!, tone, format), sourceCodes: [...sourceCodes].sort() }));
  if (protectedShareDetailsOmitted) {
    limitations.push({ kind: 'limitation', copyKey: 'SHARED_SUMMARY_OMITS_DETAILS',
      text: select(catalog.limitations.SHARED_SUMMARY_OMITS_DETAILS!, tone, format), sourceCodes: [] });
  }
  const statusKey = claims.length > 0 ? 'evidence-available'
    : snapshot.evidenceState === 'no-approved-evidence' ? 'no-approved-evidence'
      : snapshot.evidenceState === 'unavailable' ? 'evidence-unavailable' : 'evidence-pending';
  const disclosures: NarrativeDisclosure[] = [{ kind: 'disclosure', copyKey: `context.${context}`,
    text: select(catalog.disclosures[context], tone, format), context }];
  const narrative: NarrativeViewModel = {
    schemaVersion: 1,
    composerVersion: 'deterministic-narrative-v1',
    copyCatalogVersion: 'us-english-narrative-copy-v1',
    sourceVersions: {
      snapshotVersion: snapshot.snapshotVersion,
      evidenceModelVersion: snapshot.evidenceModelVersion,
      ruleSetVersion: catalog.compatibleRuleSetVersion,
      taxonomyVersion: snapshot.taxonomyVersion,
      derivedFeatureVersion: snapshot.derivedFeatureVersion,
    },
    context, format, tone,
    evidenceState: format === 'share' && snapshot.evidenceState !== 'no-approved-evidence'
      ? 'shared-summary' : snapshot.evidenceState,
    productionEligible: false,
    headline: null,
    status: { kind: 'status', copyKey: `status.${statusKey}`,
      text: select(catalog.statusMessages[statusKey]!, tone, format) },
    whatClicks: claims.filter(({ section }) => section === 'what-clicks'),
    potentialFriction: claims.filter(({ section }) => section === 'potential-friction'),
    whyThis: claims.filter(({ section }) => section === 'why-this'),
    limitations, disclosures, questionToTry: null,
  };
  return deepFreeze({ status: 'ok' as const, narrative }) as NarrativeResult;
}

export function composeCompatibilityNarrative(input: NarrativeInput | unknown): NarrativeResult {
  return composeWithCatalog(input, NARRATIVE_COPY_CATALOG);
}

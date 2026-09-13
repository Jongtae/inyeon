import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  COMPATIBILITY_TAXONOMY,
  PROHIBITED_CLAIMS,
  findForbiddenIdentityInputKeys,
  findProhibitedClaimCategories,
  isValidPairSemantics,
  resolveTemporalClaim,
  swapPairSemantics,
  type PairSemantics,
} from '../src/index.js';

describe('inclusive compatibility taxonomy v1', () => {
  it('pins eight neutral, unordered dimensions and excludes resource/finance', () => {
    expect(COMPATIBILITY_TAXONOMY).toMatchObject({
      schemaVersion: 1,
      taxonomyVersion: 'inclusive-compatibility-v1',
      status: 'candidate',
      productionEligible: false,
      review: { internalProduct: 'reviewed', internalSafety: 'reviewed', culturalSajuExpert: 'pending' },
    });
    expect(COMPATIBILITY_TAXONOMY.dimensions.map(({ id }) => id)).toEqual([
      'conversation-rhythm', 'decision-pace', 'structure-adaptation', 'autonomy-togetherness',
      'friction-repair-rhythm', 'collaboration-rhythm', 'novelty-exploration',
      'emotional-expression-rhythm',
    ]);
    for (const dimension of COMPATIBILITY_TAXONOMY.dimensions) {
      expect(dimension.ordered).toBe(false);
      expect(dimension.poles).toHaveLength(2);
      expect(dimension.allowedExample).toMatch(/[.!?]$/u);
      expect(dimension.allowedEvidenceClasses).toContain('reviewed-versioned-rule-output');
      expect(dimension.limits.length).toBeGreaterThanOrEqual(2);
    }
    expect(JSON.stringify(COMPATIBILITY_TAXONOMY)).toContain('resource-finance');
    expect(COMPATIBILITY_TAXONOMY.dimensions.map(({ id }) => id)).not.toContain('resource-finance');
    expect(Object.isFrozen(COMPATIBILITY_TAXONOMY)).toBe(true);
    expect(Object.isFrozen(COMPATIBILITY_TAXONOMY.dimensions[0]!.poles)).toBe(true);
    const presentation = COMPATIBILITY_TAXONOMY.publicPresentation as {
      koreanScriptOrder: string[];
      koreanConcepts: Array<{
        id: string;
        publicEnglishLabel: string;
        hangul: string;
        hanja: string;
        scriptPriority: string[];
      }>;
    };
    expect(presentation.koreanScriptOrder).toEqual(['Hangul', 'Hanja']);
    expect(presentation.koreanConcepts).toEqual([
      { id: 'inyeon', publicEnglishLabel: 'Inyeon', hangul: '인연', hanja: '因緣', scriptPriority: ['hangul', 'hanja'] },
      { id: 'saju', publicEnglishLabel: 'Korean Saju', hangul: '사주', hanja: '四柱', scriptPriority: ['hangul', 'hanja'] },
      { id: 'gung-hap', publicEnglishLabel: 'Korean compatibility tradition', hangul: '궁합', hanja: '宮合', scriptPriority: ['hangul', 'hanja'] },
    ]);
  });

  it('keeps the checked-in machine-readable files aligned with runtime exports', () => {
    const taxonomy = JSON.parse(readFileSync(fileURLToPath(new URL('../data/compatibility-taxonomy.v1.json', import.meta.url)), 'utf8'));
    const prohibited = JSON.parse(readFileSync(fileURLToPath(new URL('../data/prohibited-claims.v1.json', import.meta.url)), 'utf8'));
    expect(taxonomy).toEqual(COMPATIBILITY_TAXONOMY);
    expect(prohibited).toEqual(PROHIBITED_CLAIMS);
  });

  it('forbids identity inputs and requires reviewed Issue #33 rule output', () => {
    const pair = COMPATIBILITY_TAXONOMY.pairSemantics as {
      default: string;
      identityInputsForbidden: string[];
    };
    expect(pair.default).toBe('symmetric');
    expect(pair.identityInputsForbidden).toEqual([
      'sex', 'gender', 'genderIdentity', 'sexualOrientation', 'relationshipStructure',
      'maritalStatus', 'pronouns', 'sexAssignedAtBirth',
    ]);
    const evidence = COMPATIBILITY_TAXONOMY.allowedEvidenceClasses as Array<{
      id: string;
      requirements: string[];
    }>;
    expect(evidence.find(({ id }) => id === 'reviewed-versioned-rule-output')?.requirements)
      .toEqual(expect.arrayContaining(['ruleId', 'ruleVersion', 'reviewStatus']));
    expect(JSON.stringify(COMPATIBILITY_TAXONOMY)).toContain('Issue #33');
    expect(COMPATIBILITY_TAXONOMY).toHaveProperty('entityContextPolicy.publicFigure', {
      role: 'reference-record-only',
      allowedFraming: 'A hypothetical pair reading for the user\'s reflection, based on a sourced public birth record.',
      forbiddenClaims: expect.arrayContaining(['private life', 'personality', 'behavior', 'preferences', 'relationship history']),
    });
    const families = COMPATIBILITY_TAXONOMY.candidateTraditionalSignalFamilies as Array<{
      dimensionMappings: string[];
      mappingOwner: string;
    }>;
    expect(families.every(({ dimensionMappings }) => dimensionMappings.length === 0)).toBe(true);
    expect(families.every(({ mappingOwner }) => mappingOwner === 'Issue #33')).toBe(true);
  });
});

describe('pair and temporal contracts', () => {
  it('is symmetric by default and makes directional swaps explicit and involutive', () => {
    const symmetric = { kind: 'symmetric' } as const;
    expect(isValidPairSemantics(symmetric)).toBe(true);
    expect(swapPairSemantics(symmetric)).toEqual(symmetric);
    expect(Object.isFrozen(swapPairSemantics(symmetric))).toBe(true);

    const directional: PairSemantics = {
      kind: 'directional',
      source: 'person-a',
      target: 'person-b',
      evidenceDirection: 'person-a-to-person-b',
      swapSemantics: 'reverse-participants',
    };
    expect(isValidPairSemantics(directional)).toBe(true);
    expect(swapPairSemantics(directional)).toEqual({
      kind: 'directional',
      source: 'person-b',
      target: 'person-a',
      evidenceDirection: 'person-b-to-person-a',
      swapSemantics: 'reverse-participants',
    });
    expect(swapPairSemantics(swapPairSemantics(directional))).toEqual(directional);
    expect(isValidPairSemantics({ ...directional, evidenceDirection: 'person-b-to-person-a' })).toBe(false);
    expect(isValidPairSemantics({ ...directional, source: 'viewer' })).toBe(false);
    expect(isValidPairSemantics(Object.create({ kind: 'symmetric' }))).toBe(false);
    expect(isValidPairSemantics({ kind: 'symmetric', gender: 'woman' })).toBe(false);
    expect(isValidPairSemantics(new Proxy({}, { ownKeys: () => { throw new Error('hostile'); } }))).toBe(false);
    expect(swapPairSemantics({ kind: 'controlled', source: 'attacker', target: 'victim' })).toBeNull();
    const changingProxy = new Proxy(directional, {
      get: (_target, property) => property === 'kind' ? 'directional' : 'attacker',
    });
    expect(isValidPairSemantics(changingProxy)).toBe(true);
    expect(swapPairSemantics(changingProxy)).toEqual({
      kind: 'directional',
      source: 'person-b',
      target: 'person-a',
      evidenceDirection: 'person-b-to-person-a',
      swapSemantics: 'reverse-participants',
    });
  });

  it('suppresses unavailable hour evidence and preserves uncertainty without averaging', () => {
    expect(resolveTemporalClaim({ temporalSupport: 'exact', hourDependent: false, retainedVariantIds: [], variantValues: [] }))
      .toEqual({ status: 'suppressed', reason: 'NO_VARIANT_RESULT' });
    for (const temporalSupport of ['date-only', 'unknown'] as const) {
      expect(resolveTemporalClaim({
        temporalSupport, hourDependent: true, retainedVariantIds: ['variant-a'],
        variantValues: [{ variantId: 'variant-a', value: 'claim-a' }],
      }))
        .toEqual({ status: 'suppressed', reason: 'HOUR_INPUT_UNAVAILABLE' });
    }
    for (const temporalSupport of ['approximate', 'disputed'] as const) {
      expect(resolveTemporalClaim({
        temporalSupport, hourDependent: true, retainedVariantIds: ['variant-a', 'variant-b'],
        variantValues: [
          { variantId: 'variant-a', value: 'shared' },
          { variantId: 'variant-b', value: 'shared' },
        ],
      })).toEqual({ status: 'definitive', value: 'shared', coveredVariantIds: ['variant-a', 'variant-b'] });
      expect(resolveTemporalClaim({
        temporalSupport, hourDependent: true, retainedVariantIds: ['variant-a', 'variant-b'],
        variantValues: [
          { variantId: 'variant-a', value: 'claim-a' },
          { variantId: 'variant-b', value: 'claim-b' },
        ],
      }))
        .toEqual({
          status: 'alternatives',
          variantValues: [
            { variantId: 'variant-a', value: 'claim-a' },
            { variantId: 'variant-b', value: 'claim-b' },
          ],
          limitation: 'RESULT_VARIES_ACROSS_TIME_VARIANTS',
        });
      expect(resolveTemporalClaim({
        temporalSupport, hourDependent: true, retainedVariantIds: ['variant-a', 'variant-b'],
        variantValues: [{ variantId: 'variant-a', value: 'claim-a' }],
      })).toEqual({ status: 'suppressed', reason: 'INCOMPLETE_VARIANT_COVERAGE' });
      expect(resolveTemporalClaim({
        temporalSupport, hourDependent: true, retainedVariantIds: ['variant-a', 'variant-a'],
        variantValues: [{ variantId: 'variant-a', value: 'claim-a' }],
      })).toEqual({ status: 'suppressed', reason: 'INCOMPLETE_VARIANT_COVERAGE' });
      expect(resolveTemporalClaim({
        temporalSupport, hourDependent: true, retainedVariantIds: ['variant-a'],
        variantValues: [{ variantId: 'variant-b', value: 'claim-b' }],
      })).toEqual({ status: 'suppressed', reason: 'INCOMPLETE_VARIANT_COVERAGE' });
    }
  });
});

describe('prohibited claims and identity-sensitive adversarial cases', () => {
  it('covers every required semantic safety category with a blocking action', () => {
    expect(PROHIBITED_CLAIMS.defaultAction).toBe('require-reviewed-allowlist');
    expect(PROHIBITED_CLAIMS.categories.map(({ id }) => id)).toEqual([
      'fatalistic-deterministic-scientific', 'soulmate-score-rating', 'gender-role-stereotype',
      'identity-inference-or-ranking', 'morality-trust-safety-crime-violence', 'fidelity',
      'fertility-reproduction', 'mental-medical-diagnosis', 'sexual-behavior',
      'wealthworthiness', 'inevitable-marriage-divorce', 'protected-trait-inference-or-ranking',
      'relationship-prescription-or-control', 'unsupported-incomplete-input-certainty',
      'public-figure-endorsement-availability',
    ]);
    expect(PROHIBITED_CLAIMS.categories.every(({ action }) => action === 'block')).toBe(true);
    for (const category of PROHIBITED_CLAIMS.categories) {
      expect(findProhibitedClaimCategories(category.prohibitedExample)).toContain(category.id);
    }
  });

  it('keeps LGBTQ+, trans, nonbinary, and nontraditional pairs on the same neutral dimensions', () => {
    const prohibitedIdentityInputs = [
      { gender: 'same-gender' },
      { sexualOrientation: 'gay' },
      { genderIdentity: 'transgender' },
      { genderIdentity: 'nonbinary' },
      { relationshipStructure: 'polyamorous' },
      { sexual_orientation: 'asexual' },
      { 'sex-assigned-at-birth': 'female' },
      { pronouns: 'they/them' },
      { 'gender identity': 'nonbinary' },
      { 'sexual orientation': 'gay' },
      { 'relationship structure': 'polyamorous' },
      { 'sex assigned at birth': 'female' },
      { 'gender.identity': 'nonbinary' },
      { ['sexual\u200borientation']: 'gay' },
      { profile: { genderIdentity: 'transgender' } },
      Object.create({ sexualOrientation: 'lesbian' }) as Record<string, unknown>,
    ];
    expect(findForbiddenIdentityInputKeys({ personAChartRef: 'a', personBChartRef: 'b' })).toEqual([]);
    for (const input of prohibitedIdentityInputs) {
      expect(findForbiddenIdentityInputKeys(input).length).toBeGreaterThan(0);
    }
    expect(findForbiddenIdentityInputKeys(
      new Proxy({}, { ownKeys: () => { throw new Error('hostile'); } }),
    )).toEqual(['$uninspectable-input']);
    expect(findProhibitedClaimCategories(
      'This chart reveals your gender identity and says transgender partners are less compatible.',
    )).toContain('identity-inference-or-ranking');
    for (const example of PROHIBITED_CLAIMS.reviewedAllowedExamples) {
      expect(findProhibitedClaimCategories(example.text)).toEqual([]);
    }
  });
});

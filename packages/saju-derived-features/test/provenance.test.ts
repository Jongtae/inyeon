import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import lunar from 'lunar-javascript';

import { EARTHLY_BRANCHES, HEAVENLY_STEMS, SAJU_DERIVED_FEATURE_CAPABILITIES } from '../src/index.js';

describe('versioned package evidence', () => {
  it('keeps the runtime capability and checked-in manifests aligned', () => {
    const capability = JSON.parse(readFileSync(fileURLToPath(new URL('../data/capabilities.v1.json', import.meta.url)), 'utf8')) as Record<string, unknown>;
    const profile = JSON.parse(readFileSync(fileURLToPath(new URL('../data/korean-saju-derived-v1.profile.json', import.meta.url)), 'utf8')) as Record<string, unknown>;
    expect(capability).toMatchObject({
      manifestVersion: SAJU_DERIVED_FEATURE_CAPABILITIES.manifestVersion,
      packageVersion: SAJU_DERIVED_FEATURE_CAPABILITIES.packageVersion,
      schemaVersion: SAJU_DERIVED_FEATURE_CAPABILITIES.schemaVersion,
      derivedFeatureVersion: SAJU_DERIVED_FEATURE_CAPABILITIES.derivedFeatureVersion,
      canonicalTableVersion: SAJU_DERIVED_FEATURE_CAPABILITIES.canonicalTableVersion,
      weightingVersion: SAJU_DERIVED_FEATURE_CAPABILITIES.weightingVersion,
      status: 'candidate', productionValidated: false,
      io: { network: false, storage: false, logging: false },
    });
    expect(profile).toMatchObject({
      schemaVersion: 1, derivedFeatureVersion: 'korean-saju-derived-v1',
      canonicalTableVersion: 'visible-stem-branch-elements-v1', weightingVersion: 'unit-visible-symbol-v1',
      status: 'candidate', productionValidated: false,
      comparisonReference: { name: 'lunar-javascript', version: '1.7.7', methodologyAuthority: false },
      visibleElementOccurrences: { fullObservedSymbolCount: 8, hourSuppressedObservedSymbolCount: 6, averagingAcrossVariants: false },
    });
  });

  it('matches the pinned comparison reference for ordered symbols and element Hanja', () => {
    const stems = Object.values(HEAVENLY_STEMS);
    const branches = Object.values(EARTHLY_BRANCHES);
    expect(lunar.LunarUtil.GAN.slice(1)).toEqual(stems.map((value) => value.hanja));
    expect(lunar.LunarUtil.ZHI.slice(1)).toEqual(branches.map((value) => value.hanja));
    for (const value of stems) {
      expect(lunar.LunarUtil.WU_XING_GAN[value.hanja]).toBe(value.element.hanja);
    }
    for (const value of branches) {
      expect(lunar.LunarUtil.WU_XING_ZHI[value.hanja]).toBe(value.element.hanja);
    }
  });
});

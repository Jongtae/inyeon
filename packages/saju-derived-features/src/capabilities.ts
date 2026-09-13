function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return Object.freeze(value);
}

export const SAJU_DERIVED_FEATURE_CAPABILITIES = deepFreeze({
  manifestVersion: 1,
  packageVersion: '0.1.0',
  schemaVersion: 1,
  derivedFeatureVersion: 'korean-saju-derived-v1',
  canonicalTableVersion: 'visible-stem-branch-elements-v1',
  weightingVersion: 'unit-visible-symbol-v1',
  status: 'candidate',
  productionValidated: false,
  source: { package: '@inyeon/saju-adapter', adapterVersion: '0.4.0', profileVersion: 'korean-saju-v1' },
  included: ['day-master', 'visible-stem-branch-five-element', 'visible-stem-branch-yin-yang', 'unit-visible-symbol-occurrences'],
  excluded: [
    'balance', 'strength', 'dominance', 'seasonal-weighting', 'hidden-stems', 'ten-gods',
    'combinations', 'clashes', 'harm', 'punishment', 'break', 'relationship-dimensions',
    'gender', 'sexuality',
  ],
  fullChartObservedSymbolCount: 8,
  hourSuppressedObservedSymbolCount: 6,
  io: { network: false, storage: false, logging: false },
} as const);

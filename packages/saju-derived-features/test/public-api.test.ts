import { describe, expect, it } from 'vitest';

import * as publicApi from '../src/index.js';

describe('public export seam', () => {
  it('exports only the derivation function, canonical tables, and capability manifest at runtime', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'EARTHLY_BRANCHES', 'ELEMENTS', 'HEAVENLY_STEMS', 'POLARITIES',
      'SAJU_DERIVED_FEATURE_CAPABILITIES', 'deriveChartFeatures',
    ]);
  });
});

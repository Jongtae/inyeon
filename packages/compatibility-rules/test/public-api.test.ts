import { describe, expect, it } from 'vitest';

import * as publicApi from '../src/index.js';

describe('public export seam', () => {
  it('does not export the custom evaluator or any test-only rule seam', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'COMPATIBILITY_RULE_SET',
      'evaluateCompatibilityPair',
      'validateCompatibilityRuleSet',
    ]);
  });
});

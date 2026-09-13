import { describe, expect, it } from 'vitest';

import * as publicApi from '../src/index.js';

describe('public export seam', () => {
  it('exports only immutable data and bounded contract helpers at runtime', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'COMPATIBILITY_TAXONOMY',
      'PROHIBITED_CLAIMS',
      'findForbiddenIdentityInputKeys',
      'findProhibitedClaimCategories',
      'isValidPairSemantics',
      'resolveTemporalClaim',
      'swapPairSemantics',
    ]);
  });
});

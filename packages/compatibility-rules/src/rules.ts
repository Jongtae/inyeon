import ruleData from '../data/compatibility-rules.v1.json' with { type: 'json' };

import type { CompatibilityRuleSet } from './types.js';

function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return Object.freeze(value);
}

/** The product catalog intentionally contains zero mappings until the recorded Human Gate passes. */
export const COMPATIBILITY_RULE_SET = deepFreeze(ruleData as CompatibilityRuleSet);

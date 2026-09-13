import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import * as publicApi from '../src/index.js';

describe('public package boundary', () => {
  it('exports only the product composer at runtime', () => {
    expect(Object.keys(publicApi)).toEqual(['composeCompatibilityNarrative']);
    expect(publicApi).not.toHaveProperty('composeWithCatalog');
    expect(publicApi).not.toHaveProperty('NARRATIVE_COPY_CATALOG');
  });

  it('does not export internal test seams as package subpaths', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as { exports: Record<string, unknown> };
    expect(Object.keys(packageJson.exports)).toEqual(['.']);
  });

  it('release-locks reviewed copy so edits require a new catalog version', async () => {
    const catalog = await readFile(new URL('../data/narrative-copy.v1.json', import.meta.url));
    const lock = JSON.parse(await readFile(new URL('../source/narrative-release-lock.v1.json', import.meta.url), 'utf8')) as {
      catalogVersion: string; catalogSha256: string;
    };
    expect(lock.catalogVersion).toBe('us-english-narrative-copy-v1');
    expect(createHash('sha256').update(catalog).digest('hex')).toBe(lock.catalogSha256);
  });
});

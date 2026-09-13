import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const read = (relative: string) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

describe('dependency and release provenance', () => {
  it('pins production and validation dependencies exactly in package and lock files', () => {
    const manifest = JSON.parse(read('../package.json')) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };
    expect(manifest.dependencies.manseryeok).toBe('2.0.0');
    expect(manifest.devDependencies['lunar-javascript']).toBe('1.7.7');
    expect(manifest.devDependencies['astronomy-engine']).toBe('2.1.19');

    const lock = JSON.parse(read('../../../package-lock.json')) as { packages: Record<string, { version?: string; integrity?: string }> };
    expect(lock.packages['node_modules/manseryeok']).toMatchObject({ version: '2.0.0', integrity: 'sha512-h4YeuKP+vsAa01K72v/H+5MwxEZd1Sv7H2hC8YU7r05JjNaCDvVhGaIot0zxrktyZVU6SGN5Ed9d1coTWW8rpQ==' });
    expect(lock.packages['node_modules/lunar-javascript']).toMatchObject({ version: '1.7.7', integrity: 'sha512-u/KYiwPIBo/0bT+WWfU7qO1d+aqeB90Tuy4ErXenr2Gam0QcWeezUvtiOIyXR7HbVnW2I1DKfU0NBvzMZhbVQw==' });
    expect(lock.packages['node_modules/astronomy-engine']).toMatchObject({ version: '2.1.19', integrity: 'sha512-8yWKNf7UeNbH458h3sAJ6ZgAjE5jTXp/mNNRFoC20j2SHwZIjAQeEsBB2Q3uCFRaTCCJRv33K2XhkhZQMXoX6w==' });
  });

  it('preserves full license notices and honest source provenance', () => {
    const licenses = read('../LICENSES.md');
    expect(licenses.match(/Permission is hereby granted/g)).toHaveLength(3);
    expect(licenses).toContain('static distribution');
    const provenance = read('../PROVENANCE.md');
    expect(provenance).toContain('fba3253d7305b8b61189bd78318a7a27ed8c9b09');
    expect(provenance).toContain('eecd5d12c8221b82ce574dc2bad2d7aefcb46e56');
    expect(provenance).toContain('61dc07020aaa6885d2c7f688a4d82beaf6edb9ef');
    expect(provenance).toContain('does **not** assert');
    expect(provenance).toContain('KASI provenance and Korean-methodology expert review are not asserted');
  });

  it('keeps machine-readable capability and profile manifests non-production', () => {
    const capabilities = JSON.parse(read('../data/capabilities.v1.json')) as Record<string, unknown>;
    const profile = JSON.parse(read('../data/korean-saju-v1.profile.json')) as Record<string, unknown>;
    expect(capabilities).toMatchObject({ productionEligible: false, profile: { status: 'candidate' } });
    expect(profile).toMatchObject({ status: 'candidate', productionValidated: false, evidence: { expertReview: 'pending', productionEligibility: 'blocked' } });
  });
});

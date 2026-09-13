import { describe, expect, it } from 'vitest';

import { hashForRoute, normalizeBasePath, repositoryBasePath, routeFromHash } from './routing';

describe('Pages-safe routing', () => {
  it('derives a trailing-slash base path from a GitHub repository slug', () => {
    expect(repositoryBasePath('Jongtae/inyeon')).toBe('/inyeon/');
    expect(repositoryBasePath()).toBe('/inyeon/');
  });

  it('normalizes configured base paths', () => {
    expect(normalizeBasePath('/preview/releases/')).toBe('/preview/releases/');
    expect(normalizeBasePath('/')).toBe('/');
  });

  it('accepts only public, fixed hash routes', () => {
    expect(routeFromHash('#/privacy')).toBe('/privacy');
    expect(routeFromHash('#/my-saju')).toBe('/my-saju');
    expect(routeFromHash('#/public-figures')).toBe('/public-figures');
    expect(routeFromHash('#/inyeon-lab')).toBe('/inyeon-lab');
    expect(routeFromHash('#/compare-someone')).toBe('/compare-someone');
    expect(routeFromHash('#/unknown?birth=private')).toBe('/');
    expect(hashForRoute('/methodology')).toBe('#/methodology');
  });
});

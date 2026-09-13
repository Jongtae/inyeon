export const routes = [
  '/',
  '/my-saju',
  '/public-figures',
  '/inyeon-lab',
  '/compare-someone',
  '/methodology',
  '/privacy',
] as const;

export type AppRoute = (typeof routes)[number];

export function normalizeBasePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === '' || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

export function repositoryBasePath(repository?: string): string {
  const repositoryName = repository?.split('/').filter(Boolean).at(-1) ?? 'inyeon';
  return normalizeBasePath(repositoryName);
}

export function routeFromHash(hash: string): AppRoute {
  const candidate = hash.startsWith('#') ? hash.slice(1) : hash;
  return routes.includes(candidate as AppRoute) ? (candidate as AppRoute) : '/';
}

export function hashForRoute(route: AppRoute): string {
  return `#${route}`;
}

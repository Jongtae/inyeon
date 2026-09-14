import { expect, test, type Page, type Request } from '@playwright/test';

const privateCanaries = ['1994-07-19', '03:17', 'Asia/Seoul'];
const expectedReleaseSha = process.env.INYEON_EXPECTED_RELEASE_SHA;

if (!expectedReleaseSha || !/^(?:local|[0-9a-f]{40})$/u.test(expectedReleaseSha)) {
  throw new Error('INYEON_EXPECTED_RELEASE_SHA must identify the artifact under test');
}

function requestText(request: Request): string {
  return [request.url(), request.postData() ?? '', JSON.stringify(request.headers())].join('\n');
}

async function openRoute(page: Page, route: string) {
  await page.goto(`#${route}`);
  await expect(page.locator('h1')).toBeVisible();
}

test('HTTPS, provenance, hash routing, security policy, and direct refresh are live', async ({ page, request, baseURL }) => {
  const consoleProblems: string[] = [];
  const cspProbeRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('inyeon-csp-probe')) cspProbeRequests.push(request.url());
  });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(message.text());
  });
  page.on('pageerror', (error) => consoleProblems.push(error.message));

  const response = await page.goto('#/privacy');
  expect(response?.ok()).toBe(true);
  if (process.env.INYEON_ALLOW_LOCAL_SMOKE !== '1') expect(page.url()).toMatch(/^https:\/\//u);
  await expect(page.getByRole('heading', { name: 'Your birth details stay in this tab.' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your birth details stay in this tab.' })).toBeVisible();

  const policies = await page.evaluate(() => ({
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content'),
    referrer: document.querySelector('meta[name="referrer"]')?.getAttribute('content'),
  }));
  expect(policies.csp).toContain("connect-src 'none'");
  expect(policies.csp).toContain("script-src 'self'");
  expect(policies.referrer).toBe('no-referrer');
  expect(consoleProblems).toEqual([]);

  const cspProbe = await page.evaluate(async () => {
    const violations: string[] = [];
    const onViolation = (event: SecurityPolicyViolationEvent) => violations.push(event.effectiveDirective);
    window.addEventListener('securitypolicyviolation', onViolation);
    let rejected = false;
    try {
      await fetch(new URL('release-manifest.json?inyeon-csp-probe=1', window.location.href));
    } catch {
      rejected = true;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    window.removeEventListener('securitypolicyviolation', onViolation);
    return { rejected, violations };
  });
  expect(cspProbe.rejected).toBe(true);
  expect(cspProbe.violations).toContain('connect-src');
  expect(cspProbeRequests).toEqual([]);

  const manifestResponse = await request.get(new URL('release-manifest.json', baseURL).toString());
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({ schemaVersion: 1, sourceSha: expectedReleaseSha, basePath: '/inyeon/' });
});

test('the deployed personal and reference flows retain no protected input', async ({ page, context }) => {
  const requests: string[] = [];
  const consoleText: string[] = [];
  page.on('request', (request) => requests.push(requestText(request)));
  page.on('console', (message) => consoleText.push(message.text()));
  page.on('pageerror', (error) => consoleText.push(error.message));

  await openRoute(page, '/my-saju');
  requests.length = 0;
  await page.getByLabel(/^Birth date/).fill(privateCanaries[0]);
  await page.getByLabel('Birth time', { exact: true }).fill(privateCanaries[1]);
  await page.getByLabel(/^Birthplace \/ time zone/).selectOption(privateCanaries[2]);
  await page.getByRole('button', { name: 'Calculate my chart' }).click();
  await expect(page.getByRole('heading', { name: 'Your Four Pillars' })).toBeVisible();
  const chartCanaries = (await page.getByLabel('Four Pillars chart').locator('strong, small').allTextContents())
    .map((value) => value.replace(/[()]/gu, '').trim())
    .filter(Boolean);
  expect(chartCanaries).toHaveLength(8);
  expect(requests).toEqual([]);

  await page.getByRole('navigation', { name: 'Lab steps' }).getByRole('link', { name: /Public figures/u }).click();
  await page.getByLabel('Search public figures').fill('Billie Eilish');
  await page.getByRole('button', { name: /Billie Eilish/ }).click();
  await page.getByRole('button', { name: 'Compare with this reference' }).click();
  await expect(page.getByText('Compatibility interpretation isn’t available yet.')).toBeVisible();

  await page.getByRole('navigation', { name: 'Lab steps' }).getByRole('link', { name: /Fictional Lab/u }).click();
  await page.getByRole('button', { name: 'Open this tab’s preview' }).click();
  await page.getByRole('button', { name: /Inyeon Lab Character 00001/ }).click();
  await page.getByRole('button', { name: 'Compare with this fictional reference' }).click();
  await expect(page.getByText('Compatibility interpretation isn’t available yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Preview share options' }).click();
  const shareUrl = await page.getByLabel('Share-safe link').inputValue();
  expect(shareUrl).toContain('kind=synthetic-reference');

  const browserState = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookie: document.cookie,
    indexedDb: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).length : 0,
    caches: 'caches' in window ? (await caches.keys()).length : 0,
    serviceWorkers: 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
  }));
  expect(browserState).toEqual({ local: 0, session: 0, cookie: '', indexedDb: 0, caches: 0, serviceWorkers: 0 });
  expect(await context.cookies()).toEqual([]);

  const observableText = [page.url(), shareUrl, ...requests, ...consoleText].join('\n');
  for (const canary of [...privateCanaries, ...chartCanaries]) {
    const encoded = encodeURIComponent(canary);
    const variants = new Set([canary, encoded, encoded.replace(/%[0-9A-F]{2}/gu, (value) => value.toLowerCase())]);
    for (const variant of variants) expect(observableText).not.toContain(variant);
  }

  await page.reload();
  await expect(page.getByRole('heading', { name: /Explore a clearly fictional reference/u })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear personal data' })).toHaveCount(0);
});

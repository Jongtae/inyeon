import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const routeUrl = (route: string) => `/inyeon/#${route}`;

async function openRoute(page: Page, route: string) {
  await page.goto(routeUrl(route));
  await expect(page.locator('h1')).toBeVisible();
}

async function calculatePersonal(page: Page, time = '14:30') {
  await openRoute(page, '/my-saju');
  await page.getByLabel(/^Birth date/).fill('1995-10-21');
  await page.getByLabel('Birth time', { exact: true }).fill(time);
  await page.getByRole('button', { name: 'Calculate my chart' }).click();
  await expect(page.getByRole('heading', { name: 'Your Four Pillars' })).toBeVisible();
}

async function expectNoRelationshipClaims(page: Page) {
  await expect(page.getByText('Compatibility interpretation isn’t available yet.')).toBeVisible();
  await expect(page.getByText('What clicks', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Potential friction', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Why this?', { exact: true })).toHaveCount(0);
}

test('direct routes, route focus, skip control, responsive widths, and reduced motion stay accessible', async ({ page }) => {
  await openRoute(page, '/public-figures');
  await page.reload();
  await expect(page.getByRole('heading', { name: /Compare with a public figure/ })).toBeVisible();

  const skip = page.getByRole('button', { name: 'Skip to main content' });
  await skip.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/public-figures$/u);
  await expect(page.getByRole('main')).toBeFocused();

  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const bounds = await page.getByLabel('Search public figures').boundingBox();
    expect(bounds).not.toBeNull();
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');

  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('My Saju and every categorical personal time mode use the real candidate calculation', async ({ page }) => {
  await calculatePersonal(page);
  await expect(page.getByText('Exact time provided')).toBeVisible();
  await expect(page.getByText('을해')).toBeVisible();

  for (const scenario of [
    { mode: 'Approximate', fields: [['Earliest possible time', '13:30'], ['Latest possible time', '15:30']], label: 'Approximate time range' },
    { mode: 'Disputed', fields: [['First reported time', '01:30'], ['Second reported time', '03:30']], label: 'Multiple time possibilities' },
    { mode: 'Unknown', fields: [], label: 'Birth time unknown' },
  ] as const) {
    await openRoute(page, '/my-saju');
    await page.getByLabel(/^Birth date/).fill('1995-10-21');
    await page.getByLabel(new RegExp(`^${scenario.mode}`, 'u')).check();
    for (const [label, value] of scenario.fields) await page.getByLabel(label).fill(value);
    await page.getByRole('button', { name: 'Calculate my chart' }).click();
    await expect(page.getByText(scenario.label)).toBeVisible();
  }
});

test('public-reference comparison is source-backed, date-only, claim-free, and cleared with the session', async ({ page }) => {
  await calculatePersonal(page);
  await page.getByRole('navigation', { name: 'Lab steps' }).getByRole('link', { name: /Public figures/u }).click();
  await page.getByLabel('Search public figures').fill('Billie Eilish');
  await page.getByRole('button', { name: /Billie Eilish/ }).click();
  await expect(page.getByText('Date only · no birth time assumed')).toBeVisible();
  await expect(page.getByText('Public reference—not a member or endorsement.')).toBeVisible();
  await page.getByRole('button', { name: 'Compare with this reference' }).click();
  await expectNoRelationshipClaims(page);
  await page.getByRole('button', { name: 'Clear personal data' }).click();
  await expect(page.getByRole('heading', { name: 'You + Billie Eilish' })).toHaveCount(0);
  await expect(page.getByText('This private session has no saved chart.')).toBeVisible();
});

test('Fictional Lab stays default-off, persistently fictional, claim-free, and clearable', async ({ page }) => {
  await calculatePersonal(page);
  await page.getByRole('navigation', { name: 'Lab steps' }).getByRole('link', { name: /Fictional Lab/u }).click();
  await expect(page.getByText(/DEFAULT OFF/u)).toBeVisible();
  await page.getByRole('button', { name: 'Open this tab’s preview' }).click();
  await page.getByRole('button', { name: /Inyeon Lab Character 00001/ }).click();
  await expect(page.getByRole('heading', { name: 'Inyeon Lab Character 00001' })).toBeVisible();
  await expect(page.getByText('Fictional character—not a real person or member.').first()).toBeVisible();
  await page.getByRole('button', { name: 'Compare with this fictional reference' }).click();
  await expectNoRelationshipClaims(page);
  await page.getByRole('button', { name: 'Clear personal data' }).click();
  await expect(page.getByText(/DEFAULT OFF/u)).toBeVisible();
  await expect(page.getByRole('heading', { name: /You \+ Inyeon Lab Character/ })).toHaveCount(0);
});

test('Someone I Know stays local, permission-framed, claim-free, and clearable', async ({ page }) => {
  await calculatePersonal(page);
  await page.getByRole('navigation', { name: 'Lab steps' }).getByRole('link', { name: /Someone I know/u }).click();
  await expect(page.getByRole('heading', { name: 'Keep a private comparison private.' })).toBeVisible();
  await expect(page.getByText(/appropriate reason or permission/u).first()).toBeVisible();
  await page.getByLabel(/^Birth date/).fill('1992-11-27');
  await page.getByLabel(/^Unknown/).check();
  await page.getByRole('button', { name: 'Prepare second chart' }).click();
  await page.getByRole('button', { name: 'View comparison details' }).click();
  await expectNoRelationshipClaims(page);
  await page.getByRole('button', { name: 'Clear personal data' }).click();
  await expect(page.getByRole('heading', { name: 'You + someone you know' })).toHaveCount(0);
});

test('personal calculation works offline after static assets load', async ({ page, context }) => {
  await openRoute(page, '/my-saju');
  await context.setOffline(true);
  await page.getByLabel(/^Birth date/).fill('1995-10-21');
  await page.getByLabel('Birth time', { exact: true }).fill('14:30');
  await page.getByRole('button', { name: 'Calculate my chart' }).click();
  await expect(page.getByRole('heading', { name: 'Your Four Pillars' })).toBeVisible();
  await context.setOffline(false);
});

test('personal canary never enters requests, persistence, URL/history, or browser errors', async ({ page, context }) => {
  const requestUrls: string[] = [];
  const webSockets: string[] = [];
  const browserErrors: string[] = [];
  const consoleMessages: string[] = [];
  page.on('request', (request) => requestUrls.push(request.url()));
  page.on('websocket', (socket) => webSockets.push(socket.url()));
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    consoleMessages.push(message.text());
    if (message.type() === 'error' || message.type() === 'warning') browserErrors.push(message.text());
  });
  await page.addInitScript(() => {
    const calls: string[] = [];
    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);
    history.pushState = (data, unused, url) => {
      calls.push(String(url ?? ''));
      return pushState(data, unused, url);
    };
    history.replaceState = (data, unused, url) => {
      calls.push(String(url ?? ''));
      return replaceState(data, unused, url);
    };
    Object.defineProperty(window, '__inyeonHistoryCalls', { value: calls });
  });

  await openRoute(page, '/my-saju');
  requestUrls.length = 0;
  await page.getByLabel(/^Birth date/).fill('1994-07-19');
  await page.getByLabel('Birth time', { exact: true }).fill('03:17');
  await page.getByLabel(/^Birthplace \/ time zone/).selectOption('Asia/Seoul');
  await page.getByRole('button', { name: 'Calculate my chart' }).click();
  await expect(page.getByRole('heading', { name: 'Your Four Pillars' })).toBeVisible();

  const browserState = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookie: document.cookie,
    indexedDb: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).length : 0,
    caches: 'caches' in window ? (await caches.keys()).length : 0,
    serviceWorkers: 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
    historyCalls: (window as unknown as { __inyeonHistoryCalls: string[] }).__inyeonHistoryCalls,
  }));
  expect(browserState).toEqual({ local: 0, session: 0, cookie: '', indexedDb: 0, caches: 0, serviceWorkers: 0, historyCalls: [] });
  expect(requestUrls).toEqual([]);
  expect(webSockets).toEqual([]);
  expect(browserErrors).toEqual([]);
  expect(consoleMessages.join('\n')).not.toContain('1994-07-19');
  expect(consoleMessages.join('\n')).not.toContain('03:17');
  expect(consoleMessages.join('\n')).not.toContain('Asia/Seoul');
  expect(page.url()).not.toContain('1994-07-19');
  expect(page.url()).not.toContain('03%3A17');
  expect(await context.cookies()).toEqual([]);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your Four Pillars' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear personal data' })).toHaveCount(0);
  await expect(page.getByLabel(/^Birth date/)).toHaveValue('');
});

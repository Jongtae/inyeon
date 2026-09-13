import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const routeUrl = (route: string) => `/inyeon/#${route}`;

type PrivacyProbe = {
  readonly storage: string[];
  readonly indexedDb: string[];
  readonly cache: string[];
  readonly cookies: string[];
  readonly fetch: string[];
  readonly xhr: string[];
  readonly beacons: string[];
  readonly webSockets: string[];
  readonly serviceWorkers: string[];
  readonly history: string[];
  readonly clipboard: string[];
  readonly canvasText: string[];
  readonly share: unknown[];
};

async function installPrivacyProbe(page: Page) {
  await page.addInitScript(() => {
    const probe: PrivacyProbe = {
      storage: [], indexedDb: [], cache: [], cookies: [], fetch: [], xhr: [], beacons: [],
      webSockets: [], serviceWorkers: [], history: [], clipboard: [], canvasText: [], share: [],
    };
    Object.defineProperty(window, '__inyeonPrivacyProbe', { value: probe });

    const storagePrototype = Storage.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
    for (const method of ['setItem', 'removeItem', 'clear'] as const) {
      const original = storagePrototype[method];
      storagePrototype[method] = new Proxy(original, {
        apply(target, thisArg, args) {
          probe.storage.push(`${method}:${args.map(String).join(':')}`);
          return Reflect.apply(target, thisArg, args);
        },
      });
    }

    for (const method of ['open', 'deleteDatabase'] as const) {
      const original = IDBFactory.prototype[method];
      IDBFactory.prototype[method] = new Proxy(original, {
        apply(target, thisArg, args) {
          probe.indexedDb.push(`${method}:${args.map(String).join(':')}`);
          return Reflect.apply(target, thisArg, args);
        },
      });
    }

    if ('CacheStorage' in window) {
      const cachePrototype = CacheStorage.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
      for (const method of ['open', 'delete', 'match'] as const) {
        const original = cachePrototype[method];
        cachePrototype[method] = new Proxy(original, {
          apply(target, thisArg, args) {
            probe.cache.push(`${method}:${args.map(String).join(':')}`);
            return Reflect.apply(target, thisArg, args);
          },
        });
      }
    }

    const cookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    if (cookie?.set) {
      Object.defineProperty(Document.prototype, 'cookie', {
        ...cookie,
        set(value: string) {
          probe.cookies.push(value);
          cookie.set?.call(this, value);
        },
      });
    }

    if (navigator.clipboard?.writeText) {
      const writeText = navigator.clipboard.writeText.bind(navigator.clipboard);
      Object.defineProperty(navigator.clipboard, 'writeText', {
        configurable: true,
        value: (value: string) => {
          probe.clipboard.push(value);
          return writeText(value);
        },
      });
    }

    const canvasPrototype = CanvasRenderingContext2D.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
    for (const method of ['fillText', 'strokeText'] as const) {
      const original = canvasPrototype[method];
      canvasPrototype[method] = new Proxy(original, {
        apply(target, thisArg, args) {
          probe.canvasText.push(`${method}:${String(args[0] ?? '')}`);
          return Reflect.apply(target, thisArg, args);
        },
      });
    }

    const originalFetch = window.fetch;
    window.fetch = new Proxy(originalFetch, {
      apply(target, thisArg, args) {
        probe.fetch.push(args.map(String).join(':'));
        return Reflect.apply(target, thisArg, args);
      },
    });

    const xhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = new Proxy(xhrOpen, {
      apply(target, thisArg, args) {
        probe.xhr.push(`open:${args.map(String).join(':')}`);
        return Reflect.apply(target, thisArg, args);
      },
    });
    const xhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = new Proxy(xhrSend, {
      apply(target, thisArg, args) {
        probe.xhr.push(`send:${args.map(String).join(':')}`);
        return Reflect.apply(target, thisArg, args);
      },
    });

    if (navigator.sendBeacon) {
      const beacon = navigator.sendBeacon.bind(navigator);
      Object.defineProperty(navigator, 'sendBeacon', {
        configurable: true,
        value: (url: string | URL, data?: BodyInit | null) => {
          probe.beacons.push(`${String(url)}:${String(data ?? '')}`);
          return beacon(url, data);
        },
      });
    }

    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = new Proxy(OriginalWebSocket, {
      construct(target, args, newTarget) {
        probe.webSockets.push(args.map(String).join(':'));
        return Reflect.construct(target, args, newTarget);
      },
    });

    if ('serviceWorker' in navigator) {
      const register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
      Object.defineProperty(navigator.serviceWorker, 'register', {
        configurable: true,
        value: (scriptUrl: string | URL, options?: RegistrationOptions) => {
          probe.serviceWorkers.push(`${String(scriptUrl)}:${JSON.stringify(options ?? {})}`);
          return register(scriptUrl, options);
        },
      });
    }

    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);
    history.pushState = (data, unused, url) => {
      probe.history.push(`push:${String(data)}:${String(unused)}:${String(url ?? '')}`);
      return pushState(data, unused, url);
    };
    history.replaceState = (data, unused, url) => {
      probe.history.push(`replace:${String(data)}:${String(unused)}:${String(url ?? '')}`);
      return replaceState(data, unused, url);
    };

    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: (data: ShareData) => Boolean(data.files?.length),
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        probe.share.push({
          title: data.title,
          text: data.text,
          url: data.url,
          files: await Promise.all(data.files?.map(async (file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            sha256: [...new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))]
              .map((value) => value.toString(16).padStart(2, '0')).join(''),
          })) ?? []),
        });
      },
    });
  });
}

async function readPrivacyProbe(page: Page): Promise<PrivacyProbe> {
  return page.evaluate(() => (window as typeof window & { __inyeonPrivacyProbe: PrivacyProbe }).__inyeonPrivacyProbe);
}

test('two-person input stays memory-only through comparison, invitation export, live refresh, and live tab replacement', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await installPrivacyProbe(page);
  const requests: string[] = [];
  const consoleMessages: string[] = [];
  const pageErrors: string[] = [];
  page.on('request', (request) => requests.push([
    request.url(), request.postData() ?? '', JSON.stringify(request.headers()),
  ].join('\n')));
  page.on('console', (message) => consoleMessages.push(message.text()));
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(routeUrl('/my-saju'));
  await expect(page.getByRole('heading', { name: 'Start with the details you actually know.' })).toBeVisible();
  requests.length = 0;
  await context.setOffline(true);

  await page.getByLabel(/^Birth date/).fill('1994-07-19');
  await page.getByLabel('Birth time', { exact: true }).fill('03:17');
  await page.getByLabel(/^Birthplace \/ time zone/).selectOption('Asia/Seoul');
  await page.getByRole('button', { name: 'Calculate my chart' }).click();
  const firstChartCanaries = await page.locator('.pillar-row article strong, .pillar-row article small').allTextContents();
  expect(firstChartCanaries).toHaveLength(8);
  expect(firstChartCanaries[4]).toMatch(/^[가-힣]{2}$/u);

  await page.getByRole('navigation', { name: 'Lab steps' }).getByRole('link', { name: /Someone I know/u }).click();
  await expect(page.getByRole('heading', { name: 'Keep a private comparison private.' })).toBeVisible();
  await page.getByLabel(/^Birth date/).fill('1992-11-27');
  await page.getByLabel('Birth time', { exact: true }).fill('04:23');
  await page.getByLabel(/^Birthplace \/ time zone/).selectOption('America/New_York');
  await page.getByRole('button', { name: 'Prepare second chart' }).click();
  const secondChartCanaries = await page.locator('.pillar-row article strong, .pillar-row article small').allTextContents();
  expect(secondChartCanaries).toHaveLength(8);
  expect(secondChartCanaries[4]).toMatch(/^[가-힣]{2}$/u);
  await page.getByRole('button', { name: 'View comparison details' }).click();

  await page.getByRole('button', { name: 'Preview share options' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Preview ready.' })).toBeVisible({ timeout: 15_000 });
  const safeLink = await page.getByLabel('Share-safe link').inputValue();
  expect(safeLink).toContain('kind=compare-invite');
  expect(safeLink).not.toContain('ref=');
  await page.getByRole('button', { name: 'Open share sheet' }).click();
  await page.getByRole('button', { name: 'Copy safe link' }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(safeLink);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const download = await downloadEvent;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const pngBytes = await readFile(downloadPath ?? '');

  const probe = await readPrivacyProbe(page);
  const browserState = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookie: document.cookie,
    indexedDb: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).length : 0,
    caches: 'caches' in window ? (await caches.keys()).length : 0,
    serviceWorkers: 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
  }));
  const observedExternalSurfaces = [
    ...Object.values(probe).flatMap((value) => Array.isArray(value) ? value.map(String) : []),
    requests.join('\n'), consoleMessages.join('\n'), pageErrors.join('\n'), safeLink, clipboard,
    JSON.stringify(probe.share), pngBytes.toString('utf8'), page.url(),
  ].join('\n');
  const protectedCanaries = [
    '1994-07-19', '03:17', 'Asia/Seoul', ...firstChartCanaries,
    '1992-11-27', '04:23', 'America/New_York', ...secondChartCanaries,
  ];
  for (const canary of protectedCanaries) expect(observedExternalSurfaces).not.toContain(canary);
  expect(probe.storage).toEqual([]);
  expect(probe.indexedDb).toEqual([]);
  expect(probe.cache).toEqual([]);
  expect(probe.cookies).toEqual([]);
  expect(probe.fetch).toEqual([]);
  expect(probe.xhr).toEqual([]);
  expect(probe.beacons).toEqual([]);
  expect(probe.webSockets).toEqual([]);
  expect(probe.serviceWorkers).toEqual([]);
  expect(probe.history).toEqual([]);
  expect(probe.clipboard).toEqual([safeLink]);
  expect(probe.canvasText.length).toBeGreaterThan(0);
  expect(probe.share).toHaveLength(1);
  const sharedFile = (probe.share[0] as { files: Array<{ sha256: string }> }).files[0];
  expect(sharedFile?.sha256).toBe(createHash('sha256').update(pngBytes).digest('hex'));
  expect(requests.filter((request) => /^https?:/u.test(request))).toEqual([]);
  expect(consoleMessages).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(browserState).toEqual({ local: 0, session: 0, cookie: '', indexedDb: 0, caches: 0, serviceWorkers: 0 });
  expect(await context.cookies()).toEqual([]);

  await context.setOffline(false);
  const closingTab = await context.newPage();
  await closingTab.goto(routeUrl('/my-saju'));
  await closingTab.getByLabel(/^Birth date/).fill('1991-02-03');
  await closingTab.getByLabel('Birth time', { exact: true }).fill('12:41');
  await closingTab.getByLabel(/^Birthplace \/ time zone/).selectOption('America/Los_Angeles');
  await closingTab.getByRole('button', { name: 'Calculate my chart' }).click();
  await closingTab.getByRole('navigation', { name: 'Lab steps' }).getByRole('link', { name: /Someone I know/u }).click();
  await expect(closingTab.getByRole('heading', { name: 'Keep a private comparison private.' })).toBeVisible();
  await closingTab.getByLabel(/^Birth date/).fill('1993-08-11');
  await closingTab.getByLabel('Birth time', { exact: true }).fill('09:26');
  await closingTab.getByLabel(/^Birthplace \/ time zone/).selectOption('America/New_York');
  await closingTab.getByRole('button', { name: 'Prepare second chart' }).click();
  await closingTab.getByRole('button', { name: 'View comparison details' }).click();
  await expect(closingTab.getByRole('heading', { name: 'You + someone you know' })).toBeVisible();
  await closingTab.close();

  const replacement = await context.newPage();
  await replacement.goto(routeUrl('/my-saju'));
  await expect(replacement.getByRole('heading', { name: 'Your Four Pillars' })).toHaveCount(0);
  await expect(replacement.getByLabel(/^Birth date/)).toHaveValue('');
  await expect(replacement.getByLabel('Birth time', { exact: true })).toHaveValue('');
  expect(await replacement.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookie: document.cookie,
    indexedDb: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).length : 0,
    caches: 'caches' in window ? (await caches.keys()).length : 0,
    serviceWorkers: 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
  }))).toEqual({ local: 0, session: 0, cookie: '', indexedDb: 0, caches: 0, serviceWorkers: 0 });
  await replacement.close();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'You + someone you know' })).toHaveCount(0);
  await expect(page.getByText('This private session has no saved chart.')).toBeVisible();
});

test('public and fictional comparisons compute offline after their static assets load', async ({ page, context }) => {
  const requests: string[] = [];
  const pageErrors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(routeUrl('/public-figures'));
  await expect(page.getByLabel('Search public figures')).toBeVisible();
  await page.getByLabel('Search public figures').fill('Billie Eilish');
  await expect(page.getByRole('button', { name: /Billie Eilish/ })).toBeVisible();
  await page.goto(routeUrl('/my-saju'));
  requests.length = 0;
  await context.setOffline(true);

  await page.getByLabel(/^Birth date/).fill('1995-10-21');
  await page.getByLabel('Birth time', { exact: true }).fill('14:30');
  await page.getByRole('button', { name: 'Calculate my chart' }).click();
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

  expect(requests).toEqual([]);
  expect(pageErrors).toEqual([]);
  await context.setOffline(false);
});

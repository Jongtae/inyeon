import { defineConfig, devices } from '@playwright/test';

const productionUrl = process.env.INYEON_PRODUCTION_URL;
const localSmoke = process.env.INYEON_ALLOW_LOCAL_SMOKE === '1' && productionUrl?.startsWith('http://127.0.0.1:');
if (!productionUrl || (!productionUrl.startsWith('https://') && !localSmoke)) {
  throw new Error('INYEON_PRODUCTION_URL must be an HTTPS GitHub Pages URL');
}

export default defineConfig({
  testDir: './e2e-production',
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: 'github',
  use: {
    baseURL: productionUrl.endsWith('/') ? productionUrl : `${productionUrl}/`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'production-chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

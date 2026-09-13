import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-disabled',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'VITE_SHARING_ENABLED=false npx vite build --outDir dist-sharing-disabled && npx vite preview --host 127.0.0.1 --port 4175 --strictPort --outDir dist-sharing-disabled',
    url: 'http://127.0.0.1:4175/inyeon/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'chromium-sharing-disabled', use: { ...devices['Desktop Chrome'] } },
  ],
});

import { expect, test } from '@playwright/test';

const disabledShareUrl = '/inyeon/#/share?v=inyeon-share-v1&kind=public-reference&copy=share-copy-en-us-v1&method=korean-saju-v1&ref=public%3Awd-q29564107';

test('the production sharing kill switch fails closed without disabling private calculation', async ({ page }) => {
  await page.goto('/inyeon/');
  await expect(page.getByRole('heading', { name: /Connection isn’t a verdict/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview share options' })).toHaveCount(0);

  await page.goto(disabledShareUrl);
  await expect(page.getByRole('heading', { name: 'Sharing is temporarily unavailable.' })).toBeVisible();
  await expect(page.getByText('Billie Eilish')).toHaveCount(0);
  await expect(page.getByText('No share-link content has been reconstructed.')).toBeVisible();

  await page.goto('/inyeon/#/my-saju');
  await page.getByLabel(/^Birth date/).fill('1995-10-21');
  await page.getByLabel('Birth time', { exact: true }).fill('14:30');
  await page.getByRole('button', { name: 'Calculate my chart' }).click();
  await expect(page.getByRole('heading', { name: 'Your Four Pillars' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview share options' })).toHaveCount(0);
});

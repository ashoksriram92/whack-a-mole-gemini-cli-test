// @ts-check
const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

test.describe('Contrast Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardAPI(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('highContrast'));
    await page.reload();
  });

  test('body does not have high-contrast class initially', async ({ page }) => {
    await expect(page.locator('body')).not.toHaveClass(/high-contrast/);
  });

  test('toggles high contrast on', async ({ page }) => {
    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).toHaveClass(/high-contrast/);
  });

  test('toggles high contrast off', async ({ page }) => {
    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).toHaveClass(/high-contrast/);

    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).not.toHaveClass(/high-contrast/);
  });

  test('persists high contrast across page reload', async ({ page }) => {
    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).toHaveClass(/high-contrast/);

    await page.reload();
    await expect(page.locator('body')).toHaveClass(/high-contrast/);
  });

  test('persists no-contrast across page reload', async ({ page }) => {
    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).toHaveClass(/high-contrast/);

    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).not.toHaveClass(/high-contrast/);

    await page.reload();
    await expect(page.locator('body')).not.toHaveClass(/high-contrast/);
  });
});

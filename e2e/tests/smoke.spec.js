const { test, expect } = require('@playwright/test');

test('page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Whack-a-Mole');
});

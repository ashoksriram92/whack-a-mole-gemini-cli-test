const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

const COUNTDOWN_DURATION = 4500; // ~4s countdown + buffer

test.describe('Mole Sprite', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardAPI(page);
    page.on('dialog', async (dialog) => await dialog.accept());
    await page.goto('/');
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
    await page.click('#start-button');
    // Wait for a mole to appear
    await page.locator('.mole.up').waitFor({ state: 'visible', timeout: COUNTDOWN_DURATION + 3000 });
  });

  test('mole element has a background-image CSS property set', async ({ page }) => {
    const mole = page.locator('.mole.up');
    const bgImage = await mole.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgImage).not.toBe('none');
    expect(bgImage).toContain('url(');
  });

  test('mole is visible when it has the .up class', async ({ page }) => {
    await expect(page.locator('.mole.up')).toBeVisible();
  });

  test('mole sprite renders in high-contrast mode', async ({ page }) => {
    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).toHaveClass(/high-contrast/);
    // Wait for a mole to appear in high-contrast mode
    const mole = page.locator('.mole.up');
    await mole.waitFor({ state: 'visible', timeout: COUNTDOWN_DURATION + 3000 });
    await expect(mole).toBeVisible();
    const bgImage = await mole.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgImage).not.toBe('none');
    expect(bgImage).toContain('url(');
  });

  test('mole has a CSS transition property set', async ({ page }) => {
    const mole = page.locator('.mole.up');
    const transition = await mole.evaluate((el) => getComputedStyle(el).transition);
    expect(transition).toContain('top');
  });
});

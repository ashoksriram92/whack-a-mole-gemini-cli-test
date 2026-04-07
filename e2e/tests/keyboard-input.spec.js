const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

const COUNTDOWN_DURATION = 4500; // ~4s countdown + buffer

test.describe('Keyboard Input', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardAPI(page);
    page.on('dialog', async (dialog) => await dialog.accept());
    await page.goto('/');
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
  });

  test('pressing digit key for mole square increments score', async ({ page }) => {
    await page.click('#start-button');

    // Wait for a mole to appear
    const mole = page.locator('.mole.up');
    await mole.waitFor({ state: 'visible', timeout: COUNTDOWN_DURATION + 3000 });

    // Find which square the mole is in
    const squareId = await page.locator('.square:has(.mole.up)').getAttribute('id');

    // Press the corresponding digit key
    await page.keyboard.press(`Digit${squareId}`);

    // Score should be at least 1
    const scoreText = await page.locator('#score').textContent();
    expect(parseInt(scoreText)).toBeGreaterThanOrEqual(1);
  });

  test('pressing keys when game is not started does not change score', async ({ page }) => {
    // Game not started, press some digit keys
    await page.keyboard.press('Digit5');
    await page.keyboard.press('Digit1');

    await expect(page.locator('#score')).toHaveText('0');
  });
});

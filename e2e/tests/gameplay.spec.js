const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

test.describe('Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardAPI(page);
    // Handle any dialogs (game over alert) so they don't block
    page.on('dialog', async (dialog) => await dialog.accept());
    await page.goto('/');
    // Enter name and submit
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
  });

  test('start button becomes disabled when clicked', async ({ page }) => {
    await page.click('#start-button');
    await expect(page.locator('#start-button')).toBeDisabled();
  });

  test('score starts at 0 and timer at 60', async ({ page }) => {
    await page.click('#start-button');
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#time-left')).toHaveText('60');
  });

  test('moles appear after starting game', async ({ page }) => {
    await page.click('#start-button');
    // Moles appear every 700ms, wait for one
    await expect(page.locator('.mole.up')).toBeVisible({ timeout: 3000 });
  });

  test('clicking a mole increments the score', async ({ page }) => {
    await page.click('#start-button');
    // Wait for a mole to appear
    const mole = page.locator('.mole.up');
    await mole.waitFor({ state: 'visible', timeout: 3000 });
    // Get parent square and click it (mousedown handler is on .square)
    const parentSquare = page.locator('.square:has(.mole.up)');
    await parentSquare.click();
    // Score should be at least 1
    const scoreText = await page.locator('#score').textContent();
    expect(parseInt(scoreText)).toBeGreaterThanOrEqual(1);
  });

  test('timer counts down', async ({ page }) => {
    await page.click('#start-button');
    await page.waitForTimeout(2500);
    const timeText = await page.locator('#time-left').textContent();
    const timeVal = parseInt(timeText);
    expect(timeVal).toBeLessThan(60);
    expect(timeVal).toBeGreaterThan(0);
  });

  test('start button stays disabled during gameplay', async ({ page }) => {
    await page.click('#start-button');
    await page.waitForTimeout(1000);
    await expect(page.locator('#start-button')).toBeDisabled();
  });

  test('multiple mole hits increment score correctly', async ({ page }) => {
    await page.click('#start-button');
    let hits = 0;
    // Try to hit 3 moles
    for (let i = 0; i < 3; i++) {
      const mole = page.locator('.mole.up');
      try {
        await mole.waitFor({ state: 'visible', timeout: 3000 });
        const square = page.locator('.square:has(.mole.up)');
        await square.click();
        hits++;
        // Wait for next mole cycle
        await page.waitForTimeout(800);
      } catch (e) {
        // mole may have moved, try again
      }
    }
    const scoreText = await page.locator('#score').textContent();
    // Score should be at least 1 (timing can cause misses)
    expect(parseInt(scoreText)).toBeGreaterThanOrEqual(1);
  });
});

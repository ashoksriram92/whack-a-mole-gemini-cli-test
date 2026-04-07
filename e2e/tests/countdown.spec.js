const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

test.describe('Pre-game Countdown', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardAPI(page);
    page.on('dialog', async (dialog) => await dialog.accept());
    await page.goto('/');
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
  });

  test('countdown overlay becomes visible after clicking Start', async ({ page }) => {
    await page.click('#start-button');
    await expect(page.locator('#countdown-overlay')).toHaveClass(/active/);
  });

  test('countdown shows "3" as first text', async ({ page }) => {
    await page.click('#start-button');
    await expect(page.locator('#countdown-text')).toHaveText('3');
  });

  test('countdown shows "Go!" as final step', async ({ page }) => {
    await page.click('#start-button');
    // Wait for 3, 2, 1 to pass (~3 seconds)
    await expect(page.locator('#countdown-text')).toHaveText('Go!', { timeout: 5000 });
  });

  test('countdown overlay is hidden after countdown completes', async ({ page }) => {
    await page.click('#start-button');
    // Wait for the full countdown (~4 seconds) plus buffer
    await page.waitForTimeout(4500);
    await expect(page.locator('#countdown-overlay')).not.toHaveClass(/active/);
  });

  test('moles do NOT appear during the countdown phase', async ({ page }) => {
    await page.click('#start-button');
    // During countdown (~4s), no moles should be visible
    await page.waitForTimeout(2000);
    await expect(page.locator('#countdown-overlay')).toHaveClass(/active/);
    const moleCount = await page.locator('.mole.up').count();
    expect(moleCount).toBe(0);
  });

  test('timer stays at 60 during countdown', async ({ page }) => {
    await page.click('#start-button');
    // Check at various points during countdown
    await page.waitForTimeout(1500);
    await expect(page.locator('#time-left')).toHaveText('60');
    await page.waitForTimeout(1500);
    await expect(page.locator('#time-left')).toHaveText('60');
  });

  test('start button remains disabled during countdown', async ({ page }) => {
    await page.click('#start-button');
    await page.waitForTimeout(1000);
    await expect(page.locator('#start-button')).toBeDisabled();
    await page.waitForTimeout(1000);
    await expect(page.locator('#start-button')).toBeDisabled();
  });
});

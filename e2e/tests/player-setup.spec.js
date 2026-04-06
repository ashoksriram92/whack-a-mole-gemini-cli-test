// @ts-check
const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

test.describe('Player Setup', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardAPI(page);
    await page.goto('/');
  });

  test('displays page title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Whack-a-Mole');
  });

  test('shows player setup section initially', async ({ page }) => {
    await expect(page.locator('#player-setup')).toBeVisible();
  });

  test('hides game container initially', async ({ page }) => {
    await expect(page.locator('.game-container')).toBeHidden();
  });

  test('shows contrast toggle button', async ({ page }) => {
    await expect(page.locator('#contrast-toggle')).toBeVisible();
  });

  test('shows leaderboard on initial load', async ({ page }) => {
    await expect(page.locator('.leaderboard-container')).toBeVisible();
  });

  test('rejects empty name submission', async ({ page }) => {
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await page.locator('#submit-name').click();

    expect(dialogMessage).toBe('Please enter your name.');
    await expect(page.locator('.game-container')).toBeHidden();
  });

  test('rejects whitespace-only name', async ({ page }) => {
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await page.locator('#player-name').fill('   ');
    await page.locator('#submit-name').click();

    expect(dialogMessage).toBe('Please enter your name.');
    await expect(page.locator('.game-container')).toBeHidden();
  });

  test('accepts valid name and shows game', async ({ page }) => {
    await page.locator('#player-name').fill('TestPlayer');
    await page.locator('#submit-name').click();

    await expect(page.locator('#player-setup')).toBeHidden();
    await expect(page.locator('.game-container')).toBeVisible();
  });

  test('enforces max name length', async ({ page }) => {
    await expect(page.locator('#player-name')).toHaveAttribute('maxlength', '15');
  });

  test('shows enabled start button after name submit', async ({ page }) => {
    await page.locator('#player-name').fill('TestPlayer');
    await page.locator('#submit-name').click();

    await expect(page.locator('#start-button')).toBeVisible();
    await expect(page.locator('#start-button')).not.toBeDisabled();
  });
});

const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeaderboardAPI(page);
  });

  test('renders correctly at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#player-setup')).toBeVisible();
    await expect(page.locator('.leaderboard-container')).toBeVisible();

    // Check no horizontal scroll (body width <= viewport width)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(500);
  });

  test('renders correctly at desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#player-setup')).toBeVisible();
    await expect(page.locator('.leaderboard-container')).toBeVisible();
  });

  test('game grid is visible and properly sized at mobile', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/');

    // Enter name to show game area
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');

    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();

    const gridBox = await grid.boundingBox();
    // Grid should be contained within the viewport
    expect(gridBox.width).toBeLessThanOrEqual(500);
    expect(gridBox.width).toBeGreaterThan(0);
  });

  test('game grid is visible at desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');

    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
    const gridBox = await grid.boundingBox();
    expect(gridBox.width).toBeGreaterThan(0);
  });
});

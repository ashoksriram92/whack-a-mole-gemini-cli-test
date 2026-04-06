// @ts-check
const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

test.describe('Leaderboard', () => {
  test('displays leaderboard heading', async ({ page }) => {
    await mockLeaderboardAPI(page);
    await page.goto('/');

    await expect(page.locator('.leaderboard-container h2')).toHaveText('Leaderboard');
  });

  test('shows scores from API', async ({ page }) => {
    const scores = [
      { name: 'Alice', score: 50 },
      { name: 'Bob', score: 40 },
      { name: 'Charlie', score: 30 },
      { name: 'Dave', score: 20 },
      { name: 'Eve', score: 10 },
    ];
    await mockLeaderboardAPI(page, scores);
    await page.goto('/');

    const items = page.locator('#leaderboard-list li');
    await expect(items).toHaveCount(5);
    await expect(items.first()).toHaveText('Alice: 50');
  });

  test('shows all score entries in correct format', async ({ page }) => {
    const scores = [
      { name: 'Alice', score: 50 },
      { name: 'Bob', score: 40 },
      { name: 'Charlie', score: 30 },
      { name: 'Dave', score: 20 },
      { name: 'Eve', score: 10 },
    ];
    await mockLeaderboardAPI(page, scores);
    await page.goto('/');

    const items = page.locator('#leaderboard-list li');
    await expect(items.nth(0)).toHaveText('Alice: 50');
    await expect(items.nth(1)).toHaveText('Bob: 40');
    await expect(items.nth(2)).toHaveText('Charlie: 30');
    await expect(items.nth(3)).toHaveText('Dave: 20');
    await expect(items.nth(4)).toHaveText('Eve: 10');
  });

  test('handles empty leaderboard', async ({ page }) => {
    await mockLeaderboardAPI(page, []);
    await page.goto('/');

    const items = page.locator('#leaderboard-list li');
    await expect(items).toHaveCount(0);
  });

  test('shows error on API failure', async ({ page }) => {
    await page.route('**/Prod/leaderboard', async (route) => {
      if (route.request().method() === 'GET') {
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await page.goto('/');

    const errorItem = page.locator('#leaderboard-list li');
    await expect(errorItem).toHaveCount(1);
    await expect(errorItem).toContainText('Could not load leaderboard');
  });

  test('leaderboard container is always visible', async ({ page }) => {
    await mockLeaderboardAPI(page);
    await page.goto('/');

    await expect(page.locator('.leaderboard-container')).toBeVisible();
  });
});

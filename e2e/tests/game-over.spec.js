const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

test.describe('Game Over', () => {
  let postRequests;

  test.beforeEach(async ({ page }) => {
    postRequests = [];

    // Track POST requests to leaderboard
    await page.route('**/Prod/leaderboard', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        postRequests.push({
          method,
          body: route.request().postDataJSON(),
        });
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Score added successfully' }),
        });
      } else if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    // Speed up setInterval by 60x so the 60-second game finishes in ~1 second
    await page.addInitScript(() => {
      const _origSetInterval = window.setInterval;
      window.setInterval = function(fn, delay, ...args) {
        return _origSetInterval.call(window, fn, Math.max(Math.floor(delay / 60), 10), ...args);
      };
    });
  });

  test('shows game over alert with score', async ({ page }) => {
    let gameOverMessage = '';
    page.on('dialog', async (dialog) => {
      gameOverMessage = dialog.message();
      await dialog.accept();
    });

    await page.goto('/');
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
    await page.click('#start-button');

    // Wait for game to complete (with 60x speedup, ~1 second + buffer)
    await expect(async () => {
      expect(gameOverMessage).toContain('Game Over! Your final score is');
    }).toPass({ timeout: 10000 });
  });

  test('re-enables start button after game over', async ({ page }) => {
    page.on('dialog', async (dialog) => await dialog.accept());

    await page.goto('/');
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
    await page.click('#start-button');

    // Wait for start button to become enabled again (game over)
    await expect(page.locator('#start-button')).toBeEnabled({ timeout: 10000 });
  });

  test('saves score via POST to leaderboard API', async ({ page }) => {
    page.on('dialog', async (dialog) => await dialog.accept());

    await page.goto('/');
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
    await page.click('#start-button');

    // Wait for game over (start button re-enabled)
    await expect(page.locator('#start-button')).toBeEnabled({ timeout: 10000 });

    // Wait a tick for the POST to be sent
    await page.waitForTimeout(500);

    expect(postRequests.length).toBeGreaterThanOrEqual(1);
    const lastPost = postRequests[postRequests.length - 1];
    expect(lastPost.body).toHaveProperty('name', 'TestPlayer');
    expect(lastPost.body).toHaveProperty('score');
    expect(typeof lastPost.body.score).toBe('number');
  });

  test('can start a new game after game over', async ({ page }) => {
    page.on('dialog', async (dialog) => await dialog.accept());

    await page.goto('/');
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#submit-name');
    await page.click('#start-button');

    // Wait for game over
    await expect(page.locator('#start-button')).toBeEnabled({ timeout: 10000 });

    // Start a new game
    await page.click('#start-button');
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#time-left')).toHaveText('60');
    await expect(page.locator('#start-button')).toBeDisabled();
  });
});

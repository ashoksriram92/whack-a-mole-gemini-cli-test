const { test, expect } = require('@playwright/test');
const { mockLeaderboardAPI } = require('./helpers');

const COUNTDOWN_DURATION = 4500; // ~4s countdown + buffer

test.describe('Hit Feedback Animations', () => {
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

  test('clicking a mole adds .hit class to the square', async ({ page }) => {
    const square = page.locator('.square:has(.mole.up)');
    await square.click();
    await expect(square).toHaveClass(/hit/);
  });

  test('a .score-popup element appears in .grid after a successful hit', async ({ page }) => {
    const square = page.locator('.square:has(.mole.up)');
    await square.click();
    const popup = page.locator('.grid .score-popup');
    await expect(popup.first()).toBeVisible();
    await expect(popup.first()).toHaveText('+1');
  });

  test('.hit class is removed after animation ends', async ({ page }) => {
    const square = page.locator('.square:has(.mole.up)');
    const squareId = await square.getAttribute('id');
    await square.click();
    // Wait for shake animation to finish (300ms) plus a buffer
    await page.waitForTimeout(500);
    const targetSquare = page.locator(`.square[id="${squareId}"]`);
    await expect(targetSquare).not.toHaveClass(/hit/);
  });

  test('.score-popup is removed from DOM after animation ends', async ({ page }) => {
    const square = page.locator('.square:has(.mole.up)');
    await square.click();
    // Popup animation is 500ms, wait for it to complete plus buffer
    await page.waitForTimeout(700);
    const popups = page.locator('.grid .score-popup');
    await expect(popups).toHaveCount(0);
  });

  test('clicking an empty square does NOT produce .score-popup or .hit', async ({ page }) => {
    // Find a square that does NOT have a mole
    const moleSquareId = await page.locator('.square:has(.mole.up)').getAttribute('id');
    // Pick a different square
    const emptySquareId = moleSquareId === '1' ? '5' : '1';
    const emptySquare = page.locator(`.square[id="${emptySquareId}"]`);
    await emptySquare.click();
    // Brief wait to allow any potential (erroneous) animations
    await page.waitForTimeout(100);
    await expect(emptySquare).not.toHaveClass(/hit/);
    const popups = page.locator('.grid .score-popup');
    await expect(popups).toHaveCount(0);
  });

  test('feedback animations work in high-contrast mode', async ({ page }) => {
    // Enable high-contrast mode
    await page.locator('#contrast-toggle').click();
    await expect(page.locator('body')).toHaveClass(/high-contrast/);
    // Wait for a mole to appear
    await page.locator('.mole.up').waitFor({ state: 'visible', timeout: 3000 });
    const square = page.locator('.square:has(.mole.up)');
    await square.click();
    // Verify .hit class applied
    await expect(square).toHaveClass(/hit/);
    // Verify popup appears with correct text
    const popup = page.locator('.grid .score-popup');
    await expect(popup.first()).toBeVisible();
    await expect(popup.first()).toHaveText('+1');
  });
});

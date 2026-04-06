async function mockLeaderboardAPI(page, scores = []) {
  await page.route('**/Prod/leaderboard', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(scores),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Score added successfully' }),
      });
    } else {
      await route.continue();
    }
  });
}

module.exports = { mockLeaderboardAPI };

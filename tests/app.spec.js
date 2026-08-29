import { test, expect } from '@playwright/test';

test.describe('Epic Toolbox Basic Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should load the toolbox by default', async ({ page }) => {
    // Check if the Toolbox header is visible
    const toolboxHeader = page.locator('h2', { hasText: 'Toolbox' });
    await expect(toolboxHeader).toBeVisible();
  });

  test('should navigate to Bookmarks tab and update query params', async ({ page }) => {
    const bookmarksTab = page.locator('button', { hasText: 'Bookmarks' });
    await bookmarksTab.click();

    // Check if the Bookmarks view is active
    const bookmarksHeader = page.locator('h2', { hasText: 'Bookmarks' });
    await expect(bookmarksHeader).toBeVisible();
    expect(page.url()).toMatch(/(\/bookmarks|\?tab=bookmarks)/);
  });

  test('should load category directly via URL tab query and hash anchor', async ({ page }) => {
    await page.goto('http://localhost:5173/?tab=bookmarks#Streaming');
    const bookmarksHeader = page.locator('h2', { hasText: 'Bookmarks' });
    await expect(bookmarksHeader).toBeVisible();

    const activePill = page.locator('.main-category-nav .pill.active');
    await expect(activePill).toContainText('Streaming');
  });

  test('should update hash when clicking category pill in Bookmarks', async ({ page }) => {
    await page.goto('http://localhost:5173/?tab=bookmarks');
    const bookmarksHeader = page.locator('h2', { hasText: 'Bookmarks' });
    await expect(bookmarksHeader).toBeVisible();

    const streamingPill = page.locator('.main-category-nav .pill', { hasText: 'Streaming' });
    await streamingPill.click();

    await expect(page).toHaveURL(/.*#Streaming$/);
  });

  test('should open a tool category', async ({ page }) => {
    // Click on JSON Formatter card
    const devToolsCard = page.locator('.card', { hasText: 'JSON Formatter' });
    await devToolsCard.click();

    // Check if breadcrumb shows JSON Formatter
    await expect(page.locator('.breadcrumb-item.active', { hasText: 'JSON Formatter' })).toBeVisible();
  });

  test('should open a bookmark card link', async ({ page }) => {
    // Navigate to Bookmarks tab
    const bookmarksTab = page.locator('button', { hasText: 'Bookmarks' });
    await bookmarksTab.click();

    // Check if Bookmarks header is visible
    const bookmarksHeader = page.locator('h2', { hasText: 'Bookmarks' });
    await expect(bookmarksHeader).toBeVisible();

    // Locate the first bookmark card (e.g. Character.AI)
    const card = page.locator('.card', { hasText: 'Character.AI' }).first();
    await expect(card).toBeVisible();

    // Set up a promise to listen for the popup/new tab
    const popupPromise = page.waitForEvent('popup');
    await card.click();

    const popup = await popupPromise;
    await expect(popup).toBeDefined();
    expect(popup.url()).toContain('character.ai');
  });
});

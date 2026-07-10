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

  test('should navigate to Bookmarks tab', async ({ page }) => {
    const bookmarksTab = page.locator('button', { hasText: 'Bookmarks' });
    await bookmarksTab.click();

    // Check if the Bookmarks view is active
    const bookmarksHeader = page.locator('h2', { hasText: 'Bookmarks' });
    await expect(bookmarksHeader).toBeVisible();
  });

  test('should open a tool category', async ({ page }) => {
    // Click on JSON Formatter card
    const devToolsCard = page.locator('.card', { hasText: 'JSON Formatter' });
    await devToolsCard.click();

    // Check if breadcrumb shows JSON Formatter
    await expect(page.locator('.breadcrumb-item.active', { hasText: 'JSON Formatter' })).toBeVisible();
  });
});

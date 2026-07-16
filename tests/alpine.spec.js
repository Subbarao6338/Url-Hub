import { test, expect } from '@playwright/test';

test.describe('Alpine.js Refactored Subtools', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.log(`BROWSER ERROR: ${err.message}`);
    });
    await page.goto('http://localhost:5173');
  });

  test('should navigate to Age Calculator and compute age', async ({ page }) => {
    // Navigate to Age Calculator tool card
    const card = page.locator('.card', { hasText: 'Age Calculator' });
    await card.click();

    // Verify header
    await expect(page.locator('h3', { hasText: 'Age Calculator' })).toBeVisible();

    // Fill DOB
    const input = page.locator('input[type="date"]');
    await input.click();
    await input.fill('2000-01-01');
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');

    // Click Calculate Age
    await page.locator('button', { hasText: 'Calculate Age' }).click();

    // Give it a tiny moment to process and verify age text is visible
    const result = page.locator('.text-2xl');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Years');
  });

  test('should navigate to Traditional & Ethnic styles and view details', async ({ page }) => {
    // Navigate to Traditional & Ethnic Guide card
    const card = page.locator('.card', { hasText: 'Traditional & Ethnic Guide' });
    await card.click();

    // Click on 'India' region pill (or check it is visible)
    const indiaPill = page.locator('button.pill', { hasText: 'India' });
    await expect(indiaPill).toBeVisible();
    await indiaPill.click();

    // Click on Saree style card
    const sareeCard = page.locator('.category-grid .card', { hasText: 'Saree' });
    await expect(sareeCard).toBeVisible();
    await sareeCard.click();

    // Verify detail container shows up
    const detailHeader = page.locator('span', { hasText: 'Style Detail' });
    await expect(detailHeader).toBeVisible();

    const detailContent = page.locator('pre');
    await expect(detailContent).toContainText('Saree');
  });
});

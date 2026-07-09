import { test, expect } from '@playwright/test';

test.describe('Size Guide Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?tab=toolbox&tool=size-guide');
  });

  test('should calculate dress size correctly for women', async ({ page }) => {
    await page.waitForSelector('.tool-view', { timeout: 15000 });
    await expect(page.locator('.breadcrumb-item.active')).toContainText('Size & Body Guide');

    await page.fill('input[name="bust"]', '93');
    await page.fill('input[name="waist"]', '75');
    await page.fill('input[name="hips"]', '101');

    await page.click('button:has-text("Get Clothing Size")');

    const result = page.locator('.tool-result');
    await expect(result).toContainText('Recommended Size: M');
    await expect(result).toContainText('US: 8-10');
    await expect(result).toContainText('EU: 40-42');
  });

  test('should calculate bra size correctly', async ({ page }) => {
    await page.waitForSelector('.tool-view', { timeout: 15000 });
    await page.click('button:has-text("Inners")');

    await page.fill('input[name="bust"]', '90');
    await page.fill('input[name="underbust"]', '75');

    await page.click('button:has-text("Calculate Inner Size")');

    const result = page.locator('.tool-result');
    await expect(result).toContainText('Bra Size Prediction');
    await expect(result).toContainText('34A');
  });
});

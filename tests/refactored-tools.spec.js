import { test, expect } from '@playwright/test';

test.describe('Refactored Toolbox Subtools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should navigate to Advanced Date Difference and compute span', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Date Difference' });
    await expect(card).toBeVisible();
    await card.click();

    // Fill dates
    const startInput = page.locator('label:has-text("Start Date") + input[type="date"]');
    const endInput = page.locator('label:has-text("End Date") + input[type="date"]');

    await startInput.fill('2026-01-01');
    await endInput.fill('2026-01-10');

    await page.click('button:has-text("Calculate Difference")');

    // Verify result contains exact span and chronological details
    const result = page.locator('.tool-result-container');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Date Difference Analysis');
    await expect(result).toContainText('9 days');

    // Click clear
    const clearBtn = page.locator('button:has-text("Clear")');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Verify results are cleared
    await expect(result).not.toBeVisible();
  });

  test('should navigate to Base64 Text Tool and encode/decode safely', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Base64' });
    await expect(card).toBeVisible();
    await card.click();

    const textarea = page.locator('textarea[placeholder*="Enter text to encode"]');
    await textarea.fill('Hello Jules!');

    await page.click('button:has-text("Encode Text")');

    const result = page.locator('.tool-result-container');
    await expect(result).toBeVisible();
    await expect(result).toContainText('SGVsbG8gSnVsZXMh');

    // Copying works or clear works
    const clearBtn = page.locator('button:has-text("Clear")');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(result).not.toBeVisible();
  });

  test('should detect base64 inputs automatically', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Base64' });
    await expect(card).toBeVisible();
    await card.click();

    const textarea = page.locator('textarea[placeholder*="Enter text to encode"]');
    // SGVsbG8gSnVsZXMhCg== is "Hello Jules!\n"
    await textarea.fill('SGVsbG8gSnVsZXMhCg==');

    const detectionBox = page.locator('text=Detected Base64 format. You might want to Decode this.');
    await expect(detectionBox).toBeVisible();
  });

  test('should navigate to Cron Expression Parser and explain preset', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Cron Parser' });
    await expect(card).toBeVisible();
    await card.click();

    // Select a preset
    const presetBtn = page.locator('button:has-text("Every Weekday")');
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    await page.click('button:has-text("Explain Cron Expression")');

    const result = page.locator('.tool-result-container');
    await expect(result).toBeVisible();
    output:
    await expect(result).toContainText('Cron Expression Breakdown');
    await expect(result).toContainText('Scheduled Executions');
  });

  test('should navigate to URL Encoder / Decoder & Analyzer and analyze a complex URL', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'URL Tool' });
    await expect(card).toBeVisible();
    await card.click();

    // Click Sample API URL preset
    const presetBtn = page.locator('button:has-text("Sample API URL")');
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    const analyzerHeader = page.locator('span:has-text("URL Parser & Query Analyzer")');
    await expect(analyzerHeader).toBeVisible();

    const hostDetails = page.locator('.url-parser-results');
    await expect(hostDetails).toContainText('api.github.com');
    await expect(hostDetails).toContainText('Query Parameters (3)');
  });

  test('should navigate to Timestamp Tool and support live clock and custom inputs', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Timestamp' });
    await expect(card).toBeVisible();
    await card.click();

    const inputTs = page.locator('input[placeholder="e.g. 1700000000"]');
    await inputTs.fill('1700000000');
    await page.click('button:has-text("Convert") >> nth=0');

    await expect(page.locator('text=2023-11-14')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Settings Live Analytics and Diagnostics', () => {
  test('should open settings, expand Live Analytics & Diagnostics, and run health diagnostics', async ({ page }) => {
    await page.goto('/');

    // Open settings modal (e.g. click settings button or press Alt+4)
    const settingsBtn = page.locator('button[title="Settings"], button:has-text("Settings"), .material-icons:has-text("settings")').first();
    await settingsBtn.click();

    // Verify Settings Modal is visible
    await expect(page.locator('.modal h2')).toHaveText('Settings');

    // Find and click "Live Analytics & Diagnostics" section header
    const analyticsHeader = page.locator('.collapsible-header:has-text("Live Analytics & Diagnostics")');
    await expect(analyticsHeader).toBeVisible();
    await analyticsHeader.click();

    // Verify Telemetry metrics cards are displayed
    await expect(page.locator('text=Live Telemetry & Metrics')).toBeVisible();
    await expect(page.locator('text=Storage Used')).toBeVisible();
    await expect(page.locator('text=Page Load Time')).toBeVisible();

    // Find and click "Run Diagnostics" button
    const runDiagnosticsBtn = page.locator('button:has-text("Run Diagnostics")');
    await expect(runDiagnosticsBtn).toBeVisible();
    await runDiagnosticsBtn.click();

    // Verify diagnostic results are shown
    await expect(page.locator('.diagnostic-results')).toBeVisible();
    await expect(page.locator('text=Local Storage R/W')).toBeVisible();
    await expect(page.locator('text=Backend API Connectivity')).toBeVisible();
    await expect(page.locator('text=Browser Capabilities')).toBeVisible();
  });
});

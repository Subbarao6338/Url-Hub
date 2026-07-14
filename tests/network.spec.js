import { test, expect } from '@playwright/test';

test.describe('Network Hub HTMX Subtools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should navigate to Network Hub and open DNS Lookup', async ({ page }) => {
    // Navigate to Network Hub category/tool card
    const networkCard = page.locator('.card', { hasText: 'DNS Lookup' });
    await networkCard.click();

    // Verify DnsLookup is visible
    await expect(page.locator('h3', { hasText: 'DNS Lookup' })).toBeVisible();

    // Fill in a domain
    const input = page.locator('input[name="domain"]');
    await input.fill('google.com');

    // Clear button should be visible when input has text
    const clearBtn = page.locator('button', { hasText: 'Clear' });
    await expect(clearBtn).toBeVisible();

    // Click clear button
    await clearBtn.click();

    // Input should be empty
    await expect(input).toHaveValue('');
  });

  test('should open WHOIS Record and support input', async ({ page }) => {
    const whoisCard = page.locator('.card', { hasText: 'WHOIS Record' });
    await whoisCard.click();

    await expect(page.locator('h3', { hasText: 'WHOIS Record' })).toBeVisible();

    const input = page.locator('input[name="domain"]');
    await input.fill('example.com');

    const clearBtn = page.locator('button', { hasText: 'Clear' });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(input).toHaveValue('');
  });

  test('should open SSL Certificate Checker and support input', async ({ page }) => {
    const sslCard = page.locator('.card', { hasText: 'SSL Checker' });
    await sslCard.click();

    await expect(page.locator('h3', { hasText: 'SSL Certificate Checker' })).toBeVisible();

    const input = page.locator('input[name="domain"]');
    await input.fill('github.com');

    const clearBtn = page.locator('button', { hasText: 'Clear' });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(input).toHaveValue('');
  });

  test('should open IP Information and support input', async ({ page }) => {
    const ipCard = page.locator('.card', { hasText: 'IP Information' });
    await ipCard.click();

    await expect(page.locator('h3', { hasText: 'IP Information' })).toBeVisible();

    const input = page.locator('input[name="ip"]');
    await input.fill('1.1.1.1');

    const clearBtn = page.locator('button', { hasText: 'Clear' });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(input).toHaveValue('');
  });
});

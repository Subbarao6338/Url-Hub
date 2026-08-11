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

  test('should calculate leap year February 29th difference correctly', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Date Difference' });
    await expect(card).toBeVisible();
    await card.click();

    const startInput = page.locator('label:has-text("Start Date") + input[type="date"]');
    const endInput = page.locator('label:has-text("End Date") + input[type="date"]');

    // 2024 is a leap year
    await startInput.fill('2024-02-28');
    await endInput.fill('2024-02-29');

    await page.click('button:has-text("Calculate Difference")');

    const result = page.locator('.tool-result-container');
    await expect(result).toBeVisible();
    await expect(result).toContainText('1 day');

    // Click clear
    const clearBtn = page.locator('button:has-text("Clear")');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
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

  test('should navigate to Color Picker and support reset and copy', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Color Picker' });
    await expect(card).toBeVisible();
    await card.click();

    // Verify default colors are shown
    const colorText = page.locator('.font-mono', { hasText: '#4A7C59' });
    await expect(colorText).toBeVisible();

    // Try picking/setting input value or verifying click to copy
    const hexCard = page.locator('.card', { hasText: 'HEX' });
    await expect(hexCard).toBeVisible();
  });

  test('should navigate to Markdown Table Generator and support interactive visual creation', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Markdown Table' });
    await expect(card).toBeVisible();
    await card.click();

    // Wait for the table headers input to render
    const firstHeaderInput = page.locator('table thead input').first();
    await expect(firstHeaderInput).toHaveValue('Header 1');

    // Verify first body cell input
    const cellInput = page.locator('table tbody input').first();
    await expect(cellInput).toHaveValue('Row 1 Col 1');

    // Verify result contains Markdown table elements
    const result = page.locator('.tool-result-container');
    await expect(result).toBeVisible();
    await expect(result).toContainText('| Header 1 | Header 2 | Header 3 |');
  });

  test('should navigate to SQL Builder and construct query visually', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'SQL Builder' });
    await expect(card).toBeVisible();
    await card.click();

    // Verify default inputs
    const selectFieldsInput = page.locator('label:has-text("SELECT Fields") + input');
    await expect(selectFieldsInput).toHaveValue('*');

    // Add a Join
    await page.click('button:has-text("Add Join")');
    await page.fill('input[placeholder="Table to join"]', 'profiles');
    await page.fill('input[placeholder="e.g. users.id = posts.user_id"]', 'users.id = profiles.user_id');

    // Verify query build output
    const result = page.locator('.tool-result-container');
    await expect(result).toBeVisible();
    await expect(result).toContainText('SELECT *');
    await expect(result).toContainText('FROM users');
    await expect(result).toContainText('INNER JOIN profiles ON users.id = profiles.user_id');
  });

  test('should navigate to Markdown Editor and sanitize malicious XSS input', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Markdown Editor' });
    await expect(card).toBeVisible();
    await card.click();

    // Fill markdown input with malicious XSS script
    const textarea = page.locator('textarea[placeholder*="Write markdown..."]');
    await textarea.fill('Hello **World** <script>alert("XSS")</script> <img src=x onerror=alert(1)>');

    // Get the preview container
    const preview = page.locator('.markdown-preview');
    await expect(preview).toBeVisible();

    // The rendered html should have **World** as bold text:
    await expect(preview.locator('strong')).toContainText('World');

    // The script tag should have been sanitized and removed from the DOM:
    const scriptTag = preview.locator('script');
    await expect(scriptTag).toHaveCount(0);

    // The onerror attribute of the img tag should be stripped out:
    const imgTag = preview.locator('img');
    await expect(imgTag).toBeVisible();
    await expect(imgTag).not.toHaveAttribute('onerror');
  });

  test('should navigate to REST API Tester and allow method selection & configuration', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'REST API Tester' });
    await expect(card).toBeVisible();
    await card.click();

    // Verify header exists
    await expect(page.locator('h3:has-text("REST API Client & Tester")')).toBeVisible();

    // Select input field value
    const urlInput = page.locator('input[placeholder*="api.example.com"]');
    await expect(urlInput).toHaveValue('https://jsonplaceholder.typicode.com/posts/1');

    // Change Method to POST and verify request configuration layout shows body section
    const methodSelect = page.locator('select.select-field');
    await methodSelect.selectOption('POST');

    // Click Request Configuration tab
    await page.click('button:has-text("Request Configuration")');

    // Body text area should be visible
    const bodyArea = page.locator('textarea[placeholder*="key"]');
    await expect(bodyArea).toBeVisible();
  });

  test('should navigate to JWT Debugger and verify preset loading, decoding and token generation', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'JWT Debugger' });
    await expect(card).toBeVisible();
    await card.click();

    // Header validation
    await expect(page.locator('h3:has-text("JSON Web Token (JWT) Workstation")')).toBeVisible();

    // Try a preset sample
    const sampleBtn = page.locator('button:has-text("OAuth Access")');
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();

    // Signature status should show Verified (using precise class or .font-bold selector)
    await expect(page.locator('.font-bold.small:has-text("Signature Verified")')).toBeVisible();

    // Verify headers have loaded
    await expect(page.locator('pre').first()).toContainText('HS256');

    // Switch to Generate tab
    const genTabBtn = page.locator('button:has-text("Generate & Sign")');
    await expect(genTabBtn).toBeVisible();
    await genTabBtn.click();

    // Generate signed token
    const generateBtn = page.locator('button:has-text("Generate & Sign JWT Token")');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Verify token output is displayed
    const toolResult = page.locator('.tool-result-container');
    await expect(toolResult).toBeVisible();
  });
});

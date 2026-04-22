const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Find and click the Sunlight Graph tool
    // It's in the System category. Let's search for it to be sure.
    await page.type('#search', 'Sunlight');
    await page.waitForTimeout(1000);

    const toolCard = page.locator('text=Sunlight Graph');
    await toolCard.click();

    // Wait for the tool to render
    await page.waitForSelector('text=Sunlight Intensity');
    await page.waitForTimeout(2000); // Wait for potential graph animation

    await page.screenshot({ path: 'sunlight_detail.png' });
    console.log('Screenshot saved as sunlight_detail.png');

    // Also check System Thermal
    await page.click('button:has-text("Back")'); // Assuming there is a back button or just search again
    await page.fill('#search', '');
    await page.type('#search', 'Thermal');
    await page.waitForTimeout(1000);
    await page.click('text=System Thermal');
    await page.waitForSelector('text=Thermal Status');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'thermal_detail.png' });
    console.log('Screenshot saved as thermal_detail.png');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
})();

import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        device = p.devices['iPhone 12']
        browser = await p.chromium.launch()
        context = await browser.new_context(**device)
        page = await context.new_page()

        await page.goto('http://localhost:5173')
        await page.wait_for_selector('.app-layout')

        # Take a screenshot of the bottom part
        await page.screenshot(path='screenshots/tabbar_mobile.png')

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

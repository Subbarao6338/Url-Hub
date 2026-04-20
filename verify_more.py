import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            await page.goto('http://localhost:5173', wait_until='networkidle', timeout=30000)
            print("Page loaded")

            # Games - Spin the Wheel (ID is spin-wheel)
            await page.click('id=card-spin-wheel')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/home/jules/verification/screenshots/games_tool.png')
            print("Games tool screenshot taken")

            await page.click('button.btn-light:has-text("Back"), .material-icons:has-text("arrow_back")')
            await page.wait_for_timeout(500)

            # Math - Pythagoras
            await page.click('id=card-pythagoras')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/home/jules/verification/screenshots/math_tool.png')
            print("Math tool screenshot taken")

            await page.click('button.btn-light:has-text("Back"), .material-icons:has-text("arrow_back")')
            await page.wait_for_timeout(500)

            # PDF - Merge
            await page.click('id=card-pdf-merge')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/home/jules/verification/screenshots/pdf_tool.png')
            print("PDF tool screenshot taken")

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path='/home/jules/verification/screenshots/error_more.png')

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

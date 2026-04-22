import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        # Start the dev server
        import subprocess
        import time
        import os

        server = subprocess.Popen(["npm", "run", "dev", "--", "--port", "5173"])
        time.sleep(5) # Wait for server to start

        try:
            await page.goto("http://localhost:5173/?tab=toolbox")
            await page.wait_for_selector(".card-title")

            # Find and click Sunlight Graph
            cards = await page.query_selector_all(".card")
            for card in cards:
                title = await card.query_selector(".card-title")
                if title and "Sunlight" in await title.inner_text():
                    await card.click()
                    break

            await asyncio.sleep(2)
            await page.screenshot(path="verification/screenshots/sunlight_refactored.png")
            print("Screenshot saved to verification/screenshots/sunlight_refactored.png")

        finally:
            server.terminate()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())

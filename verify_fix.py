import asyncio
from playwright.async_api import async_playwright
import os
import subprocess
import time

async def verify():
    # Start the server
    server = subprocess.Popen(["python3", "-m", "http.server", "8000"])
    time.sleep(2) # Wait for server to start

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # 1. Check if dashboard loads (verifies renderIcon exists)
            print("Checking if dashboard loads...")
            await page.goto("http://localhost:8000")
            await page.wait_for_selector(".card")
            print("Dashboard loaded successfully.")

            # 2. Open Toolbox -> Panchangam
            print("Opening Telugu Panchangam...")
            await page.click("text=Telugu Panchangam")
            await page.wait_for_selector("#pan-date")

            # 3. Test known date: Aug 15, 1947 (Friday)
            print("Testing date: 1947-08-15...")
            await page.fill("#pan-date", "1947-08-15")
            await page.fill("#pan-time", "00:01")
            await page.fill("#pan-tz", "5.5")
            await page.click("text=Calculate Details")

            await page.wait_for_selector(".result-card")
            vara_text = await page.inner_text(".result-item:has-text('Vara:') .val")
            print(f"Vara for 1947-08-15: {vara_text}")

            if "Friday" in vara_text:
                print("SUCCESS: Vara is correct (Friday).")
            else:
                print(f"FAILURE: Vara should be Friday, but got {vara_text}")

            # 4. Test Jan 1, 2000 (Saturday)
            print("Testing date: 2000-01-01...")
            await page.fill("#pan-date", "2000-01-01")
            await page.click("text=Calculate Details")

            await page.wait_for_timeout(500)
            vara_text_2000 = await page.inner_text(".result-item:has-text('Vara:') .val")
            print(f"Vara for 2000-01-01: {vara_text_2000}")

            if "Saturday" in vara_text_2000:
                print("SUCCESS: Vara is correct (Saturday).")
            else:
                print(f"FAILURE: Vara should be Saturday, but got {vara_text_2000}")

            await page.screenshot(path="verification_fix.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="verification_error.png")
        finally:
            await browser.close()
            server.terminate()

if __name__ == "__main__":
    asyncio.run(verify())

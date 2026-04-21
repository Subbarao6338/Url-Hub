import asyncio
from playwright.async_api import async_playwright
import os

async def verify_mobile_ui():
    async with async_playwright() as p:
        # Use iPhone 12 as a mobile device
        device = p.devices['iPhone 12']
        browser = await p.chromium.launch()
        context = await browser.new_context(**device)
        page = await context.new_page()

        # Start the app
        # Note: App should be running on 5173
        try:
            await page.goto('http://localhost:5173', timeout=10000)
        except Exception as e:
            print(f"Error navigating to app: {e}")
            await browser.close()
            return

        # 1. Verify TabBar visibility (Mobile)
        # Search and Settings should be visible in TabBar on mobile
        search_tab = page.locator('#tab-search')
        settings_tab = page.get_by_title('Settings', exact=True).nth(1) # Might be two if desktop/mobile classes aren't perfect yet

        await expect_visible(search_tab, "Search Tab")

        # 2. Test Mobile Search Overlay
        print("Clicking search tab...")
        await search_tab.click()

        # Overlay should be visible
        overlay = page.locator('.search-overlay')
        await expect_visible(overlay, "Search Overlay")

        # Input should be focused (manually check in screenshot or focus state)
        search_input = overlay.locator('input[type="search"]')
        await expect_visible(search_input, "Search Input")

        await page.screenshot(path='screenshots/mobile_search_overlay.png')

        # 3. Test Back button in Search Overlay
        back_button = overlay.locator('.material-icons:has-text("arrow_back")')
        await back_button.click()

        # Overlay should be gone
        await expect_hidden(overlay, "Search Overlay after back")

        # 4. Verify Desktop-only elements are hidden
        desktop_search = page.locator('.desktop-search') # This was the old one, check if it's hidden
        # Actually check .search-container which should be .desktop-only
        search_container = page.locator('.search-container')
        await expect_hidden(search_container, "Desktop Search Container")

        await browser.close()
        print("Mobile UI verification complete.")

async def expect_visible(locator, name):
    if await locator.is_visible():
        print(f"✓ {name} is visible")
    else:
        print(f"✗ {name} is NOT visible")

async def expect_hidden(locator, name):
    if not await locator.is_visible():
        print(f"✓ {name} is hidden")
    else:
        print(f"✗ {name} is NOT hidden")

if __name__ == "__main__":
    if not os.path.exists('screenshots'):
        os.makedirs('screenshots')
    asyncio.run(verify_mobile_ui())

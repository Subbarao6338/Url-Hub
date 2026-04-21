from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(5000)
    page.screenshot(path="/home/jules/verification/screenshots/home_nature_final.png")

    search_input = page.get_by_placeholder("Search Toolbox...")
    search_input.fill("network")
    page.wait_for_timeout(2000)

    page.get_by_text("Network Analyzer", exact=True).first.click()
    page.wait_for_timeout(3000)
    page.screenshot(path="/home/jules/verification/screenshots/network_tool_final.png")

    # Use click by text for simpler matching
    page.get_by_text("RUN PING").click()
    page.wait_for_timeout(5000)
    page.screenshot(path="/home/jules/verification/screenshots/ping_result_final.png")

    page.get_by_title("Back to Toolbox").click()
    page.wait_for_timeout(1000)
    search_input.fill("")
    page.wait_for_timeout(1000)

    page.get_by_text("Unit Converter", exact=True).first.click()
    page.wait_for_timeout(2000)
    page.get_by_text("Speed").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/unit_converter_speed.png")

    page.get_by_title("Back to Toolbox").click()
    page.wait_for_timeout(1000)
    page.get_by_text("Device Info", exact=True).first.click()
    page.wait_for_timeout(3000)
    page.screenshot(path="/home/jules/verification/screenshots/device_info_final.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

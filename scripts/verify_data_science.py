import os

from playwright.sync_api import sync_playwright


def run_cuj(page):
    # Navigate to app
    print("Navigating to local development server...")
    page.goto("http://localhost:5173")
    page.wait_for_timeout(1000)

    # Click on the Data Viewer tool card
    print("Clicking on 'Data Viewer' card...")
    page.locator('.card', has_text='Data Viewer').click()
    page.wait_for_timeout(1000)

    # Click Load Sample Employee Dataset
    print("Clicking 'Load Sample Employee Dataset'...")
    page.locator('button:has-text("Load Sample Employee Dataset")').click()
    page.wait_for_timeout(1000)

    # Take intermediate screenshot of the loaded dataset
    print("Taking intermediate screenshot of loaded dataset...")
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    page.screenshot(path="/home/jules/verification/screenshots/loaded_dataset.png")

    # Go back to Hub
    print("Clicking 'Back to Hub'...")
    page.locator('button:has-text("Back to Hub")').click()
    page.wait_for_timeout(1000)

    # Open Advanced Hub
    print("Clicking 'Advanced Hub' card...")
    page.locator('.card', has_text='Advanced Hub').click()
    page.wait_for_timeout(1000)

    # Run Multivariate Anomaly detection
    print("Clicking 'Multivariate Anomaly'...")
    page.locator('button:has-text("Multivariate Anomaly")').click()
    page.wait_for_timeout(1500)

    # Take final screenshot of the detected anomaly results
    print("Taking final screenshot of detected anomaly results...")
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    with sync_playwright() as p:
        print("Launching Chromium...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"ERROR: {e}")
        finally:
            context.close()
            browser.close()
            print("Done verification run.")

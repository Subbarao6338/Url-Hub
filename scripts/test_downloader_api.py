import requests
import sys
import time

def run_test_download(url, format_id=None):
    print(f"Testing download for: {url} (format_id={format_id})")
    params = {
        "url": url
    }
    if format_id:
        params["format_id"] = format_id

    try:
        response = requests.get("http://localhost:8000/api/social/download", params=params)
        if response.status_code == 200:
            print(f"SUCCESS: Downloaded info {response.json()}")
            return True
        else:
            print(f"FAILED: Status {response.status_code}, Detail: {response.text}")
            return False
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def test_downloader_api():
    # Helper to be picked up by pytest or run directly
    # Wait for server to be ready
    for i in range(5):
        try:
            requests.get("http://localhost:8000/api/health")
            print("Server is up!")
            break
        except Exception:
            print("Waiting for server...")
            time.sleep(2)

    # Test cases
    # 1. YouTube video
    res1 = run_test_download("https://www.youtube.com/shorts/I6m6GCHXkTo")
    # 2. Custom format
    res2 = run_test_download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", format_id="best")

if __name__ == "__main__":
    test_downloader_api()

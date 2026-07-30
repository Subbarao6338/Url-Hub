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

    # 3. SSRF validation checks (loopback, private and invalid inputs)
    print("Testing SSRF protection with loopback IP...")
    ssrf_res1 = requests.get("http://localhost:8000/api/social/download?url=http://127.0.0.1/")
    assert ssrf_res1.status_code == 400, f"Expected 400 for loopback IP, got {ssrf_res1.status_code}"
    assert "restricted" in ssrf_res1.text or "Restricted" in ssrf_res1.text or "validation" in ssrf_res1.text or "ssrf" in ssrf_res1.text.lower()
    print("SUCCESS: Loopback IP SSRF blocked!")

    print("Testing SSRF protection with local hostname...")
    ssrf_res2 = requests.get("http://localhost:8000/api/social/download?url=http://localhost:8000/api/health")
    assert ssrf_res2.status_code == 400, f"Expected 400 for localhost, got {ssrf_res2.status_code}"
    print("SUCCESS: Local hostname SSRF blocked!")

    print("Testing SSRF protection for /info endpoint...")
    info_ssrf = requests.get("http://localhost:8000/api/social/info?url=http://192.168.1.1/")
    assert info_ssrf.status_code == 400, f"Expected 400 for private IP on /info, got {info_ssrf.status_code}"
    print("SUCCESS: /info SSRF blocked!")

    print("Testing SSRF protection for /summarize endpoint...")
    sum_ssrf = requests.get("http://localhost:8000/api/social/summarize?url=http://10.0.0.1/")
    assert sum_ssrf.status_code == 200, f"Expected 200 wrapper with error message for /summarize, got {sum_ssrf.status_code}"
    assert sum_ssrf.json().get("success") is False
    print("SUCCESS: /summarize SSRF blocked!")

if __name__ == "__main__":
    test_downloader_api()

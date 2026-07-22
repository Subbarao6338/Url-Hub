import requests
import os

def test_translation():
    url = "http://localhost:8000/api/doc-adv/translate"

    # Create a dummy text file
    with open("test.txt", "w") as f:
        f.write("Hello world. This is a test.")

    try:
        # Read content from the file to translate
        with open("test.txt", "r") as f:
            text_content = f.read()

        payload = {
            "text": text_content,
            "target_lang": "te",
            "source_lang": "en"
        }
        response = requests.post(url, json=payload)

        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            translated = response.json().get('translated_text')
            print(f"Response: {translated}")
            assert translated is not None
        else:
            print(f"Error: {response.text}")
            assert False, f"Request failed: {response.text}"
    finally:
        if os.path.exists("test.txt"):
            os.remove("test.txt")

if __name__ == "__main__":
    print("Testing translation endpoint...")
    test_translation()

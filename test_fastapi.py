import requests

def test_fastapi():
    print("Testing FastAPI server...")
    try:
        response = requests.get("http://127.0.0.1:8000/health")
        print(f"Status Code: {response.status_code}")
        print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        print("Make sure the FastAPI server is running with 'uvicorn app.main:app --reload'")

if __name__ == "__main__":
    test_fastapi()

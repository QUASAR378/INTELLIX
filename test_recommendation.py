import requests
import json

# Test data for the recommendation API
test_data = {
    "county_name": "Nairobi",
    "population": 5000000,
    "hospitals": 50,
    "schools": 300,
    "blackout_freq": 25.5,
    "economic_activity": 75.0,
    "grid_distance": 15.2,
    "current_kwh": 1000000,
    "solar_irradiance": 5.8,
    "avg_wind_speed": 4.2,
    "land_availability": 10.5,
    "population_density": 4800
}

def test_recommendation():
    print("Testing recommendation API...")
    try:
        # Test with AI model first
        print("\n1. Testing with AI model:")
        response = requests.post(
            "http://localhost:8000/api/recommendations",
            json=test_data,
            params={"use_ai": True}
        )
        print(f"Status Code: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
        
        # Test with rule-based fallback
        print("\n2. Testing with rule-based fallback:")
        response = requests.post(
            "http://localhost:8000/api/recommendations",
            json=test_data,
            params={"use_ai": False}
        )
        print(f"Status Code: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
        
        # Test health endpoint
        print("\n3. Testing health endpoint:")
        response = requests.get("http://localhost:8000/api/recommendations/health")
        print(f"Status Code: {response.status_code}")
        print("Health Status:", json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")

if __name__ == "__main__":
    test_recommendation()

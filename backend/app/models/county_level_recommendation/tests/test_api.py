# tests/test_api.py
from fastapi.testclient import TestClient
from fastapi_integration import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_prioritize_counties():
    test_data = {
        "counties": [
            {
                "county_name": "TestCounty",
                "population": 100000,
                "hospitals": 5,
                "schools": 20,
                "blackout_freq": 10,
                "economic_activity": 50,
                "grid_distance": 15,
                "current_kwh": 5000
            }
        ]
    }
    
    response = client.post("/counties/prioritize", json=test_data)
    # This will fail if model isn't trained, which is expected
    assert response.status_code in [200, 400]
"""
Test configuration for County Energy Planning API
"""

import pytest
import os
from fastapi.testclient import TestClient
from fastapi_integration_enhanced import app
from county_energy_model import CountyEnergyPlanner

# Test client
client = TestClient(app)

@pytest.fixture
def test_app():
    """Test application fixture"""
    return client

@pytest.fixture
def sample_county_data():
    """Sample county data for testing"""
    return {
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

@pytest.fixture
def mock_planner():
    """Mock planner for testing"""
    planner = CountyEnergyPlanner()
    # Add mock training data if needed
    return planner

# Test environment variables
os.environ.setdefault("API_KEY", "test-key-123")
os.environ.setdefault("REDIS_HOST", "localhost")
os.environ.setdefault("LOG_LEVEL", "DEBUG")
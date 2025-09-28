# tests/test_model.py
import pytest
import pandas as pd
from county_energy_model import CountyEnergyPlanner

@pytest.fixture
def sample_data():
    return pd.DataFrame({
        'county_name': ['County1', 'County2'],
        'population': [100000, 200000],
        'hospitals': [5, 10],
        'schools': [20, 40],
        'blackout_freq': [10, 5],
        'economic_activity': [50, 75],
        'grid_distance': [15, 5],
        'current_kwh': [5000, 15000]
    })

def test_model_initialization():
    planner = CountyEnergyPlanner()
    assert planner.model_version == "1.0.0"
    assert not planner.is_trained

def test_data_validation(sample_data):
    planner = CountyEnergyPlanner()
    is_valid, errors = planner.validate_input_data(sample_data)
    assert is_valid
    assert len(errors) == 0

def test_model_training(sample_data):
    planner = CountyEnergyPlanner()
    metrics = planner.train_model(sample_data)
    assert 'test_r2' in metrics
    assert planner.is_trained
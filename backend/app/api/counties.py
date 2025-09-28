from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.county import County, CountyResponse

router = APIRouter()

@router.get("/", response_model=List[CountyResponse])
async def get_counties():
    """Get all counties with energy data"""
    # Mock data for demonstration
    return [
        {
            "county_id": "nairobi",
            "county_name": "Nairobi",
            "centroid": [-1.286389, 36.817223],
            "population": 4397073,
            "current_kwh": 15000,
            "blackout_freq": 2,
            "solar_irradiance": 5.5,
            "hospitals": 125,
            "schools": 850,
            "economic_activity_index": 0.95,
            "grid_distance": 0.0,
            "priority_score": 0.85,
            "recommended_solution": "grid_extension",
            "estimated_cost_kes": 500000000,
            "expected_impact": {"households": 50000, "businesses": 15000}
        },
        {
            "county_id": "turkana",
            "county_name": "Turkana",
            "centroid": [3.119, 35.565],
            "population": 926976,
            "current_kwh": 500,
            "blackout_freq": 15,
            "solar_irradiance": 6.8,
            "hospitals": 15,
            "schools": 180,
            "economic_activity_index": 0.25,
            "grid_distance": 350.0,
            "priority_score": 0.95,
            "recommended_solution": "solar_mini_grid",
            "estimated_cost_kes": 75000000,
            "expected_impact": {"households": 12000, "businesses": 800}
        }
    ]

@router.get("/{county_id}", response_model=CountyResponse)
async def get_county(county_id: str):
    """Get specific county data with integrated demographics and energy metrics"""
    # Enhanced county data with more realistic information
    counties_db = {
        "turkana": {
            "county_id": "turkana",
            "county_name": "Turkana",
            "centroid": [3.311, 35.600],
            "population": 926976,
            "current_kwh": 25000000,
            "blackout_freq": 60,
            "solar_irradiance": 6.8,
            "hospitals": 15,
            "schools": 210,
            "economic_activity_index": 0.35,
            "grid_distance": 45.0,
            "priority_score": 0.95,
            "recommended_solution": "solar_minigrid",
            "estimated_cost_kes": 75000000,
            "expected_impact": {"households": 12000, "businesses": 800}
        },
        "nairobi": {
            "county_id": "nairobi",
            "county_name": "Nairobi",
            "centroid": [-1.286389, 36.817223],
            "population": 4397073,
            "current_kwh": 200000000,
            "blackout_freq": 30,
            "solar_irradiance": 4.2,
            "hospitals": 95,
            "schools": 820,
            "economic_activity_index": 0.95,
            "grid_distance": 2.0,
            "priority_score": 0.12,
            "recommended_solution": "grid_optimization",
            "estimated_cost_kes": 500000000,
            "expected_impact": {"households": 50000, "businesses": 15000}
        },
        "marsabit": {
            "county_id": "marsabit",
            "county_name": "Marsabit",
            "centroid": [2.3364, 37.9900],
            "population": 459785,
            "current_kwh": 15000000,
            "blackout_freq": 65,
            "solar_irradiance": 7.2,
            "hospitals": 12,
            "schools": 180,
            "economic_activity_index": 0.30,
            "grid_distance": 35.0,
            "priority_score": 0.92,
            "recommended_solution": "solar_minigrid",
            "estimated_cost_kes": 45000000,
            "expected_impact": {"households": 9500, "businesses": 600}
        }
    }
    
    # Return specific county data or default
    county_data = counties_db.get(county_id.lower(), {
        "county_id": county_id,
        "county_name": county_id.capitalize(),
        "centroid": [0.0236, 37.9062],
        "population": 500000,
        "current_kwh": 10000000,
        "blackout_freq": 40,
        "solar_irradiance": 5.5,
        "hospitals": 20,
        "schools": 150,
        "economic_activity_index": 0.5,
        "grid_distance": 25.0,
        "priority_score": 0.65,
        "recommended_solution": "hybrid_solution",
        "estimated_cost_kes": 35000000,
        "expected_impact": {"households": 8000, "businesses": 500}
    })
    
    return county_data

@router.get("/{county_id}/energy-metrics")
async def get_county_energy_metrics(county_id: str):
    """Get energy metrics for a specific county"""
    return {"county_id": county_id, "metrics": {}}

@router.get("/map/data")
async def get_map_data():
    """Get map data for Kenya counties"""
    return [
        {
            "id": "turkana",
            "name": "Turkana",
            "coordinates": [3.5, 35.5],
            "priorityScore": 98,
            "deficitLevel": "high",
            "solutionType": "solar_minigrid",
            "investment": 2500000
        },
        {
            "id": "nairobi",
            "name": "Nairobi", 
            "coordinates": [-1.2921, 36.8219],
            "priorityScore": 45,
            "deficitLevel": "low",
            "solutionType": "grid_optimization",
            "investment": 15000000
        },
        {
            "id": "marsabit",
            "name": "Marsabit",
            "coordinates": [2.3, 37.9],
            "priorityScore": 94,
            "deficitLevel": "high",
            "solutionType": "solar_minigrid",
            "investment": 1800000
        },
        {
            "id": "kisumu",
            "name": "Kisumu",
            "coordinates": [-0.0917, 34.7680],
            "priorityScore": 72,
            "deficitLevel": "medium",
            "solutionType": "hybrid_solution",
            "investment": 3200000
        },
        {
            "id": "mombasa",
            "name": "Mombasa",
            "coordinates": [-4.0435, 39.6682],
            "priorityScore": 65,
            "deficitLevel": "medium",
            "solutionType": "grid_extension",
            "investment": 4500000
        },
        {
            "id": "mandera",
            "name": "Mandera",
            "coordinates": [3.9366, 41.8670],
            "priorityScore": 91,
            "deficitLevel": "high",
            "solutionType": "solar_minigrid",
            "investment": 1200000
        },
        {
            "id": "west_pokot",
            "name": "West Pokot",
            "coordinates": [1.4167, 35.2167],
            "priorityScore": 87,
            "deficitLevel": "high",
            "solutionType": "hybrid_solution",
            "investment": 1600000
        },
        {
            "id": "samburu",
            "name": "Samburu",
            "coordinates": [1.2167, 36.8],
            "priorityScore": 84,
            "deficitLevel": "high",
            "solutionType": "solar_minigrid",
            "investment": 1400000
        },
        {
            "id": "nakuru",
            "name": "Nakuru",
            "coordinates": [-0.3031, 36.0800],
            "priorityScore": 58,
            "deficitLevel": "medium",
            "solutionType": "grid_extension",
            "investment": 6800000
        },
        {
            "id": "kilifi",
            "name": "Kilifi",
            "coordinates": [-3.6309, 39.8951],
            "priorityScore": 76,
            "deficitLevel": "medium",
            "solutionType": "hybrid_solution",
            "investment": 2800000
        }
    ]
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.county import County, CountyResponse
from app.services.data_service import DataService

router = APIRouter()
data_service = DataService()

@router.get("/", response_model=List[CountyResponse])
async def get_counties():
    """Get all counties with real Kenya energy data"""
    counties = await data_service.load_counties()
    return [county.dict() for county in counties]

@router.get("/{county_id}", response_model=CountyResponse)
async def get_county(county_id: str):
    """Get specific county data with real Kenya energy data"""
    counties = await data_service.load_counties()
    
    # Find the county by name (case-insensitive)
    for county in counties:
        if county.county_name.lower() == county_id.lower().replace("_", " "):
            return county.dict()
    
    # If not found, raise 404
    raise HTTPException(status_code=404, detail=f"County {county_id} not found")

@router.get("/{county_id}/energy-metrics")
async def get_county_energy_metrics(county_id: str):
    """Get energy metrics for a specific county"""
    return {"county_id": county_id, "metrics": {}}

@router.get("/map/data")
async def get_map_data():
    """Get map data for Kenya counties using real data"""
    counties = await data_service.load_counties()
    
    map_data = []
    for county in counties:
        # Determine deficit level based on priority score
        priority_score = county.priority_score
        if priority_score > 400:
            deficit_level = "high"
        elif priority_score > 200:
            deficit_level = "medium"
        else:
            deficit_level = "low"
        
        # Determine solution type based on energy access score
        if county.energy_access_score < 30:
            solution_type = "solar_minigrid"
        elif county.energy_access_score < 70:
            solution_type = "hybrid_solution"
        else:
            solution_type = "grid_extension"
        
        # Estimate cost based on population and energy access
        estimated_cost = county.population * (8000 if county.energy_access_score < 50 else 5000)
        
        map_data.append({
            "id": county.county_name.lower().replace(" ", "_").replace("'", ""),
            "name": county.county_name,
            "coordinates": [county.longitude or 36.8, county.latitude or -1.3],  # Default to Kenya center if no coords
            "priorityScore": int(priority_score),
            "deficitLevel": deficit_level,
            "solutionType": solution_type,
            "investment": estimated_cost,
            "population": county.population,
            "energyAccess": county.energy_access_score,
            "solarPotential": county.avg_solar_irradiance,
            "reliabilityScore": county.avg_reliability_score
        })
    
    return map_data
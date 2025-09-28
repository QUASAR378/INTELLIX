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
    
    # Find the county by ID or name
    for county in counties:
        if (county.county_id.lower() == county_id.lower() or 
            county.county_name.lower() == county_id.lower()):
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
        priority_score = county.priority_score * 100  # Convert back to 0-100
        if priority_score > 80:
            deficit_level = "high"
        elif priority_score > 50:
            deficit_level = "medium"
        else:
            deficit_level = "low"
        
        map_data.append({
            "id": county.county_id.lower(),
            "name": county.county_name,
            "coordinates": [county.centroid[0], county.centroid[1]],
            "priorityScore": int(priority_score),
            "deficitLevel": deficit_level,
            "solutionType": county.recommended_solution,
            "investment": county.estimated_cost_kes
        })
    
    return map_data
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import logging
from app.services.data_service import DataService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize data service
data_service = DataService()

@router.get("/counties/search")
async def search_counties(q: str = ""):
    """
    Search for counties by name for autocomplete functionality.
    Returns a list of county names that match the query.
    """
    try:
        counties = await data_service.load_counties()
        if not q:
            # Return all county names if no query
            return {"counties": [county.county_name for county in counties]}
        
        # Filter counties by query (case-insensitive)
        query_lower = q.lower()
        matching_counties = [
            county.county_name for county in counties 
            if query_lower in county.county_name.lower()
        ]
        
        return {"counties": matching_counties}
    except Exception as e:
        logger.error(f"Error searching counties: {e}")
        raise HTTPException(status_code=500, detail="Failed to search counties")

@router.get("/counties/{county_name}/data")
async def get_county_data(county_name: str):
    """
    Get county data for auto-filling the recommendation form.
    Returns county information that can be used to populate form fields.
    """
    try:
        counties = await data_service.load_counties()
        
        # Find the county by name (case-insensitive)
        county = None
        for c in counties:
            if c.county_name.lower() == county_name.lower():
                county = c
                break
        
        if not county:
            raise HTTPException(status_code=404, detail=f"County '{county_name}' not found")
        
        # Calculate estimated values for form fields
        # Blackout frequency based on reliability score (inverse relationship)
        blackout_freq = max(0, (100 - county.avg_reliability_score) / 10)
        
        # Economic activity based on energy access and population density
        economic_activity = min(100, county.energy_access_score * 0.8 + (county.population / 50000) * 20)
        
        # Grid distance estimation based on energy access (higher access = closer to grid)
        grid_distance = max(0.5, (100 - county.energy_access_score) / 5)
        
        # Current kWh estimation based on population and energy access
        current_kwh = county.population * county.energy_access_score * 0.1
        
        return {
            "county_name": county.county_name,
            "population": county.population,
            "hospitals": county.hospitals,
            "schools": county.schools,
            "blackout_freq": round(blackout_freq, 1),
            "economic_activity": round(economic_activity, 1),
            "grid_distance": round(grid_distance, 1),
            "current_kwh": round(current_kwh, 1),
            "solar_irradiance": county.avg_solar_irradiance,
            "energy_access_score": county.energy_access_score,
            "reliability_score": county.avg_reliability_score,
            "renewable_potential_score": county.renewable_potential_score,
            "priority_score": county.priority_score
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting county data: {e}")
        raise HTTPException(status_code=500, detail="Failed to get county data")

@router.get("/model/info")
async def get_model_info():
    """
    Get model information for the recommendations system.
    """
    return {
        "version": "1.0.0",
        "timestamp": "2025-09-29T00:00:00Z",
        "description": "Kenya County Energy Recommendation System",
        "data_source": "Real Kenya County Energy Data",
        "counties_available": 47
    }

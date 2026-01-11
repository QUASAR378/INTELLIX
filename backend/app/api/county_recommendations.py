from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import logging
from app.services.data_service import DataService
from app.utils.recommendation_engine import RuleBasedEngine

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize data service and recommendation engine
data_service = DataService()
rule_engine = RuleBasedEngine()

class CountyData(BaseModel):
    county_name: str = Field(..., description="Name of the county")
    population: int = Field(..., gt=0, description="Population count")
    hospitals: int = Field(0, ge=0, description="Number of healthcare facilities")
    schools: int = Field(0, ge=0, description="Number of educational institutions")
    blackout_freq: float = Field(0.0, ge=0, le=100, description="Frequency of blackouts (0-100)")
    economic_activity: float = Field(0.0, ge=0, le=100, description="Economic activity index (0-100)")
    grid_distance: float = Field(0.0, ge=0, description="Distance to nearest grid (km)")
    current_kwh: float = Field(0.0, ge=0, description="Current energy consumption in kWh")
    solar_irradiance: Optional[float] = Field(None, ge=0, description="Solar irradiance (kWh/m²/day)")
    avg_wind_speed: Optional[float] = Field(None, ge=0, description="Average wind speed (m/s)")
    land_availability: Optional[float] = Field(None, ge=0, description="Available land (km²)")
    population_density: Optional[float] = Field(None, ge=0, description="Population density (people/km²)")

@router.post("/")
async def get_recommendations(county_data: CountyData):
    """
    Get energy recommendations for a county using rule-based engine.
    """
    try:
        input_data = county_data.dict()
        raw_result = rule_engine.get_recommendation(input_data)
        
        # Transform to match frontend format
        result = {
            "priority_score": raw_result.get('confidence', 0.7) * 10,  # Scale to 0-10
            "recommended_solutions": [
                raw_result.get('solution', 'grid_extension').replace('_', ' ').title(),
                raw_result.get('reason', 'Standard recommendation')
            ],
            "estimated_costs": {
                "total_implementation": raw_result.get('estimated_cost', 1800000),
                "maintenance_annual": raw_result.get('estimated_cost', 1800000) * 0.05
            },
            "timeline": [
                "Phase 1: Planning and Design (3-6 months)",
                "Phase 2: Infrastructure Development (12-18 months)",
                "Phase 3: Testing and Commissioning (2-3 months)",
                f"Expected ROI: {raw_result.get('roi_years', 7)} years"
            ],
            "confidence": raw_result.get('confidence', 0.7),
            "source": "rule_engine"
        }
        
        logger.info(f"Generated recommendations for {county_data.county_name}")
        
        return {
            "status": "success",
            "data": result,
            "source": "rule_engine"
        }
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

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

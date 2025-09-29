from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import sys
import os
import json
from datetime import datetime, timedelta
from functools import lru_cache
import logging

# Import models and utilities
from app.models.county_energy_model import EnergyPlanner
from app.utils.recommendation_engine import RuleBasedEngine
from app.services.data_service import DataService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize engines and services
planner = EnergyPlanner()
rule_engine = RuleBasedEngine()
data_service = DataService()

# In-memory cache for recommendations
recommendation_cache = {}
CACHE_TTL = timedelta(hours=24)

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

def get_cache_key(county_data: Dict) -> str:
    """Generate a cache key from county data."""
    return f"{county_data['county_name']}_{county_data['population']}_{county_data['current_kwh']}"

@router.post("/recommendations")
async def get_recommendations(
    county_data: CountyData,
    request: Request,
    use_ai: bool = True,
    force_refresh: bool = False
):
    """
    Get energy recommendations for a county with fallback to rule-based engine.
    
    Args:
        county_data: County data for recommendation
        use_ai: Whether to try AI model first (default: True)
        force_refresh: Force refresh cached results (default: False)
    """
    try:
        input_data = county_data.dict()
        cache_key = get_cache_key(input_data)
        
        # Check cache first
        if not force_refresh and cache_key in recommendation_cache:
            cached = recommendation_cache[cache_key]
            if datetime.now() - cached['timestamp'] < CACHE_TTL:
                logger.info(f"Returning cached result for {county_data.county_name}")
                return {
                    "status": "success",
                    "data": cached['data'],
                    "source": "cache"
                }
        
        result = None
        source = "rule_engine"
        
        # Try AI model first if enabled
        if use_ai:
            try:
                result = planner.get_recommendations(input_data)
                source = "ai_model"
                logger.info(f"AI recommendation generated for {county_data.county_name}")
            except Exception as ai_error:
                logger.warning(f"AI model failed: {str(ai_error)}. Falling back to rule engine.")
        
        # Fallback to rule engine if AI failed or not used
        if not result:
            result = rule_engine.get_recommendation(input_data)
            logger.info(f"Rule-based recommendation generated for {county_data.county_name}")
        
        # Cache the result
        recommendation_cache[cache_key] = {
            'data': result,
            'timestamp': datetime.now(),
            'source': source
        }
        
        return {
            "status": "success",
            "data": result,
            "source": source
        }
        
    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendation: {str(e)}"
        )

@router.get("/prioritize")
async def prioritize_counties():
    """
    Get prioritized list of counties
    """
    try:
        planner = recommendation_app.planner_instance
        
        if not planner:
            raise HTTPException(status_code=503, detail="Recommendation service not available")
            
        # Get prioritized counties
        result = planner.get_priority_counties()
        
        return {
            "status": "success",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/info")
async def get_model_info():
    """
    Get information about the recommendation model
    """
    try:
        return {
            "status": "success",
            "data": {
                "name": "County Energy Planner",
                "version": "1.0.0",
                "description": "AI model for recommending energy solutions at county level",
                "features": [
                    "population_analysis",
                    "infrastructure_assessment",
                    "energy_demand_prediction"
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """
    Health check endpoint with system status
    """
    try:
        # Basic health checks
        ai_healthy = False
        try:
            # Simple test prediction
            test_data = {
                'county_name': 'test',
                'population': 1000,
                'current_kwh': 5000
            }
            _ = rule_engine.get_recommendation(test_data)
            ai_healthy = True
        except Exception as e:
            logger.error(f"Health check failed for AI model: {str(e)}")
        
        # Get cache stats
        cache_size = len(recommendation_cache)
        cache_ratio = (cache_size / 1000) * 100 if cache_size > 0 else 0
        
        return {
            "status": "healthy" if ai_healthy else "degraded",
            "service": "recommendation-engine",
            "version": "1.1.0",
            "components": {
                "ai_model": "operational" if ai_healthy else "degraded",
                "rule_engine": "operational",
                "cache": {
                    "status": "operational",
                    "items": cache_size,
                    "utilization": f"{min(100, cache_ratio):.1f}%"
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

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

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

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize engines
planner = EnergyPlanner()
rule_engine = RuleBasedEngine()

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
        
        return {
            "status": "success",
            "data": model_info
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

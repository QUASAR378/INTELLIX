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
    
    # Kenya county coordinates (latitude, longitude)
    county_coords = {
        "Mombasa": [-4.0435, 39.6682], "Kwale": [-4.1842, 39.4516], "Kilifi": [-3.6310, 39.8499],
        "Tana River": [-1.5234, 39.8885], "Lamu": [-2.2717, 40.9020], "Taita-Taveta": [-3.3167, 38.4833],
        "Garissa": [-0.4569, 39.6582], "Wajir": [1.7471, 40.0630], "Mandera": [3.9366, 41.8670],
        "Marsabit": [2.3284, 37.9830], "Isiolo": [0.3556, 37.5843], "Meru": [0.0469, 37.6500],
        "Tharaka-Nithi": [-0.3720, 37.7290], "Embu": [-0.5310, 37.4570], "Kitui": [-1.3667, 38.0167],
        "Machakos": [-1.5177, 37.2634], "Makueni": [-2.4139, 37.8362], "Nyandarua": [-0.1781, 36.5208],
        "Nyeri": [-0.4197, 36.9475], "Kirinyaga": [-0.6599, 37.3827], "Murang'a": [-0.7833, 37.1500],
        "Kiambu": [-1.1714, 36.8356], "Turkana": [3.1167, 35.5986], "West Pokot": [1.6210, 35.3639],
        "Samburu": [1.2153, 36.9459], "Trans Nzoia": [1.0518, 34.9503], "Uasin Gishu": [0.5200, 35.2698],
        "Elgeyo-Marakwet": [0.8021, 35.4758], "Nandi": [0.1830, 35.1270], "Baringo": [0.4684, 36.0891],
        "Laikipia": [0.3629, 36.7819], "Nakuru": [-0.3031, 36.0800], "Narok": [-1.0833, 35.8711],
        "Kajiado": [-2.0982, 36.7820], "Kericho": [-0.3676, 35.2839], "Bomet": [-0.7895, 35.3089],
        "Kakamega": [0.2827, 34.7519], "Vihiga": [0.0806, 34.7057], "Bungoma": [0.5635, 34.5607],
        "Busia": [0.4601, 34.1115], "Siaya": [-0.0619, 34.2883], "Kisumu": [-0.0917, 34.7680],
        "Homa Bay": [-0.5270, 34.4570], "Migori": [-1.0634, 34.4731], "Kisii": [-0.6770, 34.7800],
        "Nyamira": [-0.5667, 34.9333], "Nairobi": [-1.2864, 36.8172]
    }
    
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
        
        # Get coordinates from mapping
        coords = county_coords.get(county.county_name, [-1.3, 36.8])  # Default to Nairobi if not found
        
        map_data.append({
            "id": county.county_name.lower().replace(" ", "_").replace("'", ""),
            "name": county.county_name,
            "coordinates": coords,  # [lat, lon] for Leaflet
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
from pydantic import BaseModel
from typing import Optional, Dict, Any

class County(BaseModel):
    county_id: str
    county_name: str
    centroid: list[float]
    population: int
    current_kwh: int
    blackout_freq: int
    solar_irradiance: float
    hospitals: int
    schools: int
    economic_activity_index: float
    grid_distance: float
    priority_score: float
    recommended_solution: str
    estimated_cost_kes: int
    expected_impact: Dict[str, Any]

class CountyResponse(County):
    pass

class CountyUpdate(BaseModel):
    priority_score: Optional[float] = None
    recommended_solution: Optional[str] = None
    estimated_cost_kes: Optional[int] = None
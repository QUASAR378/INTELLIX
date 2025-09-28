from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class MiniGrid(BaseModel):
    id: str
    name: str
    county_id: str
    capacity_kw: float
    current_generation: float
    status: str
    installation_date: str
    cost_kes: int

class MiniGridSimulation(BaseModel):
    county_id: str
    population: int
    current_demand: float
    solar_irradiance: float
    grid_distance: float
    simulation_duration: int = 365  # days

class SimulationResult(BaseModel):
    simulation_id: str
    county_id: str
    total_cost: float
    payback_period: int
    energy_generated: float
    co2_saved: float
    status: str
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CountyBase(BaseModel):
    county_name: str
    population: int
    hospitals: int
    schools: int
    poverty_index: float
    avg_solar_irradiance: float
    avg_reliability_score: float
    energy_access_score: float
    renewable_potential_score: float
    priority_score: float
    timestamp: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CountyCreate(CountyBase):
    pass

class County(CountyBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CountyUpdate(CountyBase):
    county_name: Optional[str] = None
    population: Optional[int] = None
    hospitals: Optional[int] = None
    schools: Optional[int] = None
    poverty_index: Optional[float] = None
    avg_solar_irradiance: Optional[float] = None
    avg_reliability_score: Optional[float] = None
    energy_access_score: Optional[float] = None
    renewable_potential_score: Optional[float] = None
    priority_score: Optional[float] = None

class CountyInDB(CountyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class CountyResponse(CountyBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CountyListResponse(BaseModel):
    count: int
    data: List[CountyResponse]

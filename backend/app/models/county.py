from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CountyBase(BaseModel):
    name: str
    population: int
    hospitals: int
    schools: int
    blackout_freq: float
    economic_activity: float
    grid_distance: float
    current_kwh: float
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CountyCreate(CountyBase):
    pass

class CountyUpdate(CountyBase):
    name: Optional[str] = None
    population: Optional[int] = None
    hospitals: Optional[int] = None
    schools: Optional[int] = None
    blackout_freq: Optional[float] = None
    economic_activity: Optional[float] = None
    grid_distance: Optional[float] = None
    current_kwh: Optional[float] = None

class CountyInDB(CountyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class CountyResponse(CountyInDB):
    pass

class CountyListResponse(BaseModel):
    count: int
    data: List[CountyResponse]

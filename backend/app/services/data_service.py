import json
import os
from typing import List, Dict, Any
from app.models.county import County

class DataService:
    def __init__(self, data_dir: str = "../data"):
        self.data_dir = data_dir
    
    async def load_counties(self) -> List[County]:
        """Load county data from JSON file"""
        try:
            file_path = os.path.join(self.data_dir, "dummy", "counties.json")
            with open(file_path, 'r') as f:
                data = json.load(f)
            return [County(**county) for county in data]
        except Exception as e:
            print(f"Error loading counties: {e}")
            return []
    
    async def get_county_by_id(self, county_id: str) -> County:
        """Get specific county by ID"""
        counties = await self.load_counties()
        for county in counties:
            if county.county_id == county_id:
                return county
        raise ValueError(f"County {county_id} not found")
    
    async def get_priority_counties(self, threshold: float = 0.7) -> List[County]:
        """Get counties with priority score above threshold"""
        counties = await self.load_counties()
        return [county for county in counties if county.priority_score >= threshold]
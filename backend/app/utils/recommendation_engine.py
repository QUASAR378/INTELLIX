from typing import Dict, Any
from datetime import datetime, timedelta
from functools import lru_cache
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class RuleBasedEngine:
    def __init__(self):
        self.rules = [
            self._solar_rule,
            self._wind_rule,
            self._hybrid_rule,
            self._grid_extension_rule,
        ]
    
    def _solar_rule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend solar if conditions are met."""
        if (data.get('solar_irradiance', 0) > 4.5 and 
            data.get('land_availability', 0) > 2 and
            data.get('population_density', 0) < 500):
            return {
                'solution': 'solar_farm',
                'confidence': 0.85,
                'reason': 'High solar potential with available land',
                'estimated_cost': 2500000,
                'roi_years': 5.2,
                'source': 'rule_engine'
            }
        return {}
    
    def _wind_rule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend wind if conditions are met."""
        if (data.get('avg_wind_speed', 0) > 5.5 and 
            data.get('land_availability', 0) > 5 and
            data.get('population_density', 0) < 200):
            return {
                'solution': 'wind_farm',
                'confidence': 0.78,
                'reason': 'Suitable wind conditions and land availability',
                'estimated_cost': 4500000,
                'roi_years': 6.8,
                'source': 'rule_engine'
            }
        return {}
    
    def _hybrid_rule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend hybrid solution if conditions are met."""
        if (data.get('solar_irradiance', 0) > 3.5 and 
            data.get('avg_wind_speed', 0) > 4.0 and
            data.get('energy_demand', 0) > 10000):
            return {
                'solution': 'hybrid_solar_wind',
                'confidence': 0.82,
                'reason': 'Good potential for hybrid renewable solution',
                'estimated_cost': 3500000,
                'roi_years': 5.8,
                'source': 'rule_engine'
            }
        return {}
    
    def _grid_extension_rule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Default to grid extension if no other rules match."""
        return {
            'solution': 'grid_extension',
            'confidence': 0.65,
            'reason': 'Standard grid extension recommended',
            'estimated_cost': 1800000,
            'roi_years': 7.5,
            'source': 'rule_engine'
        }
    
    def get_recommendation(self, county_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get recommendation using rule-based engine."""
        try:
            # Try each rule in order
            for rule in self.rules:
                result = rule(county_data)
                if result:
                    return result
            # Fallback to grid extension
            return self._grid_extension_rule(county_data)
        except Exception as e:
            logger.error(f"Error in rule engine: {str(e)}")
            raise HTTPException(status_code=500, detail="Error generating recommendation")

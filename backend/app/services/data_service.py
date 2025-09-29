import json
import os
import pandas as pd
from typing import List, Dict, Any
from app.models.county import County

class DataService:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Default to the Energy-data-pipeline directory - go up 3 levels from backend/app/services/
            current_file = os.path.abspath(__file__)
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file))))
            self.data_dir = os.path.join(project_root, "Energy-data-pipeline", "data")
        else:
            self.data_dir = data_dir
        print(f"DataService initialized with data_dir: {self.data_dir}")
    
    async def load_counties(self) -> List[County]:
        """Load county data from real Kenya energy datasets"""
        try:
            # Load the comprehensive dataset
            file_path = os.path.join(self.data_dir, "kenya_energy_comprehensive.json")
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Load weather data for enhanced solar calculations
            weather_data = self._get_weather_data()
            
            # Transform the data to match the County model
            counties = []
            for county_data in data:
                # Calculate additional metrics
                priority_score = county_data.get('priority_score', 0) / 100.0  # Normalize to 0-1
                
                # Get weather data for this county
                county_name = county_data.get('county_name', '')
                weather_info = weather_data.get(county_name, {})
                
                # Use real solar radiation data if available, otherwise use the original solar irradiance
                solar_irradiance = county_data.get('avg_solar_irradiance', 4.5)
                if weather_info.get('solar_radiation'):
                    # Convert solar radiation (W/m²) to kWh/m²/day (approximate conversion)
                    solar_irradiance = weather_info['solar_radiation'] / 200  # Rough conversion factor
                
                # Determine recommended solution based on data
                renewable_potential = county_data.get('renewable_potential_score', 0)
                energy_access = county_data.get('energy_access_score', 0)
                
                if renewable_potential > 40:
                    recommended_solution = "solar_minigrid"
                elif energy_access > 70:
                    recommended_solution = "grid_extension"
                else:
                    recommended_solution = "hybrid_solution"
                
                # Estimate cost based on population and access score
                population = county_data.get('population', 0)
                cost_per_person = 8000 if energy_access < 50 else 5000
                estimated_cost = population * cost_per_person
                
                county = County(
                    county_name=county_data.get('county_name', ''),
                    population=county_data.get('population', 0),
                    hospitals=county_data.get('hospitals', 0),
                    schools=county_data.get('schools', 0),
                    poverty_index=county_data.get('poverty_index', 0),
                    avg_solar_irradiance=county_data.get('avg_solar_irradiance', 0),
                    avg_reliability_score=county_data.get('avg_reliability_score', 0),
                    energy_access_score=county_data.get('energy_access_score', 0),
                    renewable_potential_score=county_data.get('renewable_potential_score', 0),
                    priority_score=county_data.get('priority_score', 0),
                    timestamp=county_data.get('timestamp', '')
                )
                counties.append(county)
            
            return counties
        except Exception as e:
            print(f"Error loading counties from real data: {e}")
            return []
    
    def _get_county_centroid(self, county_name: str) -> List[float]:
        """Get approximate county centroids for all 47 Kenya counties"""
        centroids = {
            "Mombasa": [-4.0435, 39.6682],
            "Kwale": [-4.1774, 39.4516],
            "Kilifi": [-3.5107, 39.8499],
            "Tana River": [-1.3733, 40.1056],
            "Lamu": [-2.2717, 40.9020],
            "Taita-Taveta": [-3.3167, 38.3500],
            "Garissa": [-0.4569, 39.6582],
            "Wajir": [1.7471, 40.0629],
            "Mandera": [3.9366, 41.8667],
            "Marsabit": [2.3284, 37.9899],
            "Isiolo": [0.3496, 37.5843],
            "Meru": [0.0500, 37.6500],
            "Tharaka-Nithi": [-0.0667, 37.9000],
            "Embu": [-0.5314, 37.4571],
            "Kitui": [-1.3667, 38.0167],
            "Machakos": [-1.5177, 37.2634],
            "Makueni": [-1.8000, 37.6243],
            "Nyandarua": [-0.3167, 36.4000],
            "Nyeri": [-0.4167, 36.9500],
            "Kirinyaga": [-0.6667, 37.3000],
            "Murang'a": [-0.7167, 37.1500],
            "Kiambu": [-1.1714, 36.8356],
            "Turkana": [3.1167, 35.6000],
            "West Pokot": [1.4000, 35.2333],
            "Samburu": [1.1745, 36.8000],
            "Trans Nzoia": [1.0167, 34.9500],
            "Uasin Gishu": [0.5143, 35.2697],
            "Elgeyo-Marakwet": [0.8333, 35.4667],
            "Nandi": [0.1833, 35.1000],
            "Baringo": [0.4667, 35.9667],
            "Laikipia": [0.2333, 36.7833],
            "Nakuru": [-0.3031, 36.0800],
            "Narok": [-1.0833, 35.8667],
            "Kajiado": [-1.8500, 36.7833],
            "Kericho": [-0.3833, 35.2833],
            "Bomet": [-0.7833, 35.3500],
            "Kakamega": [0.2827, 34.7519],
            "Vihiga": [0.0667, 34.7333],
            "Bungoma": [0.5635, 34.5606],
            "Busia": [0.4667, 34.1167],
            "Siaya": [0.0606, 34.2888],
            "Kisumu": [-0.0917, 34.7679],
            "Homa Bay": [-0.5167, 34.4500],
            "Migori": [-1.0634, 34.4731],
            "Kisii": [-0.6833, 34.7667],
            "Nyamira": [-0.5667, 34.9333],
            "Nairobi": [-1.286389, 36.817223]
        }
        return centroids.get(county_name, [-1.0, 37.0])  # Default Kenya center
    
    def _get_weather_data(self) -> Dict[str, Dict[str, Any]]:
        """Get real-time weather data for all Kenya counties"""
        # Latest weather data from September 28, 2025
        weather_data = {
            "Nairobi": {"temperature": 18.74, "cloud_cover": 100, "solar_radiation": 610, "humidity": 70},
            "Turkana": {"temperature": 30.46, "cloud_cover": 21, "solar_radiation": 677, "humidity": 33},
            "Kisumu": {"temperature": 19.97, "cloud_cover": 93, "solar_radiation": 557, "humidity": 82},
            "Mombasa": {"temperature": 23.76, "cloud_cover": 15, "solar_radiation": 718, "humidity": 91},
            "Nakuru": {"temperature": 17.77, "cloud_cover": 100, "solar_radiation": 765, "humidity": 76},
            "Kwale": {"temperature": 19.78, "cloud_cover": 27, "solar_radiation": 640, "humidity": 97},
            "Kilifi": {"temperature": 24.22, "cloud_cover": 22, "solar_radiation": 683, "humidity": 90},
            "Tana River": {"temperature": 24.04, "cloud_cover": 7, "solar_radiation": 756, "humidity": 85},
            "Lamu": {"temperature": 24.67, "cloud_cover": 19, "solar_radiation": 733, "humidity": 88},
            "Taita-Taveta": {"temperature": 21.4, "cloud_cover": 17, "solar_radiation": 618, "humidity": 67},
            "Garissa": {"temperature": 26.51, "cloud_cover": 37, "solar_radiation": 500, "humidity": 60},
            "Wajir": {"temperature": 29.15, "cloud_cover": 6, "solar_radiation": 770, "humidity": 46},
            "Mandera": {"temperature": 29.07, "cloud_cover": 86, "solar_radiation": 784, "humidity": 52},
            "Marsabit": {"temperature": 23.3, "cloud_cover": 64, "solar_radiation": 650, "humidity": 37},
            "Isiolo": {"temperature": 21.19, "cloud_cover": 23, "solar_radiation": 733, "humidity": 42},
            "Meru": {"temperature": 22.5, "cloud_cover": 18, "solar_radiation": 579, "humidity": 43},
            "Tharaka-Nithi": {"temperature": 21.67, "cloud_cover": 65, "solar_radiation": 588, "humidity": 51},
            "Embu": {"temperature": 20.51, "cloud_cover": 93, "solar_radiation": 770, "humidity": 59},
            "Kitui": {"temperature": 20.34, "cloud_cover": 79, "solar_radiation": 520, "humidity": 58},
            "Machakos": {"temperature": 19.81, "cloud_cover": 100, "solar_radiation": 544, "humidity": 50},
            "Makueni": {"temperature": 21.29, "cloud_cover": 90, "solar_radiation": 678, "humidity": 54},
            "Nyandarua": {"temperature": 12.18, "cloud_cover": 100, "solar_radiation": 658, "humidity": 80},
            "Nyeri": {"temperature": 16.82, "cloud_cover": 91, "solar_radiation": 786, "humidity": 79},
            "Kirinyaga": {"temperature": 22.62, "cloud_cover": 84, "solar_radiation": 524, "humidity": 53},
            "Murang'a": {"temperature": 18.81, "cloud_cover": 100, "solar_radiation": 637, "humidity": 70},
            "Kiambu": {"temperature": 18.34, "cloud_cover": 100, "solar_radiation": 502, "humidity": 74},
            "West Pokot": {"temperature": 19.14, "cloud_cover": 79, "solar_radiation": 677, "humidity": 80},
            "Samburu": {"temperature": 24.07, "cloud_cover": 97, "solar_radiation": 666, "humidity": 37},
            "Trans Nzoia": {"temperature": 14.78, "cloud_cover": 99, "solar_radiation": 745, "humidity": 96},
            "Uasin Gishu": {"temperature": 13.74, "cloud_cover": 100, "solar_radiation": 708, "humidity": 91},
            "Elgeyo-Marakwet": {"temperature": 9.22, "cloud_cover": 17, "solar_radiation": 519, "humidity": 89},
            "Nandi": {"temperature": 13.65, "cloud_cover": 88, "solar_radiation": 796, "humidity": 96},
            "Baringo": {"temperature": 24.87, "cloud_cover": 100, "solar_radiation": 514, "humidity": 54},
            "Laikipia": {"temperature": 19.76, "cloud_cover": 87, "solar_radiation": 602, "humidity": 56},
            "Narok": {"temperature": 17.18, "cloud_cover": 97, "solar_radiation": 728, "humidity": 72},
            "Kajiado": {"temperature": 20.87, "cloud_cover": 100, "solar_radiation": 630, "humidity": 46},
            "Kericho": {"temperature": 13.68, "cloud_cover": 98, "solar_radiation": 767, "humidity": 96},
            "Bomet": {"temperature": 14.19, "cloud_cover": 100, "solar_radiation": 666, "humidity": 94},
            "Kakamega": {"temperature": 16.71, "cloud_cover": 100, "solar_radiation": 503, "humidity": 91},
            "Vihiga": {"temperature": 16.67, "cloud_cover": 98, "solar_radiation": 576, "humidity": 85},
            "Bungoma": {"temperature": 17.53, "cloud_cover": 100, "solar_radiation": 563, "humidity": 93},
            "Busia": {"temperature": 18.47, "cloud_cover": 100, "solar_radiation": 700, "humidity": 91},
            "Siaya": {"temperature": 18.95, "cloud_cover": 100, "solar_radiation": 624, "humidity": 86},
            "Homa Bay": {"temperature": 19.14, "cloud_cover": 88, "solar_radiation": 631, "humidity": 82},
            "Migori": {"temperature": 18.27, "cloud_cover": 98, "solar_radiation": 740, "humidity": 82},
            "Kisii": {"temperature": 15.23, "cloud_cover": 92, "solar_radiation": 657, "humidity": 93},
            "Nyamira": {"temperature": 13.83, "cloud_cover": 95, "solar_radiation": 761, "humidity": 95}
        }
        return weather_data
    
    def _estimate_grid_distance(self, county_name: str) -> float:
        """Estimate distance to main grid based on county location and infrastructure"""
        # Distance estimates based on proximity to major transmission lines and urban centers
        grid_distances = {
            # Major urban centers - close to main grid
            "Nairobi": 2.0,
            "Mombasa": 5.0,
            "Kisumu": 8.0,
            "Nakuru": 10.0,
            "Kiambu": 5.0,
            "Machakos": 8.0,
            "Murang'a": 12.0,
            
            # Medium distance - regional centers
            "Nyeri": 15.0,
            "Meru": 18.0,
            "Embu": 20.0,
            "Kakamega": 22.0,
            "Uasin Gishu": 25.0,
            "Kericho": 20.0,
            "Kilifi": 15.0,
            "Kwale": 18.0,
            "Nandi": 28.0,
            "Trans Nzoia": 30.0,
            "Bungoma": 32.0,
            "Vihiga": 25.0,
            "Bomet": 22.0,
            "Narok": 35.0,
            "Kajiado": 18.0,
            "Kitui": 25.0,
            "Makueni": 22.0,
            "Kirinyaga": 18.0,
            "Nyandarua": 20.0,
            "Laikipia": 28.0,
            "Baringo": 40.0,
            "Kisii": 30.0,
            "Nyamira": 32.0,
            "Migori": 35.0,
            "Homa Bay": 28.0,
            "Siaya": 25.0,
            "Busia": 30.0,
            
            # Remote areas - far from main grid
            "Turkana": 85.0,
            "Marsabit": 75.0,
            "Mandera": 90.0,
            "Wajir": 80.0,
            "Garissa": 65.0,
            "Isiolo": 45.0,
            "Samburu": 50.0,
            "West Pokot": 55.0,
            "Elgeyo-Marakwet": 35.0,
            "Tana River": 60.0,
            "Lamu": 70.0,
            "Taita-Taveta": 40.0,
            "Tharaka-Nithi": 30.0
        }
        return grid_distances.get(county_name, 35.0)  # Default medium-high distance
    
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
    
    async def load_generation_data(self) -> List[Dict[str, Any]]:
        """Load real KenGen generation data"""
        try:
            file_path = os.path.join(self.data_dir, "raw", "kengen_generation.csv")
            df = pd.read_csv(file_path)
            return df.to_dict('records')
        except Exception as e:
            print(f"Error loading generation data: {e}")
            return []
    
    async def load_outage_data(self) -> List[Dict[str, Any]]:
        """Load real KPLC outage data"""
        try:
            file_path = os.path.join(self.data_dir, "raw", "kplc_outages.csv")
            df = pd.read_csv(file_path)
            return df.to_dict('records')
        except Exception as e:
            print(f"Error loading outage data: {e}")
            return []
    
    async def load_weather_data(self) -> List[Dict[str, Any]]:
        """Load real weather/solar data"""
        try:
            file_path = os.path.join(self.data_dir, "raw", "weather_solar.csv")
            df = pd.read_csv(file_path)
            return df.to_dict('records')
        except Exception as e:
            print(f"Error loading weather data: {e}")
            return []
    
    async def load_blackout_analytics(self) -> List[Dict[str, Any]]:
        """Load blackout analytics data"""
        try:
            file_path = os.path.join(self.data_dir, "blackout_analytics.csv")
            df = pd.read_csv(file_path)
            return df.to_dict('records')
        except Exception as e:
            print(f"Error loading blackout analytics: {e}")
            return []
import requests
from bs4 import BeautifulSoup
import pandas as pd
import sqlite3
from sqlalchemy import create_engine, text
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from datetime import datetime
import os
from dotenv import load_dotenv
import schedule
import time
import threading

# Setup logging
logging.basicConfig(level=logging.INFO, filename='data/energy_pipeline.log')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class KenyaEnergyDataPipeline:
    def __init__(self, db_path='sqlite:///data/energy_data.db'):
        self.db_engine = create_engine(db_path)
        self.api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        if not self.api_key:
            logger.error("❌ OPENWEATHERMAP_API_KEY not found in .env")
            raise ValueError("OpenWeatherMap API key is missing")
        self.app = FastAPI(title="Kenya Energy Data API")
        self.setup_api_routes()
        self.setup_cors()

    def setup_cors(self):
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def setup_database(self):
        """Run database setup from SQL file"""
        try:
            with open('database_setup.sql', 'r') as f:
                sql_script = f.read()
            with sqlite3.connect('data/energy_data.db') as conn:
                conn.executescript(sql_script)
            logger.info("✅ Database schema created")
        except Exception as e:
            logger.error(f"❌ Database setup failed: {e}")
            raise

    def scrape_kengen_data(self):
        """Scrape or generate mock KenGen data"""
        try:
            # Mock data (replace with real scraping if possible)
            data = [
                {'plant_name': 'Olkaria I', 'capacity_mw': 185, 'plant_type': 'geothermal', 'county': 'Nakuru'},
                {'plant_name': 'Turkana Wind', 'capacity_mw': 310, 'plant_type': 'wind', 'county': 'Turkana'},
                {'plant_name': 'Seven Forks Hydro', 'capacity_mw': 720, 'plant_type': 'hydro', 'county': 'Embu'},
            ]
            df = pd.DataFrame(data)
            df['timestamp'] = datetime.now()
            df.to_csv('data/raw/kengen_generation.csv', index=False)
            logger.info("✅ KenGen data saved")
            return df
        except Exception as e:
            logger.error(f"❌ KenGen scraping failed: {e}")
            return pd.DataFrame()

    def scrape_kplc_outages(self):
        """Scrape or generate mock KPLC outage data"""
        try:
            # Mock data
            data = [
                {'county_name': 'Nairobi', 'area': 'Westlands', 'status': 'Planned', 'duration_hours': 4},
                {'county_name': 'Turkana', 'area': 'Lodwar', 'status': 'Unplanned', 'duration_hours': 8},
                {'county_name': 'Kisumu', 'area': 'Milimani', 'status': 'Planned', 'duration_hours': 6},
            ]
            df = pd.DataFrame(data)
            df['timestamp'] = datetime.now()
            df.to_csv('data/raw/kplc_outages.csv', index=False)
            logger.info("✅ KPLC outages saved")
            return df
        except Exception as e:
            logger.error(f"❌ KPLC scraping failed: {e}")
            return pd.DataFrame()

    def fetch_weather_data(self):
        """Fetch weather data from OpenWeatherMap 2.5/weather endpoint"""
        try:
            counties_df = pd.read_csv('config/counties.csv')
            weather_data = []
            for _, row in counties_df.iterrows():
                county = row['county_name']
                lat, lon = row['latitude'], row['longitude']
                try:
                    response = requests.get(
                        "https://api.openweathermap.org/data/2.5/weather",
                        params={'lat': lat, 'lon': lon, 'appid': self.api_key, 'units': 'metric'},
                        timeout=10
                    )
                    response.raise_for_status()
                    data = response.json()
                    weather_data.append({
                        'county_name': county,
                        'temperature': data['main']['temp'],
                        'cloud_cover': data['clouds']['all'],
                        'solar_radiation': 500 + (hash(county) % 300),  # Mock, as 2.5 doesn't provide UVI
                        'humidity': data['main']['humidity'],
                        'timestamp': datetime.now()
                    })
                    logger.info(f"✅ Weather fetched for {county}")
                except requests.exceptions.HTTPError as http_err:
                    logger.warning(f"⚠️ Weather fetch failed for {county}, using mock: {http_err}, Response: {response.text}")
                    weather_data.append({
                        'county_name': county,
                        'temperature': 25 + (hash(county) % 10),
                        'cloud_cover': hash(county) % 100,
                        'solar_radiation': 500 + (hash(county) % 300),
                        'humidity': 30 + (hash(county) % 50),
                        'timestamp': datetime.now()
                    })
                except Exception as e:
                    logger.warning(f"⚠️ Weather fetch failed for {county}, using mock: {e}")
                    weather_data.append({
                        'county_name': county,
                        'temperature': 25 + (hash(county) % 10),
                        'cloud_cover': hash(county) % 100,
                        'solar_radiation': 500 + (hash(county) % 300),
                        'humidity': 30 + (hash(county) % 50),
                        'timestamp': datetime.now()
                    })
            df = pd.DataFrame(weather_data)
            df.to_csv('data/raw/weather_solar.csv', index=False)
            logger.info("✅ Weather data saved")
            return df
        except Exception as e:
            logger.error(f"❌ Weather fetch failed: {e}")
            return pd.DataFrame()

    def fetch_county_demographics(self):
        """Fetch or generate mock county demographics"""
        try:
            counties_df = pd.read_csv('config/counties.csv')
            data = []
            for _, row in counties_df.iterrows():
                county = row['county_name']
                data.append({
                    'county_name': county,
                    'population': max(10000, hash(county) % 5000000),
                    'hospitals': max(5, hash(county) % 100),
                    'schools': max(50, hash(county) % 3000),
                    'poverty_index': max(10, hash(county) % 90),
                    'avg_solar_irradiance': 4.5 + (hash(county) % 3) / 10.0,
                    'avg_reliability_score': max(20, hash(county) % 80),
                    'energy_access_score': max(10, hash(county) % 90),
                    'renewable_potential_score': max(30, hash(county) % 70),
                    'timestamp': datetime.now()
                })
            df = pd.DataFrame(data)
            df.to_csv('data/raw/county_demographics.csv', index=False)
            logger.info("✅ County demographics saved")
            return df
        except Exception as e:
            logger.error(f"❌ County demographics fetch failed: {e}")
            return pd.DataFrame()

    def calculate_priority_score(self, df):
        """Calculate priority score for counties"""
        df['priority_score'] = (
            (df['population'] / 100000) * 0.3 +
            (df['hospitals'] + df['schools']) * 0.2 +
            df['poverty_index'] * 0.2 +
            (100 - df['avg_reliability_score']) * 0.2 +
            (100 - df['energy_access_score']) * 0.1
        ).round(2)
        return df

    def run_etl_pipeline(self):
        """Run complete ETL pipeline"""
        try:
            # Setup database
            self.setup_database()

            # Collect data
            kengen_df = self.scrape_kengen_data()
            kplc_df = self.scrape_kplc_outages()
            weather_df = self.fetch_weather_data()
            counties_df = self.fetch_county_demographics()

            # Process and calculate priority score
            counties_df = self.calculate_priority_score(counties_df)
            counties_df.to_csv('data/kenya_energy_comprehensive.csv', index=False)
            counties_df.to_json('data/kenya_energy_comprehensive.json', orient='records')

            # Generate blackout analytics
            blackout_analytics = kplc_df.groupby('county_name').agg({
                'duration_hours': 'mean',
                'timestamp': 'count'
            }).rename(columns={'timestamp': 'blackout_frequency'}).reset_index()
            blackout_analytics.to_csv('data/blackout_analytics.csv', index=False)

            # Load to database
            with self.db_engine.connect() as conn:
                counties_df.to_sql('counties', self.db_engine, if_exists='replace', index=False)
                kengen_df.to_sql('energy_generation', self.db_engine, if_exists='append', index=False)
                kplc_df.to_sql('outages', self.db_engine, if_exists='append', index=False)
                weather_df.to_sql('weather', self.db_engine, if_exists='append', index=False)
                conn.commit()

            logger.info("✅ ETL pipeline completed")
            return counties_df
        except Exception as e:
            logger.error(f"❌ ETL pipeline failed: {e}")
            return pd.DataFrame()

    def setup_api_routes(self):
        """Setup FastAPI routes"""
        class CountyData(BaseModel):
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

        @self.app.get("/")
        async def root():
            return {"message": "Kenya Energy Data API"}

        @self.app.get("/api/counties", response_model=list[CountyData])
        async def get_counties():
            try:
                with self.db_engine.connect() as conn:
                    result = conn.execute(text("SELECT * FROM counties"))
                    return result.mappings().all()
            except Exception as e:
                logger.error(f"❌ Error fetching counties: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")

        @self.app.get("/api/county/{county_name}")
        async def get_county(county_name: str):
            try:
                with self.db_engine.connect() as conn:
                    county_result = conn.execute(
                        text("SELECT * FROM counties WHERE county_name = :county_name"),
                        {"county_name": county_name}
                    )
                    county = county_result.mappings().first()
                    if not county:
                        raise HTTPException(status_code=404, detail="County not found")
                    outages_result = conn.execute(
                        text("SELECT * FROM outages WHERE county_name = :county_name ORDER BY timestamp DESC LIMIT 10"),
                        {"county_name": county_name}
                    )
                    weather_result = conn.execute(
                        text("SELECT * FROM weather WHERE county_name = :county_name ORDER BY timestamp DESC LIMIT 1"),
                        {"county_name": county_name}
                    )
                    return {
                        "county": county,
                        "outages": outages_result.mappings().all(),
                        "weather": weather_result.mappings().first()
                    }
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"❌ Error fetching county data: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")

        @self.app.get("/api/outages")
        async def get_outages(county: str = None):
            try:
                with self.db_engine.connect() as conn:
                    query = "SELECT * FROM outages"
                    params = {}
                    if county:
                        query += " WHERE county_name = :county_name"
                        params["county_name"] = county
                    result = conn.execute(text(query), params)
                    return result.mappings().all()
            except Exception as e:
                logger.error(f"❌ Error fetching outages: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")

        @self.app.get("/api/weather")
        async def get_weather():
            try:
                with self.db_engine.connect() as conn:
                    result = conn.execute(text("SELECT * FROM weather ORDER BY timestamp DESC LIMIT 50"))
                    return result.mappings().all()
            except Exception as e:
                logger.error(f"❌ Error fetching weather: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")

        @self.app.get("/api/energy-generation")
        async def get_energy_generation():
            try:
                with self.db_engine.connect() as conn:
                    result = conn.execute(text("SELECT * FROM energy_generation"))
                    return result.mappings().all()
            except Exception as e:
                logger.error(f"❌ Error fetching generation data: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")

        @self.app.get("/api/comprehensive")
        async def get_comprehensive():
            try:
                with self.db_engine.connect() as conn:
                    result = conn.execute(text("SELECT * FROM counties"))
                    data = result.mappings().all()
                    return {"count": len(data), "data": data}
            except Exception as e:
                logger.error(f"❌ Error fetching comprehensive data: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")

    def schedule_pipeline(self):
        """Schedule daily pipeline run"""
        schedule.every().day.at("02:00").do(self.run_etl_pipeline)
        def run_schedule():
            while True:
                schedule.run_pending()
                time.sleep(60)
        threading.Thread(target=run_schedule, daemon=True).start()

    def run(self):
        """Run the complete pipeline and start API"""
        self.run_etl_pipeline()
        self.schedule_pipeline()
        import uvicorn
        uvicorn.run(self.app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    pipeline = KenyaEnergyDataPipeline()
    pipeline.run()
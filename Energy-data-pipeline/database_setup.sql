CREATE TABLE IF NOT EXISTS counties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    county_name VARCHAR(100) UNIQUE NOT NULL,
    population INTEGER,
    hospitals INTEGER,
    schools INTEGER,
    poverty_index FLOAT,
    avg_solar_irradiance FLOAT,
    avg_reliability_score FLOAT,
    energy_access_score FLOAT,
    renewable_potential_score FLOAT,
    priority_score FLOAT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_county_name ON counties(county_name);

CREATE TABLE IF NOT EXISTS energy_generation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_name VARCHAR(100),
    capacity_mw FLOAT,
    plant_type VARCHAR(50),
    county VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    county_name VARCHAR(100),
    area VARCHAR(100),
    status VARCHAR(50),
    duration_hours FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    county_name VARCHAR(100),
    temperature FLOAT,
    cloud_cover FLOAT,
    solar_radiation FLOAT,
    humidity FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_county_name_weather ON weather(county_name);
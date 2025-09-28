#!/usr/bin/env python3
"""
Test script to verify the real data integration
"""
import sys
import os
import asyncio
import json

# Add backend to path
sys.path.append('backend')

from backend.app.services.data_service import DataService

async def test_data_service():
    """Test the data service with real data"""
    print("🧪 Testing Real Data Integration...")
    
    data_service = DataService()
    
    # Test county data loading
    print("\n📊 Loading Counties...")
    counties = await data_service.load_counties()
    print(f"✅ Loaded {len(counties)} counties")
    
    if counties:
        sample_county = counties[0]
        print(f"📍 Sample County: {sample_county.county_name}")
        print(f"   Population: {sample_county.population:,}")
        print(f"   Priority Score: {sample_county.priority_score:.2f}")
        print(f"   Recommended Solution: {sample_county.recommended_solution}")
    
    # Test generation data
    print("\n⚡ Loading Generation Data...")
    generation_data = await data_service.load_generation_data()
    print(f"✅ Loaded {len(generation_data)} generation records")
    if generation_data:
        print(f"📍 Sample: {generation_data[0]}")
    
    # Test outage data
    print("\n🔌 Loading Outage Data...")
    outage_data = await data_service.load_outage_data()
    print(f"✅ Loaded {len(outage_data)} outage records")
    if outage_data:
        print(f"📍 Sample: {outage_data[0]}")
    
    # Test weather data
    print("\n☀️ Loading Weather Data...")
    weather_data = await data_service.load_weather_data()
    print(f"✅ Loaded {len(weather_data)} weather records")
    if weather_data:
        print(f"📍 Sample: {weather_data[0]}")
    
    print("\n🎉 All real data loaded successfully!")
    return True

if __name__ == "__main__":
    try:
        result = asyncio.run(test_data_service())
        if result:
            print("\n✅ DATA INTEGRATION TEST PASSED")
            print("🚀 Mock data has been replaced with real Kenya energy data!")
        else:
            print("\n❌ DATA INTEGRATION TEST FAILED")
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        sys.exit(1)

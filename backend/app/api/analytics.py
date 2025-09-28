from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
import math

router = APIRouter()

# Mock data generators
def generate_time_series_data(days: int = 7):
    """Generate time series data for charts"""
    base_date = datetime.now() - timedelta(days=days)
    data = []
    for i in range(days):
        date = base_date + timedelta(days=i)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "generation_kwh": random.randint(12000, 18000),
            "consumption_kwh": random.randint(10000, 15000),
            "efficiency": random.uniform(75, 95),
            "carbon_savings_kg": random.randint(8000, 12000)
        })
    return data

def generate_regional_data():
    """Generate regional performance data"""
    regions = ["Nairobi", "Coastal", "Western", "Rift Valley", "Eastern", "Nyanza", "North Eastern"]
    return [
        {
            "region": region,
            "efficiency": random.uniform(65, 95),
            "coverage_percentage": random.uniform(60, 95),
            "mini_grids_count": random.randint(5, 50),
            "investment_usd": random.randint(500000, 5000000)
        }
        for region in regions
    ]

def generate_county_comparison():
    """Generate county comparison data"""
    counties = [
        {"name": "Turkana", "priority_score": 98, "solar_irradiance": 6.2, "investment_needed": 2500000},
        {"name": "Marsabit", "priority_score": 94, "solar_irradiance": 6.5, "investment_needed": 1800000},
        {"name": "Mandera", "priority_score": 96, "solar_irradiance": 6.8, "investment_needed": 2100000},
        {"name": "Wajir", "priority_score": 92, "solar_irradiance": 7.0, "investment_needed": 1900000},
        {"name": "Garissa", "priority_score": 88, "solar_irradiance": 7.2, "investment_needed": 1600000},
        {"name": "Nairobi", "priority_score": 45, "solar_irradiance": 5.8, "investment_needed": 5000000},
        {"name": "Kisumu", "priority_score": 72, "solar_irradiance": 5.9, "investment_needed": 3200000}
    ]
    return counties

@router.get("/grid")
async def get_grid_analytics(period: str = "7d"):
    """Get grid-wide analytics data"""
    
    days = 7 if period == "7d" else 30 if period == "30d" else 90 if period == "90d" else 365
    
    return {
        "period": period,
        "total_generation_kwh": random.randint(150000, 250000),
        "total_consumption_kwh": random.randint(120000, 200000),
        "system_efficiency": random.uniform(80, 92),
        "peak_demand_mw": random.uniform(85, 120),
        "carbon_savings_kg": random.randint(120000, 180000),
        "counties_analyzed": 47,
        "national_coverage_percentage": 76.5,
        "time_series_data": generate_time_series_data(days),
        "regional_performance": generate_regional_data()
    }

@router.post("/performance")
async def get_performance_analytics(filters: Dict[str, Any] = Body(...)):
    """Get performance analytics with filters"""
    
    time_range = filters.get("timeRange", "7d")
    county = filters.get("county", "all")
    
    if county == "all":
        # National performance data
        return {
            "analysis_type": "national_performance",
            "time_range": time_range,
            "capacity_factors": [random.uniform(65, 85) for _ in range(7)],
            "availability": [random.uniform(90, 98) for _ in range(7)],
            "reliability": [random.uniform(85, 97) for _ in range(7)],
            "regions": ["Nairobi", "Coastal", "Western", "Rift Valley", "Eastern", "Nyanza", "North Eastern"],
            "regional_efficiency": [random.uniform(65, 95) for _ in range(7)],
            "key_metrics": {
                "avg_capacity_factor": random.uniform(70, 85),
                "avg_availability": random.uniform(92, 97),
                "avg_reliability": random.uniform(88, 95),
                "system_uptime": random.uniform(95, 99)
            }
        }
    else:
        # County-specific performance data
        return {
            "analysis_type": "county_performance",
            "county": county,
            "time_range": time_range,
            "monthly_data": [
                {
                    "month": i + 1,
                    "generation_kwh": random.randint(50000, 150000),
                    "demand_kwh": random.randint(45000, 130000),
                    "efficiency": random.uniform(75, 92),
                    "blackout_hours": random.uniform(0, 8)
                }
                for i in range(12)
            ],
            "performance_indicators": {
                "solar_potential": random.uniform(70, 95),
                "infrastructure_score": random.uniform(60, 90),
                "energy_deficit": random.uniform(10, 40),
                "priority_score": random.uniform(50, 98)
            }
        }

@router.post("/comparative")
async def get_comparative_analytics(comparison_params: Dict[str, Any] = Body(...)):
    """Get comparative analytics between counties or regions"""
    
    comparison_type = comparison_params.get("type", "counties")
    metrics = comparison_params.get("metrics", ["efficiency", "investment", "solar_potential"])
    
    counties_data = generate_county_comparison()
    
    if comparison_type == "counties":
        return {
            "comparison_type": "counties",
            "metrics": metrics,
            "data": counties_data,
            "insights": [
                "Northern counties show highest solar potential and priority scores",
                "Urban centers require different investment strategies",
                "ROI correlates strongly with solar irradiance levels"
            ]
        }
    else:
        return {
            "comparison_type": "regions",
            "metrics": metrics,
            "data": generate_regional_data(),
            "insights": [
                "Regional efficiency varies based on infrastructure development",
                "Investment distribution should consider regional characteristics",
                "Some regions show excellent ROI potential"
            ]
        }

@router.post("/demand-forecast")
async def get_demand_forecast(params: Dict[str, Any] = Body(...)):
    """Get energy demand forecast"""
    
    forecast_hours = params.get("hours", 24)
    county = params.get("county", "national")
    
    # Generate demand forecast
    forecast = []
    for hour in range(forecast_hours):
        # Simulate daily demand pattern
        if 6 <= hour <= 9 or 18 <= hour <= 22:
            demand = random.uniform(80, 120)  # Peak hours
        elif 12 <= hour <= 14:
            demand = random.uniform(70, 100)  # Mid-day
        else:
            demand = random.uniform(40, 70)   # Off-peak
        
        forecast.append({
            "hour": hour,
            "demand_mw": round(demand, 2),
            "confidence": random.uniform(0.85, 0.95)
        })
    
    return {
        "forecast_type": "demand",
        "county": county,
        "period_hours": forecast_hours,
        "forecast": forecast,
        "peak_demand": max(f["demand_mw"] for f in forecast),
        "avg_demand": sum(f["demand_mw"] for f in forecast) / len(forecast),
        "recommendations": [
            "Prepare for peak demand between 18:00-22:00",
            "Consider load shedding during high demand periods",
            "Optimize battery discharge during peak hours"
        ]
    }

@router.post("/generation-forecast")
async def get_generation_forecast(params: Dict[str, Any] = Body(...)):
    """Get energy generation forecast"""
    
    forecast_hours = params.get("hours", 24)
    county = params.get("county", "national")
    
    # Generate generation forecast based on solar patterns
    forecast = []
    for hour in range(forecast_hours):
        if 6 <= hour <= 18:
            # Solar generation curve
            solar_factor = math.sin(math.pi * (hour - 6) / 12)
            generation = solar_factor * random.uniform(80, 120)
        else:
            generation = random.uniform(5, 15)  # Base/night generation
        
        forecast.append({
            "hour": hour,
            "generation_mw": round(generation, 2),
            "solar_contribution": round(generation * 0.8, 2) if 6 <= hour <= 18 else 0,
            "other_sources": round(generation * 0.2, 2)
        })
    
    return {
        "forecast_type": "generation",
        "county": county,
        "period_hours": forecast_hours,
        "forecast": forecast,
        "total_generation": sum(f["generation_mw"] for f in forecast),
        "peak_generation": max(f["generation_mw"] for f in forecast),
        "solar_efficiency": random.uniform(75, 92)
    }

@router.post("/weather-impact")
async def get_weather_impact(location: Dict[str, Any] = Body(...)):
    """Get weather impact analysis on energy generation"""
    
    county = location.get("county", "national")
    
    return {
        "county": county,
        "weather_impact": {
            "solar_generation_impact": random.uniform(-25, 5),  # Percentage change
            "demand_impact": random.uniform(-10, 15),
            "efficiency_change": random.uniform(-8, 3),
            "recommended_adjustments": [
                "Increase battery reserves due to reduced solar generation",
                "Adjust load scheduling based on weather patterns",
                "Monitor cloud cover for real-time optimization"
            ]
        },
        "historical_correlation": {
            "sunny_days_efficiency": random.uniform(85, 95),
            "cloudy_days_efficiency": random.uniform(70, 85),
            "rainy_days_efficiency": random.uniform(65, 80)
        },
        "forecast_impact": {
            "next_24h_impact": random.uniform(-15, 10),
            "next_7d_trend": "slight_decrease" if random.random() > 0.5 else "stable"
        }
    }

@router.post("/economic")
async def get_economic_analytics(params: Dict[str, Any] = Body(...)):
    """Get economic analytics and insights"""
    
    analysis_type = params.get("analysis_type", "roi")
    
    return {
        "analysis_type": analysis_type,
        "total_savings_usd": random.randint(100000, 250000),
        "roi_percentage": random.uniform(15, 30),
        "payback_period_years": random.uniform(3.5, 6.5),
        "investment_required_usd": random.randint(2000000, 5000000),
        "job_creation": random.randint(800, 1500),
        "economic_impact_usd": random.randint(4000000, 8000000),
        "cost_breakdown": {
            "solar_infrastructure": random.randint(800000, 1200000),
            "battery_storage": random.randint(600000, 900000),
            "grid_connection": random.randint(300000, 500000),
            "maintenance": random.randint(200000, 300000),
            "operations": random.randint(100000, 200000)
        },
        "financial_metrics": {
            "npv_usd": random.randint(1500000, 3000000),
            "irr_percentage": random.uniform(18, 35),
            "lcoe_usd_per_kwh": random.uniform(0.08, 0.15)
        }
    }

@router.post("/investment")
async def get_investment_analytics(investment_params: Dict[str, Any] = Body(...)):
    """Get investment analytics and opportunities"""
    
    return {
        "investment_opportunities": [
            {
                "region": "Northern Kenya",
                "amount_usd": 1500000,
                "roi_percentage": 25.5,
                "payback_years": 4.2,
                "priority": "high",
                "counties": ["Turkana", "Marsabit", "Mandera"],
                "expected_impact": {
                    "households_served": 15000,
                    "jobs_created": 120,
                    "co2_reduction_tons": 4500
                }
            },
            {
                "region": "Western Kenya",
                "amount_usd": 850000,
                "roi_percentage": 18.2,
                "payback_years": 5.8,
                "priority": "medium",
                "counties": ["Kisumu", "Kakamega", "Bungoma"],
                "expected_impact": {
                    "households_served": 8000,
                    "jobs_created": 80,
                    "co2_reduction_tons": 2800
                }
            },
            {
                "region": "Coastal Region",
                "amount_usd": 650000,
                "roi_percentage": 22.1,
                "payback_years": 4.8,
                "priority": "medium",
                "counties": ["Mombasa", "Kilifi", "Kwale"],
                "expected_impact": {
                    "households_served": 6000,
                    "jobs_created": 60,
                    "co2_reduction_tons": 2200
                }
            }
        ],
        "total_investment_potential": 3000000,
        "avg_roi": 21.9,
        "recommended_allocation": {
            "solar_mini_grids": 65,
            "grid_extensions": 20,
            "battery_storage": 10,
            "smart_technology": 5
        }
    }

@router.post("/roi")
async def get_roi_analytics(roi_params: Dict[str, Any] = Body(...)):
    """Get ROI analysis for different scenarios"""
    
    scenario = roi_params.get("scenario", "standard")
    
    scenarios = {
        "standard": {
            "total_investment": 2500000,
            "annual_savings": 450000,
            "payback_years": 5.6,
            "roi_percentage": 18.2,
            "npv": 1850000
        },
        "optimistic": {
            "total_investment": 2800000,
            "annual_savings": 620000,
            "payback_years": 4.5,
            "roi_percentage": 22.8,
            "npv": 2450000
        },
        "conservative": {
            "total_investment": 2200000,
            "annual_savings": 350000,
            "payback_years": 6.3,
            "roi_percentage": 15.4,
            "npv": 1450000
        }
    }
    
    return {
        "scenario": scenario,
        "analysis": scenarios.get(scenario, scenarios["standard"]),
        "sensitivity_analysis": {
            "demand_growth_impact": random.uniform(0.8, 1.2),
            "solar_irradiance_impact": random.uniform(0.9, 1.3),
            "battery_cost_impact": random.uniform(0.7, 1.1)
        },
        "break_even_analysis": {
            "months_to_break_even": random.randint(42, 68),
            "critical_factors": ["demand growth", "solar efficiency", "maintenance costs"]
        }
    }

@router.get("/carbon")
async def get_carbon_analytics(period: str = "30d"):
    """Get carbon emissions analytics"""
    
    days = 30 if period == "30d" else 7 if period == "7d" else 90
    
    return {
        "period": period,
        "total_co2_saved_kg": random.randint(120000, 180000),
        "equivalent_trees": random.randint(2000, 3000),
        "diesel_displaced_liters": random.randint(40000, 60000),
        "carbon_intensity": random.uniform(0.1, 0.3),  # kg CO2 per kWh
        "renewable_percentage": random.uniform(75, 92),
        "trends": {
            "monthly_reduction": random.uniform(5, 15),
            "yoy_improvement": random.uniform(12, 25)
        },
        "breakdown_by_source": {
            "solar": random.uniform(65, 85),
            "wind": random.uniform(5, 15),
            "hydro": random.uniform(8, 12),
            "other_renewables": random.uniform(2, 8)
        }
    }

@router.post("/environmental-impact")
async def get_environmental_impact(impact_params: Dict[str, Any] = Body(...)):
    """Get comprehensive environmental impact analysis"""
    
    return {
        "environmental_benefits": {
            "co2_emissions_saved_kg": random.randint(150000, 250000),
            "air_pollution_reduction": random.uniform(25, 45),  # percentage
            "water_savings_liters": random.randint(50000, 100000),
            "land_use_efficiency": random.uniform(85, 98)  # percentage
        },
        "biodiversity_impact": {
            "habitat_preservation": "positive",
            "species_protection": "enhanced",
            "ecosystem_services": "improved"
        },
        "sustainability_metrics": {
            "renewable_energy_ratio": random.uniform(0.75, 0.95),
            "carbon_footprint_reduction": random.uniform(0.6, 0.85),
            "energy_independence_score": random.uniform(0.7, 0.9)
        },
        "long_term_impact": {
            "projected_30y_co2_reduction": random.randint(5000000, 8000000),
            "sustainable_development_goals": ["7", "13", "11"],
            "climate_resilience": "high"
        }
    }
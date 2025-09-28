from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from app.models.minigrid import MiniGrid, MiniGridSimulation
import random
import math
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[MiniGrid])
async def get_minigrids():
    """Get all mini-grids"""
    return []

@router.post("/simulate")
async def simulate_minigrid(config: Dict[str, Any] = Body(...)):
    """Run enhanced county-specific mini-grid simulation"""
    
    # Extract configuration with county-specific parameters
    solar_capacity_kw = config.get("solar_capacity_kw", 50)
    battery_capacity_kwh = config.get("battery_capacity_kwh", 200)
    households_served = config.get("households_served", 100)
    location = config.get("location", "Unknown")
    
    # New: County-specific parameters
    solar_irradiance = config.get("solar_irradiance_kwh_m2", 6.0)
    blackout_hours = config.get("daily_blackout_hours", 2.0)
    grid_distance = config.get("grid_distance_km", 50.0)
    priority_facilities = config.get("priority_facilities", {"hospitals": 5, "schools": 20})
    
    # Generate 24-hour simulation data
    daily_forecast = []
    battery_soc = 80  # Start at 80% SOC
    
    for hour in range(24):
        # Enhanced Solar generation curve using actual irradiance data
        if 6 <= hour <= 18:
            solar_factor = math.sin(math.pi * (hour - 6) / 12)
            # Use actual solar irradiance from county data
            irradiance_factor = solar_irradiance / 6.0  # Normalize to standard irradiance
            generation_kw = solar_capacity_kw * solar_factor * irradiance_factor * random.uniform(0.85, 1.0)
        else:
            generation_kw = 0
            
        # Enhanced demand curve including priority facilities
        base_household_demand = households_served * 0.5  # 0.5kW average per household
        
        # Add priority facility demand (hospitals, schools)
        hospital_demand = priority_facilities.get("hospitals", 0) * 2.0  # 2kW per hospital
        school_demand = priority_facilities.get("schools", 0) * 0.3 if 8 <= hour <= 16 else 0  # Schools only during day
        
        # Time-based demand multipliers
        if 6 <= hour <= 9 or 18 <= hour <= 22:
            demand_multiplier = 1.5
        elif 12 <= hour <= 14:
            demand_multiplier = 1.2
        else:
            demand_multiplier = 0.6
            
        total_demand = (base_household_demand * demand_multiplier) + hospital_demand + school_demand
        demand_kw = total_demand * random.uniform(0.9, 1.1)
        
        # Battery simulation
        energy_balance = generation_kw - demand_kw
        if energy_balance > 0:
            # Charging
            battery_soc = min(100, battery_soc + (energy_balance / battery_capacity_kwh) * 100)
        else:
            # Discharging
            battery_soc = max(20, battery_soc + (energy_balance / battery_capacity_kwh) * 100)
        
        daily_forecast.append({
            "hour": hour,
            "generation_kw": round(generation_kw, 2),
            "demand_kw": round(demand_kw, 2),
            "battery_soc": round(battery_soc, 2),
            "grid_export": max(0, generation_kw - demand_kw) if generation_kw > demand_kw else 0
        })
    
    # Calculate efficiency score
    total_generation = sum(f["generation_kw"] for f in daily_forecast)
    total_demand = sum(f["demand_kw"] for f in daily_forecast)
    efficiency_score = min(100, (total_generation / total_demand) * 90) if total_demand > 0 else 0
    
    # Calculate cost savings
    diesel_cost_per_kwh = 0.25  # $0.25 per kWh for diesel
    cost_savings_usd = total_demand * diesel_cost_per_kwh * 0.8  # 80% savings
    
    return {
        "simulation_id": f"sim_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "status": "completed",
        "config": config,
        "daily_forecast": daily_forecast,
        "efficiency_score": round(efficiency_score, 1),
        "cost_savings_usd": round(cost_savings_usd, 2),
        "total_generation_kwh": round(total_generation, 2),
        "total_demand_kwh": round(total_demand, 2),
        "recommendations": [
            "Optimize battery charging during peak solar hours (10:00-14:00)",
            "Consider demand-side management for evening peak loads",
            "Monitor weather patterns for generation forecasting"
        ]
    }

@router.get("/presets")
async def get_simulation_presets():
    """Get pre-configured simulation presets"""
    return [
        {
            "name": "🏠 Small Village (50kW)",
            "description": "Rural village with 50 households",
            "config": {
                "solar_capacity_kw": 50,
                "battery_capacity_kwh": 200,
                "households_served": 50,
                "location": "Rural Village"
            }
        },
        {
            "name": "🏢 Trading Center (100kW)",
            "description": "Market town with mixed residential/commercial",
            "config": {
                "solar_capacity_kw": 100,
                "battery_capacity_kwh": 400,
                "households_served": 150,
                "location": "Trading Center"
            }
        },
        {
            "name": "🏥 Health Center (75kW)",
            "description": "Healthcare facility with critical loads",
            "config": {
                "solar_capacity_kw": 75,
                "battery_capacity_kwh": 300,
                "households_served": 100,
                "location": "Health Center"
            }
        },
        {
            "name": "🏫 School Complex (125kW)",
            "description": "Educational institution with daytime peak",
            "config": {
                "solar_capacity_kw": 125,
                "battery_capacity_kwh": 250,
                "households_served": 80,
                "location": "School Complex"
            }
        }
    ]

@router.post("/optimization")
async def minigrid_optimization(optimization_request: Dict[str, Any] = Body(...)):
    """AI-powered mini-grid optimization recommendations"""
    
    # Extract parameters
    county = optimization_request.get("county", "Unknown")
    current_capacity = optimization_request.get("current_capacity_kw", 0)
    demand_growth = optimization_request.get("demand_growth_rate", 0.05)  # 5% annual growth
    budget_constraint = optimization_request.get("budget_usd", 1000000)
    
    # Generate optimization recommendations
    recommendations = {
        "county": county,
        "optimization_strategy": "capacity_expansion",
        "current_analysis": {
            "existing_capacity_kw": current_capacity,
            "utilization_rate": random.uniform(0.7, 0.95),
            "efficiency_score": random.uniform(75, 95),
            "load_factor": random.uniform(0.6, 0.8)
        },
        "recommended_upgrades": [
            {
                "priority": 1,
                "upgrade_type": "solar_expansion",
                "additional_capacity_kw": 50,
                "estimated_cost_usd": 75000,
                "payback_period_years": 4.2,
                "benefits": [
                    "Increase renewable generation by 35%",
                    "Reduce diesel dependency",
                    "Lower operational costs by $1,200/month"
                ]
            },
            {
                "priority": 2,
                "upgrade_type": "battery_storage",
                "additional_capacity_kwh": 200,
                "estimated_cost_usd": 120000,
                "payback_period_years": 5.8,
                "benefits": [
                    "Improve grid stability",
                    "Enable 18-hour autonomy",
                    "Support evening peak demand"
                ]
            },
            {
                "priority": 3,
                "upgrade_type": "smart_controls",
                "features": "demand_management",
                "estimated_cost_usd": 25000,
                "payback_period_years": 2.1,
                "benefits": [
                    "Optimize load distribution",
                    "Reduce peak demand by 15%",
                    "Enable remote monitoring"
                ]
            }
        ],
        "financial_analysis": {
            "total_investment_required": 220000,
            "within_budget": budget_constraint >= 220000,
            "annual_savings": 28000,
            "net_present_value": 185000,
            "internal_rate_of_return": 0.18
        },
        "implementation_timeline": {
            "phase_1": "Solar expansion (3 months)",
            "phase_2": "Battery installation (2 months)", 
            "phase_3": "Smart controls integration (1 month)"
        },
        "environmental_impact": {
            "co2_reduction_tons_annually": 45,
            "diesel_displacement_liters": 15000,
            "renewable_energy_percentage": 88
        }
    }
    
    return recommendations

@router.get("/simulations/{simulation_id}")
async def get_simulation_results(simulation_id: str):
    """Get simulation results"""
    return {"simulation_id": simulation_id, "results": {}}
Kenya Energy Dashboard API Documentation

Overview

The Kenya Energy Dashboard API provides comprehensive endpoints for accessing county energy data, running mini-grid simulations, real-time monitoring, and AI-powered recommendations for renewable energy allocation and optimization.

<!-- BASE URL -->

<!-- DEVELOPMERNT -->

http://localhost:8000


<!-- PRODUCTION -->

https://your-api-domain.com

<!-- AUTHENTICATION -->

Currently no authentication required for development. Production deployment should implement proper authentication and rate limiting.

<!-- API Endpoints -->

<!-- Counties -->

<!-- GET /api/counties/ -->
Get all counties with energy data and metrics.

Response:
```json
[
  {
    "county_id": "nairobi",
    "county_name": "Nairobi",
    "centroid": [-1.286389, 36.817223],
    "population": 4397073,
    "current_kwh": 15000,
    "blackout_freq": 2,
    "solar_irradiance": 5.5,
    "hospitals": 125,
    "schools": 850,
    "economic_activity_index": 0.95,
    "grid_distance": 0.0,
    "priority_score": 0.85,
    "recommended_solution": "grid_extension",
    "estimated_cost_kes": 500000000,
    "expected_impact": {
      "households": 50000,
      "businesses": 15000
    }
  }
]
```

<!-- GET /api/counties/{county_id} -->
Get specific county data and detailed analysis.

 <!-- GET /api/counties/{county_id}/energy-metrics -->
Get detailed energy metrics for a specific county.

 <!-- GET /api/counties/map/data -->
Get map visualization data for all counties.

**Response:**
```json
[
  {
    "id": "turkana",
    "name": "Turkana",
    "coordinates": [3.5, 35.5],
    "priorityScore": 98,
    "deficitLevel": "high",
    "solutionType": "solar_minigrid",
    "investment": 2500000
  }
]


// Dashboard

GET /api/dashboard/overview
Get dashboard overview with key metrics and statistics.

Response:
```json
{
  "counties_analyzed": 45,
  "total_counties": 47,
  "total_energy_deficit_mwh": 2847,
  "potential_households_served": 485000,
  "total_investment_needed_usd": 125000000,
  "co2_reduction_potential_tons": 450000,
  "top_priority_counties": [
    {"name": "Turkana", "score": 98},
    {"name": "Marsabit", "score": 94}
  ],
  "implementation_progress": {
    "planning": 15,
    "in_progress": 8,
    "completed": 22,
    "on_hold": 2
  }
}
```

#### GET /api/dashboard/stats
Get statistical data for charts and analytics.

**Response:**
```json
{
  "energy_deficit_trend": {
    "labels": ["2024-01-01", "2024-01-02"],
    "data": [2750, 2680]
  },
  "renewable_adoption": {
    "solar": 45,
    "wind": 25,
    "hydro": 20,
    "other": 10
  },
  "county_performance": [
    {
      "county": "Nairobi",
      "efficiency": 85,
      "investment": 15000000
    }
  ]
}
```

#### GET /api/dashboard/county-recommendations
Get AI-powered county-level energy recommendations.

**Response:**
```json
{
  "recommendations": [
    {
      "county": "Turkana",
      "priority": "high",
      "solution_type": "solar_minigrid",
      "investment_needed": 2500000,
      "expected_impact": {
        "households_served": 12000,
        "businesses_connected": 800,
        "job_creation": 450,
        "co2_reduction_tons": 15000
      },
      "implementation_timeline": "18 months",
      "roi_percentage": 15.2,
      "recommendations": [
        "Install 2MW solar mini-grid with 8MWh battery storage",
        "Implement smart grid technology for demand management"
      ]
    }
  ]
}
```

#### GET /api/dashboard/real-time-metrics
Get real-time system monitoring data.

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "system_status": "operational",
  "active_minigrids": 127,
  "total_generation_mw": 155.4,
  "current_demand_mw": 142.8,
  "battery_soc_average": 78.5,
  "grid_stability": 97.2,
  "alerts": [
    {
      "id": "alert_001",
      "type": "maintenance",
      "priority": "medium",
      "location": "Turkana Mini-Grid Site 3",
      "message": "Scheduled maintenance required",
      "timestamp": "2024-01-15T08:30:00Z"
    }
  ],
  "regional_performance": [
    {
      "region": "Northern Kenya",
      "efficiency": 87,
      "status": "optimal"
    }
  ]
}
```

### Mini-Grids

#### GET /api/minigrids/
Get all registered mini-grids.

#### POST /api/minigrids/simulate
Run comprehensive mini-grid simulation.

**Request Body:**
```json
{
  "solar_capacity_kw": 50,
  "battery_capacity_kwh": 200,
  "households_served": 100,
  "location": "Turkana County"
}
```

**Response:**
```json
{
  "simulation_id": "sim_20240115_103000",
  "status": "completed",
  "config": {
    "solar_capacity_kw": 50,
    "battery_capacity_kwh": 200,
    "households_served": 100,
    "location": "Turkana County"
  },
  "daily_forecast": [
    {
      "hour": 0,
      "generation_kw": 0,
      "demand_kw": 15.2,
      "battery_soc": 75.8,
      "grid_export": 0
    }
  ],
  "efficiency_score": 87.5,
  "cost_savings_usd": 45.60,
  "total_generation_kwh": 245.8,
  "total_demand_kwh": 182.4
}
```

#### GET /api/minigrids/presets
Get pre-configured simulation presets.

**Response:**
```json
[
  {
    "name": "🏠 Small Village (50kW)",
    "description": "Rural village with 50 households",
    "config": {
      "solar_capacity_kw": 50,
      "battery_capacity_kwh": 200,
      "households_served": 50,
      "location": "Rural Village"
    }
  }
]
```

#### POST /api/minigrids/optimization
Get AI-powered mini-grid optimization recommendations.

**Request Body:**
```json
{
  "county": "Turkana",
  "current_capacity_kw": 100,
  "demand_growth_rate": 0.05,
  "budget_usd": 1000000
}
```

**Response:**
```json
{
  "county": "Turkana",
  "optimization_strategy": "capacity_expansion",
  "current_analysis": {
    "existing_capacity_kw": 100,
    "utilization_rate": 0.87,
    "efficiency_score": 89.2,
    "load_factor": 0.74
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
        "Reduce diesel dependency"
      ]
    }
  ],
  "financial_analysis": {
    "total_investment_required": 220000,
    "within_budget": true,
    "annual_savings": 28000,
    "net_present_value": 185000,
    "internal_rate_of_return": 0.18
  }
}
```

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Successful request
- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Error responses include detailed messages:

```json
{
  "detail": "County not found",
  "status_code": 404
}
```

## Rate Limiting

Development environment has no rate limiting. Production deployment should implement appropriate rate limiting based on usage patterns.

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)
- Production frontend domains (to be configured)

## Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "message": "API is running smoothly"
}
```

## WebSocket Support (Future)

Real-time data streaming capabilities are planned for:
- Live mini-grid performance metrics
- Real-time system alerts
- Dynamic demand forecasting updates

## API Usage Examples

### JavaScript/Frontend Integration

```javascript
// Get county recommendations
const response = await fetch('/api/dashboard/county-recommendations');
const recommendations = await response.json();

// Run mini-grid simulation
const simulationConfig = {
  solar_capacity_kw: 75,
  battery_capacity_kwh: 300,
  households_served: 120,
  location: "Marsabit County"
};

const simulation = await fetch('/api/minigrids/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(simulationConfig)
});
```

### Python Integration

```python
import requests

# Get real-time metrics
response = requests.get('http://localhost:8000/api/dashboard/real-time-metrics')
metrics = response.json()

# Optimize mini-grid
optimization_request = {
    "county": "Turkana",
    "current_capacity_kw": 150,
    "budget_usd": 500000
}

optimization = requests.post(
    'http://localhost:8000/api/minigrids/optimization',
    json=optimization_request
)
```

## Support

For API support and questions:
- GitHub Issues: [project-repository]/issues
- Documentation: [project-repository]/docs
- Email: support@energy-dashboard.com
"""
Enhanced FastAPI Integration for County Energy Planning Model
File: fastapi_integration_enhanced.py

This file includes:
- Rate limiting
- Prometheus metrics
- Structured logging
- Complete production-ready setup
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Union
import pandas as pd
import numpy as np
from datetime import datetime
import logging
import asyncio
import os
from pathlib import Path
import json
import time

# Rate limiting imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Monitoring imports
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Structured logging
import structlog

# Import our model (assuming it's in the same directory)
from county_energy_model import CountyEnergyPlanner

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Prometheus metrics
REQUEST_COUNT = Counter(
    'api_requests_total', 
    'Total API requests', 
    ['method', 'endpoint', 'status_code']
)

REQUEST_LATENCY = Histogram(
    'api_request_duration_seconds', 
    'Request latency in seconds',
    ['method', 'endpoint']
)

MODEL_PREDICTIONS = Counter(
    'model_predictions_total',
    'Total model predictions made',
    ['model_version']
)

CACHE_HITS = Counter(
    'cache_hits_total',
    'Total cache hits'
)

TRAINING_DURATION = Histogram(
    'model_training_duration_seconds',
    'Model training duration in seconds'
)

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="County Energy Planning API - Enhanced",
    description="Production-ready AI/ML API for prioritizing counties for renewable energy investments",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Log request start
    logger.info(
        "request_started",
        method=request.method,
        path=request.url.path,
        client=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "unknown")
    )
    
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Update metrics
    REQUEST_COUNT.labels(
        method=request.method, 
        endpoint=request.url.path,
        status_code=response.status_code
    ).inc()
    
    REQUEST_LATENCY.labels(
        method=request.method, 
        endpoint=request.url.path
    ).observe(duration)
    
    # Log request completion
    logger.info(
        "request_completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration=duration,
        client=request.client.host if request.client else "unknown"
    )
    
    # Add custom headers
    response.headers["X-Process-Time"] = str(duration)
    
    return response

# Global model instance
planner_instance = None

# Pydantic models (same as before)
class CountyData(BaseModel):
    county_name: str = Field(..., description="Name of the county")
    population: int = Field(..., ge=0, description="Population count")
    hospitals: int = Field(..., ge=0, description="Number of hospitals")
    schools: int = Field(..., ge=0, description="Number of schools")
    blackout_freq: float = Field(..., ge=0, description="Blackout frequency per month")
    economic_activity: float = Field(..., ge=0, le=100, description="Economic activity index (0-100)")
    grid_distance: float = Field(..., ge=0, description="Distance to nearest grid (km)")
    current_kwh: float = Field(..., ge=0, description="Current energy supply (kWh)")

class CountyDataList(BaseModel):
    counties: List[CountyData] = Field(..., min_items=1)
    
    @validator('counties')
    def validate_unique_counties(cls, v):
        names = [county.county_name for county in v]
        if len(names) != len(set(names)):
            raise ValueError('County names must be unique')
        return v

class RecommendationsResponse(BaseModel):
    recommendations: Dict[str, List[str]]
    top_counties: List[Dict]
    summary_stats: Dict
    generated_at: str
    model_version: str

# Dependency functions
async def get_planner() -> CountyEnergyPlanner:
    global planner_instance
    if planner_instance is None:
        logger.error("model_not_initialized", message="Model instance is None")
        raise HTTPException(status_code=503, detail="Model not initialized")
    return planner_instance

def validate_model_trained(planner: CountyEnergyPlanner) -> CountyEnergyPlanner:
    if not planner.is_trained:
        logger.warning("model_not_trained", message="Attempt to use untrained model")
        raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    return planner

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    global planner_instance
    try:
        logger.info("application_startup", message="Starting County Energy Planning API")
        
        planner_instance = CountyEnergyPlanner()
        
        # Try to load existing model
        model_path = os.getenv("MODEL_PATH", "county_energy_model.pkl")
        if Path(model_path).exists():
            planner_instance.load_model(model_path)
            logger.info("model_loaded", 
                       path=model_path, 
                       version=planner_instance.model_version,
                       last_trained=planner_instance.last_trained)
        else:
            logger.warning("model_not_found", 
                         path=model_path,
                         message="No pre-trained model found")
        
        logger.info("application_ready", message="API is ready to serve requests")
        
    except Exception as e:
        logger.error("startup_failed", error=str(e), exc_info=True)
        planner_instance = CountyEnergyPlanner()

@app.on_event("shutdown")
async def shutdown_event():
    global planner_instance
    logger.info("application_shutdown", message="Shutting down County Energy Planning API")
    
    if planner_instance and planner_instance.is_trained:
        try:
            backup_path = f"county_energy_model_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
            planner_instance.save_model(backup_path)
            logger.info("model_backup_saved", path=backup_path)
        except Exception as e:
            logger.error("backup_failed", error=str(e))

# Metrics endpoint
@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Health check with detailed information
@app.get("/health")
async def health_check(planner: CountyEnergyPlanner = Depends(get_planner)):
    """Enhanced health check with system information"""
    try:
        model_info = planner.get_model_info()
        
        health_data = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.1.0",
            "model": {
                "status": "trained" if planner.is_trained else "untrained",
                "version": model_info.get("model_version", "unknown"),
                "last_trained": model_info.get("last_trained"),
                "cache_valid": model_info.get("cache_status", {}).get("cache_valid", False)
            },
            "system": {
                "python_version": f"{'.'.join(map(str, [3, 9, 0]))}",  # Placeholder
                "memory_usage": "N/A",  # Could add psutil for real memory info
                "uptime": "N/A"
            }
        }
        
        logger.info("health_check", status="healthy", model_trained=planner.is_trained)
        return health_data
        
    except Exception as e:
        logger.error("health_check_failed", error=str(e))
        raise HTTPException(status_code=503, detail="Health check failed")

# Enhanced training endpoint with rate limiting
@app.post("/model/train")
@limiter.limit("1/minute")  # Strict limit for training
async def train_model(
    request: Request,
    data: CountyDataList,
    background_tasks: BackgroundTasks,
    planner: CountyEnergyPlanner = Depends(get_planner)
):
    """Train the model with rate limiting"""
    try:
        logger.info("training_started", counties_count=len(data.counties))
        
        df = pd.DataFrame([county.dict() for county in data.counties])
        
        def train_task():
            try:
                start_time = time.time()
                
                metrics = planner.train_model(df)
                planner.save_model(os.getenv("MODEL_PATH", "county_energy_model.pkl"))
                
                duration = time.time() - start_time
                TRAINING_DURATION.observe(duration)
                
                logger.info("training_completed", 
                           duration=duration,
                           test_r2=metrics.get('test_r2'),
                           cv_mean=metrics.get('cv_mean'))
                
                return metrics
            except Exception as e:
                logger.error("training_failed", error=str(e), exc_info=True)
                raise
        
        background_tasks.add_task(train_task)
        
        return {
            "status": "training_started",
            "message": "Model training started in background",
            "data_points": len(df),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error("training_initiation_failed", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

# Enhanced prioritization with rate limiting and monitoring
@app.post("/counties/prioritize")
@limiter.limit("10/minute")
async def prioritize_counties(
    request: Request,
    data: CountyDataList,
    use_cache: bool = Query(True, description="Whether to use cached results"),
    planner: CountyEnergyPlanner = Depends(validate_model_trained)
):
    """Generate county prioritization with rate limiting and monitoring"""
    try:
        logger.info("prioritization_started", 
                   counties_count=len(data.counties),
                   use_cache=use_cache)
        
        df = pd.DataFrame([county.dict() for county in data.counties])
        
        # Check cache first
        if use_cache and planner._is_cache_valid():
            CACHE_HITS.inc()
            logger.info("cache_hit", message="Using cached results")
        
        results = planner.prioritize_counties(df, use_cache=use_cache)
        
        # Update metrics
        MODEL_PREDICTIONS.labels(model_version=planner.model_version).inc()
        
        logger.info("prioritization_completed",
                   counties_processed=len(data.counties),
                   top_county=results['top_counties'][0]['county_name'] if results['top_counties'] else None)
        
        return RecommendationsResponse(**results)
    
    except Exception as e:
        logger.error("prioritization_failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

# Legacy endpoint with rate limiting
@app.get("/api/county-recommendations")
@limiter.limit("20/minute")
async def get_county_recommendations(
    request: Request,
    data_source: str = Query("county_data.csv", description="Path to county data file"),
    use_cache: bool = Query(True, description="Whether to use cached results"),
    planner: CountyEnergyPlanner = Depends(validate_model_trained)
):
    """Legacy endpoint with enhanced monitoring"""
    try:
        logger.info("legacy_endpoint_called", data_source=data_source)
        
        if not Path(data_source).exists():
            logger.error("data_file_not_found", path=data_source)
            raise HTTPException(status_code=404, detail=f"Data file {data_source} not found")
        
        county_data = pd.read_csv(data_source)
        results = planner.prioritize_counties(county_data, use_cache=use_cache)
        
        MODEL_PREDICTIONS.labels(model_version=planner.model_version).inc()
        
        logger.info("legacy_endpoint_completed", counties_processed=len(county_data))
        
        return RecommendationsResponse(**results)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("legacy_endpoint_failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Single prediction with rate limiting
@app.post("/model/predict")
@limiter.limit("50/minute")
async def predict_single_county(
    request: Request,
    county: CountyData,
    planner: CountyEnergyPlanner = Depends(validate_model_trained)
):
    """Predict priority score for a single county"""
    try:
        logger.info("single_prediction", county=county.county_name)
        
        df = pd.DataFrame([county.dict()])
        results = planner.prioritize_counties(df, use_cache=False)
        
        MODEL_PREDICTIONS.labels(model_version=planner.model_version).inc()
        
        if results['top_counties']:
            prediction = results['top_counties'][0]
            response = {
                "county_name": prediction['county_name'],
                "priority_score": prediction['priority_score'],
                "cluster": prediction['cluster'],
                "energy_deficit": prediction['energy_deficit'],
                "recommendations": [tech for tech, counties in results['recommendations'].items() 
                                 if county.county_name in counties],
                "generated_at": results['generated_at']
            }
            
            logger.info("single_prediction_completed",
                       county=county.county_name,
                       priority_score=prediction['priority_score'])
            
            return response
        else:
            logger.error("single_prediction_failed", county=county.county_name)
            raise HTTPException(status_code=500, detail="Failed to generate prediction")
    
    except Exception as e:
        logger.error("single_prediction_error", county=county.county_name, error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

# Admin endpoints with strict rate limiting
@app.delete("/cache")
@limiter.limit("5/minute")
async def clear_cache(
    request: Request,
    planner: CountyEnergyPlanner = Depends(get_planner)
):
    """Clear the model's cache with rate limiting"""
    try:
        planner.clear_cache()
        logger.info("cache_cleared", message="Cache cleared successfully")
        return {
            "status": "success",
            "message": "Cache cleared successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error("cache_clear_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Model information endpoint
@app.get("/model/info")
async def get_model_info(planner: CountyEnergyPlanner = Depends(get_planner)):
    """Get detailed model information"""
    info = planner.get_model_info()
    logger.info("model_info_requested", model_version=info.get('model_version'))
    return info

# Root endpoint
@app.get("/")
async def root():
    """Enhanced root endpoint with monitoring info"""
    return {
        "name": "County Energy Planning API - Enhanced",
        "version": "1.1.0",
        "description": "Production-ready AI/ML API with monitoring and rate limiting",
        "features": [
            "Rate limiting",
            "Prometheus metrics",
            "Structured logging",
            "Caching",
            "Background processing"
        ],
        "endpoints": {
            "health": "GET /health",
            "metrics": "GET /metrics",
            "docs": "GET /docs",
            "train_model": "POST /model/train",
            "prioritize_counties": "POST /counties/prioritize",
            "single_prediction": "POST /model/predict",
            "legacy_recommendations": "GET /api/county-recommendations"
        },
        "monitoring": {
            "metrics_endpoint": "/metrics",
            "health_check": "/health",
            "structured_logs": "JSON format"
        },
        "timestamp": datetime.now().isoformat()
    }

# Error handlers with logging
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    logger.warning("endpoint_not_found", path=request.url.path, method=request.method)
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": f"The requested endpoint {request.url.path} does not exist",
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error("internal_server_error", 
                path=request.url.path, 
                method=request.method,
                error=str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )

# Rate limit error handler with custom logging
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning("rate_limit_exceeded",
                  path=request.url.path,
                  method=request.method,
                  client=request.client.host if request.client else "unknown",
                  limit=str(exc.detail))
    
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. {exc.detail}",
            "timestamp": datetime.now().isoformat()
        },
        headers={"Retry-After": "60"}
    )

# Development server
if __name__ == "__main__":
    import uvicorn
    
    # Enhanced logging for development
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("development_server_start", message="Starting development server")
    
    uvicorn.run(
        "fastapi_integration_enhanced:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", "8000")),
        reload=os.getenv("API_RELOAD", "true").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
        access_log=True
    )
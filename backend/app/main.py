# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< Updated upstream
from app.api import counties, minigrids, dashboard, analytics
=======
from app.api import (
    counties_router,
    minigrids_router,
    dashboard_router,
    recommendations_router
)
>>>>>>> Stashed changes
from config.settings import settings

app = FastAPI(
    title="Kenya Energy Dashboard API",
    description="AI-Driven Renewable Energy Allocation System",
    version="1.0.0"
)

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS + ["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
<<<<<<< Updated upstream
app.include_router(counties.router, prefix="/api/counties", tags=["counties"])
app.include_router(minigrids.router, prefix="/api/minigrids", tags=["minigrids"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
=======
app.include_router(counties_router, prefix="/api/counties", tags=["counties"])
app.include_router(minigrids_router, prefix="/api/minigrids", tags=["minigrids"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["recommendations"])
>>>>>>> Stashed changes

@app.get("/")
async def root():
    return {
        "message": "Kenya Energy Dashboard API",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "counties": "/api/counties/",
            "dashboard": "/api/dashboard/",
            "minigrids": "/api/minigrids/",
            "analytics": "/api/analytics/",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "API is running smoothly",
        "ai_service_status": settings.ai_service_status,
        "has_ai_keys": settings.has_ai_keys
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
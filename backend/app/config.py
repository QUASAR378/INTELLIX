import os
from typing import Optional

class Settings:
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Kenya Energy API"
    
    # Database Settings
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", "sqlite:///./kenya_energy.db")
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]
    
    # Data Settings
    DATA_DIR: str = os.getenv("DATA_DIR", "../data")
    
    class Config:
        case_sensitive = True

settings = Settings()
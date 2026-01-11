"""
Secure Configuration Management
This file shows how to properly handle API keys and secrets
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings with secure API key handling"""
    
    # API Keys (Optional - fallback system exists)
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    GOOGLE_AI_API_KEY: Optional[str] = os.getenv("GOOGLE_AI_API_KEY")
    
    # FastAPI Settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8002"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")  # development or production
    
    # Database (for future use)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    # CORS Settings
    ALLOWED_ORIGINS = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Alternative Vite port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",  # Production
        "http://127.0.0.1:3000",
        "https://*.app.github.dev",  # GitHub Codespaces
    ]
    
    @property
    def has_ai_keys(self) -> bool:
        """Check if any AI API keys are available"""
        return bool(self.ANTHROPIC_API_KEY or self.GOOGLE_AI_API_KEY)
    
    @property
    def ai_service_status(self) -> str:
        """Get AI service availability status"""
        if self.ANTHROPIC_API_KEY and self.GOOGLE_AI_API_KEY:
            return "Claude + Gemini Available"
        elif self.ANTHROPIC_API_KEY:
            return "Claude Available"
        elif self.GOOGLE_AI_API_KEY:
            return "Gemini Available"
        else:
            return "Using Rule-Based Fallback"
    
    @property
    def cors_origins(self) -> list:
        """Return appropriate CORS origins based on environment"""
        if self.ENVIRONMENT == "production":
            # In production, only allow specific domains
            return [
                "https://yourdomain.com",
                "https://www.yourdomain.com",
            ]
        else:
            # Development: allow localhost variations
            return self.ALLOWED_ORIGINS

# Global settings instance
settings = Settings()

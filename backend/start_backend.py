#!/usr/bin/env python3
"""
Simple Backend Starter for Energy Hackathon
Bypasses virtual environment issues by running with system Python
"""

import sys
import os
import subprocess

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Try importing required modules
    import fastapi
    import uvicorn
    print("✅ FastAPI and Uvicorn are available")
    
    # Start the server
    if __name__ == "__main__":
        print("🚀 Starting Energy Hackathon Backend...")
        print("📍 Backend will be available at: http://localhost:8003")
        print("📝 API Docs will be available at: http://localhost:8003/docs")
        
        # Run the app with proper import string for reload
        uvicorn.run("app.main:app", host="0.0.0.0", port=8003, reload=True)
        
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("🔧 Installing required packages...")
    
    # Install required packages
    subprocess.run([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn[standard]", "pydantic", "python-multipart", "aiohttp", "--break-system-packages"])
    
    print("✅ Dependencies installed. Please run this script again.")

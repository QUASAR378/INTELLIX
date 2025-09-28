# INTELLIX - Kenya Energy Dashboard (umeme AI) 🚀

**"Equitable Energy for Every Kenyan"**

A comprehensive AI-driven energy dashboard for Kenya's counties, featuring interactive maps, mini-grid simulations, and intelligent energy recommendations to guide renewable energy investments.

## 🌟 **Key Features**

- **Interactive County Map**: Click any of Kenya's 47 counties for instant analysis
- **AI-Powered Recommendations**: Claude/Gemini integration with rule-based fallback
- **Real-time Mini-Grid Simulation**: 24-hour energy generation vs. demand modeling
- **Investment Analysis**: ROI calculations and cost-benefit analysis
- **Automated Demo Flow**: One-click testing with `./test_enhanced_flow.sh`

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- npm or yarn

### **1. Clone & Setup**
```bash
git clone <your-repo-url>
cd Energy-Hackathon
```

### **2. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

### **3. Frontend Setup**
```bash
cd ../frontend
npm install
```

### **4. Environment Configuration (Optional)**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys (optional - has fallback system)
nano .env
```

### **5. Run the Demo**
```bash
# From project root
chmod +x test_enhanced_flow.sh
./test_enhanced_flow.sh
```

**That's it!** Go to http://localhost:5173 and click any county on the map!

## 🔐 **API Keys (Optional)**

The system works perfectly without API keys using our intelligent rule-based fallback. For enhanced AI analysis, you can add:

- **ANTHROPIC_API_KEY**: Claude AI integration
- **GOOGLE_AI_API_KEY**: Gemini AI integration

Add these to your `.env` file (never commit API keys to git!).

## Project Structure

```
Energy-Hackathon/
├── 📁 frontend/                    # React Application
│   ├── 📁 public/
│   │   ├── index.html
│   │   └── kenya-counties.geojson  # Kenya map data
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── KenyaMap.jsx        # Interactive map component
│   │   │   ├── CountyDetails.jsx   # County drill-down panel
│   │   │   ├── MiniGridSim.jsx     # Mini-grid simulation
│   │   │   ├── EnergyMetrics.jsx   # Charts & metrics display
│   │   │   ├── Dashboard.jsx       # Main dashboard layout
│   │   │   └── Navigation.jsx      # Header/nav component
│   │   ├── 📁 services/
│   │   │   ├── api.js              # API client functions
│   │   │   └── mapUtils.js         # Map styling utilities
│   │   ├── 📁 hooks/
│   │   │   └── useEnergyData.js    # Custom hooks for data fetching
│   │   ├── 📁 styles/
│   │   │   ├── Dashboard.css       # Component styles
│   │   │   └── Map.css             # Map-specific styles
│   │   ├── App.jsx                 # Main app component
│   │   └── index.js                # React entry point
│   ├── package.json
│   └── README.md
│
├── 📁 backend/                     # FastAPI Backend
│   ├── 📁 app/
│   │   ├── 📁 api/
│   │   │   ├── counties.py         # County data endpoints
│   │   │   ├── minigrids.py        # Mini-grid simulation endpoints
│   │   │   └── dashboard.py        # Dashboard data endpoints
│   │   ├── 📁 models/
│   │   │   ├── county.py           # County data models
│   │   │   └── minigrid.py         # Mini-grid data models
│   │   ├── 📁 services/
│   │   │   ├── data_service.py     # Data processing logic
│   │   │   └── simulation.py       # Mini-grid simulation logic
│   │   ├── main.py                 # FastAPI app entry point
│   │   └── config.py               # Configuration settings
│   ├── requirements.txt
│   └── README.md
│
├── 📁 data/                        # Static data files
│   ├── kenya-counties.geojson      # Kenya map boundaries
│   ├── sample-county-data.json     # Sample data for development
│   └── mock-apis.json              # Mock API responses
│
├── 📁 docs/                        # Documentation
│   ├── API.md                      # API documentation
│   └── SETUP.md                    # Setup instructions
│
└── README.md                       # Main project documentation
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Features

- 🗺️ Interactive Kenya county map
- 📊 Energy metrics and analytics
- ⚡ Mini-grid simulation tools
- 📈 Priority scoring system
- 🎯 County-specific recommendations

## Technologies

- **Frontend**: React, Vite, Leaflet
- **Backend**: FastAPI, Python
- **Data**: GeoJSON, JSON
- **Maps**: OpenStreetMap, Leaflet

## Documentation

- [Setup Instructions](docs/SETUP.md)
- [API Documentation](docs/API.md)

---
*Part of INTELLIX - Intelligent Solutions for Real-World Impact*

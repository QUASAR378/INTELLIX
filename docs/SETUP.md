# Setup Instructions

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- Git

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API will be available at `http://localhost:8000`

## Data Files

Ensure the following data files are in the `data/` directory:
- `kenya-counties.geojson` - Kenya map boundaries
- `dummy/counties.json` - Sample county data

## Development

- Frontend: React + Vite
- Backend: FastAPI
- Data: JSON files (can be replaced with database)
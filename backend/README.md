Kenya Energy Backend API

FastAPI backend for the Kenya Energy Hackathon project.

<!-- SET UP
 -->

1. Install dependencies:

pip install -r requirements.txt


2. Run the development server:

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


<!-- API ENDPOINTS -->

`/` - Root endpoint
`/health` - Health check
`/api/counties/` - County data endpoints
 `/api/minigrids/` - Mini-grid simulation endpoints
`/api/dashboard/` - Dashboard data endpoints

<!-- DOCUMERNTATION -->

API documentation is available at `http://localhost:8000/docs` when running the server.
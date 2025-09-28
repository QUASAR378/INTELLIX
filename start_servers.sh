#!/bin/bash

echo "🚀 Starting Kenya Energy Dashboard..."

# Activate virtual environment
source /home/lonzieee/Documents/CODE/Energy-Hackathon/.venv/bin/activate

# Function to start backend
start_backend() {
    echo "📡 Starting Backend (FastAPI)..."
    cd /home/lonzieee/Documents/CODE/Energy-Hackathon/backend
    
    # Use backend virtual environment
    if [ ! -d "venv" ]; then
        echo "Creating backend virtual environment..."
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    
    PYTHONPATH=/home/lonzieee/Documents/CODE/Energy-Hackathon/backend python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting Frontend (Vite)..."
    cd /home/lonzieee/Documents/CODE/Energy-Hackathon/frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
}

# Start both servers
start_backend
sleep 3
start_frontend

echo ""
echo "✅ Both servers are starting..."
echo "📡 Backend: http://localhost:8002"
echo "🌐 Frontend: http://localhost:5173"
echo "📚 API Docs: http://localhost:8002/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user input to stop
wait
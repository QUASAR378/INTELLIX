#!/bin/bash

# Energy Hackathon - Enhanced County Flow Test Script
echo " Testing Enhanced County Selection Flow..."

# Start the backend in the background
cd /home/lonzieee/Documents/CODE/Energy-Hackathon/backend
echo " Starting FastAPI backend..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start the frontend in the background
cd /home/lonzieee/Documents/CODE/Energy-Hackathon/frontend
echo " Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

echo "Both servers started!"
echo " Frontend: http://localhost:5173"
echo " Backend API: http://localhost:8002"
echo ""
echo " NEW FLOW TO TEST:"
echo "1. Go to http://localhost:5173"
echo "2. Click on ANY county on the map"
echo "3. Watch the 1-minute simulation progress bar"
echo "4. See AI analysis appear automatically after simulation"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo ' Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

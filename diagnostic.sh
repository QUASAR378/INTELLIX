#!/bin/bash

echo "🔍 Kenya Energy Dashboard - Connection Diagnostic"
echo "=================================================="

echo ""
echo "1. Backend Server Status:"
echo "-------------------------"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend: HEALTHY (Port 8002)"
    curl -s http://localhost:8002/health | jq '.'
else
    echo "❌ Backend: FAILED (Port 8002) - Status: $BACKEND_STATUS"
fi

echo ""
echo "2. Frontend Server Status:"
echo "--------------------------"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: HEALTHY (Port 3000)"
else
    echo "❌ Frontend: FAILED (Port 3000) - Status: $FRONTEND_STATUS"
fi

echo ""
echo "3. API Endpoints Test:"
echo "----------------------"
echo "Counties API:"
curl -s http://localhost:8002/api/counties/ | jq '.[0].county_name' || echo "❌ Counties API failed"

echo ""
echo "Dashboard API:"
curl -s http://localhost:8002/api/dashboard/overview | jq '.counties_analyzed' || echo "❌ Dashboard API failed"

echo ""
echo "4. Cross-Origin Request Test:"
echo "-----------------------------"
echo "Testing CORS from localhost:3000 to localhost:8002..."
curl -s -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:8002/health

echo ""
echo ""
echo "🎯 Quick Access:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8002/docs"
echo "Health:   http://localhost:8002/health"

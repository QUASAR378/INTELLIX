#!/bin/bash

# Test script for AI API endpoints
# Tests without API keys (fallback mode) and with API keys (if available)

echo "🧪 Testing INTELLIX AI APIs"
echo "======================================"
echo ""

BASE_URL="http://localhost:8002"

# Test data
COUNTY_DATA='{
  "county_name": "Turkana",
  "population": 926976,
  "hospitals": 15,
  "schools": 210,
  "blackout_freq": 60,
  "economic_activity": 35,
  "grid_distance": 45,
  "current_kwh": 25000000,
  "solar_irradiance": 6.8
}'

# Check if backend is running
echo "1️⃣  Checking Backend Connection..."
if curl -s "$BASE_URL/health" > /dev/null; then
    echo "✅ Backend is running on $BASE_URL"
else
    echo "❌ Backend is not running on $BASE_URL"
    echo "   Start it with: cd backend && python -m uvicorn app.main:app --port 8002"
    exit 1
fi

echo ""
echo "2️⃣  Testing AI Analysis Endpoint (Fallback Mode)..."
echo "   Endpoint: POST $BASE_URL/api/recommendations/ai-analysis"
echo "   County: Turkana"
echo "   Expected: ai_status = 'fallback_mode' (no API keys)"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/recommendations/ai-analysis" \
  -H "Content-Type: application/json" \
  -d "$COUNTY_DATA")

echo "Response:"
echo "$RESPONSE" | python -m json.tool 2>/dev/null || echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "fallback_mode\|operational"; then
    echo ""
    echo "✅ AI API Working!"
else
    echo ""
    echo "⚠️  Unexpected response"
fi

echo ""
echo "3️⃣  Testing Original Recommendations Endpoint..."
echo "   Endpoint: POST $BASE_URL/api/recommendations/recommendations"
echo ""

RESPONSE2=$(curl -s -X POST "$BASE_URL/api/recommendations/recommendations" \
  -H "Content-Type: application/json" \
  -d "$COUNTY_DATA")

echo "Response:"
echo "$RESPONSE2" | python -m json.tool 2>/dev/null || echo "$RESPONSE2"

echo ""
echo "4️⃣  Checking AI Service Status..."
STATUS=$(curl -s "$BASE_URL/health" | grep -o "fallback\|Claude\|Gemini" || echo "checking...")
echo "AI Service: $STATUS"

echo ""
echo "======================================"
echo "✅ Test Complete!"
echo ""
echo "📝 Notes:"
echo "  - Without API keys: Uses rule-based fallback (always works)"
echo "  - With Claude key: export ANTHROPIC_API_KEY=sk-..."
echo "  - With Gemini key: export GOOGLE_AI_API_KEY=AIza..."
echo ""

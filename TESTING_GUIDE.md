# 🧪 INTELLIX - Testing & Verification Guide

## Quick Start - Test Everything Works

### **1. Start the Backend**
```bash
cd backend
pip install -r requirements.txt  # If not done
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8002
INFO:     Application startup complete
```

### **2. Start the Frontend**
```bash
cd ../frontend
npm install  # If not done
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### **3. Open in Browser**
```
http://localhost:5173
```

---

## ✅ Test Scenarios

### **Scenario 1: Map & County Selection**
```
✅ What to test:
- Load dashboard
- Map appears with 47 county markers
- Markers have different colors (priority-based)
- Click on a county (e.g., Turkana)

🎯 Expected result:
- County detail panel opens
- Three tabs appear: Overview, Simulation, AI
- Shows county data (population, hospitals, etc.)
- Simulation runs automatically (24h forecast chart)
- AI recommendation loads (within 2-5 seconds)

❌ If fails:
- Check backend is running: curl http://localhost:8002/health
- Check browser console for errors (F12)
- Check backend logs for API errors
```

### **Scenario 2: Mini-Grid Simulation**
```
✅ What to test:
- After selecting county, go to "Simulation" tab
- See generation and demand chart
- See battery SOC (state of charge) area chart
- View metrics: efficiency, cost savings, ROI

🎯 Expected result:
- Charts show realistic 24-hour patterns
- Solar generation peaks around 14:00
- Battery charges during peak solar
- Efficiency score 70-95%
- Cost savings shown in USD

❌ If fails:
- Check POST /api/minigrids/simulate works:
  curl -X POST http://localhost:8002/api/minigrids/simulate \
    -H "Content-Type: application/json" \
    -d '{"solar_capacity_kw":100,"battery_capacity_kwh":400}'
```

### **Scenario 3: AI Recommendations**
```
✅ What to test:
- Click county, go to "AI Recommendations" tab
- See priority level (high/medium/low)
- See solution type (solar_minigrid/hybrid/etc)
- See investment needed (USD)
- See timeline and ROI%
- See 3-5 specific recommendations

🎯 Expected result:
- Recommendations appear within 2-5 seconds
- Data matches county characteristics
- Priority matches energy access needs
- Investment is reasonable for county
- ROI is 12-20% typically

❌ If fails:
- Check AI endpoint:
  curl -X POST http://localhost:8002/api/recommendations/ai-analysis \
    -H "Content-Type: application/json" \
    -d '{...county data...}'
- If returns error, should still show rule-based recommendation
```

### **Scenario 4: Analytics Page**
```
✅ What to test:
- Click "Analytics" in navigation
- See national-level data
- Grid performance metrics
- County comparisons
- Performance analytics

🎯 Expected result:
- All data loads within 3 seconds
- Charts show realistic trends
- Can filter by county or region
- Multiple tabs with different views

❌ If fails:
- Check analytics endpoints:
  curl http://localhost:8002/api/analytics/grid?period=7d
  curl http://localhost:8002/api/dashboard/stats
```

### **Scenario 5: Recommendations Form Page**
```
✅ What to test:
- Navigate to /recommendations
- See form with county name field
- Type county name (e.g., "turkana")
- See autocomplete dropdown
- Select county
- Form auto-fills with county data
- Submit form

🎯 Expected result:
- County autocomplete works
- Form fills with real data
- AI analysis generates recommendations
- Results show on same page

❌ If fails:
- Check endpoints:
  curl http://localhost:8002/api/recommendations/counties/search?q=tur
  curl http://localhost:8002/api/recommendations/counties/Turkana/data
```

### **Scenario 6: Navigation & State Persistence**
```
✅ What to test:
- Select county on dashboard
- Navigate to /analytics
- Go back to dashboard
- Check if county is still selected

🎯 Expected result:
- County selection persists
- View switches correctly between pages
- No data loss on navigation
- sessionStorage working

❌ If fails:
- Open browser DevTools → Application → sessionStorage
- Check if "selectedCounty" exists
- Check console for sessionStorage errors
```

---

## 📊 API Endpoint Verification

### **Quick Health Check**
```bash
# Backend is running
curl http://localhost:8002/health

# Expected:
# {
#   "status": "healthy",
#   "ai_service_status": "Using Rule-Based Fallback"
# }
```

### **Test Each API Endpoint**

#### **1. Counties API**
```bash
# Get all counties
curl http://localhost:8002/api/counties/

# Get specific county
curl http://localhost:8002/api/counties/Turkana

# Get map data
curl http://localhost:8002/api/counties/map/data
```

#### **2. Dashboard API**
```bash
# Overview
curl http://localhost:8002/api/dashboard/overview

# Stats
curl http://localhost:8002/api/dashboard/stats

# Real-time metrics
curl http://localhost:8002/api/dashboard/real-time-metrics
```

#### **3. Minigrids API**
```bash
# Simulate
curl -X POST http://localhost:8002/api/minigrids/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "solar_capacity_kw": 100,
    "battery_capacity_kwh": 400,
    "households_served": 5000,
    "location": "Turkana"
  }'
```

#### **4. Recommendations API**
```bash
# AI Analysis
curl -X POST http://localhost:8002/api/recommendations/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{
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

# Search counties
curl 'http://localhost:8002/api/recommendations/counties/search?q=tur'

# Get county data
curl 'http://localhost:8002/api/recommendations/counties/Turkana/data'
```

#### **5. Analytics API**
```bash
# Grid analytics
curl 'http://localhost:8002/api/analytics/grid?period=7d'

# Performance analytics
curl -X POST http://localhost:8002/api/analytics/performance \
  -H "Content-Type: application/json" \
  -d '{"timeRange": "7d", "county": "all"}'
```

---

## 🐛 Troubleshooting

### **Issue: Backend not connecting**
```
Error: "Backend Connection Failed"

✅ Solution:
1. Check backend is running:
   curl http://localhost:8002/health

2. If not running:
   cd backend
   python -m uvicorn app.main:app --port 8002

3. Check port 8002 is not blocked:
   lsof -i :8002 (Mac/Linux)
   netstat -ano | findstr :8002 (Windows)

4. If port in use, kill process or change port:
   python -m uvicorn app.main:app --port 8003
```

### **Issue: API returns 404**
```
Error: 404 Not Found

✅ Solution:
1. Check endpoint spelling matches exactly
2. Verify backend port matches frontend config (8002)
3. Check backend imports all routers:
   - counties.py ✓
   - minigrids.py ✓
   - dashboard.py ✓
   - recommendations.py ✓
   - analytics.py ✓
```

### **Issue: Slow API responses**
```
Problem: Queries take >5 seconds

✅ Solution:
1. Check if running simulation (2-5 sec normal)
2. Check AI API (Claude/Gemini) being used
3. Add API key if available:
   export ANTHROPIC_API_KEY="sk-..."
4. Or let it use fast rule-based fallback
```

### **Issue: AI recommendations not appearing**
```
Problem: AI tab shows loading then blank

✅ Solution:
1. Check console error (F12 → Console)
2. Check if fallback working:
   - Should show rule-based recommendation anyway
3. Test endpoint directly:
   curl -X POST http://localhost:8002/api/recommendations/ai-analysis \
     -H "Content-Type: application/json" \
     -d '{...}'
4. Check backend logs for errors
```

### **Issue: Map not showing**
```
Problem: Map component shows blank or error

✅ Solution:
1. Check /api/counties/map/data returns data:
   curl http://localhost:8002/api/counties/map/data
2. Check browser console for map library errors
3. Check kenya-counties.geojson is in frontend/public/
4. Restart frontend: Ctrl+C then npm run dev
```

---

## 📈 Performance Testing

### **Measure Page Load Time**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Watch waterfall chart

Expected times:
├─ Page load: <1 second
├─ Counties data: <200ms
├─ Dashboard data: <500ms
├─ Map render: <2 seconds
└─ Ready for interaction: <3 seconds
```

### **Test with Slow Network**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Click throttling dropdown
4. Select "Slow 3G"
5. Reload page
6. Test if fallback data appears

Expected: Graceful degradation
├─ App still works
├─ Fallback data used
├─ Loading indicators shown
└─ No console errors
```

---

## ✅ Complete System Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads on http://localhost:5173
- [ ] Backend connection detected (health check passes)
- [ ] Map displays with 47 county markers
- [ ] Can click county marker
- [ ] County details panel opens
- [ ] Simulation chart displays
- [ ] AI recommendations appear
- [ ] Navigation between pages works
- [ ] County selection persists on navigation
- [ ] Analytics page loads all data
- [ ] Recommendations form works end-to-end
- [ ] No console errors (F12)
- [ ] No backend 500 errors
- [ ] Fallback data appears if API fails
- [ ] All 5 API types work (counties, dashboard, minigrids, recommendations, analytics)

---

## 🎯 Manual Testing Workflow

```
1️⃣  Open App
   http://localhost:5173
   
2️⃣  Verify Backend Connection
   Should see dashboard (not error page)
   
3️⃣  Select County from Map
   Click on Turkana or Nairobi
   
4️⃣  Review Overview Tab
   Check county data displays
   
5️⃣  Go to Simulation Tab
   Watch 24-hour forecast chart
   
6️⃣  Go to AI Tab
   Review recommendations
   
7️⃣  Navigate to Analytics
   Check national-level data
   
8️⃣  Go to Recommendations Page
   Test form with different county
   
9️⃣  Refresh Page
   Check selection persists
   
🔟 Go Back to Dashboard
   Should still remember selected county
```

---

## 🚀 Production Test (Before Deployment)

- [ ] All tests pass in Development Mode
- [ ] Environment variables set correctly (ANTHROPIC_API_KEY, etc.)
- [ ] CORS configured for production domain
- [ ] Database connections verified
- [ ] API responses under 5 seconds
- [ ] Fallback systems work
- [ ] Error pages render properly
- [ ] Mobile responsive on all pages
- [ ] No console errors on desktop/mobile
- [ ] Security headers configured

---

**Testing Status**: ✅ Ready to Test  
**All Systems**: ✅ Connected  
**Fallbacks**: ✅ In Place

from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/")
async def get_alerts():
    """Get system alerts and notifications"""
    
    # Generate realistic sample alerts
    alerts = [
        {
            "id": 1,
            "type": "critical",
            "severity": "high",
            "title": "Critical Power Shortage - Turkana County",
            "message": "Energy demand exceeding generation capacity by 35%. Immediate load shedding may be required. Current demand: 42MW, Available: 27MW.",
            "timestamp": (datetime.now() - timedelta(minutes=8)).isoformat(),
            "county": "Turkana",
            "status": "active",
            "action_required": True
        },
        {
            "id": 2,
            "type": "warning",
            "severity": "medium",
            "title": "Transformer Overload Warning - Mombasa",
            "message": "Transformer MBS-T4 operating at 92% capacity. Recommend load redistribution to prevent equipment failure.",
            "timestamp": (datetime.now() - timedelta(minutes=23)).isoformat(),
            "county": "Mombasa",
            "status": "active",
            "action_required": True
        },
        {
            "id": 3,
            "type": "info",
            "severity": "low",
            "title": "Scheduled Maintenance - Nairobi Grid Section",
            "message": "Planned maintenance for Nairobi grid section B-7 on Sunday, January 19, 2026 from 6:00 AM to 2:00 PM. Estimated 2,400 customers affected.",
            "timestamp": (datetime.now() - timedelta(hours=1, minutes=15)).isoformat(),
            "county": "Nairobi",
            "status": "scheduled",
            "action_required": False
        },
        {
            "id": 4,
            "type": "success",
            "severity": "low",
            "title": "Solar Farm Commissioned - Samburu",
            "message": "New 2.5MW solar photovoltaic array successfully commissioned. Expected to power 3,200 households with 98% reliability.",
            "timestamp": (datetime.now() - timedelta(hours=3, minutes=42)).isoformat(),
            "county": "Samburu",
            "status": "resolved",
            "action_required": False
        },
        {
            "id": 5,
            "type": "critical",
            "severity": "high",
            "title": "Blackout Frequency Spike - Garissa",
            "message": "Power outage frequency increased by 47% over the past 7 days (18 incidents vs. 12 average). Investigation team dispatched.",
            "timestamp": (datetime.now() - timedelta(minutes=45)).isoformat(),
            "county": "Garissa",
            "status": "active",
            "action_required": True
        },
        {
            "id": 6,
            "type": "warning",
            "severity": "medium",
            "title": "Battery Storage Critical - Marsabit Mini-Grid",
            "message": "Mini-grid battery bank at 22% capacity. Wind generation below forecast. Diesel backup may be required within 6 hours.",
            "timestamp": (datetime.now() - timedelta(hours=1, minutes=8)).isoformat(),
            "county": "Marsabit",
            "status": "active",
            "action_required": True
        },
        {
            "id": 7,
            "type": "info",
            "severity": "low",
            "title": "Energy Access Improvement - Kilifi",
            "message": "Grid extension project Phase 2 complete. 1,850 new connections established. Energy access now at 76% (up from 68%).",
            "timestamp": (datetime.now() - timedelta(hours=4, minutes=30)).isoformat(),
            "county": "Kilifi",
            "status": "resolved",
            "action_required": False
        },
        {
            "id": 8,
            "type": "warning",
            "severity": "medium",
            "title": "Voltage Fluctuation Detected - Kisumu",
            "message": "Voltage instability detected on KSM-F2 feeder. Range: 217V-242V (target: 230V±5%). Automatic voltage regulator engaged.",
            "timestamp": (datetime.now() - timedelta(hours=2, minutes=20)).isoformat(),
            "county": "Kisumu",
            "status": "active",
            "action_required": True
        },
        {
            "id": 9,
            "type": "success",
            "severity": "low",
            "title": "Grid Restoration Complete - Machakos",
            "message": "Emergency repairs completed on MCK-T7 transmission line. All 5,600 affected customers restored to service.",
            "timestamp": (datetime.now() - timedelta(hours=6, minutes=15)).isoformat(),
            "county": "Machakos",
            "status": "resolved",
            "action_required": False
        },
        {
            "id": 10,
            "type": "info",
            "severity": "low",
            "title": "Peak Demand Forecast - Nakuru",
            "message": "ML model predicts 18% demand increase during evening peak (6-9 PM). Pre-positioning standby generators.",
            "timestamp": (datetime.now() - timedelta(hours=5, minutes=5)).isoformat(),
            "county": "Nakuru",
            "status": "scheduled",
            "action_required": False
        },
        {
            "id": 11,
            "type": "warning",
            "severity": "medium",
            "title": "Weather Alert - Potential Impact on Solar Generation",
            "message": "Heavy cloud cover forecast for next 48 hours in Kajiado region. Solar generation may drop by 40-60%. Backup sources on standby.",
            "timestamp": (datetime.now() - timedelta(hours=7, minutes=30)).isoformat(),
            "county": "Kajiado",
            "status": "active",
            "action_required": False
        },
        {
            "id": 12,
            "type": "success",
            "severity": "low",
            "title": "Smart Meter Deployment Milestone - Kiambu",
            "message": "10,000th smart meter installed. Real-time monitoring now covers 87% of county households. Data accuracy improved by 23%.",
            "timestamp": (datetime.now() - timedelta(days=1, hours=2)).isoformat(),
            "county": "Kiambu",
            "status": "resolved",
            "action_required": False
        }
    ]
    
    return {
        "status": "success",
        "alerts": alerts,
        "total_count": len(alerts),
        "unread_count": sum(1 for a in alerts if a["status"] == "active"),
        "last_updated": datetime.now().isoformat()
    }

@router.get("/stats")
async def get_alert_stats():
    """Get alert statistics"""
    return {
        "total_alerts": 127,
        "active_alerts": 18,
        "resolved_alerts": 89,
        "scheduled_alerts": 20,
        "critical_alerts": 5,
        "by_type": {
            "warning": 42,
            "info": 38,
            "success": 32,
            "critical": 15
        },
        "by_county": {
            "Nairobi": 23,
            "Mombasa": 18,
            "Kisumu": 14,
            "Turkana": 12,
            "Garissa": 9,
            "Others": 51
        },
        "last_24_hours": {
            "new_alerts": 12,
            "resolved_alerts": 15,
            "escalated_alerts": 2
        }
    }

"""
AI Agent Service for Real-time Energy Recommendations
Integrates with Claude/Gemini for intelligent analysis
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import aiohttp
from pydantic import BaseModel
from config.settings import settings

class CountyAnalysisRequest(BaseModel):
    county_name: str
    population: int
    blackout_frequency: float
    solar_irradiance: float
    economic_activity_index: float
    grid_distance: float
    hospitals: int
    schools: int
    current_kwh: float

class AIRecommendation(BaseModel):
    priority_level: str
    solution_type: str
    investment_needed: float
    timeline: str
    roi_percentage: float
    recommendations: List[str]
    reasoning: str
    confidence_score: float

class AIAgentService:
    def __init__(self):
        # Use secure configuration
        self.claude_api_key = settings.ANTHROPIC_API_KEY
        self.gemini_api_key = settings.GOOGLE_AI_API_KEY
        self.claude_url = "https://api.anthropic.com/v1/messages"
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        
    async def get_county_recommendations(self, county_data: CountyAnalysisRequest) -> AIRecommendation:
        """Get AI-powered recommendations for a county based on its energy profile"""
        
        # Prepare the prompt with county data
        prompt = self._create_analysis_prompt(county_data)
        
        # Try Claude first, fallback to Gemini, then to rule-based system
        try:
            if self.claude_api_key:
                return await self._get_claude_recommendation(prompt, county_data)
            elif self.gemini_api_key:
                return await self._get_gemini_recommendation(prompt, county_data)
            else:
                return self._get_rule_based_recommendation(county_data)
        except Exception as e:
            print(f"AI service error: {e}")
            return self._get_rule_based_recommendation(county_data)
    
    def _create_analysis_prompt(self, county_data: CountyAnalysisRequest) -> str:
        return f"""
You are an expert energy systems analyst for Kenya's renewable energy planning. Analyze the following county data and provide specific, actionable recommendations for energy infrastructure development.

County: {county_data.county_name}
Population: {county_data.population:,}
Blackout Frequency: {county_data.blackout_frequency} outages/month
Solar Irradiance: {county_data.solar_irradiance} kWh/m²/day
Economic Activity Index: {county_data.economic_activity_index} (0-1 scale)
Distance to Grid: {county_data.grid_distance} km
Healthcare Facilities: {county_data.hospitals}
Schools: {county_data.schools}
Current Energy Access: {county_data.current_kwh} kWh/month

Based on this data, provide:
1. Priority Level (high/medium/low)
2. Recommended Solution Type (solar_minigrid/grid_extension/hybrid_solution/grid_optimization)
3. Estimated Investment Needed (USD)
4. Implementation Timeline
5. Expected ROI percentage
6. 3-5 specific actionable recommendations
7. Brief reasoning for your recommendations
8. Confidence score (0-100)

Consider factors like:
- Cost-effectiveness based on population density and grid distance
- Reliability needs for healthcare and education facilities
- Economic viability and local capacity for maintenance
- Environmental impact and sustainability
- Social acceptance and community ownership models

Respond in JSON format matching this structure:
{
  "priority_level": "high/medium/low",
  "solution_type": "solution_name",
  "investment_needed": 0,
  "timeline": "X months",
  "roi_percentage": 0.0,
  "recommendations": ["rec1", "rec2", "rec3"],
  "reasoning": "explanation",
  "confidence_score": 0.0
}
"""

    async def _get_claude_recommendation(self, prompt: str, county_data: CountyAnalysisRequest) -> AIRecommendation:
        """Get recommendation from Claude API"""
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.claude_api_key,
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": "claude-3-sonnet-20240229",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.claude_url, headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result["content"][0]["text"]
                    
                    # Parse JSON response
                    try:
                        recommendation_data = json.loads(content)
                        return AIRecommendation(**recommendation_data)
                    except json.JSONDecodeError:
                        # Fallback if JSON parsing fails
                        return self._get_rule_based_recommendation(county_data)
                else:
                    raise Exception(f"Claude API error: {response.status}")

    async def _get_gemini_recommendation(self, prompt: str, county_data: CountyAnalysisRequest) -> AIRecommendation:
        """Get recommendation from Gemini API"""
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 1000
            }
        }
        
        url = f"{self.gemini_url}?key={self.gemini_api_key}"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Parse JSON response
                    try:
                        recommendation_data = json.loads(content)
                        return AIRecommendation(**recommendation_data)
                    except json.JSONDecodeError:
                        return self._get_rule_based_recommendation(county_data)
                else:
                    raise Exception(f"Gemini API error: {response.status}")

    def _get_rule_based_recommendation(self, county_data: CountyAnalysisRequest) -> AIRecommendation:
        """Fallback rule-based recommendation system"""
        
        # Calculate priority based on multiple factors
        priority_score = 0
        if county_data.blackout_frequency > 10:
            priority_score += 30
        elif county_data.blackout_frequency > 5:
            priority_score += 20
        else:
            priority_score += 10
            
        if county_data.grid_distance > 50:
            priority_score += 25
        elif county_data.grid_distance > 20:
            priority_score += 15
        else:
            priority_score += 5
            
        if county_data.economic_activity_index < 0.5:
            priority_score += 20
        else:
            priority_score += 10
            
        # Critical infrastructure bonus
        if county_data.hospitals > 5 or county_data.schools > 20:
            priority_score += 15
            
        # Determine solution type
        if county_data.grid_distance > 100:
            solution_type = "solar_minigrid"
            base_cost = 1500 * county_data.population  # $1.5k per person for remote areas
        elif county_data.grid_distance > 30:
            solution_type = "hybrid_solution"
            base_cost = 1200 * county_data.population
        elif county_data.blackout_frequency > 8:
            solution_type = "grid_optimization"
            base_cost = 800 * county_data.population
        else:
            solution_type = "grid_extension"
            base_cost = 1000 * county_data.population
            
        # Adjust cost based on solar irradiance and economic activity
        cost_multiplier = 1.0
        if county_data.solar_irradiance > 6:
            cost_multiplier *= 0.85  # Lower cost with high solar
        if county_data.economic_activity_index > 0.7:
            cost_multiplier *= 1.15  # Higher investment for economic centers
            
        investment_needed = base_cost * cost_multiplier
        
        # Calculate ROI based on economic activity and population
        base_roi = 8.0  # Base 8% ROI
        if county_data.economic_activity_index > 0.7:
            base_roi += 4.0
        if county_data.population > 100000:
            base_roi += 2.0
            
        # Generate recommendations
        recommendations = []
        if solution_type == "solar_minigrid":
            recommendations = [
                f"Install {int(county_data.population * 0.5)}kW solar mini-grid system",
                "Implement battery storage for 12-hour autonomy",
                "Establish local technician training program",
                "Create community ownership structure"
            ]
        elif solution_type == "hybrid_solution":
            recommendations = [
                "Deploy hybrid solar-grid system with smart switching",
                "Install energy-efficient LED lighting for public facilities",
                "Implement demand management system",
                "Establish micro-finance program for connections"
            ]
        elif solution_type == "grid_optimization":
            recommendations = [
                "Upgrade transformer capacity and distribution lines",
                "Install smart meters for demand monitoring",
                "Implement automated fault detection system",
                "Add renewable energy integration capabilities"
            ]
        else:  # grid_extension
            recommendations = [
                f"Extend grid infrastructure {county_data.grid_distance}km",
                "Install substations for reliable distribution",
                "Implement smart grid technology",
                "Add backup power systems for critical facilities"
            ]
            
        # Determine priority level
        if priority_score >= 70:
            priority_level = "high"
        elif priority_score >= 40:
            priority_level = "medium"
        else:
            priority_level = "low"
            
        timeline = "12-18 months" if priority_level == "high" else "18-24 months"
        
        reasoning = f"Based on {county_data.blackout_frequency} outages/month, {county_data.grid_distance}km grid distance, and economic activity index of {county_data.economic_activity_index}, {solution_type} is recommended for optimal cost-effectiveness and reliability."
        
        return AIRecommendation(
            priority_level=priority_level,
            solution_type=solution_type,
            investment_needed=investment_needed,
            timeline=timeline,
            roi_percentage=base_roi,
            recommendations=recommendations,
            reasoning=reasoning,
            confidence_score=85.0
        )

# Global instance
ai_agent = AIAgentService()
import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  FiCpu,
  FiTarget,
  FiSun,
  FiZap,
  FiGrid,
  FiSettings,
  FiBattery,
  FiActivity,
  FiList,
  FiAperture
} from 'react-icons/fi';

const AIAnalysis = ({ countyData, onRecommendationReceived }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [error, setError] = useState(null);

  // Auto-analyze when county data changes
  useEffect(() => {
    if (countyData && countyData.county_name) {
      analyzeCounty();
    }
  }, [countyData]);

  const analyzeCounty = async () => {
    if (!countyData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await dashboardAPI.getAIAnalysis(countyData);
      const recommendation = response.data;
      
      setAiRecommendation(recommendation);
      
      // Add to analysis history
      setAnalysisHistory(prev => [
        {
          ...recommendation,
          id: Date.now(),
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 4) // Keep last 5 analyses
      ]);

      
      if (onRecommendationReceived) {
        onRecommendationReceived(recommendation);
      }

    } catch (error) {
      console.error('AI Analysis failed:', error);
      setError('Failed to get AI recommendations. Using fallback analysis.');
      
      
      const fallbackRecommendation = generateFallbackRecommendation(countyData);
      setAiRecommendation(fallbackRecommendation);
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackRecommendation = (data) => {
    // Simple rule-based fallback
    let priority = 'medium';
    let solution = 'grid_extension';
    
    if (data.blackout_frequency > 10 || data.grid_distance > 100) {
      priority = 'high';
      solution = 'solar_minigrid';
    }
    
    return {
      county: data.county_name,
      ai_recommendation: {
        priority_level: priority,
        solution_type: solution,
        investment_needed: data.population * 1000,
        timeline: '12-18 months',
        roi_percentage: 12.5,
        recommendations: [
          'Implement solar energy solution',
          'Establish local maintenance capacity',
          'Create community engagement program'
        ],
        reasoning: 'Fallback analysis based on basic criteria',
        confidence_score: 75
      },
      status: 'fallback'
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getSolutionIcon = (solutionType) => {
    const iconProps = { className: "w-6 h-6" };
    switch (solutionType) {
      case 'solar_minigrid': return <FiSun {...iconProps} />;
      case 'grid_extension': return <FiGrid {...iconProps} />;
      case 'hybrid_solution': return <FiZap {...iconProps} />;
      case 'grid_optimization': return <FiSettings {...iconProps} />;
      default: return <FiBattery {...iconProps} />;
    }
  };

  if (!countyData) {
    return (
      <div className="energy-card">
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2 flex justify-center">
            <FiCpu className="w-12 h-12" />
          </div>
          <p>Select a county to get AI-powered recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="energy-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <FiCpu className="w-5 h-5" /> AI-Powered Energy Analysis
            </h2>
            <p className="text-gray-600 text-sm">
              Real-time recommendations for {countyData.county_name}
            </p>
          </div>
          <button
            onClick={analyzeCounty}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isAnalyzing 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <span className="flex items-center gap-2">
              {isAnalyzing ? (
                <>
                  <FiActivity className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <FiActivity className="w-4 h-4" /> Re-analyze
                </>
              )}
            </span>
          </button>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FiActivity className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendation */}
      {aiRecommendation && aiRecommendation.ai_recommendation && (
        <div className="energy-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">
              <FiTarget className="w-5 h-5 inline mr-2" /> AI Recommendation
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              getPriorityColor(aiRecommendation.ai_recommendation.priority_level)
            }`}>
              {aiRecommendation.ai_recommendation.priority_level.toUpperCase()} PRIORITY
            </div>
          </div>

          {/* Solution Overview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl text-gray-700">
                {getSolutionIcon(aiRecommendation.ai_recommendation.solution_type)}
              </span>
              <div>
                <div className="font-semibold text-gray-800 capitalize">
                  {aiRecommendation.ai_recommendation.solution_type.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-600">
                  Confidence: {aiRecommendation.ai_recommendation.confidence_score}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-white border border-gray-200 px-3 py-2 text-center">
                <div className="text-base font-semibold text-gray-900">
                  ${aiRecommendation.ai_recommendation.investment_needed?.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Investment Needed</div>
              </div>
              <div className="rounded-md bg-white border border-gray-200 px-3 py-2 text-center">
                <div className="text-base font-semibold text-gray-900">
                  {aiRecommendation.ai_recommendation.roi_percentage}%
                </div>
                <div className="text-xs text-gray-600">Expected ROI</div>
              </div>
              <div className="rounded-md bg-white border border-gray-200 px-3 py-2 text-center">
                <div className="text-base font-semibold text-gray-900">
                  {aiRecommendation.ai_recommendation.timeline}
                </div>
                <div className="text-xs text-gray-600">Timeline</div>
              </div>
            </div>
          </div>

          {/* Specific Recommendations */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
              <FiList className="w-4 h-4" /> Specific Recommendations
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {aiRecommendation.ai_recommendation.recommendations?.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* AI Reasoning */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
              <FiAperture className="w-4 h-4" /> AI Reasoning
            </h4>
            <p className="text-gray-700 text-sm">
              {aiRecommendation.ai_recommendation.reasoning}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIAnalysis;
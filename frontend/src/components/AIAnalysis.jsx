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
  FiBarChart2,
  FiBriefcase,
  FiClock,
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
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

        {/* Input Data Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5" /> Analysis Input Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Population:</span>
              <span className="font-semibold ml-2">{countyData.population?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Blackouts/month:</span>
              <span className="font-semibold ml-2">{countyData.blackout_frequency}</span>
            </div>
            <div>
              <span className="text-gray-600">Solar Irradiance:</span>
              <span className="font-semibold ml-2">{countyData.solar_irradiance} kWh/m²/day</span>
            </div>
            <div>
              <span className="text-gray-600">Grid Distance:</span>
              <span className="font-semibold ml-2">{countyData.grid_distance} km</span>
            </div>
          </div>
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
      {aiRecommendation && (
        <div className="energy-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              <FiTarget className="w-5 h-5 inline mr-2" /> AI Recommendation
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              getPriorityColor(aiRecommendation.ai_recommendation.priority_level)
            }`}>
              {aiRecommendation.ai_recommendation.priority_level.toUpperCase()} PRIORITY
            </div>
          </div>

          {/* Solution Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${aiRecommendation.ai_recommendation.investment_needed?.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Investment Needed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {aiRecommendation.ai_recommendation.roi_percentage}%
                </div>
                <div className="text-sm text-green-700">Expected ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {aiRecommendation.ai_recommendation.timeline}
                </div>
                <div className="text-sm text-purple-700">Timeline</div>
              </div>
            </div>
          </div>

          {/* Specific Recommendations */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiList className="w-5 h-5" /> Specific Recommendations
            </h4>
            <div className="space-y-2">
              {aiRecommendation.ai_recommendation.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-500 font-bold">{index + 1}.</span>
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              <FiAperture className="w-5 h-5" /> AI Reasoning
            </h4>
            <p className="text-indigo-700 text-sm">
              {aiRecommendation.ai_recommendation.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <div className="energy-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiActivity className="w-5 h-5" /> Recent Analyses
          </h3>
          <div className="space-y-3">
            {analysisHistory.slice(0, 3).map((analysis, index) => (
              <div key={analysis.id} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{analysis.county}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {new Date(analysis.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      getPriorityColor(analysis.ai_recommendation.priority_level)
                    }`}>
                      {analysis.ai_recommendation.priority_level}
                    </span>
                    <span className="text-sm text-gray-600">
                      {analysis.ai_recommendation.confidence_score}% confidence
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
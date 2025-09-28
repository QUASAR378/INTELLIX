import React, { useState, useEffect } from 'react';
import { 
  FiMap, 
  FiHome, 
  FiDollarSign, 
  FiActivity,
  FiZap,
  FiTarget,
  FiCpu,
  FiCheckCircle,
  FiAlertTriangle,
  FiList,
  FiCheck
} from 'react-icons/fi';
import KenyaMap from './KenyaMap';
import CountyDetails from './CountyDetails';
import MiniGridSim from './MiniGridSim';

import { dashboardAPI, countiesAPI, minigridsAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('map'); // Start with map view
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [simulationConfig, setSimulationConfig] = useState(null);

  // Enhanced county selection with automatic simulation & AI flow
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState(null);

  const handleCountySelect = async (countyData) => {
    try {
      console.log(`🚨 COUNTY CLICK DETECTED! Starting county selection flow...`);
      console.log(`📍 County Data:`, countyData);
      
      // Don't set isLoading to true here - it blocks the UI
      setIsSimulating(true);
      setSimulationProgress(0);
      setSimulationResults(null);
      setAiRecommendation(null);
      
      console.log(`🔥 DEBUG: isSimulating set to true for ${countyData.name}`);
      
      // Extract county name from the data
      const countyName = countyData.name || countyData.county_name || countyData.id;
      console.log(`Starting REAL DATA county flow for: ${countyName}`);
      console.log(`County Data Received:`, countyData);
      
      // Fetch complete county data from backend API instead of using static profiles
      let completeCountyData;
      const countyId = countyData.id || countyData.county_id || countyName;
      
      try {
        console.log(`🔍 Fetching complete county data from API for: ${countyId}`);
        const response = await countiesAPI.getById(countyId);
        const apiData = response.data;
        
        console.log(`Successfully fetched REAL county data from API:`, apiData);
        
        // Use real API data - no more static profiles or random fallbacks!
        completeCountyData = {
          ...apiData,
          name: apiData.county_name || countyName,
          id: apiData.county_id || countyId,
          county_name: apiData.county_name || countyName,
          county_id: apiData.county_id || countyId
        };
        
        console.log(`REAL County Data for ${countyName}:`, {
          population: completeCountyData.population,
          hospitals: completeCountyData.hospitals,
          schools: completeCountyData.schools,
          solar_irradiance: completeCountyData.solar_irradiance,
          grid_distance: completeCountyData.grid_distance,
          blackout_freq: completeCountyData.blackout_freq
        });
        
      } catch (error) {
        console.error(`❌ Failed to fetch county data from API for ${countyId}:`, error);
        // Only use passed data if API completely fails
        completeCountyData = {
          ...countyData,
          county_name: countyName,
          county_id: countyId,
          name: countyName,
          id: countyId
        };
      }
      
      setSelectedCounty(completeCountyData);
      
      // IMPORTANT: Switch to county analysis view immediately to show simulation
      setActiveView('county-analysis');
      console.log(`🔄 DEBUG: View switched to county-analysis, isSimulating: true`);
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`STEP 1: Starting 1-minute simulation for ${countyName}...`);
      
      // Calculate economic activity using real data
      const economic_activity_index = completeCountyData.economic_activity_index || Math.min(1.0, 
        (completeCountyData.population / 1000000) * 0.4 + 
        (completeCountyData.hospitals / 20) * 0.3 + 
        (completeCountyData.schools / 200) * 0.3
      );
      
      // STEP 1: START THE SIMULATION IMMEDIATELY with real data
      await startSimulationProcess(completeCountyData, completeCountyData, economic_activity_index);

      
    } catch (error) {
      console.error('❌ Failed to load county data:', error);
      setIsSimulating(false);
    }
  };

  // Simulation process with 1-minute timer + AI analysis
  const startSimulationProcess = async (completeCountyData, profile, economic_activity_index) => {
    try {
      const countyName = completeCountyData.name;
      
      // Create intelligent simulation configuration
      const intelligentConfig = {
        location: countyName,
        solar_capacity_kw: Math.floor(50 + (profile.solar_irradiance - 5.5) * 30),
        battery_capacity_kwh: Math.floor(200 + (profile.blackout_freq * 8)),
        households_served: Math.min(500, Math.max(50, Math.floor(profile.population / 1000))),
        daily_blackout_hours: profile.blackout_freq / 15,
        solar_irradiance_kwh_m2: profile.solar_irradiance,
        grid_distance_km: profile.grid_distance,
        priority_facilities: {
          hospitals: profile.hospitals,
          schools: profile.schools
        }
      };
      
      setSimulationConfig(intelligentConfig);
      
      console.log(`Running simulation with config:`, intelligentConfig);
      
      // Start the simulation in the backend
      const simulationResponse = await minigridsAPI.simulate(intelligentConfig);
      console.log(`✅ Simulation started successfully:`, simulationResponse.data);
      
      // STEP 2: RUN PROGRESS ANIMATION FOR 10 SECONDS
      await runSimulationProgress();
      
      // STEP 3: GET FINAL SIMULATION RESULTS AND STOP LOADING
      setSimulationResults(simulationResponse.data);
      setIsSimulating(false); // Stop isSimulating here to show MiniGrid
      console.log(`STEP 2: Simulation completed for ${countyName} - MiniGrid should appear now`);
      
      // STEP 4: MINI-GRID SIMULATION IS NOW RUNNING (Auto-start will handle the 45-second animation)
      console.log(`🔴 STEP 3: MiniGrid with auto-start should be visible and running for ${countyName}...`);
      // Note: The 45-second red line animation is handled by MiniGridSim component with autoStart={true}
      // We'll wait for the onSimulationComplete callback instead of hardcoded timeout
      
      // The AI analysis will be triggered by the onSimulationComplete callback from MiniGridSim
      // This is handled in the JSX where MiniGridSim is rendered with onSimulationComplete prop
      
    } catch (error) {
      console.error('❌ Simulation process failed:', error);
      setIsSimulating(false); // Make sure to stop simulation on error
    }
    // Note: isSimulating is now set to false earlier in the process
  };

  // Function to handle AI analysis after MiniGrid simulation completes
  const handleMiniGridComplete = async () => {
    try {
      const countyName = selectedCounty?.name || selectedCounty?.county_name;
      const profile = selectedCounty;
      
      console.log(`STEP 4: Getting AI analysis for ${countyName} after MiniGrid simulation...`);
      const aiResponse = await dashboardAPI.getAIAnalysis({
        county_name: countyName,
        population: profile.population,
        blackout_frequency: profile.blackout_freq,
        solar_irradiance: profile.solar_irradiance,
        economic_activity_index: profile.economic_activity_index || 0.6,
        grid_distance: profile.grid_distance,
        hospitals: profile.hospitals,
        schools: profile.schools,
        current_kwh: profile.population * 0.02, // Estimate 20W per person
        simulation_results: simulationResults // Pass simulation results to AI
      });
      
      setAiRecommendation(aiResponse.data);
      console.log(`✅ STEP 5: AI analysis complete for ${countyName}`, aiResponse.data);
      
    } catch (error) {
      console.error('❌ AI analysis failed:', error);
    }
  };

  // Progress animation function (10 seconds for demo)
  const runSimulationProgress = () => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = 10000; // 10 seconds for demo (change to 60000 for production)
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setSimulationProgress(progress);
        
        if (progress >= 100) {
          resolve();
        } else {
          setTimeout(updateProgress, 200); // Update every 200ms
        }
      };
      
      updateProgress();
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [overviewResponse, statsResponse] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getStats(),
      ]);
      
      setDashboardData({
        overview: overviewResponse.data,
        stats: statsResponse.data,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set fallback data to prevent infinite loading
      setDashboardData({
        overview: { counties_analyzed: 47 },
        stats: { energy_deficit_trend: { labels: [], data: [] } }
      });
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiZap className="w-8 h-8 mr-3 text-green-600" />
                Kenya Energy AI Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                AI-Driven Renewable Energy Allocation & Mini-Grid Optimization
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'map' 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiMap className="w-4 h-4 inline mr-2" />
                Map View
              </button>
              <button
                onClick={() => setActiveView('county-analysis')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'county-analysis' 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={!selectedCounty}
              >
                <FiTarget className="w-4 h-4 inline mr-2" />
                County Analysis
              </button>
            </div>
          </div>
          
          {/* Selected County Indicator */}
          {selectedCounty && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2 border border-green-200">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-medium">
                Analyzing: {selectedCounty.name || selectedCounty.county_name}
              </span>
              {aiRecommendation && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  AI: {aiRecommendation.ai_recommendation?.solution_type?.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-8 py-12">
        {activeView === 'map' && (
          <div className="space-y-8">
            {/* Interactive Map */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <FiMap className="w-6 h-6 mr-3 text-green-600" />
                  Kenya Energy Allocation Map
                </h2>
                <p className="text-gray-600">
                  Click on any county to get AI-powered energy recommendations and mini-grid simulations
                </p>
              </div>
              <div className="h-[600px]">
                <KenyaMap 
                  onCountySelect={handleCountySelect}
                  selectedCounty={selectedCounty}
                  aiRecommendations={aiRecommendation}
                  isAnalyzing={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'county-analysis' && selectedCounty && (
          <div className="county-analysis-grid grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* County Details - More space, less compressed */}
            <div className="lg:col-span-2">
              <CountyDetails county={selectedCounty} />
            </div>

            {/* Live Analysis & Simulation - Balanced space */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Simulation Progress */}

              {isSimulating && (
                <div className="simulation-progress bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                  <div className="text-center">
                    <div className="mb-4">
                      <FiZap className="w-12 h-12 mx-auto text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 flex items-center justify-center">
                      <FiCpu className="w-6 h-6 mr-2" />
                      Running Mini-Grid Simulation
                    </h3>
                    <p className="text-blue-100 mb-6">
                      Analyzing energy patterns for {selectedCounty?.name || selectedCounty?.county_name}...
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="progress-bar w-full bg-white/20 rounded-full h-3 mb-4">
                      <div 
                        className="progress-fill bg-white h-3 rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${simulationProgress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-blue-100">
                      <span>Progress: {Math.round(simulationProgress)}%</span>
                      <span>AI Analysis will start after completion</span>
                    </div>
                    
                    {/* Status Messages */}
                    <div className="mt-4 text-sm">
                      {simulationProgress < 25 && (
                        <p className="text-blue-100 flex items-center justify-center">
                          <FiZap className="w-4 h-4 mr-2" />
                          Initializing solar panels and battery systems...
                        </p>
                      )}
                      {simulationProgress >= 25 && simulationProgress < 50 && (
                        <p className="text-blue-100 flex items-center justify-center">
                          <FiActivity className="w-4 h-4 mr-2" />
                          Analyzing 24-hour energy demand patterns...
                        </p>
                      )}
                      {simulationProgress >= 50 && simulationProgress < 75 && (
                        <p className="text-blue-100 flex items-center justify-center">
                          <FiActivity className="w-4 h-4 mr-2" />
                          Optimizing battery storage and load balancing...
                        </p>
                      )}
                      {simulationProgress >= 75 && simulationProgress < 95 && (
                        <p className="text-blue-100 flex items-center justify-center">
                          <FiTarget className="w-4 h-4 mr-2" />
                          Preparing 45-second live mini-grid demo...
                        </p>
                      )}
                      {simulationProgress >= 95 && (
                        <p className="text-blue-100 flex items-center justify-center">
                          <FiActivity className="w-4 h-4 mr-2 animate-pulse" />
                          Starting LIVE simulation with moving red line...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Simulation Results */}
              {!isSimulating && simulationResults && !aiRecommendation && (
                <div className="simulation-results bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiActivity className="w-6 h-6 mr-3 text-blue-600" />
                    Simulation Results
                    <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Analysis Complete - Starting Live Demo
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <div className="p-5 bg-green-50 rounded-lg border border-green-200 flex flex-col items-center text-center">
                      <FiZap className="w-8 h-8 text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-700 mb-1">
                        {simulationResults.energy_generated?.toFixed(0) || 'N/A'} kWh
                      </div>
                      <div className="text-sm text-green-600 font-medium">Daily Generation</div>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-lg border border-blue-200 flex flex-col items-center text-center">
                      <FiHome className="w-8 h-8 text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-700 mb-1">
                        {simulationResults.households_served || simulationConfig?.households_served || 'N/A'}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Households Served</div>
                    </div>
                    <div className="p-5 bg-purple-50 rounded-lg border border-purple-200 flex flex-col items-center text-center">
                      <FiDollarSign className="w-8 h-8 text-purple-600 mb-2" />
                      <div className="text-2xl font-bold text-purple-700 mb-1">
                        ${simulationResults.total_cost?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-purple-600 font-medium">Total Cost</div>
                    </div>
                    <div className="p-5 bg-orange-50 rounded-lg border border-orange-200 flex flex-col items-center text-center">
                      <FiTarget className="w-8 h-8 text-orange-600 mb-2" />
                      <div className="text-2xl font-bold text-orange-700 mb-1">
                        {simulationResults.payback_period || 'N/A'} years
                      </div>
                      <div className="text-sm text-orange-600 font-medium">Payback Period</div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700 text-sm flex items-center">
                      <FiActivity className="w-4 h-4 mr-2 text-red-500 animate-pulse" />
                      <strong>45-Second Live Demo starting below...</strong> Watch the red line move through 24-hour energy cycles!
                    </p>
                  </div>
                </div>
              )}

              {/* Live Mini-Grid Simulation */}
              {!isSimulating && simulationConfig && !aiRecommendation && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiZap className="w-6 h-6 mr-3 text-green-600" />
                    Live Mini-Grid Simulation
                    <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs animate-pulse">
                      LIVE NOW
                    </span>
                  </h3>
                  <MiniGridSim 
                    initialConfig={simulationConfig}
                    countyName={selectedCounty?.name || selectedCounty?.county_name}
                    autoStart={true}
                    onSimulationComplete={handleMiniGridComplete}
                  />
                </div>
              )}

              {/* AI Analysis */}
              {!isSimulating && aiRecommendation && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiCpu className="w-6 h-6 mr-3 text-purple-600" />
                    AI Energy Recommendations
                    <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Based on Live Simulation
                    </span>
                  </h3>
                  <AIAnalysisDisplay recommendation={aiRecommendation} />
                </div>
              )}

              {/* Mini-Grid Simulation Interactive Chart (After AI recommendations) */}
              {!isSimulating && simulationConfig && aiRecommendation && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiZap className="w-6 h-6 mr-3 text-green-600" />
                    Interactive Mini-Grid Dashboard
                    {simulationConfig && (
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        County-Optimized
                      </span>
                    )}
                  </h3>
                  <MiniGridSim 
                    initialConfig={simulationConfig}
                    countyName={selectedCounty?.name || selectedCounty?.county_name}
                  />
                </div>
              )}


            </div>
          </div>
        )}

        {/* Instructions when no county selected */}
        {activeView === 'county-analysis' && !selectedCounty && (
          <div className="text-center py-16">
            <FiMap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Select a County to Begin Analysis
            </h3>
            <p className="text-gray-500 mb-6">
              Switch to Map View and click on any county to see AI recommendations and mini-grid simulations
            </p>
            <button
              onClick={() => setActiveView('map')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiMap className="w-4 h-4 inline mr-2" />
              Go to Map View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, subtitle, icon: IconComponent, color = "bg-gray-500" }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} rounded-lg`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle || title}</div>
    </div>
  );
};

const AIAnalysisDisplay = ({ recommendation }) => {
  // Handle error responses from API
  if (recommendation?.status === 'error') {
    const fallback = recommendation.fallback_recommendation;
    if (fallback) {
      return (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
              <h4 className="text-lg font-semibold text-yellow-800">AI Analysis Unavailable - Using Fallback Recommendations</h4>
            </div>
            <p className="text-yellow-700 mb-4">{recommendation.message}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-white rounded-lg border">
                <FiZap className="w-6 h-6 text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-600">Recommended Solution</div>
                <div className="text-lg font-bold text-green-900 capitalize">
                  {fallback.solution_type?.replace('_', ' ') || 'Solar Mini-Grid'}
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <FiDollarSign className="w-6 h-6 text-blue-600 mb-2" />
                <div className="text-sm font-medium text-gray-600">Investment Estimate</div>
                <div className="text-lg font-bold text-blue-900">
                  ${fallback.investment_needed?.toLocaleString() || '2.5M'}
                </div>
              </div>
            </div>
            
            {fallback.recommendations && (
              <div className="mt-6">
                <h5 className="font-semibold text-gray-800 mb-3">Key Recommendations:</h5>
                <ul className="space-y-2">
                  {fallback.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  if (!recommendation?.ai_recommendation) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiCpu className="w-8 h-8 mx-auto mb-2" />
        <p>AI analysis in progress...</p>
      </div>
    );
  }

  const aiRec = recommendation.ai_recommendation;
  
  return (
    <div className="space-y-6">
      {/* Priority & Solution Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 flex flex-col items-center text-center">
          <FiAlertTriangle className="w-8 h-8 text-red-600 mb-3" />
          <span className="text-sm font-medium text-red-800 mb-2">Priority Level</span>
          <div className="text-xl font-bold text-red-900 capitalize">
            {aiRec.priority_level}
          </div>
        </div>
        
        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 flex flex-col items-center text-center">
          <FiZap className="w-8 h-8 text-green-600 mb-3" />
          <span className="text-sm font-medium text-green-800 mb-2">Recommended Solution</span>
          <div className="text-lg font-bold text-green-900 capitalize">
            {aiRec.solution_type?.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Investment & Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-blue-50 rounded-lg border border-blue-200 flex flex-col items-center text-center">
          <FiDollarSign className="w-8 h-8 text-blue-600 mb-3" />
          <div className="text-sm font-medium text-blue-800 mb-2">Investment Needed</div>
          <div className="text-2xl font-bold text-blue-900">
            ${aiRec.investment_needed?.toLocaleString() || 'TBD'}
          </div>
        </div>
        
        <div className="p-5 bg-purple-50 rounded-lg border border-purple-200 flex flex-col items-center text-center">
          <FiTarget className="w-8 h-8 text-purple-600 mb-3" />
          <div className="text-sm font-medium text-purple-800 mb-2">Timeline</div>
          <div className="text-2xl font-bold text-purple-900">
            {aiRec.timeline || 'TBD'}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <FiList className="w-4 h-4 mr-2" />
          Key Recommendations
        </h4>
        <ul className="space-y-2">
          {aiRec.recommendations?.map((rec, index) => (
            <li key={index} className="flex items-start space-x-2">
              <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{rec}</span>
            </li>
          )) || <li className="text-gray-500">No specific recommendations available</li>}
        </ul>
      </div>

      {/* Confidence & ROI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-yellow-50 rounded-lg border border-yellow-200 flex flex-col items-center text-center">
          <FiDollarSign className="w-8 h-8 text-yellow-600 mb-3" />
          <div className="text-sm font-medium text-yellow-800 mb-2">Expected ROI</div>
          <div className="text-2xl font-bold text-yellow-900">
            {aiRec.roi_percentage?.toFixed(1) || '0'}%
          </div>
        </div>
        
        <div className="p-5 bg-indigo-50 rounded-lg border border-indigo-200 flex flex-col items-center text-center">
          <FiCpu className="w-8 h-8 text-indigo-600 mb-3" />
          <div className="text-sm font-medium text-indigo-800 mb-2">AI Confidence</div>
          <div className="text-2xl font-bold text-indigo-900">
            {aiRec.confidence_score?.toFixed(0) || '0'}%
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {aiRec.reasoning && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <FiCpu className="w-4 h-4 mr-2" />
            AI Analysis
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">{aiRec.reasoning}</p>
        </div>
      )}
    </div>
  );
};



export default Dashboard;
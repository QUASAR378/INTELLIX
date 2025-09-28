
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import AIAnalysis from './AIAnalysis';
import { 
  FiGrid, 
  FiZap, 
  FiCpu,
  FiMap,
  FiHome,
  FiActivity,
  FiSun,
  FiWifi,
  FiAlertOctagon,
  FiBook,
  FiShoppingBag,
  FiTarget,
  FiTrendingUp
} from 'react-icons/fi';


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const CountyDetails = ({ county }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {

    setTimeout(() => setIsAnimated(true), 100);
  }, [county]);

  if (!county) {
    return (
      <div className="energy-card text-center py-12">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No County Selected</h3>
        <p className="text-gray-600">Click on a county marker in the map to view detailed analysis</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'energy', label: 'Energy Analysis', icon: FiZap },
    { id: 'recommendations', label: 'AI Recommendations', icon: FiCpu },
  ];

  // Calculate energy estimates based on available data
  const estimatedDemand = (county.population || 0) * 0.02; // Estimate 20W per person
  const estimatedSupply = estimatedDemand * (county.current_access || 0.4); // Current access rate
  const estimatedDeficit = Math.max(0, estimatedDemand - estimatedSupply);

  // Chart data for energy analysis
  const energyChartData = {
    labels: ['Current Supply', 'Total Demand', 'Energy Deficit'],
    datasets: [{
      label: 'Energy (MWh)',
      data: [
        estimatedSupply / 1000, // Convert to MWh
        estimatedDemand / 1000,
        estimatedDeficit / 1000,
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderRadius: 8,
    }]
  };



  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className={`energy-card ${isAnimated ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">🏛️</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{county.name || county.county_name} County</h1>
              <p className="text-lg text-gray-600">{county.region || 'Kenya'} Region</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  (county.priority_score || 50) >= 80 ? 'bg-red-100 text-red-800' :
                  (county.priority_score || 50) >= 60 ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Priority Score: {county.priority_score || 'Calculating...'}/100
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {county.recommended_solution ? county.recommended_solution.replace('_', ' ').toUpperCase() : 'MINI-GRID'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${((county.investment_needed_usd || estimatedDemand * 5000) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600">Investment Required</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 bg-white rounded-lg p-2 shadow-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-energy-primary text-white shadow-md'
                : 'text-gray-600 hover:text-energy-primary hover:bg-green-50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`transition-all duration-300 ${isAnimated ? 'animate-slide-up' : ''}`}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Card - Full Width */}
            <div className="energy-card">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">📊 Key Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiHome className="w-6 h-6 text-blue-600" />
                    <span className="text-gray-600 font-medium">Population</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(county.population || 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiZap className="w-6 h-6 text-red-600" />
                    <span className="text-gray-600 font-medium">Energy Deficit</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {(estimatedDeficit / 1000).toFixed(1)} MWh
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiWifi className="w-6 h-6 text-gray-600" />
                    <span className="text-gray-600 font-medium">Grid Distance</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {county.grid_distance || 0} km
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiSun className="w-6 h-6 text-energy-primary" />
                    <span className="text-gray-600 font-medium">Solar Irradiance</span>
                  </div>
                  <div className="text-2xl font-bold text-energy-primary">
                    {(county.solar_irradiance || 0).toFixed(1)} kWh/m²
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiAlertOctagon className="w-6 h-6 text-amber-600" />
                    <span className="text-gray-600 font-medium">Blackout Frequency</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {county.blackout_freq || county.blackout_frequency || 0}/month
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure Card - Full Width */}
            <div className="energy-card">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">🏗️ Infrastructure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="infrastructure-stat-card text-center bg-blue-50 border-blue-200">
                  <FiHome className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {county.hospitals || 0}
                  </div>
                  <div className="text-lg font-medium text-blue-700">Hospitals</div>
                </div>
                <div className="infrastructure-stat-card text-center bg-purple-50 border-purple-200">
                  <FiBook className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {county.schools || 0}
                  </div>
                  <div className="text-lg font-medium text-purple-700">Schools</div>
                </div>
                <div className="infrastructure-stat-card text-center bg-green-50 border-green-200">
                  <FiHome className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.floor((county.population || 0) / 4.5).toLocaleString()}
                  </div>
                  <div className="text-lg font-medium text-green-700">Est. Households</div>
                </div>
                <div className="infrastructure-stat-card text-center bg-orange-50 border-orange-200">
                  <FiShoppingBag className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {Math.floor((county.population || 0) / 10000)}
                  </div>
                  <div className="text-lg font-medium text-orange-700">Est. Markets</div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Energy Analysis Tab */}
        {activeTab === 'energy' && (
          <div className="space-y-8">
            {/* Energy Chart - Full Width */}
            <div className="energy-card">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">⚡ Energy Supply vs Demand</h3>
              <div className="h-96">
                <Bar 
                  data={energyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      }
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Energy (MWh)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Energy Efficiency Scores - Full Width */}
            <div className="energy-card">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">📈 Energy Efficiency Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {Math.round((county.solar_irradiance || 5.5) * 10)}%
                    </div>
                    <div className="text-lg font-medium text-gray-700">Solar Potential</div>
                  </div>
                  <ProgressBar 
                    label="" 
                    value={(county.solar_irradiance || 5.5) * 10} 
                    color="bg-yellow-500"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(Math.max(0, 100 - (county.grid_distance || 50)))}%
                    </div>
                    <div className="text-lg font-medium text-gray-700">Grid Accessibility</div>
                  </div>
                  <ProgressBar 
                    label="" 
                    value={Math.max(0, 100 - (county.grid_distance || 50))} 
                    color="bg-blue-500"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round((county.current_access || 0.4) * 100)}%
                    </div>
                    <div className="text-lg font-medium text-gray-700">Supply Adequacy</div>
                  </div>
                  <ProgressBar 
                    label="" 
                    value={((county.current_access || 0.4) * 100)} 
                    color="bg-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <AIAnalysis 
            countyData={{
              county_name: county.name || county.county_name,
              population: county.population || 0,
              blackout_frequency: county.blackout_freq || county.blackout_frequency || 0,
              solar_irradiance: county.solar_irradiance || 5.5,
              grid_distance: county.grid_distance || 50
            }}
            onRecommendationReceived={(recommendation) => {
              console.log('AI Recommendation received:', recommendation);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Helper Components
const MetricRow = ({ label, value, Icon, valueColor = "text-gray-800" }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-2">
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="text-gray-600">{label}</span>
    </div>
    <span className={`font-semibold ${valueColor}`}>{value}</span>
  </div>
);

const ProgressBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{Math.round(value)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className={`h-3 rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
  </div>
);

const TimelineStep = ({ step, title, duration }) => (
  <div className="flex items-center space-x-3">
    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
      {step}
    </div>
    <div className="flex-1">
      <div className="font-medium text-gray-800">{title}</div>
      <div className="text-xs text-gray-600">{duration}</div>
    </div>
  </div>
);

// Helper Functions
const getSolutionDetails = (solutionType) => {
  const solutions = {
    solar_minigrid: {
      name: "Solar Mini-Grid System",
      description: "Standalone solar power system with battery storage, perfect for remote areas with high solar potential."
    },
    grid_extension: {
      name: "National Grid Extension",
      description: "Extend the national power grid to connect underserved communities with reliable electricity."
    },
    hybrid_solution: {
      name: "Hybrid Energy System",
      description: "Combination of solar mini-grids with grid connectivity for optimal reliability and cost-effectiveness."
    },
    grid_optimization: {
      name: "Grid Optimization",
      description: "Improve existing grid infrastructure efficiency and reduce transmission losses."
    }
  };
  
  return solutions[solutionType] || { name: "Custom Solution", description: "Tailored energy solution based on specific needs." };
};

export default CountyDetails;
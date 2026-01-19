
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
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
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiBarChart2
} from 'react-icons/fi';


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

const CountyDetails = ({ county, onTabChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    console.log('CountyDetails received county data:', county);
    setTimeout(() => setIsAnimated(true), 100);
  }, [county]);

  useEffect(() => {
    if (onTabChange) {
      onTabChange(activeTab);
    }
  }, [activeTab, onTabChange]);

  if (!county) {
    return (
      <div className="energy-card text-center py-12">
        <FiMap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className={`bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 ${isAnimated ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{county.name || county.county_name} County</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>{county.region || 'Kenya'} Region</span>
              <span className="text-gray-300">•</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                (county.priority_score || 50) >= 80 ? 'bg-red-100 text-red-700' :
                (county.priority_score || 50) >= 60 ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                Priority {county.priority_score || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="text-left md:text-right bg-green-50 px-4 py-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              ${((county.investment_needed_usd || estimatedDemand * 5000) / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-green-600 font-medium">Est. Investment</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white border border-gray-200 rounded-lg p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md font-medium transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`transition-all duration-300 ${isAnimated ? 'animate-slide-up' : ''}`}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Metrics */}
            <div className="energy-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiActivity className="w-5 h-5 mr-2" />
                Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  icon={FiUsers}
                  label="Population"
                  value={(county.population || 0).toLocaleString()}
                />
                <MetricCard
                  icon={FiZap}
                  label="Energy Deficit"
                  value={`${(estimatedDeficit / 1000).toFixed(1)} MWh`}
                />
                <MetricCard
                  icon={FiSun}
                  label="Solar Potential"
                  value={`${(county.solar_irradiance || 0).toFixed(1)} kWh/m²`}
                />
              </div>
            </div>

            {/* Infrastructure Card */}
            <div className="energy-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiGrid className="w-5 h-5 mr-2 text-green-600" />
                Infrastructure
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfrastructureCard
                  icon={FiActivity}
                  label="Hospitals"
                  value={county.hospitals || 0}
                />
                <InfrastructureCard
                  icon={FiBook}
                  label="Schools"
                  value={county.schools || 0}
                />
                <InfrastructureCard
                  icon={FiHome}
                  label="Est. Households"
                  value={Math.floor((county.population || 0) / 4.5).toLocaleString()}
                />
              </div>
            </div>
          </div>
        )}



        {/* Energy Analysis Tab */}
        {activeTab === 'energy' && (
          <div className="space-y-6">
            {/* Energy Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FiZap className="w-4 h-4 mr-1.5" />
                Energy Supply vs Demand
              </h3>
              <div className="h-80">
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
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <FiBarChart2 className="w-5 h-5 mr-2 text-green-600" />
                Energy Efficiency Scores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {Math.round((county.solar_irradiance || 5.5) * 10)}%
                    </div>
                    <div className="text-sm font-medium text-gray-600">Solar Potential</div>
                  </div>
                  <ProgressBar 
                    label="" 
                    value={(county.solar_irradiance || 5.5) * 10} 
                    color="bg-green-500"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {Math.round(Math.max(0, 100 - (county.grid_distance || 50)))}%
                    </div>
                    <div className="text-sm font-medium text-gray-600">Grid Accessibility</div>
                  </div>
                  <ProgressBar 
                    label="" 
                    value={Math.max(0, 100 - (county.grid_distance || 50))} 
                    color="bg-green-500"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {Math.round((county.current_access || 0.4) * 100)}%
                    </div>
                    <div className="text-sm font-medium text-gray-600">Supply Adequacy</div>
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

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="w-5 h-5 text-green-600" />
      <span className="text-gray-600 text-sm font-medium">{label}</span>
    </div>
    <div className="text-xl font-bold text-gray-900">{value}</div>
  </div>
);

const InfrastructureCard = ({ icon: Icon, label, value }) => (
  <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-4">
    <Icon className="w-5 h-5 text-green-600 mx-auto mb-2" />
    <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-xs font-medium text-gray-600">{label}</div>
  </div>
);

export default CountyDetails;
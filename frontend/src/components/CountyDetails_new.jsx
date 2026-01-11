
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
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiBarChart2
} from 'react-icons/fi';


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const CountyDetails = ({ county }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    console.log('CountyDetails received county data:', county);
    setTimeout(() => setIsAnimated(true), 100);
  }, [county]);

  if (!county) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg text-center py-16">
        <FiMap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No County Selected</h3>
        <p className="text-gray-500 text-sm">Click on a county marker to view detailed analysis</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'energy', label: 'Energy', icon: FiZap },
    { id: 'recommendations', label: 'AI Insights', icon: FiCpu },
  ];

  // Calculate energy estimates
  const estimatedDemand = (county.population || 0) * 0.02;
  const estimatedSupply = estimatedDemand * (county.current_access || 0.4);
  const estimatedDeficit = Math.max(0, estimatedDemand - estimatedSupply);

  // Chart data - uniform gray + green theme
  const energyChartData = {
    labels: ['Current Supply', 'Total Demand', 'Energy Deficit'],
    datasets: [{
      label: 'Energy (MWh)',
      data: [
        estimatedSupply / 1000,
        estimatedDemand / 1000,
        estimatedDeficit / 1000,
      ],
      backgroundColor: ['#10B981', '#6B7280', '#9CA3AF'],
      borderRadius: 8,
    }]
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className={`bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-5 ${isAnimated ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{county.name || county.county_name} County</h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">{county.region || 'Kenya'} Region</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                Priority {county.priority_score || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="text-right bg-green-50 px-4 py-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              ${((county.investment_needed_usd || estimatedDemand * 5000) / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-green-600 font-medium">Est. Investment</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white border border-gray-200 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md font-medium transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`transition-all duration-300 ${isAnimated ? 'animate-slide-up' : ''}`}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                <FiUsers className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {(county.population || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">Population</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                <FiZap className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {(estimatedDeficit / 1000).toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 font-medium">MWh Deficit</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                <FiWifi className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {county.grid_distance || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Grid Distance (km)</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                <FiSun className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {(county.solar_irradiance || 0).toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 font-medium">Solar kWh/m²</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                <FiAlertOctagon className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {county.blackout_freq || county.blackout_frequency || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Blackouts/month</div>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FiGrid className="w-4 h-4 mr-2 text-green-600" />
                Infrastructure Overview
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FiActivity className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{county.hospitals || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Hospitals</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FiBook className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{county.schools || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Schools</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FiHome className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{Math.floor((county.population || 0) / 4.5).toLocaleString()}</div>
                  <div className="text-xs text-gray-600 font-medium">Households</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Energy Analysis Tab */}
        {activeTab === 'energy' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FiZap className="w-4 h-4 mr-2 text-green-600" />
                Energy Supply vs Demand
              </h3>
              <div className="h-72">
                <Bar 
                  data={energyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { title: { display: true, text: 'Energy (MWh)' } } }
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FiBarChart2 className="w-4 h-4 mr-2 text-green-600" />
                Energy Efficiency Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Solar Potential</span>
                    <span className="text-lg font-bold text-gray-900">{Math.round((county.solar_irradiance || 5.5) * 10)}%</span>
                  </div>
                  <ProgressBar value={(county.solar_irradiance || 5.5) * 10} color="bg-green-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Grid Accessibility</span>
                    <span className="text-lg font-bold text-gray-900">{Math.round(Math.max(0, 100 - (county.grid_distance || 50)))}%</span>
                  </div>
                  <ProgressBar value={Math.max(0, 100 - (county.grid_distance || 50))} color="bg-green-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Supply Adequacy</span>
                    <span className="text-lg font-bold text-gray-900">{Math.round((county.current_access || 0.4) * 100)}%</span>
                  </div>
                  <ProgressBar value={((county.current_access || 0.4) * 100)} color="bg-green-500" />
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

// Helper Component
const ProgressBar = ({ value, color }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div 
      className={`h-2.5 rounded-full transition-all duration-1000 ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    ></div>
  </div>
);

export default CountyDetails;

import React, { useState, useEffect } from 'react';
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiDollarSign, 
  FiZap, 
  FiActivity,
  FiDownload,
  FiMap,
  FiCpu,
  FiTarget,
  FiSun,
} from 'react-icons/fi';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { analyticsAPI, dashboardAPI, countiesAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [counties, setCounties] = useState([]);
  const [comparisonMode, setComparisonMode] = useState('national');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      loadCountyAnalytics(selectedCounty);
      setComparisonMode('county');
    } else {
      loadNationalAnalytics();
      setComparisonMode('national');
    }
  }, [selectedCounty, timeRange]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const countiesResponse = await countiesAPI.getAll();
      setCounties(countiesResponse.data || []);
      await loadNationalAnalytics();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setAnalyticsData(generateDemoData());
    } finally {
      setIsLoading(false);
    }
  };

  const loadNationalAnalytics = async () => {
    try {
      setIsLoading(true);
      const gridAnalytics = await analyticsAPI.getGridAnalytics(timeRange);
      setAnalyticsData({ grid: gridAnalytics.data });
    } catch (error) {
      console.error('Failed to load national analytics:', error);
      setAnalyticsData(generateDemoData());
    } finally {
      setIsLoading(false);
    }
  };

  const loadCountyAnalytics = async (county) => {
    try {
      setIsLoading(true);
      const countyAnalytics = await analyticsAPI.getPerformanceAnalytics({ timeRange, county: county.id });
      setAnalyticsData({ county: countyAnalytics.data });
    } catch (error) {
      console.error('Failed to load county analytics:', error);
      setAnalyticsData(generateDemoData());
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoData = () => ({
    grid: {
      total_generation: 15420,
      total_consumption: 12850,
      efficiency: 83.2,
      carbon_savings: 12450,
      national_coverage: 76.5,
      time_series_data: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
        generation_kwh: 12000 + Math.random() * 6000,
        consumption_kwh: 10000 + Math.random() * 5000
      })),
      regional_performance: [
        { region: 'Nairobi', efficiency: 85 },
        { region: 'Coastal', efficiency: 78 },
        { region: 'Western', efficiency: 82 },
        { region: 'Rift Valley', efficiency: 88 },
        { region: 'Eastern', efficiency: 75 },
        { region: 'Nyanza', efficiency: 80 },
        { region: 'North Eastern', efficiency: 65 }
      ]
    }
  });

  const getNationalPerformanceChart = () => {
    if (!analyticsData?.grid?.regional_performance) return null;
    return {
      labels: analyticsData.grid.regional_performance.map(r => r.region),
      datasets: [{
        label: 'Regional Efficiency (%)',
        data: analyticsData.grid.regional_performance.map(r => r.efficiency),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 2,
      }]
    };
  };

  const getTimeSeriesChart = () => {
    if (!analyticsData?.grid?.time_series_data) return null;
    return {
      labels: analyticsData.grid.time_series_data.map(d => d.date),
      datasets: [
        {
          label: 'Generation (kWh)',
          data: analyticsData.grid.time_series_data.map(d => d.generation_kwh),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Consumption (kWh)',
          data: analyticsData.grid.time_series_data.map(d => d.consumption_kwh),
          borderColor: '#6B7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  const clearCountySelection = () => {
    setSelectedCounty(null);
    setComparisonMode('national');
  };

  if (isLoading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiBarChart2 className="w-8 h-8 mr-3 text-green-600" />
                Advanced Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedCounty 
                  ? `AI-powered analysis for ${selectedCounty.name} County` 
                  : 'National energy infrastructure insights'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                value={selectedCounty?.id || 'national'}
                onChange={(e) => {
                  if (e.target.value === 'national') {
                    clearCountySelection();
                  } else {
                    const county = counties.find(c => c.id === e.target.value);
                    setSelectedCounty(county);
                  }
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="national">National Overview</option>
                {counties.map(county => (
                  <option key={county.id} value={county.id}>{county.name}</option>
                ))}
              </select>

              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                <FiDownload className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: FiActivity },
              { id: 'performance', label: 'Performance', icon: FiTrendingUp },
              { id: 'economic', label: 'Economic', icon: FiDollarSign },
              { id: 'environmental', label: 'Environmental', icon: FiZap },
              { id: 'ai-analysis', label: 'AI Analysis', icon: FiCpu }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white text-green-700 shadow-sm border border-gray-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Mode Indicator */}
            <div className={`p-4 rounded-lg border ${
              comparisonMode === 'national' 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    comparisonMode === 'national' ? 'bg-gray-100' : 'bg-green-100'
                  }`}>
                    {comparisonMode === 'national' ? (
                      <FiMap className="w-5 h-5 text-gray-600" />
                    ) : (
                      <FiTarget className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {comparisonMode === 'national' ? 'National Energy Analysis' : `${selectedCounty.name} County Analysis`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {comparisonMode === 'national' 
                        ? 'Comprehensive overview of Kenya\'s energy infrastructure' 
                        : 'Detailed analysis and recommendations'
                      }
                    </p>
                  </div>
                </div>
                {selectedCounty && (
                  <button
                    onClick={clearCountySelection}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    View National →
                  </button>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiZap className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <FiTrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Generation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.grid?.total_generation?.toLocaleString() || '0'} kWh
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FiActivity className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <FiTrendingUp className="w-3 h-3 mr-1" />
                    +3.2%
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">System Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.grid?.efficiency?.toFixed(1) || '0'}%
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiSun className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    250 trees equiv.
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Carbon Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.grid?.carbon_savings?.toLocaleString() || '0'} kg
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FiTarget className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <FiTrendingUp className="w-3 h-3 mr-1" />
                    +5.2%
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">National Coverage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.grid?.national_coverage?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiBarChart2 className="w-5 h-5 mr-2 text-green-600" />
                  Regional Performance
                </h3>
                <div className="h-80">
                  {getNationalPerformanceChart() && (
                    <Bar 
                      data={getNationalPerformanceChart()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } }
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiTrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Generation vs Consumption
                </h3>
                <div className="h-80">
                  {getTimeSeriesChart() && (
                    <Line 
                      data={getTimeSeriesChart()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs can render similar content */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Analytics
            </h3>
            <p className="text-gray-600">
              Detailed {activeTab} analytics coming soon. Switch to Overview to see available data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

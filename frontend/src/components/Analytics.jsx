import React, { useState, useEffect } from 'react';
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiDollarSign, 
  FiZap, 
  FiActivity,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiEye,
  FiPieChart,
  FiMap,
  FiCpu,
  FiTarget,
  FiUsers,
  FiHome,
  FiSun,
  FiAlertTriangle
} from 'react-icons/fi';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';
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
import recommendationService from '../services/recommendationService';

// Register Chart.js components
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
  const [aiRecommendations, setAiRecommendations] = useState({
    loading: true,
    error: null,
    data: null
  });

  // Load recommendations when county changes
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!selectedCounty) return;
      
      setAiRecommendations(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const countyData = {
          county_name: selectedCounty.name,
          population: selectedCounty.population || 0,
          current_kwh: selectedCounty.current_kwh || 0,
          // Add more fields as needed
        };
        
        const recommendation = await recommendationService.getRecommendation(countyData);
        
        setAiRecommendations({
          loading: false,
          data: {
            ai_recommendation: {
              ...recommendation,
              recommendations: recommendation.recommendations || [
                'No specific recommendations available',
                'Please check back later for updates'
              ]
            }
          },
          source: recommendation._source,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setAiRecommendations({
          loading: false,
          error: 'Failed to load recommendations',
          data: null
        });
      }
    };
    
    loadRecommendations();
  }, [selectedCounty]);
  const [comparisonMode, setComparisonMode] = useState('national'); // 'national' or 'county'

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
      const [countiesResponse] = await Promise.all([
        countiesAPI.getAll()
      ]);
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
      const [gridAnalytics, performanceData, economicData, aiAnalysis] = await Promise.all([
        analyticsAPI.getGridAnalytics(timeRange),
        analyticsAPI.getPerformanceAnalytics({ timeRange, county: 'all' }),
        analyticsAPI.getEconomicAnalytics({ timeRange }),
        dashboardAPI.getAIAnalysis({ analysis_type: 'national_overview' })
      ]);

      setAnalyticsData({
        grid: gridAnalytics.data,
        performance: performanceData.data,
        economic: economicData.data,
        national_ai: aiAnalysis.data
      });
      setAiRecommendations(aiAnalysis.data);
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
      const [countyAnalytics, aiAnalysis] = await Promise.all([
        analyticsAPI.getPerformanceAnalytics({ timeRange, county: county.id }),
        dashboardAPI.getAIAnalysis({
          county_name: county.name,
          population: county.population,
          blackout_frequency: county.blackout_frequency,
          solar_irradiance: county.solar_irradiance,
          grid_distance: county.grid_distance,
          analysis_type: 'county_detailed'
        })
      ]);

      setAnalyticsData({
        county: countyAnalytics.data,
        county_ai: aiAnalysis.data
      });
      setAiRecommendations(aiAnalysis.data);
    } catch (error) {
      console.error('Failed to load county analytics:', error);
      setAnalyticsData(generateCountyDemoData(county));
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoData = () => {
    return {
      grid: {
        total_generation: 15420,
        total_consumption: 12850,
        efficiency: 83.2,
        peak_demand: 890,
        carbon_savings: 12450,
        counties_analyzed: 47,
        national_coverage: 76.5
      },
      performance: {
        capacity_factors: [65, 72, 68, 75, 80, 78, 82],
        availability: [92, 94, 91, 96, 95, 93, 97],
        reliability: [88, 90, 87, 92, 91, 89, 94],
        regions: ['Nairobi', 'Coastal', 'Western', 'Rift Valley', 'Eastern', 'Nyanza', 'North Eastern'],
        regional_efficiency: [85, 78, 82, 88, 75, 80, 65]
      },
      economic: {
        total_savings: 125000,
        roi_percentage: 22.5,
        payback_period: 4.8,
        investment_required: 2500000,
        job_creation: 1250,
        economic_impact: 4500000
      },
      national_ai: {
        ai_recommendation: {
          priority_level: 'high',
          focus_areas: ['Solar Mini-Grids', 'Grid Modernization', 'Battery Storage'],
          investment_opportunities: [
            { area: 'Northern Kenya', amount: 1500000, roi: 25.5 },
            { area: 'Western Kenya', amount: 850000, roi: 18.2 },
            { area: 'Coastal Region', amount: 650000, roi: 22.1 }
          ],
          timeline: '5-year plan',
          confidence_score: 92.5,
          recommendations: [
            'Prioritize solar mini-grid deployment in high-potential regions',
            'Invest in grid modernization for urban centers',
            'Develop battery storage infrastructure',
            'Implement smart grid technologies'
          ]
        }
      }
    };
  };

  const generateCountyDemoData = (county) => {
    return {
      county: {
        name: county.name,
        energy_deficit: county.population * 0.02 * (1 - (county.current_access || 0.4)),
        solar_potential: county.solar_irradiance * 100,
        infrastructure_score: Math.max(0, 100 - county.grid_distance),
        priority_score: county.priority_score || 75,
        monthly_data: Array.from({ length: 12 }, (_, i) => ({
          month: i,
          generation: Math.random() * 1000 + 500,
          demand: Math.random() * 1200 + 600,
          efficiency: Math.random() * 20 + 75
        }))
      },
      county_ai: {
        ai_recommendation: {
          priority_level: county.priority_score > 80 ? 'high' : county.priority_score > 60 ? 'medium' : 'low',
          solution_type: county.solar_irradiance > 6 ? 'solar_minigrid' : 'grid_extension',
          investment_needed: county.population * 8,
          timeline: county.grid_distance > 100 ? '18-24 months' : '12-18 months',
          roi_percentage: 15 + (county.solar_irradiance - 5) * 2,
          confidence_score: 85 + Math.random() * 10,
          recommendations: [
            `Deploy ${Math.ceil(county.population / 1000)}kW solar mini-grid system`,
            'Implement battery storage for night-time supply',
            'Establish local maintenance team',
            'Develop community energy cooperative'
          ],
          reasoning: `High solar potential (${county.solar_irradiance}kWh/m²) and significant energy deficit make this county ideal for renewable energy investment.`
        }
      }
    };
  };

  // Chart data functions
  const getNationalPerformanceChart = () => {
    if (!analyticsData?.performance) return null;

    return {
      labels: analyticsData.performance.regions || ['Nairobi', 'Coastal', 'Western', 'Rift Valley', 'Eastern', 'Nyanza', 'North Eastern'],
      datasets: [
        {
          label: 'Regional Efficiency (%)',
          data: analyticsData.performance.regional_efficiency || [85, 78, 82, 88, 75, 80, 65],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        }
      ]
    };
  };

  const getCountyPerformanceChart = () => {
    if (!analyticsData?.county?.monthly_data) return null;

    return {
      labels: analyticsData.county.monthly_data.map((_, i) => `Month ${i + 1}`),
      datasets: [
        {
          label: 'Energy Generation (kWh)',
          data: analyticsData.county.monthly_data.map(d => d.generation),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Energy Demand (kWh)',
          data: analyticsData.county.monthly_data.map(d => d.demand),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  const getAIRadarChart = () => {
    if (!aiRecommendations?.ai_recommendation) return null;

    const aiRec = aiRecommendations.ai_recommendation;
    return {
      labels: ['Investment Potential', 'Social Impact', 'Technical Feasibility', 'Economic ROI', 'Implementation Speed'],
      datasets: [
        {
          label: 'AI Assessment Score',
          data: [
            aiRec.priority_level === 'high' ? 90 : aiRec.priority_level === 'medium' ? 70 : 50,
            aiRec.roi_percentage ? Math.min(100, aiRec.roi_percentage * 4) : 75,
            aiRec.confidence_score || 80,
            aiRec.roi_percentage ? Math.min(100, aiRec.roi_percentage * 3) : 65,
            100 - (aiRec.timeline?.includes('24') ? 40 : aiRec.timeline?.includes('18') ? 30 : 20)
          ],
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderColor: 'rgb(139, 92, 246)',
          pointBackgroundColor: 'rgb(139, 92, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(139, 92, 246)'
        }
      ]
    };
  };

  const getInvestmentChart = () => {
    const investments = analyticsData?.national_ai?.ai_recommendation?.investment_opportunities || [];
    
    return {
      labels: investments.map(inv => inv.area),
      datasets: [
        {
          label: 'Investment Amount ($)',
          data: investments.map(inv => inv.amount / 1000),
          backgroundColor: [
            '#F59E0B',
            '#10B981',
            '#3B82F6',
            '#8B5CF6',
            '#EF4444'
          ],
          borderWidth: 2,
        }
      ]
    };
  };

  const exportReport = async (type) => {
    try {
      const reportData = {
        type,
        timeRange,
        format: 'pdf',
        county: selectedCounty?.name || 'national',
        analysis_type: comparisonMode
      };
      
      const response = await analyticsAPI.exportAnalyticsReport(reportData);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${selectedCounty?.name || 'national'}-${Date.now()}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const clearCountySelection = () => {
    setSelectedCounty(null);
    setComparisonMode('national');
  };

  if (isLoading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
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
                <FiBarChart2 className="w-8 h-8 mr-3 text-blue-600" />
                Advanced Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedCounty 
                  ? `AI-powered analysis for ${selectedCounty.name} County` 
                  : 'National energy infrastructure insights and AI recommendations'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* County Selector */}
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
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="national">🌍 National Overview</option>
                {counties.map(county => (
                  <option key={county.id} value={county.id}>
                    🗺️ {county.name}
                  </option>
                ))}
              </select>

              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-1 bg-gray-100 rounded-lg p-1">
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
                    ? 'bg-white text-blue-700 shadow-sm' 
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Analysis Mode Indicator */}
            <div className={`p-4 rounded-lg ${
              comparisonMode === 'national' 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    comparisonMode === 'national' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {comparisonMode === 'national' ? (
                      <FiMap className="w-5 h-5 text-blue-600" />
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
                        : 'Detailed analysis and AI recommendations for selected county'
                      }
                    </p>
                  </div>
                </div>
                {selectedCounty && (
                  <button
                    onClick={clearCountySelection}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View National</span>
                  </button>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {comparisonMode === 'national' ? 'Total Generation' : 'County Generation'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {comparisonMode === 'national' 
                        ? `${analyticsData?.grid?.total_generation?.toLocaleString() || '0'} kWh`
                        : `${analyticsData?.county?.monthly_data?.reduce((sum, d) => sum + d.generation, 0).toLocaleString() || '0'} kWh`
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiZap className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  <span>+12.5% from last period</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {comparisonMode === 'national' 
                        ? `${analyticsData?.grid?.efficiency?.toFixed(1) || '0'}%`
                        : `${analyticsData?.county?.monthly_data?.reduce((sum, d) => sum + d.efficiency, 0) / (analyticsData?.county?.monthly_data?.length || 1) || '0'}%`
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiActivity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  <span>+3.2% improvement</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {comparisonMode === 'national' ? 'Carbon Savings' : 'Solar Potential'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {comparisonMode === 'national' 
                        ? `${analyticsData?.grid?.carbon_savings?.toLocaleString() || '0'} kg`
                        : `${analyticsData?.county?.solar_potential?.toFixed(1) || '0'}%`
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <FiSun className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {comparisonMode === 'national' 
                    ? 'Equivalent to 250 trees planted'
                    : 'Excellent for solar deployment'
                  }
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {comparisonMode === 'national' ? 'National Coverage' : 'Priority Score'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {comparisonMode === 'national' 
                        ? `${analyticsData?.grid?.national_coverage?.toFixed(1) || '0'}%`
                        : `${analyticsData?.county?.priority_score || '0'}/100`
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiTarget className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  <span>
                    {comparisonMode === 'national' ? '+5.2% expansion' : 'High investment priority'}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiTrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  {comparisonMode === 'national' ? 'Regional Performance' : 'Monthly Performance Trend'}
                </h3>
                <div className="h-80">
                  {comparisonMode === 'national' ? (
                    getNationalPerformanceChart() && (
                      <Bar 
                        data={getNationalPerformanceChart()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'top' } }
                        }}
                      />
                    )
                  ) : (
                    getCountyPerformanceChart() && (
                      <Line 
                        data={getCountyPerformanceChart()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'top' } }
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              {/* AI Analysis Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiCpu className="w-5 h-5 mr-2 text-purple-600" />
                  AI Assessment
                </h3>
                <div className="h-80">
                  {getAIRadarChart() && (
                    <Radar 
                      data={getAIRadarChart()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { stepSize: 20 }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai-analysis' && aiRecommendations && (
          <div className="space-y-6">
            {/* AI Recommendations Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    <FiCpu className="w-6 h-6 mr-3 text-purple-600" />
                    AI-Powered Energy Recommendations
                  </h3>
                  <p className="text-gray-600">
                    {comparisonMode === 'national' 
                      ? 'Strategic insights for national energy development'
                      : `Optimized solutions for ${selectedCounty.name} County`
                    }
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  aiRecommendations.ai_recommendation.priority_level === 'high' 
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : aiRecommendations.ai_recommendation.priority_level === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-green-100 text-green-800 border border-green-300'
                }`}>
                  {aiRecommendations.ai_recommendation.priority_level.toUpperCase()} PRIORITY
                </div>
              </div>

              {/* AI Confidence */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-purple-800">AI Confidence Score</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {aiRecommendations.ai_recommendation.confidence_score || 85}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-purple-800">Recommended Solution</div>
                    <div className="text-lg font-semibold text-purple-600 capitalize">
                      {aiRecommendations.ai_recommendation.solution_type?.replace('_', ' ') || 'Custom Solution'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Breakdown */}
              {comparisonMode === 'national' ? (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Regional Investment Opportunities</h4>
                  <div className="h-64">
                    {getInvestmentChart() && (
                      <Bar 
                        data={getInvestmentChart()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `Investment: $${(context.raw * 1000).toLocaleString()}`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <FiDollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      ${aiRecommendations.ai_recommendation.investment_needed?.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Investment Needed</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <FiTrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {aiRecommendations.ai_recommendation.roi_percentage}%
                    </div>
                    <div className="text-sm text-green-700">Expected ROI</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <FiCalendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {aiRecommendations.ai_recommendation.timeline}
                    </div>
                    <div className="text-sm text-purple-700">Implementation</div>
                  </div>
                </div>
              )}

              {/* Detailed Recommendations */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiTarget className="w-5 h-5 mr-2 text-green-600" />
                  Specific Recommendations
                </h4>
                <div className="space-y-3">
                  {(aiRecommendations.data?.ai_recommendation?.recommendations || aiRecommendations.fallbackRecommendations || [
                    'Loading recommendations...'
                  ]).map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Reasoning */}
              {aiRecommendations.data?.ai_recommendation?.reasoning && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                    <FiCpu className="w-4 h-4 mr-2" />
                    AI Analysis Reasoning
                  </h4>
                  <p className="text-indigo-700 text-sm leading-relaxed">
                    {aiRecommendations.data.ai_recommendation.reasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {comparisonMode === 'national' ? 'Regional Capacity Utilization' : 'County Performance Metrics'}
                </h3>
                <div className="h-80">
                  {comparisonMode === 'national' ? (
                    getNationalPerformanceChart() && (
                      <Bar data={getNationalPerformanceChart()} />
                    )
                  ) : (
                    getCountyPerformanceChart() && (
                      <Line data={getCountyPerformanceChart()} />
                    )
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Indicators</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Infrastructure Score</span>
                      <span className="font-semibold">{analyticsData?.county?.infrastructure_score || 75}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500 transition-all duration-1000"
                        style={{ width: `${analyticsData?.county?.infrastructure_score || 75}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Energy Reliability</span>
                      <span className="font-semibold">{analyticsData?.performance?.reliability?.[0] || 88}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500 transition-all duration-1000"
                        style={{ width: `${analyticsData?.performance?.reliability?.[0] || 88}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">System Availability</span>
                      <span className="font-semibold">{analyticsData?.performance?.availability?.[0] || 92}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-purple-500 transition-all duration-1000"
                        style={{ width: `${analyticsData?.performance?.availability?.[0] || 92}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Economic Tab */}
        {activeTab === 'economic' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FiDollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    ${analyticsData?.economic?.total_savings?.toLocaleString() || '125,000'}
                  </div>
                  <div className="text-sm text-blue-700">Total Savings</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FiTrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData?.economic?.roi_percentage || 22.5}%
                  </div>
                  <div className="text-sm text-green-700">Average ROI</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FiUsers className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData?.economic?.job_creation || 1250}
                  </div>
                  <div className="text-sm text-purple-700">Jobs Created</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <FiHome className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    ${((analyticsData?.economic?.economic_impact || 4500000) / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-orange-700">Economic Impact</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environmental Tab */}
        {activeTab === 'environmental' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Carbon Reduction</h4>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {analyticsData?.grid?.carbon_savings?.toLocaleString() || '12,450'} kg
                    </div>
                    <div className="text-sm text-emerald-700">CO₂ Emissions Saved</div>
                    <div className="mt-2 text-xs text-emerald-600">
                      Equivalent to planting {Math.round((analyticsData?.grid?.carbon_savings || 12450) / 50)} trees
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Renewable Energy Mix</h4>
                  <div className="h-48">
                    <Doughnut 
                      data={{
                        labels: ['Solar', 'Wind', 'Hydro', 'Biomass'],
                        datasets: [{
                          data: [45, 25, 20, 10],
                          backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'],
                          borderWidth: 2,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  FiActivity,
  FiBarChart2,
  FiUsers,
  FiCpu,
  FiZap,
  FiTrendingUp,
  FiTarget
} from 'react-icons/fi';

const EnergyMetrics = ({ data }) => {
  const [activeChart, setActiveChart] = useState('regional');
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    
    setTimeout(() => setIsAnimated(true), 300);
  }, []);

  if (!data) {
    return (
      <div className="energy-card text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Analytics Loading</h3>
        <p className="text-gray-600">Preparing energy analytics dashboard...</p>
      </div>
    );
  }

  // Chart configurations
  const chartTabs = [
    { id: 'consumption', label: 'Energy Consumption', icon: FiZap },
    { id: 'demographics', label: 'Demographics', icon: FiUsers },
    { id: 'classification', label: 'AI Analysis', icon: FiCpu },
  ];

  // Energy Consumption Patterns Chart
  const consumptionChartData = {
    labels: data.consumption_patterns?.map(item => item.county) || [],
    datasets: [
      {
        label: 'Energy Consumption (MWh)',
        data: data.consumption_patterns?.map(item => item.consumption) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Blackout Frequency',
        data: data.consumption_patterns?.map(item => item.blackout_frequency) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        yAxisID: 'y1',
      }
    ]
  };

  // Demographics Chart
  const demographicsChartData = {
    labels: data.demographics?.map(item => item.county) || [],
    datasets: [
      {
        label: 'Population',
        data: data.demographics?.map(item => item.population) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
      {
        label: 'Economic Activity Index',
        data: data.demographics?.map(item => item.economic_index) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
        yAxisID: 'y1',
      }
    ]
  };

  // AI Classification Results Chart
  const classificationChartData = {
    labels: data.ai_classification?.map(item => item.county) || [],
    datasets: [
      {
        label: 'Priority Score',
        data: data.ai_classification?.map(item => item.priority_score) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
      },
      {
        label: 'Investment Priority',
        data: data.ai_classification?.map(item => item.investment_priority) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    consumption: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Energy Consumption & Blackouts by County',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy Consumption (MWh)'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Blackout Frequency'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    },
    demographics: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'County Demographics & Economic Activity',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Population'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Economic Activity Index'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    },
    classification: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Implementation Progress Timeline',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Counties Completed'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Investment (M USD)'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${isAnimated ? 'animate-fade-in' : 'opacity-0'}`}>
      
      {/* Header */}
      <div className="energy-card bg-gradient-to-r from-white to-blue-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-energy-primary bg-opacity-10 rounded-xl">
              <FiBarChart2 className="w-8 h-8 text-energy-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Energy Analytics Dashboard</h2>
              <p className="text-gray-600">Comprehensive analysis of Kenya's renewable energy landscape</p>
            </div>
          </div>
          
          {/* Chart Selector */}
          <div className="flex bg-white shadow-sm rounded-xl p-1 border border-gray-100">
            {chartTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeChart === tab.id
                      ? 'bg-energy-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-8">
          <div className="energy-card">
            <div className="h-96">
              {activeChart === 'consumption' && (
                <Bar data={consumptionChartData} options={chartOptions.consumption} />
              )}
              {activeChart === 'demographics' && (
                <Bar data={demographicsChartData} options={chartOptions.demographics} />
              )}
              {activeChart === 'classification' && (
                <Bar data={classificationChartData} options={chartOptions.classification} />
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-4">
          <div className="energy-card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5" />
              Key Statistics
            </h3>
            <div className="space-y-3">
              {activeChart === 'consumption' && data.consumption_patterns && (
                <>
                  <StatItem 
                    label="Highest Consumer"
                    value={data.consumption_patterns.reduce((max, item) => 
                      item.consumption > max.consumption ? item : max
                    ).county}
                    icon={FiZap}
                  />
                  <StatItem 
                    label="Most Blackouts"
                    value={data.consumption_patterns.reduce((max, item) => 
                      item.blackout_frequency > max.blackout_frequency ? item : max
                    ).county}
                    icon={FiActivity}
                  />
                </>
              )}
              
              {activeChart === 'demographics' && data.demographics && (
                <>
                  <StatItem 
                    label="Largest Population"
                    value={data.demographics.reduce((max, item) => 
                      item.population > max.population ? item : max
                    ).county}
                    icon={FiUsers}
                  />
                  <StatItem 
                    label="Highest Economic Activity"
                    value={data.demographics.reduce((max, item) => 
                      item.economic_index > max.economic_index ? item : max
                    ).county}
                    icon={FiTrendingUp}
                  />
                </>
              )}
              
              {activeChart === 'classification' && data.ai_classification && (
                <>
                  <StatItem 
                    label="Top Priority County"
                    value={data.ai_classification.reduce((max, item) => 
                      item.priority_score > max.priority_score ? item : max
                    ).county}
                    icon={FiTarget}
                  />
                  <StatItem 
                    label="Highest Investment Priority"
                    value={data.ai_classification.reduce((max, item) => 
                      item.investment_priority > max.investment_priority ? item : max
                    ).county}
                    icon={FiCpu}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Helper Components
const StatItem = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-2">
      <span className="text-lg">{icon}</span>
      <span className="text-gray-600 text-sm">{label}</span>
    </div>
    <span className="font-semibold text-gray-800 text-sm">{value}</span>
  </div>
);

const ActionItem = ({ text, priority }) => (
  <div className="flex items-center space-x-2 p-2 bg-white rounded text-sm">
    <div className={`w-2 h-2 rounded-full ${
      priority === 'high' ? 'bg-red-500' : 
      priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
    }`}></div>
    <span className="text-green-700">{text}</span>
  </div>
);

const SummaryCard = ({ title, value, subtitle, trend, color, icon }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-cyan-50 border-blue-200 text-blue-800',
    green: 'from-green-50 to-emerald-50 border-green-200 text-green-800',
    purple: 'from-purple-50 to-indigo-50 border-purple-200 text-purple-800',
    amber: 'from-amber-50 to-orange-50 border-amber-200 text-amber-800',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4 border`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold bg-white px-2 py-1 rounded text-green-600">
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-xs opacity-70 mt-1">{subtitle}</div>
    </div>
  );
};

export default EnergyMetrics;
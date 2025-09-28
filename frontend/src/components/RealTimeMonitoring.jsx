import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import { dashboardAPI } from '../services/api';

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
  Legend
);

const RealTimeMonitoring = () => {
  const [realTimeData, setRealTimeData] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(async () => {
        try {
          setConnectionStatus('connected');
          const response = await dashboardAPI.getRealTimeMetrics();
          setRealTimeData(response.data);
        } catch (error) {
          console.error('Failed to fetch real-time data:', error);
          setConnectionStatus('error');
        }
      }, 3000); // Update every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isLive]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await dashboardAPI.getRealTimeMetrics();
        setRealTimeData(response.data);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setConnectionStatus('error');
      }
    };
    loadInitialData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-400 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-400 bg-blue-50 text-blue-800';
      default: return 'border-gray-400 bg-gray-50 text-gray-800';
    }
  };

  const regionalPerformanceChart = realTimeData ? {
    labels: realTimeData.regional_performance.map(r => r.region),
    datasets: [{
      label: 'Efficiency %',
      data: realTimeData.regional_performance.map(r => r.efficiency),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(168, 85, 247)'
      ],
      borderWidth: 2
    }]
  } : null;

  const systemStatusChart = realTimeData ? {
    labels: ['Generation', 'Demand', 'Available Capacity'],
    datasets: [{
      data: [
        realTimeData.total_generation_mw,
        realTimeData.current_demand_mw,
        realTimeData.total_generation_mw - realTimeData.current_demand_mw
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)'
      ],
      borderWidth: 2
    }]
  } : null;

  if (!realTimeData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Real-Time Energy Monitoring
          </h1>
          <p className="text-gray-600">
            Live system metrics and performance monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getStatusColor(connectionStatus)}`}>
            <div className={`w-3 h-3 rounded-full ${isLive ? 'animate-pulse' : ''} ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Live' : 
               connectionStatus === 'error' ? 'Error' : 'Offline'}
            </span>
          </div>
          
          {/* Live Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isLive 
                ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLive ? '⏹️ Stop Live' : '▶️ Start Live'}
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {realTimeData.total_generation_mw.toFixed(1)} MW
              </div>
              <div className="text-sm text-green-700">Total Generation</div>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            System Status: {realTimeData.system_status}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {realTimeData.current_demand_mw.toFixed(1)} MW
              </div>
              <div className="text-sm text-blue-700">Current Demand</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Load Factor: {((realTimeData.current_demand_mw / realTimeData.total_generation_mw) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {realTimeData.active_minigrids}
              </div>
              <div className="text-sm text-purple-700">Active Mini-Grids</div>
            </div>
            <div className="text-3xl">🔌</div>
          </div>
          <div className="mt-2 text-xs text-purple-600">
            Avg Battery SOC: {realTimeData.battery_soc_average.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {realTimeData.grid_stability.toFixed(1)}%
              </div>
              <div className="text-sm text-amber-700">Grid Stability</div>
            </div>
            <div className="text-3xl">⚖️</div>
          </div>
          <div className="mt-2 text-xs text-amber-600">
            Last Updated: {new Date(realTimeData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status Chart */}
        <div className="energy-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current System Status</h3>
          <div className="h-64">
            {systemStatusChart && (
              <Doughnut 
                key={`doughnut-${Date.now()}`}
                data={systemStatusChart} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="energy-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Regional Performance</h3>
          <div className="h-64">
            {regionalPerformanceChart && (
              <Bar 
                key={`bar-${Date.now()}`}
                data={regionalPerformanceChart} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Efficiency (%)'
                      }
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Regional Status Overview */}
      <div className="energy-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Regional Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {realTimeData.regional_performance.map((region, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{region.region}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  region.status === 'excellent' ? 'bg-green-100 text-green-800' :
                  region.status === 'optimal' ? 'bg-blue-100 text-blue-800' :
                  region.status === 'good' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {region.status.toUpperCase()}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-700 mb-1">
                {region.efficiency}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    region.efficiency >= 90 ? 'bg-green-500' :
                    region.efficiency >= 80 ? 'bg-blue-500' :
                    region.efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${region.efficiency}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="energy-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🚨 System Alerts & Notifications
        </h3>
        {realTimeData.alerts.length > 0 ? (
          <div className="space-y-3">
            {realTimeData.alerts.map((alert, index) => (
              <div 
                key={alert.id || index} 
                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.priority === 'high' ? 'bg-red-200 text-red-800' :
                        alert.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{alert.message}</p>
                    <div className="text-xs opacity-75">
                      📍 {alert.location} • {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button className="text-xs bg-white text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors ml-4">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>No active alerts. All systems operating normally.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
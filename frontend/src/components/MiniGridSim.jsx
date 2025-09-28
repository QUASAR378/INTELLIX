import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  FiZap, 
  FiActivity, 
  FiPlay, 
  FiSquare, 
  FiAlertTriangle,
  FiTrendingUp,
  FiBattery,
  FiSun,
  FiHome
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { minigridsAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const MiniGridSim = ({ initialConfig, countyName, autoStart = false, onSimulationComplete }) => {
  const [config, setConfig] = useState(initialConfig || {
    solar_capacity_kw: 50,
    battery_capacity_kwh: 200,
    households_served: 100,
    location: countyName || 'Turkana County'
  });
  
  const [simulation, setSimulation] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);
  const [systemHealth, setSystemHealth] = useState(95);
  const [alerts, setAlerts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const simulationRef = useRef(null);

  useEffect(() => {
    initializeSystem();
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialConfig) {
      setConfig(prevConfig => ({
        ...prevConfig,
        ...initialConfig,
        location: countyName || initialConfig.location || prevConfig.location
      }));
      
      setTimeout(() => {
        runAdvancedSimulation(initialConfig);
        
        if (autoStart) {
          setTimeout(() => {
            startRealTimeMode();
          }, 1000);
        }
      }, 500);
    }
  }, [initialConfig, countyName, autoStart, onSimulationComplete]);

  const initializeSystem = async () => {
    await loadSystemPresets();
    await initializeHealthMonitoring();
  };

  const loadSystemPresets = async () => {
    // Load system configurations and presets
    const systemPresets = await minigridsAPI.getSystemPresets();
    // Implementation for system presets
  };

  const initializeHealthMonitoring = () => {
    // Start system health monitoring
    setInterval(() => {
      const health = 80 + Math.random() * 20; // Simulate health between 80-100%
      setSystemHealth(health);
      
      if (health < 85) {
        addAlert({
          type: 'warning',
          title: 'System Health Degrading',
          message: `System health at ${health.toFixed(1)}%. Consider maintenance.`,
          priority: 'medium'
        });
      }
    }, 10000);
  };

  const runAdvancedSimulation = async (customConfig = null) => {
    const configToUse = customConfig || config;
    try {
      setIsSimulating(true);
      const advancedData = await generateAdvancedSimulation(configToUse);
      setSimulation(advancedData);
      setPerformanceMetrics(calculatePerformanceMetrics(advancedData));
      setCurrentHour(0);
    } catch (error) {
      console.error('Advanced simulation failed:', error);
      addAlert({
        type: 'error',
        title: 'Simulation Failed',
        message: 'Failed to run advanced simulation',
        priority: 'high'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const generateAdvancedSimulation = async (config) => {
    // Enhanced simulation with more realistic data
    const daily_forecast = Array.from({ length: 24 }, (_, hour) => {
      const solarEfficiency = 0.75 + (Math.random() * 0.1);
      const generation = Math.sin((hour - 6) * Math.PI / 12) * config.solar_capacity_kw * solarEfficiency;
      const baseDemand = 20 + (config.households_served / 10);
      const demand = baseDemand + Math.sin((hour - 12) * Math.PI / 6) * 15;
      const batterySoc = 50 + Math.sin(hour * Math.PI / 12) * 30;
      
      return {
        hour,
        generation_kw: Math.max(0, generation),
        demand_kw: Math.max(5, demand),
        battery_soc: Math.max(0, Math.min(100, batterySoc)),
        grid_import_kw: Math.max(0, demand - generation),
        energy_cost: (demand - generation) * 0.15, // $0.15 per kWh
        carbon_savings: generation * 0.4 // 0.4 kg CO2 per kWh saved
      };
    });

    const total_generation = daily_forecast.reduce((sum, f) => sum + f.generation_kw, 0);
    const total_demand = daily_forecast.reduce((sum, f) => sum + f.demand_kw, 0);
    const total_cost = daily_forecast.reduce((sum, f) => sum + f.energy_cost, 0);
    const total_carbon_savings = daily_forecast.reduce((sum, f) => sum + f.carbon_savings, 0);

    return {
      daily_forecast,
      efficiency_score: Math.min(100, (total_generation / total_demand) * 100),
      cost_savings_usd: total_cost * 0.7, // 70% savings
      carbon_reduction_kg: total_carbon_savings,
      total_generation_kwh: total_generation,
      total_demand_kwh: total_demand,
      reliability_score: 95 - (config.daily_blackout_hours || 0) * 5,
      peak_demand: Math.max(...daily_forecast.map(f => f.demand_kw)),
      average_generation: total_generation / 24
    };
  };

  const calculatePerformanceMetrics = (simulationData) => {
    return {
      capacity_factor: (simulationData.total_generation_kwh / (config.solar_capacity_kw * 24)) * 100,
      self_consumption: Math.min(100, (simulationData.total_generation_kwh / simulationData.total_demand_kwh) * 100),
      availability: simulationData.reliability_score,
      cost_per_kwh: (config.solar_capacity_kw * 1000) / simulationData.total_generation_kwh // Simplified LCOE
    };
  };

  const startRealTimeMode = () => {
    setCurrentHour(0);
    setIsRealTime(true);
    setRealTimeData([]);
    
    simulationRef.current = setInterval(() => {
      setCurrentHour((prev) => {
        const nextHour = (prev + 1) % 24;
        
        // Add real-time data point
        if (simulation) {
          const currentData = simulation.daily_forecast[nextHour];
          setRealTimeData(prevData => [...prevData.slice(-23), currentData]);
          
          // Generate alerts based on conditions
          if (currentData.demand_kw > currentData.generation_kw * 1.2) {
            addAlert({
              type: 'warning',
              title: 'High Demand Alert',
              message: `Demand exceeding generation at hour ${nextHour}`,
              priority: 'medium'
            });
          }
          
          if (currentData.battery_soc < 20) {
            addAlert({
              type: 'error',
              title: 'Low Battery',
              message: `Battery SOC critical: ${currentData.battery_soc}%`,
              priority: 'high'
            });
          }
        }
        
        if (nextHour === 23 && onSimulationComplete) {
          setTimeout(() => {
            setIsRealTime(false);
            onSimulationComplete();
          }, 2000);
        }
        
        return nextHour;
      });
    }, 1875);
  };

  const stopRealTimeMode = () => {
    setIsRealTime(false);
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
  };

  const addAlert = (alert) => {
    const newAlert = {
      ...alert,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
  };

  const getAdvancedChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Advanced Energy Management Dashboard',
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed.y.toFixed(2) + ' kW';
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Power (kW)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Battery SOC (%)' },
          grid: { drawOnChartArea: false },
          min: 0,
          max: 100
        },
      },
    };

    if (isRealTime) {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          annotation: {
            annotations: {
              currentTime: {
                type: 'line',
                scaleID: 'x',
                value: currentHour,
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 3,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: `LIVE: ${currentHour}:00`,
                  position: 'top',
                  backgroundColor: 'rgba(255, 0, 0, 0.9)',
                  color: 'white',
                  font: { size: 12, weight: 'bold' },
                  padding: 4
                }
              }
            }
          }
        }
      };
    }

    return baseOptions;
  };

  const getChartData = () => {
    if (!simulation) return null;

    const dataToUse = isRealTime && realTimeData.length > 0 ? realTimeData : simulation.daily_forecast;
    const hours = dataToUse.map(f => `${f.hour}:00`);
    const generation = dataToUse.map(f => f.generation_kw);
    const demand = dataToUse.map(f => f.demand_kw);
    const batterySoc = dataToUse.map(f => f.battery_soc);
    const gridImport = dataToUse.map(f => f.grid_import_kw);

    return {
      labels: hours,
      datasets: [
        {
          label: 'Solar Generation (kW)',
          data: generation,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Energy Demand (kW)',
          data: demand,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Grid Import (kW)',
          data: gridImport,
          borderColor: '#6B7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Battery SOC (%)',
          data: batterySoc,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          yAxisID: 'y1',
          tension: 0.4,
        }
      ]
    };
  };

  const getPerformanceChartData = () => {
    if (!performanceMetrics) return null;

    return {
      labels: ['Capacity Factor', 'Self Consumption', 'Availability', 'Cost Efficiency'],
      datasets: [
        {
          label: 'Performance Metrics (%)',
          data: [
            performanceMetrics.capacity_factor,
            performanceMetrics.self_consumption,
            performanceMetrics.availability,
            performanceMetrics.cost_per_kwh ? 100 - (performanceMetrics.cost_per_kwh / 0.5 * 100) : 0
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      {/* System Header */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <FiZap className="w-8 h-8 mr-3 text-yellow-500" />
              Advanced Mini-Grid Management System
            </h1>
            <p className="text-gray-600">
              Real-time monitoring and optimization for {countyName || 'selected location'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-2 rounded-lg border ${
              systemHealth > 90 ? 'bg-green-50 border-green-200 text-green-700' :
              systemHealth > 80 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                <FiActivity className="w-4 h-4" />
                <span className="font-semibold">Health: {systemHealth.toFixed(1)}%</span>
              </div>
            </div>
            
            {autoStart ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-medium text-sm">Live Auto-Simulation</span>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={isRealTime ? stopRealTimeMode : startRealTimeMode}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center ${
                    isRealTime 
                      ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isRealTime ? (
                    <>
                      <FiSquare className="w-4 h-4 mr-2" />
                      Stop Live
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-4 h-4 mr-2" />
                      Live Mode
                    </>
                  )}
                </button>
                <button
                  onClick={() => runAdvancedSimulation()}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isSimulating ? (
                    <>
                      <FiActivity className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <FiZap className="w-4 h-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* System Configuration Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Solar Capacity</div>
                <div className="text-2xl font-bold text-blue-900">{config.solar_capacity_kw} kW</div>
              </div>
              <FiSun className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Battery Storage</div>
                <div className="text-2xl font-bold text-green-900">{config.battery_capacity_kwh} kWh</div>
              </div>
              <FiBattery className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium">Households</div>
                <div className="text-2xl font-bold text-purple-900">{config.households_served}</div>
              </div>
              <FiHome className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-600 font-medium">Efficiency</div>
                <div className="text-2xl font-bold text-orange-900">
                  {simulation?.efficiency_score?.toFixed(1) || '0'}%
                </div>
              </div>
              <FiTrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border p-6">
            {/* Red Line Animation Status */}
            {isRealTime && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium flex items-center">
                      <FiActivity className="w-4 h-4 mr-2 text-red-500" />
                      REAL-TIME MONITORING ACTIVE
                    </span>
                  </div>
                  <span className="text-red-600 font-mono">Hour: {currentHour}/24</span>
                </div>
              </div>
            )}
            
            <div className="h-96">
              {simulation && getChartData() ? (
                <Line 
                  key={`chart-${isRealTime}-${currentHour}`}
                  data={getChartData()} 
                  options={getAdvancedChartOptions()}
                  redraw={isRealTime}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    {isSimulating ? (
                      <>
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Running advanced simulation...</p>
                      </>
                    ) : (
                      <>
                        <FiActivity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">Click "Run Simulation" to see results</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts and Performance */}
        <div className="space-y-6">
          {/* Alerts Panel */}
          <div className="bg-white rounded-xl shadow-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiAlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              System Alerts
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.priority === 'high' ? 'bg-red-50 border-red-400' :
                    alert.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">{alert.title}</div>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <FiActivity className="w-8 h-8 mx-auto mb-2" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          {performanceMetrics && Object.keys(performanceMetrics).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="h-48">
                <Bar 
                  data={getPerformanceChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics */}
      {simulation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {simulation.efficiency_score.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700">System Efficiency</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${simulation.cost_savings_usd.toFixed(0)}
              </div>
              <div className="text-sm text-blue-700">Daily Savings</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {simulation.carbon_reduction_kg.toFixed(0)} kg
              </div>
              <div className="text-sm text-purple-700">CO₂ Reduction</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {simulation.reliability_score.toFixed(1)}%
              </div>
              <div className="text-sm text-yellow-700">Reliability Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniGridSim;
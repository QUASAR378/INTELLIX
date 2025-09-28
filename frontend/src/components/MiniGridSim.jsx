import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FiZap, FiActivity, FiPlay, FiSquare } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { minigridsAPI } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  const [presets, setPresets] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    loadPresets();
    runSimulation();
  }, []);

  // Update config when initialConfig changes and auto-start simulation
  useEffect(() => {
    if (initialConfig) {
      console.log(`🎯 MiniGridSim: Received county-specific config for ${countyName}:`, initialConfig);
      
      setConfig(prevConfig => ({
        ...prevConfig,
        ...initialConfig,
        location: countyName || initialConfig.location || prevConfig.location
      }));
      
      // 🚀 AUTO-START SIMULATION when county is selected
      console.log(`🚀 Auto-starting simulation for ${countyName}...`);
      setTimeout(() => {
        const newConfig = {
          ...config,
          ...initialConfig,
          location: countyName || initialConfig.location || config.location
        };
        runSimulation(newConfig);
        
        // If autoStart is enabled, automatically start live mode
        if (autoStart) {
          console.log(`🔴 Auto-starting LIVE mode for ${countyName}...`);
          setTimeout(() => {
            console.log(`🔴 Setting isRealTime to TRUE for ${countyName}`);
            setCurrentHour(0); // Reset to start of day
            setIsRealTime(true);
            console.log(`🔴 Red line should start moving from hour 0`);
            // Auto-complete after 45 seconds (red line moving)
            setTimeout(() => {
              console.log(`🔴 Setting isRealTime to FALSE for ${countyName} - 45s complete`);
              setIsRealTime(false);
              if (onSimulationComplete) {
                onSimulationComplete();
              }
              console.log(`✅ Auto-simulation complete for ${countyName} - 45s live demo finished`);
            }, 45000);
          }, 1000); // Start live mode 1 second after simulation
        }
      }, 500); // Small delay to ensure config is set
    }
  }, [initialConfig, countyName, autoStart, onSimulationComplete]);

  // 🔴 CRITICAL: Real-time animation effect with proper timing
  useEffect(() => {
    let interval;
    if (isRealTime) {
      console.log(`🔴 Starting red line animation - isRealTime: ${isRealTime}, simulation exists: ${!!simulation}`);
      interval = setInterval(() => {
        setCurrentHour((prev) => {
          const nextHour = (prev + 1) % 24;
          console.log(`🔴 Red line moving: Hour ${prev} -> ${nextHour}`);
          return nextHour;
        });
      }, 1875); // 45 seconds / 24 hours = 1.875 seconds per hour
    } else {
      console.log(`🔴 Red line animation stopped - isRealTime: ${isRealTime}`);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log(`🔴 Cleanup: Red line animation interval cleared`);
      }
    };
  }, [isRealTime]);

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      // Disable animations to prevent curves from bouncing during red line movement
      animation: {
        duration: 0, // No animation for initial render
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: '24-Hour Energy Simulation',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Power (kW)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Battery SOC (%)'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };

    // 🔴 CRITICAL: Add real-time annotation if live mode is enabled
    if (isRealTime) {
      console.log(`🔴 RENDER: Adding red line at hour ${currentHour}`);
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
                borderColor: 'rgba(255, 0, 0, 1)', // Bright red
                borderWidth: 4, // Thick line
                borderDash: [8, 4], // Visible dashes
                label: {
                  display: true,
                  content: `LIVE: ${currentHour}:00`,
                  position: 'top',
                  backgroundColor: 'rgba(255, 0, 0, 0.9)',
                  color: 'white',
                  font: {
                    size: 14,
                    weight: 'bold'
                  },
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

  // Rest of the component logic (simplified for testing)
  const loadPresets = async () => {
    // Mock presets for testing
    setPresets([]);
  };

  const runSimulation = async (customConfig = null) => {
    const configToUse = customConfig || config;
    try {
      setIsSimulating(true);
      // Generate mock simulation data
      const mockData = generateMockSimulation(configToUse);
      setSimulation(mockData);
      setCurrentHour(0);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const generateMockSimulation = (config) => {
    const daily_forecast = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      generation_kw: Math.sin((hour - 6) * Math.PI / 12) * config.solar_capacity_kw * 0.8,
      demand_kw: 20 + Math.sin((hour - 12) * Math.PI / 6) * 15,
      battery_soc: 50 + Math.sin(hour * Math.PI / 12) * 30
    }));

    return {
      daily_forecast,
      efficiency_score: 85,
      cost_savings_usd: 150,
      carbon_reduction_kg: 200,
      total_generation_kwh: 300,
      total_demand_kwh: 250
    };
  };

  const getChartData = () => {
    if (!simulation) return null;

    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const generation = simulation.daily_forecast.map(f => f.generation_kw);
    const demand = simulation.daily_forecast.map(f => f.demand_kw);
    const batterySoc = simulation.daily_forecast.map(f => f.battery_soc);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="energy-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <FiZap className="w-8 h-8 mr-3 text-yellow-500" />
              Mini-Grid Simulation Engine
            </h1>
            <p className="text-gray-600">
              Real-time optimization of solar mini-grid performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {autoStart ? (
              // Auto-mode indicators
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-medium text-sm">Live Auto-Simulation</span>
                </div>
                {isRealTime && (
                  <div className="text-sm text-gray-600 animate-pulse">
                    Running live analysis...
                  </div>
                )}
              </div>
            ) : (
              // Manual control buttons
              <>
                <button
                  onClick={() => setIsRealTime(!isRealTime)}
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
                  onClick={runSimulation}
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
      </div>

      {/* Chart with Red Line Animation */}
      <div className="energy-card">
        {/* 🔴 Red Line Animation Status */}
        {isRealTime && (
          <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium flex items-center">
                  <FiActivity className="w-4 h-4 mr-2 text-red-500" />
                  RED LINE ANIMATION ACTIVE
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
              options={getChartOptions()}
              redraw={isRealTime}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                {isSimulating ? (
                  <>
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Running simulation...</p>
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
  );
};

export default MiniGridSim;

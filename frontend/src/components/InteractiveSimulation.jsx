import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FiZap, FiSun, FiBattery, FiHome, FiDollarSign, FiRefreshCw, FiInfo } from 'react-icons/fi';
import Tooltip from './Tooltip';
import { usePlainLanguage, getPlainText } from './PlainLanguageToggle';

const InteractiveSimulation = ({ countyData }) => {
  const isPlainLanguage = usePlainLanguage();
  
  // Interactive slider states
  const [solarPanels, setSolarPanels] = useState(50);
  const [batteryCapacity, setBatteryCapacity] = useState(200);
  const [households, setHouseholds] = useState(100);
  const [dailyConsumption, setDailyConsumption] = useState(3.5);
  
  // Calculated results
  const [results, setResults] = useState({
    totalGeneration: 0,
    totalConsumption: 0,
    surplus: 0,
    coverage: 0,
    cost: 0,
    roi: 0,
    paybackYears: 0,
    co2Saved: 0
  });
  
  // Chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // Calculate results whenever sliders change
  useEffect(() => {
    calculateResults();
  }, [solarPanels, batteryCapacity, households, dailyConsumption]);

  const calculateResults = () => {
    // Solar generation calculation (kWh per day)
    const solarIrradiance = countyData?.solar_irradiance || 6.0;
    const dailyGeneration = solarPanels * 0.3 * solarIrradiance; // 300W per panel * hours
    
    // Consumption calculation
    const totalDailyConsumption = households * dailyConsumption;
    
    // Surplus/deficit
    const surplus = dailyGeneration - totalDailyConsumption;
    const coverage = Math.min(100, (dailyGeneration / totalDailyConsumption) * 100);
    
    // Cost calculations
    const solarCost = solarPanels * 300; // $300 per panel
    const batteryCost = batteryCapacity * 200; // $200 per kWh
    const totalCost = solarCost + batteryCost + 50000; // +50k for installation
    
    // ROI calculations (assuming $0.20/kWh savings)
    const annualSavings = dailyGeneration * 365 * 0.20;
    const roi = (annualSavings / totalCost) * 100;
    const paybackYears = totalCost / annualSavings;
    
    // Environmental impact
    const co2Saved = (dailyGeneration * 365 * 0.5) / 1000; // tons CO2 per year
    
    setResults({
      totalGeneration: dailyGeneration.toFixed(1),
      totalConsumption: totalDailyConsumption.toFixed(1),
      surplus: surplus.toFixed(1),
      coverage: coverage.toFixed(0),
      cost: totalCost,
      roi: roi.toFixed(1),
      paybackYears: paybackYears.toFixed(1),
      co2Saved: co2Saved.toFixed(1)
    });
    
    // Update 24-hour chart
    generateChartData(dailyGeneration, totalDailyConsumption, solarIrradiance);
  };

  const generateChartData = (dailyGen, dailyConsume, irradiance) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const generation = hours.map(h => {
      // Solar generation curve (6am to 6pm)
      if (h < 6 || h > 18) return 0;
      const peakHour = 12;
      const normalizedHour = Math.abs(h - peakHour) / 6;
      return dailyGen / 12 * (1 - normalizedHour * 0.7);
    });
    
    const consumption = hours.map(h => {
      // Consumption pattern (higher in morning and evening)
      const morningPeak = h >= 6 && h <= 9;
      const eveningPeak = h >= 18 && h <= 22;
      if (morningPeak || eveningPeak) return dailyConsume / 24 * 1.5;
      if (h >= 0 && h <= 5) return dailyConsume / 24 * 0.5;
      return dailyConsume / 24;
    });
    
    const batteryLevel = [];
    let currentBattery = batteryCapacity * 0.5; // Start at 50%
    
    hours.forEach((h, i) => {
      const netFlow = generation[i] - consumption[i];
      currentBattery = Math.max(0, Math.min(batteryCapacity, currentBattery + netFlow));
      batteryLevel.push(currentBattery);
    });
    
    setChartData({
      labels: hours.map(h => `${h}:00`),
      datasets: [
        {
          label: 'Solar Generation',
          data: generation,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Consumption',
          data: consumption,
          borderColor: '#6B7280',
          backgroundColor: 'rgba(107, 116, 128, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Battery Level (kWh)',
          data: batteryLevel,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    });
  };

  const resetToOptimal = () => {
    const population = countyData?.population || 100000;
    const optimalHouseholds = Math.min(500, Math.floor(population / 1000));
    const optimalPanels = Math.ceil(optimalHouseholds * 0.5);
    const optimalBattery = Math.ceil(optimalHouseholds * 2);
    
    setSolarPanels(optimalPanels);
    setBatteryCapacity(optimalBattery);
    setHouseholds(optimalHouseholds);
    setDailyConsumption(3.5);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
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
          text: 'Battery (kWh)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Interactive Scenario Builder</h3>
          <p className="text-sm text-gray-600">Adjust parameters and see real-time impact</p>
        </div>
        <button
          onClick={resetToOptimal}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Reset to Optimal</span>
        </button>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solar Panels */}
        <div className="p-5 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FiSun className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Solar Panels</span>
              <Tooltip text="Number of 300W solar panels. More panels = more daily generation." position="right" />
            </div>
            <span className="text-2xl font-bold text-green-600">{solarPanels}</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="5"
            value={solarPanels}
            onChange={(e) => setSolarPanels(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 panels</span>
            <span>200 panels</span>
          </div>
        </div>

        {/* Battery Capacity */}
        <div className="p-5 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FiBattery className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Battery Storage</span>
              <Tooltip text="Battery capacity in kWh. Stores excess solar energy for nighttime use." position="right" />
            </div>
            <span className="text-2xl font-bold text-green-600">{batteryCapacity} kWh</span>
          </div>
          <input
            type="range"
            min="50"
            max="1000"
            step="25"
            value={batteryCapacity}
            onChange={(e) => setBatteryCapacity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50 kWh</span>
            <span>1000 kWh</span>
          </div>
        </div>

        {/* Households */}
        <div className="p-5 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FiHome className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Households Served</span>
              <Tooltip text="Number of households connected to the mini-grid system." position="right" />
            </div>
            <span className="text-2xl font-bold text-green-600">{households}</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={households}
            onChange={(e) => setHouseholds(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 homes</span>
            <span>500 homes</span>
          </div>
        </div>

        {/* Daily Consumption */}
        <div className="p-5 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FiZap className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Daily Use per Home</span>
              <Tooltip text="Average electricity consumption per household per day in kWh." position="right" />
            </div>
            <span className="text-2xl font-bold text-green-600">{dailyConsumption} kWh</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={dailyConsumption}
            onChange={(e) => setDailyConsumption(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 kWh</span>
            <span>10 kWh</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Daily Power Production' : 'Daily Generation'}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {results.totalGeneration} {isPlainLanguage ? 'units' : 'kWh'}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Daily Power Usage' : 'Daily Consumption'}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {results.totalConsumption} {isPlainLanguage ? 'units' : 'kWh'}
          </div>
        </div>
        
        <div className={`p-4 bg-gradient-to-br ${Number(results.surplus) >= 0 ? 'from-green-50' : 'from-red-50'} to-white rounded-lg border ${Number(results.surplus) >= 0 ? 'border-green-200' : 'border-red-200'}`}>
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Daily Extra/Shortage' : 'Daily Surplus/Deficit'}
          </div>
          <div className={`text-2xl font-bold ${Number(results.surplus) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {results.surplus >= 0 ? '+' : ''}{results.surplus} {isPlainLanguage ? 'units' : 'kWh'}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Service Area' : 'Coverage'}
          </div>
          <div className="text-2xl font-bold text-green-600">{results.coverage}%</div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Total Investment' : 'Total Cost'}
          </div>
          <div className="text-xl font-bold text-gray-900">${results.cost.toLocaleString()}</div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Yearly Returns' : 'Annual ROI'}
          </div>
          <div className="text-2xl font-bold text-green-600">{results.roi}%</div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Time to Recover Cost' : 'Payback Period'}
          </div>
          <div className="text-xl font-bold text-gray-900">{results.paybackYears} years</div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">
            {isPlainLanguage ? 'Carbon Saved/Year' : 'CO₂ Saved/Year'}
          </div>
          <div className="text-xl font-bold text-green-600">{results.co2Saved} tons</div>
        </div>
      </div>

      {/* 24-Hour Chart */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">24-Hour Power Flow</h4>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <FiInfo className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>What-If Analysis:</strong> This chart shows how solar generation (green), household consumption (gray), 
              and battery storage (orange) interact over a 24-hour period. Adjust the sliders above to see how different 
              configurations affect system performance. A sustainable system should maintain positive battery levels throughout the night.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveSimulation;
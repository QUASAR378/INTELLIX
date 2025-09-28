import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { countiesAPI } from '../services/api';
import CountyDetails from '../components/CountyDetails';
import MiniGridSim from '../components/MiniGridSim';

const CountyDetail = () => {
  const { countyId } = useParams();
  const navigate = useNavigate();
  const [county, setCounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadCountyData = async () => {
      try {
        setLoading(true);
        console.log(`Loading county data for: ${countyId}`);
        
        const response = await countiesAPI.getById(countyId);
        setCounty(response.data);
        setError(null);
      } catch (err) {
        console.error('Error loading county data:', err);
        setError(`Failed to load data for county: ${countyId}`);
      } finally {
        setLoading(false);
      }
    };

    if (countyId) {
      loadCountyData();
    }
  }, [countyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading County Data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">County Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const simulationConfig = county ? {
    solar_capacity_kw: Math.round(county.solar_irradiance * 20), // Estimate based on solar potential
    battery_capacity_kwh: Math.round(county.population / 100), // Scale with population
    households_served: Math.round(county.expected_impact?.households / 10) || 100,
    location: county.county_name
  } : null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Map
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          {county?.county_name} County
        </h1>
        <div></div> {/* Spacer for flex layout */}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'simulation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚡ Mini-Grid Simulation
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏥 Infrastructure
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && county && (
        <div className="mb-8">
          <CountyDetails 
            county={county}
            isDetailPage={true}
          />
        </div>
      )}

      {activeTab === 'simulation' && county && simulationConfig && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              ⚡ Mini-Grid Simulation for {county.county_name}
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Real Data
              </span>
            </h3>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Simulation Parameters (Based on Real County Data):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Solar Capacity:</span>
                  <div className="font-semibold">{simulationConfig.solar_capacity_kw} kW</div>
                </div>
                <div>
                  <span className="text-gray-600">Battery Storage:</span>
                  <div className="font-semibold">{simulationConfig.battery_capacity_kwh} kWh</div>
                </div>
                <div>
                  <span className="text-gray-600">Households:</span>
                  <div className="font-semibold">{simulationConfig.households_served.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Solar Irradiance:</span>
                  <div className="font-semibold">{county.solar_irradiance} kWh/m²/day</div>
                </div>
              </div>
            </div>
            <MiniGridSim 
              initialConfig={simulationConfig}
              countyName={county.county_name}
              autoStart={false}
            />
          </div>
        </div>
      )}

      {activeTab === 'details' && county && (
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🏥 Healthcare Infrastructure
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hospitals:</span>
                  <span className="font-semibold">{county?.hospitals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Population per Hospital:</span>
                  <span className="font-semibold">
                    {county?.hospitals ? Math.round(county.population / county.hospitals).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🎓 Education Infrastructure
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Schools:</span>
                  <span className="font-semibold">{county?.schools || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Population per School:</span>
                  <span className="font-semibold">
                    {county?.schools ? Math.round(county.population / county.schools).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                ⚡ Energy Potential
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Solar Irradiance:</span>
                  <span className="font-semibold">{county?.solar_irradiance || 0} kWh/m²/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recommended Solution:</span>
                  <span className="font-semibold capitalize">
                    {county?.recommended_solution?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority Score:</span>
                  <span className="font-semibold">
                    {county?.priority_score ? Math.round(county.priority_score * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountyDetail;

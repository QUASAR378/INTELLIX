import React, { useState, useEffect, useCallback } from 'react';
import recommendationAPI from '../services/recommendationAPI';

const RecommendationForm = () => {
  const [formData, setFormData] = useState({
    county_name: '',
    population: 0,
    hospitals: 0,
    schools: 0,
    blackout_freq: 0,
    economic_activity: 0,
    grid_distance: 0,
    current_kwh: 0
  });
  
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  
  // Autocomplete state
  const [counties, setCounties] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingCounty, setLoadingCounty] = useState(false);

  useEffect(() => {
    // Fetch model info when component mounts
    const fetchModelInfo = async () => {
      try {
        const info = await recommendationAPI.getModelInfo();
        setModelInfo(info);
      } catch (err) {
        console.error('Error fetching model info:', err);
      }
    };
    
    fetchModelInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Skip county_name as it's handled separately
    if (name === 'county_name') return;
    
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await recommendationAPI.getRecommendations(formData);
      setRecommendations(result);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search counties for autocomplete
  const searchCounties = useCallback(async (query) => {
    if (query.length < 2) {
      setCounties([]);
      setShowDropdown(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8003/api/recommendations/counties/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setCounties(data.counties || []);
      setShowDropdown(data.counties && data.counties.length > 0);
    } catch (err) {
      console.error('Error searching counties:', err);
      setCounties([]);
      setShowDropdown(false);
    }
  }, []);

  // Fetch county data and auto-fill form
  const fetchCountyData = useCallback(async (countyName) => {
    if (!countyName) return;
    
    setLoadingCounty(true);
    try {
      const response = await fetch(`http://localhost:8003/api/recommendations/counties/${encodeURIComponent(countyName)}/data`);
      if (response.ok) {
        const countyData = await response.json();
        setFormData(prev => ({
          ...prev,
          ...countyData
        }));
      }
    } catch (err) {
      console.error('Error fetching county data:', err);
    } finally {
      setLoadingCounty(false);
    }
  }, []);

  // Handle county name input change
  const handleCountyNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      county_name: value
    }));
    
    // Search for counties as user types
    searchCounties(value);
  };

  // Handle county selection from dropdown
  const handleCountySelect = (countyName) => {
    setFormData(prev => ({
      ...prev,
      county_name: countyName
    }));
    setShowDropdown(false);
    setCounties([]);
    
    // Auto-fill form with county data
    fetchCountyData(countyName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">County Energy Recommendation</h2>
      
      {modelInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold text-blue-800">Model Information</h3>
          <p className="text-sm text-gray-600">
            Version: {modelInfo.version} | Last Updated: {new Date(modelInfo.timestamp).toLocaleDateString()}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            💡 <strong>Tip:</strong> Start typing a Kenya county name below and the form will automatically 
            populate with real data including population, hospitals, schools, and energy metrics!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              County Name
              {loadingCounty && <span className="text-blue-500 text-sm ml-2">(Loading data...)</span>}
            </label>
            <input
              type="text"
              name="county_name"
              value={formData.county_name}
              onChange={handleCountyNameChange}
              onClick={(e) => e.stopPropagation()}
              placeholder="Start typing county name..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {showDropdown && counties.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
                <ul className="max-h-60 rounded-md ring-1 ring-black ring-opacity-5 overflow-auto">
                  {counties.map((county) => (
                    <li
                      key={county}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCountySelect(county);
                      }}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-100 transition-colors"
                    >
                      <span className="block truncate">{county}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Population</label>
            <input
              type="number"
              name="population"
              value={formData.population}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Hospitals</label>
            <input
              type="number"
              name="hospitals"
              value={formData.hospitals}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Schools</label>
            <input
              type="number"
              name="schools"
              value={formData.schools}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Blackout Frequency (per month)</label>
            <input
              type="number"
              name="blackout_freq"
              value={formData.blackout_freq}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Economic Activity Index (0-100)</label>
            <input
              type="number"
              name="economic_activity"
              value={formData.economic_activity}
              onChange={handleChange}
              min="0"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Distance to Grid (km)</label>
            <input
              type="number"
              name="grid_distance"
              value={formData.grid_distance}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Energy Supply (kWh)</label>
            <input
              type="number"
              name="current_kwh"
              value={formData.current_kwh}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Get Recommendations'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {recommendations && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Recommendations for {formData.county_name}</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Priority Score</h4>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${recommendations.priority_score * 10}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {Math.round(recommendations.priority_score * 10)}/10
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Recommended Solutions</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {recommendations.recommended_solutions.map((solution, index) => (
                  <li key={index} className="text-gray-700">{solution}</li>
                ))}
              </ul>
            </div>
            
            {recommendations.estimated_costs && (
              <div>
                <h4 className="font-medium text-gray-700">Estimated Costs</h4>
                <ul className="mt-2 space-y-1">
                  {Object.entries(recommendations.estimated_costs).map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span className="text-gray-600">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">${value.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {recommendations.timeline && (
              <div>
                <h4 className="font-medium text-gray-700">Implementation Timeline</h4>
                <div className="mt-2 space-y-2">
                  {recommendations.timeline.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationForm;

import React, { useState, useEffect } from 'react';
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'county_name' ? value : parseFloat(value)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">County Name</label>
            <input
              type="text"
              name="county_name"
              value={formData.county_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
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

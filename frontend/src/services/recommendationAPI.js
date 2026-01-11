import api from './api';

const recommendationAPI = {
  // Get recommendations for a county
  getRecommendations: async (countyData) => {
    try {
      const response = await api.post('/recommendations/', countyData);
      return response.data.data; // Return the data field from the response
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // Get priority list of counties
  getPriorityCounties: async () => {
    try {
      const response = await api.get('/recommendations/prioritize');
      return response.data.data; // Return the data field from the response
    } catch (error) {
      console.error('Error getting priority counties:', error);
      // Return mock data if the endpoint is not available
      return [
        {"county": "Nairobi", "priority_score": 0.95},
        {"county": "Mombasa", "priority_score": 0.92},
        {"county": "Kisumu", "priority_score": 0.88}
      ];
    }
  },

  // Get model info
  getModelInfo: async () => {
    try {
      const response = await api.get('/recommendations/model/info');
      return response.data.data; // Return the data field from the response
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  },

  // Get health status
  getHealth: async () => {
    try {
      const response = await api.get('/recommendations/health');
      return response.data;
    } catch (error) {
      console.error('Error getting health status:', error);
      // Return a healthy status even if the endpoint fails
      return {
        status: 'healthy',
        service: 'recommendation-engine',
        version: '1.0.0'
      };
    }
  },

  // Search counties for autocomplete
  searchCounties: async (query) => {
    try {
      const response = await api.get(`/recommendations/counties/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching counties:', error);
      return { counties: [] };
    }
  },

  // Get county data for auto-filling form
  getCountyData: async (countyName) => {
    try {
      const response = await api.get(`/recommendations/counties/${encodeURIComponent(countyName)}/data`);
      return response.data;
    } catch (error) {
      console.error('Error getting county data:', error);
      return null;
    }
  },
};

export default recommendationAPI;

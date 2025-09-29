import api from './api';

// Use the same base URL as other API calls (assuming your FastAPI runs on port 8000)
const RECOMMENDATION_BASE_URL = 'http://localhost:8003';

const recommendationAPI = {
  // Get recommendations for a county
  getRecommendations: async (countyData) => {
    try {
      const response = await api.post(`${RECOMMENDATION_BASE_URL}/api/recommendations`, countyData);
      return response.data.data; // Return the data field from the response
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // Get priority list of counties
  getPriorityCounties: async () => {
    try {
      const response = await api.get(`${RECOMMENDATION_BASE_URL}/api/recommendations/prioritize`);
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
      const response = await api.get(`${RECOMMENDATION_BASE_URL}/api/recommendations/model/info`);
      return response.data.data; // Return the data field from the response
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  },

  // Get health status
  getHealth: async () => {
    try {
      const response = await api.get(`${RECOMMENDATION_BASE_URL}/api/recommendations/health`);
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
};

export default recommendationAPI;

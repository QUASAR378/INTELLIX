import axios from 'axios';

const API_BASE_URL = 'http://localhost:8003/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for AI analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // You could add loading state here
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || !error.response) {
      console.error('Backend Connection Failed:', error);
      throw new Error('Backend Connection Failed. Please ensure the FastAPI backend is running on port 8002.');
    }
    return Promise.reject(error);
  }
);

// Counties API
export const countiesAPI = {
  getAll: () => api.get('/counties/'),
  getById: (id) => api.get(`/counties/${id}`),
  getEnergyData: (id) => api.get(`/counties/${id}/energy-metrics`),
  getMapData: () => api.get('/counties/map/data'),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getStats: () => api.get('/dashboard/stats'),
  getMetrics: () => api.get('/dashboard/energy-summary'),
  getCountyRecommendations: () => api.get('/dashboard/county-recommendations'),
  getRealTimeMetrics: () => api.get('/dashboard/real-time-metrics'),
  getAIAnalysis: (countyData) => api.post('/dashboard/ai-analysis', countyData),
};

// Minigrids API
export const minigridsAPI = {
  getAll: () => api.get('/minigrids/'),
  simulate: (config) => api.post('/minigrids/simulate', config),
  getOptimalConfig: (params) => api.post('/minigrids/optimize', params),
  getPresets: () => api.get('/minigrids/presets'),
  optimize: (params) => api.post('/minigrids/optimization', params),
};

// Health check
export const healthAPI = {
  check: () => axios.get(API_BASE_URL.replace('/api', '/health')),
  status: () => axios.get(API_BASE_URL.replace('/api', '/')),
};

// Test backend connection
export const testConnection = async () => {
  try {
    // Add cache busting parameter to avoid caching issues
    const healthUrl = API_BASE_URL.replace('/api', '/health') + '?t=' + Date.now();
    console.log('Testing connection to:', healthUrl);
    const response = await axios.get(healthUrl, { 
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log('Connection successful:', response.data);
    return response.status === 200;
  } catch (error) {
    console.error('Backend connection failed:', error);
    console.error('Attempted URL:', API_BASE_URL.replace('/api', '/health'));
    return false;
  }
};

export default api;

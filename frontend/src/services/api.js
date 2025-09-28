import axios from 'axios';

const API_BASE_URL = 'http://localhost:8003/api';

// Create axios 
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for complex AI analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for enhanced logging and loading states
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making API request to: ${config.url}`, config.method?.toUpperCase());
    
    // Add timestamp for cache busting
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // You could add loading state here
    if (typeof window !== 'undefined') {
      // Dispatch loading start event
      window.dispatchEvent(new CustomEvent('apiRequestStart', { 
        detail: { url: config.url, method: config.method } 
      }));
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apiRequestError', { detail: error }));
    }
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API response received from: ${response.config.url}`, response.status);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apiRequestComplete', { 
        detail: { url: response.config.url, status: response.status } 
      }));
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apiRequestError', { 
        detail: { 
          url: error.config?.url, 
          status: error.response?.status,
          message: error.message
        } 
      }));
    }
    
    if (error.code === 'ECONNREFUSED' || !error.response) {
      const backendError = new Error('Backend Connection Failed. Please ensure the FastAPI backend is running on port 8003.');
      backendError.code = 'BACKEND_CONNECTION_FAILED';
      throw backendError;
    }
    
    // Handle specific error statuses
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Authentication required');
    } else if (error.response?.status === 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Enhanced Counties API
export const countiesAPI = {
  // Basic county operations
  getAll: () => api.get('/counties/'),
  getById: (id) => api.get(`/counties/${id}`),
  getEnergyData: (id) => api.get(`/counties/${id}/energy-metrics`),
  getMapData: () => api.get('/counties/map/data'),
  
  // Enhanced analytics
  getAnalytics: (countyId, period = '7d') => 
    api.get(`/counties/${countyId}/analytics?period=${period}`),
  getHistoricalData: (countyId, startDate, endDate) => 
    api.get(`/counties/${countyId}/historical-data`, {
      params: { start_date: startDate, end_date: endDate }
    }),
  getComparativeAnalysis: (countyIds) => 
    api.post('/counties/comparative-analysis', { county_ids: countyIds }),
  
  // Real-time data
  getRealTimeMetrics: (countyId) => 
    api.get(`/counties/${countyId}/real-time-metrics`),
  getLiveStream: (countyId) => 
    api.get(`/counties/${countyId}/live-stream`),
};

// Enhanced Dashboard API
export const dashboardAPI = {
  // Overview and stats
  getOverview: () => api.get('/dashboard/overview'),
  getStats: () => api.get('/dashboard/stats'),
  getMetrics: () => api.get('/dashboard/energy-summary'),
  getCountyRecommendations: () => api.get('/dashboard/county-recommendations'),
  getRealTimeMetrics: () => api.get('/dashboard/real-time-metrics'),
  
  // AI and Analytics
  getAIAnalysis: (countyData) => api.post('/dashboard/ai-analysis', countyData),
  getPredictiveAnalytics: (params) => 
    api.post('/dashboard/predictive-analytics', params),
  getEconomicImpact: (scenario) => 
    api.post('/dashboard/economic-impact-analysis', scenario),
  
  // System Health
  getSystemHealth: () => api.get('/dashboard/system-health'),
  getPerformanceMetrics: () => api.get('/dashboard/performance-metrics'),
  
  // Notifications and Alerts
  getNotifications: () => api.get('/dashboard/notifications'),
  getAlertSummary: () => api.get('/dashboard/alert-summary'),
  markNotificationRead: (notificationId) => 
    api.put(`/dashboard/notifications/${notificationId}/read`),
};

// Enhanced Minigrids API
export const minigridsAPI = {
  // Basic operations
  getAll: () => api.get('/minigrids/'),
  getById: (id) => api.get(`/minigrids/${id}`),
  simulate: (config) => api.post('/minigrids/simulate', config),
  getOptimalConfig: (params) => api.post('/minigrids/optimize', params),
  getPresets: () => api.get('/minigrids/presets'),
  optimize: (params) => api.post('/minigrids/optimization', params),
  
  // Advanced simulation and monitoring
  getAdvancedSimulation: (config) => 
    api.post('/minigrids/advanced-simulation', config),
  getRealTimePerformance: (minigridId) => 
    api.get(`/minigrids/${minigridId}/real-time-performance`),
  getHistoricalPerformance: (minigridId, period = '30d') => 
    api.get(`/minigrids/${minigridId}/historical-performance?period=${period}`),
  
  // System health and maintenance
  getSystemHealth: (minigridId) => 
    api.get(`/minigrids/${minigridId}/system-health`),
  getMaintenanceSchedule: (minigridId) => 
    api.get(`/minigrids/${minigridId}/maintenance-schedule`),
  triggerMaintenance: (minigridId, maintenanceData) => 
    api.post(`/minigrids/${minigridId}/trigger-maintenance`, maintenanceData),
  
  // Alerts and monitoring
  getAlerts: (minigridId) => 
    api.get(`/minigrids/${minigridId}/alerts`),
  acknowledgeAlert: (minigridId, alertId) => 
    api.put(`/minigrids/${minigridId}/alerts/${alertId}/acknowledge`),
  getAlertHistory: (minigridId, days = 7) => 
    api.get(`/minigrids/${minigridId}/alert-history?days=${days}`),
  
  // Optimization and AI
  getAIOptimization: (params) => 
    api.post('/minigrids/ai-optimization', params),
  getLoadForecast: (minigridId, hours = 24) => 
    api.get(`/minigrids/${minigridId}/load-forecast?hours=${hours}`),
  getGenerationForecast: (minigridId, hours = 24) => 
    api.get(`/minigrids/${minigridId}/generation-forecast?hours=${hours}`),
  
  // Economic analysis
  getROIAnalysis: (minigridId) => 
    api.get(`/minigrids/${minigridId}/roi-analysis`),
  getCostBenefitAnalysis: (scenario) => 
    api.post('/minigrids/cost-benefit-analysis', scenario),
};

// New Analytics API for comprehensive data analysis
export const analyticsAPI = {
  // Grid analytics
  getGridAnalytics: (period = '7d') => 
    api.get(`/analytics/grid?period=${period}`),
  getPerformanceAnalytics: (filters) => 
    api.post('/analytics/performance', filters),
  getComparativeAnalytics: (comparisonParams) => 
    api.post('/analytics/comparative', comparisonParams),
  
  // Predictive analytics
  getDemandForecast: (params) => 
    api.post('/analytics/demand-forecast', params),
  getGenerationForecast: (params) => 
    api.post('/analytics/generation-forecast', params),
  getWeatherImpact: (location) => 
    api.post('/analytics/weather-impact', location),
  
  // Economic analytics
  getEconomicAnalytics: (params) => 
    api.post('/analytics/economic', params),
  getInvestmentAnalytics: (investmentParams) => 
    api.post('/analytics/investment', investmentParams),
  getROIAnalytics: (roiParams) => 
    api.post('/analytics/roi', roiParams),
  
  // Environmental analytics
  getCarbonAnalytics: (period = '30d') => 
    api.get(`/analytics/carbon?period=${period}`),
  getEnvironmentalImpact: (impactParams) => 
    api.post('/analytics/environmental-impact', impactParams),
};

// New Alerts and Notifications API
export const alertsAPI = {
  // Alert management
  getAll: (filters = {}) => 
    api.get('/alerts/', { params: filters }),
  getUnread: () => api.get('/alerts/unread'),
  getByPriority: (priority) => 
    api.get(`/alerts/priority/${priority}`),
  getByType: (type) => api.get(`/alerts/type/${type}`),
  
  // Alert actions
  acknowledge: (alertId) => 
    api.put(`/alerts/${alertId}/acknowledge`),
  resolve: (alertId, resolutionData = {}) => 
    api.put(`/alerts/${alertId}/resolve`, resolutionData),
  bulkAcknowledge: (alertIds) => 
    api.put('/alerts/bulk-acknowledge', { alert_ids: alertIds }),
  
  // Notification preferences
  getPreferences: () => api.get('/alerts/preferences'),
  updatePreferences: (preferences) => 
    api.put('/alerts/preferences', preferences),
  
  // Real-time alerts
  subscribeToAlerts: (callback) => {
    // This would typically use WebSockets in a real implementation
    // For now, we'll simulate with polling
    const eventSource = new EventSource(`${API_BASE_URL}/alerts/stream`);
    eventSource.onmessage = callback;
    return eventSource;
  },
};

// New System Management API
export const systemAPI = {
  // System configuration
  getConfig: () => api.get('/system/config'),
  updateConfig: (config) => api.put('/system/config', config),
  
  // User management
  getUsers: () => api.get('/system/users'),
  createUser: (userData) => api.post('/system/users', userData),
  updateUser: (userId, userData) => 
    api.put(`/system/users/${userId}`, userData),
  
  // Backup and restore
  createBackup: () => api.post('/system/backup'),
  restoreBackup: (backupId) => 
    api.post(`/system/restore/${backupId}`),
  getBackups: () => api.get('/system/backups'),
  
  // System logs
  getLogs: (filters = {}) => 
    api.get('/system/logs', { params: filters }),
  exportLogs: (exportParams) => 
    api.post('/system/logs/export', exportParams),
};

// New Reports API
export const reportsAPI = {
  // Report generation
  generateReport: (reportParams) => 
    api.post('/reports/generate', reportParams),
  getReportTemplates: () => api.get('/reports/templates'),
  getGeneratedReports: () => api.get('/reports/generated'),
  downloadReport: (reportId) => 
    api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
  
  // Scheduled reports
  getScheduledReports: () => api.get('/reports/scheduled'),
  createScheduledReport: (schedule) => 
    api.post('/reports/scheduled', schedule),
  updateScheduledReport: (scheduleId, schedule) => 
    api.put(`/reports/scheduled/${scheduleId}`, schedule),
};

// Health check with enhanced monitoring
export const healthAPI = {
  check: () => axios.get(API_BASE_URL.replace('/api', '/health'), {
    timeout: 5000,
    headers: { 'Cache-Control': 'no-cache' }
  }),
  status: () => axios.get(API_BASE_URL.replace('/api', '/'), {
    timeout: 5000
  }),
  detailed: () => api.get('/health/detailed'),
  system: () => api.get('/health/system'),
};

// Enhanced connection testing with retry logic
export const testConnection = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔌 Testing backend connection (attempt ${attempt}/${maxRetries})...`);
      
      const healthUrl = API_BASE_URL.replace('/api', '/health') + '?t=' + Date.now();
      const response = await axios.get(healthUrl, { 
        timeout: 8000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('✅ Backend connection successful:', response.data);
      return { 
        success: true, 
        data: response.data,
        attempt: attempt
      };
      
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error.message,
          attempt: attempt
        };
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Utility functions for API management
export const apiUtils = {
  // Cancel token for request cancellation
  createCancelToken: () => axios.CancelToken.source(),
  
  // Batch requests
  batchRequests: (requests) => Promise.all(requests),
  
  // Debounced requests
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Cache management
  clearCache: () => {
    // Clear any cached responses
    if (typeof window !== 'undefined') {
      // Dispatch cache clear event
      window.dispatchEvent(new CustomEvent('apiCacheClear'));
    }
  },
};

// Export the main api instance for custom requests
export default api;
import api from './api';

const RECOMMENDATION_CACHE_KEY = 'recommendation_cache';
const CACHE_TTL = 60 * 60 * 24 * 1000; // 24 hours in milliseconds

// In-memory cache
let memoryCache = {};

// Load cache from localStorage on init
const loadCache = () => {
  try {
    const cached = localStorage.getItem(RECOMMENDATION_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        memoryCache = data;
      }
    }
  } catch (error) {
    console.error('Failed to load recommendation cache:', error);
  }
};

// Save cache to localStorage
const saveCache = () => {
  try {
    localStorage.setItem(
      RECOMMENDATION_CACHE_KEY,
      JSON.stringify({
        data: memoryCache,
        timestamp: Date.now()
      })
    );
  } catch (error) {
    console.error('Failed to save recommendation cache:', error);
  }
};

// Generate cache key from county data
const getCacheKey = (countyData) => {
  return `${countyData.county_name}_${countyData.population}_${countyData.current_kwh}`;
};

// Get recommendation with caching and fallback
const getRecommendation = async (countyData, options = {}) => {
  const {
    useCache = true,
    forceRefresh = false,
    useAI = true
  } = options;

  const cacheKey = getCacheKey(countyData);
  
  // Check cache first
  if (useCache && !forceRefresh && memoryCache[cacheKey]) {
    const { data, timestamp } = memoryCache[cacheKey];
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log('Returning cached recommendation');
      return {
        ...data,
        _cached: true,
        _source: 'cache'
      };
    }
  }

  try {
    // Try API call
    const response = await api.post('/api/recommendations', countyData, {
      params: {
        use_ai: useAI,
        force_refresh: forceRefresh
      }
    });

    // Update cache
    if (response.data && response.data.data) {
      memoryCache[cacheKey] = {
        data: response.data.data,
        timestamp: Date.now(),
        source: response.data.source || 'api'
      };
      saveCache();
      
      return {
        ...response.data.data,
        _cached: false,
        _source: response.data.source || 'api'
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('API recommendation failed:', error);
    
    // Fallback to local rule engine if API fails
    if (useAI) {
      console.log('Falling back to local rule engine');
      return getRecommendation(countyData, { ...options, useAI: false });
    }
    
    // Last resort: return default recommendation
    return {
      solution: 'grid_extension',
      confidence: 0.5,
      reason: 'Using fallback recommendation',
      estimated_cost: 2000000,
      roi_years: 8,
      source: 'fallback',
      _cached: false,
      _source: 'fallback'
    };
  }
};

// Get health status
const getHealth = async () => {
  try {
    const response = await api.get('/api/recommendations/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unavailable',
      service: 'recommendation-service',
      error: error.message
    };
  }
};

// Initialize
loadCache();

// Clear cache (for development)
const clearCache = () => {
  memoryCache = {};
  localStorage.removeItem(RECOMMENDATION_CACHE_KEY);
};

export default {
  getRecommendation,
  getHealth,
  clearCache,
  _cache: memoryCache // Exposed for debugging
};

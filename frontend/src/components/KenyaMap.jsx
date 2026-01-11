
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { countiesAPI } from '../services/api';
import { 
  FiCpu, 
  FiMap, 
  FiAlertTriangle, 
  FiSun, 
  FiZap, 
  FiSettings,
  FiHome,
  FiTarget,
  FiDollarSign,
  FiMapPin
} from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const KenyaMap = ({ onCountySelect, aiRecommendations, isAnalyzing }) => {
  const [countiesData, setCountiesData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, high_priority, solar_suitable, quick_wins
  const mapRef = useRef();

  useEffect(() => {
    loadMapData();
  }, []);

  useEffect(() => {
    // Apply filtering based on AI insights
    applyFilter(filterType);
  }, [mapData, filterType]);

  useEffect(() => {
    // Update county data with AI recommendations when received
    if (aiRecommendations && selectedCounty) {
      updateCountyWithAIRecommendations(selectedCounty.id, aiRecommendations);
    }
  }, [aiRecommendations, selectedCounty]);

  const updateCountyWithAIRecommendations = (countyId, recommendations) => {
    setMapData(prevData => 
      prevData.map(county => {
        if (county.id === countyId && recommendations.ai_recommendation) {
          const aiRec = recommendations.ai_recommendation;
          return {
            ...county,
            solutionType: aiRec.solution_type || county.solutionType,
            investment: aiRec.investment_needed || county.investment,
            roi_percentage: aiRec.roi_percentage || county.roi_percentage,
            timeline: aiRec.timeline || county.timeline,
            priorityScore: getPriorityScoreFromLevel(aiRec.priority_level) || county.priorityScore,
            deficitLevel: aiRec.priority_level || county.deficitLevel,
            ai_updated: true // Flag to show this was updated by AI
          };
        }
        return county;
      })
    );
  };

  const getPriorityScoreFromLevel = (level) => {
    switch (level) {
      case 'high': return 90;
      case 'medium': return 70;
      case 'low': return 45;
      default: return null;
    }
  };

  const applyFilter = (type) => {
    let filtered = [...mapData];
    
    switch (type) {
      case 'high_priority':
        filtered = mapData.filter(c => c.priorityScore >= 85);
        break;
      case 'solar_suitable':
        filtered = mapData.filter(c => c.solar_irradiance >= 6.0 && c.solutionType === 'solar_minigrid');
        break;
      case 'quick_wins':
        filtered = mapData.filter(c => c.roi_percentage >= 15 && c.grid_distance < 100);
        break;
      case 'all':
      default:
        filtered = mapData;
        break;
    }
    
    setFilteredData(filtered);
  };

  const normalizePriority = (value) => {
    if (value == null) return 0;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 0;
    return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
  };

  const getDeficitLevelFromPriority = (priorityScore) => {
    const score = normalizePriority(priorityScore);
    if (score >= 90) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };

  const transformBackendCounty = (c) => {
    // Accept both backend and mock shapes - will be replaced with real data from Data Engineer
    const id = c.id || c.county_id || c.name || c.county_name || 'unknown';
    const name = c.name || c.county_name || String(id).toString();
    const coords = c.coordinates || c.centroid || [0.0236, 37.9062];
    const priorityScore = normalizePriority(c.priorityScore ?? c.priority_score);
    const solutionType = c.solutionType || c.recommended_solution || 'grid_extension';
    const deficitLevel = c.deficitLevel || getDeficitLevelFromPriority(priorityScore);
    const investment = c.investment ?? c.estimated_cost_kes ?? 0;

    return {
      id,
      name,
      coordinates: coords,
      deficitLevel,
      priorityScore,
      solutionType,
      investment,
      // Additional fields for AI analysis (will come from Data Engineer)
      population: c.population || 0,
      blackout_frequency: c.blackout_frequency || 0,
      solar_irradiance: c.solar_irradiance || 0,
      grid_distance: c.grid_distance || 0,
      hospitals: c.hospitals || 0,
      schools: c.schools || 0,
      economic_activity: c.economic_activity || 'unknown',
      current_access: c.current_access || 0,
      target_access: c.target_access || 0,
      roi_percentage: c.roi_percentage || 0,
      timeline: c.timeline || 'TBD'
    };
  };

  const loadMapData = async () => {
    try {
      const [countiesResponse, mapResponse] = await Promise.all([
        countiesAPI.getAll(),
        countiesAPI.getMapData(),
      ]);
      
      setCountiesData(countiesResponse.data);
      const incoming = Array.isArray(mapResponse.data) ? mapResponse.data : [];
      const transformed = incoming.map(transformBackendCounty);
      setMapData(transformed.length > 0 ? transformed : []);
    } catch (error) {
      console.error('Failed to load map data:', error);
      // Use mock data if API fails
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    // Enhanced mock data matching hackathon requirements
    const mockCounties = [
      {
        id: 'turkana',
        name: 'Turkana',
        coordinates: [3.5, 35.5],
        deficitLevel: 'high',
        priorityScore: 98,
        solutionType: 'solar_minigrid',
        investment: 2500000,
        population: 926976,
        blackout_frequency: 15,
        solar_irradiance: 6.2,
        grid_distance: 150,
        hospitals: 8,
        schools: 245,
        economic_activity: 'low',
        current_access: 23,
        target_access: 85,
        roi_percentage: 15.2,
        timeline: '18-24 months'
      },
      {
        id: 'nairobi',
        name: 'Nairobi',
        coordinates: [-1.2921, 36.8219],
        deficitLevel: 'low',
        priorityScore: 45,
        solutionType: 'grid_optimization',
        investment: 15000000,
        population: 4397073,
        blackout_frequency: 3,
        solar_irradiance: 5.8,
        grid_distance: 0,
        hospitals: 156,
        schools: 1247,
        economic_activity: 'high',
        current_access: 92,
        target_access: 98,
        roi_percentage: 8.5,
        timeline: '6-12 months'
      },
      {
        id: 'marsabit',
        name: 'Marsabit',
        coordinates: [2.3, 37.9],
        deficitLevel: 'high',
        priorityScore: 94,
        solutionType: 'solar_minigrid',
        investment: 1800000,
        population: 459785,
        blackout_frequency: 18,
        solar_irradiance: 6.5,
        grid_distance: 180,
        hospitals: 4,
        schools: 156,
        economic_activity: 'low',
        current_access: 18,
        target_access: 80,
        roi_percentage: 18.7,
        timeline: '12-18 months'
      },
      {
        id: 'kisumu',
        name: 'Kisumu',
        coordinates: [-0.0917, 34.7680],
        deficitLevel: 'medium',
        priorityScore: 72,
        solutionType: 'hybrid_solution',
        investment: 3200000,
        population: 1155574,
        blackout_frequency: 8,
        solar_irradiance: 5.9,
        grid_distance: 25,
        hospitals: 23,
        schools: 387,
        economic_activity: 'medium',
        current_access: 65,
        target_access: 90,
        roi_percentage: 12.3,
        timeline: '12-18 months'
      },
      {
        id: 'mombasa',
        name: 'Mombasa',
        coordinates: [-4.0435, 39.6682],
        deficitLevel: 'medium',
        priorityScore: 65,
        solutionType: 'grid_extension',
        investment: 4500000,
        population: 1208333,
        blackout_frequency: 6,
        solar_irradiance: 6.1,
        grid_distance: 45,
        hospitals: 31,
        schools: 445,
        economic_activity: 'high',
        current_access: 78,
        target_access: 95,
        roi_percentage: 10.8,
        timeline: '9-15 months'
      },
      {
        id: 'mandera',
        name: 'Mandera',
        coordinates: [3.9366, 41.8667],
        deficitLevel: 'high',
        priorityScore: 96,
        solutionType: 'solar_minigrid',
        investment: 2100000,
        population: 1025756,
        blackout_frequency: 20,
        solar_irradiance: 6.8,
        grid_distance: 220,
        hospitals: 6,
        schools: 178,
        economic_activity: 'low',
        current_access: 15,
        target_access: 75,
        roi_percentage: 16.5,
        timeline: '15-24 months'
      },
      {
        id: 'samburu',
        name: 'Samburu',
        coordinates: [1.2921, 37.0682],
        deficitLevel: 'high',
        priorityScore: 91,
        solutionType: 'solar_minigrid',
        investment: 1650000,
        population: 310327,
        blackout_frequency: 16,
        solar_irradiance: 6.4,
        grid_distance: 130,
        hospitals: 5,
        schools: 98,
        economic_activity: 'low',
        current_access: 28,
        target_access: 82,
        roi_percentage: 17.2,
        timeline: '12-20 months'
      },
      {
        id: 'nakuru',
        name: 'Nakuru',
        coordinates: [-0.3031, 36.0800],
        deficitLevel: 'medium',
        priorityScore: 68,
        solutionType: 'hybrid_solution',
        investment: 5800000,
        population: 2162202,
        blackout_frequency: 5,
        solar_irradiance: 5.7,
        grid_distance: 15,
        hospitals: 42,
        schools: 689,
        economic_activity: 'medium',
        current_access: 73,
        target_access: 92,
        roi_percentage: 11.4,
        timeline: '10-16 months'
      }
    ];
    setMapData(mockCounties);
  };

  const getMarkerIcon = (county) => {
    const colors = {
      high: '#EF4444',    // Red for high deficit
      medium: '#F59E0B',   // Amber for medium deficit
      low: '#10B981',      // Green for low deficit
    };

    // Ensure deficitLevel is lowercase for proper color mapping
    const deficitLevel = (county.deficitLevel || 'low').toLowerCase();
    const color = colors[deficitLevel] || '#6B7280';
    const isAIUpdated = county.ai_updated;
    const borderColor = isAIUpdated ? '#8B5CF6' : 'white'; // Purple border for AI-updated counties
    const borderWidth = isAIUpdated ? '4px' : '3px';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: ${borderWidth} solid ${borderColor};
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.2s;
          position: relative;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          ${getSolutionIcon(county.solutionType)}
          ${isAIUpdated ? '<div style="position: absolute; top: -8px; right: -8px; background: #8B5CF6; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">AI</div>' : ''}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const getSolutionIcon = (solutionType) => {
    const icons = {
      solar_minigrid: '<div style="color: #F59E0B; font-size: 16px;">◉</div>',
      grid_extension: '<div style="color: #10B981; font-size: 16px;">◉</div>',
      hybrid_solution: '<div style="color: #8B5CF6; font-size: 16px;">◉</div>',
      grid_optimization: '<div style="color: #3B82F6; font-size: 16px;">◉</div>',
    };
    return icons[solutionType] || '<div style="color: #6B7280; font-size: 16px;">◉</div>';
  };

  const handleMarkerClick = async (county) => {
    setSelectedCounty(county);
    
    // Trigger enhanced simulation + AI flow when county is selected
    if (onCountySelect) {
      console.log(`Map: County ${county.name} clicked, starting enhanced flow...`);
      
      // Pass comprehensive county data to parent component
      onCountySelect({
        id: county.id,
        name: county.name,
        county_name: county.name,
        population: county.population || 500000,
        blackout_frequency: county.blackout_frequency || 30,
        solar_irradiance: county.solar_irradiance || 6.0,
        grid_distance: county.grid_distance || 50,
        hospitals: county.hospitals || 5,
        schools: county.schools || 50,
        current_access: county.current_access || 0.4,
        economic_activity: county.economic_activity || 'medium',
        coordinates: county.coordinates || [0, 37],
        // Additional simulation parameters
        current_kwh: (county.population || 500000) * 0.02,
        infrastructure_score: county.priorityScore || 50
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kenya map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* AI-Driven Filter Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-1000 min-w-48">
        <h5 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
          {isAnalyzing ? (
            <>
              <FiCpu className="w-4 h-4 animate-pulse" />
              <span className="animate-pulse">AI Analyzing...</span>
            </>
          ) : (
            <>
              <FiCpu className="w-4 h-4" />
              AI Insights Filter
            </>
          )}
        </h5>
        <div className="space-y-2">
          <button
            className={`w-full px-3 py-2 text-xs rounded transition-colors text-left ${
              filterType === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilterType('all')}
          >
            <FiMap className="w-4 h-4 mr-1" />
            All Counties ({mapData.length})
          </button>
          
          <button
            className={`w-full px-3 py-2 text-xs rounded transition-colors text-left ${
              filterType === 'high_priority' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilterType('high_priority')}
          >
            <FiAlertTriangle className="w-4 h-4 mr-1" />
            Highest Priority ({mapData.filter(c => c.priorityScore >= 85).length})
          </button>

          <button
            className={`w-full px-3 py-2 text-xs rounded transition-colors text-left ${
              filterType === 'solar_suitable' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilterType('solar_suitable')}
          >
            <FiSun className="w-4 h-4 mr-1" />
            Solar Suitable ({mapData.filter(c => c.solar_irradiance >= 6.0 && c.solutionType === 'solar_minigrid').length})
          </button>

          <button
            className={`w-full px-3 py-2 text-xs rounded transition-colors text-left ${
              filterType === 'quick_wins' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilterType('quick_wins')}
          >
            <FiZap className="w-4 h-4 mr-1" />
            Quick Wins ({mapData.filter(c => c.roi_percentage >= 15 && c.grid_distance < 100).length})
          </button>
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
          <div>📊 Showing: {filteredData.length} counties</div>
          <div>💡 AI-optimized selection</div>
        </div>
      </div>

      <MapContainer
        center={[0.5, 37.5]}  // Center of Kenya
        zoom={7}
        minZoom={6}
        maxZoom={7}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={true}
        zoomControl={false}
        touchZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* County Markers */}
        {filteredData.map((county) => (
          <Marker
            key={county.id}
            position={county.coordinates}
            icon={getMarkerIcon(county)}
            eventHandlers={{
              click: () => handleMarkerClick(county),
            }}
          >
            <Popup>
              <div className="p-3 min-w-80 max-w-96">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  {getSolutionIcon(county.solutionType)} {county.name} County
                  {county.ai_updated && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                      <FiCpu className="w-3 h-3" />
                      AI Updated
                    </span>
                  )}
                </h3>
                
                {/* Priority & Status */}
                <div className="mb-3 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    (county.deficitLevel || 'low') === 'high' ? 'bg-red-100 text-red-800' :
                    (county.deficitLevel || 'low') === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {(county.deficitLevel || 'low').toUpperCase()} PRIORITY
                  </span>
                  <span className="font-bold text-blue-600">
                    Score: {county.priorityScore}/100
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Population</div>
                    <div className="font-semibold">{county.population?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Current Access</div>
                    <div className="font-semibold">{county.current_access}%</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Blackouts/month</div>
                    <div className="font-semibold">{county.blackout_frequency}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Solar Potential</div>
                    <div className="font-semibold">{county.solar_irradiance} kWh/m²</div>
                  </div>
                </div>

                {/* Infrastructure */}
                <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                  <div className="font-medium text-blue-800 mb-1">Infrastructure</div>
                  <div className="flex justify-between">
                    <span>Hospitals: {county.hospitals}</span>
                    <span>Schools: {county.schools}</span>
                  </div>
                  <div className="mt-1">
                    <span>Grid Distance: {county.grid_distance}km</span>
                  </div>
                </div>
                
                {/* County Statistics */}
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected ROI:</span>
                    <span className="font-semibold text-purple-600">
                      {county.roi_percentage}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-semibold text-orange-600">
                      {county.timeline}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Target Access:</span>
                    <span className="font-semibold text-indigo-600">
                      {county.current_access}% → {county.target_access}%
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleMarkerClick(county)}
                  disabled={isAnalyzing}
                  className={`w-full mt-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all shadow-md ${
                    isAnalyzing 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                  }`}
                >
                  {isAnalyzing && selectedCounty?.id === county.id ? (
                    <>
                      <FiCpu className="w-4 h-4 mr-1" />
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <FiTarget className="w-4 h-4 mr-1" />
                      Get AI Recommendation
                    </>
                  )}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-1000">
        <h5 className="font-semibold text-gray-800 mb-3 text-sm flex items-center">
          <FiSettings className="w-4 h-4 mr-2" />
          Map Controls
        </h5>
        <div className="flex flex-col space-y-2">
          <button
            className="px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([0.0236, 37.9062], 6);
              }
            }}
          >
            <FiHome className="w-4 h-4 mr-1" />
            Reset View
          </button>
          
          <button
            className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
            onClick={() => {
              if (mapRef.current && mapData.length > 0) {
                const priorityCounty = mapData.find(c => c.priorityScore > 90);
                if (priorityCounty) {
                  mapRef.current.setView(priorityCounty.coordinates, 8);
                  setSelectedCounty(priorityCounty);
                }
              }
            }}
          >
            <FiTarget className="w-4 h-4 mr-1" />
            Highest Priority
          </button>

          <button
            className="px-3 py-2 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex items-center gap-2"
            onClick={() => {
              if (mapRef.current && mapData.length > 0) {
                const solarCounties = mapData.filter(c => c.solutionType === 'solar_minigrid');
                if (solarCounties.length > 0) {
                  const bounds = L.latLngBounds(solarCounties.map(c => c.coordinates));
                  mapRef.current.fitBounds(bounds, { padding: [20, 20] });
                }
              }
            }}
          >
            <FiSun className="w-4 h-4 mr-1" />
            Solar Regions
          </button>

          <button
            className="px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center gap-2"
            onClick={() => {
              // Calculate and show investment summary
              const totalInvestment = mapData.reduce((sum, c) => sum + c.investment, 0);
              const avgROI = mapData.reduce((sum, c) => sum + (c.roi_percentage || 0), 0) / mapData.length;
              alert(`Investment Summary:\n\nTotal: ${formatCurrency(totalInvestment)}\nAverage ROI: ${avgROI.toFixed(1)}%\nCounties: ${mapData.length}`);
            }}
          >
            <FiDollarSign className="w-4 h-4 mr-1" />
            Investment Summary
          </button>

          <div className="pt-2 border-t text-xs text-gray-600">
            <div className="flex items-center">
              <FiMapPin className="w-3 h-3 mr-1" />
              Selected: {selectedCounty?.name || 'None'}
            </div>
            <div className="flex items-center">
              <FiMap className="w-3 h-3 mr-1" />
              Total Counties: {mapData.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KenyaMap;
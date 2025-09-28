import React, { useState, useEffect } from 'react';
import { 
  FiAlertTriangle, 
  FiBell, 
  FiCheckCircle, 
  FiFilter,
  FiSearch,
  FiClock,
  FiEye,
  FiArchive,
  FiSettings,
  FiRefreshCw
} from 'react-icons/fi';
import { alertsAPI } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0
  });

  useEffect(() => {
    loadAlerts();
    // Set up real-time updates
    const interval = setInterval(loadAlerts, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, activeFilter, searchTerm]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await alertsAPI.getAll();
      setAlerts(response.data.alerts || []);
      updateStats(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      // Set demo data
      setAlerts(generateDemoAlerts());
      updateStats(generateDemoAlerts());
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoAlerts = () => {
    return [
      {
        id: 1,
        type: 'critical',
        title: 'Battery System Failure',
        message: 'Main battery bank in Turkana County has dropped below 10% capacity. Immediate attention required.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        priority: 'high',
        county: 'Turkana',
        minigrid_id: 'MG-TK-001',
        acknowledged: false,
        resolved: false
      },
      {
        id: 2,
        type: 'warning',
        title: 'High Demand Alert',
        message: 'Energy demand exceeding generation capacity in Marsabit County. Consider load shedding.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        priority: 'medium',
        county: 'Marsabit',
        minigrid_id: 'MG-MB-002',
        acknowledged: true,
        resolved: false
      },
      {
        id: 3,
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'Routine maintenance scheduled for Samburu solar panels tomorrow at 10:00 AM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        priority: 'low',
        county: 'Samburu',
        minigrid_id: 'MG-SB-003',
        acknowledged: false,
        resolved: false
      },
      {
        id: 4,
        type: 'critical',
        title: 'Inverter Overheating',
        message: 'Primary inverter temperature critical in Wajir County. Automatic shutdown initiated.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
        priority: 'high',
        county: 'Wajir',
        minigrid_id: 'MG-WJ-004',
        acknowledged: false,
        resolved: false
      },
      {
        id: 5,
        type: 'warning',
        title: 'Low Generation Efficiency',
        message: 'Solar generation efficiency below 60% in Garissa County. Check panel cleanliness.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        priority: 'medium',
        county: 'Garissa',
        minigrid_id: 'MG-GA-005',
        acknowledged: true,
        resolved: false
      },
      {
        id: 6,
        type: 'info',
        title: 'Weather Alert',
        message: 'Heavy rainfall expected in Nairobi County. Monitor grid stability.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        priority: 'low',
        county: 'Nairobi',
        minigrid_id: 'MG-NB-006',
        acknowledged: true,
        resolved: false
      }
    ];
  };

  const updateStats = (alertList) => {
    const stats = {
      total: alertList.length,
      critical: alertList.filter(a => a.type === 'critical').length,
      warning: alertList.filter(a => a.type === 'warning').length,
      info: alertList.filter(a => a.type === 'info').length
    };
    setStats(stats);
  };

  const filterAlerts = () => {
    let filtered = [...alerts];
    
    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === activeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(term) ||
        alert.message.toLowerCase().includes(term) ||
        alert.county.toLowerCase().includes(term)
      );
    }
    
    setFilteredAlerts(filtered);
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await alertsAPI.acknowledge(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      // Update locally for demo
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await alertsAPI.resolve(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      // Update locally for demo
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    }
  };

  const bulkAcknowledge = async () => {
    try {
      await alertsAPI.bulkAcknowledge(Array.from(selectedAlerts));
      setAlerts(prev => prev.map(alert => 
        selectedAlerts.has(alert.id) ? { ...alert, acknowledged: true } : alert
      ));
      setSelectedAlerts(new Set());
    } catch (error) {
      console.error('Bulk acknowledge failed:', error);
    }
  };

  const toggleAlertSelection = (alertId) => {
    const newSelection = new Set(selectedAlerts);
    if (newSelection.has(alertId)) {
      newSelection.delete(alertId);
    } else {
      newSelection.add(alertId);
    }
    setSelectedAlerts(newSelection);
  };

  const getPriorityColor = (type) => {
    switch (type) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (type) => {
    switch (type) {
      case 'critical': return FiAlertTriangle;
      case 'warning': return FiAlertTriangle;
      case 'info': return FiBell;
      default: return FiBell;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiAlertTriangle className="w-8 h-8 mr-3 text-red-600" />
                Alert Management Center
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage system alerts and notifications in real-time
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAlerts}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              {selectedAlerts.size > 0 && (
                <button
                  onClick={bulkAcknowledge}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Acknowledge Selected ({selectedAlerts.size})</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiBell className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Info</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiBell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All Alerts', count: stats.total },
                { id: 'critical', label: 'Critical', count: stats.critical },
                { id: 'warning', label: 'Warnings', count: stats.warning },
                { id: 'info', label: 'Info', count: stats.info }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? `bg-${getPriorityColor(filter.id)}-100 text-${getPriorityColor(filter.id)}-700 border border-${getPriorityColor(filter.id)}-300`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeFilter === filter.id 
                      ? `bg-${getPriorityColor(filter.id)}-200 text-${getPriorityColor(filter.id)}-800`
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading alerts...</p>
              </div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Found</h3>
                <p className="text-gray-600">
                  {searchTerm || activeFilter !== 'all' 
                    ? 'No alerts match your current filters.' 
                    : 'All systems are operating normally.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlerts.map(alert => {
                const PriorityIcon = getPriorityIcon(alert.type);
                const color = getPriorityColor(alert.type);
                
                return (
                  <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedAlerts.has(alert.id)}
                        onChange={() => toggleAlertSelection(alert.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Alert Icon */}
                      <div className={`p-3 rounded-lg bg-${color}-100`}>
                        <PriorityIcon className={`w-6 h-6 text-${color}-600`} />
                      </div>
                      
                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-semibold text-${color}-800`}>
                            {alert.title}
                          </h3>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 flex items-center">
                              <FiClock className="w-4 h-4 mr-1" />
                              {formatTimeAgo(alert.timestamp)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                              {alert.county}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{alert.message}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Mini-Grid: {alert.minigrid_id}</span>
                            <span>Priority: {alert.priority}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!alert.acknowledged && (
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                                <span>Acknowledge</span>
                              </button>
                            )}
                            
                            {!alert.resolved && (
                              <button
                                onClick={() => resolveAlert(alert.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                <FiArchive className="w-4 h-4" />
                                <span>Resolve</span>
                              </button>
                            )}
                            
                            <button className="flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
                              <FiEye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Status Indicators */}
                        <div className="flex items-center space-x-4 mt-3">
                          {alert.acknowledged && (
                            <span className="flex items-center space-x-1 text-sm text-green-600">
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Acknowledged</span>
                            </span>
                          )}
                          {alert.resolved && (
                            <span className="flex items-center space-x-1 text-sm text-green-600">
                              <FiArchive className="w-4 h-4" />
                              <span>Resolved</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alert History Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiClock className="w-5 h-5 mr-2 text-gray-600" />
            Alert History & Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Alerts Today</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">6</div>
              <div className="text-sm text-gray-600">Pending Resolution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
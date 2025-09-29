import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Contact from './components/Contact';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import Recommendations from './pages/Recommendations';
import { testConnection } from './services/api';
import './styles/App.css';

function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});
  // Check backend connection on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
<<<<<<< Updated upstream
        console.log('🔄 App: Testing backend connection...');
        const connected = await testConnection();
        console.log('✅ App: Backend connection result:', connected);
        setIsBackendConnected(connected);
        
        if (connected) {
          startNotificationSystem();
        }
      } catch (error) {
        console.error('❌ App: Backend check failed:', error);
        setIsBackendConnected(false);
      } finally {
        console.log('🚀 App: Setting isLoading to false');
=======
        const response = await testConnection();
        setIsBackendConnected(response.connected);
      } catch (error) {
        console.error('Error connecting to backend:', error);
        setIsBackendConnected(false);
      } finally {
>>>>>>> Stashed changes
        setIsLoading(false);
      }
    };

    checkBackend();
  }, []);

<<<<<<< Updated upstream
  // Enhanced county selection handler
  const handleCountySelect = (countyData) => {
    console.log(`📍 App: County selected - ${countyData.name}`);
    setSelectedCounty(countyData);
    
    // Store in sessionStorage for persistence
    sessionStorage.setItem('selectedCounty', JSON.stringify(countyData));
    
    // Notify other components via custom event
    window.dispatchEvent(new CustomEvent('countySelected', { 
      detail: countyData 
    }));
  };

  // Clear county selection
  const clearCountySelection = () => {
    setSelectedCounty(null);
    sessionStorage.removeItem('selectedCounty');
    window.dispatchEvent(new CustomEvent('countyCleared'));
  };

  // Load previously selected county on app start
  useEffect(() => {
    const savedCounty = sessionStorage.getItem('selectedCounty');
    if (savedCounty) {
      try {
        const countyData = JSON.parse(savedCounty);
        setSelectedCounty(countyData);
        console.log(`🔄 App: Restored county selection - ${countyData.name}`);
      } catch (error) {
        console.error('Failed to parse saved county:', error);
      }
    }
  }, []);

  const startNotificationSystem = () => {
    // Simulate real-time notifications
    setInterval(() => {
      const alerts = [
        {
          id: Date.now(),
          type: 'warning',
          title: 'High Demand Alert',
          message: 'Energy demand exceeding generation in selected regions',
          timestamp: new Date().toISOString(),
          priority: 'medium'
        }
      ];
      
      setNotifications(prev => [...alerts.slice(0, 1), ...prev.slice(0, 4)]);
    }, 60000); // Every minute
  };

  // FIXED: Show loading screen only when isLoading is TRUE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading UmemeAI...</h2>
          <p className="text-gray-500 mt-2">Initializing smart grid systems</p>
        </div>
      </div>
    );
  }

  // FIXED: Show connection error only when backend is not connected AND loading is done
  if (!isBackendConnected && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Backend Connection Failed</h2>
          <p className="text-gray-600 mb-6">
            Please make sure your FastAPI backend is running on port 8000.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Expected backend URL: http://localhost:8000</p>
            <p className="mt-2">Run: <code>uvicorn main:app --reload --port 8000</code></p>
          </div>
        </div>
      </div>
    );
=======
  if (isLoading) {
    return <div className="loading">Loading...</div>;
>>>>>>> Stashed changes
  }

  // FIXED: Only render the main app when loading is complete AND backend is connected
  return (
    <Router>
      <div className="app">
        <Navigation notifications={[]} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                isBackendConnected={isBackendConnected}
                selectedCounty={selectedCounty}
                onClearCounty={() => setSelectedCounty(null)}
                analyticsData={analyticsData}
                onCountySelect={setSelectedCounty}
              />
            } />
            <Route path="/analytics" element={
              <Analytics 
                isBackendConnected={isBackendConnected}
                onClearCounty={() => {}}
                analyticsData={{}}
              />
            } />
            <Route path="/alerts" element={
              <Alerts notifications={[]} />
            } />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
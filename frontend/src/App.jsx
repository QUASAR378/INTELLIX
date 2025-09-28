import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import { testConnection } from './services/api';

function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Test backend connection on app load
    const checkBackend = async () => {
      const connected = await testConnection();
      setIsBackendConnected(connected);
      setIsLoading(false);
    };
    
    checkBackend();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading PowerGrid AI...</h2>
        </div>
      </div>
    );
  }

  if (!isBackendConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Backend Connection Failed</h2>
          <p className="text-gray-600 mb-6">
            Please make sure your FastAPI backend is running on port 8002.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry Connection
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Expected backend URL: http://localhost:8002</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Dashboard />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <strong>PowerGrid AI</strong> - Equitable Energy for Every Kenyan
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Backend Connected
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
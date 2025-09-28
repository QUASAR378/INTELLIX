import React from 'react';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-start items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Umeme AI</h1>
            <span className="text-sm text-gray-600 hidden md:inline">Smart Grids for a Brighter Kenya</span>
            <div className="hidden md:flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
import React from 'react';
import RecommendationForm from '../components/RecommendationForm';

const Recommendations = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            County Energy Planning Tool
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Get AI-powered recommendations for energy infrastructure development in your county
          </p>
        </div>
        
        <RecommendationForm />
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Enter County Data</h3>
              </div>
              <p className="mt-2 text-gray-600">
                Fill in the details about your county's current energy situation, population, and infrastructure.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Get AI Analysis</h3>
              </div>
              <p className="mt-2 text-gray-600">
                Our AI model analyzes your data against thousands of data points to generate recommendations.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Implement Solutions</h3>
              </div>
              <p className="mt-2 text-gray-600">
                Receive detailed action plans, cost estimates, and implementation timelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;

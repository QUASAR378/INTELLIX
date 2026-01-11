import React, { useState, useEffect } from 'react';
import { FiBook, FiCode } from 'react-icons/fi';

const PlainLanguageToggle = () => {
  const [isPlainLanguage, setIsPlainLanguage] = useState(true);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('plainLanguageMode');
    if (saved !== null) {
      setIsPlainLanguage(saved === 'true');
    }
  }, []);

  const toggleMode = () => {
    const newMode = !isPlainLanguage;
    setIsPlainLanguage(newMode);
    localStorage.setItem('plainLanguageMode', newMode.toString());
    
    // Dispatch custom event so other components can listen
    window.dispatchEvent(new CustomEvent('plainLanguageModeChanged', { 
      detail: { isPlainLanguage: newMode } 
    }));
  };

  return (
    <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
      <span className="text-sm font-medium text-gray-700">
        {isPlainLanguage ? 'Simple Mode' : 'Technical Mode'}
      </span>
      <button
        onClick={toggleMode}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          isPlainLanguage ? 'bg-green-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
            isPlainLanguage ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <div className="text-sm text-gray-500">
        {isPlainLanguage ? (
          <div className="flex items-center space-x-1">
            <FiBook className="w-4 h-4" />
            <span>Plain English</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <FiCode className="w-4 h-4" />
            <span>Technical Terms</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook to use plain language mode in components
export const usePlainLanguage = () => {
  const [isPlainLanguage, setIsPlainLanguage] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('plainLanguageMode');
    if (saved !== null) {
      setIsPlainLanguage(saved === 'true');
    }

    const handleChange = (e) => {
      setIsPlainLanguage(e.detail.isPlainLanguage);
    };

    window.addEventListener('plainLanguageModeChanged', handleChange);
    return () => window.removeEventListener('plainLanguageModeChanged', handleChange);
  }, []);

  return isPlainLanguage;
};

// Utility function to get plain language text
export const getPlainText = (technicalTerm, isPlainLanguage) => {
  if (!isPlainLanguage) return technicalTerm;

  const translations = {
    'kWh': 'units of electricity',
    'MW': 'megawatts',
    'MWh': 'megawatt-hours',
    'Solar irradiance': 'Sunlight availability',
    'Solar Irradiance': 'Sunlight availability',
    'Blackout frequency': 'Power outages',
    'Blackout Frequency': 'Power outages',
    'Mini-grid': 'Local power system',
    'Grid distance': 'Distance to power lines',
    'Grid Distance': 'Distance to power lines',
    'Energy deficit': 'Power shortage',
    'Energy Deficit': 'Power shortage',
    'ROI': 'Return on investment',
    'Priority score': 'Urgency level',
    'Priority Score': 'Urgency level',
    'Battery capacity': 'Energy storage',
    'Battery Capacity': 'Energy storage',
    'Solar capacity': 'Solar panel output',
    'Solar Capacity': 'Solar panel output',
    'Households served': 'Homes powered',
    'Households Served': 'Homes powered',
    'Daily consumption': 'Daily electricity use',
    'Daily Consumption': 'Daily electricity use',
    'Generation': 'Power production',
    'Consumption': 'Power usage',
    'Coverage': 'Service area',
    'Payback period': 'Time to recover costs',
    'Payback Period': 'Time to recover costs',
    'CO₂ saved': 'Carbon emissions prevented',
    'Investment needed': 'Funding required',
    'Investment Needed': 'Funding required',
    'Timeline': 'Project duration',
    'Confidence score': 'Reliability rating',
    'Confidence Score': 'Reliability rating',
    'Economic activity index': 'Business activity level',
    'Economic Activity Index': 'Business activity level'
  };

  return translations[technicalTerm] || technicalTerm;
};

export default PlainLanguageToggle;
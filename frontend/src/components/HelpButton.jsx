import React, { useState } from 'react';
import { FiHelpCircle, FiX, FiBook, FiVideo, FiMessageCircle } from 'react-icons/fi';

const HelpButton = ({ onStartTour }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 z-50"
        aria-label="Help"
      >
        <FiHelpCircle className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed bottom-24 right-6 bg-white rounded-xl shadow-2xl w-80 z-[9999] border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Need Help?</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onStartTour) {
                      localStorage.removeItem('tourCompleted');
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FiBook className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Restart Tour</p>
                    <p className="text-xs text-gray-600">Step-by-step guide</p>
                  </div>
                </button>

                <a
                  href="/docs/USER_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <FiVideo className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">User Guide</p>
                    <p className="text-xs text-gray-600">Detailed documentation</p>
                  </div>
                </a>

                <a
                  href="/contact"
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <FiMessageCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Contact Support</p>
                    <p className="text-xs text-gray-600">Get personalized help</p>
                  </div>
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Quick Tips:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Hover over any metric for explanations</li>
                  <li>• Click counties on the map to explore</li>
                  <li>• Use sliders to test scenarios</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HelpButton;

import React, { useState, useEffect } from 'react';
import { FiX, FiArrowRight, FiArrowLeft, FiCheck, FiHelpCircle } from 'react-icons/fi';

const GuidedTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has completed tour
    const tourCompleted = localStorage.getItem('tourCompleted');
    if (!tourCompleted) {
      setIsVisible(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to Umeme AI! ⚡",
      description: "Your intelligent energy planning assistant for Kenya. Let's take a quick tour to show you how to make data-driven energy decisions.",
      position: "center",
      highlight: null
    },
    {
      title: "Step 1: Select Your County",
      description: "Click on any county on the map to see its energy profile. Each color represents priority level - red means urgent need, green means good coverage.",
      tip: "Try clicking on a northern county like Turkana to see high-priority areas!",
      position: "map",
      highlight: "map"
    },
    {
      title: "Step 2: Review Energy Status",
      description: "Once you select a county, you'll see key metrics like current energy access, population served, and infrastructure needs - all in plain language.",
      tip: "Look for the 'Population' and 'Energy Access' cards for quick insights.",
      position: "details",
      highlight: "details"
    },
    {
      title: "Step 3: Get AI Recommendations",
      description: "Our AI analyzes your county's data and suggests optimal energy solutions - solar mini-grids, grid extensions, or hybrid systems.",
      tip: "Click the 'AI Insights' tab to see personalized recommendations!",
      position: "tabs",
      highlight: "ai-tab"
    },
    {
      title: "Step 4: Run Simulations",
      description: "Test different scenarios! Adjust solar panels, battery capacity, and see real-time results for 24-hour power generation.",
      tip: "Navigate to the 'Simulation' page to try different configurations.",
      position: "navigation",
      highlight: "nav"
    },
    {
      title: "Step 5: Export Your Plan",
      description: "Once satisfied, export a detailed report with cost estimates, timelines, and technical specs to share with stakeholders.",
      tip: "Look for 'Export Report' buttons throughout the app!",
      position: "center",
      highlight: null
    },
    {
      title: "You're All Set! 🎉",
      description: "You now know how to use Umeme AI for energy planning. Need help anytime? Click the help icon (?) in the corner.",
      position: "center",
      highlight: null
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('tourCompleted', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const skipTour = () => {
    localStorage.setItem('tourCompleted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[10001] transition-opacity" />

      {/* Tour Modal */}
      <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative">
          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Skip tour"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Getting Started Guide</span>
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              {currentStepData.description}
            </p>
            {currentStepData.tip && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <FiHelpCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">Pro Tip:</p>
                  <p className="text-sm text-green-700">{currentStepData.tip}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Skip Tour
            </button>

            <div className="flex items-center space-x-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>Get Started</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-8 bg-green-600' 
                    : index < currentStep 
                    ? 'w-2 bg-green-400' 
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidedTour;

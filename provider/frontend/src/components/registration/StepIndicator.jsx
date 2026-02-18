import React from 'react';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between space-x-2 w-full mb-8">
      {steps.map((step) => (
        <React.Fragment key={step}>
          <div className="relative flex flex-col items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                step <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                  : 'bg-white dark:bg-gray-700 border-gray-400 text-gray-400 dark:text-gray-300'
              }`}
            >
              {step}
            </div>
          </div>
          {step < totalSteps && (
            <div 
              className={`flex-grow h-0.5 transition-colors duration-300 ${
                step < currentStep 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
import React from 'react';
import { cn } from '@docujourney/utils';

interface StepperProps {
  steps: Array<{
    title: string;
    description?: string;
  }>;
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <div className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                index < currentStep
                  ? 'bg-green-100 text-green-700' // Completed step
                  : index === currentStep
                  ? 'bg-blue-100 text-blue-700' // Current step
                  : 'bg-gray-100 text-gray-400', // Future step
              )}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <div className="ml-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  index === currentStep ? 'text-blue-700' : 'text-gray-400',
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <p className="text-xs text-gray-500">{step.description}</p>
              )}
            </div>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-8 h-px mx-3',
                index < currentStep ? 'bg-green-300' : 'bg-gray-200',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { CalendarIcon, Plane, AlertCircle } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

interface FirstEntryDateSelectionProps {
  profileName: string;
  onSubmit: (date: Date) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const FirstEntryDateSelection: React.FC<FirstEntryDateSelectionProps> = ({
  profileName,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [dateValue, setDateValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Pure validation function without side effects for preview
  const parseDate = (dateString: string): Date | null => {
    if (!dateString.trim()) {
      return null;
    }

    try {
      const parsed = parse(dateString, 'MM/dd/yyyy', new Date());
      if (isValid(parsed)) {
        if (parsed > new Date() || parsed < new Date('1900-01-01')) {
          return null;
        }
        return parsed;
      }
    } catch (e) {
      // Invalid format
    }
    return null;
  };

  // Memoized preview date to avoid re-renders
  const previewDate = useMemo(() => parseDate(dateValue), [dateValue]);

  const validateAndParseDate = (dateString: string): Date | null => {
    if (!dateString.trim()) {
      setError('Please enter a date');
      return null;
    }

    try {
      const parsed = parse(dateString, 'MM/dd/yyyy', new Date());
      if (isValid(parsed)) {
        // Check if date is not in the future
        if (parsed > new Date()) {
          setError('First entry date cannot be in the future');
          return null;
        }
        // Check if date is reasonable (not before 1900)
        if (parsed < new Date('1900-01-01')) {
          setError('Please enter a valid date after 1900');
          return null;
        }
        setError('');
        return parsed;
      }
    } catch (e) {
      // Invalid format
    }

    setError('Please enter a valid date in MM/DD/YYYY format');
    return null;
  };

  const handleDateChange = useCallback((value: string) => {
    setDateValue(value);
    if (error) {
      // Clear error when user starts typing
      setError('');
    }
  }, [error]);

  const handleSubmit = useCallback(() => {
    const parsedDate = validateAndParseDate(dateValue);
    if (parsedDate) {
      onSubmit(parsedDate);
    }
  }, [dateValue, onSubmit]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="flex flex-col h-full max-h-[calc(90vh-120px)] space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <Stepper 
          steps={[
            { title: "First Entry Date", description: "Enter date" },
            { title: "Document Type", description: "Select type" },
            { title: "Verify Data", description: "Review fields" }
          ]}
          currentStep={0}
          className="mb-6"
        />
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <Plane className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">First Entry Date Required</h3>
            <p className="text-sm text-gray-600 mt-1">
              We need to know when <strong>{profileName}</strong> first entered the United States to help track visa timeline and status.
            </p>
          </div>
        </div>
      </div>

      {/* Date Input Section */}
      <div className="flex-1 space-y-4">

        <div className="space-y-2">
          <Label htmlFor="firstEntryDate" className="text-sm font-medium text-gray-700">
            Date of First Entry to US <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="firstEntryDate"
              type="text"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="MM/DD/YYYY"
              className={`h-12 pl-12 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'}`}
              disabled={isLoading}
            />
            <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        {/* Preview */}
        {dateValue && !error && previewDate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Date will be saved as:</span> {format(previewDate, 'MMMM d, yyyy')}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
          className="flex-1 h-11 border-gray-200"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={!dateValue.trim() || !!error || isLoading}
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <>
              Continue
              <CalendarIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(FirstEntryDateSelection);

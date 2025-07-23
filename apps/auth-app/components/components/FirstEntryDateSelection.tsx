'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
import { CalendarIcon, Plane, AlertCircle } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { Button, Calendar, Input, Label, Popover, PopoverContent, PopoverTrigger, Stepper,} from '@docujourney/ui'; } from '@docujourney/ui';

interface FirstEntryDateSelectionProps {
  profileName: string;
  onSubmit: (data: { date?: Date; visaType?: string; currentlyEmployed?: boolean }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  existingDate?: string | null; // Existing first entry date if available
  existingVisaType?: string | null; // Existing first entry visa type if available
  existingEmploymentStatus?: boolean | null; // Existing employment status if available
}

const visaTypeOptions = [
  { value: 'H1B', label: 'H-1B (Specialty Worker)' },
  { value: 'H4', label: 'H-4 (H-1B Dependent)' },
  { value: 'F1', label: 'F-1 (Student)' },
  { value: 'F2', label: 'F-2 (F-1 Dependent)' },
];

export const FirstEntryDateSelection: React.FC<FirstEntryDateSelectionProps> = ({
  profileName,
  onSubmit,
  onCancel,
  isLoading = false,
  existingDate = null,
  existingVisaType = null,
  existingEmploymentStatus = null,
}) => {
  // Determine what information is missing
  const needsDate = !existingDate;
  const needsVisaType = !existingVisaType;
  const needsEmploymentStatus = existingEmploymentStatus === null || existingEmploymentStatus === undefined;
  
  // Initialize state with existing values if available
  const [dateValue, setDateValue] = useState<string>(
    existingDate ? new Date(existingDate).toLocaleDateString('en-US') : '',
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    existingDate ? new Date(existingDate) : undefined,
  );
  const [visaType, setVisaType] = useState<string>(existingVisaType || '');
  const [currentlyEmployed, setCurrentlyEmployed] = useState<boolean | null>(existingEmploymentStatus);
  const [error, setError] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);

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

  const validateForm = (): { date?: Date; visaType?: string; currentlyEmployed?: boolean } | null => {
    let parsedDate: Date | undefined;
    
    // Validate date only if it's needed
    if (needsDate) {
      if (!dateValue.trim() && !selectedDate) {
        setError('Please enter or select a date');
        return null;
      }
      
      // Use selected date from calendar if available, otherwise parse text input
      if (selectedDate) {
        parsedDate = selectedDate;
      } else {
        const validated = validateAndParseDate(dateValue);
        if (!validated) {
          return null;
        }
        parsedDate = validated;
      }
    }

    // Validate visa type only if it's needed
    if (needsVisaType && !visaType.trim()) {
      setError('Please select a visa type');
      return null;
    }

    // Validate employment status only if it's needed
    if (needsEmploymentStatus && currentlyEmployed === null) {
      setError('Please specify your current employment status');
      return null;
    }

    setError('');
    
    // Return only the fields that are needed and provided
    const result: { date?: Date; visaType?: string; currentlyEmployed?: boolean } = {};
    if (needsDate && parsedDate) {result.date = parsedDate;}
    if (needsVisaType && visaType.trim()) {result.visaType = visaType;}
    if (needsEmploymentStatus && currentlyEmployed !== null) {result.currentlyEmployed = currentlyEmployed;}
    
    return result;
  };

  const handleDateChange = useCallback((value: string) => {
    setDateValue(value);
    setSelectedDate(undefined); // Clear calendar selection when typing
    if (error) {
      // Clear error when user starts typing
      setError('');
    }
  }, [error]);

  const handleCalendarSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDateValue(date.toLocaleDateString('en-US')); // Update text input to match
      setShowCalendar(false);
      if (error) {
        setError('');
      }
    }
  }, [error]);

  const handleSubmit = useCallback(() => {
    const validatedData = validateForm();
    if (validatedData) {
      onSubmit(validatedData);
    }
  }, [dateValue, visaType, currentlyEmployed, onSubmit]);

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
            { title: 'First Entry Date', description: 'Enter date' },
            { title: 'Document Type', description: 'Select type' },
            { title: 'Verify Data', description: 'Review fields' },
          ]}
          currentStep={0}
          className="mb-6"
        />
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <Plane className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {(needsDate || needsVisaType || needsEmploymentStatus) ? 'Profile Information Required' :
               needsDate && needsVisaType ? 'First Entry Information Required' :
               needsDate ? 'First Entry Date Required' :
               needsVisaType ? 'First Entry Visa Type Required' :
               'Employment Status Required'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {(needsDate || needsVisaType || needsEmploymentStatus) ? 
                `We need some additional information for ${profileName} to help track their visa timeline and status.` :
               needsDate && needsVisaType ? 
                `We need to know when ${profileName} first entered the United States and what visa type was used to help track visa timeline and status.` :
               needsDate ? 
                `We need to know when ${profileName} first entered the United States to help track visa timeline and status.` :
               needsVisaType ?
                `We need to know what visa type ${profileName} used for their first entry to the United States.` :
                `We need to know ${profileName}'s current employment status for their visa analysis.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 space-y-4">
        {/* Date Input Section - Only show if date is missing */}
        {needsDate && (
          <div className="space-y-2">
            <Label htmlFor="firstEntryDate" className="text-sm font-medium text-gray-700">
              Date of First Entry to US <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
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
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="h-12 px-3 border-gray-200 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleCalendarSelect}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-gray-500">
              You can type the date (MM/DD/YYYY) or use the calendar button to select
            </p>
          </div>
        )}

        {/* Visa Type Selection - Only show if visa type is missing */}
        {needsVisaType && (
          <div className="space-y-2">
            <Label htmlFor="visaType" className="text-sm font-medium text-gray-700">
              Visa Type Used for First Entry <span className="text-red-500">*</span>
            </Label>
            <Select value={visaType} onValueChange={setVisaType} disabled={isLoading}>
              <SelectTrigger className={`h-12 ${error && !visaType ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'}`}>
                <SelectValue placeholder="Select the visa type you used to first enter the US" />
              </SelectTrigger>
              <SelectContent>
                {visaTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Employment Status Selection - Only show if employment status is missing */}
        {needsEmploymentStatus && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Current Employment Status <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={currentlyEmployed === null ? '' : currentlyEmployed ? 'true' : 'false'} 
              onValueChange={(value) => setCurrentlyEmployed(value === 'true')} 
              disabled={isLoading}
            >
              <SelectTrigger className={`h-12 ${error && currentlyEmployed === null ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'}`}>
                <SelectValue placeholder="Are you currently employed?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes, I am currently employed</SelectItem>
                <SelectItem value="false">No, I am not currently employed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        {/* Preview - Show only if we have the required info */}
        {((needsDate && previewDate) || (!needsDate && existingDate)) && 
         ((needsVisaType && visaType) || (!needsVisaType && existingVisaType)) && 
         ((needsEmploymentStatus && currentlyEmployed !== null) || (!needsEmploymentStatus && existingEmploymentStatus !== null)) &&
         !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Profile information will be saved as:</span>
            </p>
            {(needsDate || existingDate) && (
              <p className="text-sm text-green-700 mt-1">
                • Entry Date: {previewDate ? format(previewDate, 'MMMM d, yyyy') : 
                              existingDate ? format(new Date(existingDate), 'MMMM d, yyyy') : ''}
              </p>
            )}
            {(needsVisaType || existingVisaType) && (
              <p className="text-sm text-green-700">
                • Visa Type: {visaTypeOptions.find(opt => opt.value === (visaType || existingVisaType))?.label}
              </p>
            )}
            {(needsEmploymentStatus || existingEmploymentStatus !== null) && (
              <p className="text-sm text-green-700">
                • Employment Status: {currentlyEmployed !== null ? 
                  (currentlyEmployed ? 'Currently employed' : 'Not currently employed') :
                  (existingEmploymentStatus ? 'Currently employed' : 'Not currently employed')}
              </p>
            )}
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
          disabled={isLoading || !!error || 
            (needsDate && !dateValue.trim() && !selectedDate) ||
            (needsVisaType && !visaType.trim()) ||
            (needsEmploymentStatus && currentlyEmployed === null)
          }
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

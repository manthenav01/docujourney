'use client';

import React, { useState } from 'react';
import { CalendarIcon, Plane, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@docujourney/utils';
import { Button, Calendar, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Popover, PopoverContent, PopoverTrigger } from '@docujourney/ui';

interface FirstEntryDateDialogProps {
  isOpen: boolean;
  profileName: string;
  onSubmit: (date: Date) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const FirstEntryDateDialog: React.FC<FirstEntryDateDialogProps> = ({
  isOpen,
  profileName,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = () => {
    if (selectedDate) {
      onSubmit(selectedDate);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            First U.S. Entry Date Required
          </DialogTitle>
          <DialogDescription className="text-left">
            To provide accurate visa timeline analysis for <strong>{profileName}</strong>, 
            we need to know when they first entered the United States.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Why do we need this?</p>
              <p>This date helps us track your complete immigration journey and provide accurate status analysis.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              First Entry Date to United States
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground',
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'MMMM d, yyyy')
                  ) : (
                    <span>Select first entry date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => 
                    date > new Date() || date < new Date('1900-01-01')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              Select the date when {profileName} first entered the United States
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstEntryDateDialog;

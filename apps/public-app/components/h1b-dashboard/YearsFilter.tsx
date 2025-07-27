'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@docujourney/ui';
import { FilterState } from './types';

interface YearsFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableYears?: string[];
  className?: string;
}

export const YearsFilter: React.FC<YearsFilterProps> = ({
  filters,
  setFilters,
  availableYears,
  className = '',
}) => {
  // Generate available years from 2020 to current year if not provided
  const currentYear = new Date().getFullYear();
  const defaultYears = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => (2020 + i).toString(),
  ).reverse();
  
  const years = availableYears || defaultYears;

  const handleYearSelect = (year: string) => {
    if (year === 'all') {
      setFilters(prev => ({
        ...prev,
        fiscalYears: [],
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        fiscalYears: prev.fiscalYears.includes(year)
          ? prev.fiscalYears.filter(y => y !== year)
          : [...prev.fiscalYears, year],
      }));
    }
  };

  const handleClearYears = () => {
    setFilters(prev => ({
      ...prev,
      fiscalYears: [],
    }));
  };

  const getDisplayValue = () => {
    if (filters.fiscalYears.length === 0) {
      return 'All Years';
    }
    if (filters.fiscalYears.length === 1) {
      return filters.fiscalYears[0];
    }
    return `${filters.fiscalYears.length} years selected`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Isolated Select Component */}
      <div className="shadcn-select-container">
        <Select
          value={filters.fiscalYears.length === 1 ? filters.fiscalYears[0] : 'multiple'}
          onValueChange={handleYearSelect}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder={getDisplayValue()} />
            </div>
          </SelectTrigger>
          <SelectContent className="shadcn-select-content">
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Years Display */}
      {filters.fiscalYears.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.fiscalYears.map((year) => (
            <Badge 
              key={year} 
              variant="secondary" 
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
              onClick={() => handleYearSelect(year)}
            >
              {year}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          {filters.fiscalYears.length > 1 && (
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={handleClearYears}
            >
              Clear all
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
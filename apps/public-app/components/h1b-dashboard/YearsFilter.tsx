'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { FilterState } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@docujourney/ui';

interface YearsFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onFetchData: () => void;
}

export const YearsFilter: React.FC<YearsFilterProps> = ({
  filters,
  setFilters,
  onFetchData,
}) => {
  // Generate available years from 2020 to 2024
  const availableYears = ['2024', '2023', '2022', '2021', '2020'];
  const defaultYear = '2024';

  const handleYearChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      fiscalYear: value,
    }));

    // Trigger data fetch immediately
    onFetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b bg-gray-50/50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Fiscal Year:</span>
        </div>

        <Select
          value={filters.fiscalYear || defaultYear}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>
                FY {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xs text-muted-foreground">
          {filters.fiscalYear ? `Showing data for FY ${filters.fiscalYear}` : `Showing data for FY ${defaultYear}`}
        </div>
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { FilterState } from './types';
import { CustomDropdown, type DropdownOption } from './CustomDropdown';

interface YearsFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onFetchData: (selectedYear?: string) => void;
}

export const YearsFilter: React.FC<YearsFilterProps> = ({
  filters,
  setFilters,
  onFetchData,
}) => {
  // Generate available years from 2020 to 2025
  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020'];
  const defaultYear = '2025';

  // Create dropdown options
  const dropdownOptions: DropdownOption[] = availableYears.map(year => ({
    value: year,
    label: `FY ${year}`,
  }));

  const handleYearChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      fiscalYear: value,
    }));

    // Call API immediately with the selected year
    onFetchData(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b bg-gray-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Fiscal Year:</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
          <CustomDropdown
            options={dropdownOptions}
            value={filters.fiscalYear || defaultYear}
            onChange={handleYearChange}
            placeholder="Select year"
            className="w-full sm:w-[120px] min-h-[44px]"
          />

          <div className="text-xs text-muted-foreground truncate">
            {filters.fiscalYear ? `Showing data for FY ${filters.fiscalYear}` : `Showing data for FY ${defaultYear}`}
          </div>
        </div>
      </div>
    </div>
  );
};
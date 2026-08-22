'use client';

import React from 'react';
import { Calendar, Info } from 'lucide-react';
import { FilterState } from './types';
import { CustomDropdown, type DropdownOption } from './CustomDropdown';
import { availableFiscalYears, LATEST_DATA_FISCAL_YEAR } from '@docujourney/utils';

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
  // Fiscal years from 2020 through the latest year with published DOL data
  const availableYears = availableFiscalYears();
  const defaultYear = LATEST_DATA_FISCAL_YEAR;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Connected Filter Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Filter Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Fiscal Year</span>
            </div>
            
            <CustomDropdown
              options={dropdownOptions}
              value={filters.fiscalYear || defaultYear}
              onChange={handleYearChange}
              placeholder="Select year"
              className="w-[140px] min-h-[40px] border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
            />
          </div>

          {/* Active Filter Context */}
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">
                Showing FY {filters.fiscalYear || defaultYear} data
              </span>
              <div className="group relative">
                <Info className="w-4 h-4 text-blue-600 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="text-center">
                    <div className="font-semibold mb-1">H1B Fiscal Year {filters.fiscalYear || defaultYear}</div>
                    <div>Oct 1, {(parseInt(filters.fiscalYear || defaultYear) - 1)} - Sep 30, {filters.fiscalYear || defaultYear}</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded font-medium">
              Quarterly DOL Data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
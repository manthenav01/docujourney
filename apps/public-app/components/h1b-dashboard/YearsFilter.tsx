'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { FilterState } from './types';

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

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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

        <select
          value={filters.fiscalYear || defaultYear}
          onChange={handleYearChange}
          className="
            px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900
            text-sm font-medium cursor-pointer shadow-sm
            hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            outline-none appearance-none
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22/%3E%3C/svg%3E')]
            bg-no-repeat bg-right-2 bg-center pr-8
            min-w-[120px]
          "
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              FY {year}
            </option>
          ))}
        </select>

        <div className="text-xs text-muted-foreground">
          {filters.fiscalYear ? `Showing data for FY ${filters.fiscalYear}` : `Showing data for FY ${defaultYear}`}
        </div>
      </div>
    </div>
  );
};
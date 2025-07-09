"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  Briefcase,
  Globe,
  DollarSign
} from 'lucide-react';
import { FilterState } from './types';

interface SearchAndFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterOptions: {
    fiscalYears: string[];
    states: string[];
    jobCategories: string[];
  };
}

const FilterSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ 
  title, 
  icon, 
  children 
}) => (
  <div className="space-y-3">
    <div className="flex items-center space-x-3">
      {icon}
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
    </div>
    {children}
  </div>
);

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  setFilters,
  isFilterOpen,
  setIsFilterOpen,
  filterOptions
}) => {
  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentValues = prev[type] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
  };

  // Use filterOptions from props instead of computing from h1bData
  const uniqueYears = filterOptions.fiscalYears || [];
  const uniqueStates = filterOptions.states || [];
  const uniqueCategories = filterOptions.jobCategories || [];
  // For simplicity, using static options for skill levels and company sizes
  const uniqueSkillLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Staff Level', 'Principal Level'];
  const uniqueCompanySizes = ['Small', 'Medium', 'Large', 'Enterprise'];

  return (
    <>
      {/* Modern Search Bar */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by employer, job title, or location..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-12 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-gray-50/50 transition-all duration-200"
              />
            </div>
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="h-14 px-6 rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 min-w-[120px]"
            >
              <Filter size={18} className="mr-2" />
              Filters
              {isFilterOpen ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FilterSection 
                  title="Fiscal Year" 
                  icon={<Calendar className="h-5 w-5 text-blue-600" />}
                >
                  <div className="space-y-2">
                    {uniqueYears.map(year => (
                      <Button
                        key={year}
                        variant={filters.fiscalYears.includes(year) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('fiscalYears', year)}
                        className="w-full justify-start rounded-lg transition-all duration-200"
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection 
                  title="Salary Range" 
                  icon={<DollarSign className="h-5 w-5 text-green-600" />}
                >
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.salaryRange[0]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          salaryRange: [parseInt(e.target.value) || 0, prev.salaryRange[1]]
                        }))}
                        className="rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.salaryRange[1]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          salaryRange: [prev.salaryRange[0], parseInt(e.target.value) || 300000]
                        }))}
                        className="rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                  </div>
                </FilterSection>

                <FilterSection 
                  title="Location" 
                  icon={<MapPin className="h-5 w-5 text-orange-600" />}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uniqueStates.slice(0, 12).map(state => (
                      <Button
                        key={state}
                        variant={filters.states.includes(state) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('states', state)}
                        className="w-full justify-start rounded-lg transition-all duration-200"
                      >
                        {state}
                      </Button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection 
                  title="Job Category" 
                  icon={<Briefcase className="h-5 w-5 text-purple-600" />}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uniqueCategories.map(category => (
                      <Button
                        key={category}
                        variant={filters.jobCategories.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('jobCategories', category)}
                        className="w-full justify-start rounded-lg transition-all duration-200"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection 
                  title="Skill Level" 
                  icon={<Users className="h-5 w-5 text-indigo-600" />}
                >
                  <div className="space-y-2">
                    {uniqueSkillLevels.map(level => (
                      <Button
                        key={level}
                        variant={filters.skillLevels.includes(level) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('skillLevels', level)}
                        className="w-full justify-start rounded-lg transition-all duration-200"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection 
                  title="Company Size" 
                  icon={<Building2 className="h-5 w-5 text-cyan-600" />}
                >
                  <div className="space-y-2">
                    {uniqueCompanySizes.map(size => (
                      <Button
                        key={size}
                        variant={filters.companySizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('companySizes', size)}
                        className="w-full justify-start rounded-lg transition-all duration-200"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

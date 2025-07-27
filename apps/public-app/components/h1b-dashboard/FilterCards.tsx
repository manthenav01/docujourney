'use client';

import React, { useState } from 'react';
import { 
  Calendar,
  DollarSign,
  Building2,
  Briefcase,
  MapPin,
  Users,
  TrendingUp,
  X,
  Check,
  ChevronDown,
  Filter,
  Settings,
} from 'lucide-react';
import { FilterState } from './types';
import { YearsFilter } from './YearsFilter';
import { 
  Button, 
  Card, 
  CardContent, 
  Badge, 
  Popover, 
  PopoverContent, 
  PopoverTrigger,
  Input,
} from '@docujourney/ui';

interface FilterCardsProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const FilterCards: React.FC<FilterCardsProps> = ({
  filters,
  setFilters,
}) => {
  const [salaryPopoverOpen, setSalaryPopoverOpen] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [companyTypePopoverOpen, setCompanyTypePopoverOpen] = useState(false);
  const [skillLevelPopoverOpen, setSkillLevelPopoverOpen] = useState(false);
  const [statePopoverOpen, setStatePopoverOpen] = useState(false);

  // Generate available years from 2020 to current year
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => (2020 + i).toString(),
  ).reverse();

  // Filter options
  const jobCategories = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'Business Analyst',
    'Research Scientist',
    'Consultant',
    'Marketing Manager',
    'Finance Analyst',
    'Operations Manager',
    'DevOps Engineer',
    'UI/UX Designer',
    'Project Manager',
  ];

  const companyTypes = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Consulting',
    'Manufacturing',
    'Education',
    'Government',
    'Retail',
    'Media & Entertainment',
    'Non-Profit',
    'Telecommunications',
    'Automotive',
  ];

  const skillLevels = [
    'Entry Level',
    'Mid Level', 
    'Senior Level',
    'Lead/Principal',
    'Management',
    'Executive',
  ];

  const states = [
    'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania',
    'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
    'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
    'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama',
  ];

  // Handler functions
  const handleSalaryChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      salaryRange: [values[0], values[1]] as [number, number],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      jobCategories: prev.jobCategories.includes(category)
        ? prev.jobCategories.filter(c => c !== category)
        : [...prev.jobCategories, category],
    }));
  };

  const handleCompanyTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      companyTypes: prev.companyTypes.includes(type)
        ? prev.companyTypes.filter(t => t !== type)
        : [...prev.companyTypes, type],
    }));
  };

  const handleSkillLevelToggle = (level: string) => {
    setFilters(prev => ({
      ...prev,
      skillLevels: prev.skillLevels.includes(level)
        ? prev.skillLevels.filter(l => l !== level)
        : [...prev.skillLevels, level],
    }));
  };

  const handleStateToggle = (state: string) => {
    setFilters(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state],
    }));
  };

  const clearAllFilters = () => {
    setFilters(prev => ({
      ...prev,
      fiscalYears: [],
      salaryRange: [0, 500000],
      states: [],
      cities: [],
      jobCategories: [],
      skillLevels: [],
      companySizes: [],
      companyTypes: [],
    }));
  };

  const getActiveFilterCount = () => {
    return (
      filters.fiscalYears.length +
      filters.states.length +
      filters.jobCategories.length +
      filters.skillLevels.length +
      filters.companyTypes.length +
      (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 500000 ? 1 : 0)
    );
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filter Dashboard Data</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-muted-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Year Filter - Using Clean Shadcn Select */}
        <Card className="hover:shadow-md transition-shadow border-2 hover:border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div className="text-xs text-muted-foreground">
                {filters.fiscalYears.length > 0 
                  ? `${filters.fiscalYears.length} selected`
                  : 'All years'}
              </div>
            </div>
            <div className="text-sm font-medium text-foreground mb-3">Years</div>
            <YearsFilter 
              filters={filters}
              setFilters={setFilters}
              availableYears={availableYears}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Salary Range Filter */}
        <Popover open={salaryPopoverOpen} onOpenChange={setSalaryPopoverOpen}>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground mb-1">Salary</div>
                <div className="text-xs text-muted-foreground">
                  {filters.salaryRange[0] > 0 || filters.salaryRange[1] < 500000
                    ? `$${Math.round(filters.salaryRange[0]/1000)}K - $${Math.round(filters.salaryRange[1]/1000)}K`
                    : 'All ranges'}
                </div>
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              <h4 className="text-sm font-medium text-foreground mb-4">Salary Range</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Min Salary</label>
                    <Input
                      type="number"
                      value={filters.salaryRange[0]}
                      onChange={(e) => handleSalaryChange([parseInt(e.target.value) || 0, filters.salaryRange[1]])}
                      className="text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Max Salary</label>
                    <Input
                      type="number"
                      value={filters.salaryRange[1]}
                      onChange={(e) => handleSalaryChange([filters.salaryRange[0], parseInt(e.target.value) || 500000])}
                      className="text-sm"
                      placeholder="500000"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${Math.round(filters.salaryRange[0]/1000)}K</span>
                  <span>${Math.round(filters.salaryRange[1]/1000)}K</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSalaryChange([50000, 100000])}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    $50K - $100K
                  </button>
                  <button
                    onClick={() => handleSalaryChange([100000, 200000])}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    $100K - $200K
                  </button>
                  <button
                    onClick={() => handleSalaryChange([200000, 300000])}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    $200K - $300K
                  </button>
                  <button
                    onClick={() => handleSalaryChange([300000, 500000])}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    $300K+
                  </button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Job Categories Filter */}
        <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground mb-1">Job Categories</div>
                <div className="text-xs text-muted-foreground">
                  {filters.jobCategories.length > 0 
                    ? `${filters.jobCategories.length} selected`
                    : 'All categories'}
                </div>
                {filters.jobCategories.length > 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {filters.jobCategories.length}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Job Categories</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {jobCategories.map((category) => {
                  const isSelected = filters.jobCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? 'bg-purple-50 border border-purple-200 text-purple-700'
                          : 'bg-white border border-gray-200 text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* States Filter */}
        <Popover open={statePopoverOpen} onOpenChange={setStatePopoverOpen}>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground mb-1">States</div>
                <div className="text-xs text-muted-foreground">
                  {filters.states.length > 0 
                    ? `${filters.states.length} selected`
                    : 'All states'}
                </div>
                {filters.states.length > 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {filters.states.length}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Filter by State</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {states.map((state) => {
                  const isSelected = filters.states.includes(state);
                  return (
                    <button
                      key={state}
                      onClick={() => handleStateToggle(state)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? 'bg-orange-50 border border-orange-200 text-orange-700'
                          : 'bg-white border border-gray-200 text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {state}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Company Types Filter */}
        <Popover open={companyTypePopoverOpen} onOpenChange={setCompanyTypePopoverOpen}>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground mb-1">Industry</div>
                <div className="text-xs text-muted-foreground">
                  {filters.companyTypes.length > 0 
                    ? `${filters.companyTypes.length} selected`
                    : 'All industries'}
                </div>
                {filters.companyTypes.length > 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {filters.companyTypes.length}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Company Industry</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {companyTypes.map((type) => {
                  const isSelected = filters.companyTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleCompanyTypeToggle(type)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                          : 'bg-white border border-gray-200 text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Skill Levels Filter */}
        <Popover open={skillLevelPopoverOpen} onOpenChange={setSkillLevelPopoverOpen}>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground mb-1">Experience</div>
                <div className="text-xs text-muted-foreground">
                  {filters.skillLevels.length > 0 
                    ? `${filters.skillLevels.length} selected`
                    : 'All levels'}
                </div>
                {filters.skillLevels.length > 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {filters.skillLevels.length}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Experience Level</h4>
              <div className="space-y-2">
                {skillLevels.map((level) => {
                  const isSelected = filters.skillLevels.includes(level);
                  return (
                    <button
                      key={level}
                      onClick={() => handleSkillLevelToggle(level)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? 'bg-teal-50 border border-teal-200 text-teal-700'
                          : 'bg-white border border-gray-200 text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-blue-900">Active Filters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.fiscalYears.map((year) => (
                <Badge key={year} variant="secondary" className="bg-primary/10 text-primary">
                  {year}
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      fiscalYears: prev.fiscalYears.filter(y => y !== year),
                    }))}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.states.map((state) => (
                <Badge key={state} variant="secondary" className="bg-orange-100 text-orange-700">
                  {state}
                  <button
                    onClick={() => handleStateToggle(state)}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.jobCategories.map((category) => (
                <Badge key={category} variant="secondary" className="bg-purple-100 text-purple-700">
                  {category}
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.companyTypes.map((type) => (
                <Badge key={type} variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {type}
                  <button
                    onClick={() => handleCompanyTypeToggle(type)}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.skillLevels.map((level) => (
                <Badge key={level} variant="secondary" className="bg-teal-100 text-teal-700">
                  {level}
                  <button
                    onClick={() => handleSkillLevelToggle(level)}
                    className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {(filters.salaryRange[0] > 0 || filters.salaryRange[1] < 500000) && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  ${Math.round(filters.salaryRange[0]/1000)}K - ${Math.round(filters.salaryRange[1]/1000)}K
                  <button
                    onClick={() => handleSalaryChange([0, 500000])}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
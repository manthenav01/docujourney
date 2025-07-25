'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sparkles,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { FilterState } from './types';
import { SemanticSearch } from './SemanticSearch';
import { Button, Card, CardContent, Input, Badge, Popover, PopoverContent, PopoverTrigger } from '@docujourney/ui';

interface SearchSuggestion {
  text: string;
  type: string;
  count: number;
  category?: string;
}

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
  onSemanticSearch?: (query: string, options?: any) => void;
  enableSemanticSearch?: boolean;
  showSearchInstructions?: boolean;
}


export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  setFilters,
  isFilterOpen,
  setIsFilterOpen,
  filterOptions,
  onSemanticSearch,
  enableSemanticSearch = true,
  showSearchInstructions = false,
}) => {
  const router = useRouter();
  const [yearPopoverOpen, setYearPopoverOpen] = useState(false);

  // Generate available years from 2020 to current year
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => (2020 + i).toString(),
  ).reverse(); // Show newest years first

  const handleYearToggle = (year: string) => {
    setFilters(prev => ({
      ...prev,
      fiscalYears: prev.fiscalYears.includes(year)
        ? prev.fiscalYears.filter(y => y !== year)
        : [...prev.fiscalYears, year],
    }));
  };

  const handleYearRemove = (year: string) => {
    setFilters(prev => ({
      ...prev,
      fiscalYears: prev.fiscalYears.filter(y => y !== year),
    }));
  };

  const clearAllYears = () => {
    setFilters(prev => ({
      ...prev,
      fiscalYears: [],
    }));
  };

  const handleSemanticSearch = (query: string, options?: any) => {
    // Don't update filters - search is now just for autocomplete
    console.log('Search query:', query);
    
    // Call the semantic search callback if provided (though we may not need this)
    if (onSemanticSearch) {
      onSemanticSearch(query, options);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    // Debug logging
    console.log('SearchAndFilters handleSuggestionSelect:', suggestion);
    
    // Helper function to detect if text looks like a company name
    const looksLikeCompanyName = (text: string) => {
      const companyIndicators = [
        'INC', 'LLC', 'CORP', 'LTD', 'CORPORATION', 'COMPANY', 'CO',
        'TECHNOLOGIES', 'SYSTEMS', 'SOLUTIONS', 'SERVICES', 'GROUP',
      ];
      const upperText = text.toUpperCase();
      return companyIndicators.some(indicator => 
        upperText.includes(indicator + '.') || 
        upperText.includes(indicator + ',') || 
        upperText.endsWith(indicator),
      );
    };
    
    // Handle navigation to company or job pages - no API calls needed
    let finalType = suggestion.type;
    
    // Override type if it looks like a company name but was classified as job_title
    if (suggestion.type === 'job_title' && looksLikeCompanyName(suggestion.text)) {
      finalType = 'employer';
      console.log('Overriding job_title to employer for:', suggestion.text);
    }
    
    if (finalType === 'employer') {
      const companySlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('Navigating to company page:', `/h1b-dashboard/company/${encodeURIComponent(companySlug)}?name=${encodeURIComponent(suggestion.text)}`);
      // Direct navigation - no API calls needed on dashboard
      router.push(`/h1b-dashboard/company/${encodeURIComponent(companySlug)}?name=${encodeURIComponent(suggestion.text)}`);
    } else if (finalType === 'job_title') {
      const jobSlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('Navigating to job page:', `/h1b-dashboard/job/${encodeURIComponent(jobSlug)}?title=${encodeURIComponent(suggestion.text)}`);
      // Direct navigation - no API calls needed on dashboard
      router.push(`/h1b-dashboard/job/${encodeURIComponent(jobSlug)}?title=${encodeURIComponent(suggestion.text)}`);
    } else if (finalType === 'location') {
      // Navigate to city page if it's a city, state format
      if (suggestion.text.includes(',')) {
        const [cityPart, statePart] = suggestion.text.split(',');
        const cityName = cityPart.trim();
        const stateName = statePart.trim();
        
        if (cityName && stateName) {
          const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          console.log('Navigating to city page:', `/h1b-dashboard/city/${encodeURIComponent(citySlug)}?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
          router.push(`/h1b-dashboard/city/${encodeURIComponent(citySlug)}?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
          return;
        }
      }
      
      // Fall back to auto-applying location filter for states only
      const state = suggestion.text.split(',')[1]?.trim() || suggestion.text.trim();
      if (state && !filters.states.includes(state)) {
        setFilters(prev => ({
          ...prev,
          states: [...prev.states, state],
        }));
      }
    }
  };

  return (
    <>
      {/* Enhanced Search Bar with Semantic Search */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              {enableSemanticSearch ? (
                <SemanticSearch
                  onSearch={handleSemanticSearch}
                  onSuggestionSelect={handleSuggestionSelect}
                  placeholder="Search jobs, companies, or locations..."
                  initialQuery={filters.searchQuery}
                  className="w-full"
                />
              ) : (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search by employer, job title, or location..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-12 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-gray-50/50 transition-all duration-200"
                  />
                </div>
              )}
            </div>
            
            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <Popover open={yearPopoverOpen} onOpenChange={setYearPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 px-4 border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 rounded-xl"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Years
                    {filters.fiscalYears.length > 0 && (
                      <Badge variant="secondary" className="ml-2 min-w-0">
                        {filters.fiscalYears.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Filter by Year</h4>
                      {filters.fiscalYears.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllYears}
                          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {availableYears.map((year) => {
                        const isSelected = filters.fiscalYears.includes(year);
                        return (
                          <button
                            key={year}
                            onClick={() => handleYearToggle(year)}
                            className={`
                              flex items-center justify-center h-10 rounded-md border text-sm font-medium transition-all duration-200
                              ${isSelected
                                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                              }
                            `}
                          >
                            {isSelected && <Check className="w-3 h-3 mr-1" />}
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Selected Year Badges */}
          {filters.fiscalYears.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-gray-600 font-medium">Filtered by years:</span>
              {filters.fiscalYears.map((year) => (
                <Badge
                  key={year}
                  variant="secondary"
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  {year}
                  <button
                    onClick={() => handleYearRemove(year)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Search Instructions */}
          {showSearchInstructions && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Search for Companies & Jobs</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Search for companies or job titles to view detailed H1B data analysis.
                  </p>
                  <div className="text-xs text-blue-600">
                    <span className="font-medium">Try:</span> &quot;Google&quot;, &quot;Microsoft&quot;, &quot;Senior Software Engineer&quot;, &quot;Data Scientist&quot;
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </>
  );
};

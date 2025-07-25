'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { FilterState } from './types';

interface SearchSuggestion {
  text: string;
  type: 'company' | 'job' | 'location';
  count?: number;
}

interface DashboardHeroProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch?: (query: string) => void;
}

const trendingSearches: SearchSuggestion[] = [
  { text: 'Google H1B salary', type: 'company', count: 12500 },
  { text: 'Software Engineer', type: 'job', count: 45600 },
  { text: 'San Francisco', type: 'location', count: 23400 },
  { text: 'Microsoft', type: 'company', count: 8900 },
  { text: 'Data Scientist', type: 'job', count: 18700 },
];

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  filters,
  setFilters,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Simulate search suggestions
      const filteredSuggestions = trendingSearches.filter(suggestion => 
        suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    }
    setShowSuggestions(false);
    // You can implement actual search logic here
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
            Explore what{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
              United States
            </span>
            <br />
            is searching for
            <br />
            right now
          </h1>
        </div>

        {/* Search Interface */}
        <div className="relative mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
              placeholder="Search H1B data: companies, jobs, locations..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Explore
            </button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{suggestion.text}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      suggestion.type === 'company' ? 'bg-blue-100 text-blue-700' :
                      suggestion.type === 'job' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {suggestion.type}
                    </span>
                  </div>
                  {suggestion.count && (
                    <span className="text-sm text-gray-500">{suggestion.count.toLocaleString()} applications</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trending Searches */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Trending searches</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {trendingSearches.slice(0, 5).map((trend, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(trend)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
              >
                {trend.text}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            Real-time insights from BigQuery • Interactive H1B data exploration
          </p>
        </div>
      </div>
    </div>
  );
};
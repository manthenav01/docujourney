'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FilterState } from './types';
import { SemanticSearch } from './SemanticSearch';

interface SearchSuggestion {
  text: string;
  displayText?: string; // Optional friendly display name
  type: 'job_title' | 'employer' | 'location';
  count: number;
  category?: string;
}

interface DashboardHeroProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch?: (query: string) => void;
}

const trendingSearches: SearchSuggestion[] = [
  { text: 'GOOGLE LLC', displayText: 'Google', type: 'employer', count: 7932 },
  { text: 'Software Engineer', type: 'job_title', count: 45600 },
  { text: 'San Francisco, CA', type: 'location', count: 23400 },
  { text: 'MICROSOFT CORPORATION', displayText: 'Microsoft', type: 'employer', count: 7072 },
  { text: 'Data Scientist', type: 'job_title', count: 18700 },
];

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  filters,
  setFilters,
  onSearch,
}) => {
  const router = useRouter();

  const handleSemanticSearch = (query: string, options?: any) => {
    console.log('Hero search:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    console.log('Hero suggestion selected:', suggestion);
    
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
    
    // Handle navigation to company or job pages
    let finalType = suggestion.type;
    
    // Override type if it looks like a company name but was classified as job_title
    if (suggestion.type === 'job_title' && looksLikeCompanyName(suggestion.text)) {
      finalType = 'employer';
      console.log('Overriding job_title to employer for:', suggestion.text);
    }
    
    if (finalType === 'employer') {
      const companySlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('Navigating to company page:', `/h1b-dashboard/company/${encodeURIComponent(companySlug)}?name=${encodeURIComponent(suggestion.text)}`);
      router.push(`/h1b-dashboard/company/${encodeURIComponent(companySlug)}?name=${encodeURIComponent(suggestion.text)}`);
    } else if (finalType === 'job_title') {
      const jobSlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('Navigating to job page:', `/h1b-dashboard/job/${encodeURIComponent(jobSlug)}?title=${encodeURIComponent(suggestion.text)}`);
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
    <div className="relative bg-gray-50 overflow-hidden">
      {/* Clean Background Patterns */}
      <div className="absolute inset-0">
        {/* Subtle Dot Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Clean Geometric Elements */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          {/* Static Geometric Shapes */}
          <g opacity="0.06" fill="#3b82f6">
            {/* Large Circle */}
            <circle cx="200" cy="150" r="60" />
            {/* Rectangle */}
            <rect x="800" y="200" width="80" height="60" rx="10" />
            {/* Small Circles */}
            <circle cx="950" cy="120" r="25" />
            <circle cx="150" cy="350" r="35" />
          </g>
          
          {/* Abstract World Map - Very Subtle */}
          <g opacity="0.03" fill="#374151">
            {/* Simplified Continental Outlines */}
            <path d="M180,180 Q220,160 280,180 L300,200 Q280,220 220,210 L180,180 Z" />
            <path d="M400,170 Q440,150 480,170 L490,180 Q480,190 440,185 L400,170 Z" />
            <path d="M550,160 Q620,140 690,165 L710,180 Q690,200 620,190 L550,160 Z" />
          </g>
          
          {/* Clean Color Zones */}
          <g opacity="0.04">
            <rect x="0" y="0" width="400" height="300" fill="#3b82f6" />
            <rect x="800" y="300" width="400" height="300" fill="#6366f1" />
          </g>
        </svg>
        
        {/* Simple Bottom Layer */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-16 bg-white/30"></div>
          <div className="h-8 bg-white/50"></div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
            Explore{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
              H1B visa trends
            </span>
            <br />
            and employer data
            <br />
            across America
          </h1>
        </div>

        {/* Search Interface */}
        <div className="relative mb-8">
          <div className="w-full max-w-xl mx-auto">
            <SemanticSearch
              onSearch={handleSemanticSearch}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Search H1B data: companies, jobs, locations..."
              className="w-full [&_input]:h-16 [&_input]:pl-12 [&_input]:pr-12 [&_input]:py-4 [&_input]:text-lg [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-300 [&_input]:bg-white [&_input]:shadow-md hover:[&_input]:shadow-lg [&_input]:transition-all [&_input]:duration-200 focus:[&_input]:border-blue-500 focus:[&_input]:ring-2 focus:[&_input]:ring-blue-500/20"
              showSemanticToggle={false}
            />
          </div>
        </div>

        {/* Trending Searches */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Trending searches</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {/* Desktop: Show 5 trending searches */}
            <div className="hidden sm:flex flex-wrap justify-center gap-3">
              {trendingSearches.slice(0, 5).map((trend, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(trend)}
                  className="px-4 py-3 min-h-[44px] bg-white/80 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-sm font-medium border border-white/30"
                >
                  {trend.displayText || trend.text}
                </button>
              ))}
            </div>
            {/* Mobile: Show 3 trending searches in one row */}
            <div className="flex sm:hidden justify-center gap-2">
              {trendingSearches.slice(0, 3).map((trend, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(trend)}
                  className="px-3 py-2.5 min-h-[40px] bg-white/80 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-xs font-medium border border-white/30"
                >
                  {trend.displayText || trend.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            Real-time H1B visa insights • Interactive data exploration
          </p>
        </div>
      </div>
    </div>
  );
};
'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import { FilterState } from './types';
import { SemanticSearch } from './SemanticSearch';

interface SearchSuggestion {
  text: string;
  displayText?: string;
  type: 'job_title' | 'employer' | 'location';
  count: number;
  category?: string;
}

interface CitiesHeroProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

interface CityStats {
  totalCities: number;
  totalStates: number;
  totalApplications: number;
  avgSalary: number;
}

interface CityHeroData {
  topCities: (SearchSuggestion & { avgSalary?: number; city?: string; state?: string })[];
  stats: CityStats;
}

export const CitiesHero: React.FC<CitiesHeroProps> = ({
  filters,
  setFilters,
  onSearch,
  onSuggestionSelect,
}) => {
  const [heroData, setHeroData] = useState<CityHeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/h1b-data/hero-stats?type=cities');
        const data = await response.json();
        setHeroData(data);
      } catch (error) {
        console.error('Error fetching cities hero data:', error);
        // Fallback to default data if API fails
        setHeroData({
          topCities: [
            { text: 'San Francisco, CA', displayText: 'San Francisco', type: 'location', count: 23400 },
            { text: 'New York, NY', displayText: 'New York', type: 'location', count: 21200 },
            { text: 'Seattle, WA', displayText: 'Seattle', type: 'location', count: 18900 },
            { text: 'Chicago, IL', displayText: 'Chicago', type: 'location', count: 14600 },
            { text: 'Austin, TX', displayText: 'Austin', type: 'location', count: 12800 },
          ],
          stats: {
            totalCities: 1200,
            totalStates: 50,
            totalApplications: 500000,
            avgSalary: 98000,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const handleSemanticSearch = (query: string, options?: any) => {
    console.log('Cities hero search:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    console.log('Cities hero suggestion selected:', suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #7c3aed 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Map-like Connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <g opacity="0.08" stroke="#7c3aed" strokeWidth="1" fill="none">
            <line x1="200" y1="200" x2="400" y2="250" />
            <line x1="400" y1="250" x2="600" y2="180" />
            <line x1="600" y1="180" x2="800" y2="220" />
            <line x1="800" y1="220" x2="1000" y2="200" />
            <line x1="300" y1="350" x2="500" y2="320" />
            <line x1="500" y1="320" x2="700" y2="380" />
            <line x1="700" y1="380" x2="900" y2="350" />
          </g>
          <g opacity="0.06" fill="#7c3aed">
            <circle cx="200" cy="200" r="6" />
            <circle cx="400" cy="250" r="8" />
            <circle cx="600" cy="180" r="7" />
            <circle cx="800" cy="220" r="9" />
            <circle cx="1000" cy="200" r="6" />
            <circle cx="300" cy="350" r="5" />
            <circle cx="500" cy="320" r="7" />
            <circle cx="700" cy="380" r="6" />
            <circle cx="900" cy="350" r="8" />
          </g>
        </svg>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-purple-100 rounded-xl mb-6">
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
            Discover{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-medium">
              H1B Hotspots
            </span>
            <br />
            across America
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore geographic distribution of H1B opportunities, cost of living comparisons, and regional salary trends
          </p>
        </div>

        {/* Search Interface */}
        <div className="relative mb-8">
          <div className="w-full max-w-xl mx-auto">
            <SemanticSearch
              onSearch={handleSemanticSearch}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Search cities, states, metropolitan areas..."
              className="w-full [&_input]:h-16 [&_input]:pl-12 [&_input]:pr-12 [&_input]:py-4 [&_input]:text-lg [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-300 [&_input]:bg-white [&_input]:shadow-md hover:[&_input]:shadow-lg [&_input]:transition-all [&_input]:duration-200 focus:[&_input]:border-purple-500 focus:[&_input]:ring-2 focus:[&_input]:ring-purple-500/20"
              showSemanticToggle={false}
            />
          </div>
        </div>

        {/* Top Cities */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Top H1B cities</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {loading ? (
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 min-h-[44px] bg-white/60 rounded-full animate-pulse"
                    style={{ width: `${90 + i * 12}px` }}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop: Show 5 top cities */}
                <div className="hidden sm:flex flex-wrap justify-center gap-3">
                  {(heroData?.topCities || []).slice(0, 5).map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(city)}
                      className="px-4 py-3 min-h-[44px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-sm font-medium border border-purple-100"
                    >
                      {city.displayText || city.text}
                      <span className="ml-2 text-xs text-gray-500">
                        {city.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Mobile: Show 3 top cities */}
                <div className="flex sm:hidden justify-center gap-2">
                  {(heroData?.topCities || []).slice(0, 3).map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(city)}
                      className="px-3 py-2.5 min-h-[40px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-xs font-medium border border-purple-100"
                    >
                      {city.displayText || city.text}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 bg-gray-200 rounded animate-pulse h-8 w-16 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600 bg-gray-200 rounded animate-pulse h-4 w-20 mx-auto"></div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {heroData?.stats.totalCities.toLocaleString()}+
                </div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {heroData?.stats.totalStates}
                </div>
                <div className="text-sm text-gray-600">States & Territories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round((heroData?.stats.avgSalary || 0) / 1000)}K
                </div>
                <div className="text-sm text-gray-600">Avg. Salary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((heroData?.stats.totalApplications || 0) / 1000)}K+
                </div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
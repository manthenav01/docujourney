'use client';

import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp } from 'lucide-react';
import { FilterState } from './types';
import { SemanticSearch } from './SemanticSearch';

interface SearchSuggestion {
  text: string;
  displayText?: string;
  type: 'job_title' | 'employer' | 'location';
  count: number;
  category?: string;
}

interface EmployersHeroProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

interface EmployerStats {
  totalEmployers: number;
  avgSalary: number;
  approvalRate: number;
  totalApplications: number;
}

interface HeroData {
  topEmployers: SearchSuggestion[];
  stats: EmployerStats;
}

export const EmployersHero: React.FC<EmployersHeroProps> = ({
  filters,
  setFilters,
  onSearch,
  onSuggestionSelect,
}) => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/h1b-data/hero-stats?type=employers');
        const data = await response.json();
        setHeroData(data);
      } catch (error) {
        console.error('Error fetching employer hero data:', error);
        // Fallback to default data if API fails
        setHeroData({
          topEmployers: [
            { text: 'GOOGLE LLC', displayText: 'Google', type: 'employer', count: 7932 },
            { text: 'MICROSOFT CORPORATION', displayText: 'Microsoft', type: 'employer', count: 7072 },
            { text: 'AMAZON.COM SERVICES LLC', displayText: 'Amazon', type: 'employer', count: 6854 },
            { text: 'APPLE INC.', displayText: 'Apple', type: 'employer', count: 5912 },
            { text: 'META PLATFORMS, INC.', displayText: 'Meta', type: 'employer', count: 4789 },
          ],
          stats: {
            totalEmployers: 15000,
            avgSalary: 95000,
            approvalRate: 87,
            totalApplications: 500000,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const handleSemanticSearch = (query: string, options?: any) => {
    console.log('Employers hero search:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    console.log('Employers hero suggestion selected:', suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #3b82f6 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Company Building Icons Pattern */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <g opacity="0.05" fill="#3b82f6">
            <rect x="100" y="200" width="40" height="60" rx="4" />
            <rect x="105" y="190" width="30" height="10" rx="2" />
            <rect x="800" y="150" width="50" height="80" rx="4" />
            <rect x="805" y="140" width="40" height="10" rx="2" />
            <rect x="950" y="180" width="35" height="50" rx="4" />
            <rect x="200" y="300" width="45" height="70" rx="4" />
          </g>
        </svg>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-xl mb-6">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
            Discover{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
              Top H1B Sponsors
            </span>
            <br />
            and employer insights
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore comprehensive data on H1B employers, their hiring patterns, salary ranges, and success rates
          </p>
        </div>

        {/* Search Interface */}
        <div className="relative mb-8">
          <div className="w-full max-w-xl mx-auto">
            <SemanticSearch
              onSearch={handleSemanticSearch}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Search H1B employers, companies, organizations..."
              className="w-full [&_input]:h-16 [&_input]:pl-12 [&_input]:pr-12 [&_input]:py-4 [&_input]:text-lg [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-300 [&_input]:bg-white [&_input]:shadow-md hover:[&_input]:shadow-lg [&_input]:transition-all [&_input]:duration-200 focus:[&_input]:border-blue-500 focus:[&_input]:ring-2 focus:[&_input]:ring-blue-500/20"
              showSemanticToggle={false}
            />
          </div>
        </div>

        {/* Top Employers */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Top H1B sponsors</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {loading ? (
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 min-h-[44px] bg-white/60 rounded-full animate-pulse"
                    style={{ width: `${80 + i * 10}px` }}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop: Show 5 top employers */}
                <div className="hidden sm:flex flex-wrap justify-center gap-3">
                  {(heroData?.topEmployers || []).slice(0, 5).map((employer, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(employer)}
                      className="px-4 py-3 min-h-[44px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-sm font-medium border border-blue-100"
                    >
                      {employer.displayText || employer.text}
                      <span className="ml-2 text-xs text-gray-500">
                        {employer.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Mobile: Show 3 top employers */}
                <div className="flex sm:hidden justify-center gap-2">
                  {(heroData?.topEmployers || []).slice(0, 3).map((employer, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(employer)}
                      className="px-3 py-2.5 min-h-[40px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-xs font-medium border border-blue-100"
                    >
                      {employer.displayText || employer.text}
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
                  {heroData?.stats.totalEmployers.toLocaleString()}+
                </div>
                <div className="text-sm text-gray-600">Active Employers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round((heroData?.stats.avgSalary || 0) / 1000)}K
                </div>
                <div className="text-sm text-gray-600">Avg. Salary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {heroData?.stats.approvalRate}%
                </div>
                <div className="text-sm text-gray-600">Approval Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((heroData?.stats.totalApplications || 0) / 1000)}K+
                </div>
                <div className="text-sm text-gray-600">H1B Applications</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp } from 'lucide-react';
import { FilterState } from './types';
import { SemanticSearch } from './SemanticSearch';

interface SearchSuggestion {
  text: string;
  displayText?: string;
  type: 'job_title' | 'employer' | 'location';
  count: number;
  category?: string;
}

interface JobsHeroProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

interface JobStats {
  totalJobTitles: number;
  avgSalary: number;
  salaryRange: {
    min: number;
    max: number;
  };
  totalPositions: number;
}

interface JobHeroData {
  topJobs: (SearchSuggestion & { avgSalary?: number })[];
  stats: JobStats;
}

export const JobsHero: React.FC<JobsHeroProps> = ({
  filters,
  setFilters,
  onSearch,
  onSuggestionSelect,
}) => {
  const [heroData, setHeroData] = useState<JobHeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/h1b-data/hero-stats?type=jobs');
        const data = await response.json();
        setHeroData(data);
      } catch (error) {
        console.error('Error fetching jobs hero data:', error);
        // Fallback to default data if API fails
        setHeroData({
          topJobs: [
            { text: 'Software Engineer', type: 'job_title', count: 45600 },
            { text: 'Data Scientist', type: 'job_title', count: 18700 },
            { text: 'Product Manager', type: 'job_title', count: 12400 },
            { text: 'Software Developer', type: 'job_title', count: 38200 },
            { text: 'Business Analyst', type: 'job_title', count: 15800 },
          ],
          stats: {
            totalJobTitles: 2500,
            avgSalary: 105000,
            salaryRange: { min: 45000, max: 300000 },
            totalPositions: 450000,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const handleSemanticSearch = (query: string, options?: any) => {
    console.log('Jobs hero search:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    console.log('Jobs hero suggestion selected:', suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #059669 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Career Path Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <g opacity="0.08" stroke="#059669" strokeWidth="2" fill="none">
            <path d="M100,300 Q300,200 500,300 Q700,400 900,300" />
            <path d="M200,400 Q400,300 600,400 Q800,500 1000,400" />
            <path d="M150,250 Q350,150 550,250 Q750,350 950,250" />
          </g>
          <g opacity="0.05" fill="#059669">
            <circle cx="200" cy="200" r="4" />
            <circle cx="400" cy="300" r="4" />
            <circle cx="600" cy="250" r="4" />
            <circle cx="800" cy="350" r="4" />
            <circle cx="1000" cy="300" r="4" />
          </g>
        </svg>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-emerald-100 rounded-xl mb-6">
            <Briefcase className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
            Explore{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-medium">
              H1B Job Opportunities
            </span>
            <br />
            and career paths
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover popular H1B job titles, salary ranges, skill requirements, and career progression opportunities
          </p>
        </div>

        {/* Search Interface */}
        <div className="relative mb-8">
          <div className="w-full max-w-xl mx-auto">
            <SemanticSearch
              onSearch={handleSemanticSearch}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Search H1B jobs, titles, positions, roles..."
              className="w-full [&_input]:h-16 [&_input]:pl-12 [&_input]:pr-12 [&_input]:py-4 [&_input]:text-lg [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-300 [&_input]:bg-white [&_input]:shadow-md hover:[&_input]:shadow-lg [&_input]:transition-all [&_input]:duration-200 focus:[&_input]:border-emerald-500 focus:[&_input]:ring-2 focus:[&_input]:ring-emerald-500/20"
              showSemanticToggle={false}
            />
          </div>
        </div>

        {/* Popular Jobs */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Popular H1B jobs</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {loading ? (
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 min-h-[44px] bg-white/60 rounded-full animate-pulse"
                    style={{ width: `${100 + i * 15}px` }}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop: Show 5 popular jobs */}
                <div className="hidden sm:flex flex-wrap justify-center gap-3">
                  {(heroData?.topJobs || []).slice(0, 5).map((job, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(job)}
                      className="px-4 py-3 min-h-[44px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-sm font-medium border border-emerald-100"
                    >
                      {job.displayText || job.text}
                      <span className="ml-2 text-xs text-gray-500">
                        {job.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Mobile: Show 3 popular jobs */}
                <div className="flex sm:hidden justify-center gap-2">
                  {(heroData?.topJobs || []).slice(0, 3).map((job, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(job)}
                      className="px-3 py-2.5 min-h-[40px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-xs font-medium border border-emerald-100"
                    >
                      {job.displayText || job.text}
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
                  {heroData?.stats.totalJobTitles.toLocaleString()}+
                </div>
                <div className="text-sm text-gray-600">Job Titles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round((heroData?.stats.avgSalary || 0) / 1000)}K
                </div>
                <div className="text-sm text-gray-600">Avg. Salary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round((heroData?.stats.salaryRange.min || 0) / 1000)}K - ${Math.round((heroData?.stats.salaryRange.max || 0) / 1000)}K
                </div>
                <div className="text-sm text-gray-600">Salary Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((heroData?.stats.totalPositions || 0) / 1000)}K+
                </div>
                <div className="text-sm text-gray-600">Total Positions</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
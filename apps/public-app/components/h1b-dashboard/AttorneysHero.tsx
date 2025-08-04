'use client';

import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp } from 'lucide-react';
import { FilterState } from './types';
import { SemanticSearch } from './SemanticSearch';

interface SearchSuggestion {
  text: string;
  displayText?: string;
  type: 'job_title' | 'employer' | 'location';
  count: number;
  category?: string;
}

interface AttorneysHeroProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

interface AttorneyStats {
  totalAttorneys: number;
  totalCases: number;
  avgSuccessRate: number;
  totalClients: number;
}

interface LawFirmStats {
  totalLawFirms: number;
  totalCases: number;
  avgSuccessRate: number;
  totalAttorneys: number;
}

interface AttorneyHeroData {
  topAttorneys?: (SearchSuggestion & { successRate?: number })[];
  topLawFirms?: (SearchSuggestion & { successRate?: number; attorneyCount?: number })[];
  stats: AttorneyStats | LawFirmStats;
}

export const AttorneysHero: React.FC<AttorneysHeroProps> = ({
  filters,
  setFilters,
  onSearch,
  onSuggestionSelect,
}) => {
  const [heroData, setHeroData] = useState<AttorneyHeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/h1b-data/hero-stats?type=law-firms');
        const data = await response.json();
        setHeroData(data);
      } catch (error) {
        console.error('Error fetching attorneys hero data:', error);
        // Fallback to default data if API fails
        setHeroData({
          topLawFirms: [
            { text: 'FRAGOMEN, DEL REY, BERNSEN & LOEWY, LLP', displayText: 'Fragomen', type: 'employer', count: 12400, successRate: 92 },
            { text: 'BERRY APPLEMAN & LEIDEN LLP', displayText: 'Berry Appleman', type: 'employer', count: 8900, successRate: 89 },
            { text: 'MORGAN, LEWIS & BOCKIUS LLP', displayText: 'Morgan Lewis', type: 'employer', count: 6700, successRate: 91 },
            { text: 'LATHAM & WATKINS LLP', displayText: 'Latham & Watkins', type: 'employer', count: 5200, successRate: 88 },
            { text: 'SEYFARTH SHAW LLP', displayText: 'Seyfarth Shaw', type: 'employer', count: 4800, successRate: 90 },
          ],
          stats: {
            totalLawFirms: 1250,
            totalCases: 450000,
            avgSuccessRate: 89,
            totalAttorneys: 8500,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const handleSemanticSearch = (query: string, options?: any) => {
    console.log('Attorneys hero search:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    console.log('Attorneys hero suggestion selected:', suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #d97706 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Legal Scale Pattern */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <g opacity="0.06" fill="#d97706">
            {/* Balanced Scales */}
            <circle cx="200" cy="200" r="15" />
            <rect x="185" y="195" width="30" height="10" rx="5" />
            <line x1="200" y1="185" x2="200" y2="230" stroke="#d97706" strokeWidth="3" />
            <line x1="180" y1="195" x2="220" y2="195" stroke="#d97706" strokeWidth="2" />
            
            <circle cx="800" cy="300" r="15" />
            <rect x="785" y="295" width="30" height="10" rx="5" />
            <line x1="800" y1="285" x2="800" y2="330" stroke="#d97706" strokeWidth="3" />
            <line x1="780" y1="295" x2="820" y2="295" stroke="#d97706" strokeWidth="2" />
            
            {/* Gavel */}
            <rect x="950" y="180" width="20" height="8" rx="4" />
            <rect x="955" y="175" width="10" height="18" rx="2" />
          </g>
        </svg>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-amber-100 rounded-xl mb-6">
            <Scale className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
            Find{' '}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-medium">
              H1B Immigration
            </span>
            <br />
            attorneys & law firms
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover top immigration attorneys, law firms, success rates, and legal services for H1B visa applications
          </p>
        </div>

        {/* Search Interface */}
        <div className="relative mb-8">
          <div className="w-full max-w-xl mx-auto">
            <SemanticSearch
              onSearch={handleSemanticSearch}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Search immigration attorneys, law firms, legal services..."
              className="w-full [&_input]:h-16 [&_input]:pl-12 [&_input]:pr-12 [&_input]:py-4 [&_input]:text-lg [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-300 [&_input]:bg-white [&_input]:shadow-md hover:[&_input]:shadow-lg [&_input]:transition-all [&_input]:duration-200 focus:[&_input]:border-amber-500 focus:[&_input]:ring-2 focus:[&_input]:ring-amber-500/20"
              showSemanticToggle={false}
            />
          </div>
        </div>

        {/* Top Law Firms */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Top immigration law firms</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {loading ? (
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 min-h-[44px] bg-white/60 rounded-full animate-pulse"
                    style={{ width: `${120 + i * 10}px` }}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop: Show 5 top law firms */}
                <div className="hidden sm:flex flex-wrap justify-center gap-3">
                  {(heroData?.topLawFirms || []).slice(0, 5).map((firm, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(firm)}
                      className="px-4 py-3 min-h-[44px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-sm font-medium border border-amber-100"
                    >
                      {firm.displayText || firm.text}
                      <span className="ml-2 text-xs text-gray-500">
                        {firm.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Mobile: Show 3 top law firms */}
                <div className="flex sm:hidden justify-center gap-2">
                  {(heroData?.topLawFirms || []).slice(0, 3).map((firm, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(firm)}
                      className="px-3 py-2.5 min-h-[40px] bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-md active:bg-gray-50 transition-all duration-200 text-xs font-medium border border-amber-100"
                    >
                      {firm.displayText || firm.text}
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
                  {heroData && ('totalLawFirms' in heroData.stats) 
                    ? heroData.stats.totalLawFirms.toLocaleString()
                    : heroData?.stats.totalAttorneys?.toLocaleString() || '0'
                  }+
                </div>
                <div className="text-sm text-gray-600">
                  {heroData && ('totalLawFirms' in heroData.stats) ? 'Law Firms' : 'Attorneys'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((heroData?.stats.totalCases || 0) / 1000)}K+
                </div>
                <div className="text-sm text-gray-600">Cases Handled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {heroData?.stats.avgSuccessRate}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {heroData && ('totalLawFirms' in heroData.stats) 
                    ? heroData.stats.totalAttorneys.toLocaleString()
                    : ((heroData?.stats as AttorneyStats)?.totalClients?.toLocaleString() || '0')
                  }+
                </div>
                <div className="text-sm text-gray-600">
                  {heroData && ('totalLawFirms' in heroData.stats) ? 'Attorneys' : 'Clients Served'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
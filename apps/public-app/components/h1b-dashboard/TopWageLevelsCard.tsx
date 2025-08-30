'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { TrendingUp, CheckCircle2, Shield, Target, AlertTriangle } from 'lucide-react';
import { H1BWageLevelData, H1BWageLevelAnalysis } from '@/lib/types';

interface TopWageLevelsCardProps {
  filters?: {
    fiscalYears?: string[];
    states?: string[];
    salaryRange?: [number, number];
    jobCategories?: string[];
  };
  loading?: boolean;
}

// Helper function to get wage level icon and color
const getWageLevelStyling = (level: string, certificationRate: number) => {
  const baseColors = {
    'IV': { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200', 
      text: 'text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    'III': { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-800',
      icon: TrendingUp,
      iconColor: 'text-blue-600',
    },
    'II': { 
      bg: 'bg-amber-50', 
      border: 'border-amber-200', 
      text: 'text-amber-800',
      icon: Target,
      iconColor: 'text-amber-600',
    },
    'I': { 
      bg: 'bg-slate-50', 
      border: 'border-slate-200', 
      text: 'text-slate-800',
      icon: Shield,
      iconColor: 'text-slate-600',
    },
  };
  
  return baseColors[level as keyof typeof baseColors] || {
    bg: 'bg-gray-50',
    border: 'border-gray-200', 
    text: 'text-gray-800',
    icon: AlertTriangle,
    iconColor: 'text-gray-600',
  };
};

// Helper function to format salary
const formatSalary = (amount: number): string => {
  if (!amount || amount === 0) {return '$0';}
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
};

// Helper function to get success rate color
const getSuccessRateColor = (rate: number): string => {
  if (rate >= 90) {return 'text-emerald-600';}
  if (rate >= 85) {return 'text-blue-600';}
  if (rate >= 80) {return 'text-amber-600';}
  return 'text-slate-600';
};

export function TopWageLevelsCard({ filters, loading }: TopWageLevelsCardProps) {
  const router = useRouter();
  const [wageLevelData, setWageLevelData] = useState<H1BWageLevelAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWageLevelData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters?.fiscalYears?.length) {
          params.append('fiscalYears', filters.fiscalYears.join(','));
        }
        
        if (filters?.states?.length) {
          params.append('states', filters.states.join(','));
        }
        
        if (filters?.salaryRange) {
          params.append('salaryRange', filters.salaryRange.join(','));
        }
        
        if (filters?.jobCategories?.length) {
          params.append('jobCategories', filters.jobCategories.join(','));
        }
        
        console.log('Fetching wage level data with params:', params.toString());
        
        const response = await fetch(`/api/h1b-data/wage-levels?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        
        if (apiResponse.error) {
          throw new Error(apiResponse.error.message || 'API error occurred');
        }
        
        setWageLevelData(apiResponse.data);
        
      } catch (err) {
        console.error('Error fetching wage level data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWageLevelData();
  }, [filters]);

  const handleWageLevelClick = (level: string) => {
    // Navigate to detailed wage level analysis page (future enhancement)
    console.log(`Navigate to wage level ${level} analysis`);
    // router.push(`/h1b-dashboard/wage-level/${level}`);
  };

  if (isLoading || loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Wage Levels by Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Wage Levels by Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground text-center">
              <p>Failed to load wage level data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wageLevelData || !wageLevelData.wageLevels.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Wage Levels by Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No wage level data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by wage level order (IV, III, II, I) - always show in this order
  const levelOrder = ['IV', 'III', 'II', 'I'];
  const topWageLevels = wageLevelData.wageLevels
    .filter(level => level.level !== 'Not Specified')
    .sort((a, b) => {
      const aIndex = levelOrder.indexOf(a.level);
      const bIndex = levelOrder.indexOf(b.level);
      return aIndex - bIndex;
    })
    .slice(0, 4);

  const maxApplications = Math.max(...topWageLevels.map(level => level.totalApplications));

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          Top Wage Levels by Success Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topWageLevels.map((levelData, index) => {
          const progressWidth = (levelData.totalApplications / maxApplications) * 100;
          const styling = getWageLevelStyling(levelData.level, levelData.certificationRate);
          const LevelIcon = styling.icon;
          
          return (
            <div
              key={levelData.level}
              className="group relative p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
              onClick={() => handleWageLevelClick(levelData.level)}
            >
              {/* Progress bar background */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-lg opacity-40"
                style={{ width: `${progressWidth}%` }}
              />
              
              {/* Content */}
              <div className="relative flex items-center justify-between">
                {/* Left side: level badge and details */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  {/* Level badge */}
                  <div className={`flex-shrink-0 px-2 py-1 rounded-md border ${styling.bg} ${styling.border} ${styling.text} font-medium text-sm flex items-center gap-1`}>
                    <LevelIcon className={`w-3 h-3 ${styling.iconColor}`} />
                    Level {levelData.level}
                  </div>
                  
                  {/* Level details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                      {levelData.friendlyName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {levelData.totalApplications.toLocaleString()} applications
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {levelData.marketShare.toFixed(1)}% market share
                      </span>
                      {levelData.salaryPremium > 0 && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-emerald-600">
                            +{formatSalary(levelData.salaryPremium)} premium
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right side: Success rate */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-bold ${getSuccessRateColor(levelData.certificationRate)}`}>
                    {levelData.certificationRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">success rate</div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
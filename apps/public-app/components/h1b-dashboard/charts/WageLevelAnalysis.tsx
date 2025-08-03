'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { getChartColor, CHART_COLOR_ARRAYS } from '../../../lib/chartColors';
import WageInsightSummary from '../insights/WageInsightSummary';
import { H1BJobAnalysis } from '../../../lib/types';

/**
 * Wage level data interface - reusable across different dashboards
 */
export interface WageLevelData {
  level: string;
  applications: number;
  avgActualWage: number;
  avgPrevailingWage: number;
  abovePrevailingCount: number;
  avgWagePremium: number;
}

/**
 * Props for the reusable wage level analysis component
 */
export interface WageLevelAnalysisProps {
  data: WageLevelData[];
  jobData?: H1BJobAnalysis; // Full job analysis data for comprehensive insights
  loading?: boolean;
  title?: string;
  showTitle?: boolean;
  className?: string;
  context?: 'job' | 'city' | 'attorney' | 'company';
}

/**
 * Format currency values
 */
const formatCurrency = (amount: number): string => {
  if (amount === 0) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Get wage level description and experience level with user-friendly language
 */
const getWageLevelInfo = (level: string): { 
  description: string; 
  experience: string; 
  friendlyExperience: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
} => {
  const normalized = level.trim().toUpperCase();
  
  // Handle both "I" and "Level I" formats
  if (normalized === 'I' || normalized === 'LEVEL I') {
    return {
      description: 'Entry Level',
      experience: '10th percentile',
      friendlyExperience: 'Starting position (10th percentile)',
      icon: <Users className="w-4 h-4" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    };
  }
  if (normalized === 'II' || normalized === 'LEVEL II') {
    return {
      description: 'Qualified',
      experience: '25th percentile',
      friendlyExperience: 'Standard professional (25th percentile)',
      icon: <TrendingUp className="w-4 h-4" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    };
  }
  if (normalized === 'III' || normalized === 'LEVEL III') {
    return {
      description: 'Experienced',
      experience: '50th percentile',
      friendlyExperience: 'Mid-level specialist (50th percentile)',
      icon: <DollarSign className="w-4 h-4" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    };
  }
  if (normalized === 'IV' || normalized === 'LEVEL IV') {
    return {
      description: 'Senior Expert',
      experience: '75th percentile',
      friendlyExperience: 'Advanced professional (75th percentile)',
      icon: <Award className="w-4 h-4" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    };
  }
  
  return {
    description: 'Professional',
    experience: 'Level not specified',
    friendlyExperience: 'Professional level',
    icon: <Users className="w-4 h-4" />,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
  };
};

/**
 * Calculate percentage above prevailing wage
 */
const calculateAbovePrevailingPercentage = (abovePrevailingCount: number, totalApplications: number): number => {
  if (totalApplications === 0) {
    return 0;
  }
  return Math.round((abovePrevailingCount / totalApplications) * 100);
};

/**
 * Enhanced loading skeleton component with better visual hierarchy
 */
const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-4 sm:p-6 bg-muted/10 rounded-xl animate-pulse">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted/40 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-5 bg-muted/40 rounded w-24"></div>
              <div className="h-3 bg-muted/30 rounded w-32"></div>
              <div className="h-3 bg-muted/30 rounded w-20"></div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-3 bg-muted/30 rounded w-16"></div>
            <div className="h-6 bg-muted/40 rounded w-12"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-2 bg-muted/30 rounded-full"></div>
          <div className="h-2 bg-muted/30 rounded-full w-4/5"></div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Get wage competitiveness status for visual indicators
 */
const getWageCompetitivenessStatus = (wageGapPercentage: number): {
  level: 'excellent' | 'good' | 'fair' | 'below';
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} => {
  if (wageGapPercentage >= 10) {
    return {
      level: 'excellent',
      label: 'Excellent',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
    };
  } else if (wageGapPercentage >= 3) {
    return {
      level: 'good',
      label: 'Competitive',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
    };
  } else if (wageGapPercentage >= -3) {
    return {
      level: 'fair',
      label: 'Market Rate',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
    };
  } else {
    return {
      level: 'below',
      label: 'Below Market',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
    };
  }
};

/**
 * Individual wage level card component - Enhanced UX design with better hierarchy
 */
const WageLevelCard: React.FC<{
  levelData: WageLevelData;
  index: number;
  totalApplications: number;
}> = ({ levelData, index, totalApplications }) => {
  const levelInfo = getWageLevelInfo(levelData.level);
  const percentage = totalApplications > 0 ? Math.round((levelData.applications / totalApplications) * 100) : 0;
  const abovePrevailingPercentage = calculateAbovePrevailingPercentage(
    levelData.abovePrevailingCount,
    levelData.applications,
  );
  
  const isPositivePremium = levelData.avgWagePremium > 0;
  const hasValidWageData = levelData.avgActualWage > 0 && levelData.avgPrevailingWage > 0;
  const wageDifference = levelData.avgActualWage - levelData.avgPrevailingWage;
  const wageGapPercentage = levelData.avgPrevailingWage > 0 ? 
    Math.round((wageDifference / levelData.avgPrevailingWage) * 100) : 0;
  
  const competitivenessStatus = getWageCompetitivenessStatus(wageGapPercentage);

  return (
    <div 
      className="group p-4 sm:p-6 bg-card border border-border rounded-xl hover:shadow-lg hover:border-border/70 transition-all duration-300"
      role="article"
      aria-labelledby={`wage-level-${levelData.level.replace(/\s+/g, '-').toLowerCase()}`}
      tabIndex={0}
    >
      {/* Hero Metric - Wage Premium Percentage (Top Priority) */}
      {hasValidWageData && (
        <div className="mb-6">
          <div className={`text-center p-4 rounded-xl border ${competitivenessStatus.bgColor} ${competitivenessStatus.borderColor}`}>
            <div className="text-3xl font-bold text-foreground mb-1">
              {wageGapPercentage > 0 ? '+' : ''}{wageGapPercentage}%
            </div>
            <div className={`text-sm font-semibold mb-1 ${competitivenessStatus.textColor}`}>
              {competitivenessStatus.label}
            </div>
            <div className="text-xs text-muted-foreground">
              vs. prevailing wage
            </div>
          </div>
        </div>
      )}

      {/* Level Information Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div 
            className={`p-3 rounded-xl flex-shrink-0 shadow-sm ring-1 ring-black/5 ${levelInfo.bgColor}`}
          >
            <div className={levelInfo.textColor}>
              {levelInfo.icon}
            </div>
          </div>
          <div className="min-w-0">
            <h3 
              id={`wage-level-${levelData.level.replace(/\s+/g, '-').toLowerCase()}`}
              className="text-lg sm:text-xl font-semibold text-foreground tracking-tight"
            >
              {levelData.level.length <= 3 ? `Level ${levelData.level}` : levelData.level}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {levelInfo.friendlyExperience}
            </p>
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Applications
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatNumber(levelData.applications)} ({percentage}%)
              </span>
            </div>
          </div>
        </div>
        
        {/* Secondary Metric - Above Prevailing Percentage */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Above Prevailing
          </div>
          <div className="text-xl font-bold text-foreground">
            {abovePrevailingPercentage}%
          </div>
        </div>
      </div>

      {/* Simplified Wage Details - Supporting Information */}
      {hasValidWageData && (
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Salary Details
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Actual Salary</span>
              <span className="text-base font-semibold text-foreground">
                {formatCurrency(levelData.avgActualWage)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Government Standard</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(levelData.avgPrevailingWage)}
              </span>
            </div>
            
            {levelData.avgWagePremium !== 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-border/30">
                <span className="text-sm font-medium text-muted-foreground">Premium</span>
                <span className={`text-base font-bold ${isPositivePremium ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositivePremium ? '+' : ''}{formatCurrency(Math.abs(levelData.avgWagePremium))}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen reader friendly descriptions */}
      <div className="sr-only">
        {levelInfo.description} level position ({levelData.level}) with {formatNumber(levelData.applications)} applications, 
        representing {percentage}% of total. 
        {hasValidWageData && `Salary is ${wageGapPercentage > 0 ? wageGapPercentage + '% above' : Math.abs(wageGapPercentage) + '% below'} 
        government prevailing wage. Average salary: ${formatCurrency(levelData.avgActualWage)}, 
        government standard: ${formatCurrency(levelData.avgPrevailingWage)}. 
        Status: ${competitivenessStatus.label}.`}
      </div>
    </div>
  );
};

/**
 * Enhanced career progression insights component with better visual hierarchy
 */
const CareerProgressionInsights: React.FC<{ data: WageLevelData[] }> = ({ data }) => {
  // Since data is already filtered to Level I-IV only, we can use it directly
  const validLevels = data.filter(d => d.avgActualWage > 0);
  
  if (validLevels.length < 2) {
    return null;
  }

  const entryLevel = validLevels.find(d => d.level.toUpperCase() === 'I' || d.level.toUpperCase() === 'LEVEL I');
  const seniorLevel = validLevels.find(d => d.level.toUpperCase() === 'IV' || d.level.toUpperCase() === 'LEVEL IV') || validLevels[validLevels.length - 1];
  
  if (!entryLevel || !seniorLevel) {
    return null;
  }

  const formatLevelDisplay = (level: string) => {
    return level.length <= 3 ? `Level ${level}` : level;
  };
  
  const insights = [
    {
      label: `Entry Level (${formatLevelDisplay(entryLevel.level)})`,
      value: entryLevel.avgActualWage,
      applications: entryLevel.applications,
    },
    {
      label: `Senior Level (${formatLevelDisplay(seniorLevel.level)})`,
      value: seniorLevel.avgActualWage,
      applications: seniorLevel.applications,
    },
  ];

  const salaryGrowth = insights[1].value - insights[0].value;
  const growthPercentage = insights[0].value > 0 ? Math.round((salaryGrowth / insights[0].value) * 100) : 0;

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 via-green-500/5 to-blue-500/5 rounded-2xl border border-primary/10 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-xl">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-foreground">Career Progression Path</h4>
          <p className="text-xs text-muted-foreground">Potential salary growth across experience levels</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {insights.map((insight, index) => (
          <div key={index} className="relative">
            <div className="p-4 bg-background/60 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {insight.label}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {formatCurrency(insight.value)}
              </div>
              <div className="text-xs text-muted-foreground">
                {insight.applications.toLocaleString()} applications
              </div>
            </div>
            {index === 0 && (
              <div className="hidden sm:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                <div className="w-6 h-0.5 bg-primary/30" />
                <div className="w-3 h-3 bg-primary/20 rounded-full absolute -top-1 right-0" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {salaryGrowth > 0 && (
        <div className="pt-6 border-t border-border/30">
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Total Career Growth Potential
            </div>
            <div className="text-xl font-bold text-green-700 mb-1">
              +{formatCurrency(salaryGrowth)}
            </div>
            <div className="text-sm font-semibold text-green-600">
              {growthPercentage}% salary increase
            </div>
            <div className="text-xs text-green-600/80 mt-1">
              From entry to senior level position
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main reusable wage level analysis component
 */
const WageLevelAnalysis: React.FC<WageLevelAnalysisProps> = ({
  data,
  jobData,
  loading = false,
  title = 'Prevailing Wage Level Analysis',
  showTitle = true,
  className = '',
  context = 'job',
}) => {
  
  // Filter and sort data - ensure Level I comes first, exclude "Not Specified"
  const processedData = useMemo(() => {
    console.log('WageLevelAnalysis - Raw data received:', data);
    
    if (!data || data.length === 0) {
      console.log('WageLevelAnalysis - No data provided');
      return [];
    }
    
    // Helper function to check if a level is valid (Level I-IV only)
    const isValidLevel = (level: string): boolean => {
      if (!level) {
        return false;
      }
      
      const normalized = level.trim().toUpperCase();
      // Check for both formats: "Level I" or just "I"
      return normalized === 'I' || normalized === 'II' || 
             normalized === 'III' || normalized === 'IV' ||
             normalized === 'LEVEL I' || normalized === 'LEVEL II' || 
             normalized === 'LEVEL III' || normalized === 'LEVEL IV';
    };
    
    // Filter out "Not Specified" and other invalid levels, keep only applications > 0
    const filtered = data.filter(d => d.applications > 0 && isValidLevel(d.level));
    console.log('WageLevelAnalysis - Filtered data:', filtered);
    
    const sorted = filtered.sort((a, b) => {
      // Simplified sorting since we only have Level I-IV now
      const getLevelOrder = (level: string): number => {
        const normalized = level.trim().toUpperCase();
        
        // Handle both "I" and "Level I" formats
        if (normalized === 'I' || normalized === 'LEVEL I') {
          return 1;
        }
        if (normalized === 'II' || normalized === 'LEVEL II') {
          return 2;
        }
        if (normalized === 'III' || normalized === 'LEVEL III') {
          return 3;
        }
        if (normalized === 'IV' || normalized === 'LEVEL IV') {
          return 4;
        }
        
        return 5; // Fallback (shouldn't happen with our filtering)
      };
      
      return getLevelOrder(a.level) - getLevelOrder(b.level);
    });
    
    return sorted;
  }, [data]);

  const totalApplications = useMemo(() => {
    return processedData.reduce((sum, d) => sum + d.applications, 0);
  }, [processedData]);

  // Loading state
  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        {showTitle && (
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!processedData || processedData.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        {showTitle && (
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground text-sm">No wage level data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main component render - wage level analysis only (insights moved to JobDashboard)
  return (
    <section 
      className={`w-full ${className}`}
      role="region"
      aria-labelledby="wage-analysis-heading"
    >
      {/* Hidden heading for screen readers */}
      <h2 id="wage-analysis-heading" className="sr-only">
        {title} for job analysis
      </h2>
      
      {/* Wage Level Analysis - Direct display */}
      <Card className="w-full">
        {showTitle && (
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle 
              id="wage-level-breakdown-heading"
              className="text-base sm:text-lg font-semibold flex items-center"
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
              {title}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Government wage standards analysis by experience level
            </p>
          </CardHeader>
        )}
        <CardContent className="p-4 sm:p-6 pt-2">
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            role="group"
            aria-label="Wage level analysis cards"
          >
            {processedData.map((levelData, index) => (
              <WageLevelCard
                key={levelData.level}
                levelData={levelData}
                index={index}
                totalApplications={totalApplications}
              />
            ))}
          </div>
          
          <CareerProgressionInsights data={processedData} />
        </CardContent>
      </Card>
    </section>
  );
};

WageLevelAnalysis.displayName = 'WageLevelAnalysis';

export { WageLevelAnalysis };
export default WageLevelAnalysis;
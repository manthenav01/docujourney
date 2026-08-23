'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { DollarSign } from 'lucide-react';
import { getSalaryRangeColor } from '../../../lib/chartColors';

/**
 * Standard salary distribution data interface
 */
export interface SalaryDistributionData {
  range: string;
  count: number;
  percentage?: number;
  minSalary?: number;
  maxSalary?: number;
}

/**
 * Props for the reusable salary distribution component
 */
export interface ReusableSalaryDistributionProps {
  data: SalaryDistributionData[];
  loading?: boolean;
  title?: string;
  showTitle?: boolean;
  height?: number;
  className?: string;
}


/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format salary range labels responsively
 */
const formatSalaryLabel = (range: string, isMobile: boolean = false): string => {
  const labelMappings: { [key: string]: { mobile: string; desktop: string } } = {
    'Under $80K': { mobile: '<80K', desktop: '<80K' },
    '$80K - $120K': { mobile: '80-120K', desktop: '80-120K' },
    '$120K - $160K': { mobile: '120-160K', desktop: '120-160K' },
    '$160K - $200K': { mobile: '160-200K', desktop: '160-200K' },
    '$200K - $240K': { mobile: '200-240K', desktop: '200-240K' },
    '$240K - $280K': { mobile: '240-280K', desktop: '240-280K' },
    '$280K - $320K': { mobile: '280-320K', desktop: '280-320K' },
    '$320K+': { mobile: '320K+', desktop: '320K+' },
  };

  const mapping = labelMappings[range];
  if (mapping) {
    return isMobile ? mapping.mobile : mapping.desktop;
  }
  
  // Fallback for any unrecognized ranges
  return range.replace(/\$|Under |Over /, '').replace(' - ', '-');
};

/**
 * Process raw salary data into standardized format
 */
const processSalaryData = (data: SalaryDistributionData[]): SalaryDistributionData[] => {
  if (!data || data.length === 0) {
    return [];
  }

  // Canonical bucket order — the API already emits exactly these labels.
  // (The previous keyword-substring matching double-counted buckets:
  // "Under $80K" contains "80" so it also landed in "$80K - $120K", which is
  // how bucket percentages once summed to 245%.)
  const standardRanges = [
    'Under $80K',
    '$80K - $120K',
    '$120K - $160K',
    '$160K - $200K',
    '$200K - $240K',
    '$240K - $280K',
    '$280K - $320K',
    '$320K+',
  ];

  const byRange = new Map<string, number>();
  data.forEach(item => {
    const key = item.range.trim();
    byRange.set(key, (byRange.get(key) || 0) + item.count);
  });

  const filteredData = standardRanges
    .filter(range => (byRange.get(range) || 0) > 0)
    .map(range => ({ range, count: byRange.get(range) as number, percentage: 0 }));

  // Never silently drop a bucket the API sent that we don't recognize —
  // append it after the canonical ranges instead.
  byRange.forEach((count, range) => {
    if (count > 0 && !standardRanges.includes(range)) {
      filteredData.push({ range, count, percentage: 0 });
    }
  });

  // Percentages are always recomputed from the bucket counts so they sum to 100
  const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
  if (totalCount > 0) {
    filteredData.forEach(item => {
      item.percentage = (item.count / totalCount) * 100;
    });
  }

  return filteredData;
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="w-full animate-pulse" style={{ height }}>
    <div className="h-full bg-gradient-to-b from-muted/20 to-muted/10 rounded-lg flex items-end justify-between p-4 space-x-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-muted/40 rounded-t flex-1"
          style={{
            height: `${Math.random() * 60 + 20}%`,
            maxWidth: '18%',
          }}
        />
      ))}
    </div>
  </div>
);

/**
 * Bar chart visualization component
 */
const BarChartVisualization: React.FC<{
  data: SalaryDistributionData[];
}> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-3 p-2">
      {data.map((item, index) => {
        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const displayPercentage = item.percentage || 0;
        
        return (
          <div key={item.range} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground text-sm">{item.range}</span>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  {formatNumber(item.count)} ({displayPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: getSalaryRangeColor(index),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Main reusable salary distribution component
 */
const ReusableSalaryDistribution: React.FC<ReusableSalaryDistributionProps> = ({
  data,
  loading = false,
  title = 'Salary Distribution',
  showTitle = true,
  height = 350,
  className = '',
}) => {

  // Process and memoize the salary data
  const processedData = useMemo(() => processSalaryData(data), [data]);

  // Loading state
  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        {showTitle && (
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <LoadingSkeleton height={height} />
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
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground text-sm">No salary data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main component render
  return (
    <Card className={`w-full ${className}`}>
      {showTitle && (
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4 pt-2">
        <BarChartVisualization data={processedData} />
        {/* Label the base explicitly: buckets cover certified filings with
            valid salary data, which is smaller than total applications */}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Based on {formatNumber(processedData.reduce((sum, d) => sum + d.count, 0))} certified filings with valid salary data
        </p>
      </CardContent>
    </Card>
  );
};

ReusableSalaryDistribution.displayName = 'ReusableSalaryDistribution';

export { ReusableSalaryDistribution };
export default ReusableSalaryDistribution;
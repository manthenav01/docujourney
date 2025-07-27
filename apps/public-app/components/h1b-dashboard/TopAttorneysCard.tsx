'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { 
  Scale, 
} from 'lucide-react';
import { H1BAttorney } from '../../lib/types';

interface TopAttorneysCardProps {
  data: H1BAttorney[];
  loading?: boolean;
}

const TopAttorneysCardComponent: React.FC<TopAttorneysCardProps> = ({ 
  data, 
  loading = false,
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };


  // Memoize processed data to prevent recalculation on every render
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { topAttorneys: [], totalCases: 0 };
    }
    
    // Sort attorneys by a combination of certification rate and volume for better ranking
    const sortedAttorneys = [...data].sort((a, b) => {
      // Weighted score: 70% certification rate, 30% volume (normalized)
      const maxApplications = Math.max(...data.map(attorney => attorney.totalApplications));
      const aScore = (a.certificationRate * 0.7) + ((a.totalApplications / maxApplications) * 30);
      const bScore = (b.certificationRate * 0.7) + ((b.totalApplications / maxApplications) * 30);
      return bScore - aScore;
    });
    
    const topAttorneys = sortedAttorneys.slice(0, 5);
    const totalCases = topAttorneys.reduce((sum, attorney) => sum + attorney.totalApplications, 0);
    
    return { topAttorneys, totalCases };
  }, [data]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
          <Scale className="w-5 h-5 mr-2" />
          Top H1B Attorneys
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded w-48"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
          <Scale className="w-5 h-5 mr-2" />
          Top H1B Attorneys
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No attorney data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Scale className="w-5 h-5 mr-2" />
          Top H1B Attorneys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {processedData.topAttorneys.map((attorney, index) => {
          return (
            <div 
              key={`${attorney.attorneyName}-${attorney.lawFirm}`}
              className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200"
            >
              {/* Content */}
              <div className="flex items-center justify-between">
                {/* Left side: Rank and attorney info */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {attorney.attorneyName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {attorney.lawFirm}
                      </span>
                      <span className="text-xs text-muted-foreground/60">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(attorney.totalApplications)} cases
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right side: Success rate */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-primary">
                    {attorney.certificationRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">success rate</div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Summary footer */}
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Showing top 5 attorneys</span>
            <span>
              {processedData.totalCases.toLocaleString()} total cases
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

TopAttorneysCardComponent.displayName = 'TopAttorneysCard';

export const TopAttorneysCard = React.memo(TopAttorneysCardComponent);
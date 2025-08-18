'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { createAttorneySlug } from '@docujourney/utils';
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
      <CardContent>
        <div className="space-y-2">
          {processedData.topAttorneys.map((attorney, index) => {
            const attorneySlug = createAttorneySlug(attorney.attorneyName);
            return (
              <Link
                key={`${attorney.attorneyName}-${attorney.lawFirm}`}
                href={`/h1b-dashboard/attorney/${attorneySlug}?name=${encodeURIComponent(attorney.attorneyName)}&firm=${encodeURIComponent(attorney.lawFirm)}`}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{attorney.attorneyName}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {attorney.lawFirm}
                      </span>
                      <span className="text-sm text-muted-foreground/60">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(attorney.totalApplications)} cases
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    {attorney.certificationRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">success rate</div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

TopAttorneysCardComponent.displayName = 'TopAttorneysCard';

export const TopAttorneysCard = React.memo(TopAttorneysCardComponent);
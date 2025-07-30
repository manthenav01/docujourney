'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';

interface MobileOptimizedChartProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  showTitle?: boolean;
  headerContent?: React.ReactNode;
}

export const MobileOptimizedChart: React.FC<MobileOptimizedChartProps> = ({
  title,
  children,
  className = '',
  showTitle = true,
  headerContent,
}) => {
  if (title && showTitle) {
    return (
      <Card className={`w-full chart-card ${className}`}>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            {headerContent}
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2 sm:px-6 sm:pb-6" data-chart-container>
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full ${className}`} data-chart-container>
      {children}
    </div>
  );
};
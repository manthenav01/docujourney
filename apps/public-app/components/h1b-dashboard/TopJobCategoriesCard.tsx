'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

interface JobCategoryData {
  jobCategory: string
  applications: number
  percentage: number
  certificationRate: number
  yoyGrowth?: number | null
  yoyGrowthPercentage?: number | null
}

interface TopJobCategoriesCardProps {
  data: JobCategoryData[]
  loading?: boolean
  showYoYGrowth?: boolean
  title?: string
  maxItems?: number
}

const TopJobCategoriesCardComponent: React.FC<TopJobCategoriesCardProps> = ({ 
  data, 
  loading, 
  showYoYGrowth = false,
  title = 'Top Job Categories',
  maxItems = 6,
}) => {
  // Memoize processed data to prevent recalculation on every render
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { topCategories: [], totalApplications: 0 };
    }
    
    const topCategories = data.slice(0, maxItems);
    const totalApplications = topCategories.reduce((sum, item) => sum + item.applications, 0);
    
    return { topCategories, totalApplications };
  }, [data, maxItems]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(maxItems)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                </div>
                <div className="h-4 bg-muted rounded w-12"></div>
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
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No job category data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {processedData.topCategories.map((category, index) => (
            <div key={category.jobCategory} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{category.jobCategory}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {category.applications.toLocaleString()} applications • {category.certificationRate.toFixed(1)}% success
                    </span>
                    {showYoYGrowth && category.yoyGrowth !== null && category.yoyGrowth !== undefined && category.yoyGrowthPercentage !== null && category.yoyGrowthPercentage !== undefined && (
                      <>
                        <span className="text-sm text-muted-foreground/60">•</span>
                        <div className="flex items-center gap-1">
                          {category.yoyGrowth >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span className={`text-xs font-medium ${
                            category.yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {category.yoyGrowth >= 0 ? '+' : ''}{category.yoyGrowth.toLocaleString()} 
                            ({category.yoyGrowthPercentage >= 0 ? '+' : ''}{category.yoyGrowthPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">
                  {category.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">of total</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

TopJobCategoriesCardComponent.displayName = 'TopJobCategoriesCard';

export const TopJobCategoriesCard = React.memo(TopJobCategoriesCardComponent);
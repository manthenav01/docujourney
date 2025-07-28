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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(maxItems)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedData.topCategories.map((category, index) => (
            <div key={category.jobCategory} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 bg-chart-3 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">{category.jobCategory}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {category.applications} cases • {category.certificationRate.toFixed(1)}% success
                    </p>
                    {showYoYGrowth && category.yoyGrowth !== null && category.yoyGrowthPercentage !== null && (
                      <>
                        <span className="text-xs text-muted-foreground/60">•</span>
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
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-foreground">
                  {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary footer */}
        <div className="pt-4 border-t border-border mt-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Showing top {maxItems} job categories</span>
            <span>
              {processedData.totalApplications.toLocaleString()} total applications
            </span>
          </div>
          {!showYoYGrowth && (
            <div className="mt-2 p-2 bg-muted/10 rounded-lg border border-dashed border-muted">
              <div className="text-xs text-muted-foreground text-center">
                💡 YoY growth data requires historical job category analytics by year
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

TopJobCategoriesCardComponent.displayName = 'TopJobCategoriesCard';

export const TopJobCategoriesCard = React.memo(TopJobCategoriesCardComponent);
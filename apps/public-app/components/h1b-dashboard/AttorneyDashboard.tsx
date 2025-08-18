'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getChartColor, getSalaryRangeColor } from '../../lib/chartColors';
import { ReusableProgressChart, type ProgressChartData } from './charts';
import { ReusableSalaryDistribution } from './charts/ReusableSalaryDistribution';
import { H1BAttorneyAnalysis, H1BApiResponse } from '../../lib/types';
import { BigQueryErrorBoundary } from './ErrorBoundary';
import { MarketTrendsCard } from './MarketTrendsCard';
import { TopJobCategoriesCard } from './TopJobCategoriesCard';
import { 
  Scale, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  BarChart3,
  Award,
  Target,
  Briefcase,
  Globe,
  PieChart,
  LineChart,
  Star,
  CheckCircle,
  Building2,
  Gavel,
  FileText,
} from 'lucide-react';
import { METRIC_CONFIGS } from '../../lib/metricCardConfig';
import { ApplicationsCard, SalaryCard, ApprovalRateCard, EmployersCard } from './StatsCard';
import { getFullStateName } from '@/lib/utils/stateUtils';

// Use the standardized H1BAttorneyAnalysis type
type AttorneyInfo = H1BAttorneyAnalysis;

interface AttorneyDashboardProps {
  attorneySlug: string;
  attorneyName: string;
  lawFirm: string;
}

export const AttorneyDashboard: React.FC<AttorneyDashboardProps> = ({
  attorneySlug,
  attorneyName,
  lawFirm,
}) => {
  const [attorneyInfo, setAttorneyInfo] = useState<AttorneyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttorneyInfo();
  }, [attorneyName, lawFirm]);

  const fetchAttorneyInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('name', attorneyName);
      if (lawFirm && lawFirm !== 'Unknown Firm') {
        params.append('firm', lawFirm);
      }
      
      const response = await fetch(`/api/h1b-data/attorney?${params.toString()}`);
      const apiResponse: H1BApiResponse<H1BAttorneyAnalysis> = await response.json();
      
      if (response.ok && apiResponse.data) {
        setAttorneyInfo(apiResponse.data);
        console.log('Attorney data loaded successfully:', {
          queryTime: apiResponse.metadata?.queryTime,
          source: apiResponse.metadata?.source,
        });
      } else {
        const errorMessage = apiResponse.error?.message || `Server responded with ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load attorney information';
      setError(errorMessage);
      console.error('Error fetching attorney info:', {
        error: err,
        attorneyName,
        lawFirm,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleBackClick = () => {
    // Navigate back to the main dashboard or search
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to main dashboard
      window.location.href = '/h1b-dashboard';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="mb-6">
          {/* Header Skeleton */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-muted/30 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
            </div>
            <div className="ml-auto">
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-muted/30 rounded-lg animate-pulse">
                    <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-24 animate-pulse mb-1"></div>
                <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-36 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading indicator */}
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Loading attorney data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 p-4 bg-destructive/10 rounded-full">
              <Scale className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Attorney Data Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <div className="space-y-2">
              <Button onClick={fetchAttorneyInfo} className="w-full">
                Try Again
              </Button>
              <Button 
                onClick={handleBackClick}
                variant="outline" 
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attorneyInfo) {
    return null;
  }

  // Calculate derived values
  const certificationRate = attorneyInfo.certificationRate || 0;
  const hasFinancialData = attorneyInfo.avgSalary > 0;
  const hasTrendData = attorneyInfo.yearlyTrends.length > 0;

  return (
    <BigQueryErrorBoundary context="Attorney Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    {/* Header */}
    <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl flex-shrink-0">
              <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">{attorneyName}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">{attorneyInfo.lawFirm}</span>
                </div>
                {attorneyInfo.city && attorneyInfo.state && (
                  <div className="flex items-center gap-1">
                    <span className="hidden sm:inline">•</span>
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{attorneyInfo.city}, {attorneyInfo.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ApplicationsCard value={attorneyInfo.totalApplications} />
        <ApprovalRateCard value={certificationRate} />
        <SalaryCard value={hasFinancialData ? attorneyInfo.avgSalary : 0} />
        <EmployersCard value={attorneyInfo.uniqueEmployers} />
      </div>

      {/* Row 1: Market Intelligence - Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employers - LEFT (Primary Context) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Top Employers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attorneyInfo.topEmployers.slice(0, 5).map((employer, index) => (
                <div key={employer.employer} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground truncate">{employer.employer}</h4>
                      <p className="text-sm text-muted-foreground">
                        {employer.applications} cases ({employer.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-success">
                      {employer.certificationRate.toFixed(1)}% success
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(employer.avgSalary)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top States - RIGHT (Geographic Context) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Top States</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attorneyInfo.topStates.slice(0, 5).map((state, index) => (
                <div key={state.state} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-chart-2 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground">{getFullStateName(state.state)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {state.applications} cases ({state.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(state.avgSalary)}
                    </p>
                    <p className="text-xs text-muted-foreground">avg salary</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialized Analysis - Full Width */}
      <TopJobCategoriesCard
        data={attorneyInfo.topJobCategories.map(category => ({
          jobCategory: category.jobCategory,
          applications: category.applications,
          percentage: category.percentage,
          certificationRate: category.certificationRate,
          yoyGrowth: category.yoyGrowth,
          yoyGrowthPercentage: category.yoyGrowthPercentage,
        }))}
        showYoYGrowth={true}
        maxItems={6}
      />

      {/* Row 2: Deep Analysis - Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trends - LEFT (Temporal Analysis) */}
        {hasTrendData && (
          <MarketTrendsCard
            data={attorneyInfo.yearlyTrends}
            title="Yearly Performance Trends"
            showSalary={true}
            showCertificationRate={true}
            maxYears={5}
          />
        )}

        {/* Salary Distribution - RIGHT (Always Consistent Position) */}
        {attorneyInfo.salaryDistribution && attorneyInfo.salaryDistribution.length > 0 && (
          <ReusableSalaryDistribution
            data={attorneyInfo.salaryDistribution}
            loading={false}
            title={`Salary Distribution`}
            showTitle={true}
            height={400}
          />
        )}
      </div>
      </div>
    </BigQueryErrorBoundary>
  );
};
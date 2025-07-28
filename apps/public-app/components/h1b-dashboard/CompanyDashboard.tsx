'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getChartColor, getSalaryRangeColor } from '../../lib/chartColors';
import { ReusableProgressChart, ReusableActivityChart, type ProgressChartData, type ActivityChartData } from './charts';
import { ReusableSalaryDistribution } from './charts/ReusableSalaryDistribution';
import { MarketTrendsCard } from './MarketTrendsCard';
import { TopJobTitlesCard } from './TopJobTitlesCard';
import { H1BCompanyAnalysis } from '../../lib/types';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  DollarSign,
  BarChart3,
  Award,
  Target,
  Briefcase,
  Globe,
  Activity,
  PieChart,
  LineChart,
  Star,
  CheckCircle,
} from 'lucide-react';

// Use the standardized H1BCompanyAnalysis type
type CompanyInfo = H1BCompanyAnalysis;

interface CompanyDashboardProps {
  companySlug: string;
  companyName: string;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  companySlug,
  companyName,
}) => {
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyInfo();
  }, [companyName]);

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/h1b-data/company?name=${encodeURIComponent(companyName)}`);
      
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.error) {
          throw new Error(apiResponse.error.message || 'API error occurred');
        }
        if (!apiResponse.data) {
          throw new Error('No data received from API');
        }
        setCompanyInfo(apiResponse.data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load company information';
      setError(errorMessage);
      console.error('Error fetching company info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/h1b-dashboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <Button 
            onClick={handleBackClick}
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
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
          <p className="text-muted-foreground text-sm">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button 
            onClick={handleBackClick}
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
           <Card className="bg-destructive/10 border border-destructive/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-destructive text-lg font-semibold mb-2">Unable to Load Company Data</div>
            <div className="text-destructive">{error}</div>
            {error.includes('No H1B data found') && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>This could mean:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The company name might be spelled differently in our database</li>
                  <li>The company may not have filed H1B applications in our dataset</li>
                  <li>Try searching with a different variation of the company name</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  if (!companyInfo) {return null;}

  const certificationRate = companyInfo.totalApplications > 0 
    ? ((companyInfo.certifiedApplications / companyInfo.totalApplications) * 100).toFixed(1)
    : '0.0';

  const hasFinancialData = companyInfo.avgSalary > 0;
  const hasGeographicData = companyInfo.topStates.length > 0;
  const hasJobData = companyInfo.topJobTitles.length > 0;
  const hasTrendData = companyInfo.yearlyTrends.length > 0;


  return (
    <div className="max-w-7xl mx-auto space-y-6">
    {/* Header */}
    <div className="mb-6">
      <Button 
        onClick={handleBackClick}
        variant="outline" 
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{companyName}</h1>
            <p className="text-muted-foreground">H1B Data Analysis & Insights</p>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="text-sm">
              {formatNumber(companyInfo.totalApplications)} Total Applications
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Total Applications</h3>
            <p className="text-3xl font-bold text-foreground">{formatNumber(companyInfo.totalApplications)}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-success/10 rounded-lg text-success">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Certification Rate</h3>
            <p className="text-3xl font-bold text-foreground">{certificationRate}%</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-chart-3/10 rounded-lg text-chart-3">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Average Salary</h3>
            <p className="text-3xl font-bold text-foreground">
              {hasFinancialData ? formatCurrency(companyInfo.avgSalary) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Salary Range</h3>
            <p className="text-3xl font-bold text-foreground">
              {hasFinancialData && companyInfo.minSalary > 0 && companyInfo.maxSalary > 0
                ? `${formatCompactCurrency(companyInfo.minSalary)} - ${formatCompactCurrency(companyInfo.maxSalary)}`
                : 'N/A'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trends */}
        <MarketTrendsCard
          data={companyInfo.yearlyTrends}
          title="Application Trends"
          showSalary={true}
          showCertificationRate={true}
          maxYears={5}
        />

        {/* Top Job Titles */}
        <TopJobTitlesCard
          data={companyInfo.topJobTitles.map(job => ({
            jobTitle: job.jobTitle,
            applications: job.applications,
            percentage: ((job.applications / companyInfo.totalApplications) * 100),
            avgSalary: job.avgSalary,
            yoyGrowth: job.yoyGrowth,
            yoyGrowthPercentage: job.yoyGrowthPercentage,
          }))}
          showYoYGrowth={true}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <ReusableProgressChart
          data={companyInfo.topStates.slice(0, 7).map((state, index) => ({
            label: state.state,
            value: state.applications,
            percentage: state.percentage,
            color: getChartColor(index, CHART_COLOR_ARRAYS.geographic),
          }))}
          title="Geographic Distribution"
          titleIcon={<MapPin className="w-5 h-5" />}
          height={400}
          showPercentage={true}
          showValues={true}
          formatValue={formatNumber}
          customTooltip={({ indexValue, value, data }) => (
            <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
              <div className="text-sm font-semibold text-foreground mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {indexValue}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Applications:</span>
                  <span className="text-sm font-medium text-primary">{formatNumber(data?.displayValue || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Share:</span>
                  <span className="text-sm font-medium text-success">{(data?.percentage || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        />

        {/* Salary Distribution */}
        <ReusableSalaryDistribution
          data={companyInfo.salaryDistribution}
          loading={false}
          title={`Salary Distribution`}
          showTitle={true}
          height={400}
          showChartToggle={true}
          className="h-[500px]"
        />
      </div>

      {/* Recent Activity */}
      <ReusableActivityChart
        data={companyInfo.recentActivity.map(activity => ({
          period: activity.month,
          value: activity.applications,
        }))}
        title="Recent Activity (Last 6 Months)"
        height={250}
        compact={true}
        formatValue={formatNumber}
        formatPeriod={(period) => period.split(' ')[0]}
        colors={CHART_COLOR_ARRAYS.standard}
        customTooltip={({ indexValue, value }) => (
          <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
            <div className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              {indexValue}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Applications:</span>
              <span className="text-sm font-medium text-primary">{formatNumber(value)}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
};

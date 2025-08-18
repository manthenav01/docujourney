'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { getSalaryRangeColor, getChartColor, CHART_COLOR_ARRAYS } from '../../lib/chartColors';
import { H1BJobAnalysis } from '../../lib/types';
import { ReusableSalaryDistribution } from './charts/ReusableSalaryDistribution';
import { WageLevelAnalysis } from './charts/WageLevelAnalysis';
import { MarketTrendsCard } from './MarketTrendsCard';
import { TopEmployersCard } from './TopEmployersCard';
import WageInsightSummary from './insights/WageInsightSummary';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  BarChart3,
  Award,
  Target,
  Building,
  Building2,
  Globe,
  PieChart,
  LineChart,
  CheckCircle,
  Clock,
  UserCheck,
  FileText,
} from 'lucide-react';
import { METRIC_CONFIGS } from '../../lib/metricCardConfig';
import { ApplicationsCard, SalaryCard, ApprovalRateCard, EmployersCard } from './StatsCard';

// Use the standardized H1BJobAnalysis type
type JobInfo = H1BJobAnalysis;

interface JobDashboardProps {
  jobSlug: string;
  jobTitle: string;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({
  jobSlug,
  jobTitle,
}) => {
  const router = useRouter();
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobInfo();
  }, [jobTitle]);

  const fetchJobInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/h1b-data/job?title=${encodeURIComponent(jobTitle)}`);
      
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.error) {
          throw new Error(apiResponse.error.message || 'API error occurred');
        }
        if (!apiResponse.data) {
          throw new Error('No data received from API');
        }
        console.log('JobDashboard - API Response:', apiResponse.data);
        console.log('JobDashboard - Wage Level Data:', apiResponse.data.wageLevelAnalysis);
        console.log('JobDashboard - Yearly Trends Data:', apiResponse.data.yearlyTrends);
        setJobInfo(apiResponse.data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job information';
      setError(errorMessage);
      console.error('Error fetching job info:', err);
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
              <div className="h-8 bg-muted rounded w-72 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-56 animate-pulse"></div>
            </div>
            <div className="ml-auto">
              <div className="h-6 bg-muted rounded w-36 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1,2,3,4,5].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-muted/30 rounded-lg animate-pulse">
                    <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-20 animate-pulse mb-1"></div>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-44 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-40 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-28 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-18 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-14 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-38 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div className="bg-muted h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading indicator */}
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Loading job data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-destructive/10 border border-destructive/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-destructive text-lg font-semibold mb-2">Unable to Load Job Data</div>
            <div className="text-destructive">{error}</div>
            {error.includes('No H1B data found') && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>This could mean:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The job title might be spelled differently in our database</li>
                  <li>The job title may not have H1B applications in our dataset</li>
                  <li>Try searching with a different variation of the job title</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  if (!jobInfo) {return null;}

  const certificationRate = jobInfo.totalApplications > 0 
    ? ((jobInfo.certifiedApplications / jobInfo.totalApplications) * 100)
    : 0;

  const fullTimePercentage = jobInfo.totalApplications > 0
    ? ((jobInfo.fullTimePositions / jobInfo.totalApplications) * 100).toFixed(1)
    : '0.0';

  const hasFinancialData = jobInfo.avgSalary > 0;
  const hasGeographicData = jobInfo.topStates.length > 0;
  const hasEmployerData = jobInfo.topEmployers.length > 0;
  const hasTrendData = jobInfo.yearlyTrends.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    {/* Header */}
    <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl flex-shrink-0">
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words hyphens-auto">
                {jobTitle}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                H1B Job Market Analysis & Insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights - Condensed View */}
      <WageInsightSummary 
        jobData={jobInfo} 
        condensed={true}
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ApplicationsCard value={jobInfo.totalApplications} />
        <ApprovalRateCard value={certificationRate} />
        <SalaryCard value={hasFinancialData ? jobInfo.avgSalary : 0} />
        <EmployersCard value={jobInfo.uniqueEmployers} />
      </div>

      {/* Row 1: Market Intelligence - Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trends - LEFT (Temporal Analysis) */}
        <MarketTrendsCard
          data={jobInfo.yearlyTrends}
          title="Job Market Trends"
          showSalary={true}
          showCertificationRate={true}
          maxYears={5}
        />

        {/* Top Employers - RIGHT (Primary Context) */}
        <TopEmployersCard
          data={jobInfo.topEmployers.map(employer => ({
            employer: employer.employer,
            applications: employer.applications,
            avgSalary: employer.avgSalary,
            yoyGrowth: employer.yoyGrowth,
            yoyGrowthPercentage: employer.yoyGrowthPercentage,
          }))}
          title="Top Hiring Companies"
          showYoYGrowth={true}
        />
      </div>

      {/* Row 2: Deep Analysis - Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution - LEFT (Entity Distribution) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobInfo.topStates.slice(0, 7).map((state, index) => (
                <div key={state.state} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{state.state}</span>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">{formatNumber(state.applications)} ({state.percentage}%)</span>
                      <div className="text-xs text-muted-foreground">{formatCurrency(state.avgSalary)} avg</div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${state.percentage}%`,
                        backgroundColor: getChartColor(index, CHART_COLOR_ARRAYS.geographic),
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Distribution - RIGHT (Always Consistent Position) */}
        <ReusableSalaryDistribution
          data={jobInfo.salaryDistribution}
          loading={loading}
          title="Salary Distribution"
          height={400}
        />
      </div>

      {/* Specialized Analysis - Full Width */}
      <WageLevelAnalysis
        data={jobInfo.wageLevelAnalysis}
        loading={loading}
        title="Prevailing Wage Level Analysis" 
        context="job"
      />

    </div>
  );
};

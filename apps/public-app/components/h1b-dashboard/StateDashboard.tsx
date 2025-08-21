'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { H1BStateAnalysis } from '../../lib/types';
import { MarketTrendsCard } from './MarketTrendsCard';
import { ReusableSalaryDistribution } from './charts/ReusableSalaryDistribution';
import { TopJobTitlesCard } from './TopJobTitlesCard';
import { TopEmployersCard } from './TopEmployersCard';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  TrendingUp, 
  DollarSign,
  Award,
  Building,
  Building2,
  Briefcase,
  PieChart,
  LineChart,
  BarChart3,
  FileText,
  Map,
} from 'lucide-react';
import { METRIC_CONFIGS } from '../../lib/metricCardConfig';
import { ApplicationsCard, SalaryCard, ApprovalRateCard, EmployersCard } from './StatsCard';

// Use the standardized H1BStateAnalysis type
type StateInfo = H1BStateAnalysis;

interface StateDashboardProps {
  stateSlug: string;
  stateName: string;
  stateCode: string;
}

export const StateDashboard: React.FC<StateDashboardProps> = ({
  stateSlug,
  stateName,
  stateCode,
}) => {
  const router = useRouter();
  const [stateInfo, setStateInfo] = useState<StateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStateInfo();
  }, [stateCode]);

  const fetchStateInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/h1b-data/state?state=${encodeURIComponent(stateCode)}`);
      
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.error) {
          throw new Error(apiResponse.error.message || 'API error occurred');
        }
        if (!apiResponse.data) {
          throw new Error('No data received from API');
        }
        setStateInfo(apiResponse.data);
      } else {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errorData.error?.message || `Server responded with ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching state data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (cityName: string) => {
    const citySlug = cityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    router.push(`/h1b-dashboard/locations/${encodeURIComponent(stateSlug)}/${encodeURIComponent(citySlug)}?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
  };

  const handleEmployerClick = (employerName: string) => {
    const employerSlug = employerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    router.push(`/h1b-dashboard/company/${encodeURIComponent(employerSlug)}?employer=${encodeURIComponent(employerName)}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading State Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={fetchStateInfo} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stateInfo) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">State Not Found</h2>
            <p className="text-gray-600 mb-6">No H1B data available for {stateName}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Add safety checks for data integrity
  const hasTrendData = stateInfo.yearlyTrends && Array.isArray(stateInfo.yearlyTrends) && stateInfo.yearlyTrends.length > 0;
  
  // Ensure all required properties exist with default values
  const safeStateInfo = {
    ...stateInfo,
    totalApplications: stateInfo.totalApplications || 0,
    certificationRate: stateInfo.certificationRate || 0,
    certifiedApplications: stateInfo.certifiedApplications || 0,
    uniqueEmployers: stateInfo.uniqueEmployers || 0,
    uniqueCities: stateInfo.uniqueCities || 0,
    avgSalary: stateInfo.avgSalary || 0,
    medianSalary: stateInfo.medianSalary || 0,
    topCities: stateInfo.topCities || [],
    topEmployers: stateInfo.topEmployers || [],
    topJobTitles: stateInfo.topJobTitles || [],
    salaryDistribution: stateInfo.salaryDistribution || [],
    yearlyTrends: stateInfo.yearlyTrends || [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl flex-shrink-0">
              <Map className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">{stateName}</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                H1B Data Analysis & Insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ApplicationsCard value={safeStateInfo.totalApplications} />
        <ApprovalRateCard value={safeStateInfo.certificationRate} />
        <SalaryCard value={safeStateInfo.avgSalary > 0 ? safeStateInfo.avgSalary : 0} />
        <EmployersCard value={safeStateInfo.uniqueEmployers} />
      </div>

      {/* Row 1: Market Intelligence - Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trends - LEFT (Temporal Analysis) */}
        {hasTrendData && (
          <MarketTrendsCard 
            data={safeStateInfo.yearlyTrends} 
            title="Application Trends"
            showSalary={true}
            showCertificationRate={true}
            maxYears={5}
          />
        )}

        {/* Top Cities - RIGHT (Primary Context) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Top Cities in {stateName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeStateInfo.topCities.slice(0, 6).map((city, index) => (
                <div 
                  key={city.city} 
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleCityClick(city.city)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-chart-2 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground truncate">{city.city}</h4>
                      <p className="text-sm text-muted-foreground">
                        {city.applications.toLocaleString()} applications ({city.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      ${city.avgSalary.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {city.certificationRate.toFixed(1)}% approval
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Deep Analysis - Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employers - LEFT (Entity Distribution) */}
        <TopEmployersCard
          data={safeStateInfo.topEmployers.map(employer => ({
            employer: employer.employer,
            applications: employer.applications,
            avgSalary: employer.avgSalary,
            yoyGrowth: employer.yoyGrowth,
            yoyGrowthPercentage: employer.yoyGrowthPercentage,
          }))}
          title="Top Employers"
          showYoYGrowth={true}
        />

        {/* Top Paying Job Titles - RIGHT (Secondary Analysis) */}
        <TopJobTitlesCard
          data={safeStateInfo.topJobTitles.map(job => ({
            jobTitle: job.jobTitle,
            applications: job.applications,
            percentage: ((job.applications / safeStateInfo.totalApplications) * 100),
            avgSalary: job.avgSalary,
            yoyGrowth: job.yoyGrowth,
            yoyGrowthPercentage: job.yoyGrowthPercentage,
          }))}
          showYoYGrowth={true}
        />
      </div>

      {/* Specialized Analysis - Full Width */}
      <ReusableSalaryDistribution
        data={safeStateInfo.salaryDistribution}
        loading={false}
        title="Salary Distribution"
        showTitle={true}
        height={400}
      />
    </div>
  );
};

export default StateDashboard;
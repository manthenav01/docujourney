'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { H1BCityAnalysis } from '../../lib/types';
import { MarketTrendsCard } from './MarketTrendsCard';
import { ReusableSalaryDistribution } from './charts/ReusableSalaryDistribution';
import { TopJobTitlesCard } from './TopJobTitlesCard';
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
  Activity,
  PieChart,
  LineChart,
  BarChart3,
} from 'lucide-react';

// Use the standardized H1BCityAnalysis type
type CityInfo = H1BCityAnalysis;

interface CityDashboardProps {
  citySlug: string;
  cityName: string;
  stateName: string;
}

export const CityDashboard: React.FC<CityDashboardProps> = ({
  citySlug,
  cityName,
  stateName,
}) => {
  const router = useRouter();
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCityInfo();
  }, [cityName, stateName]);

  const fetchCityInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/h1b-data/city?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
      
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.error) {
          throw new Error(apiResponse.error.message || 'API error occurred');
        }
        if (!apiResponse.data) {
          throw new Error('No data received from API');
        }
        setCityInfo(apiResponse.data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load city information';
      setError(errorMessage);
      console.error('Error fetching city info:', err);
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
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Unable to Load City Data</div>
            <div className="text-red-700">{error}</div>
            {error.includes('No H1B data found') && (
              <div className="mt-4 text-sm text-gray-600">
                <p>This could mean:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The city name might be spelled differently in our database</li>
                  <li>The city may not have H1B applications in our dataset</li>
                  <li>Try searching with a different variation of the city name</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  if (!cityInfo) {return null;}

  const certificationRate = cityInfo.totalApplications > 0 
    ? ((cityInfo.certifiedApplications / cityInfo.totalApplications) * 100).toFixed(1)
    : '0.0';

  const hasFinancialData = cityInfo.avgSalary > 0;
  const hasEmployerData = cityInfo.topEmployers.length > 0;
  const hasJobData = cityInfo.topJobTitles.length > 0;
  const hasTrendData = cityInfo.yearlyTrends.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
    {/* Header */}
    <div className="mb-6">
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cityName}, {stateName}</h1>
            <p className="text-gray-600">H1B Data Analysis & Insights</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Applications</h3>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(cityInfo.totalApplications)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Certification Rate</h3>
            <p className="text-3xl font-bold text-gray-900">{certificationRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Average Salary</h3>
            <p className="text-3xl font-bold text-gray-900">
              {hasFinancialData ? formatCurrency(cityInfo.avgSalary) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Salary Range</h3>
            <p className="text-3xl font-bold text-gray-900">
              {hasFinancialData && cityInfo.minSalary > 0 && cityInfo.maxSalary > 0
                ? `${formatCompactCurrency(cityInfo.minSalary)} - ${formatCompactCurrency(cityInfo.maxSalary)}`
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
          data={cityInfo.yearlyTrends}
          title="Application Trends"
          showSalary={true}
          showCertificationRate={true}
          maxYears={5}
        />

        {/* Top Job Titles */}
        <TopJobTitlesCard
          data={cityInfo.topJobTitles.map(job => ({
            jobTitle: job.jobTitle,
            applications: job.applications,
            percentage: ((job.applications / cityInfo.totalApplications) * 100),
            avgSalary: job.avgSalary,
            yoyGrowth: job.yoyGrowth,
            yoyGrowthPercentage: job.yoyGrowthPercentage,
          }))}
          showYoYGrowth={true}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Top Employers in {cityName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityInfo.topEmployers.slice(0, 6).map((employer, index) => (
                <div key={employer.employer} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{employer.employer.slice(0, 30)}{employer.employer.length > 30 ? '...' : ''}</span>
                        <div className="text-xs text-gray-500">{formatCurrency(employer.avgSalary)} avg</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{formatNumber(employer.applications)} ({employer.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${employer.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Distribution */}
        <ReusableSalaryDistribution
          data={cityInfo.salaryDistribution}
          loading={false}
          title={`Salary Distribution`}
          showTitle={true}
          height={400}
          showChartToggle={true}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cityInfo.recentActivity.map((activity) => {
              const maxApplications = Math.max(...cityInfo.recentActivity.map(a => a.applications));
              const height = maxApplications > 0 ? (activity.applications / maxApplications) * 100 : 0;
              
              return (
                <div key={activity.month} className="text-center space-y-2">
                  <div className="text-sm font-medium text-gray-600">{activity.month.split(' ')[0]}</div>
                  <div className="flex items-end justify-center h-20">
                    <div 
                      className="bg-orange-500 rounded-t-md w-8 transition-all duration-300"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">{formatNumber(activity.applications)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

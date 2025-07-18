"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building, 
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
  Activity,
  PieChart,
  LineChart,
  Star,
  CheckCircle
} from 'lucide-react';

interface CompanyInfo {
  name: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  topStates: Array<{
    state: string;
    applications: number;
    percentage: number;
  }>;
  topJobTitles: Array<{
    jobTitle: string;
    applications: number;
    avgSalary: number;
    medianSalary: number;
  }>;
  yearlyTrends: Array<{
    fiscalYear: string;
    applications: number;
    avgSalary: number;
    certificationRate: number;
  }>;
  salaryDistribution: Array<{
    range: string;
    count: number;
  }>;
  recentActivity: Array<{
    month: string;
    applications: number;
  }>;
}

interface CompanyDashboardProps {
  companySlug: string;
  companyName: string;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  companySlug,
  companyName
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
        const data = await response.json();
        setCompanyInfo(data);
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
              <div className="text-red-600 text-lg font-semibold mb-2">Unable to Load Company Data</div>
              <div className="text-red-700">{error}</div>
              {error.includes('No H1B data found') && (
                <div className="mt-4 text-sm text-gray-600">
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
      </div>
    );
  }

  if (!companyInfo) return null;

  const certificationRate = companyInfo.totalApplications > 0 
    ? ((companyInfo.certifiedApplications / companyInfo.totalApplications) * 100).toFixed(1)
    : '0.0';

  const hasFinancialData = companyInfo.avgSalary > 0;
  const hasGeographicData = companyInfo.topStates.length > 0;
  const hasJobData = companyInfo.topJobTitles.length > 0;
  const hasTrendData = companyInfo.yearlyTrends.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
          <div className="p-3 bg-blue-50 rounded-xl">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-gray-600">H1B Data Analysis & Insights</p>
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
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Applications</h3>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(companyInfo.totalApplications)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
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
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Average Salary</h3>
            <p className="text-3xl font-bold text-gray-900">
              {hasFinancialData ? formatCurrency(companyInfo.avgSalary) : 'N/A'}
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
              {hasFinancialData && companyInfo.minSalary > 0 && companyInfo.maxSalary > 0
                ? `${formatCurrency(companyInfo.minSalary)} - ${formatCurrency(companyInfo.maxSalary)}`
                : 'N/A'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Application Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyInfo.yearlyTrends.map((year) => (
                <div key={year.fiscalYear} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                      {year.fiscalYear.slice(-2)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">FY {year.fiscalYear}</div>
                      <div className="text-sm text-gray-500">{formatNumber(year.applications)} applications</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(year.avgSalary)}</div>
                    <div className="text-xs text-gray-500">{year.certificationRate.toFixed(1)}% certified</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Job Titles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Top Job Titles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyInfo.topJobTitles.slice(0, 5).map((job, index) => (
                <div key={job.jobTitle} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{job.jobTitle}</div>
                      <div className="text-sm text-gray-500">{formatNumber(job.applications)} applications</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(job.avgSalary)}</div>
                    <div className="text-xs text-gray-500">avg salary</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyInfo.topStates.map((state) => (
                <div key={state.state} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{state.state}</span>
                    <span className="text-sm text-gray-600">{formatNumber(state.applications)} ({state.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${state.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Salary Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyInfo.salaryDistribution.map((salary, index) => {
                const maxCount = Math.max(...companyInfo.salaryDistribution.map(s => s.count));
                const percentage = (salary.count / maxCount) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
                
                return (
                  <div key={salary.range} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{salary.range}</span>
                      <span className="text-sm text-gray-600">{formatNumber(salary.count)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
            {companyInfo.recentActivity.map((activity) => {
              const maxApplications = Math.max(...companyInfo.recentActivity.map(a => a.applications));
              const height = (activity.applications / maxApplications) * 100;
              
              return (
                <div key={activity.month} className="text-center space-y-2">
                  <div className="text-sm font-medium text-gray-600">{activity.month.split(' ')[0]}</div>
                  <div className="flex items-end justify-center h-20">
                    <div 
                      className="bg-orange-500 rounded-t-md w-8 transition-all duration-300"
                      style={{ height: `${height}%` }}
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
    </div>
  );
};

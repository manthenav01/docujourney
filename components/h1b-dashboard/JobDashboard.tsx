"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
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
  Globe,
  Activity,
  PieChart,
  LineChart,
  Star,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface JobInfo {
  title: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  fullTimePositions: number;
  partTimePositions: number;
  topEmployers: Array<{
    employer: string;
    applications: number;
    avgSalary: number;
    medianSalary: number;
  }>;
  topStates: Array<{
    state: string;
    applications: number;
    percentage: number;
    avgSalary: number;
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

interface JobDashboardProps {
  jobSlug: string;
  jobTitle: string;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({
  jobSlug,
  jobTitle
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
        const data = await response.json();
        setJobInfo(data);
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
              <div className="text-red-600 text-lg font-semibold mb-2">Unable to Load Job Data</div>
              <div className="text-red-700">{error}</div>
              {error.includes('No H1B data found') && (
                <div className="mt-4 text-sm text-gray-600">
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
      </div>
    );
  }

  if (!jobInfo) return null;

  const certificationRate = jobInfo.totalApplications > 0 
    ? ((jobInfo.certifiedApplications / jobInfo.totalApplications) * 100).toFixed(1)
    : '0.0';

  const fullTimePercentage = jobInfo.totalApplications > 0
    ? ((jobInfo.fullTimePositions / jobInfo.totalApplications) * 100).toFixed(1)
    : '0.0';

  const hasFinancialData = jobInfo.avgSalary > 0;
  const hasGeographicData = jobInfo.topStates.length > 0;
  const hasEmployerData = jobInfo.topEmployers.length > 0;
  const hasTrendData = jobInfo.yearlyTrends.length > 0;

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
          <div className="p-3 bg-purple-50 rounded-xl">
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{jobTitle}</h1>
            <p className="text-gray-600">H1B Job Market Analysis & Insights</p>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="text-sm">
              {formatNumber(jobInfo.totalApplications)} Total Applications
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
            <p className="text-3xl font-bold text-gray-900">{formatNumber(jobInfo.totalApplications)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <CheckCircle className="w-6 h-6" />
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
              {hasFinancialData ? formatCurrency(jobInfo.avgSalary) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Full-Time Positions</h3>
            <p className="text-3xl font-bold text-gray-900">{fullTimePercentage}%</p>
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
              Job Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobInfo.yearlyTrends.map((year) => (
                <div key={year.fiscalYear} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold">
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

        {/* Top Employers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Top Hiring Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobInfo.topEmployers.slice(0, 5).map((employer, index) => (
                <div key={employer.employer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{employer.employer}</div>
                      <div className="text-sm text-gray-500">{formatNumber(employer.applications)} applications</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(employer.avgSalary)}</div>
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
              {jobInfo.topStates.map((state) => (
                <div key={state.state} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{state.state}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">{formatNumber(state.applications)} ({state.percentage}%)</span>
                      <div className="text-xs text-gray-500">{formatCurrency(state.avgSalary)} avg</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
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
              {jobInfo.salaryDistribution.map((salary, index) => {
                const maxCount = Math.max(...jobInfo.salaryDistribution.map(s => s.count));
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

      {/* Employment Type Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Employment Type Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Full-Time Positions</div>
                    <div className="text-sm text-gray-600">{formatNumber(jobInfo.fullTimePositions)} applications</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{fullTimePercentage}%</div>
                  <div className="text-xs text-gray-500">of total</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Part-Time Positions</div>
                    <div className="text-sm text-gray-600">{formatNumber(jobInfo.partTimePositions)} applications</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{(100 - parseFloat(fullTimePercentage)).toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">of total</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Market Insight:</strong> Full-time positions represent {fullTimePercentage}% of all {jobTitle} H1B applications, 
                  indicating {parseFloat(fullTimePercentage) > 80 ? "strong employer demand for permanent roles" : "mixed employment patterns"} 
                  in this field.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
              {jobInfo.recentActivity.map((activity) => {
                const maxApplications = Math.max(...jobInfo.recentActivity.map(a => a.applications));
                const height = (activity.applications / maxApplications) * 100;
                
                return (
                  <div key={activity.month} className="text-center space-y-2">
                    <div className="text-sm font-medium text-gray-600">{activity.month.split(' ')[0]}</div>
                    <div className="flex items-end justify-center h-20">
                      <div 
                        className="bg-purple-500 rounded-t-md w-8 transition-all duration-300"
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

      {/* Market Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Market Insights Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{hasFinancialData ? formatCurrency(jobInfo.medianSalary) : 'N/A'}</div>
              <div className="text-sm text-gray-600">Median Salary</div>
              <div className="text-xs text-gray-500 mt-1">50th percentile earnings</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatNumber(jobInfo.topEmployers.length)}</div>
              <div className="text-sm text-gray-600">Active Employers</div>
              <div className="text-xs text-gray-500 mt-1">Companies hiring for this role</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(jobInfo.topStates.length)}</div>
              <div className="text-sm text-gray-600">Active States</div>
              <div className="text-xs text-gray-500 mt-1">Geographic opportunities</div>
            </div>
          </div>
          
          {hasFinancialData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>Key Takeaways:</strong> The {jobTitle} role shows {
                  hasFinancialData && jobInfo.avgSalary > 100000 ? "competitive" : "moderate"
                } compensation with an average salary of {formatCurrency(jobInfo.avgSalary)}. 
                With a {certificationRate}% certification rate and {formatNumber(jobInfo.totalApplications)} total applications, 
                this represents a {parseFloat(certificationRate) > 85 ? "highly sought-after" : "competitive"} position in the H1B market.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

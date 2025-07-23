'use client';

import React, { useState, useEffect } from 'react';
import { 
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
  Building2, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface EmployerData {
  employer: string;
  totalPetitions: number;
  approvalRate: number;
  averageWage: number;
  recentFilings: number;
}

interface SummaryStats {
  totalPetitions: number;
  totalApproved: number;
  overallApprovalRate: number;
  averageProcessingTime: number;
  topEmployers: Array<{
    employer: string;
    count: number;
    approvalRate: number;
  }>;
  visaTypeBreakdown: Array<{
    visaType: string;
    count: number;
    approvalRate: number;
  }>;
  recentTrends: {
    last30Days: number;
    last90Days: number;
    last365Days: number;
  };
}

const VisaDashboard: React.FC = () => {
  const [topSponsors, setTopSponsors] = useState<EmployerData[]>([]);
  const [topSuccessRate, setTopSuccessRate] = useState<EmployerData[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch top sponsoring employers
      const sponsorsResponse = await fetch(
        `/api/petitions/employers?sortBy=totalPetitions&sortOrder=desc&limit=10`,
      );
      
      if (!sponsorsResponse.ok) {
        throw new Error('Failed to fetch sponsor data');
      }
      
      const sponsorsData = await sponsorsResponse.json();
      console.log('Sponsors data:', sponsorsData);
      setTopSponsors(sponsorsData);

      // Fetch top success rate employers (minimum 10 petitions)
      const successResponse = await fetch(
        `/api/petitions/employers?sortBy=approvalRate&sortOrder=desc&limit=50`,
      );
      
      if (!successResponse.ok) {
        throw new Error('Failed to fetch success rate data');
      }
      
      const successData = await successResponse.json();
      // Filter to employers with at least 10 petitions for meaningful success rates
      const filteredSuccessData = successData.filter((emp: EmployerData) => emp.totalPetitions >= 10);
      setTopSuccessRate(filteredSuccessData.slice(0, 10));

      // Fetch summary statistics
      const statsResponse = await fetch(`/api/petitions/stats`);
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch summary stats');
      }
      
      const statsData = await statsResponse.json();
      setSummaryStats(statsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-12 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error loading dashboard data</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">H-1B Visa Analytics</h2>
        <p className="text-gray-600">Comprehensive insights into H-1B visa petition data and employer statistics</p>
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Petitions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summaryStats.totalPetitions)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatNumber(summaryStats.recentTrends.last30Days)} in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(summaryStats.overallApprovalRate)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(summaryStats.totalApproved)} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(summaryStats.averageProcessingTime)} days</div>
              <p className="text-xs text-muted-foreground">
                Average approval time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summaryStats.recentTrends.last90Days)}</div>
              <p className="text-xs text-muted-foreground">
                Filings in last 90 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sponsoring Employers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top 10 Sponsoring Employers
            </CardTitle>
            <p className="text-sm text-gray-600">
              Companies with the most H-1B petitions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSponsors.map((employer, index) => (
                <div key={employer.employer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[200px]" title={employer.employer}>
                        {employer.employer}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {formatNumber(employer.totalPetitions)} petitions
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {formatPercentage(employer.approvalRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {formatCurrency(employer.averageWage)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">avg wage</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Success Rate Employers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 10 Success Rate Employers
            </CardTitle>
            <p className="text-sm text-gray-600">
              Companies with highest approval rates (min. 10 petitions)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSuccessRate.map((employer, index) => (
                <div key={employer.employer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[200px]" title={employer.employer}>
                        {employer.employer}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {formatNumber(employer.totalPetitions)} petitions
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(employer.averageWage)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={employer.approvalRate >= 95 ? 'default' : employer.approvalRate >= 85 ? 'secondary' : 'outline'}
                      className={employer.approvalRate >= 95 ? 'bg-green-600' : ''}
                    >
                      {formatPercentage(employer.approvalRate)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">success rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visa Type Breakdown */}
      {summaryStats && summaryStats.visaTypeBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Visa Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {summaryStats.visaTypeBreakdown.map((visa) => (
                <div key={visa.visaType} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{visa.visaType}</div>
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(visa.count)}</div>
                  <div className="text-sm text-gray-500">{formatPercentage(visa.approvalRate)} approval</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisaDashboard;

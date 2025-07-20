'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JobTitleData {
  jobTitle: string
  applications: number
  percentage: number
  avgSalary: number
}

interface TopJobTitlesCardProps {
  data: JobTitleData[]
  loading?: boolean
}

export function TopJobTitlesCard({ data, loading }: TopJobTitlesCardProps) {
  const router = useRouter();

  const handleJobClick = (jobTitle: string) => {
    const jobSlug = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/h1b-dashboard/job/${encodeURIComponent(jobSlug)}?title=${encodeURIComponent(jobTitle)}`);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Job Titles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
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
          <CardTitle>Top Job Titles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No job title data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get top 5 job titles
  const topJobTitles = data.slice(0, 5);
  const maxApplications = Math.max(...topJobTitles.map(item => item.applications));

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Top Job Titles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topJobTitles.map((item, index) => {
          const progressWidth = (item.applications / maxApplications) * 100;
          
          return (
            <div
              key={item.jobTitle}
              className="group relative p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
              onClick={() => handleJobClick(item.jobTitle)}
            >
              {/* Progress bar background */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-lg opacity-40"
                style={{ width: `${progressWidth}%` }}
              />
              
              {/* Content */}
              <div className="relative flex items-center justify-between">
                {/* Left side: Rank and job title */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {item.jobTitle}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {item.applications.toLocaleString()} applications
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right side: Salary */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-blue-600">
                    ${(item.avgSalary / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-400">avg salary</div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Summary footer */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Showing top 5 job titles</span>
            <span>
              {topJobTitles.reduce((sum, item) => sum + item.applications, 0).toLocaleString()} total applications
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
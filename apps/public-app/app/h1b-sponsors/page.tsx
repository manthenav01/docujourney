import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/h1b-dashboard';
import { H1BSponsorsClient } from './H1BSponsorsClient';

// Force this page to be statically generated with ISR
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours

interface IndustryData {
  industry: string;
  percentage: number;
  applications: number;
}

interface SponsorInsight {
  title: string;
  description: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple';
}

interface StaticStatsData {
  industries: IndustryData[];
  insights: SponsorInsight[];
  lastUpdated: string;
  totalApplications: number;
}

// Static data fetching - development-safe approach
async function getStaticStats(): Promise<StaticStatsData> {
  // In development, avoid server-side API calls that can cause circular dependencies
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Using fallback data to avoid SSR issues');
    return getFallbackData();
  }

  // Only attempt API fetch in production/build environments
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'https://usimmigrantcentral.com';

    const response = await fetch(`${baseUrl}/api/h1b-data/static-stats`, {
      next: { revalidate: 86400 }, // 24 hours
      cache: 'force-cache', // Ensure static generation
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch static stats: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Static stats fetched successfully for production');
    return data;
  } catch (error) {
    console.error('⚠️ Error fetching static stats, using fallback:', error);
    return getFallbackData();
  }
}

// Separate fallback data function
function getFallbackData(): StaticStatsData {
  return {
    industries: [
      { industry: 'Technology & Software', percentage: 34.2, applications: 150000 },
      { industry: 'Consulting Services', percentage: 18.7, applications: 82000 },
      { industry: 'Healthcare & Pharmaceuticals', percentage: 12.4, applications: 54000 },
      { industry: 'Financial Services', percentage: 9.8, applications: 43000 },
      { industry: 'Manufacturing', percentage: 8.1, applications: 35000 },
    ],
    insights: [
      {
        title: 'Growing Sponsors',
        description: 'New companies continue to sponsor H1B visas for the first time',
        value: 'Active Growth',
        color: 'blue',
      },
      {
        title: 'Success Rate', 
        description: 'Companies maintain high approval rates for H1B applications',
        value: 'High Success',
        color: 'green',
      },
      {
        title: 'Salary Growth',
        description: 'Positive salary trends across all sponsors',
        value: 'Increasing',
        color: 'purple',
      },
    ],
    lastUpdated: new Date().toISOString(),
    totalApplications: 450000,
  };
}


// Static Content Component (for better error isolation)
function StaticContent({ staticStats }: { staticStats: StaticStatsData }) {
  return (
    <div className="mt-12 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Complete H1B Sponsor Company Database
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            Our comprehensive H1B sponsor database includes detailed information about every company 
            that has filed H1B visa petitions from 2020-2025. Each company profile includes:
          </p>
          <ul>
            <li>Historical H1B application volumes and approval rates</li>
            <li>Salary ranges and compensation data by job title</li>
            <li>Geographic distribution of H1B employees</li>
            <li>Year-over-year hiring trends and patterns</li>
            <li>Popular job titles and skill requirements</li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Real Industry Data */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Top H1B Industries</h3>
          <div className="space-y-2">
            {staticStats.industries.map((industry, index) => (
              <div key={index} className="flex justify-between">
                <span>{industry.industry}</span>
                <span className="font-semibold">{industry.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real Sponsor Insights */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">H1B Sponsor Insights</h3>
          <div className="space-y-4">
            {staticStats.insights.map((insight, index) => {
              const bgColor = insight.color === 'blue' ? 'bg-blue-50' : 
                            insight.color === 'green' ? 'bg-green-50' : 'bg-purple-50';
              const textColor = insight.color === 'blue' ? 'text-blue-900' : 
                              insight.color === 'green' ? 'text-green-900' : 'text-purple-900';
              const descColor = insight.color === 'blue' ? 'text-blue-700' : 
                              insight.color === 'green' ? 'text-green-700' : 'text-purple-700';

              return (
                <div key={index} className={`p-4 ${bgColor} rounded-lg`}>
                  <div className={`font-semibold ${textColor}`}>{insight.title}</div>
                  <div className={`${descColor} text-sm`}>
                    {insight.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data freshness indicator */}
      <div className="mt-8 text-center" suppressHydrationWarning>
        <p className="text-sm text-gray-500">
          Data updated: {new Date(staticStats.lastUpdated).toLocaleDateString()} | 
          Based on {staticStats.totalApplications.toLocaleString()} H1B applications
        </p>
      </div>
    </div>
  );
}

// Server Component for static content
export default async function H1BSponsorsPage() {
  let staticStats: StaticStatsData;
  
  try {
    // Fetch static data at build time with error handling
    staticStats = await getStaticStats();
  } catch (error) {
    console.error('🚨 Critical error in H1BSponsorsPage:', error);
    // Use fallback data in case of critical errors
    staticStats = getFallbackData();
  }

  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
                Loading H1B Sponsors...
              </div>
            </div>
          </div>
        </div>
      }>
        {/* Client component for hero and interactive search */}
        <H1BSponsorsClient />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SEO Content Sections - STATIC with ERROR HANDLING */}
        <StaticContent staticStats={staticStats} />
      </div>
    </DashboardLayout>
  );
}
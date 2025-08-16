import { Suspense } from 'react';
import { DashboardLayout } from '@/components/h1b-dashboard';
import { H1BSponsorsServer } from './H1BSponsorsServer';
import { H1BSponsorsClient } from './H1BSponsorsClient';
import { SponsorsListSkeleton } from '@/components/h1b-dashboard/SponsorsListSkeleton';

// ISR: revalidate every hour
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

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

// ISR data fetching - builds statically, regenerates as needed
async function getStaticStats(): Promise<StaticStatsData> {
  // For ISR, use absolute URL construction
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = process.env.VERCEL_URL || 
               (process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'usimmigrantcentral.com');
  const baseUrl = `${protocol}://${host}`;

  const response = await fetch(`${baseUrl}/api/h1b-data/static-stats`, {
    // Disable cache in development, use ISR in production
    next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 },
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ ISR: Fetched fresh static stats');
  return data;
}

// Error component to show when data fetch fails
function ErrorState({ error }: { error: string }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-2xl font-bold text-red-900 mb-4">
          ⚠️ Unable to Load H1B Industry Data
        </h2>
        <div className="text-red-700">
          <p className="mb-2">
            We&apos;re experiencing issues connecting to our H1B database. This helps us identify and fix the problem.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Technical Details</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded text-sm overflow-auto">
              {error}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

// Static Content Component (for better error isolation)
function StaticContent({ staticStats }: { staticStats: StaticStatsData }) {
  return (
    <div className="mt-6 space-y-6">
      {/* SEO-optimized content in a more subtle, modern design */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          About Our H1B Sponsor Database
        </h2>
        <p className="text-gray-700 mb-3">
          Track and analyze H1B sponsorship patterns across <span className="font-semibold text-blue-600">170,441+ companies</span> from 2016-2025
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Historical application volumes & approval rates</span>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Salary ranges by job title & location</span>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Geographic distribution insights</span>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Year-over-year hiring trends</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Real Industry Data */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Top H1B Industries</h3>
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
          <h3 className="text-xl font-bold text-gray-900 mb-3">H1B Sponsor Insights</h3>
          <div className="space-y-3">
            {staticStats.insights.map((insight, index) => {
              const bgColor = insight.color === 'blue' ? 'bg-blue-50' : 
                            insight.color === 'green' ? 'bg-green-50' : 'bg-purple-50';
              const textColor = insight.color === 'blue' ? 'text-blue-900' : 
                              insight.color === 'green' ? 'text-green-900' : 'text-purple-900';
              const descColor = insight.color === 'blue' ? 'text-blue-700' : 
                              insight.color === 'green' ? 'text-green-700' : 'text-purple-700';

              return (
                <div key={index} className={`p-3 ${bgColor} rounded-lg`}>
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
      <div className="mt-4 text-center" suppressHydrationWarning>
        <p className="text-xs text-gray-500">
          Data updated: {new Date(staticStats.lastUpdated).toLocaleDateString()} | 
          Based on {staticStats.totalApplications.toLocaleString('en-US')} H1B applications
        </p>
      </div>
    </div>
  );
}

interface H1BSponsorsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    industry?: string;
    state?: string;
    minSalary?: string;
    maxSalary?: string;
  }>;
}

// Server Component for static content
export default async function H1BSponsorsPage({ searchParams }: H1BSponsorsPageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  
  // Parse URL parameters with defaults
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const industry = params.industry || '';
  const state = params.state || '';
  const minSalary = params.minSalary ? parseInt(params.minSalary, 10) : undefined;
  const maxSalary = params.maxSalary ? parseInt(params.maxSalary, 10) : undefined;
  
  let staticStats: StaticStatsData | null = null;
  let error: string | null = null;
  
  try {
    // Fetch static data - will throw if API fails
    staticStats = await getStaticStats();
  } catch (err) {
    console.error('🚨 H1BSponsorsPage data fetch failed:', err);
    error = err instanceof Error ? err.message : 'Unknown error occurred';
  }

  return (
    <DashboardLayout>
      {/* Client component for hero and search - pass initial params */}
      <H1BSponsorsClient 
        initialPage={page}
        initialSearch={search}
        initialIndustry={industry}
        initialState={state}
        initialMinSalary={minSalary}
        initialMaxSalary={maxSalary}
      />
      
      {/* Server component for paginated sponsors - pass all params */}
      <Suspense fallback={<SponsorsListSkeleton />}>
        <H1BSponsorsServer 
          page={page}
          search={search}
          industry={industry}
          state={state}
          minSalary={minSalary}
          maxSalary={maxSalary}
        />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Show error state or real data - NO FALLBACK */}
        {error ? (
          <ErrorState error={error} />
        ) : staticStats ? (
          <StaticContent staticStats={staticStats} />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading industry data...</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
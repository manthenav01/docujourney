import { Suspense } from 'react';
import { DashboardLayout } from '@/components/h1b-dashboard';
import { H1BSponsorsClient } from './H1BSponsorsClient';

// ISR: Perfect for quarterly data updates
export const revalidate = 86400; // Revalidate daily (data updates quarterly)

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
    // ISR will handle caching, no need for force-cache
    cache: 'no-store', // Always fetch fresh during regeneration
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
    <div className="mt-12 space-y-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
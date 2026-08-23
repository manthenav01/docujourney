import { slugify, LATEST_DATA_FISCAL_YEAR, FISCAL_YEAR_START } from '@docujourney/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { TrendingUp, Building2, DollarSign, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Pagination, PaginationInfo } from '@/components/h1b-dashboard/Pagination';

interface Sponsor {
  employer_name: string;
  total_applications: number;
  certified_count: number;
  approval_rate: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  top_job_titles: string[];
  top_states: string[];
  latest_year: number;
  rank: number;
}

interface PaginatedResponse {
  sponsors: Sponsor[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata: {
    lastUpdated: string;
    source: string;
  };
}

interface FetchSponsorsParams {
  sort?: string;
  page?: number;
  search?: string;
  industry?: string;
  state?: string;
  minSalary?: number;
  maxSalary?: number;
}

async function fetchSponsors({
  page = 1,
  search = '',
  industry = '',
  state = '',
  minSalary,
  maxSalary,
  sort = 'applications',
}: FetchSponsorsParams): Promise<PaginatedResponse | null> {
  try {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.VERCEL_URL || 
                 (process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'usimmigrantcentral.com');
    const baseUrl = `${protocol}://${host}`;
    
    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '25',
    });
    if (sort && sort !== 'applications') {
      params.append('sort', sort);
    }
    
    if (search) {
      params.append('search', search);
    }
    if (industry) {
      params.append('industry', industry);
    }
    if (state) {
      params.append('state', state);
    }
    if (minSalary !== undefined) {
      params.append('minSalary', minSalary.toString());
    }
    if (maxSalary !== undefined) {
      params.append('maxSalary', maxSalary.toString());
    }
    
    const response = await fetch(`${baseUrl}/api/h1b-data/sponsors?${params.toString()}`, {
      // Disable cache in development, use ISR in production
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 },
    });

    if (!response.ok) {
      console.error(`Failed to fetch sponsors: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return null;
  }
}

function getCompanySlug(companyName: string) {
  return slugify(companyName);
}

interface H1BSponsorsServerProps {
  page?: number;
  search?: string;
  industry?: string;
  state?: string;
  minSalary?: number;
  maxSalary?: number;
  sort?: string;
  showHero?: boolean;
}

export async function H1BSponsorsServer({ 
  page = 1, 
  search = '',
  industry = '',
  state = '',
  minSalary,
  maxSalary,
  sort = 'applications',
  showHero = false,
}: H1BSponsorsServerProps) {
  const data = await fetchSponsors({ page, search, industry, state, minSalary, maxSalary, sort });

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Unable to Load H1B Sponsors
          </h2>
          <p className="text-red-700">
            We&apos;re experiencing issues loading the sponsors data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const { sponsors, pagination } = data;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title and stats */}
        <div className="mb-8" id="sponsors-list">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Top H1B Sponsor Companies FY {LATEST_DATA_FISCAL_YEAR}
            {page > 1 && <span className="text-gray-500 ml-2">- Page {page}</span>}
          </h1>
          <p className="text-gray-600">
            Comprehensive directory of companies that sponsor H1B visas, ranked by FY {LATEST_DATA_FISCAL_YEAR} application volume
          </p>
        </div>

        {/* Pagination info */}
        <PaginationInfo
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          limit={pagination.limit}
        />

        {/* Top pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          baseUrl="/h1b-sponsors"
          searchParams={{
            search,
            industry,
            state,
            minSalary,
            maxSalary,
            ...(sort !== 'applications' && { sort }),
          }}
        />

        {/* Sponsors list */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              H1B Sponsor Companies Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sponsors.map((sponsor) => (
                <div
                  key={`${sponsor.employer_name}-${sponsor.rank}`}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Company header */}
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-medium text-gray-500 mr-3">
                          #{sponsor.rank}
                        </span>
                        <Link
                          href={`/h1b-dashboard/company/${getCompanySlug(sponsor.employer_name)}?name=${encodeURIComponent(sponsor.employer_name)}`}
                          className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {sponsor.employer_name}
                        </Link>
                      </div>

                      {/* Stats grid */}
                      <div className="grid md:grid-cols-5 gap-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Applications</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {sponsor.total_applications.toLocaleString('en-US')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Certification Rate</div>
                            <div className="text-lg font-semibold text-green-600">
                              {sponsor.approval_rate}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <DollarSign className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Avg Salary</div>
                            <div className="text-lg font-semibold text-blue-600">
                              ${(sponsor.avg_salary / 1000).toFixed(0)}K
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Salary Range</div>
                            <div className="text-sm font-medium text-gray-700">
                              ${(sponsor.min_salary / 1000).toFixed(0)}K - ${(sponsor.max_salary / 1000).toFixed(0)}K
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Top Locations</div>
                            <div className="text-sm text-gray-700">
                              {sponsor.top_states.slice(0, 3).join(', ') || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job titles */}
                      {sponsor.top_job_titles.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <div className="text-sm text-gray-500 mb-1">Popular Job Titles</div>
                            <div className="flex flex-wrap gap-2">
                              {sponsor.top_job_titles.slice(0, 3).map((title, idx) => (
                                <Link
                                  key={idx}
                                  href={`/h1b-dashboard/job/${slugify(title)}?title=${encodeURIComponent(title)}`}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                                >
                                  {title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          baseUrl="/h1b-sponsors"
          searchParams={{
            search,
            industry,
            state,
            minSalary,
            maxSalary,
            ...(sort !== 'applications' && { sort }),
          }}
        />
        
        {/* Data metadata */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            FY {LATEST_DATA_FISCAL_YEAR} H1B sponsor data (since {FISCAL_YEAR_START}) | Source: U.S. Department of Labor LCA Database
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Rankings based on total LCA applications filed. Data updated quarterly.
          </p>
        </div>
      </div>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@docujourney/ui';
import { Search, TrendingUp } from 'lucide-react';
import { EmployersHero } from '@/components/h1b-dashboard/EmployersHero';
import { ClientErrorBoundary } from './ClientErrorBoundary';
import Link from 'next/link';

interface H1BSponsor {
  employer: string;
  totalApplications: number;
  approvalRate: number;
  avgSalary: number;
  topStates: string[];
  topJobTitles: string[];
  fiscalYear: string;
  rank: number;
}

interface FilterState {
  searchQuery: string;
  fiscalYear: string;
  salaryRange: [number, number];
  states: string[];
  cities: string[];
  jobCategories: string[];
  skillLevels: string[];
  companySizes: string[];
  companyTypes: string[];
}

export function H1BSponsorsClient() {
  const [sponsors, setSponsors] = useState<H1BSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSponsors, setFilteredSponsors] = useState<H1BSponsor[]>([]);
  const [mounted, setMounted] = useState(false);

  // State for EmployersHero component
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    fiscalYear: '2024',
    salaryRange: [0, 500000],
    states: [],
    cities: [],
    jobCategories: [],
    skillLevels: [],
    companySizes: [],
    companyTypes: [],
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    fetchSponsors();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSponsors(sponsors);
    } else {
      setFilteredSponsors(
        sponsors.filter(sponsor =>
          sponsor.employer.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, sponsors]);

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/h1b-data?category=topEmployers&limit=20');
      if (response.ok) {
        const data = await response.json();
        const currentYear = String(new Date().getFullYear());
        const mappedSponsors = data.data?.topEmployers?.map((employer: any, index: number) => ({
          employer: employer.employer_name || employer.employer,
          totalApplications: employer.applications || employer.total_applications,
          approvalRate: employer.approval_rate || employer.approvalRate || 89.2,
          avgSalary: employer.avg_salary || employer.avgSalary || 95000,
          topStates: employer.top_states || ['CA', 'NY', 'TX'],
          topJobTitles: employer.top_job_titles || ['Software Engineer', 'Data Analyst', 'Product Manager'],
          fiscalYear: currentYear,
          rank: index + 1,
        })) || [];

        setSponsors(mappedSponsors);
        setFilteredSponsors(mappedSponsors);
      } else {
        console.warn('API response not ok, using fallback data');
      }
    } catch (error) {
      console.warn('API error, using fallback data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleHeroSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    if (suggestion.type === 'employer') {
      setSearchTerm(suggestion.text);
    }
  };

  const getCompanySlug = (companyName: string) => {
    return companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-6">
              Loading H1B Sponsors...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientErrorBoundary>
      {/* Hero Section - Keep existing EmployersHero but change title */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <EmployersHero
          filters={filters}
          setFilters={setFilters}
          onSearch={handleHeroSearch}
          onSuggestionSelect={handleSuggestionSelect}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top Sponsors Directory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              Top H1B Sponsor Companies 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading sponsors...</div>
            ) : filteredSponsors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sponsors data available at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">Please try again later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSponsors.slice(0, 100).map((sponsor, index) => (
                  <div key={sponsor.employer} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                          <Link
                            href={`/h1b-dashboard/company/${getCompanySlug(sponsor.employer)}?name=${encodeURIComponent(sponsor.employer)}`}
                            className="text-xl font-bold text-blue-600 hover:text-blue-800"
                          >
                            {sponsor.employer}
                          </Link>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <div className="text-sm text-gray-500">Total Applications</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {sponsor.totalApplications.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Approval Rate</div>
                            <div className="text-lg font-semibold text-green-600">
                              {sponsor.approvalRate}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Average Salary</div>
                            <div className="text-lg font-semibold text-blue-600">
                              ${sponsor.avgSalary.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Top Locations</div>
                            <div className="text-sm text-gray-700">
                              {sponsor.topStates.join(', ')}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-sm text-gray-500 mb-1">Popular Job Titles</div>
                          <div className="flex flex-wrap gap-2">
                            {sponsor.topJobTitles.slice(0, 3).map((title, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientErrorBoundary>
  );
}
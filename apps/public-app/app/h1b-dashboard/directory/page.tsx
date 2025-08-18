import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { Building2, Briefcase, MapPin, Scale } from 'lucide-react';

interface Company {
  name: string;
  slug: string;
  applications: number;
}

interface Job {
  title: string;
  slug: string;
  applications: number;
}

interface State {
  name: string;
  slug: string;
  code: string;
}

interface City {
  name: string;
  slug: string;
  state: string;
}

export const metadata: Metadata = {
  title: 'H1B Data Directory - All Companies, Jobs & Locations | Immigrant Central',
  description: 'Complete directory of H1B visa data including all companies, job titles, locations, and attorneys. Browse comprehensive H1B sponsorship information and immigration statistics.',
  keywords: [
    'H1B directory',
    'H1B companies list',
    'H1B jobs directory',
    'H1B sponsors directory',
    'immigration directory',
    'H1B data index',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

async function fetchTopCompanies(): Promise<Company[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com'}/api/h1b-data?category=topEmployers&limit=50`);
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return (data.data?.topEmployers || [])
      .filter((company: any) => company.employer_name && typeof company.employer_name === 'string')
      .map((company: any) => ({
        name: company.employer_name,
        slug: company.employer_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        applications: company.applications || 0,
      }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

async function fetchTopJobs(): Promise<Job[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com'}/api/h1b-data?category=topJobTitles&limit=50`);
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return (data.data?.topJobTitles || [])
      .filter((job: any) => job.job_title && typeof job.job_title === 'string')
      .map((job: any) => ({
        title: job.job_title,
        slug: job.job_title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        applications: job.applications || 0,
      }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export default async function DirectoryPage() {
  const [topCompanies, topJobs] = await Promise.all([
    fetchTopCompanies(),
    fetchTopJobs(),
  ]);

  const majorStates = [
    { name: 'California', slug: 'california', code: 'CA' },
    { name: 'Texas', slug: 'texas', code: 'TX' },
    { name: 'New York', slug: 'new-york', code: 'NY' },
    { name: 'Washington', slug: 'washington', code: 'WA' },
    { name: 'Illinois', slug: 'illinois', code: 'IL' },
    { name: 'Massachusetts', slug: 'massachusetts', code: 'MA' },
    { name: 'New Jersey', slug: 'new-jersey', code: 'NJ' },
    { name: 'Florida', slug: 'florida', code: 'FL' },
    { name: 'Virginia', slug: 'virginia', code: 'VA' },
    { name: 'Georgia', slug: 'georgia', code: 'GA' },
  ];

  const majorCities = [
    { name: 'New York', state: 'New York', slug: 'new-york' },
    { name: 'San Francisco', state: 'California', slug: 'san-francisco' },
    { name: 'Seattle', state: 'Washington', slug: 'seattle' },
    { name: 'Austin', state: 'Texas', slug: 'austin' },
    { name: 'Boston', state: 'Massachusetts', slug: 'boston' },
    { name: 'Chicago', state: 'Illinois', slug: 'chicago' },
    { name: 'Atlanta', state: 'Georgia', slug: 'atlanta' },
    { name: 'Dallas', state: 'Texas', slug: 'dallas' },
    { name: 'Los Angeles', state: 'California', slug: 'los-angeles' },
    { name: 'San Jose', state: 'California', slug: 'san-jose' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">H1B Data Directory</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive directory of H1B visa data including companies, job titles, locations, and attorneys.
          Explore detailed immigration statistics and sponsorship information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Top H1B Sponsor Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCompanies.slice(0, 20).map((company) => (
                <Link
                  key={company.slug}
                  href={`/h1b-dashboard/company/${company.slug}?name=${encodeURIComponent(company.name)}`}
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground hover:text-primary">
                      {company.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {company.applications.toLocaleString()} applications
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                href="/h1b-dashboard/employers"
                className="block text-center p-3 text-primary hover:underline"
              >
                View All Companies →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Job Titles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Top H1B Job Titles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topJobs.slice(0, 20).map((job) => (
                <Link
                  key={job.slug}
                  href={`/h1b-dashboard/job/${job.slug}?title=${encodeURIComponent(job.title)}`}
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground hover:text-primary">
                      {job.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {job.applications.toLocaleString()} applications
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                href="/h1b-dashboard/jobs"
                className="block text-center p-3 text-primary hover:underline"
              >
                View All Job Titles →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Major States */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              H1B Data by State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {majorStates.map((state) => (
                <Link
                  key={state.slug}
                  href={`/h1b-dashboard/locations/${state.slug}?state=${encodeURIComponent(state.code)}`}
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground hover:text-primary">
                    {state.name}
                  </span>
                </Link>
              ))}
              <Link
                href="/h1b-dashboard/locations"
                className="block text-center p-3 text-primary hover:underline"
              >
                View All States →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Major Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              H1B Data by City
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {majorCities.map((city) => (
                <Link
                  key={`${city.slug}-${city.state}`}
                  href={`/h1b-dashboard/locations/${city.state.toLowerCase().replace(/\s+/g, '-')}/${city.slug}?city=${encodeURIComponent(city.name)}&state=${encodeURIComponent(city.state)}`}
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground hover:text-primary">
                    {city.name}, {city.state}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Content */}
      <div className="prose max-w-none">
        <h2>About H1B Data Directory</h2>
        <p>
          This comprehensive directory provides access to detailed H1B visa data from 2016-2025, 
          covering millions of applications, thousands of companies, and extensive geographic and 
          occupational information. Use this directory to research H1B sponsorship opportunities, 
          salary benchmarks, and immigration trends.
        </p>
        
        <h3>What You Can Find</h3>
        <ul>
          <li><strong>Company Data:</strong> H1B sponsorship history, salary ranges, and approval rates for thousands of employers</li>
          <li><strong>Job Information:</strong> Salary data, requirements, and sponsorship patterns by job title</li>
          <li><strong>Location Analytics:</strong> Geographic distribution of H1B applications and regional salary data</li>
          <li><strong>Attorney Performance:</strong> Immigration attorney success rates and case volume</li>
        </ul>
      </div>
    </div>
  );
}
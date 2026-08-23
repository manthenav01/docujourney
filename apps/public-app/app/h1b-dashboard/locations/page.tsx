import Link from 'next/link';
import { Metadata } from 'next';
import {
  generateMetadata as generateMetadataUtil,
  slugify,
  STATE_CODE_TO_NAME,
  BASE_METADATA,
  DATA_YEAR,
} from '@docujourney/utils';
import { getStateSEOData } from '@/lib/seoData';

// A real directory page: every state with filing counts and salary data,
// linking to its state page. (This previously rendered the generic homepage
// dashboard under a different hero.)
export const revalidate = 86400;

export const metadata: Metadata = generateMetadataUtil({
  title: `H1B Visa Jobs by Location ${DATA_YEAR} - Salaries & Sponsors by State & City`,
  description: 'Browse H1B visa filings by state and city: application volumes, average salaries, and top sponsoring employers for every US state, from official Department of Labor data.',
  keywords: ['H1B locations', 'H1B by state', 'H1B jobs by city', 'H1B salary by state', 'H1B visa sponsors by location'],
  path: '/h1b-dashboard/locations',
  type: 'website',
});

// Curated high-volume metros; each links to its hierarchical city page
const MAJOR_CITIES: Array<{ city: string; stateSlug: string; citySlug: string }> = [
  { city: 'New York, NY', stateSlug: 'new-york', citySlug: 'new-york' },
  { city: 'San Francisco, CA', stateSlug: 'california', citySlug: 'san-francisco' },
  { city: 'San Jose, CA', stateSlug: 'california', citySlug: 'san-jose' },
  { city: 'Seattle, WA', stateSlug: 'washington', citySlug: 'seattle' },
  { city: 'Austin, TX', stateSlug: 'texas', citySlug: 'austin' },
  { city: 'Dallas, TX', stateSlug: 'texas', citySlug: 'dallas' },
  { city: 'Houston, TX', stateSlug: 'texas', citySlug: 'houston' },
  { city: 'Chicago, IL', stateSlug: 'illinois', citySlug: 'chicago' },
  { city: 'Boston, MA', stateSlug: 'massachusetts', citySlug: 'boston' },
  { city: 'Atlanta, GA', stateSlug: 'georgia', citySlug: 'atlanta' },
  { city: 'Charlotte, NC', stateSlug: 'north-carolina', citySlug: 'charlotte' },
  { city: 'Los Angeles, CA', stateSlug: 'california', citySlug: 'los-angeles' },
  { city: 'Denver, CO', stateSlug: 'colorado', citySlug: 'denver' },
  { city: 'Phoenix, AZ', stateSlug: 'arizona', citySlug: 'phoenix' },
  { city: 'Philadelphia, PA', stateSlug: 'pennsylvania', citySlug: 'philadelphia' },
  { city: 'Miami, FL', stateSlug: 'florida', citySlug: 'miami' },
];

const formatSalary = (value: number) =>
  value > 0 ? `$${Math.round(value / 1000)}K` : 'N/A';

export default async function LocationsPage() {
  const states = await getStateSEOData();
  const known = states.filter(s => STATE_CODE_TO_NAME[s.state]);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'H1B Visa Filings by US State',
    numberOfItems: known.length,
    itemListElement: known.slice(0, 25).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: STATE_CODE_TO_NAME[s.state],
      url: `${BASE_METADATA.url}/h1b-dashboard/locations/${slugify(STATE_CODE_TO_NAME[s.state])}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            H1B Visa Jobs by Location
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Filing volumes, average salaries, and top sponsors for every US state,
            based on official Department of Labor LCA disclosure data.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Major metros */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Major H1B Metro Areas</h2>
          <div className="flex flex-wrap gap-2">
            {MAJOR_CITIES.map(({ city, stateSlug, citySlug }) => (
              <Link
                key={`${stateSlug}-${citySlug}`}
                href={`/h1b-dashboard/locations/${stateSlug}/${citySlug}`}
                className="px-3 py-1.5 bg-muted/20 hover:bg-muted/40 rounded-full text-sm text-foreground border border-border/40 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>

        {/* All states */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            H1B Filings by State
          </h2>
          {known.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {known.map(s => {
                const fullName = STATE_CODE_TO_NAME[s.state];
                return (
                  <Link
                    key={s.state}
                    href={`/h1b-dashboard/locations/${slugify(fullName)}`}
                    className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 border border-border/40 transition-colors"
                  >
                    <div className="font-medium text-foreground">{fullName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {s.applications.toLocaleString('en-US')} filings
                      {s.avgSalary > 0 && <> · avg {formatSalary(s.avgSalary)}</>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            // Data fetch failed — still render the full directory of links
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {Object.values(STATE_CODE_TO_NAME).map(fullName => (
                <Link
                  key={fullName}
                  href={`/h1b-dashboard/locations/${slugify(fullName)}`}
                  className="px-3 py-2 bg-muted/20 rounded-lg hover:bg-muted/30 text-sm text-foreground"
                >
                  {fullName}
                </Link>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Counts cover all fiscal years (2016–{DATA_YEAR}) and include US territories where filings exist.
          </p>
        </section>
      </div>
    </>
  );
}

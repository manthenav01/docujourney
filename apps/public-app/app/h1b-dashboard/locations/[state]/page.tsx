import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import StatePageClient from './StatePageClient';
import { BASE_METADATA, DATA_YEAR, STATE_CODE_TO_NAME, slugify } from '@docujourney/utils';
import { getStateSEOData, approvalRate, saneSalary } from '@/lib/seoData';

// ISR: state aggregates change only when new quarterly DOL data lands.
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Resolve a URL slug to a known state; unknown slugs must 404 rather than
// render an indexable page for any invented location.
function resolveState(slug: string): { code: string; name: string } | null {
  for (const [code, name] of Object.entries(STATE_CODE_TO_NAME)) {
    if (slugify(name) === slug) {
      return { code, name };
    }
  }
  return null;
}

export function generateStaticParams() {
  return Object.values(STATE_CODE_TO_NAME).map(name => ({ state: slugify(name) }));
}

const formatSalary = (value: number) =>
  value > 0 ? `$${Math.round(value).toLocaleString('en-US')}` : 'N/A';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const resolved = resolveState(state);
  if (!resolved) {
    return { robots: 'noindex, nofollow' };
  }
  const stateName = resolved.name;

  const states = await getStateSEOData();
  const stats = states.find(s => s.state === resolved.code);
  const avgSalary = saneSalary(stats?.avgSalary);

  const title = `H1B Jobs in ${stateName} ${DATA_YEAR} | Visa Sponsors & Salary Data by State`;
  const description = stats
    ? `${stats.applications.toLocaleString('en-US')} H1B LCA applications filed in ${stateName}${avgSalary ? ` with an average salary of ${formatSalary(avgSalary)}` : ''}. Top sponsoring companies, salary ranges, and certification rates from official US Department of Labor data.`
    : `H1B visa jobs and sponsoring companies in ${stateName}. View salary ranges, top employers, approval rates, and visa sponsorship opportunities across all cities in ${stateName}.`;

  const baseUrl = BASE_METADATA.url;
  const canonicalUrl = `${baseUrl}/h1b-dashboard/locations/${state}`;

  return {
    title,
    description,
    keywords: [
      `H1B ${stateName}`,
      `${stateName} H1B jobs`,
      `${stateName} visa sponsors`,
      `${stateName} H1B salary`,
      `H1B companies ${stateName}`,
      `${stateName} visa jobs`,
      'H1B sponsorship',
      'visa job opportunities',
      'H1B employer data',
      'state H1B analytics',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Immigrant Central',
      images: [
        {
          url: `${baseUrl}/api/og?type=state&state=${encodeURIComponent(stateName)}`,
          width: 1200,
          height: 630,
          alt: `H1B Jobs and Visa Sponsors in ${stateName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?type=state&state=${encodeURIComponent(stateName)}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { state } = await params;
  const resolved = resolveState(state);
  if (!resolved) {
    notFound();
  }
  const stateName = resolved.name;

  const states = await getStateSEOData();
  const stats = states.find(s => s.state === resolved.code);
  const rate = stats ? approvalRate(stats.applications, stats.certifiedApplications) : 0;
  const avgSalary = saneSalary(stats?.avgSalary);
  const pageUrl = `${BASE_METADATA.url}/h1b-dashboard/locations/${state}`;

  // Other high-volume states for crawlable cross-links (no extra query:
  // getStateSEOData is one cached scan shared with the directory page).
  const otherStates = states
    .filter(s => s.state !== resolved.code && STATE_CODE_TO_NAME[s.state])
    .slice(0, 8)
    .map(s => ({ code: s.state, name: STATE_CODE_TO_NAME[s.state] }));

  const structuredData: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_METADATA.url },
        { '@type': 'ListItem', position: 2, name: 'Locations', item: `${BASE_METADATA.url}/h1b-dashboard/locations` },
        { '@type': 'ListItem', position: 3, name: stateName, item: pageUrl },
      ],
    },
  ];
  if (stats) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `H1B Visa Data for ${stateName}`,
      description: `H1B LCA filings in ${stateName}: ${stats.applications.toLocaleString('en-US')} applications, ${rate.toFixed(1)}% certification rate${avgSalary ? `, average salary ${formatSalary(avgSalary)}` : ''}.`,
      url: pageUrl,
      isAccessibleForFree: true,
      creator: { '@type': 'Organization', name: 'Immigrant Central', url: BASE_METADATA.url },
      license: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
    });
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `How many H1B visas are filed in ${stateName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Employers filed ${stats.applications.toLocaleString('en-US')} H1B Labor Condition Applications for worksites in ${stateName}, with a ${rate.toFixed(1)}% certification rate, according to US Department of Labor disclosure data.`,
          },
        },
        ...(avgSalary ? [{
          '@type': 'Question',
          name: `What is the average H1B salary in ${stateName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `The average offered H1B salary in ${stateName} is ${formatSalary(avgSalary)} per year, based on certified LCA filings.`,
          },
        }] : []),
      ],
    });
  }

  return (
    <>
      {structuredData.map((sd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
        />
      ))}

      {/* useSearchParams inside needs a Suspense boundary now that these
          pages are statically prerendered via generateStaticParams. */}
      <Suspense fallback={null}>
        <StatePageClient stateSlug={state} />
      </Suspense>

      {/* Server-rendered summary: crawlable content with real numbers.
          The interactive dashboard above hydrates client-side as before. */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
          <h1 className="text-xl font-semibold text-foreground mb-3">
            H1B Jobs in {stateName}: Visa Sponsors & Salary Data ({DATA_YEAR})
          </h1>
          {stats ? (
            <>
              <p className="text-muted-foreground mb-4">
                Employers filed{' '}
                <strong className="text-foreground">{stats.applications.toLocaleString('en-US')}</strong>{' '}
                H1B Labor Condition Applications for worksites in {stateName} with a{' '}
                <strong className="text-foreground">{rate.toFixed(1)}%</strong> certification rate,
                based on official US Department of Labor disclosure data.
                {avgSalary && (
                  <> The average offered salary is{' '}
                  <strong className="text-foreground">{formatSalary(avgSalary)}</strong> per year.</>
                )}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="font-semibold text-foreground">{stats.applications.toLocaleString('en-US')}</div>
                  <div className="text-xs text-muted-foreground">LCA Applications</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{rate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Certification Rate</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{avgSalary ? formatSalary(avgSalary) : 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">Average Salary</div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mb-4">
              Explore H1B visa sponsors, salary ranges, and certification rates for {stateName},
              based on official US Department of Labor disclosure data.
            </p>
          )}
          {otherStates.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Compare with other states:{' '}
              {otherStates.map((s, i) => (
                <span key={s.code}>
                  {i > 0 && ', '}
                  <Link href={`/h1b-dashboard/locations/${slugify(s.name)}`} className="text-primary hover:underline">
                    {s.name}
                  </Link>
                </span>
              ))}
              {' '}or browse{' '}
              <Link href="/h1b-dashboard/locations" className="text-primary hover:underline">
                all H1B locations
              </Link>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

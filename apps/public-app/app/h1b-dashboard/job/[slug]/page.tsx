import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JobPageClient from './JobPageClient';
import { generateH1BMetadata, slugToDisplayName, slugify, BASE_METADATA, DATA_YEAR, STATE_CODE_TO_NAME } from '@docujourney/utils';
import { getJobSEOData, getTopSlugs, approvalRate, saneSalary } from '@/lib/seoData';

// ISR: job aggregates change only when new quarterly DOL data lands.
// (Was force-dynamic, which made every crawl a live render with no cache.)
export const revalidate = 86400;
export const dynamicParams = true;

// Prebuild the highest-traffic job pages at deploy time; the long tail stays
// ISR-on-demand. Fails soft to [] if BigQuery is unavailable at build.
export async function generateStaticParams() {
  const slugs = await getTopSlugs('agg_job_summary', 100);
  return slugs.map(slug => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Metadata derives from the slug only — reading searchParams here would force
// dynamic rendering and break ISR caching for crawlers.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Display title comes from the slug (proper case); the raw DB title is all-caps.
  const jobTitle = slugToDisplayName(slug);
  const { data } = await getJobSEOData(slug);

  return generateH1BMetadata({
    jobTitle,
    path: `/h1b-dashboard/job/${slug}`,
    stats: data ? {
      totalApplications: data.totalApplications,
      approvalRate: approvalRate(data.totalApplications, data.certifiedApplications),
      avgSalary: saneSalary(data.avgSalary),
      medianSalary: saneSalary(data.medianSalary),
      minSalary: saneSalary(data.minSalary),
      maxSalary: saneSalary(data.maxSalary),
      uniqueEmployers: data.uniqueEmployers,
    } : undefined,
  });
}

const formatSalary = (value: number) =>
  value > 0 ? `$${Math.round(value).toLocaleString('en-US')}` : 'N/A';

export default async function JobPage({ params }: PageProps) {
  const { slug } = await params;
  const jobTitle = slugToDisplayName(slug);
  const { data, lookupFailed } = await getJobSEOData(slug);
  // Unknown slug -> real 404 (see company/[slug]/page.tsx).
  if (!data && !lookupFailed) {
    notFound();
  }
  const pageUrl = `${BASE_METADATA.url}/h1b-dashboard/job/${slug}`;

  const avgSalary = saneSalary(data?.avgSalary);
  const medianSalary = saneSalary(data?.medianSalary);
  const minSalary = saneSalary(data?.minSalary);
  const maxSalary = saneSalary(data?.maxSalary);

  const structuredData: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${jobTitle} H1B Salary Data`,
      description: `H1B visa salary information and sponsorship statistics for ${jobTitle} positions.`,
      url: pageUrl,
      isAccessibleForFree: true,
      creator: {
        '@type': 'Organization',
        name: 'Immigrant Central',
        url: BASE_METADATA.url,
      },
      license: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
      variableMeasured: ['Salary', 'Visa Status', 'Employer'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_METADATA.url },
        { '@type': 'ListItem', position: 2, name: 'H1B Jobs', item: `${BASE_METADATA.url}/h1b-dashboard/jobs` },
        { '@type': 'ListItem', position: 3, name: `${jobTitle} H1B Data`, item: pageUrl },
      ],
    },
  ];

  // Occupation schema with real salary distribution — this is the schema type
  // Google uses for salary estimate rich results.
  if (data && medianSalary) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Occupation',
      name: jobTitle,
      description: `${jobTitle} positions sponsored under the H1B visa program in the United States.`,
      estimatedSalary: [{
        '@type': 'MonetaryAmountDistribution',
        name: 'base',
        currency: 'USD',
        duration: 'P1Y',
        median: Math.round(medianSalary),
        ...(minSalary && { percentile10: Math.round(minSalary) }),
        ...(maxSalary && { percentile90: Math.round(maxSalary) }),
      }],
      occupationLocation: [{ '@type': 'Country', name: 'United States' }],
      mainEntityOfPage: pageUrl,
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

      <JobPageClient slug={slug} jobTitle={jobTitle} />

      {/* Server-rendered summary: crawlable content with real numbers. */}
      {data && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
            {/* Page H1 lives here so it is present in the server HTML;
                the client dashboard header above renders as a styled div. */}
            <h1 className="text-xl font-semibold text-foreground mb-3">
              {jobTitle} H1B Salary & Sponsorship Overview ({DATA_YEAR})
            </h1>
            <p className="text-muted-foreground mb-4">
              Employers filed{' '}
              <strong className="text-foreground">{data.totalApplications.toLocaleString('en-US')}</strong>{' '}
              H1B Labor Condition Applications for {jobTitle} positions, based on official
              US Department of Labor disclosure data.
              {avgSalary && (
                <> The average offered salary is{' '}
                <strong className="text-foreground">{formatSalary(avgSalary)}</strong>
                {medianSalary && medianSalary !== avgSalary && <> (median {formatSalary(medianSalary)})</>}
                {minSalary && maxSalary && (
                  <>, with reported wages ranging from {formatSalary(minSalary)} to {formatSalary(maxSalary)}</>
                )}
                {data.uniqueEmployers > 0 && (
                  <> across <strong className="text-foreground">{data.uniqueEmployers.toLocaleString('en-US')}</strong> sponsoring employers</>
                )}.</>
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="font-semibold text-foreground">{avgSalary ? formatSalary(avgSalary) : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Average Salary</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{medianSalary ? formatSalary(medianSalary) : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Median Salary</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{data.totalApplications.toLocaleString('en-US')}</div>
                <div className="text-xs text-muted-foreground">LCA Applications</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{data.uniqueEmployers > 0 ? data.uniqueEmployers.toLocaleString('en-US') : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Sponsoring Employers</div>
              </div>
            </div>
            {data.topEmployers?.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Top H1B sponsors for {jobTitle}:{' '}
                {data.topEmployers.slice(0, 5).filter(e => e.employer).map((e, i) => (
                  <span key={e.employer}>
                    {i > 0 && '; '}
                    <Link href={`/h1b-dashboard/company/${slugify(e.employer)}`} className="text-primary hover:underline">
                      {e.employer}
                    </Link>
                  </span>
                ))}.
                {data.topStates?.length > 0 && (
                  <>
                    {' '}Most filings in:{' '}
                    {data.topStates.slice(0, 3).map((st, i) => {
                      const full = STATE_CODE_TO_NAME[st.state];
                      return (
                        <span key={st.state}>
                          {i > 0 && ', '}
                          {full ? (
                            <Link href={`/h1b-dashboard/locations/${slugify(full)}`} className="text-primary hover:underline">
                              {st.state}
                            </Link>
                          ) : st.state}
                        </span>
                      );
                    })}.
                  </>
                )}
              </p>
            )}
          </div>
        </section>
      )}
    </>
  );
}

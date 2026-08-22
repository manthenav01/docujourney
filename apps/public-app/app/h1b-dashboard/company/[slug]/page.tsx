import Link from 'next/link';
import CompanyPageClient from './CompanyPageClient';
import { generateH1BMetadata, generateStructuredData, slugToDisplayName, slugify, BASE_METADATA, DATA_YEAR, STATE_CODE_TO_NAME } from '@docujourney/utils';
import { Metadata } from 'next';
import { getCompanySEOData, getTopSlugs, approvalRate, saneSalary, cleanTopRoles } from '@/lib/seoData';

// ISR: company data changes at most quarterly (DOL disclosure files),
// so a daily revalidation keeps pages fresh and BigQuery costs near zero.
export const revalidate = 86400;
export const dynamicParams = true;

// Prebuild the highest-traffic company pages at deploy time; the long tail
// stays ISR-on-demand. Fails soft to [] if BigQuery is unavailable at build.
export async function generateStaticParams() {
  const slugs = await getTopSlugs('agg_company_summary', 100);
  return slugs.map(slug => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Display name comes from the slug (proper case); the raw DB name is all-caps.
  const companyName = slugToDisplayName(slug);
  const data = await getCompanySEOData(slug);

  return generateH1BMetadata({
    companyName,
    path: `/h1b-dashboard/company/${slug}`,
    stats: data ? {
      totalApplications: data.totalApplications,
      approvalRate: approvalRate(data.totalApplications, data.certifiedApplications),
      avgSalary: saneSalary(data.avgSalary),
      minSalary: saneSalary(data.minSalary),
      maxSalary: saneSalary(data.maxSalary),
    } : undefined,
  });
}

const formatSalary = (value: number) =>
  value > 0 ? `$${Math.round(value).toLocaleString('en-US')}` : 'N/A';

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  // Proper-case name from the slug for all rendered copy (the raw DB name is
  // all-caps). The client dashboard resolves the exact DB name itself.
  const companyName = slugToDisplayName(slug);
  const data = await getCompanySEOData(slug);
  const pageUrl = `${BASE_METADATA.url}/h1b-dashboard/company/${slug}`;

  const rate = data ? approvalRate(data.totalApplications, data.certifiedApplications) : 0;
  const avgSalary = saneSalary(data?.avgSalary);
  const minSalary = saneSalary(data?.minSalary);
  const maxSalary = saneSalary(data?.maxSalary);
  const topRoles = cleanTopRoles(data?.topJobTitles, 5);

  const structuredData: object[] = [
    generateStructuredData('company', { name: companyName }),
  ];

  if (data) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${companyName} H1B Visa Sponsorship Data`,
      description: `H1B LCA filings for ${companyName}: ${data.totalApplications.toLocaleString('en-US')} applications, ${rate.toFixed(1)}% approval rate${avgSalary ? `, average salary ${formatSalary(avgSalary)}` : ''}.`,
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
          name: `Does ${companyName} sponsor H1B visas?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Yes. ${companyName} has filed ${data.totalApplications.toLocaleString('en-US')} H1B Labor Condition Applications (LCAs) with a ${rate.toFixed(1)}% certification rate, according to US Department of Labor disclosure data.`,
          },
        },
        ...(avgSalary ? [{
          '@type': 'Question',
          name: `What is the average H1B salary at ${companyName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `The average H1B salary at ${companyName} is ${formatSalary(avgSalary)} per year${minSalary && maxSalary ? `, with reported salaries ranging from ${formatSalary(minSalary)} to ${formatSalary(maxSalary)}` : ''}.`,
          },
        }] : []),
        ...(topRoles.length ? [{
          '@type': 'Question',
          name: `What jobs does ${companyName} sponsor for H1B?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `The most sponsored H1B roles at ${companyName} include ${topRoles.join('; ')}.`,
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

      <CompanyPageClient slug={slug} companyName={companyName} />

      {/* Server-rendered summary: crawlable content with real numbers.
          The interactive dashboard above hydrates client-side as before. */}
      {data && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              {companyName} H1B Visa Sponsorship Overview ({DATA_YEAR})
            </h2>
            <p className="text-muted-foreground mb-4">
              {companyName} has filed{' '}
              <strong className="text-foreground">{data.totalApplications.toLocaleString('en-US')}</strong>{' '}
              H1B Labor Condition Applications with a{' '}
              <strong className="text-foreground">{rate.toFixed(1)}%</strong> certification rate,
              based on official US Department of Labor disclosure data.
              {avgSalary && (
                <> The average offered salary is{' '}
                <strong className="text-foreground">{formatSalary(avgSalary)}</strong> per year
                {minSalary && maxSalary && (
                  <>, with reported wages ranging from {formatSalary(minSalary)} to {formatSalary(maxSalary)}</>
                )}.</>
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="font-semibold text-foreground">{data.totalApplications.toLocaleString('en-US')}</div>
                <div className="text-xs text-muted-foreground">LCA Applications</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{rate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Approval Rate</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{avgSalary ? formatSalary(avgSalary) : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Average Salary</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{maxSalary ? formatSalary(maxSalary) : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Top Salary</div>
              </div>
            </div>
            {topRoles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Most sponsored roles:{' '}
                {topRoles.map((role, i) => (
                  <span key={role}>
                    {i > 0 && '; '}
                    <Link href={`/h1b-dashboard/job/${slugify(role)}`} className="text-primary hover:underline">
                      {role}
                    </Link>
                  </span>
                ))}.
                {data.topStates?.length > 0 && (
                  <>
                    {' '}Top worksite states:{' '}
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

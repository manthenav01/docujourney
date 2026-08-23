import Link from 'next/link';
import HomeClient from './HomeClient';
import { generateStructuredData, slugToDisplayName, slugify, STATE_CODE_TO_NAME } from '@docujourney/utils';
import { getTopSlugs } from '@/lib/seoData';

// ISR: the browse links below come from the BigQuery aggregate tables and
// change at most quarterly; daily revalidation matches the entity pages.
export const revalidate = 86400;

// Server-rendered browse section: gives crawlers real links from the homepage
// into the programmatic company/job/state pages, which are otherwise only
// discoverable via sitemaps. Fails soft to fewer links if BigQuery is down.
async function BrowseSection() {
  const [companySlugs, jobSlugs] = await Promise.all([
    getTopSlugs('agg_company_summary', 24),
    getTopSlugs('agg_job_summary', 18),
  ]);

  const states = Object.values(STATE_CODE_TO_NAME);

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold text-foreground mb-6">Browse H1B Data</h2>

      {companySlugs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-foreground mb-3">Top H1B Sponsor Companies</h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {companySlugs.map(slug => (
              <li key={slug}>
                <Link href={`/h1b-dashboard/company/${slug}`} className="text-primary hover:underline">
                  {slugToDisplayName(slug)} H1B Data
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {jobSlugs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-foreground mb-3">H1B Salaries by Job Title</h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {jobSlugs.map(slug => (
              <li key={slug}>
                <Link href={`/h1b-dashboard/job/${slug}`} className="text-primary hover:underline">
                  {slugToDisplayName(slug)} H1B Salary
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-medium text-foreground mb-3">H1B Jobs by State</h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {states.map(name => (
            <li key={name}>
              <Link href={`/h1b-dashboard/locations/${slugify(name)}`} className="text-primary hover:underline">
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Tools & Resources</h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <li><Link href="/h1b-sponsors" className="text-primary hover:underline">H1B Sponsor Directory</Link></li>
          <li><Link href="/h1b-salary-calculator" className="text-primary hover:underline">H1B Salary Calculator</Link></li>
          <li><Link href="/h1b-dashboard/attorneys" className="text-primary hover:underline">Top H1B Attorneys</Link></li>
          <li><Link href="/h1b-dashboard/directory" className="text-primary hover:underline">Company Directory</Link></li>
          <li><Link href="/blog" className="text-primary hover:underline">H1B Blog</Link></li>
        </ul>
      </div>
    </section>
  );
}

export default function HomePage() {
  // Dataset schema rendered server-side (was injected via useEffect before,
  // which crawlers that skip JS never saw). WebSite/Organization schema comes
  // from the root layout.
  const datasetSchema = generateStructuredData('h1b-data');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <HomeClient browseSection={<BrowseSection />} />
    </>
  );
}

import { Metadata } from 'next';
import { DATA_YEAR } from '@docujourney/utils';

export const metadata: Metadata = {
  title: `H1B Sponsor Companies Directory ${DATA_YEAR} | Salaries & Certification Rates`,
  description: 'Directory of companies sponsoring H1B visas, ranked by filings with LCA certification rates, salary data, and hiring trends — including Amazon, Google, and Microsoft.',
  keywords: [
    'H1B sponsor companies',
    'H1B employers database',
    `H1B sponsor list ${DATA_YEAR}`,
    'companies that sponsor H1B visa',
    'H1B sponsoring employers',
    'best H1B sponsor companies',
    'H1B employer directory',
    'H1B sponsor search',
    'top H1B sponsors',
    'H1B company database',
    'H1B employer list',
    'visa sponsoring companies',
    'H1B petition employers',
    'immigration sponsor companies',
  ],
  openGraph: {
    title: `H1B Sponsor Companies Directory ${DATA_YEAR} | H1B Employers Database`,
    description: 'Complete directory of H1B sponsor companies with LCA certification rates, salary data, and hiring trends. Find employers actively hiring international talent.',
    url: 'https://www.usimmigrantcentral.com/h1b-sponsors',
    siteName: 'Immigrant Central',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `H1B Sponsor Companies Directory ${DATA_YEAR}`,
    description: 'Complete directory of H1B sponsor companies with certification rates and salary data.',
  },
  alternates: {
    canonical: 'https://www.usimmigrantcentral.com/h1b-sponsors',
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
  metadataBase: new URL('https://www.usimmigrantcentral.com'),
};

export default function H1BSponsorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Enhanced structured data for sponsor directory */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `H1B Sponsor Companies Directory ${DATA_YEAR}`,
            description: 'Complete directory of H1B sponsor companies with certification rates, salary data, and hiring trends.',
            url: 'https://www.usimmigrantcentral.com/h1b-sponsors',
            mainEntity: {
              '@type': 'ItemList',
              name: 'Top H1B Sponsor Companies',
              description: '170,000+ companies that sponsor H1B visas',
              numberOfItems: 170000,
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://www.usimmigrantcentral.com',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'H1B Sponsors',
                  item: 'https://www.usimmigrantcentral.com/h1b-sponsors',
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}
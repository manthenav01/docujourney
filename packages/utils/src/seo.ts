import { Metadata } from 'next';

// SEO Keywords for different pages
export const SEO_KEYWORDS = {
  h1b: [
    'H1B visa data',
    'H1B dashboard',
    'H1B salary information',
    'H1B sponsors',
    'H1B employers',
    'H1B analytics',
    'H1B wage information',
    'H1B visa statistics',
    'H1B application data',
    'H1B approval rates',
  ],
  immigration: [
    'immigration document management',
    'visa status tracking',
    'immigration documents',
    'visa application tracker',
    'immigration paperwork',
    'visa document organization',
    'immigration status updates',
    'visa timeline tracking',
  ],
  company: [
    'H1B sponsor companies',
    'H1B employer data',
    'company H1B statistics',
    'H1B job opportunities',
    'visa sponsoring employers',
    'H1B salary by company',
  ],
};

// Base metadata for the site
export const BASE_METADATA = {
  title: 'Immigrant Central - H1B Data Analytics Platform',
  description: 'Comprehensive H1B visa analytics, company data, and immigration insights. Access real-time H1B statistics, salary data, approval rates, and employer information.',
  siteName: 'Immigrant Central',
  url: 'https://usimmigrantcentral.com',
  image: '/assets/og-image.png',
  type: 'website',
};

// Generate metadata for different page types
export function generateMetadata({
  title,
  description,
  keywords = [],
  path = '',
  type = 'website',
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  type?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title.includes('Immigrant Central') ? title : `${title} | Immigrant Central`;
  const fullUrl = `${BASE_METADATA.url}${path}`;
  const fullImage = image || BASE_METADATA.image;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, ...SEO_KEYWORDS.immigration].join(', '),
    authors: [{ name: 'Immigrant Central Team' }],
    creator: 'Immigrant Central',
    publisher: 'Immigrant Central',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type: type as any,
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: BASE_METADATA.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: '@docujourney',
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

// H1B Dashboard specific metadata
export function generateH1BMetadata({
  companyName,
  location,
  jobTitle,
  salaryRange,
}: {
  companyName?: string;
  location?: string;
  jobTitle?: string;
  salaryRange?: string;
} = {}): Metadata {
  let title = 'H1B Visa Dashboard - Comprehensive H1B Analytics & Data';
  let description = 'Explore detailed H1B visa statistics, salary data, approval rates, and company analytics. Real-time H1B dashboard with comprehensive immigration data insights.';
  
  if (companyName) {
    title = `${companyName} H1B Data - Visa Sponsorship & Salary Analytics`;
    description = `Comprehensive H1B visa data for ${companyName}. View salary ranges, approval rates, job titles, and sponsorship statistics. Latest H1B analytics and trends.`;
  }

  const keywords = [
    ...SEO_KEYWORDS.h1b,
    ...(companyName ? [`${companyName} H1B`, `${companyName} visa sponsorship`] : []),
    ...(location ? [`H1B ${location}`, `visa jobs ${location}`] : []),
    ...(jobTitle ? [`${jobTitle} H1B`, `${jobTitle} visa`] : []),
  ];

  return generateMetadata({
    title,
    description,
    keywords,
    path: companyName ? `/h1b-dashboard/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}` : '/h1b-dashboard',
    type: 'article',
  });
}

// Generate JSON-LD structured data
export function generateStructuredData(type: 'website' | 'h1b-data' | 'company', data?: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BASE_METADATA.siteName,
    url: BASE_METADATA.url,
    description: BASE_METADATA.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_METADATA.url}/h1b-dashboard?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  switch (type) {
    case 'h1b-data':
      return {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'H1B Visa Analytics Dashboard',
        description: 'Comprehensive H1B visa data including salary information, approval rates, company sponsorship data, and immigration statistics.',
        url: `${BASE_METADATA.url}/h1b-dashboard`,
        keywords: SEO_KEYWORDS.h1b.join(', '),
        creator: {
          '@type': 'Organization',
          name: 'Immigrant Central',
        },
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `${BASE_METADATA.url}/api/h1b-data`,
        },
      };

    case 'company':
      return data ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        description: `H1B visa sponsorship data for ${data.name}. View salary ranges, job positions, and immigration statistics.`,
        url: `${BASE_METADATA.url}/h1b-dashboard/company/${encodeURIComponent(data.name.toLowerCase().replace(/\s+/g, '-'))}`,
        ...(data.website && { sameAs: [data.website] }),
      } : baseStructuredData;

    default:
      return baseStructuredData;
  }
}
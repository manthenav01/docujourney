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
// NOTE: the apex domain 307-redirects to www, so www is the canonical host.
export const BASE_METADATA = {
  title: 'Immigrant Central - H1B Data Analytics Platform',
  description: 'Comprehensive H1B visa analytics, company data, and immigration insights. Access real-time H1B statistics, salary data, approval rates, and employer information.',
  siteName: 'Immigrant Central',
  url: 'https://www.usimmigrantcentral.com',
  image: '/assets/og-image.png',
  type: 'website',
};

// Current calendar year, used to keep page titles fresh ("H1B Salary 2026 ...")
export const DATA_YEAR = new Date().getFullYear();

// Canonical slug scheme used across the whole app (nav, sitemaps, URL matching):
// lowercase, non-alphanumeric runs collapsed to single dashes, no leading/trailing dash.
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Convert a URL slug back to a human-readable display name.
// Common corporate suffixes and abbreviations are uppercased ("google-llc" -> "Google LLC").
const UPPERCASE_TOKENS = new Set([
  'llc', 'inc', 'llp', 'lp', 'plc', 'pllc', 'pc', 'pa', 'usa', 'us', 'it', 'ai', 'hr', 'iii', 'ii', 'iv',
]);

export function slugToDisplayName(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .filter(Boolean)
    .map(word => UPPERCASE_TOKENS.has(word)
      ? word.toUpperCase()
      : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCompactSalary(value: number): string {
  if (!value || value <= 0) return '';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

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
    keywords: [...keywords, ...SEO_KEYWORDS.h1b].join(', '),
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
      creator: '@immigracentral',
    },
    ...(noIndex ? {} : {
      alternates: {
        canonical: fullUrl,
      },
    }),
  };
}

// Optional real numbers used to enrich titles/descriptions on entity pages.
export interface H1BEntityStats {
  totalApplications?: number;
  approvalRate?: number;
  avgSalary?: number;
  medianSalary?: number;
  minSalary?: number;
  maxSalary?: number;
  uniqueEmployers?: number;
}

// H1B Dashboard specific metadata.
// Each entity type gets its own keyword-rich title, description, and — critically —
// its own canonical path. `path` should be the actual request path of the page;
// when omitted it is derived from the entity name with the shared slug scheme.
export function generateH1BMetadata({
  companyName,
  location,
  jobTitle,
  path,
  stats,
}: {
  companyName?: string;
  location?: string;
  jobTitle?: string;
  path?: string;
  stats?: H1BEntityStats;
} = {}): Metadata {
  let title = `H1B Visa Data Dashboard ${DATA_YEAR} - Salaries, Sponsors & Approval Rates`;
  let description = 'Explore detailed H1B visa statistics, salary data, approval rates, and company analytics. Real-time H1B dashboard with comprehensive immigration data insights.';
  let canonicalPath = path || '/h1b-dashboard';

  const apps = stats?.totalApplications;
  const avg = stats?.avgSalary ? formatCompactSalary(stats.avgSalary) : '';
  const range = stats?.minSalary && stats?.maxSalary
    ? `${formatCompactSalary(stats.minSalary)} - ${formatCompactSalary(stats.maxSalary)}`
    : '';
  const rate = stats?.approvalRate ? `${stats.approvalRate.toFixed(1)}%` : '';

  if (companyName) {
    title = `${companyName} H1B Visa Sponsorship ${DATA_YEAR}: Salaries, Approval Rate & LCA Data`;
    description = apps && avg
      ? `${companyName} filed ${apps.toLocaleString('en-US')} H1B LCA applications${rate ? ` with a ${rate} approval rate` : ''}. Average salary ${avg}${range ? ` (range ${range})` : ''}. Explore job titles, worksite locations, and hiring trends.`
      : `Does ${companyName} sponsor H1B visas? View ${companyName} H1B salaries, approval rates, LCA filings, job titles, and worksite locations. Official US Department of Labor data.`;
    canonicalPath = path || `/h1b-dashboard/company/${slugify(companyName)}`;
  } else if (jobTitle) {
    title = `${jobTitle} H1B Salary ${DATA_YEAR}: Average Pay, Top Sponsors & Visa Data`;
    const median = stats?.medianSalary ? formatCompactSalary(stats.medianSalary) : '';
    description = apps && avg
      ? `H1B salary for ${jobTitle}: average ${avg}${median && median !== avg ? `, median ${median}` : ''} across ${apps.toLocaleString('en-US')} LCA filings${stats?.uniqueEmployers ? ` from ${stats.uniqueEmployers.toLocaleString('en-US')} sponsoring employers` : ''}. Compare wages by company, state, and wage level.`
      : `H1B salary data for ${jobTitle} positions: average pay, salary ranges, top sponsoring companies, and visa statistics. Official US Department of Labor LCA data.`;
    canonicalPath = path || `/h1b-dashboard/job/${slugify(jobTitle)}`;
  } else if (location) {
    title = `H1B Jobs in ${location} ${DATA_YEAR}: Visa Sponsors & Salary Data`;
    description = apps && avg
      ? `${apps.toLocaleString('en-US')} H1B LCA applications filed in ${location} with an average salary of ${avg}. Find top H1B sponsoring companies, job titles, and salary trends in ${location}.`
      : `H1B visa jobs in ${location}: top sponsoring companies, salary ranges, approval rates, and hiring trends. Official US Department of Labor data.`;
    canonicalPath = path || '/h1b-dashboard/locations';
  }

  const keywords = [
    ...SEO_KEYWORDS.h1b,
    ...(companyName ? [`${companyName} H1B`, `${companyName} visa sponsorship`, `${companyName} H1B salary`, `does ${companyName} sponsor H1B`] : []),
    ...(location ? [`H1B ${location}`, `H1B jobs ${location}`, `visa sponsors ${location}`] : []),
    ...(jobTitle ? [`${jobTitle} H1B`, `${jobTitle} H1B salary`, `${jobTitle} visa sponsorship`] : []),
  ];

  return generateMetadata({
    title,
    description,
    keywords,
    path: canonicalPath,
    type: 'website',
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
        license: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
        isAccessibleForFree: true,
        creator: {
          '@type': 'Organization',
          name: 'Immigrant Central',
          url: BASE_METADATA.url,
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
        url: `${BASE_METADATA.url}/h1b-dashboard/company/${slugify(data.name)}`,
        ...(data.website && { sameAs: [data.website] }),
      } : baseStructuredData;

    default:
      return baseStructuredData;
  }
}

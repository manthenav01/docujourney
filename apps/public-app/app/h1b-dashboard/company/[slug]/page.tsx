import { Metadata } from 'next';
import { CompanyDashboard } from '@/components/h1b-dashboard';
import CompanyPageClient from './CompanyPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Extract company name from search params
  const companyName = Array.isArray(resolvedSearchParams.name) 
    ? resolvedSearchParams.name[0] 
    : resolvedSearchParams.name || slug.replace(/-/g, ' ').toUpperCase();
  
  // For production, you would fetch actual company data here
  // const companyData = await fetchCompanyData(companyName);
  
  const title = `${companyName} H1B Visa Sponsorship Data 2025 | Salary & Approval Rates`;
  const description = `${companyName} H1B visa sponsorship analytics: View detailed salary ranges, approval rates, job titles, and visa sponsorship trends. Comprehensive H1B data and statistics for ${companyName}.`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://docujourney.com';
  const canonicalUrl = `${baseUrl}/h1b-dashboard/company/${slug}`;
  
  return {
    title,
    description,
    keywords: [
      `${companyName} H1B`,
      `${companyName} visa sponsor`,
      `${companyName} H1B salary`,
      `${companyName} green card`,
      `${companyName} visa sponsorship`,
      'H1B sponsorship data',
      'visa approval rates',
      'H1B salary data',
      'immigration statistics',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Immigrant Central',
      images: [
        {
          url: `${baseUrl}/api/og?type=company&name=${encodeURIComponent(companyName)}`,
          width: 1200,
          height: 630,
          alt: `${companyName} H1B Sponsorship Data`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?type=company&name=${encodeURIComponent(companyName)}`],
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

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <CompanyPageClient slug={slug} />;
}

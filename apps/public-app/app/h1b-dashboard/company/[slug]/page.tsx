import { CompanyDashboard } from '@/components/h1b-dashboard';
import CompanyPageClient from './CompanyPageClient';
import { generateH1BMetadata, generateStructuredData } from '@docujourney/utils';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Convert slug to readable company name (approximate)
  // e.g. "google-llc" -> "Google Llc"
  const companyName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return generateH1BMetadata({
    companyName,
  });
}

export default async function CompanyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  
  // Improve company name formatting for structured data
  const companyName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const structuredData = generateStructuredData('company', {
    name: companyName,
    // We don't have the website URL here without fetching data, 
    // but the basic Organization schema is still valuable
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CompanyPageClient />
    </>
  );
}

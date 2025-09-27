import { CompanyDashboard } from '@/components/h1b-dashboard';
import CompanyPageClient from './CompanyPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function CompanyPage({ params, searchParams }: PageProps) {
  return <CompanyPageClient />;
}

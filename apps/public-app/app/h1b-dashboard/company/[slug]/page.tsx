import { CompanyDashboard } from '@/components/h1b-dashboard';
import CompanyPageClient from './CompanyPageClient';

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <CompanyPageClient slug={slug} />;
}

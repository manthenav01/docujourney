import { JobDashboard } from '@/components/h1b-dashboard';
import { generateH1BMetadata, generateStructuredData } from '@docujourney/utils';
import JobPageClient from './JobPageClient';

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <JobPageClient slug={slug} />;
}
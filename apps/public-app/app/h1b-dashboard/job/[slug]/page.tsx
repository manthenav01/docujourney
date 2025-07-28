import JobPageClient from './JobPageClient';

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <JobPageClient slug={slug} />;
}
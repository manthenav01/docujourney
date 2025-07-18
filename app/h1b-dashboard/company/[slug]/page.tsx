import { CompanyPageClient } from './CompanyPageClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  
  return <CompanyPageClient slug={slug} />;
}

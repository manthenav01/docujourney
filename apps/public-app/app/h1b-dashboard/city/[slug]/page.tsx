import { CityDashboard } from '@/components/h1b-dashboard';
import CityPageClient from './CityPageClient';

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <CityPageClient slug={slug} />;
}
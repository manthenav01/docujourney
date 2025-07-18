import { generateH1BMetadata } from '@/lib/seo';

export const metadata = generateH1BMetadata();

export default function H1BDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
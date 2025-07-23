import { generateH1BMetadata } from '@docujourney/utils';

export const metadata = generateH1BMetadata();

export default function H1BDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
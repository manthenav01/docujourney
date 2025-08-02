import { generateH1BMetadata } from '@docujourney/utils';
import { DashboardLayout } from '@/components/h1b-dashboard';

export const metadata = generateH1BMetadata({});

export default function H1BDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
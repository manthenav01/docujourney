import { Metadata } from 'next';
import { generateMetadata } from '@docujourney/utils';

export const metadata: Metadata = generateMetadata({
  title: 'About Immigrant Central - H1B Data Analytics Platform',
  description: 'Learn about Immigrant Central\'s mission to provide transparent H1B visa data analytics. Access comprehensive immigration statistics, salary insights, and employer data to make informed decisions.',
  keywords: [
    'about immigrant central',
    'H1B data platform',
    'immigration analytics',
    'visa data transparency',
    'H1B statistics mission',
    'immigration data company',
  ],
  path: '/about',
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
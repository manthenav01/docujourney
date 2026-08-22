import { Metadata } from 'next';
import { DATA_YEAR } from '@docujourney/utils';

export const metadata: Metadata = {
  title: `H1B Salary Calculator ${DATA_YEAR} | Free Prevailing Wage Calculator`,
  description: 'Calculate H1B salary ranges and prevailing wages based on millions of real applications. Get accurate salary estimates by job title, location, and experience level for H1B visa petitions.',
  keywords: [
    'H1B salary calculator',
    'H1B prevailing wage calculator',
    `H1B minimum salary ${DATA_YEAR}`,
    'H1B wage calculator',
    'prevailing wage determination',
    'H1B salary requirements',
    'H1B wage level calculator',
    'DOL prevailing wage',
    'H1B LCA salary',
    'immigration salary calculator',
    'visa wage calculator',
    'H1B compensation calculator',
  ],
  openGraph: {
    title: `H1B Salary Calculator ${DATA_YEAR} | Free Prevailing Wage Calculator`,
    description: 'Calculate H1B salary ranges and prevailing wages based on millions of real applications. Get accurate salary estimates by job title, location, and experience level.',
    url: 'https://www.usimmigrantcentral.com/h1b-salary-calculator',
    siteName: 'Immigrant Central',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `H1B Salary Calculator ${DATA_YEAR}`,
    description: 'Calculate H1B salary ranges and prevailing wages based on millions of real applications.',
  },
  alternates: {
    canonical: 'https://www.usimmigrantcentral.com/h1b-salary-calculator',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function H1BSalaryCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
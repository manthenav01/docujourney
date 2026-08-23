import React, { Suspense } from 'react';
import '@docujourney/ui/styles/globals.css';
import { Toaster } from '@docujourney/ui';
import { BASE_METADATA, generateMetadata, DATA_YEAR } from '@docujourney/utils';
import { Metadata } from 'next';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  ...generateMetadata({
    title: `H1B Salary Database & Sponsor Companies ${DATA_YEAR} | Immigrant Central`,
    description: 'Search 3.7M+ H1B visa applications: salaries by company, job title, and city, sponsor company database, and LCA certification rates. Free analytics from official US Department of Labor data.',
    keywords: [
      // Primary high-volume keywords
      'H1B data',
      'H1B salary database',
      'H1B sponsor companies',
      'H1B visa analytics', 
      'H1B approval rates',
      `H1B minimum salary ${DATA_YEAR}`,
      'H1B prevailing wage',
      'H1B employer database',
      // Secondary keywords
      'H1B petition data',
      'immigration analytics',
      'visa sponsorship data',
      'H1B statistics',
      'H1B trends',
      'H1B calculator',
      'H1B filing data',
      // Long-tail keywords
      'companies that sponsor H1B visa',
      'H1B salary by company',
      `H1B sponsor list ${DATA_YEAR}`,
      'H1B application statistics',
      'best H1B sponsor companies',
    ],
    type: 'website',
    path: '',
  }),
  metadataBase: new URL(BASE_METADATA.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1545a2" />
        
        {/* Favicon and app icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Additional meta tags for PWA */}
        <meta name="application-name" content="Immigrant Central" />
        <meta name="apple-mobile-web-app-title" content="Immigrant Central" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Inter font for modern typography */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Immigrant Central',
              url: BASE_METADATA.url,
              description: 'Comprehensive H1B visa analytics platform with real-time immigration data insights',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${BASE_METADATA.url}/h1b-dashboard?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Immigrant Central',
              url: BASE_METADATA.url,
              logo: `${BASE_METADATA.url}/favicon.svg`,
              description: 'Free H1B visa analytics platform built on official US Department of Labor LCA disclosure data.',
              sameAs: ['https://twitter.com/immigracentral'],
            }),
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
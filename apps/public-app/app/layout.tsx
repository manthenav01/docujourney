import React from 'react';
import '@docujourney/ui/styles/globals.css';
import { Toaster } from '@docujourney/ui';
import { BASE_METADATA, generateMetadata } from '@docujourney/utils';
import { Metadata } from 'next';

export const metadata: Metadata = generateMetadata({
  title: BASE_METADATA.title,
  description: BASE_METADATA.description,
  keywords: ['immigration', 'H1B visa', 'document management', 'AI-powered', 'visa analytics'],
  type: 'website',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0891b2" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'DocuJourney',
              url: 'https://docujourney.com',
              description: 'AI-powered immigration document management and H1B visa analytics platform',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://docujourney.com/h1b-dashboard?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
import React from 'react';
import '@docujourney/ui/styles/globals.css';
import { Toaster } from '@docujourney/ui';
import { BASE_METADATA, generateMetadata } from '@docujourney/utils';
import { Metadata } from 'next';

export const metadata: Metadata = generateMetadata({
  title: 'DocuJourney - Immigration Document Management',
  description: 'Secure immigration document management and visa tracking platform',
  keywords: ['immigration', 'document management', 'visa tracking', 'secure'],
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
        
        {/* Inter font for modern typography */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
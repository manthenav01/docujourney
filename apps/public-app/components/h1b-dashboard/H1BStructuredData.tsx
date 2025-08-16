'use client';

import { useEffect } from 'react';
import { generateStructuredData } from '@docujourney/utils';

export function H1BStructuredData() {
  useEffect(() => {
    // Add structured data for H1B dashboard
    const structuredData = generateStructuredData('h1b-data');
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript && existingScript.textContent === JSON.stringify(structuredData)) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}
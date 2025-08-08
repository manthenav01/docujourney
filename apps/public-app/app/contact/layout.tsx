import { Metadata } from 'next';
import { generateMetadata, SEO_KEYWORDS } from '@docujourney/utils';

export const metadata: Metadata = generateMetadata({
  title: 'Contact Us - H1B Immigration Data Support & Expert Help',
  description: 'Get expert help with H1B visa data, immigration analytics, salary insights, and company information. Contact Immigrant Central for personalized immigration data support and guidance.',
  keywords: [
    'contact H1B experts',
    'H1B data support',
    'immigration help',
    'H1B visa questions',
    'immigration data support',
    'H1B salary guidance',
    'visa analytics help',
    'immigration consulting',
    'H1B company data help',
    'H1B approval rate questions',
    'immigration data expert',
    'H1B trending questions',
    'visa application data',
    'immigration statistics help',
    'H1B employer guidance',
    ...SEO_KEYWORDS.h1b,
    ...SEO_KEYWORDS.immigration,
  ],
  path: '/contact',
  type: 'website',
});

// Add JSON-LD structured data for the contact page
export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contactStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Immigrant Central',
    description: 'Contact page for H1B immigration data support, visa analytics help, and expert immigration guidance.',
    url: 'https://usimmigrantcentral.com/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'Immigrant Central',
      url: 'https://usimmigrantcentral.com',
      logo: 'https://usimmigrantcentral.com/favicon.svg',
      description: 'Leading H1B visa analytics platform providing comprehensive immigration data insights',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'support@usimmigrantcentral.com',
          description: 'H1B data questions, immigration analytics support, and platform assistance',
          availableLanguage: ['English'],
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00',
            timeZone: 'EST',
          },
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
      },
      sameAs: [
        'https://x.com/immigracentral',
        'https://linkedin.com/company/immigrantcentral',
      ],
    },
    potentialAction: {
      '@type': 'CommunicateAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://usimmigrantcentral.com/contact',
        inLanguage: 'en',
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
    },
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'H1B Data Contact FAQ',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How quickly do you respond to H1B data questions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We respond to all H1B data inquiries within 24 hours during business days. Our team provides expert guidance on visa analytics, salary data, and company information.',
        },
      },
      {
        '@type': 'Question', 
        name: 'What type of H1B data support do you provide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We provide comprehensive support for H1B salary analytics, company sponsorship data, approval rates, job market trends, and immigration statistics. Our experts can help with data interpretation and career guidance.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the H1B data consultation free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, our basic H1B data support and platform guidance is completely free. We believe immigration data should be accessible to everyone in the immigrant community.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you help with specific company H1B data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! We can provide detailed H1B analytics for specific companies including historical sponsorship patterns, salary ranges, job titles, approval rates, and hiring trends.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />
      {children}
    </>
  );
}
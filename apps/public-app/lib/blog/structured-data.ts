import { BlogPost, BlogAuthor } from './types';

interface ArticleStructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
      width?: number;
      height?: number;
    };
  };
  mainEntityOfPage?: {
    '@type': string;
    '@id': string;
  };
  wordCount?: number;
  keywords?: string;
  articleSection?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  speakable?: {
    '@type': string;
    cssSelector: string[];
  };
}

interface BreadcrumbStructuredData {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item?: string;
  }>;
}

interface PersonStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  url?: string;
  image?: string;
  description?: string;
  sameAs?: string[];
  jobTitle?: string;
  worksFor?: {
    '@type': string;
    name: string;
  };
}

interface WebPageStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  breadcrumb?: {
    '@type': string;
    itemListElement: Array<{
      '@type': string;
      position: number;
      name: string;
      item?: string;
    }>;
  };
}

interface FAQStructuredData {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

interface HowToStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description?: string;
  image?: string | string[];
  totalTime?: string;
  supply?: Array<{
    '@type': string;
    name: string;
  }>;
  step: Array<{
    '@type': string;
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}

export function generateArticleStructuredData(
  post: BlogPost,
  author: BlogAuthor,
  baseUrl: string,
): ArticleStructuredData {
  const articleUrl = `${baseUrl}/blog/${post.slug}`;
  
  // Calculate word count from content
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image ? [
      post.image,
      // Add multiple image sizes if available
    ] : undefined,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      '@type': 'Person',
      name: author.name,
      url: `${baseUrl}/author/${author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'US Immigrant Central',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    wordCount,
    keywords: post.tags?.join(', '),
    articleSection: post.category.name,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: [
        'h1',
        '.blog-excerpt',
        '.blog-content h2',
        '.blog-content h3',
      ],
    },
  };
}

export function generateBreadcrumbStructuredData(
  post: BlogPost,
  category: { name: string; slug: string } | undefined,
  baseUrl: string,
): BreadcrumbStructuredData {
  const items = [
    {
      '@type': 'ListItem' as const,
      position: 1,
      name: 'Home',
      item: baseUrl,
    },
    {
      '@type': 'ListItem' as const,
      position: 2,
      name: 'Blog',
      item: `${baseUrl}/blog`,
    },
  ];

  if (category) {
    items.push({
      '@type': 'ListItem' as const,
      position: 3,
      name: category.name,
      item: `${baseUrl}/blog/category/${category.slug}`,
    });
    items.push({
      '@type': 'ListItem' as const,
      position: 4,
      name: post.title,
      item: `${baseUrl}/blog/${post.slug}`,
    });
  } else {
    items.push({
      '@type': 'ListItem' as const,
      position: 3,
      name: post.title,
      item: `${baseUrl}/blog/${post.slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function generateAuthorStructuredData(
  author: BlogAuthor,
  baseUrl: string,
): PersonStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${baseUrl}/author/${author.slug}`,
    image: author.avatar,
    description: author.bio,
    sameAs: author.social ? [
      author.social.twitter && `https://twitter.com/${author.social.twitter}`,
      author.social.linkedin && `https://linkedin.com/in/${author.social.linkedin}`,
      author.social.website,
    ].filter(Boolean) as string[] : undefined,
    jobTitle: 'Content Author',
    worksFor: {
      '@type': 'Organization',
      name: 'US Immigrant Central',
    },
  };
}

export function generateBlogListingStructuredData(
  baseUrl: string,
  category?: { name: string; slug: string },
): WebPageStructuredData {
  const isCategory = !!category;
  const pageUrl = isCategory
    ? `${baseUrl}/blog/category/${category.slug}`
    : `${baseUrl}/blog`;
  const pageName = isCategory
    ? `${category.name} Articles - US Immigrant Central Blog`
    : 'US Immigrant Central Blog - Immigration Insights & H1B Updates';
  const pageDescription = isCategory
    ? `Browse articles about ${category.name} on US Immigrant Central. Expert insights on H1B visas, immigration processes, and US work authorization.`
    : 'Stay informed with the latest H1B visa updates, immigration insights, and expert guidance on US work authorization from US Immigrant Central.';

  const breadcrumbItems = [
    {
      '@type': 'ListItem' as const,
      position: 1,
      name: 'Home',
      item: baseUrl,
    },
    {
      '@type': 'ListItem' as const,
      position: 2,
      name: 'Blog',
      item: isCategory ? `${baseUrl}/blog` : undefined,
    },
  ];

  if (isCategory) {
    breadcrumbItems.push({
      '@type': 'ListItem' as const,
      position: 3,
      name: category.name,
      item: undefined,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageName,
    description: pageDescription,
    url: pageUrl,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
  };
}

export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>,
): FAQStructuredData | null {
  if (!faqs || faqs.length === 0) {return null;}

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateHowToStructuredData(
  title: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>,
  totalTime?: string,
  supplies?: string[],
): HowToStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    totalTime,
    supply: supplies?.map(supply => ({
      '@type': 'HowToSupply',
      name: supply,
    })),
    step: steps.map(step => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

export function renderStructuredData(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}

export function combineStructuredData(...dataObjects: any[]): string {
  const validData = dataObjects.filter(Boolean);
  if (validData.length === 0) {return '';}
  
  if (validData.length === 1) {
    return renderStructuredData(validData[0]);
  }
  
  // Combine multiple structured data objects using @graph
  const combined = {
    '@context': 'https://schema.org',
    '@graph': validData,
  };
  
  return renderStructuredData(combined);
}
import { BlogPost, BlogCategory, BlogAuthor } from './types';
import { Metadata } from 'next';

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  const text = content.replace(/[#*`]/g, '').trim();
  if (text.length <= maxLength) {return text;}

  const excerpt = text.substring(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(' ');

  return lastSpace > 0
    ? excerpt.substring(0, lastSpace) + '...'
    : excerpt + '...';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateBlogPostMetadata(post: BlogPost): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.usimmigrantcentral.com';
  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | Immigrant Central Blog`,
    description: post.description,
    keywords: [...post.tags, post.category.name, 'H1B', 'visa', 'immigration'],
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'Immigrant Central',
      images: post.image ? [{
        url: post.image,
        width: 1200,
        height: 630,
        alt: post.title,
      }] : [],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
    alternates: {
      canonical: url,
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
}

export function getBlogCategories(): BlogCategory[] {
  return [
    {
      name: 'H1B Visa',
      slug: 'h1b-visa',
      description: 'Comprehensive guides and updates on H1B visa process',
      color: 'bg-blue-100 text-blue-800',
      icon: 'FileText',
    },
    {
      name: 'Immigration Law',
      slug: 'immigration-law',
      description: 'Legal updates and compliance information',
      color: 'bg-green-100 text-green-800',
      icon: 'Scale',
    },
    {
      name: 'Career Advice',
      slug: 'career-advice',
      description: 'Career development and job market insights',
      color: 'bg-purple-100 text-purple-800',
      icon: 'Briefcase',
    },
    {
      name: 'Salary & Negotiation',
      slug: 'salary-negotiation',
      description: 'Salary trends and negotiation strategies',
      color: 'bg-orange-100 text-orange-800',
      icon: 'DollarSign',
    },
    {
      name: 'Company Insights',
      slug: 'company-insights',
      description: 'Analysis of top H1B sponsoring companies',
      color: 'bg-red-100 text-red-800',
      icon: 'Building',
    },
  ];
}

export function getBlogAuthors(): BlogAuthor[] {
  return [
    {
      name: 'John Smith',
      slug: 'john-smith',
      bio: 'H1B visa expert with 10+ years in immigration law and corporate sponsorship programs.',
      avatar: '/authors/john-smith.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/johnsmith',
        twitter: '@johnsmith_h1b',
      },
    },
    {
      name: 'Sarah Johnson',
      slug: 'sarah-johnson',
      bio: 'Data analyst specializing in H1B trends and immigration analytics.',
      avatar: '/authors/sarah-johnson.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        twitter: '@sarahj_h1b',
      },
    },
    {
      name: 'Michael Chen',
      slug: 'michael-chen',
      bio: 'Former H1B applicant turned immigration consultant helping professionals navigate the visa process.',
      avatar: '/authors/michael-chen.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/michaelchen',
        website: 'https://michaelchenconsulting.com',
      },
    },
  ];
}

export function validateBlogPost(post: Partial<BlogPost>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!post.title || post.title.trim().length < 10) {
    errors.push('Title must be at least 10 characters long');
  }

  if (!post.description || post.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters long');
  }

  if (!post.content || post.content.trim().length < 100) {
    errors.push('Content must be at least 100 characters long');
  }

  if (!post.slug || !/^[a-z0-9-]+$/.test(post.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!post.category || typeof post.category !== 'object') {
    errors.push('Valid category is required');
  }

  if (!post.date || isNaN(Date.parse(post.date))) {
    errors.push('Valid date is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Badge, Button } from '@docujourney/ui';
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  ChevronRight,
  Home,
} from 'lucide-react';
import { BlogPost as BlogPostType } from '@/lib/blog/types';
import { formatDate } from '@/lib/blog/utils';
import { TableOfContents } from './TableOfContents';

interface BlogPostProps {
  post: BlogPostType;
  relatedPosts?: BlogPostType[];
  nextPost?: BlogPostType;
  prevPost?: BlogPostType;
}

export function BlogPost({ post, relatedPosts = [], nextPost, prevPost }: BlogPostProps) {
  const router = useRouter();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post.title;

  // Handle internal link navigation
  useEffect(() => {
    const handleInternalLinks = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const anchor = target as HTMLAnchorElement;
        const href = anchor.getAttribute('href');
        
        // Check if it's an internal link (starts with /)
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          e.preventDefault();
          router.push(href);
        }
      }
    };

    const blogContent = document.querySelector('.blog-content');
    if (blogContent) {
      blogContent.addEventListener('click', handleInternalLinks);
      return () => {
        blogContent.removeEventListener('click', handleInternalLinks);
      };
    }
  }, [router]);

  const handleShare = (platform: string) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // You could add a toast notification here
  };

  // Generate breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': typeof window !== 'undefined' ? window.location.origin : '',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': typeof window !== 'undefined' ? `${window.location.origin}/blog` : '',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.category.name,
        'item': typeof window !== 'undefined' ? `${window.location.origin}/blog/category/${post.category.slug}` : '',
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': post.title,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 md:p-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-sm text-gray-500 mb-8 overflow-hidden" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700 transition-colors flex items-center flex-shrink-0">
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <Link href="/blog" className="hover:text-gray-700 transition-colors flex-shrink-0">
            Blog
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <Link href={`/blog/category/${post.category.slug}`} className="hover:text-gray-700 transition-colors flex-shrink-0">
            {post.category.name}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 font-medium truncate" title={post.title}>
            {post.title}
          </span>
        </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
            {post.category.name}
          </Badge>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{post.readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(post.date)}</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl">
          {post.description}
        </p>

        {/* Featured Image */}
        {post.image && (
          <div className="relative w-full h-80 md:h-[500px] mb-12 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </header>

      {/* Table of Contents */}
      <TableOfContents content={post.content} />

      {/* Content */}
      <div
        className="blog-content max-w-none mb-12 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:leading-tight [&>h1]:mt-12 [&>h1]:mb-8 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:leading-tight [&>h2]:mt-10 [&>h2]:mb-6 [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:leading-tight [&>h3]:mt-8 [&>h3]:mb-4 [&>h4]:text-xl [&>h4]:font-semibold [&>h4]:text-gray-900 [&>h4]:leading-tight [&>h4]:mt-6 [&>h4]:mb-3 [&>p]:text-lg [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-6 [&>ul]:mb-6 [&>ul>li]:text-lg [&>ul>li]:text-gray-700 [&>ul>li]:leading-relaxed [&>ul>li]:mb-3 [&>ul>li]:ml-4 [&>ol]:mb-6 [&>ol>li]:text-lg [&>ol>li]:text-gray-700 [&>ol>li]:leading-relaxed [&>ol>li]:mb-3 [&>ol>li]:ml-4 [&>ul>li]:list-disc [&>ol>li]:list-decimal [&>strong]:font-semibold [&>strong]:text-gray-900 [&>em]:italic [&>em]:text-gray-700 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:bg-blue-50 [&>blockquote]:my-6 [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-6 [&>hr]:border-gray-300 [&>hr]:my-8 [&>table]:border-collapse [&>table]:border [&>table]:border-gray-300 [&>table]:my-6 [&>table>thead>tr>th]:bg-gray-100 [&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-gray-300 [&>table>thead>tr>th]:px-4 [&>table>thead>tr>th]:py-2 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-semibold [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-gray-300 [&>table>tbody>tr>td]:px-4 [&>table>tbody>tr>td]:py-2"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <style jsx global>{`
        .blog-content a {
          color: #2563eb !important;
          text-decoration: underline !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: color 0.2s ease !important;
        }
        
        .blog-content a:hover {
          color: #1d4ed8 !important;
        }
        
        .blog-content ol li a,
        .blog-content ul li a {
          color: #2563eb !important;
          text-decoration: underline !important;
          font-weight: 500 !important;
        }
        
        .blog-content ol li a:hover,
        .blog-content ul li a:hover {
          color: #1d4ed8 !important;
        }
      `}</style>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="border-t border-gray-200 pt-8 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Share Section */}
      <Card className="mb-12 border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline">Twitter</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              >
                <Facebook className="w-4 h-4" />
                <span className="hidden sm:inline">Facebook</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      {(nextPost || prevPost) && (
        <div className="flex justify-between items-center mb-12">
          {prevPost && (
            <Link href={`/blog/${prevPost.slug}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Previous: {prevPost.title}
              </Button>
            </Link>
          )}
          <div className="flex-1" />
          {nextPost && (
            <Link href={`/blog/${nextPost.slug}`}>
              <Button variant="outline" className="flex items-center gap-2">
                Next: {nextPost.title}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.slug} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(relatedPost.date)}</span>
                    <span>{relatedPost.readingTime} min read</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      </article>
    </>
  );
}